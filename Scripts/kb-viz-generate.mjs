#!/usr/bin/env node
/**
 * KB Visualization Pipeline
 *
 * Reads kb-manifest.json + _KB_CROSS_LINKS.md -> outputs kb-graph.json + KB_MAP.md
 *
 * Modular: each stage is a pure function. Add output formats by adding exporters.
 *
 * Usage:
 *   node Scripts/kb-viz-generate.mjs                    # all outputs
 *   node Scripts/kb-viz-generate.mjs --json              # just kb-graph.json
 *   node Scripts/kb-viz-generate.mjs --mermaid           # just KB_MAP.md
 *   node Scripts/kb-viz-generate.mjs --focus "VFX"       # subgraph around VFX
 *   node Scripts/kb-viz-generate.mjs --health            # health report
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const KB_DIR = join(ROOT, 'KnowledgeBase');

// ============================================================
// STAGE 1: Extract — Read manifest + cross-links into raw data
// ============================================================

function extractFromManifest() {
    const manifestPath = join(KB_DIR, 'kb-manifest.json');
    if (!existsSync(manifestPath)) {
        console.error('kb-manifest.json not found. Run kb-audit first.');
        process.exit(1);
    }
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return manifest.files.map(f => ({
        id: f.file.replace(/\.md$/, '').toLowerCase(),
        name: f.title || f.file.replace(/\.md$/, '').replace(/_/g, ' ').trim(),
        file: f.file,
        tags: f.tags || [],
        sections: f.sections || [],
        size_kb: f.size_kb || 0,
        modified: f.modified || 'unknown',
    }));
}

function extractCrossLinks() {
    const crossLinksPath = join(KB_DIR, '_KB_CROSS_LINKS.md');
    if (!existsSync(crossLinksPath)) return [];

    const content = readFileSync(crossLinksPath, 'utf-8');
    const relations = [];
    // Parse table rows: | `source.md` | `target1.md`, `target2.md` |
    const tableRowRe = /\|\s*`([^`]+)`\s*\|\s*([^|]+)\|/g;
    let match;
    while ((match = tableRowRe.exec(content)) !== null) {
        const source = match[1].replace(/\.md$/, '').toLowerCase();
        const targets = match[2].match(/`([^`]+)`/g);
        if (targets) {
            targets.forEach(t => {
                const target = t.replace(/`/g, '').replace(/\.md$/, '').toLowerCase();
                relations.push({ from: source, to: target, relationType: 'related_to' });
            });
        }
    }
    return relations;
}

function extractInlineRefs(entities) {
    // Scan actual file content for references to other KB files
    const fileNames = new Set(entities.map(e => e.file));
    const relations = [];

    for (const entity of entities) {
        const filePath = join(KB_DIR, entity.file);
        if (!existsSync(filePath)) continue;

        let content;
        try { content = readFileSync(filePath, 'utf-8'); } catch { continue; }

        // Find backtick-wrapped file references
        const refs = content.match(/`(_[A-Z][A-Z0-9_]+\.md)`/g);
        if (!refs) continue;

        const seen = new Set();
        refs.forEach(ref => {
            const target = ref.replace(/`/g, '');
            if (fileNames.has(target) && target !== entity.file && !seen.has(target)) {
                seen.add(target);
                relations.push({
                    from: entity.id,
                    to: target.replace(/\.md$/, '').toLowerCase(),
                    relationType: 'references',
                });
            }
        });
    }
    return relations;
}

// ============================================================
// STAGE 2: Classify — Assign categories based on tags + naming
// ============================================================

const CATEGORY_RULES = [
    { match: f => f.tags.some(t => ['vfx', 'particles', 'shader'].includes(t)) || f.file.includes('VFX'), category: 'VFX Graph' },
    { match: f => f.tags.some(t => ['ar', 'xr', 'arfoundation'].includes(t)) || f.file.includes('AR'), category: 'XR/AR' },
    { match: f => f.tags.some(t => ['hologram', 'h3m', 'rcam'].includes(t)) || f.file.includes('HOLOGRAM'), category: 'Hologram' },
    { match: f => f.tags.some(t => ['unity', 'uaal', 'urp'].includes(t)) || f.file.includes('UNITY'), category: 'Unity' },
    { match: f => f.tags.some(t => ['web', 'webgl', 'webgpu', 'threejs'].includes(t)) || f.file.includes('WEB'), category: 'Web' },
    { match: f => f.tags.some(t => ['mcp', 'coplay'].includes(t)) || f.file.includes('MCP'), category: 'MCP' },
    { match: f => f.tags.some(t => ['ai', 'claude', 'gemini', 'agent'].includes(t)) || f.file.includes('AI') || f.file.includes('CLAUDE') || f.file.includes('GEMINI'), category: 'AI Tools' },
    { match: f => f.tags.some(t => ['ml', 'sentis', 'opencv'].includes(t)) || f.file.includes('ML'), category: 'ML' },
    { match: f => f.tags.some(t => ['viz', 'echarts', 'visualization', '3d'].includes(t)) || f.file.includes('VIS') || f.file.includes('ECHARTS'), category: 'Visualization' },
    { match: f => f.tags.some(t => ['portals', 'bridge', 'xrai'].includes(t)) || f.file.includes('PORTALS'), category: 'Portals' },
    { match: f => f.file.includes('GITHUB') || f.file.includes('REPO'), category: 'GitHub' },
    { match: f => f.file.includes('FIX') || f.file.includes('TROUBLESHOOT') || f.file.includes('QUICK'), category: 'Operations' },
];

function classify(entity) {
    for (const rule of CATEGORY_RULES) {
        if (rule.match(entity)) return rule.category;
    }
    return 'General';
}

// ============================================================
// STAGE 3: Build Graph — Combine entities + relations + categories
// ============================================================

function buildGraph(opts = {}) {
    const entities = extractFromManifest();
    const crossLinks = extractCrossLinks();
    const inlineRefs = extractInlineRefs(entities);

    // Classify each entity
    entities.forEach(e => { e.category = classify(e); });

    // Deduplicate relations
    const relSet = new Set();
    const relations = [];
    [...crossLinks, ...inlineRefs].forEach(r => {
        const key = `${r.from}|${r.to}`;
        const reverseKey = `${r.to}|${r.from}`;
        if (!relSet.has(key) && !relSet.has(reverseKey)) {
            // Only keep if both endpoints exist
            if (entities.some(e => e.id === r.from) && entities.some(e => e.id === r.to)) {
                relSet.add(key);
                relations.push(r);
            }
        }
    });

    // Focus filter
    if (opts.focus) {
        const focusLower = opts.focus.toLowerCase();
        const focusIds = new Set();

        // Find matching entities
        entities.forEach(e => {
            if (e.name.toLowerCase().includes(focusLower) ||
                e.category.toLowerCase().includes(focusLower) ||
                e.tags.some(t => t.includes(focusLower))) {
                focusIds.add(e.id);
            }
        });

        // Add neighbors up to depth
        const depth = opts.depth || 1;
        for (let d = 0; d < depth; d++) {
            const newIds = new Set();
            relations.forEach(r => {
                if (focusIds.has(r.from)) newIds.add(r.to);
                if (focusIds.has(r.to)) newIds.add(r.from);
            });
            newIds.forEach(id => focusIds.add(id));
        }

        const filteredEntities = entities.filter(e => focusIds.has(e.id));
        const filteredRelations = relations.filter(r => focusIds.has(r.from) && focusIds.has(r.to));
        return { entities: filteredEntities, relations: filteredRelations };
    }

    return { entities, relations };
}

// ============================================================
// STAGE 4: Export — Multiple output formats
// ============================================================

function toJSON(graph) {
    const categories = {};
    graph.entities.forEach(e => {
        categories[e.category] = (categories[e.category] || 0) + 1;
    });
    return JSON.stringify({
        version: '1.0',
        generated: new Date().toISOString(),
        stats: {
            entities: graph.entities.length,
            relations: graph.relations.length,
            categories,
        },
        entities: graph.entities,
        relations: graph.relations,
    }, null, 2);
}

function toMermaid(graph, opts = {}) {
    const maxNodes = opts.maxNodes || 80;
    const direction = opts.direction || 'LR';

    let entities = graph.entities;
    let relations = graph.relations;

    if (entities.length > maxNodes) {
        // Group by category, keep top N by size per category
        const byCategory = {};
        entities.forEach(e => {
            if (!byCategory[e.category]) byCategory[e.category] = [];
            byCategory[e.category].push(e);
        });

        const perCategory = Math.max(2, Math.floor(
            (maxNodes - Object.keys(byCategory).length) / Object.keys(byCategory).length
        ));
        const kept = new Set();

        Object.entries(byCategory).forEach(([, files]) => {
            files.sort((a, b) => b.size_kb - a.size_kb)
                .slice(0, perCategory)
                .forEach(f => { kept.add(f.id); });
        });

        entities = entities.filter(e => kept.has(e.id));
        const keptIds = new Set(entities.map(e => e.id));
        relations = relations.filter(r => keptIds.has(r.from) && keptIds.has(r.to));
    }

    // Build Mermaid
    const lines = [`flowchart ${direction}`, ''];

    // Group by category into subgraphs
    const byCategory = {};
    entities.forEach(e => {
        if (!byCategory[e.category]) byCategory[e.category] = [];
        byCategory[e.category].push(e);
    });

    Object.entries(byCategory).forEach(([cat, files]) => {
        const safeId = cat.replace(/[^a-zA-Z0-9]/g, '');
        lines.push(`    subgraph ${safeId}["${cat} (${files.length} files)"]`);
        files.forEach(f => {
            const nodeId = f.id.replace(/[^a-zA-Z0-9]/g, '_');
            const label = f.name.length > 40 ? f.name.slice(0, 37) + '...' : f.name;
            lines.push(`        ${nodeId}["${label}"]`);
        });
        lines.push('    end');
        lines.push('');
    });

    // Add cross-category edges only (skip intra-category for clarity)
    const entityMap = {};
    entities.forEach(e => { entityMap[e.id] = e; });

    relations.forEach(r => {
        const from = entityMap[r.from];
        const to = entityMap[r.to];
        if (!from || !to) return;
        if (from.category === to.category) return; // skip intra-category
        const fromId = r.from.replace(/[^a-zA-Z0-9]/g, '_');
        const toId = r.to.replace(/[^a-zA-Z0-9]/g, '_');
        const arrow = r.relationType === 'references' ? '-->' : '-..->';
        lines.push(`    ${fromId} ${arrow} ${toId}`);
    });

    return lines.join('\n');
}

function toHealthReport(graph) {
    const lines = ['# KB Health Report', '', `Generated: ${new Date().toISOString().split('T')[0]}`, ''];

    // Orphaned nodes (no relations)
    const connected = new Set();
    graph.relations.forEach(r => { connected.add(r.from); connected.add(r.to); });
    const orphans = graph.entities.filter(e => !connected.has(e.id));

    lines.push(`## Orphaned Files (${orphans.length})`);
    if (orphans.length === 0) {
        lines.push('None -- all files are connected.');
    } else {
        orphans.forEach(e => lines.push(`- ${e.file} (${e.category}, ${e.size_kb}KB)`));
    }
    lines.push('');

    // Stale files (not modified in >30 days)
    const now = new Date();
    const stale = graph.entities.filter(e => {
        if (e.modified === 'unknown') return false;
        const mod = new Date(e.modified);
        return (now - mod) > 30 * 24 * 60 * 60 * 1000;
    });
    lines.push(`## Stale Files (${stale.length}, >30 days old)`);
    stale.sort((a, b) => new Date(a.modified) - new Date(b.modified))
        .slice(0, 20)
        .forEach(e => lines.push(`- ${e.file} (last modified: ${e.modified})`));
    if (stale.length > 20) lines.push(`- ... and ${stale.length - 20} more`);
    lines.push('');

    // Hub nodes (most connections)
    const connectionCount = {};
    graph.relations.forEach(r => {
        connectionCount[r.from] = (connectionCount[r.from] || 0) + 1;
        connectionCount[r.to] = (connectionCount[r.to] || 0) + 1;
    });
    const hubs = Object.entries(connectionCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
    lines.push('## Hub Files (most connections)');
    hubs.forEach(([id, count]) => {
        const entity = graph.entities.find(e => e.id === id);
        lines.push(`- ${entity?.file || id}: ${count} connections`);
    });
    lines.push('');

    // Category distribution
    const catCount = {};
    graph.entities.forEach(e => { catCount[e.category] = (catCount[e.category] || 0) + 1; });
    lines.push('## Category Distribution');
    lines.push('| Category | Files |');
    lines.push('|----------|-------|');
    Object.entries(catCount).sort(([, a], [, b]) => b - a)
        .forEach(([cat, count]) => lines.push(`| ${cat} | ${count} |`));

    return lines.join('\n');
}

// ============================================================
// MAIN
// ============================================================

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')).map(a => a.replace('--', '')));
const focusIdx = args.indexOf('--focus');
const focusArg = focusIdx >= 0 ? args[focusIdx + 1] : null;
const depthIdx = args.indexOf('--depth');
const depthArg = depthIdx >= 0 ? args[depthIdx + 1] : null;

const opts = {
    focus: focusArg || null,
    depth: depthArg ? parseInt(depthArg) : 1,
};

console.log('KB Viz Pipeline: extracting...');
const graph = buildGraph(opts);
console.log(`  ${graph.entities.length} entities, ${graph.relations.length} relations`);

const doAll = flags.size === 0 || flags.has('all');
const outputDir = KB_DIR;

if (doAll || flags.has('json')) {
    const jsonPath = join(outputDir, 'kb-graph.json');
    writeFileSync(jsonPath, toJSON(graph), 'utf-8');
    console.log(`  -> ${jsonPath}`);
}

if (doAll || flags.has('mermaid')) {
    const mermaidContent = toMermaid(graph);
    const mdPath = join(outputDir, 'KB_MAP.md');
    const md = [
        '# KB Map',
        '',
        '> Auto-generated by kb-viz-generate.mjs',
        `> ${new Date().toISOString().split('T')[0]} | ${graph.entities.length} files | ${graph.relations.length} connections`,
        '',
        '```mermaid',
        mermaidContent,
        '```',
        '',
    ].join('\n');
    writeFileSync(mdPath, md, 'utf-8');
    console.log(`  -> ${mdPath}`);
}

if (doAll || flags.has('health')) {
    const healthPath = join(outputDir, 'KB_HEALTH.md');
    writeFileSync(healthPath, toHealthReport(graph), 'utf-8');
    console.log(`  -> ${healthPath}`);
}

if (opts.focus) {
    console.log(`  (focused on "${opts.focus}", depth ${opts.depth})`);
}

console.log('Done.');

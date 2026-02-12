#!/usr/bin/env node
/**
 * generate-kb-manifest.js
 * Scans all KB .md files and produces kb-manifest.json
 *
 * Usage: node scripts/generate-kb-manifest.js
 * Output: KnowledgeBase/kb-manifest.json
 */

const fs = require('fs');
const path = require('path');

const KB_DIR = path.resolve(__dirname, '..');
const OUTPUT = path.join(KB_DIR, 'kb-manifest.json');

// Directories/files to skip
const SKIP = new Set(['scripts', 'AgentSystems', 'CodeSnippets', 'KnowledgeBase', 'launchagents', '_archive', 'node_modules']);
const SKIP_FILES = new Set(['kb-manifest.json']);

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

function extractExistingTags(content) {
  // Match **Tags**: `tag1` `tag2` or **Tags**: tag1, tag2
  const match = content.match(/\*\*Tags?\*\*\s*:\s*(.+)/i);
  if (!match) return [];
  const line = match[1];
  // Extract backtick-wrapped or #-prefixed or comma-separated
  const tags = [];
  const btMatches = line.matchAll(/`([^`]+)`/g);
  for (const m of btMatches) tags.push(m[1].replace(/^#/, '').trim().toLowerCase());
  if (tags.length === 0) {
    // Comma or space separated
    line.split(/[,\s]+/).forEach(t => {
      t = t.replace(/^#/, '').trim().toLowerCase();
      if (t.length > 1 && t.length < 30) tags.push(t);
    });
  }
  return [...new Set(tags)];
}

function tagsFromFilename(filename) {
  // _PORTALS_V4_ARCHITECTURE.md → ["portals", "v4", "architecture"]
  return filename
    .replace(/^_/, '')
    .replace(/\.md$/, '')
    .split(/[_\-]+/)
    .map(t => t.toLowerCase())
    .filter(t => t.length > 1 && !['md', 'the', 'and', 'for', 'with'].includes(t));
}

function extractSummary(content) {
  // Skip title line, find first substantive paragraph or table
  const lines = content.split('\n');
  const chunks = [];
  let started = false;
  for (const line of lines) {
    if (!started) {
      // Skip title, blank lines, metadata lines
      if (line.startsWith('# ') || line.trim() === '' || line.match(/^\*\*[A-Z]/) || line.startsWith('---') || line.startsWith('> ') || line.startsWith('|') || line.startsWith('```')) continue;
      started = true;
    }
    if (started) {
      if (line.startsWith('---') && chunks.length > 20) break;
      chunks.push(line.trim());
      if (chunks.length >= 5) break;
    }
  }
  let summary = chunks.join(' ').replace(/\s+/g, ' ').trim();
  // Truncate to ~200 chars
  if (summary.length > 200) summary = summary.substring(0, 197) + '...';
  return summary || '(no summary)';
}

function extractKeyTopics(content) {
  // Pull topics from H2 headings
  const headings = [];
  const matches = content.matchAll(/^##\s+(.+)/gm);
  for (const m of matches) {
    const h = m[1].replace(/[*`#]/g, '').trim().toLowerCase();
    if (h.length > 2 && h.length < 60) headings.push(h);
  }
  return headings.slice(0, 8);
}

function scanKB() {
  const entries = fs.readdirSync(KB_DIR, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (SKIP.has(entry.name) || SKIP_FILES.has(entry.name)) continue;
    if (entry.isDirectory()) continue;
    if (!entry.name.endsWith('.md') && !entry.name.endsWith('.txt')) continue;

    const filepath = path.join(KB_DIR, entry.name);
    const stat = fs.statSync(filepath);
    const content = fs.readFileSync(filepath, 'utf8');

    const existingTags = extractExistingTags(content);
    const filenameTags = tagsFromFilename(entry.name);
    const allTags = [...new Set([...existingTags, ...filenameTags])];

    files.push({
      file: entry.name,
      title: extractTitle(content) || entry.name.replace(/^_/, '').replace(/\.md$/, '').replace(/_/g, ' '),
      tags: allTags,
      summary: extractSummary(content),
      sections: extractKeyTopics(content),
      size_kb: Math.round(stat.size / 1024),
      modified: stat.mtime.toISOString().split('T')[0]
    });
  }

  // Sort: larger/more-referenced files first
  files.sort((a, b) => b.size_kb - a.size_kb);

  return files;
}

// Also scan subdirectories (AgentSystems, CodeSnippets) shallowly
function scanSubdirs() {
  const subdirs = ['AgentSystems', 'CodeSnippets'];
  const files = [];
  for (const sub of subdirs) {
    const dir = path.join(KB_DIR, sub);
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || (!entry.name.endsWith('.md') && !entry.name.endsWith('.txt'))) continue;
      const filepath = path.join(dir, entry.name);
      const stat = fs.statSync(filepath);
      const content = fs.readFileSync(filepath, 'utf8');
      const existingTags = extractExistingTags(content);
      const filenameTags = tagsFromFilename(entry.name);
      files.push({
        file: `${sub}/${entry.name}`,
        title: extractTitle(content) || entry.name.replace(/\.md$/, '').replace(/_/g, ' '),
        tags: [...new Set([...existingTags, ...filenameTags, sub.toLowerCase()])],
        summary: extractSummary(content),
        sections: extractKeyTopics(content),
        size_kb: Math.round(stat.size / 1024),
        modified: stat.mtime.toISOString().split('T')[0]
      });
    }
  }
  return files;
}

function main() {
  console.log('Scanning KnowledgeBase...');
  const rootFiles = scanKB();
  const subFiles = scanSubdirs();
  const allFiles = [...rootFiles, ...subFiles];

  const manifest = {
    version: '1.0',
    generated: new Date().toISOString().split('T')[0],
    total_files: allFiles.length,
    total_size_kb: allFiles.reduce((sum, f) => sum + f.size_kb, 0),
    files: allFiles
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
  console.log(`Generated ${OUTPUT}`);
  console.log(`  ${allFiles.length} files, ${manifest.total_size_kb} KB total`);
}

main();

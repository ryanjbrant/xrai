#!/usr/bin/env node
/**
 * Unity-XR-AI Knowledge Base Diagram Generator
 * Uses xrai-kg MermaidExporter to visualize KB structure & relationships
 *
 * Usage: node scripts/generate-kb-diagrams.mjs
 * Output: KnowledgeBase/KB_ARCHITECTURE_DIAGRAMS.md
 */

import { KnowledgeGraph } from '../Vis/xrai-kg/src/data/KnowledgeGraph.js';
import { MermaidExporter } from '../Vis/xrai-kg/src/viz/MermaidExporter.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '..', 'KnowledgeBase', 'KB_ARCHITECTURE_DIAGRAMS.md');

// ============================================================
// 1. KB DOMAIN MAP — What knowledge lives where
// ============================================================
function buildDomainGraph() {
    const kg = new KnowledgeGraph();

    // -- Top-level domains --
    kg.addEntity({ name: 'Unity-XR-AI KB', entityType: 'Root', observations: ['250+ files', '~4MB', '13 knowledge domains'] });

    // -- Knowledge Domains --
    kg.addEntity({ name: 'AI Tools', entityType: 'Domain', observations: ['Claude Code, Gemini CLI, agents, skills', '15+ files'] });
    kg.addEntity({ name: 'Unity Core', entityType: 'Domain', observations: ['MCP, debugging, UAAL, ML', '28+ files'] });
    kg.addEntity({ name: 'VFX Graph', entityType: 'Domain', observations: ['Patterns, bindings, AR VFX', '19 files'] });
    kg.addEntity({ name: 'XR/AR', entityType: 'Domain', observations: ['AR Foundation, hand tracking, spatial', '10+ files'] });
    kg.addEntity({ name: 'Hologram', entityType: 'Domain', observations: ['H3M, RCAM, recording, playback', '10 files'] });
    kg.addEntity({ name: 'Web Tech', entityType: 'Domain', observations: ['WebGL, WebGPU, Three.js, WebXR', '15 files'] });
    kg.addEntity({ name: 'MCP Protocol', entityType: 'Domain', observations: ['Server/client, SDK, CoPlay', '9 files'] });
    kg.addEntity({ name: 'ML Research', entityType: 'Domain', observations: ['Sentis, ONNX, OpenCV, style transfer', '12+ files'] });
    kg.addEntity({ name: 'Portals Project', entityType: 'Domain', observations: ['V4 architecture, roadmap, vision', '15+ files'] });
    kg.addEntity({ name: 'GitHub Index', entityType: 'Domain', observations: ['520+ repos, trending, key people', '3 major files'] });
    kg.addEntity({ name: 'Operations', entityType: 'Domain', observations: ['Quick fixes, auto-fixes, health', '12 files'] });
    kg.addEntity({ name: 'Tool Integration', entityType: 'Domain', observations: ['Cross-tool, token efficiency, IDE', '15+ files'] });
    kg.addEntity({ name: 'Visualization', entityType: 'Domain', observations: ['ECharts, 3D viz, dashboards', '10+ files'] });

    // Root -> domains
    const domains = ['AI Tools', 'Unity Core', 'VFX Graph', 'XR/AR', 'Hologram', 'Web Tech',
                     'MCP Protocol', 'ML Research', 'Portals Project', 'GitHub Index',
                     'Operations', 'Tool Integration', 'Visualization'];
    domains.forEach(d => kg.addRelation({ from: 'Unity-XR-AI KB', to: d, relationType: 'contains' }));

    // -- Key files per domain --
    // AI Tools
    kg.addEntity({ name: '_CLAUDE_CODE_MASTER', entityType: 'File', observations: ['Features, workflows, commands'] });
    kg.addEntity({ name: '_CLAUDE_CODE_BEST_PRACTICES', entityType: 'File', observations: ['Official patterns 2026'] });
    kg.addEntity({ name: '_ACE_CONTEXT_ENGINEERING', entityType: 'File', observations: ['Advanced context engineering'] });
    kg.addEntity({ name: '_GEMINI_CLI_BEST_PRACTICES', entityType: 'File', observations: ['Gemini patterns'] });
    kg.addRelation({ from: 'AI Tools', to: '_CLAUDE_CODE_MASTER', relationType: 'contains' });
    kg.addRelation({ from: 'AI Tools', to: '_CLAUDE_CODE_BEST_PRACTICES', relationType: 'contains' });
    kg.addRelation({ from: 'AI Tools', to: '_ACE_CONTEXT_ENGINEERING', relationType: 'contains' });
    kg.addRelation({ from: 'AI Tools', to: '_GEMINI_CLI_BEST_PRACTICES', relationType: 'contains' });

    // Unity Core
    kg.addEntity({ name: '_UNITY_MCP_MASTER', entityType: 'File', observations: ['MCP tools + dev hooks'] });
    kg.addEntity({ name: '_UNITY_DEBUGGING_MASTER', entityType: 'File', observations: ['Console, errors, analysis'] });
    kg.addEntity({ name: '_UNITY_UAAL_MASTER', entityType: 'File', observations: ['Unity as a Library'] });
    kg.addEntity({ name: '_UNITY_RENDERING_MASTER', entityType: 'File', observations: ['URP, post-processing, HLSL'] });
    kg.addRelation({ from: 'Unity Core', to: '_UNITY_MCP_MASTER', relationType: 'contains' });
    kg.addRelation({ from: 'Unity Core', to: '_UNITY_DEBUGGING_MASTER', relationType: 'contains' });
    kg.addRelation({ from: 'Unity Core', to: '_UNITY_UAAL_MASTER', relationType: 'contains' });
    kg.addRelation({ from: 'Unity Core', to: '_UNITY_RENDERING_MASTER', relationType: 'contains' });

    // VFX Graph
    kg.addEntity({ name: '_VFX_MASTER_PATTERNS', entityType: 'File', observations: ['107KB comprehensive VFX'] });
    kg.addEntity({ name: '_VFX_BINDINGS_MASTER', entityType: 'File', observations: ['93KB property bindings'] });
    kg.addEntity({ name: '_VFX_AR_MASTER', entityType: 'File', observations: ['102KB AR + VFX integration'] });
    kg.addRelation({ from: 'VFX Graph', to: '_VFX_MASTER_PATTERNS', relationType: 'contains' });
    kg.addRelation({ from: 'VFX Graph', to: '_VFX_BINDINGS_MASTER', relationType: 'contains' });
    kg.addRelation({ from: 'VFX Graph', to: '_VFX_AR_MASTER', relationType: 'contains' });

    // Cross-domain relationships
    kg.addRelation({ from: 'VFX Graph', to: 'XR/AR', relationType: 'uses' });
    kg.addRelation({ from: 'Hologram', to: 'VFX Graph', relationType: 'uses' });
    kg.addRelation({ from: 'Hologram', to: 'XR/AR', relationType: 'uses' });
    kg.addRelation({ from: 'Unity Core', to: 'MCP Protocol', relationType: 'uses' });
    kg.addRelation({ from: 'Portals Project', to: 'Unity Core', relationType: 'depends_on' });
    kg.addRelation({ from: 'Portals Project', to: 'VFX Graph', relationType: 'depends_on' });
    kg.addRelation({ from: 'Portals Project', to: 'XR/AR', relationType: 'depends_on' });
    kg.addRelation({ from: 'AI Tools', to: 'MCP Protocol', relationType: 'uses' });
    kg.addRelation({ from: 'Visualization', to: 'Web Tech', relationType: 'uses' });
    kg.addRelation({ from: 'ML Research', to: 'Unity Core', relationType: 'uses' });
    kg.addRelation({ from: 'Web Tech', to: 'XR/AR', relationType: 'uses' });
    kg.addRelation({ from: 'Tool Integration', to: 'AI Tools', relationType: 'uses' });
    kg.addRelation({ from: 'Operations', to: 'AI Tools', relationType: 'uses' });

    return kg;
}

// ============================================================
// 2. TOOLING ECOSYSTEM — CLI tools, automation, visualization
// ============================================================
function buildToolingGraph() {
    const kg = new KnowledgeGraph();

    // -- Tools --
    kg.addEntity({ name: 'kb-cli', entityType: 'Tool', observations: ['Python agentic CLI', '35KB', 'Mirrors Claude Code architecture'] });
    kg.addEntity({ name: 'kb-add', entityType: 'Tool', observations: ['Bash CLI', 'Add patterns/insights/antipatterns'] });
    kg.addEntity({ name: 'kb-audit', entityType: 'Tool', observations: ['Bash CLI', 'Health check & recommendations'] });
    kg.addEntity({ name: 'xrai-kg', entityType: 'Library', observations: ['JS knowledge graph', 'MermaidExporter', 'ECharts'] });
    kg.addEntity({ name: 'kb-security-audit', entityType: 'Tool', observations: ['Bash', 'Security scanning'] });

    // -- kb-cli components --
    kg.addEntity({ name: 'Chrome Extension', entityType: 'Component', observations: ['Browser KB capture', 'Popup + background + content scripts'] });
    kg.addEntity({ name: 'KnowledgeManager', entityType: 'Component', observations: ['JS', 'CRUD + search + tags'] });
    kg.addEntity({ name: 'SuggestionEngine', entityType: 'Component', observations: ['Context-aware suggestions'] });
    kg.addEntity({ name: 'HistoryAnalyzer', entityType: 'Component', observations: ['Browse history analysis'] });
    kg.addEntity({ name: 'Skills', entityType: 'Component', observations: ['JSON skill definitions', 'git_status, kb_search, quick_fix, unity_mcp, vfx_patterns'] });

    // -- Visualization tools --
    kg.addEntity({ name: 'MermaidExporter', entityType: 'Module', observations: ['Flowchart, mindmap, classDiagram'] });
    kg.addEntity({ name: 'EChartsRenderer', entityType: 'Module', observations: ['Interactive graphs', 'WebGL for 10K+ nodes'] });
    kg.addEntity({ name: 'XRAI Dashboard', entityType: 'Dashboard', observations: ['322KB standalone HTML', 'All viz modes'] });
    kg.addEntity({ name: 'KG Dashboard', entityType: 'Dashboard', observations: ['ECharts-based', '27KB'] });

    // -- Automation --
    kg.addEntity({ name: 'kb-health-check', entityType: 'Automation', observations: ['LaunchAgent', 'Daily at 6am'] });
    kg.addEntity({ name: 'github-trends', entityType: 'Automation', observations: ['LaunchAgent', 'Trending repo tracking'] });
    kg.addEntity({ name: 'generate-kb-index', entityType: 'Automation', observations: ['Shell script', 'Index generation'] });
    kg.addEntity({ name: 'pattern-extractor', entityType: 'Automation', observations: ['Shell script', 'Extract patterns from commits'] });

    // -- MCP Servers --
    kg.addEntity({ name: 'unity-xr-kb MCP', entityType: 'Server', observations: ['TypeScript', 'kb_search tool'] });
    kg.addEntity({ name: 'CoPlay MCP', entityType: 'Server', observations: ['86 tools', 'Unity Editor control'] });

    // -- Relations --
    kg.addRelation({ from: 'kb-cli', to: 'Chrome Extension', relationType: 'contains' });
    kg.addRelation({ from: 'kb-cli', to: 'KnowledgeManager', relationType: 'contains' });
    kg.addRelation({ from: 'kb-cli', to: 'SuggestionEngine', relationType: 'contains' });
    kg.addRelation({ from: 'kb-cli', to: 'HistoryAnalyzer', relationType: 'contains' });
    kg.addRelation({ from: 'kb-cli', to: 'Skills', relationType: 'contains' });

    kg.addRelation({ from: 'xrai-kg', to: 'MermaidExporter', relationType: 'contains' });
    kg.addRelation({ from: 'xrai-kg', to: 'EChartsRenderer', relationType: 'contains' });
    kg.addRelation({ from: 'XRAI Dashboard', to: 'xrai-kg', relationType: 'uses' });
    kg.addRelation({ from: 'KG Dashboard', to: 'EChartsRenderer', relationType: 'uses' });

    kg.addRelation({ from: 'kb-add', to: 'LEARNING_LOG', relationType: 'calls' });
    kg.addRelation({ from: 'kb-audit', to: 'KnowledgeBase', relationType: 'calls' });

    // Add LEARNING_LOG and KnowledgeBase as targets
    kg.addEntity({ name: 'LEARNING_LOG', entityType: 'File', observations: ['Continuous discoveries log'] });
    kg.addEntity({ name: 'KnowledgeBase', entityType: 'Directory', observations: ['250+ markdown files'] });

    kg.addRelation({ from: 'kb-health-check', to: 'KnowledgeBase', relationType: 'calls' });
    kg.addRelation({ from: 'generate-kb-index', to: 'KnowledgeBase', relationType: 'calls' });
    kg.addRelation({ from: 'pattern-extractor', to: 'LEARNING_LOG', relationType: 'calls' });
    kg.addRelation({ from: 'unity-xr-kb MCP', to: 'KnowledgeBase', relationType: 'calls' });

    kg.addRelation({ from: 'Chrome Extension', to: 'KnowledgeManager', relationType: 'uses' });
    kg.addRelation({ from: 'Chrome Extension', to: 'SuggestionEngine', relationType: 'uses' });

    return kg;
}

// ============================================================
// 3. REPO STRUCTURE — Top-level project organization
// ============================================================
function buildRepoGraph() {
    const kg = new KnowledgeGraph();

    // Root
    kg.addEntity({ name: 'Unity-XR-AI', entityType: 'Repository', observations: ['Knowledge + tools + visualization mono-repo'] });

    // Top-level dirs
    kg.addEntity({ name: 'KnowledgeBase/', entityType: 'Directory', observations: ['250+ files', 'Core knowledge repository'] });
    kg.addEntity({ name: 'Vis/', entityType: 'Directory', observations: ['16 visualization frontends', 'xrai-kg, dashboards, 3D viewers'] });
    kg.addEntity({ name: 'kb-cli/', entityType: 'Directory', observations: ['Agentic KB CLI', 'Chrome extension, skills'] });
    kg.addEntity({ name: 'mcp-server/', entityType: 'Directory', observations: ['TypeScript MCP server', 'kb_search API'] });
    kg.addEntity({ name: 'MetavidoVFX-main/', entityType: 'Directory', observations: ['Unity VFX project', 'H3M hologram system'] });
    kg.addEntity({ name: 'AgentBench/', entityType: 'Directory', observations: ['Unity internals testing'] });
    kg.addEntity({ name: 'Scripts/', entityType: 'Directory', observations: ['Utility and automation scripts'] });
    kg.addEntity({ name: 'portals/', entityType: 'Directory', observations: ['Portals project workspace'] });

    // Config files
    kg.addEntity({ name: 'GLOBAL_RULES.md', entityType: 'Config', observations: ['222 lines core', 'Universal AI agent rules'] });
    kg.addEntity({ name: 'CLAUDE.md', entityType: 'Config', observations: ['Claude Code project config'] });
    kg.addEntity({ name: 'GEMINI.md', entityType: 'Config', observations: ['Gemini CLI config'] });
    kg.addEntity({ name: 'AGENTS.md', entityType: 'Config', observations: ['Agent system documentation'] });
    kg.addEntity({ name: 'TODO.md', entityType: 'Config', observations: ['Active work tracking'] });

    // Relations
    kg.addRelation({ from: 'Unity-XR-AI', to: 'KnowledgeBase/', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'Vis/', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'kb-cli/', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'mcp-server/', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'MetavidoVFX-main/', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'AgentBench/', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'Scripts/', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'portals/', relationType: 'contains' });

    kg.addRelation({ from: 'Unity-XR-AI', to: 'GLOBAL_RULES.md', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'CLAUDE.md', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'GEMINI.md', relationType: 'contains' });
    kg.addRelation({ from: 'Unity-XR-AI', to: 'AGENTS.md', relationType: 'contains' });

    // Cross-references
    kg.addRelation({ from: 'kb-cli/', to: 'KnowledgeBase/', relationType: 'uses' });
    kg.addRelation({ from: 'mcp-server/', to: 'KnowledgeBase/', relationType: 'uses' });
    kg.addRelation({ from: 'Vis/', to: 'KnowledgeBase/', relationType: 'uses' });
    kg.addRelation({ from: 'MetavidoVFX-main/', to: 'KnowledgeBase/', relationType: 'uses' });
    kg.addRelation({ from: 'Scripts/', to: 'KnowledgeBase/', relationType: 'uses' });

    return kg;
}

// ============================================================
// 4. CROSS-TOOL INTEGRATION — How tools share knowledge
// ============================================================
function buildIntegrationGraph() {
    const kg = new KnowledgeGraph();

    // AI Tools
    kg.addEntity({ name: 'Claude Code', entityType: 'AI Tool', observations: ['CLI', 'CLAUDE.md + GLOBAL_RULES.md', 'MCP client'] });
    kg.addEntity({ name: 'Gemini CLI', entityType: 'AI Tool', observations: ['CLI', 'GEMINI.md', 'MCP client'] });
    kg.addEntity({ name: 'Windsurf', entityType: 'AI Tool', observations: ['IDE', 'rules/ support', 'Mermaid rendering'] });
    kg.addEntity({ name: 'Cursor', entityType: 'AI Tool', observations: ['IDE', '.cursorrules'] });
    kg.addEntity({ name: 'Codex', entityType: 'AI Tool', observations: ['CLI', 'AGENTS.md'] });
    kg.addEntity({ name: 'Rider', entityType: 'AI Tool', observations: ['IDE', 'JetBrains MCP'] });

    // Shared resources
    kg.addEntity({ name: 'GLOBAL_RULES.md', entityType: 'Shared Config', observations: ['222 lines', 'Loaded by all tools'] });
    kg.addEntity({ name: 'KnowledgeBase', entityType: 'Shared Data', observations: ['Symlinked to ~/KnowledgeBase/', '250+ files'] });
    kg.addEntity({ name: 'MCP Servers', entityType: 'Shared Protocol', observations: ['CoPlay, unity-xr-kb, GitHub'] });
    kg.addEntity({ name: 'Git Repo', entityType: 'Shared Storage', observations: ['Unity-XR-AI on GitHub', 'Single source of truth'] });

    // Tool-specific configs
    kg.addEntity({ name: 'CLAUDE.md', entityType: 'Tool Config', observations: ['Claude Code specific'] });
    kg.addEntity({ name: 'GEMINI.md', entityType: 'Tool Config', observations: ['Gemini CLI specific'] });
    kg.addEntity({ name: 'AGENTS.md', entityType: 'Tool Config', observations: ['Codex/agent specific'] });

    // Relations — all tools use shared resources
    const tools = ['Claude Code', 'Gemini CLI', 'Windsurf', 'Cursor', 'Codex', 'Rider'];
    tools.forEach(t => {
        kg.addRelation({ from: t, to: 'GLOBAL_RULES.md', relationType: 'uses' });
        kg.addRelation({ from: t, to: 'KnowledgeBase', relationType: 'uses' });
    });

    // MCP connections
    kg.addRelation({ from: 'Claude Code', to: 'MCP Servers', relationType: 'uses' });
    kg.addRelation({ from: 'Gemini CLI', to: 'MCP Servers', relationType: 'uses' });
    kg.addRelation({ from: 'Rider', to: 'MCP Servers', relationType: 'uses' });

    // Tool-specific configs
    kg.addRelation({ from: 'Claude Code', to: 'CLAUDE.md', relationType: 'uses' });
    kg.addRelation({ from: 'Gemini CLI', to: 'GEMINI.md', relationType: 'uses' });
    kg.addRelation({ from: 'Codex', to: 'AGENTS.md', relationType: 'uses' });

    // All share git
    tools.forEach(t => kg.addRelation({ from: t, to: 'Git Repo', relationType: 'uses' }));

    return kg;
}

// ============================================================
// GENERATE ALL DIAGRAMS
// ============================================================

const domainKG = buildDomainGraph();
const toolingKG = buildToolingGraph();
const repoKG = buildRepoGraph();
const integrationKG = buildIntegrationGraph();

const flowExporter = new MermaidExporter({ diagramType: 'flowchart', direction: 'TD', showRelationLabels: true });
const lrFlowExporter = new MermaidExporter({ diagramType: 'flowchart', direction: 'LR', showRelationLabels: true });
const classExporter = new MermaidExporter({ diagramType: 'classDiagram' });

const domainFlowchart = flowExporter.export(domainKG);
const toolingFlowchart = flowExporter.export(toolingKG);
const repoFlowchart = flowExporter.export(repoKG);
const integrationFlowchart = lrFlowExporter.export(integrationKG);

const domainStats = domainKG.getStats();
const toolingStats = toolingKG.getStats();
const repoStats = repoKG.getStats();
const integrationStats = integrationKG.getStats();

// Manual mindmap
const mindmap = `mindmap
    root((Unity-XR-AI))
        KnowledgeBase
            AI Tools
                Claude Code
                Gemini CLI
                Context Engineering
            Unity
                MCP
                UAAL
                Debugging
                Rendering
            VFX Graph
                Patterns
                Bindings
                AR VFX
            XR/AR
                AR Foundation
                Hand Tracking
                Spatial Design
            Hologram
                H3M
                RCAM
                Recording
            Web
                WebGL
                Three.js
                WebXR
            ML Research
                Sentis
                OpenCV
                Style Transfer
        Vis
            xrai-kg
                MermaidExporter
                EChartsRenderer
            Dashboards
            3D Viewers
        kb-cli
            Chrome Extension
            Skills
            Automation
        mcp-server
            kb_search
        MetavidoVFX`;

const output = `# KB Architecture Diagrams

> Auto-generated by xrai-kg MermaidExporter
> Run: \`node scripts/generate-kb-diagrams.mjs\`
> Last generated: ${new Date().toISOString().split('T')[0]}

---

## 1. Knowledge Domain Map

**${domainStats.entityCount} entities, ${domainStats.relationCount} relations**
13 knowledge domains with cross-references and key files.

\`\`\`mermaid
${domainFlowchart}
\`\`\`

---

## 2. Tooling Ecosystem

**${toolingStats.entityCount} entities, ${toolingStats.relationCount} relations**
CLI tools, automation, visualization, and MCP servers.

\`\`\`mermaid
${toolingFlowchart}
\`\`\`

---

## 3. Repository Structure

**${repoStats.entityCount} entities, ${repoStats.relationCount} relations**
Top-level directories and their relationships.

\`\`\`mermaid
${repoFlowchart}
\`\`\`

---

## 4. Cross-Tool Integration

**${integrationStats.entityCount} entities, ${integrationStats.relationCount} relations**
How 6 AI tools share knowledge through GLOBAL_RULES, KB, MCP, and Git.

\`\`\`mermaid
${integrationFlowchart}
\`\`\`

---

## 5. Knowledge Mindmap

\`\`\`mermaid
${mindmap}
\`\`\`

---

## Graph Statistics

| Graph | Entities | Relations | Types |
|-------|----------|-----------|-------|
| Knowledge Domains | ${domainStats.entityCount} | ${domainStats.relationCount} | ${domainStats.types.length} |
| Tooling Ecosystem | ${toolingStats.entityCount} | ${toolingStats.relationCount} | ${toolingStats.types.length} |
| Repository Structure | ${repoStats.entityCount} | ${repoStats.relationCount} | ${repoStats.types.length} |
| Cross-Tool Integration | ${integrationStats.entityCount} | ${integrationStats.relationCount} | ${integrationStats.types.length} |
`;

writeFileSync(outputPath, output, 'utf-8');
console.log(`Generated: ${outputPath}`);
console.log(`Domains: ${domainStats.entityCount} entities, ${domainStats.relationCount} relations`);
console.log(`Tooling: ${toolingStats.entityCount} entities, ${toolingStats.relationCount} relations`);
console.log(`Repo:    ${repoStats.entityCount} entities, ${repoStats.relationCount} relations`);
console.log(`Integration: ${integrationStats.entityCount} entities, ${integrationStats.relationCount} relations`);

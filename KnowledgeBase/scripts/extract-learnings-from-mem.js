#!/usr/bin/env node
/**
 * extract-learnings-from-mem.js
 *
 * Reads all documents from claude-mem's claude_memories collection
 * (via exported JSON), filters for broadly applicable learnings,
 * and appends new ones to LEARNING_LOG.md.
 *
 * Usage:
 *   1. Export claude-mem: run this script with --export flag first
 *      (uses Chroma MCP to dump memories to JSON)
 *   2. Or provide a pre-exported JSON: node extract-learnings-from-mem.js --input memories.json
 *   3. Default: reads from last export at scripts/claude-mem-export.json
 *
 * What counts as "broadly applicable":
 *   - Architecture patterns (reusable across projects)
 *   - Bug fix patterns (error → solution)
 *   - Platform limitations (verified gotchas)
 *   - Performance insights (measurable improvements)
 *   - Workflow patterns (repeatable processes)
 *   - Best practices (lessons learned)
 *
 * What gets skipped:
 *   - Session overviews (project state snapshots)
 *   - User rules/preferences (personal config)
 *   - Startup tasks (operational)
 *   - Research results (already in KB)
 *   - Scene structures (project-specific)
 */

const fs = require('fs');
const path = require('path');

const KB_DIR = path.resolve(__dirname, '..');
const LEARNING_LOG = path.join(KB_DIR, 'LEARNING_LOG.md');
const DEFAULT_EXPORT = path.join(__dirname, 'claude-mem-export.json');

// Types that are broadly applicable
const APPLICABLE_TYPES = new Set([
  'architecture', 'architecture-pattern', 'workflow', 'solution',
  'session-learnings', 'session_summary', 'session-summary'
]);

// Categories that are broadly applicable
const APPLICABLE_CATEGORIES = new Set([
  'architecture-pattern', 'vfx-limitation', 'platform-limitation',
  'csharp-pattern', 'debug-pattern', 'testing-pattern'
]);

// Types/categories to always skip
const SKIP_TYPES = new Set([
  'critical_rule', 'user_rule', 'mandatory-rule', 'startup-task',
  'startup_task', 'preference', 'session_overview', 'scene-structure',
  'codebase', 'tooling', 'overview', 'research'
]);

// Keywords that indicate broadly applicable content
const LEARNING_KEYWORDS = [
  /KEY INSIGHT/i, /KEY LEARNING/i, /KEY FIX/i, /BEST PRACTICE/i,
  /PATTERN:/i, /LIMITATION:/i, /GOTCHA:/i, /PERFORMANCE:/i,
  /RECOMMENDED ARCHITECTURE/i, /IMPORTANT:/i, /NEVER /i,
  /ALWAYS /i, /VERIFIED/i, /WORKAROUND/i
];

function isApplicable(doc) {
  const { metadata, content } = doc;
  const type = metadata.type || '';
  const category = metadata.category || '';

  // Skip known noise
  if (SKIP_TYPES.has(type)) return false;
  if (metadata.priority === 'highest' && type === 'critical_rule') return false;

  // Include known good types
  if (APPLICABLE_TYPES.has(type)) return true;
  if (APPLICABLE_CATEGORIES.has(category)) return true;

  // Check content for learning keywords
  const hasLearningKeyword = LEARNING_KEYWORDS.some(re => re.test(content));
  if (hasLearningKeyword) return true;

  return false;
}

function extractLearnings(content) {
  const learnings = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract lines that start with learning indicators
    if (/^(KEY INSIGHT|KEY LEARNING|KEY FIX|BEST PRACTICE|RECOMMENDED|IMPORTANT|PATTERN|LIMITATION|GOTCHA|PERFORMANCE|WORKAROUND)/i.test(line.trim())) {
      // Grab this line and up to 3 following lines for context
      const block = [line.trim()];
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        if (lines[j].trim() === '' || lines[j].startsWith('#')) break;
        block.push(lines[j].trim());
      }
      learnings.push(block.join('\n'));
    }
  }

  // If no explicit learning markers, summarize the whole thing
  if (learnings.length === 0 && content.length < 1500) {
    // Take the first substantive paragraph
    const paras = content.split('\n\n').filter(p => p.trim().length > 30);
    if (paras.length > 0) {
      learnings.push(paras[0].trim());
    }
  }

  return learnings;
}

function loadExistingLog() {
  if (!fs.existsSync(LEARNING_LOG)) return '';
  return fs.readFileSync(LEARNING_LOG, 'utf8');
}

function isDuplicate(learning, existingLog) {
  // Simple dedup: check if key phrases already exist
  const normalized = learning.toLowerCase().replace(/\s+/g, ' ').substring(0, 100);
  return existingLog.toLowerCase().includes(normalized);
}

function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const inputFile = inputIdx >= 0 ? args[inputIdx + 1] : DEFAULT_EXPORT;
  const dryRun = args.includes('--dry-run');

  if (!fs.existsSync(inputFile)) {
    console.log(`Export file not found: ${inputFile}`);
    console.log('');
    console.log('To create the export, use Claude Code:');
    console.log('  chroma_get_documents("claude_memories", include=["documents","metadatas"])');
    console.log('Then save the output to scripts/claude-mem-export.json');
    console.log('');
    console.log('Or run with: node extract-learnings-from-mem.js --input <path>');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const ids = data.ids || [];
  const documents = data.documents || [];
  const metadatas = data.metadatas || [];

  console.log(`Loaded ${ids.length} memories from claude-mem`);

  const existingLog = loadExistingLog();
  const newEntries = [];

  for (let i = 0; i < ids.length; i++) {
    const doc = {
      id: ids[i],
      content: documents[i],
      metadata: metadatas[i] || {}
    };

    if (!isApplicable(doc)) {
      continue;
    }

    const learnings = extractLearnings(doc.content);
    for (const learning of learnings) {
      if (!isDuplicate(learning, existingLog)) {
        newEntries.push({
          id: doc.id,
          project: doc.metadata.project || 'unknown',
          date: doc.metadata.date || doc.metadata.created || doc.metadata.session_date || 'unknown',
          tags: doc.metadata.tags || '',
          learning
        });
      }
    }
  }

  console.log(`Found ${newEntries.length} new broadly applicable learnings`);

  if (newEntries.length === 0) {
    console.log('No new learnings to add.');
    return;
  }

  if (dryRun) {
    console.log('\n--- DRY RUN (would append to LEARNING_LOG.md) ---\n');
    for (const entry of newEntries) {
      console.log(`[${entry.date}] ${entry.project}`);
      console.log(entry.learning.substring(0, 150));
      console.log('');
    }
    return;
  }

  // Append to LEARNING_LOG.md
  const timestamp = new Date().toISOString().split('T')[0];
  let appendBlock = `\n\n## Auto-extracted from claude-mem (${timestamp})\n\n`;

  for (const entry of newEntries) {
    appendBlock += `### [${entry.date}] ${entry.project}\n`;
    if (entry.tags) appendBlock += `**Tags**: ${entry.tags}\n`;
    appendBlock += `${entry.learning}\n\n`;
  }

  fs.appendFileSync(LEARNING_LOG, appendBlock);
  console.log(`Appended ${newEntries.length} entries to LEARNING_LOG.md`);
}

main();

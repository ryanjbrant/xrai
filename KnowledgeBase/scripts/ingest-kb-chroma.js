#!/usr/bin/env node
/**
 * ingest-kb-chroma.js
 * Reads all KB .md files, chunks by heading sections, and outputs
 * JSON batches ready for Chroma ingestion via MCP or direct API.
 *
 * Usage:
 *   node scripts/ingest-kb-chroma.js                    # Output JSON batches
 *   node scripts/ingest-kb-chroma.js --output chunks.json  # Save to file
 *   node scripts/ingest-kb-chroma.js --stats             # Just show stats
 *
 * The output JSON can be consumed by any Chroma client or
 * fed to MCP chroma_add_documents in batches.
 */

const fs = require('fs');
const path = require('path');

const KB_DIR = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['scripts', 'launchagents', '_archive', 'node_modules']);
const MAX_CHUNK_CHARS = 2000; // ~500 words
const MIN_CHUNK_CHARS = 50;

function getAllMdFiles(dir, prefix = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...getAllMdFiles(fullPath, relPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.txt')) {
      files.push({ path: fullPath, rel: relPath });
    }
  }
  return files;
}

function extractTags(filename, content) {
  const tags = [];
  // From filename
  filename.replace(/^_/, '').replace(/\.md$/, '').split(/[_\-]+/)
    .forEach(t => { t = t.toLowerCase(); if (t.length > 1) tags.push(t); });
  // From **Tags**: line
  const match = content.match(/\*\*Tags?\*\*\s*:\s*(.+)/i);
  if (match) {
    const btMatches = match[1].matchAll(/`([^`]+)`/g);
    for (const m of btMatches) tags.push(m[1].replace(/^#/, '').trim().toLowerCase());
  }
  return [...new Set(tags)].join(',');
}

function chunkByHeadings(content, filename) {
  const lines = content.split('\n');
  const chunks = [];
  let currentSection = 'intro';
  let currentLines = [];

  function flush() {
    const text = currentLines.join('\n').trim();
    if (text.length >= MIN_CHUNK_CHARS) {
      // Split oversized chunks
      if (text.length > MAX_CHUNK_CHARS) {
        const parts = splitLongText(text, MAX_CHUNK_CHARS);
        parts.forEach((part, i) => {
          chunks.push({
            section: currentSection + (parts.length > 1 ? ` (${i + 1}/${parts.length})` : ''),
            text: part
          });
        });
      } else {
        chunks.push({ section: currentSection, text });
      }
    }
    currentLines = [];
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flush();
      currentSection = headingMatch[2].replace(/[*`]/g, '').trim();
    }
    currentLines.push(line);
  }
  flush();

  return chunks;
}

function splitLongText(text, maxLen) {
  const parts = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';
  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxLen && current.length > 0) {
      parts.push(current.trim());
      current = '';
    }
    current += (current ? '\n\n' : '') + para;
  }
  if (current.trim()) parts.push(current.trim());
  // If a single paragraph exceeds max, hard split
  return parts.flatMap(p => {
    if (p.length <= maxLen) return [p];
    const hardParts = [];
    for (let i = 0; i < p.length; i += maxLen) {
      hardParts.push(p.substring(i, i + maxLen));
    }
    return hardParts;
  });
}

function makeId(filename, section, index) {
  const base = filename.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const sec = section.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 40);
  return `kb-${base}-${sec}-${index}`.replace(/-+/g, '-').replace(/-$/, '');
}

function main() {
  const args = process.argv.slice(2);
  const statsOnly = args.includes('--stats');
  const outputIdx = args.indexOf('--output');
  const outputFile = outputIdx >= 0 ? args[outputIdx + 1] : null;

  const mdFiles = getAllMdFiles(KB_DIR);
  console.log(`Found ${mdFiles.length} files in KnowledgeBase`);

  const allChunks = [];
  let totalChars = 0;

  for (const { path: filepath, rel } of mdFiles) {
    const content = fs.readFileSync(filepath, 'utf8');
    const tags = extractTags(path.basename(rel), content);
    const chunks = chunkByHeadings(content, rel);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      totalChars += chunk.text.length;
      allChunks.push({
        id: makeId(rel, chunk.section, i),
        document: chunk.text,
        metadata: {
          file: rel,
          section: chunk.section,
          tags: tags,
          chunk_index: i,
          char_count: chunk.text.length
        }
      });
    }
  }

  console.log(`\nChunking stats:`);
  console.log(`  Files: ${mdFiles.length}`);
  console.log(`  Chunks: ${allChunks.length}`);
  console.log(`  Total chars: ${totalChars.toLocaleString()}`);
  console.log(`  Avg chunk: ${Math.round(totalChars / allChunks.length)} chars`);
  console.log(`  Max chunk: ${Math.max(...allChunks.map(c => c.document.length))} chars`);

  if (statsOnly) return;

  // Output as batches of 50 for MCP consumption
  const BATCH_SIZE = 50;
  const batches = [];
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    batches.push({
      batch_index: batches.length,
      count: batch.length,
      ids: batch.map(c => c.id),
      documents: batch.map(c => c.document),
      metadatas: batch.map(c => c.metadata)
    });
  }

  const output = {
    collection_name: 'kb_knowledge',
    generated: new Date().toISOString(),
    total_chunks: allChunks.length,
    total_batches: batches.length,
    batch_size: BATCH_SIZE,
    batches
  };

  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\nSaved ${batches.length} batches to ${outputFile}`);
  } else {
    // Write to default location
    const defaultOut = path.join(KB_DIR, 'scripts', 'kb-chunks.json');
    fs.writeFileSync(defaultOut, JSON.stringify(output, null, 2));
    console.log(`\nSaved ${batches.length} batches to ${defaultOut}`);
  }

  console.log(`\nTo ingest into Chroma via MCP, use each batch's ids/documents/metadatas`);
  console.log(`with chroma_add_documents("kb_knowledge", documents, ids, metadatas)`);
}

main();

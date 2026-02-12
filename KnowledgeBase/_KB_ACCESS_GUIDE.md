# Knowledgebase Access Guide

**Purpose**: How to access the Unity XR Knowledgebase from any tool, IDE, or platform.
**Version**: 2.0 (2026-02-12)

---

## AI-Optimized Access (Start Here)

**257 files, 4.8MB, 8302 indexed chunks in Chroma**

### 1. Semantic Search (fastest - local MCP tools only)
```
chroma_query_documents("kb_knowledge", ["your question here"], n_results=5)
```
Returns ranked chunks with file paths, sections, and relevance scores.
One call, conceptual matching, no keywords needed.

### 2. Manifest Routing (any tool - works via GitHub)
Read `kb-manifest.json`, match tags/summaries/sections, then read specific files.
```
Local:   ~/.claude/knowledgebase/kb-manifest.json
GitHub:  https://raw.githubusercontent.com/imclab/xrai/main/KnowledgeBase/kb-manifest.json
CDN:     https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/kb-manifest.json
```

### 3. Read Files
```
Local:   ~/.claude/knowledgebase/<filename>
GitHub:  https://raw.githubusercontent.com/imclab/xrai/main/KnowledgeBase/<filename>
```

### 4. Keyword Search (fallback)
```bash
grep -ri "term" ~/.claude/knowledgebase/
```

### 5. Write-back
```
Local:   Edit file directly, git commit & push from ~/Documents/GitHub/Unity-XR-AI/
GitHub:  create_or_update_file API on imclab/xrai repo
```

### Refresh Pipeline (when KB files change)
```bash
cd ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase
node scripts/generate-kb-manifest.js           # Update manifest
node scripts/ingest-kb-chroma.js               # Generate chunks
python3 scripts/ingest-kb-chroma.py            # Re-ingest into Chroma
```

---

## Quick Access Methods

| Method | Best For | Speed | Setup |
|--------|----------|-------|-------|
| **Chroma Semantic** | Any question (conceptual match) | 1 call | Already indexed (8302 chunks) |
| **Manifest JSON** | Route to right file by tags | 1-2 calls | `kb-manifest.json` in repo |
| **File Symlinks** | AI CLIs (Claude, Cursor, etc.) | Direct read | Already configured |
| **GitHub Raw** | CI/CD, cross-tool, remote agents | HTTP fetch | Direct URL |
| **Shell Aliases** | Terminal users | Instant | Already configured |

---

## 1. File Symlinks (Zero Setup)

All major AI tools have symlinks pre-configured:

```
~/.claude/knowledgebase → KnowledgeBase/
~/.windsurf/knowledgebase → KnowledgeBase/
~/.cursor/knowledgebase → KnowledgeBase/
~/.codex/knowledgebase → KnowledgeBase/
~/.gemini/knowledgebase → KnowledgeBase/
~/.antigravity/knowledgebase → KnowledgeBase/
~/.gemini/antigravity/knowledgebase → KnowledgeBase/
~/Library/Application Support/JetBrains/Rider2025.3/scratches/KnowledgeBase → KnowledgeBase/
```

**Usage in AI tools**:
```
Read the file at ~/.claude/knowledgebase/_AUTO_FIX_PATTERNS.md
Read the file at ~/.gemini/knowledgebase/_QUICK_FIX.md
```

---

## 2. MCP Server (Semantic Search)

The MCP KB server provides semantic search across 530+ repos and patterns.

### Start Server
```bash
cd mcp-server && npm start
```

### MCP Tools Available

| Tool | Purpose |
|------|---------|
| `kb_search` | Semantic search across all KB |
| `kb_list_categories` | List categories with counts |
| `kb_get_repo` | Get repo details |
| `kb_get_snippet` | Get code pattern |
| `kb_stats` | KB statistics |

### Example Usage (Claude Code)
```
Use kb_search with query "ARFoundation body tracking"
```

---

## 3. REST API (HTTP Access)

### Start API Server
```bash
node api/kb-api.js [port]  # Default: 3847
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q=query` | Search KB files |
| `GET /api/files` | List all KB files |
| `GET /api/file/:name` | Get specific file |
| `GET /api/patterns` | Get auto-fix patterns |
| `GET /api/stats` | KB statistics |
| `GET /api/health` | Health check |

### Example Requests

```bash
# Search
curl "http://localhost:3847/api/search?q=VFX%20depth"

# Get file
curl "http://localhost:3847/api/file/_AUTO_FIX_PATTERNS.md"

# Stats
curl "http://localhost:3847/api/stats"
```

### Response Format
```json
{
  "query": "VFX depth",
  "count": 5,
  "results": [
    {
      "file": "_VFX25_HOLOGRAM_PORTAL_PATTERNS.md",
      "matches": [
        {"line": 45, "text": "...VFX Graph Depth Setup..."}
      ],
      "score": 3
    }
  ]
}
```

---

## 4. GitHub Raw Access (Direct URLs)

Access files directly via GitHub raw URLs:

### Base URL
```
https://raw.githubusercontent.com/imclab/Unity-XR-AI/main/KnowledgeBase/
```

### Example URLs
```
# Auto-fix patterns
https://raw.githubusercontent.com/imclab/Unity-XR-AI/main/KnowledgeBase/_AUTO_FIX_PATTERNS.md

# Quick fixes
https://raw.githubusercontent.com/imclab/Unity-XR-AI/main/KnowledgeBase/_QUICK_FIX.md

# Intelligence index
https://raw.githubusercontent.com/imclab/Unity-XR-AI/main/KnowledgeBase/_INTELLIGENCE_SYSTEMS_INDEX.md
```

### In Scripts
```bash
# Fetch patterns
curl -s "https://raw.githubusercontent.com/imclab/Unity-XR-AI/main/KnowledgeBase/_AUTO_FIX_PATTERNS.md" | head -100

# Search via GitHub API
curl -s "https://api.github.com/search/code?q=ExposedProperty+repo:imclab/Unity-XR-AI"
```

---

## 5. Shell Aliases (Terminal)

Pre-configured in `~/.zshrc`:

```bash
# Search all KB files
kb "query"

# Error → Fix lookup
kbfix "CS0246"

# Find by tag
kbtag "vfx"

# Search GitHub repos
kbrepo "hand tracking"
```

---

## 6. IDE Integration

### JetBrains Rider
```
# Symlink in Scratches folder (Cmd+Shift+N → Scratch File)
~/Library/Application Support/JetBrains/Rider2025.3/scratches/KnowledgeBase/

# JetBrains MCP tools for code search
search_in_files_by_text("ExposedProperty")
get_file_text_by_path("KnowledgeBase/_AUTO_FIX_PATTERNS.md")

# Direct file browser access
~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/
```

### VS Code / Cursor
```
# Open workspace at Unity-XR-AI root
# Use Ctrl+P to search KB files
# Symlink at ~/.cursor/knowledgebase/
```

### Gemini / AntiGravity
```
# Symlinks available at:
~/.gemini/knowledgebase/
~/.antigravity/knowledgebase/
~/.gemini/antigravity/knowledgebase/

# Quick access in prompts:
"Read ~/.gemini/knowledgebase/_QUICK_FIX.md"
```

### Unity Editor
```csharp
// Access KB from Unity scripts
string kbPath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.Personal),
    "Documents/GitHub/Unity-XR-AI/KnowledgeBase"
);
```

---

## 7. Programmatic Access (Python/Node)

### Python
```python
import os
import glob

KB_PATH = os.path.expanduser("~/Documents/GitHub/Unity-XR-AI/KnowledgeBase")

# List files
files = glob.glob(f"{KB_PATH}/*.md")

# Search
def search_kb(query):
    results = []
    for f in files:
        with open(f) as file:
            if query.lower() in file.read().lower():
                results.append(os.path.basename(f))
    return results

# Get patterns
def get_patterns():
    with open(f"{KB_PATH}/_AUTO_FIX_PATTERNS.md") as f:
        return f.read()
```

### Node.js
```javascript
const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(process.env.HOME, 'Documents/GitHub/Unity-XR-AI/KnowledgeBase');

// List files
const files = fs.readdirSync(KB_PATH).filter(f => f.endsWith('.md'));

// Search
function searchKB(query) {
    return files.filter(f => {
        const content = fs.readFileSync(path.join(KB_PATH, f), 'utf8');
        return content.toLowerCase().includes(query.toLowerCase());
    });
}
```

---

## Key Files Reference

| File | Content |
|------|---------|
| `_AUTO_FIX_PATTERNS.md` | 106 auto-fix patterns |
| `_QUICK_FIX.md` | Error → Fix lookup table |
| `_INTELLIGENCE_SYSTEMS_INDEX.md` | Central reference |
| `_CONTINUOUS_LEARNING_SYSTEM.md` | Pattern extraction |
| `_SELF_HEALING_SYSTEM.md` | Auto-recovery |
| `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` | AR + VFX patterns |
| `_VFX25_HOLOGRAM_PORTAL_PATTERNS.md` | VFX hologram patterns |
| `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` | 520+ GitHub repos |
| `LEARNING_LOG.md` | Discovery journal |

---

## Statistics

- **Files**: 257 (245 indexed in manifest)
- **Chroma Chunks**: 8302 semantic-searchable
- **Patterns**: 106 auto-fix (80% auto-apply)
- **GitHub Repos**: 520+ indexed
- **Code Snippets**: 50+ production-ready
- **Categories**: VFX, AR, Compute, Hand Tracking, Networking, Web, AI/ML, etc.

---

## Troubleshooting

### Chroma Not Returning Results
```bash
# Check MCP server running
ps aux | grep chroma-mcp
# Verify collection
# Use: chroma_get_collection_count("kb_knowledge") — should return 8302
# Re-ingest if needed:
cd ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase
node scripts/ingest-kb-chroma.js && python3 scripts/ingest-kb-chroma.py
```

### Symlink Broken
```bash
# Recreate
ln -sf ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase ~/.claude/knowledgebase
```

### Manifest Stale
```bash
node ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/generate-kb-manifest.js
```

---

**Last Updated**: 2026-02-12
**Maintained By**: system-improver agent

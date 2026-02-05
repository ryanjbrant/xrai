# Knowledgebase Access Guide

**Purpose**: How to access the Unity XR Knowledgebase from any tool, IDE, or platform.
**Version**: 1.0 (2026-01-22)

---

## Quick Access Methods

| Method | Best For | Setup |
|--------|----------|-------|
| **File Symlinks** | AI CLIs (Claude, Cursor, etc.) | Already configured |
| **MCP Server** | Claude Code, Windsurf, Rider | Built-in |
| **REST API** | Any HTTP client | `node api/kb-api.js` |
| **GitHub Raw** | CI/CD, Scripts | Direct URL |
| **Shell Aliases** | Terminal users | Already configured |

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

- **Files**: 137 markdown files
- **Patterns**: 106 auto-fix (80% auto-apply)
- **GitHub Repos**: 520+ indexed
- **Code Snippets**: 50+ production-ready
- **Categories**: VFX, AR, Compute, Hand Tracking, Networking, etc.

---

## Troubleshooting

### MCP Server Not Responding
```bash
# Check if running
lsof -i :3847
# Restart
cd mcp-server && npm start
```

### Symlink Broken
```bash
# Recreate
ln -sf ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase ~/.claude/knowledgebase
```

### API Returns Empty
```bash
# Check KB path
ls ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/*.md | wc -l
# Should return 137
```

---

**Last Updated**: 2026-01-22
**Maintained By**: system-improver agent
# KnowledgeBase Search Commands

**Tags**: `search` `grep` `knowledgebase` `all-tools` `holistic`
**Updated**: 2026-01-21
**Purpose**: Universal search commands for all AI tools and IDEs

---

## Decision Flow (Holistic - Always Check KB First)

```
Error/Question arrives
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. kbfix/kbtag  │────▶│ 2. Found?       │────▶│ 3. Apply direct │
│    (0 tokens)   │ No  │    grep KB      │ Yes │    (done)       │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │ No
                                 ▼
                        ┌─────────────────┐
                        │ 4. MCP/Agent?   │
                        │ JetBrains/Unity │
                        └────────┬────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │ JetBrains MCP  │ │ Unity MCP      │ │ Explore Agent  │
     │ C# code search │ │ Editor state   │ │ Multi-file     │
     │ (~100 tokens)  │ │ (~50 tokens)   │ │ (independent)  │
     └────────────────┘ └────────────────┘ └────────────────┘
```

---

## Quick Lookup (Zero Tokens)

```bash
# Error → Fix (instant lookup)
grep -i "CS0246\|NullRef\|MCP timeout" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md

# Find pattern file by topic
grep -i "vfx\|hologram\|hand" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_PATTERN_TAGS.md

# Search all pattern files
grep -ri "ExposedProperty\|TryGetTexture" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_*.md
```

---

## By Use Case

### Fix an Error
```bash
# Step 1: Check quick fix table
grep -i "error message" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md

# Step 2: If not found, search auto-fix patterns
grep -ri "error message" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_AUTO_FIX_PATTERNS.md
```

### Find a Pattern
```bash
# Step 1: Check pattern tags index
grep -i "topic" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_PATTERN_TAGS.md

# Step 2: Search specific pattern file
grep -i "topic" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_VFX25_HOLOGRAM_PORTAL_PATTERNS.md
```

### Find GitHub Repo
```bash
# Search 520+ curated repos
grep -i "hand tracking\|gaussian" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md
```

### Find Code Snippet
```bash
# AR Foundation + VFX patterns
grep -i "depth\|segmentation" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md

# Unity compute/shader patterns
grep -i "dispatch\|buffer" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_UNITY6_HLSL_COMPUTE_SHADER_GUIDE.md
```

---

## Topic-Specific Searches

### VFX / Hologram
```bash
grep -ri "vfx\|particle\|hologram" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_VFX*.md
grep -i "portal\|depth" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_VFX25_HOLOGRAM_PORTAL_PATTERNS.md
```

### AR / Hand Tracking
```bash
grep -ri "ARFoundation\|hand\|tracking" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_AR*.md
grep -i "gesture\|pinch" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_HAND_SENSING_CAPABILITIES.md
```

### MCP / Unity Automation
```bash
grep -i "batch_execute\|read_console" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_UNITY_MCP_QUICK_REFERENCE.md
grep -i "mcp\|tool" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md
```

### Performance / Token Optimization
```bash
grep -i "token\|optimization" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_TOKEN_EFFICIENCY_COMPLETE.md
grep -i "fps\|memory\|performance" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_PERFORMANCE_PATTERNS_REFERENCE.md
```

### WebGL / Three.js
```bash
grep -ri "webgl\|three\|webgpu" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_WEBGL*.md
```

---

## Multi-Pattern Search (Regex)

```bash
# Search multiple terms at once
grep -Ei "ExposedProperty|TryGetTexture|CeilToInt" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/*.md

# Search with context (3 lines before/after)
grep -B3 -A3 -i "pattern" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md

# Count matches per file
grep -c "vfx" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_*.md | grep -v ":0$"

# List files containing term
grep -l "hologram" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/*.md
```

---

## Aliases (Add to ~/.zshrc or ~/.bashrc)

```bash
# Quick KB search
alias kb='grep -ri --include="*.md" "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/'
alias kbfix='grep -i "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md'
alias kbtag='grep -i "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_PATTERN_TAGS.md'
alias kbrepo='grep -i "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md'

# Functions for more complex searches
kb() { grep -ri --include="*.md" "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/; }
kbfix() { grep -i "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md; }
kbtag() { grep -i "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_PATTERN_TAGS.md; }
kbrepo() { grep -i "$1" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md; }
```

---

## IDE-Specific

### VS Code / Cursor / Windsurf
```
Ctrl+Shift+F (Cmd+Shift+F on Mac)
Search in: KnowledgeBase/**/*.md
```

### Rider / IntelliJ
```
Ctrl+Shift+F → Scope: KnowledgeBase
File mask: *.md
```

### Terminal (Any Tool)
```bash
# From any directory
grep -ri "search term" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/
```

---

## AI Tool Integration

### Claude Code
```
"Search KB for [topic]"
→ Uses grep internally (0 tokens)
```

### Gemini CLI
```
# Paste this context:
"Search ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/ for [topic]"
```

### Codex CLI
```
# Same as Gemini - shared filesystem
grep -ri "topic" ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/
```

---

## Key Files Reference

| Purpose | Command |
|---------|---------|
| Error fixes | `cat ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md` |
| Pattern index | `cat ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_PATTERN_TAGS.md` |
| MCP reference | `cat ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_UNITY_MCP_QUICK_REFERENCE.md` |
| GitHub repos | `cat ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` |
| Token tips | `cat ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_TOKEN_EFFICIENCY_COMPLETE.md` |
| Tool rollover | `cat ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_CROSS_TOOL_ROLLOVER_GUIDE.md` |

---

---

## Screenshot Commands (Visual Context)

```bash
# Automated screenshot capture (then Ctrl+V to paste in Claude Code)
ss                    # Interactive screenshot → clipboard
ssu                   # Unity window screenshot → clipboard
ai-screenshot         # Full version with notification
ai-screenshot-unity   # Unity-specific capture
```

**Saves**: ~500-2000 tokens vs describing visually

**Best for**: Errors, UI issues, visual bugs, design references

---

## Priority Order (Fastest First)

| Priority | Command | Tokens | Speed | Use Case |
|----------|---------|--------|-------|----------|
| 1 | `kbfix "error"` | **0** | Instant | Known errors |
| 2 | `kbtag "topic"` | **0** | Instant | Find pattern files |
| 3 | `kb "search"` | **0** | <1s | Full KB search |
| 4 | `kbrepo "topic"` | **0** | <1s | GitHub repos |
| 5 | `ss` / `ssu` | **0** | 2s | Visual context |
| 6 | JetBrains MCP | ~100 | 1s | C# code search |
| 7 | Unity MCP | ~50 | 1s | Editor state |
| 8 | Explore agent | Independent | 5s | Multi-file search |
| 9 | claude-mem | ~500 | 2s | Semantic recall |
| 10 | WebSearch | ~1000 | 3s | External info |

---

## See Also

- `_QUICK_FIX.md` - Error → Fix lookup table
- `_PATTERN_TAGS.md` - Pattern file index by tag
- `_CROSS_TOOL_ROLLOVER_GUIDE.md` - Tool switching guide
- `GLOBAL_RULES.md` - Universal rules (~/GLOBAL_RULES.md)
# Knowledge Base Architecture Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                              │
├────────────┬────────────┬────────────┬────────────┬──────────────────────┤
│   Unity    │   Unreal   │   Mobile   │    Web     │      Desktop         │
│  (WebGL)   │  (WebXR)   │ (RN/Flutter)│ (React)   │    (Electron)        │
│            │            │            │            │                      │
│ WebSocket  │ WebSocket  │ REST/WS    │ REST/WS    │    REST/GraphQL      │
└─────┬──────┴─────┬──────┴─────┬──────┴─────┬──────┴──────┬──────────────┘
      │            │            │            │             │
      └────────────┴────────────┴────────────┴─────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   CLOUDFLARE CDN       │
                    │  - Edge caching        │
                    │  - DDoS protection     │
                    │  - SSL/TLS             │
                    │  - Image optimization  │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │    API GATEWAY         │
                    │  - Kong / Envoy        │
                    │  - Auth validation     │
                    │  - Rate limiting       │
                    │  - Request routing     │
                    └───┬────────┬───────┬───┘
                        │        │       │
              ┌─────────┤        │       └──────────┐
              │         │        │                  │
      ┌───────▼──┐ ┌────▼────┐ ┌▼────────┐  ┌──────▼──────┐
      │  REST    │ │ GraphQL │ │WebSocket│  │ MCP Server  │
      │  API     │ │  API    │ │  Sync   │  │ (AI Tools)  │
      │(FastAPI) │ │(Apollo) │ │(Node.js)│  │             │
      └────┬─────┘ └────┬────┘ └────┬────┘  └──────┬──────┘
           │            │           │              │
           └────────────┴───────────┴──────────────┘
                                │
                    ┌───────────▼────────────┐
                    │    SYNC ENGINE         │
                    │  - Yjs (text)          │
                    │  - Automerge (JSON)    │
                    │  - Event Sourcing      │
                    │  - CRDT resolution     │
                    └────────┬───────────────┘
                             │
              ┌──────────────┴───────────────┐
              │                              │
    ┌─────────▼──────────┐      ┌───────────▼──────────┐
    │   VECTOR DATABASE  │      │   OBJECT STORAGE     │
    │   (Qdrant)         │      │   (S3 / R2)          │
    │                    │      │                      │
    │ - Semantic search  │      │ - Raw files          │
    │ - Embeddings       │      │ - Versions           │
    │ - Metadata         │      │ - Backups            │
    │ - 99%+ recall      │      │ - Media assets       │
    └────────────────────┘      └──────────────────────┘
```

## Client-Side Architecture (Offline-First)

```
┌─────────────────────────────────────────────────────┐
│              BROWSER / MOBILE APP                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │           USER INTERFACE (React/RN)            │ │
│  └──────────────────┬─────────────────────────────┘ │
│                     │                                │
│  ┌──────────────────▼─────────────────────────────┐ │
│  │         APPLICATION STATE (Redux/Zustand)      │ │
│  └──────────────────┬─────────────────────────────┘ │
│                     │                                │
│  ┌──────────────────▼─────────────────────────────┐ │
│  │      LOCAL DATABASE (Primary SSOT)             │ │
│  │                                                 │ │
│  │  ┌───────────────┐  ┌─────────────────────┐   │ │
│  │  │  IndexedDB    │  │  WatermelonDB       │   │ │
│  │  │  (Web)        │  │  (React Native)     │   │ │
│  │  └───────────────┘  └─────────────────────┘   │ │
│  │                                                 │ │
│  │  - Documents (Yjs format)                      │ │
│  │  - Metadata (JSON)                             │ │
│  │  - Search index (local)                        │ │
│  │  - User preferences                            │ │
│  └──────────────────┬─────────────────────────────┘ │
│                     │                                │
│  ┌──────────────────▼─────────────────────────────┐ │
│  │         SYNC WORKER (Background)               │ │
│  │                                                 │ │
│  │  - Queue local changes                         │ │
│  │  - Fetch remote updates                        │ │
│  │  - CRDT merge (conflict-free)                  │ │
│  │  - Retry failed syncs                          │ │
│  └──────────────────┬─────────────────────────────┘ │
│                     │                                │
└─────────────────────┼────────────────────────────────┘
                      │
                      │ WebSocket / HTTP
                      ▼
              ┌───────────────┐
              │  API GATEWAY  │
              └───────────────┘
```

## Data Flow - Write Operation

```
┌──────────────┐
│ User Edit    │ 1. User types "Hello World" in editor
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ 2. Apply to Local Store      │ IndexedDB.put(doc, changes)
│    (Optimistic Update)       │ UI updates immediately
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 3. Queue for Sync            │ syncQueue.add({
│                              │   op: "update",
└──────┬───────────────────────┘   doc_id: "abc",
       │                            changes: [...]
       │                          })
       ▼
┌──────────────────────────────┐
│ 4. Background Sync Worker    │ if (navigator.onLine) {
│    (Check Network)           │   sendToServer()
└──────┬───────────────────────┘ }
       │
       ▼
┌──────────────────────────────┐
│ 5. Send to Server            │ WebSocket.send({
│    (WebSocket)               │   type: "yjs_update",
└──────┬───────────────────────┘   update: YjsUpdate
       │                          })
       │
       ▼
┌──────────────────────────────┐
│ 6. Server CRDT Merge         │ YDoc.applyUpdate(update)
│                              │ No conflicts possible!
└──────┬───────────────────────┘
       │
       ├────────────────┬──────────────────┐
       │                │                  │
       ▼                ▼                  ▼
┌──────────────┐ ┌─────────────┐  ┌──────────────┐
│ 7a. Qdrant   │ │ 7b. S3/R2   │  │ 7c. Event    │
│ (Embedding)  │ │ (Raw File)  │  │ Store (Audit)│
└──────────────┘ └─────────────┘  └──────────────┘
       │                │                  │
       └────────────────┴──────────────────┘
                        │
                        ▼
┌───────────────────────────────────────┐
│ 8. Broadcast to Other Clients         │
│    (Real-time Collaboration)          │
└───────────────────────────────────────┘
```

## Data Flow - Read Operation (Semantic Search)

```
┌──────────────────┐
│ User Search      │ 1. User types "hand tracking ARKit"
│ "hand tracking"  │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────┐
│ 2. Check Local Cache         │ cache = localStorage.get("search:hand")
│                              │ if (cache && fresh) return cache
└──────┬───────────────────────┘
       │ Cache miss
       ▼
┌──────────────────────────────┐
│ 3. Generate Query Embedding  │ embedding = await openai.embeddings.create({
│    (Client or Server)        │   model: "text-embedding-3-large",
└──────┬───────────────────────┘   input: "hand tracking ARKit"
       │                          })
       ▼
┌──────────────────────────────┐
│ 4. Send to API               │ POST /api/search
│                              │ { query: "...", embedding: [...] }
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 5. Qdrant Vector Search      │ qdrant.search({
│    (Semantic Similarity)     │   collection: "kb",
└──────┬───────────────────────┘   vector: embedding,
       │                            limit: 10,
       │                            score_threshold: 0.7
       ▼                          })
┌──────────────────────────────┐
│ 6. Results Returned          │ [
│    (Ranked by Similarity)    │   {id: "doc1", score: 0.95, ...},
└──────┬───────────────────────┘   {id: "doc2", score: 0.89, ...}
       │                          ]
       ▼
┌──────────────────────────────┐
│ 7. Hydrate Full Documents    │ docs = await s3.getObjects(doc_ids)
│    (From S3/R2)              │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 8. Return to Client          │ Response: {
│                              │   results: [...],
└──────┬───────────────────────┘   took_ms: 45
       │                          }
       ▼
┌──────────────────────────────┐
│ 9. Cache Locally             │ localStorage.set("search:hand", results)
│    (For Offline)             │ indexedDB.put(results)
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 10. Display Results          │ UI.render(results)
│     (<50ms total)            │
└──────────────────────────────┘
```

## Sync Flow - Conflict Resolution (CRDT)

```
┌─────────────┐                      ┌─────────────┐
│  Client A   │                      │  Client B   │
│  (Offline)  │                      │  (Offline)  │
└──────┬──────┘                      └──────┬──────┘
       │                                    │
       │ Edit: "Hello World"                │ Edit: "Hello Unity"
       │ (Same document, same time)         │
       │                                    │
       ▼                                    ▼
┌──────────────┐                      ┌──────────────┐
│ Local Yjs    │                      │ Local Yjs    │
│ State A      │                      │ State B      │
└──────┬───────┘                      └──────┬───────┘
       │                                    │
       │ Both come online                   │
       │                                    │
       └────────────┬───────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Sync Server        │
         │   (Yjs Awareness)    │
         └──────────┬───────────┘
                    │
            ┌───────┴────────┐
            │                │
            ▼                ▼
    ┌───────────────┐ ┌───────────────┐
    │ Apply Update  │ │ Apply Update  │
    │ from Client A │ │ from Client B │
    └───────┬───────┘ └───────┬───────┘
            │                │
            └────────┬────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   CRDT Merge         │
          │   (Automatic)        │
          │                      │
          │  Result: "Hello      │
          │           Unity      │
          │           World"     │
          │                      │
          │  NO CONFLICT!        │
          └──────────┬───────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│ Broadcast to    │      │ Broadcast to    │
│ Client A        │      │ Client B        │
│                 │      │                 │
│ "Hello          │      │ "Hello          │
│  Unity          │      │  Unity          │
│  World"         │      │  World"         │
└─────────────────┘      └─────────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT                             │
└───────────────────┬──────────────────────────────────┘
                    │
                    │ 1. Login Request
                    ▼
┌──────────────────────────────────────────────────────┐
│              AUTH PROVIDER (Auth0/Cognito)           │
│                                                       │
│  - Username/Password OR                              │
│  - Social OAuth (Google/GitHub) OR                   │
│  - WebAuthn (Fingerprint/Face ID)                    │
└───────────────────┬──────────────────────────────────┘
                    │
                    │ 2. Return Tokens
                    │    - Access Token (JWT, 15 min)
                    │    - Refresh Token (7 days)
                    ▼
┌──────────────────────────────────────────────────────┐
│                    CLIENT                             │
│                                                       │
│  localStorage.setItem("access_token", jwt)           │
└───────────────────┬──────────────────────────────────┘
                    │
                    │ 3. API Request
                    │    Authorization: Bearer <jwt>
                    ▼
┌──────────────────────────────────────────────────────┐
│              API GATEWAY                              │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ JWT Validation Middleware                      │  │
│  │                                                │  │
│  │  1. Verify signature (public key)             │  │
│  │  2. Check expiration                          │  │
│  │  3. Validate issuer/audience                  │  │
│  │  4. Check rate limits                         │  │
│  └────────────┬───────────────────────────────────┘  │
│               │                                       │
│               ▼                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Authorization Middleware                       │  │
│  │                                                │  │
│  │  1. Extract user_id from JWT                  │  │
│  │  2. Load user permissions (RBAC)              │  │
│  │  3. Check resource access (ABAC)              │  │
│  └────────────┬───────────────────────────────────┘  │
└────────────────┼──────────────────────────────────────┘
                 │
                 │ 4. Authorized Request
                 ▼
┌──────────────────────────────────────────────────────┐
│              APPLICATION SERVICES                     │
│                                                       │
│  - Apply row-level security (Qdrant)                 │
│  - Log access (audit trail)                          │
│  - Return filtered results                           │
└──────────────────────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE                              │
│  - DNS                                                       │
│  - DDoS Protection                                           │
│  - WAF (Web Application Firewall)                           │
│  - CDN (200+ edge locations)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  LOAD BALANCER (AWS ALB)                     │
│  - Health checks                                             │
│  - SSL/TLS termination                                       │
│  - Sticky sessions (WebSocket)                               │
└──────┬────────────────────────────────────┬─────────────────┘
       │                                    │
       ▼                                    ▼
┌──────────────────┐              ┌──────────────────┐
│  API Server 1    │              │  API Server 2    │
│  (Auto-scaling)  │              │  (Auto-scaling)  │
│                  │              │                  │
│  - FastAPI       │              │  - FastAPI       │
│  - Node.js       │              │  - Node.js       │
│  - Docker        │              │  - Docker        │
└────────┬─────────┘              └────────┬─────────┘
         │                                 │
         └─────────────┬───────────────────┘
                       │
            ┌──────────┴───────────┐
            │                      │
            ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│   Qdrant Cluster    │  │   S3 / R2 Storage   │
│   (3 nodes)         │  │                     │
│                     │  │  - Multi-region     │
│  - Leader + 2 Rep   │  │  - Versioning ON    │
│  - Auto-failover    │  │  - Encryption       │
│  - Backups daily    │  │  - Lifecycle rules  │
└─────────────────────┘  └─────────────────────┘

         Monitoring & Observability
┌─────────────────────────────────────────────┐
│  - Prometheus (metrics)                     │
│  - Grafana (dashboards)                     │
│  - Loki (logs)                              │
│  - Jaeger (tracing)                         │
│  - PagerDuty (alerts)                       │
└─────────────────────────────────────────────┘
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React / React Native | Web & mobile UI |
| **Local DB** | IndexedDB / WatermelonDB | Offline-first storage |
| **Sync** | Yjs + Automerge | CRDT conflict resolution |
| **API** | FastAPI + Apollo + Socket.io | REST + GraphQL + WebSocket |
| **Gateway** | Kong / Envoy | Auth, rate limit, routing |
| **Auth** | Auth0 / Cognito | OAuth2 + JWT |
| **Vector DB** | Qdrant | Semantic search |
| **Storage** | S3 / Cloudflare R2 | Object storage |
| **CDN** | Cloudflare | Global edge cache |
| **AI** | MCP + OpenAI | Tool integration + embeddings |
| **Monitor** | Prometheus + Grafana | Metrics & alerts |
| **Deploy** | Docker + Kubernetes | Container orchestration |

---

**Version**: 1.0
**Created**: January 7, 2026
**Companion Document**: CLOUD_NATIVE_KB_ARCHITECTURE_2025.md

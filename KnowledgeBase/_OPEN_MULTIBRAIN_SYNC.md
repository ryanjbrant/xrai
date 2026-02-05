# open-multibrain - Cross-Tool AI Sync

**Tags**: #tools #sync #automation #claude #codex #windsurf #antigravity
**Cross-refs**: `GLOBALGLOBAL_RULES.md`, `AGENTS.md`, `_CROSS_TOOL_ARCHITECTURE.md`
**Domain**: open-multibrain.com (available)

---

## What Is open-multibrain?

Single source of truth for multiple AI development tools. Syncs configuration across:

| Tool | Config Location | What's Synced |
|------|-----------------|---------------|
| Claude Code | ~/.claude/ | knowledgebase |
| Codex | ~/.codex/ | AGENTS.md, GLOBALGLOBAL_RULES.md, knowledgebase |
| Antigravity | ~/.antigravity/ | GLOBALGLOBAL_RULES.md, knowledgebase |
| Windsurf | ~/.windsurf/ | GLOBALGLOBAL_RULES.md, knowledgebase |
| Rider | JetBrains MCP | port 63342 |

---

## Architecture

```
Unity-XR-AI/                    (source of truth)
├── GLOBALGLOBAL_RULES.md       →     ~/GLOBALGLOBAL_RULES.md     →  all tools
├── AGENTS.md             →     ~/AGENTS.md           →  Codex
├── KnowledgeBase/        →     tool-specific symlinks
└── modules/open-multibrain/
    ├── config.json             (toggles)
    ├── sync.sh                 (main script)
    └── README.md
```

---

## How It Works

### Automatic (Git Hook)
```
git commit (to GLOBALGLOBAL_RULES.md, AGENTS.md, or KnowledgeBase/)
    ↓
.git/hooks/post-commit
    ↓
modules/open-multibrain/sync.sh
    ↓
All tool configs updated (<1 sec)
```

### Manual
```bash
# Run sync
./modules/open-multibrain/sync.sh

# Check status
./modules/open-multibrain/sync.sh --status

# Force sync even if disabled
./modules/open-multibrain/sync.sh --force
```

---

## Configuration

Edit `modules/open-multibrain/config.json`:

```json
{
  "enabled": true,
  "auto_sync_on_commit": true,
  "tools": {
    "claude_code": true,
    "codex": true,
    "antigravity": true,
    "windsurf": true,
    "rider": true
  }
}
```

### Disable Specific Tool
```json
{
  "tools": {
    "codex": false
  }
}
```

### Disable Entire Module
```json
{
  "enabled": false
}
```

---

## Setup for New Users

### If You Clone the KB Repo
```bash
git clone git@github.com:imclab/xrai.git ~/Documents/GitHub/Unity-XR-AI
./modules/open-multibrain/sync.sh
# Done. Git hooks handle the rest.
```

### If You Just Read KB (No Clone)
No setup needed. Tools read KB via symlinks or direct path.

---

## Troubleshooting

### Sync Not Running on Commit
```bash
# Check hook is executable
ls -la .git/hooks/post-commit

# Make executable if needed
chmod +x .git/hooks/post-commit
```

### Symlinks Broken
```bash
# Re-run sync
./modules/open-multibrain/sync.sh --force
```

### Tool Not Syncing
Check `config.json` - tool might be disabled.

---

## Performance

- **Zero background processes** - Only runs on git commit
- **<1 second** per sync
- **No system impact** when not committing

---

## Why "open-multibrain"?

- **brain** = AI/intelligence
- **mux** = multiplexer (routes one signal to many outputs)
- **open-multibrain.com** = available domain
- Fits GitHub naming trends (technical, short, memorable)

---

## KB Access Tiers (Team Pattern)

For teams using multiple AI tools, provide three tiers of KB access:

### Tier 1: Bundled (Zero Setup)
```
project/.claude/kb/
├── _QUICK_FIX.md
├── _AUTO_FIX_PATTERNS.md
└── README.md
```
- Included in project repo
- Available immediately on clone
- Essentials only (~100KB)

### Tier 2: Online CDN (Zero Setup, Full KB)
```
Base URL: https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/
```
- No rate limits (jsDelivr CDN)
- ~100ms latency (global caching)
- Full 49-file KB on-demand
- Use WebFetch/curl when needed

**Why jsDelivr over raw.githubusercontent.com:**
- raw.githubusercontent.com: 60 requests/hour limit
- jsDelivr: Unlimited, globally cached, faster

### Tier 3: Local Clone (Optional, Fastest)
```bash
./scripts/dev-setup.sh
# Creates: ~/.claude/knowledgebase/ → Unity-XR-AI/KnowledgeBase/
```
- Fastest access (~1ms)
- Works offline
- Full sync via open-multibrain
- Recommended for power users

### Decision Matrix

| User Type | Recommended Tier |
|-----------|------------------|
| New team member | Tier 1 (bundled) |
| Regular contributor | Tier 2 (online CDN) |
| Daily heavy user | Tier 3 (local clone) |
| Offline/travel | Tier 3 required |

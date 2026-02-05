# brainmux - Cross-Tool AI Sync

**Tags**: #tools #sync #automation #claude #codex #windsurf #antigravity
**Cross-refs**: `GLOBAL_RULES.md`, `AGENTS.md`, `_CROSS_TOOL_ARCHITECTURE.md`
**Domain**: brainmux.com (available)

---

## What Is brainmux?

Single source of truth for multiple AI development tools. Syncs configuration across:

| Tool | Config Location | What's Synced |
|------|-----------------|---------------|
| Claude Code | ~/.claude/ | knowledgebase |
| Codex | ~/.codex/ | AGENTS.md, GLOBAL_RULES.md, knowledgebase |
| Antigravity | ~/.antigravity/ | GLOBAL_RULES.md, knowledgebase |
| Windsurf | ~/.windsurf/ | GLOBAL_RULES.md, knowledgebase |
| Rider | JetBrains MCP | port 63342 |

---

## Architecture

```
Unity-XR-AI/                    (source of truth)
├── GLOBAL_RULES.md       →     ~/GLOBAL_RULES.md     →  all tools
├── AGENTS.md             →     ~/AGENTS.md           →  Codex
├── KnowledgeBase/        →     tool-specific symlinks
└── modules/brainmux/
    ├── config.json             (toggles)
    ├── sync.sh                 (main script)
    └── README.md
```

---

## How It Works

### Automatic (Git Hook)
```
git commit (to GLOBAL_RULES.md, AGENTS.md, or KnowledgeBase/)
    ↓
.git/hooks/post-commit
    ↓
modules/brainmux/sync.sh
    ↓
All tool configs updated (<1 sec)
```

### Manual
```bash
# Run sync
./modules/brainmux/sync.sh

# Check status
./modules/brainmux/sync.sh --status

# Force sync even if disabled
./modules/brainmux/sync.sh --force
```

---

## Configuration

Edit `modules/brainmux/config.json`:

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
./modules/brainmux/sync.sh
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
./modules/brainmux/sync.sh --force
```

### Tool Not Syncing
Check `config.json` - tool might be disabled.

---

## Performance

- **Zero background processes** - Only runs on git commit
- **<1 second** per sync
- **No system impact** when not committing

---

## Why "brainmux"?

- **brain** = AI/intelligence
- **mux** = multiplexer (routes one signal to many outputs)
- **brainmux.com** = available domain
- Fits GitHub naming trends (technical, short, memorable)

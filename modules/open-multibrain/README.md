# open-multibrain

**Single source of truth for multiple AI development tools.**

Sync configuration across Claude Code, Codex, Gemini, Windsurf, Antigravity, Rider, and more.

## Why?

When using multiple AI tools, you end up with:
- Duplicate rules scattered across tool configs
- Inconsistent behavior between tools
- Manual sync headaches

open-multibrain solves this with one config that syncs to all tools.

## Quick Start

```bash
# Sync all tools
./sync.sh

# Check status
./sync.sh --status

# Disable completely
jq '.enabled = false' config.json > tmp && mv tmp config.json
```

## What Gets Synced

| File | Purpose |
|------|---------|
| `GLOBAL_RULES.md` | AI behavior rules for all tools |
| `AGENTS.md` | Codex-compatible agent format |
| `KnowledgeBase/` | Shared knowledge base |

## Supported Tools

| Tool | Config Location | Synced Files |
|------|-----------------|--------------|
| Claude Code | ~/.claude/ | knowledgebase |
| Codex | ~/.codex/ | AGENTS.md, GLOBAL_RULES.md, knowledgebase |
| Antigravity | ~/.antigravity/ | GLOBAL_RULES.md, knowledgebase |
| Windsurf | ~/.windsurf/ | GLOBAL_RULES.md, knowledgebase |
| Rider | JetBrains MCP | port 63342 |

## Configuration

Edit `config.json`:

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

### Toggle Module

```bash
# Disable
jq '.enabled = false' config.json > tmp && mv tmp config.json

# Enable
jq '.enabled = true' config.json > tmp && mv tmp config.json

# Force sync even when disabled
./sync.sh --force
```

### Toggle Specific Tools

```json
{
  "tools": {
    "codex": false
  }
}
```

## Auto-Sync

Git post-commit hook auto-syncs when these files change:
- `GLOBAL_RULES.md`
- `AGENTS.md`
- `KnowledgeBase/*`

Disable: Set `"auto_sync_on_commit": false`

## Architecture

```
repo/                           (source of truth)
├── GLOBAL_RULES.md       →     ~/GLOBAL_RULES.md     →  all tools
├── AGENTS.md             →     ~/AGENTS.md           →  Codex
├── KnowledgeBase/        →     tool-specific symlinks
└── modules/open-multibrain/
    ├── config.json             (toggles)
    ├── sync.sh                 (main script)
    └── README.md
```

## License

MIT

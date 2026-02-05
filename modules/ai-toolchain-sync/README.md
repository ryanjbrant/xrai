# AI Toolchain Sync Module

Cross-tool configuration sync for AI development environments.

## Quick Start

```bash
# Enable (default)
./sync.sh

# Disable completely
echo '{"enabled": false}' > config.json
```

## What It Does

Syncs these files from Unity-XR-AI repo to all AI tools:
- `GLOBAL_RULES.md` → AI behavior rules
- `AGENTS.md` → Codex-compatible format
- `KnowledgeBase/` → Shared knowledge base

## Supported Tools

| Tool | Config Location | What's Synced |
|------|-----------------|---------------|
| Claude Code | ~/.claude/ | knowledgebase symlink |
| Codex | ~/.codex/ | AGENTS.md, GLOBAL_RULES.md, knowledgebase |
| Antigravity | ~/.antigravity/ | GLOBAL_RULES.md, knowledgebase |
| Windsurf | ~/.windsurf/ | GLOBAL_RULES.md, knowledgebase |
| Rider | JetBrains MCP | port 63342 (manual config) |

## Toggle On/Off

```bash
# Check status
cat config.json | jq .enabled

# Disable
jq '.enabled = false' config.json > tmp && mv tmp config.json

# Enable
jq '.enabled = true' config.json > tmp && mv tmp config.json
```

## Per-Tool Toggle

Disable specific tools in `config.json`:
```json
{
  "tools": {
    "codex": false  // Disable Codex sync only
  }
}
```

## Auto-Sync

Git post-commit hook auto-runs sync when `GLOBAL_RULES.md`, `AGENTS.md`, or `KnowledgeBase/` changes.

Disable: Set `"auto_sync_on_commit": false` in config.json

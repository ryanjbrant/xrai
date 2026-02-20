# Laptop Setup & Recovery: jamestunick

**Priority:** High
**Context:** Enable remote management, auto-restart, and cross-CLI KB access on `jamestunick` laptop.

## 1. Auto-Restart Configuration (Self-Healing)

If OpenClaw becomes unresponsive, it should automatically restart. Run this on your laptop:

```bash
# 1. Install OpenClaw as a user service (LaunchAgent on macOS)
openclaw gateway install

# 2. Verify it's running
openclaw gateway status

# 3. (Optional) Create a watchdog cron for hard freezes
# Add to crontab -e:
# */5 * * * * curl -s -o /dev/null http://localhost:18789/health || openclaw gateway restart
```

## 2. Node Pairing (Remote Management)

To allow remote commands from Discord/#portals-production-log:

```bash
# 1. Start the node service
openclaw node start --id jamestunick --tags "dev,laptop"

# 2. Link to your user account (if not auto-detected)
openclaw auth login
```

## 3. Cross-CLI KnowledgeBase Access

Ensure Claude Code, Codex, and Gemini all share this KnowledgeBase:

```bash
# 1. Symlink the XRAI KnowledgeBase to Claude's config
ln -sf ~/Repos/xrai/KnowledgeBase ~/.claude/knowledgebase

# 2. Verify visibility
claude "Check my knowledgebase for the 'openclaw-dev' skill and list the setup steps"
```

## 4. Universal Global Rules

Ensure these rules apply to all sessions:
- **Leverage-First**: Check KB before coding.
- **Token Optimization**: Concise outputs.
- **Compound Learning**: Log new patterns to `xrai/KnowledgeBase`.

*Run via Claude Code: `claude "Execute the setup steps in todo-jamestunick-laptop-setup.md"`*
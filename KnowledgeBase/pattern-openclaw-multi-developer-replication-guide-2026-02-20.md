---
name: openclaw-replication
description: OpenClaw multi-developer setup replication guide. Use when onboarding new developers, setting up additional OpenClaw instances, or replicating the current architecture without conflicts.
---

# OpenClaw Multi-Developer Replication Guide

**Date:** 2026-02-20  
**Source:** James Tunick replication request  
**Scope:** Full architecture for replicating multi-dev OpenClaw setup  
**Analyzes:** Ryan Brant's current configuration

## 1. Core Skills (4 skills, spec-kit compliant)

Location: `~/.nvm/versions/node/v25.6.1/lib/node_modules/openclaw/skills/`

| Skill | Tokens | Purpose |
|-------|--------|---------|
| xrai-master | 238 | Entry point, coordinates all tasks |
| xrai-kb | 160 | KB management, auto-push with access detection |
| openclaw-dev | 184 | Gateway config, multi-dev tokens, monitoring |
| cross-cli | 152 | Multi-agent (Claude/Codex/Gemini) coordination |

## 2. Configuration Files

### ~/.openclaw/openclaw.json
```json
{
  "gateway": {
    "port": 18789,
    "tailscale": {"mode": "off"}
  },
  "channels": {
    "discord": {"enabled": true},
    "telegram": {"enabled": true}
  }
}
```

### ~/Repos/xrai
- Local clone of github.com/imclab/xrai
- All KB entries: KnowledgeBase/
- Auto-read by skills on activation

### ~/.openclaw/workspace/
- GLOBAL_RULES.md (auto-restart policy)
- SKILLS.md (registry)
- memory/ (ephemeral notes)

## 3. Replication Steps (New Developer)

```bash
# 1. Install OpenClaw
npm install -g openclaw

# 2. Configure
cd ~ && openclaw configure --workspace .openclaw

# 3. Clone KB
git clone https://github.com/imclab/xrai.git Repos/xrai

# 4. Verify structure
ls -la ~/.openclaw/
ls -la ~/Repos/xrai/KnowledgeBase/

# 5. Request token from admin
export OPENCLAW_TOKEN="dev_token"

# 6. Start node
openclaw node start --id <name> --tags "dev"

# 7. Verify
openclaw status
```

## 4. Conflict Prevention

| Mechanism | Implementation |
|-----------|----------------|
| Token scoping | admin/write/read scopes per dev |
| KB locking | xrai-kb auto-merge on conflicts |
| Gateway isolation | Each laptop: independent gateway |
| Channel routing | Specific channels → specific nodes |
| Context limits | Skills enforce <300 tokens |

## 5. Network Architecture

```
Dev Laptops (jamestunick, ben, ash)
├── OpenClaw Gateway (port 18789)
├── Skills (xrai-*, openclaw-dev, cross-cli)
├── KB: ~/Repos/xrai
└── Node: openclaw node start --id <name>

        ↕ Tailscale/WiFi

Ryan's MacBook (coordinator)
├── Discord/Telegram integration
├── Approval workflow for PRs
└── Token management
```

## 6. Global Rules Applied

1. **Leverage-first**: Check KB before coding
2. **Token optimization**: <300 tokens per skill
3. **Compound learning**: Auto-extract patterns
4. **Emergency override**: >15min stall → simplify
5. **Auto-restart**: Gateway watchdog via launchd

## 7. Key Commands

```bash
# Add KB entry
xrai-kb-add --type bug --title "Issue" --source "Logs"

# Check status
xrai-kb-status

# Setup dev
openclaw-dev-setup --mode team --developers ryan,ben,james

# Swarm status
xrai-master-status
```

## 8. Health Settings

- Heartbeat: 60s
- Max concurrent: 3 agents
- Context pruning: 5m TTL
- Auto-backoff: On 503s

## 9. Security

- Tailscale for zero-trust mesh
- Token-based auth with scopes
- No secrets in repo
- Channel allowlists

## 10. Files to Copy

From coordinator machine:
- `~/.openclaw/openclaw.json` (templates)
- `~/.nvm/.../openclaw/skills/*/SKILL.md` (4 skills)
- `~/Repos/xrai/KnowledgeBase/*` (full repo via git)

---

*Replication guide for multi-developer OpenClaw setup*  
*Spec-kit compliant, conflict-free architecture*
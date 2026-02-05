# KB Automation - Simple Approach

**Philosophy**: No background daemons. Git hooks + on-demand scripts only.

---

## How It Works

| Trigger | What Runs | Impact |
|---------|-----------|--------|
| `git commit` | open-multibrain sync | <1 sec |
| Manual `kb-audit` | Health check | ~30 sec |
| AI session | Improvements | Zero extra |

**No background processes. No system slowdown.**

---

## Setup (One Time)

```bash
# Clone repo
git clone git@github.com:imclab/xrai.git ~/Documents/GitHub/Unity-XR-AI

# Run sync once
./modules/open-multibrain/sync.sh

# Done. Git hooks handle the rest.
```

---

## On-Demand Commands

```bash
# Health check
./KnowledgeBase/KB_AUDIT.sh

# Manual sync to all AI tools
./modules/open-multibrain/sync.sh

# Check sync status
./modules/open-multibrain/sync.sh --status
```

---

## What Happens Automatically

### On Git Commit (via hook)
- Syncs GLOBALGLOBAL_RULES.md to all AI tools
- Syncs AGENTS.md to Codex
- Updates KB symlinks

### During AI Sessions
- AI tools read KB directly (no daemon needed)
- Improvements happen in-session
- Discoveries logged to LEARNING_LOG.md

---

## FAQ

**Q: Do I need background daemons?**
A: No. Git hooks trigger on commit. AI tools read KB live.

**Q: What about auto-updating GitHub trends?**
A: AI tools can update during sessions when relevant. No daemon needed.

**Q: What if I want scheduled tasks?**
A: Use cron for specific needs:
```bash
# Optional: Daily audit at 6am
0 6 * * * ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/KB_AUDIT.sh
```

---

## Architecture

```
Git commit
    ↓
post-commit hook
    ↓
open-multibrain/sync.sh
    ↓
Updates: ~/.claude/, ~/.codex/, ~/.antigravity/
```

**Zero background processes. Zero system impact.**

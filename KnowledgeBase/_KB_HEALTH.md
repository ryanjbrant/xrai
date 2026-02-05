# KB Health & Auto-Improve

**Version**: 1.0 | **Updated**: 2026-02-05

One file. Universal. Works everywhere.

---

## Core Loop (ALL TOOLS)

```
1. ERROR → Check _QUICK_FIX.md → Apply fix
2. SUCCESS (first try) → Log pattern to LEARNING_LOG.md
3. FAILURE (3+ attempts) → Log to LEARNING_LOG.md + try alternative
4. NEW PATTERN → Add to _QUICK_FIX.md
```

---

## Auto-Log Triggers

| Event | Action |
|-------|--------|
| Fix works first try | Append to LEARNING_LOG.md |
| Fix takes 3+ attempts | Log failure + what worked |
| New error type solved | Add to _QUICK_FIX.md |
| Performance win >30% | Log with metrics |
| KB file outdated | Note in LEARNING_LOG.md |

**Log Format**:
```markdown
## YYYY-MM-DD: Brief Title
- **Context**: What was happening
- **Fix/Pattern**: What worked
- **Impact**: Time saved, errors prevented
```

---

## Quick Health Check (Any Tool)

```bash
# 1. Index accuracy (should list 55+ files)
wc -l < KnowledgeBase/_KB_INDEX.md

# 2. Recent activity (should have recent dates)
head -20 KnowledgeBase/LEARNING_LOG.md

# 3. Quick fix coverage (should have 100+ entries)
grep -c "^|" KnowledgeBase/_QUICK_FIX.md
```

---

## Universal Access (No Local Setup)

**CDN** (any HTTP client):
```
https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/_QUICK_FIX.md
```

**curl**:
```bash
curl -sf https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/_QUICK_FIX.md
```

**In AI Tools**:
```
WebFetch("https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/_QUICK_FIX.md")
```

---

## File Purposes (Simplified)

| File | Purpose | Size Target |
|------|---------|-------------|
| `_QUICK_FIX.md` | Error→Fix lookup | <500 lines |
| `_KB_INDEX.md` | Navigate KB | <150 lines |
| `LEARNING_LOG.md` | Discoveries | Append-only |
| `_KB_HEALTH.md` | This file | <100 lines |

Everything else: Reference material (read when needed).

---

## Auto-Maintenance

**Daily** (automated via git hooks or cron):
- Verify _KB_INDEX.md matches actual files
- Check LEARNING_LOG.md has recent entries
- Ensure CDN cache is fresh (<24h)

**On Error**:
- Search _QUICK_FIX.md first (instant)
- Search _AUTO_FIX_PATTERNS.md for details
- Log solution to LEARNING_LOG.md

**On Success**:
- If novel pattern: Add to _QUICK_FIX.md
- If significant: Log to LEARNING_LOG.md

---

## Integration Checklist

| Tool | Access Method | Status |
|------|---------------|--------|
| Claude Code | Local symlink | ✅ |
| Codex | CDN fetch | ✅ |
| Windsurf | CDN fetch | ✅ |
| Cursor | Local or CDN | ✅ |
| Rider AI | JetBrains MCP | ✅ |
| Any CLI | curl CDN | ✅ |

---

**Principle**: Keep it simple. One loop. Universal access. Auto-log wins.

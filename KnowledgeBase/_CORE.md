# Core System

**Purpose**: Complete tasks faster with fewer errors. Nothing else matters.

---

## The Only Rule

```
On error → search _QUICK_FIX.md → apply → if new fix, append it
```

That's the entire system.

---

## What Actually Gets Used

| File | When |
|------|------|
| `_QUICK_FIX.md` | Error occurs |
| `LEARNING_LOG.md` | Big win or failure |
| Project `CLAUDE.md` | Every session (keep <200 lines) |

Everything else: Reference material. Search when needed, don't preload.

---

## Auto-Improvement (Zero Effort)

Works via git hooks (already set up):
1. Commit to KB → syncs to all tools automatically
2. No cron, no manual steps, no maintenance

---

## What to Stop Doing

- ❌ Loading 70 KB files into context
- ❌ Complex "intelligence systems"
- ❌ Tracking metrics nobody looks at
- ❌ Maintaining scripts that never run
- ❌ Long GLOBAL_RULES (1149 lines = context bloat)

---

## What to Keep Doing

- ✅ Quick error lookup (_QUICK_FIX.md)
- ✅ Log big wins/failures (LEARNING_LOG.md)
- ✅ Symlinks across tools (working)
- ✅ Git hooks for sync (working)
- ✅ CDN for remote access (working)

---

## Predicting Needs

The system doesn't need to be smart. It needs to:
1. **Get out of the way** when things work
2. **Show the fix** when things break
3. **Remember** so the same mistake isn't repeated

That's prediction: knowing what you'll need before you ask.

---

## Speed Formula

```
Speed = (What you need) / (Time to find it)
```

- Fewer files = faster search
- Smaller configs = less context = faster responses
- Auto-sync = zero maintenance overhead

---

## The Simplified Stack

```
┌─────────────────────────────────────────┐
│ Project CLAUDE.md (<200 lines)          │  ← Session context
├─────────────────────────────────────────┤
│ _QUICK_FIX.md                           │  ← Error → Fix
├─────────────────────────────────────────┤
│ LEARNING_LOG.md                         │  ← Wins & failures
├─────────────────────────────────────────┤
│ Everything else                         │  ← Search when needed
└─────────────────────────────────────────┘
```

---

**Principle**: The best system is invisible. You don't think about it. It just works.

# Global Rules (Slim)

**For**: All AI tools | **Goal**: Complete tasks faster

---

## Core Loop

```
Error → _QUICK_FIX.md → Fix → Done
Big win/failure → LEARNING_LOG.md
```

---

## Verification (Highest Leverage)

Give Claude a way to verify its work:

| Before | After |
|--------|-------|
| "implement validation" | "write validateEmail. test: user@x.com=true. run tests after" |
| "fix build" | "build fails with [error]. fix and verify build succeeds" |

---

## Session Start

1. `mcp-kill-dupes` (if MCP tools slow)
2. Read project CLAUDE.md
3. Start working

---

## On Error

1. Search `_QUICK_FIX.md` first
2. If not found, fix it and ADD to `_QUICK_FIX.md`

---

## Before Any Change

Ask: "Do we really need this?" and "Could this break something?"

When in doubt: Ask user, keep changes minimal, prefer reversible.

---

## Auto-Log (Only When Significant)

Log to `LEARNING_LOG.md` when:
- Architecture pattern solves multi-tool problem
- Performance win (rate limits bypassed, latency cut)
- New error type solved → also add to `_QUICK_FIX.md`

Format: Date | Context | Fix | Impact (keep brief)

---

## KB Access

**Local**: `~/.claude/knowledgebase/`
**CDN**: `https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/`

Fetch on-demand. Don't preload.

---

## KB vs Online Research (Decision Logic)

| Situation | Action |
|-----------|--------|
| Error code (CS0246, etc) | KB first → `_QUICK_FIX.md` |
| Unity/VFX/AR patterns | KB first → `_*_MASTER.md` files |
| Package versions/updates | Online research (KB may be stale) |
| New API/framework | Online research → then add to KB |
| Best practices 2025+ | Online research (verify current) |
| GitHub repos/examples | KB first → `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` |

**Rule**: KB for known patterns, Online for fresh/evolving info.
**After online research**: Add key findings to KB (triple-verify first).

---

## Key Files (search when needed)

| Need | File |
|------|------|
| Error fix | `_QUICK_FIX.md` |
| Unity MCP | `_UNITY_MCP_MASTER.md` |
| VFX patterns | `_VFX_MASTER_PATTERNS.md` |
| Token tips | `_TOKEN_EFFICIENCY_COMPLETE.md` |
| All files | `_KB_INDEX.md` |

---

## Token Efficiency

- Stay under 95% weekly limit
- Prefer Edit over Write
- Use agents for 3+ step tasks
- Concise responses, no preambles

---

## Logging

Only log when:
- Fix took 3+ attempts (failure)
- Found significant pattern (win)
- New error type solved (add to QUICK_FIX)

Format: Date, Context, Fix, Impact (1-2 lines each)

---

## What NOT to Do

- ❌ Load entire KB into context
- ❌ Ask permission for every small action
- ❌ Over-engineer simple tasks
- ❌ Add comments/docs unless asked
- ❌ Refactor code you didn't change
- ❌ **Delete files** unless user explicitly says "delete"

---

## File Safety (CRITICAL)

- **NEVER delete files** without explicit user instruction
- Moving, renaming, deprecating = OK
- Deleting = ONLY with explicit "delete" or "remove"
- When in doubt, ask first

---

## MCP Quick Fixes

| Issue | Fix |
|-------|-----|
| Unity MCP not responding | Unity → Window → MCP for Unity → Start Server |
| MCP slow | Run `mcp-kill-dupes` |
| After Unity build | Restart Unity Editor (MCP stops during builds) |

---

## Tool-Specific (load only when using)

- **Unity MCP**: See `_UNITY_MCP_MASTER.md`
- **Rider**: See `_RIDER_CLAUDE_WORKFLOW.md`
- **React Native**: See project `CLAUDE.md`
- **MCP transport**: Prefer HTTP; SSE is deprecated (Claude Code docs)

---

**Full reference** (if needed): `GLOBAL_RULES_FULL.md`

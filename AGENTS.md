# AGENTS.md - Cross-Tool AI Rules

**Version**: 1.0 | **Updated**: 2026-02-05
**Compatibility**: Codex, Claude Code, Gemini, Windsurf, Antigravity, Rider

---

## Core Loop
```
Search KB → Plan → Code → Commit → Log discovery
```

## Session Start Check (Quiet)
- If `GLOBAL_RULES.md` is missing **and** it blocks the task **or** it will with 98% confidence speed up, improve accuracy, save tokens, or otherwise help the developer task, ask once at session start.

## Session Start Defaults (No Prompt)
- Defaults: `toolchain=auto-detect`, `scope=project-only`, `verbosity=concise`.
- Only ask if user explicitly requests global sharing.

## Insight Prompt (Low Friction)
- If a key insight is confirmed (99% confidence + evidence), **ask once at end of session** to log it.
- Keep it one-line. If user declines, do not ask again that session.
- **Web research**: If key insight comes from web sources, log it to KB with citations/links.

## KnowledgeBase Access (Default)
- **Read access**: ON by default (use KB for answers).
- **Write/commit/PR**: ONLY when a key insight is confirmed (99% confidence + evidence).

## Before Any Change
1. **Need it?** Check KB for existing solution
2. **Side effects?** Keep changes minimal, reversible

## Tool Selection
| Task | Tool | Why |
|------|------|-----|
| Implementation | Claude Code | MCP, subagents |
| Research | Gemini/Antigravity | 1M context free |
| Quick edits | Windsurf | Fast Cascade |
| Navigation | Rider | JetBrains MCP |
| Code gen | Codex | AGENTS.md native |

## Quick Commands
- `kb "term"` - Search knowledgebase
- `kbfix "error"` - Error→fix lookup
- `/clear` - Reset context between tasks
- `/compact` - Shrink context

## Token Rules
- Stay <95% weekly limit
- Use agents for 3+ step tasks (independent budgets)
- Parallel tool calls when possible
- Edit over Write (smaller diffs)

## Output Mode (All CLIs)
- **Default**: concise, no structured schema, no reasoning output.
- **On-demand**: enable structured output + reasoning for PR reviews, CI, incident fixes, specs, audits, or automation.

## OpenAI Docs MCP
- For OpenAI/Codex questions, consult the `openaiDeveloperDocs` MCP server first.

## Anti-Patterns
- Writing code without searching KB first
- Duplicating existing utilities
- Over-engineering simple tasks
- Ignoring verification criteria

## KnowledgeBase
Location: `~/KnowledgeBase/`
- `_QUICK_FIX.md` - Error fixes
- `_VFX_MASTER_PATTERNS.md` - VFX patterns
- `_TOKEN_EFFICIENCY_COMPLETE.md` - Token optimization
- `LEARNING_LOG.md` - Session discoveries

## Session Management
- Commit before `/clear`
- Name sessions with `/rename`
- Resume with `--continue` or `--resume`

---
See `GLOBAL_RULES.md` (repo root) or `~/GLOBAL_RULES.md` for full rules.

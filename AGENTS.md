# AGENTS.md - Cross-Tool AI Rules

**Version**: 1.1 | **Updated**: 2026-02-08
**Compatibility**: Codex, Claude Code, Gemini, Windsurf, Antigravity, Rider

---

## Core Loop
```
Search KB → Plan → Code → Verify → Log discovery
```

## Session Start Check (Quiet)
- If `GLOBAL_RULES.md` is missing and clearly blocks task quality/speed, ask once at session start.

## Session Start Defaults (No Prompt)
- Defaults: `toolchain=auto-detect`, `scope=project-only`, `verbosity=concise`.
- Only ask if user explicitly requests global sharing.

## Insight Prompt (Low Friction)
- If a key insight is confirmed (high confidence + evidence), ask once at end of session to log it.
- Keep it one-line. If user declines, do not ask again that session.
- Web-derived insights should be logged with citations/links.

## KnowledgeBase Access (Default)
- Read access: ON by default (use KB for answers).
- KB write/commit/PR: only when a key insight is confirmed (high confidence + evidence).
- Code edits: proceed as requested by the active task.

## Before Any Change
1. Need it? Check KB for an existing pattern
2. Side effects? Keep changes minimal and reversible

## Boris Cherny Defaults (Applied)
- Use highest-capability model tier available for complex coding tasks.
- Use git worktrees for parallel tasks (`wtnew`, `wtls`, `wtrm`).
- Use reusable commands/skills for repeat workflows instead of re-prompting each session.
- Use automatic lint/test failure follow-up hooks where the tool supports hooks.
- Use voice for planning/review where the client supports voice.

## Tool Selection
| Task | Tool | Why |
|------|------|-----|
| Implementation | Claude Code / Codex | Strong agentic coding + MCP |
| Research | Gemini/Antigravity | Very large context |
| Quick edits | Windsurf/Cursor | Fast IDE loop |
| Navigation | Rider | JetBrains indexed search |
| OpenAI/Codex docs | openaiDeveloperDocs MCP | Primary source |

## Quick Commands
- `kb "term"` - Search knowledgebase
- `kbfix "error"` - Error→fix lookup
- `/clear` - Reset context between unrelated tasks (tool-specific)
- `/compact` - Shrink context (tool-specific)

## Token Rules
- Stay <95% weekly limit
- Use agents for 3+ step tasks (independent budgets)
- Parallelize independent tool calls
- Edit over Write (smaller diffs)

## Output Mode (All CLIs)
- Default: concise, no unnecessary structure.
- On-demand: structured output for PR reviews, CI, incident fixes, specs, audits, automation.

## OpenAI Docs MCP
- For OpenAI/Codex questions, consult the `openaiDeveloperDocs` MCP server first.

## Toolchain Deltas (Official Docs)
- Codex: use `.agents/skills` (repo/user/admin/system skill discovery) for reusable skills.
- Codex: project-scoped `.codex/config.toml` loads only when folder/project is trusted.
- Codex: use `web_search`/`--search` settings for live web retrieval.
- Claude Code: prefer HTTP MCP transport; SSE is deprecated.

## Anti-Patterns
- Writing code without checking KB when a known pattern likely exists
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
- Commit or checkpoint before `/clear`
- Name sessions with `/rename`
- Resume with `--continue` or `--resume`

---
See `GLOBAL_RULES.md` (repo root) or `~/GLOBAL_RULES.md` for full rules.

## PARAMOUNT: Cross-Tool Rule Drift (Major Recurring Issue)
- This is a recurring failure mode: "always remember" and KB-first instructions drift across tools.
- Treat this as P0 process breakage.
- Required at session start and after context compaction/new thread:
1. Read `~/GLOBAL_RULES.md`
2. Read `<project>/CLAUDE.md`
3. Read `~/KnowledgeBase/_KB_INDEX.md`
4. Read `~/KnowledgeBase/_KB_ACCESS_GUIDE.md`
5. Confirm Codex/Claude/Gemini rule files still contain this same section
6. Run `~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh --dry-run`
- If any are missing or out of sync, sync rules first, then continue implementation.

## KB Access Is Non-Optional
- KB access must be automatic for all agents and developers (Claude, Codex, Gemini, Rider, Cursor, Windsurf).
- If user asks about KB, offer a quick tour and example searches immediately.
- Prefer no-daemon scheduling: use on-demand runs or cron (every 1-12 hours).
- Reference: `~/KnowledgeBase/_AUTOMATED_ORG_LIBRARIAN_GUIDE.md`.

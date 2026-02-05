# AGENTS.md - Cross-Tool AI Rules

**Version**: 1.0 | **Updated**: 2026-02-05
**Compatibility**: Codex, Claude Code, Gemini, Windsurf, Antigravity, Rider

---

## Core Loop
```
Search KB → Plan → Code → Commit → Log discovery
```

## Session Start Check
- If `GLOBAL_RULES.md` is not loaded in context, ask the user to load it now.

## Session Start Choices (Ask Once)
- Defaults (auto): `toolchain=auto-detect`, `scope=current repo`, `verbosity=concise`.
- Ask only: **Global or project‑only rules/memory?** (default: project‑only)
- Example: `project‑only` or `global`

## Insight Prompt (When 99% Confidence + Evidence)
- If a breakthrough, repeated failure, or notable improvement is confirmed, ask to log it:
  - Local: `docs/dev/<username>/`
  - Global KB: PR to `Unity-XR-AI` (branch + evidence + cross-refs)

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

## OpenAI Docs MCP
- For OpenAI/Codex questions, consult the `openaiDeveloperDocs` MCP server first.

## Anti-Patterns
- Writing code without searching KB first
- Duplicating existing utilities
- Over-engineering simple tasks
- Ignoring verification criteria

## KnowledgeBase
Location: `~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/`
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

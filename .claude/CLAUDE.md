# Claude Code Configuration

**Primary Rules**: `~/GLOBAL_RULES.md` (shared across all AI tools)

## Startup (MANDATORY - Run at session start)
1. **CRITICAL**: Run `mcp-kill-dupes` immediately at session start (prevents resource waste + connection conflicts)
2. If Rider open: prefer JetBrains MCP tools over raw Grep/Glob/Read
3. Read `~/.claude/user-context.md` — contains active projects, current priorities, and key facts about the user's workflow. Never assume project context without checking this first.

## Token Efficiency
Inherits `~/GLOBAL_RULES.md §Pre-task validation (mandatory, every dev task)` + `§Token efficiency (mandatory, all tools)`. Claude Code specifics:
- Target <100K tokens per session. Warn user at 80%.
- Never run out before weekly reset — switch to Sonnet or end session early.
- **Delegate 3+ step fix/debug loops to Task agents** (they have independent budgets). Example: Jest config debugging, lint-fix cycles, build error chains.
- **Use `model: "haiku"` on Task agents** for mechanical work (grep, config fixes, test reruns).
- **Use Explore agent** instead of manual Grep/Glob rounds for open-ended codebase questions.
- Edit over Write. Parallel tool calls. Concise responses.
- Read targeted line ranges (`offset`/`limit`) when you know the area — never full-file re-reads.
- .claudeignore saves 180K+ tokens for Unity projects.

## Model Routing
- Deep/critical debugging or architecture: Opus.
- Standard implementation: Sonnet.
- Quick/mechanical checks: Haiku or Sonnet.

## On Error
Check `~/KnowledgeBase/_QUICK_FIX.md` first. If fix works, done. If new pattern found, append to that file.

## Core Loop
Change → Verify (tests/lint/build/console) → Document. Never update docs/specs/TODO/KB until changes are triple-verified working.

## Auto-Implement (Mandatory)
**Never just document an optimization — implement it.** If KB/research reveals a workflow improvement, build the script/hook/config change in the same session. Prose-only learnings are waste. Prefer zero-token automation (shell scripts, git hooks, CLI wrappers) over in-session AI work for repeatable tasks.

## Knowledgebase
Location: `~/.claude/knowledgebase/` (symlink to `~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/`)
- `_QUICK_FIX.md` — Error-to-fix lookup (check first)
- `_AUTO_FIX_PATTERNS.md` — Extended patterns
- `LEARNING_LOG.md` — Append discoveries here
- `_KB_INDEX.md` — Navigate all KB files

**Zero-Token KB Commands** (shell — no AI tokens):
```bash
kb search "topic"     # Search all KB files
kb quick "error"      # Quick fix lookup
kbfix "CS0246"        # Quick fix lookup (shell function)
kbtag "vfx"          # Pattern tag search
ss / ssu             # Screenshot (device / Unity window)
```

## Boris Best Practices (Auto-Implement)
1. **Re-plan when stuck**: If 2 consecutive tool calls fail, switch to plan mode before continuing
2. **Self-improving CLAUDE.md**: After any correction, end with "Write a rule in CLAUDE.md preventing this"
3. **Build skills**: If you do something >1x/day, suggest converting to skill
4. **Autonomous bug fixing**: Given symptoms (logs/errors/CI), own investigation-to-fix pipeline - don't wait for diagnosis
5. **Zero-token first**: Use `kb search`, `kbfix`, shell commands before AI tools

## Proactive Learning (Boris Pattern)
- After repeated failures (2+ attempts): pause, re-plan, suggest different approach
- After any correction: "Write a rule preventing this mistake"

## Session Memory
Before `/clear`, `/compact`, or at ~100K tokens, save progress to:
`~/.claude/session_memories/<project>-<date>.md`
Format: Accomplished / Current State / Next Steps / Key Decisions

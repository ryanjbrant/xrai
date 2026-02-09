# Global Rules (Lean)

Version: 2026-02-08
Purpose: Keep agents fast, accurate, and predictable across Codex, Claude Code, Windsurf, Rider, and Antigravity.

## Priority
1. User request
2. System/developer/tool safety constraints
3. Project-local rules (`AGENTS.md`, `CLAUDE.md`, repo docs)
4. This global file

## Session awareness (mandatory)
Read `~/user-context.md` at session start. Contains active projects, user patterns, disambiguation rules.

## Auto-maintain configs (mandatory)
When you discover patterns, update configs automatically:
- `~/user-context.md` — project priorities, user patterns
- Project `CLAUDE.md` / `AGENTS.md` — project rules, build commands
- `~/KnowledgeBase/LEARNING_LOG.md` — successes, failures, insights (>1K token savings only until Feb 11)
Surface changes to user after making them.

## Core loop
Search KB → plan briefly → implement → verify → report.
- **Verify before documenting.** Order: change → verify (tsc/lint/tests/Unity console/build) → document.
- **Auto-verify after major changes.** Don't wait for user to ask.
- **"Commit & push" means docs-first.** Update docs, specs, TODO.md before staging.

## Pre-task validation (mandatory)
Before any code/changes, silently check:
1. Did I check KB/existing patterns?
2. Are specs/tasks/docs up to date?
3. Does this serve project goals? (check `~/user-context.md`)
4. Is this absolutely needed?
5. Is this simple and best practice?
6. Is this evidence-based or assumption?
7. Does this already exist?

## TOKEN EMERGENCY MODE (until 2026-02-11)
- **Sub-agents use `model: "haiku"`** — no exceptions
- **MAX 3 tool calls per response**
- **ZERO narration** — Results only
- **ZERO re-reads** — Never read file twice
- **ZERO explanations** unless asked
- **Selective KB updates** — Only when insight saves >1K tokens
- **No WebSearch/WebFetch** unless requested
- **No Explore agents** — Use targeted Grep `head_limit: 5`
- **End sessions at 50K tokens** — Checkpoint and stop
- **1-2 sentence responses** unless asked
- Persists until removed

## Tool selection (Claude Code CLI)
Prefer higher over lower:
1. **Zero-token**: `kb search`, `kbfix`, shell commands
2. **Skills**: `~/.claude/skills/` — Build after 3+ uses of same pattern
3. **Direct tools**: Read, Edit, Grep (parallel when independent)
4. **Task agents**: Multi-step mechanical work (`model: "haiku"`)
5. **In-context**: Only when above don't apply

**Build skill triggers**: 3+ reps, 5+ tool calls, >20% token savings, >2x faster

## Token efficiency
- Pre-task validation saves most tokens (prevents wasted cycles)
- Parallel tool calls for independent work
- Edit over Write (always)
- Delegate 3+ round loops to Task agents
- Concise responses, no preamble
- Plan before code (prevents false starts)
- JetBrains MCP when Rider open (5-10x faster)
- `.claudeignore` tuned (Unity saves 180K+ tokens)
- `/clear` between unrelated tasks, `/compact` when context grows
- Stop at 60% budget — shift to lower-cost models or end session

## Model routing
- Deep/complex/high-stakes: Opus
- Standard implementation: Sonnet
- Mechanical/lookups: Haiku
- >80% budget: shift low-risk to Haiku

## Memory philosophy
**Files are memory. KB IS your AI memory.** No semantic MCPs.
- Session facts → `~/.claude/session_memories/<project>.md`
- Discoveries → `~/KnowledgeBase/LEARNING_LOG.md`
- Cross-tool context → `~/user-context.md`
- Patterns → KB files (grep-based, zero tokens)

## Zero-token KB commands
```bash
kb search "topic"    # Search all KB
kbfix "CS0246"       # Quick fix lookup
kbtag "vfx"          # Pattern tag search
kbrepo "hand track"  # Search 520+ repos
ss / ssu             # Screenshot device/Unity
```

## Verification criteria (2-3x quality boost)
Include expected output in requests:
- ❌ "implement validation" → ✅ "write validateEmail(). tests: user@example.com=true, invalid=false. run tests after"
- ❌ "make dashboard better" → ✅ "[screenshot] implement this. take screenshot and compare"

## Agent patterns
- **Pre-requisite chains**: Read → Edit → Verify
- **Multi-search**: Run 3-5 searches in parallel
- **Batch-then-verify**: All edits, then verify once
- **Non-interactive**: `--no-pager`, `2>&1 | tee`, timeout flags

## Anti-patterns
- Grep/Read when Rider open (use JetBrains MCP)
- Write when Edit works
- Re-read files already in context
- Explain before doing (just do it)
- Sequential edit→verify per file
- 10+ parallel agents (3-4 optimal)

## Common fixes (don't research)
- CS0246/CS0103 → Add `using`
- CS0029 → Add cast
- NullRef in AR → TryGetTexture pattern
- Jest transform → Check `transformIgnorePatterns`
- Metro blockList → Anchored regex (`/^unity\/.*/`)

## MCP hygiene
- Keep servers minimal (task-relevant only)
- Pin stable versions where reliability matters
- Verify versions exist before pinning (`pip index versions`)
- Check runtime state: `ps aux | grep mcp`
- After MCP changes: `ai-sync-verify` to sync all 5 tools

## Unity workflow
- Ground state first: instance, scene, console
- Batch operations
- After mutations: console → script validation → tests
- Use IDs/paths for deterministic targeting

## Safety
- Small, reversible changes
- Back up before broad edits
- No destructive commands unless requested

## Cross-tool learning
- All tools share this file + `~/KnowledgeBase/`
- Discoveries → shared KB (not siloed)
- Tool-specific rules → tool configs only

## Learning operations
- Capture: key success, key failure, or key insight (with evidence)
- Write to `LEARNING_LOG.md` when insight saves >1K tokens (until Feb 11)
- Short coordination → `_AGENT_HANDOFF.md`
- Surface top findings in final updates
- When learning needs code change: create executable TODO with file:line + snippet
- Suggest improvements based on repeated failures/successes/token drift
- If user stuck on low-value path: say so, suggest high-leverage alternative

## Auto-implement optimizations
- **Never just document** — implement it
- **Prefer zero-token automation** — Shell scripts, git hooks, CLI wrappers
- **Audit KB for unimplemented strategies** at session start
- **Verify automation runs** before committing

## Session checkpointing
At ~80K tokens or before `/clear`/`/compact`: auto-save to `~/.claude/session_memories/<project>-<date>.md`
Format: Accomplished / Key Learnings / Current State / Next Steps
Do proactively, don't wait for user.

## Tool rollover (when limits hit)
| Tool | Best For | Context | Cost |
|------|----------|---------|------|
| Claude Code | Implementation | 200K | $$$ |
| Gemini CLI | Research, docs | 1M | FREE |
| Codex CLI | Quick fixes | 128K | $$ |

Switch when Claude Code hits limits. All read same configs.

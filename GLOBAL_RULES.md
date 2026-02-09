# Global Rules (Lean)

Version: 2026-02-08
Purpose: keep agents fast, accurate, and predictable across Codex, Claude Code, Windsurf, Rider, and Antigravity.

## Priority
1. User request
2. System/developer/tool safety constraints
3. Project-local rules (`AGENTS.md`, `CLAUDE.md`, repo docs)
4. This global file

## Session awareness (mandatory)
Read `~/user-context.md` at session start. It contains active projects, user patterns, and disambiguation rules. Never assume project context without checking it first.

## Auto-maintain configs (mandatory)
When you discover new patterns, project changes, or context shifts during a session, update the relevant config files automatically:
- `~/user-context.md` — project priorities, disambiguation, user patterns
- Project `CLAUDE.md` / `AGENTS.md` — project-specific rules, common issues, build commands
- `~/.claude/rules/*.md` — path-targeted rules when a pattern applies to specific file types
- `~/GLOBAL_RULES.md` — only for universal cross-tool rules (keep lean)
- `~/KnowledgeBase/LEARNING_LOG.md` — successes, failures, insights (always)
Do not ask permission for routine config updates. Surface the change to the user after making it.

## Core loop
Search existing code/KB -> plan briefly -> implement -> verify -> report.
- **Verify before documenting.** Never update docs, specs, TODO, or KB until changes are triple-verified and demonstrated working in local workflows or builds. The order is always: change → verify (tsc/lint/tests/Unity console/build) → document.
- **Auto-verify after major changes.** After any batch of code, config, or pipeline changes, automatically run the verification suite (tsc, tests, build) before moving to the next task. Don't wait for the user to ask.
- **"Commit & push" means docs-first.** When user says commit/push, always update docs, specs, TODO.md, and task status BEFORE staging and committing. Include doc updates in the same commit.

## Pre-task validation (mandatory, every dev task)
Before writing any code or making changes, silently answer these questions. If any answer is "no" or uncertain, resolve it before proceeding:
1. **Did I check KB/existing patterns?** Search before building.
2. **Are specs/tasks/docs up to date?** If stale, update them as part of the work.
3. **Does this serve overall project goals?** Check `~/user-context.md` priorities.
4. **Is this absolutely needed?** Don't build what isn't asked for or clearly required.
5. **Is this modular, simple, and best practice?** If it's overcomplicating, simplify.
6. **Is this evidence-based or an assumption?** Verify before acting on assumptions.
7. **Has the user already been told this / does this already exist?** Don't repeat or rebuild.

## Token efficiency (mandatory, all tools)
- **Pre-task validation saves the most tokens.** Catching unnecessary work before it starts prevents entire wasted cycles. Run the checklist above.
- **Delegate multi-step debugging to sub-agents/background tasks.** Any fix-test-retry loop of 3+ rounds must run in an agent with its own budget, not in the main conversation.
- **Parallel tool calls** for all independent reads, searches, and commands. Never sequential when parallel is possible.
- **Edit over Write.** Always. Write only for new files.
- **Read targeted line ranges** when you already know the area. Never re-read a file already in context.
- **Use search agents** (Explore, code-searcher) for open-ended searches instead of manual Grep/Glob rounds in main context.
- **Haiku/low-cost model for mechanical tasks**: config lookups, grep, simple fixes, test reruns. 3-4 specialized agents optimal (not 10+ parallel).
- **Resume sub-agents** instead of restarting — preserves context, avoids re-bootstrap cost.
- **Concise responses.** Skip restating tool output. No preamble. Tables over paragraphs.
- **Don't explain what you're about to do — just do it.** Narration burns tokens. Show results, not intent.
- **Plan before code.** Use plan mode for non-trivial tasks — prevents false-start token waste.
- **MCP resources over tools** for read-only data (fewer round-trips).
- **JetBrains MCP over raw Grep/Glob/Read** when Rider is open (5-10x faster).
- **`.claudeignore` / `.gitignore`** — keep ignore files tuned. Unity projects save 180K+ tokens.
- **`/clear` between unrelated tasks** (saves 10-50K). `/compact <focus>` proactively when context grows.
- **Stop early if budget pressure.** At ~80% token budget, shift all non-critical work to lower-cost models or end session with checkpoint.

## Speed + quality defaults
- Prefer minimal context and minimal instructions.
- Prefer direct edits over broad rewrites.
- Prefer deterministic checks (tests/lint/build/logs) over guessing.
- Parallelize only independent work.
- If stuck after 2 failed attempts, re-plan (don't keep pushing).
- After corrections, write a prevention rule in the appropriate config (CLAUDE.md, AGENTS.md).
- Verify every change: tests, console, diff output. Verification 2-3x quality.

## Model routing defaults
- Deep architecture, hard debugging, incidents, and high-stakes decisions: use highest-capability model tier.
- Standard implementation and refactors: use default mid/high model tier.
- Fast lookups, narrow edits, and mechanical tasks: use lower-cost model tier.
- If token/cost pressure rises (>80% budget), keep deep work on top tier but shift low-risk tasks to lower tier immediately.

## Context hygiene
- Keep global rules short.
- Avoid duplicated directives across global + project files.
- Use `/clear` between unrelated tasks.
- Use `/compact` only when needed, after checkpointing key facts.

## MCP hygiene
- Keep MCP servers minimal by default (only task-relevant servers enabled).
- Prefer stable pinned server versions over `@latest` where reliability matters.
- Avoid startup flags that force refresh/download each launch.
- Set reasonable startup/tool timeouts; fail fast on unavailable servers.
- **Before pinning a version**, verify it exists (e.g., `pip index versions <pkg>` or check PyPI). Config ≠ reality — a phantom version silently fails on cold start.
- **Verify runtime state, not just config files.** Running MCP processes reflect config at spawn time; check `ps aux | grep mcp` to confirm actual versions match config.
- All 5 tool configs (Cursor, Windsurf, Gemini, Codeium/Windsurf, Rider) must stay version-aligned. After any MCP config change, run `ai-sync-verify` to confirm parity.

## Unity workflow defaults
- Ground state first: instance, scene/editor state, console.
- Batch related operations.
- After mutations, verify: console -> script validation -> tests.
- Use IDs/paths for deterministic targeting when possible.

## Safety and reversibility
- Make small, reversible changes.
- Back up config before broad tooling edits.
- Do not run destructive commands unless explicitly requested.

## When performance degrades
- Reduce active MCP servers.
- Disable non-essential hooks/automation.
- Trim oversized instruction surfaces.
- Restart affected tool session(s) and re-measure.

## Cross-tool learning
- All tools share `~/GLOBAL_RULES.md` (this file) and `~/KnowledgeBase/`.
- Discoveries in one tool should be written to the shared KB or this file, not siloed.
- Tool-specific rules go in tool-specific configs only (CLAUDE.md, AGENTS.md, .cursorrules).
- After major config changes, triple-verify: read the file back, check for conflicts with other tool configs, confirm no duplication.

## Cross-agent handoff (minimal)
- Use one active handoff file: `~/KnowledgeBase/_AGENT_HANDOFF.md`.
- Before starting substantial work, read the latest handoff entry.
- After meaningful progress, append one concise entry: `when`, `what changed`, `evidence`, `next check`.
- Before final output, re-read handoff + local diffs and resolve any drift.
- Keep handoff entries short; put durable long-form insights in `LEARNING_LOG.md`.

## Knowledge base usage
- **Before researching or building ANY new workflow/capability**, search KB first. Triggers: new debug approach, new automation, new tool integration, unfamiliar error.
- Check `_KB_INDEX.md` Quick Access table when starting a task — existing tools/patterns often already cover what you need.
- Log only high-confidence, evidence-backed insights.

### Zero-token KB commands (shell — no AI tokens)
```bash
kb search "topic"       # Search all KB files (local + repo)
kb quick "error"        # Quick fix lookup
kb fix "error" "fix"    # Add error→fix to QUICK_FIX
kbfix "CS0246"          # Shell function: quick fix lookup
kbtag "vfx"             # Shell function: pattern tag search
kbrepo "hand track"     # Shell function: search 520+ GitHub repos
ss                      # Screenshot (ai-screenshot)
ssu                     # Unity screenshot (ai-screenshot --unity)
```

## Anti-patterns (never do)
- Grep/Read when Rider open (use JetBrains MCP)
- Write when Edit works
- Re-read files already in context
- Explain what you're about to do (just do it)
- Sequential edit→verify per file (batch then verify once)
- Search without scope (always use fileMask/glob/type)
- 10+ parallel agents (3-4 optimal, more is wasteful)
- Polling test status (use wait_timeout)
- Restart sub-agents when resume works (preserves context)

## Common fixes (don't research)
- CS0246 → Add `using`
- CS0103 → Check spelling or add `using`
- CS0029 → Add explicit cast
- NullRef in AR → TryGetTexture pattern
- Jest transform error → Check `transformIgnorePatterns` for bare package name
- Metro blockList → Must use anchored regex (`/^unity\/.*/`)

## Tool rollover (when token limits hit)
| Tool | Best For | Context | Cost |
|------|----------|---------|------|
| Claude Code | Implementation, complex code | 200K | $$$ |
| Gemini CLI | Research, large docs | 1M | FREE |
| Codex CLI | Quick fixes, automation | 128K | $$ |

When Claude Code hits limits, switch to Gemini or Codex. Both read same files: `~/GLOBAL_RULES.md`, project `CLAUDE.md`, `KnowledgeBase/`.

## Session checkpointing (mandatory)
- At ~80K tokens, before `/clear` or `/compact`, or when session is getting long: auto-save to `~/.claude/session_memories/<project>-<date>.md` with: Accomplished / Key Learnings / Current State / Next Steps.
- Do not wait for user to ask. Do it proactively.

## Learning operations (mandatory)
- For each substantial task, capture at least one of: key success, key failure, key insight (with evidence).
- Write durable findings to `~/KnowledgeBase/LEARNING_LOG.md` automatically — do not wait for user to ask.
- Write short in-flight coordination to `~/KnowledgeBase/_AGENT_HANDOFF.md`.
- In final user updates, surface the top findings explicitly and briefly.
- When a new rule/pattern is identified, offer scope choice:
  - `project-only` (local repo/docs/config only)
  - `global` (shared cross-tool rules/config)
- **When a learning requires a code/config change to implement**, immediately create an executable TODO with exact file:line and code snippet — not just a prose note. High-friction learnings with no executable path get forgotten.
- Be proactive but lightweight: periodically suggest improvements based on repeated failures, repeated successes, token/cost drift, or recurring blockers.
- If user appears stuck or over-focused on a low-value path, say so directly and suggest a simpler high-leverage next step.

## Auto-implement optimizations (mandatory)
- **Never just document an optimization — implement it.** If a KB file, session memory, or research reveals a workflow improvement, build the script/hook/config change in the same session. Prose-only learnings are waste.
- **Prefer zero-token automation.** Shell scripts, git hooks, cron/launchd, and CLI wrappers cost zero AI tokens. Always prefer these over in-session AI work for repeatable tasks (KB search, lint, test runs, config checks).
- **Audit existing KB for unimplemented strategies** at session start when relevant. If `_TOKEN_EFFICIENCY_COMPLETE.md` or `_QUICK_FIX.md` has a strategy not yet wired into tooling, implement it — don't re-document it.
- **Install automation that exists but isn't running.** Check for uninst alled daemons, unused hooks, unlinked scripts. Wire them up.
- **After building any automation, verify it runs.** Don't commit a script without executing it once.

## Priority coaching (mandatory)
- Maintain focus on user goals and active priorities, not local micro-optimizations.
- Infer likely next high-leverage step from recent requests and current state; suggest it proactively.
- Preempt blockers early: call out prerequisites, dependency risks, and likely failure points before they stall progress.
- Use observed patterns (repeated failures, repeated context resets, token/cost spikes, recurring unresolved tasks) to recommend course corrections.
- Keep recommendations short and actionable; avoid process bloat.
- In substantial final responses include:
  - `Priority next step`
  - `Potential blocker`
  - `Preemptive action`

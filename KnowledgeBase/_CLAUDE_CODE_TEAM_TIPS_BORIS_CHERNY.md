# Claude Code Team Tips & Personal Workflow (Boris Cherny)

**Source**: Boris Cherny (@bcherny), creator of Claude Code
**Thread 1 (Personal Workflow)**: [x.com/bcherny/status/2007179832300581177](https://x.com/bcherny/status/2007179832300581177) — Jan 2, 2026
**Thread 2 (Team Tips)**: [x.com/bcherny/status/2017742741636321619](https://x.com/bcherny/status/2017742741636321619) — Jan 31, 2026 (8.3M views, 49K reposts)
**Community Compilation**: [Ashley Ha gist](https://gist.github.com/ashley-ha/fa68110f49a29653fe75d69b37ec7d49)
**Last Updated**: 2026-02-08

---

## Related Resources

| Topic | File |
|-------|------|
| Official Best Practices | `_CLAUDE_CODE_OFFICIAL_BEST_PRACTICES.md` |
| Hooks Reference | `_CLAUDE_CODE_HOOKS.md` |
| Subagent Patterns | `_CLAUDE_CODE_SUBAGENTS.md` |
| Unity Workflow | `_CLAUDE_CODE_UNITY_WORKFLOW.md` |

---

## Thread Context

Boris posted two threads. Thread 1 covers his personal workflow ("surprisingly vanilla"). Thread 2 covers team-sourced tips from the Claude Code engineering team. Both threads stress: **"There is no one right way to use Claude Code."**

---

## Tip 1: Parallel Execution

### Exact Text (Thread 2)
> "Spin up 3–5 git worktrees at once, each running its own Claude session in parallel. It's the single biggest productivity unlock, and the top tip from the team. Personally, I use multiple git checkouts, but most of the Claude Code team prefers worktrees — it's the reason @amorriscode built native support for them into the Claude Desktop app."
>
> "Some name them with shell aliases (za, zb, zc) to hop between with one keystroke. Others have a dedicated 'analysis' worktree that only reads logs and runs BigQuery."

### Exact Text (Thread 1 — Personal)
> Boris runs **5 Claude Code sessions** in parallel in his terminal (numbered tabs 1-5), with system notifications alerting him when sessions need input. He simultaneously operates **5-10 additional sessions on claude.ai/code**, sometimes using `--teleport` to move between local and web. He launches a few sessions from his phone each morning.

### Technical Interpretation

**What's actually happening**: Each worktree is a fully independent working directory with its own branch, index, and HEAD. Claude sessions in each worktree get completely separate context windows with no cross-contamination. This is fundamentally different from running multiple sessions on the same checkout — worktrees prevent merge conflicts, lock files, and dirty-state interference.

**Boris's personal variant** — separate full `git clone` checkouts rather than worktrees — gives even stronger isolation (separate `.git` directories, separate remotes) at the cost of more disk space and no shared reflog.

**The "analysis" worktree pattern** is key: a read-only worktree for log tailing, BigQuery, metrics — context-heavy work that would pollute a coding session's window.

### Operationalization for This Setup

**Current state**: You run single sessions. Your Unity project has large asset directories that make worktrees expensive.

**Actionable**:
- For Unity: worktrees are impractical (Library/ regeneration, .meta files). Use **separate terminal tabs with `--continue` on different named sessions** instead.
- For non-Unity work: set up worktrees with shell aliases.
- The "analysis worktree" pattern maps directly to your existing `research-agent` and `tech-lead-advisor` subagents — they already isolate read-only context.
- Boris's 5+10 parallelism = ~15 concurrent sessions. Your subagent architecture already enables this within a single session.

```bash
# Non-Unity worktree setup
git worktree add ../wt-feature feature/branch
git worktree add ../wt-analysis main  # read-only analysis
alias za='cd ../wt-feature && claude'
alias zb='cd ../wt-analysis && claude'
```

---

## Tip 2: Plan Mode Discipline

### Exact Text
> "Start every complex task in plan mode. Pour your energy into the plan so Claude can 1-shot the implementation."
>
> "One person has one Claude write the plan, then they spin up a second Claude to review it as a staff engineer."
>
> "The moment something goes sideways, they switch back to plan mode and re-plan. Don't keep pushing."

### Technical Interpretation

**The "1-shot" claim is precise**: A thorough plan front-loads the ambiguity resolution into a cheap phase (plan = mostly reading + thinking, low tool calls). Execution then becomes deterministic — Claude follows the plan without branching decisions, which means fewer wrong turns, less context waste, and less need for backtracking.

**The "second Claude as staff reviewer" pattern** is a peer-review gate before any code is written. This catches architectural mistakes when they're cheapest to fix. The cost is one extra context window; the savings are potentially the entire implementation context if the plan was flawed.

**"Re-plan when stuck"** is the critical discipline. The natural instinct is to keep pushing — but a derailed implementation burns context tokens on failed approaches. Switching back to plan mode is a hard reset that preserves the remaining context budget.

### Operationalization for This Setup

**Current state**: You have Plan mode available (Shift+Tab), `tech-lead-advisor` agent, and `feature-dev:code-architect` agent.

**Actionable**:
- **Two-Claude review**: Use `tech-lead-advisor` (read-only) to review plans before execution. This is already in your agent roster — the pattern maps directly.
- **Re-plan trigger**: Add to CLAUDE.md: "If 2 consecutive tool calls fail or produce unexpected results, switch to plan mode before continuing."
- The `feature-dev` plugin already enforces plan-first for features. Extend the discipline to bug fixes and refactors.

---

## Tip 3: CLAUDE.md as Self-Improving System

### Exact Text
> "Invest in your CLAUDE.md. After every correction, end with: 'Update your CLAUDE.md so you don't make that mistake again.' Claude is eerily good at writing rules for itself."
>
> "Ruthlessly edit your CLAUDE.md over time. Keep iterating until Claude's mistake rate measurably drops."
>
> "One engineer tells Claude to maintain a notes directory for every task/project, updated after every PR, with CLAUDE.md pointing at it."

### Exact Text (Thread 1 — Personal)
> The team maintains a single CLAUDE.md file checked into git, with all members contributing multiple times weekly. When Claude makes mistakes, they add prevention rules. During code review, Boris tags @.claude on teammates' PRs to update guidelines.

### Technical Interpretation

**"Claude is eerily good at writing rules for itself"** — This is a self-referential feedback loop. Claude has the full conversation context including what went wrong. When asked to write a rule preventing that mistake, it can be very precise because it just experienced the failure mode. The resulting rule is often better than what a human would write because Claude knows exactly what information it needed and didn't have.

**The notes-per-task pattern** is a structured memory system: each task gets a persistent context file that survives across sessions. CLAUDE.md becomes a router pointing to these files. This solves the "lost context between sessions" problem without bloating the main instruction file.

**"Ruthlessly edit"** = curation matters more than accumulation. An oversized CLAUDE.md wastes context tokens on every session start. Rules that are no longer relevant should be pruned.

### Operationalization for This Setup

**Current state**: You have a multi-layer system: `~/GLOBAL_RULES.md` → `~/.claude/CLAUDE.md` → project `CLAUDE.md`. You also have `LEARNING_LOG.md`, `_QUICK_FIX.md`, and `_AUTO_FIX_PATTERNS.md` — which is more elaborate than what Boris describes.

**Gap**: The "Update your CLAUDE.md" prompt pattern isn't explicitly in your workflow. You log to `LEARNING_LOG.md` but don't auto-feed corrections back into CLAUDE.md rules.

**Actionable**:
- After any correction during a session, end with: "Write a rule in the appropriate CLAUDE.md preventing this mistake."
- Periodically prune: your `~/.claude/CLAUDE.md` is already ~800 tokens of pointers, which is lean. But `GLOBAL_RULES.md` should be audited for stale rules.
- The notes-per-task pattern maps to your `session_memories/` directory. Consider having CLAUDE.md reference active task notes.

---

## Tip 4: Skills as Institutional Knowledge

### Exact Text
> "Create your own skills and commit them to git. Reuse across every project."
>
> "If you do something more than once a day, turn it into a skill or command."
>
> "Build a /techdebt slash command and run it at the end of every session to find and kill duplicated code."
>
> "Set up a slash command that syncs 7 days of Slack, GDrive, Asana, and GitHub into a context dump."
>
> "Another team member built analytics agents — write dbt models, review code, test in dev."

### Exact Text (Thread 1 — Personal)
> Boris uses `/commit-push-pr` dozens of times daily. All commands live in `.claude/commands/` with inline bash for pre-computed context.

### Technical Interpretation

**"Institutional knowledge"** is the key phrase. Skills checked into git mean new team members inherit battle-tested workflows immediately. A `/techdebt` command encodes the team's definition of tech debt, their preferred fix patterns, and their quality bar — without anyone having to explain it.

**The "context dump" pattern** is notable: a single slash command that pulls 7 days of Slack + GDrive + Asana + GitHub into Claude's context. This is a session bootstrap — instead of manually explaining what's been happening, you inject the full operational context in one command.

**The "analytics agents" pattern** = Claude as a glue layer between data tools. Instead of learning dbt/SQL/BigQuery syntax, you describe what you want in natural language and Claude translates.

### Operationalization for This Setup

**Current state**: You have 5 skills (`checkpoint`, `claude-mem`, `remember`, `save`, `token-check`) and 25 subagents. Your skill count is low relative to Boris's recommendation.

**Gap**: No `/techdebt` equivalent. No context-dump skill. No `/commit-push-pr` equivalent (your `/commit` is from a plugin, not custom).

**Actionable**:
- Build `/techdebt` skill: scan for duplicated code, unused imports, TODO comments, dead code. Run at session end.
- Build `/context-dump` skill: pull recent git log, open issues, recent session memories into a single context injection.
- Build `/unity-status` skill: console errors + editor state + scene hierarchy in one shot (you have the MCP tools, just need the orchestration).
- The "once a day" rule: track what you ask Claude repeatedly and convert to skills.

---

## Tip 5: Autonomous Bug Fixing

### Exact Text
> "Claude fixes most bugs by itself. Here's how we do it:"
>
> "Enable the Slack MCP, then paste a Slack bug thread into Claude and just say 'fix.' Zero context switching required."
>
> "Or, just say 'Go fix the failing CI tests.' Don't micromanage how."
>
> "Point Claude at docker logs to troubleshoot distributed systems."

### Technical Interpretation

**"Don't micromanage how"** is the core principle. The natural tendency is to diagnose the bug yourself and then instruct Claude on the fix. Boris's team skips the diagnosis entirely — they give Claude the symptom (bug thread, failing CI, error logs) and let it own the entire investigation-to-fix pipeline.

**This only works with verification**. The implicit requirement is that Claude can run tests, check CI, or otherwise verify its fix. Without a feedback loop, autonomous fixing would produce unverified patches.

**The Slack MCP integration** eliminates the copy-paste-context-switch tax. Bug reports arrive in Slack → Claude reads Slack directly → fixes the code → done. The human never leaves the terminal.

### Operationalization for This Setup

**Current state**: You have `unity-error-fixer`, `unity-error-fixer-quick`, and `unity-error-fixer-deep` agents. You have Unity MCP for console access. No Slack MCP.

**Already strong here**: Your error-fixer agents already implement the "give it the symptom" pattern. The `monitor-agent` checks console automatically.

**Gap**: No Slack MCP (not critical for solo work). The "go fix failing CI" pattern requires CI integration you may not have.

**Actionable**:
- Trust the error-fixer agents more. Give them the error, not the diagnosis.
- When Unity console shows errors after a change, say "fix the console errors" rather than reading the errors yourself and prescribing fixes.

---

## Tip 6: Adversarial Prompting

### Exact Text
> "a. Challenge Claude. Say 'Grill me on these changes and don't make a PR until I pass your test.' Make Claude be your reviewer. Or, say 'Prove to me this works' and have Claude diff behavior between main and your feature branch."
>
> "b. After a mediocre fix, say: 'Knowing everything you know now, scrap this and implement the elegant solution.'"
>
> "c. Write detailed specs and reduce ambiguity before handing work off. The more specific you are, the better the output."

### Technical Interpretation

**"Grill me"** inverts the typical human→AI direction. Instead of Claude executing and you reviewing, Claude becomes the reviewer and you become the implementer being tested. This is useful for learning codebases — Claude quizzes you on the implications of your changes, forcing you to think through edge cases.

**"Prove to me this works"** forces Claude to generate evidence rather than assertions. The diff between main and feature branch is a concrete artifact — not "I believe this is correct" but "here is the behavioral difference, verified."

**"Scrap this and implement the elegant solution"** is a deliberate context reset. After a mediocre first attempt, Claude has accumulated understanding of the problem space. The "knowing everything you know now" preamble tells Claude to use that understanding but abandon the implementation approach. This often produces dramatically better second attempts because the problem is now fully understood.

**Tip 6c is underrated**: Ambiguity in the prompt is the #1 source of mediocre output. Every ambiguous requirement is a coin flip Claude has to make. Detailed specs front-load the decisions to the human, where they belong.

### Operationalization for This Setup

**Current state**: Your `code-review:code-review` plugin and `feature-dev:code-reviewer` agent handle review. Your `tech-lead-advisor` is read-only.

**Actionable**:
- Add these exact prompt patterns to your toolkit:
  - Pre-PR: "Grill me on these changes. What could break?"
  - Post-implementation: "Prove this works by diffing behavior against main."
  - After mediocre output: "Knowing everything you know now, scrap this and implement the elegant solution."
- The "scrap and redo" pattern is especially valuable for Unity work where first-attempt component architectures are often over-engineered.

---

## Tip 7: Terminal & Environment Setup

### Exact Text
> "The team loves Ghostty! Multiple people like its synchronized rendering, 24-bit color, and proper unicode support."
>
> "For easier Claude-juggling, use /statusline to customize your status bar to always show context usage and current git branch."
>
> "Many color-code and name their terminal tabs, sometimes using tmux."
>
> "Use voice dictation. You speak 3x faster than you type, and your prompts get way more detailed as a result. (hit fn x2 on macOS)."

### Technical Interpretation

**Ghostty** is mentioned specifically for synchronized rendering — important when Claude is rapidly outputting text. Terminals without sync will flicker/tear during fast output.

**`/statusline`** showing context usage is critical for context hygiene. Without visible context usage, you don't know when you're approaching the cliff until performance degrades.

**Voice dictation** (fn fn on macOS) is the surprise productivity tip. The claim: 3x faster input with more detailed prompts. Detailed prompts → fewer ambiguity coin flips → better output. The cost is minor editing for dictation errors.

### Operationalization for This Setup

**Current state**: You have `/statusline` available. Unknown terminal (likely iTerm2 or Terminal.app).

**Actionable**:
- Run `/statusline` and configure context usage display.
- Try voice dictation (fn fn) for complex prompts — especially for plan mode where detailed specs matter most.
- Color-code terminal tabs by task type if running parallel sessions.

---

## Tip 8: Subagents for Context Hygiene

### Exact Text
> "a. Append 'use subagents' to any request where you want Claude to throw more compute at the problem."
>
> "b. Offload individual tasks to subagents to keep your main agent's context window clean and focused."
>
> "c. Route permission requests to Opus 4.5 via a hook — let it scan for attacks and auto-approve the safe ones."

### Exact Text (Thread 1 — Personal)
> Boris maintains these subagents: code-simplifier, verify-app, build-validator, code-architect, oncall-guide.

### Technical Interpretation

**"Throw more compute"** — subagents get their own context windows. Saying "use subagents" tells Claude to spawn parallel agents, each with fresh context, working on sub-problems independently. The main agent stays clean and focused on orchestration.

**The permission-routing hook** is the most advanced pattern here: a PostToolUse hook that intercepts permission requests and routes them to Opus 4.5 for security review. This enables auto-accept mode without the security risk of blanket approval.

**Boris's subagent roster** reveals his workflow: simplification (cleanup), verification (testing), building (compilation), architecture (design), and oncall (operations). Each maps to a phase of the development lifecycle.

### Operationalization for This Setup

**Current state**: You have 25 subagents — significantly more than Boris's 5. This is already operationalized.

**Gap**: You may be over-fragmented. Boris has 5 general-purpose subagents; you have 25 specialized ones. The cognitive overhead of choosing the right agent may be high.

**Actionable**:
- Audit agent usage. Which of the 25 do you actually use? Consolidate rarely-used agents.
- The "use subagents" append pattern is simple and effective — say it explicitly when you want parallel investigation.
- Consider the permission-routing hook if you want safer auto-accept.

---

## Tip 9: Claude Replaces SQL/Analytics

### Exact Text
> "Ask Claude Code to use the 'bq' CLI to pull and analyze metrics on the fly."
>
> "We have a BigQuery skill checked into the codebase, and everyone on the team uses it for analytics queries directly in Claude Code."
>
> "Personally, I haven't written a line of SQL in 6+ months."
>
> "This works for any database that has a CLI, MCP, or API."

### Technical Interpretation

Claude as a **translation layer** between natural language and database query languages. The skill encodes the schema knowledge, common query patterns, and output formatting so Claude doesn't need to rediscover the schema each session.

**"Any database with a CLI, MCP, or API"** — this generalizes beyond BigQuery. SQLite, PostgreSQL via `psql`, Firebase via `firebase` CLI, etc.

### Operationalization for This Setup

**Relevance**: Lower priority for Unity development. But applicable if you use any analytics, Firebase, or backend databases.

---

## Tip 10: Learning with Claude

### Exact Text
> "a. Enable the 'Explanatory' or 'Learning' output style in /config to have Claude explain the *why* behind its changes."
>
> "b. Have Claude generate a visual HTML presentation explaining unfamiliar code. It makes surprisingly good slides!"
>
> "c. Ask Claude to draw ASCII diagrams of new protocols and codebases to help you understand them."
>
> "d. Build a spaced-repetition learning skill: you explain your understanding, Claude asks follow-ups to fill gaps, stores the result."

### Technical Interpretation

**You already have this enabled** — the `learning-output-style` plugin is active in your settings. The `★ Insight` blocks in your sessions are this pattern in action.

**The spaced-repetition skill** is the most ambitious idea: Claude tracks what you know, quizzes you periodically, and stores results. This is a personal knowledge management system built on Claude's context.

### Operationalization for This Setup

**Current state**: Learning output style is active. ASCII diagrams are available on request.

**Gap**: No spaced-repetition skill. No HTML presentation generation habit.

---

## Boris's Personal Workflow (Thread 1 Extras)

### Model Selection
> Uses **Opus 4.5 with thinking enabled for everything**. Despite being slower per response, requires less steering and delivers better tool usage — faster overall due to superior planning.

### Formatting Automation
```json
"PostToolUse": [{
  "matcher": "Write|Edit",
  "hooks": [{
    "type": "command",
    "command": "bun run format || true"
  }]
}]
```
Auto-formats code after every Write/Edit. Handles the "last 10%" formatting issues that fail CI.

### Permissions Strategy
> Uses `/permissions` to pre-allow safe bash commands (`bun run build:*`, `bun run test:*`, `bun run typecheck:*`). **Never uses `--dangerously-skip-permissions`**. Settings shared via `.claude/settings.json`.

### Verification as Force Multiplier
> **"Probably the most important thing to get great results — give Claude a way to verify its work."** He tests every change using the Chrome extension. Claims verification **"2-3x the quality of the final result."**

---

## Meta-Patterns (Cross-Thread Synthesis)

Five principles that recur across both threads:

| Pattern | Principle | Evidence |
|---------|-----------|----------|
| **Parallelization > Optimization** | Run more sessions, not smarter sessions | 5 local + 10 web = 15 concurrent |
| **Plan mode is for recovery** | Re-plan when stuck, don't push through | "Don't keep pushing" |
| **Claude improves itself** | Let it write its own rules | "Eerily good at writing rules for itself" |
| **Skills compound** | Codify what you repeat | `/commit-push-pr` runs dozens of times daily |
| **Challenge, don't instruct** | Treat Claude as a peer to convince | "Grill me", "Prove to me" |

---

## Gap Analysis: Your Setup vs. Boris's Recommendations

| Tip | Your Status | Gap |
|-----|-------------|-----|
| 1. Parallel execution | Subagents (good), no worktrees | Unity makes worktrees impractical; parallel sessions viable |
| 2. Plan mode | Available, tech-lead agent exists | Add re-plan trigger rule; use 2-Claude review pattern |
| 3. CLAUDE.md evolution | Multi-layer system, LEARNING_LOG | Missing "update CLAUDE.md" as correction habit |
| 4. Skills | 5 skills, 25 agents | Low skill count; need /techdebt, /context-dump |
| 5. Autonomous bug fixing | 3 error-fixer agents | Strong; trust agents more, prescribe less |
| 6. Adversarial prompting | Code review plugin | Add "scrap and redo" and "prove it" patterns |
| 7. Terminal setup | Unknown | Configure /statusline; try voice dictation |
| 8. Subagents | 25 agents (extensive) | Possibly over-fragmented; audit usage |
| 9. Analytics/SQL | N/A for Unity | Low priority |
| 10. Learning | Plugin active | Already operationalized |
| Formatting hook | None | Add PostToolUse format hook for Unity C# |
| Verification | MCP console checks | Add explicit verify step to workflow |

---

## Priority Actions (Sorted by Impact)

1. **Add "update CLAUDE.md" correction habit** — self-improving rules, compounding benefit
2. **Build /techdebt and /context-dump skills** — daily-use automation
3. **Configure /statusline** — context visibility prevents degradation
4. **Add re-plan trigger to CLAUDE.md** — "2 failures → re-plan"
5. **Add PostToolUse formatting hook** — prevent style drift in C# files
6. **Try voice dictation for plan mode** — 3x input speed, more detailed specs
7. **Audit 25 agents for actual usage** — consolidate to ~10 high-use agents

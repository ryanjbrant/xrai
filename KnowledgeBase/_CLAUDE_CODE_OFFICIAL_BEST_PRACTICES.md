# Claude Code Official Best Practices

**Source**: code.claude.com/docs (February 2026)
**Last Updated**: 2026-02-05

---

## Related Resources

| Topic | File |
|-------|------|
| Architecture Deep Dive | `_archive/_CLAUDE_CODE_ARCHITECTURE_DEEP_DIVE.md` |
| Hooks Reference | `_CLAUDE_CODE_HOOKS.md` |
| Subagent Patterns | `_CLAUDE_CODE_SUBAGENTS.md` |
| Unity Workflow | `_CLAUDE_CODE_UNITY_WORKFLOW.md` |

---

## Core Constraint: Context Window Management

Claude's context window holds your entire conversation, including every message, every file read, and every command output. **Performance degrades as context fills.**

The context window is the most important resource to manage.

---

## Highest Leverage: Give Claude Verification Criteria

**Single most impactful practice**: Include tests, screenshots, or expected outputs so Claude can check itself.

| Strategy | Before | After |
|----------|--------|-------|
| Verification criteria | "implement email validation" | "write validateEmail. test: user@example.com=true, invalid=false, user@.com=false. run tests after" |
| Visual verification | "make dashboard look better" | "[paste screenshot] implement this design. take screenshot of result and compare" |
| Root cause over symptoms | "build is failing" | "build fails with [error]. fix it and verify build succeeds. address root cause" |

---

## Explore-Plan-Code-Commit Workflow

Four phases for complex tasks:

### 1. Explore (Plan Mode)
```
read /src/auth and understand how we handle sessions
```

### 2. Plan (Plan Mode)
```
I want to add Google OAuth. What files need to change? Create a plan.
```
Press `Ctrl+G` to open plan in editor for direct editing.

### 3. Implement (Normal Mode)
```
implement the OAuth flow from your plan. write tests, run suite, fix failures.
```

### 4. Commit
```
commit with a descriptive message and open a PR
```

**Skip planning for**: Typos, log lines, variable renames - if you can describe the diff in one sentence.

---

## Prompting Strategies

### Scope Tasks Precisely
| Strategy | Before | After |
|----------|--------|-------|
| Scope the task | "add tests for foo.py" | "write test for foo.py covering logged-out edge case. avoid mocks" |
| Point to sources | "why weird API?" | "look through ExecutionFactory's git history and summarize how its api came to be" |
| Reference patterns | "add calendar widget" | "look at HotDogWidget.php for patterns. follow the pattern for a new calendar widget" |
| Describe symptoms | "fix login bug" | "login fails after session timeout. check src/auth/, especially token refresh. write failing test first" |

### Rich Content Input
- **@file** - Reference files directly (Claude reads before responding)
- **Paste images** - Copy/paste or drag and drop
- **URLs** - Use `/permissions` to allowlist domains
- **Pipe data** - `cat error.log | claude`
- **Let Claude fetch** - "use bash/MCP to get what you need"

---

## CLAUDE.md Best Practices

### What to Include
- Bash commands Claude can't guess
- Code style rules that differ from defaults
- Testing instructions and preferred test runners
- Repository etiquette (branch naming, PR conventions)
- Architectural decisions specific to your project
- Developer environment quirks (required env vars)
- Common gotchas or non-obvious behaviors

### What to Exclude
- Anything Claude can figure out by reading code
- Standard language conventions Claude already knows
- Detailed API documentation (link to docs instead)
- Information that changes frequently
- Long explanations or tutorials
- File-by-file descriptions of the codebase
- Self-evident practices like "write clean code"

### Import Syntax
```markdown
See @README.md for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

### File Locations
| Type | Location | Purpose | Shared With |
|------|----------|---------|-------------|
| Managed policy | `/Library/Application Support/ClaudeCode/CLAUDE.md` | Organization-wide | All users |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team-shared | Team via git |
| Project rules | `./.claude/rules/*.md` | Modular instructions | Team via git |
| User | `~/.claude/CLAUDE.md` | Personal all-projects | Just you |
| Project local | `./CLAUDE.local.md` | Personal project-specific | Just you |

**Recursive lookup**: Claude searches parent directories for CLAUDE.md files, allowing monorepo-level settings.

**Additional directories**: Use `claude --add-dir ../other-repo` to include context from other repos.

---

## Modular Rules (.claude/rules/)

### Path-Specific Rules with Frontmatter
```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules
- All endpoints must include input validation
- Use standard error response format
```

### Glob Patterns Supported
| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All TypeScript files |
| `src/**/*` | All files under src/ |
| `*.md` | Markdown in project root |
| `src/**/*.{ts,tsx}` | Both .ts and .tsx files |

---

## Session Management Commands

| Action | Command |
|--------|---------|
| Course correct | `Esc` - stop mid-action, context preserved |
| Rewind | `Esc + Esc` or `/rewind` - restore conversation and code |
| Undo | "Undo that" - have Claude revert changes |
| Clear | `/clear` - reset context between unrelated tasks |
| Compact | `/compact <focus>` - summarize with focus instruction |
| Resume | `claude --continue` or `claude --resume` |
| Fork | `claude --continue --fork-session` |
| Rename | `/rename session-name` |

### Session Picker Shortcuts
| Key | Action |
|-----|--------|
| `P` | Preview session |
| `R` | Rename session |
| `/` | Search filter |
| `A` | Toggle all projects |
| `B` | Filter to current branch |

---

## Permission Modes

Cycle with `Shift+Tab`:

1. **Default** - Ask before file edits and shell commands
2. **Auto-accept edits** - Edit files without asking, still ask for commands
3. **Plan mode** - Read-only tools only, creates plan for approval

---

## Extended Thinking

Toggle with `Option+T` (macOS) or `Alt+T`.

| Config | Method |
|--------|--------|
| Toggle | Option+T / Alt+T |
| Global default | `/config` |
| Limit budget | `MAX_THINKING_TOKENS=10000` |
| View thinking | `Ctrl+O` (verbose mode) |

**Budget**: Up to 31,999 tokens when enabled, 0 when disabled.

---

## Subagent Patterns

### Use Subagents for Context Isolation
```
Use subagents to investigate how our authentication system handles token refresh,
and whether we have any existing OAuth utilities I should reuse.
```

Subagent explores, reports back summary - doesn't clutter main context.

### Post-Implementation Verification
```
use a subagent to review this code for edge cases
```

### Create Custom Subagents
```markdown
# .claude/agents/security-reviewer.md
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer. Review code for...
```

---

## Headless & Automation

### One-off Queries
```bash
claude -p "Explain what this project does"
```

### Structured Output
```bash
claude -p "List all API endpoints" --output-format json
```

### Streaming for Real-Time
```bash
claude -p "Analyze this log file" --output-format stream-json
```

### Fan-Out Pattern
```bash
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```

---

## Writer/Reviewer Pattern

| Session A (Writer) | Session B (Reviewer) |
|-------------------|---------------------|
| `Implement a rate limiter for our API endpoints` | |
| | `Review the rate limiter in @src/middleware/rateLimiter.ts. Look for edge cases, race conditions.` |
| `Here's the review feedback: [Session B output]. Address these issues.` | |

Fresh context improves code review - Claude won't be biased toward code it just wrote.

---

## Git Worktrees for Parallel Sessions

```bash
# Create worktree with new branch
git worktree add ../project-feature-a -b feature-a

# Run Claude in isolated worktree
cd ../project-feature-a
claude

# Manage worktrees
git worktree list
git worktree remove ../project-feature-a
```

Each worktree has independent file state - perfect for parallel Claude sessions.

---

## Common Failure Patterns to Avoid

| Pattern | Problem | Fix |
|---------|---------|-----|
| Kitchen sink session | Context full of unrelated info | `/clear` between tasks |
| Repeated corrections | Failed approaches pollute context | After 2 failures, `/clear` and better prompt |
| Over-specified CLAUDE.md | Rules get ignored | Ruthlessly prune, convert to hooks |
| Trust-then-verify gap | Plausible but broken implementation | Always provide verification |
| Infinite exploration | Context consumed by investigation | Scope narrowly or use subagents |

---

## Skills vs Subagents vs Hooks vs MCP

| Feature | Purpose | When to Use |
|---------|---------|-------------|
| Skills | Domain knowledge, reusable workflows | `/skill-name` commands |
| Subagents | Delegated tasks with isolated context | Complex investigations, verification |
| Hooks | Guaranteed actions at specific points | "Must happen every time" requirements |
| MCP | External service connections | Database, Notion, Figma, etc. |

---

## CLI Verification Integration

```json
// package.json
{
  "scripts": {
    "lint:claude": "claude -p 'you are a linter. look at changes vs main and report issues related to typos. filename and line on one line, description on second line. no other text.'"
  }
}
```

---

## Quick Reference Card

### Essential Commands
| Command | Purpose |
|---------|---------|
| `/clear` | Reset between unrelated tasks |
| `/compact <focus>` | Shrink context with focus |
| `/rewind` | Restore to checkpoint |
| `/rename` | Name session for later |
| `Esc` | Stop and redirect |
| `Esc + Esc` | Rewind menu |
| `Shift+Tab` | Cycle permission modes |
| `Ctrl+G` | Open plan in editor |
| `Option+T` | Toggle thinking |
| `Ctrl+O` | Toggle verbose mode |

### CLI Flags
| Flag | Purpose |
|------|---------|
| `--continue` | Resume most recent session |
| `--resume` | Pick from recent sessions |
| `--resume <name>` | Resume by name |
| `--from-pr <num>` | Resume PR-linked session |
| `--fork-session` | Branch conversation |
| `--permission-mode plan` | Start in plan mode |
| `-p "prompt"` | Headless query |
| `--output-format json` | Structured output |

### Conversation Patterns
- **Interview first**: "Interview me about this feature using AskUserQuestion"
- **Verify work**: "run tests and fix failures"
- **Reference patterns**: "look at HotDogWidget.php for the pattern"
- **Scope investigations**: "check only src/auth/, especially token refresh"
- **Use subagents**: "use a subagent to review for edge cases"

---

## Power-User Tips from Claude Code Team (Feb 2026)

**Source**: @bcherny Twitter thread with team insights

### 1. Git Worktrees at Scale
Spin up **3-5 worktrees** running parallel Claude sessions - "single biggest productivity unlock."

```bash
# Shell aliases for instant switching
alias za='cd ~/worktrees/project-a && claude'
alias zb='cd ~/worktrees/project-b && claude'
alias zc='cd ~/worktrees/project-c && claude'

# Dedicated analysis worktree (read-only for logs, BigQuery)
git worktree add ../project-analysis -b analysis
```

### 2. Plan Mode Mastery
- Start **every complex task** in plan mode
- Pour energy into the plan so Claude can 1-shot implementation
- **Writer/Reviewer with plans**: One Claude writes plan, second reviews as staff engineer
- **When things go sideways**: Switch back to plan mode, don't keep pushing
- Use plan mode for **verification steps**, not just builds

### 3. Self-Improving CLAUDE.md
After every correction, end with:
> "Update your CLAUDE.md so you don't make that mistake again."

Claude is "eerily good at writing rules for itself."

**Advanced**: Maintain a `notes/` directory per task/project, updated after every PR. Point CLAUDE.md at it.

### 4. Skills & Slash Commands
**Rule**: If you do something more than once a day, turn it into a skill.

| Skill Idea | Purpose |
|------------|---------|
| `/techdebt` | Run end of every session to find/kill duplicated code |
| `/sync-context` | Sync 7 days of Slack, GDrive, Asana, GitHub into one dump |
| `/analytics` | dbt models, code review, dev testing (analytics-engineer style) |
| `/reuse-check` | Search codebase/KB/repos for existing solutions before implementing |

### 4b. MANDATORY: Reuse Check in Planning
**Before writing ANY new code, search for existing solutions:**

1. **Codebase** - Search for similar functions, utilities, patterns
2. **Knowledgebase** - Check KB for documented solutions
3. **GitHub repos** - Reference implementations (520+ repos in master KB)
4. **Online docs** - Built-in framework/API solutions

**Add to every plan:**
```
"Search codebase for existing utilities that could handle X"
"Check if similar pattern exists in KB or referenced repos"
"Look for built-in API/framework solution before custom code"
```

### 4c. CI Duplication Checks
```bash
# package.json scripts
"check:duplication": "claude -p 'Analyze codebase for duplicated code: (1) copy-pasted functions, (2) similar logic to abstract, (3) reimplemented utilities. Report: file:line, duplicate of file:line, refactor suggestion.'"

"review:pr": "claude -p 'Review PR for: (1) code duplication, (2) missing reuse of existing utilities, (3) patterns contradicting conventions. Reference existing code.'"
```

```yaml
# .github/workflows/code-review.yml
- name: Check for duplication
  run: claude -p "Find duplicated code in changes vs main. Report file:line pairs." --output-format json

- name: Check for missed reuse
  run: claude -p "Check if new code reimplements existing utilities. List violations."
```

### 5. Bug Fixing Patterns
- **Slack MCP + paste thread + "fix"** - Zero context switching
- **"Go fix the failing CI tests"** - Don't micromanage how
- **Point at docker logs** - Surprisingly capable at distributed systems debugging

### 6. Power Prompts
| Technique | Prompt |
|-----------|--------|
| Challenge Claude | "Grill me on these changes and don't make a PR until I pass your test" |
| Prove it works | "Prove to me this works" - diff behavior between main and feature branch |
| Elegant redo | "Knowing everything you know now, scrap this and implement the elegant solution" |

**Key insight**: More specific specs = better output. Reduce ambiguity before handoff.

### 7. Terminal Setup
- **Ghostty** - Team favorite (synchronized rendering, 24-bit color, unicode)
- **`/statusline`** - Show context usage + git branch always
- **Color-coded tabs** - One tab per task/worktree, use tmux
- **Voice dictation** (fn x2 on macOS) - 3x faster, way more detailed prompts

### 8. Subagent Patterns
- Append **"use subagents"** to any request for more compute
- Offload individual tasks to keep main context clean and focused
- **Opus 4.5 permission hook** - Auto-scan for attacks, auto-approve safe ones

### 9. Data & Analytics
Use `bq` CLI skill for BigQuery queries directly in Claude Code.
> "I haven't written a line of SQL in 6+ months"

Works for any database with CLI, MCP, or API.

### 10. Learning Mode
- Enable **"Explanatory" or "Learning" output style** in `/config`
- Ask Claude to generate **visual HTML presentations** explaining code
- Request **ASCII diagrams** of protocols and codebases
- Build **spaced-repetition learning skill**: explain understanding → Claude asks follow-ups → stores result

---

## Advanced Configuration (Feb 2026 Research)

### Environment Variables (Recommended)

Add to `~/.claude/settings.json` under `"env"`:

| Variable | Value | Purpose |
|----------|-------|---------|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `75` | Auto-compact at 75% context |
| `MAX_THINKING_TOKENS` | `10000` | Budget for extended thinking |
| `BASH_DEFAULT_TIMEOUT_MS` | `60000` | 60s bash timeout |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `16384` | Max response tokens |
| `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` | `16384` | Max tokens per file read |
| `BASH_MAX_OUTPUT_LENGTH` | `100000` | Max bash output chars |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | `1` | Keep cwd in project |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | `25000` | Budget for skills |
| `ENABLE_TOOL_SEARCH` | `auto:5` | Auto-search >5 tools |

### Hook Events (Complete List)

| Hook | Trigger | Use Case |
|------|---------|----------|
| `SessionStart` | Session begins | Load context, health checks |
| `Stop` | Session ends | Save state, cleanup |
| `UserPromptSubmit` | Before processing | Auto-detect keywords, validate |
| `PreToolUse` | Before tool runs | Validate bash commands, safety |
| `PostToolUse` | After tool success | Track changes, logging |
| `PostToolUseFailure` | After tool fails | Error logging, escalation |
| `PreCompact` | Before auto-compact | Preserve critical context |
| `Notification` | Needs attention | Desktop alerts |
| `TodoUpdated` | Todo list changes | Sync with external systems |
| `SubagentStart` | Subagent spawns | Logging, resource tracking |
| `SubagentComplete` | Subagent finishes | Collect results |

**Missing in most setups**: PreToolUse, PostToolUseFailure, PreCompact

### Skills Architecture

Create `.claude/skills/skill-name.md`:

```markdown
---
name: my-skill
description: What this skill does
tools: Read, Grep, Glob, Bash
---

# Skill Instructions

When invoked via /my-skill:
1. First action
2. Second action
```

**Invoke with**: `/my-skill` or `/my-skill arguments`

### Context Optimization Techniques

| Technique | Savings | Method |
|-----------|---------|--------|
| Lazy loading | 54% | Load skills on-demand, not in CLAUDE.md |
| Context editing | 84% | Use `/compact` with focus areas |
| Skills vs CLAUDE.md | 60% | Move specialized content to skills |
| Path-scoped rules | 40% | Rules only load for matching files |

**Target**: CLAUDE.md < 500 lines, use skills for domain-specific content.

### Agent Memory

For agents that learn from sessions:

```markdown
# .claude/agents/learner.md
---
name: learner
memory: project    # Persists learning to project
---
```

Memory modes: `none` (default), `session`, `project`

---

## MEMORY.md Auto-Memory System (Feb 2026)

**What it is**: Claude-written auto-memory that persists between sessions. Separate from CLAUDE.md (human-written).

### How it works
- Claude writes observations/learnings to `.claude/MEMORY.md` (per-project, private)
- **First 200 lines** loaded at session startup automatically
- Topic-specific memory files loaded on-demand when relevant
- NOT version-controlled (private to the user)

### MEMORY.md vs CLAUDE.md

| Aspect | MEMORY.md | CLAUDE.md |
|--------|-----------|-----------|
| Author | Claude (auto) | Human |
| Loaded | First 200 lines at startup | Full file at startup |
| Scope | Per-project, private | Per-project, shared (git) |
| Content | Observations, preferences, learned patterns | Rules, conventions, build commands |
| Control | `CLAUDE_CODE_DISABLE_AUTO_MEMORY: "0"` | Always loaded |

### Best Practice
Let MEMORY.md handle preferences and observations. Keep CLAUDE.md for rules and commands. Don't duplicate between them.

---

## Plugin Marketplace Ecosystem (Feb 2026)

### Official Plugins (claude-plugins-official)
Auto-available to all users. Curated by Anthropic.

### Community Marketplaces
Add via `extraKnownMarketplaces` in settings.json. 130+ expert agents across 20+ plugin packs.

### Installed Plugin Types

| Type | Example | What it does |
|------|---------|--------------|
| Feature dev | `feature-dev@claude-code-plugins` | Guided architecture + implementation |
| Code review | `code-review@claude-code-plugins` | PR review workflows |
| Security | `security-guidance@claude-code-plugins` | Security analysis |
| LSP | `swift-lsp@claude-plugins-official` | Language-specific intelligence |
| Output style | `explanatory-output-style` | Changes response tone |
| Stop control | `ralph-wiggum` | Long-running task management |

### Configuration
```json
{
  "enabledPlugins": {
    "feature-dev@claude-code-plugins": true,
    "code-review@claude-code-plugins": true
  }
}
```

---

## Sandboxing (Feb 2026)

### Key stat: 84% fewer permission prompts

**What it does**: Filesystem + network isolation for Claude Code sessions.

### How to enable
- `/sandbox` command in session
- Or start with `--sandbox` flag

### What's isolated
- File system access restricted to project directory
- Network access controlled
- Shell commands sandboxed

### When to use
- Working on unfamiliar codebases
- Running untrusted scripts
- Reducing permission fatigue during long sessions
- When you want Claude to work more autonomously with guardrails

---

## Agent Teams (Experimental, Feb 2026)

### Enable
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Architecture
- **Team Lead** (main session) spawns **Teammates** (independent Claude Code instances)
- Each teammate gets its own full context window with project context
- Shared task list with dependency tracking (pending -> in_progress -> completed)
- Teammates can communicate with each other (unlike subagents)

### Limitations
- No session resumption with in-process teammates
- Task status can lag
- One team per session
- No nested teams
- Experimental: active bugs being filed

### Real-world benchmark
16 agents built a C compiler (100K lines) that compiles Linux 6.9 — cost $20K in API tokens.

---

## Context Budget Formula (Feb 2026)

```
200K total context
- 33K buffer (reserved by Claude Code, down from 45K)
- 15-20K system prompt + tool definitions
- MCP definitions (variable, aim for <10K)
- CLAUDE.md + rules (aim for <5K total)
- MEMORY.md (first 200 lines)
= ~130-140K available for actual work
```

**The ~150 instruction limit**: Frontier LLMs reliably follow ~150-200 instructions. System prompt uses ~50. That leaves ~100-150 for your CLAUDE.md + rules before quality degrades silently.

---

## Skills Progressive Disclosure Architecture (Feb 2026)

Three-tier loading minimizes context cost:

```
Tier 1: Metadata (~100 tokens per skill)
  → Name + description loaded at startup
  → Zero context cost until needed

Tier 2: Full SKILL.md (<5K tokens)
  → Loaded when Claude decides skill is relevant
  → "Reading [skill-name]" appears in thinking

Tier 3: Bundled Resources (unlimited)
  → Reference docs, examples, scripts
  → Only loaded when skill explicitly references them
  → NO context penalty for unused content
```

**Cross-platform**: Agent Skills standard (agentskills.io) adopted by both Claude Code and Codex CLI. Most promising path for multi-IDE portability.

---

**Tags**: #claude-code #best-practices #context-management #subagents #sessions #team-tips #power-user #memory #plugins #sandboxing #agent-teams #skills

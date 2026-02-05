# Claude Code Insights Integration Checklist

**Purpose**: Verify all key insights are integrated into KB/CLAUDE.md/GLOBAL_RULES.md
**Last Verified**: 2026-02-05

---

## From Official Docs (code.claude.com)

### Best Practices
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| Context window is primary constraint | ✅ | ✅ | ✅ |
| Verification criteria (highest leverage) | ✅ | ✅ | — |
| Explore → Plan → Code → Commit workflow | ✅ | ✅ | — |
| Scope tasks precisely (before/after examples) | ✅ | — | — |
| Rich content input (@file, images, URLs, pipes) | ✅ | — | — |
| CLAUDE.md what to include/exclude | ✅ | — | — |
| @import syntax in CLAUDE.md | ✅ | — | ✅ |
| Memory file locations (5 types) | ✅ | — | — |
| Modular rules (.claude/rules/*.md) | ✅ | — | ✅ |
| Path-specific rules with frontmatter | ✅ | — | ✅ |
| Glob patterns for rules | ✅ | — | ✅ |
| Session commands (/clear, /compact, /rewind, /rename) | ✅ | ✅ | ✅ |
| Session picker shortcuts (P, R, /, A, B) | ✅ | — | — |
| Permission modes (Shift+Tab cycling) | ✅ | ✅ | ✅ |
| Extended thinking (Option+T, MAX_THINKING_TOKENS) | ✅ | ✅ | — |
| Subagent patterns (context isolation) | ✅ | ✅ | ✅ |
| Custom subagents (.claude/agents/*.md) | ✅ | — | ✅ |
| Headless mode (claude -p) | ✅ | ✅ | — |
| Output formats (text, json, stream-json) | ✅ | ✅ | — |
| Fan-out pattern (parallel file processing) | ✅ | ✅ | — |
| Writer/Reviewer pattern | ✅ | ✅ | — |
| Git worktrees for parallel sessions | ✅ | ✅ | — |
| Common failure patterns (5 types) | ✅ | ✅ | — |
| Skills vs Subagents vs Hooks vs MCP | ✅ | — | ✅ |
| CLI verification integration | ✅ | ✅ | — |
| --continue, --resume, --from-pr flags | ✅ | ✅ | ✅ |
| --fork-session flag | ✅ | ✅ | ✅ |
| --permission-mode plan | ✅ | ✅ | — |
| --dangerously-skip-permissions | ✅ | ✅ | — |
| --add-dir for additional directories | ✅ | ✅ | — |
| --print-system-prompt (debug) | ✅ | ✅ | — |
| --verbose flag | ✅ | ✅ | — |
| /doctor command | ✅ | ✅ | — |
| /agents command | ✅ | ✅ | — |
| /permissions command | ✅ | ✅ | — |
| /config command | ✅ | ✅ | — |
| Recursive CLAUDE.md lookup | ✅ | — | — |

### How Claude Code Works
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| Agentic loop (gather → act → verify) | ✅ | ✅ | — |
| Tool categories (File, Search, Exec, Web, Code Intel) | ✅ | ✅ | — |
| Sessions are ephemeral (no persistent memory) | ✅ | — | — |
| Checkpoints only track Claude's changes | ✅ | — | — |
| Delegate, don't dictate philosophy | ✅ | — | — |
| Course-correct early (Esc to stop) | ✅ | ✅ | ✅ |
| Keyboard shortcuts (Esc, Esc+Esc, Shift+Tab, Ctrl+G, Ctrl+O) | ✅ | ✅ | ✅ |

### Memory Management
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| 5 memory types hierarchy | ✅ | — | — |
| .claude/rules/ for modular rules | ✅ | — | ✅ |
| YAML frontmatter with paths | ✅ | — | ✅ |
| Recursive CLAUDE.md lookup (parent dirs) | ✅ | — | — |
| @path imports | ✅ | — | ✅ |
| --add-dir for additional directories | ✅ | — | — |
| /memory command | ✅ | ✅ | ✅ |
| /init command | ✅ | ✅ | ✅ |

### Common Workflows
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| Codebase overview workflow | ✅ | — | — |
| Find relevant code pattern | ✅ | — | — |
| Bug fixing workflow | ✅ | ✅ | — |
| Refactoring workflow | ✅ | — | — |
| Plan mode (--permission-mode plan) | ✅ | ✅ | — |
| Ctrl+G to open plan in editor | ✅ | ✅ | ✅ |
| Test writing workflow | ✅ | — | — |
| /commit-push-pr skill | ✅ | — | — |
| Documentation workflow | ✅ | — | — |
| Image handling (drag & drop, copy/paste) | ✅ | — | — |
| @ file references | ✅ | — | — |
| Session resume patterns | ✅ | ✅ | ✅ |
| Output format control | ✅ | ✅ | — |

---

## From Team Tips (@bcherny Twitter)

| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| 3-5 worktrees in parallel ("biggest unlock") | ✅ | ✅ | — |
| Shell aliases (za, zb, zc) | ✅ | ✅ | — |
| Dedicated analysis worktree | ✅ | ✅ | — |
| Plan mode mastery (every complex task) | ✅ | ✅ | — |
| Writer/Reviewer with plans | ✅ | ✅ | — |
| Switch back to plan when sideways | ✅ | ✅ | — |
| Plan mode for verification steps | ✅ | ✅ | — |
| Self-improving CLAUDE.md prompt | ✅ | ✅ | — |
| Notes directory per task/project | ✅ | ✅ | — |
| Skills rule: >1x/day → skill | ✅ | — | — |
| /techdebt skill idea | ✅ | — | — |
| /sync-context skill idea | ✅ | — | — |
| /analytics skill idea | ✅ | — | — |
| Slack MCP + "fix" pattern | ✅ | — | — |
| "Go fix the failing CI tests" | ✅ | — | — |
| Docker logs debugging | ✅ | — | — |
| "Grill me" prompt | ✅ | ✅ | — |
| "Prove to me this works" prompt | ✅ | ✅ | — |
| "Elegant solution" redo prompt | ✅ | ✅ | — |
| Interview prompt (AskUserQuestion) | ✅ | ✅ | — |
| Visual verify with Chrome extension | ✅ | ✅ | — |
| Ghostty terminal | ✅ | — | — |
| /statusline customization | ✅ | — | — |
| Color-coded tabs / tmux | ✅ | — | — |
| Voice dictation (fn x2, 3x faster) | ✅ | ✅ | — |
| "use subagents" suffix | ✅ | ✅ | — |
| Opus 4.5 permission hook | ✅ | — | — |
| bq CLI / BigQuery skill | ✅ | ✅ | — |
| Learning/Explanatory output style | ✅ | — | — |
| HTML presentations for code | ✅ | — | — |
| ASCII diagrams | ✅ | — | — |
| Spaced-repetition learning skill | ✅ | — | — |

---

## User-Requested Additions

| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| MANDATORY reuse check before implementation | ✅ | ✅ | — |
| Search codebase → KB → GitHub → docs | ✅ | ✅ | — |
| CI duplication checks (claude -p) | ✅ | ✅ | — |
| Code review for missed reuse | ✅ | ✅ | — |
| Anti-pattern: writing without reuse check | — | ✅ | — |
| Anti-pattern: duplicating utilities | — | ✅ | — |
| DRY principle in Code Quality | — | ✅ | — |

---

## Coverage Summary

| File | Total Insights | Covered |
|------|---------------|---------|
| **KB (Best Practices)** | 70+ | **70+** ✅ |
| **GLOBAL_RULES.md** | 70+ | **55+** ✅ |
| **~/.claude/CLAUDE.md** | 70+ | **15+** ✅ |

**Note**: Not all insights need to be in all files. KB is comprehensive reference, GLOBAL_RULES has actionable patterns, CLAUDE.md has quick-reference commands.

---

## Auto-Application Triggers

These patterns will be suggested/applied in future sessions:

1. **Plan mode** - Triggered for complex tasks (multi-file, architecture)
2. **Reuse check** - Triggered before any new code implementation
3. **Subagents** - Triggered for investigation/verification tasks
4. **Duplication check** - Part of code review workflow
5. **Worktrees** - Suggested when parallel work detected
6. **Verification criteria** - Reminded when implementing features
7. **Self-improving CLAUDE.md** - Suggested after corrections

---

**Tags**: #checklist #verification #claude-code #integration
# Claude Code Official Best Practices

**Source**: code.claude.com/docs (February 2026)
**Last Updated**: 2026-02-04

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

**Tags**: #claude-code #best-practices #context-management #subagents #sessions #team-tips #power-user
# Claude Code + Unity MCP Development Workflow

**Created**: 2026-01-16
**Purpose**: Document proven workflow patterns for rapid Unity development with Claude Code, Unity MCP, and JetBrains Rider MCP

---

## Overview

This workflow achieves **5-10x faster iteration** compared to traditional Unity development by:
1. Eliminating context-switching between tools
2. Immediate error detection via MCP
3. Knowledgebase-augmented pattern recognition
4. Structured project documentation

---

## Core Workflow: MCP-First Development

```
┌─────────────────────────────────────────────────────────────┐
│  1. Read file(s) with context                               │
│  2. Make targeted edit (Edit tool)                          │
│  3. mcp__UnityMCP__refresh_unity(compile: "request")        │
│  4. mcp__UnityMCP__read_console(types: ["error"])           │
│  5. If errors → fix and repeat from step 2                  │
│  6. mcp__UnityMCP__validate_script() for confirmation       │
└─────────────────────────────────────────────────────────────┘
```

### Timing Comparison

| Action | Traditional | MCP-First |
|--------|-------------|-----------|
| Detect compilation error | 30-120s (wait for Unity) | <5s |
| Verify fix worked | 30-120s (Unity recompile) | <5s |
| Find file in project | 10-30s (manual search) | <2s |
| Understand type definition | 30-60s (navigate code) | <5s |

---

## Essential MCP Tools

### Unity MCP (Primary)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `read_console` | Get Unity console messages | After EVERY edit |
| `validate_script` | Check script compiles | Confirm fix worked |
| `refresh_unity` | Force recompilation | After file changes |
| `find_gameobjects` | Locate scene objects | Scene queries |
| `manage_components` | Add/modify components | Runtime setup |
| `manage_gameobject` | Create/modify GameObjects | Scene building |
| `manage_scene` | Scene operations | Load/save scenes |

### JetBrains Rider MCP (Secondary)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `search_in_files_by_text` | Fast text search | Find usages across project |
| `get_symbol_info` | Type definitions | Understand APIs |
| `get_file_problems` | Roslyn diagnostics | Catch errors Unity misses |
| `rename_refactoring` | Safe rename | Refactoring |
| `find_files_by_name_keyword` | Find files | Locate by partial name |

---

## Project Setup Requirements

### 1. CLAUDE.md (Critical)

Every Unity project needs a `CLAUDE.md` with:

```markdown
# Project Name

## Quick Reference
- Unity Version: X.X.X
- Target Platform: iOS/Android/etc
- Render Pipeline: URP/HDRP/Built-in

## Key Files
| File | Purpose |
|------|---------|
| path/to/MainScript.cs | Description |
| path/to/Manager.cs | Description |

## Build Commands
./build.sh

## Architecture
[Diagram or description]

## Common Issues
[Known problems and fixes]
```

### 2. Unity MCP Connection

Ensure Unity MCP server is running:
- Package: `com.coplaydev.unity-mcp`
- Default port: 6400
- Check: `mcp__UnityMCP__manage_editor(action: "telemetry_ping")`

### 3. Knowledgebase Access

Symlink knowledgebase for cross-session memory:
```bash
ln -sf ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase ~/.claude/knowledgebase
```

---

## Code Pattern Library

### Input System Compatibility

```csharp
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;

[SerializeField] private Key toggleKey = Key.Tab;

void Update()
{
    if (Keyboard.current != null && Keyboard.current[toggleKey].wasPressedThisFrame)
    {
        DoAction();
    }
}
#else
[SerializeField] private KeyCode toggleKey = KeyCode.Tab;

void Update()
{
    if (Input.GetKeyDown(toggleKey))
    {
        DoAction();
    }
}
#endif
```

### Editor Persistence for Runtime Objects

```csharp
#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
#endif

void CreatePersistentObject(string name)
{
    var obj = new GameObject(name);

    #if UNITY_EDITOR
    if (!Application.isPlaying)
    {
        Undo.RegisterCreatedObjectUndo(obj, $"Create {name}");
        EditorUtility.SetDirty(gameObject);
        EditorSceneManager.MarkSceneDirty(gameObject.scene);
    }
    #endif
}
```

### Read-Only Property with Setter Method

```csharp
// Private backing field
[SerializeField] private MyType _value;

// Read-only property (external code)
public MyType Value => _value;

// Controlled setter with side effects
public void SetValue(MyType newValue)
{
    _value = newValue;
    // Configure related fields
    OnValueChanged();
}
```

### Verbose Logging Control

```csharp
[Header("Debug")]
[Tooltip("Enable verbose logging (disable to reduce console spam)")]
public bool verboseLogging = false;

// One-time log tracking
private bool _loggedInit;

void Start()
{
    if (verboseLogging && !_loggedInit)
    {
        Debug.Log($"[{GetType().Name}] Initialized");
        _loggedInit = true;
    }
}

void Update()
{
    // Periodic logging (not every frame)
    if (verboseLogging && Time.frameCount % 60 == 0)
    {
        Debug.Log($"[{GetType().Name}] State: {currentState}");
    }
}
```

### UI Toolkit Programmatic Creation

```csharp
private VisualElement CreatePanelProgrammatically()
{
    var container = new VisualElement();
    container.style.position = Position.Absolute;
    container.style.top = 10;
    container.style.left = 10;
    container.style.backgroundColor = new Color(0, 0, 0, 0.8f);
    container.style.paddingTop = 10;
    container.style.paddingBottom = 10;
    container.style.paddingLeft = 15;
    container.style.paddingRight = 15;
    container.style.borderTopLeftRadius = 8;
    // ... more styling

    var title = new Label("Panel Title");
    title.style.fontSize = 16;
    title.style.color = Color.white;
    title.style.unityFontStyleAndWeight = FontStyle.Bold;
    container.Add(title);

    return container;
}
```

---

## Debugging Workflow

### Step 1: Check Console First
```
mcp__UnityMCP__read_console(count: 10, types: ["error", "warning"])
```

### Step 2: Validate Specific Script
```
mcp__UnityMCP__validate_script(uri: "Assets/Scripts/MyScript.cs", level: "standard")
```

### Step 3: Force Refresh if Needed
```
mcp__UnityMCP__refresh_unity(scope: "scripts", compile: "request", wait_for_ready: true)
```

### Step 4: Check Again
```
mcp__UnityMCP__read_console(count: 5, types: ["error"])
```

---

## Best Practices

### Do

1. **Check console after EVERY edit** - Catch errors immediately
2. **Read files before editing** - Understand context
3. **Make small, targeted edits** - One change per verify cycle
4. **Document patterns in KB** - Future sessions benefit
5. **Use CLAUDE.md** - Reduces context-gathering reads
6. **Validate before proceeding** - Don't assume success

### Don't

1. **Don't make multiple changes without verifying** - Harder to debug
2. **Don't skip console checks** - Errors compound
3. **Don't ignore warnings** - They often become errors
4. **Don't guess file paths** - Use Glob/search tools
5. **Don't trust "it should work"** - Verify with MCP

---

## Troubleshooting

### Unity MCP Not Responding

1. Check Unity is running
2. Check MCP package installed: `com.coplaydev.unity-mcp`
3. Try: `mcp__UnityMCP__manage_editor(action: "telemetry_ping")`
4. Restart Unity if needed

### Compilation Errors After Edit

1. Read the full error message carefully
2. Check the specific line number
3. Read surrounding code for context
4. Fix and verify with `validate_script`

### Script Changes Not Detected

1. Force refresh: `refresh_unity(scope: "scripts", compile: "request")`
2. Check for syntax errors blocking compilation
3. Verify file saved correctly

---

## Related Documentation

- `LEARNING_LOG.md` - Discovery journal with specific examples
- `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` - AR/VFX patterns
- `MetavidoVFX-main/CLAUDE.md` - Project-specific patterns
- `QUICK_REFERENCE.md` - VFX properties cheat sheet

---

**Last Updated**: 2026-01-16
**Category**: workflow|claude-code|unity-mcp|rider|development
# Oh-My-ClaudeCode & OpenCode Patterns Reference

**Sources**:
- https://github.com/Yeachan-Heo/oh-my-claudecode
- https://github.com/code-yeongyu/oh-my-opencode

**Extracted**: 2026-01-22
**Purpose**: Best practices for multi-agent orchestration without external dependencies

---

## Core Philosophy

> "Zero learning curve. Maximum power."
> "Don't make users learn commands—detect intent and activate automatically."

**Key Insight**: Auto-detect intent from conversation, don't require explicit commands.

### Auto-Detection in Action

The `auto-detect-agent.sh` hook analyzes every prompt and automatically:

| Pattern Detected | Mode Activated | Agent Suggested |
|------------------|----------------|-----------------|
| "setup", "implement", "create" | PERSIST | — |
| "debug", "analyze", "why" | DEEP | — |
| "fix all", "across project" | PARALLEL | — |
| >50 words | ULTRAWORK | — |
| "status", "what is" (<15 words) | QUICK | health-monitor |
| CS0246, "error", "broken" | — | unity-error-fixer |
| "still doesn't work" | DEEP | unity-error-fixer-deep |
| "architect", "design system" | DEEP | tech-lead-advisor |

**Users just talk naturally.** The system adapts.

---

## Agent Architecture Patterns

### 1. Tiered Model Routing

| Tier | Model | Use Case | Cost |
|------|-------|----------|------|
| `-low` | Haiku | Quick checks, simple tasks | 0.3x |
| (default) | Sonnet | Standard work | 1x |
| `-high` | Opus | Complex reasoning, architecture | 3-5x |

**Example**: `scientist-low`, `scientist`, `scientist-high`

### 2. Role Separation

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Architect/Oracle** | Analyze, recommend | Modify files |
| **Researcher/Librarian** | Search, synthesize | Make changes |
| **Executor/Sisyphus** | Implement | Delegate, spawn agents |
| **Critic** | Review, find issues | Fix issues |

**Key Insight**: Architects should be READ-ONLY to force analysis before action.

### 3. Todo Discipline (Iron Law)

From Executor pattern:
```
1. Multi-step work → TodoWrite breakdown FIRST
2. Mark in_progress BEFORE starting each task
3. Complete and mark IMMEDIATELY after finishing
4. NEVER batch completions
```

### 4. Verification Protocol

Before claiming completion:
```
1. What command PROVES the claim?
2. Execute verification (test, build, lint)
3. Read and validate ACTUAL output
4. Only then claim completion WITH EVIDENCE
```

**Red Flags** (require reverification):
- Hedging language ("should work", "probably fixed")
- Satisfaction expressed before running tests
- Claims without evidence

---

## Magic Keywords

| Keyword | Behavior |
|---------|----------|
| `ralph` | Persistence mode - continue until VERIFIED complete |
| `ulw` | Maximum parallel execution |
| `plan` | Structured planning interview |
| `autopilot` | Full autonomous workflow |
| `ultrawork` | All capabilities combined |

**Composable**: `ralph ulw: migrate database`

---

## Structured Output Markers

### Scientist/Research Markers

```
[OBJECTIVE] Task goal statement
[DATA] Dataset loaded, N records
[FINDING] Discovery with evidence
[STAT:name] Statistical evidence (p-value, CI, effect size)
[LIMITATION] Acknowledged constraint
[STAGE:begin/end] Phase tracking
```

### Architect/Analysis Markers

```
[ANALYSIS] Current state summary
[FINDING] Issue with file:line reference
[RECOMMENDATION] Proposed approach
[TRADE-OFF] Pros/cons evaluation
[RISK] Potential problems
[NEXT] Handoff instructions
```

### Quality Gates

Every [FINDING] requires evidence within 5-10 lines:
- Source URL or file:line
- Sample size or scope
- Confidence qualifier
- Statistical backing where applicable

---

## 3-Failure Circuit Breaker

```
Failure 1: (silent tracking)
Failure 2: [WARNING] - 1 more triggers escalation
Failure 3: [CIRCUIT BREAKER] - Stop, escalate, re-evaluate
```

**Actions on Circuit Break**:
1. Stop current approach
2. Search KB for existing solutions
3. Consider architectural issues
4. Escalate to higher model or user

---

## Research Workflow (5 Steps)

From Researcher/Librarian pattern:

```
1. CLARIFY - Specific research question
2. IDENTIFY - Relevant external sources
3. FORMULATE - Targeted search queries
4. GATHER - Information from multiple sources
5. SYNTHESIZE - Findings with attribution
```

**External Sources Priority**:
1. Official documentation
2. GitHub repos with working code
3. Package repos (npm, PyPI)
4. Stack Overflow (verified answers)
5. Technical blogs

**Always Include**:
- Version compatibility notes
- Code examples when available
- Flagged outdated information

---

## Parallel Execution Pattern

From oh-my-opencode:

```
Main Agent (Opus) - Focused execution
  ├── Background Agent 1 (Haiku) - Codebase mapping
  ├── Background Agent 2 (Haiku) - Documentation lookup
  └── Background Agent 3 (Haiku) - Test discovery
```

**Benefits**:
- Main agent stays focused
- Cheap models do parallel exploration
- Reduces context bloat

---

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| Generic advice | Specific file:line references |
| "Should work" claims | Verified with evidence |
| Batch completions | Complete one at a time |
| Architects that edit | Read-only analysis first |
| Single model for all | Tiered model routing |
| Manual keyword invocation | Auto-detection from context |

---

## Integration with Your System

### Already Implemented (via hooks)

- ✅ Auto-detection (auto-detect-agent.sh)
- ✅ Magic keywords (magic-keywords.sh)
- ✅ Circuit breaker (failure-tracker.sh)
- ✅ Read-only architect (tech-lead-advisor.md)

### To Add

- [ ] Tiered agent variants (-low, -high)
- [ ] Structured output markers in all agents
- [ ] Quality gates enforcement
- [ ] Parallel background exploration
- [ ] Verification protocol in executor agents

---

## Quick Reference

### When to Use Each Tier

| Task | Tier | Agent |
|------|------|-------|
| Console check | low | unity-console-checker |
| Quick search | low | code-searcher |
| Standard fix | default | unity-error-fixer |
| Research | default | research-agent |
| Architecture | high | tech-lead-advisor |
| Complex debug | high | unity-error-fixer-deep |

### When to Use Keywords

| Situation | Keyword |
|-----------|---------|
| Task keeps stopping early | `persist` |
| Multiple independent subtasks | `parallel` |
| Need thorough analysis | `deep` |
| Want hands-off execution | `ultrawork` |
| Quick simple task | `quick` |

---

## Oh-My-OpenCode Specific Patterns

**Source**: https://github.com/code-yeongyu/oh-my-opencode

### Multi-Model Orchestration

oh-my-opencode uses PURPOSE-BASED model routing:

| Agent | Model | Purpose |
|-------|-------|---------|
| **Sisyphus** | Opus 4.5 | Primary orchestrator |
| **Oracle** | GPT 5.2 | Architecture & debugging consultation |
| **Frontend Engineer** | Gemini 3 Pro | UI/UX development |
| **Librarian** | Sonnet 4.5 | Docs & codebase exploration |
| **Explore** | Grok | Fast grep/search |

**Key Insight**: Different models excel at different tasks. Route by purpose, not just complexity.

### Todo Continuation Enforcer

Prevents sessions from ending with incomplete work:

```bash
# Stop hook checks for incomplete todos
# Warns user if tasks remain pending
# Suggests using "persist" keyword next time
```

**Implementation**: ~/.claude/hooks/todo-enforcer.sh

### Ultrathink Keyword

More than just "deep" - maximum reasoning depth:

```
[ULTRATHINK MODE]
- Think through ALL implications before acting
- Consider 3+ alternative approaches
- Identify hidden assumptions and edge cases
- Question your first instinct
- Verify reasoning chain is sound
- Only proceed when confident in approach
```

**Trigger**: `ultrathink` or `ut`

### Comment Quality (Human-Indistinguishable Code)

oh-my-opencode enforces comment quality:
- Auto-remove unnecessary comments
- Require justification for remaining comments
- Code should look like human wrote it

### Temperature Control

For code agents: **Temperature 0.1** (max 0.3)
- Consistent output
- Deterministic behavior
- Reliable refactoring

### LSP/AST Integration

- Full Language Server Protocol support
- AstGrep for deterministic transformations
- Surgical modifications vs token-based rewrites

### Aggressive Context Management

**Delegation Pattern**:
```
Main Agent (focused) ──► Spawns cheap models for:
  ├── Background exploration
  ├── Documentation lookup
  └── Test discovery
```

**Benefits**: Main context stays lean, parallel work happens in background.

---

### Already Implemented (via hooks)

- ✅ Auto-detection (auto-detect-agent.sh)
- ✅ Magic keywords including ultrathink (magic-keywords.sh)
- ✅ Circuit breaker (failure-tracker.sh)
- ✅ Read-only architect (tech-lead-advisor.md)
- ✅ Todo Continuation Enforcer (todo-enforcer.sh)
- ✅ Tiered agent variants (-quick, -deep)
- ✅ Structured output markers (_AGENT_SHARED_RULES.md)

---

**Last Updated**: 2026-01-22
**Source Repos**:
- https://github.com/Yeachan-Heo/oh-my-claudecode
- https://github.com/code-yeongyu/oh-my-opencode

# Global Rules

**For**: All AI tools | **Goal**: Complete tasks faster with fewer errors

---

## Core Loop (Anthropic-Aligned)

```
Explore → Plan → Code → Commit → Log discovery
```

**Simple tasks**: Search KB → Act → Done

---

## Verification (Highest Leverage)

Give Claude a way to verify its work:

| Before | After |
|--------|-------|
| "implement validation" | "write validateEmail. test: user@x.com=true. run tests after" |
| "fix build" | "build fails with [error]. fix and verify build succeeds" |
| "make it better" | "[paste screenshot] implement this. take screenshot and compare" |

---

## Before Any Change

Ask: **"Do we really need this?"** and **"Could this break something?"**

When in doubt: Ask user, keep changes minimal, prefer reversible.

---

## Session Start

1. `mcp-kill-dupes` (if MCP tools slow)
2. Read project CLAUDE.md
3. Start working

---

## Project Identification (Avoid Wrong Project)

When multiple similarly-named projects exist, **check modified dates** to identify the active one:

```bash
# Find most recently modified project
ls -lt ~/Documents/GitHub/ | head -10

# Check specific project's last modification
stat -f "%Sm" ~/Documents/GitHub/portals_main

# Find recently modified files in a project
find ~/Documents/GitHub/project_name -type f -mtime -1 | head -20

# Git-based checks (most reliable)
cd ~/Documents/GitHub/project_name && git log -1 --format="%ci %s"  # Last commit date + message
cd ~/Documents/GitHub/project_name && git status --short            # Uncommitted changes = active
cd ~/Documents/GitHub/project_name && git log --oneline -5          # Recent commit history
```

**Rules:**
- Most recently modified = likely the active project
- **Git status with uncommitted changes = definitely active**
- Recent git commits = strong indicator of current project
- Check CLAUDE.md for canonical project paths before assuming
- Don't confuse `portals_v4`, `portals_main`, `portals_v4-Unity2` etc.
- When in doubt, ask user which project they mean

**Example - Canonical Paths (James's Setup):**
| Project | Correct Path | Wrong Paths |
|---------|--------------|-------------|
| Portals V4 | `~/Documents/GitHub/portals_main/` | `portals_v4`, `portals_v4-Unity2` |
| MetavidoVFX | `~/Documents/GitHub/Unity-XR-AI/MetavidoVFX-main/` | `~/UnityProjects/...` |
| KnowledgeBase | `~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/` | other KB copies |

---

## On Error

1. Search `_QUICK_FIX.md` first
2. If not found, fix it and ADD to `_QUICK_FIX.md`

---

## KB Access

**Local**: `~/.claude/knowledgebase/`
**CDN**: `https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/`

Fetch on-demand. Don't preload.

---

## KB Search Commands (Zero Tokens)

```bash
kbfix "CS0246"        # Error → Fix lookup (instant)
kbtag "vfx"           # Find pattern files by tag
kb "hologram depth"   # Search all KB files
kbrepo "hand track"   # Search 520+ GitHub repos
ss                    # Screenshot for context
```

**Common Lookups**:
| Need | Command | File |
|------|---------|------|
| Fix error | `kbfix "error"` | _QUICK_FIX.md |
| VFX patterns | `kbtag "vfx"` | _VFX_MASTER_PATTERNS.md |
| MCP reference | `kb "batch_execute"` | _UNITY_MCP_MASTER.md |
| GitHub repos | `kbrepo "hand"` | _MASTER_GITHUB_REPO_KNOWLEDGEBASE.md |

---

## KB vs Online Research

| Situation | Action |
|-----------|--------|
| Error code (CS0246, etc) | KB first → `_QUICK_FIX.md` |
| Unity/VFX/AR patterns | KB first → `_*_MASTER.md` files |
| Package versions/updates | Online research (KB may be stale) |
| New API/framework | Online research → add to KB |
| GitHub repos/examples | KB first → `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` |

**Rule**: KB for known patterns, Online for fresh/evolving info.

---

## Tool Selection

| Task | Tool | Notes |
|------|------|-------|
| Implementation | Claude Code + MCP | Primary, best integration |
| Research | Gemini CLI | FREE 1M context |
| Quick edits | Windsurf | Cascade for multi-file |
| Code gen | Codex | AGENTS.md compatible |
| Navigation | Rider + JetBrains MCP | Indexed search (5-10x faster) |

**Rider Open?** Use JetBrains MCP, not raw Grep/Glob/Read.

---

## Fast Workflows

**Fix Error (3 calls)**:
1. `read_console(types=["error"], count=3)`
2. `get_file_text_by_path(path, maxLinesCount=100)`
3. `Edit(file, old, new)`

**Implement Feature (4 calls)**:
1. `search_in_files_by_text("pattern", fileMask="*.cs")`
2. `get_file_text_by_path(match)`
3. `Edit(file, old, new)`
4. `read_console(types=["error"], count=3)`

**Debug Runtime (4 calls)**:
1. `read_console(types=["error","warning"], count=10)`
2. `find_gameobjects(search_term="Name", page_size=5)`
3. `manage_components(target=id, page_size=5)`
4. `get_file_text_by_path(script)`

---

## Session Management

**Triggers**:
- `/compact`: Context >100K, switching sub-tasks
- `/clear`: Unrelated task, context >150K
- New session: Context >180K, >2 hours, different project

**⚠️ PROACTIVE COMPACTION (CRITICAL)**:
- **NEVER let compaction block user workflow**
- At ~80K tokens: Proactively prepare for compaction (summarize internally)
- At ~100K tokens: Use background agent to pre-summarize if possible
- At ~120K tokens: Compact immediately between responses
- If compaction blocks user: FAILURE - add to learning log

**Persistence (before ending)**:
```bash
git add -A && git commit -m "WIP: <summary>"
/rename <descriptive-name>
```

**Resume**:
```bash
claude --continue          # Most recent
claude --resume <name>     # By name
claude --from-pr 123       # From PR
```

---

## Context Commands

| Command | When |
|---------|------|
| `/cost` | Check token usage |
| `/clear` | Switch tasks |
| `/compact <focus>` | Shrink context |
| `/rewind` or `Esc+Esc` | Restore checkpoint |
| `/rename` | Name session |
| `/model` | Switch model |

---

## Plan Mode (Complex Tasks)

- Start **every complex task** in plan mode (`Shift+Tab` twice)
- Pour energy into plan → Claude 1-shots implementation
- **When sideways**: Switch back to plan mode, don't keep pushing

---

## MANDATORY: Reuse Check

**Before writing new code, ALWAYS search for existing solutions:**

1. **Codebase** - `grep`/`search_in_files` for similar functions
2. **Knowledgebase** - `kbfix`, `kbtag`, `kb "pattern"`
3. **GitHub repos** - `kbrepo "topic"` (520+ repos)
4. **Online docs** - Built-in framework solutions

**Anti-pattern**: Writing new code when reusable function exists.

---

## Common Failure Patterns (Avoid)

| Pattern | Problem | Fix |
|---------|---------|-----|
| Kitchen sink | Context full of unrelated info | `/clear` between tasks |
| Repeated corrections | Failed approaches pollute context | After 2 failures, `/clear` |
| Over-specified CLAUDE.md | Rules get ignored | Ruthlessly prune |
| Trust-then-verify gap | Plausible but broken code | Always provide verification |
| Infinite exploration | Context consumed by investigation | Use subagents |

---

## Anti-Patterns (Never Do)

- Grep/Read when Rider open (use JetBrains)
- Write when Edit works
- Full hierarchy when find_gameobjects suffices
- Console check after every micro-edit
- Re-read files just edited
- Search without fileMask scope
- Sequential edit→verify per file (batch instead)

---

## Code Quality Principles

All features must be:
- **Fast** - Performance-first, minimize allocations
- **Modular** - Single responsibility, clear interfaces
- **Simple** - Obvious code > clever code
- **Scalable** - O(1) or O(log n) algorithms
- **DRY** - Search for existing solutions first

---

## Power Prompts

| Technique | Prompt |
|-----------|--------|
| Challenge | "Grill me on these changes" |
| Prove it | "Prove to me this works" |
| Elegant redo | "Knowing everything, implement the elegant solution" |
| Self-improve | "Update CLAUDE.md so you don't make that mistake again" |

---

## Subagent Patterns

- Append **"use subagents"** to any request for more compute
- Offload tasks → keeps main context clean
- Example: "investigate auth using subagents"

---

## Token Efficiency & Auto-Throttling

- Stay under 95% weekly limit
- Prefer Edit over Write
- Use agents for 3+ step tasks (independent budgets)
- Concise responses, no preambles
- `/clear` between tasks, `/compact` when >100K

**Auto Model Selection** (throttle based on task):

| Task Type | Model | Trigger |
|-----------|-------|---------|
| Typo/simple fix | Haiku (0.3x cost) | Single-line edit, known pattern |
| Standard work | Sonnet (1x cost) | Default, multi-file edits |
| Architecture/complex | Opus (3x cost) | "deep", "architecture", >5 files |
| Research | Gemini (FREE) | "research", exploration tasks |

**Auto-Detection Triggers**:
- `deep` or `think hard` in prompt → Opus + extended thinking
- `quick` in prompt → Haiku
- `research` or exploratory questions → Gemini (FREE 1M context)
- Error after 2 attempts → escalate to Opus

**Monitoring (Zero Overhead)**:
- Hooks track: failures, escalations, session state
- `/cost` shows usage (run periodically, not every turn)
- Failure tracker auto-escalates after 3 failures

**Claude Code Defaults** (optimal):
```json
{
  "MAX_THINKING_TOKENS": 10000,
  "BASH_DEFAULT_TIMEOUT_MS": 60000,
  "ENABLE_TOOL_SEARCH": "auto:5"
}
```

---

## Self-Healing Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU | >90% | Kill bg processes |
| Memory | >95% | `purge` |
| MCP | >30s response | `mcp-kill-dupes` |
| Tokens | >150K | `/compact` |

---

## ⚡ Workflow Slowdown Prevention (AUTO-FIX)

**PROACTIVELY identify and fix these common slowdowns:**

| Slowdown | Detection | Auto-Fix |
|----------|-----------|----------|
| Unity MCP not running | Tool returns "No Unity Editor instances" | Notify user, suggest opening Unity project |
| Hook timeout | >15s hook execution | Log to FAILURE_LOG.md, skip if non-critical |
| Build waiting | User waiting for build output | Run builds in background, notify on completion |
| Context too large | >100K tokens | Proactive compaction before blocking |
| Multiple repo work | Switching between repos | Batch operations, parallel commits |
| Manual verification | Repeated check commands | Use TodoWrite to track, batch verifications |
| Research loops | Same search >3 times | Cache results in session, use KB |
| Tool failures | Same tool fails 3x | Try alternative, log pattern |

**Prevention Rules**:
1. **Never block user for >30 seconds** - use background tasks
2. **Batch similar operations** - don't make 5 separate commits
3. **Cache expensive lookups** - reuse file reads within session
4. **Parallelize independent tasks** - use multiple tool calls
5. **Pre-fetch likely needs** - if editing Unity, check MCP first
6. **Proactive health checks** - run silently, fix before user notices

**On any slowdown**: Log to LEARNING_LOG.md for pattern analysis.

---

## MCP Quick Fixes

| Issue | Fix |
|-------|-----|
| Unity MCP not responding | Unity → Window → MCP for Unity → Start Server |
| MCP slow | Run `mcp-kill-dupes` |
| After Unity build | Restart Unity Editor |

---

## Auto-Learning (ALWAYS ACTIVE)

**Every session, test, research task, and interaction should contribute to system intelligence.**

### KB Relevance Check (On Audits)

When running `/kb-full`, audits, or cleanup tasks:
1. **Check current projects**: `ls -lt ~/Documents/GitHub/ | head -10`
2. **Verify Quick Access matches needs**: Are the 7 files in Quick Access relevant to active work?
3. **Prune stale content**: Archive files for inactive projects (>6 months untouched)
4. **Add missing topics**: If current project needs aren't covered, create or update KB files
5. **Update _TRUSTED_COMMUNITY_SOURCES.md**: Add new forums/experts discovered during research

### What to Log

| Event | Where | Trigger |
|-------|-------|---------|
| Error fixed | `_QUICK_FIX.md` | Any new error→fix mapping |
| Pattern discovered | `LEARNING_LOG.md` | Reusable solution found |
| Success (first try) | `SUCCESS_LOG.md` | Tool/approach worked immediately |
| Friction (3+ attempts) | `FAILURE_LOG.md` | Auto-logged by failure-tracker.sh |
| User preference | `_USER_PATTERNS_JAMES.md` | Repeated requests or corrections |
| Community insight | `_TRUSTED_COMMUNITY_SOURCES.md` | Trusted forum/user found |

### Auto-Learning Hooks (Active)

- `failure-tracker.sh` - Logs failures + successes per tool
- `auto-intelligence.sh` - Searches KB on relevant prompts (disabled for speed)
- `session-health-check.sh` - Auto-fixes environment issues

### Format

```
Date | Context | Discovery | Impact
2026-02-05 | Unity UAAL | VSync causes 15fps | Fix: vSyncCount=0 before splash
```

---

## 🔄 Auto-Improvement System (ALWAYS ACTIVE)

**Every interaction should improve future workflows. This is not optional.**

### Development Workflow Auto-Improve

| Observation | Auto-Action |
|-------------|-------------|
| Repeated build command | Add to project CLAUDE.md Quick Start |
| Manual step >2x | Create automation script |
| Config discovered | Document in relevant spec |
| New pattern used successfully | Add to KB |
| Code reused 3x | Extract to shared utility |

### Testing Auto-Improve

| Observation | Auto-Action |
|-------------|-------------|
| Manual test repeated | Create automated test or checklist |
| Test failure pattern | Add to _AUTO_FIX_PATTERNS.md |
| Missing test coverage | Note in TODO.md |
| Successful test approach | Document in LEARNING_LOG.md |
| Device-specific issue | Add to platform section in CLAUDE.md |

### Debugging Auto-Improve

| Observation | Auto-Action |
|-------------|-------------|
| Error fixed | Add to _QUICK_FIX.md |
| Root cause found | Document pattern in KB |
| Debug command useful | Add to project tooling section |
| Log location discovered | Add to troubleshooting docs |
| Symptom→cause mapping | Add to _AUTO_FIX_PATTERNS.md |

### Auto-Fix Escalation

```
Attempt 1: Check _QUICK_FIX.md and _AUTO_FIX_PATTERNS.md
Attempt 2: Search KB for similar issues
Attempt 3: Try alternative approach, log both attempts
Attempt 4: Search community sources (_TRUSTED_COMMUNITY_SOURCES.md)
Attempt 5: Ask user, document new solution
```

### Continuous Improvement Triggers

**After EVERY task completion**:
1. Was there friction? → Log to FAILURE_LOG.md
2. Did something work first try? → Log to SUCCESS_LOG.md
3. New pattern discovered? → Add to relevant KB file
4. Repeated manual step? → Create script/alias
5. Missing documentation? → Update CLAUDE.md or specs

**After EVERY error resolution**:
1. Add error→fix to _QUICK_FIX.md
2. If pattern applies to multiple projects → Add to _AUTO_FIX_PATTERNS.md
3. If community helped → Add source to _TRUSTED_COMMUNITY_SOURCES.md

**Weekly (automated via cron)**:
- `kb-health-check.sh` - Audit KB for stale content
- Review LEARNING_LOG.md for patterns worth promoting

---

## File Safety (CRITICAL)

- **NEVER delete files** without explicit user instruction
- Moving, renaming, deprecating = OK
- Deleting = ONLY with explicit "delete" or "remove"
- When in doubt, ask first

---

## Consolidation Safety (CRITICAL)

When consolidating, archiving, deduping, or cleaning up:

1. **Triple-check before archiving**: Read key sections of files being removed
2. **Verify unique content**: Ensure nothing critical is lost (grep for unique terms)
3. **Keep archive accessible**: Move to `_archive/`, don't delete
4. **Test after cleanup**: Verify remaining files still have all needed info
5. **Balance signal vs noise**: Not all duplication is bad (summaries pointing to full docs = good)

**Anti-patterns**:
- Blind culling based on file names alone
- Archiving without reading content
- Removing "verbose" versions without checking for unique details
- Consolidating before understanding what each file provides

**Recovery**: Archives at `KnowledgeBase/_archive/` - restore if needed.

---

## What NOT to Do

- ❌ Load entire KB into context
- ❌ Ask permission for every small action
- ❌ Over-engineer simple tasks
- ❌ Add comments/docs unless asked
- ❌ Refactor code you didn't change
- ❌ **Delete files** unless user explicitly says "delete"
- ❌ Use AI for automation when scripts/hooks work better

---

## Persistent Memory & Cross-Tool Intelligence

### Memory Layers (Speed → Persistence)

| Layer | Speed | Persistence | Use Case |
|-------|-------|-------------|----------|
| Conversation | Instant | Session | Current task |
| claude-mem | ~2s | Permanent | Semantic recall |
| KnowledgeBase | <1s | Permanent | Patterns, fixes |
| LEARNING_LOG | Instant | Permanent | Discoveries |
| Git history | ~1s | Permanent | Code archaeology |

### Auto-Intelligence Gathering

**On every significant task**:
1. Search KB first (`kbfix`, `kbtag`, `kb`)
2. If pattern not found → research online
3. Triple-verify findings
4. Add to appropriate KB file:
   - Error fix → `_QUICK_FIX.md`
   - Pattern → `_*_MASTER.md`
   - Discovery → `LEARNING_LOG.md`

### Cross-Tool Context Sharing

**Shared Files (all tools read)**:
```
~/GLOBAL_RULES.md              ← Universal rules
~/KnowledgeBase/               ← Symlinked to all tools
~/KnowledgeBase/_QUICK_FIX.md  ← Error solutions
~/KnowledgeBase/LEARNING_LOG.md ← Discoveries
```

**Tool-Specific Context**:
```
~/.claude/CLAUDE.md           ← Claude Code
~/.gemini/GEMINI.md           ← Gemini CLI
~/.codex/AGENTS.md            ← Codex
project/CLAUDE.md             ← Project overrides
```

### Rollover Context Export

When switching tools (token limit reached):
```bash
# 1. Commit work
git add -A && git commit -m "WIP: <summary>"

# 2. Export context (paste in new tool)
"Read ~/GLOBAL_RULES.md, ~/KnowledgeBase/_KB_INDEX.md, and project CLAUDE.md"

# 3. Reference recent work
"Continue from commit <sha>: <task description>"
```

**Rollover Order**: Claude (200K) → Gemini (1M FREE) → Codex (128K)

### Auto-Improvement Loop

```
┌─────────────────────────────────────────────────────────────┐
│                 AUTO-IMPROVEMENT LOOP                        │
├─────────────────────────────────────────────────────────────┤
│  1. Task arrives                                             │
│  2. Search KB for existing solution                          │
│  3. If found → apply directly                                │
│  4. If not found → solve + research                          │
│  5. Verify solution works                                    │
│  6. Add to KB (if significant):                              │
│     - Error fix → _QUICK_FIX.md                              │
│     - Pattern → relevant _MASTER.md                          │
│     - Discovery → LEARNING_LOG.md                            │
│  7. Git commit → auto-syncs to all tools                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Cross-Tool Integration

**Shared Resources (Symlinked)**:
```
~/GLOBAL_RULES.md              ← This file (single source of truth)
~/.claude/knowledgebase/       → ~/KnowledgeBase/
~/.windsurf/knowledgebase/     → ~/KnowledgeBase/
~/.gemini/context/             → ~/KnowledgeBase/
~/.codex/knowledgebase/        → ~/KnowledgeBase/
```

**Rollover (Token Limit)**:
```
Claude Code (200K) → Gemini (1M FREE) → Codex (128K)
All read: GLOBAL_RULES.md, KnowledgeBase/, project CLAUDE.md
```

**Git Hook Auto-Sync**: Commits to KB → syncs to all tools via post-commit hook

---

## Key Files

| Need | File |
|------|------|
| Error fix | `_QUICK_FIX.md` |
| Auto-fix patterns | `_AUTO_FIX_PATTERNS.md` |
| Unity MCP | `_UNITY_MCP_MASTER.md` |
| VFX patterns | `_VFX_MASTER_PATTERNS.md` |
| Token tips | `_TOKEN_EFFICIENCY_COMPLETE.md` |
| Claude Code best practices | `_CLAUDE_CODE_OFFICIAL_BEST_PRACTICES.md` |
| All KB files | `_KB_INDEX.md` |

---

## Spec-Driven Development

```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement
```

**Use specs for**: >100 LOC, architecture changes, cross-team work
**Skip specs for**: Bug fixes, <50 LOC, config tweaks

---

## Common C# Fixes (Don't Research)

- CS0246 → Add using
- CS0103 → Check spelling or add using
- CS0029 → Add explicit cast
- NullRef in AR → TryGetTexture pattern

---

**Full reference**: `GLOBAL_RULES_FULL.md`
**Claude Code best practices**: `_CLAUDE_CODE_OFFICIAL_BEST_PRACTICES.md`
**Architecture deep dive**: `_CLAUDE_CODE_ARCHITECTURE_DEEP_DIVE.md`

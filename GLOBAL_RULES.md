# Global Rules

**For**: All AI tools | **Goal**: Complete tasks faster with fewer errors

---

## Core Loop (Anthropic-Aligned)

```
Explore → Plan → Code → Commit → Log discovery
```

**Simple tasks**: Search KB → Act → Done

---

## Fast Iteration (ALWAYS ASK FIRST)

Before ANY implementation: "What's the fastest way to test this?"

| Preference | Time | Example |
|------------|------|---------|
| Editor/unit test | ~5 sec | Unity Play mode, Jest |
| Simulator | ~1 min | iOS Simulator, Metro |
| Device incremental | ~5 min | build_minimal.sh |
| Device clean | ~10+ min | nuclear_clean.sh |

**Rule**: Never use a slower workflow when a faster one exists.
**KB**: `_DEV_ITERATION_WORKFLOWS.md` for detailed patterns.

---

## Auto-Unblock & Speed Control (MANDATORY)

**Sense when stalled → Auto-unblock → Auto-wake → Auto-speed-up**

### Stall Detection
| Symptom | Trigger | Action |
|---------|---------|--------|
| Same error 3+ times | Auto-detect | Research online, try alternative approach |
| Waiting >30s for response | Auto-detect | Cancel, retry, or skip and continue |
| Blocked on user input | Auto-detect | Make reasonable assumption, note it, proceed |
| Tool timeout | Auto-detect | Use fallback tool or skip non-critical |
| Single task taking too long | Auto-detect | Break into subtasks, parallelize |

### Speed Control
| Situation | Action |
|-----------|--------|
| User says "hurry" or "faster" | Reduce verbosity, parallelize more, skip non-critical |
| Multiple independent tasks | ALWAYS parallelize (one message, multiple tools) |
| Research + implementation | Spawn research agent, continue with what you know |
| Build running in background | Continue other tasks, check result later |

### Non-Blocking Principle (CRITICAL)

**Research, rules updates, and KB updates should NEVER block ongoing dev/debugging.**

| Task Type | Execution | Priority |
|-----------|-----------|----------|
| **Dev/Bug fixes** | Main thread, immediate | P0 - Never interrupted |
| **Rules/KB updates** | Background agent OR after fix complete | P2 - Don't block |
| **Research** | Spawn parallel agent | P1 - Inform but don't wait |
| **Documentation** | After code working | P3 - Last priority |

```
# Pattern: Non-blocking updates
1. Fix the bug FIRST
2. THEN update rules/KB (or spawn agent to do it)
3. NEVER stop fixing to document

# If rules need updating during debugging:
spawn_agent("Update GLOBAL_RULES with [pattern]", background=true)
continue_debugging()
```

### Auto-Wake Patterns
```
# If progress stops:
1. Check if waiting for something (build, agent, user)
2. If waiting is optional → continue with next task
3. If waiting is required → set timeout, do other work
4. Never just wait - always make progress
```

### Learning from Stalls
| Stall Type | Log To | Prevention |
|------------|--------|------------|
| Tool failure | `_QUICK_FIX.md` | Add fallback command |
| Research gap | `LEARNING_LOG.md` | Add to KB for next time |
| Approach failed | `FAILURE_LOG.md` | Document dead end |
| Slow workflow | `GLOBAL_RULES.md` | Add faster pattern |

---

## MANDATORY Auto-Debug (NEVER SKIP)

**This is PERMANENT and applies to ALL projects, toolchains, builds, CLIs, IDEs.**

### The Loop That Never Stops

```
WHILE bugs exist OR errors in console OR tests failing:
    1. Check for errors (console, tests, build output)
    2. If errors → fix → recheck
    3. If no errors → continue next task
    4. NEVER stop early - continue until ZERO errors
```

### Cross-Tool Auto-Debug Commands

| Environment | Check Command | Auto-Run After |
|-------------|---------------|----------------|
| **Unity (MCP)** | `read_console(types=["error"], count=10)` | Every file save |
| **Unity (Rider)** | `get_file_problems(filePath, projectPath)` | Every file save |
| **Unity (Log)** | `tail -100 ~/Library/Logs/Unity/Editor.log \| grep -E "error\|CS[0-9]{4}"` | Every build |
| **Node.js** | `npm test` or `npm run lint` | Every code change |
| **Python** | `pytest -v` or `python -m py_compile file.py` | Every code change |
| **Web** | Browser console, network tab errors | Every deploy |
| **Build Pipeline** | Check exit code + stderr | Every build |
| **Xcode (iOS)** | `xcodebuild -list` then build, check exit code | Every iOS build |
| **Android** | `./gradlew assembleDebug 2>&1 \| grep -i error` | Every Android build |
| **CMake/C++** | `cmake --build . 2>&1 \| grep -iE "error\|fatal"` | Every native build |
| **Go** | `go build ./... && go test ./...` | Every Go change |
| **Rust** | `cargo check && cargo test` | Every Rust change |
| **Shell Scripts** | `shellcheck script.sh` or `bash -n script.sh` | Every script change |

### Platform-Specific Commands

**macOS:**
```bash
# Check system logs
log show --predicate 'process == "Unity"' --last 5m --style compact

# Check Xcode build
xcodebuild -project *.xcodeproj -scheme Unity-iPhone -destination 'platform=iOS' build 2>&1 | xcpretty

# Check homebrew health
brew doctor
```

**Windows (PowerShell):**
```powershell
# Check Unity logs
Get-Content "$env:LOCALAPPDATA\Unity\Editor\Editor.log" -Tail 100 | Select-String "error|CS\d{4}"

# Check Visual Studio build
msbuild /t:Build /p:Configuration=Release 2>&1 | Select-String "error"
```

### KB & Global Setup Auto-Verify

| Check | Command | When |
|-------|---------|------|
| **KB symlinks valid** | `ls -la ~/.claude/knowledgebase ~/.windsurf/knowledgebase` | Session start |
| **MCP servers running** | `mcp-kill-dupes` then check `/context` | Session start |
| **Git hooks installed** | `ls .git/hooks/pre-commit` | After clone |
| **Global rules synced** | `diff ~/GLOBAL_RULES.md project/GLOBAL_RULES.md` | Before commit |
| **Scripting defines set** | Check Unity Player Settings | After package install |

### Build Pipeline Auto-Checks

| Pipeline | Pre-Build | Post-Build |
|----------|-----------|------------|
| **Unity iOS** | Check Team ID, Provisioning | Verify `.ipa` exists, check codesign |
| **Unity Android** | Check SDK/NDK paths, keystore | Verify `.apk`/`.aab`, check signing |
| **React Native** | `npx react-native doctor` | Check Metro, device connection |
| **Docker** | `docker compose config` | `docker compose logs \| grep -i error` |
| **CI/CD** | Lint workflow YAML | Check job exit codes, artifact uploads |

### Auto-Learning (Continuous)

| Event | Action | Where to Log |
|-------|--------|--------------|
| Fix worked | Log pattern | `_QUICK_FIX.md` |
| Fix failed 3x | Document + research | `FAILURE_LOG.md` |
| New best practice found | Add rule | `GLOBAL_RULES.md` |
| Deep research needed | Use WebSearch | Then add to KB |
| Success pattern | Log approach | `SUCCESS_LOG.md` |
| Test passed first try | Celebrate + log | `LEARNING_LOG.md` |

### Deep Research Triggers

**Auto-research online when:**
- Same error 3+ times with no fix
- New framework/API with no KB coverage
- Performance issue without clear cause
- Security concern without best practice

```bash
# Research workflow
WebSearch("best practice [topic] 2026") → Summarize → Add to KB
```

### This Is Non-Negotiable

- **DO NOT** wait for user to report errors
- **DO NOT** stop debugging before zero errors
- **DO NOT** skip console checks after code changes
- **DO** proactively check, fix, verify, repeat
- **DO** log every success and failure for future learning

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

## Parallel Agents (ALWAYS)

**Spawn multiple agents in parallel whenever possible:**

| Scenario | Do This | Not This |
|----------|---------|----------|
| Research 3 specs | 3 parallel Explore agents | 1 agent, 3 sequential reads |
| Check 5 files | 5 parallel Read calls | 5 sequential reads |
| Multi-task request | Parallel Task tools in one message | Wait for each to finish |

**Key Rule**: If tasks are independent, run them in **one message with multiple tool calls**.

```typescript
// GOOD: Single message, parallel execution
<Task A> + <Task B> + <Task C>

// BAD: Sequential, slower
<Task A> → wait → <Task B> → wait → <Task C>
```

---

## Standard Workflow (MEMORIZE)

**For all code changes, follow this cycle:**

```
audit → test → auto-fix → [re-test if fixes] → improve → document → commit & push
```

| Step | Action | Auto-Improve Trigger |
|------|--------|---------------------|
| **Audit** | `node audit-system.js` or project audit | Find issues before they compound |
| **Test** | Run project tests | Learn from failures AND successes |
| **Auto-fix** | Fix any issues found | Add fix to `_QUICK_FIX.md` |
| **Re-test** | If fixes made, run tests again | Verify fixes don't break anything |
| **Improve** | Enhance based on learnings | Update tests, add missing coverage |
| **Document** | Update CLAUDE.md, specs | Capture patterns for next time |
| **Commit** | `git commit` with clear message | Include "what was learned" |
| **Push** | `git push` | Sync to all tools |

**Re-test Rule**: If auto-fix changed any code, ALWAYS re-run tests before proceeding. Never commit untested fixes.

### Auto-Debug Loop (MANDATORY)

**After ANY code change, run this loop until zero errors:**

```
while (errors exist):
    1. read_console(types=["error"], count=10)
    2. Analyze error → identify fix
    3. Apply fix
    4. Re-check console
    5. Repeat until clean
```

**Unity-Specific Auto-Debug:**
```bash
# Check console after each change
read_console(types=["error","warning"], count=10)

# If errors found, fix and recheck
# NEVER stop until console is clean or user says stop
```

**Key Principle**: Don't wait for user to report errors. Proactively check console after every code change.

### Auto-Improve During Testing

| Observation | Auto-Action |
|-------------|-------------|
| Test passed first try | Log successful approach to `SUCCESS_LOG.md` |
| Test failed | Add root cause to `_QUICK_FIX.md` |
| Debugging took >3 attempts | Document debug path in `FAILURE_LOG.md` |
| New test pattern useful | Add to project test utilities |
| Missing test coverage found | Add to TODO or write test immediately |

### Auto-Improve During Debugging

| Observation | Auto-Action |
|-------------|-------------|
| Error message → fix mapping | Add to `_QUICK_FIX.md` |
| Symptom → root cause pattern | Add to `_AUTO_FIX_PATTERNS.md` |
| Debug command useful | Add to project CLAUDE.md |
| Log location discovered | Add to troubleshooting section |
| Environment issue found | Document in setup/prereqs |

**Key Principle**: Every success and failure is a learning opportunity. The system should get smarter with every iteration.

### Triple-Verified Insights (Add Here When Confirmed)

**Bulk Scene Fixes** (verified 2026-02-06):
| Problem | Bad Approach | Good Approach |
|---------|--------------|---------------|
| 200+ components to fix | Manual Edit tool calls | Unity Editor script + Reset() |
| SerializeField defaults wrong | Change code (doesn't fix scenes) | Change defaults + add Reset() + OnValidate() |
| Non-unique edit patterns | Fail on "234 matches" | Use fileID or scripted batch fix |

**Debug Strategy Patterns** (verified 2026-02-06):
| Strategy | Result | Add To |
|----------|--------|--------|
| Verbose debug per-component | ✅ Traceable data flow | Component code |
| Parallel agents for bulk work | ✅ Faster + unblocks main work | Agent orchestration |
| Checkpoint before /clear | ✅ Preserves progress | .claude/checkpoints/ |
| Wrong path assumptions | ❌ File not found | Always glob first |

**SerializeField Best Practice** (Unity-specific):
```
1. Set defaults to ENABLED (true) for common features
2. Add Reset() - called when component added in Editor
3. Add OnValidate() - called when Inspector changes
4. Existing scenes need manual Reset or Editor menu
```

---

## Unity Editor Development Workflow

### Console Check Commands

```bash
# JetBrains MCP (if Rider open)
mcp__jetbrains__get_file_problems(filePath, projectPath, errorsOnly=true)

# Unity MCP (if available)
read_console(types=["error"], count=10)
read_console(types=["error","warning"], count=20)

# Direct log check (fallback)
tail -100 ~/Library/Logs/Unity/Editor.log | grep -E "(error|Error|CS[0-9]{4})"
```

### Auto-Workflow (MANDATORY After Code Changes)

**After EVERY code change, auto-run this sequence:**

1. **Check console** → `read_console(types=["error"], count=10)` or JetBrains `get_file_problems`
2. **If errors** → Fix → Recheck (loop until clean)
3. **Reload Unity** → `refresh_unity(mode="if_dirty")` or bring Editor to front
4. **Verify hierarchy** → Check scene components are properly wired
5. **Test in Play** → Run Play mode if needed for runtime validation

**Known Safe-to-Ignore Warnings:**
| Warning | Source | Why Safe |
|---------|--------|----------|
| `ReadPixels out of bounds` | AR Foundation Remote EditorViewSender | Screen/render size mismatch, harmless |
| `CAMetalLayer invalid setDrawableSize` | macOS Metal init | UI layer sizing during startup |
| `StopSubsystems without initialized manager` | XR Management | Scene unload timing, self-recovers |

**Auto-Fix Known Patterns:**
| Error Pattern | Auto-Fix Action |
|---------------|-----------------|
| `CS0246 type not found` | Add missing `using` statement |
| `ReadPixels bounds` | Already protected by try-catch in VFXBinders |
| `NullReferenceException AR texture` | Use TryGetTexture pattern |
| `VFXARBinder no data` | Run `H3M > VFX Pipeline Master > Reset All Binders` |

### After ANY Code Change

```
1. Save file (auto or manual)
2. Wait for Unity to recompile (~1-3 sec)
3. Check console: read_console OR get_file_problems
4. If errors → fix → goto step 1
5. If clean → proceed with testing
```

### Play Mode Testing

```
1. Enter Play Mode (Editor must be running)
2. Check for runtime errors: read_console(types=["error","exception"])
3. Test functionality manually OR via test harness
4. Exit Play Mode
5. Check for cleanup errors (OnDestroy, etc.)
```

### Verified Testing Tools (MetavidoVFX)

| Tool | Trigger | Purpose |
|------|---------|---------|
| **VFXTestHarness** | Keyboard 1-9, Space, C, A | Rapid VFX switching in Play mode |
| **VFXAutoTester** | Auto or ContextMenu | Cycles through all VFX with timer |
| **SpecSceneAutoTester** | `H3M > Testing > Auto Test All Spec Scenes` | Tests all 12 spec demo scenes |
| **VFXPipelineDashboard** | Tab key | Real-time FPS, binding status, memory |

**Keyboard Shortcuts (VFXTestHarness):**
- `1-9` → Select favorite VFX
- `Space` → Cycle to next VFX
- `C` → Cycle categories (People, Hands, Audio, Environment)

---

## Unified Debugging (All Workflows)

**Single source of truth for debug across: Unity Editor, WiFi build, USB device, TestFlight**

### Debug Log Destinations

| Platform | Destinations | Access Method |
|----------|--------------|---------------|
| **Unity Editor** | Console, Editor.log | Window > Console, `tail Editor.log` |
| **Unity Device** | NSLog, Documents/*.txt | `idevicesyslog`, Files app |
| **React Native** | Metro, Console | Metro terminal, DebugOverlay |
| **Unified** | Bridge to RN overlay | UnifiedDebugOverlay (3-finger tap) |

### Auto-Read Debug Logs

```bash
# iOS device logs (timeout protected)
./scripts/capture_device_logs.sh 10 "Unity|Bridge|ARDebug"

# Unity file logs (pull from device)
xcrun devicectl device copy files --device <UDID> \
  --source Documents/ar_debug_log.txt --destination ./

# Metro logs (in terminal)
npm start  # Watch output
```

### Debug Overlay Architecture

```
┌─────────────────────────────────────────┐
│         UnifiedDebugOverlay             │
│  (Hidden by default, 3-finger tap)      │
├─────────────────────────────────────────┤
│ FPS: 60  │ AR: Tracking │ RX:12 TX:8   │
├─────────────────────────────────────────┤
│ [Unity] AR session started              │
│ [Bridge] ping → pong (12ms)             │
│ [RN] Navigation to ComposerScreen       │
│ [Unity] Plane detected: 1.2m x 0.8m     │
│ [RN] Voice: "add a cube"                │
│ [Bridge] add_object sent                │
│ [Unity] Object spawned at (0,0,-1)      │
└─────────────────────────────────────────┘
```

### Debugging by Workflow

| Workflow | Setup | Debug Access |
|----------|-------|--------------|
| **Unity Editor** | Play mode | Console window, VFXPipelineDashboard |
| **USB Device** | `./scripts/build_minimal.sh` | `./scripts/capture_device_logs.sh`, Files app |
| **WiFi Build** | Same build, wireless | Same as USB (device must be on same network) |
| **TestFlight** | Archive + upload | Files app only (no syslog), crash reports in Xcode |

### Auto-Fix Loop (MANDATORY)

```
WHILE developing:
    1. Make change
    2. Check console/logs immediately
    3. If error → fix → check again
    4. If clean → test functionality
    5. Log discoveries to KB

NEVER wait for user to report bugs. Proactively find and fix.
```

---

### Auto-Learning Principle (ALWAYS APPLY)

**After completing any task, ask:**
1. **What worked?** → Add to `SUCCESS_LOG.md`, consider GLOBAL_RULES
2. **What failed?** → Add to `_QUICK_FIX.md` or `_AUTO_FIX_PATTERNS.md`
3. **What was slow?** → Find faster workflow, document it
4. **What was repeated?** → Create Editor menu or script

**Triple-Verify Before Adding to GLOBAL_RULES:**
1. Pattern worked ≥2 times
2. Pattern saved significant time OR prevented errors
3. Pattern is generalizable (not one-off)

**Auto-Improvement Triggers:**
| Observation | Action |
|-------------|--------|
| Same fix applied 3+ times | Add to `_QUICK_FIX.md` |
| Debug took >5 min | Document in `LEARNING_LOG.md` |
| Successful new workflow | Add to GLOBAL_RULES after 2nd success |
| Editor menu saves time | Document in project CLAUDE.md |

### Common Unity Debug Patterns

| Symptom | Check | Fix |
|---------|-------|-----|
| Script won't compile | `get_file_problems` | Fix CS errors |
| Component missing | `find_gameobjects` → `manage_components` | Add component |
| Null reference at runtime | Add Debug.Log or breakpoint | Check initialization order |
| VFX not updating | VFXARBinder Inspector | Enable bind toggles |
| AR texture null | Wait for ARSession ready | Use TryGetTexture pattern |
| Scene changes lost | Check scene saved | Save before Play |

### JetBrains MCP Quick Reference (When Rider Open)

| Task | Command |
|------|---------|
| Check file errors | `get_file_problems(filePath)` |
| Search code | `search_in_files_by_text("pattern", fileMask="*.cs")` |
| Find file | `find_files_by_name_keyword("keyword")` |
| Read file | `get_file_text_by_path(pathInProject)` |
| Replace text | `replace_text_in_file(pathInProject, oldText, newText)` |
| Rename symbol | `rename_refactoring(pathInProject, symbolName, newName)` |
| Directory tree | `list_directory_tree(directoryPath)` |

### Unity MCP Quick Reference (When Available)

| Task | Command |
|------|---------|
| Read console | `read_console(types, count)` |
| Clear console | `clear_console()` |
| Find objects | `find_gameobjects(search_term)` |
| Manage components | `manage_components(target, action)` |
| Play/Stop | `editor_command("play")` / `editor_command("stop")` |
| Select object | `select_object(instance_id)` |
| Get hierarchy | `get_hierarchy(parent_path)` |

### Editor Testing Checklist

- [ ] Console clean (no errors/warnings)
- [ ] Scene saved before testing
- [ ] AR components have required references
- [ ] VFXARBinder bindings enabled
- [ ] ARDepthSource singleton exists
- [ ] Play Mode enters without crash
- [ ] Exit Play Mode cleanly

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

**Auto-Checkpoint (MANDATORY every 5-10 min)**:
- Create/update `.claude/checkpoints/SESSION_*.md` with progress
- Commit to git periodically (batch related changes)
- Include: completed tasks, current state, next steps, resume instructions
- Format: `SESSION_YYYYMMDD-HHMM.md`

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

### Parallel Agents (Speed Up)

**ALWAYS launch parallel agents when tasks are independent:**

```
# Good: Launch 3 agents simultaneously
Task(agent=Explore, "check VFX bindings")
Task(agent=Explore, "extract HLSL code")
Task(agent=Explore, "analyze scene setup")
```

| Scenario | Do This |
|----------|---------|
| Research multiple files | Parallel agents, one per topic |
| Compare implementations | Parallel agents for each codebase |
| Investigate + fix | Agent researches while you code |

### Large File Handling

**When Read fails with token limit:**

```
# Instead of Read(file)
Grep(pattern="m_Source:|HLSL|function", file, output_mode="content", -C=10)
```

| File Type | Strategy |
|-----------|----------|
| VFX (.vfx, .vfxblock) | Grep for `m_ExposedName`, `m_HLSLCode`, `m_Source` |
| Unity scenes (.unity) | Grep for component names, GUIDs |
| Large code files | Grep for function/class names |

**Never retry Read on large files** - use Grep immediately.

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

## MCP Server Management

### Quick Fixes

| Issue | Fix |
|-------|-----|
| Unity MCP not responding | Unity → Window → MCP for Unity → Start Server |
| MCP slow / force quits | Run `mcp-kill-dupes` or `mcp-nuke` |
| After Unity build | Restart Unity Editor |
| High memory usage | `mcp-nuke` (kills duplicates + heavy servers) |
| 30+ MCP processes | Multiple IDEs open - close unused or run `mcp-kill-dupes` |

### MCP Commands (shell aliases)

```bash
mcp-kill-dupes   # Kill duplicate servers only (runs at Claude Code session start)
mcp-nuke         # Kill duplicates + heavy servers (playwright, puppeteer, etc)
mcp-kill-all     # Nuclear - kill ALL MCP servers
mcp-count        # Show running MCP server count
mcp-mem          # Show MCP memory usage
```

### Best Practice: Hooks over LaunchAgents

**For Claude Code automation, ALWAYS prefer hooks over LaunchAgents:**

| Approach | When to Use |
|----------|-------------|
| **Hooks** ✅ | Claude Code tasks - run in context, access conversation state, no background processes |
| **LaunchAgents** | System-wide tasks unrelated to AI tools (backup, sync, etc.) |

**Why hooks win:**
- Run only when Claude Code session starts (not wasting resources)
- Have access to environment and can report to conversation
- No persistent background processes eating memory
- Automatically cleaned up when Claude Code closes

**Hook locations:**
- `~/.claude/hooks/session-health-check.sh` - runs at session start
- `~/.claude/settings.json` → `hooks.SessionStart` - configuration

### Root Cause: Multi-IDE MCP Duplication

When running multiple AI IDEs (Windsurf, Antigravity, Claude Code, Cursor), each spawns its own MCP servers independently. This causes:
- 3-4x duplicate servers
- Memory exhaustion (300MB+ per set)
- Force quits and slowdowns

**Prevention:** The SessionStart hook automatically runs `mcp-kill-dupes` when Claude Code starts.

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

## 🎯 Highest Leverage Practices (Official Best Practices)

**Source**: Claude Code official docs + research studies (Feb 2026)

### 1. Verification Criteria (MOST IMPACTFUL)
Always provide tests, expected outputs, or screenshots so Claude can self-verify.

| Strategy | Before | After |
|----------|--------|-------|
| Test criteria | "implement validation" | "implement validateEmail. test: user@example.com=true, invalid=false. run tests after" |
| Visual check | "make it look better" | "implement this design [screenshot]. take screenshot of result" |
| Root cause | "build failing" | "build fails with [error]. fix root cause and verify build succeeds" |

### 2. Plan Mode for Complex Tasks
- **Start in plan mode** (`Shift+Tab` twice) for any multi-file change
- Pour energy into the plan → Claude can 1-shot implementation
- **When things go sideways**: Switch back to plan mode, don't keep pushing
- Use `Ctrl+G` to edit plan in external editor

### 3. Subagent Isolation
Use subagents for investigations to keep main context clean:
```
"use subagent to investigate how our auth handles token refresh"
"use a subagent to review this code for edge cases"
```

### 4. Scope Tasks Precisely
| Bad | Good |
|-----|------|
| "add tests" | "write test for foo.py covering logged-out edge case. avoid mocks" |
| "fix login bug" | "login fails after session timeout. check src/auth/, especially token refresh" |
| "refactor this" | "extract the validation logic to a utility function in src/utils/" |

### 5. MANDATORY Reuse Check (Before ANY New Code)
```
1. Codebase: Search for similar functions, utilities, patterns
2. Knowledgebase: Check KB for documented solutions
3. GitHub repos: Reference implementations (520+ in master KB)
4. Online docs: Built-in framework/API solutions
```
**Anti-pattern**: Writing new code when reusable function exists.

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

### Root Cause Analysis (MANDATORY for Persistent Issues)

**When a bug escapes testing, ask WHY tests didn't catch it:**

| Gap Type | Root Cause | Permanent Fix |
|----------|------------|---------------|
| Frontend/backend mismatch | API contract not tested | Add contract tests |
| Status value mismatch | Response format undocumented | Document + test exact response |
| Endpoint not covered | Test suite has gaps | Add endpoint coverage |
| Edge case missed | Happy path only tested | Add negative/edge tests |
| Integration failure | Components tested in isolation | Add integration tests |

**Process**:
1. Fix the immediate bug
2. Ask: "Why didn't tests catch this?"
3. Add the missing test FIRST (should fail without fix)
4. Apply fix (test now passes)
5. Document pattern in _QUICK_FIX.md or _AUTO_FIX_PATTERNS.md

**Key Principle**: Every escaped bug represents a gap in the test suite. Close the gap permanently.

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

**Hook-Triggered (via PostToolUse or SessionStart)**:
- `kb-health-check.sh` - Audit KB for stale content (run on SessionStart)
- Review LEARNING_LOG.md for patterns worth promoting (after major task completion)
- Pattern extraction after error resolution (via PostToolUseFailure hook)

**Also Hourly (background LaunchAgent)**:
- Light KB health check (file count, broken links)
- Sync any uncommitted LEARNING_LOG.md entries

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

### Research Verification (CRITICAL - NEVER SKIP)

**NEVER assume latest research is correct.** Before updating specs or KB:

1. **Deep research first** - Verify claims against official docs, community consensus
2. **Check accuracy** - Cross-reference multiple sources, test code examples
3. **Ensure best practices** - Align with industry standards, not just "working" code
4. **Simplicity check** - Is this the simplest correct solution?
5. **Modularity check** - Does it fit clean architecture principles?
6. **Project goals** - Does it align with current project priorities?

**Anti-patterns**:
- ❌ Accepting KB research at face value
- ❌ Updating specs without verifying claims
- ❌ Adding unverified patterns to KB
- ❌ Assuming "newer = better"

**Verification Order**:
1. Official documentation (Unity, Apple, Google)
2. Working code in reputable repos
3. Community consensus (forums, issues)
4. KB research (verify, don't trust blindly)

### Spec Creation Standards (99% Confidence Required)

**Evidence must be BOTH**:
1. **Online verified** - Official docs, GitHub repos, technical blogs with sources
2. **Locally tested** - Demonstrated working in project whenever possible

**Before adding to spec or KB**:
| Check | Required Evidence |
|-------|-------------------|
| API claim | Link to official docs + code example |
| Pattern claim | Working repo OR local test |
| Performance claim | Benchmark data OR profile screenshot |
| Compatibility claim | Tested on target platform |
| Architecture claim | Reference implementation OR diagram |

**Red flags (reject these)**:
- ❌ "I heard that..." without source
- ❌ Marketing copy without technical backing
- ❌ Old blog posts (check dates!)
- ❌ Unverified KB entries (recursive trust)
- ❌ Claims without version numbers

### Auto-Intelligence Gathering

**On every significant task**:
1. Search KB first (`kbfix`, `kbtag`, `kb`)
2. If pattern not found → research online
3. **Triple-verify findings** (see Research Verification above)
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
| Document generation | `_DOCUMENT_GENERATION.md` |
| Claude Code best practices | `_CLAUDE_CODE_OFFICIAL_BEST_PRACTICES.md` |
| All KB files | `_KB_INDEX.md` |

---

## Document Generation

### Quick Commands

| Output | Command |
|--------|---------|
| **PDF (fast)** | `pandoc input.md -o output.pdf --pdf-engine=typst` |
| **PDF (styled)** | `pandoc input.md -o temp.html && weasyprint temp.html output.pdf` |
| **DOCX** | `pandoc input.md -o output.docx` |
| **DOCX (styled)** | `pandoc input.md -o output.docx --reference-doc=~/.claude/templates/reference.docx` |

### Tools Installed

- **Typst** — Fast PDF (27x faster than LaTeX)
- **WeasyPrint** — CSS-styled PDFs
- **doc-ops-mcp** — MCP server for document conversion
- **Resume templates** — `~/.claude/templates/` (ATS-friendly)

### Resume Templates

| Template | Location | Type |
|----------|----------|------|
| pandoc-resume | `~/.claude/templates/pandoc-resume/` | Markdown → PDF/HTML/DOCX |
| markdown-resume | `~/.claude/templates/markdown-resume/` | ATS + human friendly |
| rover-resume | `~/.claude/templates/rover-resume/` | LaTeX, no custom fonts |

**Full reference**: `_DOCUMENT_GENERATION.md`

---

## Spec-Driven Development

```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement
```

**Use specs for**: >100 LOC, architecture changes, cross-team work
**Skip specs for**: Bug fixes, <50 LOC, config tweaks

---

## Spec Verification Protocol (MANDATORY)

**Before creating or revising ANY spec, complete this checklist.**

### 1. Codebase Audit (5 min)

| Check | Command | Purpose |
|-------|---------|---------|
| Existing code | `grep -r "pattern" src/` | Does this already exist? |
| Package manifest | `cat unity/Packages/manifest.json` | Is package already installed? |
| Services | `ls src/services/` | Reusable services? |
| Helpers | `ls src/helpers/` | Existing utilities? |

### 2. Simplification Check

Ask these questions:
- "What's the **absolute minimum** for this to work?"
- "What can we **reuse** instead of build?"
- "Is there existing code that does **80% of this**?"
- "Can we **copy and adapt** instead of create from scratch?"

### 3. Proven Examples

| Source | Check For |
|--------|-----------|
| GitHub | Working implementations of similar features |
| Official docs | Recommended patterns for our exact versions |
| Our codebase | Already-working code we can extend |
| Knowledgebase | Documented patterns and solutions |

### 4. Reality Test

| Question | If No |
|----------|-------|
| If spec says "add X" - is X actually missing? | Remove from spec |
| If spec says "build Y" - does Y already exist? | Change to "wire up existing Y" |
| Count real tasks - are they all necessary for MVP? | Prune to essentials |

### Quality Gates

| Gate | Question |
|------|----------|
| **Exists?** | Does this code/package already exist in codebase? |
| **Works?** | Is there a proven working example we can reference? |
| **Needed?** | Is every task actually required for MVP? |
| **Simple?** | Can this be done in fewer steps? |
| **Reuse?** | Can we copy/adapt instead of build from scratch? |

### Red Flags (Over-Engineering)

Stop and simplify if you see:
- ❌ More than 15 tasks for a single feature
- ❌ "Architecture" diagrams before any working code
- ❌ Multiple phases before anything is demonstrable
- ❌ New abstractions for one-time use
- ❌ Tasks that don't touch actual files
- ❌ Building infrastructure "for later"
- ❌ Elaborate migration plans for code that doesn't exist yet

### Good Spec Patterns

- ✅ Tasks reference specific existing files to modify
- ✅ Each task produces testable output
- ✅ Reuses existing code/patterns explicitly named
- ✅ MVP achievable in 5-10 tasks
- ✅ Dependencies on existing working code identified

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

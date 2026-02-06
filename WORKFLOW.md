# WORKFLOW.md - Proven Patterns Only

## Core Loop (Always)
```
Verify → Fix → Test → Commit
```

## #1 Rule: Give Verification Criteria
```
❌ "fix the bug"
✅ "fix login timeout. test: session expires after 30min. run tests after."
```

## Spec-Kit Flow (Complex Tasks)
```
/speckit.specify → /speckit.plan → /speckit.implement
```

## Automation (Already Working)
| Trigger | Script | What It Does |
|---------|--------|--------------|
| Every commit | `.git/hooks/pre-commit` | Validates 68 tests, 149 files |
| Tool failure | `failure-tracker.sh` hook | KB search → auto-fix → escalate |
| Session start | `session-health-check.sh` hook | Kill MCP dupes, fix symlinks |

## Context Management
- Autocompact at 65% (set in settings.json)
- `/clear` between unrelated tasks
- Use subagents for exploration (isolates context)

## When Stuck
1. Check `_QUICK_FIX.md` first (zero tokens)
2. Use `unity-error-fixer` agent for Unity errors
3. After 3 failures, stop and reassess (circuit breaker)

## Tests
```bash
# Quick (no Unity needed)
./Scripts/automation/quick-validate.sh

# Full (Unity required)
Unity -batchmode -runTests -testPlatform EditMode
```

## Don't
- Add more config/rules (we have enough)
- Retry same fix 3x (try different approach)
- Work past 80% context (quality degrades)

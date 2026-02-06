# RULES_MINIMAL.md - Essential Rules Only (~1K tokens)

## Core Loop (Always)
```
Work → Validate → Fix → Commit → Push
```

## Automation Scripts
| Script | When | Tokens |
|--------|------|--------|
| `./Scripts/automation/quick-validate.sh` | Before commit (auto via hook) | 0 |
| `./Scripts/automation/dev-loop.sh` | Manual or scheduled | 0 |
| `./Scripts/automation/auto-improve.sh` | Hourly via LaunchAgent | 0 |

## Token Rules
- `/clear` between unrelated tasks
- `/compact` at 70% context
- Use agents for 3+ step tasks

## Unity Rules
- MCP tools when Editor open
- `read_console` before/after changes
- Tests: `Unity -batchmode -runTests -testPlatform EditMode`

## Error Handling
```
Error → Check _QUICK_FIX.md → Apply known fix → OR ask for help
Success → Log to LEARNING_LOG.md
```

## Cross-Project
MetavidoVFX ↔ Portals V4 share:
- KnowledgeBase/ (symlinked)
- XRRAI.* namespaces (portable)
- Automation scripts

## Don'ts
- ❌ Don't overcomplicate config
- ❌ Don't write docs instead of code
- ❌ Don't reinvent wheels
- ❌ Don't retry same fix 3x (try different approach)

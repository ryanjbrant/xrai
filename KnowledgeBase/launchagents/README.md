# LaunchAgents - macOS Background Automation

**Location**: Copy to `~/Library/LaunchAgents/`
**Status**: Opt-in (run setup script to enable)

## Quick Install

```bash
# Option 1: Interactive setup (recommended)
./Scripts/automation/KB_SETUP_AUTOMATION.sh

# Option 2: Manual install
cp KnowledgeBase/launchagents/*.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.unity-xr-ai.*.plist
```

## Available Agents

| Agent | Interval | Purpose | CPU Impact |
|-------|----------|---------|------------|
| `auto-improve` | 1 hour | System health, MCP check | <5% |
| `github-trends` | 12 hours | Update trending repos | <2% |
| `kb-health` | 6 hours | KB integrity check | <3% |

## Enable/Disable

```bash
# Enable specific agent
launchctl load ~/Library/LaunchAgents/com.unity-xr-ai.kb-health.plist

# Disable specific agent
launchctl unload ~/Library/LaunchAgents/com.unity-xr-ai.kb-health.plist

# Check status
launchctl list | grep unity-xr-ai
```

## Performance Guarantees

All agents include:
- `LowPriorityIO: true` - Minimal disk impact
- `ProcessType: Background` - Low CPU priority
- Quiet hours check (11pm-7am disabled)
- Auto-exit if system load >80%

## Logs

```bash
# View logs
tail -f ~/Documents/GitHub/Unity-XR-AI/logs/*.log

# View metrics
cat ~/Documents/GitHub/Unity-XR-AI/logs/automation-metrics.json | jq
```

## Uninstall All

```bash
for f in ~/Library/LaunchAgents/com.unity-xr-ai.*.plist; do
  launchctl unload "$f" 2>/dev/null
  rm "$f"
done
```

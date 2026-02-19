# macOS System Optimization Patterns

**Created**: 2026-02-19 | **Source**: WarpJobs dev session

---

## CPU Priority: taskpolicy (preferred over renice)

```bash
taskpolicy -b -p PID    # Background QoS: lowest CPU + I/O + network
```

- Official macOS API: `man taskpolicy(8)`
- Sets TASK_POLICY_BACKGROUND on the process
- Fallback: `renice 20 -p PID` (scheduling priority only, no I/O demotion)

## Spotlight Exclusion: .metadata_never_index

Place file in any directory to exclude from Spotlight indexing:

```bash
touch /path/to/dir/.metadata_never_index
```

Key targets: `node_modules`, `.git`, `DerivedData`, `__pycache__`, `.venv`, `~/Library/Caches`

Script: `~/bin/dev-system-tune.sh` (auto-finds and marks new dirs every 5min)

## LaunchAgent Best Practices

- Consolidate related tasks into one agent + one script
- Always set for maintenance tasks:
  - `LowPriorityIO` = true
  - `Nice` = 20
  - `ProcessType` = Background
- Prefer event-driven (RunAtLoad, WatchPaths) over polling (StartInterval)
- Polling acceptable when no OS event exists (e.g., process spawn detection)

## LaunchAgent Audit Checklist

1. `ls ~/Library/LaunchAgents/` — user agents
2. `ls /Library/LaunchAgents/` — system-wide agents
3. `ls /Library/LaunchDaemons/` — system daemons
4. Common bloat: TeamViewer, Oracle Java, NDI, PlasticSCM, redundant Google Keystone
5. Check: is the app still installed? Is the daemon loaded? (`launchctl list | grep label`)

## Claude Code sudo Access

Scoped NOPASSWD in `/etc/sudoers.d/claude-code`:

```
username ALL=(ALL) NOPASSWD: /bin/rm, /bin/launchctl, /usr/sbin/mdutil, /usr/sbin/taskpolicy, /usr/bin/renice
```

Never use `NOPASSWD: ALL`.

## cloudcode_cli (Antigravity/Google Cloud Code)

- Spawned by Antigravity.app via Helper (Plugin) process
- No config to limit CPU; must demote externally
- Fix: `taskpolicy -b -p $(pgrep -f cloudcode_cli)` via periodic LaunchAgent

## Cross-CLI Memory: File-Based KB over Vector DB

- Use `~/KnowledgeBase/*.md` (git-backed, portable across all CLI tools)
- Avoid tool-specific stores (claude-mem/Chroma) for shared knowledge
- claude-mem OK for tool-specific ephemeral context only

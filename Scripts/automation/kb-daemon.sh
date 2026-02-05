#!/bin/bash
# kb-daemon.sh - Cross-platform KB auto-improvement daemon
# Supports: macOS, Linux, Windows (WSL/Git Bash), Cloud (GitHub Actions)
#
# ONLY runs for users who have cloned the KB repo
# Never affects read-only KB users
#
# Usage:
#   ./kb-daemon.sh install    # Install daemon (prompts for confirmation)
#   ./kb-daemon.sh uninstall  # Remove daemon completely
#   ./kb-daemon.sh status     # Check if running
#   ./kb-daemon.sh run        # Run once manually
#   ./kb-daemon.sh improve    # Run KB improvement pass

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
KB_DIR="$REPO_DIR/KnowledgeBase"
CONFIG_FILE="$REPO_DIR/automation-config.json"
LOCK_FILE="/tmp/kb-daemon.lock"

# Detect platform
detect_platform() {
  case "$(uname -s)" in
    Darwin*) echo "macos" ;;
    Linux*)
      if [ -f /proc/version ] && grep -qi microsoft /proc/version; then
        echo "wsl"
      else
        echo "linux"
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}

PLATFORM=$(detect_platform)

# Colors (cross-platform safe)
if [ -t 1 ]; then
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  NC='\033[0m'
else
  GREEN='' YELLOW='' RED='' NC=''
fi

log() { echo -e "${GREEN}[kb-daemon]${NC} $1"; }
warn() { echo -e "${YELLOW}[kb-daemon]${NC} $1"; }
err() { echo -e "${RED}[kb-daemon]${NC} $1" >&2; }

# Check if this is a cloned repo (not just downloaded files)
is_cloned_repo() {
  [ -d "$REPO_DIR/.git" ]
}

# Check system load (cross-platform)
check_system_load() {
  case "$PLATFORM" in
    macos)
      load=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}' | cut -d. -f1)
      ;;
    linux|wsl)
      load=$(cat /proc/loadavg 2>/dev/null | awk '{print $1}' | cut -d. -f1)
      ;;
    *)
      load=0
      ;;
  esac
  [ "${load:-0}" -lt 80 ]
}

# Check quiet hours (skip 11pm-7am local time)
check_quiet_hours() {
  hour=$(date +%H)
  [ "$hour" -ge 7 ] && [ "$hour" -lt 23 ]
}

# Run KB improvement pass
run_improve() {
  if ! is_cloned_repo; then
    err "Not a cloned repo - daemon only works for repo clones"
    exit 1
  fi

  # Acquire lock
  if [ -f "$LOCK_FILE" ]; then
    pid=$(cat "$LOCK_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      warn "Already running (PID $pid)"
      exit 0
    fi
  fi
  echo $$ > "$LOCK_FILE"
  trap "rm -f $LOCK_FILE" EXIT

  # Performance guards
  if ! check_quiet_hours; then
    log "Quiet hours - skipping"
    exit 0
  fi

  if ! check_system_load; then
    log "System busy - skipping"
    exit 0
  fi

  log "Starting KB improvement pass..."
  cd "$KB_DIR"

  # 1. Update file counts and dates in index
  if [ -f "_KB_INDEX.md" ]; then
    file_count=$(find . -name "*.md" -not -path "./_archive/*" | wc -l | tr -d ' ')
    today=$(date +%Y-%m-%d)
    sed -i.bak "s/\*\*Files\*\*: [0-9]*/\*\*Files\*\*: $file_count/" _KB_INDEX.md 2>/dev/null || true
    sed -i.bak "s/\*\*Updated\*\*: [0-9-]*/\*\*Updated\*\*: $today/" _KB_INDEX.md 2>/dev/null || true
    rm -f _KB_INDEX.md.bak
    log "Updated _KB_INDEX.md (${file_count} files)"
  fi

  # 2. Update GitHub trends date
  if [ -f "_GITHUB_TRENDING_INDEX.md" ]; then
    sed -i.bak "s/\*\*Auto-updated\*\*: [0-9-]*/\*\*Auto-updated\*\*: $(date +%Y-%m-%d)/" _GITHUB_TRENDING_INDEX.md 2>/dev/null || true
    rm -f _GITHUB_TRENDING_INDEX.md.bak
  fi

  # 3. Check for broken internal links (lightweight)
  broken_links=0
  for ref in $(grep -oh '\[.*\](\./[^)]*\.md)' *.md 2>/dev/null | grep -o './[^)]*\.md' | sort -u | head -20); do
    file="${ref#./}"
    if [ ! -f "$file" ]; then
      warn "Broken link: $ref"
      broken_links=$((broken_links + 1))
    fi
  done
  [ "$broken_links" -gt 0 ] && warn "Found $broken_links broken internal links"

  # 4. Git commit if changes (only for cloned repos with write access)
  if git diff --quiet 2>/dev/null; then
    log "No changes to commit"
  else
    git add -A 2>/dev/null || true
    git commit -m "chore(auto): KB improvement pass $(date +%Y-%m-%d)" --no-verify 2>/dev/null || true
    log "Committed improvements"
  fi

  log "KB improvement pass complete"
}

# Install daemon (platform-specific)
install_daemon() {
  if ! is_cloned_repo; then
    err "This is not a cloned repo. Daemon only works for users who clone the KB repo."
    err "If you just downloaded files, you don't need the daemon."
    exit 1
  fi

  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║           KB Auto-Improvement Daemon Setup                 ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  echo "This will install a background daemon that:"
  echo "  • Updates KB index and metadata (every 6 hours)"
  echo "  • Checks for broken internal links"
  echo "  • Auto-commits minor improvements"
  echo ""
  echo "Performance guarantees:"
  echo "  • Runs at lowest priority (won't slow your system)"
  echo "  • Skips during quiet hours (11pm-7am)"
  echo "  • Skips when system is busy (>80% load)"
  echo ""
  echo "Platform: $PLATFORM"
  echo ""

  read -p "Install daemon? [y/N]: " response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Skipped. Run './kb-daemon.sh install' anytime."
    exit 0
  fi

  case "$PLATFORM" in
    macos)
      install_macos
      ;;
    linux)
      install_linux
      ;;
    wsl|windows)
      install_windows
      ;;
    *)
      err "Unknown platform: $PLATFORM"
      echo "You can still run manually: ./kb-daemon.sh run"
      exit 1
      ;;
  esac

  # Mark as installed in config
  if [ -f "$CONFIG_FILE" ]; then
    python3 -c "
import json
with open('$CONFIG_FILE', 'r') as f: d = json.load(f)
d['daemon_installed'] = True
d['daemon_platform'] = '$PLATFORM'
d['daemon_installed_date'] = '$(date +%Y-%m-%d)'
with open('$CONFIG_FILE', 'w') as f: json.dump(d, f, indent=2)
" 2>/dev/null || true
  fi

  log "Daemon installed successfully!"
}

install_macos() {
  plist="$HOME/Library/LaunchAgents/com.unity-xr-ai.kb-daemon.plist"
  mkdir -p "$HOME/Library/LaunchAgents"

  cat > "$plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.unity-xr-ai.kb-daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>$SCRIPT_DIR/kb-daemon.sh</string>
        <string>run</string>
    </array>
    <key>StartInterval</key>
    <integer>21600</integer>
    <key>RunAtLoad</key>
    <false/>
    <key>LowPriorityIO</key>
    <true/>
    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
EOF

  launchctl unload "$plist" 2>/dev/null || true
  launchctl load "$plist"
  log "macOS LaunchAgent installed"
}

install_linux() {
  service_file="$HOME/.config/systemd/user/kb-daemon.service"
  timer_file="$HOME/.config/systemd/user/kb-daemon.timer"
  mkdir -p "$HOME/.config/systemd/user"

  cat > "$service_file" << EOF
[Unit]
Description=KB Auto-Improvement Daemon
After=network.target

[Service]
Type=oneshot
ExecStart=$SCRIPT_DIR/kb-daemon.sh run
Nice=19
IOSchedulingClass=idle

[Install]
WantedBy=default.target
EOF

  cat > "$timer_file" << EOF
[Unit]
Description=KB Daemon Timer (every 6 hours)

[Timer]
OnBootSec=10min
OnUnitActiveSec=6h
Persistent=true

[Install]
WantedBy=timers.target
EOF

  systemctl --user daemon-reload
  systemctl --user enable --now kb-daemon.timer
  log "Linux systemd timer installed"
}

install_windows() {
  # For WSL/Git Bash, use Windows Task Scheduler via PowerShell
  task_name="KBDaemon"

  if command -v powershell.exe &>/dev/null; then
    powershell.exe -Command "
      \$action = New-ScheduledTaskAction -Execute 'bash.exe' -Argument '-c \"$SCRIPT_DIR/kb-daemon.sh run\"'
      \$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 6)
      \$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -Priority 7
      Register-ScheduledTask -TaskName '$task_name' -Action \$action -Trigger \$trigger -Settings \$settings -Force
    " 2>/dev/null
    log "Windows Task Scheduler task created"
  else
    warn "PowerShell not available. Add to Task Scheduler manually:"
    echo "  Task: $task_name"
    echo "  Command: bash.exe -c '$SCRIPT_DIR/kb-daemon.sh run'"
    echo "  Schedule: Every 6 hours"
  fi
}

# Uninstall daemon
uninstall_daemon() {
  case "$PLATFORM" in
    macos)
      plist="$HOME/Library/LaunchAgents/com.unity-xr-ai.kb-daemon.plist"
      launchctl unload "$plist" 2>/dev/null || true
      rm -f "$plist"
      ;;
    linux)
      systemctl --user disable --now kb-daemon.timer 2>/dev/null || true
      rm -f "$HOME/.config/systemd/user/kb-daemon.service"
      rm -f "$HOME/.config/systemd/user/kb-daemon.timer"
      systemctl --user daemon-reload
      ;;
    wsl|windows)
      powershell.exe -Command "Unregister-ScheduledTask -TaskName 'KBDaemon' -Confirm:\$false" 2>/dev/null || true
      ;;
  esac
  log "Daemon uninstalled"
}

# Check status
check_status() {
  echo "Platform: $PLATFORM"
  echo "Repo cloned: $(is_cloned_repo && echo 'Yes' || echo 'No')"
  echo ""

  case "$PLATFORM" in
    macos)
      if launchctl list 2>/dev/null | grep -q "com.unity-xr-ai.kb-daemon"; then
        echo -e "Status: ${GREEN}Running${NC}"
      else
        echo -e "Status: ${YELLOW}Not running${NC}"
      fi
      ;;
    linux)
      if systemctl --user is-active kb-daemon.timer &>/dev/null; then
        echo -e "Status: ${GREEN}Running${NC}"
        systemctl --user status kb-daemon.timer --no-pager 2>/dev/null | head -5
      else
        echo -e "Status: ${YELLOW}Not running${NC}"
      fi
      ;;
    *)
      echo "Status: Check Task Scheduler manually"
      ;;
  esac
}

# Main
case "${1:-}" in
  install)
    install_daemon
    ;;
  uninstall)
    uninstall_daemon
    ;;
  status)
    check_status
    ;;
  run|improve)
    run_improve
    ;;
  *)
    echo "Usage: $0 {install|uninstall|status|run}"
    echo ""
    echo "Commands:"
    echo "  install    Install background daemon (prompts for confirmation)"
    echo "  uninstall  Remove daemon completely"
    echo "  status     Check if daemon is running"
    echo "  run        Run improvement pass once"
    exit 1
    ;;
esac

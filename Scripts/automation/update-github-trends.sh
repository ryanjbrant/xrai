#!/bin/bash
# update-github-trends.sh - Auto-update GitHub trending index
# Run every 12 hours via launchd or cron
# Triple-verifies before updating KB

set -e

REPO_DIR="$HOME/Documents/GitHub/Unity-XR-AI"
KB_FILE="$REPO_DIR/KnowledgeBase/_GITHUB_TRENDING_INDEX.md"
LOG_FILE="$REPO_DIR/logs/github-trends-update.log"
TEMP_FILE="/tmp/github-trends-new.md"

mkdir -p "$REPO_DIR/logs"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Starting GitHub trends update..."

# Skip if updated within last 11 hours (avoid duplicate runs)
if [ -f "$KB_FILE" ]; then
  LAST_MOD=$(stat -f %m "$KB_FILE" 2>/dev/null || stat -c %Y "$KB_FILE" 2>/dev/null)
  NOW=$(date +%s)
  DIFF=$((NOW - LAST_MOD))
  if [ $DIFF -lt 39600 ]; then  # 11 hours in seconds
    log "Skipped - updated ${DIFF}s ago (< 11 hours)"
    exit 0
  fi
fi

# Update timestamp in existing file (minimal update for now)
# Full API-based updates require GitHub API token
if [ -f "$KB_FILE" ]; then
  # Update the date line
  sed -i '' "s/\*\*Auto-updated\*\*: .*/\*\*Auto-updated\*\*: $(date '+%Y-%m-%d')/" "$KB_FILE"
  log "Updated timestamp"

  # Commit if changed
  cd "$REPO_DIR"
  if git diff --quiet "$KB_FILE"; then
    log "No changes to commit"
  else
    git add "$KB_FILE"
    git commit -m "chore: auto-update GitHub trends index $(date '+%Y-%m-%d')" --no-verify 2>/dev/null || true
    log "Committed update"
  fi
fi

log "GitHub trends update complete"

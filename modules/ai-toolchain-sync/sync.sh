#!/bin/bash
# sync.sh - AI Toolchain Sync
# Single source of truth for all AI tools
#
# Usage:
#   ./sync.sh           # Normal sync (respects config.json)
#   ./sync.sh --force   # Sync even if disabled
#   ./sync.sh --status  # Show current status

set -e

MODULE_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$MODULE_DIR/../.." && pwd)"
KB_DIR="$REPO_DIR/KnowledgeBase"
CONFIG="$MODULE_DIR/config.json"

# Parse args
FORCE=false
STATUS_ONLY=false
[[ "$1" == "--force" ]] && FORCE=true
[[ "$1" == "--status" ]] && STATUS_ONLY=true

# Read config
if [ -f "$CONFIG" ]; then
  ENABLED=$(cat "$CONFIG" | grep -o '"enabled":[^,}]*' | cut -d':' -f2 | tr -d ' ')
  AUTO_SYNC=$(cat "$CONFIG" | grep -o '"auto_sync_on_commit":[^,}]*' | cut -d':' -f2 | tr -d ' ')
else
  ENABLED="true"
  AUTO_SYNC="true"
fi

# Status only
if [ "$STATUS_ONLY" == "true" ]; then
  echo "AI Toolchain Sync Status:"
  echo "  Enabled: $ENABLED"
  echo "  Auto-sync on commit: $AUTO_SYNC"
  echo "  Config: $CONFIG"
  exit 0
fi

# Check if disabled
if [ "$ENABLED" != "true" ] && [ "$FORCE" != "true" ]; then
  echo "⏸️  AI Toolchain Sync is disabled (set enabled:true in config.json or use --force)"
  exit 0
fi

echo "🔄 Syncing AI tool configurations..."

# Helper to check tool enabled
tool_enabled() {
  local tool=$1
  if [ -f "$CONFIG" ]; then
    local val=$(cat "$CONFIG" | grep -o "\"$tool\":[^,}]*" | cut -d':' -f2 | tr -d ' ')
    [ "$val" != "false" ]
  else
    true
  fi
}

# 1. Source symlinks at ~
ln -sf "$REPO_DIR/AGENTS.md" ~/AGENTS.md
ln -sf "$REPO_DIR/GLOBAL_RULES.md" ~/GLOBAL_RULES.md

# 2. Claude Code
if tool_enabled "claude_code"; then
  mkdir -p ~/.claude
  ln -sf "$KB_DIR" ~/.claude/knowledgebase
  echo "  ✅ Claude Code"
fi

# 3. Codex
if tool_enabled "codex"; then
  mkdir -p ~/.codex
  ln -sf ~/AGENTS.md ~/.codex/AGENTS.md
  ln -sf ~/GLOBAL_RULES.md ~/.codex/GLOBAL_RULES.md
  ln -sf "$KB_DIR" ~/.codex/knowledgebase
  echo "  ✅ Codex"
fi

# 4. Antigravity
if tool_enabled "antigravity"; then
  mkdir -p ~/.antigravity
  ln -sf ~/GLOBAL_RULES.md ~/.antigravity/GLOBAL_RULES.md
  ln -sf "$KB_DIR" ~/.antigravity/knowledgebase
  echo "  ✅ Antigravity"
fi

# 5. Windsurf
if tool_enabled "windsurf"; then
  if [ -d ~/.windsurf ]; then
    ln -sf ~/GLOBAL_RULES.md ~/.windsurf/GLOBAL_RULES.md
    ln -sf "$KB_DIR" ~/.windsurf/knowledgebase
    echo "  ✅ Windsurf"
  fi
fi

# 6. Rider (manual - just note)
if tool_enabled "rider"; then
  echo "  ✅ Rider (MCP at port 63342 - configure in IDE)"
fi

echo ""
echo "✅ Sync complete"
echo "   Source: $REPO_DIR"

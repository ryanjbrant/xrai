#!/bin/bash
# sync-ai-tools.sh - Single Source of Truth Sync
# Run after editing GLOBAL_RULES.md or AGENTS.md in Unity-XR-AI repo
# Or add to git post-commit hook

set -e
REPO_DIR="$HOME/Documents/GitHub/Unity-XR-AI"
KB_DIR="$REPO_DIR/KnowledgeBase"

echo "🔄 Syncing AI tool configurations..."

# 1. Ensure source symlinks exist at ~
ln -sf "$REPO_DIR/AGENTS.md" ~/AGENTS.md
ln -sf "$REPO_DIR/GLOBAL_RULES.md" ~/GLOBAL_RULES.md

# 2. Claude Code
mkdir -p ~/.claude
ln -sf "$KB_DIR" ~/.claude/knowledgebase

# 3. Codex
mkdir -p ~/.codex
ln -sf ~/AGENTS.md ~/.codex/AGENTS.md
ln -sf ~/GLOBAL_RULES.md ~/.codex/GLOBAL_RULES.md
ln -sf "$KB_DIR" ~/.codex/knowledgebase

# 4. Antigravity
mkdir -p ~/.antigravity
ln -sf ~/GLOBAL_RULES.md ~/.antigravity/GLOBAL_RULES.md
ln -sf "$KB_DIR" ~/.antigravity/knowledgebase

# 5. Windsurf (uses same format as Claude)
if [ -d ~/.windsurf ]; then
  ln -sf ~/GLOBAL_RULES.md ~/.windsurf/GLOBAL_RULES.md
  ln -sf "$KB_DIR" ~/.windsurf/knowledgebase
fi

echo "✅ All tools synced to Unity-XR-AI repo"
echo ""
echo "Source of truth:"
echo "  $REPO_DIR/GLOBAL_RULES.md"
echo "  $REPO_DIR/AGENTS.md"
echo "  $KB_DIR/"

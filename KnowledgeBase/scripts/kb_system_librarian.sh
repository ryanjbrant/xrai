#!/usr/bin/env bash
set -euo pipefail

# Lightweight KB librarian checks (no daemon/login item needed).

KB_ROOT="${KB_ROOT:-$HOME/Documents/GitHub/Unity-XR-AI/KnowledgeBase}"
PROJECT_ROOT="${PROJECT_ROOT:-$HOME/Documents/GitHub/Unity-XR-AI}"
LOCK_DIR="${TMPDIR:-/tmp}/kb-system-librarian"
LOCK_FILE="${LOCK_DIR}/kb_system_librarian.lock"
LOG_PREFIX="[kb-system-librarian]"

MODE="dry-run"
INTERVAL_HOURS=4
AUTO_WRITE=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [--dry-run|--execute] [--interval-hours N] [--auto-write]
  --dry-run            Read-only checks (default)
  --execute            Run checks and safe auto-fixes
  --interval-hours N   Validation hint for schedule windows (1-12)
  --auto-write         Enable gated KB/rules write actions
EOF
}

log() { echo "${LOG_PREFIX} $*"; }
warn() { echo "${LOG_PREFIX} WARN: $*" >&2; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) MODE="dry-run"; shift ;;
    --execute) MODE="execute"; shift ;;
    --interval-hours)
      INTERVAL_HOURS="${2:-}"; shift 2 ;;
    --auto-write) AUTO_WRITE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) warn "Unknown arg: $1"; usage; exit 2 ;;
  esac
done

if ! [[ "$INTERVAL_HOURS" =~ ^[0-9]+$ ]] || (( INTERVAL_HOURS < 1 || INTERVAL_HOURS > 12 )); then
  warn "--interval-hours must be 1..12"
  exit 2
fi

mkdir -p "$LOCK_DIR"
if [[ -f "$LOCK_FILE" ]]; then
  # Lock expires after 20 minutes in case of interrupted run.
  last_mod_epoch="$(stat -f %m "$LOCK_FILE" 2>/dev/null || echo 0)"
  now_epoch="$(date +%s)"
  if (( now_epoch - last_mod_epoch < 1200 )); then
    warn "Another run appears active. Exiting."
    exit 0
  fi
  warn "Stale lock detected, replacing."
fi
echo "$$" > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

log "mode=${MODE} interval_hours=${INTERVAL_HOURS} auto_write=${AUTO_WRITE}"

must_files=(
  "${KB_ROOT}/_KB_INDEX.md"
  "${KB_ROOT}/_KB_ACCESS_GUIDE.md"
  "${KB_ROOT}/AUTOMATION_QUICK_START.md"
  "${KB_ROOT}/_AUTOMATED_ORG_LIBRARIAN_GUIDE.md"
  "${PROJECT_ROOT}/AGENTS.md"
  "${PROJECT_ROOT}/GLOBAL_RULES.md"
  "${PROJECT_ROOT}/CLAUDE.md"
  "${PROJECT_ROOT}/GEMINI.md"
  "${PROJECT_ROOT}/CODEX.md"
)

missing=0
for f in "${must_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    warn "Missing: $f"
    missing=1
  fi
done

check_symlink() {
  local target="$1"
  if [[ -L "$target" ]]; then
    return 0
  fi
  warn "Missing symlink: $target"
  return 1
}

symlink_issues=0
for p in \
  "$HOME/.claude/knowledgebase" \
  "$HOME/.codex/knowledgebase" \
  "$HOME/.gemini/knowledgebase" \
  "$HOME/.cursor/knowledgebase" \
  "$HOME/.windsurf/knowledgebase" \
  "$HOME/.antigravity/knowledgebase"; do
  check_symlink "$p" || symlink_issues=1
done

if ! command -v kb >/dev/null 2>&1; then
  # Accept zsh function/alias definitions when running from non-interactive bash.
  if ! rg -n "^(alias kb=|kb\\(\\))" "$HOME/.zshrc" >/dev/null 2>&1; then
    warn "'kb' command not found in shell."
    symlink_issues=1
  fi
fi
if ! command -v kbfix >/dev/null 2>&1; then
  # Accept zsh function/alias definitions when running from non-interactive bash.
  if ! rg -n "^(alias kbfix=|kbfix\\(\\))" "$HOME/.zshrc" >/dev/null 2>&1; then
    warn "'kbfix' command not found in shell."
    symlink_issues=1
  fi
fi

log "health: missing_files=${missing} access_issues=${symlink_issues}"

if [[ "$MODE" == "execute" && "$AUTO_WRITE" -eq 1 ]]; then
  # Gate: only append minimal entry when evidence of repeated drift exists.
  if rg -n "PARAMOUNT: Cross-Tool Rule Drift" "${PROJECT_ROOT}/AGENTS.md" >/dev/null 2>&1; then
    log "gated auto-write check passed (rule-drift guard exists); no write needed."
  else
    warn "gated auto-write skipped (guard text missing, requires manual review)."
  fi
fi

if (( missing == 0 && symlink_issues == 0 )); then
  log "KB access is ready for Claude/Codex/Gemini and related tools."
else
  warn "KB access has issues. Run: ${KB_ROOT}/KB_SETUP_AUTOMATION.sh"
fi

log "done"

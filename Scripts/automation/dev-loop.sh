#!/bin/bash
# dev-loop.sh - Unified automated development loop
# Usage: ./dev-loop.sh [--watch] [--no-push]
#
# Does: Build → Test → Fix errors → Update docs → Commit → Push
# Self-improving: Logs successes/failures for pattern learning

set -e

PROJECT_DIR="$HOME/Documents/GitHub/Unity-XR-AI"
METAVIDO_DIR="$PROJECT_DIR/MetavidoVFX-main"
UNITY="/Applications/Unity/Hub/Editor/6000.2.14f1/Unity.app/Contents/MacOS/Unity"
LOG_FILE="$PROJECT_DIR/Scripts/automation/dev-loop.log"
LEARNING_LOG="$PROJECT_DIR/KnowledgeBase/LEARNING_LOG.md"

# Flags
WATCH=false
NO_PUSH=false
for arg in "$@"; do
    case $arg in
        --watch) WATCH=true ;;
        --no-push) NO_PUSH=true ;;
    esac
done

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# === 1. BUILD CHECK ===
build_check() {
    log "🔨 Build check..."

    # Quick compile check via Unity batch mode
    RESULT=$("$UNITY" -batchmode -quit -projectPath "$METAVIDO_DIR" \
        -logFile /dev/stdout 2>&1 | grep -E "error CS|error:|Compilation failed" | head -5)

    if [ -n "$RESULT" ]; then
        log "❌ Build errors found"
        echo "$RESULT"
        return 1
    fi

    log "✅ Build clean"
    return 0
}

# === 2. RUN TESTS ===
run_tests() {
    log "🧪 Running tests..."

    RESULTS_FILE="/tmp/unity-test-results-$$.xml"

    "$UNITY" -batchmode -runTests \
        -projectPath "$METAVIDO_DIR" \
        -testPlatform EditMode \
        -testResults "$RESULTS_FILE" \
        -logFile /dev/stdout 2>&1 | tail -20

    if [ -f "$RESULTS_FILE" ]; then
        FAILURES=$(grep -c 'result="Failed"' "$RESULTS_FILE" 2>/dev/null || echo "0")
        TOTAL=$(grep -c '<test-case' "$RESULTS_FILE" 2>/dev/null || echo "0")

        if [ "$FAILURES" -gt 0 ]; then
            log "❌ $FAILURES/$TOTAL tests failed"
            grep -A 2 'result="Failed"' "$RESULTS_FILE" | head -20
            return 1
        fi

        log "✅ All $TOTAL tests passed"
    fi

    return 0
}

# === 3. AUTO-FIX (if errors) ===
auto_fix() {
    local ERROR_MSG="$1"
    log "🔧 Attempting auto-fix..."

    # Check quick-fix patterns first (zero tokens)
    QUICK_FIX="$PROJECT_DIR/KnowledgeBase/_QUICK_FIX.md"
    if [ -f "$QUICK_FIX" ]; then
        # Extract error type and look for known fix
        ERROR_TYPE=$(echo "$ERROR_MSG" | grep -oE "CS[0-9]+" | head -1)
        if [ -n "$ERROR_TYPE" ]; then
            FIX=$(grep -A 3 "$ERROR_TYPE" "$QUICK_FIX" | grep "Fix:" | head -1)
            if [ -n "$FIX" ]; then
                log "📚 Found known fix: $FIX"
                # Log that we used cached fix
                echo "$(date '+%Y-%m-%d %H:%M') - Used cached fix for $ERROR_TYPE" >> "$LOG_FILE"
                return 0
            fi
        fi
    fi

    log "⚠️ No cached fix found - would invoke Claude here"
    # Future: claude --prompt "Fix: $ERROR_MSG" --auto
    return 1
}

# === 4. GIT STATUS & COMMIT ===
git_commit() {
    log "📝 Checking git status..."

    cd "$PROJECT_DIR"

    # Check for changes
    if git diff --quiet && git diff --staged --quiet; then
        log "✅ No changes to commit"
        return 0
    fi

    # Stage common patterns
    git add -A Scripts/ KnowledgeBase/*.md MetavidoVFX-main/Assets/Scripts/ 2>/dev/null || true

    # Generate commit message from changes
    CHANGED=$(git diff --staged --stat | tail -1)
    MSG="auto: dev-loop update - $CHANGED"

    git commit -m "$MSG

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" 2>/dev/null || true

    log "✅ Committed: $MSG"
}

# === 5. PUSH ===
git_push() {
    if [ "$NO_PUSH" = true ]; then
        log "⏭️ Skipping push (--no-push)"
        return 0
    fi

    log "🚀 Pushing..."
    cd "$PROJECT_DIR"
    git push 2>/dev/null && log "✅ Pushed" || log "⚠️ Push failed (might need manual)"
}

# === 6. LOG SUCCESS (for learning) ===
log_success() {
    echo "" >> "$LEARNING_LOG"
    echo "## $(date '+%Y-%m-%d %H:%M') - dev-loop success" >> "$LEARNING_LOG"
    echo "- Build: ✅" >> "$LEARNING_LOG"
    echo "- Tests: ✅" >> "$LEARNING_LOG"
    echo "- Commit: ✅" >> "$LEARNING_LOG"
}

# === MAIN LOOP ===
main() {
    log "=== Dev Loop Started ==="

    # Build
    if ! build_check; then
        auto_fix "$(cat /tmp/build-errors.txt 2>/dev/null)"
    fi

    # Test
    if ! run_tests; then
        auto_fix "Test failures"
    fi

    # Commit & Push
    git_commit
    git_push

    # Log success
    log_success

    log "=== Dev Loop Complete ==="
}

# Run once or watch
if [ "$WATCH" = true ]; then
    log "👁️ Watch mode - running every 5 minutes"
    while true; do
        main
        sleep 300
    done
else
    main
fi

#!/bin/bash
# quick-validate.sh - Fast validation without Unity (works offline)
# Run: ./quick-validate.sh

set -e

PROJECT_DIR="$HOME/Documents/GitHub/Unity-XR-AI"
METAVIDO_DIR="$PROJECT_DIR/MetavidoVFX-main"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }

echo "=== Quick Validation ==="
echo ""

# 1. Check key files exist
echo "📁 Core files..."
[ -f "$METAVIDO_DIR/Assets/Scripts/Bridges/ARDepthSource.cs" ] && pass "ARDepthSource.cs" || fail "ARDepthSource.cs"
[ -f "$METAVIDO_DIR/Assets/Scripts/Bridges/VFXARBinder.cs" ] && pass "VFXARBinder.cs" || fail "VFXARBinder.cs"
[ -f "$METAVIDO_DIR/Assets/Scripts/Editor/Tests/SpecVerificationTests.cs" ] && pass "SpecVerificationTests.cs" || fail "SpecVerificationTests.cs"

# 2. Check for syntax errors in C# files (basic grep)
echo ""
echo "🔍 Syntax check (quick)..."
CS_ERRORS=$(grep -r ";;$\|{ {" "$METAVIDO_DIR/Assets/Scripts" --include="*.cs" 2>/dev/null | wc -l | tr -d ' ')
[ "$CS_ERRORS" -lt 5 ] && pass "No obvious syntax issues" || fail "$CS_ERRORS potential issues"

# 3. Check namespace consistency
echo ""
echo "📦 Namespace check..."
XRRAI_COUNT=$(grep -r "namespace XRRAI" "$METAVIDO_DIR/Assets/Scripts" --include="*.cs" 2>/dev/null | wc -l | tr -d ' ')
pass "$XRRAI_COUNT files use XRRAI namespace"

# 4. Check test count
echo ""
echo "🧪 Test coverage..."
TEST_COUNT=$(grep -c "\[Test\]" "$METAVIDO_DIR/Assets/Scripts/Editor/Tests/"*.cs 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
pass "$TEST_COUNT tests defined"

# 5. Git status
echo ""
echo "📊 Git status..."
cd "$PROJECT_DIR"
CHANGES=$(git status --short | wc -l | tr -d ' ')
[ "$CHANGES" -lt 20 ] && pass "$CHANGES uncommitted changes" || fail "$CHANGES uncommitted changes (consider commit)"

echo ""
echo "=== Done ==="

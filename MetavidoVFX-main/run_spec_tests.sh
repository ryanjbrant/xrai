#!/bin/bash
# run_spec_tests.sh - Fast spec verification for specs 003, 009, 016
# Usage: ./run_spec_tests.sh [option]
#   no args     - Run EditMode tests in headless Unity
#   --device    - Build to device and monitor logs
#   --console   - Just check Unity console for errors
#   --quick     - Quick compilation check only

set -e

UNITY_PATH="/Applications/Unity/Hub/Editor/6000.2.14f1/Unity.app/Contents/MacOS/Unity"
PROJECT_PATH="$(pwd)"
RESULTS_FILE="TestResults/spec-tests-$(date +%Y%m%d-%H%M%S).xml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Ensure TestResults directory exists
mkdir -p TestResults

case "${1:-}" in
    --quick)
        log_info "Running quick compilation check..."
        "$UNITY_PATH" \
            -batchmode \
            -quit \
            -projectPath "$PROJECT_PATH" \
            -logFile - 2>&1 | tee TestResults/compile-log.txt

        if grep -q "error CS" TestResults/compile-log.txt; then
            log_error "Compilation errors found!"
            grep "error CS" TestResults/compile-log.txt
            exit 1
        else
            log_info "✓ Compilation successful"
        fi
        ;;

    --console)
        log_info "Checking Unity console for errors..."
        # Open Unity and run quick check
        "$UNITY_PATH" \
            -batchmode \
            -quit \
            -projectPath "$PROJECT_PATH" \
            -executeMethod MetavidoVFX.Editor.Tests.BatchTestRunner.QuickConsoleCheck \
            -logFile - 2>&1 | tee TestResults/console-log.txt
        ;;

    --device)
        log_info "Building and deploying to device..."

        # Build iOS
        log_info "Step 1/3: Building iOS..."
        "$UNITY_PATH" \
            -batchmode \
            -quit \
            -projectPath "$PROJECT_PATH" \
            -buildTarget iOS \
            -executeMethod BuildScript.BuildiOS \
            -logFile TestResults/build-log.txt

        if [ $? -ne 0 ]; then
            log_error "Unity build failed!"
            tail -50 TestResults/build-log.txt
            exit 1
        fi

        # Deploy with xcodebuild
        log_info "Step 2/3: Building Xcode project..."
        cd Builds/iOS
        xcodebuild -project Unity-iPhone.xcodeproj \
            -scheme Unity-iPhone \
            -configuration Release \
            -destination 'platform=iOS,name=IMClab 15' \
            -allowProvisioningUpdates \
            build 2>&1 | tee ../../TestResults/xcode-build-log.txt

        # Install on device
        log_info "Step 3/3: Installing on device..."
        ios-deploy --bundle build/Release-iphoneos/Unity-iPhone.app

        cd ../..

        # Monitor device logs
        log_info "Monitoring device logs (Ctrl+C to stop)..."
        idevicesyslog 2>/dev/null | grep -E "(Unity|XRRAI|Hologram|VFX|Error|Exception)" --color=always
        ;;

    "")
        log_info "Running EditMode spec verification tests..."
        log_info "Results will be saved to: $RESULTS_FILE"

        "$UNITY_PATH" \
            -batchmode \
            -projectPath "$PROJECT_PATH" \
            -runTests \
            -testPlatform EditMode \
            -testResults "$RESULTS_FILE" \
            -logFile TestResults/test-log.txt 2>&1

        # Parse results
        if [ -f "$RESULTS_FILE" ]; then
            TOTAL=$(grep -o 'total="[0-9]*"' "$RESULTS_FILE" | head -1 | grep -o '[0-9]*')
            PASSED=$(grep -o 'passed="[0-9]*"' "$RESULTS_FILE" | head -1 | grep -o '[0-9]*')
            FAILED=$(grep -o 'failed="[0-9]*"' "$RESULTS_FILE" | head -1 | grep -o '[0-9]*')
            INCONC=$(grep -o 'inconclusive="[0-9]*"' "$RESULTS_FILE" | head -1 | grep -o '[0-9]*')

            echo ""
            log_info "=== TEST RESULTS ==="
            log_info "Total:       ${TOTAL:-0}"
            log_info "Passed:      ${PASSED:-0}"
            log_warn "Inconclusive: ${INCONC:-0}"

            if [ "${FAILED:-0}" -gt 0 ]; then
                log_error "Failed:      $FAILED"
                echo ""
                log_error "Failed tests:"
                grep -B2 'result="Failed"' "$RESULTS_FILE" | grep 'name=' || true
                exit 1
            else
                log_info "✓ All tests passed!"
            fi
        else
            log_error "Test results file not created"
            exit 1
        fi
        ;;

    *)
        echo "Usage: $0 [option]"
        echo "  (no args)  - Run EditMode tests in headless Unity"
        echo "  --device   - Build to device and monitor logs"
        echo "  --console  - Quick Unity console check"
        echo "  --quick    - Quick compilation check only"
        exit 1
        ;;
esac

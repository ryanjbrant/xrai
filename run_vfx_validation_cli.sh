#!/bin/bash

# Simulated VFX Validator Script
# This mimics the logic of the C# Editor Script to generate the report now.

VFX_DIR="MetavidoVFX-main/Assets/VFX"
REPORT_FILE="VFX_Validation_Report.md"

echo "# VFX Validation Report ($(date))" > "$REPORT_FILE"
echo "Scanning VFX Graphs in $VFX_DIR..." >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

VALID=0
NEEDS_FIX=0

# Find all .vfx files
find "$VFX_DIR" -name "*.vfx" | while read -r filepath; do
    filename=$(basename "$filepath")
    
    # Check for required properties (using grep as a proxy for the C# Contains check)
    has_depth=$(grep -c "name: DepthMap" "$filepath")
    has_spawn=$(grep -cE "name: Spawn|name: _vfx_enabled" "$filepath")
    
    # We define "Valid" as having at least DepthMap (core pipeline) and Spawn (switching)
    # This is a strict subset of the full C# check but good for a CLI pass.
    if [ "$has_depth" -gt 0 ] && [ "$has_spawn" -gt 0 ]; then
        # echo "[PASS] $filename" >> "$REPORT_FILE"
        ((VALID++))
    else
        echo "### ❌ [FAIL] $filename" >> "$REPORT_FILE"
        if [ "$has_depth" -eq 0 ]; then echo "  - Missing: DepthMap" >> "$REPORT_FILE"; fi
        if [ "$has_spawn" -eq 0 ]; then echo "  - Missing: Spawn (Boolean)" >> "$REPORT_FILE"; fi
        ((NEEDS_FIX++))
    fi
done

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "**NOTE:** This is a CLI-generated preliminary report. Run the C# Validator in Unity for full property analysis." >> "$REPORT_FILE"

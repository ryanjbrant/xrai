# AR Remote Debugging Workflow

This document outlines the automated debugging and testing workflow for AR Foundation Remote.

## Overview

The workflow allows you to:
1.  **Auto-launch** the AR Companion app on your iOS device when entering Play Mode.
2.  **Auto-run** PlayMode tests (e.g., Hand Tracking) after launch.
3.  **Capture device logs** automatically during the session.
4.  **Diagnose issues** by analyzing test reports and device logs directly in Unity.

## Setup

1.  **Configure Device ID**:
    *   Run `xcrun devicectl list devices` in your terminal to find your device's UUID.
    *   In Unity, go to **H3M > Testing > AR Remote > Edit Config**.
    *   Paste the UUID into the `Device Id` field.
    *   Ensure `Bundle Id` matches your companion app (default: `com.imclab.metavidovfxARCompanion`).

2.  **Enable Automation**:
    *   In the Config, check `Auto Launch On Play` to automatically launch the app.
    *   Check `Auto Run Play Mode Tests` if you want to run tests automatically.

## Usage

### 1. Running Tests
*   **Manual**: Go to **H3M > Testing > AR Remote > Run Hand Tracking PlayMode Tests**.
*   **Automatic**: Press **Play** in the Unity Editor (if configured).
    *   The companion app will launch on the device.
    *   Device logs will start capturing to `Logs/DeviceLogs.txt`.
    *   Tests will run, and results will be saved to `Logs/TestResults.json`.

### 2. Diagnosing Issues
*   After a run, go to **H3M > Testing > AR Remote > Diagnose Last Run**.
*   This will print a summary to the Unity Console:
    *   **Test Report**: Total passed/failed, with details on failures.
    *   **Device Logs**: The last 50 lines of the device log, highlighting errors and warnings.

### 3. Manual Log Capture
*   Start capture: **H3M > Testing > AR Remote > Start Device Log Capture**.
*   Stop capture: **H3M > Testing > AR Remote > Stop Device Log Capture**.

## Files
*   **Config**: `Assets/Editor/ARRemoteTestConfig.asset`
*   **Logs**:
    *   `Logs/TestResults.json`: JSON report of the last test run.
    *   `Logs/DeviceLogs.txt`: Raw device logs captured via `xcrun devicectl`.

## Troubleshooting
*   **"Launch failed"**: Ensure the device is connected and trusted. Check the Device ID.
*   **"No logs found"**: Ensure `xcrun` is in your PATH and you have permissions.
*   **"Tests failed"**: Use the Diagnose tool to see the error message. Check device logs for corresponding errors.

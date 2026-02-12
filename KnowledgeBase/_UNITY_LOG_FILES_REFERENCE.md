# Unity Log File Locations Reference (Unity 6 / 6000.3)

> Source: Unity Official Documentation (fetched 2026-02-12)

---

## Editor Logs

| Platform | Path |
|----------|------|
| **macOS** | `~/Library/Logs/Unity/Editor.log` |
| **Windows** | `%LOCALAPPDATA%\Unity\Editor\Editor.log` |
| **Linux** | `~/.config/unity3d/Editor.log` |

**Previous log:** `Editor-prev.log` (same directory, overwritten each launch)

### Access
- Console Window: **Window > General > Console** → menu → **Open Editor Log**
- Code: `Application.consoleLogPath`
- Redirect: `-logFile <path>` CLI flag (use `-logFile -` for stdout)

---

## Package Manager (UPM) Logs

| Platform | Path |
|----------|------|
| **macOS** | `~/Library/Logs/Unity/upm.log` |
| **Windows (user)** | `%LOCALAPPDATA%\Unity\Editor\upm.log` |
| **Windows (system)** | `%ALLUSERSPROFILE%\Unity\Editor\upm.log` |
| **Linux** | `~/.config/unity3d/upm.log` |

Redirect: `-upmLogFile <path>` CLI flag

---

## Player Logs

| Platform | Path |
|----------|------|
| **macOS** | `~/Library/Logs/<CompanyName>/<ProductName>/Player.log` |
| **Windows** | `%USERPROFILE%\AppData\LocalLow\<CompanyName>\<ProductName>\Player.log` |
| **Linux** | `~/.config/unity3d/<CompanyName>/<ProductName>/Player.log` |
| **Android** | `adb logcat` (use Android Logcat package in Unity) |
| **iOS** | Xcode Console / Organizer / `deviceconsole` |
| **UWP** | `%USERPROFILE%\AppData\Local\Packages\<productname>\TempState\UnityPlayer.log` |
| **WebGL** | Browser JavaScript console (`F12`) |

### Access
- Console Window: **Open Player Log**
- Code: `Application.consoleLogPath`

---

## Licensing Logs

| Platform | Path |
|----------|------|
| **macOS** | `~/Library/Logs/Unity/Unity.Licensing.Client.log` |
| **Windows** | `%LOCALAPPDATA%\Unity\Unity.Licensing.Client.log` |
| **Linux** | `~/.config/unity3d/Unity/Unity.Licensing.Client.log` |

Audit log: same directory, `Unity.Entitlements.Audit.log`

---

## Unity Hub Logs

| Platform | Path |
|----------|------|
| **macOS** | `~/Library/Application Support/UnityHub/logs/info-log.json` |
| **Windows** | `%UserProfile%\AppData\Roaming\UnityHub\logs\info-log.json` |
| **Linux** | `~/.config/UnityHub/logs/info-log.json` |

---

## Crash Logs

| Platform | Path |
|----------|------|
| **Windows** | `%TMP%\Unity\Editor\Crashes\` |
| **macOS** | `~/Library/Logs/DiagnosticReports/` (system) or Console.app |

Override: `-crash-report-folder <path>` CLI flag

---

## CLI Log Control

| Flag | Effect |
|------|--------|
| `-logFile <path>` | Redirect Editor/Player log |
| `-logFile -` | Log to stdout (useful for CI piping) |
| `-upmLogFile <path>` | Redirect UPM log |
| `-timestamps` | Prefix every line with timestamp + thread ID |
| `-stackTraceLogType None/ScriptOnly/Full` | Control stack trace verbosity |
| `-crash-report-folder <path>` | Custom crash dump location |

---

## Quick Reference (macOS — Portals Project)

```bash
# Editor log (current session)
cat ~/Library/Logs/Unity/Editor.log

# Editor log (previous session)
cat ~/Library/Logs/Unity/Editor-prev.log

# Tail live Editor log
tail -f ~/Library/Logs/Unity/Editor.log

# iOS device logs (after deploy)
# Option 1: Xcode > Window > Devices and Simulators > select device > Open Console
# Option 2:
idevicesyslog | grep Unity

# Android device logs
adb logcat -s Unity ActivityManager PackageManager

# UPM issues
cat ~/Library/Logs/Unity/upm.log

# Hub issues
cat ~/Library/Application\ Support/UnityHub/logs/info-log.json | python3 -m json.tool
```

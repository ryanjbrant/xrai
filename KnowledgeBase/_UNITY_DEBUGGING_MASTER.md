# Unity Debugging & Profiling Reference

**Source**: [Unity 6000.2 Command Line Arguments](https://docs.unity3d.com/6000.2/Documentation/Manual/EditorCommandLineArguments.html)
**Last Updated**: 2026-01-08

---

## Xcode Frame Debugger Integration

**Source**: [XcodeFrameDebuggerIntegration](https://docs.unity3d.com/6000.2/Documentation/Manual/XcodeFrameDebuggerIntegration.html)

### Overview

The Xcode frame debugger captures GPU commands for detailed performance analysis:
- Examine GPU memory data
- Identify shader bottlenecks
- Analyze frame-by-frame rendering

### Supported Platforms

| Platform | API | Editor Support |
|----------|-----|----------------|
| macOS | Metal only | Yes |
| iOS | Metal | Via Xcode only |
| tvOS | Metal | Via Xcode only |

**Note**: Xcode only supports Metal graphics. Other APIs disable frame debugger integration.

### Frame Capture Methods

#### 1. From Application (via Xcode)

```bash
# Build Xcode project from Unity
# In Unity: File > Build Profiles > Build

# In Xcode:
# 1. Product > Scheme > Edit Scheme
# 2. Set GPU Frame Capture to "Metal"
# 3. Run and click camera icon to capture
```

#### 2. From Application (Command Line)

```csharp
// Add to your code
using UnityEngine.Apple;

// Begin capture
FrameCapture.BeginCaptureToFile("/path/to/capture.gputrace");

// ... render frames ...

// End capture
FrameCapture.EndCapture();
```

```bash
# Launch with Metal capture enabled
./MyApp -enable-metal-capture
```

**Note**: iOS does NOT support command-line capture - must use Xcode.

#### 3. From Unity Editor

1. Create/open macOS Xcode project
2. Set Executable to Unity Editor
3. Enable GPU Frame Capture → Metal
4. Run from Xcode
5. Use "Xcode Capture" button in Scene/Game view

### FrameCapture API

```csharp
using UnityEngine.Apple;

// Check if capture is available
if (FrameCapture.IsDestinationSupported(FrameCaptureDestination.DevTools))
{
    // Capture to Xcode
    FrameCapture.BeginCapture(FrameCaptureDestination.DevTools);
    // ... render ...
    FrameCapture.EndCapture();
}

// Or capture to file
FrameCapture.BeginCaptureToFile("/path/to/capture.gputrace");
// ... render ...
FrameCapture.EndCapture();
```

---

## Command Line Arguments Reference

### Launching Unity

```bash
# macOS
/Applications/Unity/Hub/Editor/<version>/Unity.app/Contents/MacOS/Unity -projectPath <path>

# Windows
"C:\Program Files\Unity\Hub\Editor\<version>\Editor\Unity.exe" -projectPath "<path>"

# Linux
/home/<user>/Unity/Hub/Editor/<version>/Editor/Unity -projectPath <path>
```

### Batch Mode (CI/CD)

| Argument | Description |
|----------|-------------|
| `-batchmode` | Run without UI, for automation |
| `-quit` | Exit after commands complete |
| `-nographics` | No GPU initialization (headless) |
| `-accept-apiupdate` | Allow API Updater in batch mode |
| `-executeMethod <Class.Method>` | Run static method on startup |
| `-logFile <path>` | Specify log file location |

```bash
# Example: Automated build
Unity -batchmode -quit -projectPath /path/to/project \
      -executeMethod BuildScript.PerformIOSBuild \
      -logFile /tmp/unity-build.log
```

### Debugging Arguments

| Argument | Description |
|----------|-------------|
| `-debugCodeOptimization` | Enable debug code optimization |
| `-disableManagedDebugger` | Disable debugger socket |
| `-wait-for-managed-debugger` | Wait for debugger attach |
| `-wait-for-native-debugger` | Wait for native debugger |
| `-stackTraceLogType Full` | Full stack traces (None/Script Only/Full) |
| `-log-memory-performance-stats` | Memory stats in log on exit |

### Graphics API Forcing

| Argument | Platform | Description |
|----------|----------|-------------|
| `-force-metal` | macOS | Force Metal API |
| `-force-vulkan` | All | Force Vulkan API |
| `-force-d3d11` | Windows | Force DirectX 11 |
| `-force-d3d12` | Windows | Force DirectX 12 |
| `-force-glcore` | All | Force OpenGL Core |
| `-force-gles` | Windows | Force OpenGL ES |
| `-force-device-index N` | All | Force specific GPU |

### Profiler Arguments

| Argument | Description |
|----------|-------------|
| `-profiler-enable` | Enable profiler on startup |
| `-deepprofiling` | Enable deep profiling |
| `-profiler-log-file <path.raw>` | Stream to .raw file |
| `-profiler-capture-frame-count N` | Capture N frames |
| `-profiler-maxusedmemory N` | Set profiler memory (bytes) |

```bash
# Example: Profile startup with deep profiling
Unity -profiler-enable -deepprofiling \
      -profiler-log-file /tmp/profile.raw \
      -profiler-capture-frame-count 300
```

### Metal-Specific (macOS)

| Argument | Description |
|----------|-------------|
| `-force-metal` | Force Metal rendering |
| `-force-low-power-device` | Use integrated GPU |
| `-enable-metal-capture` | Enable frame capture |

### Build Arguments

| Argument | Description |
|----------|-------------|
| `-buildTarget <target>` | Set build target (ios, android, etc.) |
| `-activeBuildProfile <path>` | Set active build profile |
| `-build <path>` | Build to path |
| `-buildOSXUniversalPlayer <path>` | Build macOS |
| `-buildWindows64Player <path>` | Build Windows 64-bit |
| `-buildLinux64Player <path>` | Build Linux 64-bit |

### Validation Arguments

| Argument | Description |
|----------|-------------|
| `-force-d3d12-debug` | Enable DX12 validation layer |
| `-force-d3d12-debug-gbv` | Enable DX12 GPU-based validation |
| `-force-vulkan-layers` | Enable Vulkan validation |

---

## Debugging Workflows

### 1. iOS Device Debugging

```bash
# Live Unity logs from device
idevicesyslog | grep -E "Unity|Bridge"

# Filter by log level
idevicesyslog | grep -E "\[Error\]|\[Warning\]"

# With timestamps
idevicesyslog -d | grep Unity
```

### 2. Android Device Debugging

```bash
# Clear and monitor Unity logs
adb logcat -c && adb logcat -v color -s Unity

# All logs with time
adb logcat -v time | grep -E "Unity|Bridge"

# Save to file
adb logcat -v time > device_logs.txt
```

### 3. Unity Editor Debugging

```bash
# Launch with debugger wait
/Applications/Unity/Hub/Editor/6000.2.14f1/Unity.app/Contents/MacOS/Unity \
    -projectPath /path/to/project \
    -wait-for-managed-debugger

# With full stack traces
/Applications/Unity/Hub/Editor/6000.2.14f1/Unity.app/Contents/MacOS/Unity \
    -projectPath /path/to/project \
    -stackTraceLogType Full
```

### 4. Automated Build with Logging

```bash
#!/bin/bash
UNITY="/Applications/Unity/Hub/Editor/6000.2.14f1/Unity.app/Contents/MacOS/Unity"
PROJECT="/path/to/project"
LOG="/tmp/unity-build-$(date +%Y%m%d_%H%M%S).log"

$UNITY -batchmode -quit \
    -projectPath "$PROJECT" \
    -executeMethod BuildScript.PerformIOSBuild \
    -logFile "$LOG" \
    -stackTraceLogType Full

echo "Build log: $LOG"
```

---

## Unity Console Log Prefixes

For structured debugging across platforms:

### Unity C# (BridgeTarget.cs)
```csharp
private const string LOG_PREFIX = "[Bridge]";

private static void LogDebug(string message) {
    Debug.Log($"{LOG_PREFIX} {message}");
}
```

### React Native (UnityArView.tsx)
```typescript
const LOG_PREFIX = '[UnityArView]';

const logDebug = (message: string) => {
    console.log(`${LOG_PREFIX} ${message}`);
};
```

### Filter Logs by Prefix

```bash
# iOS
idevicesyslog | grep -E "\[Bridge\]|\[UnityArView\]"

# Android
adb logcat | grep -E "\[Bridge\]|\[UnityArView\]"

# Unity Editor Log
tail -f ~/Library/Logs/Unity/Editor.log | grep "\[Bridge\]"
```

---

## Performance Analysis Workflow

### 1. Profile Build

```bash
# Enable profiler in build
Unity -batchmode -quit \
    -projectPath /path/to/project \
    -buildTarget ios \
    -profiler-enable \
    -executeMethod BuildScript.PerformIOSBuild
```

### 2. Capture Metal Frame

```bash
# From command line (macOS only)
./MyApp.app/Contents/MacOS/MyApp -enable-metal-capture

# Then in code:
FrameCapture.BeginCaptureToFile("/tmp/frame.gputrace");
```

### 3. Analyze in Xcode

1. Open `.gputrace` file in Xcode
2. Examine draw calls, shader time
3. Identify bottlenecks
4. Optimize shaders/batching

---

## Unity Log File Locations

**Source**: [Unity Log Files](https://docs.unity3d.com/6000.2/Documentation/Manual/log-files.html)

### Editor Logs

| Platform | Location |
|----------|----------|
| **macOS** | `~/Library/Logs/Unity/Editor.log` |
| **Windows** | `%LOCALAPPDATA%\Unity\Editor\Editor.log` |
| **Linux** | `~/.config/unity3d/Editor.log` |

**Tip**: In Unity Editor, Console → Open Editor Log

### Package Manager Logs

| Platform | Location |
|----------|----------|
| **macOS** | `~/Library/Logs/Unity/upm.log` |
| **Windows** | `%LOCALAPPDATA%\Unity\Editor\upm.log` |
| **Linux** | `~/.config/unity3d/upm.log` |

### Player Logs (Built Apps)

| Platform | Location |
|----------|----------|
| **macOS** | `~/Library/Logs/CompanyName/ProductName/Player.log` |
| **Windows** | `%USERPROFILE%\AppData\LocalLow\CompanyName\ProductName\Player.log` |
| **Linux** | `~/.config/unity3d/CompanyName/ProductName/Player.log` |
| **iOS** | Xcode Organizer or `idevicesyslog` |
| **Android** | `adb logcat -s Unity` |
| **WebGL** | Browser JavaScript console |

### Accessing Logs Programmatically

```csharp
// Get current log path
string logPath = Application.consoleLogPath;
Debug.Log($"Log file: {logPath}");
```

### iOS Device Logs

```bash
# Using libimobiledevice (recommended)
idevicesyslog | grep Unity

# Filter by app
idevicesyslog | grep -E "Unity|YourAppName"

# Save to file
idevicesyslog > device_log.txt
```

### Android Device Logs

```bash
# Clear and monitor Unity logs
adb logcat -c && adb logcat -s Unity

# With timestamps
adb logcat -v time -s Unity

# All logs filtered
adb logcat | grep -E "Unity|Bridge"

# Save to file
adb logcat -v time > android_log.txt
```

### Crash Reports

| Platform | Location |
|----------|----------|
| **Windows** | `%TMP%\Unity\Editor\Crashes` |
| **macOS** | `~/Library/Logs/DiagnosticReports/` |
| **iOS** | Xcode → Window → Devices and Simulators → View Device Logs |

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No GPU in batch mode | Use `-nographics` flag |
| Frame capture fails | Ensure `-enable-metal-capture` flag |
| Logs truncated | Use `-logFile` with full path |
| Debugger won't attach | Use `-wait-for-managed-debugger` |
| Wrong GPU used | Use `-force-device-index N` |
| Metal not available | Use `-force-metal` flag |
| Can't find player log | Check `Application.consoleLogPath` |
| iOS logs not showing | Device must be unlocked, use `idevicesyslog` |

---

---

## Player Command Line Arguments

**Source**: [PlayerCommandLineArguments](https://docs.unity3d.com/6000.2/Documentation/Manual/PlayerCommandLineArguments.html)

These work on all standalone platforms except Web.

### Common Player Arguments

| Argument | Description |
|----------|-------------|
| `-batchmode` | Headless mode, no display/input |
| `-nographics` | No GPU initialization |
| `-logFile <path>` | Specify log file location |
| `-nolog` | Disable player logging |
| `-timestamps` | Add timestamps to log messages |

### Graphics Forcing (Player)

| Argument | Platform | Description |
|----------|----------|-------------|
| `-force-metal` | macOS | Force Metal |
| `-force-vulkan` | All | Force Vulkan |
| `-force-d3d11` | Windows | Force DirectX 11 |
| `-force-d3d12` | Windows | Force DirectX 12 |
| `-force-glcore` | All | Force OpenGL Core |
| `-force-device-index N` | All | Use specific GPU |
| `-force-low-power-device` | macOS | Use integrated GPU |

### Display Arguments

| Argument | Description |
|----------|-------------|
| `-screen-width N` | Override screen width |
| `-screen-height N` | Override screen height |
| `-screen-fullscreen 0/1` | Override fullscreen state |
| `-screen-quality <name>` | Override quality level |
| `-monitor N` | Run on specific monitor (1-based) |
| `-popupwindow` | Create borderless popup window |
| `-window-mode exclusive/borderless` | Override fullscreen mode (Windows) |

### Debugging (Player)

| Argument | Description |
|----------|-------------|
| `-wait-for-managed-debugger` | Wait for C# debugger |
| `-wait-for-native-debugger` | Wait for native debugger |
| `-log-memory-performance-stats` | Memory report on exit |
| `-systemallocator` | Use system allocator (for sanitizers) |

### Special (Windows)

| Argument | Description |
|----------|-------------|
| `-single-instance` | Only one instance allowed |
| `-parentHWND <HWND>` | Embed in another window |

---

---

## SerializedObject API (Editor Scripting)

**Source**: [SerializedObject](https://docs.unity3d.com/6000.2/Documentation/ScriptReference/SerializedObject.html)

### Overview

`SerializedObject` and `SerializedProperty` are core Editor APIs for editing serialized fields on Unity objects with:
- Automatic Undo support
- Prefab override tracking
- Multi-object editing
- Dirty state management

### Basic Pattern

```csharp
using UnityEditor;
using UnityEngine;

// Edit a single object
var so = new SerializedObject(myComponent);
so.FindProperty("m_LocalPosition").vector3Value = Vector3.zero;
so.ApplyModifiedProperties();  // Commits changes with Undo support
```

### Multi-Object Editing

```csharp
// Edit multiple objects simultaneously
var transforms = Selection.gameObjects.Select(go => go.transform).ToArray();
var so = new SerializedObject(transforms);
so.FindProperty("m_LocalPosition").vector3Value = Vector3.zero;
so.ApplyModifiedProperties();
```

### Key Methods

| Method | Description |
|--------|-------------|
| `FindProperty(string)` | Get SerializedProperty by path (e.g., "m_LocalPosition") |
| `ApplyModifiedProperties()` | Commit changes with Undo support |
| `ApplyModifiedPropertiesWithoutUndo()` | Commit without Undo |
| `Update()` | Refresh from target objects (call before reading if kept across frames) |
| `GetIterator()` | Iterate all properties |

### Key Properties

| Property | Description |
|----------|-------------|
| `targetObject` | Single inspected object |
| `targetObjects` | All inspected objects (multi-edit) |
| `hasModifiedProperties` | True if pending changes |
| `isEditingMultipleObjects` | True if multi-edit mode |

### Finding Property Paths

**Tip**: Shift+Right Click on any property in the Inspector to see its path!

Common paths:
- `m_LocalPosition` - Transform position
- `m_LocalRotation` - Transform rotation
- `m_LocalScale` - Transform scale
- `m_Enabled` - Component enabled state
- `m_Name` - Object name

### Custom Editor Pattern

```csharp
[CustomEditor(typeof(MyComponent))]
public class MyComponentEditor : Editor
{
    SerializedProperty m_MyField;

    void OnEnable()
    {
        m_MyField = serializedObject.FindProperty("m_MyField");
    }

    public override void OnInspectorGUI()
    {
        serializedObject.Update();  // Refresh from target

        EditorGUILayout.PropertyField(m_MyField);

        if (GUILayout.Button("Reset"))
        {
            m_MyField.floatValue = 0f;
        }

        serializedObject.ApplyModifiedProperties();  // Commit changes
    }
}
```

### Data Validation

SerializedObject bypasses property setters! Use `OnValidate()` for validation:

```csharp
public class MyComponent : MonoBehaviour
{
    [SerializeField] private float m_Value;

    public float value
    {
        get => m_Value;
        set => m_Value = Mathf.Clamp01(value);  // Setter validation
    }

    void OnValidate()
    {
        // Called when loaded or modified via SerializedObject
        m_Value = Mathf.Clamp01(m_Value);
    }
}
```

---

## References

- [Unity Editor Command Line Arguments](https://docs.unity3d.com/6000.2/Documentation/Manual/EditorCommandLineArguments.html)
- [Unity Player Command Line Arguments](https://docs.unity3d.com/6000.2/Documentation/Manual/PlayerCommandLineArguments.html)
- [Xcode Frame Debugger Integration](https://docs.unity3d.com/6000.2/Documentation/Manual/XcodeFrameDebuggerIntegration.html)
- [Unity Profiler](https://docs.unity3d.com/6000.2/Documentation/Manual/Profiler.html)
- [FrameCapture API](https://docs.unity3d.com/ScriptReference/Apple.FrameCapture.html)
- [SerializedObject API](https://docs.unity3d.com/6000.2/Documentation/ScriptReference/SerializedObject.html)
- [SerializedProperty API](https://docs.unity3d.com/6000.2/Documentation/ScriptReference/SerializedProperty.html)
- [PlayerSettings API](https://docs.unity3d.com/6000.2/Documentation/ScriptReference/PlayerSettings.html)
- [Unity Log Files](https://docs.unity3d.com/6000.2/Documentation/Manual/log-files.html)
- [VS Code Unity Setup](https://code.visualstudio.com/docs/other/unity)

---

## VS Code Unity Setup

**Source**: [VS Code Unity Docs](https://code.visualstudio.com/docs/other/unity)

### Requirements

1. Unity 2021 or later
2. Visual Studio Code
3. **Unity for Visual Studio Code** extension (by Microsoft)

### Unity Configuration

1. **Update Visual Studio Editor Package**:
   - Unity → Window → Package Manager
   - Upgrade `Visual Studio Editor` to **2.0.20 or above**
   - Note: The old `Visual Studio Code Editor` package is deprecated

2. **Set VS Code as External Editor**:
   - Unity → Preferences → External Tools
   - Set **External Script Editor** to Visual Studio Code

### Features

- Syntax Highlighting
- IntelliSense (autocomplete)
- Go-to Definition
- Peek References
- CodeLens
- Hover documentation
- Snippets
- Bracket matching

### Debugging

**Attach to Unity Editor**:
- Default configuration auto-attaches to Unity Editor
- Press **F5** to start debugging

**Attach to Standalone Player**:
- Use command: **Attach Unity Debugger**
- Or add to `.vscode/launch.json`:

```json
{
  "name": "Attach to Player",
  "type": "vstuc",
  "request": "attach",
  "endPoint": "127.0.0.1:56321"
}
```

### Recommended Extensions

| Extension | Purpose |
|-----------|---------|
| Unity for VS Code | Core Unity support |
| C# Dev Kit | Enhanced C# editing |
| Unity Snippets | Code snippets |
| Unity Tools | Additional helpers |

---

## JetBrains Rider Unity Debugging

**Source**: [Rider Unity Debugging](https://www.jetbrains.com/help/rider/Debugging_Unity_Applications.html)

### Local Debugging

1. Open Unity project in Unity Editor
2. Open corresponding solution in Rider
3. Set breakpoints in code
4. Select **Attach to Unity Editor & Play** run configuration
5. Press **Shift+F9** or click Debug button

### Remote Device Debugging

**Requirements**:
- **Development Build** enabled in Build Settings
- **Script Debugging** enabled
- Device visible on network
- Firewall allows incoming UDP

**Steps**:
1. Run → Attach to Unity Process
2. Click "Add player address manually"
3. Enter Host IP and Port
4. Select Unity process → OK

### Android USB Debugging (via adb)

1. Build target set to Android
2. Deploy to connected device via USB
3. Run → Attach to Unity Process
4. Select Android device and Unity project
5. Add breakpoints and debug

### Rider-Specific Features

**Pausepoints** (unique to Rider):
- Pauses Unity Editor at end of frame (not code execution)
- Lets you inspect game state in Unity Inspector
- Right-click breakpoint → Convert to Unity pausepoint

**Tracepoints**:
- Output to Unity Console instead of suspending

**Texture Debugging**:
- View textures directly in debugger
- Zoom/pan controls for inspection

**Enhanced Object Display**:
- Scene shows root GameObjects
- GameObject shows children and components
- ECS Entity shows component data

---

## Platform-Dependent Compilation

**Source**: [Platform Dependent Compilation](https://docs.unity3d.com/6000.2/Documentation/Manual/platform-dependent-compilation.html)

### Preprocessor Directives

```csharp
#if UNITY_STANDALONE_WIN
    Debug.Log("Windows Standalone");
#elif UNITY_IOS
    Debug.Log("iOS");
#elif UNITY_ANDROID
    Debug.Log("Android");
#else
    Debug.Log("Other platform");
#endif
```

### Common Platform Symbols

| Symbol | Platform |
|--------|----------|
| `UNITY_EDITOR` | Unity Editor |
| `UNITY_EDITOR_WIN` | Editor on Windows |
| `UNITY_EDITOR_OSX` | Editor on macOS |
| `UNITY_STANDALONE` | Any standalone |
| `UNITY_STANDALONE_WIN` | Windows standalone |
| `UNITY_STANDALONE_OSX` | macOS standalone |
| `UNITY_STANDALONE_LINUX` | Linux standalone |
| `UNITY_IOS` | iOS |
| `UNITY_ANDROID` | Android |
| `UNITY_WEBGL` | WebGL |
| `UNITY_WSA` | Universal Windows Platform |
| `UNITY_TVOS` | tvOS |
| `UNITY_VISIONOS` | visionOS |

### Editor vs Build Symbols

```csharp
#if UNITY_EDITOR
    // Only in Editor (not in builds)
#endif

#if !UNITY_EDITOR
    // Only in builds (not in Editor)
#endif

#if UNITY_IOS && !UNITY_EDITOR
    // iOS builds only (not Editor playing as iOS)
    [DllImport("__Internal")]
    public static extern void sendMessageToMobileApp(string message);
#endif
```

### React Native Unity Bridge Example

```csharp
private void SendToMobileApp(string payload)
{
#if UNITY_ANDROID
    using (var jc = new AndroidJavaClass("com.azesmwayreactnativeunity.ReactNativeUnityViewManager"))
    {
        jc.CallStatic("sendMessageToMobileApp", payload);
    }
#elif UNITY_IOS && !UNITY_EDITOR
    NativeAPI.sendMessageToMobileApp(payload);
#else
    Debug.Log($"[Editor Mock] Would send: {payload}");
#endif
}
```

### Alternatives to Directives

1. **`[Conditional]` Attribute**:
```csharp
[System.Diagnostics.Conditional("UNITY_EDITOR")]
void EditorOnlyMethod() { }
```

2. **Assembly Definition Constraints**:
   - Organize code in assemblies
   - Set Define Constraints on assembly definition
   - Compile only when conditions met

3. **Runtime Checks** (preferred for some cases):
```csharp
// Better than UNITY_64 for architecture detection
if (IntPtr.Size == 4)
    // 32-bit
else
    // 64-bit
```

### Custom Scripting Symbols

Define in: Project Settings → Player → Other Settings → Scripting Define Symbols

```csharp
#if MY_CUSTOM_FEATURE
    // Custom feature code
#endif
```
# Unity Editor Error Log Analysis

**Date**: 2026-01-21
**Project**: MetavidoVFX-main
**Unity Version**: 6000.2.14f1
**Status**: Active Issue Tracking

---

## Executive Summary

Analysis of Unity Editor crash logs revealed **4 categories** of errors requiring attention:
1. HoloKit native plugin entry point failures
2. NullReferenceExceptions in VFX/AR operations
3. Package manifest warnings
4. LINQ empty sequence errors

---

## 1. HoloKit Native Plugin Errors

### Error Messages
```
EntryPointNotFoundException: HoloKit_AppleVisionHandPoseDetector_initWithARSession
EntryPointNotFoundException: RegisterDebugLog
```

### Root Cause
HoloKit SDK native iOS plugins are not available in the Unity Editor environment. These functions are implemented in native iOS code (`.framework` or `.a` files) that only execute on device.

### Impact
- **Severity**: Medium (Editor-only)
- **Runtime**: No impact on iOS builds
- **Development**: Blocks Editor testing of hand tracking features

### Recommended Fix
Wrap HoloKit calls in platform-conditional compilation:

```csharp
#if UNITY_IOS && !UNITY_EDITOR
    HoloKit_AppleVisionHandPoseDetector_initWithARSession(session);
#else
    Debug.Log("[HoloKit] Native hand tracking not available in Editor");
#endif
```

Or use `Application.isEditor`:
```csharp
if (!Application.isEditor)
{
    // Native plugin calls here
}
```

### Files to Check
- Any script referencing `HoloKit_AppleVision*` methods
- HoloKit SDK initialization code
- Hand pose detection components

---

## 2. WebRTC Native Plugin Errors

### Error Message
```
EntryPointNotFoundException: RegisterDebugLog
assembly:<unknown assembly> type:<unknown type> member:(null)
  at Unity.WebRTC.WebRTC.InitializeInternal()
  at Unity.WebRTC.ContextManager.OnAfterAssemblyReload()
```

### Root Cause
Unity WebRTC package initializes native plugins on assembly reload. The native library (`webrtccsharpwrap.dll` / `.dylib`) is platform-specific and may not be available in Editor.

### Impact
- **Severity**: Low (Editor-only warning)
- **Runtime**: Works correctly on device

### Recommended Fix
The WebRTC package handles this internally. If persistent, add conditional:
```csharp
#if !UNITY_EDITOR || UNITY_WEBRTC_EDITOR_SUPPORT
    WebRTC.Initialize();
#endif
```

---

## 3. ONNX Importer Conflict

### Error Message
```
Multiple scripted importers are targeting the extension 'onnx' and have all been rejected:
- Unity.InferenceEngine.Editor.Onnx.ONNXModelImporter
- Microsoft.ML.OnnxRuntime.Unity.Editor.OrtImporter
```

### Root Cause
Two packages both try to import `.onnx` files:
1. **Sentis** (Unity.InferenceEngine) - Unity's official ML package
2. **ONNX Runtime Unity** (com.github.asus4.onnxruntime) - Third-party runtime

### Impact
- **Severity**: Medium (ONNX models won't import)
- **Solution Required**: Choose one importer

### Recommended Fix

**Option A: Keep Sentis (Recommended)**
Remove ONNX Runtime Unity if not needed:
1. Edit `Packages/manifest.json`
2. Remove `"com.github.asus4.onnxruntime.unity": "..."`
3. Delete `Packages/com.github.asus4.onnxruntime.unity/`

**Option B: Use ONNX Runtime**
If you need ONNX Runtime's features, remove Sentis importer:
1. Create `Assets/Editor/DisableONNXImporter.cs`:
```csharp
// Requires package removal or ScriptedImporter override
```

**Option C: Use both with different extensions**
Rename one set of models to `.onnxrt` and configure importer.

---

## 4. VFX HLSL Missing Include

### Error Message
```
Shader error in 'Hidden/VFX/Bubbles/Balls/Output Particle URP Lit Mesh':
undeclared identifier 'SampleBeatPulse' at Bubbles.vfx(4378)
```

### Root Cause
VFX Graph Custom HLSL block calls `SampleBeatPulse()` without including `AudioVFX.hlsl`.

### Fix Applied
Inlined the function directly in Bubbles.vfx Custom HLSL block:
```hlsl
float SampleBeatPulseLocal(Texture2D tex, SamplerState samp) {
    return tex.SampleLevel(samp, float2(0.75, 0.25), 0).g;
}
```

### Prevention
VFX Graph Custom HLSL blocks cannot use `#include` reliably. Options:
1. **Inline the function** (simple, self-contained)
2. **Use m_ShaderFile** to reference external .hlsl
3. **Use VFX Graph operators** instead of Custom HLSL

---

## 5. NullReferenceExceptions

### Common Patterns Found

#### Pattern A: AR Texture Access
```
NullReferenceException: Object reference not set to an instance of an object
  at UnityEngine.VFX.VisualEffect.SetTexture()
```

**Cause**: Attempting to set AR textures (depth, stencil, color) before they're available.

**Fix**: Already implemented in ARDepthSource.cs with TryGetTexture pattern:
```csharp
Texture TryGetTexture(Func<Texture> getter)
{
    try { return getter?.Invoke(); }
    catch { return null; }
}
```

#### Pattern B: VFX Component Missing
```
NullReferenceException at VFXLibraryManager
```

**Cause**: VFX component destroyed or not yet initialized.

**Fix**: Null-check before operations:
```csharp
if (entry?.VFX != null && entry.VFX.enabled)
{
    entry.VFX.SetTexture(...);
}
```

#### Pattern C: First() on Empty Collection
```
InvalidOperationException: Sequence contains no elements
```

**Cause**: LINQ `First()` called on empty collection.

**Fix**: Use `FirstOrDefault()` with null check:
```csharp
// Bad
var item = collection.First();

// Good
var item = collection.FirstOrDefault();
if (item != null)
{
    // Use item
}
```

### Files Requiring Validation
| File | Pattern | Status |
|------|---------|--------|
| ARDepthSource.cs | A | FIXED (TryGetTexture) |
| VFXARBinder.cs | A | FIXED |
| VFXLibraryManager.cs | B, C | NEEDS REVIEW |
| HumanParticleVFX.cs | A | FIXED |
| MeshVFX.cs | A | FIXED |
| HandVFXController.cs | A | FIXED |

---

## 3. Package Manifest Warnings

### Warning Messages
```
[WARN] Package folder [.../Packages/Coplay] missing package manifest.
[WARN] Package folder [.../Packages/Microsoft.CodeAnalysis.Analyzers.3.11.0] missing package manifest.
```

### Root Cause
Package folders exist but lack required `package.json` files.

### Impact
- **Severity**: Low
- **Runtime**: No impact
- **UPM**: Package Manager can't recognize these as valid packages

### Recommended Fixes

#### Option A: Create package.json files

For `Packages/Coplay/package.json`:
```json
{
  "name": "com.local.coplay",
  "version": "1.0.0",
  "displayName": "Coplay",
  "description": "Local Coplay package",
  "unity": "6000.2"
}
```

For `Packages/Microsoft.CodeAnalysis.Analyzers.3.11.0/package.json`:
```json
{
  "name": "com.microsoft.codeanalysis.analyzers",
  "version": "3.11.0",
  "displayName": "Microsoft CodeAnalysis Analyzers",
  "description": "Roslyn analyzers for code quality"
}
```

#### Option B: Move to Assets/Plugins
If these aren't true UPM packages, move them to `Assets/Plugins/` instead.

#### Option C: Remove if unused
If packages are no longer needed, delete the folders.

---

## 4. Native Crash Information

### Crash Log Excerpt
```
=================================================================
Native Crash Reporting
=================================================================
Got a SIGABRT while executing native code.
```

### Potential Causes
1. **Memory corruption** - Buffer overflows in native plugins
2. **Thread safety** - Accessing Unity objects from background threads
3. **AR session teardown** - Improper cleanup of ARKit/ARCore sessions

### Debugging Steps
1. Enable `Development Build` and `Script Debugging`
2. Check Xcode console for more details
3. Review crash reports in `~/Library/Logs/DiagnosticReports/`
4. Look for pattern: crash after AR session starts/stops

### Mitigation
```csharp
// Safe AR session cleanup
void OnDestroy()
{
    if (arSession != null && arSession.enabled)
    {
        arSession.enabled = false;
        // Wait a frame before destroying
        StartCoroutine(SafeDestroy());
    }
}

IEnumerator SafeDestroy()
{
    yield return null; // Wait one frame
    Destroy(arSession.gameObject);
}
```

---

## 5. Error Prevention Checklist

### Before Play Mode
- [ ] Verify AR Foundation managers are in scene
- [ ] Check HoloKit components have Editor guards
- [ ] Ensure VFXLibrary has rebuilt from children

### During Development
- [ ] Use `?.` null-conditional operators
- [ ] Use `FirstOrDefault()` instead of `First()`
- [ ] Wrap native plugin calls in `#if !UNITY_EDITOR`
- [ ] Validate textures before passing to VFX

### Before Build
- [ ] Check Console for warnings (0 errors required)
- [ ] Run `Tools > VFX > Validate VFX Bindings`
- [ ] Clear UPM cache if package warnings persist

---

## 6. Quick Reference: Error → Solution

| Error Type | Quick Fix |
|------------|-----------|
| `EntryPointNotFoundException` | `#if !UNITY_EDITOR` guard |
| `NullReferenceException: SetTexture` | Use TryGetTexture pattern |
| `InvalidOperationException: Sequence` | Use `FirstOrDefault()` |
| `Package missing manifest` | Add package.json or move to Plugins |
| `SIGABRT native crash` | Check AR session lifecycle |

---

## 7. Log File Locations

| Log | Path | Purpose |
|-----|------|---------|
| Editor.log | `~/Library/Logs/Unity/Editor.log` | Current session |
| Editor-prev.log | `~/Library/Logs/Unity/Editor-prev.log` | Previous session |
| upm.log | `~/Library/Logs/Unity/upm.log` | Package manager |
| Crash reports | `~/Library/Logs/DiagnosticReports/` | Native crashes |
| Player.log | `~/Library/Logs/Unity/Player.log` | Standalone builds |

---

## References

- [Unity Debug Log](https://docs.unity3d.com/Manual/LogFiles.html)
- [AR Foundation Troubleshooting](https://docs.unity3d.com/Packages/com.unity.xr.arfoundation@6.2/manual/troubleshooting.html)
- [HoloKit SDK Documentation](https://holokit.io/docs)
- [VFX Graph Best Practices](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/BestPractices.html)

---

*Last Updated: 2026-01-21*

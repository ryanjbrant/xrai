# Unity as a Library - Cross-Platform Overview

**Source**: [Unity 6000.2 Cross-Platform Features](https://docs.unity3d.com/6000.2/Documentation/Manual/cross-platform-features.html)
**UAAL Example Repository**: [Unity-Technologies/uaal-example](https://github.com/Unity-Technologies/uaal-example)
**Last Updated**: 2026-01-08

---

## What is Unity as a Library?

Starting with Unity 2019.3, Unity can be embedded as a library in native platform applications. This allows developers to include Unity-powered features in their native apps:

- 3D/2D Real-Time Rendering
- AR/VR Experiences
- 3D Model Interaction
- 2D Mini-games
- Interactive Visualizations

The Unity Runtime Library exposes controls to manage when and how to load, activate, and unload Unity content.

## Requirements

| Platform | Unity Version |
|----------|---------------|
| Android | Unity 6000.0.0b16 or higher |
| iOS | Unity 2021.3.28f1 or higher |

**Warning**: Using Unity as a Library requires experience with native platform development (Java/Kotlin for Android, Objective-C/Swift for iOS).

## Architecture Overview

### Build Output Structure

Unity generates platform-specific projects with two parts:

| Part | iOS | Android | Description |
|------|-----|---------|-------------|
| **Library** | UnityFramework.framework | unityLibrary (AAR) | Source, plugins, runtime |
| **Launcher** | Unity-iPhone target | launcher module | App representation, starts Unity |

### Integration Pattern

```
Native App
    └── Unity Library (embedded)
        ├── Unity Runtime
        ├── Player Data (scenes, assets)
        └── Native Plugins
```

## Platform-Specific Details

### iOS
- **Framework**: `UnityFramework.framework`
- **API Class**: `UnityFramework` (Objective-C)
- **Key Methods**: `runEmbeddedWithArgc`, `sendMessageToGOWithName`, `unloadApplication`
- **Process Model**: Same process as host app
- **Full Guide**: See `_UNITY_AS_A_LIBRARY_IOS.md`

### Android
- **Module**: `unityLibrary` (Gradle module)
- **API Class**: `UnityPlayer` (Java)
- **Key Methods**: `UnitySendMessage`, `unload`, `pause`, `resume`
- **Process Model**: Separate process (`:Unity`)
- **Full Guide**: See `_UNITY_AS_A_LIBRARY_ANDROID.md`

## Supported Platforms

From official Unity 6000.2 documentation:

| Platform | Documentation |
|----------|---------------|
| Android | [UnityasaLibrary-Android.html](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-Android.html) |
| iOS | [UnityasaLibrary-iOS.html](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-iOS.html) |
| Windows | [UnityasaLibrary-Windows.html](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-Windows.html) |
| UWP | [UnityasaLibrary-UWP.html](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-UWP.html) |

## Memory Overhead

When Unity is in unloaded state (after `Application.Unload`):
- **Range**: 80-180 MB retained
- **Varies by**: Device graphics resolution

This memory is retained to enable instant reload without full reinitialization.

## Known Limitations (Both Platforms)

1. **Full-screen only** - Unity cannot render on part of the screen
2. **Single instance** - Cannot load multiple Unity runtimes
3. **Third-party plugins** - May need adaptation
4. **Lifecycle control** - Unity doesn't control runtime lifecycle

### Platform-Specific Limitations

| Limitation | iOS | Android |
|------------|-----|---------|
| Status bar control | Via Info.plist only | N/A |
| Xamarin compatibility | N/A | Not supported |
| Play Feature Delivery | N/A | Not supported |

## Messaging Bridge Pattern

### React Native → Unity

```typescript
// React Native (TypeScript)
unityRef.current?.sendMessage('BridgeTarget', 'OnMessage', jsonPayload);
```

**iOS Under the Hood**:
```objc
[[ufw] sendMessageToGOWithName:gameObject functionName:method message:msg];
```

**Android Under the Hood**:
```java
UnityPlayer.UnitySendMessage(gameObject, method, msg);
```

### Unity → React Native

```csharp
// Unity C# (BridgeTarget.cs)
public void SendToMobileApp(string payload)
{
#if UNITY_ANDROID
    using (var jc = new AndroidJavaClass("com.azesmwayreactnativeunity.ReactNativeUnityViewManager"))
    {
        jc.CallStatic("sendMessageToMobileApp", payload);
    }
#elif UNITY_IOS && !UNITY_EDITOR
    NativeAPI.sendMessageToMobileApp(payload);
#endif
}
```

## Lifecycle Management

### Load States

```
┌─────────────┐     load()      ┌─────────────┐
│   Unloaded  │ ───────────────>│   Running   │
└─────────────┘                 └─────────────┘
       ▲                              │
       │         unload()             │
       └──────────────────────────────┘

       │         quit()               │
       └─────────────> Process Ends ──┘
```

### Key Lifecycle Events

| Event | iOS | Android | Description |
|-------|-----|---------|-------------|
| Unload | `unityDidUnload:` | `onUnityPlayerUnloaded()` | Unity paused, scenes unloaded |
| Quit | `unityDidQuit:` | `onUnityPlayerQuitted()` | Unity terminated |

### Important: unload() vs quit()

- **unload()**: Releases most memory, Unity can be restarted
- **quit()**: Full termination, Unity CANNOT be restarted in same process

## Cross-Platform Development Tips

### 1. Conditional Compilation

```csharp
#if UNITY_IOS && !UNITY_EDITOR
    // iOS-specific code
#elif UNITY_ANDROID
    // Android-specific code
#else
    // Editor/fallback code
#endif
```

### 2. Unified Message Handler

```csharp
public class BridgeTarget : MonoBehaviour
{
    public void OnMessage(string json)
    {
        // Same handler for both platforms
        var data = JsonUtility.FromJson<MessageData>(json);
        HandleMessage(data);
    }
}
```

### 3. Platform-Specific Initialization

```csharp
void Start()
{
#if UNITY_IOS
    // iOS-specific initialization
#elif UNITY_ANDROID
    // Android-specific initialization
#endif

    // Common initialization
    SendReadyMessage();
}
```

## React Native Package Comparison

| Feature | @azesmway/react-native-unity | Manual Integration |
|---------|------------------------------|-------------------|
| Setup complexity | Low (npm + pod install) | High (manual Xcode/Gradle) |
| Customization | Limited | Full control |
| Maintenance | Package updates | Manual maintenance |
| Build script | Provided | Custom |
| Best for | Standard integrations | Complex/custom needs |

## Build Flow Summary

### iOS (React Native)

```bash
Unity Export → /tmp/unity-ios-export/
            ↓
xcodebuild UnityFramework.framework
            ↓
Copy to unity/builds/ios/
            ↓
pod install (clears cache first)
            ↓
xcodebuild iOS app
```

### Android (React Native)

```bash
Unity Export → Gradle project
            ↓
./gradlew assembleRelease
            ↓
React Native links unityLibrary
            ↓
./gradlew bundleRelease
            ↓
adb install
```

## Debugging

### iOS
```bash
idevicesyslog | grep -E "Bridge|Unity"
```

### Android
```bash
adb logcat -v color -s Unity
```

### Both Platforms
- Add `[Bridge]` prefix to Unity logs
- Add `[UnityArView]` prefix to RN logs
- Use debug toggles for production builds

## Related Documentation

- [_UNITY_AS_A_LIBRARY_IOS.md](./_UNITY_AS_A_LIBRARY_IOS.md) - iOS-specific details
- [_UNITY_AS_A_LIBRARY_ANDROID.md](./_UNITY_AS_A_LIBRARY_ANDROID.md) - Android-specific details
- [Unity Official: Unity as a Library](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary.html)
- [Unity Official: Cross-Platform Features](https://docs.unity3d.com/6000.2/Documentation/Manual/cross-platform-features.html)
- [UAAL Example Repository](https://github.com/Unity-Technologies/uaal-example)

## Other Cross-Platform Features

From Unity's cross-platform features documentation:

| Feature | Description |
|---------|-------------|
| Deep Linking | Enable deep links within your application |
| Xcode Frame Debugger | GPU performance analysis on iOS/macOS |
| Graphics API Support | Platform-specific graphics backends |
| Mobile Accessibility | Accessible mobile applications |
| Unity Remote | Test without building (Android, iOS, tvOS) |

---

**Verified**: portals_v4 implementation correctly follows all official UAAL requirements for iOS. Android support follows the same patterns with Gradle/AAR instead of CocoaPods/Framework.
# Unity as a Library - iOS Integration Guide

**Source**: [Unity 6000.2 Official Docs](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-iOS.html)
**Last Updated**: 2026-01-08
**Verified With**: @azesmway/react-native-unity@1.0.11

---

## Overview

Unity as a Library allows embedding Unity-powered features (3D/2D rendering, AR, mini-games) into native iOS applications. The Unity Runtime Library exposes controls to manage when and how to load, activate, and unload content.

## Architecture

Every Unity iOS Xcode project has two parts:

1. **UnityFramework target** (library)
   - Contains source, plugins, dependent frameworks
   - Produces `UnityFramework.framework`

2. **Unity-iPhone target** (launcher)
   - App representation data
   - Runs the library
   - Single dependency on UnityFramework

## Integration Steps

1. Build Xcode project from Unity (standard iOS build)
2. Export Unity to location **OUTSIDE** the host project (e.g., `/tmp/unity-ios-export/`)
3. Copy ONLY `UnityFramework.framework` to your project
4. Add framework to **Embedded Binaries** section of Application target
5. Use `UnityFramework` class to control runtime

## Critical UnityFramework API

| Method | Description | When to Call |
|--------|-------------|--------------|
| `getInstance` | Singleton accessor | Always |
| `setExecuteHeader:` | **REQUIRED** for CrashReporter | Before running Unity |
| `setDataBundleId:` | Sets Data folder location | Before running Unity |
| `runEmbeddedWithArgc:argv:appLaunchOpts:` | **Use this for React Native** (other Views exist) | Startup |
| `runUIApplicationMainWithArgc:argv:` | Default (no other Views) | NOT for RN |
| `sendMessageToGOWithName:functionName:message:` | RN→Unity messaging | Anytime after init |
| `registerFrameworkListener:` | Lifecycle events | After getInstance |
| `unloadApplication` | Partial unload (can restart) | Cleanup |
| `quitApplication:` | Full unload (cannot restart) | Final cleanup |
| `pause:` | Pause/resume Unity | As needed |
| `showUnityWindow` | Show Unity when hidden | View switching |

## React Native Integration (@azesmway/react-native-unity)

### Correct Implementation (Verified)

```objc
// 1. Load framework
UnityFramework* UnityFrameworkLoad() {
    NSString* bundlePath = [[NSBundle mainBundle] bundlePath];
    bundlePath = [bundlePath stringByAppendingString:@"/Frameworks/UnityFramework.framework"];
    NSBundle* bundle = [NSBundle bundleWithPath:bundlePath];
    if (![bundle isLoaded]) [bundle load];

    UnityFramework* ufw = [bundle.principalClass getInstance];

    // CRITICAL: Set execute header for CrashReporter
    #ifdef DEBUG
      [ufw setExecuteHeader: &_mh_dylib_header];
    #else
      [ufw setExecuteHeader: &_mh_execute_header];
    #endif

    // CRITICAL: Set data bundle ID
    [ufw setDataBundleId: [bundle.bundleIdentifier cStringUsingEncoding:NSUTF8StringEncoding]];

    return ufw;
}

// 2. Initialize with embedded mode (for RN)
[[self ufw] runEmbeddedWithArgc:argc argv:argv appLaunchOpts:launchOpts];

// 3. Register for lifecycle events
[[self ufw] registerFrameworkListener:self];

// 4. Connect NativeCallProxy for Unity→RN messaging
[NSClassFromString(@"FrameworkLibAPI") registerAPIforNativeCalls:self];
```

### Messaging Bridge

**RN → Unity** (via UnityFramework API):
```objc
[[self ufw] sendMessageToGOWithName:[gameObject UTF8String]
                       functionName:[methodName UTF8String]
                            message:[message UTF8String]];
```

**Unity → RN** (via NativeCallProxy):
```csharp
// Unity C# (BridgeTarget.cs)
[DllImport("__Internal")]
public static extern void sendMessageToMobileApp(string message);

// Calls to Objective-C NativeCallProxy.mm
extern "C" void sendMessageToMobileApp(const char* message) {
    return [api sendMessageToMobileApp:[NSString stringWithUTF8String:message]];
}
```

## NativeCallProxy Files (Required)

### NativeCallProxy.h
```objc
#import <Foundation/Foundation.h>

@protocol NativeCallsProtocol
@required
- (void) sendMessageToMobileApp:(NSString*)message;
@end

__attribute__ ((visibility("default")))
@interface FrameworkLibAPI : NSObject
+(void) registerAPIforNativeCalls:(id<NativeCallsProtocol>) aApi;
@end
```

### NativeCallProxy.mm
```objc
#import <Foundation/Foundation.h>
#import "NativeCallProxy.h"

@implementation FrameworkLibAPI

id<NativeCallsProtocol> api = NULL;
+(void) registerAPIforNativeCalls:(id<NativeCallsProtocol>) aApi {
    api = aApi;
}

@end

extern "C" {
    void sendMessageToMobileApp(const char* message) {
        return [api sendMessageToMobileApp:[NSString stringWithUTF8String:message]];
    }
}
```

**Location**: `unity/Assets/Plugins/iOS/`

## Known Limitations

1. **Full-screen only** - Unity cannot render on part of the screen
2. **Single instance** - Cannot load multiple Unity runtimes
3. **Third-party plugins** - May need adaptation
4. **Status bar** - Cannot control via PlayerSettings; use:
   - `UIStatusBarHidden` in Info.plist
   - `prefersStatusBarHidden` view controller property
   - `childViewControllerForStatusBarHidden`

## Build Flow (Recommended)

```bash
# 1. Unity exports to temp location (OUTSIDE RN project)
/tmp/unity-ios-export/

# 2. Build UnityFramework.framework via xcodebuild

# 3. Copy ONLY the framework to RN project
cp -R /tmp/unity-ios-export/build/.../UnityFramework.framework unity/builds/ios/

# 4. Clear pods cache (prevents stale framework issues)
rm -rf ios/Pods ios/Podfile.lock

# 5. Fresh pod install (copies framework to node_modules)
cd ios && pod install
```

## Debugging Tips

### Unity Side (BridgeTarget.cs)
```csharp
const bool DEBUG_ENABLED = true;
const string LOG_PREFIX = "[Bridge]";

private static void LogDebug(string message) {
    if (!DEBUG_ENABLED) return;
    Debug.Log($"{LOG_PREFIX} {message}");
}
```

### React Native Side (UnityArView.tsx)
```typescript
const DEBUG_ENABLED = __DEV__;
const LOG_PREFIX = '[UnityArView]';

const logDebug = (message: string) => {
    if (!DEBUG_ENABLED) return;
    console.log(`${LOG_PREFIX} ${message}`);
};
```

### Live Device Logs
```bash
# iOS
idevicesyslog | grep -E "Bridge|UnityArView"

# Check Unity console in Xcode
# Filter by "[Bridge]" prefix
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Framework not found | Stale pods cache | Clear pods, pod install |
| Messages not received | NativeCallProxy not registered | Verify files in Plugins/iOS |
| Crash on startup | Missing setExecuteHeader | Package handles this |
| Unity won't restart | Used quitApplication | Use unloadApplication instead |

## Official UAAL Example (Unity-Technologies)

Source: [Unity UAAL Example - iOS](https://github.com/Unity-Technologies/uaal-example/blob/master/docs/ios.md)

### Xcode Workspace Setup Pattern

The official approach uses an Xcode workspace to combine:
1. **NativeiOSApp.xcodeproj** - The host application
2. **Unity-iPhone.xcodeproj** - Generated by Unity

```
UaaLExample/
├── both.xcworkspace          # Workspace combining both
├── NativeiOSApp/            # Native iOS app
│   └── NativeiOSApp.xcodeproj
└── UnityProject/
    └── iosBuild/
        └── Unity-iPhone.xcodeproj
```

### Critical Xcode Configuration Steps

#### 1. Add UnityFramework.framework
- Select NativeiOSApp target
- **General** tab → **Frameworks, Libraries, and Embedded Content** → Add
- Choose `Unity-iPhone/UnityFramework.framework`
- **CRITICAL**: In **Build Phases** → **Link Binary With Libraries** → **REMOVE** UnityFramework.framework
  - Framework must be **Embedded**, NOT **Linked**

#### 2. Expose NativeCallProxy.h (CRITICAL)
- Find `Unity-iPhone/Libraries/Plugins/iOS/NativeCallProxy.h`
- Enable **UnityFramework** in Target Membership
- Set header visibility to **PUBLIC** (dropdown on right side)

Without this step, Unity→Native communication breaks!

#### 3. Data Folder Target Membership
- Change Data folder Target Membership from `Unity-iPhone` to `UnityFramework`
- This encapsulates everything in one framework file
- If keeping in Unity-iPhone, call:
```objc
[ufw setDataBundleId: "com.unity3d.framework"];
```

### UnityFrameworkLoad Pattern (Official)

```objc
#include <UnityFramework/UnityFramework.h>

UnityFramework* UnityFrameworkLoad()
{
    NSString* bundlePath = nil;
    bundlePath = [[NSBundle mainBundle] bundlePath];
    bundlePath = [bundlePath stringByAppendingString: @"/Frameworks/UnityFramework.framework"];

    NSBundle* bundle = [NSBundle bundleWithPath: bundlePath];
    if ([bundle isLoaded] == false) [bundle load];

    UnityFramework* ufw = [bundle.principalClass getInstance];
    if (![ufw appController])
    {
        // Initialize Unity for first time
        [ufw setExecuteHeader: &_mh_execute_header];

        // Keep in sync with Data folder Target Membership setting
        [ufw setDataBundleId: "com.unity3d.framework"];
    }
    return ufw;
}
```

### How @azesmway/react-native-unity Differs

The React Native package automates much of this:

| Official UAAL | @azesmway Package |
|---------------|-------------------|
| Manual Xcode workspace | CocoaPods handles framework linking |
| Manual framework embedding | podspec `vendored_frameworks` |
| Manual NativeCallProxy exposure | Files copied via Unity build |
| Manual Data folder config | Bundle ID auto-detected |

The package handles:
- Framework loading via podspec `prepare_command`
- Proper `setExecuteHeader` with debug/release distinction
- Auto bundle ID detection
- React Native event bridging

### React Native vs Manual Integration Flow

**Manual (UAAL Example)**:
```
Unity Build → Unity-iPhone.xcodeproj → Xcode Workspace → Manual Config → Build
```

**React Native (@azesmway)**:
```
Unity Build → /tmp/export → xcodebuild framework → copy to unity/builds/ios/ → pod install → Auto-config
```

## Checklist for React Native Unity Integration

- [ ] Unity exports to temp location (outside RN project)
- [ ] Only UnityFramework.framework copied to `unity/builds/ios/`
- [ ] NativeCallProxy.h/.mm in `unity/Assets/Plugins/iOS/`
- [ ] Pods cache cleared before install
- [ ] `pod install` runs fresh
- [ ] BridgeTarget GameObject in Unity scene
- [ ] UnityArView component with proper dimensions (flex:1)

## References

- [Unity Docs: Unity as a Library iOS](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-iOS.html)
- [Unity UAAL Examples](https://github.com/Unity-Technologies/uaal-example/blob/master/docs/ios.md)
- [@azesmway/react-native-unity](https://github.com/azesmway/react-native-unity)

---

**Verified**: Implementation in portals_v4 correctly follows all official requirements.
# Unity as a Library - Android Integration Guide

**Source**: [Unity 6000.2 Official Docs](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-Android.html)
**UAAL Example**: [Unity-Technologies/uaal-example (Android)](https://github.com/Unity-Technologies/uaal-example/blob/master/docs/android.md)
**Last Updated**: 2026-01-08

---

## Overview

Unity as a Library allows embedding Unity-powered features (3D/2D rendering, AR, mini-games) into native Android applications. The Unity Runtime Library exposes controls to manage when and how to load, activate, and unload content.

## Requirements

- Android Studio Iguana (2023.2.1) or later
- Unity 6000.0.0b16 or later (for current UAAL example)
- For Unity 2019-2021 LTS: Use `19LTS-21LTS` branch
- For Unity 2022 LTS: Use `22LTS` branch

## Architecture

Every Unity Android Gradle project has two parts:

1. **unityLibrary module** (library)
   - Contains Unity runtime and Player data
   - Can integrate into any Gradle project

2. **launcher module** (thin launcher)
   - Application name and icons
   - Simple Android app that launches Unity
   - Can be replaced with your own application

## Integration Steps

### 1. Project Structure

```
UnityProject/
├── Assets/
│   └── Plugins/
│       └── Android/
│           └── MainApp.androidlib/  # Android Library Project
└── ...
```

### 2. Configure Unity Build

1. Open Unity Editor → Build Profiles (File / Build Profiles)
2. Switch to Android Platform
3. Player Settings → Other Settings → Configuration:
   - **Application Entry Point**: Select both Activity AND GameActivity
4. Enable "Export Project" option
5. Export to folder

### 3. Application Entry Points

Unity 6 supports two entry point types:

| Entry Point | Class | Use Case |
|-------------|-------|----------|
| Activity | `UnityPlayerActivity` | Traditional Android Activity |
| GameActivity | `UnityPlayerGameActivity` | Google's GameActivity (better performance) |

**If using only one entry point**, delete the unused Java file:
- Activity only: Delete `MainUnityGameActivity.java`
- GameActivity only: Delete `MainUnityActivity.java`

## Critical Android Concepts

### Unity Runs in Separate Process

```xml
<!-- AndroidManifest.xml -->
<activity android:process=":Unity" ... />
```

Unity runs in a separate Android process (`:Unity`), which:
- Isolates Unity memory from main app
- Allows independent lifecycle management
- Requires IPC for communication

### IUnityPlayerLifecycleEvents

Interface for lifecycle event callbacks:

```java
public interface IUnityPlayerLifecycleEvents {
    // Called when Application.Unload or UnityPlayer.unload() executes
    // Unity enters paused state, scenes unloaded but runtime stays in memory
    void onUnityPlayerUnloaded();

    // Called when Unity Player quits
    // Process running Unity ends after this call
    void onUnityPlayerQuitted();
}
```

Pass to UnityPlayer constructor or override in subclasses.

### UnityPlayer Java API

```java
// Load Unity
UnityPlayer mUnityPlayer = new UnityPlayer(this, this);

// Send message to Unity (like iOS sendMessageToGOWithName)
UnityPlayer.UnitySendMessage("GameObjectName", "MethodName", "message");

// Pause/Resume
mUnityPlayer.pause();
mUnityPlayer.resume();

// Unload (keeps runtime in memory, can reload)
mUnityPlayer.unload();

// Quit (terminates Unity process, cannot restart)
mUnityPlayer.quit();
```

## React Native Integration (@azesmway)

### Android-Specific Setup

The `@azesmway/react-native-unity` package handles most integration via:

```java
// ReactNativeUnityViewManager.java
public class ReactNativeUnityViewManager extends SimpleViewManager<UnityView> {

    // Send message to mobile app (Unity → RN)
    public static void sendMessageToMobileApp(String message) {
        // Emits event to React Native
    }
}
```

### Messaging Bridge (Android)

**RN → Unity**:
```java
UnityPlayer.UnitySendMessage("BridgeTarget", "OnMessage", jsonPayload);
```

**Unity → RN**:
```csharp
// BridgeTarget.cs
#if UNITY_ANDROID
using (var jc = new AndroidJavaClass("com.azesmwayreactnativeunity.ReactNativeUnityViewManager"))
{
    jc.CallStatic("sendMessageToMobileApp", payload);
}
#endif
```

### BridgeTarget.cs Android Implementation

```csharp
private void SendToMobileApp(string payload)
{
#if UNITY_ANDROID
    try
    {
        using (var jc = new AndroidJavaClass("com.azesmwayreactnativeunity.ReactNativeUnityViewManager"))
        {
            jc.CallStatic("sendMessageToMobileApp", payload);
        }
    }
    catch (System.Exception e)
    {
        Debug.LogError($"[Bridge] Android sendMessage failed: {e.Message}");
    }
#elif UNITY_IOS && !UNITY_EDITOR
    // iOS implementation...
#endif
}
```

## Known Workarounds

### Android 7.* Task Background Issue

Some Android 7 devices incorrectly handle `frontOfTask` state, causing the whole task to go to background instead of returning to Main activity.

**Fix**: Add to `MainUnityActivity.java` or `UnityPlayerGameActivity.java`:

```java
@Override
public void onUnityPlayerQuitted() {
    SharedClass.showMainActivity("");
    finish();
}
```

## Gradle Configuration

### settings.gradle

```groovy
// Include Unity library module
include ':unityLibrary'
project(':unityLibrary').projectDir = new File('../UnityProject/androidBuild/unityLibrary')
```

### app/build.gradle

```groovy
dependencies {
    implementation project(':unityLibrary')
}
```

## Known Limitations

1. **Full-screen only** - Unity cannot render partial screen (unless Unity Industry customer)
2. **Single instance** - Cannot load multiple Unity runtimes
3. **Third-party plugins** - May need adaptation for UAAL
4. **Xamarin** - Not compatible with Xamarin app platform
5. **Play Feature Delivery** - Cannot integrate as dynamic module

## iOS vs Android Comparison

| Feature | iOS | Android |
|---------|-----|---------|
| Framework/Module | UnityFramework.framework | unityLibrary module |
| Message API | sendMessageToGOWithName | UnitySendMessage |
| Native→Unity | NativeCallProxy | AndroidJavaClass |
| Process Model | Same process | Separate process (`:Unity`) |
| Entry Point | UIApplicationDelegate | Activity/GameActivity |
| Lifecycle | UnityFrameworkListener | IUnityPlayerLifecycleEvents |

## Debugging

### ADB Logs

```bash
# All Unity logs
adb logcat -v color -s Unity

# Filter by Bridge prefix
adb logcat | grep -E "\[Bridge\]"

# Clear and monitor
adb logcat -c && adb logcat -v color -s Unity
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Unity not loading | Missing unityLibrary | Check settings.gradle include |
| Messages not received | Wrong class name | Verify AndroidJavaClass path |
| App goes to background | Android 7.* bug | Add onUnityPlayerQuitted workaround |
| Crash on quit | Improper shutdown | Use unload() before quit() |

## Build Flow (React Native)

```bash
# 1. Unity exports Gradle project
./scripts/build_and_run_android.sh

# 2. Gradle builds AAR/APK

# 3. React Native links native module

# 4. Deploy to device
adb install -r app-release.apk
```

## References

- [Unity Docs: Unity as a Library Android](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-Android.html)
- [Unity UAAL Example (Android)](https://github.com/Unity-Technologies/uaal-example/blob/master/docs/android.md)
- [Android Intents Documentation](https://developer.android.com/guide/components/intents-filters)
- [@azesmway/react-native-unity](https://github.com/azesmway/react-native-unity)

---

**Note**: portals_v4 currently focuses on iOS. Android integration follows similar patterns with Gradle instead of CocoaPods.

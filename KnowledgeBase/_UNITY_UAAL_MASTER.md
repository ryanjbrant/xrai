# Unity as a Library (UAAL)

**Tags**: #unity #uaal #ios #android #react-native
**Cross-refs**: Project CLAUDE.md (build section), `_XR_CAPABILITIES_MASTER.md`

---

## Quick Reference

| Platform | Library | API Class | Message API | Process |
|----------|---------|-----------|-------------|---------|
| iOS | UnityFramework.framework | `UnityFramework` | `sendMessageToGOWithName` | Same |
| Android | unityLibrary (AAR) | `UnityPlayer` | `UnitySendMessage` | Separate (`:Unity`) |

**Limitations** (both): Full-screen only, single instance, third-party plugins may need adaptation

---

## API Cheatsheet

### iOS (Objective-C)
```objc
// Load
UnityFramework* ufw = [bundle.principalClass getInstance];
[ufw setExecuteHeader: &_mh_execute_header];  // REQUIRED
[ufw setDataBundleId: bundleId];               // REQUIRED
[ufw runEmbeddedWithArgc:argc argv:argv appLaunchOpts:opts];  // For RN

// Message
[ufw sendMessageToGOWithName:@"BridgeTarget" functionName:@"OnMessage" message:@"{}"];

// Lifecycle
[ufw unloadApplication];  // Can restart
[ufw quitApplication:0];  // Cannot restart
```

### Android (Java)
```java
// Load
UnityPlayer mUnityPlayer = new UnityPlayer(this, lifecycleListener);

// Message
UnityPlayer.UnitySendMessage("BridgeTarget", "OnMessage", "{}");

// Lifecycle
mUnityPlayer.unload();  // Can restart
mUnityPlayer.quit();    // Cannot restart
```

### Unity → Native (C#)
```csharp
#if UNITY_IOS && !UNITY_EDITOR
    [DllImport("__Internal")]
    static extern void sendMessageToMobileApp(string msg);
#elif UNITY_ANDROID
    using var jc = new AndroidJavaClass("com.azesmwayreactnativeunity.ReactNativeUnityViewManager");
    jc.CallStatic("sendMessageToMobileApp", msg);
#endif
```

---

## React Native Integration

**Package**: `@artmajeur/react-native-unity` (or @azesmway)

### Required Files
- `unity/Assets/Plugins/iOS/NativeCallProxy.h` - Protocol definition
- `unity/Assets/Plugins/iOS/NativeCallProxy.mm` - Bridge implementation
- `unity/Assets/Scripts/BridgeTarget.cs` - Message handler

### Build Flow
```
iOS:  Unity → /tmp/export → xcodebuild framework → unity/builds/ios/ → pod install
Android: Unity → Gradle export → ./gradlew assembleRelease → adb install
```

---

## Lifecycle States

```
Unloaded ──load()──▶ Running ──unload()──▶ Unloaded (can restart)
                         │
                      quit()
                         ▼
                    Terminated (cannot restart)
```

**Memory**: 80-180 MB retained in unloaded state (varies by device resolution)

---

## Debugging

```bash
# iOS
idevicesyslog | grep -E "Bridge|Unity"

# Android
adb logcat -v color -s Unity
```

**Prefixes**: `[Bridge]` (Unity), `[UnityArView]` (RN)

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Framework not found | Stale pods | Clear pods, reinstall |
| Messages not received | NativeCallProxy missing | Check Plugins/iOS/ |
| Crash on startup | Missing setExecuteHeader | Package handles this |
| Unity won't restart | Used quit() | Use unload() instead |
| Android background bug | Android 7.* issue | Add onUnityPlayerQuitted fix |

---

## Docs
- [Unity UAAL iOS](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-iOS.html)
- [Unity UAAL Android](https://docs.unity3d.com/6000.2/Documentation/Manual/UnityasaLibrary-Android.html)
- [UAAL Example Repo](https://github.com/Unity-Technologies/uaal-example)

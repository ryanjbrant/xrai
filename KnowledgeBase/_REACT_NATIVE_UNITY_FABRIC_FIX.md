# React Native Unity - Fabric Component Registration Fix

**Created**: January 8, 2026
**Project**: portals_v4
**Package**: `@artmajeur/react-native-unity@0.0.6`

## Problem

Unity view shows "Waiting for Unity to initialize" forever with no errors or crashes. The Unity scene never renders.

## Root Cause

`@artmajeur/react-native-unity` is NOT auto-registered with React Native's Fabric (New Architecture) component registry.

### Technical Details

In Fabric/New Architecture, native view components must be registered in `RCTThirdPartyComponentsProvider.mm`. The codegen runs and generates spec files at:
```
ios/build/generated/ios/react/renderer/components/unityview/
├── ComponentDescriptors.cpp
├── ComponentDescriptors.h
├── EventEmitters.cpp
├── EventEmitters.h
├── Props.cpp
├── Props.h
├── RCTComponentViewHelpers.h
├── ShadowNodes.cpp
├── ShadowNodes.h
├── States.cpp
└── States.h
```

However, the component is **NOT added** to `RCTThirdPartyComponentsProvider.mm`, which means Fabric doesn't know how to create the native view.

### Lifecycle Impact

Without proper registration:
- `initWithFrame` ✅ Called (view is created)
- `layoutSubviews` ✅ Called (view gets bounds)
- **`updateProps` ❌ NEVER CALLED** (Fabric can't update props for unknown component)

The critical issue is that `updateProps` is where `initUnityModule` is triggered:

```objc
- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps {
    if (![self unityIsInitialized]) {
      [self initUnityModule];  // <-- This never runs!
    }
    [super updateProps:props oldProps:oldProps];
}
```

## Solution

Manually add RNUnityView to the Fabric component registry.

### Fix Location
`ios/build/generated/ios/RCTThirdPartyComponentsProvider.mm`

### Code Change
Add this line inside the `thirdPartyComponents` dictionary:

```objc
@"RNUnityView": NSClassFromString(@"RNUnityView"), // react-native-unity
```

### Full Context
```objc
+ (NSDictionary<NSString *, Class<RCTComponentViewProtocol>> *)thirdPartyFabricComponents
{
  static NSDictionary<NSString *, Class<RCTComponentViewProtocol>> *thirdPartyComponents = nil;
  static dispatch_once_t nativeComponentsToken;

  dispatch_once(&nativeComponentsToken, ^{
    thirdPartyComponents = @{
      // ... other components ...
      @"RNSSplitViewScreen": NSClassFromString(@"RNSSplitViewScreenComponentView"),
      @"RNUnityView": NSClassFromString(@"RNUnityView"), // ADD THIS LINE
    };
  });

  return thirdPartyComponents;
}
```

## Diagnostic Steps

1. Add file-based logging to `RNUnityView.mm`:
```objc
static void WriteToLogFile(NSString* message) {
    static NSString* logPath = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        NSArray* paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        logPath = [[paths firstObject] stringByAppendingPathComponent:@"unity_init.log"];
        [@"=== Unity Init Log ===\n" writeToFile:logPath atomically:YES encoding:NSUTF8StringEncoding error:nil];
    });
    NSString* timestamp = [NSDateFormatter localizedStringFromDate:[NSDate date] dateStyle:NSDateFormatterNoStyle timeStyle:NSDateFormatterMediumStyle];
    NSString* logLine = [NSString stringWithFormat:@"[%@] %@\n", timestamp, message];
    NSFileHandle* handle = [NSFileHandle fileHandleForWritingAtPath:logPath];
    [handle seekToEndOfFile];
    [handle writeData:[logLine dataUsingEncoding:NSUTF8StringEncoding]];
    [handle closeFile];
}
```

2. Pull logs from device:
```bash
xcrun devicectl device copy from --device "DEVICE_NAME" \
  --domain-type appDataContainer \
  --domain-identifier com.your.bundle.id \
  --source Documents/unity_init.log \
  --destination /tmp/unity_init.log && cat /tmp/unity_init.log
```

3. **Without fix**: Logs show `layoutSubviews` but NO `updateProps`
4. **With fix**: Logs show `updateProps CALLED` → `initUnityModule` → Unity initialization sequence

## Caveats

- This fix may need to be reapplied after:
  - Running `pod install`
  - Regenerating native files
  - Expo prebuild

- Consider creating an Expo config plugin to automate this fix

## Related Files

- `node_modules/@artmajeur/react-native-unity/src/specs/UnityViewNativeComponent.ts` - JS spec
- `node_modules/@artmajeur/react-native-unity/ios/RNUnityView.mm` - Native implementation
- `ios/build/generated/ios/RCTThirdPartyComponentsProvider.mm` - Component registry (needs fix)

## Message Queue Buffering Fix

Unity may send `unity_ready` before Fabric's eventEmitter is initialized.

### Problem
```objc
// Original: Drops early messages
- (void)onUnityMessage:(NSString *)message {
    if (_eventEmitter != nil) {  // nil during startup!
        [_eventEmitter emit...];
    }
    // Message lost forever!
}
```

### Solution
```objc
// Patched: Buffers messages
@property (nonatomic, strong) NSMutableArray<NSString *> *pendingMessages;

- (void)onUnityMessage:(NSString *)message {
    if (_eventEmitter != nil) {
        [_eventEmitter emit...];
    } else {
        [self.pendingMessages addObject:message];
    }
}

- (void)updateEventEmitter:(RCTEventEmitter *)emitter {
    _eventEmitter = emitter;
    for (NSString *msg in self.pendingMessages) {
        [_eventEmitter emit...];
    }
    [self.pendingMessages removeAllObjects];
}
```

Applied via: `./scripts/patch-rn-unity-message-queue.sh`

---

## Performance Benchmarks (Feb 2026)

| Message Type | Typical Latency | Notes |
|--------------|----------------|-------|
| Simple JSON (< 1KB) | 2-5ms | Most UI commands |
| Large JSON (10KB+) | 10-20ms | Scene snapshots |
| Unity → RN event | 16-33ms | 1-2 frame delay |

**Fabric Improvement**: New Architecture reduces RN-side processing ~25x vs legacy bridge.

---

## Common Pitfalls Reference

| Pitfall | Cause | Solution |
|---------|-------|----------|
| Black screen | `.xcode.env` missing `RCT_NEW_ARCH_ENABLED=1` | Never modify |
| 15 FPS | VSync conflict | `vSyncCount = 0`, `targetFrameRate = 60` |
| Duplicate symbols | Xcode 15+ linker | `-Wl,-ld_classic` |
| Memory leaks | Unity not releasing | Explicit cleanup in `dealloc` |
| Stale app | xcodebuild install | Uninstall before install |

---

## References

- [React Native Fabric Native Components](https://reactnative.dev/docs/fabric-native-components)
- [azesmway/react-native-unity GitHub](https://github.com/azesmway/react-native-unity)
- [YourArtOfficial/react-native-unity](https://github.com/YourArtOfficial/react-native-unity) (artmajeur fork)
- [Unity UAAL iOS](https://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html)
- [New Architecture Overview](https://reactnative.dev/architecture/landing-page)

# Dev Iteration Workflows - Best Practices

**Last Updated**: 2026-02-06
**Status**: Triple-Verified
**Rule**: ALWAYS ask "What's the fastest way to test this?" before implementing

## Core Principle

> Before any implementation, identify the fastest feedback loop.
> 5-second test > 5-minute build > 5-hour debug session.

## Unity + React Native Projects

| Change Type | Fastest Workflow | Time | Avoid |
|-------------|------------------|------|-------|
| **Unity C# logic** | Unity Editor Play mode | ~5 sec | Device build (5-7 min) |
| **Unity→RN messages** | Bridge Tester Editor window | ~5 sec | Full app build |
| **RN UI/state** | Metro hot reload | ~1 sec | Any native rebuild |
| **RN + native modules** | Expo Go (if possible) | ~30 sec | Full Xcode build |
| **Full integration** | `build_minimal.sh` | ~5 min | Nuclear clean (10+ min) |

## Testing Hierarchy (Try in Order)

```
1. Unit test / Editor test     → Seconds
2. Editor Play mode            → Seconds
3. Simulator / Emulator        → Minutes
4. Device (incremental)        → 5 min
5. Device (clean build)        → 10+ min
```

## Unity-Specific Fast Iteration

### Bridge Message Testing (No Device)
1. Open Unity Editor
2. Enter Play mode with scene containing BridgeTarget
3. **Window → Portals → Bridge Tester**
4. Send test messages directly to C# handlers

### VFX Iteration
1. Open VFX Graph asset
2. Enable "Target GameObject" in inspector
3. Adjust properties in real-time during Play mode

### Scene Changes
- Use Unity Remote app for transform/lighting preview
- Full rebuild only needed for C# script changes

## React Native Fast Iteration

### Metro Hot Reload (Fastest)
- Save file → auto-refreshes in ~1 sec
- Works for: JS/TS, styles, React components
- Does NOT work for: native modules, Podfile, C#

### Expo Go (When Available)
- `npx expo start` → scan QR
- No Xcode/Android Studio needed
- Does NOT work with: custom native modules (like Unity)

### When You MUST Rebuild
- Added/changed native module
- Changed Podfile or package.json (native deps)
- Changed Unity C# scripts
- Changed app.config.js native settings

## Anti-Patterns (Time Wasters)

| Don't Do This | Do This Instead |
|---------------|-----------------|
| Rebuild app for every C# change | Test in Unity Editor first |
| Run `nuclear_clean` for every issue | Try `build_minimal` first |
| Debug on device without logs | Pull logs immediately: `./scripts/capture_device_logs.sh` |
| Guess at message format issues | Add logging, check debug overlay |
| Wait for full build to test UI | Use Metro hot reload |

## Debugging Hierarchy

```
1. Console.log / Debug.Log        → Immediate
2. Debug overlay (on-screen)      → Immediate
3. Device logs (capture script)   → 10 sec
4. Xcode debugger                 → Requires rebuild
5. Add more logging, rebuild      → 5+ min
```

## Key Questions to Always Ask

Before ANY implementation:
1. "Can I test this in Editor without building?"
2. "What's the smallest change I can make to verify it works?"
3. "Where will I see feedback (logs, UI, overlay)?"
4. "If it fails, how will I know why?"

## Platform-Specific Notes

### iOS
- Use `./scripts/capture_device_logs.sh 10 "filter"` - never raw idevicesyslog
- Check `Documents/*.log` files via devicectl copy

### Unity UAAL
- BridgeTarget.OnMessage() can be called from Editor scripts
- Create Editor windows for testing message handlers

### Environment Variables
- `EXPO_PUBLIC_*` baked at BUILD time, not runtime
- Must rebuild after .env changes (Metro restart not enough)

## Workflow Documentation Template

When discovering new workflow, document:
```markdown
## [Workflow Name]
**Trigger**: When you need to...
**Time**: X seconds/minutes
**Steps**:
1. ...
2. ...
**Verification**: How to confirm it worked
**Gotchas**: What to watch out for
```

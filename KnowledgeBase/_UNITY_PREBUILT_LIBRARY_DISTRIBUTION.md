# Unity Pre-Built Library Distribution via Git LFS

**Updated**: 2026-02-13 | **Confidence**: High | **Source**: portals_main implementation

## Problem

React Native + Unity (UAAL) apps require pre-compiled Unity libraries at build time:
- **iOS**: `UnityFramework.framework` (~599MB Mach-O arm64 binary + Data assets)
- **Android**: `unityLibrary` Gradle module (exported from Unity)

Without these, builds fail:
- iOS: linker errors (missing framework)
- Android: `Could not resolve project :unityLibrary` (Gradle can't find the module)

Team members without Unity Editor installed cannot generate these libraries.

## Solution: Git LFS + Postinstall Sync

### Architecture

```
unity/builds/
├── ios/
│   └── UnityFramework.framework/     ← Git LFS tracked (~599MB)
│       ├── UnityFramework            ← 381MB arm64 binary (LFS)
│       ├── Data/                     ← 217MB levels + assets (LFS)
│       ├── Headers/                  ← Small text files (regular git)
│       ├── Info.plist                ← Regular git
│       └── Modules/                  ← Regular git
└── android/
    └── unityLibrary/                 ← TODO: export + LFS track
        ├── libs/unity-classes.jar
        ├── src/
        └── build.gradle
```

### .gitignore Pattern (Critical)

Git CANNOT re-include files under an ignored directory. This fails silently:
```gitignore
# WRONG - negation has no effect when parent is ignored
unity/builds/
!unity/builds/ios/UnityFramework.framework/
```

Correct pattern — ignore contents, not the directory:
```gitignore
unity/builds/*
!unity/builds/ios/
unity/builds/ios/*
!unity/builds/ios/UnityFramework.framework/
```

### .gitattributes (LFS Tracking)

```gitattributes
unity/builds/ios/UnityFramework.framework/UnityFramework filter=lfs diff=lfs merge=lfs -text
unity/builds/ios/UnityFramework.framework/Data/** filter=lfs diff=lfs merge=lfs -text
```

Only track binaries. Headers, plists, and module maps stay as regular git objects.

### Postinstall Sync

The `react-native-unity` package expects the framework in `node_modules/@artmajeur/react-native-unity/ios/`. A postinstall script copies it:

```json
"postinstall": "... && ./scripts/sync-unity-framework.sh"
```

Script behavior:
- Skip if source framework doesn't exist (graceful for partial setups)
- Skip if destination is newer (don't overwrite fresh builds)
- Convert binary plists to XML (CocoaPods can't parse binary plists)

### LFS Push Order

First-time push requires uploading LFS objects before the commit:
```bash
git lfs push --all origin main    # Upload blobs first
git push                           # Then push commit references
```

### Android: `react-native-unity` Hard Dependency

The `app.plugin.js` Expo config plugin unconditionally injects into `settings.gradle`:
```gradle
include ':unityLibrary'
project(':unityLibrary').projectDir=new File('../unity/builds/android/unityLibrary')
```

This means Android builds ALWAYS require the `unityLibrary` module. Options:
1. Export from Unity and add to repo via LFS (same as iOS)
2. Patch the plugin to make the dependency conditional (allows RN-only builds)

### GitHub LFS Limits

| Tier | Storage | Bandwidth/Month |
|------|---------|-----------------|
| Free | 1 GB | 1 GB |
| Data Pack ($5/mo) | +50 GB | +50 GB |

Each framework update replaces LFS objects entirely (no delta compression for binaries).

## When to Update

Re-build and re-commit the framework when:
- C# scripts change (`unity/Assets/Scripts/`)
- Unity scenes or VFX assets change
- Unity packages added/removed
- Unity Editor version upgraded

## Related KB Files

- `_UNITY_AS_A_LIBRARY_ANDROID.md` — Android UAAL architecture
- `_REACT_NATIVE_UNITY_PACKAGES.md` — Package comparison (@azesmway vs @artmajeur)
- `_REACT_NATIVE_UNITY_FABRIC_FIX.md` — Fabric registry patch

## Tags

`git-lfs` `unity-framework` `uaal` `react-native-unity` `ios-build` `android-build` `expo` `postinstall`

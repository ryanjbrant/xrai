# Migration Plan: MetavidoVFX → Portals v4

**Created**: 2026-02-06
**Status**: Planning (DO NOT MIGRATE YET)
**Target**: `/Users/jamestunick/Documents/GitHub/portals_main/`

---

## Executive Summary

This document outlines the migration strategy for XRRAI systems from MetavidoVFX to Portals v4. The goal is to **polish each feature first**, then migrate in priority order based on complexity and dependencies.

### Key Findings

| Metric | MetavidoVFX | Portals v4 |
|--------|-------------|------------|
| Unity Version | 6000.2.14f1 | 6000.2.14f1 ✅ |
| URP Version | 17.2.0 | 17.3.0 ✅ |
| VFX Graph | 17.2.0 | 17.3.0 ✅ |
| AR Foundation | 6.2.1 | 6.3.2 ✅ |
| Architecture | Standalone | React Native UAAL |
| Total XRRAI Scripts | 112 | Partial (hologram ported) |

**Portals v4 already has**: HiFi hologram VFX, ARDepthSource, VFXARBinder (ported)

---

## Systems Inventory

| System | Namespace | Scripts | Complexity | AR Required | Migration Priority |
|--------|-----------|---------|------------|-------------|-------------------|
| **Hologram** | XRRAI.Hologram | 21 | HIGH | YES | 🟡 Partial (already ported) |
| **Hand Tracking** | XRRAI.HandTracking | 16 | MEDIUM | NO | 🔴 HIGH |
| **VFX Binders** | XRRAI.VFXBinders | 24 | MEDIUM | YES | 🟡 Partial (core ported) |
| **Brush Painting** | XRRAI.BrushPainting | 15 | LOW | NO | 🟢 LOW |
| **Voice-to-Object** | XRRAI.VoiceToObject | 12 | MEDIUM-HIGH | YES | 🔴 HIGH |
| **Authentication** | XRRAI.Auth | 6 | LOW | NO | 🟢 LOW |
| **UI Components** | XRRAI.UI | 18 | LOW | NO | 🟢 LOW |

---

## Migration Order (Recommended)

### Phase 1: Already Ported (Verify Only)
- ✅ **Hologram Core** - ARDepthSource, VFXARBinder, VFXCategory
- ✅ **HiFi VFX** - hifi_hologram_*.vfx (8 VFX assets)
- **Action**: Verify bindings work, apply VFX fixes from this session

### Phase 2: Low-Complexity Systems
1. **XRRAI.Auth** (6 scripts) - Self-contained, no AR dependencies
2. **XRRAI.UI** (18 scripts) - Generic UI components
3. **XRRAI.BrushPainting** (15 scripts) - Standalone, 107 brushes

### Phase 3: Medium-Complexity Systems
4. **XRRAI.HandTracking** (16 scripts) - 5 providers, gestures
5. **XRRAI.VFXBinders** (24 scripts) - Remaining binders not yet ported

### Phase 4: High-Complexity Systems
6. **XRRAI.VoiceToObject** (12 scripts) - Requires GLTFast, voice APIs
7. **XRRAI.Hologram.Network** (12 scripts) - WebRTC conferencing

---

## System Details

### 1. XRRAI.Hologram (Partially Ported)

**Status**: Core components already in Portals v4

**Ported to Portals**:
- `ARDepthSource.cs` - O(1) compute dispatch
- `VFXARBinder.cs` - Per-VFX texture binding
- `VFXCategory.cs` - VFX categorization
- `HologramController.cs` - High-level control
- HiFi VFX assets (8 total)

**Not Yet Ported**:
- `HologramAnchor.cs` - AR plane placement
- `HologramDebugUI.cs` - Debug overlay
- `HologramRecorder.cs` - Metavido recording
- `HologramPlayer.cs` - Metavido playback
- Network components (12 scripts)

**Fixes Applied This Session**:
- `hifi_hologram_people.vfx`: UseParticleSize 0→1
- `hifi_hologram_pointcloud.vfx`: stripCapacity 1→16, useBaseColorMap 3→1

---

### 2. XRRAI.HandTracking (16 Scripts)

**Priority**: HIGH - Enables hand-driven VFX

**Key Components**:
```
HandVFXController.cs      - Main hand→VFX binding (~280 LOC)
HandTrackingProviderManager.cs - Provider factory
Providers/
  ├── XRHandsTrackingProvider.cs   - Unity XR Hands
  ├── HoloKitHandTrackingProvider.cs
  ├── MediaPipeHandTrackingProvider.cs
  ├── BodyPixHandTrackingProvider.cs
  └── TouchInputHandTrackingProvider.cs (Editor fallback)
Gestures/
  ├── GestureDetector.cs   - Pinch/grab detection
  ├── GestureInterpreter.cs
  └── GestureConfig.cs     - ScriptableObject thresholds
```

**Dependencies**:
- `com.unity.xr.hands` 1.7.1 (already in Portals v4 as 1.7.2) ✅
- Optional: HoloKit SDK, MediaPipe, BodyPix

**Migration Approach**: Copy entire `XRRAI.HandTracking` folder + assembly def

---

### 3. XRRAI.VFXBinders (24 Scripts)

**Status**: Core ported, remaining binders needed

**Already Ported**:
- ARDepthSource.cs ✅
- VFXARBinder.cs ✅

**To Migrate**:
```
VFXLibraryManager.cs      - VFX management (~920 LOC)
VFXCatalog.cs             - Discovery & categorization
VFXProxBuffer.cs          - GraphicsBuffer proxy
HumanParticleVFX.cs       - Spawned VFX integration
Binders/
  ├── VFXAudioDataBinder.cs
  ├── VFXHandDataBinder.cs
  ├── VFXKeypointBinder.cs
  ├── VFXPhysicsBinder.cs
  └── VFXBinderUtility.cs
```

**Compute Shaders**:
- `DepthToWorld.compute` (already ported) ✅
- `SegmentedDepthToWorld.compute` (optional)

---

### 4. XRRAI.BrushPainting (15 Scripts)

**Priority**: LOW - Self-contained, no AR required

**Components**:
```
BrushManager.cs           - Singleton brush lifecycle
BrushStroke.cs            - 6 geometry types mesh generation
BrushData.cs              - ScriptableObject definition
BrushCatalogFactory.cs    - 107 brush catalog
BrushGeometryPool.cs      - Object pooling
BrushSerializer.cs        - JSON save/load
BrushMirror.cs            - Symmetry modes
```

**Shaders** (5 custom):
```
Resources/Shaders/
  ├── BrushStroke.shader
  ├── BrushStrokeTube.shader
  ├── BrushStrokeHull.shader
  ├── BrushStrokeParticle.shader
  └── BrushStrokeGlow.shader
```

**Migration Approach**: Export as unitypackage, import to Portals

---

### 5. XRRAI.VoiceToObject (12 Scripts)

**Priority**: HIGH - Key differentiator feature

**Components**:
```
WhisperIcosaController.cs  - Main orchestrator (~350 LOC)
UnifiedModelSearch.cs      - Icosa + Sketchfab aggregation
SketchfabClient.cs         - Sketchfab API wrapper
ModelPlacer.cs             - AR placement
ModelCache.cs              - LRU disk caching
Voice/
  ├── IVoiceInputProvider.cs
  ├── VoiceProviderManager.cs
  ├── LLMVoiceProvider.cs
  └── GeminiVoiceProvider.cs
```

**Dependencies**:
- `com.unity.cloud.gltfast` 6.10.0 (already in Portals v4) ✅
- Sketchfab API key (config required)
- Voice provider (LLMUnity or Gemini API)

---

### 6. XRRAI.Auth (6 Scripts)

**Priority**: LOW - Simple, self-contained

**Components**:
```
AuthManager.cs            - Singleton state management
IAuthProvider.cs          - Provider interface
MockAuthProvider.cs       - Development/testing
AppleSignInProvider.cs    - iOS Sign in with Apple
GoogleSignInProvider.cs   - Google Sign-In
FirebaseAuthProvider.cs   - Firebase Authentication
```

**Migration Approach**: Direct copy, configure provider keys

---

### 7. XRRAI.UI (18 Scripts)

**Priority**: LOW - Generic, reusable

**Components**:
```
SimpleVFXUI.cs            - Minimal VFX selector
VFXToggleUI.cs            - 4-mode toggle
VFXGalleryUI.cs           - World-space gallery
VFXSelectorUI.cs          - Screen-space selector
Navigation/
  ├── MainMenuUI.cs
  ├── SceneNavigator.cs
  └── DebugStatsHUD.cs
Controllers/
  ├── AuthController.cs
  ├── SettingsController.cs
  ├── LobbyController.cs
  ├── ConferenceHUDController.cs
  └── UIAnimations.cs
```

**Dependencies**:
- `com.unity.dt.app-ui` 1.3.3
- `com.unity.inputsystem` 1.16.0 (already in Portals) ✅

---

## Spec 003 WebRTC Status (60% Complete)

**Completed**:
- ✅ Recording (100%) - Metavido encoding
- ✅ Playback (100%) - Metavido decoding
- ✅ 2-User WebRTC (85%) - P2P video streaming

**Not Started**:
- ⬜ 4-6 User SFU (0%) - Requires media server
- ⬜ TURN Server - NAT traversal for production

**Network Components** (12 scripts):
```
H3MSignalingClient.cs     - WebSocket signaling
H3MWebRTCReceiver.cs      - Stream reception
H3MWebRTCVFXBinder.cs     - Remote stream binding
H3MStreamMetadata.cs      - Camera metadata
```

---

## Package Dependencies Comparison

### Required (Both Projects Have):
| Package | MetavidoVFX | Portals v4 |
|---------|-------------|------------|
| AR Foundation | 6.2.1 | 6.3.2 ✅ |
| ARKit | 6.2.1 | 6.3.2 ✅ |
| VFX Graph | 17.2.0 | 17.3.0 ✅ |
| URP | 17.2.0 | 17.3.0 ✅ |
| XR Hands | 1.7.1 | 1.7.2 ✅ |
| Input System | 1.16.0 | 1.16.0 ✅ |
| GLTFast | 6.12.1 | 6.10.0 ⚠️ |

### MetavidoVFX Only (May Need to Add):
- `jp.keijiro.metavido` 5.1.1 - Volumetric video
- `jp.keijiro.bodypix` 4.0.0 - Body segmentation
- `io.holokit.unity-sdk` - HoloKit hand tracking

---

## Migration Checklist Template

For each system before migration:

- [ ] All scripts in correct namespace (XRRAI.*)
- [ ] No hardcoded scene/asset references
- [ ] Test scenes optional
- [ ] Editor setup scripts included
- [ ] Shaders/Compute in Resources/
- [ ] VFX assets categorized
- [ ] Dependencies documented
- [ ] Assembly definition created

---

## Files Changed This Session

### VFX Fixes Applied:
1. `Assets/VFX/People/hifi_hologram_people.vfx`
   - Line 2832: `UseParticleSize: 0` → `1` (enables dynamic sizing)

2. `Assets/VFX/People/hifi_hologram_pointcloud.vfx`
   - Line 10316: `useBaseColorMap: 3` → `1` (valid enum)
   - Line 1690: `stripCapacity: 1` → `16` (better for point clouds)
   - Line 10690: `stripCapacity: 1` → `16` (second particle data block)

### Compilation Fixes (Previous Session):
- `Assets/UI/Controllers/UIAnimations.cs` - CS1061 fixed

---

## Next Steps (After This Session)

1. **Test VFX fixes in Unity Editor** - Play mode with mock textures
2. **Verify Portals v4 hologram** - Confirm VFX work with BridgeTarget
3. **Begin Phase 2 migration** - Start with Auth (simplest)
4. **Setup assembly definitions** - Create XRRAI.*.asmdef files

---

## Notes

- **DO NOT MIGRATE YET** - This is planning only
- Portals v4 uses React Native UAAL - messages via BridgeTarget.cs
- All XRRAI namespaces are migration-ready (refactored 2026-01-22)
- WebRTC needs TURN server for production deployment

# 🚨 PERSISTENT ISSUE TRACKER

**MANDATORY**: Read this file at the start of every session.
**Last Updated**: 2026-02-10

## 🏁 STRATEGIC RESOLUTION: THE HYBRID BRIDGE (RESOLVED)
We have **fully resolved** that the **Hybrid Bridge** (`ARDepthSource` + `VFXARBinder`) is the definitive pipeline.
- **O(1) Performance**: Single compute dispatch (`DepthToWorld.compute`) handles person/background separation via Stencil once for all VFX.
- **Standards**: Local WebRTC Encoder/Decoder are 100% aligned with Keijiro's `jp.keijiro.metavido` gold standard.
- **Top Candidates**: 
    - `hifi_hologram_people.vfx` (HiFi flagship, fixed)
    - `hifi_hologram_pointcloud.vfx` (Solid look, fixed)
    - `lifelike_hologram.vfx` (Simplest logic)

## 🔴 CRITICAL BLOCKERS (P0)

- [ ] **Final L3 Verification**: Deploy `MetavidoVFX-main` to iPhone 12+ and record a ".metavido" file.
    - **Action**: Verify the resulting MP4 correctly decodes in `HOLOGRAM 2.unity` (playback scene).
- [x] **VFX Fixes Applied**: 
    - Enabled dynamic sizing in `hifi_hologram_people.vfx`.
    - Fixed strip capacity and base color mapping in `hifi_hologram_pointcloud.vfx`.

## 🟡 ACTIVE TASKS (P1)

- [ ] **Automate "Spawn" Property Check**: Verify all 418+ VFX graphs have a `Spawn` boolean property.
    - **Status**: Tool created (`VFXGraphValidator.cs`). Preliminary CLI scan shows many FAILs.
    - **Next**: Run in Unity Editor and fix the top 5 flagship graphs.
- [ ] **Portals V4 Shader Port**: Port "Stochastic Transparency" from `RcamBackground.shader` to Portals V4.
- [ ] **FaceVFXController**: Implement ARKit Blendshape binding to `VFXARBinder`.
- [ ] **BodyPartSegmenter**: Integrate `BodyPixSentis` for 24-part mask driving specialized VFX (e.g. glowing head).

## 🔵 STRATEGIC ROADMAP (P2/P3)

- [ ] **Multi-User SFU**: Research MediaSoup/SRS for 10+ concurrent holograms.
- [ ] **XRAI Format**: Finalize binary container spec for AI-native spatial media.

## 📦 MIGRATION STATUS (STAGED)

The following components have been staged in `PortalsV4_Migration_Staging/` for transfer to Portals V4:
- [x] **CameraProxy**: `AxisLines`, `Frustum`, `ImagePlane` (Context visualization).
- [x] **Stochastic Shader**: `RcamBackground.shader` (Ghostly transparency).
- [x] **Flagship VFX**: `hifi_hologram_people.vfx` (Fixed version).

**Action Required**:
1.  Drag `PortalsV4_Migration_Staging/Assets/*` into `Portals V4/Assets/`.
2.  Manually import `jp.keijiro.metavido.vfxgraph` package to get the Subgraph Operators.

## 🧠 SESSION MEMORY

- **2026-02-10**: Deep analyzed Keijiro's source vs local implementations. Confirmed "Position-Based" VFX are superior due to unified stencil filtering. Fixed critical bugs in flagship VFX assets. Created `VFXGraphValidator.cs` to enforce the standard.

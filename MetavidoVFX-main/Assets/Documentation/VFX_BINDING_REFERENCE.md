# VFX Graph Binding Reference for Holograms

**Created**: 2026-02-05
**Purpose**: Comprehensive binding requirements for all VFX categories used in hologram rendering

---

## Overview

This document details the exact binding requirements for VFX Graphs used in holographic AR applications. Understanding these bindings is critical for proper texture sizing, format, and data flow.

---

## 🔴 CRITICAL: Common Binding Errors

| Error | Cause | Fix |
|-------|-------|-----|
| **No particles spawn** | ColorMap/DepthMap null or wrong format | Verify ARDepthSource.IsReady, check texture allocation |
| **White/blank particles** | ColorMap receiving stencil instead of RGB | Ensure `_colorProvider.Texture` (RGB), NOT `humanStencilTexture` |
| **Particles at origin** | RayParams or InverseView incorrect | Check camera projection math, validate matrix |
| **Depth artifacts** | Texture format mismatch | DepthMap must be RFloat, not RGBA |
| **Upside-down** | UV rotation mismatch | iOS portrait needs 90° rotation (_rotateDepthTexture) |
| **ColorMap always null** | Demand-driven allocation not triggered | VFXARBinder must detect ColorMap prop → calls `RequestColorMap(true)` |
| **Late binding fails** | VFX asset loads async, bindings stale | VFXARBinder re-detects for 3 frames after enable |

---

## ⚠️ COLORMAP DEMAND-DRIVEN ALLOCATION (Spec-007)

**ColorMap is NOT automatically allocated!** It only creates when a VFX requests it:

```csharp
// VFXARBinder.OnEnable() (line 181-186)
if (_bindColorMapOverride && _idColor != 0)
{
    var source = _source != null ? _source : ARDepthSource.Instance;
    source?.RequestColorMap(true);  // ← TRIGGERS ALLOCATION
}

// ARDepthSource.RequestColorMap() (line 620-643)
if (prevCount == 0 && _colorMapRequestCount > 0)
    AllocateColorMap();  // Creates 1920x1080 ARGB32 RenderTexture
```

**Fix if ColorMap is null:**
1. Ensure VFX has property named "ColorMap" (or alias: ColorTexture, _MainTex, MainTex, Background)
2. VFXARBinder's AutoDetectBindings() must find it → sets `_bindColorMapOverride = true`
3. OnEnable triggers `RequestColorMap(true)` → ARDepthSource allocates

---

## 📊 VFX Categories & Binding Requirements

### Category 1: METAVIDO/RCAM DEPTH PEOPLE (Primary Hologram VFX)

**VFX Files**: `trails_depth_people_metavido.vfx`, `particles_depth_people_metavido.vfx`, `pointcloud_depth_people_metavido.vfx`, `bubbles_depth_people_metavido.vfx`, `glitch_depth_people_metavido.vfx`, `bodyparticles_depth_people_metavido.vfx`, `rcam3flame_depth_people_metavido.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**Metavido-style VFX** use UV-based depth reconstruction. Particles spawn at UV
coordinates, sample depth, then project to 3D world space using RayParams math:
```hlsl
float3 p = float3(UV * 2 - 1, 1);
p.xy = (p.xy + RayParams.xy) * RayParams.zw;  // Apply projection
p *= Depth;                                     // Scale by depth
return mul(InverseView, float4(p, 1));         // Transform to world
```
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Format | Resolution | Description |
|----------|------|--------|------------|-------------|
| **ColorMap** | Texture2D | **RGBA32/ARGB32** | 1920×1080 | ⚠️ MUST be actual RGB camera feed, NOT stencil |
| **DepthMap** | Texture2D | **RFloat** | 256×192 (rotated to 192×256) | Raw depth in meters |
| **RayParams** | Vector4 | N/A | N/A | `(centerShiftX, centerShiftY, tan(fov/2)*aspect, tan(fov/2))` |
| **InverseView** | Matrix4x4 | N/A | N/A | Camera world transform (TRS, NOT cameraToWorldMatrix) |
| **DepthRange** | Vector2 | N/A | N/A | Near/far clip (default: 0.1, 10.0) |
| **Throttle** | float | 0-1 | N/A | Intensity multiplier |
| **HueShift** | float | 0-360 | N/A | Color rotation (optional) |
| **FocusDistance** | float | meters | N/A | DOF focal distance (optional) |

**Data Flow**:
```
ARCameraTextureProvider → ColorMap (RGB)
AROcclusionManager.humanDepthTexture → DepthMap (RFloat)
Camera.projectionMatrix → RayParams calculation
Camera.transform → InverseView (via TRS)
```

**Reference Implementation**: `VFXMetavidoBinder.cs` (keijiro/Metavido):
```csharp
component.SetTexture(_colorMapProperty, _demux.ColorTexture);  // RGB!
component.SetTexture(_depthMapProperty, _demux.DepthTexture);  // RFloat
component.SetVector4(_rayParamsProperty, RenderUtils.RayParams(meta));
component.SetMatrix4x4(_inverseViewProperty, RenderUtils.InverseView(meta));
```

---

### Category 2: RCAM3 DEPTH PEOPLE

**VFX Files**: `points_depth_people_rcam3.vfx`, `plexus_depth_people_rcam3.vfx`, `scanlines_depth_people_rcam3.vfx`, `sparkles_depth_people_rcam3.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**Rcam3-style VFX** add `InverseProjection` matrix for alternative depth
reconstruction. Some effects use this instead of RayParams for GPU efficiency.
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Format | Description |
|----------|------|--------|-------------|
| **ColorMap** | Texture2D | RGBA32 | RGB camera feed |
| **DepthMap** | Texture2D | RFloat | Raw depth texture |
| **RayParams** | Vector4 | N/A | Projection params |
| **InverseView** | Matrix4x4 | N/A | Camera transform |
| **InverseProjection** | Matrix4x4 | N/A | `Camera.projectionMatrix.inverse` |
| **Throttle** | float | 0-1 | Intensity |
| **FocusDistance** | float | meters | DOF distance |
| **HueShift** | float | 0-360 | Color shift |
| **Ripple** | float | N/A | Animation param |

---

### Category 3: RCAM4 DEPTH PEOPLE

**VFX Files**: `rcam4_depth_people_rcam4.vfx`, `trails_depth_people_rcam4.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**Rcam4-style VFX** are designed for NDI network streaming but work with local
AR data. They use the same binding pattern as Metavido.
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Description |
|----------|------|-------------|
| **ColorMap** | Texture2D | RGB camera feed |
| **DepthMap** | Texture2D | Depth (RFloat) |
| **RayParams** | Vector4 | Projection |
| **InverseView** | Matrix4x4 | Transform |
| **DepthRange** | Vector2 | Clip planes |
| **Spawn** | bool | Enable/disable spawning |
| **Dimensions** | Vector2 | `(width, height)` of texture |

---

### Category 4: AKVFX POSITION-MAP PEOPLE

**VFX Files**: `point_stencil_people_akvfx.vfx`, `web_stencil_people_akvfx.vfx`, `spikes_stencil_people_akvfx.vfx`, `voxel_stencil_people_akvfx.vfx`, `leaves_stencil_people_akvfx.vfx`, `lines_stencil_people_akvfx.vfx`, `particles_stencil_people_akvfx.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**Akvfx-style VFX** use pre-computed **PositionMap** (world positions) instead
of depth+projection. This is O(1) GPU cost since ARDepthSource computes
positions once for ALL VFX. Ideal for multi-VFX scenes (10+ effects).
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Format | Description |
|----------|------|--------|-------------|
| **ColorMap** | Texture2D | RGBA32 | RGB camera feed for particle color |
| **PositionMap** | Texture2D | **ARGBFloat** | Pre-computed world positions (X,Y,Z in RGB) |
| **MapWidth** | float | N/A | PositionMap.width |
| **MapHeight** | float | N/A | PositionMap.height |
| **PointSize** | float | N/A | Particle size (optional) |

**Data Flow**:
```
ARDepthSource.PositionMap → PositionMap (ARGBFloat, GPU-computed)
ARDepthSource.ColorMap → ColorMap (RGB)
PositionMap.width → MapWidth
PositionMap.height → MapHeight
```

---

### Category 5: NNCAM2 KEYPOINT BODY/HANDS

**VFX Files**: `joints_any_nncam2.vfx`, `eyes_any_nncam2.vfx`, `electrify_any_nncam2.vfx`, `tentacles_any_nncam2.vfx`, `petals_any_nncam2.vfx`, `mosaic_any_nncam2.vfx`, `spikes_any_nncam2.vfx`, `particle_any_nncam2.vfx`, `symbols_any_nncam2.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**NNCam2-style VFX** use ML pose estimation (17 keypoints) stored in
GraphicsBuffers. Each keypoint is a Vector3 world position. Ideal for body/hand
effects that don't need full depth reconstruction.
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Description |
|----------|------|-------------|
| **KeypointBuffer** | GraphicsBuffer | 17 pose landmarks (Vector3[] world positions) |
| **KeypointBuffer2** | GraphicsBuffer | Secondary buffer for smoothing (optional) |
| **MaskTexture** | Texture2D | Body segmentation mask |
| **ColorMap** | Texture2D | RGB camera (for eyes_any_nncam2) |
| **PositionMap** | Texture2D | World positions (for eyes_any_nncam2) |
| **Throttle** | float | Intensity |
| **Threshold** | float | Detection threshold |

**Keypoint Index Reference** (17 landmarks):
```
0: Nose           5: Left Shoulder   10: Right Wrist   15: Left Ankle
1: Left Eye       6: Right Shoulder  11: Left Hip      16: Right Ankle
2: Right Eye      7: Left Elbow      12: Right Hip
3: Left Ear       8: Right Elbow     13: Left Knee
4: Right Ear      9: Left Wrist      14: Right Knee
```

**Data Source**: `BodyPartSegmenter.cs` provides KeypointBuffer from ML inference.

---

### Category 6: FACE TRACKING VFX

**VFX Files**: `dokabenlogo_face_facetracking.vfx`, `cubeface_face_facetracking.vfx`, `anomask_face.vfx`, `morphingface_face_unity.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**Face VFX** use ARKit 52-blendshape data or face mesh vertices. Most bind to
a SkinnedMeshRenderer driven by ARFaceManager, not raw textures.
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Description |
|----------|------|-------------|
| **Scale** | float | Face mesh scale |
| **SkinnedMeshRenderer** | SkinnedMeshRenderer | Face mesh for vertex sampling |

**Data Source**: `ARFaceManager` → `ARFace.vertices[]` + blendshapes

---

### Category 7: AUDIO REACTIVE VFX

**VFX Files**: `spectrogram_audio_lasp.vfx`, `particles_audio_lasp.vfx`, `waveform_audio_lasp.vfx`, `lissajous_audio_lasp.vfx`, `drums_audio.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**Audio VFX** use FFT frequency data from `AudioBridge.cs`. Data flows through
global shader properties `_AudioBands` (Vector4) and `_AudioVolume` (float).
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Description |
|----------|------|-------------|
| **Spectrum** | Texture2D | FFT spectrum texture |
| **Waveform** | Texture2D | Audio waveform texture |
| **LeftWaveform/RightWaveform** | Texture2D | Stereo waveforms |
| **Amplitude** | float | Volume level |
| **SampleCount** | int | Waveform samples |
| **TextureWidth** | float | Texture width for sampling |
| **Resolution** | int | FFT resolution |
| **Base Color** | Color | Particle color |

---

### Category 8: SDF ENVIRONMENT VFX

**VFX Files**: `trails_environment_sdfvfx.vfx`, `stickies_environment_sdfvfx.vfx`, `circuits_environment_sdfvfx.vfx`, `grape_environment_sdfvfx.vfx`, `blocks_environment_sdfvfx.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**SDF VFX** use Signed Distance Field textures for ray-marched effects. The SDF
texture encodes distance to nearest surface - negative inside, positive outside.
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Format | Description |
|----------|------|--------|-------------|
| **SDF** | Texture3D | RFloat | 3D signed distance field |
| **Spawn Rate** | float | N/A | Particle emission rate |
| **Kill** | bool | N/A | Destroy particles outside SDF |

---

### Category 9: MESH-BASED VFX

**VFX Files**: `particles_mesh_smrvfx.vfx`, `lines_mesh_smrvfx.vfx`, `stream_mesh_buddha.vfx`, `squares_mesh_buddha.vfx`, etc.

★ Insight ─────────────────────────────────────────────────────────────────────
**Mesh VFX** sample from SkinnedMeshRenderer or MeshRenderer vertices. Used for
avatar effects like Buddha hands where particles flow from mesh surface.
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Description |
|----------|------|-------------|
| **Source** | SkinnedMeshRenderer | Mesh to sample |
| **SourceTransform** | Transform | Mesh transform |
| **Throttle** | float | Intensity |

---

### Category 10: HIFI HOLOGRAM VFX (Our Custom)

**VFX Files**: `hifi_hologram_pointcloud.vfx`, `hifi_hologram_people.vfx`, `hifi_hologram_optimized.vfx`

★ Insight ─────────────────────────────────────────────────────────────────────
**HiFi Hologram VFX** are optimized point clouds that sample RGB color at each
particle UV position. Key difference from standard Metavido: uses `Sample Texture 2D`
node to read ColorMap at particle position, NOT gradient tinting.
───────────────────────────────────────────────────────────────────────────────

| Property | Type | Format | Description |
|----------|------|--------|-------------|
| **ColorMap** | Texture2D | RGBA32 | **RGB camera feed for color sampling** |
| **DepthMap** | Texture2D | RFloat | Depth texture |
| **PositionMap** | Texture2D | ARGBFloat | World positions (alternative to depth) |
| **RayParams** | Vector4 | N/A | Projection params |
| **InverseView** | Matrix4x4 | N/A | Camera transform |
| **MapWidth/MapHeight** | float | N/A | Texture dimensions |
| **Throttle** | float | 0-1 | Quality/density control |

---

## 🔧 Texture Format Reference

| Texture | Format | Typical Size | Notes |
|---------|--------|--------------|-------|
| **ColorMap** | ARGB32 or RGBA32 | 1920×1080 or 1280×720 | Must be actual RGB, not YCbCr |
| **DepthMap** | RFloat | 256×192 → 192×256 (rotated) | Single-channel float, meters |
| **StencilMap** | R8 | 256×192 | Human segmentation (0/255) |
| **PositionMap** | ARGBFloat | 256×192 | RGB=XYZ world position |
| **VelocityMap** | ARGBFloat | 256×192 | RGB=velocity vector |

---

## 🎯 RayParams Calculation (CRITICAL)

```csharp
// Keijiro's Metavido formula (RenderUtils.cs)
public static Vector4 RayParams(Metadata meta)
{
    var vfov = 2.0f * Mathf.Atan(1.0f / proj[1, 1]);
    var aspect = proj[1, 1] / proj[0, 0];
    var tanH = Mathf.Tan(vfov * 0.5f) * aspect;
    var tanV = Mathf.Tan(vfov * 0.5f);

    // Format: (centerOffsetX, centerOffsetY, tanH, tanV)
    return new Vector4(0, 0, tanH, tanV);
}

// ARDepthSource formula (with rotation)
if (_rotateDepthTexture)
{
    float depthAspect = (float)depth.width / depth.height;
    tanH = tanV * depthAspect;
    RayParams = new Vector4(centerShiftX, centerShiftY, -tanH, tanV);  // Note: -tanH
}
```

---

## 📋 Quick Binding Checklist

### Before Testing Any Hologram VFX:

- [ ] **ColorMap source**: Verify `ARCameraTextureProvider.Texture` or `ColorMap` is RGB (not stencil)
- [ ] **DepthMap format**: Confirm RFloat, not RGBA
- [ ] **Texture resolution**: Match VFX expectations (usually 256×192 for depth)
- [ ] **RayParams sign**: Check tanH sign matches rotation setting
- [ ] **InverseView**: Use TRS, not cameraToWorldMatrix
- [ ] **VFX property names**: Verify exact matches (case-sensitive)
- [ ] **ColorMap allocation**: For demand-driven, ensure `RequestColorMap(true)` called

---

## 🔗 Related Files

- `Assets/Scripts/Bridges/ARDepthSource.cs` - Primary data source
- `Assets/Scripts/Bridges/VFXARBinder.cs` - Property binding
- `Packages/jp.keijiro.metavido.vfxgraph/Scripts/VFXMetavidoBinder.cs` - Reference
- `Assets/Scripts/Rcam4/H3MLiDARCapture.cs` - Rcam4 reference

---

*Generated 2026-02-05 | Unity 6000.2.14f1 | AR Foundation 6.2.1*

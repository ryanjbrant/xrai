# FreshHologram VFX Deep Review

**Date**: 2026-02-07
**Status**: Working Template - Ready for Production
**VFX Asset**: `Assets/VFX/People/fresh_hologram.vfx`

---

## 1. VFX Graph Exposed Properties

| Property | Type | Purpose | Bound By |
|----------|------|---------|----------|
| **ColorMap** | Texture2D | Camera RGB color texture | VFXARBinder → ARDepthSource |
| **DepthMap** | Texture2D | AR depth texture (raw values) | VFXARBinder → ARDepthSource |
| **RayParams** | Vector4 | (0, 0, tan(fov/2)*aspect, tan(fov/2)) for depth→3D | VFXARBinder → ARDepthSource |
| **InverseView** | Matrix4x4 | Inverse view matrix for world space conversion | VFXARBinder → ARDepthSource |
| **DepthRange** | Vector2 | (nearClip, farClip) depth clipping | VFXARBinder → ARDepthSource |

### Depth Decoding Approach

This VFX uses **in-graph depth decoding** rather than PositionMap:
- Sample DepthMap at UV
- Use RayParams to compute view-space direction
- Multiply by depth to get view-space position
- Transform by InverseView to get world position

**Pros**: Single texture sample, no CPU compute overhead for position map
**Cons**: Depth decoding math in VFX Graph (more complex graph)

---

## 2. Component Wiring

```
Scene Hierarchy:
├── ARDepthSource (singleton)      ← Provides all AR textures
│   └── Compute: DepthToWorld.compute (optional PositionMap generation)
│
├── FreshHologram_Rig (created by H3M/FreshHologram/One-Click Setup)
│   └── FreshHologram_VFX
│       ├── VisualEffect (fresh_hologram.vfx)
│       └── VFXARBinder (auto-binds properties)
```

### Data Flow

```
AR Foundation
    ├── AROcclusionManager → DepthMap, StencilMap
    └── ARCameraManager → ColorMap (Background)
           ↓
ARDepthSource (singleton)
    ├── DepthMap texture
    ├── StencilMap texture
    ├── ColorMap texture (optional, requested by VFX)
    ├── PositionMap (compute shader, if needed)
    ├── RayParams Vector4
    ├── InverseView Matrix4x4
    └── DepthRange Vector2
           ↓
VFXARBinder (per-VFX)
    ├── Auto-detects which properties VFX needs
    ├── Resolves property name aliases (DepthMap, DepthTexture, etc.)
    └── SetTexture/SetVector/SetMatrix calls in LateUpdate
           ↓
VisualEffect (fresh_hologram.vfx)
    └── GPU particle system renders hologram
```

---

## 3. VFXARBinder Binding Logic

### Supported Property Aliases

The binder supports multiple naming conventions for cross-project compatibility:

```csharp
// Texture Aliases
DepthAliases = { "DepthMap", "DepthTexture", "_Depth", "Depth" }
ColorAliases = { "ColorMap", "ColorTexture", "_MainTex", "MainTex", "Background" }
StencilAliases = { "StencilMap", "HumanStencil", "_Stencil", "Stencil" }
PosAliases = { "PositionMap", "Position", "WorldPosition", "Positions" }
VelAliases = { "VelocityMap", "Velocity", "MotionVector", "Motion" }

// Camera Param Aliases
RayAliases = { "RayParams", "CameraParams", "RayParamsMatrix" }
InvViewAliases = { "InverseView", "InvView", "InverseViewMatrix" }
RangeAliases = { "DepthRange", "ClipRange", "NearFar" }
```

### Auto-Detection Flow

1. On `OnEnable()`, binder calls `AutoDetectBindings()`
2. For each alias group, tries to find matching VFX property by name
3. If found, caches the property ID (int) for fast access
4. In `LateUpdate()`, uses cached IDs for zero-allocation binding

---

## 4. VFX Graph Structure (fresh_hologram.vfx)

### Node Groups (from VFX file analysis)

| Group | Purpose |
|-------|---------|
| **Object Spawn** | Main spawn context for particles |
| **Displacement by Noise** | Adds noise-based displacement to particles |
| **Position Dependent Gradient** | Colors particles based on position |
| **Gamma** | Gamma correction for color output |
| **Border Parameter Decay** | Edge effects for hologram boundary |
| **Random Turbulence** | Additional turbulence effects |
| **Border Gradient** | Gradient coloring at hologram edges |
| **Base Boost + Flash** | Brightness boost and flash effects |
| **Lifetime Randomization** | Varies particle lifetimes |

### Graph Version

- **VFX Graph Version**: 18
- **Compatible with**: Unity 6000.x, VFX Graph 17.2.0

---

## 5. Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| **Depth Resolution** | 63x84 (AR Remote) | Full device: 256x192 |
| **Particle Count** | ~10K-50K | Depends on spawn settings |
| **GPU Compute** | Minimal | Depth decoding is per-particle, not per-texel |
| **Texture Binds** | 2 (DepthMap, ColorMap) | Plus camera matrices |
| **Update Frequency** | Every frame | LateUpdate binding |

---

## 6. Key Files

| File | Purpose |
|------|---------|
| `Assets/VFX/People/fresh_hologram.vfx` | VFX Graph asset |
| `Assets/Scripts/Bridges/VFXARBinder.cs` | Per-VFX binding component |
| `Assets/Scripts/Bridges/ARDepthSource.cs` | Singleton AR data provider |
| `Assets/Scripts/Editor/FreshHologramSetup.cs` | Editor setup utilities |
| `Assets/Resources/DepthToWorld.compute` | Optional compute shader |

---

## 7. CRITICAL: Before Editing This VFX

**ALWAYS** do one of the following before modifying `fresh_hologram.vfx`:

### Option A: Duplicate First (Recommended)
```
1. Right-click fresh_hologram.vfx in Project view
2. Duplicate (Ctrl+D / Cmd+D)
3. Rename to fresh_hologram_variant.vfx
4. Edit the copy, not the original
```

### Option B: Commit Current State
```bash
git add MetavidoVFX-main/Assets/VFX/People/fresh_hologram.vfx
git commit -m "backup: fresh_hologram VFX before modifications"
git push origin main
```

### Recovery (If VFX Breaks)
```bash
git checkout -- MetavidoVFX-main/Assets/VFX/People/fresh_hologram.vfx
```

---

## 8. Extending This Template (After Duplicating)

### To Add New VFX Properties

1. Add property to VFX Graph blackboard (exposed)
2. Add alias to VFXARBinder (if non-standard name)
3. VFXARBinder will auto-detect on next enable

### To Switch to PositionMap Approach

1. Replace DepthMap sampling with PositionMap sampling in VFX
2. PositionMap contains XYZ in RGB, validity in A
3. No depth decoding math needed in VFX
4. Slightly higher memory (extra texture) but simpler graph

### To Add Audio Reactivity

VFXARBinder already supports:
- `AudioVolume` (float 0-1)
- `AudioBands` (Vector4 with frequency bands)

These are read from global shader properties set by AudioBridge.

---

## 9. Troubleshooting

### No Particles Visible

1. Check ARDepthSource exists in scene
2. Check VFXARBinder is on same GameObject as VisualEffect
3. Enable `verboseDebug` on VFXARBinder for detailed logs
4. Verify depth data: look for `[ARDepthSource] Depth available: WxH`

### Particles in Wrong Position

1. Check InverseView matrix is valid (not identity when AR active)
2. Check RayParams values (Z and W should be non-zero)
3. Verify camera is tracking: `ARSession.state == Running`

### Performance Issues

1. Reduce particle count in VFX Graph
2. Enable VFXAutoOptimizer for FPS-adaptive quality
3. Check for duplicate VFXARBinders (should be one per VFX)

---

## 10. Menu Commands

| Menu | Action |
|------|--------|
| `H3M/FreshHologram/One-Click Setup` | Creates full rig with ARDepthSource + VFX + Binder |
| `H3M/FreshHologram/Create VFX from Template` | Creates/finds fresh_hologram.vfx |
| `H3M/FreshHologram/Add Binder to Selected` | Adds VFXARBinder to selected VFX |
| `H3M/FreshHologram/Verify Setup` | Diagnostic check |

---

**Last Updated**: 2026-02-07
**Verified Working**: Yes (AR Companion connected, 63x84 depth streaming)

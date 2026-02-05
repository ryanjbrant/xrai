# VFX Graph Quick Reference

**Tags**: #vfx #unity #particles #shaders
**Cross-refs**: `_VFX_MASTER_PATTERNS.md` (full YAML spec), `_VFX_AR_MASTER.md` (AR integration)

---

## File Types

| Ext | Purpose |
|-----|---------|
| `.vfx` | Complete VFX Graph |
| `.vfxoperator` | Subgraph operator |
| `.vfxblock` | Subgraph block |

---

## Context Pipeline

```
Spawn → Initialize → Update → Output
```

| Context | Purpose | Key Properties |
|---------|---------|----------------|
| Spawn | Particle creation | rate, burst, loop |
| Initialize | Initial state | position, velocity, size, color |
| Update | Per-frame | forces, lifetime, kill |
| Output | Rendering | mesh, shader, blend |

---

## Common Blocks

### Initialize
- `Set Position`: Random, shape, attribute
- `Set Velocity`: Direction, speed
- `Set Size`: Random, curve
- `Set Color`: Gradient, random
- `Set Lifetime`: Fixed, random

### Update
- `Add Force`: Gravity, turbulence
- `Conform to Sphere/Signed Distance Field`
- `Collision`: Plane, sphere, depth buffer
- `Kill`: Age, distance, custom

### Output
- `Output Particle Quad/Mesh`
- `Output Particle Lit Quad/Mesh`
- `Output Line/Trail`

---

## AR Properties (Bind These)

```csharp
// From ARDepthSource.cs
vfx.SetTexture("DepthMap", depthTexture);
vfx.SetTexture("ColorMap", colorTexture);
vfx.SetTexture("StencilMap", stencilTexture);
vfx.SetVector4("RayParams", rayParams);
vfx.SetMatrix4x4("InverseView", inverseView);
```

---

## Performance Budget

| Platform | Max Particles | Target FPS |
|----------|---------------|------------|
| iPhone 12+ | 50K | 60 |
| Quest 2/3 | 30K | 90 |
| Desktop | 500K+ | 60+ |

**Rules**:
- One `ARDepthSource` dispatch per frame
- ~0.2ms per VFX binding
- Use GPU events over CPU spawning

---

## Naming Convention

```
{effect}_{datasource}_{target}_{origin}.vfx

Examples:
- fire_depth_hand_keijiro.vfx
- portal_arkit_plane_custom.vfx
```

---

## MCP Usage

```python
# Create VFX asset
manage_vfx(action="vfx_create_asset", assetName="MyEffect", folderPath="Assets/VFX")

# Set property
manage_vfx(action="vfx_set_float", target="VFXObject", parameter="Intensity", value=1.5)

# Play/stop
manage_vfx(action="vfx_play", target="VFXObject")
manage_vfx(action="vfx_stop", target="VFXObject")
```

---

## Keijiro Patterns

| Repo | Pattern | Use |
|------|---------|-----|
| Rcam2/3 | Depth → VFX | AR occlusion |
| Metavido | Multi-VFX binding | Compositing |
| Smrvfx | Skinned mesh → VFX | Character effects |
| Pcx | Point cloud → VFX | 3D scanning |

**Full reference**: `_RCAM_MASTER.md`

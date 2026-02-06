# FreshHologram VFX - Minimal Depth-to-Particle Setup

## Quick Start (One-Click)

**Fastest method** - Run in Unity Editor:
```
Menu: H3M > FreshHologram > One-Click Setup (Recommended)
```

This automatically:
1. ✅ Creates/finds fresh_hologram.vfx (clones from existing VFX)
2. ✅ Creates ARDepthSource singleton
3. ✅ Creates FreshHologram_Rig with VFX + VFXARBinderMinimal
4. ✅ Wires everything together

Then press Play to test.

---

## Overview

FreshHologram is a simplified depth-to-particle VFX based on keijiro's Rsvfx/Akvfx patterns.
Unlike the complex Rcam/Metavido pipelines that decode depth in VFX Graph, FreshHologram
uses pre-computed PositionMap from ARDepthSource - the simplest possible approach.

## Architecture Comparison

| Approach | Compute | VFX Complexity | Use Case |
|----------|---------|----------------|----------|
| **Rcam/Metavido** | Depth → VFX (decode in graph) | High (~6000 lines) | Recorded video |
| **FreshHologram** | PositionMap → VFX (direct sample) | Low (~2000 lines) | Live AR |

## Prerequisites

1. **ARDepthSource** singleton in scene (computes PositionMap)
2. **VFXARBinderMinimal** on VFX GameObject
3. Unity VFX Graph package installed

## Step 1: Create VFX Asset

1. Right-click in Project: `Create > Visual Effects > Visual Effect Graph`
2. Name it: `fresh_hologram`
3. Double-click to open VFX Graph editor

## Step 2: Add Exposed Properties

In VFX Graph, add these **Blackboard** properties:

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `PositionMap` | Texture2D | — | World positions from ARDepthSource |
| `ColorMap` | Texture2D | — | RGB color from camera (optional) |
| `ParticleCount` | UInt | 50000 | Number of particles |
| `ParticleSize` | Float | 0.003 | Size in meters (3mm) |
| `Alpha` | Float | 1.0 | Opacity multiplier |

## Step 3: Create System Structure

### Spawn Context
```
[Spawn]
├── Single Burst (Count: ParticleCount)
└── OR: Constant Rate (per second)
```

### Initialize Context
```
[Initialize Particle]
├── Capacity: 100000 (or match ParticleCount)
├── Bounds: Position (Center), AABox (Size: 20,20,20)
│
├── [Set Position from Map] block:
│   1. Sample random UV: Random Number (uniform) 0-1 for both X and Y
│   2. Sample PositionMap at UV using "Sample Texture2D" operator
│   3. Set Position = PositionMap.xyz
│   4. Set Alive = PositionMap.w > 0.5 (validity check)
│
├── [Set Color from Map] block (optional):
│   1. Sample ColorMap at SAME UV used for position
│   2. Set Color = ColorMap.rgb
│
├── Set Size: ParticleSize (or: Random 0.002-0.005)
└── Set Lifetime: 0.1 (single frame) or 1.0 (fading)
```

### Update Context
```
[Update Particle]
├── (Optional) Age particles
├── (Optional) Turbulence (DISABLE for lifelike tracking)
└── (Optional) Sample new position each frame for dynamic tracking
```

### Output Context
```
[Output Particle Quad]
├── Blend Mode: Alpha or Additive
├── Use Alpha: Alpha * Alpha (for alpha property)
├── Orient: Face Camera Position
├── Size: size * 2 (if using quad)
└── Color: color attribute
```

## Step 4: Custom HLSL (Optional)

For advanced sampling, use Custom HLSL block:

```hlsl
// Sample PositionMap with validity check
void SamplePositionMap(
    in VFXSampler2D posMap,
    in float2 uv,
    out float3 position,
    out float valid)
{
    float4 sample = posMap.t.SampleLevel(posMap.s, uv, 0);
    position = sample.xyz;
    valid = sample.w;  // Alpha = validity (1 = valid, 0 = invalid/sky)
}
```

## Step 5: Scene Setup

1. Add VFX to scene: Drag `fresh_hologram.vfx` into hierarchy
2. Add binder: Add Component > `VFXARBinderMinimal`
3. Verify: Inspector should show "PositionMap=True, ColorMap=True"

## VFX Graph Node Connections (Detailed)

### Initialize Context Wiring

```
Blackboard                    Operators                      Blocks
─────────────────────────────────────────────────────────────────────
[PositionMap] ─────────────→ [Sample Texture2D]
                             ↓ RGBA
[Random Number (0-1)] ──────→ X,Y UV ───────────→ [Sample Texture2D]
                                                  ↓
                              ┌─────────────────────────────┐
                              │ Output: RGBA                │
                              │ R,G,B = World Position XYZ  │
                              │ A = Validity (0 or 1)       │
                              └─────────────────────────────┘
                                          ↓
                           [Set Position] ← XYZ
                           [Set Alive] ← A > 0.5 (Comparison block)

[ColorMap] ─────────────────→ [Sample Texture2D] (same UV)
                              ↓ RGB
                           [Set Color] ← RGB
```

## Texture Formats Reference

| Texture | Format | Channel Layout |
|---------|--------|----------------|
| PositionMap | ARGBFloat | R=X, G=Y, B=Z, A=Validity |
| ColorMap | ARGB32 | R=R, G=G, B=B, A=Alpha |
| DepthMap | RFloat | R=Depth (meters) |
| StencilMap | R8 | R=Mask (0=bg, 1=human) |

## Performance Tips

1. **Reduce particle count**: Start with 50K, increase if GPU allows
2. **Single frame lifetime**: Use 0.1s lifetime for responsive tracking
3. **No turbulence**: Disable all noise/turbulence for accurate tracking
4. **Quad output**: Use quads (not triangles or sprites) for best performance
5. **Face camera**: Always use "Face Camera Position" orientation

## Comparison with Keijiro VFX

### Rsvfx Simple.vfx (~3000 lines)
- Uses PositionMap directly (same as FreshHologram)
- Samples ColorMap for color
- 500K particle capacity
- HDRP-specific

### Our FreshHologram (~2000 lines target)
- Uses ARDepthSource PositionMap
- URP-compatible
- 50K-100K particles for mobile
- Validity filtering built-in

## Editor Menu Commands

| Menu | Purpose |
|------|---------|
| `H3M > FreshHologram > One-Click Setup (Recommended)` | Full automated setup: VFX + ARDepthSource + Rig |
| `H3M > FreshHologram > Create VFX from Template` | Create VFX asset only (clones from existing) |
| `H3M > FreshHologram > Setup Complete Rig` | Create rig in scene (assumes VFX exists) |
| `H3M > FreshHologram > Add Binder to Selected` | Add VFXARBinderMinimal to selected VFX |
| `H3M > FreshHologram > Verify Setup` | Diagnostic check of all components |
| `H3M > FreshHologram > Open Documentation` | Opens this file |

**How VFX Cloning Works:**
The setup searches for an existing VFX to clone in this order:
1. `Assets/VFX/People/particles_depth_people_metavido.vfx`
2. `Assets/VFX/Metavido/particles_depth_people_metavido.vfx`
3. `Assets/VFX/Akvfx/particles_stencil_people_akvfx.vfx`
4. Any VFX matching `particles` in name

The cloned VFX is saved to `Assets/VFX/People/fresh_hologram.vfx`.

## Troubleshooting

### Particles Not Appearing
1. Check ARDepthSource exists and is active
2. Verify VFXARBinderMinimal shows bindings
3. Check particle count > 0
4. Verify bounds are large enough

### Particles in Wrong Position
1. Check PositionMap.w (validity) filtering
2. Verify InverseView is correct (if using)
3. Ensure UV sampling is 0-1 range

### Color Wrong
1. Ensure ColorMap is bound (VFXARBinderMinimal)
2. Check UV is same for position and color
3. Verify ColorMap format is ARGB32

## Files

- `VFXARBinderMinimal.cs` - Minimal binder (5 properties)
- `ARDepthSource.cs` - Computes PositionMap from depth
- `fresh_hologram.vfx` - VFX asset (create in Unity)

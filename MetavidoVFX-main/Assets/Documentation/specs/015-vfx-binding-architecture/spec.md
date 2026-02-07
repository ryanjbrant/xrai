# Feature Specification: VFX Binding Architecture

**Feature Branch**: `015-vfx-binding-architecture`
**Created**: 2026-01-16
**Status**: ✅ Complete
**Input**: Document the Hybrid Bridge VFX binding architecture (ARDepthSource + VFXARBinder)

## Triple Verification

| Source | Status | Notes |
|--------|--------|-------|
| ARDepthSource.cs | Verified | Singleton compute dispatch |
| VFXARBinder.cs | Verified | Lightweight per-VFX binding |
| VFX_PIPELINE_FINAL_RECOMMENDATION.md | Verified | Architecture decision |
| Performance benchmarks | Verified | 353 FPS @ 10 VFX |

## Overview

This spec documents the **Hybrid Bridge Pattern** - MetavidoVFX's VFX binding architecture that achieves O(1) compute scaling by centralizing GPU work in ARDepthSource while distributing lightweight bindings via VFXARBinder.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   AR Foundation                                      │
│      AROcclusionManager → DepthMap, StencilMap, ColorMap            │
└─────────────────────┬───────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────────┐
│              ARDepthSource (singleton) ~256 LOC                     │
│    ONE compute dispatch → PositionMap, VelocityMap                  │
│    Public properties: DepthMap, StencilMap, PositionMap,            │
│                       VelocityMap, RayParams, InverseView           │
└─────────────────────┬───────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────────┐
│            VFXARBinder (per-VFX) ~160 LOC                           │
│    Just SetTexture() calls - NO compute                             │
│    Auto-detects which properties VFX needs                          │
└─────────────────────┬───────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    VFX Graph                                         │
│    DepthMap, StencilMap, PositionMap, VelocityMap, ColorMap         │
│    RayParams, InverseView (via HLSL global access)                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Characteristics

| Metric | Legacy (VFXBinderManager) | Hybrid Bridge |
|--------|---------------------------|---------------|
| Compute dispatches | O(N) per VFX | O(1) total |
| GPU time @ 1 VFX | ~2ms | ~2ms |
| GPU time @ 10 VFX | ~20ms | ~5ms |
| GPU time @ 20 VFX | ~40ms | ~8ms |
| CPU overhead | High (per-VFX) | Minimal |
| Memory | N textures | Shared textures |

### Components

| Component | Purpose | LOC |
|-----------|---------|-----|
| `ARDepthSource.cs` | Singleton compute dispatch | ~256 |
| `VFXARBinder.cs` | Per-VFX texture binding | ~160 |
| `DepthToWorld.compute` | GPU depth → world position | ~50 |
| `VFXLibraryManager.cs` | Pipeline-aware VFX management | ~920 |
| `VFXPipelineDashboard.cs` | Real-time debug UI | ~350 |

### Properties Bound

| Property | Type | Source |
|----------|------|--------|
| DepthMap | Texture2D | AROcclusionManager |
| StencilMap | Texture2D | AROcclusionManager |
| ColorMap | Texture2D | ARCameraManager |
| PositionMap | RenderTexture | ARDepthSource compute |
| VelocityMap | RenderTexture | ARDepthSource compute |
| RayParams | Vector4 | ARDepthSource |
| InverseView | Matrix4x4 | ARDepthSource |
| DepthRange | Vector2 | ARDepthSource (0.1-10m) |

### Implementation Status

| Task | Status |
|------|--------|
| ARDepthSource singleton | ✅ Complete |
| VFXARBinder per-VFX | ✅ Complete |
| DepthToWorld compute | ✅ Complete |
| VFXLibraryManager rewrite | ✅ Complete |
| Legacy removal script | ✅ Complete |
| One-click setup menu | ✅ Complete |
| Pipeline dashboard | ✅ Complete |
| Test harness | ✅ Complete |
| 73 VFX organized | ✅ Complete |
| Performance verified | ✅ 353 FPS @ 10 VFX |

### Setup

**One-click**: `H3M > VFX Pipeline Master > Setup Complete Pipeline (Recommended)`

**Manual**:
1. Create ARDepthSource singleton
2. Add VFXARBinder to each VFX
3. Remove legacy components (VFXBinderManager, VFXARDataBinder)
4. Run `Validate All Bindings`

### Legacy Migration

Legacy components moved to `.deprecated/` folder during setup:
- `VFXBinderManager.cs` → Replaced by ARDepthSource
- `VFXARDataBinder.cs` → Replaced by VFXARBinder
- `OptimalARVFXBridge.cs` → Merged into ARDepthSource

### Working Template: FreshHologram VFX

The **FreshHologram VFX** (`Assets/VFX/People/fresh_hologram.vfx`) serves as the canonical working template for this architecture:

| Property | Type | Bound By |
|----------|------|----------|
| ColorMap | Texture2D | VFXARBinder → ARDepthSource |
| DepthMap | Texture2D | VFXARBinder → ARDepthSource |
| RayParams | Vector4 | VFXARBinder → ARDepthSource |
| InverseView | Matrix4x4 | VFXARBinder → ARDepthSource |
| DepthRange | Vector2 | VFXARBinder → ARDepthSource |

**In-Graph Depth Decoding**: FreshHologram uses depth decoding directly in the VFX Graph (no PositionMap compute needed):
1. Sample DepthMap at UV
2. Use RayParams to compute view-space direction
3. Multiply by depth for view-space position
4. Transform by InverseView for world position

**One-Click Setup**: `H3M/FreshHologram/One-Click Setup (Recommended)`

**Safety Rules**:
- **BEFORE editing**: Duplicate first OR commit+push
- **Naming**: Use `<name>_variant.vfx` for experimental changes
- **Recovery**: `git checkout -- Assets/VFX/People/fresh_hologram.vfx`

See `Assets/Documentation/FRESH_HOLOGRAM_VFX_REVIEW.md` for complete template documentation.

### References

- `Assets/Documentation/VFX_PIPELINE_FINAL_RECOMMENDATION.md` - Architecture decision
- `Assets/Documentation/SYSTEM_ARCHITECTURE.md` - Full system docs
- `Assets/Documentation/FRESH_HOLOGRAM_VFX_REVIEW.md` - Working template documentation

---

*Created: 2026-01-16*
*Completed: 2026-01-16*
*Updated: 2026-02-07 - Added FreshHologram working template*
*Author: Claude Code + User*

# Unity URP Optimization Guide

> **Source**: https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@14.0/manual/optimize-for-better-performance.html  
> **Last Updated**: 2025-01-13

---

## Overview

Performance optimization guide for Universal Render Pipeline (URP) projects.

---

## Profiling Tools

### Unity Profiler
Use the [Unity Profiler](https://docs.unity3d.com/Manual/Profiler.html) for CPU and memory performance data.

### GPU Profilers
- **Xcode** - iOS/macOS GPU profiling
- **RenderDoc** - Cross-platform (less accurate timing)

### Other Tools
- Scene View Options
- Rendering Debugger
- Frame Debugger

---

## Key Profiler Markers

| Marker | Description |
|--------|-------------|
| `Inl_UniversalRenderPipeline.RenderSingleCameraInternal` | URP builds render commands for a camera |
| `Inl_ScriptableRenderer.Setup` | Prepares render textures, shadow maps |
| `CullScriptable` | Culls GameObjects/lights outside camera view |
| `Inl_ScriptableRenderContext.Submit` | Submits commands to graphics API |
| `MainLightShadow` | Renders shadow map for main Directional Light |
| `AdditionalLightsShadow` | Renders shadow maps for other lights |
| `UberPostProcess` | Renders post-processing effects |
| `RenderLoop.DrawSRPBatcher` | SRP Batcher renders object batches |
| `CopyColor` | Copies color buffer between render textures |
| `CopyDepth` | Copies depth buffer between render textures |
| `FinalBlit` | Copies render texture to camera target |

---

## Performance Settings Quick Reference

### Shadows (URP Asset > Shadows)

| Setting | For Better Performance |
|---------|----------------------|
| Main Light > Cast Shadows | Disable |
| Additional Lights > Cast Shadows | Disable |
| Additional Lights > Shadow Atlas Resolution | Set to lowest acceptable |
| Additional Lights > Shadow Resolution | Set to lowest acceptable |
| Cascade Count | Set to lowest acceptable |
| Max Distance | Reduce |
| Soft Shadows | Disable or set to Low |
| Conservative Enclosing Sphere | Enable |

### Lighting (URP Asset > Lighting)

| Setting | For Better Performance |
|---------|----------------------|
| Additional Lights > Per Object Limit | Lowest acceptable (no effect on Deferred/Forward+) |
| Additional Lights > Cookie Atlas Format | Color Low |
| Additional Lights > Cookie Atlas Resolution | Lowest acceptable |

### Quality (URP Asset > Quality)

| Setting | For Better Performance |
|---------|----------------------|
| Render Scale | Below 1.0 |
| LOD Cross Fade Dither | Bayer Matrix |
| Upscaling Filter | Bilinear or Nearest-Neighbor |

### Post Processing (URP Asset > Post Processing)

| Setting | For Better Performance |
|---------|----------------------|
| Grading Mode | Low Dynamic Range |
| LUT size | Lowest acceptable |
| Fast sRGB/Linear conversion | Enable |

### Rendering (URP Asset > Rendering)

| Setting | For Better Performance |
|---------|----------------------|
| Opaque Texture | Disable if not needed |
| Opaque Downsampling | 4x Bilinear (if Opaque Texture enabled) |
| Depth Texture | Disable unless needed for shaders |

### Universal Renderer

| Setting | For Better Performance |
|---------|----------------------|
| Accurate G-buffer normals | Disable (if using Deferred) |
| Decal Technique | Screen Space with Normal Blend Low/Medium |

---

## Additional Resources

- [Understand performance in URP](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@14.0/manual/understand-performance.html)
- [Configure for better performance](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@14.0/manual/configure-for-better-performance.html)
- [Graphics performance and profiling](https://docs.unity3d.com/Manual/graphics-performance-profiling.html)

---

*Created for Unity-XR-AI Knowledge Base*
# Unity URP Post-Processing Guide

> **Source**: https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@14.0/manual/integration-with-post-processing.html  
> **Last Updated**: 2025-01-13

---

## Overview

URP includes integrated post-processing effects. **No extra package needed** - URP is NOT compatible with Post Processing Stack v2.

URP uses the **Volume framework** for post-processing effects.

---

## Quick Setup

### 1. Enable on Camera
Select Camera → Enable **Post Processing** checkbox

### 2. Add Global Volume
GameObject → Volume → Global Volume

### 3. Create Profile
In Volume component → Click **New** next to Profile

### 4. Add Effects
Add **Volume Overrides** to the Volume component

---

## Important Notes

- Post-processing only applies if camera's **Volume Mask** contains the volume's layer
- **Not supported** on OpenGL ES 2.0

---

## Mobile-Friendly Effects

These effects are optimized for mobile by default:

| Effect | Notes |
|--------|-------|
| **Bloom** | Disable "High Quality Filtering" |
| **Chromatic Aberration** | Mobile-friendly |
| **Color Grading** | Mobile-friendly |
| **Lens Distortion** | Mobile-friendly |
| **Vignette** | Mobile-friendly |

### Depth of Field
- **Mobile/Lower-end**: Use **Gaussian Depth of Field**
- **Console/Desktop**: Use **Bokeh Depth of Field**

### Anti-Aliasing
- **Mobile**: Use **FXAA** (recommended)

---

## VR Considerations

To reduce motion sickness in VR:

| Effect | Recommendation |
|--------|----------------|
| **Vignette** | ✅ Use for fast-paced apps |
| **Lens Distortion** | ❌ Avoid |
| **Chromatic Aberration** | ❌ Avoid |
| **Motion Blur** | ❌ Avoid |

---

## Volume Types

### Global Volume
- Affects entire scene
- No boundaries

### Local Volume
- Location-based effects
- Uses collider for boundaries
- Blend between volumes based on camera position

---

## Common Effects

| Effect | Purpose |
|--------|---------|
| Bloom | Glowing highlights |
| Color Grading | Color correction/LUTs |
| Depth of Field | Focus blur |
| Vignette | Darkened edges |
| Film Grain | Noise texture |
| Chromatic Aberration | Color fringing |
| Lens Distortion | Barrel/pincushion |
| Motion Blur | Movement blur |
| Panini Projection | Wide-angle correction |
| Tonemapping | HDR to LDR |

---

*Created for Unity-XR-AI Knowledge Base*
# Unity 6 HLSL & Compute Shader Guide

**Date**: 2026-01-21
**Unity Version**: 6000.2.14f1
**Status**: Production Reference

---

## 1. Compute Shader Fundamentals

### Thread Group Sizing

```hlsl
// Large textures (depth maps) - 1024 threads = perfect Metal fit
[numthreads(32,32,1)]
void DepthToWorld(uint3 id : SV_DispatchThreadID) { ... }

// Mobile-friendly - 64 threads
[numthreads(8,8,1)]
void ProcessMesh(uint3 id : SV_DispatchThreadID) { ... }
```

### C# Dispatch Pattern

```csharp
int kernel = computeShader.FindKernel("DepthToWorld");
int threadGroupsX = (width + 31) / 32;  // Ceil division
int threadGroupsY = (height + 31) / 32;
computeShader.Dispatch(kernel, threadGroupsX, threadGroupsY, 1);
```

---

## 2. Depth → World Position Pattern

Standard AR depth processing compute shader:

```hlsl
#pragma kernel GeneratePositionTexture

Texture2D<float> DepthTexture;
Texture2D<float> StencilTexture;
RWTexture2D<float4> PositionTexture;

float4x4 InvVPMatrix;
float4x4 ProjectionMatrix;
float4 DepthRange;  // x=min, y=max, z=stencilThreshold

float3 ViewportToWorldPoint(float3 position)
{
    float4 projW = mul(ProjectionMatrix, float4(0, 0, position.z, 1));
    float4 pos4 = float4(1.0 - 2.0 * position.x, 1.0 - 2.0 * position.y, projW.z / projW.w, 1);
    float4 res4 = mul(InvVPMatrix, pos4);
    return res4.xyz / res4.w;
}

[numthreads(32,32,1)]
void GeneratePositionTexture(uint3 id : SV_DispatchThreadID)
{
    float outWidth, outHeight;
    PositionTexture.GetDimensions(outWidth, outHeight);

    if (id.x >= (uint)outWidth || id.y >= (uint)outHeight) return;

    float2 uv = float2(float(id.x) / outWidth, float(id.y) / outHeight);

    // Sample depth with Y-flip for ARKit
    float depthWidth, depthHeight;
    DepthTexture.GetDimensions(depthWidth, depthHeight);
    uint2 depthCoord = uint2(uv.x * depthWidth, (1.0 - uv.y) * depthHeight);
    float depth = DepthTexture[depthCoord];

    // Stencil filtering
    float stencilWidth, stencilHeight;
    StencilTexture.GetDimensions(stencilWidth, stencilHeight);
    uint2 stencilCoord = uint2(uv.x * stencilWidth, (1.0 - uv.y) * stencilHeight);
    float stencil = StencilTexture[stencilCoord];

    if (depth < DepthRange.x || depth > DepthRange.y || stencil < DepthRange.z)
    {
        PositionTexture[id.xy] = float4(0, -1000.0, 0, 0);
        return;
    }

    float3 worldPos = ViewportToWorldPoint(float3(uv, depth));
    PositionTexture[id.xy] = float4(worldPos, 1.0);
}
```

---

## 3. VFX Graph Custom HLSL

### Function Signature (Required)

```hlsl
// ✅ CORRECT - void return, inout VFXAttributes
void CustomFunction(inout VFXAttributes attributes)
{
    attributes.position += float3(0, 1, 0);
}

// ✅ CORRECT - additional parameters allowed
void CustomFunction(inout VFXAttributes attributes, in float Intensity)
{
    attributes.position *= Intensity;
}

// ❌ WRONG - no return values
float3 GetOffset() { return float3(0, 1, 0); }
```

### Texture Sampling

```hlsl
// ✅ CORRECT - SampleLevel required (no derivatives in compute)
float4 color = myTexture.SampleLevel(mySampler, uv, 0);

// ❌ WRONG - Sample() not available
float4 color = myTexture.Sample(mySampler, uv);
```

### Conditional Attributes

```hlsl
#if VFX_HAS_ATTR_VELOCITY
    attributes.velocity = float3(0, 1, 0);
#endif

#if VFX_HAS_ATTR_COLOR
    attributes.color = float4(1, 0, 0, 1);
#endif
```

### Common VFX HLSL Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `undeclared identifier` | Missing function/include | Inline the function or add include |
| `cannot convert VFXAttributes to Texture2D` | External file function mismatch | Set m_ShaderFile to {fileID: 0} |
| `Sample() not found` | Wrong texture sample method | Use SampleLevel(..., 0) |

---

## 4. External HLSL File Reference

### VFX Graph m_ShaderFile

```yaml
# References external file - VFX sees ALL functions
m_ShaderFile: {fileID: 10900000, guid: abc123..., type: 3}

# No external file - uses inline code only
m_ShaderFile: {fileID: 0}
```

**Warning**: When referencing external files, VFX Graph may try to use functions with wrong parameter types. If your inline code doesn't need external functions, set `m_ShaderFile: {fileID: 0}`.

### Include Paths

```hlsl
// Relative to VFX asset
#include "MyShaders/Utils.hlsl"

// Absolute from Assets
#include "Assets/Shaders/Common.hlsl"

// Absolute from Packages
#include "Packages/com.mypackage/Shaders/Utils.hlsl"
```

---

## 5. Metal (iOS) Considerations

### Thread Group Limits

```hlsl
// Metal limit: X * Y * Z <= 1024
[numthreads(32,32,1)]  // 1024 threads - max
[numthreads(8,8,1)]    // 64 threads - conservative
```

### ARKit Texture Rotation

```hlsl
// ARKit depth is landscape, app may be portrait
// Rotate 90° CW: (u,v) → (1-v, u)
float2 rotatedUV = float2(1.0 - uv.y, uv.x);
```

### Precision

```hlsl
half4 color;      // 16-bit - faster on mobile
float4 position;  // 32-bit - needed for positions/matrices
```

---

## 6. GraphicsBuffer for VFX

### C# Setup

```csharp
int pointCount = width * height;
var posBuffer = new GraphicsBuffer(GraphicsBuffer.Target.Structured, pointCount, sizeof(float) * 3);

// Set in compute shader
computeShader.SetBuffer(kernel, "PositionBuffer", posBuffer);

// Set in VFX Graph
visualEffect.SetGraphicsBuffer("PositionBuffer", posBuffer);

// Cleanup
void OnDestroy() => posBuffer?.Dispose();
```

### Compute Shader

```hlsl
RWStructuredBuffer<float3> PositionBuffer;

[numthreads(8,8,1)]
void FillBuffer(uint3 id : SV_DispatchThreadID)
{
    uint index = id.y * Width + id.x;
    PositionBuffer[index] = float3(id.x, id.y, 0);
}
```

---

## 7. Safe AR Texture Access

```csharp
// ❌ WRONG - crashes when AR subsystem not ready
var depth = occlusionManager?.humanDepthTexture;

// ✅ CORRECT - TryGetTexture pattern
Texture TryGetTexture(System.Func<Texture> getter)
{
    try { return getter?.Invoke(); }
    catch { return null; }
}
var depth = TryGetTexture(() => occlusionManager.humanDepthTexture);
```

---

## 8. Platform Compatibility

| Feature | iOS Metal | Android Vulkan | Quest | WebGL |
|---------|-----------|----------------|-------|-------|
| Compute Shaders | ✅ | ✅ | ✅ | ⚠️ WebGPU only |
| VFX Custom HLSL | ✅ | ✅ | ✅ | ❌ |
| GraphicsBuffer | ✅ | ✅ | ✅ | ⚠️ Limited |
| RWTexture2D | ✅ | ✅ | ✅ | ⚠️ Limited |

---

## 9. Performance

From MetavidoVFX benchmarks (Jan 2026):

| Operation | GPU Time | Notes |
|-----------|----------|-------|
| DepthToWorld (256x192) | ~0.5ms | Single dispatch |
| Position + Velocity | ~1.2ms | Two-pass |
| 10 VFX (Hybrid Bridge) | ~2.8ms | O(1) compute |

**Target**: <3ms compute budget for 60fps

---

## References

- [Unity 6 Compute Shaders](https://docs.unity3d.com/6000.2/Documentation/Manual/class-ComputeShader-hlsl-shaderlab.html)
- [VFX Graph Custom HLSL](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.2/manual/Block-CustomHLSL.html)
- [Metal Thread Group Limits](https://developer.apple.com/documentation/metal/compute_passes/calculating_threadgroup_and_grid_sizes)

---

*Last Updated: 2026-01-21*

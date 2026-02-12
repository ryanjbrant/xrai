# VFX, URP & XR Insights for Portals (Unity 6)

> **Extracted**: 2026-02-12
> **Sources**: Unity e-books (VFX Guide, URP Cookbook, XR Experiences) + Portals project code
> **Scope**: Rules an AI agent can auto-apply when working on AR/VFX code in this project
> **Unity Version**: 6000.2.14f1 | **Pipeline**: URP | **AR**: AR Foundation 6.3.2

---

## 1. VFX Graph Optimization Rules

### Particle Budget
- **Mobile AR target**: 50K-100K particles max for GPU-simulated VFX on mobile. Beyond this, frame drops are guaranteed on A15/A16 chipsets.
- **Desktop/Editor**: Up to 1M+ particles viable with GPU simulation, but always profile on target device.
- **Rule**: Set `Capacity` on every VFX Graph system. Never leave it at default (unlimited growth causes OOM).

### GPU vs CPU Simulation
- **Always use GPU simulation** for particle counts > 1K. CPU simulation is single-threaded and will bottleneck.
- **CPU simulation only** for: fewer than ~500 particles, or when particles need physics raycasts / collision callbacks.
- VFX Graph defaults to GPU simulation. This is correct for Portals hologram effects.

### Spawning
- Use **Constant Spawn Rate** over **Periodic Burst** when possible -- bursts cause frame spikes.
- For audio-reactive spawning: modulate spawn rate via exposed `float` property (e.g., `SpawnRate`), not by toggling systems on/off.
- **Spawn over distance** is ideal for trail effects tied to hand/object movement.

### Texture Sampling in VFX
- **Sample textures in Initialize context** (not Update) when the value does not change per frame. This avoids redundant GPU texture fetches.
- For depth/position maps that update every frame: sample in **Update context** but use `Point` filtering on data textures.
- **RULE** (already in CLAUDE.md): `FilterMode.Point` and `TextureWrapMode.Clamp` on all data textures (depth, position, stencil, spectrum). Bilinear filtering corrupts discrete values.

### LOD for VFX
- Use the **LOD block** in VFX Graph Output contexts to reduce particle rendering at distance.
- For AR: camera is typically 0.3-3m from effects. Set LOD aggressively:
  - LOD0: 0-1m (full quality)
  - LOD1: 1-3m (50% particle rate, simpler shaders)
  - LOD2: 3m+ (skip rendering or use billboard fallback)
- Use `Set SpawnRate` blocks that read camera distance to throttle spawning dynamically.

### Property Binding Best Practices
- **Resolve property IDs once** via `Shader.PropertyToID()` and cache as `int`. The Portals `VFXARBinder` already does this correctly with alias-based auto-detection at `OnEnable`.
- **Guard every SetTexture/SetFloat call** with `HasTexture(id)` / `HasFloat(id)`. The VFXARBinder does this correctly.
- **Never call `VisualEffect.SetXxx()` with string names in Update**. Always use cached int IDs. String-based lookups allocate GC and are ~10x slower.
- The **VFX Property Binder** component (built-in) can autobind transforms, audio, etc. But for AR data (depth maps, camera matrices), custom binding via `VFXARBinder` is required, which Portals already implements.

### VFX Graph Authoring Rules
- **Subgraphs**: Extract reusable node groups (noise generation, color remapping, audio reactivity) into Subgraph blocks/operators. Reduces duplication across hologram VFX variants.
- **Blackboard properties**: Expose only what the runtime needs to control. Internal intermediate values should be graph-local, not exposed.
- **Instancing**: VFX Graph does NOT support SRP Batcher. Each VFX system is a separate draw call. Minimize the number of distinct VFX assets in a scene -- prefer one system with multiple outputs over multiple systems.

---

## 2. URP Shader Best Practices

### SRP Batcher Compatibility (Critical for AR Performance)
- **Rule**: All custom shaders MUST be SRP Batcher compatible. This requires:
  1. All per-material properties inside a single `CBUFFER_START(UnityPerMaterial) ... CBUFFER_END` block.
  2. No material properties outside the CBUFFER.
  3. Use `HLSLPROGRAM` / `ENDHLSL` (not `CGPROGRAM`).
- **Portals StochasticHologram.shader**: VERIFIED COMPLIANT -- uses `CBUFFER_START(UnityPerMaterial)` correctly (lines 44-55).
- **Check**: In Frame Debugger, SRP Batcher-compatible materials show "SRP Batch" instead of individual draw calls.
- SRP Batcher does NOT batch VFX Graph draws -- only mesh renderers. This is why minimizing VFX system count matters.

### Shader Variant Management
- **Strip unused variants** via `IPreprocessShaders` or URP Renderer settings. Each variant = compile time + memory + build size.
- Disable unused URP features in the URP Asset to strip their shader variants:
  - If not using HDR: disable it.
  - If not using Decals: disable the Decal Renderer Feature.
  - If not using SSAO: remove the SSAO Renderer Feature.
- For AR: you likely do NOT need `_ADDITIONAL_LIGHTS`, `_SHADOWS_SOFT`, or `_SCREEN_SPACE_OCCLUSION` shader keywords. Strip them.
- **Rule**: When creating custom shaders, use `#pragma shader_feature_local` (not `#pragma multi_compile`) for features that vary per-material. `shader_feature_local` strips unused variants from builds. `multi_compile` compiles ALL combinations.

### Mobile-Friendly Shader Patterns
- Use `half` precision for color, alpha, UV, and normal data. Use `float` only for positions and depth.
- **Portals StochasticHologram.shader**: Correctly uses `half` for colors/alpha and `float` for positions/depth (verified).
- Avoid `discard` / `clip()` on mobile when possible -- it breaks early-Z on PowerVR/Mali GPUs. The hologram shader uses `clip(finalAlpha - 0.01)` which is acceptable for transparency but could be replaced with alpha-to-coverage if needed.
- Minimize texture samples per fragment. The hologram shader does 3 (depth map, noise via SimplexNoise3D, main texture) which is reasonable.
- **Never use `tex2D` in URP**. Always use `SAMPLE_TEXTURE2D(_Tex, sampler_Tex, uv)` macro for platform compatibility.
- Use `TEXTURE2D` / `SAMPLER` macro pairs (not `sampler2D`). The hologram shader does this correctly.

### Custom Shader Authoring Rules
- Always include `"RenderPipeline" = "UniversalPipeline"` in SubShader tags. Without this, URP silently falls back to error shader.
- For transparent effects: set `"Queue" = "Transparent"`, `"RenderType" = "Transparent"`, `Blend SrcAlpha OneMinusSrcAlpha`, `ZWrite Off`. The hologram shader is compliant.
- For opaque effects with alpha cutout: use `"Queue" = "AlphaTest"` and `AlphaToMask On` instead of `clip()` for better mobile performance.
- **Stencil buffer**: URP supports stencil operations in custom shaders. Useful for hologram masking -- render a stencil-write pass for the hologram boundary, then stencil-test in the VFX pass. This avoids expensive per-pixel alpha sorting.

---

## 3. URP Render Pass Optimization

### Render Features (Unity 6 / URP 17+)
- Unity 6 URP uses the **Render Graph** API for custom render passes. Legacy `ScriptableRenderPass` still works but is deprecated.
- **Rule**: New custom render features should use `IRenderGraphRecordRenderPass` / `UniversalResourceData` instead of `ScriptableRenderPass.Execute()`.
- Render Graph automatically manages resource lifetimes and can merge/cull unused passes. This reduces GPU memory pressure on mobile.

### Pass Ordering for AR
- URP pass order: Opaque -> Skybox -> Transparent -> Post-Processing -> UI.
- For AR with camera background: the AR Background Renderer Feature injects a pass BEFORE opaques that renders the camera feed.
- **Hologram VFX renders in Transparent queue** (correct). This means it composites AFTER opaques and AFTER the AR background.
- If you need hologram occlusion by real-world objects: use depth from AR (the `_ARDepthMap` approach in StochasticHologram.shader) rather than inserting additional geometry passes.

### Overdraw Reduction
- Transparent objects are the #1 source of overdraw in AR scenes. Each transparent layer redraws those pixels.
- **Rule**: For hologram effects with many overlapping transparent particles, use:
  1. `clip()` with a threshold to discard near-invisible fragments (already done: `clip(finalAlpha - 0.01)`).
  2. Depth pre-pass for complex transparent geometry (URP supports this via the Depth Priming option in URP Asset).
  3. Particle LOD to reduce density at distance.
- **Screen-space effects** (bloom, color grading) are full-screen and cost the same regardless of scene complexity. Limit to 1-2 post-processing effects on mobile AR.

### Fullscreen Custom Render Passes
- For screen-space hologram effects (scanlines, CRT distortion, glitch): use a Fullscreen Render Feature with a custom shader rather than per-object shaders.
- This is a single draw call for the entire effect vs. N draw calls for N objects.
- URP Cookbook pattern: create a `ScriptableRendererFeature` that injects after transparent rendering, samples `_CameraColorTexture`, applies effect, writes back.

### Compute Shader Integration
- URP supports compute shaders for data processing (depth-to-world-position, audio FFT, etc.).
- **Rule**: Always query `GetKernelThreadGroupSizes()` and calculate dispatch groups as `Mathf.CeilToInt(dim / threadSize)`. Hardcoded group counts break on different resolutions.
- The ARDepthSource compute dispatch is the correct pattern: single dispatch, shared output textures, multiple consumers.
- For new compute work: check `SystemInfo.supportsComputeShaders` at runtime. Some older Android devices lack support.

---

## 4. Post-Processing for XR

### Safe Effects for Mobile AR (Low Cost)
| Effect | Cost | AR Safe? | Notes |
|--------|------|----------|-------|
| Color Grading (LUT) | Very Low | YES | Single texture lookup per pixel |
| Vignette | Very Low | YES | Simple gradient, no extra samples |
| Film Grain | Low | YES | Good for hologram aesthetic |
| Chromatic Aberration | Low | YES (subtle) | 1-2 extra texture samples |
| Bloom | Medium | CAUTION | 2-3 downsample/upsample passes; limit iterations to 2-3 on mobile |

### Avoid on Mobile AR
| Effect | Why |
|--------|-----|
| Depth of Field | Multiple full-res passes + gather sampling; kills mobile frame budget |
| Motion Blur | Requires velocity buffer + multiple samples; conflicts with AR camera |
| Screen Space Reflections | Multiple ray-march steps per pixel; no mobile GPU can handle at 60Hz |
| SSAO | Full-screen depth sampling + blur passes; use baked AO instead |
| Temporal Anti-Aliasing (TAA) | Requires history buffer + motion vectors; conflicts with AR camera reprojection |

### XR-Specific Post-Processing Rules
- **Single Pass Instanced rendering** (required for VR stereo) affects post-processing: effects must be stereo-aware. For AR (mono rendering), this is not an issue.
- For AR: disable ALL post-processing Volume overrides by default. Enable only what is visually essential for the hologram look.
- **Bloom is the most impactful effect for holograms** at acceptable cost. Set `Threshold` high (>1.0) so only bright hologram pixels bloom, not the AR background.
- Post-processing stack runs AFTER all scene rendering. On mobile, total post-processing should be under 2ms.

---

## 5. AR Foundation Key Patterns

### Session Lifecycle (Critical)
```
CheckingAvailability -> Installing -> Ready -> SessionInitializing -> SessionTracking
```
- **RULE** (already in CLAUDE.md): Wait for `ARSession.state >= ARSessionState.SessionTracking` before any AR operations. Use a coroutine, never a blocking while-loop.
- Subscribe to `ARSession.stateChanged` event rather than polling in Update.
- If session state goes to `None` or `Unsupported`, disable AR features gracefully and show fallback UI.

### Plane Detection
- Enable plane detection ONLY when needed (e.g., during object placement). Disable after placement is complete to save CPU/GPU.
- `ARPlaneManager.enabled = false` stops new plane detection but keeps existing planes.
- Use `ARPlane.classification` (Table, Floor, Wall, Ceiling) for intelligent placement. Not all devices support all classifications.
- **requestedDetectionMode**: Set to `PlaneDetectionMode.Horizontal` for floor/table placement (most common in AR). Adding `Vertical` doubles the processing cost.

### Image Tracking
- `ARTrackedImageManager` supports up to ~20 reference images efficiently on ARKit. Beyond that, detection speed degrades.
- Reference images should be high-contrast, non-repetitive, and at least 15cm physical size.
- Tracked image poses update at AR frame rate (30Hz on most devices). For smooth motion, interpolate between updates.

### Anchors
- Use `ARAnchorManager` for world-locked content. Anchors persist across tracking interruptions.
- Create anchors at placement positions, not at the object's current transform. The anchor provides the stable reference.
- For Cloud Anchors (multi-user): ARCore Cloud Anchors or Azure Spatial Anchors. These require network calls and have latency.

### Depth / Occlusion
- `AROcclusionManager` provides human depth, human stencil, and environment depth.
- **RULE** (already in CLAUDE.md): Always use `TryAcquireCpuImage()` with `using` disposal for CPU-side depth access. Direct texture refs are GPU-only.
- For GPU-only usage (shader sampling, VFX binding): use the texture properties directly (`humanDepthTexture`, `environmentDepthTexture`). This is what ARDepthSource does correctly.
- Environment depth (LiDAR on Pro iPhones) is denser and more accurate than human depth (ML-based).

### Camera / Light Estimation
- `ARCameraManager.frameReceived` fires each AR frame with camera intrinsics, exposure, and light estimation.
- Light estimation provides ambient color, intensity, direction, and spherical harmonics. Use this to match virtual lighting to real-world lighting.
- **Rule**: Cache `ARCameraFrameEventArgs` data in the callback. Do NOT call camera manager getters in Update -- they may return stale or null data outside the callback.

---

## 6. XR Performance Targets

### Frame Budget (Non-Negotiable)
| Target FPS | Frame Budget | Platform |
|------------|-------------|----------|
| 30 Hz | 33.3 ms | AR (iOS minimum acceptable) |
| 60 Hz | 16.6 ms | AR (iOS target) |
| 72 Hz | 13.8 ms | Meta Quest VR |
| 90 Hz | 11.1 ms | PCVR / Quest Pro |
| 120 Hz | 8.3 ms | High-end VR |

- **Portals AR target**: 60 Hz (16.6ms). Budget breakdown:
  - AR tracking + camera: ~3-4ms (fixed, cannot reduce)
  - CPU game logic: ~3-4ms
  - Rendering (GPU): ~6-8ms
  - Post-processing: ~1-2ms
  - Headroom: ~2ms (for spikes)

### Rendering Settings for Mobile AR
- **Single Pass Instanced**: Not required for AR (mono camera), but enable for VR targets.
- **Foveated Rendering**: Only for VR headsets with eye tracking. Not applicable to AR phone/tablet.
- **Dynamic Resolution**: Enable in URP Asset. Allows GPU to reduce resolution under load. Set minimum to 70% to avoid visible quality loss.
- **MSAA**: 2x MSAA is the sweet spot for mobile AR. 4x is too expensive. 8x is never worth it on mobile.

### Draw Call Targets
- **Mobile AR**: Under 100 draw calls total. SRP Batcher and GPU instancing reduce this significantly.
- **SetPass calls**: Under 50. Each unique material/shader variant = 1 SetPass.
- **Triangles**: Under 500K visible triangles per frame on mobile. GLB models from Icosa should be validated for poly count before spawning.

### Memory Targets
- **Total texture memory**: Under 256MB on mobile. AR camera feed alone uses ~30-50MB.
- **VFX particle buffers**: Each VFX system allocates GPU memory proportional to Capacity. A 100K-capacity system with position+velocity+color = ~10MB GPU memory.
- **RenderTexture budget**: Track total RT memory. ARDepthSource + VFX output RTs should total under 50MB.

### Profiling Rules
- **Unity Profiler**: Use `ProfilerRecorder` API to capture specific markers in builds (not just Editor).
- **Frame Debugger**: Essential for identifying redundant passes, overdraw, and SRP Batcher breaks.
- **RenderDoc / Xcode GPU capture**: Use for per-draw GPU timing on device.
- **Rule**: Profile on TARGET DEVICE, not Editor. Editor performance is meaningless for mobile AR optimization. Editor overhead (managed debugging, unoptimized shaders) adds 2-5x to frame times.

---

## 7. Hologram / Transparency Rendering

### Alpha Blending Costs
- Every transparent object that overlaps another = 2x pixel fill for those pixels (overdraw).
- N overlapping transparent layers = N+1 fill rate cost for covered pixels.
- **Hologram particles are the biggest overdraw source** in Portals. A dense hologram VFX with 50K transparent particles can cause 10-20x overdraw in the center.

### Depth Sorting
- URP sorts transparent objects back-to-front per-object (not per-pixel). This means:
  - Large transparent meshes with self-intersection will have artifacts.
  - Particles within a single VFX system are NOT depth-sorted against each other by default.
- **VFX Graph solution**: Enable **Sort** in the Output context. Options: By Distance, By Depth, Custom. "By Depth" is cheapest.
- **Cost of sorting**: Adds a GPU sort pass per VFX system. For 50K particles, this is ~0.3-0.5ms. Budget for it.

### Dithering Alternatives (Superior for AR)
- **Screen-space dithering** (Bayer matrix or blue noise) can simulate transparency without alpha blending. This is OPAQUE rendering with per-pixel discard.
- Benefits: No sorting needed, no overdraw, Z-buffer works correctly, much cheaper than true transparency.
- Downside: Visible dithering pattern, especially at low resolution. Mitigated by temporal jittering.
- **The StochasticHologram shader uses noise-based dithering** (`clip(finalAlpha - 0.01)`) which is a hybrid approach: it renders as transparent but clips near-zero pixels, reducing overdraw from invisible fragments.
- **Improvement opportunity**: Convert to full stochastic transparency:
  ```hlsl
  // Replace fixed clip with noise-threshold dithering
  float ditherThreshold = frac(sin(dot(screenUV * _ScreenParams.xy, float2(12.9898, 78.233))) * 43758.5453);
  clip(finalAlpha - ditherThreshold);
  // Then render in Opaque queue with ZWrite On
  ```
  This would eliminate ALL alpha sorting issues and reduce overdraw to zero, at the cost of visible noise (which actually enhances the hologram aesthetic).

### Depth Fade Pattern
- The hologram shader's depth fade (`abs(arDepth - fragDepth) * _DepthFade`) is the correct approach for AR occlusion.
- **Improvement**: Use `LinearEyeDepth()` for the AR depth sample to ensure correct comparison in all projection modes:
  ```hlsl
  float arLinearDepth = LinearEyeDepth(arDepth, _ZBufferParams);
  float depthDiff = abs(arLinearDepth - fragDepth);
  ```
- This matters when AR depth is in a non-linear format (varies by device/API).

### Render Queue Strategy for Holograms
- **Current**: Transparent queue (3000). Correct for alpha-blended hologram.
- **Alternative for performance**: Render hologram at `AlphaTest` queue (2450) with stochastic dithering. This renders BEFORE transparents and benefits from early-Z.
- **VFX particles**: Always render in Transparent queue (VFX Graph default). Cannot be changed to opaque without custom output shaders.
- **Render order**: AR Background (1000) -> Opaque scene objects (2000) -> Hologram mesh (2450 or 3000) -> VFX particles (3000+) -> UI (4000).

---

## 8. Audio-Reactive VFX Patterns

### Architecture (Portals Implementation)
The Portals project already has a solid audio-reactive pipeline:
```
AudioSource -> AudioDataSource (singleton) -> spectrum analysis
    |-> Bass/Mid/Treble/Beat (float)
    |-> SpectrumTexture (Texture2D, RFloat)
    |
VFXARBinder -> reads AudioDataSource properties
    |-> SetFloat(Bass), SetFloat(Beat), etc.
    |-> SetTexture(SpectrumMap)
    |
VFX Graph -> exposes matching properties (Volume, Bass, Beat, etc.)
    |-> Modulates spawn rate, size, color, force
```

### VFX Graph Audio Binding Patterns
- **Spawn rate modulation**: `SpawnRate = BaseRate * (1 + Bass * BassMultiplier)`. Bass-driven spawn creates "pulsing" particle emission.
- **Size modulation**: `Size = BaseSize * (1 + Beat * BeatScale)`. Beat-driven size creates "breathing" particles.
- **Color modulation**: Use AudioBands (Vector4: bass, mid, treble, beat) to drive gradient sampling. Map bass->red, mid->green, treble->blue for frequency visualization.
- **Force/Turbulence**: Modulate turbulence intensity by volume for "audio wind" effects.
- **Position offset**: Use beat detection to trigger position bursts (particles explode outward on beat).

### Spectrum Texture Binding
- The `AudioDataSource.SpectrumTexture` is a 1D `RFloat` texture (width = spectrumSize, height = 1).
- In VFX Graph: Sample this with `Sample Texture2D` using particle index / total count as U coordinate. Each particle maps to a frequency bin.
- **IMPORTANT**: The spectrum texture uses `FilterMode.Bilinear` (line 77 of AudioDataSource.cs). For VFX spectrum sampling, this should be `FilterMode.Point` to prevent frequency bin bleeding. **This is a bug** per the existing CLAUDE.md rule about data texture filtering.

### Optimization Rules
- Spectrum texture update runs every other frame (`Time.frameCount % 2 == 0`) -- this is correct. 30Hz texture updates are perceptually indistinguishable for audio visualization.
- `GetSpectrumData()` and `GetOutputData()` allocate zero GC when called with pre-allocated arrays (which AudioDataSource does correctly).
- Beat detection uses a simple energy-threshold approach. For more musical beat detection, consider onset detection (derivative of energy) or autocorrelation. But the current approach is sufficient for VFX reactivity.
- **Rule**: Never drive VFX properties directly from raw audio values. Always smooth (lerp) to prevent jarring visual jumps. AudioDataSource smooths correctly with configurable `_smoothing` parameter.

### WireSystem Integration
The WireSystem provides a declarative binding layer:
```
wire: audio.bass -> sin:2 -> cube.scale
wire: audio.beat -> invert -> *.emission
```
This is the preferred way to connect audio to visual properties at runtime, as it can be driven by voice commands via VoiceToWire.

---

## Appendix A: Portals-Specific Shader Audit

### StochasticHologram.shader Status
| Check | Status | Notes |
|-------|--------|-------|
| SRP Batcher compatible | PASS | CBUFFER_START(UnityPerMaterial) present |
| Uses HLSLPROGRAM | PASS | Not CGPROGRAM |
| half precision for colors | PASS | `half4 _Color`, `half _Alpha`, etc. |
| float precision for positions | PASS | `float4 positionCS`, `float3 worldPos` |
| TEXTURE2D/SAMPLER macros | PASS | Not sampler2D |
| URP pipeline tag | PASS | `"RenderPipeline" = "UniversalPipeline"` |
| Transparent queue | PASS | `"Queue" = "Transparent"` |
| ZWrite Off for transparent | PASS | Line 30 |
| AR depth sampling | PASS | Uses `_ARDepthMap` global texture |

### Potential Improvements
1. **Spectrum texture FilterMode**: Change `AudioDataSource._spectrumTexture.filterMode` from `Bilinear` to `Point` (line 77 of AudioDataSource.cs).
2. **Stochastic transparency option**: Add a `_UseDithering` toggle that switches to screen-space noise threshold + opaque queue for better performance.
3. **Linear depth comparison**: Wrap AR depth sample in `LinearEyeDepth()` for cross-device compatibility.
4. **Fresnel rim**: Add optional rim lighting based on view angle for stronger hologram edge glow.

---

## Appendix B: Quick Reference Card

### Before Creating a New Shader
1. Use `HLSLPROGRAM` / `ENDHLSL`, never `CGPROGRAM`
2. Put ALL material properties in `CBUFFER_START(UnityPerMaterial)`
3. Set `"RenderPipeline" = "UniversalPipeline"` tag
4. Use `half` for colors, `float` for positions
5. Use `TEXTURE2D` / `SAMPLER` macros
6. Use `#pragma shader_feature_local` for per-material toggles
7. Test SRP Batcher compatibility in Frame Debugger

### Before Creating a New VFX Graph
1. Set explicit `Capacity` (never unlimited)
2. Use GPU simulation (default)
3. Expose only necessary Blackboard properties
4. Name properties to match VFXARBinder aliases (see alias arrays in VFXARBinder.cs)
5. Enable Sort in Output context if particles overlap
6. Add LOD blocks for distance-based quality

### Before Adding Post-Processing
1. Check frame budget (total post-processing < 2ms on mobile)
2. Only Bloom + Color Grading + Film Grain are AR-safe
3. Set Bloom threshold > 1.0 to avoid bleeding into AR background
4. Disable SSAO, DOF, Motion Blur, SSR on mobile

### AR Feature Checklist
1. Wait for `SessionTracking` state before any AR calls
2. Use `TryAcquireCpuImage()` + `using` for CPU-side texture access
3. Cache `ARCameraFrameEventArgs` in callback, not in Update
4. Disable plane detection after placement is complete
5. Profile on device, not Editor
6. Frame budget: 16.6ms total at 60Hz

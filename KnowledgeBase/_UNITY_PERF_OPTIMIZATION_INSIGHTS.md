# Unity Performance Optimization Insights (Unity 6)
> Source: "Optimize your game performance for mobile, XR, and the web in Unity - Unity 6 edition" e-book
> Extracted: 2026-02-12
> Applicable to: Unity 6 with URP, mobile/XR/web targets
> Usage: AI coding agents should auto-apply these rules during code generation, review, and fix workflows

---

## Profiling Workflow

### Tools (Use in This Order)
1. **Unity Profiler** (`Window > Analysis > Profiler`): First stop. Shows CPU, GPU, memory, rendering per-frame. Use Deep Profile sparingly (high overhead).
2. **Profile Analyzer** (`Window > Analysis > Profile Analyzer`): Aggregates Profiler data over frame ranges. Compare two captures to measure before/after impact of changes.
3. **Frame Debugger** (`Window > Analysis > Frame Debugger`): Step through draw calls one by one. Shows exactly what is rendered and why. Essential for batching diagnosis.
4. **Memory Profiler** (package): Snapshot-based. Compare two snapshots to find leaks. Shows native + managed allocations, texture memory, mesh memory.
5. **Rendering Debugger** (`Window > Analysis > Rendering Debugger` or runtime overlay): Visualize overdraw, mipmap levels, wireframe.

### Profiling Rules
- **Always profile on target device**, not Editor. Editor adds overhead (domain reload, inspector refresh, extra safety checks) that skews results.
- **Profile with Development Build + Autoconnect Profiler** enabled in Build Settings.
- **Disable Deep Profile** for timing measurements. Enable only to trace specific call stacks.
- **Use Profiler Markers** (`ProfilerMarker`) in your own code to tag custom sections. Use `ProfilerMarker.Auto()` with `using` for scoped measurement.
- **Profile early, profile often.** Do not wait until the end. Budget violations compound.
- **Warm the cache** before capturing. Skip the first 2-3 seconds of a scene; profile steady-state.

### What to Look For
- **CPU markers > 2ms**: `PlayerLoop`, `Update`, `LateUpdate`, `FixedUpdate`, `Coroutines`, `Physics.Simulate`, `GC.Alloc`.
- **GPU markers**: `RenderForward`, `Shadows`, `PostProcess`. If GPU time > CPU time, you are GPU-bound.
- **GC.Alloc**: Any allocation in a per-frame path is a bug. Target ZERO allocations in Update/LateUpdate/FixedUpdate.
- **SetPass calls**: Each one is expensive. Minimize material/shader variants.
- **Batches**: Fewer is better. If batches are high but SetPass is low, geometry submission is the bottleneck.

---

## Frame Budget Rules

### Target Milliseconds Per Frame
| FPS Target | Budget (ms) | Typical Use Case |
|-----------|------------|-----------------|
| 30 FPS | 33.33 ms | Low-end mobile, strategy games |
| 60 FPS | 16.67 ms | Standard mobile, UI-heavy apps |
| 72 FPS | 13.89 ms | Quest VR (minimum) |
| 90 FPS | 11.11 ms | Quest VR (recommended), PSVR2 |
| 120 FPS | 8.33 ms | High-end VR, competitive mobile |

### Budget Allocation (Approximate)
- **Rendering/GPU**: 40-60% of frame budget
- **Gameplay/Scripts**: 20-30%
- **Physics**: 10-15%
- **Animation**: 5-10%
- **Audio/Other**: 5%
- **Headroom**: Always reserve 10-15% for spikes

### CPU vs GPU Bound Detection
- **CPU-bound**: GPU finishes before CPU. Profiler shows `Gfx.WaitForPresent` or `Gfx.WaitForCommands` on the render thread (GPU waiting for CPU).
- **GPU-bound**: CPU finishes before GPU. Profiler shows `Gfx.WaitForPresentOnGfxThread` (CPU waiting for GPU). Frame Debugger and GPU profiler tools (Xcode GPU, RenderDoc, Snapdragon Profiler) needed.

---

## CPU Optimization (Auto-Apply Rules)

### Per-Frame Code Minimization
- **NEVER call `GetComponent<T>()` in `Update()`/`LateUpdate()`/`FixedUpdate()`.** Cache in `Awake()` or `Start()`. Use `TryGetComponent<T>()` for null-safe lookups.
- **NEVER call `Find()`, `FindObjectOfType()`, `FindObjectsOfType()` per-frame.** Cache results. In Unity 6, use `FindAnyObjectByType<T>()` (faster, non-deterministic order) or `FindFirstObjectByType<T>()`.
- **NEVER use `GameObject.tag == "string"`.** Use `CompareTag("string")` -- avoids GC allocation from string comparison.
- **NEVER use `SendMessage()` or `BroadcastMessage()`.** Use direct method calls, events, or `UnityEvent`. Reflection-based messaging is 100x slower.
- **Remove empty `Update()`, `LateUpdate()`, `FixedUpdate()`, `OnGUI()` methods.** Even empty Unity event methods have overhead because Unity calls them through native-to-managed interop. Delete them entirely if unused.
- **Avoid `string` concatenation in hot paths.** Use `StringBuilder` or `string.Format` with cached builders. Every `+` on strings allocates a new string on the managed heap.

### Hash IDs (Mandatory)
- **Cache `Animator.StringToHash()` as `static readonly int`.** Never pass raw strings to `Animator.SetFloat/SetBool/SetTrigger` per-frame.
- **Cache `Shader.PropertyToID()` as `static readonly int`.** Never pass raw strings to `material.SetFloat/SetColor/SetTexture` per-frame.
- **Same for `UnsafeUtility.StringToHash()` and any hash-based lookup.** Pre-compute once, store as field.

### Object Pooling
- **Use `ObjectPool<T>` (Unity 6 built-in, `UnityEngine.Pool` namespace)** for any object created/destroyed frequently (projectiles, VFX, UI elements, enemies).
- **Pool pattern**: `Get()` to acquire, `Release()` to return. Set `defaultCapacity` and `maxSize` to prevent unbounded growth.
- **Pool collections too**: `ListPool<T>.Get()`, `DictionaryPool<K,V>.Get()`, `HashSetPool<T>.Get()` from `UnityEngine.Pool`. Release after use.
- **Never call `Instantiate()`/`Destroy()` in gameplay loops.** These trigger GC and fragment memory. Always pool.

### ScriptableObjects for Shared Data
- **Use `ScriptableObject` for configuration, balancing data, and shared state** instead of `MonoBehaviour` singletons with duplicated data.
- **ScriptableObjects live in asset memory**, not per-instance. 100 enemies referencing one `EnemyConfig` SO = 1 memory footprint, not 100.
- **Use ScriptableObject-based events** (observer pattern via SO) to decouple systems. Avoids hard references and reduces Update polling.

### PlayerLoop Customization
- **Remove unused PlayerLoop systems** if you don't use them. Example: if no physics, remove `FixedUpdate` and `Physics` systems from the PlayerLoop via `PlayerLoop.SetPlayerLoop()`.
- **Order matters**: Place critical systems earlier in the loop for consistent behavior.

### Coroutines and Async
- **Cache `WaitForSeconds` and `WaitForEndOfFrame`** instances. `yield return new WaitForSeconds(1f)` allocates every call. Store as a field: `private readonly WaitForSeconds _wait = new WaitForSeconds(1f);`
- **Prefer `UniTask` or `Awaitable` (Unity 6)** over coroutines for async work. Zero-allocation, cancellable, better error handling.
- **Never use `yield return null` to poll conditions per-frame if an event/callback exists.**

### Struct vs Class
- **Use `struct` for small, short-lived data (< 16 bytes).** Avoids heap allocation and GC pressure.
- **Be aware of boxing.** Passing a struct to an `object` parameter boxes it (heap alloc). Use generic methods to avoid.

### Math Optimizations
- **Use `Vector3.sqrMagnitude` instead of `Vector3.magnitude`** when comparing distances. Avoids `sqrt()`.
- **Use integer division/comparison** where possible. Float comparisons are slower.
- **Avoid `Mathf.Pow()` for integer exponents.** Use multiplication: `x * x` not `Mathf.Pow(x, 2)`.

---

## GPU Optimization (Auto-Apply Rules)

### Draw Calls and Batching
- **Target: < 200 draw calls on mobile, < 100 on low-end mobile/XR.** Each draw call = CPU overhead preparing GPU state.
- **SetPass calls are more expensive than batches.** Minimize unique material/shader combinations.
- **SRP Batcher (enabled by default in URP/HDRP)**: Batches objects using the same shader variant, even with different material properties. Requires shaders to use `CBUFFER` blocks with `UnityPerMaterial`.
- **GPU Instancing**: For many identical meshes with same material. Enable on material. Use `MaterialPropertyBlock` for per-instance variation without breaking batching.
- **Static Batching**: For non-moving objects. Mark as `Batching Static` in Inspector. Increases memory (combined mesh stored) but reduces draw calls.
- **Dynamic Batching**: For small meshes (< 300 vertices, < 900 vertex attributes). Generally **disable** in URP settings -- overhead often exceeds benefit on modern hardware.

### GPU Resident Drawer (Unity 6 / URP)
- **Enable GPU Resident Drawer** in URP Asset settings. Automatically uses `BatchRendererGroup` to keep mesh data GPU-resident, bypassing CPU-side draw call submission.
- **Combine with GPU Occlusion Culling** for maximum benefit. Both are Unity 6 features.
- **Requires compatible shaders** (standard URP Lit/Unlit work). Custom shaders need `DOTS_INSTANCING` support.

### Overdraw Reduction
- **Overdraw is the #1 GPU performance killer on mobile/XR.** Every pixel drawn multiple times wastes fill rate.
- **Use Rendering Debugger overdraw visualization** to identify hotspots.
- **Order rendering front-to-back for opaque objects** (URP does this by default).
- **Minimize transparent/alpha-blended objects.** They cannot be sorted correctly and cause overdraw. Use alpha-test (`clip()`) where possible, but be aware alpha-test disables Early-Z on some GPUs.
- **Particle systems**: Reduce particle count, size, and overlap. Use `Order in Layer` carefully.
- **Fullscreen effects (post-process)**: Each fullscreen pass is expensive on mobile. Limit to 1-2 max. Combine passes where possible.

### Shader Complexity
- **Minimize `discard`/`clip()` in fragment shaders on mobile.** Breaks tile-based GPU optimizations (PowerVR, Mali, Adreno).
- **Avoid complex math in fragment shaders.** Move computations to vertex shader when possible (per-vertex vs per-pixel).
- **Use half-precision (`half`) instead of `float`** for colors, UVs, and normalized directions in shaders. Mobile GPUs have dedicated half-precision ALUs.
- **Minimize texture samples per fragment.** Each sample = memory bandwidth cost. Target < 4 texture reads per fragment on mobile.
- **Use shader LOD** (`Shader.maximumLOD`) to select simpler shader variants on lower-end devices.
- **Strip unused shader variants.** Use `ShaderVariantCollection` and `IPreprocessShaders` to remove unused variants from builds. Shader compilation and variant count directly impact build size and load time.

### Lighting
- **Use Baked lighting wherever possible on mobile/XR.** Real-time lights are expensive. Target: 1 real-time directional light max on mobile.
- **Baked lightmaps**: Use `Progressive GPU Lightmapper` in Unity 6 for faster bakes. Compress lightmaps (BC6H on desktop, ASTC on mobile).
- **Light Probes**: Use for dynamic objects in baked scenes. Cheaper than real-time lights.
- **Reflection Probes**: Use baked, not real-time. Set resolution to minimum acceptable (128 or 256).
- **Shadow distance**: Reduce `QualitySettings.shadowDistance` to minimum acceptable. Shadows are the most expensive real-time lighting feature.
- **Shadow cascades**: Use 1-2 cascades on mobile, not 4. Each cascade = additional shadow map render pass.
- **Shadow resolution**: 512 or 1024 max on mobile. 2048 is desktop only.
- **Disable shadows on unimportant lights.** Only the main directional light should cast shadows on mobile.

### LOD (Level of Detail)
- **Use `LODGroup` on all complex meshes.** At minimum: LOD0 (full), LOD1 (50% tris), LOD2 (25% tris), Culled.
- **Set aggressive LOD bias for mobile/XR.** `QualitySettings.lodBias = 0.5f` to 1.0f on mobile.
- **Crossfade LOD transitions** use `SpeedTree` or dither-based approaches. Snap transitions are cheaper.

### Occlusion Culling
- **Bake Occlusion Culling** for indoor/complex scenes. `Window > Rendering > Occlusion Culling`. Objects behind walls are skipped entirely.
- **GPU Occlusion Culling (Unity 6)**: New feature, works with GPU Resident Drawer. No bake needed. Enable in URP settings.
- **Frustum Culling is free** (always on). But objects partially visible still render fully. Keep mesh bounds tight.
- **Camera.layerCullDistances**: Set per-layer culling distances to cull small objects at shorter distances than large ones.

---

## Memory Optimization (Auto-Apply Rules)

### GC Avoidance (Critical for Mobile/XR)
- **Target: ZERO `GC.Alloc` in per-frame code.** Any managed allocation triggers eventual GC, causing frame spikes (5-20ms on mobile).
- **Enable Incremental GC** in Project Settings > Player > Other Settings. Spreads GC work across frames instead of one big spike. But prevention is still better than mitigation.
- **Common allocation sources to eliminate:**
  - `new List<T>()`, `new Dictionary<K,V>()`, `new HashSet<T>()` per-frame. Pre-allocate and reuse/clear.
  - String concatenation (`+`). Use `StringBuilder`.
  - `ToString()` calls. Cache formatted strings.
  - LINQ queries (`Where`, `Select`, `OrderBy`). Each allocates enumerator + closures. Use `for`/`foreach` loops.
  - `StartCoroutine()` allocates. Cache or use Awaitable.
  - Boxing value types (passing struct to `object`).
  - `params` arrays. Each call allocates. Use overloads with fixed parameter counts.
  - Lambda closures that capture variables. Cache delegates where possible.
  - `Enum.ToString()` and `Enum.GetName()`. Cache or use lookup dictionary.

### Memory Profiler Usage
- **Take snapshots on device** (not Editor). Editor memory is 3-5x higher due to tooling.
- **Compare two snapshots** to find leaks: before scene load vs after unload. Anything remaining is a leak.
- **Watch for**: Duplicate textures (same texture loaded twice), uncompressed textures, unused assets still in memory.

### Texture Memory (Largest Consumer)
- **Always compress textures.** ASTC on mobile/XR, BC7/DXT on desktop. Never ship uncompressed.
- **Use mipmaps** on 3D scene textures. Disable only for UI/2D sprites that are always at native resolution.
- **Max size matters**: Set `Max Size` in import settings to the minimum acceptable. 2048 is rarely needed for mobile; 512-1024 is typical.
- **Use `Texture Streaming`** (Project Settings > Quality > Texture Streaming) to load only needed mip levels. Reduces VRAM usage significantly.

### Addressables / Asset Management
- **Use Addressables** for large projects. Allows async loading, reference counting, and automatic unloading.
- **Call `Addressables.Release()` when done.** Unreleased handles = memory leaks.
- **Group assets by usage pattern** (scene-based, shared, on-demand). Minimize bundle dependencies.

---

## XR-Specific Optimizations

### Frame Rate Requirements
- **VR MUST maintain target FPS consistently.** Dropped frames cause nausea. 72 FPS minimum for Quest, 90 FPS recommended.
- **Use ASW/ATW (Application SpaceWarp / Asynchronous TimeWarp)** as a safety net, not a target. These are reprojection fallbacks that introduce artifacts.
- **AR (mobile)**: Target 60 FPS. Camera processing (ARSession, image tracking, plane detection) consumes 3-5ms baseline.

### XR Rendering
- **Single Pass Instanced Rendering**: Always enable for VR (`XR Plug-in Management > Rendering Mode`). Renders both eyes in one pass. 2x GPU reduction vs Multi-Pass.
- **Foveated Rendering**: Enable on Quest Pro / Quest 3. Reduces fragment processing on peripheral vision by up to 50%.
- **Render scale**: `XRSettings.renderScale = 0.8f` to 0.9f is often imperceptible but saves significant fill rate.
- **Late Latching**: Reduces head-tracking latency. Enable in XR settings where available.

### XR-Specific Gotchas
- **Two eye renders = double the draw calls** unless using Single Pass Instanced. Check that all custom shaders support `UNITY_VERTEX_OUTPUT_STEREO` and `UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX`.
- **Post-processing is extra expensive in VR** (applies to each eye). Keep it minimal. Disable Bloom/DOF on Quest.
- **Avoid dynamic resolution in VR.** Causes reprojection artifacts. Use fixed render scale instead.
- **Mirror reflection probes and screen-space effects** do not work correctly in stereo. Use baked alternatives.

### Adaptive Performance (Samsung / Universal)
- **Adaptive Performance package** (`com.unity.adaptiveperformance`): Adjusts quality at runtime based on thermal state and GPU load.
- **Key scalers**: LOD bias, shadow distance, render scale, physics frequency, target FPS.
- **Thermal throttling**: Mobile GPUs throttle after sustained load. Adaptive Performance detects this and can preemptively lower quality to maintain FPS.
- **Use Samsung GameSDK** provider on Samsung devices for hardware-level thermal data.

---

## Asset Pipeline Rules

### Texture Import Settings
| Setting | Mobile/XR Value | Why |
|---------|----------------|-----|
| Format | ASTC (4x4 high quality, 6x6 balanced, 8x8 low quality) | Best quality-per-bit on mobile |
| Max Size | 512-1024 (most), 2048 (hero assets only) | VRAM is limited |
| Mipmaps | Enabled for 3D, disabled for UI | Reduces aliasing + bandwidth |
| Read/Write | DISABLED unless needed at runtime | Doubles memory when enabled |
| Generate Alpha from Grayscale | Only if needed | Saves channels |
| sRGB | Enabled for color, disabled for data (normal maps, masks) | Correct gamma handling |
| Streaming Mipmaps | Enabled | Reduces VRAM pressure |
| Aniso Level | 1 (most), 2-4 (ground textures viewed at angles) | Higher = more bandwidth |

### Mesh Import Settings
| Setting | Mobile/XR Value | Why |
|---------|----------------|-----|
| Read/Write | DISABLED | Halves mesh memory |
| Optimize Mesh | Everything | Reorders verts for GPU cache efficiency |
| Mesh Compression | Low or Medium | Reduces disk/download size |
| Normals | Import (if model has them), Calculate only if needed | Avoid recalculating unnecessarily |
| Blendshapes | Disabled unless using facial animation | Saves memory |
| Index Format | Auto (16-bit for < 65k verts) | 16-bit indices are faster |

### Mesh Polygon Budgets (Mobile/XR)
| Category | Triangle Budget |
|----------|----------------|
| Hero character | 10,000 - 30,000 |
| Secondary character | 3,000 - 10,000 |
| Props | 500 - 3,000 |
| Environment piece | 1,000 - 5,000 |
| Total scene | 100,000 - 300,000 (mobile), up to 500,000 (XR standalone) |

### Audio Import Settings
| Setting | Mobile/XR Value | Why |
|---------|----------------|-----|
| Load Type (short SFX < 200KB) | Decompress on Load | Fastest playback, more memory |
| Load Type (medium clips) | Compressed in Memory | Balance of memory vs CPU |
| Load Type (music/ambient) | Streaming | Minimal memory footprint |
| Compression Format | Vorbis (quality 40-70%) or AAC | Best compression ratio |
| Sample Rate | Override to 22050 Hz for SFX | Half the data, imperceptible for most SFX |
| Force Mono | Enable for SFX, disable for music | Halves memory for non-stereo content |
| Preload Audio Data | Disable for streaming clips | Reduces scene load time |

### AssetPostprocessor (Auto-Enforcement)
- **Create an `AssetPostprocessor`** script that auto-enforces import rules on all new assets. Override `OnPreprocessTexture()`, `OnPreprocessModel()`, `OnPreprocessAudio()` to set correct defaults.
- **Example enforcement**: If texture is > 2048 on mobile platform, auto-downsize. If mesh has Read/Write enabled, auto-disable. If audio is > 1MB and set to Decompress on Load, auto-switch to Streaming.

---

## Project Config Checklist

### Player Settings
- [ ] **Accelerometer Frequency**: Set to `Disabled` if not using accelerometer input. Default polls at 60Hz, wasting CPU.
- [ ] **Disable unnecessary sensors**: Gyroscope, compass, location -- disable if unused.
- [ ] **Managed Stripping Level**: Set to `High` for builds. Strips unused managed code. Verify nothing breaks with link.xml preserves.
- [ ] **Scripting Backend**: IL2CPP (not Mono) for release builds. Better performance and smaller binary.
- [ ] **Incremental GC**: Enabled.
- [ ] **Target Architecture**: ARM64 only for modern mobile/XR (drop ARMv7).

### Quality Settings
- [ ] **VSync**: Enabled for mobile/XR (prevents tearing, saves battery). Disable only for benchmarking.
- [ ] **Pixel Light Count**: 1 for mobile, 0 for low-end.
- [ ] **Texture Quality**: Full Res for hero assets, Half Res for background.
- [ ] **Anisotropic Textures**: Per Texture or Disabled globally.
- [ ] **Shadow Distance**: 20-50m for mobile. 15-30m for XR.
- [ ] **Shadow Cascades**: 1-2 for mobile. Never 4.
- [ ] **Shadow Resolution**: 512-1024 for mobile.
- [ ] **Soft Particles**: Disabled on mobile.
- [ ] **Billboards Face Camera**: Enabled.
- [ ] **LOD Bias**: 0.5-1.0 for mobile (more aggressive culling).
- [ ] **Maximum LOD Level**: 0 (use all LODs).

### Physics Settings
- [ ] **Fixed Timestep**: 0.02 (50Hz) is default. For XR, match display rate or set to 0.01389 (72Hz). Reduce to 0.03-0.04 (25-33Hz) if physics is not critical.
- [ ] **Default Solver Iterations**: Reduce from 6 to 4 if physics precision is not critical.
- [ ] **Default Solver Velocity Iterations**: Reduce from 1 to 1 (already minimal).
- [ ] **Auto Sync Transforms**: DISABLED. Manually call `Physics.SyncTransforms()` when needed. Auto-sync after every transform change is expensive.
- [ ] **Layer Collision Matrix**: Disable all layer pairs that should never collide. Reduces broadphase checks.
- [ ] **Reuse Collision Callbacks**: Enabled. Reuses `ContactPoint` arrays instead of allocating new ones.
- [ ] **Queries Hit Backfaces / Triggers**: Disabled unless needed.

### Time Settings
- [ ] **Maximum Allowed Timestep**: 0.1s (100ms). Prevents physics death spiral when frames drop.
- [ ] **Target Frame Rate**: Set `Application.targetFrameRate = 60` (or 72/90 for XR) at startup. Default is -1 (uncapped), which burns battery and generates heat.

### Hierarchy Best Practices
- [ ] **Flatten hierarchies.** Deep nesting means `Transform.SetParent()` and transform propagation is expensive. Every parent dirty-flags all children.
- [ ] **Avoid runtime reparenting** of objects with many children. Each reparent recalculates all child world transforms.
- [ ] **Use `Transform.SetPositionAndRotation()`** instead of setting `.position` and `.rotation` separately. Single native call vs two.
- [ ] **Static objects**: Mark as `Static` (or specific static flags) for batching, navigation, occlusion.

---

## UI Optimization (Canvas / UGUI)

### Canvas Splitting (Critical)
- **Split UI into multiple Canvases by update frequency.** When ANY element on a Canvas changes (color, position, text), the ENTIRE Canvas mesh is rebuilt. This is the #1 UI performance mistake.
- **Recommended split**: Static Canvas (HUD frame, labels that never change), Dynamic Canvas (health bars, scores, timers), Overlay Canvas (popups, tooltips).
- **Nested Canvases** inherit parent settings but rebuild independently. Use them to isolate frequently-changing elements.

### Layout Groups
- **Avoid `HorizontalLayoutGroup`, `VerticalLayoutGroup`, `GridLayoutGroup` on dynamic content.** They recalculate layout every time any child changes. O(n^2) behavior with nested groups.
- **If you must use Layout Groups**, disable them after initial layout with `enabled = false`. Re-enable only when content changes.
- **Prefer anchored RectTransform positioning** over Layout Groups for static layouts.

### GraphicRaycaster
- **Remove `GraphicRaycaster` from Canvases that do not receive input.** Every Canvas with a GraphicRaycaster processes ALL input events against ALL UI elements on that Canvas.
- **Set `Raycast Target = false`** on all UI elements that do not need click/touch (labels, decorative images, backgrounds). Default is `true`, which means every Text and Image is hit-tested.
- **Disable Raycast Target** on child elements when only the parent needs interaction.

### Additional UI Rules
- **Disable Canvas component** (not GameObject) to hide UI without triggering rebuild. `canvas.enabled = false` is cheaper than `gameObject.SetActive(false)`.
- **Object pool UI elements** (list items, inventory slots). Instantiate/Destroy causes Canvas rebuild + GC.
- **Avoid `Canvas.ForceUpdateCanvases()`.** Let Unity batch updates naturally at end of frame.
- **TextMeshPro**: Use TMP over legacy `Text`. TMP supports SDF rendering (resolution-independent) and is more efficient.
- **Avoid rich text tags** (`<color>`, `<b>`) in frequently-updated text if possible. Parsing adds overhead.
- **Full-screen UI**: If UI covers the entire screen (pause menu, loading), disable 3D camera rendering (`camera.enabled = false`). No point rendering a scene nobody can see.

---

## Audio Optimization

### Compression and Loading
- **Use Vorbis compression** for all clips on mobile (quality 40-70%). Uncompressed audio is 10-20x larger.
- **Streaming** for music/ambient (> 500KB compressed). Only ~200KB buffer in memory regardless of clip length.
- **Compressed in Memory** for medium clips (200KB - 500KB). Decompresses on play; small CPU spike but saves memory vs Decompress on Load.
- **Decompress on Load** only for short, frequently-played SFX (< 200KB). Uses more memory but zero CPU on play.

### AudioSource Settings
- **Limit concurrent AudioSources.** Each active source = CPU cost. Pool and reuse. Target: < 20-30 simultaneous sources on mobile.
- **Set `Priority`** on AudioSources. Lower priority sources are virtualized (stopped) when limit is reached.
- **Disable `Spatialize`** on sources that do not need 3D positioning (UI sounds, music).
- **Reduce `Max Distance`** on 3D sources to cull early.
- **Set `Doppler Level = 0`** unless Doppler effect is intentional.

### Mixer and DSP
- **DSP Buffer Size**: `Best Latency` uses smallest buffer (more CPU), `Best Performance` uses largest (more latency). Use `Good Latency` as default for mobile.
- **Minimize Mixer effects (reverb, chorus, echo).** Each effect = CPU per active source routed through it. Use Send/Return for shared effects rather than per-source effects.
- **Mute audio groups** rather than individual sources when pausing/hiding content.

---

## Quick Reference: Code Review Checklist for AI Agents

When reviewing or generating Unity C# code, auto-check these patterns:

### ALWAYS DO
- [x] Cache `GetComponent<T>()` in `Awake()` / field initialization
- [x] Use `CompareTag()` instead of `== "string"`
- [x] Cache `Animator.StringToHash()` and `Shader.PropertyToID()` as `static readonly int`
- [x] Use object pooling (`ObjectPool<T>`) for frequently created/destroyed objects
- [x] Use `sqrMagnitude` for distance comparisons
- [x] Cache `WaitForSeconds` instances
- [x] Use `SetPositionAndRotation()` instead of separate position/rotation sets
- [x] Use `half` precision in shaders where full precision is not needed
- [x] Mark non-moving objects as Static
- [x] Set `Raycast Target = false` on non-interactive UI elements
- [x] Use `TryGetComponent<T>()` for null-safe lookups

### NEVER DO
- [ ] `GetComponent` / `Find*` / `SendMessage` in Update loops
- [ ] LINQ in per-frame code (allocates enumerators)
- [ ] String concatenation in per-frame code
- [ ] `new List<T>()` or any collection allocation in per-frame code
- [ ] Leave empty `Update()` / `LateUpdate()` / `FixedUpdate()` / `OnGUI()` methods
- [ ] Use `Enum.ToString()` in hot paths
- [ ] `Instantiate()` / `Destroy()` in gameplay loops (use pools)
- [ ] Uncompressed textures in builds
- [ ] Read/Write enabled on textures/meshes that don't need runtime access
- [ ] `Destroy()` without pooling alternative consideration
- [ ] `Canvas.ForceUpdateCanvases()` unless absolutely necessary
- [ ] Dynamic Batching enabled (usually costs more than it saves in URP)

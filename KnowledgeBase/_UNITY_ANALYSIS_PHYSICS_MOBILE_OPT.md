# Unity Analysis, Physics & Mobile Optimization Guide

> **Sources:**
> - https://docs.unity3d.com/6000.3/Documentation/Manual/analysis.html
> - https://unity.com/how-to/enhanced-physics-performance-smooth-gameplay
> - https://unity.com/how-to/mobile-game-optimization-tips-part-1
> - https://unity.com/how-to/mobile-game-optimization-tips-part-2
>
> **Last Updated**: 2026-02-12
> **Unity Version**: Unity 6 (6000.3)
> **Cross-refs**: `_PERFORMANCE_PATTERNS_REFERENCE.md` (pooling, Burst jobs, profiler code), `_UNITY_URP_OPTIMIZATION.md` (URP asset settings, profiler markers)

---

## 1. Profiling Workflow (Analysis Tools)

### Tool Selection Matrix

| Tool | When to Use | Key Metric |
|------|------------|------------|
| **Unity Profiler** | First pass -- CPU/GPU/memory breakdown | Frame time, GC allocs |
| **Memory Profiler** | Memory spikes, leaks, texture bloat | Heap size, native allocs |
| **Profile Analyzer** | Compare builds, A/B test optimizations | Frame distribution delta |
| **Frame Debugger** | Draw call inspection, batching verification | Draw call count, batch breaks |
| **Physics Debugger** | Collider visualization, contact points | Active colliders, contacts/frame |
| **Xcode GPU Profiler** | iOS/macOS GPU bottlenecks | GPU time, shader occupancy |
| **RenderDoc** | Cross-platform GPU debugging (timing less accurate) | Draw call breakdown |

### Profiling Checklist (Do This Every Time)

- [ ] **Step 1: Identify** -- Run Unity Profiler on target device (not Editor)
- [ ] **Step 2: Classify** -- CPU-bound or GPU-bound? Check frame timeline
- [ ] **Step 3: Narrow** -- Use Profiler markers to find the hot function
- [ ] **Step 4: Fix** -- Apply targeted optimization (see sections below)
- [ ] **Step 5: Validate** -- Re-profile on same device, confirm improvement
- [ ] **Step 6: Regress** -- Test on worst target device before shipping

### Custom Profiler Markers

```csharp
using UnityEngine.Profiling;

// Wrap expensive operations for visibility in Profiler timeline
Profiler.BeginSample("PhysicsQuery_Batch");
// ... your code ...
Profiler.EndSample();

// Memory snapshot
long totalMB = Profiler.GetTotalAllocatedMemoryLong() / (1024 * 1024);
long monoMB = Profiler.GetMonoUsedSizeLong() / (1024 * 1024);
```

### Runtime Quality Scaling

Unity supports dynamic quality adjustment at runtime. Use `QualitySettings.SetQualityLevel()` or per-feature toggles to scale down when frame rate drops:

```csharp
if (fps < targetFPS * 0.9f)
{
    QualitySettings.shadowDistance = Mathf.Max(5f, QualitySettings.shadowDistance - 5f);
    QualitySettings.lodBias = Mathf.Max(0.5f, QualitySettings.lodBias - 0.1f);
}
```

---

## 2. Physics Performance Rules

### Project Settings (Edit > Project Settings > Physics)

| Setting | Rule | Why |
|---------|------|-----|
| **Fixed Timestep** | Increase from 0.02 (50Hz) to 0.04 (25Hz) for non-critical physics | Halves physics CPU cost |
| **Layer Collision Matrix** | Disable every layer pair that never needs collision | Each unchecked pair = skipped broadphase work |
| **Solver Iterations** | Reduce from default 6 to 4 if stability permits | Linear CPU savings |
| **Auto Sync Transforms** | Disable (Project Settings > Physics > Auto Sync Transforms) | Eliminates redundant transform syncs |
| **Prebake Collision Meshes** | Enable (Player Settings > Prebake Collision Meshes) | Avoids runtime mesh cooking on load |

### MeshCollider Cooking Options

```csharp
// On MeshCollider component, disable unnecessary cooking:
meshCollider.cookingOptions &= ~MeshColliderCookingOptions.EnableMeshCleaning;
meshCollider.cookingOptions &= ~MeshColliderCookingOptions.WeldColocatedVertices;
// Only disable if mesh data is pre-validated (no degenerate tris)
```

- **EnableMeshCleaning**: Disable if meshes are already clean (artist-validated)
- **WeldColocatedVertices**: Disable if vertices are already welded in DCC tool
- **CookForFasterSimulation**: Disable if memory is more constrained than CPU
- **Use Fast Midphase**: Enable on PC targets (PhysX 4.1 faster mid-phase algorithm)

### Physics.BakeMesh (Pre-cooking)

```csharp
using Unity.Jobs;

// Pre-cook mesh collider data off the main thread
// Call during loading screens or async scene setup
Physics.BakeMesh(mesh.GetInstanceID(), convex: false);
```

Use the C# Job System to offload mesh baking to worker threads during scene load or object pooling warm-up.

### Non-Allocating Physics Queries

```csharp
// WRONG -- allocates array every call
RaycastHit[] hits = Physics.RaycastAll(ray, maxDistance);

// CORRECT -- reuse pre-allocated buffer
private readonly RaycastHit[] _hitBuffer = new RaycastHit[32];

int count = Physics.RaycastNonAlloc(ray, _hitBuffer, maxDistance);
for (int i = 0; i < count; i++)
{
    ProcessHit(_hitBuffer[i]);
}

// Same pattern for:
// Physics.OverlapSphereNonAlloc()
// Physics.OverlapBoxNonAlloc()
// Physics.SphereCastNonAlloc()
```

### Static Collider Rule

**NEVER move a static collider at runtime.** Moving a collider without a Rigidbody triggers broadphase rebuild (Box Pruning recompilation). If it must move, attach a Rigidbody with `isKinematic = true`.

### Box Pruning (Large Scenes)

For scenes with many colliders spread over large areas, enable Box Pruning broadphase:
- Edit > Project Settings > Physics > Broadphase Type > **Automatic Box Pruning**
- More efficient spatial partitioning for large worlds

### Collision Callback Optimization

```csharp
// Reuse ContactPoint arrays, don't allocate per collision
private ContactPoint[] _contacts = new ContactPoint[16];

void OnCollisionEnter(Collision collision)
{
    int count = collision.GetContacts(_contacts);
    for (int i = 0; i < count; i++)
    {
        // Process _contacts[i]
    }
}
```

### Physics Optimization Checklist

- [ ] Layer Collision Matrix: disable all unused pairs
- [ ] Prebake Collision Meshes enabled in Player Settings
- [ ] Fixed Timestep tuned for target (25-50Hz, not higher than needed)
- [ ] Solver iterations reduced if stability permits
- [ ] Auto Sync Transforms disabled
- [ ] All runtime-moving colliders have Rigidbody (kinematic or dynamic)
- [ ] Non-allocating query variants used everywhere (NonAlloc)
- [ ] MeshCollider cooking options stripped for pre-validated meshes
- [ ] Physics.BakeMesh called during loading (not at runtime spawn)
- [ ] Batch raycasts per frame, never per-object
- [ ] Profile with Physics Debugger to visualize active colliders

---

## 3. Mobile Optimization: Geometry & Textures (Part 1)

### Mesh Rules

| Rule | Detail |
|------|--------|
| **Polygons on silhouette** | Spend tris on large visible shapes, not micro-detail |
| **Normal maps over geometry** | Bake detail into normal maps; mobile screens are small |
| **LOD mandatory for moving objects** | Reduce tri count ~50% per LOD level |
| **LOD shader simplification** | Use simpler shaders and fewer textures on distant LODs |
| **Skip LOD if camera/object is static** | LOD adds memory overhead; not worth it for fixed views |
| **Combine meshes** | `Mesh.CombineMeshes()` reduces draw calls for co-located static meshes |
| **Occlusion culling** | Mark objects as Static Occluders/Occludees, bake via Window > Rendering > Occlusion Culling |

### LOD Implementation

```csharp
// LOD Group setup rules:
// LOD0: Full mesh (100% screen height)
// LOD1: ~50% tris (screen < 60%)
// LOD2: ~25% tris (screen < 30%)
// Culled: (screen < 5%)
//
// Also reduce shader complexity per LOD level.
// LOD2 should use unlit or vertex-lit shader on mobile.
```

### Model Import Settings Checklist

- [ ] **Animation Type = None** for non-animated FBX (prevents unused Animator)
- [ ] **Disable Rig import** if no skeletal animation
- [ ] **Disable BlendShapes** if not used
- [ ] **Disable Normals import** if shader does not need them
- [ ] **Disable Tangents import** if no normal mapping on this mesh
- [ ] **Read/Write Enabled = OFF** unless runtime mesh modification needed (halves memory)

### Texture Rules

| Rule | Detail |
|------|--------|
| **Compress everything** | ASTC for mobile (4x4 = quality, 6x6 = balanced, 8x8 = size) |
| **Channel packing** | R=metallic, G=occlusion, B=detail, A=smoothness in one texture |
| **Max 1024x1024 for mobile** | 2048 only for hero assets; 512 for distant/small objects |
| **Tinted grayscale trick** | Store grayscale + tint color at runtime to cut texture memory |
| **Mipmap streaming** | Enable for large worlds; disable for UI/always-visible textures |
| **Power of 2 sizes** | Required for some compression formats; always recommended |
| **Disable Read/Write** | Halves texture memory unless CPU access needed |

### Texture Compression Quick Reference

| Platform | Format | Notes |
|----------|--------|-------|
| iOS | ASTC | Default for A8+ chips; best quality/size |
| Android | ASTC | Requires OpenGL ES 3.1 / Vulkan; fallback to ETC2 |
| Quest | ASTC | Same as Android |

---

## 4. Mobile Optimization: Lighting, Batching & Shaders (Part 2)

### Draw Call Batching Rules

| Technique | When to Use | Constraints |
|-----------|------------|-------------|
| **SRP Batcher** | Always enable in URP Asset | Requires compatible shaders (SRP-compatible) |
| **Static Batching** | Non-moving objects sharing materials | Trades memory for draw call reduction |
| **GPU Instancing** | Many identical objects (trees, props) | Same mesh + material required |
| **Dynamic Batching** | Small meshes only | Max 300 vertices / 900 vertex attributes |

**Priority order**: SRP Batcher > GPU Instancing > Static Batching > Dynamic Batching

### Lighting Rules for Mobile

| Rule | Detail |
|------|--------|
| **Bake everything possible** | Baked lighting = zero runtime cost |
| **Minimize dynamic lights** | Each dynamic light = extra pass or added cost |
| **Use Light Layers** | Confine light influence to specific culling masks |
| **Disable shadows per-object** | Uncheck Cast Shadows on MeshRenderer for small/distant objects |
| **Fake shadows** | Blurred texture on quad beneath characters (blob shadow) |
| **Light Probes for movers** | Use Spherical Harmonics probes for moving objects in baked scenes |
| **Mark GI contributors** | Set "Contribute GI" flag on objects that should affect lightmaps |
| **Progressive GPU Lightmapper** | Faster bake times than CPU lightmapper |

### Shadow Optimization

```
Mobile shadow rules:
1. Max 1 realtime shadow-casting light (directional)
2. Shadow distance: 15-30m max (mobile), 5-10m (XR)
3. Shadow resolution: 1024 or lower
4. Cascade count: 2 max on mobile, 1 on low-end
5. Soft shadows: OFF on low-end, Low quality on mid-range
6. Blob shadows for characters when possible
```

### Reflection Probe Rules

- Use **low-resolution cubemaps** (128x128 or 256x256)
- Apply **texture compression** to probe cubemaps
- Use **culling masks** to limit what probes render
- Minimize probe count; share probes across similar areas

### Shader Rules for Mobile

| Rule | Detail |
|------|--------|
| **Unlit over lit** | Use unlit shaders when dynamic lighting is unnecessary |
| **Vertex over fragment** | Move math to vertex shader where visual quality permits |
| **Minimize texture samples** | Each `tex2D()` call costs; pack channels, reduce samples |
| **Avoid transparency** | Transparent materials tank fill rate; minimize overdraw |
| **Use shader LOD** | `Shader.maximumLOD` to force simpler variants on low-end |
| **Avoid branching** | GPU branch prediction is poor; use `step()`/`lerp()` instead |

### Material Rules

```
1. Share materials across objects (enables batching)
2. Use MaterialPropertyBlock for per-instance variation (preserves batching)
3. Avoid runtime material instantiation (.material creates a copy; use .sharedMaterial)
4. Keep variant count low (each keyword combo = separate shader variant)
```

---

## 5. Consolidated Mobile Performance Budget

### Frame Budget Reference

| Platform | Target FPS | Frame Budget | Physics Budget (25%) | Rendering Budget (50%) | Scripts Budget (25%) |
|----------|-----------|-------------|---------------------|----------------------|---------------------|
| iPhone 12+ | 60 | 16.6ms | 4.1ms | 8.3ms | 4.1ms |
| iPhone SE 3 | 30 | 33.3ms | 8.3ms | 16.6ms | 8.3ms |
| Quest 2 | 72-90 | 11.1-13.9ms | 2.8-3.5ms | 5.5-6.9ms | 2.8-3.5ms |
| Quest 3 | 90-120 | 8.3-11.1ms | 2.1-2.8ms | 4.2-5.5ms | 2.1-2.8ms |

### Hard Limits (Mobile)

```
Draw calls:      < 100 (ideal < 50)
Triangles/frame: < 100K (ideal < 50K)
Vertices/frame:  < 100K
Active materials: < 30
Texture memory:  < 150MB
Mesh memory:     < 50MB
Active particles: < 10K total
Active lights:   < 4 (1 directional + 3 point max)
Shadow casters:  1 (directional only)
Physics bodies:  < 50 active
Raycasts/frame:  < 10 (batched, NonAlloc)
```

---

## 6. Master Optimization Checklist

### Pre-Build (Every Release)

**Profiling**
- [ ] Profile on target device (not Editor)
- [ ] Identify CPU vs GPU bottleneck
- [ ] Check GC allocations per frame (target: 0 in gameplay)
- [ ] Memory snapshot: no leaks across scene transitions

**Physics**
- [ ] Layer Collision Matrix minimized
- [ ] Prebake Collision Meshes ON
- [ ] Fixed Timestep appropriate for game type
- [ ] No static colliders moved at runtime
- [ ] All physics queries use NonAlloc variants
- [ ] Auto Sync Transforms OFF

**Geometry**
- [ ] LOD Groups on all dynamic objects
- [ ] Mesh.CombineMeshes for static clusters
- [ ] Occlusion Culling baked
- [ ] Read/Write disabled on meshes not modified at runtime
- [ ] Import settings stripped (no unused rigs, blendshapes, normals)

**Textures**
- [ ] ASTC compression on all textures
- [ ] Max size appropriate (1024 general, 512 distant, 2048 hero only)
- [ ] Channel packing where possible
- [ ] Read/Write disabled
- [ ] Mipmap streaming enabled for large worlds

**Lighting**
- [ ] Baked GI for static scenes
- [ ] Light Probes for moving objects
- [ ] Shadow distance minimized
- [ ] Blob shadows for characters where acceptable
- [ ] Reflection probes: low-res, compressed, culling-masked

**Rendering**
- [ ] SRP Batcher enabled
- [ ] GPU Instancing for repeated objects
- [ ] Static Batching for non-moving groups
- [ ] Shader complexity minimized (vertex > fragment math)
- [ ] Transparent objects minimized
- [ ] Overdraw checked via Scene view wireframe/overdraw mode

**Scripts**
- [ ] No per-frame GC allocations (no `new` in Update, no string concat)
- [ ] GetComponent cached in Awake
- [ ] FindObjectOfType replaced with FindAnyObjectByType + cached
- [ ] Object pooling for frequently spawned objects (see `_PERFORMANCE_PATTERNS_REFERENCE.md`)
- [ ] Heavy work offloaded to Jobs/Burst (see `_PERFORMANCE_PATTERNS_REFERENCE.md`)

---

## 7. Anti-Patterns (Never Do)

| Anti-Pattern | Why | Fix |
|-------------|-----|-----|
| Profile in Editor only | Editor overhead skews results 3-10x | Always profile on device |
| Move static colliders | Triggers broadphase rebuild | Add kinematic Rigidbody |
| Physics.RaycastAll in Update | Allocates array every frame | Use RaycastNonAlloc with buffer |
| GetComponent in Update | Reflection + search cost per call | Cache in Awake |
| Material property via `.material` | Creates material instance, breaks batching | Use MaterialPropertyBlock |
| Realtime shadows on everything | Massive fill rate cost on mobile | Bake + blob shadows |
| Uncompressed textures | 4-8x memory waste | ASTC compression |
| Read/Write on shipped assets | Doubles memory for mesh/texture | Disable unless runtime needed |
| Multiple MeshColliders on dynamic | Extremely expensive re-cooking | Use compound primitive colliders |
| FixedUpdate at 50Hz for simple games | Wastes CPU on unnecessary physics steps | Reduce to 25Hz if acceptable |

---

*Cross-reference: `_PERFORMANCE_PATTERNS_REFERENCE.md` for object pooling, Burst jobs, VFX optimization code. `_UNITY_URP_OPTIMIZATION.md` for URP Asset settings tables and profiler markers.*

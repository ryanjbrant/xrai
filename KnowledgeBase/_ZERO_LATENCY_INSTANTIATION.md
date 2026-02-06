# Zero-Latency Instantiation Strategy

**Last Updated**: 2026-02-06
**Status**: Triple-Verified
**Projects**: Portals V4, MetavidoVFX

## Core Philosophy

> **Experience Goal**: It should feel like magic or super powers.
> Every interaction must be instant, intuitive, and awe-inspiring.

## Latency Targets

| Interaction | Target | Implementation |
|-------------|--------|----------------|
| Object Spawn | <16ms (1 frame) | Pre-pooled primitives |
| VFX Attach | <16ms | VFX pools, pre-warmed |
| Model Load (cached) | <100ms | Edge CDN, local cache |
| Model Load (network) | <2s | Background prefetch |
| Voice → Action | <200ms | On-device STT, streaming |
| World Share | <500ms | Optimistic UI |

## Asset Loading Hierarchy (Fastest First)

### 1. Object Pools (Instant - 0ms)

```csharp
// Pre-warm pools at scene load
public class AssetPools : MonoBehaviour
{
    private static ObjectPool<GameObject> _cubePool;
    private static ObjectPool<GameObject> _spherePool;
    private static Dictionary<string, ObjectPool<VisualEffect>> _vfxPools;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void Initialize()
    {
        // Pre-create 20 of each primitive
        _cubePool = new ObjectPool<GameObject>(
            () => GameObject.CreatePrimitive(PrimitiveType.Cube),
            obj => obj.SetActive(true),
            obj => obj.SetActive(false),
            defaultCapacity: 20, maxSize: 100
        );

        // VFX pools - one per effect type
        _vfxPools = new Dictionary<string, ObjectPool<VisualEffect>>();
        PrewarmVFXPool("fire", 5);
        PrewarmVFXPool("sparkles", 5);
        PrewarmVFXPool("smoke", 5);
    }

    public static GameObject GetPrimitive(PrimitiveType type)
    {
        return type switch
        {
            PrimitiveType.Cube => _cubePool.Get(),
            PrimitiveType.Sphere => _spherePool.Get(),
            _ => GameObject.CreatePrimitive(type)
        };
    }
}
```

### 2. Cached Resources.Load (~1-5ms)

```csharp
// Cache asset references at startup
private static Dictionary<string, VisualEffectAsset> _vfxCache = new();

private static VisualEffectAsset GetVFX(string name)
{
    if (!_vfxCache.TryGetValue(name, out var asset))
    {
        asset = Resources.Load<VisualEffectAsset>($"VFX/{name}");
        if (asset != null) _vfxCache[name] = asset;
    }
    return asset;
}
```

### 3. Addressables with Preloading (~50-100ms)

```csharp
// Preload common assets during loading screen
public static async Task PreloadCommonAssets()
{
    var handles = new List<AsyncOperationHandle>();

    foreach (var label in new[] { "primitives", "common_vfx", "ui" })
    {
        var handle = Addressables.LoadAssetsAsync<GameObject>(label, null);
        handles.Add(handle);
    }

    await Task.WhenAll(handles.Select(h => h.Task));
}

// Instantiate preloaded assets instantly
public static async Task<GameObject> InstantiatePreloaded(string address)
{
    var handle = Addressables.InstantiateAsync(address);
    return await handle.Task; // ~5ms if preloaded
}
```

### 4. glTFast with Frame Budget (XR-Safe)

```csharp
// Configure for stable framerate
[RuntimeInitializeOnLoadMethod]
private static void ConfigureGltfast()
{
    var deferAgent = new TimeBudgetPerFrameDeferAgent();
    deferAgent.FrameBudget = 0.006f; // 6ms budget (leaves 10ms for rendering at 60fps)
    GltfImport.SetDefaultDeferAgent(deferAgent);
}

// Load model without blocking main thread
public async Task<GameObject> LoadModelAsync(string url)
{
    var gltf = new GltfImport();
    bool success = await gltf.Load(url);

    if (!success) return null;

    var parent = new GameObject("Model");
    await gltf.InstantiateMainSceneAsync(parent.transform);

    _loadedModels.Add(gltf); // Track for disposal
    return parent;
}
```

## VFX Instantiation Patterns

### From MetavidoVFX - VFXARBinder Pattern

```csharp
public class VFXSpawner : MonoBehaviour
{
    // Cache property IDs (computed once)
    private static readonly int _idDepth = Shader.PropertyToID("DepthMap");
    private static readonly int _idColor = Shader.PropertyToID("ColorMap");
    private static readonly int _idRayParams = Shader.PropertyToID("RayParams");

    public static VisualEffect SpawnVFX(VisualEffectAsset asset, Vector3 position)
    {
        var go = new GameObject($"VFX_{asset.name}");
        go.transform.position = position;

        var vfx = go.AddComponent<VisualEffect>();
        vfx.visualEffectAsset = asset;

        // Auto-bind AR data if VFX has the properties
        if (vfx.HasTexture(_idDepth))
        {
            var binder = go.AddComponent<VFXARBinder>();
            binder.AutoDetectBindings();
        }

        vfx.Reinit();
        vfx.Play();

        return vfx;
    }
}
```

### VFX Pool with Pre-warming

```csharp
public class VFXPool : MonoBehaviour
{
    [SerializeField] private VisualEffectAsset[] preloadAssets;

    private Dictionary<string, Queue<VisualEffect>> _pools = new();

    void Awake()
    {
        foreach (var asset in preloadAssets)
        {
            var queue = new Queue<VisualEffect>();

            // Pre-create 3 instances of each
            for (int i = 0; i < 3; i++)
            {
                var go = new GameObject($"VFX_{asset.name}_{i}");
                go.transform.SetParent(transform);
                var vfx = go.AddComponent<VisualEffect>();
                vfx.visualEffectAsset = asset;
                go.SetActive(false);
                queue.Enqueue(vfx);
            }

            _pools[asset.name] = queue;
        }
    }

    public VisualEffect Get(string effectName, Vector3 position)
    {
        if (!_pools.TryGetValue(effectName, out var queue) || queue.Count == 0)
            return null; // Fallback to dynamic creation

        var vfx = queue.Dequeue();
        vfx.transform.position = position;
        vfx.gameObject.SetActive(true);
        vfx.Reinit();
        vfx.Play();

        return vfx;
    }

    public void Return(VisualEffect vfx)
    {
        vfx.Stop();
        vfx.gameObject.SetActive(false);

        var assetName = vfx.visualEffectAsset.name;
        if (_pools.TryGetValue(assetName, out var queue))
            queue.Enqueue(vfx);
    }
}
```

## Progressive Loading Strategy

### Level 1: Immediate (Already in Memory)
- Primitives (cube, sphere, cylinder, capsule, plane)
- Pre-pooled VFX (fire, sparkles, smoke, bubbles)
- Basic materials (URP/Lit with color variants)

### Level 2: Fast (~100ms, Cached)
- User's recent models (last 10)
- Scene-specific assets (preloaded at scene start)
- Common VFX library

### Level 3: Network (~1-5s, CDN)
- User library models
- Shared scene assets
- On-demand VFX

### Level 4: Generated (~5-30s, AI)
- AI-generated models (text-to-3D)
- Gaussian splats
- Neural assets

## Predictive Preloading

```typescript
// React Native - Predict what user might need
class PredictiveLoader {
    private recentlyUsed: string[] = [];
    private preloadQueue: string[] = [];

    onUserAction(action: string) {
        // User said "add" - preload common objects
        if (action.includes('add')) {
            this.preload(['cube', 'sphere', 'model_dragon']);
        }

        // User is in fire scene - preload fire VFX
        if (this.sceneContains('fire')) {
            this.preload(['vfx_fire', 'vfx_smoke', 'vfx_ember']);
        }
    }

    private preload(assets: string[]) {
        for (const asset of assets) {
            if (!this.isLoaded(asset)) {
                this.sendToUnity('preload_asset', { assetId: asset });
            }
        }
    }
}
```

## Memory Management

### Cleanup Strategy

```csharp
// Periodic cleanup to prevent fragmentation
private IEnumerator MemoryCleanupRoutine()
{
    while (true)
    {
        yield return new WaitForSeconds(30f);

        // Return unused pool objects
        ReturnInactiveToPool();

        // Dispose unused glTF imports
        DisposeUnusedGltf();

        // Unity cleanup
        Resources.UnloadUnusedAssets();

        // Force GC if memory pressure
        if (SystemInfo.systemMemorySize > 0.8f * maxMemory)
        {
            GC.Collect();
        }
    }
}
```

### Budget Limits

| Platform | Total Memory | Asset Budget | VFX Particles |
|----------|--------------|--------------|---------------|
| iPhone 12 | 4GB | <400MB | <50K |
| iPhone 15 Pro | 8GB | <600MB | <100K |
| iPad Pro M1 | 8-16GB | <800MB | <200K |
| Quest 2 | 6GB | <300MB | <100K |
| Quest 3 | 8GB | <500MB | <150K |

## Bridge Message Optimization

### Batch Object Creation

```typescript
// Instead of 10 separate messages:
sendToUnity('batch_add', {
    objects: [
        { id: 'obj_1', modelId: 0, position: [0, 0, -2] },
        { id: 'obj_2', modelId: 1, position: [1, 0, -2] },
        // ... up to 50 objects per batch
    ]
});
```

### Delta Updates Only

```csharp
// Only send changed properties
public void OnTransformChanged(string objectId, TransformDelta delta)
{
    var message = new Dictionary<string, object> { ["id"] = objectId };

    if (delta.positionChanged)
        message["position"] = new[] { delta.position.x, delta.position.y, delta.position.z };
    if (delta.rotationChanged)
        message["rotation"] = new[] { delta.rotation.x, delta.rotation.y, delta.rotation.z, delta.rotation.w };
    if (delta.scaleChanged)
        message["scale"] = new[] { delta.scale.x, delta.scale.y, delta.scale.z };

    SendToRN("transform_update", message);
}
```

## File Format Priority (2026)

| Format | Use Case | Loader | Notes |
|--------|----------|--------|-------|
| **glTF/GLB** | 3D Models | glTFast 6.x | Primary format |
| **USDZ** | iOS AR Quick Look | Unity USD (limited) | View-only fallback |
| **FBX** | Editor import | Built-in | Not runtime |
| **VRM** | Avatars | UniVRM | Humanoid rigged |
| **3DGS** | Gaussian Splats | Custom/Research | High-fidelity capture |
| **XRAI** | Portals scenes | Custom JSON | Internal format |

## Hot-Swappable AI Models

```typescript
interface AIModelConfig {
    id: string;
    endpoint: string;
    type: 'local' | 'edge' | 'cloud';
    latency: number; // ms
}

const AI_MODELS = {
    // Voice understanding
    stt_local: { endpoint: 'whisper-local', type: 'local', latency: 50 },
    stt_cloud: { endpoint: 'openai/whisper', type: 'cloud', latency: 200 },

    // Scene generation
    llm_fast: { endpoint: 'gemini-flash', type: 'cloud', latency: 100 },
    llm_smart: { endpoint: 'gemini-pro', type: 'cloud', latency: 500 },

    // 3D generation
    text_to_3d: { endpoint: 'meshy/instant', type: 'cloud', latency: 5000 },
    image_to_3d: { endpoint: 'luma/genie', type: 'cloud', latency: 10000 },
};

// Auto-select based on context
function selectModel(task: string, urgency: 'instant' | 'fast' | 'quality'): AIModelConfig {
    if (urgency === 'instant') return AI_MODELS.llm_fast;
    if (urgency === 'quality') return AI_MODELS.llm_smart;
    return AI_MODELS.llm_fast; // Default to speed
}
```

## Summary: The Stack for Zero-Latency Magic

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZERO-LATENCY STACK                            │
├─────────────────────────────────────────────────────────────────┤
│ L6: AI Layer      │ Gemini Flash, Whisper, predictive loading   │
│ L5: Network       │ Edge CDN (R2), WebSocket for real-time      │
│ L4: Cache         │ LRU cache, user history, session state      │
│ L3: Pools         │ Object pools, VFX pools, material pools     │
│ L2: Preload       │ Scene assets, common VFX, user library      │
│ L1: Primitives    │ Built-in Unity primitives (instant)         │
└─────────────────────────────────────────────────────────────────┘
```

## Related Files

- Constitution: `.specify/memory/constitution.md` → Three Core Pillars
- Spec: `.specify/specs/002-unity-advanced-composer/spec.md`
- Bridge: `unity/Assets/Scripts/BridgeTarget.cs`
- VFX Patterns: `_VFX_MASTER_PATTERNS.md`
- MetavidoVFX: `VFXLibraryManager.cs`, `VFXARBinder.cs`

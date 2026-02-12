# Unity Memory Management, GC Avoidance, and Object Pooling Reference

**Version**: 1.0
**Last Updated**: 2026-02-12
**Unity Version**: 6 (6000.x) -- patterns apply to Unity 2021+ for pooling APIs
**Purpose**: Actionable rules and code patterns for zero-allocation gameplay, GC avoidance, and object pooling on mobile/XR
**Companion**: See `_PERFORMANCE_PATTERNS_REFERENCE.md` for VFX, Burst, WebGL patterns

---

## Table of Contents

1. [Golden Rules](#1-golden-rules)
2. [Managed Memory Architecture](#2-managed-memory-architecture)
3. [GC Avoidance Patterns](#3-gc-avoidance-patterns)
4. [Object Pooling with UnityEngine.Pool](#4-object-pooling-with-unityenginepool)
5. [Collection Pooling](#5-collection-pooling)
6. [String Handling](#6-string-handling)
7. [Array Optimization](#7-array-optimization)
8. [Closures, Boxing, and Delegates](#8-closures-boxing-and-delegates)
9. [Coroutine Allocation Avoidance](#9-coroutine-allocation-avoidance)
10. [Garbage Collector Configuration](#10-garbage-collector-configuration)
11. [Unmanaged Memory (NativeArray, Span, stackalloc)](#11-unmanaged-memory-nativearray-span-stackalloc)
12. [Mobile/XR-Specific Rules](#12-mobilexr-specific-rules)
13. [Profiling Checklist](#13-profiling-checklist)
14. [Quick-Reference Decision Table](#14-quick-reference-decision-table)

---

## 1. Golden Rules

**RULE 1: Zero bytes per frame.** Target 0 managed heap allocations in Update/FixedUpdate/LateUpdate. Every allocation is future GC work.

**RULE 2: Allocate at load, reuse at runtime.** Pre-allocate everything during scene load. Toggle active state; never Instantiate/Destroy in gameplay loops.

**RULE 3: The managed heap never shrinks.** Once Unity expands the heap, that memory is never returned to the OS. Prevent expansion by right-sizing pools and avoiding spikes.

**RULE 4: Profile before pooling.** Only pool when the Profiler shows GC.Alloc spikes. Over-pooling wastes memory, which is equally fatal on mobile.

**RULE 5: NonAlloc everything.** If a Unity API has a NonAlloc variant, use it. The standard version allocates a new array every call.

---

## 2. Managed Memory Architecture

### Memory Regions

| Region | Contents | GC Managed? |
|--------|----------|-------------|
| **Managed Heap** | All reference-type objects, boxed values, strings, arrays | Yes |
| **Scripting Stack** | Value-type locals, execution flow (per-thread, fixed size) | No |
| **Native VM Memory** | IL2CPP/Mono code, generics metadata, reflection data | No |
| **Native Unity Memory** | Textures, meshes, AudioClips, RenderTextures, GraphicsBuffers | No (use Destroy/UnloadUnusedAssets) |
| **C# Unmanaged** | NativeArray, UnsafeUtility allocations | No (manual Dispose/Free) |

### What Goes Where

- **Stack (no GC)**: int, float, bool, Vector3, Quaternion, Color, all structs (when not boxed)
- **Heap (GC tracked)**: class instances, strings, arrays, delegates, closures, boxed value types
- **Native (manual)**: Textures, Meshes, Materials, RenderTextures, AudioClips -- must call `Destroy()` or `Resources.UnloadUnusedAssets()`

### Fragmentation Problem

When objects are freed, gaps appear between remaining allocations. If no gap fits a new allocation:
1. GC runs (if not recent)
2. Heap expands (typically doubles previous expansion)
3. **Expanded heap is never returned to the OS**

> Source: [Unity 6000.3 Managed Memory Introduction](https://docs.unity3d.com/6000.3/Documentation/Manual/performance-managed-memory-introduction.html)

---

## 3. GC Avoidance Patterns

### The Math That Matters

```
1 KB/frame x 60 fps = 60 KB/sec = 3.6 MB/min
Even small per-frame allocations compound into massive GC pressure.
```

### Pattern: Hoist Collections to Class Scope

```csharp
// BAD: allocates new List every frame
void Update()
{
    List<float> neighbors = new List<float>();
    FindNeighbors(neighbors);
}

// GOOD: reuse across frames
private List<float> _neighbors = new List<float>();
void Update()
{
    _neighbors.Clear(); // Clear does NOT deallocate, just resets Count
    FindNeighbors(_neighbors);
}
```

### Pattern: Pass Arrays as Parameters (Avoid Return Allocations)

```csharp
// BAD: allocates new array per call
float[] RandomList(int n) { return new float[n]; }

// GOOD: caller owns the buffer, method fills it
void RandomList(float[] arrayToFill)
{
    for (int i = 0; i < arrayToFill.Length; i++)
        arrayToFill[i] = Random.value;
}
```

### Pattern: Cache Empty Arrays

```csharp
// BAD: allocates new zero-length array per call
public T[] GetResults() => condition ? results : new T[0];

// GOOD: static singleton empty array
private static readonly T[] s_emptyArray = new T[0]; // or Array.Empty<T>()
public T[] GetResults() => condition ? results : s_emptyArray;
```

### Pattern: Dirty-Flag Updates (Avoid Unnecessary Work)

```csharp
private int _lastScore = -1;
void Update()
{
    if (score != _lastScore)
    {
        _lastScore = score;
        scoreText.text = score.ToString(); // Only allocates when score changes
    }
}
```

> Source: [Unity 2022.3 GC Best Practices](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-garbage-collection-best-practices.html), [Unity 6000.0 Reference Types](https://docs.unity3d.com/6000.0/Documentation/Manual/performance-reference-types.html)

---

## 4. Object Pooling with UnityEngine.Pool

### API: ObjectPool<T>

```csharp
using UnityEngine.Pool;

public class ProjectileLauncher : MonoBehaviour
{
    [SerializeField] private Projectile prefab;
    [SerializeField] private int defaultCapacity = 20;
    [SerializeField] private int maxSize = 100;

    private ObjectPool<Projectile> _pool;

    void Awake()
    {
        _pool = new ObjectPool<Projectile>(
            createFunc:        CreateProjectile,
            actionOnGet:       OnGetFromPool,
            actionOnRelease:   OnReleaseToPool,
            actionOnDestroy:   OnDestroyPooled,
            collectionCheck:   true,   // Catch double-release in dev
            defaultCapacity:   defaultCapacity,
            maxSize:           maxSize  // Overflow destroyed, not pooled
        );
    }

    private Projectile CreateProjectile()
    {
        var p = Instantiate(prefab);
        p.Pool = _pool; // Give object a reference to release itself
        return p;
    }

    private void OnGetFromPool(Projectile p)
    {
        p.gameObject.SetActive(true);
    }

    private void OnReleaseToPool(Projectile p)
    {
        p.gameObject.SetActive(false);
    }

    private void OnDestroyPooled(Projectile p)
    {
        Destroy(p.gameObject);
    }

    public void Fire()
    {
        Projectile bullet = _pool.Get();
        bullet.transform.position = transform.position;
        bullet.transform.rotation = transform.rotation;
        bullet.Launch();
    }
}
```

### Self-Returning Pooled Object

```csharp
public class Projectile : MonoBehaviour
{
    public ObjectPool<Projectile> Pool { get; set; }

    private Rigidbody _rb;
    private WaitForSeconds _deactivateDelay;

    void Awake()
    {
        _rb = GetComponent<Rigidbody>();
        _deactivateDelay = new WaitForSeconds(5f); // Cache yield instruction
    }

    public void Launch()
    {
        _rb.linearVelocity = transform.forward * 20f;
        StartCoroutine(DeactivateAfterDelay());
    }

    private IEnumerator DeactivateAfterDelay()
    {
        yield return _deactivateDelay; // No allocation (cached)

        // CRITICAL: Reset dirty state before returning to pool
        _rb.linearVelocity = Vector3.zero;
        _rb.angularVelocity = Vector3.zero;

        Pool.Release(this);
    }
}
```

### ObjectPool Properties

| Property | Description |
|----------|-------------|
| `CountActive` | Objects currently in use |
| `CountInactive` | Objects available in pool |
| `CountAll` | Total tracked objects (active + inactive) |

### ObjectPool vs LinkedPool

| Feature | ObjectPool<T> | LinkedPool<T> |
|---------|--------------|---------------|
| Internal structure | Stack (array-backed) | Linked list |
| Memory per item | Lower (contiguous) | Higher (node overhead) |
| CPU per operation | Lower | Slightly higher |
| Best for | Most cases | Variable-size pools |

**WARNING**: Both ObjectPool and LinkedPool are NOT thread-safe. All operations must happen on the main thread.

> Source: [Unity Learn Object Pooling](https://learn.unity.com/course/design-patterns-unity-6/tutorial/use-object-pooling-to-boost-performance-of-c-scripts-in-unity), [Unity 6000.3 ObjectPool API](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Pool.ObjectPool_1.html)

---

## 5. Collection Pooling

### ListPool<T> -- Automatic Disposal (Recommended)

```csharp
using UnityEngine.Pool;

void ProcessVertices(Mesh mesh)
{
    // Automatic return to pool when 'using' scope exits
    using (ListPool<Vector3>.Get(out List<Vector3> tempVerts))
    {
        mesh.GetVertices(tempVerts);
        for (int i = 0; i < tempVerts.Count; i++)
        {
            // Process vertices...
        }
    } // tempVerts automatically returned to pool here
}
```

### CollectionPool -- Manual Management

```csharp
// Get a pooled list
var points = CollectionPool<List<Vector2>, Vector2>.Get();

// Use it
points.Add(new Vector2(1, 2));
points.Add(new Vector2(3, 4));

// MUST release manually
CollectionPool<List<Vector2>, Vector2>.Release(points);
```

### Available Collection Pools

| Pool Type | Use Case |
|-----------|----------|
| `ListPool<T>` | Temporary lists |
| `DictionaryPool<TKey, TValue>` | Temporary dictionaries |
| `HashSetPool<T>` | Temporary hash sets |
| `CollectionPool<TCollection, TItem>` | Generic (any ICollection) |

**RULE**: Always prefer the `using` pattern for temporary collections. It guarantees return-to-pool even on exceptions.

**WARNING**: All collection pools are NOT thread-safe.

> Source: [Unity 6000.1 CollectionPool API](https://docs.unity3d.com/6000.1/Documentation/ScriptReference/Pool.CollectionPool_2.html), [Unity 6000.1 ListPool API](https://docs.unity3d.com/6000.1/Documentation/ScriptReference/Pool.ListPool_1.html)

---

## 6. String Handling

### Rule: Strings are immutable reference types. Every modification creates a new heap allocation.

### BAD: Concatenation in Loops

```csharp
// Creates N intermediate strings, all become garbage
string result = "";
for (int i = 0; i < parts.Length; i++)
    result += parts[i]; // "A", "AB", "ABC"... only last one used
```

### GOOD: StringBuilder (Reuse Across Frames)

```csharp
private readonly StringBuilder _sb = new StringBuilder(64);

string BuildMessage(string[] parts)
{
    _sb.Clear(); // No allocation
    for (int i = 0; i < parts.Length; i++)
        _sb.Append(parts[i]);
    return _sb.ToString(); // Single allocation for final result
}
```

### BEST: Separate UI Elements (Zero Concatenation)

```csharp
// Instead of: scoreText.text = "Score: " + score;
// Use two TextMeshPro elements:
[SerializeField] private TMP_Text _label; // Shows "Score: " (set once)
[SerializeField] private TMP_Text _value; // Shows the number

private int _lastScore = -1;

void Update()
{
    if (score != _lastScore)
    {
        _lastScore = score;
        _value.text = score.ToString();
    }
}
```

### ADVANCED: TMPro SetText with Char Arrays (True Zero-Alloc)

```csharp
// Use TMP_Text.SetText(char[], int, int) to avoid all string allocations
private char[] _scoreChars = new char[16];

void UpdateScore(int score)
{
    int length = IntToChars(score, _scoreChars);
    _scoreDisplay.SetText(_scoreChars, 0, length);
}
```

> Source: [Unity 6000.0 Reference Types](https://docs.unity3d.com/6000.0/Documentation/Manual/performance-reference-types.html)

---

## 7. Array Optimization

### Rule: Unity APIs that return arrays allocate a NEW copy every access.

### BAD: Array Property in Loop

```csharp
// mesh.vertices allocates a new Vector3[] EVERY access
for (int i = 0; i < mesh.vertices.Length; i++) // Allocation 1
{
    float x = mesh.vertices[i].x; // Allocation 2
    float y = mesh.vertices[i].y; // Allocation 3
}
// 3 full array copies per iteration!
```

### GOOD: Cache Before Loop

```csharp
var vertices = mesh.vertices; // One allocation, reused
for (int i = 0; i < vertices.Length; i++)
{
    float x = vertices[i].x; // No allocation
}
```

### BEST: Non-Allocating Getter with Cached List

```csharp
private List<Vector3> _vertexCache = new List<Vector3>();

void ProcessMesh(Mesh mesh)
{
    mesh.GetVertices(_vertexCache); // Fills existing list, no array alloc
    for (int i = 0; i < _vertexCache.Count; i++)
    {
        // Process _vertexCache[i]
    }
}
```

### NonAlloc API Reference Table

| Allocating API | Non-Allocating Alternative |
|----------------|---------------------------|
| `Physics.RaycastAll()` | `Physics.RaycastNonAlloc(results)` |
| `Physics.OverlapSphere()` | `Physics.OverlapSphereNonAlloc(results)` |
| `Physics.SphereCastAll()` | `Physics.SphereCastNonAlloc(results)` |
| `Physics2D.RaycastAll()` | `Physics2D.RaycastNonAlloc(results)` |
| `mesh.vertices` | `mesh.GetVertices(list)` |
| `mesh.normals` | `mesh.GetNormals(list)` |
| `mesh.triangles` | `mesh.GetTriangles(list, submesh)` |
| `mesh.uv` | `mesh.GetUVs(channel, list)` |
| `Input.touches` | `Input.touchCount` + `Input.GetTouch(i)` |
| `Animator.parameters` | `Animator.parameterCount` + `Animator.GetParameter(i)` |
| `Renderer.sharedMaterials` | `Renderer.GetSharedMaterials(list)` |

### Large Arrays (> 10,000 Elements)

Use `NativeArray<T>` instead of managed arrays. See Section 11.

> Source: [Unity 6000.3 Array Optimization](https://docs.unity3d.com/6000.3/Documentation/Manual/performance-optimizing-arrays.html)

---

## 8. Closures, Boxing, and Delegates

### Closures: Capture Creates Heap Allocation

```csharp
// NO CLOSURE -- no allocation (simple lambda, no external captures)
listOfNumbers.Sort((x, y) => x.CompareTo(y));

// CLOSURE -- allocates anonymous class to capture 'divisor'
int divisor = GetDivisor();
listOfNumbers.Sort((x, y) => x.CompareTo(y / divisor));
// Compiler generates: class <>c__DisplayClass { int divisor; ... }
```

**Fix**: Convert closures to named methods. Pass captured values as parameters.

```csharp
// GOOD: No closure, no allocation
private int _cachedDivisor;
private int CompareWithDivisor(float x, float y)
    => ((int)x).CompareTo((int)(y / _cachedDivisor));

void SortList()
{
    _cachedDivisor = GetDivisor();
    listOfNumbers.Sort(CompareWithDivisor);
}
```

### Boxing: Value Type to Reference Type = Heap Allocation

```csharp
// BOXING: int -> object (heap allocation)
int x = 42;
object y = x; // Boxed!

// BOXING: calling object.Equals on value type
y.Equals(x); // x boxed again for the call

// HIDDEN BOXING: string.Format with value types
string s = string.Format("{0}", x); // x boxed to pass as object
```

**Fix**: Use generic APIs. Avoid `object` parameters for value types.

```csharp
// GOOD: generic -- no boxing
List<int> list = new List<int>(); // Not List<object>
list.Contains(42); // No boxing, generic comparison

// GOOD: interpolated strings with .ToString() (avoids boxing in many cases)
string s = $"{x.ToString()}"; // Explicit ToString avoids boxing
```

### Detecting Boxing in IL

Search decompiled output for the `box` IL instruction:
- ReSharper IL Viewer
- dotPeek decompiler
- Profiler CPU traces show: `Box(...)`, `<ClassName>::Box(...)`, `<ClassName>_Box(...)`

### Delegates / Method References

```csharp
// BAD: new delegate allocation every call
void RegisterCallback()
{
    someEvent += new Action(OnEvent); // Allocation
}

// GOOD: cache the delegate
private Action _onEventCached;
void Awake()
{
    _onEventCached = OnEvent; // One-time allocation
}
void RegisterCallback()
{
    someEvent += _onEventCached; // No allocation
}
```

### params Modifier = Array Allocation

```csharp
// BAD: params allocates an array every call
void Log(params object[] args) { }
Log(1, 2, 3); // Allocates object[3] + boxes 3 ints

// GOOD: typed overloads
void Log(int a) { }
void Log(int a, int b) { }
void Log(int a, int b, int c) { }
```

### LINQ = Forbidden in Hot Paths

**NEVER use System.Linq in Update, FixedUpdate, or any per-frame code.** LINQ methods allocate enumerators, closures, and intermediate collections.

```csharp
// FORBIDDEN in hot paths:
var filtered = enemies.Where(e => e.IsAlive).OrderBy(e => e.Distance).ToList();

// GOOD: manual loop with cached list
_aliveEnemies.Clear();
for (int i = 0; i < enemies.Count; i++)
{
    if (enemies[i].IsAlive)
        _aliveEnemies.Add(enemies[i]);
}
_aliveEnemies.Sort(_distanceComparer); // Cached IComparer
```

> Source: [Unity 6000.0 Reference Types](https://docs.unity3d.com/6000.0/Documentation/Manual/performance-reference-types.html), [Unity 6000.0 Programming Best Practices](https://docs.unity3d.com/6000.0/Documentation/Manual/programming-best-practices.html)

---

## 9. Coroutine Allocation Avoidance

### Problem: `yield return new WaitForSeconds()` Allocates Every Call

```csharp
// BAD: 21 bytes of garbage per yield (WaitForSeconds is a class)
IEnumerator BadCoroutine()
{
    while (true)
    {
        yield return new WaitForSeconds(0.1f); // GC alloc!
        DoWork();
    }
}
```

### Fix 1: Cache as Member Variable (Recommended)

```csharp
private readonly WaitForSeconds _wait01 = new WaitForSeconds(0.1f);
private readonly WaitForSeconds _wait1 = new WaitForSeconds(1f);
private readonly WaitForEndOfFrame _waitEOF = new WaitForEndOfFrame();
private readonly WaitForFixedUpdate _waitFixed = new WaitForFixedUpdate();

IEnumerator GoodCoroutine()
{
    while (true)
    {
        yield return _wait01; // Zero allocation
        DoWork();
    }
}
```

### Fix 2: Static Yielder Dictionary (Application-Wide Reuse)

```csharp
public static class Yielders
{
    private static readonly Dictionary<float, WaitForSeconds> _cache = new();
    private static readonly WaitForEndOfFrame _endOfFrame = new WaitForEndOfFrame();
    private static readonly WaitForFixedUpdate _fixedUpdate = new WaitForFixedUpdate();

    public static WaitForEndOfFrame EndOfFrame => _endOfFrame;
    public static WaitForFixedUpdate FixedUpdate => _fixedUpdate;

    public static WaitForSeconds Seconds(float duration)
    {
        if (!_cache.TryGetValue(duration, out var wait))
        {
            wait = new WaitForSeconds(duration);
            _cache[duration] = wait;
        }
        return wait;
    }
}

// Usage: yield return Yielders.Seconds(0.5f);
```

### Caveat: yield Still Boxes

Even cached WaitForSeconds objects get boxed when yielded (since `yield return` expects `object`). The savings from caching is the class construction, not the boxing. For truly zero-alloc async work, consider `UniTask` or `async/await` with struct-based awaiters.

### yield return null is Free

```csharp
yield return null; // Waits one frame, no allocation
```

> Source: [Unity Discussions - Coroutine WaitForSeconds GC Tip](https://discussions.unity.com/t/c-coroutine-waitforseconds-garbage-collection-tip/526939)

---

## 10. Garbage Collector Configuration

### GC Modes (Unity 6)

| Mode | API | Behavior |
|------|-----|----------|
| **Incremental** (default) | Project Settings > Player > Configuration > Use Incremental GC | Splits GC work across frames using time slices |
| **Stop-the-World** | Disable "Use Incremental GC" | Full collection pauses the application |
| **Enabled** | `GarbageCollector.GCMode = Mode.Enabled` | Normal automatic GC |
| **Disabled** | `GarbageCollector.GCMode = Mode.Disabled` | No GC at all; `GC.Collect()` is a no-op |
| **Manual** | `GarbageCollector.GCMode = Mode.Manual` | No auto-GC, but `GC.Collect()` and `CollectIncremental()` work |

### Incremental GC Details

- Distributes marking phase across frames using small time slices
- Adds **write barriers** to all reference modifications (overhead: ~0-1ms/frame for CPU-bound code)
- If VSync or `Application.targetFrameRate` is set, Unity auto-calculates the time slice from remaining frame budget
- Falls back to full stop-the-world collection if too many references change between slices
- Use `GarbageCollector.incrementalTimeSliceNanoseconds` to control slice duration

### When to Disable Incremental GC

- Your code avoids all GC allocations in performance-critical sections
- Write barrier overhead exceeds GC spike savings (measure with Profile Analyzer)
- CPU-bound projects (not GPU-bound) where every ms counts

### Manual GC Strategy for Loading Screens

```csharp
// During gameplay: disable GC
GarbageCollector.GCMode = GarbageCollector.Mode.Disabled;

// During loading screen: run full collection
GarbageCollector.GCMode = GarbageCollector.Mode.Enabled;
System.GC.Collect();
// Or incremental:
GarbageCollector.CollectIncremental();

// Resume gameplay: disable again
GarbageCollector.GCMode = GarbageCollector.Mode.Disabled;
```

**WARNING**: Disabled mode means memory NEVER decreases. The heap grows until the OS kills the app. Only disable after pre-allocating everything.

**WARNING**: GCMode is NOT supported on WebGL or in the Editor.

### Native Memory Cleanup

The GC does NOT clean native memory. You must call:
- `Destroy(obj)` for GameObjects, Components, Textures, etc.
- `Resources.UnloadUnusedAssets()` for unreferenced assets (CPU-intensive, use sparingly)

> Source: [Unity 6000.2 Incremental GC](https://docs.unity3d.com/6000.2/Documentation/Manual/performance-incremental-garbage-collection.html), [Unity 6000.2 Configuring GC](https://docs.unity3d.com/6000.2/Documentation/Manual/performance-disabling-garbage-collection.html)

---

## 11. Unmanaged Memory (NativeArray, Span, stackalloc)

### NativeArray<T> -- GC-Invisible Managed Buffer

```csharp
using Unity.Collections;

// Allocate (choose allocator based on lifetime)
NativeArray<float3> positions = new NativeArray<float3>(10000, Allocator.Persistent);

// Use in Jobs / Burst
var job = new MyJob { positions = positions };
job.Schedule(positions.Length, 64).Complete();

// MUST dispose manually (leaks otherwise)
positions.Dispose();

// Or use 'using' for scoped lifetime
using var tempBuffer = new NativeArray<int>(256, Allocator.Temp);
```

### Allocator Lifetimes

| Allocator | Lifetime | Use Case |
|-----------|----------|----------|
| `Allocator.Temp` | 1 frame (auto-disposed at frame end) | Per-frame scratch data |
| `Allocator.TempJob` | 4 frames | Job system temporaries |
| `Allocator.Persistent` | Until Dispose() called | Long-lived data, pools |

### stackalloc + Span<T> -- Zero-Heap Scratch Buffers

```csharp
void ProcessData()
{
    // Allocates on the STACK -- zero heap, zero GC, auto-freed on return
    Span<float> scratch = stackalloc float[64];

    for (int i = 0; i < scratch.Length; i++)
        scratch[i] = ComputeValue(i);

    ApplyResults(scratch);
}
```

**RULES for stackalloc**:
- Only for small buffers (< ~1 KB recommended, stack is limited)
- NEVER use inside loops (allocated per iteration, freed only on function return)
- Only works with unmanaged types (int, float, structs of unmanaged fields)
- Unity APIs don't widely accept Span yet, but it's excellent for your own code

### When to Use What

| Data Size | Lifetime | Recommendation |
|-----------|----------|----------------|
| < 1 KB | Function scope | `stackalloc` + `Span<T>` |
| 1 KB - 10 KB | 1-4 frames | `NativeArray<T>` with `Allocator.Temp` or `TempJob` |
| > 10 KB | Persistent | `NativeArray<T>` with `Allocator.Persistent` |
| Collections | Temporary | `ListPool<T>` / `CollectionPool` |
| Collections | Persistent | Class-scoped `List<T>` with `.Clear()` reuse |

> Source: [Unity 6000.3 Memory Overview](https://docs.unity3d.com/6000.3/Documentation/Manual/performance-memory-overview.html), [Unity Discussions - stackalloc vs NativeArray](https://discussions.unity.com/t/is-it-faster-to-create-stackalloc-arrays-or-nativearrays-for-temp-operations-inside-jobs/1581049)

---

## 12. Mobile/XR-Specific Rules

### Frame Budgets

| Platform | Target FPS | Frame Budget |
|----------|-----------|--------------|
| Quest 2 | 90 Hz | 11.1 ms |
| Quest 3 | 120 Hz | 8.3 ms |
| iPhone (recent) | 60 Hz | 16.6 ms |
| iPad Pro | 120 Hz | 8.3 ms |

A single GC spike can consume 5-20ms, blowing the entire frame budget.

### Mobile/XR Memory Checklist

1. **Pool all spawned objects** -- projectiles, VFX, UI elements, enemies
2. **Pre-warm pools during loading** -- allocate max expected count upfront
3. **Use NonAlloc physics** -- RaycastNonAlloc, OverlapSphereNonAlloc
4. **Cache all GetComponent calls** -- call once in Awake(), never in Update()
5. **Use FindAnyObjectByType** -- replaces deprecated FindObjectOfType (Unity 6), cache result
6. **Set data texture FilterMode.Point** -- prevents bilinear interpolation corrupting discrete data
7. **Release RenderTextures/GraphicsBuffers in OnDestroy** -- with null + IsCreated() guards
8. **Dispose NativeArrays in OnDestroy** -- check IsCreated before Dispose
9. **Use Burst + Jobs for heavy computation** -- 10-100x speedup, zero GC
10. **Avoid LINQ, closures, boxing in all hot paths**
11. **Set capacity hints** for Lists/Dictionaries at creation to avoid resize allocations
12. **Cache WaitForSeconds** and all YieldInstructions
13. **Profile on target device** -- Editor performance is not representative

### AR Foundation Specific

- `TryAcquire*CpuImage()` returns disposable handles -- always use `using`
- Camera texture access creates GPU-only refs; use CPU image API for processing
- Wait for `ARSession.state >= SessionTracking` before any AR operations
- Hand tracking / body tracking data arrives per-frame -- pre-allocate result buffers

> Source: [Unity Mobile/XR Performance Guide](https://unity.com/resources/mobile-xr-web-game-performance-optimization-unity-6), project CLAUDE.md learned rules

---

## 13. Profiling Checklist

### Detect GC Allocations

1. Open **Window > Analysis > Profiler**
2. Select **CPU Usage** module
3. Look for **GC.Alloc** column -- sort descending
4. Any allocation in Update/FixedUpdate/LateUpdate is a candidate for elimination
5. Use **Deep Profile** mode to trace allocations to exact source lines

### Profile Markers for Custom Code

```csharp
using UnityEngine.Profiling;

void Update()
{
    Profiler.BeginSample("MySystem.Process");
    ProcessEntities();
    Profiler.EndSample();
}
```

### Memory Profiler Package

```csharp
// Check runtime memory
long totalMB = Profiler.GetTotalAllocatedMemoryLong() / (1024 * 1024);
long managedMB = Profiler.GetMonoUsedSizeLong() / (1024 * 1024);
long heapMB = Profiler.GetMonoHeapSizeLong() / (1024 * 1024);
Debug.Log($"Total: {totalMB}MB | Managed Used: {managedMB}MB | Heap: {heapMB}MB");
```

### Compare Incremental vs Non-Incremental GC

Use the **Profile Analyzer** package to A/B test the same scene with/without incremental GC. Measure:
- Average frame time
- 99th percentile frame time
- GC spike frequency and duration

---

## 14. Quick-Reference Decision Table

| Situation | Solution | Section |
|-----------|----------|---------|
| Spawning/destroying objects frequently | `ObjectPool<T>` | 4 |
| Temporary List/Dict/HashSet needed | `ListPool<T>` with `using` | 5 |
| Building strings | `StringBuilder` (reused) or split UI | 6 |
| Unity API returns array | Cache result or use NonAlloc variant | 7 |
| Lambda captures local variable | Convert to named method | 8 |
| Passing int/float to object parameter | Use generic overload | 8 |
| `yield return new WaitForSeconds` | Cache as field or use `Yielders` | 9 |
| Loading screen transition | Manual GC with `GarbageCollector.GCMode` | 10 |
| Large data buffer (> 10K elements) | `NativeArray<T>` | 11 |
| Small scratch buffer (< 1 KB) | `stackalloc` + `Span<T>` | 11 |
| Per-frame physics queries | `Physics.RaycastNonAlloc` | 7 |
| LINQ in Update | Replace with manual loop + cached list | 8 |
| Delegate passed repeatedly | Cache delegate as field | 8 |

---

## Sources

- [Unity Learn: Object Pooling in Unity 6](https://learn.unity.com/course/design-patterns-unity-6/tutorial/use-object-pooling-to-boost-performance-of-c-scripts-in-unity)
- [Unity 6000.3: Managed Memory Introduction](https://docs.unity3d.com/6000.3/Documentation/Manual/performance-managed-memory-introduction.html)
- [Unity 6000.3: Garbage Collector](https://docs.unity3d.com/6000.3/Documentation/Manual/performance-garbage-collector.html)
- [Unity 6000.3: Optimizing Managed Memory](https://docs.unity3d.com/6000.3/Documentation/Manual/performance-optimizing-code-managed-memory.html)
- [Unity 6000.3: Prefab Instantiation](https://docs.unity3d.com/6000.3/Documentation/Manual/instantiating-prefabs-projectiles.html)
- [Unity 6000.0: Reference Type Management](https://docs.unity3d.com/6000.0/Documentation/Manual/performance-reference-types.html)
- [Unity 6000.3: Array Optimization](https://docs.unity3d.com/6000.3/Documentation/Manual/performance-optimizing-arrays.html)
- [Unity 6000.2: Incremental GC](https://docs.unity3d.com/6000.2/Documentation/Manual/performance-incremental-garbage-collection.html)
- [Unity 6000.2: Configuring/Disabling GC](https://docs.unity3d.com/6000.2/Documentation/Manual/performance-disabling-garbage-collection.html)
- [Unity 6000.3: ObjectPool API](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Pool.ObjectPool_1.html)
- [Unity 6000.1: CollectionPool API](https://docs.unity3d.com/6000.1/Documentation/ScriptReference/Pool.CollectionPool_2.html)
- [Unity 6000.1: ListPool API](https://docs.unity3d.com/6000.1/Documentation/ScriptReference/Pool.ListPool_1.html)
- [Unity 2022.3: GC Best Practices](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-garbage-collection-best-practices.html)
- [Unity Discussions: Coroutine WaitForSeconds GC](https://discussions.unity.com/t/c-coroutine-waitforseconds-garbage-collection-tip/526939)
- [Unity Mobile/XR/Web Performance Guide (Unity 6)](https://unity.com/resources/mobile-xr-web-game-performance-optimization-unity-6)

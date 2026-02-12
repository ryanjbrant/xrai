# Unity 6 Async/Await, Job System, and Reusable Code Patterns

> **Source**: Unity 6000.3 Official Documentation (6 Manual pages + 3 ScriptReference pages)
> **Last Updated**: 2026-02-12
> **Applies To**: Unity 6 (6000.x), C# 9+, Burst 1.8+
> **Purpose**: Actionable rules for AI agents writing Unity C# code

---

## Table of Contents

1. [Awaitable Async/Await Patterns](#1-awaitable-asyncawait-patterns)
2. [Job System Patterns](#2-job-system-patterns)
3. [Object Pooling and Reusable Code](#3-object-pooling-and-reusable-code)
4. [Decision Matrix: Which Pattern to Use](#4-decision-matrix)
5. [Anti-Patterns to Auto-Detect](#5-anti-patterns-to-auto-detect)

---

## 1. Awaitable Async/Await Patterns

### RULE: Prefer `async Awaitable` over `async void`

`async void` swallows exceptions. `async Awaitable` propagates them and integrates with Unity's lifecycle.

```csharp
// BAD: Exception vanishes silently
async void LoadData() {
    await Awaitable.NextFrameAsync();
    throw new Exception("Lost forever");
}

// GOOD: Exception propagates to caller
async Awaitable LoadData() {
    await Awaitable.NextFrameAsync();
    throw new Exception("Caller can catch this");
}
```

**Exception**: Unity event handlers (Button.onClick) require `async void`. In those cases, wrap the body in try/catch.

### RULE: Use `destroyCancellationToken` instead of manual CancellationTokenSource

Unity 6 MonoBehaviours expose `destroyCancellationToken` -- automatically cancelled when the object is destroyed. Eliminates manual token management.

```csharp
// BAD: Manual token management (error-prone, verbose)
CancellationTokenSource m_Cts = new();

void OnEnable() { m_Cts = new(); }
void OnDisable() { m_Cts.Cancel(); }
void OnDestroy() { m_Cts.Cancel(); m_Cts.Dispose(); }

async void DoWork() {
    await Awaitable.WaitForSecondsAsync(2f, m_Cts.Token);
}

// GOOD: Automatic lifecycle-bound cancellation (Unity 6)
async Awaitable DoWork() {
    await Awaitable.WaitForSecondsAsync(2f, destroyCancellationToken);
}
```

**CRITICAL**: Cache `destroyCancellationToken` before any operation that might destroy the object. Access after destruction throws.

```csharp
async Awaitable SafePattern() {
    var token = destroyCancellationToken; // Cache FIRST
    await Awaitable.BackgroundThreadAsync();
    token.ThrowIfCancellationRequested(); // Safe to use cached copy
    await Awaitable.MainThreadAsync();
}
```

### RULE: Never await an Awaitable instance more than once

Awaitable instances are **pooled**. After the first await completes, the instance returns to the pool. A second await causes undefined behavior (deadlock, exception, or wrong result).

```csharp
// BAD: Double await on same instance
var awaitable = Awaitable.NextFrameAsync();
await awaitable;
await awaitable; // UNDEFINED BEHAVIOR

// GOOD: Separate calls
await Awaitable.NextFrameAsync();
await Awaitable.NextFrameAsync();

// GOOD: If you need Task semantics (multiple consumers)
var task = Awaitable.NextFrameAsync().AsTask();
await task;
await task; // Safe -- Task is not pooled
```

Extension method for `.AsTask()`:
```csharp
public static class AwaitableExtensions {
    public static async Task AsTask(this Awaitable a) { await a; }
    public static async Task<T> AsTask<T>(this Awaitable<T> a) { return await a; }
}
```

### RULE: Use Awaitable static methods for frame/time/thread scheduling

| Method | Resumes When | Thread |
|--------|-------------|--------|
| `NextFrameAsync()` | Next frame's Update | Main |
| `EndOfFrameAsync()` | After all subsystems complete this frame | Main |
| `FixedUpdateAsync()` | Next FixedUpdate | Main |
| `WaitForSecondsAsync(float)` | After N seconds (scaled time) | Main |
| `BackgroundThreadAsync()` | Immediately on ThreadPool | Background |
| `MainThreadAsync()` | Immediately on main thread | Main |
| `FromAsyncOperation(op)` | When AsyncOperation completes | Main |

### RULE: Thread switching pattern for CPU-heavy work

```csharp
async Awaitable ProcessMeshData(Mesh.MeshDataArray meshData) {
    var token = destroyCancellationToken;

    // Switch to background for CPU work
    await Awaitable.BackgroundThreadAsync();
    token.ThrowIfCancellationRequested();

    var result = HeavyComputation(meshData); // Off main thread

    // Switch back to main thread for Unity API calls
    await Awaitable.MainThreadAsync();
    token.ThrowIfCancellationRequested();

    GetComponent<MeshFilter>().mesh = result; // Safe: main thread
}
```

### RULE: Job scheduling with Awaitable (schedule end-of-frame, complete next frame)

```csharp
async Awaitable SampleSchedulingJobsForNextFrame() {
    await Awaitable.EndOfFrameAsync();          // Wait for frame end
    var jobHandle = ScheduleSomethingWithJobSystem();
    await Awaitable.NextFrameAsync();           // Wait for next frame
    jobHandle.Complete();                        // Results ready
}
```

### RULE: Condition waiting with cancellation

```csharp
public static async Awaitable WaitUntil(Func<bool> condition,
    CancellationToken ct = default)
{
    while (!condition()) {
        ct.ThrowIfCancellationRequested();
        await Awaitable.NextFrameAsync();
    }
}

// Usage:
await WaitUntil(() => ARSession.state >= ARSessionState.SessionTracking,
    destroyCancellationToken);
```

### RULE: Async resource loading

```csharp
async Awaitable<Texture2D> LoadTextureAsync() {
    var op = Resources.LoadAsync<Texture2D>("my-texture");
    await op;
    return op.asset as Texture2D;
}
```

### RULE: Composing different async types

```csharp
async Awaitable Bar() {
    await CallSomeThirdPartyAPIReturningDotnetTask(); // .NET Task
    await Awaitable.NextFrameAsync();                  // Unity Awaitable
    await SceneManager.LoadSceneAsync("my-scene");     // AsyncOperation
    await SomeUserCodeReturningAwaitable();            // Custom Awaitable
}
```

### RULE: AwaitableCompletionSource for manual completion control

```csharp
AwaitableCompletionSource _completionSource = new();

// Expose awaitable to callers
public Awaitable WaitForCustomEvent() => _completionSource.Awaitable;

// Complete from event handler
void OnSomeEvent(Result r) {
    _completionSource.SetResult();
    // Or: _completionSource.SetException(ex);
    // Or: _completionSource.SetCanceled();
}

// Reset for reuse
void StartNewWait() {
    _completionSource.Reset(); // Creates fresh Awaitable
}
```

### RULE: Async in Unity Tests

```csharp
[UnityTest]
public IEnumerator SomeAsyncTest() {
    async Awaitable TestImplementation() {
        // async/await test logic here
        await Awaitable.NextFrameAsync();
        Assert.IsTrue(someCondition);
    }
    return TestImplementation(); // Return as IEnumerator
}
```

### Performance Note

Awaitable continuations are **synchronous** (same frame), unlike Task (which defers to next synchronization context pump). This is faster for single-await scenarios but means many concurrent Awaitables can stall the frame. For massive parallelism, prefer Jobs.

---

## 2. Job System Patterns

### RULE: Job struct must implement IJob and contain only blittable/NativeContainer fields

```csharp
public struct MyJob : IJob {
    public float a;
    public float b;
    public NativeArray<float> result; // Output via NativeContainer

    public void Execute() {
        result[0] = a + b;
    }
}
```

**No managed types** (string, class references, arrays) in job structs. Use `NativeArray<T>`, `NativeList<T>`, `NativeHashMap<TKey, TValue>`.

### RULE: Schedule in Update, Complete in LateUpdate

```csharp
public class MyScheduledJob : MonoBehaviour {
    NativeArray<float> result;
    JobHandle handle;

    void Update() {
        result = new NativeArray<float>(1, Allocator.TempJob);
        var job = new MyJob { a = 10, b = 10, result = result };
        handle = job.Schedule();
    }

    void LateUpdate() {
        handle.Complete();  // Block until done
        float value = result[0]; // Safe to read now
        result.Dispose();   // MUST dispose TempJob within 4 frames
    }
}
```

### RULE: Use .Run() for debugging, .Schedule() for production

```csharp
// Debug: runs synchronously on main thread
jobData.Run();

// Production: runs on worker thread
JobHandle handle = jobData.Schedule();
handle.Complete(); // Wait for result
```

### RULE: NativeContainer allocator selection

| Allocator | Lifetime | Speed | Use Case |
|-----------|----------|-------|----------|
| `Temp` | 1 frame max | Fastest | Cannot pass to jobs |
| `TempJob` | 4 frames max | Fast | **Default for jobs** |
| `Persistent` | Unlimited | Slowest (malloc) | Long-lived data, Dispose in OnDestroy |

```csharp
// Per-frame job data
var temp = new NativeArray<float>(100, Allocator.TempJob);

// Long-lived data (cache across frames)
NativeArray<float> persistent;
void Awake() { persistent = new NativeArray<float>(100, Allocator.Persistent); }
void OnDestroy() { if (persistent.IsCreated) persistent.Dispose(); }
```

### RULE: Mark read-only arrays with [ReadOnly] for parallel safety

```csharp
public struct MyParallelJob : IJobParallelFor {
    [ReadOnly] public NativeArray<float> input;  // Multiple jobs can read
    public NativeArray<float> output;             // Only this job writes

    public void Execute(int index) {
        output[index] = input[index] * 2f;
    }
}
```

### RULE: IJobParallelFor scheduling with batch size tuning

```csharp
var job = new MyParallelJob {
    input = inputArray,
    output = outputArray
};

// Schedule(arrayLength, innerLoopBatchCount)
// Start with batchCount=1, increase until perf plateaus
JobHandle handle = job.Schedule(inputArray.Length, 64);
handle.Complete();
```

**Batch size guidance**: Start at 1, increase until no more performance gains. Lower = better distribution but more overhead. Work stealing handles uneven loads.

### RULE: Chain job dependencies via JobHandle

```csharp
// Job B depends on Job A
JobHandle handleA = jobA.Schedule();
JobHandle handleB = jobB.Schedule(handleA); // Waits for A

// Multiple dependencies
var handles = new NativeArray<JobHandle>(2, Allocator.TempJob);
handles[0] = jobA.Schedule();
handles[1] = jobB.Schedule();
JobHandle combined = JobHandle.CombineDependencies(handles);
JobHandle handleC = jobC.Schedule(combined);
handles.Dispose();

handleC.Complete(); // Completes entire chain
```

### RULE: NativeContainer mutation requires copy-modify-write

```csharp
// BAD: Direct mutation not supported
myArray[0].value++; // Won't compile or won't persist

// GOOD: Copy, modify, write back
var temp = myArray[i];
temp.value = newValue;
myArray[i] = temp;
```

### RULE: Safety system prevents data races at runtime

The job safety system will throw exceptions if you:
- Access a NativeContainer on main thread while a job is using it
- Write to the same NativeContainer from two concurrent jobs
- Forget to call `.Complete()` before reading results
- Forget to call `.Dispose()` on NativeContainers

### RULE: Always Dispose NativeContainers

```csharp
// In same frame (TempJob)
void LateUpdate() {
    handle.Complete();
    result.Dispose(); // REQUIRED
}

// Long-lived (Persistent)
void OnDestroy() {
    if (persistentArray.IsCreated) {
        persistentArray.Dispose();
    }
}
```

---

## 3. Object Pooling and Reusable Code

### RULE: Use ObjectPool<T> for frequently spawned/destroyed GameObjects

```csharp
using UnityEngine.Pool;

public class ProjectileSpawner : MonoBehaviour {
    [SerializeField] GameObject prefab;
    ObjectPool<GameObject> pool;

    void Awake() {
        pool = new ObjectPool<GameObject>(
            createFunc: () => Instantiate(prefab),
            actionOnGet: obj => {
                obj.SetActive(true);
                obj.transform.SetParent(null);
            },
            actionOnRelease: obj => {
                obj.SetActive(false);          // Stop Update calls
                obj.transform.SetParent(transform); // Reparent to pool
                var rb = obj.GetComponent<Rigidbody>();
                if (rb != null) {
                    rb.linearVelocity = Vector3.zero;  // Reset physics
                    rb.angularVelocity = Vector3.zero;
                }
            },
            actionOnDestroy: obj => Destroy(obj),
            collectionCheck: true,  // Catches double-release bugs
            defaultCapacity: 20,
            maxSize: 100
        );
    }

    public GameObject Spawn(Vector3 pos, Quaternion rot) {
        var obj = pool.Get();
        obj.transform.SetPositionAndRotation(pos, rot);
        return obj;
    }

    public void Despawn(GameObject obj) => pool.Release(obj);
}
```

### RULE: Reset ALL state in actionOnRelease

Objects accumulate state during use. The release callback MUST reset:
- Physics (velocity, angular velocity, forces)
- Animations (stop/rewind)
- Particle systems (stop/clear)
- Coroutines (StopAllCoroutines)
- Event subscriptions (unsubscribe)
- Active state (SetActive(false) to prevent Update calls)
- Transform parent (reparent to pool container)

### RULE: Use PooledObject<T> for scoped auto-release

```csharp
// Auto-releases when disposed (great for temporary usage)
using (pool.Get(out var obj)) {
    // Use obj...
} // Automatically calls pool.Release(obj)
```

### RULE: Reuse collections instead of reallocating

```csharp
// BAD: Allocates every frame, creates GC pressure
void Update() {
    var neighbors = new List<float>(); // GC allocation
    FindNeighbors(neighbors);
}

// GOOD: Declare as field, Clear() each frame
List<float> m_Neighbors = new List<float>();

void Update() {
    m_Neighbors.Clear(); // Reuse allocated memory
    FindNeighbors(m_Neighbors);
}
```

### RULE: Use CollectionPool for temporary collection needs

```csharp
using UnityEngine.Pool;

void ProcessData() {
    // Borrow a list from the pool
    var list = ListPool<int>.Get();
    try {
        list.Add(1);
        list.Add(2);
        // process...
    } finally {
        ListPool<int>.Release(list); // Return to pool
    }
}

// Also available: HashSetPool<T>, DictionaryPool<TKey, TValue>
```

### RULE: Handle scene transitions with pools

```csharp
void OnEnable() {
    SceneManager.activeSceneChanged += OnSceneChanged;
}

void OnDisable() {
    SceneManager.activeSceneChanged -= OnSceneChanged;
}

void OnSceneChanged(Scene from, Scene to) {
    pool.Clear(); // Destroy all inactive pooled objects
}

// For persistent pools:
void Awake() {
    DontDestroyOnLoad(gameObject);
}
```

### RULE: UnityEngine.Pool is NOT thread-safe

All `ObjectPool<T>`, `ListPool<T>`, `HashSetPool<T>`, `DictionaryPool<TKey, TValue>` calls MUST happen on the main thread. Never call Get/Release from a job or background thread.

### RULE: Cache GetComponent results

```csharp
// BAD: GetComponent every frame
void Update() {
    GetComponent<Rigidbody>().AddForce(Vector3.up); // Slow
}

// GOOD: Cache in Awake
Rigidbody m_Rb;
void Awake() {
    m_Rb = GetComponent<Rigidbody>();
}
void Update() {
    m_Rb.AddForce(Vector3.up); // Fast
}

// SAFE: Null-safe with TryGetComponent
void Awake() {
    if (!TryGetComponent(out m_Rb)) {
        Debug.LogWarning($"Missing Rigidbody on {name}");
    }
}
```

---

## 4. Decision Matrix

| Scenario | Use | Why |
|----------|-----|-----|
| Wait N seconds | `Awaitable.WaitForSecondsAsync()` | Cleaner than coroutine, cancellable |
| Wait for condition | `WaitUntil()` helper with Awaitable | No allocation per frame |
| CPU-heavy computation (data-parallel) | `IJobParallelFor` | Multi-core, Burst-compatible |
| CPU-heavy computation (single task) | `IJob` or `BackgroundThreadAsync()` | Jobs for Burst; Awaitable for managed code |
| HTTP request / file I/O | `async Awaitable` with `BackgroundThreadAsync()` | Non-blocking, lifecycle-aware |
| Spawn/despawn bullets, particles | `ObjectPool<T>` | Zero GC allocation |
| Temporary list for frame computation | `ListPool<T>.Get()` / `.Release()` | Avoids per-frame allocation |
| Multiple async consumers on same result | Convert to Task via `.AsTask()` | Awaitable is single-await only |
| Custom async event | `AwaitableCompletionSource` | Manual completion control |
| Scene loading | `await SceneManager.LoadSceneAsync()` | Direct await on AsyncOperation |
| Asset loading | `await Resources.LoadAsync()` | Or Addressables equivalent |

---

## 5. Anti-Patterns to Auto-Detect

When reviewing or writing Unity C# code, flag these patterns:

| Anti-Pattern | Fix |
|-------------|-----|
| `async void Method()` on MonoBehaviour | Change to `async Awaitable Method()` |
| `new CancellationTokenSource()` + manual Cancel/Dispose | Use `destroyCancellationToken` |
| `await awaitable; await awaitable;` (same instance) | Two separate `Awaitable.XxxAsync()` calls |
| `new List<T>()` inside Update/FixedUpdate | Declare as field, call `.Clear()` |
| `GetComponent<T>()` inside Update | Cache in `Awake()` |
| `FindObjectOfType<T>()` per frame | `FindAnyObjectByType<T>()` cached in field |
| NativeArray without `.Dispose()` | Add Dispose in LateUpdate or OnDestroy |
| NativeArray with wrong Allocator | Temp=1frame, TempJob=4frames, Persistent=manual |
| Job writing to NativeArray without [ReadOnly] on inputs | Add `[ReadOnly]` to input arrays |
| `Instantiate()`/`Destroy()` in hot path | Use `ObjectPool<T>` |
| Pool.Get()/Release() from background thread | Move to main thread (pools are not thread-safe) |
| `while(!condition) {}` blocking loop | Use `WaitUntil()` with `NextFrameAsync()` |
| Missing `handle.Complete()` before reading job results | Always Complete before accessing NativeContainer |
| `string + string` in hot path | Use `StringBuilder` or `string.Format` cached |

---

## Quick Reference: Awaitable API

```
Awaitable.NextFrameAsync(CancellationToken)      -- Resume next Update
Awaitable.EndOfFrameAsync(CancellationToken)      -- Resume end of current frame
Awaitable.FixedUpdateAsync(CancellationToken)     -- Resume next FixedUpdate
Awaitable.WaitForSecondsAsync(float, CancellationToken) -- Resume after delay
Awaitable.BackgroundThreadAsync()                 -- Switch to ThreadPool
Awaitable.MainThreadAsync()                       -- Switch to main thread
Awaitable.FromAsyncOperation(AsyncOperation)      -- Wrap legacy AsyncOperation
awaitable.Cancel()                                -- Cancel and throw OperationCanceledException
awaitable.IsCompleted                             -- Check completion status
```

## Quick Reference: Job Types

```
IJob                    -- Single task on worker thread
IJobParallelFor         -- Parallel over array indices
IJobParallelForTransform -- Parallel over Transform access
IJobFor                 -- Same as ParallelFor but allows non-parallel schedule
```

## Quick Reference: NativeContainer Safety

```
[ReadOnly]     -- Allow concurrent reads from multiple jobs
[WriteOnly]    -- Optimize for write-only access
Allocator.Temp       -- 1 frame, cannot pass to jobs
Allocator.TempJob    -- 4 frames, standard for jobs
Allocator.Persistent -- Manual lifetime, use OnDestroy Dispose
```

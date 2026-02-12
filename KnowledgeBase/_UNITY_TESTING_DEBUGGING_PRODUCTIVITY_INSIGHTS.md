# Unity Testing, Debugging & Productivity Insights (Unity 6)

> **Sources:**
> - "Use a C# style guide for clean and scalable game code - Unity 6 edition" (Unity Technologies, 2025)
> - "Tips to increase productivity with Unity 6" (Unity Technologies, 2025)
>
> **Last Updated:** 2026-02-12
> **Applicable To:** Unity 6 (6000.x), C# 9+

---

## Debug Toolkit (Auto-Apply)

### 1. Debug.Break() -- Pause Editor on condition
Use to freeze the Editor when a rare condition occurs so you can inspect the scene/state.
```csharp
void Update()
{
    if (health <= 0)
    {
        Debug.Break(); // Pauses Editor -- inspect variables in Inspector
    }
}
```
**Agent rule:** When debugging intermittent issues in Play Mode, insert `Debug.Break()` at the suspect callsite. Remove before commit.

### 2. Debug.Assert() -- Fail-fast on invariant violations
Fires only in the Editor and Development Builds. Stripped from release builds automatically.
```csharp
void ApplyDamage(int damage)
{
    Debug.Assert(damage > 0, "Damage must be positive!");
    Debug.Assert(health > 0, "Cannot damage a dead entity!");
    health -= damage;
}
```
**Agent rule:** Add `Debug.Assert()` for every method precondition during development. Zero runtime cost in release.

### 3. Debug.Log with context object -- Click-to-select in Hierarchy
Pass a second argument to `Debug.Log` to make the Console entry clickable, highlighting the object.
```csharp
Debug.Log("Player hit obstacle", gameObject); // clicking log entry selects this GameObject
Debug.LogWarning("Low health!", gameObject);
Debug.LogError("Null reference on weapon slot", this);
```
**Agent rule:** ALWAYS pass `this` or `gameObject` as the context parameter to Debug.Log/Warning/Error. Makes debugging 10x faster.

### 4. Rich text in Debug.Log -- Visual categorization
```csharp
Debug.Log("<color=red><b>CRITICAL:</b></color> Spawner pool exhausted");
Debug.Log("<color=yellow>WARNING:</color> Frame budget exceeded");
Debug.Log("<color=cyan>[Network]</color> Packet received from server");
Debug.Log("<size=14><b>MILESTONE:</b></size> Level loading complete");
```
**Agent rule:** Use color coding for severity. Enable "Rich Text" on Console window toolbar if not showing.

### 5. Debug.DrawRay / Debug.DrawLine -- Raycast visualization
```csharp
void FixedUpdate()
{
    Vector3 origin = transform.position;
    Vector3 direction = transform.forward * maxDistance;

    Debug.DrawRay(origin, direction, Color.red, duration: 1f);

    if (Physics.Raycast(origin, transform.forward, out RaycastHit hit, maxDistance))
    {
        // Draw green line to hit point
        Debug.DrawLine(origin, hit.point, Color.green, duration: 0.5f);
    }
}
```
**Agent rule:** Add `Debug.DrawRay` alongside every `Physics.Raycast` during development. Visible only in Scene view.

### 6. Debug.isDebugBuild -- Runtime build-type check
```csharp
void Start()
{
    if (Debug.isDebugBuild)
    {
        // Show debug overlay, FPS counter, etc.
        debugCanvas.SetActive(true);
    }
}
```
**Agent rule:** Use for runtime-only debug features that should be present in Development Builds but not Release.

### 7. Application.SetStackTraceLogType -- Control log verbosity
```csharp
// In a bootstrap/init script:
void Awake()
{
    // Full stack traces only for errors
    Application.SetStackTraceLogType(LogType.Log, StackTraceLogType.None);
    Application.SetStackTraceLogType(LogType.Warning, StackTraceLogType.None);
    Application.SetStackTraceLogType(LogType.Error, StackTraceLogType.Full);
}
```
**Agent rule:** Disable stack traces for Log/Warning in performance-sensitive builds. Stack trace generation is expensive.

### 8. Custom log wrapper with channels
```csharp
public static class GameLog
{
    [System.Diagnostics.Conditional("ENABLE_LOG_NETWORK")]
    public static void Network(string msg, Object ctx = null)
        => Debug.Log($"<color=cyan>[NET]</color> {msg}", ctx);

    [System.Diagnostics.Conditional("ENABLE_LOG_AI")]
    public static void AI(string msg, Object ctx = null)
        => Debug.Log($"<color=magenta>[AI]</color> {msg}", ctx);

    [System.Diagnostics.Conditional("ENABLE_LOG_GAMEPLAY")]
    public static void Gameplay(string msg, Object ctx = null)
        => Debug.Log($"<color=green>[PLAY]</color> {msg}", ctx);
}
```
**Agent rule:** Use `[Conditional]` attribute with custom defines to create zero-cost log channels. Define symbols in Player Settings only when needed.

---

## Strip Debug.Log for Builds

### Method 1: Conditional attribute (RECOMMENDED)
```csharp
using System.Diagnostics;
using UnityEngine;

public static class DebugHelper
{
    [Conditional("UNITY_EDITOR"), Conditional("DEVELOPMENT_BUILD")]
    public static void Log(string message, Object context = null)
    {
        UnityEngine.Debug.Log(message, context);
    }

    [Conditional("UNITY_EDITOR"), Conditional("DEVELOPMENT_BUILD")]
    public static void LogWarning(string message, Object context = null)
    {
        UnityEngine.Debug.LogWarning(message, context);
    }

    // LogError is NOT conditional -- always report errors
    public static void LogError(string message, Object context = null)
    {
        UnityEngine.Debug.LogError(message, context);
    }
}
```
**Agent rule:** Replace all `Debug.Log()` calls with `DebugHelper.Log()`. The `[Conditional]` attribute causes the **entire call** (including string concatenation arguments) to be stripped by the compiler when the symbol is undefined. This is superior to `#if` because calling code stays clean.

### Method 2: Preprocessor directives (use sparingly)
```csharp
#if UNITY_EDITOR || DEVELOPMENT_BUILD
    Debug.Log($"Expensive debug info: {ComputeDebugState()}");
#endif
```
**Agent rule:** Only use `#if` when you need to strip the **surrounding logic** (not just the log call). For log-only stripping, prefer `[Conditional]`.

### Method 3: Project Settings > Player > Stack Trace
Set Log and Warning stack trace types to "None" in Player Settings for release builds to reduce log overhead even if some logs slip through.

---

## Speed Up Enter Play Mode

### Enter Play Mode Settings (CRITICAL for iteration speed)
**Location:** Edit > Project Settings > Editor > Enter Play Mode Settings

```
[x] Enter Play Mode Settings (enable this checkbox)
    [ ] Reload Domain (UNCHECK for fastest iteration)
    [ ] Reload Scene (UNCHECK for fastest iteration)
```

**Impact:** Disabling Domain Reload can reduce Enter Play Mode from 5-30 seconds to under 1 second.

### REQUIRED code changes when Domain Reload is disabled
Static fields retain values between Play Mode sessions. You MUST reset them manually:
```csharp
public class GameManager : MonoBehaviour
{
    private static GameManager _instance;
    private static int _score;
    private static bool _isInitialized;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    static void ResetStatics()
    {
        _instance = null;
        _score = 0;
        _isInitialized = false;
    }
}
```

**Agent rule:** When Domain Reload is disabled:
1. Every class with `static` fields MUST have a `[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]` reset method
2. Every `static event` MUST be unsubscribed or nulled in the reset method
3. Search the codebase with `rg "static " --type cs` to audit all statics
4. Singletons MUST null their `_instance` in the reset method

### Additional speed tips
- **Additive scene loading:** Load small test scenes additively instead of reloading the full game scene
- **Disable Auto-Refresh:** Edit > Preferences > Asset Pipeline > Auto Refresh = off. Manually refresh with Ctrl+R/Cmd+R only when ready
- **Burst Compilation:** Disable in Editor if not testing Burst-specific code (Jobs > Burst > Enable Compilation)

---

## Awaitable Pattern (Unity 6)

Unity 6 introduces `Awaitable` as a first-class replacement for coroutines. It integrates with C# `async/await` and avoids the garbage allocation of coroutines.

### Basic pattern -- replacing coroutines
```csharp
// OLD: Coroutine (allocates enumerator, no return value, no try/catch)
IEnumerator OldWay()
{
    yield return new WaitForSeconds(2f);
    Debug.Log("Done");
}

// NEW: Awaitable (zero-alloc, supports try/catch, return values)
async Awaitable NewWay()
{
    await Awaitable.WaitForSecondsAsync(2f);
    Debug.Log("Done");
}
```

### Thread switching (POWERFUL for compute-heavy work)
```csharp
async Awaitable LoadAndProcessData()
{
    // Switch to background thread for heavy computation
    await Awaitable.BackgroundThreadAsync();
    var data = ProcessExpensiveData(); // runs off main thread

    // Switch back to main thread for Unity API calls
    await Awaitable.MainThreadAsync();
    ApplyToGameObjects(data); // safe to call Unity APIs
}
```

### Awaitable with return values
```csharp
async Awaitable<int> CalculateScoreAsync()
{
    await Awaitable.WaitForSecondsAsync(1f);
    return ComputeScore();
}

// Usage:
int score = await CalculateScoreAsync();
```

### Key Awaitable static methods
| Method | Purpose |
|--------|---------|
| `Awaitable.WaitForSecondsAsync(float)` | Replaces `WaitForSeconds` |
| `Awaitable.NextFrameAsync()` | Replaces `yield return null` |
| `Awaitable.EndOfFrameAsync()` | Replaces `WaitForEndOfFrame` |
| `Awaitable.FixedUpdateAsync()` | Replaces `WaitForFixedUpdate` |
| `Awaitable.BackgroundThreadAsync()` | Switch to thread pool |
| `Awaitable.MainThreadAsync()` | Switch back to main thread |
| `Awaitable.FromAsyncOperation(op)` | Wrap legacy AsyncOperation |

**Agent rule:** Prefer `Awaitable` over coroutines for all new async code in Unity 6. Key advantages:
- Supports `try/catch/finally` (coroutines cannot catch exceptions)
- Supports return values
- Can switch threads without `UnityMainThreadDispatcher`
- Pooled internally (low GC pressure)

---

## Script Templates

### Customize the default MonoBehaviour template
**Location:** Create a file at:
```
Assets/ScriptTemplates/81-C# Script-NewBehaviourScript.cs.txt
```

### Recommended clean template (eliminates empty Start/Update)
```csharp
using UnityEngine;

namespace #ROOTNAMESPACE#
{
    /// <summary>
    /// TODO: Add class description.
    /// </summary>
    public class #SCRIPTNAME# : MonoBehaviour
    {
        #NOTRIM#
    }
}
```

### Additional useful templates
Create alongside the default:
```
Assets/ScriptTemplates/
  81-C# Script-NewBehaviourScript.cs.txt
  82-C# ScriptableObject-NewScriptableObject.cs.txt
  83-C# Interface-INewInterface.cs.txt
  84-C# Struct-NewStruct.cs.txt
  85-C# Enum-NewEnum.cs.txt
```

**ScriptableObject template** (`82-C# ScriptableObject-NewScriptableObject.cs.txt`):
```csharp
using UnityEngine;

namespace #ROOTNAMESPACE#
{
    [CreateAssetMenu(fileName = "#SCRIPTNAME#", menuName = "Data/#SCRIPTNAME#")]
    public class #SCRIPTNAME# : ScriptableObject
    {
        #NOTRIM#
    }
}
```

**Agent rule:** The default Unity template includes empty `Start()` and `Update()` methods. Empty `Update()` still costs ~0.2us per frame per instance (Unity calls it via native interop even if empty). The clean template above eliminates this. Only add `Update()` when actually needed.

### Template keywords
| Keyword | Replacement |
|---------|-------------|
| `#SCRIPTNAME#` | Filename without extension |
| `#ROOTNAMESPACE#` | Root namespace from Project Settings |
| `#NOTRIM#` | Prevents Unity from trimming empty lines |

---

## Assembly Definition Best Practices

### Why use Assembly Definitions (.asmdef)
Without asmdef files, Unity recompiles ALL scripts whenever ANY script changes. With asmdef, Unity only recompiles the assembly that changed and its dependents.

### Recommended project structure
```
Assets/
  Scripts/
    Core/           Core.asmdef          (no dependencies)
    Utilities/      Utilities.asmdef     (depends on: Core)
    Gameplay/       Gameplay.asmdef      (depends on: Core, Utilities)
    UI/             UI.asmdef            (depends on: Core)
    Editor/         Editor.asmdef        (Editor-only, depends on: Core, Gameplay)
    Tests/
      EditMode/     Tests.EditMode.asmdef (test assembly, Editor platform only)
      PlayMode/     Tests.PlayMode.asmdef (test assembly, Editor + Player)
```

### Key settings in .asmdef Inspector
```json
{
    "name": "MyGame.Core",
    "rootNamespace": "MyGame.Core",
    "references": [],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": [],
    "noEngineReferences": false
}
```

### Test assembly definition requirements
```json
{
    "name": "MyGame.Tests.EditMode",
    "references": [
        "UnityEngine.TestRunner",
        "UnityEditor.TestRunner",
        "MyGame.Core",
        "MyGame.Gameplay"
    ],
    "optionalUnityReferences": [
        "TestAssemblies"
    ],
    "includePlatforms": ["Editor"],
    "overrideReferences": true,
    "precompiledReferences": [
        "nunit.framework.dll"
    ]
}
```

**Agent rule:** Every new folder of scripts should get an .asmdef file. The compilation speedup is proportional to how well-isolated your assemblies are. A change in `UI/` should NOT trigger recompilation of `Gameplay/` unless UI depends on Gameplay (it usually should not).

**Measured impact:** Projects with 5+ asmdef files typically see 50-80% reduction in incremental compile time.

---

## ScriptableObject Patterns

### Pattern 1: Runtime configuration (data separation)
```csharp
[CreateAssetMenu(fileName = "EnemyConfig", menuName = "Config/Enemy")]
public class EnemyConfig : ScriptableObject
{
    [Header("Stats")]
    public float maxHealth = 100f;
    public float moveSpeed = 5f;
    public float attackDamage = 10f;

    [Header("Visual")]
    public Color tintColor = Color.red;
    public GameObject deathVFXPrefab;
}

// Usage in MonoBehaviour:
public class Enemy : MonoBehaviour
{
    [SerializeField] private EnemyConfig _config;

    void Start()
    {
        _health = _config.maxHealth;
        _renderer.material.color = _config.tintColor;
    }
}
```
**Benefit:** Designers tweak ScriptableObject assets without touching code. Multiple enemy types share the same script with different configs.

### Pattern 2: Event channel (decoupled communication)
```csharp
[CreateAssetMenu(menuName = "Events/Void Event")]
public class VoidEventChannel : ScriptableObject
{
    private System.Action _onEvent;

    public void Register(System.Action listener) => _onEvent += listener;
    public void Unregister(System.Action listener) => _onEvent -= listener;
    public void Raise() => _onEvent?.Invoke();
}

[CreateAssetMenu(menuName = "Events/Int Event")]
public class IntEventChannel : ScriptableObject
{
    private System.Action<int> _onEvent;

    public void Register(System.Action<int> listener) => _onEvent += listener;
    public void Unregister(System.Action<int> listener) => _onEvent -= listener;
    public void Raise(int value) => _onEvent?.Invoke(value);
}
```
**Benefit:** Decouples sender from receiver. No `FindObjectOfType`, no singleton references. Drag-and-drop wiring in Inspector.

### Pattern 3: Enum-like constants
```csharp
[CreateAssetMenu(menuName = "Data/Item Type")]
public class ItemType : ScriptableObject
{
    // Just the asset itself IS the identity -- compare by reference
}

// Usage: if (item.Type == swordType) where swordType is a serialized field
```

**Agent rule:** Use ScriptableObjects for:
1. Any data that varies between instances (configs, stats, difficulty levels)
2. Cross-system communication (event channels)
3. Anything a designer/non-programmer needs to tweak
4. Data that should persist across scenes without DontDestroyOnLoad

ScriptableObjects live as assets -- they survive scene loads and domain reloads. They do NOT need MonoBehaviour lifecycle methods.

---

## Object Pooling (Built-in UnityEngine.Pool)

Unity 6 includes `UnityEngine.Pool` -- no third-party pooling libraries needed.

### ObjectPool<T> -- General purpose
```csharp
using UnityEngine;
using UnityEngine.Pool;

public class ProjectileSpawner : MonoBehaviour
{
    [SerializeField] private Projectile _prefab;
    [SerializeField] private int _defaultCapacity = 20;
    [SerializeField] private int _maxSize = 100;

    private ObjectPool<Projectile> _pool;

    void Awake()
    {
        _pool = new ObjectPool<Projectile>(
            createFunc:      () => Instantiate(_prefab),
            actionOnGet:     (p) => p.gameObject.SetActive(true),
            actionOnRelease: (p) => p.gameObject.SetActive(false),
            actionOnDestroy: (p) => Destroy(p.gameObject),
            collectionCheck: true,       // debug: warn on double-release
            defaultCapacity: _defaultCapacity,
            maxSize:         _maxSize    // excess objects are Destroyed, not pooled
        );
    }

    public Projectile Spawn(Vector3 position, Quaternion rotation)
    {
        var p = _pool.Get();
        p.transform.SetPositionAndRotation(position, rotation);
        p.Initialize(_pool); // pass pool ref so projectile can release itself
        return p;
    }

    void OnDestroy()
    {
        _pool?.Dispose(); // cleanup all pooled objects
    }
}

// In the Projectile class:
public class Projectile : MonoBehaviour
{
    private IObjectPool<Projectile> _pool;

    public void Initialize(IObjectPool<Projectile> pool) => _pool = pool;

    void OnLifetimeExpired()
    {
        _pool.Release(this); // return to pool instead of Destroy
    }
}
```

### CollectionPool -- Pool collections to avoid GC
```csharp
using UnityEngine.Pool;

// Pool Lists, HashSets, Dictionaries to avoid per-frame allocation
var tempList = ListPool<RaycastHit>.Get();
try
{
    Physics.RaycastNonAlloc(ray, tempHits);
    // ... process hits into tempList
}
finally
{
    ListPool<RaycastHit>.Release(tempList);
}

// Or with using pattern:
using var pooledList = ListPool<int>.Get(out var myList);
myList.Add(42);
// auto-released when 'using' scope exits
```

**Agent rule:**
- Use `ObjectPool<T>` for GameObjects spawned/destroyed frequently (projectiles, VFX, enemies)
- Use `ListPool<T>` / `HashSetPool<T>` / `DictionaryPool<T,V>` for temporary collections in hot paths
- Set `collectionCheck: true` during development to catch double-release bugs
- Set `collectionCheck: false` in release for performance
- ALWAYS call `_pool.Dispose()` in `OnDestroy()` to prevent leaks

---

## Common Code Pitfalls (from Style Guide)

### 1. Empty Update() has a cost
```csharp
// BAD: Empty Update still costs ~0.2us per call per instance via native interop
void Update() { }

// GOOD: Remove Update entirely if not used. Use events or callbacks instead.
```

### 2. Don't duplicate logic -- duplicate code is acceptable if logic differs
```csharp
// BAD: Two methods with identical explosion logic
void PlayExplosionA() { /* particles + sound */ }
void PlayExplosionB() { /* same particles + sound */ }

// GOOD: Extract shared logic
void PlayFXWithSound(ParticleSystem particles, AudioClip clip, Vector3 position)
{
    particles.transform.position = position;
    particles.Play();
    AudioSource.PlayClipAtPoint(clip, position);
}
```
**Key insight:** "It's possible to duplicate code without violating DRY. It's more important that you don't duplicate logic."

### 3. Comments should explain "why" not "what"
```csharp
// BAD: Restates what the code does
int health = 100; // set health to 100

// GOOD: Explains why
int health = 100; // Must match server-authoritative starting value from GameConfig
```

### 4. Use XML documentation for public APIs
```csharp
/// <summary>
/// Applies damage to the entity, clamping health to [0, maxHealth].
/// </summary>
/// <param name="damage">Positive damage value. Negative values are ignored.</param>
/// <returns>True if the entity died from this damage.</returns>
public bool TakeDamage(float damage) { ... }
```

### 5. String operations in hot paths
```csharp
// BAD: Allocates new string every frame
void Update()
{
    scoreText.text = "Score: " + score.ToString();
}

// GOOD: Use StringBuilder or only update on change
private int _lastScore = -1;
void Update()
{
    if (score != _lastScore)
    {
        _lastScore = score;
        scoreText.text = $"Score: {score}";
    }
}
```

### 6. Camera.main is a FindGameObjectWithTag call
```csharp
// BAD: Calls FindGameObjectWithTag("MainCamera") every time
void Update()
{
    transform.LookAt(Camera.main.transform);
}

// GOOD: Cache in Awake
private Camera _mainCam;
void Awake() => _mainCam = Camera.main;
void Update() => transform.LookAt(_mainCam.transform);
```

---

## Test Framework Quick Patterns

### Project setup for Unity Test Framework
1. Install via Package Manager: `com.unity.test-framework`
2. Create test assemblies with .asmdef (see Assembly Definitions section above)
3. Open Test Runner: Window > General > Test Runner

### Edit Mode test (fast, no scene required)
```csharp
using NUnit.Framework;

namespace MyGame.Tests
{
    [TestFixture]
    public class HealthSystemTests
    {
        [Test]
        public void TakeDamage_ReducesHealth()
        {
            var health = new HealthComponent(100f);
            health.TakeDamage(25f);
            Assert.AreEqual(75f, health.Current, 0.01f);
        }

        [Test]
        public void TakeDamage_ClampsToZero()
        {
            var health = new HealthComponent(100f);
            health.TakeDamage(150f);
            Assert.AreEqual(0f, health.Current, 0.01f);
        }

        [Test]
        public void Heal_ClampsToMax()
        {
            var health = new HealthComponent(100f);
            health.TakeDamage(50f);
            health.Heal(999f);
            Assert.AreEqual(100f, health.Current, 0.01f);
        }
    }
}
```

### Play Mode test (requires scene, MonoBehaviour lifecycle)
```csharp
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace MyGame.Tests
{
    public class PlayerMovementTests
    {
        [UnityTest]
        public IEnumerator Player_MovesForward_WhenInputReceived()
        {
            var go = new GameObject("Player");
            var mover = go.AddComponent<PlayerMovement>();
            var startPos = go.transform.position;

            mover.SimulateInput(Vector3.forward);
            yield return new WaitForSeconds(0.5f);

            Assert.Greater(go.transform.position.z, startPos.z);
            Object.Destroy(go);
        }

        [UnityTest]
        public IEnumerator Spawner_CreatesObjects_AfterDelay()
        {
            var spawner = new GameObject("Spawner").AddComponent<EnemySpawner>();
            yield return new WaitForSeconds(spawner.SpawnDelay + 0.1f);

            Assert.IsNotNull(GameObject.FindWithTag("Enemy"));
            Object.Destroy(spawner.gameObject);
        }
    }
}
```

### Key test attributes
| Attribute | Purpose |
|-----------|---------|
| `[Test]` | Standard synchronous test (Edit Mode) |
| `[UnityTest]` | Coroutine-based test (Play Mode) |
| `[TestCase(1, 2, 3)]` | Parameterized test |
| `[SetUp]` / `[TearDown]` | Before/after each test |
| `[OneTimeSetUp]` / `[OneTimeTearDown]` | Before/after all tests in fixture |
| `[UnityPlatform(RuntimePlatform.IPhonePlayer)]` | Platform-specific test |
| `[Category("Smoke")]` | Categorize for selective runs |

### Test organization rules
```
Tests/
  EditMode/
    Tests.EditMode.asmdef       (Platform: Editor only)
    Core/
      HealthSystemTests.cs
      InventoryTests.cs
    Utilities/
      MathHelperTests.cs
  PlayMode/
    Tests.PlayMode.asmdef       (Platform: Editor + Player)
    Integration/
      SpawnerTests.cs
      PlayerMovementTests.cs
```

**Agent rule:**
- Edit Mode tests for pure logic (math, data, state machines). These are FAST.
- Play Mode tests for anything needing MonoBehaviour lifecycle, physics, or coroutines. These are SLOW.
- Aim for 80%+ Edit Mode tests. Refactor logic out of MonoBehaviours into plain C# classes to make them Edit Mode testable.
- Every public method should have at least one test. Prioritize methods with branching logic.

---

## Preprocessor Directives for Debug/Release

### Built-in Unity defines
| Directive | When defined |
|-----------|-------------|
| `UNITY_EDITOR` | Running in Unity Editor |
| `UNITY_EDITOR_WIN` / `UNITY_EDITOR_OSX` | Editor platform |
| `UNITY_IOS` | Building for iOS |
| `UNITY_ANDROID` | Building for Android |
| `UNITY_STANDALONE` | Building for desktop |
| `UNITY_WEBGL` | Building for WebGL |
| `DEVELOPMENT_BUILD` | Development Build checkbox enabled |
| `ENABLE_IL2CPP` | IL2CPP scripting backend |
| `ENABLE_MONO` | Mono scripting backend |
| `UNITY_2022_1_OR_NEWER` | Version checks |
| `UNITY_6000_0_OR_NEWER` | Unity 6 check |

### Custom defines -- Project Settings
**Location:** Edit > Project Settings > Player > Other Settings > Scripting Define Symbols

```
ENABLE_CHEATS;ENABLE_LOG_VERBOSE;ENABLE_DEBUG_OVERLAY
```

### Custom defines -- per Assembly Definition
Add `defineConstraints` in .asmdef to conditionally include entire assemblies:
```json
{
    "name": "MyGame.DebugTools",
    "defineConstraints": ["ENABLE_DEBUG_TOOLS"]
}
```
This assembly is only compiled when `ENABLE_DEBUG_TOOLS` is defined. Zero cost when undefined.

### Practical patterns
```csharp
// Feature flags
#if ENABLE_CHEATS
    public void GodMode() => _health = float.MaxValue;
#endif

// Editor-only validation
#if UNITY_EDITOR
    void OnValidate()
    {
        if (_config == null)
            Debug.LogError("Config is null!", this);
    }
#endif

// Platform-specific code
#if UNITY_IOS
    [DllImport("__Internal")]
    private static extern void NativeHapticFeedback();
#endif

// Stripping expensive debug code from release
#if UNITY_EDITOR || DEVELOPMENT_BUILD
    void OnGUI()
    {
        GUI.Label(new Rect(10, 10, 300, 20), $"FPS: {1f / Time.deltaTime:F0}");
    }
#endif
```

**Agent rule:**
- NEVER use `#if UNITY_EDITOR` around runtime logic. It will silently disappear in builds.
- Use `DEVELOPMENT_BUILD` for debug features that should exist in QA builds but not release.
- Use custom defines (`ENABLE_*`) for feature flags that can be toggled per-build.
- When changing Scripting Define Symbols, hash-check first to avoid recompile storms:
```csharp
// In an [InitializeOnLoad] class:
var current = PlayerSettings.GetScriptingDefineSymbols(targetGroup);
var desired = "MY_DEFINE";
if (!current.Contains(desired))
    PlayerSettings.SetScriptingDefineSymbols(targetGroup, current + ";" + desired);
```

---

## Profiling Tools Quick Reference

### Unity Profiler (built-in)
**Open:** Window > Analysis > Profiler (Ctrl+7 / Cmd+7)
- **CPU Usage:** Identify methods consuming the most time per frame
- **GPU Usage:** Identify rendering bottlenecks
- **Memory:** Track allocations, GC pressure
- **Rendering:** Draw calls, batches, triangles
- **Physics:** Collision checks, rigidbody count
- **Audio:** Source count, memory

### Profile Analyzer (package)
Install: `com.unity.performance.profile-analyzer`
- Compare two profiler captures side-by-side
- Statistical analysis of frame times (median, max, percentiles)
- Identify regression between builds

### Memory Profiler (package)
Install: `com.unity.memoryprofiler`
- Snapshot-based deep memory analysis
- Tree map visualization of memory consumers
- Compare snapshots to find leaks

### Profiler.BeginSample / EndSample -- Custom markers
```csharp
using UnityEngine.Profiling;

void ProcessEnemies()
{
    Profiler.BeginSample("ProcessEnemies");
    // ... expensive logic
    Profiler.EndSample();
}

// Or use the using pattern with ProfilerMarker (zero-alloc):
private static readonly ProfilerMarker s_ProcessMarker = new("ProcessEnemies");

void ProcessEnemies()
{
    using (s_ProcessMarker.Auto())
    {
        // ... expensive logic
    }
}
```

**Agent rule:** Use `ProfilerMarker` (not `Profiler.BeginSample`) for new code. It is zero-allocation and shows up in both Editor and Development Build profiling. Cache as `static readonly`.

---

## Animation Curves for Runtime Tweaking

Use `AnimationCurve` fields to give designers visual control over value-over-time relationships:
```csharp
public class Projectile : MonoBehaviour
{
    [SerializeField] private AnimationCurve _speedOverLifetime = AnimationCurve.Linear(0, 1, 1, 0);
    [SerializeField] private AnimationCurve _scaleOverLifetime = AnimationCurve.EaseInOut(0, 0.5f, 1, 2f);
    [SerializeField] private float _lifetime = 3f;

    private float _age;

    void Update()
    {
        _age += Time.deltaTime;
        float t = _age / _lifetime;

        float speed = _speedOverLifetime.Evaluate(t);
        transform.localScale = Vector3.one * _scaleOverLifetime.Evaluate(t);
        transform.Translate(Vector3.forward * speed * Time.deltaTime);
    }
}
```

**Agent rule:** Prefer `AnimationCurve` over `Mathf.Lerp` / easing functions whenever the curve shape might need design iteration. The Inspector curve editor is powerful and requires zero code changes to tweak.

---

## Custom Editor Windows and Inspectors

### Quick custom Inspector button
```csharp
#if UNITY_EDITOR
using UnityEditor;

[CustomEditor(typeof(EnemySpawner))]
public class EnemySpawnerEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();

        var spawner = (EnemySpawner)target;
        if (GUILayout.Button("Spawn Test Wave"))
            spawner.SpawnWave();
        if (GUILayout.Button("Clear All Enemies"))
            spawner.ClearAll();
    }
}
#endif
```

### Custom menu items
```csharp
#if UNITY_EDITOR
using UnityEditor;

public static class DevTools
{
    [MenuItem("Tools/Reset Player Prefs")]
    static void ResetPrefs()
    {
        PlayerPrefs.DeleteAll();
        Debug.Log("PlayerPrefs cleared.");
    }

    [MenuItem("Tools/Spawn 100 Test Enemies")]
    static void SpawnTestEnemies()
    {
        // ... spawn logic
    }

    // Keyboard shortcut: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
    [MenuItem("Tools/Quick Reload Scene %#r")]
    static void ReloadScene()
    {
        var scene = UnityEngine.SceneManagement.SceneManager.GetActiveScene();
        UnityEditor.SceneManagement.EditorSceneManager.OpenScene(scene.path);
    }
}
#endif
```

**Agent rule:** Use `[MenuItem]` for any action you repeat more than 3 times during development. The shortcut syntax: `%` = Ctrl/Cmd, `#` = Shift, `&` = Alt.

---

## Cross-Reference: Portals Project Applicability

| Insight | Portals Relevance | Priority |
|---------|-------------------|----------|
| Debug.Log context param | All bridge/router logging | HIGH -- add `this` to all Debug.Log calls |
| Awaitable thread switching | Gemini API calls, asset loading | HIGH -- replace coroutines |
| ObjectPool | VFX spawning, projectiles | MEDIUM -- SceneComposer object lifecycle |
| Assembly Definitions | Compile time reduction | HIGH -- currently single-assembly |
| Enter Play Mode Settings | Iteration speed | HIGH -- immediate win |
| Script Templates | New script creation | LOW -- one-time setup |
| [Conditional] log stripping | Release builds | HIGH -- Debug.Log in production |
| ScriptableObject events | Bridge decoupling | MEDIUM -- alternative to current event bus |
| ProfilerMarker | Performance monitoring | MEDIUM -- PerformanceMonitor.cs integration |
| Debug.Assert | BridgeRouter preconditions | HIGH -- catch null payloads early |

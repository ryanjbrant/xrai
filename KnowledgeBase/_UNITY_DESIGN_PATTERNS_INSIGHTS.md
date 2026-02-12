# Unity Design Patterns Reference (Portals-Applicable)

> Source: "Level Up Your Code with Game Programming Patterns" (Unity e-book, 6th edition)
> Extracted: 2026-02-12 | Mapped to: Portals V4 codebase
> Purpose: AI code review checklist + refactoring reference

---

## Table of Contents
1. [SOLID Quick Checks](#solid-quick-checks-for-ai-code-review)
2. [Command Pattern (Undo System)](#command-pattern-undo-system)
3. [Observer Pattern (Bridge Events)](#observer-pattern-bridge-events)
4. [Object Pool (VFX/Spawning)](#object-pool-vfxobject-spawning)
5. [Factory Pattern (Scene Object Creation)](#factory-pattern-scene-object-creation)
6. [Singleton (Service Locator)](#singleton-service-locator)
7. [State Pattern (UI Modes)](#state-pattern-ui-modes--tool-states)
8. [MVP Pattern (UI Separation)](#mvp-pattern-ui-separation)
9. [Anti-Patterns to Flag](#anti-patterns-to-flag)
10. [Portals-Specific Refactoring Opportunities](#portals-specific-refactoring-opportunities)

---

## SOLID Quick Checks (for AI Code Review)

### S - Single Responsibility Principle
**Rule:** A class should have only one reason to change.

**Violation detector (grep for):**
- Classes > 300 lines with mixed concerns
- MonoBehaviours that handle input + logic + rendering
- Methods named `HandleX` AND `RenderY` in the same class

**Fix pattern:** Extract responsibilities into separate classes. Compose via references.

```csharp
// BAD: One class does everything
public class UnrefactoredPlayer : MonoBehaviour {
    void Update() { HandleInput(); Move(); Animate(); PlayAudio(); }
}

// GOOD: Separate responsibilities, composed on same GameObject
public class PlayerInput : MonoBehaviour { /* input only */ }
public class PlayerMovement : MonoBehaviour { /* movement only */ }
public class PlayerAnimation : MonoBehaviour { /* animation only */ }
public class PlayerAudio : MonoBehaviour { /* audio only */ }
```

**Portals alert:** `BridgeTarget.cs` currently handles 30+ message types in a single switch statement (~1800 lines). Each `HandleX` method is a separate concern that could be extracted into handler classes.

### O - Open-Closed Principle
**Rule:** Open for extension, closed for modification.

**Violation detector:**
- Adding a new feature requires modifying an existing switch/if-else chain
- New message types require editing `BridgeTarget.OnMessage()`

**Fix pattern:** Use interfaces + registration instead of switch statements.

```csharp
// BAD: Must modify switch for every new shape
public double CalculateArea(object shape) {
    if (shape is Rectangle r) return r.Width * r.Height;
    if (shape is Circle c) return c.Radius * c.Radius * Math.PI;
    // Must edit here for every new shape...
}

// GOOD: New shapes implement interface, no modification needed
public interface IShape { double CalculateArea(); }
public class Rectangle : IShape { public double CalculateArea() => Width * Height; }
public class Circle : IShape { public double CalculateArea() => Radius * Radius * Math.PI; }
```

**Portals alert:** `BridgeTarget.OnMessage()` switch statement (lines 349-462) violates O/C. A handler registry pattern would allow adding message types without modifying the router:
```csharp
// Handler registry approach
public interface IBridgeHandler { string MessageType { get; } void Handle(string json); }
private Dictionary<string, IBridgeHandler> _handlers = new();
public void RegisterHandler(IBridgeHandler handler) => _handlers[handler.MessageType] = handler;
public void OnMessage(string json) {
    var type = _bridgeRouter.ExtractType(json);
    if (_handlers.TryGetValue(type, out var handler)) handler.Handle(json);
}
```

### L - Liskov Substitution Principle
**Rule:** Subclasses must be substitutable for their base class without breaking behavior.

**Violation detector:**
- Overridden methods that throw `NotImplementedException`
- Base class methods that check `if (this is DerivedType)`
- Subclass that ignores or contradicts parent behavior

**Fix pattern:** Prefer composition over inheritance. If a subclass cannot fulfill the base contract, it should not inherit from it.

```csharp
// BAD: Train inherits Vehicle but can't turn freely
public class Vehicle { public virtual void TurnRight() { /* ... */ } }
public class Train : Vehicle {
    public override void TurnRight() { /* does nothing - violates LSP */ }
}

// GOOD: Use interfaces for capabilities
public interface IMovable { void Move(); }
public interface ITurnable { void TurnRight(); void TurnLeft(); }
public class Car : IMovable, ITurnable { /* implements both */ }
public class Train : IMovable { /* only implements what it can do */ }
```

### I - Interface Segregation Principle
**Rule:** No client should depend on methods it does not use. Prefer many small interfaces over one large one.

**Violation detector:**
- Interfaces with 5+ methods where most implementers leave some empty
- Classes implementing an interface but throwing `NotImplementedException` for some methods

```csharp
// BAD: One fat interface
public interface IUnitStats {
    float Health { get; set; }
    float Speed { get; set; }
    float Armor { get; set; }
    int Damage { get; set; }
}

// GOOD: Segregated interfaces
public interface IDamageable { float Health { get; set; } float Armor { get; set; } }
public interface IMovable { float Speed { get; set; } }
public interface IAttacker { int Damage { get; set; } }
// Compose: public class Enemy : IDamageable, IMovable, IAttacker { }
// Compose: public class Crate : IDamageable { } // only what it needs
```

### D - Dependency Inversion Principle
**Rule:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Violation detector:**
- `new ConcreteClass()` inside high-level logic
- Direct references to specific MonoBehaviour types instead of interfaces
- `GetComponent<SpecificType>()` where an interface would work

```csharp
// BAD: High-level depends on concrete low-level
public class BridgeTarget {
    private SceneComposer _composer = new SceneComposer(); // tight coupling
}

// GOOD: Depend on abstraction
public interface ISceneComposer { GameObject SpawnObject(string id, int modelId); }
public class BridgeTarget {
    private ISceneComposer _composer; // injected, testable, swappable
}
```

---

## Command Pattern (Undo System)

**Direct applicability:** Portals Composer toolbar has an "Undo" button. Currently no undo infrastructure exists in the Unity side.

### Core Pattern (from PDF p.61-67)

The command pattern encapsulates a method call as an object, decoupling the invoker from the receiver. Each command stores enough state to undo itself.

```csharp
// === ICommand Interface ===
public interface ICommand
{
    void Execute();
    void Undo();
}

// === CommandInvoker (history manager) ===
public class CommandInvoker
{
    private static readonly Stack<ICommand> _undoStack = new Stack<ICommand>();
    private static readonly Stack<ICommand> _redoStack = new Stack<ICommand>();

    public static void ExecuteCommand(ICommand command)
    {
        command.Execute();
        _undoStack.Push(command);
        _redoStack.Clear(); // New action invalidates redo history
    }

    public static void UndoCommand()
    {
        if (_undoStack.Count > 0)
        {
            ICommand active = _undoStack.Pop();
            active.Undo();
            _redoStack.Push(active);
        }
    }

    public static void RedoCommand()
    {
        if (_redoStack.Count > 0)
        {
            ICommand active = _redoStack.Pop();
            active.Execute();
            _undoStack.Push(active);
        }
    }

    public static bool CanUndo => _undoStack.Count > 0;
    public static bool CanRedo => _redoStack.Count > 0;

    public static void Reset()
    {
        _undoStack.Clear();
        _redoStack.Clear();
    }
}
```

### Portals-Specific Commands

```csharp
// === AddObjectCommand (wraps HandleAddObject) ===
public class AddObjectCommand : ICommand
{
    private readonly SceneComposer _composer;
    private readonly string _id;
    private readonly int _modelId;
    private readonly Vector3 _position;
    private readonly Vector3 _scale;
    private readonly Quaternion _rotation;
    private readonly Color _color;
    private GameObject _spawnedObject;

    public AddObjectCommand(SceneComposer composer, string id, int modelId,
        Vector3 position, Vector3 scale, Quaternion rotation, Color color)
    {
        _composer = composer;
        _id = id;
        _modelId = modelId;
        _position = position;
        _scale = scale;
        _rotation = rotation;
        _color = color;
    }

    public void Execute()
    {
        _spawnedObject = _composer.SpawnObjectSync(_id, _modelId, _position, _scale, _rotation, _color);
    }

    public void Undo()
    {
        if (_spawnedObject != null)
        {
            _composer.UnregisterObject(_id);
            SceneContext.Instance?.Unregister(_id);
            Object.Destroy(_spawnedObject);
            _spawnedObject = null;
        }
    }
}

// === TransformCommand (wraps HandleUpdateTransform) ===
public class TransformCommand : ICommand
{
    private readonly Transform _target;
    private readonly Vector3 _newPos, _oldPos;
    private readonly Quaternion _newRot, _oldRot;
    private readonly Vector3 _newScale, _oldScale;

    public TransformCommand(Transform target, Vector3 newPos, Quaternion newRot, Vector3 newScale)
    {
        _target = target;
        _oldPos = target.position;
        _oldRot = target.rotation;
        _oldScale = target.localScale;
        _newPos = newPos;
        _newRot = newRot;
        _newScale = newScale;
    }

    public void Execute()
    {
        _target.position = _newPos;
        _target.rotation = _newRot;
        _target.localScale = _newScale;
    }

    public void Undo()
    {
        _target.position = _oldPos;
        _target.rotation = _oldRot;
        _target.localScale = _oldScale;
    }
}

// === RemoveObjectCommand (soft-delete for undo) ===
public class RemoveObjectCommand : ICommand
{
    private readonly SceneComposer _composer;
    private readonly string _id;
    private GameObject _cachedObject;
    private Vector3 _position;
    private Quaternion _rotation;
    private Vector3 _scale;

    public RemoveObjectCommand(SceneComposer composer, string id)
    {
        _composer = composer;
        _id = id;
    }

    public void Execute()
    {
        _cachedObject = _composer.GetObject(_id);
        if (_cachedObject != null)
        {
            _position = _cachedObject.transform.position;
            _rotation = _cachedObject.transform.rotation;
            _scale = _cachedObject.transform.localScale;
            _cachedObject.SetActive(false); // Hide, don't destroy (for undo)
        }
    }

    public void Undo()
    {
        if (_cachedObject != null)
        {
            _cachedObject.SetActive(true);
            _cachedObject.transform.position = _position;
            _cachedObject.transform.rotation = _rotation;
            _cachedObject.transform.localScale = _scale;
        }
    }
}

// === MaterialCommand ===
public class MaterialCommand : ICommand
{
    private readonly Renderer _renderer;
    private readonly Material _newMaterial;
    private Material _oldMaterial;

    public MaterialCommand(Renderer renderer, Material newMaterial)
    {
        _renderer = renderer;
        _newMaterial = newMaterial;
    }

    public void Execute()
    {
        _oldMaterial = _renderer.sharedMaterial;
        _renderer.material = _newMaterial;
    }

    public void Undo()
    {
        _renderer.material = _oldMaterial;
    }
}
```

### Integration into BridgeTarget

```csharp
// In BridgeTarget.OnMessage() switch:
case "add_object":
    var cmd = new AddObjectCommand(_sceneComposer, id, modelId, pos, scale, rot, color);
    CommandInvoker.ExecuteCommand(cmd);
    break;
case "remove_object":
    var rmCmd = new RemoveObjectCommand(_sceneComposer, id);
    CommandInvoker.ExecuteCommand(rmCmd);
    break;
case "undo":
    CommandInvoker.UndoCommand();
    SendToMobileApp("{\"type\":\"undo_complete\",\"canUndo\":" +
        CommandInvoker.CanUndo.ToString().ToLower() + "}");
    break;
case "redo":
    CommandInvoker.RedoCommand();
    SendToMobileApp("{\"type\":\"redo_complete\",\"canRedo\":" +
        CommandInvoker.CanRedo.ToString().ToLower() + "}");
    break;
```

---

## Observer Pattern (Bridge Events)

**Direct applicability:** Bridge message routing, VFX property updates, UI state sync.

### Pattern Summary (from PDF p.79-86)

Defines a one-to-many dependency. When one object (subject) changes state, all dependents (observers) are notified automatically. Three approaches with tradeoffs:

### 1. C# Events (Recommended for Portals bridge)
```csharp
// Subject: publishes events
public static class BridgeEventBus
{
    public static event Action<string, GameObject> OnObjectAdded;
    public static event Action<string> OnObjectRemoved;
    public static event Action<string, Vector3, Quaternion, Vector3> OnTransformUpdated;
    public static event Action OnSceneCleared;
    public static event Action<string> OnRawMessage; // debug hook

    public static void RaiseObjectAdded(string id, GameObject obj) => OnObjectAdded?.Invoke(id, obj);
    public static void RaiseObjectRemoved(string id) => OnObjectRemoved?.Invoke(id);
    public static void RaiseSceneCleared() => OnSceneCleared?.Invoke();
}

// Observer: any system subscribes without direct reference
public class WireSystem : MonoBehaviour
{
    void OnEnable()
    {
        BridgeEventBus.OnObjectAdded += HandleObjectAdded;
        BridgeEventBus.OnObjectRemoved += HandleObjectRemoved;
    }
    void OnDisable()
    {
        BridgeEventBus.OnObjectAdded -= HandleObjectAdded;
        BridgeEventBus.OnObjectRemoved -= HandleObjectRemoved;
    }
    void HandleObjectAdded(string id, GameObject obj) => RegisterTarget(id, obj);
    void HandleObjectRemoved(string id) => targets.Remove(id);
}
```

**Pros:** Fast, zero allocations, type-safe, no Inspector wiring needed.
**Cons:** Must unsubscribe in OnDisable/OnDestroy or risk null ref. Static events survive scene loads.
**Best for:** Portals bridge event routing between systems.

### 2. UnityEvents (Inspector-configurable)
```csharp
[System.Serializable]
public class ObjectSpawnedEvent : UnityEvent<string, GameObject> { }

public class SceneComposer : MonoBehaviour
{
    public ObjectSpawnedEvent onObjectSpawned; // wire in Inspector
}
```

**Pros:** Inspector-configurable, designers can wire without code.
**Cons:** Slower (reflection + serialization overhead), harder to debug, no static usage.
**Best for:** One-off Inspector hooks (button callbacks, VFX triggers).

### 3. ScriptableObject Event Channels (fully decoupled)
```csharp
[CreateAssetMenu(fileName = "StringEvent", menuName = "Portals/Events/String Channel")]
public class StringEventChannel : ScriptableObject
{
    public event Action<string> OnEventRaised;
    public void RaiseEvent(string value) => OnEventRaised?.Invoke(value);
}

// Publisher drags channel asset into Inspector
public class BridgeTarget : MonoBehaviour
{
    [SerializeField] StringEventChannel onMessageReceived;
    public void OnMessage(string json) => onMessageReceived?.RaiseEvent(json);
}

// Subscriber drags SAME channel asset - zero coupling between scripts
public class DebugLogger : MonoBehaviour
{
    [SerializeField] StringEventChannel onMessageReceived;
    void OnEnable() => onMessageReceived.OnEventRaised += Log;
    void OnDisable() => onMessageReceived.OnEventRaised -= Log;
    void Log(string json) => Debug.Log($"Bridge: {json}");
}
```

**Pros:** Fully decoupled (no direct references), survives assembly boundaries, testable.
**Cons:** Requires asset management, more setup.
**Best for:** Cross-system notifications (scene state changed -> multiple UI panels update).

### Recommendation for Portals
| Use Case | Approach |
|----------|----------|
| Bridge routing (internal) | C# `static event Action` on `BridgeEventBus` |
| UI notifications | ScriptableObject event channels |
| Inspector one-offs | `UnityEvent` |

---

## Object Pool (VFX/Object Spawning)

**Direct applicability:** VFX particle recycling, rapid batch spawning from voice commands.

### UnityEngine.Pool API (Unity 2021+, available in Unity 6)

```csharp
using UnityEngine;
using UnityEngine.Pool;

public class PrimitivePool : MonoBehaviour
{
    private readonly Dictionary<PrimitiveType, ObjectPool<GameObject>> _pools = new();

    public GameObject Get(PrimitiveType type, Vector3 position, Quaternion rotation)
    {
        var pool = GetOrCreatePool(type);
        var obj = pool.Get();
        obj.transform.SetPositionAndRotation(position, rotation);
        return obj;
    }

    public void Release(PrimitiveType type, GameObject obj)
    {
        if (_pools.TryGetValue(type, out var pool))
            pool.Release(obj);
        else
            Destroy(obj);
    }

    private ObjectPool<GameObject> GetOrCreatePool(PrimitiveType type)
    {
        if (!_pools.TryGetValue(type, out var pool))
        {
            pool = new ObjectPool<GameObject>(
                createFunc: () => {
                    var obj = GameObject.CreatePrimitive(type);
                    obj.SetActive(false);
                    return obj;
                },
                actionOnGet: obj => obj.SetActive(true),
                actionOnRelease: obj => {
                    obj.SetActive(false);
                    obj.transform.SetParent(null);
                    obj.transform.localScale = Vector3.one;
                },
                actionOnDestroy: Destroy,
                collectionCheck: true,  // Debug: warns on double-release
                defaultCapacity: 10,
                maxSize: 50
            );
            _pools[type] = pool;
        }
        return pool;
    }

    void OnDestroy()
    {
        foreach (var pool in _pools.Values)
            pool.Dispose();
        _pools.Clear();
    }
}
```

### When to Pool vs Instantiate

| Scenario | Use Pool | Use Instantiate |
|----------|----------|-----------------|
| Primitives from batch_execute (>5 at once) | YES | No |
| VFX bursts spawned rapidly | YES | No |
| GLB models from Icosa (unique meshes) | No | YES |
| UI log entries (LogObjectPool already pools) | Already pooled | N/A |

### Portals Integration
`SceneComposer.SpawnObjectSync()` calls `GameObject.CreatePrimitive()` directly. For `batch_execute` with many `add_object` calls, pooling reduces GC pressure.

---

## Factory Pattern (Scene Object Creation)

**Direct applicability:** `SceneComposer.SpawnObjectAsync()` is already a factory but lacks abstraction.

### Pattern (from PDF p.39-44)

```csharp
public interface ISceneObject
{
    string Id { get; }
    GameObject GameObject { get; }
    void Initialize(Vector3 position, Vector3 scale, Quaternion rotation, Color color);
}

public static class SceneObjectFactory
{
    public static ISceneObject CreatePrimitive(string id, int modelId,
        Vector3 pos, Vector3 scale, Quaternion rot, Color color)
    {
        var type = SceneComposer.PrimitiveMap[Mathf.Clamp(modelId, 0, 5)];
        var go = GameObject.CreatePrimitive(type);
        go.name = $"Object_{id}";
        go.transform.SetPositionAndRotation(pos, rot);
        go.transform.localScale = scale;
        if (color != Color.clear)
        {
            var r = go.GetComponent<Renderer>();
            if (r != null) r.material.color = color;
        }
        return new SimpleSceneObject(id, go);
    }

    public static async Task<ISceneObject> CreateFromUrlAsync(string id, string url,
        Vector3 pos, Vector3 scale, Quaternion rot, Color color)
    {
        var go = await GltfLoader.LoadAsync(url);
        go.name = $"Object_{id}";
        go.transform.SetPositionAndRotation(pos, rot);
        go.transform.localScale = scale;
        return new SimpleSceneObject(id, go);
    }
}
```

**Benefit:** Command pattern's `AddObjectCommand.Execute()` delegates to factory. Factory is swappable for testing (mock factory returns test objects).

---

## Singleton (Service Locator)

**Direct applicability:** 5+ singletons in Portals: ARDepthSource, AudioDataSource, SceneContext, WireSystem, ARPositioningConfig.

### Generic Lazy Singleton (from PDF p.53-59)

```csharp
public class Singleton<T> : MonoBehaviour where T : Component
{
    private static T _instance;

    public static T Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindAnyObjectByType<T>();
                if (_instance == null)
                {
                    var go = new GameObject($"[{typeof(T).Name}]");
                    _instance = go.AddComponent<T>();
                }
            }
            return _instance;
        }
    }

    protected virtual void Awake()
    {
        if (_instance == null)
        {
            _instance = this as T;
            // Only use DontDestroyOnLoad for cross-scene singletons
            // DontDestroyOnLoad(gameObject);
        }
        else if (_instance != this)
        {
            Destroy(gameObject);
        }
    }

    protected virtual void OnDestroy()
    {
        if (_instance == this)
            _instance = null;
    }
}
```

### Current Portals State vs Recommendation

| Singleton | Current (file:line) | Issue | Fix |
|-----------|---------------------|-------|-----|
| `ARDepthSource` | `Awake() => Instance = this` (ARDepthSource.cs:70) | No duplicate guard | Add `if (Instance != null) { Destroy(gameObject); return; }` |
| `WireSystem` | `Awake() => Instance = this` (WireSystem.cs:26) | No duplicate guard | Same |
| `SceneContext` | `Awake() => Instance = this` (SceneContext.cs:32) | No duplicate guard, no OnDestroy null-out | Add guard + `OnDestroy` |
| `AudioDataSource` | Similar pattern | Same | Same |
| `UnityMainThreadDispatcher` | Full lazy pattern (line 10-22) | No DontDestroyOnLoad | Add if needed cross-scene |

### When NOT to Singleton
- Need testability (hard to mock)
- Multiple instances valid (multiplayer per-player systems)
- Lifetime should match scene, not app

---

## State Pattern (UI Modes / Tool States)

**Direct applicability:** Composer toolbar has 11 modes. Each mode changes what taps/gestures do.

### Pattern (from PDF p.69-76)

```csharp
// === State interface ===
public interface IComposerState
{
    void Enter(ComposerContext context);
    void Exit(ComposerContext context);
    void OnTap(ComposerContext context, Vector3 worldPos);
    void OnDrag(ComposerContext context, Vector3 delta);
    void OnPinch(ComposerContext context, float scale);
}

// === Concrete states ===
public class ObjectPlacementState : IComposerState
{
    public void Enter(ComposerContext ctx) => ctx.ShowPlacementGrid(true);
    public void Exit(ComposerContext ctx) => ctx.ShowPlacementGrid(false);
    public void OnTap(ComposerContext ctx, Vector3 pos) => ctx.SpawnObjectAt(pos);
    public void OnDrag(ComposerContext ctx, Vector3 delta) { }
    public void OnPinch(ComposerContext ctx, float scale) { }
}

public class TransformState : IComposerState
{
    public void Enter(ComposerContext ctx) => ctx.ShowTransformGizmo(true);
    public void Exit(ComposerContext ctx) => ctx.ShowTransformGizmo(false);
    public void OnTap(ComposerContext ctx, Vector3 pos) => ctx.SelectObjectAt(pos);
    public void OnDrag(ComposerContext ctx, Vector3 delta) => ctx.MoveSelected(delta);
    public void OnPinch(ComposerContext ctx, float scale) => ctx.ScaleSelected(scale);
}

public class WireEditState : IComposerState
{
    public void Enter(ComposerContext ctx) => ctx.ShowWirePanel(true);
    public void Exit(ComposerContext ctx) => ctx.ShowWirePanel(false);
    public void OnTap(ComposerContext ctx, Vector3 pos) => ctx.SelectWireEndpoint(pos);
    public void OnDrag(ComposerContext ctx, Vector3 delta) { }
    public void OnPinch(ComposerContext ctx, float scale) { }
}

// === Context (state machine) ===
public class ComposerContext : MonoBehaviour
{
    private IComposerState _currentState;
    private readonly Dictionary<string, IComposerState> _states = new()
    {
        ["objects"]   = new ObjectPlacementState(),
        ["transform"] = new TransformState(),
        ["wires"]     = new WireEditState(),
        ["color"]     = new ColorEditState(),
        ["material"]  = new MaterialEditState(),
        ["animate"]   = new AnimateState(),
        ["vfx"]       = new VFXState(),
        ["light"]     = new LightState(),
        ["media"]     = new MediaState(),
        ["assets"]    = new AssetBrowserState(),
        ["undo"]      = new UndoState(),
    };

    public void SetMode(string mode)
    {
        _currentState?.Exit(this);
        if (_states.TryGetValue(mode, out var state))
        {
            _currentState = state;
            _currentState.Enter(this);
        }
    }

    // Input routing delegates to current state
    public void OnTap(Vector3 pos) => _currentState?.OnTap(this, pos);
    public void OnDrag(Vector3 delta) => _currentState?.OnDrag(this, delta);
    public void OnPinch(float scale) => _currentState?.OnPinch(this, scale);

    // Context methods that states call
    public void ShowPlacementGrid(bool show) { /* ... */ }
    public void ShowTransformGizmo(bool show) { /* ... */ }
    public void ShowWirePanel(bool show) { /* ... */ }
    public void SpawnObjectAt(Vector3 pos) { /* delegates to SceneComposer */ }
    public void SelectObjectAt(Vector3 pos) { /* raycast + select */ }
    public void MoveSelected(Vector3 delta) { /* transform selected */ }
    public void ScaleSelected(float scale) { /* scale selected */ }
    public void SelectWireEndpoint(Vector3 pos) { /* wire connection */ }
}
```

---

## MVP Pattern (UI Separation)

**Direct applicability:** Portals UI overlay (chat, buttons, status) should be decoupled from scene logic.

### Pattern (from PDF p.88-93)

```
Model (data) <---> Presenter (logic) <---> View (UI display)
```

The View never talks to the Model directly. The Presenter mediates.

```csharp
// === Model (pure data, no MonoBehaviour) ===
public class SceneModel
{
    public int ObjectCount { get; private set; }
    public string LastAction { get; private set; }
    public bool IsHologramActive { get; private set; }

    public event Action OnModelChanged;

    public void SetObjectCount(int count)
    {
        ObjectCount = count;
        OnModelChanged?.Invoke();
    }

    public void SetLastAction(string action)
    {
        LastAction = action;
        OnModelChanged?.Invoke();
    }

    public void SetHologramActive(bool active)
    {
        IsHologramActive = active;
        OnModelChanged?.Invoke();
    }
}

// === View (UI only - zero logic) ===
public class SceneStatusView : MonoBehaviour
{
    [SerializeField] TMP_Text objectCountText;
    [SerializeField] TMP_Text lastActionText;
    [SerializeField] Image hologramIndicator;

    public void UpdateObjectCount(int count) => objectCountText.text = $"Objects: {count}";
    public void UpdateLastAction(string action) => lastActionText.text = action;
    public void UpdateHologramStatus(bool active) =>
        hologramIndicator.color = active ? Color.green : Color.gray;
}

// === Presenter (mediates between model and view) ===
public class SceneStatusPresenter : MonoBehaviour
{
    [SerializeField] SceneStatusView view;
    private SceneModel _model;

    void Awake()
    {
        _model = new SceneModel();
        _model.OnModelChanged += UpdateView;

        BridgeEventBus.OnObjectAdded += (id, obj) =>
            _model.SetObjectCount(_model.ObjectCount + 1);
        BridgeEventBus.OnObjectRemoved += id =>
            _model.SetObjectCount(Mathf.Max(0, _model.ObjectCount - 1));
        BridgeEventBus.OnSceneCleared += () =>
            _model.SetObjectCount(0);
    }

    void UpdateView()
    {
        view.UpdateObjectCount(_model.ObjectCount);
        view.UpdateLastAction(_model.LastAction);
        view.UpdateHologramStatus(_model.IsHologramActive);
    }

    void OnDestroy()
    {
        _model.OnModelChanged -= UpdateView;
    }
}
```

---

## Anti-Patterns to Flag

### 1. God Class
**Symptom:** `BridgeTarget.cs` at ~1800 lines handling 30+ message types.
**Detection:** `wc -l` > 500 on a single MonoBehaviour.
**Fix:** Extract handler classes + handler registry + Command pattern.

### 2. Spaghetti Observer
**Symptom:** Scattered `FindAnyObjectByType<T>()` and `SomeClass.Instance` calls to communicate.
**Detection:** `rg "FindAnyObjectByType|\.Instance\b" --type cs | wc -l` > 20.
**Fix:** Event bus or ScriptableObject event channels.

### 3. Singleton Without Guards
**Symptom:** `void Awake() => Instance = this` with no duplicate check.
**Detection:** `rg "Instance = this" --type cs` without nearby `if.*Instance.*null` check.
**Fix:** Generic `Singleton<T>` base class with duplicate destruction + OnDestroy null-out.

### 4. Magic Strings
**Symptom:** `ExtractString(json, "modelUrl")` scattered throughout with raw string literals.
**Detection:** Same string key used in 2+ places.
**Fix:** `static class BridgeKeys { public const string ModelUrl = "modelUrl"; }`

### 5. Missing Undo
**Symptom:** Destructive operations (`HandleRemoveObject`, `HandleClearScene`) with no recovery.
**Detection:** Any `Destroy()` call not wrapped in a Command.
**Fix:** Command pattern wrapping all mutating bridge operations.

### 6. Per-Frame Allocations in Hot Paths
**Symptom:** `string.Split(':')` in `WireSystem.ApplyMod()` (line 84) called every frame per wire.
**Detection:** `string.Split`, `new List`, `string.Format` inside `Update()` or methods called from `Update()`.
**Fix:** Parse once on wire creation; cache `op` and `amount` as struct fields.

```csharp
// Current (allocates every frame):
public struct Wire { public string src, mod, tgt; }

// Fixed (parse once):
public struct Wire
{
    public string src;
    public string tgt;
    public string modOp;     // parsed once: "scale", "sin", etc.
    public float modAmount;  // parsed once: 0.5, 2.0, etc.
}
```

### 7. GetComponent in Loops
**Symptom:** `obj.GetComponent<Renderer>()` in `WireSystem.SetTarget()` (line 119) per-frame.
**Detection:** `GetComponent` inside `Update()` or called-from-Update methods.
**Fix:** Cache on registration: `Dictionary<string, (GameObject obj, Renderer renderer)> targets`.

### 8. No Interface Segregation
**Symptom:** Systems importing full MonoBehaviour types when they only need one method.
**Fix:** Extract `IWireTarget`, `ISelectable`, `ISpawnable` interfaces.

---

## Portals-Specific Refactoring Opportunities

### Priority 1: Command Pattern for Undo (HIGH)
- **Files:** `BridgeTarget.cs` (HandleAddObject:630, HandleRemoveObject:748, HandleUpdateTransform, HandleClearScene)
- **Effort:** Medium -- new ICommand implementations + CommandInvoker class
- **Impact:** Enables undo/redo button, satisfies existing toolbar UI promise
- **Dependencies:** None, can be added incrementally per message type

### Priority 2: Bridge Event Bus (MEDIUM)
- **Files:** New `BridgeEventBus.cs`, modify `BridgeTarget.cs`, `WireSystem.cs`, `SceneContext.cs`
- **Effort:** Low -- static event class + subscribe/unsubscribe in existing OnEnable/OnDisable
- **Impact:** Decouples systems, enables unit testing, prepares for handler registry

### Priority 3: WireSystem Hot Path Optimization (MEDIUM)
- **Files:** `WireSystem.cs` lines 81-98 (ApplyMod), lines 100-130 (SetTarget)
- **Effort:** Low -- parse mod string once into struct fields, cache Renderer on registration
- **Impact:** Significant on mobile with 10+ active wires (eliminates per-frame string.Split + GetComponent)

### Priority 4: Singleton Guards (LOW, quick fix)
- **Files:** ARDepthSource.cs:70, WireSystem.cs:26, SceneContext.cs:32, AudioDataSource.cs
- **Effort:** Trivial -- add 3-line duplicate guard to each Awake()
- **Impact:** Prevents silent bugs from duplicate singleton instances

### Priority 5: Handler Registry (LOW, major refactor)
- **Files:** `BridgeTarget.cs` OnMessage switch (lines 349-462)
- **Effort:** High -- extract 30+ handlers into `IBridgeHandler` implementations
- **Impact:** Open-Closed Principle, easier to add message types, each handler independently testable

### Priority 6: Object Pool for Primitives (LOW)
- **Files:** `SceneComposer.cs`
- **Effort:** Low -- `ObjectPool<GameObject>` wrapping `CreatePrimitive`
- **Impact:** GC reduction during batch operations (batch_execute with many add_object)

---

## Quick Reference: Pattern Selection Guide

| Problem | Pattern | Key Type | PDF Page |
|---------|---------|----------|----------|
| Need undo/redo | Command | `ICommand`, `CommandInvoker` | 61-67 |
| Systems react to changes | Observer | `event Action<T>`, SO channels | 79-86 |
| Rapid create/destroy cycles | Object Pool | `ObjectPool<T>` | 45-50 |
| Complex object creation | Factory | `SceneObjectFactory` | 39-44 |
| Global service access | Singleton | `Singleton<T>` base class | 53-59 |
| Mode-dependent behavior | State | `IComposerState` + context | 69-76 |
| UI decoupled from data | MVP | Model, View, Presenter | 88-93 |
| Feature extension without modification | Open-Closed | Interface + registry | 13-16 |

---

## Additional Patterns Mentioned (PDF p.95-98)

Not covered in detail but referenced for future use:
- **Decorator:** Wrap existing behavior with additional functionality. Useful for: adding logging/analytics to bridge handlers without modifying them.
- **Flyweight:** Share common data across many instances. Useful for: shared materials across spawned primitives (already partially done via MaterialPresets).
- **Visitor:** Add operations to objects without changing their class. Useful for: scene serialization (visit each object to extract save data).
- **Type Object:** Flexible alternative to subclassing. Useful for: component definitions in ComponentRegistry.
- **Spatial Partition:** Organize objects by position for efficient lookup. Useful for: AR scene queries ("what's near me?").
- **Dirty Flag:** Avoid unnecessary work by tracking changes. Useful for: scene save (only serialize changed objects).
- **Service Locator:** Alternative to Singleton with better testability. Future consideration for replacing direct singleton access.

---

*Source: "Level Up Your Code with Game Programming Patterns" (Unity Technologies, 6th edition)*
*Mapped to: portals_main codebase (commit 78fa6c07c) as of 2026-02-12*
*File locations referenced: unity/Assets/Scripts/ subtree*

# Normcore Multiplayer Patterns

**Last Updated**: 2026-02-05
**Projects**: Normcore-Addressables-Recipe, Normcore-Network-Profiler, Normcore-Multiplayer-Drawing

---

## Quick Reference

| Need | Pattern |
|------|---------|
| Basic sync | `RealtimeComponent<T>` |
| Custom model | Inherit `RealtimeModel` |
| Ownership | `RequestOwnership()` before write |
| Room join | `Realtime.Connect(roomName)` |

---

## Core Concepts

### RealtimeComponent Pattern
```csharp
public class SyncedTransform : RealtimeComponent<SyncedTransformModel>
{
    protected override void OnRealtimeModelReplaced(SyncedTransformModel prev, SyncedTransformModel curr)
    {
        if (prev != null) prev.positionDidChange -= OnPositionChanged;
        if (curr != null) curr.positionDidChange += OnPositionChanged;
    }

    private void OnPositionChanged(SyncedTransformModel model, Vector3 value)
    {
        transform.position = value;
    }

    void Update()
    {
        if (model.isOwnedLocallySelf)
            model.position = transform.position;
    }
}
```

### Ownership Pattern
```csharp
// Request ownership before writing
if (!model.isOwnedLocallySelf)
    model.RequestOwnership();

// Check ownership before expensive operations
if (model.isOwnedLocallySelf)
{
    // Safe to write
    model.value = newValue;
}
```

### Room Connection
```csharp
[SerializeField] private Realtime _realtime;

void Start()
{
    _realtime.didConnectToRoom += OnConnected;
    _realtime.Connect("room-name");
}

void OnConnected(Realtime realtime)
{
    Debug.Log($"Connected to {realtime.room.name}");
}
```

---

## Addressables + Normcore

From `Normcore-Addressables-Recipe`:

```csharp
// Load prefab via Addressables, then instantiate via Normcore
var handle = Addressables.LoadAssetAsync<GameObject>("MyPrefab");
await handle.Task;

// Register with Normcore before instantiating
Realtime.RegisterPrefab(handle.Result);

// Now can use Realtime.Instantiate
var instance = Realtime.Instantiate("MyPrefab", position, rotation);
```

---

## Network Profiler Patterns

From `Normcore-Network-Profiler`:

```csharp
// Monitor bandwidth
var stats = _realtime.room.GetNetworkStatistics();
Debug.Log($"Sent: {stats.bytesSent}, Received: {stats.bytesReceived}");

// Optimize sync frequency
[RealtimeProperty(reliable: false, updateFrequency: 0.1f)]
public Vector3 position { get; set; }
```

---

## Hand Tracking + Normcore

From `Quest-hands-for-Normcore`:

```csharp
// Sync hand joint data
[RealtimeModel]
public partial class HandModel
{
    [RealtimeProperty(1, reliable: false)]
    private Vector3[] _jointPositions;

    [RealtimeProperty(2, reliable: false)]
    private Quaternion[] _jointRotations;
}
```

---

## Trusted Resources

| Resource | URL |
|----------|-----|
| Official Docs | normcore.io/documentation |
| Discord | discord.gg/normcore |
| GitHub Samples | github.com/NormalVR/Normcore-Samples |
| Quest Hands | github.com/absurd-joy/Quest-hands-for-Normcore |

---

## Common Issues

| Issue | Fix |
|-------|-----|
| Model not syncing | Check `RequestOwnership()` before write |
| Prefab not found | Register with `Realtime.RegisterPrefab()` |
| High latency | Use `reliable: false` for position/rotation |
| Ownership conflict | Use `preventOwnershipTakeover: true` |

# Auto-Fix Patterns

**Version**: 2.0 (Simplified) | **Updated**: 2026-02-05

## Quick Lookup

**Use `_QUICK_FIX.md` for instant error→fix lookup.**

This file contains extended patterns for complex scenarios.

---

## Unity/AR Common Fixes

### AR Texture Access (TryAcquire Pattern)
```csharp
// WRONG - crashes randomly
var texture = occlusionManager.humanDepthTexture;

// CORRECT - safe with disposal
if (occlusionManager.TryAcquireHumanDepthCpuImage(out XRCpuImage image))
{
    using (image) { /* process */ }
}
```

### VFX Property Updates
```csharp
// WRONG - string lookup every frame
vfx.SetFloat("Size", 1.0f);

// CORRECT - cached property ID
static readonly int SizeID = Shader.PropertyToID("Size");
vfx.SetFloat(SizeID, 1.0f);
```

### Null-Safe Component Access
```csharp
// WRONG
GetComponent<Rigidbody>().velocity = Vector3.zero;

// CORRECT
if (TryGetComponent<Rigidbody>(out var rb))
    rb.velocity = Vector3.zero;
```

### AR Session Wait
```csharp
IEnumerator WaitForAR()
{
    while (ARSession.state < ARSessionState.SessionTracking)
        yield return null;
    // Safe to use AR now
}
```

### Compute Shader Dispatch
```csharp
// WRONG - integer truncation
int groups = count / 64;

// CORRECT - ceiling division
int groups = Mathf.CeilToInt(count / 64f);
```

---

## React Native / Unity Bridge

### Message Queue (Fabric)
```typescript
// WRONG - message dropped before eventEmitter ready
sendMessageToMobileApp(msg);

// CORRECT - buffer until ready
if (eventEmitter) sendMessage(msg);
else pendingMessages.push(msg);
```

### VSync Fix (15 FPS Issue)
```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSplashScreen)]
static void FixVSync() {
    QualitySettings.vSyncCount = 0;
    Application.targetFrameRate = 60;
}
```

---

## MCP Tool Patterns

### Batch Operations (10-100x faster)
```javascript
batch_execute([
  {tool: "manage_script", params: {...}},
  {tool: "manage_script", params: {...}},
  {tool: "refresh_unity", params: {mode: "if_dirty"}}
], {parallel: true})
```

### Safe Console Check
```javascript
read_console({action: "get", types: ["error"], count: 10})
// Always check before and after changes
```

---

## When Patterns Don't Work

1. Check Unity version (API changes)
2. Check package versions (AR Foundation 5→6 broke ARSessionOrigin)
3. Check platform (iOS vs Android vs Quest)
4. Search `_archive/_AUTO_FIX_PATTERNS_VERBOSE.md` for edge cases

---

**Primary Reference**: `_QUICK_FIX.md` (error→fix table)
**Extended Patterns**: This file
**Archived Verbose**: `_archive/_AUTO_FIX_PATTERNS_VERBOSE.md`

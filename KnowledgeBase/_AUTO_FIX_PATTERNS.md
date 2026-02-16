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

### VFXARBinder Bindings Disabled
**Symptom**: VFX has correct properties but receives no AR data
**Cause**: `_bindXxxOverride` fields serialized as false in scene

```csharp
// FIX 1: Right-click VFXARBinder → Reset (triggers AutoDetectBindings)

// FIX 2: Manual toggle in Inspector
// Enable: DepthMap, ColorMap, RayParams, InverseView, DepthRange

// FIX 3: Script fix (existing scenes)
foreach (var binder in FindObjectsByType<VFXARBinder>(FindObjectsSortMode.None))
{
    binder.BindDepthMap = true;
    binder.BindColorMap = true;
    binder.BindRayParams = true;
    binder.BindInverseView = true;
    binder.BindDepthRange = true;
}
```

### Edit-Mode Safe Destroy
```csharp
// WRONG - crashes in Edit Mode (tests, [InitializeOnLoad], etc.)
Object.Destroy(obj);

// CORRECT - works in both modes
if (Application.isPlaying) Object.Destroy(obj);
else Object.DestroyImmediate(obj);
```

### Regex Empty Array Matching
```csharp
// WRONG - .+ requires content, won't match "actions":[]
var pattern = "\"actions\":\\s*\\[(.+)\\]";

// CORRECT - .* matches empty arrays too
var pattern = "\"actions\":\\s*\\[(.*)\\]";
// Then check: if (string.IsNullOrEmpty(innerContent.Trim())) return early
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

## See Also

- `_TEST_DEBUG_AUTOMATION_PATTERNS.md` - When/how to use auto-fix patterns in agent workflows
- `_DEV_ITERATION_WORKFLOWS.md` §Auto Workflow Matrix - CI failure triggers auto-triage via this file
- `_CLAUDE_CODE_UNITY_WORKFLOW.md` - MCP-first dev loop (compile→console→fix→verify)
- `_UNITY_DEBUGGING_MASTER.md` - Log locations, device debugging, profiler workflows
- `~/GLOBAL_RULES.md` §Test/Debug Philosophy - "Reproduce before fix" enforcement

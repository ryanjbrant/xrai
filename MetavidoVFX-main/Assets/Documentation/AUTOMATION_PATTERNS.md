# Unity Automation Patterns

Quick reference for P0-P2 automation features available in MetavidoVFX.

## P0: InGameDebugConsole (3-finger tap)

**Package**: `com.yasirkula.ingamedebugconsole` (already installed)

### Usage on Device
- **3-finger tap**: Opens debug console overlay
- Shows all Debug.Log, Debug.LogWarning, Debug.LogError messages
- Filter by log type, search text
- Collapse duplicate messages

### Auto-Injection
The console is **automatically injected** during iOS builds via `BuildScript.cs`:
- Opens scene before build
- Checks if `IngameDebugConsole` exists
- Instantiates from prefab if missing
- Saves scene

### Manual Setup (if needed)
```csharp
// Find and instantiate prefab
string[] guids = AssetDatabase.FindAssets("IngameDebugConsole t:Prefab");
string path = AssetDatabase.GUIDToAssetPath(guids[0]);
GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
PrefabUtility.InstantiatePrefab(prefab);
```

---

## P1: batch_execute (10-100x faster MCP operations)

**MCP Tool**: `mcp__unity__batch_execute`

### When to Use
- Creating/modifying multiple GameObjects
- Adding components to multiple targets
- Any repetitive Unity operations

### Performance
| Operation | Sequential | batch_execute |
|-----------|------------|---------------|
| Create 10 cubes | 10 calls (~2s) | 1 call (~0.2s) |
| Add 20 components | 20 calls (~4s) | 1 call (~0.4s) |
| Read 50 properties | 50 calls (~10s) | 1 call (~1s) |

### Example: Create Multiple Objects
```json
{
  "commands": [
    {"tool": "manage_gameobject", "params": {"action": "create", "name": "Cube1", "primitive": "Cube"}},
    {"tool": "manage_gameobject", "params": {"action": "create", "name": "Cube2", "primitive": "Cube"}},
    {"tool": "manage_gameobject", "params": {"action": "create", "name": "Cube3", "primitive": "Cube"}}
  ],
  "parallel": true
}
```

### Example: Add Components to Multiple Targets
```json
{
  "commands": [
    {"tool": "manage_components", "params": {"action": "add", "target": "Cube1", "component": "Rigidbody"}},
    {"tool": "manage_components", "params": {"action": "add", "target": "Cube2", "component": "Rigidbody"}},
    {"tool": "manage_components", "params": {"action": "add", "target": "Cube3", "component": "Rigidbody"}}
  ],
  "parallel": true,
  "max_parallelism": 5
}
```

### Options
- `parallel: true` - Run read-only commands in parallel
- `fail_fast: true` - Stop on first failure
- `max_parallelism: N` - Limit concurrent operations

---

## P2: Roslyn Runtime C# Compilation

**Package**: Microsoft.CodeAnalysis.CSharp 5.0.0 (via NuGet)

### Available Assemblies
```
Assets/Packages/
├── Microsoft.CodeAnalysis.CSharp.5.0.0/
├── Microsoft.CodeAnalysis.CSharp.Workspaces.5.0.0/
├── Microsoft.CodeAnalysis.Common.5.0.0/
├── Microsoft.CodeAnalysis.Workspaces.Common.5.0.0/
└── Microsoft.CodeAnalysis.Analyzers.3.11.0/
```

### Basic Usage: Compile and Execute
```csharp
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using System.Reflection;

public class RuntimeCompiler
{
    public static Assembly CompileCode(string code)
    {
        var syntaxTree = CSharpSyntaxTree.ParseText(code);

        var references = new[]
        {
            MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
            MetadataReference.CreateFromFile(typeof(UnityEngine.Debug).Assembly.Location)
        };

        var compilation = CSharpCompilation.Create(
            "DynamicAssembly",
            new[] { syntaxTree },
            references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        using var ms = new System.IO.MemoryStream();
        var result = compilation.Emit(ms);

        if (result.Success)
        {
            ms.Seek(0, System.IO.SeekOrigin.Begin);
            return Assembly.Load(ms.ToArray());
        }

        foreach (var diagnostic in result.Diagnostics)
        {
            UnityEngine.Debug.LogError(diagnostic.ToString());
        }
        return null;
    }
}
```

### Voice-to-Code Use Case
```csharp
// Example: Voice command "create a spinning cube"
string generatedCode = @"
using UnityEngine;
public class SpinningCube : MonoBehaviour
{
    void Update()
    {
        transform.Rotate(Vector3.up * 90 * Time.deltaTime);
    }
}";

var assembly = RuntimeCompiler.CompileCode(generatedCode);
var type = assembly.GetType("SpinningCube");
var cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
cube.AddComponent(type);
```

### Platform Notes
- **Editor**: Full Roslyn support
- **iOS**: IL2CPP strips reflection - use `[Preserve]` attributes
- **Android**: Works with Mono backend

---

## Reference: EditorApplication API

Key automation APIs in `UnityEditor.EditorApplication`:

### Playmode Control
```csharp
EditorApplication.isPlaying = true;  // Enter play mode
EditorApplication.isPaused = true;   // Pause
EditorApplication.Step();            // Single frame step
```

### Build Hooks
```csharp
EditorApplication.update += MyUpdate;           // Per-frame callback
EditorApplication.playModeStateChanged += OnPlayModeChanged;
EditorApplication.quitting += OnQuit;
```

### Utility
```csharp
EditorApplication.ExecuteMenuItem("File/Save");  // Run menu item
EditorApplication.OpenProject(path);             // Open project
EditorApplication.Exit(exitCode);                // Quit Unity
```

### Delayed Execution
```csharp
EditorApplication.delayCall += () => {
    // Runs after current frame/recompilation
    Debug.Log("Delayed call executed");
};
```

---

## Menu Commands

| Menu | Action |
|------|--------|
| `H3M > AR Companion > Build and Run (to device)` | Build & install AR Companion |
| `H3M > AR Companion > Build Only (show in folder)` | Build without install |
| `H3M > AR Companion > Delete Build Folder` | Clean build artifacts |
| `Build > Build iOS` | Main app build |

---

## Quick Reference

| Feature | Package/Tool | Status |
|---------|--------------|--------|
| 3-finger debug | com.yasirkula.ingamedebugconsole | Installed, auto-injected |
| batch_execute | mcp__unity__batch_execute | Available via MCP |
| Runtime C# | Microsoft.CodeAnalysis.CSharp 5.0.0 | Installed via NuGet |
| EditorApplication | UnityEditor | Built-in |

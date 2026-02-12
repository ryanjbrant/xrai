# Unity Test Framework Reference (Unity 6 / 6000.3)

> Source: Unity Official Documentation (fetched 2026-02-12)
> Package: `com.unity.test-framework` v2.0.1-exp.2
> NUnit: Custom build based on NUnit 3.5

---

## Overview

The Unity Test Framework (UTF) tests code in Edit Mode, Play Mode, and on target platforms (Standalone, Android, iOS). It wraps a custom NUnit 3.5 build with Unity-specific extensions (coroutine tests, yield instructions, domain reload handling).

**Two test types:**
- **NUnit tests** (`[Test]`): Standard synchronous unit tests
- **Unity tests** (`[UnityTest]`): Coroutine-based, run via `EditorApplication.update` (Edit Mode) or as coroutines (Play Mode)

---

## Setup & Assembly Definitions

### Install
Package Manager > search "Test Framework". Included by default in Unity 6.

### Create Test Assembly

**Via Test Runner:** Window > General > Test Runner > "Create a new Test Assembly Folder"
**Via Menu:** Assets > Create > Testing > Test Assembly Folder

Generates a `Tests/` folder with an `.asmdef` referencing:
- `nunit.framework.dll`
- `UnityEngine.TestRunner`
- `UnityEditor.TestRunner` (Edit Mode only)

### Platform Settings in .asmdef
| Setting | Result |
|---------|--------|
| Editor only (checked) | Edit Mode tests |
| Any Platform / specific platform | Play Mode tests |

**Important:** Renaming the `.asmdef` file does NOT change the assembly Name property. Edit via Inspector or text editor.

### Create Tests

**Via Test Runner:** Select test assembly folder > "Create a new Test Script"
**Via Menu:** Assets > Create > Testing > C# Test Script

---

## Edit Mode vs Play Mode Tests

| Aspect | Edit Mode | Play Mode |
|--------|-----------|-----------|
| Assembly platform | Editor only | Any Platform |
| Execution | `EditorApplication.update` callbacks | Coroutines in game loop |
| `[UnityTest]` yield | Yields to editor update | Yields frames |
| MonoBehaviour lifecycle | Does NOT run (`Awake`/`Start` skip) | Runs normally |
| Domain reload | Can test via yield instructions | Happens on enter/exit |
| Attribute | Default | `[RequiresPlayMode]` on Editor assemblies |

**Play Mode in Editor:** Use `[RequiresPlayMode]` attribute on tests in Editor assemblies.
**Play Mode on Device:** Test Runner > Run Location: "On Player" (builds to active target platform). Both Editor and device must be on same network for results.

---

## Writing Tests

### Basic Test (NUnit)
```csharp
using NUnit.Framework;

[TestFixture]
public class MyTests
{
    [SetUp]
    public void Setup() { /* per-test setup */ }

    [TearDown]
    public void Teardown() { /* per-test cleanup */ }

    [Test]
    public void MyTest_DoesExpectedThing()
    {
        var result = MyClass.DoThing();
        Assert.AreEqual(expected, result);
    }
}
```

### Unity Coroutine Test
```csharp
using System.Collections;
using NUnit.Framework;
using UnityEngine.TestTools;

public class MyPlayModeTests
{
    [UnityTest]
    public IEnumerator MyTest_WaitsOneFrame()
    {
        // Arrange
        var go = new GameObject();
        yield return null; // wait one frame

        // Assert
        Assert.IsNotNull(go);
    }
}
```

### Async Test (.NET Task)
```csharp
using System.Threading.Tasks;
using NUnit.Framework;

public class MyAsyncTests
{
    [Test]
    public async Task MyAsyncTest()
    {
        var result = await SomeAsyncOperation();
        Assert.AreEqual(expected, result);
    }
}
```
Async tests run on main thread. Framework checks `Task.IsCompleted` each update cycle.

---

## Assertions

### Standard NUnit
```csharp
Assert.AreEqual(expected, actual);
Assert.IsTrue(condition);
Assert.IsNotNull(obj);
Assert.That(actual, Is.EqualTo(expected));
```

### LogAssert (Expected Log Messages)
```csharp
using UnityEngine.TestTools;

LogAssert.Expect(LogType.Log, "Log message");
Debug.Log("Log message");

LogAssert.Expect(LogType.Error, "Error message");
Debug.LogError("Error message");
```
- Call `LogAssert.Expect` BEFORE the code that logs
- Check runs at end of each frame
- Tests fail if expected messages don't appear OR unexpected error/exception logs occur

### Unity Type Comparers
```csharp
using UnityEngine.TestTools.Constraints;
using Is = UnityEngine.TestTools.Constraints.Is; // resolve ambiguity with NUnit.Is

// Tolerance-based comparison for Vector3, Color, Quaternion
Assert.That(actualVector, Is.EqualTo(expectedVector).Using(Vector3EqualityComparer.Instance));
// Or with custom tolerance:
var comparer = new Vector3EqualityComparer(0.01f);
Assert.That(actualVector, Is.EqualTo(expectedVector).Using(comparer));
```

---

## Parameterized Tests

```csharp
// TestCase (standard [Test] only)
[TestCase(1, 2, 3)]
[TestCase(-1, -1, -2)]
public void Add_ReturnsSum(int a, int b, int expected)
{
    Assert.AreEqual(expected, a + b);
}

// ValueSource (works with [UnityTest])
static int[] values = new int[] { 1, 5, 6 };

[UnityTest]
public IEnumerator TestWithValues([ValueSource(nameof(values))] int value)
{
    yield return null;
    Assert.IsTrue(value > 0);
}
```

**Limitation:** `[UnityTest]` only supports `ValueSource`, NOT `TestCase`.

**ParameterizedIgnore:** Selectively ignore tests based on parameter values.

---

## Setup & Teardown

### Per-Test (NUnit Standard)
| Attribute | Runs | Supports yield |
|-----------|------|----------------|
| `[SetUp]` | Before each test | No |
| `[TearDown]` | After each test | No |
| `[OneTimeSetUp]` | Before all tests in fixture | No |
| `[OneTimeTearDown]` | After all tests in fixture | No |

### Unity Extensions (Support Yield)
| Attribute | Runs | Supports yield |
|-----------|------|----------------|
| `[UnitySetUp]` | Before each test | Yes (IEnumerator) |
| `[UnityTearDown]` | After each test | Yes (IEnumerator) |

### Build-Time Setup/Cleanup
| Interface/Attribute | When |
|---------------------|------|
| `IPrebuildSetup` | Before test build |
| `IPostBuildCleanup` | After test run |
| `[PrebuildSetup("ClassName")]` | Attribute form |
| `[PostBuildCleanup("ClassName")]` | Attribute form |

Execution order: Attribute-defined setups first, then interface implementations (alphabetical within namespace). If multiple tests reference same setup, it runs once.

### Full Execution Order
1. `IApplyToContext` attributes
2. **`IOuterUnityTestAction.BeforeTest`**
3. `[UnitySetUp]`
4. `IWrapSetUpTearDown` attributes
5. `[SetUp]`
6. NUnit Action `BeforeTest`
7. `IWrapTestMethod` attributes
8. **Test execution**
9. NUnit Action `AfterTest`
10. `[TearDown]`
11. `[UnityTearDown]`
12. **`IOuterUnityTestAction.AfterTest`**

**Domain reload note:** `IOuterUnityTestAction` methods are NOT rerun during domain reloads. NUnit Action attributes ARE rerun.

---

## IOuterUnityTestAction

For code that must run outside test scope (before setup / after teardown):

```csharp
public class MyOuterAction : NUnitAttribute, IOuterUnityTestAction
{
    public IEnumerator BeforeTest(ITest test)
    {
        // Runs before UnitySetUp, can yield
        yield return null;
    }

    public IEnumerator AfterTest(ITest test)
    {
        // Runs after UnityTearDown, can yield
        yield return null;
    }
}
```

Apply as attribute: `[MyOuterAction]` on test class or method.

---

## Running Tests

### Test Runner Window
Window > General > Test Runner

- **Double-click** test name to run
- **Run All / Run Selected** buttons
- **Right-click > Run** for context menu
- **Filter:** Search box, mode checkboxes (EditMode/PlayMode), result icons

### Command Line

```bash
Unity -runTests -batchmode -projectPath /path/to/project \
  -testResults /path/to/results.xml \
  -testPlatform PlayMode
```

### All CLI Flags

| Flag | Description |
|------|-------------|
| `-runTests` | **Required.** Enables test execution |
| `-batchmode` | No UI prompts (required for CI) |
| `-testPlatform` | `EditMode`, `PlayMode`, or any `BuildTarget` value |
| `-testResults` | Output path for NUnit XML results |
| `-testFilter` | Semicolon-separated names or regex pattern |
| `-testCategory` | Semicolon-separated categories. Negate with `!` prefix |
| `-testNames` | Semicolon-separated full test names |
| `-assemblyNames` | Semicolon-separated test assembly names |
| `-assemblyType` | `EditorOnly` or `EditorAndPlatforms` |
| `-requiresPlayMode` | Filter: `true` / `false` / `unspecified` |
| `-runSynchronously` | All tests in single editor update (EditMode only) |
| `-buildPlayerPath` | Directory for built test player |
| `-testSettingsFile` | Path to `TestSettings.json` |
| `-playerHeartbeatTimeout` | Seconds to wait for player heartbeat (default: 600) |
| `-orderedTestListFile` | Path to `.txt` with ordered test names |
| `-androidAppBundle` | Build AAB instead of APK |
| `-forgetProjectPath` | Don't save project to launcher history |

### TestRunnerApi (Programmatic)
Run tests from C# code using `TestRunnerApi` class with `Filter` and `ExecutionSettings`.

### IDE Integration
JetBrains Rider supports direct UTF execution.

---

## Known Limitations (v2.0.1)

- `[UnityTest]` not supported on WSA platform
- No parameterized tests with `[UnityTest]` except `ValueSource`
- `[Repeat]` attribute unsupported
- Nested test fixtures can't run from Editor UI
- `[Retry]` in PlayMode causes `InvalidCastException`
- Runtime-generated parameterized tests fail

---

## Quick Patterns for Portals Project

### MonoBehaviour Testing Without Play Mode
```csharp
[Test]
public void TestMonoBehaviour_EditMode()
{
    var go = new GameObject();
    var comp = go.AddComponent<MyComponent>();
    comp.EnsureInitialized(); // Awake/Start don't run in Edit Mode!
    // ... assertions ...
    Object.DestroyImmediate(go); // NOT Destroy() in Edit Mode
}
```

### Testing ScriptableObjects
```csharp
[Test]
public void TestScriptableObject()
{
    var config = ScriptableObject.CreateInstance<MyConfig>();
    config.someValue = 42;
    Assert.AreEqual(42, config.someValue);
    Object.DestroyImmediate(config);
}
```

### Testing Bridge Messages (Portals-specific)
```csharp
[Test]
public void BridgeRouter_ParsesAddObject()
{
    var json = "{\"action\":\"add_object\",\"objectType\":\"cube\"}";
    var action = JsonConvert.DeserializeObject<SceneAction>(json);
    Assert.AreEqual("add_object", action.action);
    Assert.AreEqual("cube", action.objectType);
}
```

### Expecting Logs
```csharp
[Test]
public void Handler_LogsWarningOnInvalidInput()
{
    LogAssert.Expect(LogType.Warning, "Invalid bridge message");
    BridgeRouter.HandleMessage("{}");
}
```

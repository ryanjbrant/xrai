# Unity Test Framework — Patterns & CI Integration

**Created**: 2026-02-13
**Tags**: `#unity` `#testing` `#ci` `#automation` `#utf`
**Unity Version**: 6000.2+ (UTF 1.4.x stable, 2.0.x experimental)
**Sources**: [Unity How-To](https://unity.com/how-to/automated-tests-unity-test-framework), [QA Best Practices](https://unity.com/how-to/testing-and-quality-assurance-tips-unity-projects), [UTF 1.4 Docs](https://docs.unity3d.com/Packages/com.unity.test-framework@1.4/manual/index.html), [Edit vs Play Mode](https://docs.unity3d.com/6000.2/Documentation/Manual/test-framework/edit-mode-vs-play-mode-tests.html)

---

## Key Insight

> Unity Test Framework (NUnit-based) supports Edit Mode + Play Mode + standalone Player testing.
> Edit Mode = fast, editor-only, no coroutines. Play Mode = runtime, coroutines, multi-frame, device builds.
> Scene-based tests verify GameObjects exist and are wired correctly — critical for Portals bridge/VFX scenes.

---

## Test Types & When to Use

| Type | Speed | Runs In | Use For |
|------|-------|---------|---------|
| Edit Mode `[Test]` | Fastest | Editor only | Pure logic, ScriptableObjects, Editor extensions, data validation |
| Edit Mode `[UnityTest]` | Fast | Editor update loop | Tests needing `yield` in editor (rare) |
| Play Mode `[Test]` | Fast | Editor Play Mode | Simple runtime assertions (no multi-frame) |
| Play Mode `[UnityTest]` | Medium | Editor Play Mode / Player | Coroutine tests, multi-frame, WaitForSeconds, component lifecycle |
| Scene-based | Medium | Editor | Verify scene contents (GameObjects, components, wiring) |
| Standalone Player | Slow | Device build | Platform-specific behavior, native plugins, AR features |

**Rule of thumb**: Use `[Test]` unless you need `yield`. Use Edit Mode unless you need runtime behavior.

---

## Assembly Setup (Critical)

Tests MUST live in separate assembly definitions. Cannot reference `Assembly-CSharp.dll` directly.

```
Assets/
  Scripts/
    MyGame.asmdef          ← game code
  Tests/
    EditMode/
      EditTests.asmdef     ← includePlatforms: ["Editor"]
    PlayMode/
      PlayTests.asmdef     ← includePlatforms: [] (empty = all)
```

**EditTests.asmdef**:
```json
{
  "name": "EditTests",
  "references": ["MyGame"],
  "includePlatforms": ["Editor"],
  "defineConstraints": ["UNITY_INCLUDE_TESTS"]
}
```

**PlayTests.asmdef**:
```json
{
  "name": "PlayTests",
  "references": ["MyGame"],
  "includePlatforms": [],
  "defineConstraints": ["UNITY_INCLUDE_TESTS"],
  "optionalUnityReferences": ["TestAssemblies"]
}
```

**For packages** (e.g., InputSystem): add to `manifest.json`:
```json
"testables": ["com.unity.inputsystem"]
```

---

## Core Attributes

| Attribute | Mode | Purpose |
|-----------|------|---------|
| `[Test]` | Both | Standard NUnit test (preferred default) |
| `[UnityTest]` | Both | Coroutine test (yields frames/time) |
| `[TestFixture]` | Both | Group related tests with shared setup |
| `[SetUp]` / `[TearDown]` | Both | Per-test init/cleanup |
| `[OneTimeSetUp]` / `[OneTimeTearDown]` | Both | Per-fixture init/cleanup |
| `[UnitySetUp]` / `[UnityTearDown]` | Play | Coroutine setup/teardown |
| `[RequiresPlayMode]` | Edit→Play | Force Edit Mode assembly to run in Play Mode |
| `[Category("name")]` | Both | Tag for filtering (`-testCategory`) |
| `[Timeout(ms)]` | Both | Per-test timeout |

---

## Scene-Based Testing (Portals-relevant)

Verify that scenes have correct GameObjects, components, and wiring:

```csharp
using NUnit.Framework;
using UnityEditor.SceneManagement;
using UnityEngine;

[TestFixture]
public class SceneValidationTests
{
    [SetUp]
    public void LoadScene()
    {
        EditorSceneManager.OpenScene("Assets/Scenes/MainScene.unity");
    }

    [TearDown]
    public void Cleanup()
    {
        EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
    }

    [Test]
    public void BridgeTarget_ExistsInScene()
    {
        var bridge = GameObject.Find("BridgeTarget");
        Assert.That(bridge, Is.Not.Null, "BridgeTarget missing from scene");
    }

    [Test]
    public void BridgeTarget_HasRequiredComponents()
    {
        var bridge = GameObject.Find("BridgeTarget");
        Assert.That(bridge.GetComponent<BridgeTarget>(), Is.Not.Null);
    }
}
```

**Portals application**: Validate every scene has BridgeTarget, VFX components, AR managers — catches deleted/missing references at test time instead of device time.

---

## Command Line (CI/CD)

```bash
# Edit Mode tests
Unity -batchmode -quit -runTests \
  -projectPath /path/to/project \
  -testPlatform EditMode \
  -testResults ./results-edit.xml \
  -logFile /tmp/test-edit.log

# Play Mode tests (in editor)
Unity -batchmode -quit -runTests \
  -projectPath /path/to/project \
  -testPlatform PlayMode \
  -testResults ./results-play.xml

# Play Mode on iOS device
Unity -batchmode -quit -runTests \
  -projectPath /path/to/project \
  -testPlatform iOS \
  -testResults ./results-ios.xml

# Filter specific tests
Unity -batchmode -quit -runTests \
  -testFilter "BridgeTests;SceneValidation" \
  -projectPath /path/to/project

# Filter by category
Unity -batchmode -quit -runTests \
  -testCategory "Smoke;Bridge" \
  -projectPath /path/to/project

# Negate filter (run everything EXCEPT)
Unity -batchmode -quit -runTests \
  -testFilter "!SlowIntegrationTests" \
  -projectPath /path/to/project
```

**Key flags**:

| Flag | Purpose |
|------|---------|
| `-runTests` | Triggers test execution |
| `-testPlatform EditMode/PlayMode/<BuildTarget>` | Which mode (default: EditMode) |
| `-testFilter "name;name"` | Semicolon-separated names or regex |
| `-testCategory "cat;cat"` | Filter by `[Category]` attribute |
| `-testResults path.xml` | NUnit XML output for CI parsers |
| `-batchmode` | No GUI (required for CI) |
| `-quit` | Exit after tests complete |
| `-logFile path` | Capture full Unity log |

---

## CI/CD Gotchas

| Issue | Fix |
|-------|-----|
| `WaitForEndOfFrame` fails in batchmode | Use `WaitForSeconds` instead — no frames in headless mode |
| Play Mode tests need GPU | Use `-nographics` only for Edit Mode; Play Mode may need a display |
| Standalone test results not captured | Use `ITestPlayerBuildModifier` to split build+run phases |
| Tests hang in CI | Add `-timeout` flag or `[Timeout(ms)]` attribute per test |
| `Assembly-CSharp` reference | Move testable code into custom .asmdef; tests can't reference default assembly |

---

## Mocking & Dependencies

- **Moq** or **NSubstitute** for interface mocking
- Use constructor injection or `[Inject]` for testable architecture
- For Unity singletons: use `EnsureInitialized()` pattern (see project CLAUDE.md learned rules)
- For MonoBehaviours: test logic in plain C# classes, keep MonoBehaviours thin

---

## Performance Testing Extension

Install `com.unity.test-framework.performance` for benchmarks:

```csharp
[Test, Performance]
public void MeasureBridgeMessageParsing()
{
    Measure.Method(() => {
        BridgeTarget.ParseMessage(testPayload);
    })
    .WarmupCount(5)
    .MeasurementCount(20)
    .Run();
}
```

---

## Code Coverage

Install `com.unity.testtools.codecoverage` to visualize test coverage:
- Window > Analysis > Code Coverage
- Generates HTML reports showing uncovered lines
- Useful for identifying untested bridge/VFX paths

---

## Portals-Specific Test Strategy

| Layer | Test Type | What to verify |
|-------|-----------|---------------|
| Bridge messages | Edit Mode `[Test]` | JSON serialization, message routing, payload structure |
| SceneAction pipeline | Edit Mode `[Test]` | `aiSceneComposer` → `SceneAction` generation |
| Voice → Action | Edit Mode `[Test]` | `semanticToSceneActions` mapping |
| Scene wiring | Scene-based `[Test]` | BridgeTarget, VFX, AR managers present in all build scenes |
| Component lifecycle | Play Mode `[UnityTest]` | Awake/Start/OnDestroy, singleton init, null safety |
| VFX bindings | Play Mode `[UnityTest]` | Texture binding, property IDs resolve, no null VFX |
| Full integration | Standalone Player (iOS) | AR camera, native bridge, device performance |

---

## See Also — Test/Debug Automation Network

| Doc | What it covers |
|-----|---------------|
| `_DEV_ITERATION_WORKFLOWS.md` | Fastest feedback loops + Auto Workflow Matrix |
| `_TEST_DEBUG_AUTOMATION_PATTERNS.md` | Pre-agent vs agent-era patterns, 5 mandatory questions |
| `_AUTO_FIX_PATTERNS.md` | Error→fix lookup for common Unity issues |
| `_CLAUDE_CODE_UNITY_WORKFLOW.md` | MCP-first dev loop with compile/console/fix cycle |
| `_UNITY_DEBUGGING_MASTER.md` | Log locations, profiler, device debugging |
| `~/GLOBAL_RULES.md` §Test Ladder | L1-L5 auto-advance enforcement |

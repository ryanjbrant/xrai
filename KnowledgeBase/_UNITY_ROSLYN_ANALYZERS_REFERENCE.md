# Roslyn Analyzers & Source Generators in Unity (Unity 6 / 6000.3)

> Source: Unity Official Docs + unity.com/how-to (fetched 2026-02-12)
> Compatible IDEs: Visual Studio, JetBrains Rider

---

## Overview

Roslyn analyzers inspect C# code in real-time using the Roslyn compiler platform APIs. They provide:
- Code style enforcement (squiggles, suggestions)
- Quality/bug detection via predefined rules
- Configurable severity per rule
- IntelliSense integration with potential fixes

Source generators use the same platform to emit C# source at compile time.

---

## Installing an Existing Analyzer

### Step 1: Get the DLL
Download from NuGet as `.nupkg` (rename to `.zip`). Extract and find DLLs in `analyzers/dotnet/cs/`.

### Step 2: Import into Unity
Copy `.dll` files into `Assets/` (or a subfolder).

### Step 3: Configure Plugin Inspector
Select each `.dll` in Unity:
1. **Select platforms for plugin** → Disable **Any Platform**
2. **Include Platforms** → Disable **Editor** and **Standalone**

### Step 4: Apply Asset Label
1. Click blue label icon in Inspector
2. Type exactly: **`RoslynAnalyzer`** (case-sensitive)
3. Press Return

Unity recognizes the label and treats the DLL as an analyzer/source generator.

### Step 5: Verify
Create a test script that violates an analyzer rule. Check Console for warnings on recompile.

---

## Analyzer Scope

| DLL Location | Scope |
|-------------|-------|
| Root `Assets/` or folder without `.asmdef` | **All assemblies** in project |
| Folder with `.asmdef` | Only that assembly + assemblies referencing it |

This lets package authors ship analyzers that only target their own API usage.

---

## Ruleset Files

Ruleset files configure which rules are active and their severity.

### File Naming & Placement

| File | Applies To |
|------|-----------|
| `Assets/Default.ruleset` | All predefined assemblies and all `.asmdef` assemblies |
| `Assets/Assembly-CSharp.ruleset` | Overrides `Default.ruleset` for `Assembly-CSharp` |
| `Assets/Assembly-CSharp-firstpass.ruleset` | For firstpass assembly |
| `Assets/Assembly-CSharp-Editor.ruleset` | For Editor assembly |
| `Assets/Assembly-CSharp-Editor-firstpass.ruleset` | For Editor firstpass |

Subfolder rulesets override parent directory rules. Assembly-specific rulesets override `Default.ruleset`.

### XML Format

```xml
<?xml version="1.0" encoding="utf-8"?>
<RuleSet Name="My Project Rules" Description="Custom rules" ToolsVersion="10.0">
  <Rules AnalyzerId="ErrorProne.NET.CodeAnalyzers"
         RuleNamespace="ErrorProne.NET.CodeAnalyzers">
    <Rule Id="ERP021" Action="Error" />
    <Rule Id="EPC12" Action="None" />
  </Rules>
  <Rules AnalyzerId="Microsoft.CodeAnalysis.CSharp"
         RuleNamespace="Microsoft.CodeAnalysis.CSharp">
    <Rule Id="CS8600" Action="Warning" />
  </Rules>
</RuleSet>
```

### Severity Levels (`Action` attribute)

| Action | Effect |
|--------|--------|
| `Error` | Fails compilation |
| `Warning` | Shows warning |
| `Info` | Informational message |
| `Hidden` | Hidden from user (still runs) |
| `None` | Rule completely suppressed |

---

## Creating a Custom Source Generator

### Project Setup
1. Create C# Class Library targeting **.NET Standard 2.0**
2. Install NuGet: `Microsoft.CodeAnalysis.CSharp` **version 4.3** (required for Unity compat)

### Implementation

```csharp
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Text;
using System.Text;

[Generator]
public class MyGenerator : ISourceGenerator
{
    public void Initialize(GeneratorInitializationContext context)
    {
        // Optional: register syntax receivers for incremental generation
    }

    public void Execute(GeneratorExecutionContext context)
    {
        var source = @"
namespace Generated
{
    public static class Info
    {
        public static string GetTimestamp() => """ + System.DateTime.Now + @""";
    }
}";
        context.AddSource("MyGenerator.g.cs",
            SourceText.From(source, Encoding.UTF8));
    }
}
```

### Deploy to Unity
1. Build in **Release** mode
2. Copy `bin/Release/netstandard2.0/MyGenerator.dll` into `Assets/`
3. Plugin Inspector: disable all platforms
4. Asset label: `RoslynAnalyzer`

### CS0436 Warning Fix
If generator injects into multiple assemblies, you get duplicate type warnings. Fix:
- Make generated classes `internal` instead of `public`
- Or generate unique names per assembly

---

## Configuration in IDE

### Visual Studio
`Tools > Options > Text Editor > C# > Code Style > General`

### EditorConfig (Project-Level)
`.editorconfig` in project root overrides IDE settings for all contributors. Nested `.editorconfig` in subdirectories overrides parent.

Add via: Solution Explorer > **New Item > editorconfig File**

---

## Diagnostics & Performance

### Monitor Analyzer Timing
1. **Edit > Preferences** (macOS: **Unity > Settings**)
2. **Diagnostic Switches**
3. Enable **EnableDomainReloadTimings**

Shows per-analyzer execution time in Console. Use this to identify slow analyzers that hurt iteration time.

---

## Quick Setup for Portals Project

### Recommended Analyzers

| Analyzer | NuGet Package | Purpose |
|----------|--------------|---------|
| ErrorProne.NET | `ErrorProne.NET.CoreAnalyzers` | Catches common C# mistakes |
| Unity Analyzers | `Microsoft.Unity.Analyzers` | Unity-specific patterns (UNT0001-UNT0026) |
| Nullable | Built-in (C# 8+) | Null reference safety |

### Minimal Setup
```
Assets/
  Analyzers/
    ErrorProne.NET.Core.dll        [label: RoslynAnalyzer]
    Microsoft.Unity.Analyzers.dll  [label: RoslynAnalyzer]
  Default.ruleset
```

### Default.ruleset for Portals
```xml
<?xml version="1.0" encoding="utf-8"?>
<RuleSet Name="Portals Rules" Description="Portals project rules" ToolsVersion="10.0">
  <Rules AnalyzerId="Microsoft.Unity.Analyzers"
         RuleNamespace="Microsoft.Unity.Analyzers">
    <!-- Enforce: Don't use string methods for CompareTag -->
    <Rule Id="UNT0002" Action="Warning" />
    <!-- Enforce: Don't use AddComponent with string -->
    <Rule Id="UNT0014" Action="Error" />
    <!-- Suppress: Nullable value type usage (noisy) -->
    <Rule Id="UNT0025" Action="None" />
  </Rules>
</RuleSet>
```

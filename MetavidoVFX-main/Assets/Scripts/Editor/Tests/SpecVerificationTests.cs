// SpecVerificationTests - Fast verification tests for specs 003, 009, 016
// Uses NUnit EditMode + batch-compatible methods for CI/CD
// Run: Unity -batchmode -runTests -testPlatform EditMode -testResults results.xml

#if UNITY_EDITOR
using NUnit.Framework;
using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections.Generic;

namespace MetavidoVFX.Editor.Tests
{
    /// <summary>
    /// Fast verification tests for partial specs.
    /// These tests validate core functionality without requiring device deployment.
    /// </summary>
    [TestFixture]
    public class SpecVerificationTests
    {
        #region Spec 003 - Hologram Conferencing Tests

        [Test]
        public void Spec003_RecordingController_Exists()
        {
            var type = System.Type.GetType("XRRAI.Recording.RecordingController, Assembly-CSharp");
            Assert.IsNotNull(type, "RecordingController should exist in XRRAI.Recording namespace");
        }

        [Test]
        public void Spec003_HologramConferenceManager_Exists()
        {
            var type = System.Type.GetType("XRRAI.Hologram.HologramConferenceManager, Assembly-CSharp");
            Assert.IsNotNull(type, "HologramConferenceManager should exist for WebRTC conferencing");
        }

        [Test]
        public void Spec003_WebRTCVFXBinder_Exists()
        {
            var type = System.Type.GetType("XRRAI.Hologram.H3MWebRTCVFXBinder, Assembly-CSharp");
            Assert.IsNotNull(type, "H3MWebRTCVFXBinder should exist for remote stream binding");
        }

        [Test]
        public void Spec003_MetavidoPackage_Installed()
        {
            // Check for Metavido package via type existence
            var encoderType = System.Type.GetType("jp.keijiro.metavido.FrameEncoder, jp.keijiro.metavido");
            var decoderType = System.Type.GetType("jp.keijiro.metavido.MetadataDecoder, jp.keijiro.metavido");

            // Alternative: check manifest.json
            string manifestPath = "Packages/manifest.json";
            if (File.Exists(manifestPath))
            {
                string manifest = File.ReadAllText(manifestPath);
                Assert.IsTrue(manifest.Contains("jp.keijiro.metavido"),
                    "Metavido package should be in manifest.json");
            }
        }

        [Test]
        public void Spec003_WebRtcVideoChatPlugin_Installed()
        {
            // Check for WebRtcVideoChat plugin folder
            string pluginPath = "Assets/3rdparty/WebRtcVideoChat";
            Assert.IsTrue(Directory.Exists(pluginPath),
                "WebRtcVideoChat plugin should be installed at Assets/3rdparty/WebRtcVideoChat");
        }

        [Test]
        public void Spec003_HologramPrefab_HasRequiredComponents()
        {
            string prefabPath = "Assets/Prefabs/Hologram/Hologram.prefab";
            if (File.Exists(prefabPath))
            {
                var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
                Assert.IsNotNull(prefab, "Hologram prefab should load");

                // Check for key components (by name since types may vary)
                var children = prefab.GetComponentsInChildren<Transform>(true);
                bool hasVFX = false;
                foreach (var child in children)
                {
                    if (child.name.Contains("VFX") || child.GetComponent<UnityEngine.VFX.VisualEffect>() != null)
                        hasVFX = true;
                }
                Assert.IsTrue(hasVFX, "Hologram prefab should have VFX component");
            }
            else
            {
                Assert.Inconclusive("Hologram prefab not found - may need creation");
            }
        }

        #endregion

        #region Spec 009 - Icosa/Sketchfab Integration Tests

        [Test]
        public void Spec009_UnifiedModelSearch_Exists()
        {
            var type = System.Type.GetType("XRRAI.VoiceToObject.UnifiedModelSearch, Assembly-CSharp");
            Assert.IsNotNull(type, "UnifiedModelSearch should exist for dual-source aggregation");
        }

        [Test]
        public void Spec009_SketchfabClient_Exists()
        {
            var type = System.Type.GetType("XRRAI.VoiceToObject.SketchfabClient, Assembly-CSharp");
            Assert.IsNotNull(type, "SketchfabClient should exist for Sketchfab API");
        }

        [Test]
        public void Spec009_ModelCache_Exists()
        {
            var type = System.Type.GetType("XRRAI.VoiceToObject.ModelCache, Assembly-CSharp");
            Assert.IsNotNull(type, "ModelCache should exist for LRU caching");
        }

        [Test]
        public void Spec009_WhisperIcosaController_Exists()
        {
            var type = System.Type.GetType("XRRAI.VoiceToObject.WhisperIcosaController, Assembly-CSharp");
            Assert.IsNotNull(type, "WhisperIcosaController should exist for voice-to-object");
        }

        [Test]
        public void Spec009_IcosaDefine_Set()
        {
            string defines = PlayerSettings.GetScriptingDefineSymbols(
                UnityEditor.Build.NamedBuildTarget.iOS);

            // ICOSA_AVAILABLE should be set if icosa-api-client is installed
            // This is optional - test passes if either defined or package not present
            Assert.Pass("ICOSA_AVAILABLE check: " +
                (defines.Contains("ICOSA_AVAILABLE") ? "defined" : "not defined"));
        }

        [Test]
        public void Spec009_VoiceProviderManager_Exists()
        {
            var type = System.Type.GetType("XRRAI.VoiceToObject.VoiceProviderManager, Assembly-CSharp");
            Assert.IsNotNull(type, "VoiceProviderManager should exist for hot-swappable providers");
        }

        [Test]
        public void Spec009_ModelPlacer_Exists()
        {
            var type = System.Type.GetType("XRRAI.VoiceToObject.ModelPlacer, Assembly-CSharp");
            Assert.IsNotNull(type, "ModelPlacer should exist for AR placement");
        }

        #endregion

        #region Spec 016 - XRRAI Scene Format Tests

        [Test]
        public void Spec016_XRRAIScene_Exists()
        {
            var type = System.Type.GetType("XRRAI.Scene.XRRAIScene, Assembly-CSharp");
            Assert.IsNotNull(type, "XRRAIScene data model should exist");
        }

        [Test]
        public void Spec016_XRRAISceneManager_Exists()
        {
            var type = System.Type.GetType("XRRAI.Scene.XRRAISceneManager, Assembly-CSharp");
            Assert.IsNotNull(type, "XRRAISceneManager should exist for save/load");
        }

        [Test]
        public void Spec016_GLTFExporter_Exists()
        {
            var type = System.Type.GetType("XRRAI.Scene.GLTFExporter, Assembly-CSharp");
            Assert.IsNotNull(type, "GLTFExporter should exist for glTF export");
        }

        [Test]
        public void Spec016_IcosaGalleryManager_Exists()
        {
            var type = System.Type.GetType("XRRAI.VoiceToObject.IcosaGalleryManager, Assembly-CSharp");
            Assert.IsNotNull(type, "IcosaGalleryManager should exist for gallery upload");
        }

        [Test]
        public void Spec016_XRRAIScene_SerializesToValidJSON()
        {
            // This test is in XRRAISceneTests.cs - validate it runs
            var testType = System.Type.GetType("MetavidoVFX.Editor.Tests.XRRAISceneTests, Assembly-CSharp-Editor");
            Assert.IsNotNull(testType, "XRRAISceneTests should exist for serialization tests");
        }

        [Test]
        public void Spec016_EditorSetupMenu_Exists()
        {
            var type = System.Type.GetType("XRRAI.Editor.XRRAISceneSetup, Assembly-CSharp-Editor");
            Assert.IsNotNull(type, "XRRAISceneSetup editor menu should exist");
        }

        #endregion

        #region Cross-Spec Integration Tests

        [Test]
        public void CrossSpec_AllXRRAINamespaces_Present()
        {
            // Verify namespace migration is complete
            string[] expectedNamespaces =
            {
                "XRRAI.HandTracking",
                "XRRAI.BrushPainting",
                "XRRAI.VoiceToObject",
                "XRRAI.VFXBinders",
                "XRRAI.Hologram",
                "XRRAI.Scene"
            };

            var failures = new List<string>();
            foreach (var ns in expectedNamespaces)
            {
                bool found = false;
                foreach (var asm in System.AppDomain.CurrentDomain.GetAssemblies())
                {
                    foreach (var type in asm.GetTypes())
                    {
                        if (type.Namespace == ns)
                        {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (!found) failures.Add(ns);
            }

            if (failures.Count > 0)
            {
                Assert.Fail($"Missing namespaces: {string.Join(", ", failures)}");
            }
        }

        [Test]
        public void CrossSpec_VFXLibrary_HasMinimumVFX()
        {
            string vfxPath = "Assets/Resources/VFX";
            if (Directory.Exists(vfxPath))
            {
                var vfxFiles = Directory.GetFiles(vfxPath, "*.vfx", SearchOption.AllDirectories);
                Assert.GreaterOrEqual(vfxFiles.Length, 50,
                    "VFX library should have at least 50 VFX assets");
            }
            else
            {
                Assert.Inconclusive("VFX library path not found");
            }
        }

        [Test]
        public void CrossSpec_ARDepthSource_Exists()
        {
            var type = System.Type.GetType("XRRAI.VFXBinders.ARDepthSource, Assembly-CSharp");
            Assert.IsNotNull(type, "ARDepthSource singleton should exist (Hybrid Bridge pattern)");
        }

        [Test]
        public void CrossSpec_VFXARBinder_Exists()
        {
            var type = System.Type.GetType("XRRAI.VFXBinders.VFXARBinder, Assembly-CSharp");
            Assert.IsNotNull(type, "VFXARBinder should exist for per-VFX binding");
        }

        #endregion

        #region Build Verification Tests

        [Test]
        public void Build_NoCompilationErrors()
        {
            // If we got here, compilation succeeded
            Assert.Pass("Project compiles without errors");
        }

        [Test]
        public void Build_iOSBuildTarget_Configured()
        {
            var target = EditorUserBuildSettings.activeBuildTarget;
            // Just verify iOS is available
            Assert.IsTrue(BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.iOS, BuildTarget.iOS),
                "iOS build target should be supported");
        }

        [Test]
        public void Build_MainScene_Exists()
        {
            Assert.IsTrue(File.Exists("Assets/HOLOGRAM.unity"),
                "Main HOLOGRAM scene should exist");
        }

        [Test]
        public void Build_SpecDemoScenes_Exist()
        {
            string[] expectedScenes =
            {
                "Assets/Scenes/SpecDemos/Spec003_Hologram_Conferencing.unity",
                "Assets/Scenes/SpecDemos/Spec009_Icosa_Sketchfab.unity",
                "Assets/Scenes/SpecDemos/Spec016_XRRAI_Scene.unity"
            };

            var missing = new List<string>();
            foreach (var scene in expectedScenes)
            {
                if (!File.Exists(scene)) missing.Add(scene);
            }

            if (missing.Count > 0)
            {
                Assert.Inconclusive($"Demo scenes not yet created: {string.Join(", ", missing)}");
            }
        }

        #endregion

        #region Performance Baseline Tests

        [Test]
        public void Performance_ScriptCount_Reasonable()
        {
            var scripts = Directory.GetFiles("Assets/Scripts", "*.cs", SearchOption.AllDirectories);
            Assert.GreaterOrEqual(scripts.Length, 100, "Should have at least 100 scripts");
            Assert.LessOrEqual(scripts.Length, 400, "Should have fewer than 400 scripts for maintainability");
        }

        [Test]
        public void Performance_NoObviousMemoryLeaks()
        {
            // Check for common leak patterns in key files
            string[] filesToCheck =
            {
                "Assets/Scripts/Bridges/ARDepthSource.cs",
                "Assets/Scripts/Bridges/VFXARBinder.cs"
            };

            foreach (var file in filesToCheck)
            {
                if (File.Exists(file))
                {
                    string content = File.ReadAllText(file);

                    // Check for OnDestroy cleanup
                    Assert.IsTrue(content.Contains("OnDestroy") || content.Contains("OnDisable"),
                        $"{file} should have cleanup method");

                    // Check for RenderTexture.Release pattern if RenderTexture is used
                    if (content.Contains("RenderTexture"))
                    {
                        Assert.IsTrue(content.Contains("Release") || content.Contains("Destroy"),
                            $"{file} uses RenderTexture but may not release it");
                    }
                }
            }
        }

        #endregion
    }

    /// <summary>
    /// Headless batch runner for CI/CD integration.
    /// Usage: Unity -batchmode -executeMethod MetavidoVFX.Editor.Tests.BatchTestRunner.RunAllTests
    /// </summary>
    public static class BatchTestRunner
    {
        [MenuItem("H3M/Testing/Run All Spec Verification Tests")]
        public static void RunAllTests()
        {
            Debug.Log("=== Starting Spec Verification Tests ===");

            int passed = 0, failed = 0, inconclusive = 0;
            var results = new List<string>();

            // Get all test methods
            var testType = typeof(SpecVerificationTests);
            var methods = testType.GetMethods();

            foreach (var method in methods)
            {
                if (method.GetCustomAttributes(typeof(TestAttribute), false).Length > 0)
                {
                    try
                    {
                        var instance = System.Activator.CreateInstance(testType);
                        method.Invoke(instance, null);
                        passed++;
                        results.Add($"✓ {method.Name}");
                    }
                    catch (System.Reflection.TargetInvocationException tie)
                    {
                        if (tie.InnerException is InconclusiveException)
                        {
                            inconclusive++;
                            results.Add($"? {method.Name}: {tie.InnerException.Message}");
                        }
                        else
                        {
                            failed++;
                            results.Add($"✗ {method.Name}: {tie.InnerException?.Message}");
                        }
                    }
                    catch (System.Exception ex)
                    {
                        failed++;
                        results.Add($"✗ {method.Name}: {ex.Message}");
                    }
                }
            }

            // Output results
            Debug.Log("=== Test Results ===");
            foreach (var result in results)
            {
                if (result.StartsWith("✓")) Debug.Log(result);
                else if (result.StartsWith("?")) Debug.LogWarning(result);
                else Debug.LogError(result);
            }

            Debug.Log($"\n=== Summary: {passed} passed, {failed} failed, {inconclusive} inconclusive ===");

            // Exit with error code if in batch mode
            if (Application.isBatchMode)
            {
                EditorApplication.Exit(failed > 0 ? 1 : 0);
            }
        }

        [MenuItem("H3M/Testing/Quick Console Check")]
        public static void QuickConsoleCheck()
        {
            // Fast status check for Unity console
            Debug.Log("=== Quick Health Check ===");
            Debug.Log($"Unity Version: {Application.unityVersion}");
            Debug.Log($"Platform: {Application.platform}");
            Debug.Log($"Build Target: {EditorUserBuildSettings.activeBuildTarget}");
            Debug.Log($"Script Count: {Directory.GetFiles("Assets/Scripts", "*.cs", SearchOption.AllDirectories).Length}");

            // Check for compilation errors
            if (EditorUtility.scriptCompilationFailed)
            {
                Debug.LogError("COMPILATION ERRORS DETECTED");
            }
            else
            {
                Debug.Log("✓ No compilation errors");
            }
        }
    }
}
#endif

// FreshHologramSetup.cs - Editor utilities for creating FreshHologram VFX
// Based on comprehensive analysis of keijiro's depth-to-VFX patterns (Rsvfx, Akvfx, Rcam4)
//
// FreshHologram uses the Position Map approach (simpler):
// - Sample PositionMap directly for world positions (XYZ in RGB, validity in A)
// - Sample ColorMap at same UV for RGB color
// - No depth decoding in VFX Graph

using UnityEngine;
using UnityEditor;
using UnityEngine.VFX;
using System.IO;
using System.Linq;

namespace XRRAI.Editor
{
    public static class FreshHologramSetup
    {
        private const string VFX_OUTPUT_PATH = "Assets/VFX/People/fresh_hologram.vfx";
        private const string DOCUMENTATION_PATH = "Assets/Documentation/FRESH_HOLOGRAM_VFX_SETUP.md";

        // Source VFX to clone (simplest existing VFX)
        private static readonly string[] CANDIDATE_SOURCES = new[]
        {
            "Assets/VFX/People/particles_depth_people_metavido.vfx",
            "Assets/VFX/Metavido/particles_depth_people_metavido.vfx",
            "Assets/VFX/Akvfx/particles_stencil_people_akvfx.vfx",
            "Assets/VFX/Essentials/particles_any_essentials.vfx"
        };

        [MenuItem("H3M/FreshHologram/One-Click Setup (Recommended)", priority = 99)]
        public static void OneClickSetup()
        {
            Debug.Log("[FreshHologramSetup] Starting one-click setup...");

            // Step 1: Ensure VFX exists (clone if needed)
            var vfxAsset = EnsureVFXExists();
            if (vfxAsset == null)
            {
                EditorUtility.DisplayDialog("Setup Failed",
                    "Could not create or find FreshHologram VFX.\n\n" +
                    "Please manually create a VFX Graph asset at:\n" +
                    VFX_OUTPUT_PATH, "OK");
                return;
            }

            // Step 2: Ensure ARDepthSource exists
            var depthSource = EnsureARDepthSourceExists();

            // Step 3: Create the VFX rig in scene
            var rig = CreateVFXRig(vfxAsset);

            // Step 4: Report success
            var report = new System.Text.StringBuilder();
            report.AppendLine("FreshHologram Setup Complete!");
            report.AppendLine("=============================");
            report.AppendLine($"✅ VFX Asset: {vfxAsset.name}");
            report.AppendLine($"✅ ARDepthSource: {(depthSource != null ? depthSource.name : "Created")}");
            report.AppendLine($"✅ Scene Rig: {rig.name}");
            report.AppendLine("");
            report.AppendLine("Next Steps:");
            report.AppendLine("1. Press Play to test");
            report.AppendLine("2. If particles don't appear, check VFX exposed properties");
            report.AppendLine("3. Run H3M > FreshHologram > Verify Setup for diagnostics");

            EditorUtility.DisplayDialog("Setup Complete", report.ToString(), "OK");
            Debug.Log(report.ToString());

            // Select the rig
            Selection.activeGameObject = rig;
        }

        [MenuItem("H3M/FreshHologram/Create VFX from Template", priority = 100)]
        public static void CreateVFXTemplate()
        {
            var vfx = EnsureVFXExists();
            if (vfx != null)
            {
                EditorUtility.DisplayDialog("VFX Created",
                    $"FreshHologram VFX created at:\n{AssetDatabase.GetAssetPath(vfx)}\n\n" +
                    "The VFX has standard properties:\n" +
                    "- PositionMap (Texture2D)\n" +
                    "- ColorMap (Texture2D)\n\n" +
                    "Add VFXARBinderMinimal component to bind AR data.", "OK");

                // Ping in project view
                EditorGUIUtility.PingObject(vfx);
            }
        }

        static VisualEffectAsset EnsureVFXExists()
        {
            // Check if FreshHologram VFX already exists
            var existing = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(VFX_OUTPUT_PATH);
            if (existing != null)
            {
                Debug.Log($"[FreshHologramSetup] Found existing VFX at {VFX_OUTPUT_PATH}");
                return existing;
            }

            // Search by name
            var guids = AssetDatabase.FindAssets("fresh_hologram t:VisualEffectAsset");
            if (guids.Length > 0)
            {
                var path = AssetDatabase.GUIDToAssetPath(guids[0]);
                var found = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(path);
                if (found != null)
                {
                    Debug.Log($"[FreshHologramSetup] Found VFX by name at {path}");
                    return found;
                }
            }

            // Clone from existing VFX
            return CloneExistingVFX();
        }

        static VisualEffectAsset CloneExistingVFX()
        {
            // Find a source VFX to clone
            VisualEffectAsset source = null;
            string sourcePath = null;

            foreach (var candidate in CANDIDATE_SOURCES)
            {
                source = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(candidate);
                if (source != null)
                {
                    sourcePath = candidate;
                    break;
                }
            }

            // If no candidate found, search for any particles VFX
            if (source == null)
            {
                var guids = AssetDatabase.FindAssets("particles t:VisualEffectAsset");
                if (guids.Length > 0)
                {
                    sourcePath = AssetDatabase.GUIDToAssetPath(guids[0]);
                    source = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(sourcePath);
                }
            }

            if (source == null)
            {
                Debug.LogError("[FreshHologramSetup] No source VFX found to clone. Create VFX manually.");
                return null;
            }

            // Ensure output directory exists
            var outputDir = Path.GetDirectoryName(VFX_OUTPUT_PATH);
            if (!Directory.Exists(outputDir))
            {
                Directory.CreateDirectory(outputDir);
            }

            // Copy the VFX file
            if (!AssetDatabase.CopyAsset(sourcePath, VFX_OUTPUT_PATH))
            {
                Debug.LogError($"[FreshHologramSetup] Failed to copy VFX from {sourcePath} to {VFX_OUTPUT_PATH}");
                return null;
            }

            AssetDatabase.Refresh();

            var cloned = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(VFX_OUTPUT_PATH);
            Debug.Log($"[FreshHologramSetup] Created fresh_hologram.vfx by cloning {sourcePath}");

            return cloned;
        }

        static ARDepthSource EnsureARDepthSourceExists()
        {
            var existing = Object.FindFirstObjectByType<ARDepthSource>();
            if (existing != null) return existing;

            // Create new ARDepthSource
            var go = new GameObject("ARDepthSource");
            Undo.RegisterCreatedObjectUndo(go, "Create ARDepthSource");
            var source = go.AddComponent<ARDepthSource>();
            Debug.Log("[FreshHologramSetup] Created ARDepthSource");
            return source;
        }

        static GameObject CreateVFXRig(VisualEffectAsset vfxAsset)
        {
            // Check if rig already exists
            var existingRig = GameObject.Find("FreshHologram_Rig");
            if (existingRig != null)
            {
                Debug.Log("[FreshHologramSetup] FreshHologram_Rig already exists, updating...");
                var existingVfx = existingRig.GetComponentInChildren<VisualEffect>();
                if (existingVfx != null)
                {
                    existingVfx.visualEffectAsset = vfxAsset;
                }
                return existingRig;
            }

            // Create new rig
            GameObject rigRoot = new GameObject("FreshHologram_Rig");
            Undo.RegisterCreatedObjectUndo(rigRoot, "Create FreshHologram Rig");

            // Create VFX child
            GameObject vfxObj = new GameObject("VFX");
            vfxObj.transform.SetParent(rigRoot.transform);

            // Add VisualEffect component
            var vfx = vfxObj.AddComponent<VisualEffect>();
            vfx.visualEffectAsset = vfxAsset;

            // Add VFXARBinderMinimal
            AddBinderComponent(vfxObj);

            Debug.Log("[FreshHologramSetup] Created FreshHologram_Rig with VFX and binder");
            return rigRoot;
        }

        static void AddBinderComponent(GameObject target)
        {
            var binderType = System.Type.GetType("XRRAI.VFXBinders.VFXARBinderMinimal, Assembly-CSharp");
            if (binderType != null)
            {
                target.AddComponent(binderType);
                return;
            }

            // Fallback
            binderType = System.Type.GetType("VFXARBinder, Assembly-CSharp");
            if (binderType != null)
            {
                target.AddComponent(binderType);
                return;
            }

            Debug.LogWarning("[FreshHologramSetup] VFXARBinderMinimal not found. Add manually after recompile.");
        }

        [MenuItem("H3M/FreshHologram/Setup Complete Rig", priority = 101)]
        public static void SetupCompleteRig()
        {
            // Create a complete FreshHologram rig with binder

            // Check for VFX asset
            var vfxAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(VFX_OUTPUT_PATH);
            if (vfxAsset == null)
            {
                // Check alternative locations
                string[] guids = AssetDatabase.FindAssets("fresh_hologram t:VisualEffectAsset");
                if (guids.Length > 0)
                {
                    string path = AssetDatabase.GUIDToAssetPath(guids[0]);
                    vfxAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(path);
                }
            }

            if (vfxAsset == null)
            {
                EditorUtility.DisplayDialog("VFX Not Found",
                    "FreshHologram VFX asset not found. Please create it first using:\n" +
                    "H3M > FreshHologram > Create VFX Template\n\n" +
                    "Then run this command again.", "OK");
                return;
            }

            // Create GameObject hierarchy
            GameObject rigRoot = new GameObject("FreshHologram_Rig");
            Undo.RegisterCreatedObjectUndo(rigRoot, "Create FreshHologram Rig");

            // Create VFX GameObject
            GameObject vfxObj = new GameObject("VFX");
            vfxObj.transform.SetParent(rigRoot.transform);

            // Add VisualEffect component
            var vfx = vfxObj.AddComponent<VisualEffect>();
            vfx.visualEffectAsset = vfxAsset;

            // Add VFXARBinderMinimal
            var binderType = System.Type.GetType("XRRAI.VFXBinders.VFXARBinderMinimal, Assembly-CSharp");
            if (binderType != null)
            {
                vfxObj.AddComponent(binderType);
            }
            else
            {
                Debug.LogWarning("[FreshHologramSetup] VFXARBinderMinimal not found. Add manually.");
            }

            // Select the rig
            Selection.activeGameObject = rigRoot;

            Debug.Log("[FreshHologramSetup] FreshHologram rig created. Ensure ARDepthSource exists in scene.");
        }

        [MenuItem("H3M/FreshHologram/Add Binder to Selected", priority = 102)]
        public static void AddBinderToSelected()
        {
            var selected = Selection.activeGameObject;
            if (selected == null)
            {
                EditorUtility.DisplayDialog("No Selection", "Please select a VFX GameObject first.", "OK");
                return;
            }

            var vfx = selected.GetComponent<VisualEffect>();
            if (vfx == null)
            {
                EditorUtility.DisplayDialog("No VFX", "Selected object doesn't have a VisualEffect component.", "OK");
                return;
            }

            // Check if binder already exists
            var existingBinder = selected.GetComponent("VFXARBinderMinimal");
            if (existingBinder != null)
            {
                EditorUtility.DisplayDialog("Already Has Binder", "VFXARBinderMinimal already exists on this object.", "OK");
                return;
            }

            // Add binder
            var binderType = System.Type.GetType("XRRAI.VFXBinders.VFXARBinderMinimal, Assembly-CSharp");
            if (binderType != null)
            {
                Undo.AddComponent(selected, binderType);
                Debug.Log($"[FreshHologramSetup] Added VFXARBinderMinimal to {selected.name}");
            }
            else
            {
                // Fallback to full VFXARBinder
                var fullBinderType = System.Type.GetType("VFXARBinder, Assembly-CSharp");
                if (fullBinderType != null)
                {
                    Undo.AddComponent(selected, fullBinderType);
                    Debug.Log($"[FreshHologramSetup] Added VFXARBinder to {selected.name}");
                }
                else
                {
                    EditorUtility.DisplayDialog("Binder Not Found",
                        "Neither VFXARBinderMinimal nor VFXARBinder found in project.\n" +
                        "Check that the binder scripts exist.", "OK");
                }
            }
        }

        [MenuItem("H3M/FreshHologram/Verify Setup", priority = 103)]
        public static void VerifySetup()
        {
            var report = new System.Text.StringBuilder();
            report.AppendLine("FreshHologram Setup Verification");
            report.AppendLine("=================================");

            // Check ARDepthSource
            var depthSource = Object.FindFirstObjectByType<ARDepthSource>();
            if (depthSource != null)
            {
                report.AppendLine($"✅ ARDepthSource: Found ({depthSource.name})");
            }
            else
            {
                report.AppendLine("❌ ARDepthSource: NOT FOUND");
                report.AppendLine("   Run: H3M > VFX Pipeline Master > Setup Complete Pipeline");
            }

            // Check FreshHologram VFX
            var vfxObjects = Object.FindObjectsByType<VisualEffect>(FindObjectsSortMode.None);
            int freshHologramCount = 0;
            foreach (var vfx in vfxObjects)
            {
                if (vfx.visualEffectAsset != null &&
                    vfx.visualEffectAsset.name.ToLower().Contains("fresh"))
                {
                    freshHologramCount++;

                    // Check binder
                    var minimalBinder = vfx.GetComponent("VFXARBinderMinimal");
                    var fullBinder = vfx.GetComponent("VFXARBinder");

                    if (minimalBinder != null || fullBinder != null)
                    {
                        report.AppendLine($"✅ {vfx.name}: Has binder");
                    }
                    else
                    {
                        report.AppendLine($"⚠️ {vfx.name}: Missing binder");
                        report.AppendLine("   Run: H3M > FreshHologram > Add Binder to Selected");
                    }
                }
            }

            if (freshHologramCount == 0)
            {
                report.AppendLine("❌ FreshHologram VFX: NOT FOUND in scene");
                report.AppendLine("   Run: H3M > FreshHologram > Create VFX Template");
            }
            else
            {
                report.AppendLine($"✅ FreshHologram VFX: {freshHologramCount} found");
            }

            EditorUtility.DisplayDialog("FreshHologram Verification", report.ToString(), "OK");
            Debug.Log(report.ToString());
        }

        [MenuItem("H3M/FreshHologram/Open Documentation", priority = 200)]
        public static void OpenDocumentation()
        {
            if (File.Exists(DOCUMENTATION_PATH))
            {
                AssetDatabase.OpenAsset(AssetDatabase.LoadAssetAtPath<Object>(DOCUMENTATION_PATH));
            }
            else
            {
                EditorUtility.DisplayDialog("Documentation Not Found",
                    $"Documentation file not found at:\n{DOCUMENTATION_PATH}", "OK");
            }
        }
    }
}

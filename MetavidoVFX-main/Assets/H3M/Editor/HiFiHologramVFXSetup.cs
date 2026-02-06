#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.VFX;
using System.IO;
using XRRAI.Hologram;
using XRRAI.VFXBinders;

namespace XRRAI.Hologram.Editor
{
    /// <summary>
    /// Editor utilities to create and configure HiFi Hologram VFX assets.
    /// </summary>
    public static class HiFiHologramVFXSetup
    {
        private const string TemplatePath = "Assets/VFX/People/particles_depth_people_metavido.vfx";
        private const string OutputPath = "Assets/VFX/People/hifi_hologram_people.vfx";
        private const string ResourcesOutputPath = "Assets/Resources/VFX/People/hifi_hologram_people.vfx";

        [MenuItem("H3M/HiFi Hologram/Create HiFi Hologram VFX")]
        public static void CreateHiFiHologramVFX()
        {
            // Check if already exists
            if (File.Exists(Application.dataPath.Replace("Assets", "") + OutputPath))
            {
                Debug.Log($"[HiFi Hologram] VFX already exists at {OutputPath}");
                Selection.activeObject = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(OutputPath);
                return;
            }

            // Check template exists
            if (!File.Exists(Application.dataPath.Replace("Assets", "") + TemplatePath))
            {
                Debug.LogError($"[HiFi Hologram] Template not found at {TemplatePath}");
                return;
            }

            // Ensure output directory exists
            string outputDir = Path.GetDirectoryName(OutputPath);
            if (!AssetDatabase.IsValidFolder(outputDir))
            {
                Directory.CreateDirectory(Application.dataPath.Replace("Assets", "") + outputDir);
                AssetDatabase.Refresh();
            }

            // Duplicate the template
            if (AssetDatabase.CopyAsset(TemplatePath, OutputPath))
            {
                AssetDatabase.Refresh();
                var vfxAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(OutputPath);

                if (vfxAsset != null)
                {
                    Debug.Log($"[HiFi Hologram] Created HiFi Hologram VFX at {OutputPath}");
                    Debug.Log("[HiFi Hologram] Required modifications:");
                    Debug.Log("  1. Open in VFX Graph editor");
                    Debug.Log("  2. Add 'ParticleCount' (UInt) exposed property - default 100000");
                    Debug.Log("  3. Add 'ParticleSize' (Float) exposed property - default 0.002");
                    Debug.Log("  4. Add 'ColorSaturation' (Float) exposed property - default 1.0");
                    Debug.Log("  5. Add 'ColorBrightness' (Float) exposed property - default 1.0");
                    Debug.Log("  6. Ensure Initialize samples ColorMap at particle UV");
                    Debug.Log("  7. Ensure particles are small billboards (2mm)");

                    Selection.activeObject = vfxAsset;
                    EditorGUIUtility.PingObject(vfxAsset);
                }
            }
            else
            {
                Debug.LogError("[HiFi Hologram] Failed to copy template VFX");
            }
        }

        [MenuItem("H3M/HiFi Hologram/Add HiFiHologramController to Selected")]
        public static void AddHiFiControllerToSelected()
        {
            var selected = Selection.activeGameObject;
            if (selected == null)
            {
                Debug.LogError("[HiFi Hologram] No GameObject selected");
                return;
            }

            var vfx = selected.GetComponent<VisualEffect>();
            if (vfx == null)
            {
                Debug.LogError("[HiFi Hologram] Selected object has no VisualEffect component");
                return;
            }

            // Add HiFiHologramController if not present
            var controller = selected.GetComponent<HiFiHologramController>();
            if (controller == null)
            {
                controller = selected.AddComponent<HiFiHologramController>();
                Debug.Log("[HiFi Hologram] Added HiFiHologramController");
            }

            // Add VFXARBinder if not present
            var binder = selected.GetComponent<VFXARBinder>();
            if (binder == null)
            {
                binder = selected.AddComponent<VFXARBinder>();
                Debug.Log("[HiFi Hologram] Added VFXARBinder");
            }

            EditorUtility.SetDirty(selected);
            Debug.Log("[HiFi Hologram] Setup complete! VFX is ready for HiFi rendering.");
        }

        [MenuItem("H3M/HiFi Hologram/Setup Complete HiFi Hologram Rig")]
        public static void SetupCompleteRig()
        {
            SetupCompleteRig(useMinimalBinder: false);
        }

        [MenuItem("H3M/HiFi Hologram/Setup Complete HiFi Rig (Minimal Binder)")]
        public static void SetupCompleteRigMinimal()
        {
            SetupCompleteRig(useMinimalBinder: true);
        }

        private static void SetupCompleteRig(bool useMinimalBinder)
        {
            // Create parent object
            var rigGO = new GameObject("HiFi_Hologram_Rig");

            // Create VFX child
            var vfxGO = new GameObject("HiFi_VFX");
            vfxGO.transform.SetParent(rigGO.transform);

            // Add VisualEffect component
            var vfx = vfxGO.AddComponent<VisualEffect>();

            // Try to load the HiFi VFX asset
            var vfxAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(OutputPath);
            if (vfxAsset != null)
            {
                vfx.visualEffectAsset = vfxAsset;
            }
            else
            {
                // Fallback to template
                vfxAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(TemplatePath);
                if (vfxAsset != null)
                {
                    vfx.visualEffectAsset = vfxAsset;
                    Debug.LogWarning("[HiFi Hologram] Using template VFX. Run 'Create HiFi Hologram VFX' first.");
                }
            }

            // Add components
            vfxGO.AddComponent<HiFiHologramController>();

            // Add binder (minimal or full)
            if (useMinimalBinder)
            {
                vfxGO.AddComponent<VFXARBinderMinimal>();
            }
            else
            {
                vfxGO.AddComponent<VFXARBinder>();
            }

            // Add HologramAnchor for placement/scale/rotate gestures
            var anchorGO = new GameObject("Anchor");
            anchorGO.transform.SetParent(rigGO.transform);
            var anchor = anchorGO.AddComponent<HologramAnchor>();

            // Wire HologramAnchor to VFX root
            var anchorSO = new SerializedObject(anchor);
            anchorSO.FindProperty("_hologramRoot").objectReferenceValue = vfxGO.transform;
            anchorSO.ApplyModifiedProperties();

            // Add ARRaycastManager if not in scene
            if (Object.FindFirstObjectByType<UnityEngine.XR.ARFoundation.ARRaycastManager>() == null)
            {
                anchorGO.AddComponent<UnityEngine.XR.ARFoundation.ARRaycastManager>();
                Debug.Log("[HiFi Hologram] Added ARRaycastManager for plane detection");
            }

            Selection.activeGameObject = rigGO;
            string binderType = useMinimalBinder ? "VFXARBinderMinimal" : "VFXARBinder";
            Debug.Log($"[HiFi Hologram] Created HiFi Hologram Rig with {binderType}. Components:");
            Debug.Log("  - VisualEffect");
            Debug.Log("  - HiFiHologramController");
            Debug.Log($"  - {binderType}");
            Debug.Log("  - HologramAnchor (tap to place, pinch to scale, twist to rotate)");
        }

        [MenuItem("H3M/HiFi Hologram/Add HologramAnchor to Selected")]
        public static void AddHologramAnchorToSelected()
        {
            var selected = Selection.activeGameObject;
            if (selected == null)
            {
                Debug.LogError("[HiFi Hologram] No GameObject selected");
                return;
            }

            // Find VFX in hierarchy
            var vfx = selected.GetComponent<VisualEffect>();
            if (vfx == null)
            {
                vfx = selected.GetComponentInChildren<VisualEffect>();
            }

            Transform vfxTransform = vfx != null ? vfx.transform : selected.transform;

            // Check if anchor already exists
            var existingAnchor = selected.GetComponent<HologramAnchor>();
            if (existingAnchor == null)
            {
                existingAnchor = selected.GetComponentInChildren<HologramAnchor>();
            }

            if (existingAnchor != null)
            {
                Debug.Log("[HiFi Hologram] HologramAnchor already exists");
                Selection.activeObject = existingAnchor;
                return;
            }

            // Add HologramAnchor
            var anchor = selected.AddComponent<HologramAnchor>();

            // Wire to VFX transform
            var so = new SerializedObject(anchor);
            so.FindProperty("_hologramRoot").objectReferenceValue = vfxTransform;
            so.ApplyModifiedProperties();

            // Add ARRaycastManager if needed
            if (selected.GetComponent<UnityEngine.XR.ARFoundation.ARRaycastManager>() == null)
            {
                selected.AddComponent<UnityEngine.XR.ARFoundation.ARRaycastManager>();
            }

            EditorUtility.SetDirty(selected);
            Debug.Log($"[HiFi Hologram] Added HologramAnchor targeting {vfxTransform.name}");
            Debug.Log("  - Single tap/drag: Place on AR planes");
            Debug.Log("  - Two-finger pinch: Scale");
            Debug.Log("  - Two-finger twist: Rotate");
        }

        [MenuItem("H3M/HiFi Hologram/Verify HiFi Setup")]
        public static void VerifySetup()
        {
            Debug.Log("[HiFi Hologram] Verifying setup...");

            // Check VFX asset
            var vfxAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(OutputPath);
            Log("HiFi VFX Asset", vfxAsset != null, vfxAsset != null ? OutputPath : "Run 'Create HiFi Hologram VFX'");

            // Check ARDepthSource
            var depthSource = Object.FindFirstObjectByType<ARDepthSource>();
            Log("ARDepthSource", depthSource != null, depthSource != null ? "Found" : "Run 'H3M > VFX Pipeline Master > Setup Complete Pipeline'");

            // Check HiFiHologramController
            var controller = Object.FindFirstObjectByType<HiFiHologramController>();
            Log("HiFiHologramController", controller != null, controller != null ? "Found" : "Add to VFX GameObject");

            // Check VFXARBinder (either full or minimal)
            var binder = Object.FindFirstObjectByType<VFXARBinder>();
            var minimalBinder = Object.FindFirstObjectByType<VFXARBinderMinimal>();
            bool hasBinder = binder != null || minimalBinder != null;
            string binderType = binder != null ? "VFXARBinder" : (minimalBinder != null ? "VFXARBinderMinimal" : "None");
            Log("VFX Binder", hasBinder, hasBinder ? binderType : "Add VFXARBinder or VFXARBinderMinimal");

            // Check HologramAnchor
            var anchor = Object.FindFirstObjectByType<HologramAnchor>();
            Log("HologramAnchor", anchor != null, anchor != null ? "Found (placement/scale/rotate enabled)" : "Optional - Add for gesture controls");

            // Check ARRaycastManager (required for HologramAnchor)
            if (anchor != null)
            {
                var raycaster = Object.FindFirstObjectByType<UnityEngine.XR.ARFoundation.ARRaycastManager>();
                Log("ARRaycastManager", raycaster != null, raycaster != null ? "Found" : "Required by HologramAnchor");
            }

            Debug.Log("[HiFi Hologram] Verification complete.");
        }

        private static void Log(string component, bool found, string details)
        {
            string status = found ? "\u2713" : "\u2717 MISSING";
            Debug.Log($"  [{status}] {component}: {details}");
        }
    }
}
#endif

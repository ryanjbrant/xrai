// ARCompanionBuilder.cs - Menu commands for building AR Companion via MCP
// Wraps ARFoundationRemote.Editor.CompanionAppInstaller for automated builds

using UnityEditor;
using UnityEngine;
using System.Reflection;

namespace XRRAI.Editor
{
    public static class ARCompanionBuilder
    {
        [MenuItem("H3M/AR Companion/Build and Run (to device)", priority = 100)]
        public static void BuildAndRun()
        {
            Debug.Log("[ARCompanionBuilder] Starting Build and Run...");

            // Get the CompanionAppInstaller type via reflection
            var installerType = System.Type.GetType(
                "ARFoundationRemote.Editor.CompanionAppInstaller, ARFoundationRemote.Editor");

            if (installerType == null)
            {
                // Try Assembly-CSharp-Editor
                var assemblies = System.AppDomain.CurrentDomain.GetAssemblies();
                foreach (var asm in assemblies)
                {
                    installerType = asm.GetType("ARFoundationRemote.Editor.CompanionAppInstaller");
                    if (installerType != null) break;
                }
            }

            if (installerType == null)
            {
                Debug.LogError("[ARCompanionBuilder] CompanionAppInstaller not found. Is AR Foundation Remote installed?");
                return;
            }

            // Get the InstallerSettings
            var settings = GetInstallerSettings();
            if (settings == null)
            {
                Debug.LogError("[ARCompanionBuilder] Could not get InstallerSettings");
                return;
            }

            // Call BuildAndRun
            var method = installerType.GetMethod("BuildAndRun", BindingFlags.Public | BindingFlags.Static);
            if (method != null)
            {
                method.Invoke(null, new object[] { settings });
                Debug.Log("[ARCompanionBuilder] BuildAndRun invoked");
            }
            else
            {
                Debug.LogError("[ARCompanionBuilder] BuildAndRun method not found");
            }
        }

        [MenuItem("H3M/AR Companion/Build Only (show in folder)", priority = 101)]
        public static void BuildOnly()
        {
            Debug.Log("[ARCompanionBuilder] Starting Build Only...");

            var installerType = FindCompanionInstallerType();
            if (installerType == null)
            {
                Debug.LogError("[ARCompanionBuilder] CompanionAppInstaller not found");
                return;
            }

            var settings = GetInstallerSettings();
            if (settings == null)
            {
                Debug.LogError("[ARCompanionBuilder] Could not get InstallerSettings");
                return;
            }

            var method = installerType.GetMethod("Build", BindingFlags.Public | BindingFlags.Static);
            if (method != null)
            {
                method.Invoke(null, new object[] { settings });
                Debug.Log("[ARCompanionBuilder] Build invoked");
            }
        }

        [MenuItem("H3M/AR Companion/Delete Build Folder", priority = 102)]
        public static void DeleteBuildFolder()
        {
            var installerType = FindCompanionInstallerType();
            if (installerType == null) return;

            var method = installerType.GetMethod("DeleteCompanionAppBuildFolder", BindingFlags.Public | BindingFlags.Static);
            method?.Invoke(null, null);
            Debug.Log("[ARCompanionBuilder] Build folder deleted");
        }

        static System.Type FindCompanionInstallerType()
        {
            foreach (var asm in System.AppDomain.CurrentDomain.GetAssemblies())
            {
                var type = asm.GetType("ARFoundationRemote.Editor.CompanionAppInstaller");
                if (type != null) return type;
            }
            return null;
        }

        static object GetInstallerSettings()
        {
            // Find the ARFoundationRemoteInstaller asset
            var guids = AssetDatabase.FindAssets("t:ARFoundationRemoteInstaller");
            if (guids.Length == 0)
            {
                guids = AssetDatabase.FindAssets("Installer t:ScriptableObject",
                    new[] { "Assets/Plugins/ARFoundationRemoteInstaller" });
            }

            if (guids.Length == 0)
            {
                Debug.LogWarning("[ARCompanionBuilder] No Installer asset found, using default settings");
                // Create default settings via reflection
                var settingsType = FindInstallerSettingsType();
                if (settingsType != null)
                {
                    return System.Activator.CreateInstance(settingsType);
                }
                return null;
            }

            var path = AssetDatabase.GUIDToAssetPath(guids[0]);
            var installer = AssetDatabase.LoadAssetAtPath<ScriptableObject>(path);

            if (installer == null) return null;

            // Get installerSettings field
            var field = installer.GetType().GetField("installerSettings",
                BindingFlags.Public | BindingFlags.Instance);

            if (field != null)
            {
                return field.GetValue(installer);
            }

            // Try property
            var prop = installer.GetType().GetProperty("installerSettings",
                BindingFlags.Public | BindingFlags.Instance);

            return prop?.GetValue(installer);
        }

        static System.Type FindInstallerSettingsType()
        {
            foreach (var asm in System.AppDomain.CurrentDomain.GetAssemblies())
            {
                var type = asm.GetType("ARFoundationRemote.Editor.InstallerSettings");
                if (type != null) return type;
            }
            return null;
        }
    }
}

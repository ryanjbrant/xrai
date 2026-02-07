#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace XRRAI.Editor
{
    /// <summary>
    /// ScriptableObject holding AR Companion launch and test settings.
    /// Create via Assets/Create/H3M/AR Remote Test Config.
    /// </summary>
    public class ARRemoteTestConfig : ScriptableObject
    {
        [Header("Device & App")]
        public string deviceId = "REPLACE_WITH_DEVICE_ID"; // e.g. from `xcrun devicectl list devices`
        public string bundleId = "com.imclab.metavidovfxARCompanion";

        [Header("Automation")]
        [Tooltip("Automatically launch the companion app when entering Play Mode in the Editor.")]
        public bool autoLaunchOnPlay = true;

        [Tooltip("Delay (ms) after launching app before running tests or entering Play Mode.")]
        public int postLaunchDelayMs = 5000;

        [Tooltip("Automatically run PlayMode tests after launching the companion app.")]
        public bool autoRunPlayModeTests = false;

        [Tooltip("NUnit test names to run in PlayMode. If empty, defaults to MetavidoVFX.Tests.HandTrackingPlayModeTests")]
        public string[] playModeTestNames = new[] { "MetavidoVFX.Tests.HandTrackingPlayModeTests" };

        internal static ARRemoteTestConfig LoadOrCreate()
        {
            const string assetPath = "Assets/Editor/ARRemoteTestConfig.asset";
            var config = AssetDatabase.LoadAssetAtPath<ARRemoteTestConfig>(assetPath);
            if (config == null)
            {
                config = ScriptableObject.CreateInstance<ARRemoteTestConfig>();
                AssetDatabase.CreateAsset(config, assetPath);
                AssetDatabase.SaveAssets();
                Debug.Log("[AR Remote] Created default config at " + assetPath);
            }
            return config;
        }
    }
}
#endif

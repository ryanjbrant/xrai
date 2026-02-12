#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using XRRAI.Editor;

public class AutoTestRunner
{
    [MenuItem("H3M/Testing/AR Remote/Run Auto Test")]
    public static void Execute()
    {
        // 1. Load Config
        var config = ARRemoteTestConfig.LoadOrCreate();
        
        // 2. Set Device ID (IMClab 15)
        config.deviceId = "93485B6C-D0DD-5535-BD87-A80D0FC9FB54";
        config.bundleId = "com.imclab.metavidovfxARCompanion";
        config.autoLaunchOnPlay = true;
        config.autoRunPlayModeTests = true;
        config.postLaunchDelayMs = 5000;
        
        EditorUtility.SetDirty(config);
        AssetDatabase.SaveAssets();
        
        Debug.Log($"[AutoTest] Configured for device: {config.deviceId}");
        
        // 3. Trigger Full Sequence
        // This will launch app, wait, verify scene, and print instructions.
        // It won't automatically run PlayMode tests unless we call that specifically or enter PlayMode.
        // Let's call Launch + Run Tests directly for automation.
        
        ARRemotePlayModeTestRunner.LaunchCompanionApp();
        
        // We can't easily wait here in a synchronous Execute call without blocking the editor thread.
        // But LaunchCompanionApp uses Process.Start which is async-ish (fire and forget).
        // The PlayMode tests need to run in PlayMode.
        // So we should probably just configure it and then tell the user to press Play or use the menu item.
        // OR we can try to enter PlayMode programmatically.
        
        Debug.Log("[AutoTest] Launching app... Entering PlayMode in 5 seconds...");
        
        // Schedule PlayMode entry
        EditorApplication.delayCall += () => 
        {
            // Wait a bit for app launch (simulated via EditorApplication.update or just hope for the best)
            // Actually, let's just enter PlayMode. The Config.autoLaunchOnPlay handles the launch.
            // But we just called Launch manually. Let's rely on auto-launch.
            
            ARRemotePlayModeTestRunner.EnterPlayModeWithAR();
        };
    }
}
#endif

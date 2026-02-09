#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.TestTools.TestRunner.Api;
using UnityEngine;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.IO;
using Debug = UnityEngine.Debug;

namespace XRRAI.Editor
{
    /// <summary>
    /// Automated AR Remote PlayMode test runner.
    /// Launches companion app on device and runs hand tracking tests.
    /// </summary>
    public static class ARRemotePlayModeTestRunner
    {
        private static ARRemoteTestConfig Config => ARRemoteTestConfig.LoadOrCreate();
        private static Process _logProcess;

        [MenuItem("H3M/Testing/AR Remote/Launch Companion App on Device")]
        public static void LaunchCompanionApp()
        {
            var deviceId = Config.deviceId;
            var bundleId = Config.bundleId;

            Debug.Log($"[AR Remote] Launching AR Companion app on device {deviceId} (bundle {bundleId})...");

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "xcrun",
                    Arguments = $"devicectl device process launch --device {deviceId} {bundleId}",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                }
            };

            try
            {
                process.Start();
                string output = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();
                process.WaitForExit();

                if (process.ExitCode == 0)
                {
                    Debug.Log($"[AR Remote] Companion app launched successfully!\n{output}");
                    Debug.Log("[AR Remote] Open Window > AR Foundation Remote > Connection to connect");
                }
                else
                {
                    Debug.LogWarning($"[AR Remote] Launch may have failed:\n{error}\n{output}");
                    // App might already be running
                    Debug.Log("[AR Remote] If app is already running, you can proceed with testing");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[AR Remote] Failed to launch companion app: {e.Message}");
            }
        }

        [MenuItem("H3M/Testing/AR Remote/Run Hand Tracking PlayMode Tests")]
        public static void RunHandTrackingPlayModeTests()
        {
            var tests = (Config.playModeTestNames != null && Config.playModeTestNames.Length > 0)
                ? Config.playModeTestNames
                : new[] { "MetavidoVFX.Tests.HandTrackingPlayModeTests" };

            Debug.Log($"[AR Remote] Starting PlayMode tests: {string.Join(", ", tests)}...");

            var testRunnerApi = ScriptableObject.CreateInstance<TestRunnerApi>();
            var filter = new Filter
            {
                testMode = TestMode.PlayMode,
                testNames = tests
            };

            testRunnerApi.RegisterCallbacks(new ARTestResultCallback());
            testRunnerApi.Execute(new ExecutionSettings(filter));
            Debug.Log("[AR Remote] PlayMode tests started. Check Test Runner window for results.");
        }

        [MenuItem("H3M/Testing/AR Remote/Start Device Log Capture")]
        public static void StartDeviceLogCapture()
        {
            if (_logProcess != null && !_logProcess.HasExited)
            {
                Debug.Log("[AR Remote] Log capture already running.");
                return;
            }

            var deviceId = Config.deviceId;
            if (string.IsNullOrEmpty(deviceId) || deviceId.Contains("REPLACE"))
            {
                Debug.LogWarning("[AR Remote] Invalid Device ID in config. Cannot capture logs.");
                return;
            }

            string logDir = Path.Combine(Application.dataPath, "../Logs");
            Directory.CreateDirectory(logDir);
            string logPath = Path.Combine(logDir, "DeviceLogs.txt");

            Debug.Log($"[AR Remote] Starting log capture for device {deviceId} to {logPath}...");

            // We use a shell command to pipe output easily
            var processInfo = new ProcessStartInfo
            {
                FileName = "/bin/sh",
                Arguments = $"-c \"xcrun devicectl device stream --device {deviceId} > '{logPath}' 2>&1\"",
                UseShellExecute = false,
                CreateNoWindow = true
            };

            try
            {
                _logProcess = Process.Start(processInfo);
                Debug.Log($"[AR Remote] Log capture started (PID: {_logProcess.Id})");
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[AR Remote] Failed to start log capture: {e.Message}");
            }
        }

        [MenuItem("H3M/Testing/AR Remote/Stop Device Log Capture")]
        public static void StopDeviceLogCapture()
        {
            if (_logProcess != null && !_logProcess.HasExited)
            {
                try
                {
                    _logProcess.Kill();
                    Debug.Log("[AR Remote] Log capture stopped.");
                }
                catch (System.Exception e)
                {
                    Debug.LogError($"[AR Remote] Failed to stop log capture: {e.Message}");
                }
                _logProcess = null;
            }
            else
            {
                Debug.Log("[AR Remote] No log capture running.");
            }
        }

        [MenuItem("H3M/Testing/AR Remote/Full AR Test Sequence")]
        public static async void RunFullARTestSequence()
        {
            Debug.Log("[AR Remote] Starting full AR test sequence...");

            // 1. Setup optimal config
            ARRemoteTestingSetup.SetupOptimalConfig();

            // 2. Launch companion app
            LaunchCompanionApp();

            // 3. Wait for app to start
            var delay = Mathf.Max(0, Config.postLaunchDelayMs);
            Debug.Log($"[AR Remote] Waiting {delay} ms for companion app to start...");
            await Task.Delay(delay);

            // 4. Verify scene setup
            ARRemoteTestingSetup.VerifySceneSetup();

            // 5. Instructions for manual connection
            Debug.Log("=== NEXT STEPS ===");
            Debug.Log("1. Open Window > AR Foundation Remote > Connection");
            Debug.Log("2. Enter device IP shown in companion app");
            Debug.Log("3. Click Connect");
            Debug.Log("4. Press Play to test, or run H3M > Testing > AR Remote > Run Hand Tracking PlayMode Tests");
        }

        [MenuItem("H3M/Testing/AR Remote/Enter Play Mode with AR")]
        public static void EnterPlayModeWithAR()
        {
            if (EditorApplication.isPlaying)
            {
                Debug.Log("[AR Remote] Already in Play Mode");
                return;
            }

            // Setup optimal config first
            ARRemoteTestingSetup.SetupOptimalConfig();

            if (Config.autoLaunchOnPlay)
            {
                LaunchCompanionApp();
                StartDeviceLogCapture();
            }

            // Enter play mode
            EditorApplication.isPlaying = true;
            Debug.Log("[AR Remote] Entering Play Mode. Ensure AR Remote is connected.");
        }
    }

    [System.Serializable]
    public class TestRunReport
    {
        public string timestamp;
        public int total;
        public int passed;
        public int failed;
        public int skipped;
        public List<TestResultData> results = new List<TestResultData>();
    }

    [System.Serializable]
    public class TestResultData
    {
        public string name;
        public string status;
        public string message;
        public double duration;
    }

    /// <summary>
    /// Test result callback for PlayMode tests.
    /// </summary>
    public class ARTestResultCallback : ICallbacks
    {
        private TestRunReport _report;

        public void RunStarted(ITestAdaptor testsToRun)
        {
            Debug.Log($"[AR Tests] Starting {testsToRun.TestCaseCount} tests...");
            _report = new TestRunReport
            {
                timestamp = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                total = testsToRun.TestCaseCount
            };
        }

        public void RunFinished(ITestResultAdaptor result)
        {
            _report.passed = result.PassCount;
            _report.failed = result.FailCount;
            _report.skipped = result.SkipCount;

            Debug.Log($"[AR Tests] Finished: {result.PassCount} passed, {result.FailCount} failed, {result.SkipCount} skipped");

            // Save report
            string logDir = Path.Combine(Application.dataPath, "../Logs");
            Directory.CreateDirectory(logDir);
            string reportPath = Path.Combine(logDir, "TestResults.json");
            
            string json = JsonUtility.ToJson(_report, true);
            File.WriteAllText(reportPath, json);
            Debug.Log($"[AR Tests] Report saved to {reportPath}");

            if (result.FailCount > 0)
            {
                Debug.LogWarning("[AR Tests] Some tests failed. Check Test Runner for details.");
            }
            else
            {
                Debug.Log("[AR Tests] All tests passed!");
            }
            
            // Stop log capture if it was started automatically
            ARRemotePlayModeTestRunner.StopDeviceLogCapture();
        }

        public void TestStarted(ITestAdaptor test) { }
        public void TestFinished(ITestResultAdaptor result)
        {
            if (_report != null)
            {
                _report.results.Add(new TestResultData
                {
                    name = result.Test.Name,
                    status = result.TestStatus.ToString(),
                    message = result.Message,
                    duration = result.Duration
                });
            }

            if (result.TestStatus == TestStatus.Failed)
            {
                Debug.LogError($"[AR Tests] FAILED: {result.Test.Name}\n{result.Message}");
            }
        }
    }
}
#endif

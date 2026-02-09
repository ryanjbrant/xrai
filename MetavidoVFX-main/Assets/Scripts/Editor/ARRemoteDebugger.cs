#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using System.IO;
using System.Linq;

namespace XRRAI.Editor
{
    /// <summary>
    /// Tool to diagnose AR Remote test runs by analyzing logs.
    /// </summary>
    public static class ARRemoteDebugger
    {
        [MenuItem("H3M/Testing/AR Remote/Diagnose Last Run")]
        public static void DiagnoseLastRun()
        {
            string logDir = Path.Combine(Application.dataPath, "../Logs");
            string reportPath = Path.Combine(logDir, "TestResults.json");
            string deviceLogPath = Path.Combine(logDir, "DeviceLogs.txt");

            Debug.Log("=== AR Remote Diagnosis ===");

            // 1. Analyze Test Results
            if (File.Exists(reportPath))
            {
                try
                {
                    string json = File.ReadAllText(reportPath);
                    var report = JsonUtility.FromJson<TestRunReport>(json);
                    
                    Debug.Log($"[Test Report] {report.timestamp}");
                    Debug.Log($"Total: {report.total}, Passed: {report.passed}, Failed: {report.failed}");

                    if (report.failed > 0)
                    {
                        Debug.LogError("FAILED TESTS:");
                        foreach (var result in report.results)
                        {
                            if (result.status == "Failed")
                            {
                                Debug.LogError($"- {result.name}: {result.message}");
                            }
                        }
                    }
                }
                catch (System.Exception e)
                {
                    Debug.LogError($"Failed to parse test report: {e.Message}");
                }
            }
            else
            {
                Debug.LogWarning("No test report found at " + reportPath);
            }

            // 2. Analyze Device Logs (Tail)
            if (File.Exists(deviceLogPath))
            {
                Debug.Log("[Device Logs] Analyzing last 50 lines...");
                try
                {
                    var lines = File.ReadLines(deviceLogPath).Reverse().Take(50).Reverse().ToArray();
                    foreach (var line in lines)
                    {
                        if (line.Contains("Error") || line.Contains("Exception") || line.Contains("Fail"))
                        {
                            Debug.LogError($"[Device] {line}");
                        }
                        else if (line.Contains("Warning"))
                        {
                            Debug.LogWarning($"[Device] {line}");
                        }
                        else
                        {
                            Debug.Log($"[Device] {line}");
                        }
                    }
                }
                catch (System.Exception e)
                {
                    Debug.LogError($"Failed to read device logs: {e.Message}");
                }
            }
            else
            {
                Debug.LogWarning("No device logs found at " + deviceLogPath);
            }
        }
    }
}
#endif

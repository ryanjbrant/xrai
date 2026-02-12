using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

public class SystemMonitor : MonoBehaviour
{
    // Configuration
    [Header("Monitoring Settings")]
    [SerializeField] private float updateInterval = 1.0f;
    [SerializeField] private float highCpuThreshold = 80f; // 80% CPU usage
    [SerializeField] private float highMemoryThreshold = 90f; // 90% memory usage
    [SerializeField] private float maxStallTime = 30f; // 30 seconds of inactivity
    
    // Performance metrics
    private float lastActivityTime;
    private PerformanceCounter cpuCounter;
    private PerformanceCounter ramCounter;
    private bool isMonitoring = true;
    
    // Event callbacks
    public event Action OnHighCpuUsage;
    public event Action OnHighMemoryUsage;
    public event Action OnStallDetected;
    public event Action<float> OnCpuUsageUpdate;
    public event Action<float> OnMemoryUsageUpdate;
    
    private void Start()
    {
        InitializePerformanceCounters();
        StartMonitoring();
    }
    
    private void InitializePerformanceCounters()
    {
        try 
        {
            cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
            ramCounter = new PerformanceCounter("Memory", "% Committed Bytes In Use");
            
            // First call always returns 0, so we call it once to initialize
            cpuCounter.NextValue();
            ramCounter.NextValue();
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to initialize performance counters: {e.Message}");
            isMonitoring = false;
        }
    }
    
    private async void StartMonitoring()
    {
        lastActivityTime = Time.time;
        
        while (isMonitoring && Application.isPlaying)
        {
            try 
            {
                await Task.Delay(Mathf.RoundToInt(updateInterval * 1000));
                
                // Check for system metrics
                CheckSystemHealth();
                
                // Check for stalls (no activity)
                if (Time.time - lastActivityTime > maxStallTime)
                {
                    OnStallDetected?.Invoke();
                    await HandleStall();
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Monitoring error: {e.Message}");
            }
        }
    }
    
    private void CheckSystemHealth()
    {
        if (!isMonitoring) return;
        
        try 
        {
            // Get CPU usage
            float cpuUsage = cpuCounter.NextValue();
            OnCpuUsageUpdate?.Invoke(cpuUsage);
            
            // Get memory usage
            float memoryUsage = ramCounter.NextValue();
            OnMemoryUsageUpdate?.Invoke(memoryUsage);
            
            // Check thresholds
            if (cpuUsage > highCpuThreshold)
            {
                OnHighCpuUsage?.Invoke();
                Debug.LogWarning($"High CPU Usage: {cpuUsage}%");
            }
            
            if (memoryUsage > highMemoryThreshold)
            {
                OnHighMemoryUsage?.Invoke();
                Debug.LogWarning($"High Memory Usage: {memoryUsage}%");
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Error checking system health: {e.Message}");
        }
    }
    
    private async Task HandleStall()
    {
        Debug.LogWarning($"Stall detected! No activity for {maxStallTime} seconds");
        
        // Try to recover from stall
        await Task.Run(() => 
        {
            // 1. Try to free up memory
            System.GC.Collect();
            Resources.UnloadUnusedAssets();
            
            // 2. Log current state
            LogSystemState();
            
            // 3. Try to continue execution
            lastActivityTime = Time.time;
        });
    }
    
    private void LogSystemState()
    {
        string state = $"""
        === System State ===
        Time: {DateTime.Now}
        CPU: {cpuCounter?.NextValue() ?? 0}%
        Memory: {ramCounter?.NextValue() ?? 0}%
        Active Threads: {Process.GetCurrentProcess().Threads.Count}
        Memory Usage: {Process.GetCurrentProcess().WorkingSet64 / (1024 * 1024)}MB
        """;
        
        Debug.Log(state);
    }
    
    public void UpdateActivity()
    {
        lastActivityTime = Time.time;
    }
    
    private void OnDestroy()
    {
        isMonitoring = false;
        cpuCounter?.Dispose();
        ramCounter?.Dispose();
    }
}

using UnityEditor;
using UnityEngine;
using System.Threading.Tasks;

public class AutomationWindow : EditorWindow
{
    private AutomationManager automationManager;
    private Vector2 scrollPosition;
    private string logText = "";
    private bool autoScroll = true;
    
    [MenuItem("Window/Automation/Show Automation Monitor")]
    public static void ShowWindow()
    {
        var window = GetWindow<AutomationWindow>("Automation Monitor");
        window.minSize = new Vector2(400, 300);
    }
    
    private void OnEnable()
    {
        // Find or create the automation manager
        var go = new GameObject("AutomationManager");
        automationManager = go.AddComponent<AutomationManager>();
        
        // Subscribe to events
        Application.logMessageReceived += HandleLog;
        EditorApplication.playModeStateChanged += OnPlayModeStateChanged;
    }
    
    private void OnDisable()
    {
        Application.logMessageReceived -= HandleLog;
        EditorApplication.playModeStateChanged -= OnPlayModeStateChanged;
    }
    
    private void OnPlayModeStateChanged(PlayModeStateChange state)
    {
        if (state == PlayModeStateChange.EnteredPlayMode)
        {
            // Re-find the automation manager in play mode
            automationManager = FindObjectOfType<AutomationManager>();
        }
    }
    
    private void OnGUI()
    {
        if (automationManager == null)
        {
            EditorGUILayout.HelpBox("Automation Manager not found in the scene.", MessageType.Error);
            
            if (GUILayout.Button("Create Automation Manager"))
            {
                var go = new GameObject("AutomationManager");
                automationManager = go.AddComponent<AutomationManager>();
                EditorGUIUtility.PingObject(go);
            }
            
            return;
        }
        
        DrawControls();
        DrawLog();
    }
    
    private void DrawControls()
    {
        EditorGUILayout.BeginVertical(EditorStyles.helpBox);
        
        EditorGUILayout.LabelField("Automation Controls", EditorStyles.boldLabel);
        
        EditorGUI.BeginChangeCheck();
        bool enableAutoTesting = EditorGUILayout.Toggle("Enable Auto Testing", automationManager.enableAutoTesting);
        if (EditorGUI.EndChangeCheck())
        {
            Undo.RecordObject(automationManager, "Toggle Auto Testing");
            automationManager.enableAutoTesting = enableAutoTesting;
            EditorUtility.SetDirty(automationManager);
        }
        
        EditorGUI.BeginChangeCheck();
        float testInterval = EditorGUILayout.FloatField("Test Interval (s)", automationManager.testInterval);
        if (EditorGUI.EndChangeCheck())
        {
            Undo.RecordObject(automationManager, "Change Test Interval");
            automationManager.testInterval = Mathf.Max(1f, testInterval);
            EditorUtility.SetDirty(automationManager);
        }
        
        if (GUILayout.Button("Run Tests Now"))
        {
            automationManager.ForceRunTests();
        }
        
        EditorGUILayout.EndVertical();
    }
    
    private void DrawLog()
    {
        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Log", EditorStyles.boldLabel);
        
        // Log controls
        EditorGUILayout.BeginHorizontal();
        if (GUILayout.Button("Clear"))
        {
            logText = "";
        }
        autoScroll = GUILayout.Toggle(autoScroll, "Auto-scroll", "Button", GUILayout.Width(100));
        EditorGUILayout.EndHorizontal();
        
        // Log content
        scrollPosition = EditorGUILayout.BeginScrollView(scrollPosition, GUILayout.ExpandHeight(true));
        GUIStyle style = new GUIStyle(EditorStyles.textArea)
        {
            wordWrap = true,
            richText = true
        };
        
        EditorGUILayout.TextArea(logText, style, GUILayout.ExpandHeight(true));
        
        if (autoScroll && Event.current.type == EventType.Repaint)
        {
            scrollPosition.y = Mathf.Infinity;
        }
        
        EditorGUILayout.EndScrollView();
    }
    
    private void HandleLog(string logString, string stackTrace, LogType type)
    {
        if (string.IsNullOrEmpty(logString)) return;
        
        string color = type switch
        {
            LogType.Error => "red",
            LogType.Exception => "red",
            LogType.Warning => "yellow",
            _ => "white"
        };
        
        string formattedLog = $"<color={color}>[{System.DateTime.Now:HH:mm:ss}] {logString}</color>\n";
        logText = formattedLog + logText;
        
        // Limit log size
        string[] lines = logText.Split('\n');
        if (lines.Length > 1000)
        {
            logText = string.Join("\n", lines, 0, 1000);
        }
        
        Repaint();
    }
    
    private void Update()
    {
        // Force repaint to keep the log updated
        if (focusedWindow == this)
        {
            Repaint();
        }
    }
}

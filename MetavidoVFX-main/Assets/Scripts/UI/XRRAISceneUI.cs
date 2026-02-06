// XRRAISceneUI.cs - UI Toolkit panel for scene save/load/export
// Part of Spec 016: XRRAI Scene Format & Cross-Platform Export
//
// Provides:
// - Save/Load scene buttons
// - Export to glTF/USDZ
// - Scene list with thumbnails
// - Metadata editing

using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.UIElements;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace XRRAI.UI
{
    /// <summary>
    /// UI Toolkit panel for XRRAI scene management.
    /// Toggle with configurable key (default: F2).
    /// </summary>
    public class XRRAISceneUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Scene.XRRAISceneManager _sceneManager;

        [Header("UI Settings")]
#if ENABLE_INPUT_SYSTEM
        [SerializeField] private Key _toggleKey = Key.F2;
#else
        [SerializeField] private KeyCode _toggleKey = KeyCode.F2;
#endif
        [SerializeField] private bool _startVisible = false;
        [SerializeField] private float _panelWidth = 300f;

        // UI Elements
        private UIDocument _document;
        private VisualElement _root;
        private VisualElement _panel;
        private TextField _sceneNameField;
        private TextField _descriptionField;
        private VisualElement _sceneListContainer;
        private Label _statusLabel;
        private Button _saveBtn;
        private Button _loadBtn;
        private Button _newBtn;
        private Button _exportGltfBtn;
        private Button _exportUsdzBtn;
        private Button _exportTiltBtn;

        // State
        private bool _isVisible;
        private List<string> _savedScenes = new();

        void Awake()
        {
            // Find references
            if (_sceneManager == null)
                _sceneManager = FindFirstObjectByType<Scene.XRRAISceneManager>();

            // Get or create UIDocument
            _document = GetComponent<UIDocument>();
            if (_document == null)
            {
                _document = gameObject.AddComponent<UIDocument>();
                _document.panelSettings = Resources.Load<PanelSettings>("DefaultPanelSettings");
            }
        }

        void Start()
        {
            CreateUI();
            RefreshSceneList();
            SetVisible(_startVisible);

            // Subscribe to events
            if (_sceneManager != null)
            {
                _sceneManager.OnSceneSaved += OnSceneSaved;
                _sceneManager.OnSceneLoaded += OnSceneLoaded;
                _sceneManager.OnError += OnError;
            }
        }

        void OnDestroy()
        {
            if (_sceneManager != null)
            {
                _sceneManager.OnSceneSaved -= OnSceneSaved;
                _sceneManager.OnSceneLoaded -= OnSceneLoaded;
                _sceneManager.OnError -= OnError;
            }
        }

        void Update()
        {
            // Toggle visibility
#if ENABLE_INPUT_SYSTEM
            if (Keyboard.current != null && Keyboard.current[_toggleKey].wasPressedThisFrame)
#else
            if (Input.GetKeyDown(_toggleKey))
#endif
            {
                SetVisible(!_isVisible);
            }
        }

        void CreateUI()
        {
            _root = _document.rootVisualElement;
            _root.Clear();

            // Main panel
            _panel = new VisualElement();
            _panel.name = "xrrai-scene-panel";
            _panel.style.position = Position.Absolute;
            _panel.style.right = 10;
            _panel.style.top = 10;
            _panel.style.width = _panelWidth;
            _panel.style.backgroundColor = new Color(0.1f, 0.1f, 0.1f, 0.9f);
            _panel.style.borderTopLeftRadius = 8;
            _panel.style.borderTopRightRadius = 8;
            _panel.style.borderBottomLeftRadius = 8;
            _panel.style.borderBottomRightRadius = 8;
            _panel.style.paddingTop = 10;
            _panel.style.paddingBottom = 10;
            _panel.style.paddingLeft = 10;
            _panel.style.paddingRight = 10;

            // Title
            var title = new Label("XRRAI Scene");
            title.style.fontSize = 16;
            title.style.unityFontStyleAndWeight = FontStyle.Bold;
            title.style.marginBottom = 10;
            title.style.color = Color.white;
            _panel.Add(title);

            // Scene name
            _sceneNameField = new TextField("Name");
            _sceneNameField.value = "Untitled Scene";
            _sceneNameField.style.marginBottom = 5;
            _panel.Add(_sceneNameField);

            // Description
            _descriptionField = new TextField("Description");
            _descriptionField.multiline = true;
            _descriptionField.style.height = 50;
            _descriptionField.style.marginBottom = 10;
            _panel.Add(_descriptionField);

            // Action buttons row
            var buttonRow = new VisualElement();
            buttonRow.style.flexDirection = FlexDirection.Row;
            buttonRow.style.marginBottom = 10;

            _newBtn = CreateButton("New", OnNewClicked);
            _saveBtn = CreateButton("Save", OnSaveClicked);
            _loadBtn = CreateButton("Load", OnLoadClicked);

            buttonRow.Add(_newBtn);
            buttonRow.Add(_saveBtn);
            buttonRow.Add(_loadBtn);
            _panel.Add(buttonRow);

            // Export buttons row
            var exportRow = new VisualElement();
            exportRow.style.flexDirection = FlexDirection.Row;
            exportRow.style.marginBottom = 10;

            _exportGltfBtn = CreateButton("GLB", OnExportGltfClicked);
            _exportUsdzBtn = CreateButton("USDZ", OnExportUsdzClicked);
            _exportTiltBtn = CreateButton("Tilt", OnExportTiltClicked);

            exportRow.Add(_exportGltfBtn);
            exportRow.Add(_exportUsdzBtn);
            exportRow.Add(_exportTiltBtn);
            _panel.Add(exportRow);

            // Saved scenes label
            var savedLabel = new Label("Saved Scenes");
            savedLabel.style.fontSize = 12;
            savedLabel.style.marginTop = 5;
            savedLabel.style.marginBottom = 5;
            savedLabel.style.color = new Color(0.7f, 0.7f, 0.7f);
            _panel.Add(savedLabel);

            // Scene list container
            _sceneListContainer = new ScrollView();
            _sceneListContainer.style.maxHeight = 200;
            _sceneListContainer.style.backgroundColor = new Color(0.05f, 0.05f, 0.05f, 0.8f);
            _sceneListContainer.style.borderTopLeftRadius = 4;
            _sceneListContainer.style.borderTopRightRadius = 4;
            _sceneListContainer.style.borderBottomLeftRadius = 4;
            _sceneListContainer.style.borderBottomRightRadius = 4;
            _sceneListContainer.style.paddingTop = 5;
            _sceneListContainer.style.paddingBottom = 5;
            _panel.Add(_sceneListContainer);

            // Status label
            _statusLabel = new Label("");
            _statusLabel.style.fontSize = 10;
            _statusLabel.style.marginTop = 10;
            _statusLabel.style.color = new Color(0.5f, 0.8f, 0.5f);
            _panel.Add(_statusLabel);

            // Key hint
            var hint = new Label($"Press {_toggleKey} to toggle");
            hint.style.fontSize = 9;
            hint.style.color = new Color(0.5f, 0.5f, 0.5f);
            hint.style.marginTop = 5;
            _panel.Add(hint);

            _root.Add(_panel);
        }

        Button CreateButton(string text, Action onClick)
        {
            var btn = new Button(onClick);
            btn.text = text;
            btn.style.flexGrow = 1;
            btn.style.marginRight = 5;
            btn.style.height = 28;
            return btn;
        }

        void RefreshSceneList()
        {
            _sceneListContainer.Clear();
            _savedScenes.Clear();

            if (_sceneManager == null) return;

            _savedScenes = _sceneManager.GetSavedScenes();

            if (_savedScenes.Count == 0)
            {
                var empty = new Label("No saved scenes");
                empty.style.color = new Color(0.5f, 0.5f, 0.5f);
                empty.style.paddingLeft = 10;
                _sceneListContainer.Add(empty);
                return;
            }

            foreach (var filepath in _savedScenes)
            {
                var filename = Path.GetFileNameWithoutExtension(filepath);
                var row = CreateSceneRow(filename, filepath);
                _sceneListContainer.Add(row);
            }
        }

        VisualElement CreateSceneRow(string name, string filepath)
        {
            var row = new VisualElement();
            row.style.flexDirection = FlexDirection.Row;
            row.style.paddingLeft = 5;
            row.style.paddingRight = 5;
            row.style.paddingTop = 3;
            row.style.paddingBottom = 3;

            row.RegisterCallback<MouseEnterEvent>(e => row.style.backgroundColor = new Color(0.2f, 0.2f, 0.2f));
            row.RegisterCallback<MouseLeaveEvent>(e => row.style.backgroundColor = Color.clear);

            var label = new Label(name);
            label.style.flexGrow = 1;
            label.style.color = Color.white;
            row.Add(label);

            var loadBtn = new Button(() => LoadSceneFile(filepath));
            loadBtn.text = "Load";
            loadBtn.style.width = 50;
            loadBtn.style.height = 22;
            row.Add(loadBtn);

            var deleteBtn = new Button(() => DeleteSceneFile(filepath));
            deleteBtn.text = "X";
            deleteBtn.style.width = 24;
            deleteBtn.style.height = 22;
            deleteBtn.style.color = new Color(1f, 0.4f, 0.4f);
            row.Add(deleteBtn);

            return row;
        }

        void SetVisible(bool visible)
        {
            _isVisible = visible;
            _panel.style.display = visible ? DisplayStyle.Flex : DisplayStyle.None;

            if (visible)
            {
                RefreshSceneList();
                UpdateFieldsFromScene();
            }
        }

        void UpdateFieldsFromScene()
        {
            if (_sceneManager?.CurrentScene == null) return;

            _sceneNameField.value = _sceneManager.CurrentScene.scene.name ?? "Untitled";
            _descriptionField.value = _sceneManager.CurrentScene.scene.description ?? "";
        }

        void SetStatus(string message, bool isError = false)
        {
            _statusLabel.text = message;
            _statusLabel.style.color = isError ? new Color(1f, 0.4f, 0.4f) : new Color(0.5f, 0.8f, 0.5f);
        }

        #region Button Handlers

        void OnNewClicked()
        {
            _sceneManager?.NewScene(_sceneNameField.value);
            UpdateFieldsFromScene();
            SetStatus("New scene created");
        }

        void OnSaveClicked()
        {
            if (_sceneManager == null) return;

            // Update metadata
            _sceneManager.SetSceneMetadata(_sceneNameField.value, _descriptionField.value);

            // Save
            if (_sceneManager.SaveScene())
            {
                SetStatus($"Saved: {_sceneNameField.value}");
                RefreshSceneList();
            }
        }

        void OnLoadClicked()
        {
            // Show file picker (simplified - just refresh list)
            RefreshSceneList();
            SetStatus("Select a scene from list");
        }

        async void OnExportGltfClicked()
        {
            if (_sceneManager == null) return;

            SetStatus("Exporting glTF...");
            var path = await _sceneManager.ExportGLTFAsync();

            if (path != null)
                SetStatus($"Exported: {Path.GetFileName(path)}");
        }

        async void OnExportUsdzClicked()
        {
            if (_sceneManager == null) return;

            SetStatus("Exporting USDZ (via GLB)...");
            var path = await _sceneManager.ExportUSDZAsync();

            if (path != null)
                SetStatus($"GLB exported: {Path.GetFileName(path)}");
        }

        async void OnExportTiltClicked()
        {
            if (_sceneManager == null) return;

            SetStatus("Exporting .tilt (OpenBrush)...");
            var path = await _sceneManager.ExportTiltAsync();

            if (path != null)
                SetStatus($"Exported: {Path.GetFileName(path)}");
        }

        void LoadSceneFile(string filepath)
        {
            if (_sceneManager == null) return;

            if (_sceneManager.LoadScene(filepath))
            {
                UpdateFieldsFromScene();
                SetStatus($"Loaded: {Path.GetFileNameWithoutExtension(filepath)}");
            }
        }

        void DeleteSceneFile(string filepath)
        {
            if (_sceneManager == null) return;

            if (_sceneManager.DeleteScene(filepath))
            {
                RefreshSceneList();
                SetStatus("Scene deleted");
            }
        }

        #endregion

        #region Event Handlers

        void OnSceneSaved(Scene.XRRAIScene scene)
        {
            RefreshSceneList();
        }

        void OnSceneLoaded(Scene.XRRAIScene scene)
        {
            UpdateFieldsFromScene();
        }

        void OnError(string message)
        {
            SetStatus(message, true);
        }

        #endregion
    }
}

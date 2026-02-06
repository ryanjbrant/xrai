// WebBridge.cs - Unity↔React communication for WebGL builds
// Part of Spec 013 Phase 5: Web Deployment

using System;
using System.Runtime.InteropServices;
using UnityEngine;
using XRRAI.Auth;

namespace XRRAI.Bridges
{
    /// <summary>
    /// Bridge for Unity WebGL ↔ React communication.
    /// Handles authentication state, room management, and bidirectional messaging.
    /// </summary>
    public class WebBridge : MonoBehaviour
    {
        public static WebBridge Instance { get; private set; }

        [Header("References")]
        [SerializeField] AuthManager _authManager;

        // Events for Unity-side listeners
        public event Action<AuthUser> OnAuthStateReceived;
        public event Action<string> OnRoomJoinRequested;
        public event Action<string> OnMessageFromWeb;

        // JavaScript interop (WebGL only)
#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern void SendToReactJS(string message);
#else
        private static void SendToReactJS(string message)
        {
            Debug.Log($"[WebBridge] Would send to React: {message}");
        }
#endif

        void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        void Start()
        {
            // Find AuthManager if not assigned
            if (_authManager == null)
                _authManager = FindFirstObjectByType<AuthManager>();

            // Subscribe to auth changes
            if (_authManager != null)
            {
                _authManager.OnAuthStateChanged += HandleAuthStateChanged;
            }

#if UNITY_WEBGL && !UNITY_EDITOR
            // Notify React that Unity is ready
            SendToReact(new WebMessage { type = "UNITY_READY" });
#endif
        }

        void OnDestroy()
        {
            if (_authManager != null)
            {
                _authManager.OnAuthStateChanged -= HandleAuthStateChanged;
            }

            if (Instance == this)
                Instance = null;
        }

        #region React → Unity (called from JavaScript)

        /// <summary>
        /// Called from React when user authenticates via web auth flow.
        /// </summary>
        public void OnAuthStateChanged(string jsonData)
        {
            Debug.Log($"[WebBridge] Auth state received: {jsonData}");

            try
            {
                var webUser = JsonUtility.FromJson<WebAuthUser>(jsonData);
                var authUser = new AuthUser
                {
                    UserId = webUser.userId,
                    Email = webUser.email,
                    DisplayName = webUser.displayName,
                    PhotoUrl = webUser.photoUrl
                    // IsAnonymous is computed from Email (string.IsNullOrEmpty(Email))
                };

                OnAuthStateReceived?.Invoke(authUser);

                // Update AuthManager if available
                if (_authManager != null)
                {
                    _authManager.SetCurrentUser(authUser);
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[WebBridge] Failed to parse auth data: {e.Message}");
            }
        }

        /// <summary>
        /// Called from React when user wants to join a room.
        /// </summary>
        public void JoinRoom(string roomCode)
        {
            Debug.Log($"[WebBridge] Join room requested: {roomCode}");
            OnRoomJoinRequested?.Invoke(roomCode);
        }

        /// <summary>
        /// Generic message handler from React.
        /// </summary>
        public void OnMessageFromReact(string jsonData)
        {
            Debug.Log($"[WebBridge] Message from React: {jsonData}");

            try
            {
                var message = JsonUtility.FromJson<WebMessage>(jsonData);
                HandleWebMessage(message);
            }
            catch (Exception e)
            {
                Debug.LogError($"[WebBridge] Failed to parse message: {e.Message}");
                OnMessageFromWeb?.Invoke(jsonData);
            }
        }

        #endregion

        #region Unity → React

        /// <summary>
        /// Send a message to React.
        /// </summary>
        public void SendToReact(WebMessage message)
        {
            string json = JsonUtility.ToJson(message);
            SendToReactJS(json);
        }

        /// <summary>
        /// Request authentication from React (show login UI).
        /// </summary>
        public void RequestAuthentication()
        {
            SendToReact(new WebMessage { type = "AUTH_REQUIRED" });
        }

        /// <summary>
        /// Notify React of sign out.
        /// </summary>
        public void NotifySignOut()
        {
            SendToReact(new WebMessage { type = "SIGN_OUT" });
        }

        /// <summary>
        /// Send room state to React.
        /// </summary>
        public void SendRoomState(string roomCode, int participantCount)
        {
            SendToReact(new WebMessage
            {
                type = "ROOM_STATE",
                data = JsonUtility.ToJson(new RoomState
                {
                    roomCode = roomCode,
                    participantCount = participantCount
                })
            });
        }

        /// <summary>
        /// Send error to React.
        /// </summary>
        public void SendError(string errorCode, string message)
        {
            SendToReact(new WebMessage
            {
                type = "ERROR",
                data = JsonUtility.ToJson(new ErrorData
                {
                    code = errorCode,
                    message = message
                })
            });
        }

        #endregion

        #region Internal

        void HandleAuthStateChanged(AuthUser user)
        {
            if (user != null)
            {
                SendToReact(new WebMessage
                {
                    type = "AUTH_STATE_CHANGED",
                    data = JsonUtility.ToJson(new WebAuthUser
                    {
                        userId = user.UserId,
                        email = user.Email,
                        displayName = user.DisplayName,
                        photoUrl = user.PhotoUrl
                    })
                });
            }
            else
            {
                SendToReact(new WebMessage { type = "AUTH_STATE_CHANGED", data = "null" });
            }
        }

        void HandleWebMessage(WebMessage message)
        {
            switch (message.type)
            {
                case "SIGN_OUT":
                    _authManager?.SignOutAsync();
                    break;

                case "JOIN_ROOM":
                    OnRoomJoinRequested?.Invoke(message.data);
                    break;

                default:
                    OnMessageFromWeb?.Invoke(JsonUtility.ToJson(message));
                    break;
            }
        }

        #endregion

        #region Data Classes

        [Serializable]
        public class WebMessage
        {
            public string type;
            public string data;
        }

        [Serializable]
        public class WebAuthUser
        {
            public string userId;
            public string email;
            public string displayName;
            public string photoUrl;
        }

        [Serializable]
        public class RoomState
        {
            public string roomCode;
            public int participantCount;
        }

        [Serializable]
        public class ErrorData
        {
            public string code;
            public string message;
        }

        #endregion
    }
}

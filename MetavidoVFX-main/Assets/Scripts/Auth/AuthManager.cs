// AuthManager.cs - Singleton for app-wide authentication state
// Part of Spec 013: UI/UX Conferencing System
//
// Provides global access to auth state across scenes.
// Initializes the appropriate auth provider based on platform/configuration.

using System;
using UnityEngine;

namespace XRRAI.Auth
{
    /// <summary>
    /// Singleton that manages authentication state across the application.
    /// Access via AuthManager.Instance from anywhere.
    /// </summary>
    public class AuthManager : MonoBehaviour
    {
        public static AuthManager Instance { get; private set; }

        [Header("Configuration")]
        [Tooltip("Auth provider to use. Auto will select based on platform and SDK availability.")]
        [SerializeField] AuthProviderType _providerType = AuthProviderType.Auto;

        [Tooltip("Persist auth state across scene loads")]
        [SerializeField] bool _dontDestroyOnLoad = true;

        public enum AuthProviderType
        {
            Auto,       // Select best available for platform
            Mock,       // Always use mock (for development)
            Firebase,   // Firebase Auth (requires SDK)
            Apple,      // Apple Sign In (iOS/macOS only)
            Google      // Google Sign In (requires SDK)
        }

        // Auth providers
        IAuthProvider _primaryProvider;
        IAuthProvider _appleProvider;
        IAuthProvider _googleProvider;

        // Primary provider (accessed via AuthProvider property)
        IAuthProvider _authProvider;

        // Events
        public event Action<AuthUser> OnSignIn;
        public event Action OnSignOut;

        // Public properties
        public IAuthProvider AuthProvider => _authProvider;
        public AuthUser CurrentUser => _authProvider?.CurrentUser;
        public bool IsSignedIn => CurrentUser != null;
        public string UserId => CurrentUser?.UserId;
        public string UserEmail => CurrentUser?.Email;
        public string UserDisplayName => CurrentUser?.DisplayName;

        void Awake()
        {
            // Singleton pattern
            if (Instance != null && Instance != this)
            {
                Debug.Log("[AuthManager] Duplicate instance destroyed");
                Destroy(gameObject);
                return;
            }

            Instance = this;

            if (_dontDestroyOnLoad)
                DontDestroyOnLoad(gameObject);

            InitializeAuthProvider();
        }

        void InitializeAuthProvider()
        {
            // Initialize all available providers
            InitializeAllProviders();

            // Select primary provider based on configuration
            _authProvider = SelectPrimaryProvider();

            if (_authProvider != null)
            {
                _authProvider.OnAuthStateChanged += HandleAuthStateChanged;
                Debug.Log($"[AuthManager] Initialized with {_authProvider.ProviderId}");
            }
            else
            {
                Debug.LogError("[AuthManager] No auth provider available!");
            }
        }

        void InitializeAllProviders()
        {
            // Always create these - they handle SDK availability internally
            _appleProvider = new AppleSignInProvider();
            _googleProvider = new GoogleSignInProvider();
            _primaryProvider = new FirebaseAuthProvider();

            // Wire up OAuth providers to forward state changes
            _appleProvider.OnAuthStateChanged += HandleAuthStateChanged;
            _googleProvider.OnAuthStateChanged += HandleAuthStateChanged;
        }

        IAuthProvider SelectPrimaryProvider()
        {
            switch (_providerType)
            {
                case AuthProviderType.Mock:
                    return new MockAuthProvider();

                case AuthProviderType.Firebase:
                    if (_primaryProvider.IsAvailable)
                        return _primaryProvider;
                    Debug.LogWarning("[AuthManager] Firebase not available, falling back to Mock");
                    return new MockAuthProvider();

                case AuthProviderType.Apple:
                    if (_appleProvider.IsAvailable)
                        return _appleProvider;
                    Debug.LogWarning("[AuthManager] Apple Sign In not available, falling back to Mock");
                    return new MockAuthProvider();

                case AuthProviderType.Google:
                    if (_googleProvider.IsAvailable)
                        return _googleProvider;
                    Debug.LogWarning("[AuthManager] Google Sign In not available, falling back to Mock");
                    return new MockAuthProvider();

                case AuthProviderType.Auto:
                default:
                    return SelectBestProvider();
            }
        }

        IAuthProvider SelectBestProvider()
        {
#if UNITY_EDITOR
            // Always use mock in Editor for fast iteration
            Debug.Log("[AuthManager] Editor detected, using MockAuthProvider");
            return new MockAuthProvider();
#else
            // Try Firebase first (most feature-complete)
            if (_primaryProvider.IsAvailable)
            {
                Debug.Log("[AuthManager] Using FirebaseAuthProvider");
                return _primaryProvider;
            }

#if UNITY_IOS || UNITY_STANDALONE_OSX
            // iOS/macOS - try Apple Sign In
            if (_appleProvider.IsAvailable)
            {
                Debug.Log("[AuthManager] Using AppleSignInProvider");
                return _appleProvider;
            }
#endif

#if UNITY_ANDROID || UNITY_STANDALONE_WIN || UNITY_STANDALONE_LINUX
            // Android/Windows/Linux - try Google
            if (_googleProvider.IsAvailable)
            {
                Debug.Log("[AuthManager] Using GoogleSignInProvider");
                return _googleProvider;
            }
#endif

            // Fallback to mock
            Debug.LogWarning("[AuthManager] No SDK available, using MockAuthProvider");
            return new MockAuthProvider();
#endif
        }

        void HandleAuthStateChanged(AuthUser user)
        {
            if (user != null)
            {
                Debug.Log($"[AuthManager] User signed in: {user.Email}");
                OnSignIn?.Invoke(user);
            }
            else
            {
                Debug.Log("[AuthManager] User signed out");
                OnSignOut?.Invoke();
            }
        }

        void OnDestroy()
        {
            // Cleanup all provider subscriptions
            if (_authProvider != null)
                _authProvider.OnAuthStateChanged -= HandleAuthStateChanged;

            if (_appleProvider != null)
                _appleProvider.OnAuthStateChanged -= HandleAuthStateChanged;

            if (_googleProvider != null)
                _googleProvider.OnAuthStateChanged -= HandleAuthStateChanged;

            if (Instance == this)
                Instance = null;
        }

        #region Public API

        /// <summary>
        /// Sign in with email and password
        /// </summary>
        public async System.Threading.Tasks.Task<AuthResult> SignInAsync(string email, string password)
        {
            if (_authProvider == null)
                return AuthResult.Failed("Auth provider not initialized");

            return await _authProvider.SignInWithEmailAsync(email, password);
        }

        /// <summary>
        /// Create a new account
        /// </summary>
        public async System.Threading.Tasks.Task<AuthResult> CreateAccountAsync(string email, string password, string displayName)
        {
            if (_authProvider == null)
                return AuthResult.Failed("Auth provider not initialized");

            return await _authProvider.CreateAccountWithEmailAsync(email, password, displayName);
        }

        /// <summary>
        /// Sign in with a third-party provider
        /// </summary>
        public async System.Threading.Tasks.Task<AuthResult> SignInWithProviderAsync(string providerId)
        {
            if (_authProvider == null)
                return AuthResult.Failed("Auth provider not initialized");

            return await _authProvider.SignInWithProviderAsync(providerId);
        }

        /// <summary>
        /// Sign in with Apple (iOS/macOS only)
        /// </summary>
        public async System.Threading.Tasks.Task<AuthResult> SignInWithAppleAsync()
        {
            if (_appleProvider == null || !_appleProvider.IsAvailable)
                return AuthResult.Failed("Apple Sign In not available on this platform", AuthErrorCode.ProviderNotAvailable);

            return await _appleProvider.SignInWithProviderAsync("apple");
        }

        /// <summary>
        /// Sign in with Google
        /// </summary>
        public async System.Threading.Tasks.Task<AuthResult> SignInWithGoogleAsync()
        {
            if (_googleProvider == null || !_googleProvider.IsAvailable)
                return AuthResult.Failed("Google Sign In not available", AuthErrorCode.ProviderNotAvailable);

            return await _googleProvider.SignInWithProviderAsync("google");
        }

        /// <summary>
        /// Check if Apple Sign In is available
        /// </summary>
        public bool IsAppleSignInAvailable => _appleProvider?.IsAvailable ?? false;

        /// <summary>
        /// Check if Google Sign In is available
        /// </summary>
        public bool IsGoogleSignInAvailable => _googleProvider?.IsAvailable ?? false;

        /// <summary>
        /// Sign out the current user
        /// </summary>
        public async System.Threading.Tasks.Task SignOutAsync()
        {
            if (_authProvider != null)
                await _authProvider.SignOutAsync();
        }

        /// <summary>
        /// Require authentication - returns current user or null if not signed in.
        /// Use in scenes that require auth.
        /// </summary>
        public AuthUser RequireAuth(Action onNotAuthenticated = null)
        {
            if (!IsSignedIn)
            {
                Debug.LogWarning("[AuthManager] User not authenticated");
                onNotAuthenticated?.Invoke();
                return null;
            }
            return CurrentUser;
        }

        #endregion

        #region Editor Helpers

        [ContextMenu("Debug Auth State")]
        void DebugAuthState()
        {
            Debug.Log("=== AuthManager State ===");
            Debug.Log($"IsSignedIn: {IsSignedIn}");
            Debug.Log($"Provider: {_authProvider?.ProviderId ?? "null"}");
            if (CurrentUser != null)
            {
                Debug.Log($"UserId: {CurrentUser.UserId}");
                Debug.Log($"Email: {CurrentUser.Email}");
                Debug.Log($"DisplayName: {CurrentUser.DisplayName}");
                Debug.Log($"IsEmailVerified: {CurrentUser.IsEmailVerified}");
            }
        }

        [ContextMenu("Sign Out (Debug)")]
        void DebugSignOut()
        {
            _ = SignOutAsync();
        }

        #endregion
    }
}

// AppleSignInProvider.cs - Apple Sign In authentication provider
// Part of Spec 013: UI/UX Conferencing System
//
// Requires: com.unity.sign-in-with-apple package (or Apple Auth plugin)
// Define: APPLE_SIGNIN_AVAILABLE
// Platform: iOS, macOS only

using System;
using System.Threading.Tasks;
using UnityEngine;

namespace XRRAI.Auth
{
    /// <summary>
    /// Apple Sign In authentication provider.
    /// Required for iOS App Store compliance.
    /// </summary>
    public class AppleSignInProvider : IAuthProvider
    {
        public string ProviderId => "apple";

#if APPLE_SIGNIN_AVAILABLE && (UNITY_IOS || UNITY_STANDALONE_OSX)
        private AuthUser _currentUser;

        public bool IsAvailable => true;
        public AuthUser CurrentUser => _currentUser;
        public event Action<AuthUser> OnAuthStateChanged;

        public AppleSignInProvider()
        {
            // Check for existing credentials on startup
            CheckExistingCredentials();
        }

        async void CheckExistingCredentials()
        {
            // Apple Sign In caches credentials - check if still valid
            try
            {
                var credentialState = await AppleAuth.IOS.AppleAuthManager.GetCredentialStateAsync(
                    PlayerPrefs.GetString("AppleUserId", ""));

                if (credentialState == AppleAuth.Enums.CredentialState.Authorized)
                {
                    // Restore user from cache
                    _currentUser = new AuthUser
                    {
                        UserId = PlayerPrefs.GetString("AppleUserId"),
                        Email = PlayerPrefs.GetString("AppleUserEmail"),
                        DisplayName = PlayerPrefs.GetString("AppleUserName"),
                        ProviderId = ProviderId
                    };
                    OnAuthStateChanged?.Invoke(_currentUser);
                }
            }
            catch (Exception ex)
            {
                Debug.Log($"[AppleSignIn] No cached credentials: {ex.Message}");
            }
        }

        public Task<AuthResult> SignInWithEmailAsync(string email, string password)
        {
            return Task.FromResult(AuthResult.Failed(
                "Apple Sign In doesn't support email/password. Use SignInWithProviderAsync.",
                AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> CreateAccountWithEmailAsync(string email, string password, string displayName)
        {
            return Task.FromResult(AuthResult.Failed(
                "Apple Sign In doesn't support account creation. Use SignInWithProviderAsync.",
                AuthErrorCode.ProviderNotAvailable));
        }

        public async Task<AuthResult> SignInWithProviderAsync(string providerId)
        {
            if (providerId != "apple")
            {
                return AuthResult.Failed($"Provider '{providerId}' not supported by AppleSignInProvider",
                    AuthErrorCode.ProviderNotAvailable);
            }

            try
            {
                var loginArgs = new AppleAuth.AppleAuthLoginArgs(
                    AppleAuth.Enums.LoginOptions.IncludeEmail |
                    AppleAuth.Enums.LoginOptions.IncludeFullName);

                var credential = await AppleAuth.IOS.AppleAuthManager.LoginWithAppleIdAsync(loginArgs);

                _currentUser = new AuthUser
                {
                    UserId = credential.User,
                    Email = credential.Email,
                    DisplayName = $"{credential.FullName?.GivenName} {credential.FullName?.FamilyName}".Trim(),
                    ProviderId = ProviderId
                };

                // Cache for future sessions (Apple only provides name/email on first sign-in)
                PlayerPrefs.SetString("AppleUserId", _currentUser.UserId);
                if (!string.IsNullOrEmpty(_currentUser.Email))
                    PlayerPrefs.SetString("AppleUserEmail", _currentUser.Email);
                if (!string.IsNullOrEmpty(_currentUser.DisplayName))
                    PlayerPrefs.SetString("AppleUserName", _currentUser.DisplayName);
                PlayerPrefs.Save();

                OnAuthStateChanged?.Invoke(_currentUser);
                return AuthResult.Succeeded(_currentUser);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("canceled") || ex.Message.Contains("cancelled"))
                {
                    return AuthResult.Failed("Sign in cancelled", AuthErrorCode.Cancelled);
                }
                return AuthResult.Failed(ex.Message, AuthErrorCode.Unknown);
            }
        }

        public Task SignOutAsync()
        {
            _currentUser = null;
            // Note: Apple Sign In doesn't have server-side sign out
            // We just clear local state
            OnAuthStateChanged?.Invoke(null);
            return Task.CompletedTask;
        }

        public Task<AuthResult> SendPasswordResetEmailAsync(string email)
        {
            return Task.FromResult(AuthResult.Failed(
                "Apple Sign In doesn't support password reset",
                AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> UpdateProfileAsync(string displayName, string photoUrl)
        {
            // Apple doesn't allow profile updates through Sign In
            // Store locally if needed
            if (_currentUser != null)
            {
                _currentUser.DisplayName = displayName;
                _currentUser.PhotoUrl = photoUrl;
                PlayerPrefs.SetString("AppleUserName", displayName);
                PlayerPrefs.Save();
                return Task.FromResult(AuthResult.Succeeded(_currentUser));
            }
            return Task.FromResult(AuthResult.Failed("No user signed in", AuthErrorCode.UserNotFound));
        }
#else
        // Stub implementation when Apple Sign In is not available
        public bool IsAvailable
        {
            get
            {
#if UNITY_IOS || UNITY_STANDALONE_OSX
                Debug.LogWarning("[AppleSignIn] Apple Sign In SDK not installed. Add APPLE_SIGNIN_AVAILABLE define.");
                return false;
#else
                return false; // Not available on non-Apple platforms
#endif
            }
        }

        public AuthUser CurrentUser => null;
        public event Action<AuthUser> OnAuthStateChanged;

        public Task<AuthResult> SignInWithEmailAsync(string email, string password)
        {
            return Task.FromResult(AuthResult.Failed("Apple Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> CreateAccountWithEmailAsync(string email, string password, string displayName)
        {
            return Task.FromResult(AuthResult.Failed("Apple Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> SignInWithProviderAsync(string providerId)
        {
            return Task.FromResult(AuthResult.Failed("Apple Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task SignOutAsync() => Task.CompletedTask;

        public Task<AuthResult> SendPasswordResetEmailAsync(string email)
        {
            return Task.FromResult(AuthResult.Failed("Apple Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> UpdateProfileAsync(string displayName, string photoUrl)
        {
            return Task.FromResult(AuthResult.Failed("Apple Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }
#endif
    }
}

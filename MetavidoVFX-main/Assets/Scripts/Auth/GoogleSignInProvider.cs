// GoogleSignInProvider.cs - Google Sign In authentication provider
// Part of Spec 013: UI/UX Conferencing System
//
// Requires: com.google.play.games or Google Sign-In Unity plugin
// Define: GOOGLE_SIGNIN_AVAILABLE
// Platform: iOS, Android, Standalone

using System;
using System.Threading.Tasks;
using UnityEngine;

namespace XRRAI.Auth
{
    /// <summary>
    /// Google Sign In authentication provider.
    /// Works across iOS, Android, and Standalone platforms.
    /// </summary>
    public class GoogleSignInProvider : IAuthProvider
    {
        public string ProviderId => "google";

#if GOOGLE_SIGNIN_AVAILABLE
        private AuthUser _currentUser;
        private Google.GoogleSignIn _googleSignIn;

        public bool IsAvailable => true;
        public AuthUser CurrentUser => _currentUser;
        public event Action<AuthUser> OnAuthStateChanged;

        // Your web client ID from Google Cloud Console
        private const string WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";

        public GoogleSignInProvider()
        {
            var configuration = new Google.GoogleSignInConfiguration
            {
                WebClientId = WEB_CLIENT_ID,
                RequestIdToken = true,
                RequestEmail = true
            };
            _googleSignIn = Google.GoogleSignIn.DefaultInstance;

            // Check for existing sign-in
            CheckExistingSignIn();
        }

        async void CheckExistingSignIn()
        {
            try
            {
                // Try silent sign-in for returning users
                var result = await _googleSignIn.SignInSilently();
                if (result != null)
                {
                    _currentUser = new AuthUser
                    {
                        UserId = result.UserId,
                        Email = result.Email,
                        DisplayName = result.DisplayName,
                        PhotoUrl = result.ImageUrl?.ToString(),
                        ProviderId = ProviderId
                    };
                    OnAuthStateChanged?.Invoke(_currentUser);
                }
            }
            catch (Exception ex)
            {
                Debug.Log($"[GoogleSignIn] No cached credentials: {ex.Message}");
            }
        }

        public Task<AuthResult> SignInWithEmailAsync(string email, string password)
        {
            return Task.FromResult(AuthResult.Failed(
                "Google Sign In doesn't support email/password. Use SignInWithProviderAsync.",
                AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> CreateAccountWithEmailAsync(string email, string password, string displayName)
        {
            return Task.FromResult(AuthResult.Failed(
                "Google Sign In doesn't support account creation. Use SignInWithProviderAsync.",
                AuthErrorCode.ProviderNotAvailable));
        }

        public async Task<AuthResult> SignInWithProviderAsync(string providerId)
        {
            if (providerId != "google")
            {
                return AuthResult.Failed($"Provider '{providerId}' not supported by GoogleSignInProvider",
                    AuthErrorCode.ProviderNotAvailable);
            }

            try
            {
                var result = await _googleSignIn.SignIn();

                if (result == null)
                {
                    return AuthResult.Failed("Sign in returned null", AuthErrorCode.Unknown);
                }

                _currentUser = new AuthUser
                {
                    UserId = result.UserId,
                    Email = result.Email,
                    DisplayName = result.DisplayName,
                    PhotoUrl = result.ImageUrl?.ToString(),
                    ProviderId = ProviderId
                };

                OnAuthStateChanged?.Invoke(_currentUser);
                return AuthResult.Succeeded(_currentUser);
            }
            catch (Google.GoogleSignIn.SignInException ex)
            {
                // Map Google Sign-In status codes
                switch (ex.Status)
                {
                    case Google.GoogleSignInStatusCode.Canceled:
                        return AuthResult.Failed("Sign in cancelled", AuthErrorCode.Cancelled);
                    case Google.GoogleSignInStatusCode.NetworkError:
                        return AuthResult.Failed("Network error", AuthErrorCode.NetworkError);
                    default:
                        return AuthResult.Failed(ex.Message, AuthErrorCode.Unknown);
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("cancel"))
                {
                    return AuthResult.Failed("Sign in cancelled", AuthErrorCode.Cancelled);
                }
                return AuthResult.Failed(ex.Message, AuthErrorCode.Unknown);
            }
        }

        public async Task SignOutAsync()
        {
            try
            {
                await _googleSignIn.SignOut();
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[GoogleSignIn] Sign out error: {ex.Message}");
            }

            _currentUser = null;
            OnAuthStateChanged?.Invoke(null);
        }

        public Task<AuthResult> SendPasswordResetEmailAsync(string email)
        {
            return Task.FromResult(AuthResult.Failed(
                "Google Sign In doesn't support password reset",
                AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> UpdateProfileAsync(string displayName, string photoUrl)
        {
            // Google doesn't allow profile updates through Sign In
            // Could store locally if needed
            return Task.FromResult(AuthResult.Failed(
                "Profile updates not supported by Google Sign In",
                AuthErrorCode.ProviderNotAvailable));
        }
#else
        // Stub implementation when Google Sign In is not available
        public bool IsAvailable => false;
        public AuthUser CurrentUser => null;
        public event Action<AuthUser> OnAuthStateChanged;

        public Task<AuthResult> SignInWithEmailAsync(string email, string password)
        {
            Debug.LogWarning("[GoogleSignInProvider] Google Sign In SDK not installed. Add GOOGLE_SIGNIN_AVAILABLE define.");
            return Task.FromResult(AuthResult.Failed("Google Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> CreateAccountWithEmailAsync(string email, string password, string displayName)
        {
            return Task.FromResult(AuthResult.Failed("Google Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> SignInWithProviderAsync(string providerId)
        {
            return Task.FromResult(AuthResult.Failed("Google Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task SignOutAsync() => Task.CompletedTask;

        public Task<AuthResult> SendPasswordResetEmailAsync(string email)
        {
            return Task.FromResult(AuthResult.Failed("Google Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> UpdateProfileAsync(string displayName, string photoUrl)
        {
            return Task.FromResult(AuthResult.Failed("Google Sign In not available", AuthErrorCode.ProviderNotAvailable));
        }
#endif
    }
}

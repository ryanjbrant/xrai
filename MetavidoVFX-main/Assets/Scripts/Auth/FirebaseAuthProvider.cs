// FirebaseAuthProvider.cs - Firebase Authentication provider
// Part of Spec 013: UI/UX Conferencing System
//
// Requires: com.google.firebase.auth package
// Define: FIREBASE_AUTH_AVAILABLE

using System;
using System.Threading.Tasks;
using UnityEngine;

namespace XRRAI.Auth
{
    /// <summary>
    /// Firebase Authentication provider implementation.
    /// Requires Firebase Unity SDK to be installed.
    /// </summary>
    public class FirebaseAuthProvider : IAuthProvider
    {
        public string ProviderId => "firebase";

#if FIREBASE_AUTH_AVAILABLE
        private Firebase.Auth.FirebaseAuth _auth;
        private AuthUser _currentUser;

        public bool IsAvailable => true;
        public AuthUser CurrentUser => _currentUser;
        public event Action<AuthUser> OnAuthStateChanged;

        public FirebaseAuthProvider()
        {
            _auth = Firebase.Auth.FirebaseAuth.DefaultInstance;
            _auth.StateChanged += OnFirebaseAuthStateChanged;
            UpdateCurrentUser();
        }

        void OnFirebaseAuthStateChanged(object sender, EventArgs e)
        {
            UpdateCurrentUser();
            OnAuthStateChanged?.Invoke(_currentUser);
        }

        void UpdateCurrentUser()
        {
            var firebaseUser = _auth.CurrentUser;
            if (firebaseUser != null)
            {
                _currentUser = new AuthUser
                {
                    UserId = firebaseUser.UserId,
                    Email = firebaseUser.Email,
                    DisplayName = firebaseUser.DisplayName,
                    PhotoUrl = firebaseUser.PhotoUrl?.ToString(),
                    IsEmailVerified = firebaseUser.IsEmailVerified,
                    ProviderId = ProviderId
                };
            }
            else
            {
                _currentUser = null;
            }
        }

        public async Task<AuthResult> SignInWithEmailAsync(string email, string password)
        {
            try
            {
                var result = await _auth.SignInWithEmailAndPasswordAsync(email, password);
                UpdateCurrentUser();
                return AuthResult.Succeeded(_currentUser);
            }
            catch (Firebase.Auth.FirebaseAccountLinkException ex)
            {
                return AuthResult.Failed(ex.Message, AuthErrorCode.EmailAlreadyInUse);
            }
            catch (Exception ex)
            {
                return AuthResult.Failed(ex.Message, MapFirebaseError(ex));
            }
        }

        public async Task<AuthResult> CreateAccountWithEmailAsync(string email, string password, string displayName)
        {
            try
            {
                var result = await _auth.CreateUserWithEmailAndPasswordAsync(email, password);

                // Update display name
                var profile = new Firebase.Auth.UserProfile { DisplayName = displayName };
                await result.User.UpdateUserProfileAsync(profile);

                UpdateCurrentUser();
                return AuthResult.Succeeded(_currentUser);
            }
            catch (Exception ex)
            {
                return AuthResult.Failed(ex.Message, MapFirebaseError(ex));
            }
        }

        public async Task<AuthResult> SignInWithProviderAsync(string providerId)
        {
            // Firebase handles provider auth through Firebase.Auth.Credential
            // Implementation depends on specific provider (Google, Apple, etc.)
            return AuthResult.Failed($"Provider '{providerId}' not implemented in FirebaseAuthProvider. Use dedicated provider.",
                AuthErrorCode.ProviderNotAvailable);
        }

        public async Task SignOutAsync()
        {
            _auth.SignOut();
            _currentUser = null;
            await Task.CompletedTask;
        }

        public async Task<AuthResult> SendPasswordResetEmailAsync(string email)
        {
            try
            {
                await _auth.SendPasswordResetEmailAsync(email);
                return AuthResult.Succeeded(null);
            }
            catch (Exception ex)
            {
                return AuthResult.Failed(ex.Message, MapFirebaseError(ex));
            }
        }

        public async Task<AuthResult> UpdateProfileAsync(string displayName, string photoUrl)
        {
            try
            {
                var profile = new Firebase.Auth.UserProfile
                {
                    DisplayName = displayName,
                    PhotoUrl = string.IsNullOrEmpty(photoUrl) ? null : new Uri(photoUrl)
                };
                await _auth.CurrentUser.UpdateUserProfileAsync(profile);
                UpdateCurrentUser();
                return AuthResult.Succeeded(_currentUser);
            }
            catch (Exception ex)
            {
                return AuthResult.Failed(ex.Message, MapFirebaseError(ex));
            }
        }

        AuthErrorCode MapFirebaseError(Exception ex)
        {
            // Map Firebase exceptions to AuthErrorCode
            var message = ex.Message.ToLower();
            if (message.Contains("invalid-email")) return AuthErrorCode.InvalidEmail;
            if (message.Contains("wrong-password")) return AuthErrorCode.InvalidPassword;
            if (message.Contains("user-not-found")) return AuthErrorCode.UserNotFound;
            if (message.Contains("email-already-in-use")) return AuthErrorCode.EmailAlreadyInUse;
            if (message.Contains("weak-password")) return AuthErrorCode.WeakPassword;
            if (message.Contains("network")) return AuthErrorCode.NetworkError;
            if (message.Contains("too-many-requests")) return AuthErrorCode.TooManyRequests;
            return AuthErrorCode.Unknown;
        }
#else
        // Stub implementation when Firebase is not available
        public bool IsAvailable => false;
        public AuthUser CurrentUser => null;
        public event Action<AuthUser> OnAuthStateChanged;

        public Task<AuthResult> SignInWithEmailAsync(string email, string password)
        {
            Debug.LogWarning("[FirebaseAuthProvider] Firebase Auth SDK not installed. Add FIREBASE_AUTH_AVAILABLE define.");
            return Task.FromResult(AuthResult.Failed("Firebase Auth not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> CreateAccountWithEmailAsync(string email, string password, string displayName)
        {
            return Task.FromResult(AuthResult.Failed("Firebase Auth not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> SignInWithProviderAsync(string providerId)
        {
            return Task.FromResult(AuthResult.Failed("Firebase Auth not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task SignOutAsync() => Task.CompletedTask;

        public Task<AuthResult> SendPasswordResetEmailAsync(string email)
        {
            return Task.FromResult(AuthResult.Failed("Firebase Auth not available", AuthErrorCode.ProviderNotAvailable));
        }

        public Task<AuthResult> UpdateProfileAsync(string displayName, string photoUrl)
        {
            return Task.FromResult(AuthResult.Failed("Firebase Auth not available", AuthErrorCode.ProviderNotAvailable));
        }
#endif
    }
}

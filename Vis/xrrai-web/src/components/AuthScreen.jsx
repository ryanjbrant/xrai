import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';

// Initialize Firebase (uses config from parent)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo",
};

let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase not configured, using mock auth');
}

function AuthScreen({ onAuthSuccess, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!auth) {
        // Mock auth for demo
        onAuthSuccess({
          uid: 'mock_' + Date.now(),
          email: email,
          displayName: displayName || email.split('@')[0]
        });
        return;
      }

      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess(userCredential.user);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      if (!auth) {
        onAuthSuccess({
          uid: 'google_mock_' + Date.now(),
          email: 'user@gmail.com',
          displayName: 'Google User'
        });
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(result.user);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-header">
          <div className="logo">✦</div>
          <h1>XRRAI Hologram</h1>
          <p>Volumetric Video Conferencing</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            className={`tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>or continue with</span>
        </div>

        {/* Social */}
        <div className="social-buttons">
          <button onClick={handleGoogleAuth} className="btn-google" disabled={loading}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>

        {/* Terms */}
        <p className="terms">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default AuthScreen;

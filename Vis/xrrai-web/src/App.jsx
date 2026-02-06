import React, { useState, useCallback, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import AuthScreen from './components/AuthScreen';
import LoadingScreen from './components/LoadingScreen';

// Firebase config - replace with your own
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);

  // Unity WebGL context
  const { unityProvider, isLoaded, loadingProgression, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "/unity/Build/xrrai.loader.js",
    dataUrl: "/unity/Build/xrrai.data",
    frameworkUrl: "/unity/Build/xrrai.framework.js",
    codeUrl: "/unity/Build/xrrai.wasm",
  });

  // Handle Unity→React messages
  const handleUnityMessage = useCallback((message) => {
    console.log('[Unity→React]', message);
    try {
      const data = JSON.parse(message);
      if (data.type === 'AUTH_REQUIRED') {
        setShowAuth(true);
      } else if (data.type === 'SIGN_OUT') {
        setUser(null);
        setShowAuth(true);
      }
    } catch (e) {
      console.warn('Non-JSON message from Unity:', message);
    }
  }, []);

  useEffect(() => {
    addEventListener("SendToReact", handleUnityMessage);
    return () => removeEventListener("SendToReact", handleUnityMessage);
  }, [addEventListener, removeEventListener, handleUnityMessage]);

  // Send auth state to Unity
  const handleAuthSuccess = useCallback((authUser) => {
    setUser(authUser);
    setShowAuth(false);

    if (isLoaded) {
      sendMessage("WebBridge", "OnAuthStateChanged", JSON.stringify({
        userId: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName || authUser.email?.split('@')[0],
        photoUrl: authUser.photoURL
      }));
    }
  }, [isLoaded, sendMessage]);

  // Send room code to Unity
  const joinRoom = useCallback((roomCode) => {
    if (isLoaded) {
      sendMessage("WebBridge", "JoinRoom", roomCode);
    }
  }, [isLoaded, sendMessage]);

  return (
    <div className="app">
      {/* Loading Screen */}
      {!isLoaded && <LoadingScreen progress={loadingProgression * 100} />}

      {/* Auth Screen */}
      {showAuth && isLoaded && (
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onClose={() => user && setShowAuth(false)}
        />
      )}

      {/* Unity WebGL Canvas */}
      <Unity
        unityProvider={unityProvider}
        className="unity-canvas"
        style={{
          width: '100%',
          height: '100%',
          visibility: isLoaded ? 'visible' : 'hidden'
        }}
      />

      {/* Floating controls for web */}
      {isLoaded && user && !showAuth && (
        <div className="web-controls">
          <button onClick={() => setShowAuth(true)} className="btn-settings">
            ⚙️
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

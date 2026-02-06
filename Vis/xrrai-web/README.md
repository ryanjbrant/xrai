# XRRAI Web - Unity WebGL Wrapper

React application that wraps Unity WebGL builds for web deployment of XRRAI Hologram conferencing.

## Features

- **Unity WebGL Integration** - Embeds Unity WebGL builds using react-unity-webgl
- **Firebase Authentication** - Web auth flow with email/password and Google Sign-In
- **Bidirectional Communication** - React↔Unity messaging via WebBridge
- **Glassmorphism UI** - Modern semi-transparent glass effect styling
- **Responsive Design** - Works on desktop and mobile browsers

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Unity WebGL Build

1. Build Unity project with WebGL target
2. Copy build output to `public/unity/Build/`:
   - `xrrai.loader.js`
   - `xrrai.data`
   - `xrrai.framework.js`
   - `xrrai.wasm`

## Configuration

### Firebase

Create `.env` file with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Unity Build Names

If your Unity build uses different file names, update `src/App.jsx`:

```jsx
const { unityProvider, ... } = useUnityContext({
  loaderUrl: "/unity/Build/your_name.loader.js",
  dataUrl: "/unity/Build/your_name.data",
  frameworkUrl: "/unity/Build/your_name.framework.js",
  codeUrl: "/unity/Build/your_name.wasm",
});
```

## Architecture

```
React App (Auth UI, Loading)
    ↓↑ sendMessage / addEventListener
Unity WebGL (XRRAI Hologram)
    ↓↑ WebBridge.cs ↔ WebBridge.jslib
JavaScript Bridge
```

### React → Unity Messages

```javascript
sendMessage("WebBridge", "OnAuthStateChanged", JSON.stringify({
  userId: "...",
  email: "...",
  displayName: "..."
}));

sendMessage("WebBridge", "JoinRoom", "ROOM_CODE");
```

### Unity → React Events

```javascript
addEventListener("SendToReact", (message) => {
  const data = JSON.parse(message);
  // data.type: "AUTH_REQUIRED" | "SIGN_OUT" | "ROOM_STATE" | "ERROR"
});
```

## Project Structure

```
xrrai-web/
├── public/
│   └── unity/Build/     # Unity WebGL build files
├── src/
│   ├── components/
│   │   ├── AuthScreen.jsx    # Firebase authentication
│   │   └── LoadingScreen.jsx # Unity loading progress
│   ├── App.jsx          # Main app with Unity context
│   ├── main.jsx         # React entry point
│   └── styles.css       # Glassmorphism theme
├── index.html
├── package.json
└── vite.config.js
```

## Development

### Mock Mode

When Firebase is not configured, the app uses mock authentication for development.

### Hot Reload

Vite provides instant hot reload for React components. Unity WebGL changes require a rebuild.

## Deployment

### Vercel

```bash
npm run build
vercel deploy
```

### Static Hosting

Upload the `dist/` folder to any static hosting provider.

**Note:** Unity WebGL requires proper MIME types for `.wasm` files and may require CORS headers.

## Related Files

- `MetavidoVFX-main/Assets/Scripts/Bridges/WebBridge.cs` - Unity-side bridge
- `MetavidoVFX-main/Assets/Plugins/WebGL/WebBridge.jslib` - JavaScript interop

## License

MIT

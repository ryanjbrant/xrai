// WebBridge.jslib - Unity WebGL to JavaScript bridge
// Part of Spec 013 Phase 5: Web Deployment

mergeInto(LibraryManager.library, {

    /**
     * Send a message from Unity to the React wrapper.
     * The React app listens via addEventListener on the Unity instance.
     * @param {string} messagePtr - Pointer to the JSON message string
     */
    SendToReactJS: function(messagePtr) {
        var message = UTF8ToString(messagePtr);

        // Try react-unity-webgl event system first
        if (typeof window.dispatchReactUnityEvent === 'function') {
            window.dispatchReactUnityEvent('SendToReact', message);
        }
        // Fallback to custom event
        else if (typeof window.onUnityMessage === 'function') {
            window.onUnityMessage(message);
        }
        // Fallback to CustomEvent
        else {
            window.dispatchEvent(new CustomEvent('unityMessage', {
                detail: { message: message }
            }));
        }

        // Debug logging
        if (typeof console !== 'undefined' && console.log) {
            console.log('[Unity->React]', message);
        }
    }

});

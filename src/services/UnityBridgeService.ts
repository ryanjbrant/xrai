/**
 * UnityBridgeService - Type-safe wrapper for Unity ↔ React communication
 * 
 * Uses the existing @artmajeur/react-native-unity postMessage infrastructure.
 * 
 * @example
 * // In a component with UnityArView ref:
 * const unityRef = useRef<UnityArViewRef>(null);
 * const bridge = useMemo(() => new UnityBridgeService(unityRef), []);
 * 
 * // Send to Unity
 * bridge.sendToUnity('spawn_object', { type: 'cube', position: [0, 1, 0] });
 * 
 * // Listen for Unity messages (typically via UnityArView's onUnityMessage prop)
 */

import { RefObject } from 'react';
import { UnityArViewRef } from '../components/UnityArView';

// ============ Message Types ============

/** Messages sent from React to Unity */
export type ReactToUnityMessage =
    | { type: 'ping' }
    | { type: 'spawn_object'; payload: SpawnObjectPayload }
    | { type: 'update_object'; payload: UpdateObjectPayload }
    | { type: 'delete_object'; payload: { id: string } }
    | { type: 'camera_update'; payload: CameraUpdatePayload }
    | { type: 'custom'; payload: Record<string, unknown> };

/** Messages received from Unity */
export type UnityToReactMessage =
    | { type: 'unity_ready'; source: 'unity'; note: string }
    | { type: 'pong'; source: 'unity'; note: string }
    | { type: 'ack'; source: 'unity'; note: string }
    | { type: 'error'; source: 'unity'; note: string }
    | { type: 'stats'; source: 'unity'; note: string }
    | { type: 'ar_state'; source: 'unity'; state: string }
    | { type: 'ar_plane'; source: 'unity'; action: string; id: string; size: [number, number] }
    | { type: 'ar_stats'; source: 'unity'; fps: number; planes: number; state: string }
    | { type: 'ar_event'; source: 'unity'; event: string; details: string }
    | { type: 'object_spawned'; source: 'unity'; id: string }
    | { type: 'custom'; source: 'unity';[key: string]: unknown };

// ============ Payload Types ============

export interface SpawnObjectPayload {
    objectType: 'cube' | 'sphere' | 'plane' | 'cylinder' | 'brush' | 'model';
    id?: string;
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    modelUri?: string;
}

export interface UpdateObjectPayload {
    id: string;
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    visible?: boolean;
}

export interface CameraUpdatePayload {
    position: [number, number, number];
    rotation: [number, number, number, number];
    fov?: number;
}

// ============ Service Class ============

type MessageCallback<T = UnityToReactMessage> = (message: T) => void;

export class UnityBridgeService {
    private unityRef: RefObject<UnityArViewRef | null>;
    private subscribers: Map<string, Set<MessageCallback>> = new Map();
    private globalSubscribers: Set<MessageCallback> = new Set();

    /** The default GameObject name that receives messages in Unity */
    private readonly DEFAULT_TARGET = 'BridgeTarget';
    /** The default method name called on the target GameObject */
    private readonly DEFAULT_METHOD = 'OnMessage';

    constructor(unityRef: RefObject<UnityArViewRef | null>) {
        this.unityRef = unityRef;
    }

    /**
     * Send a typed message to Unity
     */
    sendToUnity<T extends ReactToUnityMessage>(
        message: T,
        options?: { target?: string; method?: string }
    ): boolean {
        const ref = this.unityRef.current;
        if (!ref) {
            console.warn('[UnityBridgeService] Cannot send - UnityArView ref is null');
            return false;
        }

        const target = options?.target ?? this.DEFAULT_TARGET;
        const method = options?.method ?? this.DEFAULT_METHOD;
        const json = JSON.stringify(message);

        try {
            ref.sendMessage(target, method, json);
            return true;
        } catch (e) {
            console.error('[UnityBridgeService] Send failed:', e);
            return false;
        }
    }

    /**
     * Convenience method: Send a ping to Unity
     */
    ping(): boolean {
        return this.sendToUnity({ type: 'ping' });
    }

    /**
     * Convenience method: Spawn an object in Unity
     */
    spawnObject(payload: SpawnObjectPayload): boolean {
        return this.sendToUnity({ type: 'spawn_object', payload });
    }

    /**
     * Convenience method: Send a custom action to Unity
     * Maps to the existing BridgeTarget message format
     */
    sendAction(action: string, data?: Record<string, unknown>): boolean {
        const message = { action, ...data };
        const ref = this.unityRef.current;
        if (!ref) return false;

        try {
            ref.sendMessage(this.DEFAULT_TARGET, this.DEFAULT_METHOD, JSON.stringify(message));
            return true;
        } catch (e) {
            console.error('[UnityBridgeService] sendAction failed:', e);
            return false;
        }
    }

    /**
     * Process an incoming message from Unity.
     * Call this from UnityArView's onUnityMessage callback.
     */
    handleUnityMessage(data: UnityToReactMessage): void {
        // Notify type-specific subscribers
        const typeSubscribers = this.subscribers.get(data.type);
        if (typeSubscribers) {
            typeSubscribers.forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error('[UnityBridgeService] Subscriber error:', e);
                }
            });
        }

        // Notify global subscribers
        this.globalSubscribers.forEach(cb => {
            try {
                cb(data);
            } catch (e) {
                console.error('[UnityBridgeService] Global subscriber error:', e);
            }
        });
    }

    /**
     * Subscribe to messages of a specific type from Unity
     * @returns Unsubscribe function
     */
    subscribe<T extends UnityToReactMessage['type']>(
        type: T,
        callback: MessageCallback<Extract<UnityToReactMessage, { type: T }>>
    ): () => void {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type)!.add(callback as MessageCallback);

        return () => {
            this.subscribers.get(type)?.delete(callback as MessageCallback);
        };
    }

    /**
     * Subscribe to all messages from Unity
     * @returns Unsubscribe function
     */
    subscribeAll(callback: MessageCallback): () => void {
        this.globalSubscribers.add(callback);
        return () => {
            this.globalSubscribers.delete(callback);
        };
    }

    /**
     * Get bridge statistics from the UnityArView
     */
    getStats(): { sent: number; received: number } | null {
        return this.unityRef.current?.getStats() ?? null;
    }
}

export default UnityBridgeService;

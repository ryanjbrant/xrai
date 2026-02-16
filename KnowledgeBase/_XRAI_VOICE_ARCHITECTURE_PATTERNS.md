# XRAI Voice & Intelligence Architecture Patterns

**Created**: 2026-02-13
**Tags**: `#xrai` `#voice` `#gemini-live` `#memory` `#multiplayer` `#spatial-intelligence` `#architecture`
**Source**: Deep research synthesis — 4 parallel research agents, 100+ sources
**Applies To**: Portals V4, XRAI Jarvis, any voice-first AR/XR application

---

## Key Insight

> **Voice-first AR = streaming pipeline, not request-response.**
> Gemini Live is 10-30x cheaper than OpenAI Realtime. Dual-mode (cascaded for commands, Live for conversations) is the correct architecture. Memory must be local-first with cloud sync. LiveKit bridges both RN and Unity for multiplayer.

---

## Table of Contents

1. [Voice Pipeline Architecture](#1-voice-pipeline-architecture)
2. [STT Provider Comparison](#2-stt-provider-comparison)
3. [Multimodal Voice LLM Comparison](#3-multimodal-voice-llm-comparison)
4. [TTS Provider Comparison](#4-tts-provider-comparison)
5. [Zero-Latency Patterns](#5-zero-latency-patterns)
6. [Wake Word Detection](#6-wake-word-detection)
7. [Model Routing & Cost Optimization](#7-model-routing--cost-optimization)
8. [Memory Architecture](#8-memory-architecture)
9. [Spatial Intelligence Pipeline](#9-spatial-intelligence-pipeline)
10. [Multiplayer & Telepresence](#10-multiplayer--telepresence)
11. [Portals V4 Recommendations](#11-portals-v4-recommendations)
12. [Cost Estimates](#12-cost-estimates)

---

## 1. Voice Pipeline Architecture

### The Two Competing Architectures

| | Cascaded (STT -> LLM -> TTS) | Native Audio-In/Out (S2S) |
|---|---|---|
| **Latency** | 500ms-2s (sum of components) | 250-300ms (single model) |
| **Cost** | Lower (text tokens only for LLM) | Higher (audio tokens 6-21x text) |
| **Quality** | Mix-and-match best components | Single vendor quality |
| **Flexibility** | Swap any component independently | Locked to one model |
| **Reasoning** | Can use any LLM (Claude, GPT-4o, etc.) | Limited to audio-native models |

### Recommended: Dual-Mode Architecture

```
Command Mode (cascaded):
  Mic → STT (Deepgram/whisper.rn) → Intent Parser → LLM (Flash-Lite/Flash) → TTS → Speaker

Conversation Mode (native audio):
  Mic → Gemini Live API (bidirectional WebSocket) → Speaker
  (includes function calling, Google Search grounding, camera frames)
```

**Portals already implements this** via `processText()` (cascaded) and `startConversation()` (Gemini Live) in `VoiceIntelligence.ts`.

### Fully Streaming Pipeline (Target)

```
Mic Audio Chunks
    --> Streaming STT (partial transcripts)
        --> LLM (token-by-token generation)
            --> Streaming TTS (sentence/phrase chunks)
                --> Audio Playback (gapless buffer queue)
```

---

## 2. STT Provider Comparison

| Provider | Latency | WER | Streaming | Price/1000 min | RN SDK | Best For |
|---|---|---|---|---|---|---|
| **Deepgram Nova-3** | <300ms | 12.8% | WebSocket | $4.30 | `react-native-deepgram` | Best latency + price |
| **Deepgram Flux** | ~260ms (w/ EOT) | ~13% | WebSocket | TBD | Same | Built-in end-of-turn |
| **AssemblyAI Universal-2** | 300-600ms | 14.5% | WebSocket | $150 | No native SDK | Best streaming accuracy |
| **Google Cloud STT v2** | 400-800ms | 9.8% | gRPC | $16.00 | No native SDK | Best multilingual (100+ langs) |
| **whisper.rn (on-device)** | 500ms-2s | Model-dependent | Yes | Free | `whisper.rn` | Fully offline, privacy-first |
| **Picovoice Cheetah** | <100ms | ~15% | On-device | Commercial | Native SDK | Ultra-low latency, edge-only |

**Winner for Portals**: Deepgram Nova-3 (streaming, cheapest, sub-300ms). Flux adds model-integrated end-of-turn detection, eliminating separate VAD.

---

## 3. Multimodal Voice LLM Comparison

| Feature | Gemini 2.5 Flash Live | OpenAI Realtime (gpt-realtime) |
|---|---|---|
| **Protocol** | WebSocket (bidirectional) | WebSocket, WebRTC, SIP |
| **Input Audio** | PCM 16-bit, 16kHz, mono | PCM 16-bit, 24kHz, mono |
| **Output Audio** | PCM 16-bit, 24kHz, mono | PCM 16-bit, 24kHz, mono |
| **Video Input** | Yes (JPEG at 1 FPS) | Image input (not streaming) |
| **Function Calling** | Yes (blocking + non-blocking) | Yes (strict JSON schema) |
| **Google Search** | Built-in grounding | No |
| **Session Limit** | 10-15 min (2 min with video) | 60 min |
| **First Token** | ~0.25-0.36s | ~0.6s |
| **Audio In Price** | ~$0.003/min | ~$0.06/min |
| **Audio Out Price** | ~$0.013/min | ~$0.24/min |

### Cost per 5-Minute Conversation

| | Gemini Live | OpenAI Realtime |
|---|---|---|
| **Total** | **~$0.02** | **~$0.21** |
| **At 1000 calls/day** | **~$20/day** | **~$210/day** |

**Gemini is 10x cheaper.** Use OpenAI Realtime only for sessions >15 min or when higher reasoning intelligence is needed.

### CRITICAL: Model Migration

`gemini-2.0-flash-live-001` **retires March 31, 2026**. Migrate to `gemini-2.5-flash-live-001`. Update `DEFAULT_MODEL` in `geminiLiveSession.ts:62`.

---

## 4. TTS Provider Comparison

| Provider | Best TTFB | Streaming | Price/1K chars | Best For |
|---|---|---|---|---|
| **Cartesia Sonic Turbo** | ~40ms | Yes | $0.060 | Lowest latency |
| **ElevenLabs Flash v2.5** | ~75ms | Yes | $0.30 | Best quality + low latency |
| **Deepgram Aura-2** | ~90ms | Yes | $0.030 | Cheapest with good quality |
| **Gemini Native Audio** | Inline | Yes | Part of Live API | Simplest (no separate TTS) |

**For Portals**: Gemini Live already returns audio inline -- no separate TTS needed for conversation mode. Add Cartesia or ElevenLabs for cascaded mode if native voices are insufficient.

---

## 5. Zero-Latency Patterns

### 5.1 Streaming Audio Playback (HIGH PRIORITY)

Current `audioPlayback.ts` uses **buffered strategy** (accumulate all chunks, play as single WAV). This adds 1-3 seconds latency.

**Fix**: Switch to `AudioBufferQueueSourceNode` from `react-native-audio-api` for chunk-by-chunk playback. User hears first words within 400ms vs 3+ seconds.

### 5.2 Voice Activity Detection (VAD)

| VAD | Latency | Accuracy | Platform | License |
|---|---|---|---|---|
| **Silero VAD** | <1ms/chunk | Best overall | ONNX | MIT |
| **Picovoice Cobra** | <1ms/chunk | Good | Native | Commercial |
| **Deepgram Flux (built-in)** | ~260ms EOT | Good | Server | API cost |

Current `audioStreamCapture.ts` uses simple energy-based VAD (`SPEECH_ENERGY_THRESHOLD = 500`). **Upgrade to Silero VAD** for significantly better accuracy, especially in noisy environments.

### 5.3 Speculative Prefetch

Start LLM inference on partial STT transcripts at 80%+ confidence. If final transcript matches, use cached response. Saves 200-400ms when correct (~80-90% of the time).

### 5.4 Interruption Handling (Barge-In)

Target: **<200-300ms** from user speech to AI audio stop. Gemini Live handles this natively via `onInterrupted` callback (already implemented in `geminiLiveSession.ts`).

---

## 6. Wake Word Detection

### Picovoice Porcupine (Only Viable RN Option)

```typescript
import { PorcupineManager } from '@picovoice/porcupine-react-native';

const manager = await PorcupineManager.fromKeywordPaths(
  accessKey,
  ['/path/to/hey_xrai.ppn'],  // Custom wake word
  (keywordIndex) => startGeminiLiveSession(),
  (error) => console.error(error),
  { sensitivities: [0.7] }
);
await manager.start();
```

- **Built-in "Jarvis" keyword**: Free, works immediately, no custom model needed
- **Custom wake words**: Create via Picovoice Console (just type the phrase)
- **Detection latency**: <180ms
- **Battery**: ~1% per 12 hours (optimized)
- **iOS background**: **BLOCKED by iOS 18** for third-party apps (Apple reserves for Siri)

### Pricing

| Plan | Price | Requirement |
|---|---|---|
| Free | $0 | Non-commercial only |
| Foundation | ~$899+/mo | Startups (<$50M raised) |
| Enterprise | Custom | Everything else |

**MVP Strategy**: Use built-in "Jarvis" keyword (free for development), upgrade to custom "Hey XRAI" on paid plan for production.

---

## 7. Model Routing & Cost Optimization

### Cascade Architecture

```
User Query → Classifier (<100ms)
  ├─ Simple ("add red cube")     → Flash-Lite ($0.10/$0.40 per 1M tokens)
  ├─ Medium ("arrange in circle") → Flash ($0.50/$3.00 per 1M tokens)
  └─ Complex ("analyze this room") → Pro ($1.25/$10.00 per 1M tokens)
```

### Rule-Based Classifier (Start Here)

```typescript
function classifyComplexity(text: string): 'simple' | 'medium' | 'complex' {
  const words = text.split(' ').length;
  const hasAnalysis = /analyze|explain|compare|suggest|design|plan/i.test(text);
  const hasMultiStep = /and then|after that|first.*then/i.test(text);

  if (hasAnalysis || (hasMultiStep && words > 20)) return 'complex';
  if (words > 10 || hasMultiStep) return 'medium';
  return 'simple';
}
```

**Savings**: 60-70% on API costs. Research shows ~70% of queries are simple enough for cheapest model.

### Thinking Mode Control (Gemini 2.5)

| Complexity | `thinkingBudget` | Effect |
|---|---|---|
| Simple scene commands | `0` (disabled) | Fastest response |
| Conversational | `-1` (dynamic) | Model decides |
| Complex reasoning | `8192+` | Deep thinking |

---

## 8. Memory Architecture

### 4-Tier Hierarchy (2026 Production Standard)

| Tier | Analogy | Scope | Persistence | Latency | Implementation |
|---|---|---|---|---|---|
| **Working** | CPU Registers | Current context window | Per-request | 0ms | LLM context window |
| **Short-Term** | RAM | Current session | Per-session | <50ms | Message buffers, checkpointers |
| **Medium-Term** | SSD Cache | Recent sessions | Days-weeks | <200ms | Compressed observations, entity cache |
| **Long-Term** | Disk | User profile, patterns | Permanent | <500ms | Vector DB, knowledge graph |

### Portals Current State (L0-L1)

- `commandLog.ts`: FIFO 1000 entries, AsyncStorage, analytics
- `responseCache.ts`: LRU 200 entries, 24h TTL
- `suggestionEngine.ts`: Frequency + context-aware suggestions

### Recommended Stack for Portals

```
┌─────────────────────────────────────────┐
│           React Native App              │
│                                         │
│  L0: MMKV (sync, <0.1ms)               │
│    - current session state              │
│    - user preferences cache             │
│    - last 5 commands                    │
│                                         │
│  L1: SQLite (async, <5ms)              │
│    - command log (1000 entries)          │
│    - response cache (200 entries)        │
│    - user preference model              │
│                                         │
├─────────────────────────────────────────┤
│  L2: Edge/Cloud (async, <200ms)         │
│    - Supabase + pgvector                │
│    - OR Mem0 Cloud                      │
│    - Cross-device sync                  │
│                                         │
│  L3: Provider Cache (transparent)       │
│    - Gemini context caching (90% off)   │
│    - Claude prompt caching (90% off)    │
└─────────────────────────────────────────┘
```

### Memory Service Comparison

| Tool | Type | Best For | Latency | Open Source | Mobile |
|---|---|---|---|---|---|
| **Mem0** | Memory layer | User personalization | <50ms | Apache 2.0 | Via API |
| **Letta** | Agent platform | Self-editing agents | Variable | Yes | Via API |
| **Zep/Graphiti** | Knowledge graph | Temporal reasoning | <100ms | OSS core | Via API |
| **MMKV** | KV store | On-device hot cache | <0.1ms | Yes | **Native RN** |
| **expo-sqlite** | Relational | Structured on-device | <5ms | Yes | **Native RN** |
| **pgvector** | Vector DB | Unified Postgres | <50ms | Yes | Via Supabase |

### Context Caching (Free Money)

| Provider | Savings | Min Cache | Config |
|---|---|---|---|
| **Gemini** | 90% on cached tokens | 2,048 tokens | Implicit (auto) or explicit (`CachedContent` API) |
| **Claude** | 90% on cached reads | 1,024-2,048 tokens | `cache_control: { type: "ephemeral" }` |

Cache the system prompt + bridge protocol spec + user profile. Pay 10% on subsequent calls.

### Correction Learning Pattern

```typescript
async function handleUserCorrection(original: SceneAction, correction: string, userId: string) {
  const delta = await extractCorrectionDelta(original, correction);
  await memory.add({
    content: `User corrected: ${delta.description}`,
    metadata: { type: "preference", confidence: 0.8 },
    user_id: userId,
  });
  // Update system prompt context for future calls
  const prefs = await memory.search("user preferences", { user_id: userId });
  updateSystemPromptWithPreferences(prefs);
}
```

---

## 9. Spatial Intelligence Pipeline

### Architecture

```
AR Camera Frame (60 FPS)
     │
     ├── Fast Path (Local, 60 FPS)
     │   AR Foundation: planes, meshes, depth, hands, anchors
     │
     └── Slow Path (Cloud, 1 FPS)
         Gemini 2.5 Flash Vision: object ID, spatial reasoning, scene description
              │
              └── Fusion Layer
                  AR anchors + LLM semantics → Spatial Knowledge Graph
                       │
                       └── Action Layer
                           Place objects, label items, navigate
```

### Camera Frame Streaming via Gemini Live

```json
{
  "realtimeInput": {
    "mediaChunks": [
      { "mimeType": "audio/pcm;rate=16000", "data": "<base64-pcm>" },
      { "mimeType": "image/jpeg", "data": "<base64-jpeg>" }
    ]
  }
}
```

- Model processes video at **1 FPS** (higher rates discarded)
- Video+audio sessions limited to **2 minutes**
- Use periodic snapshots via standard Vision API for longer sessions

### Gemini Vision Capabilities

- Zero-shot object detection with pixel-precise bounding boxes
- Segmentation masks (Gemini 2.5)
- Spatial relationship understanding ("cup is left of book")
- Up to 3,600 images per request
- No training data needed -- text prompt only

---

## 10. Multiplayer & Telepresence

### Recommended Stack

| Need | Recommended | Alternative |
|---|---|---|
| **Video/Audio** | LiveKit (RN + Unity SDKs) | Daily.co (RN only) |
| **Hologram streaming** | Metavido over LiveKit WebRTC | Depthkit + VDO.Ninja |
| **Object state sync** | Unity NGO (already installed) | Normcore ($49/mo) |
| **Voice chat** | LiveKit audio tracks | Normcore voice |
| **Scene collaboration** | Yjs CRDT over WebSocket | Automerge |
| **File sharing** | Firebase Storage + short URLs | Google Drive API |

### LiveKit (RECOMMENDED)

- **Both RN AND Unity SDKs** (only platform with both)
- 10,000 participant-min/mo free, Apache 2.0 self-hostable
- Data channels for state sync (replaces separate backend)
- Simulcast, adaptive quality, AI agent framework

### Holographic Telepresence via Metavido + WebRTC

```
Sender (iPhone LiDAR):
  ARDepthSource → Metavido encoder → single video frame
  → WebRTC video track via LiveKit (~2-4 Mbps at 720p, 30fps)

Receiver:
  → LiveKit SDK receives video texture
  → Metavido decoder → depth + color + stencil
  → VFXARBinder → VFX Graph → Hologram rendered
```

### Scaling Path

```
Phase 1 (MVP): P2P mesh via react-native-webrtc ($0)
Phase 2 (Growth): LiveKit Cloud free tier (10K min/mo)
Phase 3 (Scale): LiveKit self-hosted (~$20-50/mo VPS)
Phase 4 (Enterprise): LiveKit Cloud paid or Normcore Pro
```

### State Sync: CRDTs

**Yjs** is the winner for real-time collaboration:
- React Native compatible (WebSocket/WebRTC providers)
- Offline support (critical for mobile)
- Shared cursors, undo/redo, version snapshots
- Best performance (900k+ weekly npm downloads)

---

## 11. Portals V4 Recommendations

### Tier 1 -- Immediate (Days)

| # | Action | Impact | File(s) |
|---|---|---|---|
| 1 | **Migrate Gemini model** | Avoid March 31 failure | `geminiLiveSession.ts:62`, `geminiSTT.ts:18` |
| 2 | **Upgrade audio playback** from buffered to streaming | Save 1-3s latency | `audioPlayback.ts` |
| 3 | **Add Google Search grounding** | One-line addition | `geminiLiveSession.ts` setup tools |
| 4 | **Upgrade VAD** from energy-based to Silero | Better accuracy | `audioStreamCapture.ts` |

### Tier 2 -- Short-Term (Weeks)

| # | Action | Impact | File(s) |
|---|---|---|---|
| 5 | **Replace AsyncStorage with MMKV** | 30x faster hot path | `commandLog.ts`, `responseCache.ts` |
| 6 | **Enable Gemini context caching** | 90% cost reduction on system prompt | `aiSceneComposer.ts` |
| 7 | **Add Porcupine wake word** | "Jarvis" keyword, free for dev | New: `wakeWordService.ts` |
| 8 | **Implement model routing** | 60-70% cost savings | `VoiceIntelligence.ts` |
| 9 | **Add camera frame streaming** | Spatial intelligence during voice | `geminiLiveSession.ts` |

### Tier 3 -- Medium-Term (Months)

| # | Action | Impact |
|---|---|---|
| 10 | **User preference extraction** from command patterns | Compounding intelligence |
| 11 | **Correction learning** (user fixes → preference memory) | Personalization |
| 12 | **Mem0 or Supabase+pgvector** for cross-device memory | Long-term memory |
| 13 | **LiveKit integration** for multiplayer | Holographic telepresence |
| 14 | **Thinking mode control** per query complexity | Optimize speed vs depth |

### Tier 4 -- Strategic (Future)

| # | Action | Impact |
|---|---|---|
| 15 | OpenAI Realtime as fallback for >15 min sessions | Resilience |
| 16 | whisper.rn for offline voice commands | Privacy, offline |
| 17 | Observational Memory (Mastra) for long sessions | Context compression |
| 18 | Yjs CRDT for scene collaboration | Real-time co-editing |
| 19 | Self-hosted LiveKit on edge | Zero-cost scaling |

---

## 12. Cost Estimates

### Per-Conversation Cost

| Mode | Provider | Cost |
|---|---|---|
| Voice command (cascaded) | Deepgram STT + Flash-Lite | ~$0.005 |
| Voice conversation (5 min) | Gemini Live | ~$0.02 |
| Voice conversation (5 min) | OpenAI Realtime | ~$0.21 |
| Camera + voice (2 min) | Gemini Live | ~$0.015 |

### Monthly Cost at Scale (1000 Active Users)

| Component | Monthly Cost |
|---|---|
| Gemini Live (voice) | ~$200 |
| Gemini Vision (periodic snapshots) | ~$50 |
| Porcupine (wake word, commercial) | ~$899 |
| Firebase/infra | ~$100 |
| **Total** | **~$1,250/mo** |

Compare with OpenAI Realtime for voice alone: ~$6,000/mo.

---

## React Native Implementation Notes

### Audio Capture Libraries

| Library | Streaming | Expo | Notes |
|---|---|---|---|
| **react-native-live-audio-stream** | Yes | Bare | **Currently used in Portals** |
| **@siteed/expo-audio-studio** | Yes | Both | Most actively developed for Expo |
| **react-native-audio-api** | Yes | Bare | `AudioBufferQueueSourceNode` for streaming playback |

### Key Challenge: Duplex Audio on iOS

Simultaneous record + playback requires careful `AVAudioSession` configuration. `@siteed/expo-audio-studio` handles this with iOS voice processing mode. The `pathakmukul/Gemini-LIVE-API-Bidirectional-Audio-in-React-Native` repo implements echo cancellation.

### Bridge Traffic Optimization

Instead of sending every tiny PCM chunk over the React Native bridge, accumulate in JavaScript into ~0.5-1s buffers. Reduces bridge traffic by 20x.

---

## Gaps & Limitations

| Gap | Impact | Workaround |
|---|---|---|
| Gemini Live video+audio limited to 2 min | Can't do extended AR spatial intelligence | Periodic snapshots via Vision API |
| iOS background wake word blocked | No "always listening" | Foreground-only + Siri Shortcut integration |
| LiveKit Unity SDK untested with UAAL | Multiplayer risk | Prototype early |
| No on-device vector search for RN | Can't do local semantic memory | pgvector via Supabase REST |
| Porcupine commercial starts at $899/mo | MVP cost | Use free "Jarvis" keyword for dev |
| Android duplex audio unreliable | Platform issues | iOS-first approach |

---

## See Also -- XRAI Architecture Network

| Doc | What it covers |
|-----|---------------|
| `_VOICE_COMPOSER_PATTERNS.md` | Voice → Unity bridge patterns |
| `_XRAI_MASTER.md` | XRAI format spec |
| `_KEIJIRO_METAVIDO_VFX_RESEARCH.md` | Metavido hologram VFX pipeline |
| `_NORMCORE_MULTIPLAYER_PATTERNS.md` | Normcore integration patterns |
| `_DEV_ITERATION_WORKFLOWS.md` | Fastest feedback loops + Auto Workflow Matrix |
| `_TEST_DEBUG_AUTOMATION_PATTERNS.md` | Pre-agent vs agent-era test/debug patterns |
| `_UNITY_TEST_FRAMEWORK_PATTERNS.md` | UTF patterns, CI/CD, Portals test strategy |
| `~/GLOBAL_RULES.md` | Universal rules, test ladder, test/debug philosophy |

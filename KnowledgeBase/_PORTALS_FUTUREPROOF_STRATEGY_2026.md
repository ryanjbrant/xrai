# Portals Futureproof Strategy (Feb 2026)

**Created:** 2026-02-05
**Purpose:** Zero-dependency, futureproof architecture decisions

---

## Infrastructure Megatrends (Beyond XR/AI)

### Adopt NOW (1-Year Critical)
| Technology | Adoption | Why It Matters |
|------------|----------|----------------|
| **HTTP/3/QUIC** | 31-40% traffic | 52% faster on unstable mobile |
| **WebGPU** | 70% browsers | 15× performance vs WebGL |
| **Passkeys** | 69% consumers have one | 4× faster auth, 85% lower support costs |
| **Edge compute** | $28B → $249B by 2030 | Real-time AR requires it |

### Plan Migration (3-Year Essential)
| Technology | Timeline | Action |
|------------|----------|--------|
| **IPv6** | US Gov 80% by 2026 | Dual-stack all infra |
| **WebAssembly** | WASI 1.0 late 2026 | Cross-platform AR logic |
| **Post-Quantum Crypto** | NSA requires by 2030 | Start hybrid migration |
| **Decentralized ID** | EU EUDI Wallet live | DID support for users |

### Strategic Positioning (5-Year)
| Technology | Timing | Implication |
|------------|--------|-------------|
| **6G** | Commercial 2030 | 10× lower latency, holographic AR |
| **Spatial Web** | Standards converging | glTF + WebXR = safe bets |
| **Ambient Computing** | 29B devices by 2030 | Always-on AR sensing |

### The Inevitability Test
Technologies become infrastructure when:
- ✅ All major vendors shipped (HTTP/3, WebGPU, Passkeys)
- ✅ Economic necessity (Edge - cloud costs too high)
- ✅ Government mandates (IPv6, PQC)
- ⚠️ Standards fragmentation (Spatial web - monitor IEEE P2874)

---

## Dependency Audit Results

### Safe (No Action)
- Unity URP 17.3.0 (not Built-in RP)
- AR Foundation 6.3.2 (unified API)
- OpenXR 1.16.1 (not Oculus native)
- Netcode for GameObjects 2.7.0 (not UNet)
- Firebase SDK 12.6.0 (no Dynamic Links usage)

### Action Required
| Package | Issue | Migration |
|---------|-------|-----------|
| expo-av | Deprecated SDK 55 | expo-audio + expo-video |
| Node >=18 | EOL Apr 2025 | Update to >=20.0.0 |

### Files Using expo-av (migrate these)
- `src/components/library/VideoViewer.tsx`
- `src/components/library/AudioPlayer.tsx`
- `src/screens/OnboardingScreen.tsx`
- `src/screens/ArtifactViewerScreen.tsx`

---

## Deprecation Timeline Reference

| Technology | Deprecation | Safe Alternative |
|------------|-------------|------------------|
| Node.js 18 | Apr 2025 | Node 20+ |
| Node.js 20 | Apr 2026 | Node 22+ |
| Python 3.10 | Oct 2026 | Python 3.12+ |
| Firebase Dynamic Links | Aug 2025 (DEAD) | Branch.io or deep links |
| GPT-4o | Feb 13, 2026 | gpt-4o-2024-11-20 |
| Unity Built-in RP | Deprecated | URP (using) |
| Oculus native APIs | Deprecated | OpenXR (using) |
| expo-av | SDK 55 | expo-audio + expo-video |
| React Native Bridge | SDK 55 | New Architecture (using) |
| WebGL | Sunset 2028-2030 | WebGPU |

---

## Architecture Principles

### 1. Standards Over Proprietary
- Use glTF 2.0 (not custom format)
- Use OpenXR (not Oculus SDK)
- Use WebGPU (not proprietary graphics)

### 2. Sidecar Over Embedded
```
scene.glb           ← Universal content (glTF)
scene.xrai.json     ← Our intelligence (ranking, semantics)
```
Content travels anywhere. Intelligence is our moat.

### 3. Local-First Over Cloud
- AI inference on-device (ONNX/CoreML)
- Data stays with user
- Works offline
- No server costs

### 4. P2P Over Servers
- PeerJS for signaling (free)
- WebRTC for real-time (free)
- LiveKit for >4 users (self-hosted)

### 5. Browser as Escape Hatch
- WebGPU viewer works everywhere
- No app install required for viewing
- Viral sharing without friction

---

## Zero-Cost Stack

| Layer | Solution | Monthly Cost |
|-------|----------|--------------|
| Auth | Firebase (50K MAU) | $0 |
| Storage | Cloudflare R2 (10GB) | $0 |
| Hosting | Cloudflare Pages | $0 |
| P2P Signaling | PeerJS cloud | $0 |
| CDN | jsDelivr | $0 |
| AI | On-device ONNX | $0 |

---

## Single Points of Failure (Mitigated)

| Dependency | Risk | Mitigation |
|------------|------|------------|
| Firebase | Google shutdown | Export to Supabase |
| Cloudflare | Policy change | S3-compatible = portable |
| Unity | License change | Core logic in C# = portable |
| React Native | Meta abandonment | Community fork (like Expo) |
| ViroReact | Maintainer gone | Using @reactvision fork |

---

## The Moat: SpatialRank

Capture and viewing are commodities. Ranking is defensible.

```javascript
SpatialRank(node) = Σ(weight × signal)

Signals:
1. Proximity - distance to user/objects
2. Engagement - interaction frequency
3. Authority - creator trust score
4. Semantic - intent matching
5. Temporal - recency/revisit
6. CrossRef - incoming links
```

---

## Implementation Priority

### Week 1-2: Magic Demo
- Port MetavidoVFX hologram selfie
- Add shareable link generation
- Browser-viewable output

### Week 3-4: Hardening
- Migrate expo-av → expo-audio/expo-video
- Update Node engine to >=20.0.0
- Remove unused dependencies

### Month 2-3: Sidecar System
- Implement .xrai.json sidecar capture
- Basic SpatialRank scorer
- Browser viewer with ranking

### Month 4-6: Scale
- P2P multi-user hologram calls
- glTF export with sidecar
- Index external content (Icosa/Sketchfab)

---

## Key Insight

> **Don't build infrastructure for users you don't have.**

1. Port existing code (~1 week)
2. Ship to 10 real users
3. Iterate based on feedback
4. THEN decide architecture

The most dangerous assumption is that you know what users want before they tell you.

# Portals V4: Strategic Audit & Foundation Design

**Date:** 2026-02-05
**Purpose:** Radical simplification. Question everything. Design for the next 5+ years.
**Approach:** First principles. No tech assumptions.

---

## Part 1: Are We On Track?

### Current State Assessment

| Dimension | Where We Are | On Track? |
|-----------|--------------|-----------|
| **Core Promise** | Voice + AR world building | ⚠️ Not proven yet |
| **Tech Stack** | Unity UAAL + React Native | ⚠️ Complex, fragile |
| **Codebase Size** | ~3000+ files across projects | 🔴 Too much |
| **Build Time** | 5-15 min per iteration | 🔴 Too slow |
| **Time to Magic** | Weeks away | ⚠️ Should be days |

### Honest Questions

1. **Do we need React Native at all?**
   - Unity can do auth, UI, networking
   - RN adds 50% complexity for what benefit?
   - Counter: RN iterates 10x faster for UI

2. **Do we need Unity at all?**
   - Three.js / Babylon.js exist
   - WebXR is maturing
   - Counter: VFX Graph, 60 FPS AR, existing assets

3. **Is UAAL the right integration pattern?**
   - Most complex possible setup
   - Alternatives: Unity-only, RN-only, or web hybrid
   - Counter: Already working, proven architecture

4. **Are we building the right thing?**
   - Voice + LLM + AR = strong differentiator
   - But is it what users want?
   - Need: User validation, not more tech

---

## Part 2: First Principles

### What's the actual product?

```
User speaks → Magic happens in AR → User shares → Others see magic
```

**That's it.** Everything else is implementation detail.

### What's the minimum to prove this?

| Must Have | Nice to Have | Not Needed (Yet) |
|-----------|--------------|------------------|
| Voice input | Audio reactivity | Volumetric capture |
| LLM understanding | Hand tracking | 91-joint skeleton |
| AR object placement | Face tracking | Cross-platform |
| Screen recording | Multiplayer | Quest support |
| Share to social | Custom VFX | visionOS |

### What's blocking us?

1. **Build complexity** - 5-15 min iteration cycles
2. **Integration fragility** - UAAL bridge breaks often
3. **Scope creep** - Planning features before proving core
4. **Tech over product** - Specs about tech, not user value

---

## Part 3: Radical Simplification Options

### Option A: Unity-Only (Most Radical)

```
Drop React Native entirely. Unity handles everything.
```

| Pro | Con |
|-----|-----|
| One codebase | Slower UI iteration |
| No bridge bugs | Lose RN ecosystem |
| Faster builds | Auth/social harder |
| Simpler debugging | Different skill set |

**Effort:** 2-4 weeks to migrate core features
**Risk:** High - betting on Unity for everything

### Option B: RN-Only with Three.js (Web-First)

```
Drop Unity. React Native + WebGL/Three.js for 3D.
```

| Pro | Con |
|-----|-----|
| Faster iteration | No VFX Graph |
| Huge ecosystem | Worse AR performance |
| Web + mobile | 30 FPS vs 60 FPS |
| Easier hiring | Rebuild 3D systems |

**Effort:** 4-8 weeks to rebuild AR
**Risk:** Medium-High - performance ceiling

### Option C: Simplified UAAL (Evolutionary)

```
Keep current stack but ruthlessly simplify.
```

| Pro | Con |
|-----|-----|
| Preserves work | Still complex |
| Known architecture | Build times remain |
| Incremental | Bridge still fragile |
| Lower risk | Technical debt |

**Effort:** 1-2 weeks to simplify
**Risk:** Low - but doesn't solve root issues

### Option D: Unity + Lightweight Bridge (Recommended)

```
Unity as primary. Minimal RN shell for app store / auth only.
```

| Pro | Con |
|-----|-----|
| Unity owns UI/3D | Some RN ecosystem lost |
| Simpler bridge | New Unity UI work |
| Fast 3D iteration | Learning curve |
| VFX Graph + AR | Two languages still |

**Effort:** 2-3 weeks to shift balance
**Risk:** Medium - requires Unity UI investment

---

## Part 4: What Would We Build Differently?

### If Starting Today (2026)

| Old Assumption | New Thinking |
|----------------|--------------|
| RN owns UI, Unity owns 3D | Unity owns everything, RN is thin shell |
| Complex bridge protocol | Minimal: init, voice, share - that's it |
| Many tracking providers | iOS ARKit only until proven |
| Volumetric capture | Screen capture is fine for years |
| Quest support | iOS only until profitable |
| Multi-LLM support | Gemini only, switch if needed |
| Full scene format | JSON + glTF, nothing custom |

### Minimal Viable Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SIMPLIFIED ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  React Native (Thin Shell)                                          │
│  ├── App Store wrapper                                              │
│  ├── Firebase Auth                                                  │
│  ├── Voice recording (expo-audio)                                   │
│  └── Share sheet                                                    │
│                                                                      │
│        ↓ Bridge: 3 messages only ↓                                  │
│        1. unity_ready                                               │
│        2. voice_command { audio_url }                               │
│        3. share_recording { video_path }                            │
│                                                                      │
│  Unity (Everything Else)                                            │
│  ├── AR Foundation (ARKit)                                          │
│  ├── Scene composition (objects, VFX)                               │
│  ├── LLM integration (Gemini API direct)                            │
│  ├── Recording (screen capture)                                     │
│  └── All UI (Canvas + UI Toolkit)                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Bridge messages reduced from ~20 to 3.**

---

## Part 5: Recommended Path Forward

### Phase 0: Prove Magic (1 week)

**Goal:** Voice → object in AR, working on device

**Do:**
- Use existing bridge
- Copy FigmentAR voice code
- Create simplest UnityCompiler
- One demo: "add a cube" works

**Don't:**
- Add new features
- Refactor anything
- Build abstractions
- Write specs

**Success:** Video of voice creating AR object on real device

### Phase 1: Validate with Users (2 weeks)

**Goal:** Real humans use it, give feedback

**Do:**
- TestFlight to 10 friends
- Watch them use it
- Note what breaks, confuses
- Ask: "Would you use this?"

**Don't:**
- Add features they didn't ask for
- Fix edge cases
- Polish UI
- Write documentation

**Success:** 3+ users say "I'd use this regularly"

### Phase 2: Simplify Architecture (2 weeks)

**Goal:** Based on Phase 1 learnings, simplify ruthlessly

**Likely changes:**
- Move more to Unity (UI, LLM calls)
- Reduce bridge messages
- Cut unused features
- Delete dead code

**Success:** 50% fewer files, 50% faster builds

### Phase 3: Add One Differentiator (2 weeks)

**Goal:** The "wow" feature that competitors don't have

**Candidates (pick ONE):**
- Audio-reactive VFX (music → particles)
- Draw in air (hand tracking paint)
- AI scene arrangement ("make a circle")
- Real-time collaboration (see friend's cursor)

**Success:** Demo video that makes people say "how did you do that?"

---

## Part 6: What to Keep vs Cut

### Keep (Proven Value)

| Asset | Why Keep |
|-------|----------|
| Unity UAAL integration | Working, documented |
| ArViewRecorder | Screen capture works |
| FigmentAR voice pipeline | 100% reusable |
| AR Foundation setup | Standard, stable |
| Firebase auth | Working, free tier |

### Cut or Defer (Unproven)

| Asset | Why Cut |
|-------|---------|
| ViroReact | Legacy, EOL |
| Complex bridge protocol | Over-engineered |
| ITrackingProvider | YAGNI (no second platform yet) |
| Volumetric capture | No user need proven |
| Quest support | Different product |
| Multi-LLM support | Gemini is enough |

### Question (Need Research)

| Asset | Question |
|-------|----------|
| React Native UI | Is Unity UI good enough? |
| Normcore | Is multiplayer core or feature? |
| Hand tracking | Essential or nice-to-have? |
| Custom scene format | Is JSON + glTF enough? |

---

## Part 7: Foundation Design Principles

For a foundation that lasts 5+ years:

### 1. Minimal Surface Area

- Fewer files = fewer bugs
- Fewer dependencies = fewer breaks
- Fewer abstractions = easier reasoning
- **Target: <100 core files**

### 2. Boring Technology

- Choose stable, proven tools
- Avoid cutting-edge unless essential
- **Example:** JSON over custom binary format

### 3. Explicit over Clever

- Readable > compact
- Copy-paste > DRY (sometimes)
- **Example:** Inline code > 3-level abstraction

### 4. User Feedback Driven

- Build what users ask for
- Not what we imagine
- **Example:** Ship, watch, learn, iterate

### 5. Escape Hatches

- Don't lock into vendors
- Standard formats where possible
- **Example:** glTF, not custom mesh format

---

## Part 8: Immediate Next Steps

### This Week

1. **Stop all feature planning** - No more specs until core proven
2. **Build minimal voice → AR demo** - Prove magic works
3. **Record 30-second video** - Shareable proof of concept
4. **Share with 5 people** - Get real feedback

### This Month

1. **User validation** - 10+ people try it
2. **Architecture decision** - Options A/B/C/D above
3. **Codebase audit** - Delete 50%+ of unused code
4. **Simplified spec** - One page, not 20

### This Quarter

1. **Public beta** - TestFlight widely available
2. **One "wow" feature** - The differentiator
3. **Revenue experiment** - Can this be a business?

---

## Part 9: Success Metrics

### Short-Term (30 days)

| Metric | Target |
|--------|--------|
| Voice → AR working | Yes/No |
| Build time | <3 min |
| Core files | <100 |
| Users tried | 10+ |

### Medium-Term (90 days)

| Metric | Target |
|--------|--------|
| Weekly active users | 100+ |
| Session length | 5+ min |
| "Wow" feature shipped | Yes |
| User referrals | 3+ |

### Long-Term (12 months)

| Metric | Target |
|--------|--------|
| Monthly active users | 10,000+ |
| Platforms | iOS + 1 more |
| Revenue | $1+ |
| Team size | 2-3 |

---

## Part 10: Final Recommendation

**Stop planning. Start proving.**

The specs, architectures, and roadmaps are impressive but unvalidated. The most important thing now is:

1. **One working demo** - Voice creates AR object
2. **One real user** - Someone outside the team uses it
3. **One piece of feedback** - What do they actually want?

Everything else - volumetric capture, Quest support, multiplayer, hand tracking - can wait until we know the core is right.

**Recommended action:** Pause all documentation work. Build the minimal demo. Ship to TestFlight. Watch users. Then decide architecture.

---

*"Weeks of coding can save hours of planning. But months of planning can waste years of opportunity."*

*Last Updated: 2026-02-05*

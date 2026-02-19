# XR + AI Industry Roadmap (2025-2027)

**Last Updated**: 2026-02-19
**Scope**: Market, Hardware, AI Agents, Funding, Tracking, Voice, Standards, VFX
**Sources**: Unity, Meta, Google, OpenAI, xAI, Anthropic, Khronos, W3C, USPTO, TechCrunch, Gartner, IBM

---

## XR Market (Feb 2026)

- XR market: **$10.6B** (2026) → $59.2B (2031), 41% CAGR
- **Spatial Computing Platform Market**: $164B (2025) → $1.2T (2035), 22% CAGR
- Enterprise XR spending: ~$12B worldwide, up 20% YoY
- Head-mounted displays: 42% of market; AR: 43% of tech share
- **AI smart glasses shipments: +211.2% in 2025** (10.6M units) — biggest growth segment
- **VR headset shipments: -42.8% in 2025** — paradigm shift from headsets to glasses
- Supply chain risk: gallium/germanium shortages inflating optics prices 25%
- **"XR" label declining; "Spatial AI" is the new framing** — pure VR declining, AI+spatial growing
- The XR hiring paradox: classic "Unity Developer" titles vanishing, replaced by "Spatial Computing Engineer," "Computer Vision Engineer," "3D/ML Engineer"

## AI Market (Feb 2026)

- AI startups: 33% of all VC funding globally ($89.4B in 2025); **North America AI funding up 46% ($280B seed-growth)**
- **55 US AI startups raised $100M+ in 2025** alone
- Agentic AI: $7.8B → $52B by 2030; 40% of enterprise apps will embed agents by end 2026 (Gartner)
- **AI agent skill demand: +1,587%** (fastest growing tech skill)
- 67% of orgs have adopted LLMs; 92% plan to expand AI budgets
- **AI coding tools**: 85% developer adoption, but METR study shows experienced devs **19% slower** with AI tools
- **Developer trust in AI declining** even as adoption rises (60% positive, down from 70%+)
- **Code duplication up 4x**, short-term code churn increasing with AI-assisted development
- EU AI Act fully applicable August 2026
- Warning: 40%+ of agentic AI projects will be canceled by 2027 (Gartner) — cost/ROI unclear
- **AI SaaS pricing shift**: 92% of AI companies use mixed pricing (subscription + usage + enterprise), flat per-seat model is dead

## Key Funding Rounds (2025-2026)

| Company | Round | Amount | Valuation | Sector |
|---------|-------|--------|-----------|--------|
| OpenAI | — | $40B | — | LLM/Agents |
| Anthropic | Series G | $30B | $380B | LLM/Agents |
| xAI | — | $20B | — | LLM |
| **Infinite Reality** | — | **$3B** | **$12.25B** | XR/e-commerce platform |
| **Cursor** | Series C | **$2.3B** | **$9B** | AI code editor |
| **Reflection AI** | — | **$2B** | — | AI agents |
| **World Labs** | Series B | **$1B** (Feb 18, 2026) | — | Spatial AI / world models |
| **SkildAI** | Series C | **$1.4B** | **$14B** | Robotics foundation model |
| **Luma AI** | Series C | **$900M** | — | 3D/world models |
| **ElevenLabs** | — | **$500M** | — | Voice AI |
| **Runway** | — | **$315M** | — | Video/3D generation |
| **Sesame** | Series B | **$250M** | — | AI glasses (Oculus founders) |
| **XPANCEO** | Series A | **$250M** | — | Smart contact lens XR |
| **Inferact** | Seed | **$150M** | **$800M** | AI agents |
| Xreal | Strategic | $100M | — | AR glasses |

### Emerging XR Companies (Sub-$10M, High Signal)
| Company | Funding | Focus |
|---------|---------|-------|
| **Gracia AI** | $1.7M | 4D Gaussian Splatting infrastructure (Unity/Unreal plugins, WebGPU, Quest 3) |

---

## Unity 6 Roadmap (2026)

| Version | Key Features |
|---------|-------------|
| 6.1 | Android XR support introduced |
| 6.3 LTS | Android XR extended (face/object tracking), Platform Toolkit, Render Graph XR perf |
| 2026 | Unity AI Beta: agentic Editor capabilities, improved asset generation |
| 2026 | Foveated rendering, Application SpaceWarp, WebXR build target |
| 2026 | Hand tracking/gestures: recording, playback, prebuilt gestures, custom pose detection |
| Paused | New animation/world-building workflows — focus on CoreCLR migration + stability |

**AI**: Unity AI Beta 2026 = agentic assistant in Editor. ML-Agents + Inference Engine (ONNX). Local inference free; cloud uses Unity Points.

**XR strategy**: "2026 will be the year of XR content that is measurable, adaptive, meaningful, and integrated with AI embedded at the device level."

## Unreal Engine Roadmap (5.6-5.7, 2025-2026)

| Version | Key Features |
|---------|-------------|
| 5.6 (Jun 2025) | MetaHuman Creator embedded in-editor, body shape generation, outfit assets |
| 5.7 (Dec 2025) | MetaHuman Python/Blueprint API, Linux/macOS Creator, Groom joint-based hair |
| 5.7 | MetaHuman Animator: real-time webcam/smartphone capture, audio-to-animation |
| 5.7 | Rig Mapper (experimental): ARKit ↔ MetaHuman animation transfer |
| 5.7 | Procedural foliage at massive scale, physically accurate layered materials |

**Key**: MetaHuman increasingly bridging XR (Live Link Face for AR, ARKit retargeting). Audio → facial animation is a differentiator vs Unity.

---

## Meta XR

| Timeline | Hardware | Notes |
|----------|----------|-------|
| 2025 | Quest 3S, Hands 2.4 | 40% hand tracking latency reduction |
| 2026 | "Puffin/Loma" ultra-light headset | Quest 4 cancelled, pivot to lightweight |
| 2027 | Phoenix postponed | Originally mixed-reality, now TBD |

**Key**: Quest 4 cancelled. Pivot to ultra-light AR headset ("bigger Ray-Bans with Vision Pro-like features, but cheaper"). Reality Labs: $60B cumulative losses since 2020, ~50.8% VR market share. Llama AI for NPCs.

## Apple visionOS

| Timeline | Update | Notes |
|----------|--------|-------|
| 2025 | visionOS 26 (WWDC) | Permanent widgets, WidgetKit SDK |
| 2025 | PS VR2 controller support | Plus Logitech Muse pen |
| Late 2026 | Vision Pro 2 or Lite (~$2,000) | Cheaper, comparable performance |
| 2026 | Unity 1.0 visionOS tools | Play to Device, foveated rendering, MSAA |

**Key**: Unity is first third-party platform with full visionOS support. Cross-platform Quest/Vision Pro from same codebase via XRI toolkit.

---

## Google / Android XR

| Timeline | Product |
|----------|---------|
| 2025 Q4 | Android XR OS + Samsung Moohan headset |
| 2026 | Project Aura glasses (with XREAL, announced Jan 6 2026) |
| 2026 | Samsung Galaxy XR (125K units projected) |
| 2026+ | 5+ Android XR devices expected; Warby Parker AI glasses |

**Key**: Gemini-native spatial AI. Supports Unity, OpenXR. "Android XR could do for spatial computing what Android did for smartphones." Software ecosystem > hardware.

---

## Agentic AI (Feb 2026)

| Trend | Detail |
|-------|--------|
| Multi-agent systems | Microservices revolution — orchestrated specialized agents replacing monolithic |
| MCP (Model Context Protocol) | De facto standard for agent-tool integration (Anthropic, adopted by OpenAI, Google) |
| Three-tier ecosystem | Tier 1: hyperscalers, Tier 2: enterprise SaaS, Tier 3: agent-native startups |
| Human-in-the-loop | Hybrid human-agent outperforms either alone for high-stakes decisions |
| Code execution over tool calls | Agents write code to call tools (fewer tokens, better composition) |
| Agent washing | Gartner: only ~130 legitimate agentic AI vendors; widespread rebranding |

**Key models (2026)**: GPT-5/5.5, Gemini 2.5/3, Claude 4, Llama 4, DeepSeek V3, Mixtral, Qwen 3

**MCP best practices**: Standardized tool integration > custom code. Simple workflow patterns > graph architectures. MCP Inspector for testing. Sandbox agent-generated code. O'Reilly book: *AI Agents with MCP*.

---

## OpenAI GPT

| Model | Spatial Capability |
|-------|-------------------|
| GPT-5 (Aug 2025) | Multimodal visual/spatial reasoning |
| GPT-5.2 (Nov 2025) | 50% error reduction on charts/diagrams |
| GPT-6 (Q1 2026) | Expected significant gains |

**Key**: Enhanced spatial understanding, no dedicated XR product.

---

## xAI Grok

| Timeline | Feature |
|----------|---------|
| 2025 | Grok 4 multimodal, Tesla integration |
| Q1 2026 | Grok 5 (6T params), AI-powered VR game |

**Key**: Gaming/VR focus, cross-platform VR potential.

---

## Patent Trends: Wrist-Based Tracking

| Company | Focus | Date |
|---------|-------|------|
| Apple | Watch ↔ Vision Pro hand tracking | 2024-2025 |
| Apple | Smart ring force sensors | 2024 |
| Google | Wrist-worn IR gesture camera | 2024/01 |
| Meta | Wristband AR input device | 2024 |

**Key**: Industry converging on wrist+headset fusion for hand tracking.

---

## Architecture Implications

1. **Unity Migration**: Sentis → Inference Engine API path exists
2. **Android XR Provider**: Plan for Gemini-integrated tracking SDK
3. **Wrist Device Input**: Design interface for supplementary tracking
4. **Smart Glasses Mode**: Lighter tracking (hands only) for AR glasses
5. **ONNX Portability**: Keep models in ONNX for maximum swappability

---

## Voice AI for XR

| Technology | Latency | Notes |
|------------|---------|-------|
| Whisper v3-turbo | ~200ms | 99+ languages |
| gpt-4o-transcribe | ~300ms | Improved WER |
| Pipecat (OSS) | varies | Multimodal framework |
| ElevenLabs | <200ms | Low-latency TTS |

**Trend**: Hybrid architecture (on-device perception + cloud reasoning) for <200ms turn latency.

---

## No-Code XR Builders

| Tool | Status |
|------|--------|
| Unity Visual Scripting | AR Foundation nodes available |
| Unity Muse/AI | Natural language → scenes |
| Google XR Blocks | WebXR + ML visual prototyping |
| ShapesXR | Voice-driven Quest creation |
| Adobe Aero | Shutting down end 2025 |

---

## Cross-Platform XR Standards

### Khronos (2025)
- **OpenXR 1.1**: Core spec, all major vendors
- **OpenXR Spatial Entities**: Planes, anchors, persistence (public review)
- **glTF**: Gaussian splats extension (with Niantic, Cesium)
- **glTF + USD**: AOUSD liaison for material interop

### W3C WebXR
- **WebXR Device API**: Candidate Rec (Oct 2025)
- **Depth/Occlusion API**: Expected Q4 2026
- **Interop 2026**: Cross-browser compatibility focus

---

## VFX Technology

| Engine | GPU System | Scale |
|--------|-----------|-------|
| Unity | VFX Graph | Millions (GPU) |
| Unreal | Niagara | Millions (GPU) |

**AI + VFX**: Procedural generation, adaptive LOD, pose-driven particles.

**Market**: $464B (2026) → $600B (2034).

---

## Gaps & Opportunities Analysis (Feb 2026)

### Your Strengths (KB expertise × market demand)
| Strength | KB Mentions | Market Jobs | Verdict |
|----------|------------|-------------|---------|
| Unity | 5,508 | 1,614 | Strong match — deep expertise, strong demand |
| AI/ML | 481 (RAG) + 316 (agents) + 205 (LLM) | 3,879 (AI) + 519 (ML) | Growing expertise, massive demand |
| Quest/Meta | 1,505 + 822 | 661 | Expert-level, solid demand |
| AR Foundation | 237 + 494 (ARKit) | 6,602 (AR) | Deep expertise, huge demand |

### Short-term Gaps (0-3 months)
| Gap | Why it matters | Action |
|-----|---------------|--------|
| **Agentic AI / MCP** | 40% of enterprise apps embedding agents by end 2026. +1,587% demand | Add MCP server development to KB, build one |
| **Android XR** | Google's platform play, 5+ devices in 2026. Unity 6.1+ supports it | Research Android XR SDK, add KB entry |
| **Application tracking** | 0 applications tracked in WarpJobs. Intelligence can't compound without data | Use WarpJobs apply/feedback APIs for every outreach |
| **3D Gaussian Splatting hands-on** | Entire new rendering paradigm; few experts exist. World Labs Spark is MIT/OSS | Build demo with Spark (Three.js), add to portfolio |
| **Rust basics** | Default for new safety-critical systems (Anduril, World Labs, infra) | Small project; signals "modern systems thinking" at CTO level |

### Medium-term Opportunities (3-12 months)
| Opportunity | Why | Your edge |
|-------------|-----|-----------|
| **Unity + AI convergence** | Unity AI Beta 2026 = agentic Editor. Market wants Unity+AI people | 5,508 Unity mentions + growing AI expertise |
| **Spatial computing platforms** | Android XR + visionOS + Quest. Cross-platform devs rare | 20+ years XR, AR Foundation expert, Unity cross-platform |
| **AI agent infrastructure** | MCP = de facto standard. LangGraph at 400+ companies | WaveXR CTO experience + AI/XR bridge |
| **World Labs / Luma AI targeting** | Direct overlap: 3D + AI + Unity pipeline exports. World Labs just raised $1B | VC intro via a16z network; deep 3D pipeline knowledge |
| **"Spatial AI Leader" positioning** | Market needs people who understand both 3D pipelines AND AI infra. Very few globally | 20+ years XR + modern AI stack knowledge |

### Long-term Positioning (1-3 years)
| Trend | Signal | Position |
|-------|--------|----------|
| Spatial Computing $164B → $1.2T by 2035 | 22% CAGR, bigger than XR market alone | CTO-level XR/AI expertise is scarce |
| Smart glasses replace headsets | +211.2% glasses vs -42.8% headsets in 2025 | AR Foundation + spatial computing = transferable |
| AI agents replace SaaS | "Agent-native" startups bypassing traditional software | Build agent experience now, ride the wave |
| Large World Models | AI that generates/reasons about 3D environments | Bridge between "old 3D" (meshes, engines) and "new 3D" (neural rendering) |
| EU AI Act (Aug 2026) | 60% of Fortune 100 appointing AI governance heads | Governance + technical = leadership differentiator |
| Platform-first + open-source | Every funded XR/AI company building platforms, not products | Understand platform economics + dev relations |

---

## AI Agent Frameworks (Feb 2026)

| Framework | Adoption | Key Detail |
|-----------|----------|------------|
| **LangGraph** | 400+ companies (LinkedIn, Uber) | Graph-based agent orchestration, production standard |
| **CrewAI** | 60% of Fortune 500 | $18M raised, multi-agent workflows |
| **Microsoft Agent Framework** | Enterprise | AutoGen + Semantic Kernel merger |
| **MCP (Anthropic)** | De facto standard | Adopted by OpenAI, Google for tool integration |
| **BMAD Method** | Open source | 12+ specialized AI agents (PM, Architect, Dev, UX) |

## Canonical XR/AI Tech Stack (2026)

```
LAYER 1: LANGUAGES
  Training/Research:  Python (PyTorch 55%+ production share)
  Performance:        Rust (infrastructure, renderers, tooling)
  Systems:            C++ (CUDA kernels, game engines, robotics)
  Platform:           Go (distributed systems, microservices)
  Frontend/SDK:       TypeScript, C# (Unity), Swift (visionOS)

LAYER 2: AI/ML
  Core:               PyTorch, TensorFlow, ONNX (deployment)
  NLP/LLM:            Hugging Face Transformers
  Agents:             LangGraph, CrewAI, MCP
  Vision:             OpenCV, custom 3DGS pipelines

LAYER 3: 3D/SPATIAL
  Engines:            Unity (XR Interaction Toolkit, AR Foundation)
                      Unreal Engine 5 (Nanite, Lumen)
  Rendering:          3D Gaussian Splatting, NeRF, Vulkan, Metal, WebXR
  Formats:            .PLY, .SPZ, .SPLAT, glTF, USD

LAYER 4: INFRASTRUCTURE
  Cloud:              AWS, GCP, Azure (multi-cloud common)
  Orchestration:      Kubernetes (Argo CD for GitOps)
  IaC:                Terraform
  MLOps:              MLflow, DVC, Weights & Biases
  APIs:               gRPC + protobuf (perf-critical), REST (public)
  Data:               PostgreSQL, Redis, vector DBs, Apache Kafka

LAYER 5: HARDWARE TARGETS
  XR Devices:         Meta Quest 3/3S, Apple Vision Pro, XREAL One/Aura
  Compute:            NVIDIA H100/H200, AMD MI300X
  Edge:               NVIDIA Jetson, Qualcomm Snapdragon
  Robotics:           NVIDIA Isaac Lab, MuJoCo, RoboSuite
```

## Three Defining Technologies (2026)

| Technology | What it is | Key Players |
|-----------|------------|-------------|
| **3D Gaussian Splatting** | Real-time photorealistic 3D from images/video; lighter than meshes | World Labs (Spark), Luma AI, Gracia AI |
| **Large World Models** | AI that generates/reasons about 3D environments | World Labs (Marble), Google (Genie 3) |
| **AI Agent Orchestration** | Multi-agent systems replacing monolithic apps | LangGraph, CrewAI, MCP ecosystem |

## Key Companies to Watch

| Company | Why | Sector |
|---------|-----|--------|
| **World Labs** | Fei-Fei Li, $1B Series B (Feb 2026), Marble platform, Spark (MIT OSS renderer) | Spatial AI |
| **Luma AI** | $900M Series C, Ray3 embedded in Adobe, 2GW training cluster | 3D/World Models |
| **Xreal** | Lead Android XR hardware partner, SDK 3.0 (Unity XR Plugin), $100M funding | AR Glasses |
| **Sesame** | Oculus co-founders (Iribe + Mitchell), $250M Series B, AI smart glasses | AI Glasses |
| **Anthropic** | Claude/MCP, $30B Series G, $380B valuation | LLM/Agents |
| **SkildAI** | Universal robotics brain, $1.4B raise, 100K sim instances in NVIDIA Isaac Lab | Robotics |
| **Immersed** | Visor hardware + platform, Dell partnership, 40-60h/week usage data | Spatial Computing |
| **Anduril** | Lattice OS + open SDK, Palmer Luckey, $13.4B DoD AI budget, 1,427 open jobs | Defense AI |
| **Cursor** | $2.3B raise at $9B valuation, agent-native IDE | Dev Tools |
| **ElevenLabs** | Low-latency TTS, a16z portfolio, <200ms voice AI, $500M | Voice AI |
| **Gracia AI** | 4D Gaussian Splatting infra, Unity/Unreal plugins, Quest 3 standalone | 4DGS |
| **XPANCEO** | Smart contact lens XR, $250M Series A | XR Hardware |
| **Infinite Reality** | iR Engine, no-code iR Studio, Google Cloud, $3B at $12.25B | XR Platform |

## Winning Business Model Patterns (2026)

| Model | Description | Example |
|-------|------------|---------|
| **Platform + API (Usage-Based)** | Core AI/3D capability via API calls, 60-70% gross margins | OpenAI, Luma AI, World Labs |
| **Vertical SaaS + AI** | Industry-specific AI tools with deep workflow integration | Gracia AI, Osso VR, Immersed |
| **Full-Stack Hardware + Software** | Own hardware AND software, highest lock-in + data flywheel | Immersed, XREAL, Sesame |
| **Defense/Gov Platform** | Software-defined defense, $13.4B DoD AI budget FY2026 | Anduril (Lattice OS) |
| **Foundation Model + Licensing** | Massive model trained, licensed to ecosystem | Skild AI, World Labs |
| **Open-Source + Enterprise** | Free tier for adoption, paid for scale/support | World Labs (Spark MIT) |

**Key insight**: Data network effects are the strongest moat. Every customer improves the model for all customers.

## Common Patterns Across Successful XR/AI Companies

1. **Platform-first** — Every one is building a platform, not a product
2. **Open-source as strategic lever** — All publish OSS components to drive adoption
3. **AI + 3D/Spatial convergence** — AI must understand and generate 3D space
4. **Massive compute investment** — 2GW clusters, 100K sim instances, $1B manufacturing
5. **World-class founding teams from major tech** — Oculus, Stanford AI Lab, CMU, Google
6. **Dual-output architecture** — Both human perception AND machine interaction

## Key VC Firms & Blogs to Track

### Sequoia Capital
- **$1B new funds** (Seed VI $200M + Venture XIX $750M), ~70 AI portfolio companies
- Invested in: OpenAI, Anthropic (Jan 2026), Waymo ($16B round), xAI
- Blog: [sequoiacap.com](https://sequoiacap.com/) — "AI in 2026: Tale of Two AIs" (delays in DC buildouts + AGI, but $0→$1B AI startups emerging)
- **XR gap**: No known spatial computing investments — AI infrastructure focus

### a16z (Andreessen Horowitz)
- **$15B raised** Jan 2026 ($3.5B AI apps, $1.7B AI infra, $5B late-stage, $2.5B American Dynamism)
- Managing $90B+ assets. AI > 50% of new deals
- Portfolio: Anduril, Cursor, Harvey, ElevenLabs, Groq, Sierra, Glean
- Blog: [a16z.com](https://a16z.com/) — "Big Ideas 2026": video models that understand time, multimodal AI, personalized products
- Gaming: a16z Speedrun accelerator (expanded to all industries 2025)
- **XR signal**: "Video models as spaces where robots practice, games evolve, agents learn by doing"

---

## References

- [Unity 2025 Roadmap](https://unity.com/blog/unity-engine-2025-roadmap)
- [Unity 6.2 AI](https://www.cgchannel.com/2025/08/unity-rolls-out-unity-ai-in-unity-6-2/)
- [Meta Llama Roadmap](https://pub.towardsai.net/whats-next-for-meta-s-llama-a-roadmap-to-2026)
- [Android XR Overview](https://framesixty.com/android-xr-the-next-wave-of-spatial-computing/)
- [GPT-5.2](https://openai.com/index/introducing-gpt-5-2/)
- [Grok 5 Preview](https://www.sentisight.ai/what-to-expect-from-grok-in-2026/)
- [OpenXR Spatial Entities](https://www.khronos.org/blog/openxr-spatial-entities-extensions-released-for-developer-feedback)
- [WebXR Device API](https://www.w3.org/TR/webxr/)
- [Google XR Blocks](https://research.google/blog/xr-blocks-accelerating-ai-xr-innovation/)
- [Pipecat Framework](https://github.com/pipecat-ai/pipecat)
- [XR Market 2026-2031](https://www.mordorintelligence.com/industry-reports/extended-reality-xr-market)
- [AI Funding Tracker 2026](https://aifundingtracker.com/)
- [Anthropic $30B Series G](https://techcrunch.com/2026/02/17/here-are-the-17-us-based-ai-companies-that-have-raised-100m-or-more-in-2026/)
- [Agentic AI Trends 2026](https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/)
- [MCP Best Practices](https://developers.redhat.com/articles/2026/01/08/building-effective-ai-agents-mcp)
- [Android XR + Xreal](https://www.webpronews.com/google-extends-xreal-partnership-for-android-xr-ar-glasses-in-2026/)
- [AI Enterprise Trends (IBM)](https://www.ibm.com/think/news/ai-tech-trends-predictions-2026)
- [visionOS 26 Updates](https://skarredghost.com/2025/06/09/apple-wwdc-visionos-26-meta/)
- [Unity visionOS 1.0](https://www.roadtovr.com/unity-releases-1-0-tools-for-vision-pro-app-development/)
- [Unity 2026 Roadmap](https://digitalproduction.com/2025/11/26/unitys-2026-roadmap-coreclr-verified-packages-fewer-surprises/)
- [Unity 2026 Industry Trends](https://unity.com/blog/top-trends-redefining-industry-in-2026)
- [Unity AI Beta 2026](https://discussions.unity.com/t/unity-ai-beta-2026-is-here/1703625)
- [UE 5.7](https://www.unrealengine.com/en-US/news/unreal-engine-5-7-is-now-available)
- [MetaHuman 5.7](https://www.metahuman.com/en-US/releases/metahuman-5-7-is-now-available)
- [Sequoia AI Outlook 2026](https://sequoiacap.com/article/ai-in-2026-the-tale-of-two-ais/)
- [Sequoia Anthropic Investment](https://techcrunch.com/2026/01/18/sequoia-to-invest-in-anthropic-breaking-vc-taboo-on-backing-rivals-ft/)
- [a16z Big Ideas 2026](https://a16z.com/newsletter/big-ideas-2026-part-1/)
- [a16z $15B Fundraise](https://blog.femaleswitch.org/startup-news-2026-andreessen-horowitz-15-billion-fundraising-insights/)
- [a16z AI Portfolio](https://www.feedtheai.com/a16zs-ai-startups-portfolio/)
- [World Labs $1B Series B](https://techcrunch.com/2026/02/18/world-labs-lands-200m-from-autodesk-to-bring-world-models-into-3d-workflows/)
- [Luma AI $900M Series C](https://www.businesswire.com/news/home/20251119678010/en/)
- [Skild AI $1.4B](https://www.businesswire.com/news/home/20260114335623/en/)
- [Infinite Reality $3B](https://www.globenewswire.com/news-release/2025/01/08/3006199/0/en/)
- [Sesame $250M](https://techcrunch.com/2025/10/21/sesame-the-conversational-ai-startup-from-oculus-founders-raises-250m/)
- [XREAL SDK 3.0](https://docs.xreal.com/)
- [Gracia AI 4DGS](https://aijourn.com/gracia-ai-raises-1-7m-to-build-the-first-full-stack-infrastructure-for-4d-gaussian-splatting/)
- [World Labs Spark (GitHub)](https://github.com/sparkjsdev/spark)
- [Anduril Lattice SDK](https://developer.anduril.com/guides/concepts/overview)
- [Contrary Research - World Labs](https://research.contrary.com/company/world-labs)
- [Contrary Research - Skild AI](https://research.contrary.com/company/skild-ai)
- [METR AI Productivity Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Kellton AI Tech Stack 2026](https://www.kellton.com/kellton-tech-blog/ai-tech-stack-2026)
- [Robert Half 2026 Tech Hiring](https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand)
- [Crunchbase Big AI Funding 2025](https://news.crunchbase.com/ai/big-funding-trends-charts-eoy-2025/)
- [TechCrunch AI $100M+ 2026](https://techcrunch.com/2026/02/17/here-are-the-17-us-based-ai-companies-that-have-raised-100m-or-more-in-2026/)

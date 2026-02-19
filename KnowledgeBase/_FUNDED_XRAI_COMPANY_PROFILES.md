# Funded XR/AI Company Profiles & Tech Stacks

**Last Updated**: 2026-02-19
**Purpose**: Track successful business plans, tech stacks, processes, and strategies from funded XR/AI companies
**Auto-updated by**: GLOBAL_RULES.md "Auto-recognize successful business plans" rule

---

## Tier 1: Mega-Rounds ($500M+)

### World Labs — Spatial AI / World Models
- **Funding**: $1B Series B (Feb 18, 2026) + earlier rounds
- **Founders**: Fei-Fei Li (Stanford AI Lab, Google Cloud), Ben Mildenhall (NeRF creator)
- **Investors**: a16z, Radical Ventures, Autodesk
- **Product**: Marble — world model platform (API + export formats + integrations)
- **OSS**: Spark renderer (MIT license, Three.js + Rust/WASM 3DGS renderer) — [github.com/sparkjsdev/spark](https://github.com/sparkjsdev/spark)
- **Tech**: Python, PyTorch, Rust, WASM, Three.js, WebGPU, NVIDIA GPU training infra
- **Key Innovation**: Generates both Gaussian Splats (visuals) AND collision meshes (physics) simultaneously
- **Strategy**: Platform-first + open-source adoption lever + enterprise licensing
- **Relevance**: Direct overlap with Unity 3D pipeline knowledge, spatial computing expertise

### Luma AI — 3D/World Models
- **Funding**: $900M Series C (led by HUMAIN)
- **Investors**: HUMAIN, Spark Capital
- **Product**: Ray3 — embedded into Adobe's products (API/SDK, not standalone app)
- **Tech**: Python, PyTorch, CUDA, Unreal Engine 5 plugins, 2GW AI supercluster training
- **Training**: Peta-scale multimodal data on 2-gigawatt cluster in Saudi Arabia
- **Strategy**: API/SDK platform embedded into existing creative tools (Adobe)
- **Relevance**: UE5 plugin expertise relevant, creating 200 roles in London 2026

### Anduril Industries — Defense AI
- **Funding**: Multiple rounds, valued at billions
- **Founder**: Palmer Luckey (Oculus founder)
- **Investors**: a16z (American Dynamism)
- **Product**: Lattice OS — software-defined defense platform
- **OSS**: Lattice SDK (REST + gRPC, full developer docs) — [developer.anduril.com](https://developer.anduril.com/guides/concepts/overview)
- **Tech**: Rust, Go, Python, gRPC + protobuf, Kubernetes, Terraform, C++ (edge compute)
- **Hardware**: Menace (edge compute), Ghost (autonomous sub), Fury/Barracuda (autonomous air/sea)
- **Process**: Software-first, rapid prototyping, iteration in months (not years), pre-emptive product dev
- **Jobs**: 1,427 open positions in WarpJobs data
- **Strategy**: "Silicon Valley for defense" — tech startup velocity applied to defense
- **Relevance**: Massive hiring, Lattice platform maps to systems experience

### Skild AI — Robotics Foundation Model
- **Funding**: $1.4B Series C, $14B valuation
- **Founders**: Deepak Pathak + Abhinav Gupta (CMU professors)
- **Investors**: SoftBank, NVIDIA Ventures, Jeff Bezos, Lightspeed, Coatue
- **Product**: Hardware-agnostic "universal brain" for any robot form factor
- **Tech**: Python, PyTorch, NVIDIA Isaac Lab (100K simultaneous sim instances), MuJoCo
- **Revenue**: ~$30M (rare disclosure for private company)
- **Strategy**: Foundation model + licensing (SoftBank/ABB relationship shows scale)
- **Relevance**: Robotics + AI convergence, GPU programming skills transferable

### Infinite Reality — XR/E-commerce Platform
- **Funding**: $3B (Jan 2025), $12.25B valuation
- **Product**: iR Engine (proprietary), iR Studio (no-code XR creation)
- **Tech**: Proprietary engine, Google Cloud, WebXR
- **Strategy**: Full-stack XR platform for enterprise e-commerce

---

## Tier 2: Well-Funded ($100M-$500M)

### Sesame — AI Smart Glasses
- **Funding**: $307.6M total ($250M Series B)
- **Founders**: Brendan Iribe + Nate Mitchell (Oculus co-founders)
- **Investors**: Sequoia, Spark Capital
- **Product**: Lightweight AI smart glasses with conversational AI
- **Tech**: Custom voice AI, iOS-first, lightweight glasses hardware
- **Strategy**: Consumer hardware + software, leveraging Oculus team expertise
- **Relevance**: Oculus alumni network, XR hardware + AI intersection

### XREAL — Consumer AR Glasses
- **Funding**: $100M+ strategic
- **Product**: XREAL One, XREAL Aura (with Google Android XR)
- **Tech**: XREAL SDK 3.0 (Unity XR Plugin), AR Foundation, XR Interaction Toolkit, Android XR, Snapdragon + X1S chip
- **Partnerships**: Google (Project Aura, Android XR), Samsung
- **OSS**: SDK integrated with Unity's open XR ecosystem — [docs.xreal.com](https://docs.xreal.com/)
- **Strategy**: Hardware + SDK ecosystem, Android XR platform partner
- **Relevance**: SDK built on Unity XR Plugin — direct skill match

### Immersed — VR Remote Work
- **Funding**: $300M valuation (equity crowdfunding)
- **Founder**: Renji Bijoy (full-stack VR pioneer since 2017)
- **Product**: Visor hardware (4K micro-OLED) + spatial computing workspace platform
- **Tech**: Full vertical stack, NVIDIA RTX, Dell Pro Max, Curator AI (local LLM)
- **Partnerships**: Dell
- **Data moat**: Users wearing headsets 40-60h/week = "one of the world's most valuable human movement datasets"
- **Strategy**: Full-stack hardware + software + data flywheel
- **Relevance**: Spatial computing workspace, needs scaling leadership

### XPANCEO — Smart Contact Lens XR
- **Funding**: $250M Series A
- **Product**: All-in-one XR contact lens with health monitoring
- **Strategy**: Frontier hardware, longest timeline to market

---

## Tier 3: Early-Stage Frontier ($1M-$10M)

### Gracia AI — 4D Gaussian Splatting Infrastructure
- **Funding**: $1.7M
- **Product**: Full-stack 4DGS infrastructure
- **Tech**: Unity plugins, Unreal plugins, WebGPU, Quest 3/Pico standalone playback, cloud 4DGS processing
- **Strategy**: Platform for dynamic volumetric video in real-time on standalone headsets
- **Relevance**: Unity/Unreal plugin development, needs experienced leadership (CTO/Advisor role)

---

## Cross-Company Patterns

### 6 Patterns Every Successful XR/AI Company Shares

1. **Platform-first thinking**: Building platforms (APIs, SDKs, export formats), not products
2. **Open-source as strategic lever**: Publish OSS to drive adoption, monetize enterprise
3. **AI + 3D/Spatial convergence**: AI must understand and generate 3D space
4. **Massive compute investment**: 2GW clusters, 100K sim instances, $1B manufacturing
5. **World-class founding teams**: Oculus, Stanford AI Lab, CMU, Google alumni
6. **Dual-output architecture**: Generate for both human perception AND machine interaction

### Business Model Mix

| Revenue Model | Prevalence | Key Trait |
|---------------|-----------|-----------|
| Usage-based API | 80%+ | Scales with customer usage |
| Enterprise licensing | 70%+ | Higher ASP, SLAs, support |
| Open-source + premium | 50%+ | Community adoption funnel |
| Hardware + software | 30% | Highest lock-in, data moat |
| Defense contracts | ~10% | Multi-year, high value |

**Key stat**: 92% of AI companies use mixed pricing. Flat per-seat SaaS is dead for AI. Target 60-70% gross margins (not 85%+ of traditional SaaS).

### Skills in Highest Demand (56%+ wage premium)

| Skill | Demand Signal | Where |
|-------|--------------|----|
| AI Agent Development | +1,587% demand surge | Every AI company |
| Computer Vision | Core XR/spatial skill | World Labs, Anduril, robotics |
| Python + PyTorch | 55%+ production share | All AI companies |
| Rust | Default for new systems | Anduril, World Labs, infra |
| MLOps / AI Infrastructure | 72% adoption, 9% maturity | Every scaling AI company |
| 3D Gaussian Splatting | New paradigm, few experts | World Labs, Luma AI, Gracia AI |
| Unity + XR SDK | Still dominant cross-platform | XREAL, many XR companies |

### The CTO/VP Engineering Profile (2026)

Based on executive search data:
1. "Bilingual" — P&L to board AND architecture to engineers
2. AI production track record — moving from experimentation to deployment
3. Human-AI team management — only 22% of current leaders can do this
4. Technical breadth — product eng + platform + infra + ML/AI + security
5. Emotional dexterity — leading through continuous disruption
6. Critical thinking — ranked #1 by 73% of talent acquisition leaders (above AI skills at #5)

---

## Key Target Companies (By Fit)

| Company | Why | Role | Approach |
|---------|-----|------|----------|
| **World Labs** | Direct overlap: 3D + AI + Unity pipeline exports | VP/Director Eng | VC intro via a16z network |
| **Luma AI** | Creating 200 roles in London 2026; UE5 plugin relevant | Senior Director | Direct apply + network |
| **Anduril** | Massive hiring; Lattice platform; Rust/Go stack | Staff+ / Principal | Direct apply (US Person req) |
| **Gracia AI** | Early-stage; Unity/Unreal 4DGS plugins; needs leadership | CTO/Advisor | Direct outreach (small team) |
| **Sesame** | Oculus founders; XR hardware + AI; familiar ecosystem | VP Eng | Network via Oculus alumni |
| **Immersed** | Full-stack XR; VR productivity; needs scaling leadership | VP Eng | Direct apply |
| **XREAL** | SDK 3.0 on Unity; Android XR partnership | Technical Advisor | Developer relations angle |

---

## References

- [TechCrunch AI $100M+ 2025](https://techcrunch.com/2026/01/19/here-are-the-49-us-ai-startups-that-have-raised-100m-or-more-in-2025/)
- [TechCrunch AI $100M+ 2026](https://techcrunch.com/2026/02/17/here-are-the-17-us-based-ai-companies-that-have-raised-100m-or-more-in-2026/)
- [Crunchbase Big AI Funding 2025](https://news.crunchbase.com/ai/big-funding-trends-charts-eoy-2025/)
- [Bloomberg AI Startups to Watch](https://www.bloomberg.com/features/2025-top-ai-startups/)
- [a16z - Investing in World Labs](https://a16z.com/announcement/investing-in-world-labs/)
- [Contrary Research - World Labs](https://research.contrary.com/company/world-labs)
- [Contrary Research - Skild AI](https://research.contrary.com/company/skild-ai)
- [Spark GitHub](https://github.com/sparkjsdev/spark)
- [Anduril Lattice SDK](https://developer.anduril.com/guides/concepts/overview)
- [XREAL SDK Docs](https://docs.xreal.com/)
- [Gracia AI Funding](https://aijourn.com/gracia-ai-raises-1-7m-to-build-the-first-full-stack-infrastructure-for-4d-gaussian-splatting/)
- [Sesame $250M](https://techcrunch.com/2025/10/21/sesame-the-conversational-ai-startup-from-oculus-founders-raises-250m/)
- [Infinite Reality $3B](https://www.globenewswire.com/news-release/2025/01/08/3006199/0/en/)
- [Luma AI $900M](https://www.businesswire.com/news/home/20251119678010/en/)
- [Skild AI $1.4B](https://www.businesswire.com/news/home/20260114335623/en/)
- [Robert Half 2026 Tech Hiring](https://www.roberthalf.com/us/en/insights/research/data-reveals-which-technology-roles-are-in-highest-demand)
- [Gigster AI Skills Demand](https://wiki.gigster.com/blog/ai-skills-in-demand-for-enterprise-tech-companies-in-2026)
- [METR AI Productivity Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Monetizely AI SaaS Economics](https://www.getmonetizely.com/blogs/the-economics-of-ai-first-b2b-saas-in-2026)
- [Kellton AI Tech Stack 2026](https://www.kellton.com/kellton-tech-blog/ai-tech-stack-2026)

---

**Tags**: #xr #ai #funding #tech-stacks #business-models #company-profiles #spatial-ai #gaussian-splatting #hiring

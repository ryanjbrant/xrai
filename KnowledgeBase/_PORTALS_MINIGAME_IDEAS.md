# Portals V4 Minigame & Demo Ideas

**Created:** 2026-02-05
**Source:** James Tunick's brainstorm
**Status:** Backlog (defer until core tool ships)

---

## Priority Assessment

> **Warning:** Each minigame is 3-6 months of dedicated work. The list below represents 5-10 years of development. **Pick ONE after the core creative tool works.**

### Recommended First Pick: Holo Pictionary
- Collaborative drawing
- Uses core tech (voice, VFX, multiplayer)
- Naturally social and shareable
- Low complexity vs other ideas

---

## Full Minigame List

| Name | Team | Size | Category | Description |
|------|------|------|----------|-------------|
| **Holo Hawk** | TBD | L | Minigame | Drone/jet battles or Angry Birds XR / swarm battles |
| **Dance Dance XR (DDXR)** | @james, @ryan | M | Minigame | Dance Dance Revolution battles |
| **Holo Pong** | @jacob, @james | M | Art, Music, Minigame | Multiplayer XR paintball pong — hand/voice control, splat paint, make music |
| **Holo Craft** | @jacob, @james | XL | Art, Tool, Minigame | XR Minecraft |
| **Holo Try-On** | @james, @ryan | L | Marketing | Cloth sim-based clothing trying |
| **Holo Fest / Holo Fair** | @james, @ryan | XL | Arts, Tool, Marketing | XR art fairs, film festivals, art shows, urban scale shows |
| **Holo Duel** | @alfredo, @james | L | Art, Storytelling, Minigame | Battle AI genies via magic spells, FortniteXR meets Harry Potter |
| **Holo DJXRo** | @james, @ryan | XL | Music, Minigame | DJ battles / Guitar Hero XR, room or urban scale |
| **Holo Hunt** | @alfredo, @ryan | L | Storytelling, Minigame | Scavenger hunts |
| **Holo Ads** | @alfredo, @ash, @ryan | S | Marketing | Augmented reality advertisements |
| **Holo Hack AIXR** | @jacob, @ryan | L | Code, Minigame | AI NPC battles / AI code battles |
| **Holo Tour / Holo History** | @alfredo, @jacob | M | Education, Storytelling | Historic tours |
| **Holo Museum** | @jacob, @justin | M | Education, Tool | Virtual museums in augmented reality |
| **Holo Chess** | @ben, @justin | M | Minigame | Multiplayer, multi dimensional |
| **Holo BoardXR** | TBD | L | Minigame | Tony Hawk XR, snowboard XR, hoverboard XR with city & room as obstacle course |
| **Holo Pictionary** | TBD | L | Art, Minigame | XR turn-based collaborative painting |
| **EDMR** | TBD | L | Music, Tool | XR Ableton, multiplayer music sequencer, room or urban scale |
| **Pokemon XR / DragonBall XR** | TBD | L | Minigame | Augmented reality versions of Pokemon or DragonBall |
| **DnDXR** | TBD | XL | Role-Playing | Dungeons & Dragons in XR |
| **Mixed Concepts** | TBD | XL | Mix | A mix of art/music jams, code battles, games, and ads |

---

## Size Legend

| Size | Effort | Timeline |
|------|--------|----------|
| S | 2-4 weeks | Quick demo |
| M | 1-2 months | Focused sprint |
| L | 3-4 months | Major feature |
| XL | 6+ months | Product-level |

---

## Category Breakdown

### Competitive/Social (Best for Virality)
- Dance Dance XR
- Holo Pong
- Holo Duel
- Holo Pictionary
- Holo Chess

### Creative Tools (Core Platform)
- Holo Craft
- EDMR
- Holo Museum

### Marketing/Commercial
- Holo Try-On
- Holo Ads
- Holo Fest

### Education/Story
- Holo Tour
- Holo Hunt
- DnDXR

---

## Implementation Notes

### Tech Stack Requirements

| Minigame | Voice | Multiplayer | VFX | Physics | AI |
|----------|-------|-------------|-----|---------|-----|
| Holo Pictionary | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dance Dance XR | ✅ | ✅ | ✅ | ❌ | Pose detection |
| Holo Pong | ✅ | ✅ | ✅ | ✅ | ❌ |
| Holo Duel | ✅ | ✅ | ✅✅ | ❌ | ✅ (genie) |
| Holo Craft | ✅ | ✅ | ✅ | ✅ | Procedural gen |

### Dependencies on Core Platform

All minigames require:
1. ✅ Unity Advanced Composer (Spec 002)
2. ✅ Voice commands working
3. ✅ VFX system
4. ⏳ Multiplayer (Normcore)
5. ⏳ Scene persistence

**Don't start minigames until these ship.**

---

## Recommended Sequence (If Building)

1. **Holo Pictionary** (L) — Uses core tech, naturally social
2. **Holo Pong** (M) — Builds on Pictionary multiplayer
3. **Holo Duel** (L) — Adds AI, builds on VFX
4. **Dance Dance XR** (M) — Separate track, needs pose detection
5. **Holo Craft** (XL) — Only after platform proven

---

## References

- Architecture critique: `_PORTALS_V4_ARCHITECTURE_CRITIQUE.md`
- Core roadmap: `_PORTALS_V4_STRATEGIC_ROADMAP.md`
- Artist roster: `_PORTALS_ARTIST_ROSTER.md`

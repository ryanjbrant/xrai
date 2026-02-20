# XRAI OpenClaw Skill Ecosystem

**Date:** 2026-02-20  
**Source:** Multi-developer OpenClaw setup initiative  
**Scope:** Skill development, token optimization, spec-kit compliance  

---

## Summary

Consolidated 4 spec-kit compliant skills for XRAI/OpenClaw with minimal token footprint (<300 tokens each).

## Skills

| Skill | Purpose | Tokens |
|-------|---------|--------|
| xrai-master | Ecosystem coordinator | 238 |
| xrai-kb | KnowledgeBase manager | 160 |
| openclaw-dev | Gateway/CLI setup | 184 |
| cross-cli | Multi-agent coordination | 152 |

## Architecture

```
xrai-master/
├── xrai-kb (KB management)
├── openclaw-dev (gateway config)
└── cross-cli (agent coord)
```

## Spec-Kit Compliance

- SKILL.mds <300 tokens
- Progressive disclosure
- No extraneous files (README, CHANGELOG, etc.)
- Scripts execute without context load
- References on-demand only

## Global Rules Applied

- Leverage-first (KB before scratch)
- Token optimization
- Compound learning (auto-KB extraction)
- Emergency override (simplify if stalled)

## Auto-Features

- Write access detection → direct push OR fork+PR
- Token counting validation
- Cross-developer compatibility

## Files

`~/.nvm/versions/node/v25.6.1/lib/node_modules/openclaw/skills/`

---

*Total: ~734 tokens across 4 skills*

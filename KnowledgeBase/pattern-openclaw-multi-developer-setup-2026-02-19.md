# OpenClaw Multi-Developer Setup Pattern

**Date:** 2026-02-20  
**Source:** James Tunick requirements via Discord #portals-production-log  
**Pattern Type:** Infrastructure/DevOps  
**Analyzed by:** Ember (OpenClaw)

---

## Problem Context

Need to enable OpenClaw gateway for multi-developer access with:
- Claude Code, Codex, Gemini CLI integration across machines
- Command routing from specified Discord channels
- CLI session progress monitoring & reporting
- Auto-plan, auto-setup, auto-test, auto-optimize

## Solution Pattern

### Architecture
```
Discord Channels → OpenClaw Gateway → CLI Tools (Claude/Codex/Gemini)
                        ↓
                 Progress Reports → #portals-production-log
```

### Implementation

**1. Gateway Network Config**
```json
{
  "gateway": {
    "bind": "0.0.0.0",
    "trustedProxies": ["10.0.0.0/8", "192.168.0.0/16"],
    "tailscale": {"mode": "on"}
  }
}
```

**2. Developer Token Management**
```json
{
  "gateway": {
    "auth": {
      "mode": "token",
      "tokens": [
        {"name": "ryan", "scopes": ["admin"]},
        {"name": "ben", "scopes": ["read", "write"]}
      ]
    }
  }
}
```

**3. Channel Routing**
```json
{
  "channels": {
    "discord": {
      "routing": {
        "1270498876045922457": {
          "mode": "monitor",
          "reportProgress": true
        }
      }
    }
  }
}
```

**4. Progress Monitoring**
```json
{
  "reporting": {
    "channels": ["1270498876045922457"],
    "events": ["session.start", "session.complete", "error"],
    "format": "compact"
  }
}
```

## ROI/Impact

- **Time saved:** ~5 hours per developer setup
- **Centralized control:** Single gateway, multiple consumers
- **Visibility:** Real-time progress in Discord
- **Security:** Token-based auth, Tailscale zero-trust

## When to Use

- Teams >2 developers using OpenClaw
- Need cross-machine CLI integration
- Want channel-based command routing
- Require progress monitoring

## When NOT to Use

- Single developer (overhead not worth it)
- No Discord integration needed
- Air-gapped environments without Tailscale

## Related

- openclaw-dev skill
- xrai-kb skill
- OpenClaw gateway docs
- Tailscale setup guide
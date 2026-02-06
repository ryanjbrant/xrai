# Gemini API Key Management

**Last Updated**: 2026-02-06
**Source**: Research from Portals v4 voice commands debugging

## Key Facts

| Condition | Behavior |
|-----------|----------|
| Normal usage | Keys remain valid indefinitely |
| Account inactivity >30 days | Key may be disabled |
| Key manually deleted/revoked | Immediate invalidation |
| Project deleted/suspended | Key becomes invalid |

## Rotation Schedule

- **Rotate every 80 days** (before 90-day inactivity threshold)
- Track creation date in `.env` comments
- Get new key: https://aistudio.google.com/app/apikey

## Best Practices

1. **Restrict API key** - Limit to specific IPs and Gemini API only
2. **Use environment variables** - Never hardcode in source
3. **Track creation date** - Add comment in .env with date
4. **Server-side proxy** - Use Firebase Functions, not client-side keys

## Long-term Migration Path

| Method | Security | Complexity |
|--------|----------|------------|
| API Key (current) | Low | Low |
| Vertex AI + ADC | High | Medium |
| Workload Identity | Highest | Higher |

**Recommended**: Migrate to Vertex AI with Application Default Credentials (ADC) for auto-refreshing tokens.

## Quick Fix for "API Key Expired" Error

```bash
# 1. Get new key from Google AI Studio
open https://aistudio.google.com/app/apikey

# 2. Update .env
EXPO_PUBLIC_GEMINI_API_KEY=new_key_here

# 3. Restart Metro with clear cache
npx expo start --dev-client --clear

# 4. Force-quit and relaunch app on device
```

## Example .env Configuration

```bash
# AI Services
# Gemini API Key - Rotate every 80 days (created: 2026-02-06)
# Get new key: https://aistudio.google.com/app/apikey
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
```

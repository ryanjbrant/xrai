# Expo Environment Variable Debugging

**Last Updated**: 2026-02-06

## Key Fact
`EXPO_PUBLIC_*` variables are **baked into JS bundle at build time**, not runtime.

## Quick Debug for Env Changes

1. **Verify key works**: `curl` test API directly
2. **Clear ALL caches**:
   ```bash
   pkill -f "expo start"
   rm -rf node_modules/.cache/metro /tmp/metro-*
   npx expo start --dev-client --clear
   ```
3. **If still failing**: Full native rebuild
4. **Use tunnel mode** for remote device: `--tunnel`

## What Doesn't Work
- Just restarting Metro
- Force-quitting app alone
- `--clear` flag alone without killing Metro first

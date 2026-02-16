# Git Hooks and Environment Variables

**Updated**: 2026-02-13 | **Confidence**: High | **Source**: portals_main recurring fix (3 occurrences)

## Core Problem

Git hooks run in a **non-interactive, non-login shell** (`/usr/bin/env bash`). They do NOT:
- Inherit `export`ed variables from the parent terminal session
- Source `~/.zshrc` (not zsh)
- Source `~/.bash_profile` (not login shell)
- Have access to macOS Keychain environment variables

This causes silent failures when hooks depend on env vars like API keys or webhook URLs.

## Pattern: File-Based Resolution

Scripts called from git hooks must read secrets from files, not environment:

```bash
read_var_from_file() {
  local file="$1" var="$2"
  [ -f "$file" ] || return 1
  grep -Eo "${var}=\"[^\"]+\"" "$file" | head -1 | sed -E 's/.*="([^"]+)"/\1/'
}

# Check shell profiles (script parses the text, not the shell)
for f in "$HOME/.zshrc" "$HOME/.zshenv" "$HOME/.zprofile" "$HOME/.bash_profile" "$HOME/.profile"; do
  [ -z "${MY_VAR:-}" ] && MY_VAR=$(read_var_from_file "$f" "MY_VAR" || true)
done

# Fallback: project .env
if [ -z "${MY_VAR:-}" ]; then
  PROJECT_ENV="$(git rev-parse --show-toplevel 2>/dev/null)/.env"
  [ -f "$PROJECT_ENV" ] && MY_VAR=$(read_var_from_file "$PROJECT_ENV" "MY_VAR" || true)
fi
```

## Anti-Patterns

```bash
# BAD: Only works in the terminal that ran export
export DISCORD_COMMITS_WEBHOOK="https://..."
# Git hooks in other shells won't see this

# BAD: Assuming ~/.zshrc is sourced
source ~/.zshrc  # Fails if hook runs under bash, or if zshrc has interactive-only code

# GOOD: Parse the file text directly
grep -Eo 'DISCORD_COMMITS_WEBHOOK="[^"]+"' ~/.zshrc | sed -E 's/.*="([^"]+)"/\1/'
```

## Hook Overwrite Prevention

Git hook files get overwritten by tooling installers (Husky, codex skills, etc.). Protect critical lines:
1. Put high-priority hooks FIRST in the file
2. Use `|| true` guards so failures don't block commits
3. After installing new hook tools, verify:
   ```bash
   grep -c "my_critical_hook" .githooks/post-commit  # Should return >= 1
   ```

## Portals-Specific: Discord Webhook

The `DISCORD_COMMITS_WEBHOOK` URL must be in `~/.zshrc` as an export line:
```bash
export DISCORD_COMMITS_WEBHOOK="https://discord.com/api/webhooks/..."
```

The script at `~/.local/bin/post_commit_to_discord.sh` greps this from the file. It also checks `.zshenv`, `.zprofile`, `.bash_profile`, `.profile`, and the project `.env`.

## Tags

`git-hooks` `environment-variables` `post-commit` `discord-webhook` `shell-profiles`

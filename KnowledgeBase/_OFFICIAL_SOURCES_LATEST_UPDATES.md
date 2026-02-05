# Official Sources + Latest Updates (AI Toolchain)

**Last checked**: 2026-02-05
**Scope**: Codex, Claude Code, Gemini CLI, MCP, Unity MCP

---

## Codex (OpenAI)

**Docs**
- CLI: https://developers.openai.com/codex/cli
- Config basics: https://developers.openai.com/codex/config-basic
- Config reference: https://developers.openai.com/codex/config-reference
- MCP: https://developers.openai.com/codex/mcp
- Changelog: https://developers.openai.com/codex/changelog
- OpenAI Docs MCP: https://developers.openai.com/resources/docs-mcp

**Recent notes**
- Team Config enables shared `.codex/` project layers (config, rules, skills).
- Config supports `model_reasoning_effort`, `model_reasoning_summary`, and `model_verbosity` (speed vs verbosity tradeoffs).
- `shell_snapshot` speeds repeated shell calls by caching results.
- MCP servers can be configured in user or project `config.toml`, shared across CLI + IDE.

---

## Claude Code (Anthropic)

**Docs**
- Getting started: https://docs.anthropic.com/en/docs/claude-code/getting-started
- Hooks: https://docs.anthropic.com/en/docs/claude-code/hooks
- MCP: https://docs.anthropic.com/en/docs/claude-code/mcp
- GitHub: https://github.com/anthropics/claude-code

**Recent notes**
- MCP integrations supported; Claude Code can also run as an MCP server.
- Official installs support npm/Homebrew/OS-specific scripts (Node 18+).
 - Hooks support SessionStart/Stop and can be used for reminders (not a substitute for repo docs).

---

## Gemini CLI (Google)

**Docs**
- Overview: https://geminicli.com/docs/
- CLI reference: https://geminicli.com/docs/cli/
- GitHub: https://github.com/google-gemini/gemini-cli

**Recent notes**
- Preview weekly, stable weekly, nightly daily release cadence.
- MCP support and 1M token context model are documented in the repo.

---

## MCP (Model Context Protocol)

- Spec & org: https://github.com/modelcontextprotocol

---

## Unity MCP

- Server repo: https://github.com/CoplayDev/unity-mcp

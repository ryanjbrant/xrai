# Gemini CLI: MCP Server Patterns & Configuration

**Source:** https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html
**Updated:** 2026-02-09

## 1. Transport Mechanisms

Gemini CLI supports three primary transport types for MCP servers:
- **Stdio:** (Default) Spawns a local subprocess and communicates via standard input/output.
- **SSE (Server-Sent Events):** Connects to remote HTTP endpoints.
- **Streamable HTTP:** High-performance HTTP streaming for remote servers.

## 2. Configuration Schema (settings.json)

### Global Settings (`mcp` object)
- `mcp.allowed`: Allowlist of server names.
- `mcp.excluded`: Denylist of server names.
- `mcp.serverCommand`: Default command template.

### Server-Specific Settings (`mcpServers` object)
```json
{
  "server-name": {
    "command": "npm",
    "args": ["run", "mcp"],
    "cwd": "/path/to/server",
    "env": { "API_KEY": "$KEY" },
    "timeout": 600000,
    "trust": false,
    "includeTools": ["tool1"],
    "excludeTools": ["tool2"]
  }
}
```

## 3. Security & Trust

- **The `trust` Flag:** Setting `trust: true` bypasses all tool call confirmations for that server. **Only use for fully controlled local servers.**
- **OAuth 2.0:** Native support for remote servers via `dynamic_discovery`, `google_credentials` (ADC), or `service_account_impersonation`.
- **Sandbox Isolation:** Ensure MCP server binaries are accessible if running Gemini CLI in a sandbox.

## 4. Execution Patterns

- **Discovery Logic:** CLI establishes connections, fetches definitions, validates schemas, and registers in a global registry.
- **Conflict Resolution:** First server to register a tool name wins the unprefixed name. Subsequent servers are prefixed: `serverName__toolName`.
- **Rich Content:** Support for `CallToolResult` which can return text, images, and audio in a single response.
- **Slash Commands:** MCP servers can expose predefined prompts as native slash commands (e.g. `/analyze`).

## 5. Troubleshooting & Commands

- `gemini mcp list`: View active servers and their status.
- `gemini mcp add <name>`: Interactive server addition.
- `gemini mcp remove <name>`: Remove a server configuration.
- `/stats`: Monitor request counts and token usage summaries.

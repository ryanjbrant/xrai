# AI Chat History Locations

> Cross-tool long-term memory index. Use these paths to search past sessions for context, decisions, and code that wasn't persisted to files.
> Last updated: 2026-02-12

---

## Claude Code

| Item | Path | Size |
|------|------|------|
| **Session transcripts** | `~/.claude/projects/<project-hash>/*.jsonl` | ~3.1GB total |
| **Session memories** | `~/.claude/session_memories/` | Per-project markdown |
| **Checkpoints** | `<project>/.claude/checkpoints/` | Manual save points |
| **Settings** | `~/.claude/settings.json` | Global config |
| **Project settings** | `<project>/.claude/settings.local.json` | Per-project config |

**Key project hashes:**
- `portals_main` → `-Users-jamestunick-Documents-GitHub-portals-main/`
- `Unity-XR-AI` → `-Users-jamestunick-Documents-GitHub-Unity-XR-AI/`

**Search example:**
```bash
# Find sessions mentioning a topic
rg "mermaid" ~/.claude/projects/-Users-jamestunick-Documents-GitHub-portals-main/ --glob "*.jsonl" -l
```

---

## Gemini CLI

| Item | Path | Size |
|------|------|------|
| **Chat sessions** | `~/.gemini/tmp/<project-hash>/chats/session-*.json` | ~318MB total |
| **Session memories** | `~/.gemini/session_memories/*.md` | Daily summaries (often empty) |
| **Settings** | `~/.gemini/settings.json` | Global config |
| **Extensions** | `~/.gemini/extensions/` | context7, chrome-devtools-mcp |
| **Policies** | `~/.gemini/policies/auto-saved.toml` | Permission policies |

**Key project hashes (by size):**
- `2c215fe...` — 99 sessions, 298MB (main project workspace)
- `ae3240e...` — 28 sessions, 20MB (KB/visualization workspace)

**Chat JSON format:** `{sessionId, projectHash, startTime, lastUpdated, messages: [{role, parts: [{text}]}]}`

**Search example:**
```bash
# Binary search across all Gemini sessions
rg "kb-cli" ~/.gemini/tmp/*/chats/ --glob "*.json" -l
```

---

## Codex CLI

| Item | Path | Size |
|------|------|------|
| **Session history** | `~/.codex/history.jsonl` | Conversation log |
| **Archived sessions** | `~/.codex/archived_sessions/` | Past sessions |
| **Sessions** | `~/.codex/sessions/` | Active sessions |
| **Shell snapshots** | `~/.codex/shell_snapshots/` | Command history |
| **Config** | `~/.codex/config.toml` | Settings |
| **Instructions** | `~/.codex/instructions.md` | System prompt |
| **Skills** | `~/.codex/skills/` | Reusable skills |
| **SQLite DB** | `~/.codex/sqlite/` | Indexed data |
| **Knowledgebase** | `~/.codex/knowledgebase/` | Codex-specific KB |

---

## Windsurf (Cascade + Extensions)

| Item | Path |
|------|------|
| **Cascade state DB** | `~/Library/Application Support/Windsurf/User/globalStorage/state.vscdb` (SQLite, `ItemTable`) |
| **Cascade session index** | Key: `chat.ChatSessionStore.index` in state.vscdb |
| **Roo Cline tasks** | `~/Library/Application Support/Windsurf/User/globalStorage/rooveterinaryinc.roo-cline/tasks/*/api_conversation_history.json` |
| **Claude Dev (Cline) tasks** | `~/Library/Application Support/Windsurf/User/globalStorage/saoudrizwan.claude-dev/tasks/*/api_conversation_history.json` |
| **Kilo Code tasks** | `~/Library/Application Support/Windsurf/User/globalStorage/kilocode.kilo-code/tasks/*/api_conversation_history.json` |
| **CodeViz graphs** | `~/Library/Application Support/Windsurf/User/workspaceStorage/*/CodeViz.codeviz/graphs/history.json` |
| **Config** | `~/.windsurf/` |
| **Rules** | `~/.windsurf/rules/` |
| **MCP config** | `~/.windsurf/mcp.json` |
| **Mermaid Chart ext** | `~/.windsurf/extensions/mermaidchart.vscode-mermaid-chart-*` |
| **Performance logs** | `~/.windsurf/performance-logs/` |
| **Windsurf logs** | `~/Library/Application Support/Windsurf/logs/` |

**Chat JSON format (Roo Cline/Kilo Code):** `[{role, content: [{type, text}]}]`

**Known sessions with kb-cli/visualization work:**
- Kilo Code `019c4b28` — kb-cli creation (147KB, 24 msgs, Feb 11 2026)
- Kilo Code `019c4ba8` — Claude Code architecture analysis (89KB)
- Roo Cline `019c4b1b` — visualization work (209KB)

**Search example:**
```bash
# Search all Windsurf extension conversations
rg "KEYWORD" ~/Library/Application\ Support/Windsurf/User/globalStorage/*/tasks/ --glob "*.json" -l
```

---

## Cursor

| Item | Path |
|------|------|
| **App data** | `~/Library/Application Support/Cursor/` |
| **Config** | `~/.cursor/` |
| **MCP config** | `~/.cursor/mcp.json` |

---

## Rider (JetBrains)

| Item | Path |
|------|------|
| **AI settings** | `~/Library/Application Support/JetBrains/Rider*/options/aiPluginSettings.xml` |
| **Config** | `~/Library/Application Support/JetBrains/Rider*/` |
| **Logs** | `~/Library/Logs/JetBrains/Rider*/` |
| **Cline plugin** | `~/Library/Application Support/JetBrains/IntelliJIdea*/plugins/cline/` |
| **Gemini plugin** | `~/Library/Application Support/JetBrains/IntelliJIdea*/plugins/gemini/` |
| **MCP** | Via JetBrains MCP plugin |

**Versions found:** Rider 2025.1, 2025.2, 2025.3

---

## Cross-Tool Search Patterns

```bash
# Search ALL AI tool histories for a keyword
rg "KEYWORD" ~/.claude/projects/ --glob "*.jsonl" -l
rg "KEYWORD" ~/.gemini/tmp/*/chats/ --glob "*.json" -l
rg "KEYWORD" ~/.codex/history.jsonl
rg "KEYWORD" ~/.codex/archived_sessions/ --glob "*.jsonl" -l
rg "KEYWORD" ~/Library/Application\ Support/Windsurf/User/globalStorage/*/tasks/ --glob "*.json" -l

# Find Gemini sessions by date
ls -lt ~/.gemini/tmp/*/chats/session-2026-02-11*.json

# Find Windsurf extension tasks by date (sort by modification time)
ls -lt ~/Library/Application\ Support/Windsurf/User/globalStorage/kilocode.kilo-code/tasks/*/api_conversation_history.json

# Read a specific Claude Code session transcript
# (files are JSONL - one JSON object per line)
cat ~/.claude/projects/<hash>/<session-id>.jsonl | python3 -c "
import sys, json
for line in sys.stdin:
    msg = json.loads(line)
    role = msg.get('role','')
    text = msg.get('content','')[:200] if isinstance(msg.get('content'), str) else ''
    if text: print(f'[{role}] {text}')
"

# Search Windsurf Cascade state DB
sqlite3 ~/Library/Application\ Support/Windsurf/User/globalStorage/state.vscdb \
  "SELECT key FROM ItemTable WHERE key LIKE '%cascade%' OR key LIKE '%chat%';"
```

---

## Key Insight: Cross-Tool Knowledge Loss

Gemini CLI session memories (`~/.gemini/session_memories/`) are mostly empty timestamps.
Discoveries made in one tool often don't persist to shared files (KB, GLOBAL_RULES).

**Mitigation:** After significant work in any tool, persist learnings to:
1. `~/KnowledgeBase/LEARNING_LOG.md` (discoveries)
2. Project `CLAUDE.md` (rules that should always load)
3. `~/GLOBAL_RULES.md` (universal rules)
4. Git commit (the only durable cross-tool store)

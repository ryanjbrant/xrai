# Gemini CLI: Best Practices & Patterns

**Updated:** 2026-02-09

## 1. Context Management (GEMINI.md)

### Hierarchy & Precedence
Gemini CLI loads context files in this order (specific overrides general):
1. **Global:** `~/.gemini/GEMINI.md` (All projects)
2. **Project Root:** `./GEMINI.md` (Repository specific)
3. **Directory:** `./subdir/GEMINI.md` (Component specific)

### Optimization Strategy
- **Global:** Define shared tool hygiene (e.g., "Always run tests"), API key management, and CLI preferences.
- **Project:** Define build commands, architectural style, and "Do Not" lists specific to the codebase.
- **Sub-directory:** Use sparingly for isolated modules (e.g., legacy code rules).

## 2. Configuration (settings.json)

### Locations
- **User:** `~/.gemini/settings.json` (Personal preferences, model selection)
- **System:** `/etc/gemini-cli/system-defaults.json` (Enterprise policy)

### Key Performance Flags
- **Token Caching:** Enable if available (implied by docs) to reduce cost/latency on large contexts.
- **Model Selection:** Configure default models in `settings.json` to avoid manual selection per session.
- **Excluded Tools:** Use `mcp.excluded` to block heavy/irrelevant tools from loading, speeding up the context window.

## 3. Speed & Efficiency

- **Token Reduction:** Use `.geminiignore` (or standard `.gitignore`) to prevent the CLI from indexing massive build artifacts.
- **Checkpointing:** Use checkpoints before major refactors to save RAG/Context processing time on resume.
- **Tool Chaining:** Prefer tools that return rich content (e.g., file reads) directly rather than asking the user to copy-paste.

## 4. Integration

- **Env Vars:** Use `.env` for project secrets; Gemini CLI respects them but prioritize `settings.json` for structural config.
- **Extensions:** Use `contextFileName` in custom extensions to force-load specific  files for specialized tasks.

## Fast Command Execution (2026-02-09)

**Problem:** Gemini CLI slow, requires approval every time

**Solution:**
```bash
# Use wrapper (auto-approve)
~/bin/g "your prompt"

# Or direct flags
gemini -y "prompt"                    # Interactive + auto-approve
gemini --approval-mode yolo "prompt"  # Full auto (best)
gemini -p "prompt" -y                 # Non-interactive + auto

# Parallel execution
gemini -p "cmd1" -y & gemini -p "cmd2" -y & wait
```

**Settings (already configured):**
- `tools.autoAccept: true`
- `security.enablePermanentToolApproval: true`

**Note:** These settings work AFTER first approval. Use `-y` or wrapper to skip first prompt.

## Speed Optimization (2026-02-09)

### Model Selection
- **Default**: `gemini-2.0-flash-exp` (fastest, free)
- **Settings**: Added to `~/.gemini/settings.json`
- **Override**: Use `-m` flag per-command

### Parallel Execution
```bash
# Multiple commands in parallel
~/bin/g -p "task 1" & ~/bin/g -p "task 2" & wait

# Background tasks
~/bin/g -p "long task" &
```

### Wrappers
- `~/bin/g` - Auto-approve
- `~/bin/gfast` - flash-exp + auto-approve
- `~/bin/gr` - Resume + auto-approve

### Bottlenecks
- MCP server startup: ~2s per session
- Context loading: Depends on CLAUDE.md size
- Tool execution: Network-bound (Unity MCP)

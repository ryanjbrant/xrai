# Claude Code System Prompt Analysis

**Source**: https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/tree/main/Anthropic/Claude%20Code
**Last Updated**: 2026-02-07

## Overview

Analysis of Claude Code's system prompt and tool definitions, extracting patterns for designing effective AI agent systems.

---

## Communication Design Patterns

### Conciseness Rules

| Rule | Implementation |
|------|----------------|
| **Length limit** | Under 4 lines unless detail requested |
| **No preamble** | Direct answers, skip "I'll help you with..." |
| **No postamble** | Skip "Let me know if you need anything else" |
| **No emojis** | Unless explicitly requested |
| **Format for CLI** | Monospace-optimized markdown |

### Citation Pattern

```
file_path:line_number
```
Enables IDE navigation from conversation output.

---

## Tool Architecture

### 12 Core Tools in 3 Categories

**Task Management**:
| Tool | Purpose |
|------|---------|
| `Task` | Launch autonomous sub-agents |
| `Bash` | Shell execution (600s max timeout) |
| `TodoWrite` | Structured task tracking |

**File Operations**:
| Tool | Purpose |
|------|---------|
| `Read` | File contents (text, images, PDF, notebooks) |
| `Write` | Create/overwrite files |
| `Edit` | Single find-replace |
| `MultiEdit` | Batch edits (atomic) |
| `Glob` | Pattern-based file matching |
| `Grep` | Ripgrep-powered search |

**External**:
| Tool | Purpose |
|------|---------|
| `WebFetch` | Fetch + AI-analyze web content |
| `WebSearch` | Internet search with domain filters |

### Tool Design Principles

1. **Absolute paths only** - No relative path ambiguity
2. **Pre-requisite chains** - Edit requires prior Read
3. **Atomic batching** - MultiEdit all-or-nothing
4. **Hierarchical complexity** - Simple tools → Agent for complex
5. **Background execution** - Long ops run async with monitoring

---

## Task Management System

### TodoWrite Pattern

```
1. Create todos at task start
2. Mark in_progress when starting each
3. Mark completed IMMEDIATELY when done
4. Never batch completions
5. Add new todos as discovered
```

**Key insight**: Visibility into progress is prioritized over efficiency.

### Agent Spawning (Task Tool)

| Agent Type | Use Case |
|------------|----------|
| `general-purpose` | Multi-step research, code search |
| `statusline-setup` | Configure status display |
| `output-style-setup` | Set verbosity preferences |

**Stateless design**: Agents receive complete prompts, no multi-turn context.

---

## Safety Architecture

### Security Constraints

| Allowed | Disallowed |
|---------|------------|
| Security analysis | Malicious code creation |
| Detection rules | Code for harmful purposes |
| Vulnerability explanations | Offensive tooling |
| Defensive tools | Attack automation |

### Git Safety Protocol

```
- NEVER update git config
- NEVER use --force, hard reset without explicit request
- NEVER skip hooks (--no-verify)
- NEVER commit unless explicitly asked
- ALWAYS new commits (no --amend unless requested)
```

### Hook Integration

> "Treat hook feedback as user input"

Hooks can block operations; agent must adapt or ask user to check configuration.

---

## Proactivity Balance

### Do vs Don't

| DO | DON'T |
|----|-------|
| Act when requested | Surprise with unexpected actions |
| Answer questions first | Jump to implementation |
| Explain before acting | Commit without asking |
| Request clarification | Guess at ambiguous requests |

### Key Quote

> "Answer the user's question before jumping into implementation"

---

## Code Generation Rules

### Style Constraints

| Rule | Rationale |
|------|-----------|
| No comments unless requested | Keep code clean |
| Follow existing conventions | Consistency |
| Verify libraries exist | Avoid hallucination |
| No secrets in code/commits | Security |
| Run lint/typecheck first | Quality gates |

### Edit Workflow

```
1. Read file first (required)
2. Identify exact string to replace
3. Use Edit with old_string/new_string
4. Verify change with Read
```

---

## Batch Operation Patterns

### Parallel Execution

```
// Independent operations - batch in single message
[Read file1, Read file2, Grep pattern] → parallel

// Dependent operations - sequential
[Read file] → [Edit file] → [Verify] → sequential
```

### MultiEdit Atomicity

All edits in a MultiEdit either:
- All succeed (applied)
- All fail (none applied)

No partial states.

---

## Search Hierarchy

| Complexity | Tool | Example |
|------------|------|---------|
| Simple pattern | `Glob` | Find all `*.ts` files |
| Content search | `Grep` | Find "TODO" in codebase |
| Complex/iterative | `Task` agent | "How does auth work?" |

**Rule**: Use Task agent for open-ended exploration requiring multiple rounds.

---

## Key Learnings for Agent Design

### 1. Explicit State Management
- Track task status visibly
- Never assume completion
- Immediate status updates

### 2. Tool Composition
- Simple tools as primitives
- Agents for complex orchestration
- Clear escalation path

### 3. Safety by Default
- Require explicit consent for destructive ops
- Chain pre-requisites (Read before Edit)
- Fail safely (atomic batches)

### 4. Context Efficiency
- Concise communication
- Batch independent operations
- Delegate to agents to reduce main context

### 5. User Trust
- Transparent progress
- No surprises
- Ask before major actions

---

## Applying to Custom Agents

### Prompt Structure Template

```
1. Identity & Purpose (1-2 sentences)
2. Communication style rules
3. Tool usage guidelines
4. Safety constraints
5. Proactivity boundaries
6. Domain-specific rules
```

### Tool Definition Template

```json
{
  "name": "ToolName",
  "description": "What + When to use + When NOT to use",
  "parameters": {
    "required": ["explicit_params"],
    "optional": ["with_defaults"]
  },
  "constraints": ["pre-requisites", "limitations"]
}
```

---

**Tags**: #claude-code #system-prompt #agent-design #tool-architecture #safety-patterns

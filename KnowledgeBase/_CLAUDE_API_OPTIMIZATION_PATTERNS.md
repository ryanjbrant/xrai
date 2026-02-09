# Claude Code CLI Patterns (2026-02-08)

**Sources**: Official Anthropic docs + anthropic-cookbook + agentskills.io
**Applies to**: Claude Code CLI (Pro account, not API)

## Quick Reference

**Skills**: Progressive disclosure architecture (metadata → full instructions → resources on demand)
**Tool Selection**: Zero-token → Skills → Direct tools → Task agents → In-context
**Model Routing**: Opus (complex) → Sonnet (standard) → Haiku (mechanical)
**Latency**: Streaming built-in, parallel tool calls, model selection

---

## Skills Architecture (Official Pattern)

### Definition
Skills = folders with `SKILL.md` containing metadata + instructions + optional scripts/assets.

### Structure
```
my-skill/
├── SKILL.md (required - frontmatter + instructions)
├── scripts/ (optional - executable code)
├── references/ (optional - docs)
└── assets/ (optional - templates, resources)
```

### Progressive Disclosure
1. **Startup**: Load name + description only
2. **Activation**: Load full SKILL.md when relevant
3. **Execution**: Load referenced files/scripts on demand

### When to Use Skills
- Adding new capabilities to agents
- Packaging domain expertise
- Bundling workflows (5+ tool calls)
- After 3+ uses of same pattern

### Frontmatter (Required)
```yaml
---
name: skill-name
description: When to use this skill
---
```

### Optional Frontmatter
```yaml
---
name: skill-name
description: When to use
disable-model-invocation: true  # User-only invocation
user-invocable: false           # Claude-only invocation
allowed-tools: Read, Grep       # Pre-approved tools
model: haiku                    # Model override
context: fork                   # Run in subagent
agent: general-purpose          # Subagent type
---
```

### Security Warning
Only install skills from trusted sources. Malicious skills can introduce vulnerabilities.

---

## Tool Selection (Claude Code CLI)

### Hierarchy (Prefer Higher)
1. **Zero-token**: `kb search`, `kbfix`, shell commands
2. **Skills**: `~/.claude/skills/` - Reusable, zero cost after creation
3. **Direct tools**: Read, Edit, Grep (parallel when independent)
4. **Task agents**: Multi-step mechanical (`model: "haiku"`)
5. **In-context**: Only when above don't apply

### Build Skill Triggers
- 3+ repetitions of same pattern
- 5+ tool calls for workflow
- >20% token savings
- >2x faster execution

---

## Model Routing (Claude Code)

| Task Type | Model | Why |
|-----------|-------|-----|
| Complex reasoning, architecture | Opus | Highest capability |
| Standard implementation | Sonnet | Balanced |
| Mechanical, lookups, grep | Haiku | Fast, cheap |

Switch to Haiku when >80% token budget used.

---

## Claude 4.6 Prompting Patterns

### Core Changes vs Previous Models
- **More explicit**: "Create dashboard with max features" not "Create dashboard"
- **Provide context**: "TTS reads this, no ellipses" not "No ellipses"
- **Examples matter**: Claude 4.6 pays close attention to ALL details

### Tool Usage
**Default to action** (if you want proactive):
```
Implement changes rather than suggesting. Infer action and proceed.
Use tools to discover missing details instead of asking.
```

**Conservative** (if you want hesitation):
```
Don't jump into implementation unless instructed. When ambiguous, provide info and recommendations rather than taking action.
```

### Autonomy vs Safety
**Confirm before destructive**:
```
Take local, reversible actions freely (edit files, run tests).
Ask before: delete files, force push, drop tables, send messages.
```

### Reduce Overthinking
```
Choose approach and commit. Avoid revisiting decisions unless new info contradicts reasoning.
```

Or lower `effort` in API calls (CLI may not expose this).

### Control Output Format
**Tell what TO do**:
- ❌ "No markdown" → ✅ "Use prose paragraphs"

**Use XML tags**:
```
Write prose in <smoothly_flowing_prose_paragraphs> tags.
```

### Parallel Tool Execution
```
<use_parallel_tool_calls>
If multiple tools have no dependencies, execute in parallel.
Only sequential when parameters depend on previous results.
</use_parallel_tool_calls>
```

### Multi-Context Window Workflows
1. **First window**: Create framework (tests, setup scripts)
2. **Future windows**: Iterate on todo list
3. **Structured tests**: `tests.json` for tracking
4. **QoL tools**: `init.sh` for servers/linters
5. **State management**: Use git, structured JSON, unstructured notes

### Minimize Hallucinations
```
<investigate_before_answering>
Never speculate about code you haven't opened. If user references file, READ it first.
Investigate before answering. Give grounded, hallucination-free answers.
</investigate_before_answering>
```

---

## Anthropic Cookbook Patterns

### Sub-Agents Pattern
```python
# Route simple → Haiku, complex → Opus
def route_task(complexity):
    if complexity == "simple":
        return create_message(model="haiku", ...)
    else:
        return create_message(model="opus", ...)
```

### Tool Use Pattern
```python
# Function calling loop
while True:
    response = client.messages.create(model, messages, tools)
    if response.stop_reason == "end_turn":
        return response
    # Process tool calls, add results to messages
```

### JSON Mode
Guaranteed structured output for CLI parsing.

---

## Application to Portals Main

### What Applies (CLI-Native)
- ✅ Skills architecture - Build after 3+ uses
- ✅ Tool selection hierarchy - Zero-token → Skills → Direct → Task agents
- ✅ Model routing - Haiku for mechanical, Sonnet/Opus for complex
- ✅ Parallel tool calls - Already doing
- ✅ Claude 4.6 prompting - Explicit instructions, investigate-first

### What Doesn't Apply (API-Only)
- ❌ Prompt caching specifics (cache_control) - CLI handles internally
- ❌ API token field breakdowns - Not exposed in CLI
- ❌ Direct API optimization - Use skills/agents instead

### Recommended Updates
**To CLAUDE.md** (already in GLOBAL_RULES):
- Tool selection hierarchy
- Build skill after 3+ uses
- Parallel tool calls when independent
- Investigate before answering

**Skills to Build** (after proving pattern):
1. unity-status (built, needs testing)
2. verify-all (if used 3+ times)
3. techdebt (if used 3+ times)

**Don't Build Yet**:
- 10+ skills (premature)
- Complex skills with many files (start simple)
- Skills for one-time tasks (use direct tools)

---

## Official Validation

**From Anthropic**:
- Skills = official Claude Code feature
- Progressive disclosure = correct architecture
- Build after identifying gaps through real tasks
- Start simple, iterate with Claude's help

**From agentskills.io**:
- Skills = lightweight, open format
- Portable, self-documenting, extensible
- No restrictions on SKILL.md structure

**From anthropic-cookbook**:
- Sub-agents with Haiku = standard pattern
- Tool use loops = core architecture
- JSON mode for structured output

---

## Summary

**Keep doing**:
- Zero-token tools first (kb, shell)
- Task agents with Haiku
- Parallel tool calls
- Build skills after 3+ proven uses

**Stop doing**:
- Building skills before proving pattern
- API-specific optimization (not applicable)
- Complex frameworks before validation

**Test next**:
- unity-status skill in real workflow
- Measure actual token savings
- Build 2nd skill only if 1st proves valuable

# Claude API Optimization Patterns (2026-02-08)

**Sources**:
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices

## Quick Reference

**Prompt Caching**: Reduce costs/latency by caching static prompt prefixes (tools, system, large context)
**Latency Reduction**: Model selection, streaming, prompt optimization, parallel tool calls
**Prompting Best Practices**: Claude 4.6-specific patterns for explicit instructions, tool usage, autonomy

---

## Prompt Caching

### Core Concept
Cache static prefix once, reuse at 90% cost reduction (10% of base input token price). 5-min TTL default (1-hr available at 2x cost).

**Minimum cache size**:
- Opus 4.6/4.5: 4096 tokens
- Sonnet 4.5/4/3.7: 1024 tokens
- Haiku 4.5: 4096 tokens
- Haiku 3.5/3: 2048 tokens

### Cache Control Placement
```json
{
  "system": [
    {"type": "text", "text": "Static instructions"},
    {"type": "text", "text": "Large context", "cache_control": {"type": "ephemeral"}}
  ],
  "tools": [
    {"name": "tool1", ...},
    {"name": "tool2", ..., "cache_control": {"type": "ephemeral"}}
  ],
  "messages": [
    {"role": "user", "content": "Query"},
    {"role": "assistant", "content": "Response"},
    {"role": "user", "content": [
      {"type": "text", "text": "Follow-up", "cache_control": {"type": "ephemeral"}}
    ]}
  ]
}
```

**Hierarchy**: tools → system → messages (each level builds on previous)

### Token Usage Fields
```
total_input = cache_read_input_tokens + cache_creation_input_tokens + input_tokens
```
- `cache_read_input_tokens`: Retrieved from cache (before breakpoints)
- `cache_creation_input_tokens`: Written to cache (at breakpoints)
- `input_tokens`: AFTER last breakpoint (not cached)

### Pricing (per MTok)
| Model | Base Input | Cache Write (5m) | Cache Write (1h) | Cache Read |
|-------|-----------|-----------------|-----------------|------------|
| Opus 4.6 | $5 | $6.25 | $10 | $0.50 |
| Sonnet 4.5 | $3 | $3.75 | $6 | $0.30 |
| Haiku 4.5 | $1 | $1.25 | $2 | $0.10 |

### Automatic Prefix Checking
- Set ONE breakpoint at end of static content
- System checks backwards up to 20 blocks for longest match
- If content >20 blocks before breakpoint changes, ADD explicit breakpoint there

### Cache Invalidation (What Breaks Cache)
| Change | Tools | System | Messages |
|--------|-------|--------|----------|
| Tool definitions | ✘ | ✘ | ✘ |
| Web search toggle | ✓ | ✘ | ✘ |
| Citations toggle | ✓ | ✘ | ✘ |
| Speed setting (fast mode) | ✓ | ✘ | ✘ |
| tool_choice param | ✓ | ✓ | ✘ |
| Images (add/remove) | ✓ | ✓ | ✘ |
| Thinking params | ✓ | ✓ | ✘ |

### Best Practices
1. **Cache stable content**: System instructions, tool definitions, large contexts, RAG documents
2. **Place cached content at beginning**: Hierarchy = tools → system → messages
3. **Use 4 breakpoints max**: Separate content that changes at different frequencies
4. **Set breakpoint at conversation end**: Maximize cache hits across 20-block window
5. **1-hour cache for infrequent use**: If usage gap >5min but <1hr (agents, long chats)

### Multi-Turn Conversations
```json
// Turn 1
{"role": "user", "content": "Question 1"}
{"role": "assistant", "content": "Answer 1"}

// Turn 2 - mark final block for incremental caching
{"role": "user", "content": [
  {"type": "text", "text": "Good to know."},
  {"type": "text", "text": "Follow-up", "cache_control": {"type": "ephemeral"}}
]}
```
Each turn auto-caches previous conversation.

### RAG + Tools + Conversation (All 4 Breakpoints)
```json
{
  "tools": [..., {"name": "last_tool", "cache_control": {"type": "ephemeral"}}],
  "system": [
    {"type": "text", "text": "Instructions", "cache_control": {"type": "ephemeral"}},
    {"type": "text", "text": "RAG docs", "cache_control": {"type": "ephemeral"}}
  ],
  "messages": [
    ...,
    {"role": "user", "content": [
      {"type": "text", "text": "Query", "cache_control": {"type": "ephemeral"}}
    ]}
  ]
}
```

---

## Latency Reduction

### 1. Model Selection
| Model | Use Case | TTFT |
|-------|----------|------|
| Haiku 4.5 | Speed-critical, simple tasks | Fastest |
| Sonnet 4.5 | Balanced speed + intelligence | Fast |
| Opus 4.6 | Complex reasoning, quality | Slower |

### 2. Optimize Prompt Length
- **Be clear but concise**: Avoid redundant info
- **Ask for shorter responses**: "Respond in 2-3 sentences"
- **Use max_tokens**: Hard cap (blunt, may cut mid-sentence)
- **Lower temperature**: 0.2 for focused/shorter, 0.8 for diverse/longer

### 3. Streaming
```python
response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=1024,
    stream=True,
    messages=[{"role": "user", "content": "Query"}]
)
for event in response:
    print(event.delta.text)
```
Improves perceived responsiveness (TTFT).

### 4. Parallel Tool Calls
```python
# Instead of sequential
Read file1 → Read file2 → Read file3

# Use parallel
client.messages.create(..., messages=[
  {"role": "user", "content": "Read files A, B, C"}
])
# Claude calls all 3 Read tools in parallel
```

Prompt for parallel execution:
```
If multiple tool calls have no dependencies, execute them in parallel.
Never use placeholders - call tools sequentially only when values depend on previous results.
```

---

## Claude 4.6 Prompting Patterns

### Core Principles (Claude 4.6 vs Previous Models)

**More explicit, less inference**:
- ❌ "Create an analytics dashboard"
- ✅ "Create an analytics dashboard. Include as many features as possible. Go beyond basics."

**Provide context/motivation**:
- ❌ "NEVER use ellipses"
- ✅ "Text will be read by TTS, so never use ellipses (TTS can't pronounce them)."

**Be vigilant with examples**:
- Claude 4.6 pays close attention to ALL details in examples
- Ensure examples align with desired behavior

### Tool Usage Patterns

**Default to action** (if you want proactive behavior):
```
By default, implement changes rather than suggesting them. Infer the most useful action and proceed. Use tools to discover missing details instead of asking.
```

**Conservative approach** (if you want hesitation):
```
Do not jump into implementation unless explicitly instructed. When intent is ambiguous, provide information and recommendations rather than taking action.
```

### Autonomy vs Safety

**Confirm before destructive actions**:
```
Consider reversibility and impact. Take local, reversible actions freely (edit files, run tests).
Ask before hard-to-reverse actions:
- Destructive: delete files, drop tables, rm -rf
- Hard to reverse: git push --force, git reset --hard
- Visible to others: push code, comment on PRs, send messages
```

### Reduce Overthinking

Claude Opus 4.6 does more upfront exploration. If excessive:
```
When deciding how to approach a problem, choose an approach and commit. Avoid revisiting decisions unless new info contradicts reasoning. Pick one approach and see it through.
```

Or lower `effort` param:
```python
client.messages.create(
    model="claude-opus-4-6",
    output_config={"effort": "low"},  # or medium, high, max
    ...
)
```

### Control Output Formatting

**Tell what TO do (not what NOT to do)**:
- ❌ "Do not use markdown"
- ✅ "Use smoothly flowing prose paragraphs"

**Use XML tags**:
```
Write prose in <smoothly_flowing_prose_paragraphs> tags.
```

**Minimize markdown/bullets**:
```
<avoid_excessive_markdown_and_bullet_points>
Write in clear, flowing prose with complete paragraphs. Reserve markdown for:
- `inline code`
- Code blocks (```...```)
- Simple headings (###)

Avoid **bold**, *italics*, ordered/unordered lists UNLESS truly discrete items.
Incorporate items naturally into sentences. Your goal is readable, flowing text.
</avoid_excessive_markdown_and_bullet_points>
```

### Adaptive Thinking (Opus 4.6)

```python
# Opus 4.6 uses adaptive thinking (not budget_tokens)
client.messages.create(
    model="claude-opus-4-6",
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # Controls thinking depth
    ...
)
```

**Reduce thinking frequency** (if thinking too often):
```
Extended thinking adds latency and should only be used when it meaningfully improves answer quality - typically for multi-step reasoning. When in doubt, respond directly.
```

### Multi-Context Window Workflows

For tasks spanning multiple sessions:
1. **First window**: Create framework (tests, setup scripts)
2. **Future windows**: Iterate on todo list
3. **Have model write tests in structured format** (tests.json)
4. **Set up quality of life tools** (init.sh for servers/tests/linters)
5. **Starting fresh vs compacting**: New window lets Claude discover state from filesystem
6. **Provide verification tools**: Playwright, computer use for UI testing

**Encourage full context usage**:
```
This is a long task. Plan clearly and use your entire output context working systematically. Make sure you don't run out of context with uncommitted work.
```

### State Management

```json
// tests.json (structured)
{
  "tests": [
    {"id": 1, "name": "auth_flow", "status": "passing"},
    {"id": 2, "name": "user_mgmt", "status": "failing"}
  ],
  "total": 200, "passing": 150, "failing": 25
}
```

```text
// progress.txt (unstructured)
Session 3:
- Fixed auth token validation
- Next: investigate user_mgmt failures (test #2)
- Note: Do not remove tests (missing functionality risk)
```

### Parallel Tool Execution (Maximize)

```
<use_parallel_tool_calls>
If multiple tool calls have no dependencies, execute them in parallel.
Prioritize simultaneous execution over sequential. Example: reading 3 files = 3 parallel Read calls.
Only use sequential when parameters depend on previous results. Never use placeholders.
</use_parallel_tool_calls>
```

### Minimize File Creation (Agentic Coding)

Claude 4.6 may create temp files for iteration. To clean up:
```
If you create temporary files/scripts for iteration, remove them at the end of the task.
```

### Reduce Overengineering

```
Avoid over-engineering. Only make changes directly requested or clearly necessary:

- Scope: Don't add features, refactor, or "improve" beyond what was asked
- Documentation: Don't add docstrings/comments to unchanged code
- Defensive coding: Don't add error handling for impossible scenarios
- Abstractions: Don't create helpers for one-time operations
```

### Frontend Design (Avoid "AI Slop" Aesthetic)

```
<frontend_aesthetics>
Avoid generic "AI slop" aesthetic. Make creative, distinctive frontends that surprise and delight.

Focus:
- Typography: Choose beautiful, unique fonts (not Arial/Inter)
- Color/Theme: Commit to cohesive aesthetic with CSS variables
- Motion: Use animations for effects (CSS-only for HTML, Motion lib for React)
- Backgrounds: Create atmosphere (layer gradients, geometric patterns)

Avoid:
- Overused fonts (Inter, Roboto, Arial)
- Clichéd colors (purple gradients on white)
- Predictable layouts
- Cookie-cutter design

Vary between light/dark themes, different fonts/aesthetics. Think outside the box!
</frontend_aesthetics>
```

### Minimize Hallucinations (Agentic Coding)

```
<investigate_before_answering>
Never speculate about code you haven't opened. If user references a file, READ it first.
Investigate and read relevant files BEFORE answering. Never make claims about code before investigating unless certain. Give grounded, hallucination-free answers.
</investigate_before_answering>
```

### Vision Improvements (Opus 4.5/4.6)

Better image processing, especially multiple images. Boost performance with crop tool:
```python
# Give Claude a crop tool to "zoom" on image regions
# See: https://platform.claude.com/cookbook/multimodal-crop-tool
```

### LaTeX Output (Opus 4.6)

Defaults to LaTeX for math. To use plain text:
```
Format response in plain text only. No LaTeX, MathJax, markup like \( \), $, \frac{}{}.
Write math with standard characters (/ for division, * for multiplication, ^ for exponents).
```

---

## Application to Portals Main

### Current Usage
- Claude Code CLI (not direct API)
- Skills with subagents (Task tool)
- Unity MCP for tool calls
- Multi-turn conversations with voice composer

### Where These Patterns Apply

**Prompt Caching** (via Claude Code):
- Cache tool definitions (Unity MCP tools rarely change)
- Cache system instructions (CLAUDE.md rarely changes)
- Cache conversation history in voice composer sessions
- NOT directly controllable in Claude Code CLI (API feature)

**Latency Reduction**:
- ✅ Use Haiku for mechanical tasks (grep, config fixes, test reruns)
- ✅ Parallel tool calls (already doing with Unity MCP)
- ✅ Model selection (Sonnet for standard, Opus for complex)
- ✅ Streaming (Claude Code has built-in streaming)

**Prompting Best Practices**:
- ✅ Add to CLAUDE.md: explicit instructions, tool usage defaults, autonomy guidelines
- ✅ Already using: minimize file creation, investigate before answering
- ⚠️ Check: Are we over-prompting for tool usage? Dial back if overtriggering
- ⚠️ Check: Are we encouraging too much thoroughness? Claude 4.6 explores more upfront
- ✅ Add frontend aesthetics to skills if building UIs

### Recommended Updates

**To ~/.claude/CLAUDE.md**:
```markdown
## Prompting (Claude 4.6 Specifics)
- Be explicit with tool usage: "Edit this file" not "Can you suggest changes?"
- Provide context/motivation: Explain WHY behavior matters
- Reduce overthinking if excessive: "Choose approach and commit, avoid revisiting decisions"
- Parallel tool calls: "Execute independent operations in parallel, sequential only when dependent"
```

**To portals_main/CLAUDE.md**:
```markdown
## Communication Style
- After tool use, provide quick summary of work done (not just jumping to next action)
- Balance autonomy and safety: Confirm before destructive operations (delete files, force push)
- Investigate before answering: Read files before making claims about code
```

### Not Applicable
- Prompt caching control (API-only, not exposed in Claude Code CLI)
- Batch API (not using)
- Direct thinking config (Claude Code handles internally)
- Prefilled responses (deprecated in 4.6, not using)

### Token Savings Opportunities
1. **Use Haiku for more mechanical work** (currently underutilized)
2. **Parallel tool calls** (already good, could add explicit prompt)
3. **Reduce file creation** (add cleanup guidance)
4. **Avoid over-prompting tool usage** (dial back aggressive "CRITICAL: Use this tool" language)
5. **Context awareness**: Add guidance about compaction to system prompt

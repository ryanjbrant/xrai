# Advanced Context Engineering for Coding Agents (ACE-FCA)

**Source**: https://github.com/humanlayer/advanced-context-engineering-for-coding-agents
**Author**: Dex Horthy (HumanLayer/BoundaryML)
**Validation**: 300k LOC Rust codebase, 35k LOC features in 7hrs, team of 3 @ $12k/month Opus
**Value**: Proven patterns for large-scale agent-driven development

---

## Quick Reference

**Core Principle**: "Contents of context window are the ONLY lever you have to affect output quality."

**Target**: 40-60% context utilization for complex tasks

**Workflow**: Research → Plan → Implement (with intentional compaction between phases)

**Human Leverage**: Research & Planning (not implementation or code review)

---

## Optimization Hierarchy (Worst Outcomes)

1. **Incorrect information** (false assumptions, wrong patterns)
2. **Missing information** (incomplete context, gaps)
3. **Excessive noise** (irrelevant content, bloat)

**Application**: When choosing what to include in context, prioritize correctness > completeness > conciseness.

---

## Three-Phase Workflow

### Phase 1: Research (Knowledge Gathering)
**Goal**: Map codebase, identify relevant files, trace information flow, pinpoint solutions.

**Pattern**: Use subagents with fresh context windows for searching/summarizing.
```
Parent agent → Spawn subagent (clean context)
              → Subagent searches/reads/analyzes
              → Returns synthesized findings (not raw output)
Parent agent → Uses synthesis for planning
```

**Why**: Prevents parent context pollution from grep/read operations.

**Deliverable**: Research document with:
- Relevant files identified
- Information flow traced
- Architectural patterns understood
- Potential approaches evaluated

### Phase 2: Planning (Specification)
**Goal**: Create precise step-by-step guide with exact file modifications and verification procedures.

**Key Insight**: "Higher-leverage than code review. Flawed plan generates thousands of bad lines, bad code generates bad lines."

**Pattern**: Specifications become source-of-truth (Sean Grove principle: specs ARE the real code).

**Deliverable**: Plan document with:
- Precise steps (file:line level)
- Verification procedures
- Edge cases identified
- Test strategy

### Phase 3: Implementation (Execution)
**Goal**: Execute plan phase-by-phase, compact status back into planning docs after verification.

**Pattern**:
1. Implement one phase
2. Verify (tests, console, build)
3. Update plan doc with status
4. Compact context (commit or progress file)
5. Next phase

**Why**: Maintains alignment, prevents drift, enables recovery.

---

## Intentional Compaction

### Definition
Deliberately restructuring how context flows throughout development to reset context windows without losing progress.

### Methods
1. **Progress markdown files**: Goals, approaches, completed steps, current blockers
2. **Commit messages**: Checkpoints with summary
3. **Subagents**: Fresh windows for synthesis
4. **Distilled artifacts**: Structured output (not raw tool results)

### Pattern
```
Long context (raw searches, edits, logs)
     ↓
Intentional compaction
     ↓
Structured artifact (progress.md, commit, synthesis)
     ↓
Fresh context window + artifact
```

### Benefits
- Reset token budget
- Maintain progress
- Enable parallel work
- Facilitate human review

---

## Human Leverage Points (ROI Ranking)

**Highest ROI** (review during these phases):
1. **Research**: Errors cascade through thousands of lines
2. **Planning**: Misunderstandings corrupt entire features
3. **Specifications**: Teams stay aligned on intent

**Lower ROI**:
4. Code review: Catches localized issues only
5. Implementation details: Agents handle well

**Key Insight**: "Mental alignment reviewing specs > reviewing thousands of generated lines daily."

---

## Concrete Performance Metrics

### BAML Codebase (300k LOC Rust)
- Merged PR: ~1 hour from initial work
- Complex features: 35k LOC shipped in 7 hours
  - Cancellation support
  - WASM compilation support

### Internal Team (BoundaryML)
- 3 engineers: $12k/month on Opus (averaging)
- Intern: 2 PRs day-1, 10 PRs by day-8

### Context Efficiency
- Target: 40-60% context utilization
- Below 40%: Underutilizing capacity
- Above 60%: Noise degrades quality

---

## Anti-Patterns (Failure Cases)

### 1. "Vibe Coding"
**Definition**: Chatting with agents for hours, discarding prompts, checking only final code.

**Why It Fails**: Like compiling Java to bytecode without version-controlling source.

**Fix**: Version control prompts, plans, research docs.

### 2. Insufficient Research
**Example**: Parquet-java hadoop-removal attempt failed because research didn't traverse deep dependency trees.

**Why It Fails**: Hard problems need experts in actual codebase.

**Fix**: Research phase must understand dependencies, not just surface patterns.

### 3. Over-reliance on Magic Prompts
**Quote**: "There's a certain type of person always looking for the one magic prompt that solves everything. It doesn't exist."

**Why It Fails**: Context is king, prompts are implementation details.

**Fix**: Focus on context quality (research, planning, verification).

### 4. Skipping Planning Phase
**Why It Fails**: Implementation drift, misaligned assumptions, rework.

**Fix**: Always create specification before implementation.

### 5. Sequential Over Parallel
**Why It Fails**: Wastes time, agents can work in parallel.

**Fix**: Decompose into independent work streams.

---

## Subagent Pattern (Knowledge Gathering)

### Problem
Parent agent context polluted by searches, reads, grep output.

### Solution
```python
# Spawn subagent with clean context
subagent = spawn_agent(
    task="Research authentication flow in codebase",
    tools=["grep", "read", "analyze"],
    output_format="structured_markdown"
)

# Subagent returns synthesis (not raw output)
research = subagent.complete()
# research = {
#   "auth_flow": "Uses JWT tokens, validated in middleware...",
#   "key_files": ["auth.ts:45", "middleware.ts:120"],
#   "dependencies": ["jsonwebtoken", "bcrypt"]
# }

# Parent uses clean synthesis for planning
plan = create_plan(research)
```

### Benefits
- Parent context stays clean
- Subagent can use full context budget for research
- Synthesis is reusable across sessions
- Parallel research tasks

---

## Verification Strategies

### Plan Quality Determines Testing Approach

**Research-Informed Plans**:
- Testing aligns with codebase conventions
- Edge cases identified upfront
- Verification procedures specified

**Plans Without Research**:
- Code works but less optimal
- May miss edge cases
- Requires more iteration

### Verification Phases

1. **Planning Phase** (High-Leverage)
   - Does approach match architectural patterns?
   - Are dependencies understood?
   - Are edge cases identified?

2. **Implementation Phase** (Standard)
   - Does code compile?
   - Do tests pass?
   - Does console show errors?

3. **Integration Phase** (Human Review)
   - Does it solve the problem?
   - Does it follow team conventions?
   - Is it maintainable?

---

## Specification-First Approach

### Sean Grove Principle
"Specifications ARE the real code."

### Workflow
1. Research phase → Understanding
2. Planning phase → Specification
3. Specification becomes source-of-truth
4. Implementation follows specification
5. Verification checks against specification

### Benefits
- Disposable specs → Source-of-truth artifacts
- Team alignment before implementation
- Reduces rework
- Enables parallel work

---

## Context Utilization Target: 40-60%

### Below 40%
**Symptom**: Agent underutilizing capacity.
**Fix**: Add more context (research, examples, patterns).

### 40-60% (Optimal)
**Symptom**: Complex tasks handled well.
**Result**: High-quality output, low hallucinations.

### Above 60%
**Symptom**: Excessive noise degrades quality.
**Fix**: Compact context, remove noise, use subagents.

---

## Application to Our Work

### ✅ Already Applying
- Research → Plan → Implement (GLOBAL_RULES §Core loop)
- Pre-task validation (prevents incorrect information)
- Task agents for knowledge gathering (subagent pattern)
- Intentional compaction (session checkpointing, commits)
- Human leverage at planning (EnterPlanMode before implementation)

### ⚠️ Could Improve
- **Explicit research phase**: Not formalized, often skip to implementation
- **Specification as source-of-truth**: Plans in memory, not versioned artifacts
- **Context utilization target**: Not measured (40-60% guideline)
- **Progress markdown files**: Not consistently used
- **Subagent synthesis**: Often return raw output, not structured synthesis

### 🔧 Concrete Improvements

**1. Add Research Phase to GLOBAL_RULES**
```markdown
## Workflow (ACE-FCA Pattern)
For non-trivial tasks (3+ files, architectural changes):
1. **Research** (subagent): Map codebase, identify files, trace flow
2. **Plan** (main): Create specification with file:line changes
3. **Implement** (phase-by-phase): Execute, verify, compact
```

**2. Structured Synthesis Format**
```markdown
# Research: [Feature Name]

## Key Files
- auth.ts:45 - JWT validation
- middleware.ts:120 - Token refresh

## Information Flow
User → Login → JWT Generation → Token Storage → Auth Middleware

## Approaches
1. Approach A: Pros/Cons
2. Approach B: Pros/Cons

## Recommendation
Approach A because [evidence from codebase]
```

**3. Progress Markdown Pattern**
```markdown
# Progress: [Feature Name]

## Goal
[One sentence]

## Approach
[Chosen from research]

## Completed
- [x] Phase 1: File edits
- [x] Phase 2: Tests

## Current
Working on Phase 3: Integration

## Blockers
None

## Next
Phase 4: Documentation
```

**4. Context Utilization Check**
Add to token-check skill:
```bash
echo "Context: $(context_tokens)K / 200K (target: 80-120K for complex tasks)"
```

---

## Comparison: ACE-FCA vs Our Current Patterns

| Pattern | ACE-FCA | Our Current | Alignment |
|---------|---------|-------------|-----------|
| Research phase | Explicit subagent | Often skipped | ⚠️ Add |
| Planning phase | Specification-first | EnterPlanMode | ✅ Good |
| Implementation | Phase-by-phase | Often all-at-once | ⚠️ Improve |
| Compaction | Intentional checkpoints | Session checkpointing | ✅ Good |
| Subagents | Fresh context synthesis | Task agents | ✅ Good |
| Human leverage | Research + Planning | Planning only | ⚠️ Add research |
| Verification | Plan > Code | Both | ✅ Good |
| Context target | 40-60% | No target | ⚠️ Add |

---

## Key Takeaways

1. **Context is king**: Only lever for output quality
2. **Incorrect > Missing > Noise**: Optimization hierarchy
3. **Research first**: Prevents cascading errors
4. **Plans are leverage**: Fix plans, not code
5. **Intentional compaction**: Reset context without losing progress
6. **Subagents for synthesis**: Return structured output, not raw
7. **Human leverage at planning**: Not implementation
8. **40-60% context target**: Sweet spot for complex tasks
9. **Specifications are code**: Source-of-truth artifacts
10. **No magic prompts**: Context quality > prompt engineering

---

## Quantified Benefits

**Time Savings**:
- 300k LOC codebase: 1hr to merged PR
- 35k LOC feature: 7hrs

**Cost Efficiency**:
- $12k/month Opus for 3 engineers
- Intern: 10 PRs in 8 days

**Quality**:
- Research-informed plans → optimal solutions
- Plans without research → working but suboptimal
- Planning phase ROI > code review ROI

---

## Anti-Pattern Detection

**You're doing "vibe coding" if**:
- Discarding prompts after sessions
- Only checking final code
- Not version-controlling plans/research

**You have insufficient research if**:
- Plans fail on edge cases
- Implementation requires major rework
- Dependencies surprise you

**You're chasing magic prompts if**:
- Constantly tweaking prompts, not context
- Ignoring research phase
- Expecting one prompt to solve everything

---

## References

- Repo: https://github.com/humanlayer/advanced-context-engineering-for-coding-agents
- Author: Dex Horthy (HumanLayer/BoundaryML)
- Validation: BAML (300k LOC Rust), BoundaryML team
- Related: Sean Grove (specification-first), HumanLayer (agent approval workflows)

---

## Next Steps for Our Workflow

1. **Add explicit research phase** to GLOBAL_RULES for 3+ file tasks
2. **Create research skill** (`/research`) with structured output template
3. **Add progress markdown pattern** to portals_main/CLAUDE.md
4. **Measure context utilization** in token-check skill (target 40-60% = 80-120K for 200K budget)
5. **Formalize subagent synthesis** format (structured markdown, not raw output)
6. **Version control plans** as specifications (not just in-memory)
7. **Test ACE-FCA pattern** on next non-trivial feature (research → plan → implement)

# Agent Skills: Open Format Design Patterns (2026-02-08)

**Source**: https://github.com/agentskills/agentskills + https://agentskills.io/specification
**Type**: Open specification for AI-driven formats
**License**: Code (Apache 2.0), Docs (CC-BY-4.0)
**Value**: Exemplary model for creating open AI format specifications

---

## Why This Matters

Agent Skills demonstrates **how to design open formats for AI systems**. Key innovations:
1. **Progressive disclosure** architecture (metadata → full content → resources)
2. **Write once, use everywhere** philosophy
3. **Minimal viable spec** with clear extension points
4. **Community governance** (Anthropic stewardship + open contribution)
5. **Validation tooling** built-in

This pattern applies to ANY AI-driven format (skills, tools, workflows, configurations).

---

## Core Specification Design

### Minimal Required Structure
```yaml
# SKILL.md (only required file)
---
name: skill-name
description: What it does and when to use it
---

Markdown instructions (no restrictions)
```

**Design Principle**: Start minimal, extend as needed.

### Progressive Disclosure Architecture
1. **Metadata** (~100 tokens): name + description loaded at startup for ALL skills
2. **Instructions** (<5000 tokens recommended): Full SKILL.md loaded when activated
3. **Resources** (on-demand): scripts/, references/, assets/ loaded only when needed

**Design Principle**: Optimize for discovery, not loading everything upfront.

### Field Constraints (Validation-Ready)

| Field | Required | Constraints | Why |
|-------|----------|-------------|-----|
| `name` | Yes | 1-64 chars, `a-z` + `-`, no consecutive `--` | URL-safe, filesystem-safe |
| `description` | Yes | 1-1024 chars, non-empty | Agent discovery |
| `license` | No | Free text | Legal clarity |
| `compatibility` | No | 1-500 chars | Environment requirements |
| `metadata` | No | Key-value map | Extensibility |
| `allowed-tools` | No | Space-delimited | Security (experimental) |

**Design Principle**: Validate what matters, permit everything else.

---

## Open Format Design Patterns

### 1. Minimal Viable Spec
**Pattern**: 2 required fields (name, description), everything else optional.
**Benefit**: Low barrier to entry, easy to adopt.
**Application**: Any AI format should start with absolute minimum.

### 2. Progressive Disclosure
**Pattern**: Load metadata → full content → resources (hierarchical).
**Benefit**: Discovery without loading full content (token efficiency).
**Application**: Skills, tools, plugins, workflows.

### 3. Filesystem as Structure
**Pattern**: Directory = skill, subdirectories = resource types.
```
skill-name/
├── SKILL.md (required)
├── scripts/ (optional)
├── references/ (optional)
└── assets/ (optional)
```
**Benefit**: Self-contained, portable, versionable.
**Application**: Any packaged AI capability.

### 4. Markdown + YAML Frontmatter
**Pattern**: YAML metadata + Markdown body.
**Benefit**: Human-readable, machine-parseable, no custom formats.
**Application**: Documentation-driven formats.

### 5. Validation Tooling from Day 1
**Pattern**: Reference library (`skills-ref`) validates format.
```bash
skills-ref validate ./my-skill
```
**Benefit**: Format compliance, prevent drift.
**Application**: Any spec needs validation tools.

### 6. Clear Extension Points
**Pattern**: `metadata` field = arbitrary key-value for extensions.
**Benefit**: Future-proof without breaking changes.
**Application**: Reserved extension namespace in all specs.

### 7. Hybrid Governance
**Pattern**: "Maintained by Anthropic, open to community contributions."
**Benefit**: Stewardship + community innovation.
**Application**: Open standards need clear ownership + contribution model.

### 8. Permissive Licensing
**Pattern**: Apache 2.0 (code) + CC-BY-4.0 (docs).
**Benefit**: Commercial adoption + attribution.
**Application**: Open formats need permissive licenses.

---

## Design Principles (Extracted)

### 1. Write Once, Use Everywhere
Skills work across any agent implementation following spec.
**Principle**: Portability > platform lock-in.

### 2. Simple, Not Easy
Minimal spec, but requires thoughtful design.
**Principle**: Complexity budget spent on right places (discovery, validation).

### 3. Opinionated Constraints
- Lowercase names only
- Max 64 chars for name
- No consecutive hyphens
**Principle**: Constraints enable interoperability.

### 4. Documentation is Specification
No separate schema files, spec IS the documentation.
**Principle**: Human-readable spec = easier adoption.

### 5. Validation is Non-Negotiable
Reference implementation includes validator.
**Principle**: Formats without validation drift into chaos.

### 6. Progressive Complexity
Simple skills = single SKILL.md. Complex skills = scripts + references + assets.
**Principle**: Format grows with needs.

### 7. Context Efficiency First
Recommendations: <500 lines SKILL.md, split detailed docs to references.
**Principle**: Token efficiency = core design constraint.

---

## Application to Other Formats

### For Tool Specifications
```yaml
---
name: tool-name
description: What it does, when to use
input_schema: {...}
---

Tool implementation guide
```
**Applies**: Progressive disclosure, validation, filesystem structure.

### For Workflow Definitions
```yaml
---
name: workflow-name
description: What problem it solves
---

Workflow steps
```
**Applies**: YAML + Markdown, extensibility via metadata.

### For Agent Configurations
```yaml
---
name: agent-name
description: Specialization area
model: opus
tools: [...]
---

Agent-specific instructions
```
**Applies**: Minimal viable spec, clear constraints.

### For Knowledge Bases
```yaml
---
name: kb-name
description: Knowledge domain
tags: [...]
---

Knowledge content
```
**Applies**: Progressive disclosure, references/ for deep content.

---

## Validation Rules (Concrete)

### Name Validation
```python
import re

def validate_name(name: str) -> bool:
    if not (1 <= len(name) <= 64):
        return False
    if not re.match(r'^[a-z0-9]+(-[a-z0-9]+)*$', name):
        return False
    return True
```

### Description Validation
```python
def validate_description(desc: str) -> bool:
    return 1 <= len(desc) <= 1024
```

### Frontmatter Validation
```python
import yaml

def validate_frontmatter(content: str) -> dict:
    if not content.startswith('---'):
        raise ValueError("Missing frontmatter")

    parts = content.split('---', 2)
    if len(parts) < 3:
        raise ValueError("Invalid frontmatter")

    frontmatter = yaml.safe_load(parts[1])

    if 'name' not in frontmatter:
        raise ValueError("Missing required field: name")
    if 'description' not in frontmatter:
        raise ValueError("Missing required field: description")

    validate_name(frontmatter['name'])
    validate_description(frontmatter['description'])

    return frontmatter
```

---

## Comparison: Good vs Bad Open Format Design

### ✅ Agent Skills (Good)
- Minimal required fields (2)
- Clear validation rules
- Progressive disclosure
- Permissive license
- Reference implementation
- Community governance
- Filesystem-based (portable)

### ❌ Anti-Pattern Example
- 20+ required fields
- Proprietary schema format
- All-or-nothing loading
- Restrictive license
- No validation tools
- Closed governance
- Database-dependent (not portable)

---

## Key Takeaways for Format Design

1. **Start minimal**: 2-3 required fields max
2. **Progressive disclosure**: Metadata → content → resources
3. **Validate from day 1**: Build reference validator
4. **Use standard formats**: YAML + Markdown, not custom DSL
5. **Filesystem = structure**: Directories > databases for portability
6. **Clear governance**: Steward + open contribution
7. **Permissive license**: Enable adoption
8. **Human-readable spec**: Documentation IS the specification
9. **Extension points**: Reserved namespace for future growth
10. **Context efficiency**: Token cost = design constraint

---

## References

- Spec: https://agentskills.io/specification
- Repo: https://github.com/agentskills/agentskills
- Examples: https://github.com/anthropics/skills
- Validator: https://github.com/agentskills/agentskills/tree/main/skills-ref

---

## Application to Our Work

### Already Applying
- ✅ SKILL.md format for unity-status
- ✅ YAML + Markdown (CLAUDE.md, AGENTS.md)
- ✅ Progressive disclosure (KB index → full files)
- ✅ Validation (pre-commit hooks)

### Could Apply More
- Build validator for CLAUDE.md format
- Use `metadata` field for extensibility
- Standardize KB file frontmatter
- Create reference library for config validation

### Don't Need
- Formal spec (not building open format)
- Community governance (personal tooling)
- License clarity (already clear)

**Value**: Understanding how to design open formats helps us design better internal formats (configs, KB structure, skill definitions).

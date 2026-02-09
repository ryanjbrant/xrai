# CLAUDE.md Best Practices (Official Anthropic Guidance - 2026-02-08)

**Source**: https://claude.com/blog/using-claude-md-files
**Applies to**: Claude Code CLI
**Value**: Official patterns for CLAUDE.md optimization

---

## Quick Reference

**What**: Repository-level config file providing persistent project context
**Where**: Repo root, parent directories (monorepos), or `~/CLAUDE.md` (universal)
**When**: Multiple users, non-standard architecture, repeated context-setting
**Cost**: 1-5KB tokens per session (saves 2-5KB by eliminating repetitive context)

---

## Core Insights

### 1. Persistence Model
- Survives `/clear` (conversation reset)
- Becomes part of system prompt every session
- No mandatory format (human-readable documentation)

### 2. vs System Prompts
| Aspect | CLAUDE.md | System Prompt |
|--------|-----------|--------------|
| Scope | Project-specific | Global |
| Persistence | Per conversation | Universal |
| Sharing | Version control | Not shareable |
| Context cost | Per session | Fixed |

### 3. Key Principle
**"Solve concrete problems you encounter, not theoretical concerns."**
- Evolve with codebase
- Reflect how team *actually* develops
- Ongoing refinement, not one-time setup

---

## Essential Structure

### 1. Project Summary (Brief)
```markdown
# Project Context

## About This Project
FastAPI REST API for user authentication. SQLAlchemy + Pydantic.
All routes prefixed `/api/v1`. JWT tokens expire 24hr.
```

### 2. Directory Map (Key Locations Only)
```markdown
## Key Directories
main.py
├── logs/
├── modules/ (cli.py, logging_utils.py, media_handler.py)
```

### 3. Standards & Conventions (Unique to Project)
```markdown
## Standards
- Type hints required
- PEP 8, 100-char lines
- pytest with fixtures in `tests/conftest.py`
```

### 4. Common Commands
```markdown
## Common Commands
uvicorn app.main:app --reload  # dev server
pytest tests/ -v               # run tests
```

### 5. Workflows (Process Before Implementation)
```markdown
## Before Architectural Changes
Ask clarifying questions. Consider impact on auth, validation, error handling.
Plan before implementing.
```

---

## Advanced Patterns

### Custom Slash Commands (`.claude/commands/`)
Store repetitive prompts as markdown files:
```bash
.claude/commands/
├── performance-optimization.md
├── security-review.md
└── deploy.md
```

Create via: "Create custom slash command called /performance-optimization..."

**When to use**: Repeated multi-step workflows (performance audits, security reviews, deployment).

### Subagent Specifications
Define when isolated contexts improve analysis:
```markdown
## Analysis Workflows
- Security reviews: Use subagent (prevents debugging context contamination)
- Performance analysis: Fresh context for objective assessment
```

### Tool Integration (MCP Servers)
```markdown
## Tools
- **Slack MCP**: Posts to #dev-notifications only, 10 msgs/hr limit
- **Unity MCP**: `read_console`, `manage_editor`, `editor_selection`
- **GitHub MCP**: Use for PRs, issues, code search
```

---

## Best Practices

### ✅ Do
- Keep concise (1-5KB optimal)
- Document what makes YOUR codebase unique
- Break large docs into separate files, reference from CLAUDE.md
- Version control safe (no secrets)
- Iterative refinement (start minimal, expand based on friction)
- Track commands you repeat → add to CLAUDE.md
- Use `/init` to generate baseline, then refine

### ❌ Don't
- Include sensitive data (API keys, credentials, vulnerabilities)
- Excessive length (bloats every session)
- Theoretical guidance unrelated to team practices
- Generic advice (could apply to any project)
- Duplicate info already in code comments
- Over-engineer before proving value

---

## Commands & Techniques

### `/init` Command
```bash
cd your-project
claude
/init  # Generates starter CLAUDE.md from codebase analysis
```
- Detects: build commands, tests, directories, conventions
- Review and refine before committing
- Re-run on existing projects for improvements

### Context Management
- `/clear` resets history, preserves CLAUDE.md
- Use between distinct tasks
- Prevents signal-to-noise degradation

### Subagent Separation
"Use subagent to perform security review of this code" → Different analytical perspective.

---

## Token Optimization Strategy

### Overhead Analysis
- CLAUDE.md: 1-5KB per session (loaded every conversation)
- Repetitive context: 2-5KB per conversation if not in CLAUDE.md
- **Net savings**: Positive if used 2+ times per day

### Optimization Techniques
1. **References over inline**: Large docs → separate files
2. **Commands over sections**: Specialized workflows → `/slash-commands`
3. **Subagents over bloat**: Complex analysis → isolated context
4. **Minimal directives**: Only what's unique to project

### Break-Even Calculation
```
CLAUDE.md size: 3KB
Repetitive context avoided: 4KB per session
Sessions per day: 5
Daily savings: (4KB - 3KB) × 5 = 5KB per day
Weekly savings: 35KB
```

---

## When to Use vs Skip

### Use CLAUDE.md when:
- Multiple team members use Claude Code
- Non-standard architecture/conventions
- Repeated context-setting occurs
- Custom workflows/tools need docs
- Monorepo or complex modules

### Skip for:
- One-off scripts
- Excellent existing documentation
- Simple boilerplate
- Sensitive codebases (use local `.claude` files)

---

## Implementation Roadmap

### Week 1: Baseline
1. Run `/init` in project root
2. Review output
3. Commit baseline CLAUDE.md

### Weeks 2-4: Refinement
1. Track repetitive questions/explanations
2. Add as sections
3. Test with team

### Ongoing: Evolution
1. Create custom commands for reused patterns
2. Refine workflows based on experience
3. Quarterly audit for outdated info

---

## Comparison: Our Setup vs Official Guidance

### ✅ Aligned
- Concise structure (296 lines for portals_main/CLAUDE.md)
- Quick reference commands
- Standards & conventions
- No secrets
- Version controlled

### ⚠️ Could Improve
- **Too long**: 296 lines (official recommends 1-5KB = ~200-1000 lines, but keep minimal)
- **Could use custom commands**: Patterns like `/verify-all`, `/unity-status` should be `.claude/commands/`
- **Could split references**: Large sections → separate files
- **Missing subagent guidance**: When to use isolated contexts

### ✅ Better Than Baseline
- Pre-task validation (prevents wasted work)
- Boris patterns (from creator)
- Zero-token tools (kb, kbfix)
- Token emergency mode (cost consciousness)

---

## Action Items for Our CLAUDE.md Files

### Global (~/GLOBAL_RULES.md)
- ✅ Already lean (171 lines)
- ✅ Tool selection hierarchy clear
- ✅ Token efficiency focus
- Consider: Move detailed patterns to separate reference files

### Personal (~/.claude/CLAUDE.md)
- ✅ Good (65 lines)
- ✅ Startup checklist
- ✅ Token efficiency focus
- Consider: Custom commands for repeated workflows

### Project (portals_main/CLAUDE.md)
- ⚠️ 296 lines (could trim)
- ✅ Quick reference, standards, commands
- ✅ Architecture, common issues
- Consider: Split into CLAUDE.md (core) + references/ (details)
- Consider: Move verification workflows to custom commands

---

## Key Takeaways

1. **Concrete over theoretical**: Solve actual problems, not imagined ones
2. **Minimal over comprehensive**: Start small, expand based on friction
3. **Unique over generic**: Document what makes YOUR project different
4. **References over inline**: Split large content
5. **Commands over sections**: Repeated workflows → `/slash-commands`
6. **Iterative over complete**: Evolve with codebase
7. **Token-conscious**: 1-5KB sweet spot
8. **Version control safe**: No secrets, shareable
9. **Team practices**: Reflect how you ACTUALLY develop
10. **Subagents for isolation**: Security, performance need fresh context

---

## Official Validation Checklist

- [ ] No sensitive data (keys, credentials)
- [ ] Concise (1-5KB optimal)
- [ ] Project-specific (not generic advice)
- [ ] Version control safe
- [ ] Common commands documented
- [ ] Standards/conventions clear
- [ ] Key directories mapped
- [ ] Workflows defined (plan-before-implement)
- [ ] Custom commands for repeated patterns
- [ ] References for large content

---

## References

- Blog: https://claude.com/blog/using-claude-md-files
- Our implementation: `~/GLOBAL_RULES.md`, `~/.claude/CLAUDE.md`, `portals_main/CLAUDE.md`
- Custom commands: `~/.claude/commands/` (not yet using)

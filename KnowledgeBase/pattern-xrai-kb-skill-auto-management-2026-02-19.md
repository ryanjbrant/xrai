# xrai-kb Skill

**Date:** 2026-02-20  
**Source:** OpenClaw skill development  
**Pattern Type:** Tool/Workflow  
**Analyzed by:** Ember (OpenClaw)

---

## Problem Context

Need to add entries to XRAI KnowledgeBase (github.com/imclab/xrai) with:
- Auto-fork if no write access
- Auto-format per XRAI standards
- Auto-PR creation (or direct push if access)
- Minimal token usage

## Solution Pattern

### Skill Structure
```
xrai-kb/
├── SKILL.md                    # ~300 tokens
├── scripts/
│   ├── xrai-kb-add.py         # Add entries
│   ├── xrai-kb-search.py      # Search KB
│   └── xrai-kb-status.py      # Check status
└── references/
    ├── xrai-structure.md      # Directory layout
    ├── templates.md           # Entry templates
    └── bug-examples.md        # Examples
```

### Auto-Behavior

1. **Write Access Detection**
   ```python
   def has_write_access(repo):
       perms = gh api repos/{repo} -q '.permissions'
       return perms.get("push", False)
   ```

2. **Smart Routing**
   - Has access → Direct push to main
   - No access → Fork + PR workflow

3. **Token Optimization**
   - SKILL.md: ~300 tokens
   - Scripts: Executed without context
   - References: Loaded on-demand

### Usage

```bash
# Add bug analysis
xrai-kb-add --type bug --title "Issue" --source "Logs" --severity P0

# Add pattern
xrai-kb-add --type pattern --title "Optimization" --source "Testing"

# Search
xrai-kb-search "Gemini Live"

# Check status
xrai-kb-status
```

## ROI/Impact

- **Time saved:** ~10 min per KB entry
- **Consistency:** Auto-formatted per XRAI standards
- **Zero friction:** Auto-fork, auto-PR, auto-push
- **Token efficient:** Progressive disclosure

## Related

- XRAI KnowledgeBase structure
- openclaw-dev skill
- GitHub CLI (gh)
# Document Generation & Styling

**Last Updated**: February 5, 2026

---

## Quick Reference

| Format | Tool | Command |
|:--|:--|:--|
| **PDF (fast)** | Typst | `pandoc input.md -o output.pdf --pdf-engine=typst` |
| **PDF (styled)** | WeasyPrint | `pandoc input.md -o temp.html && weasyprint temp.html output.pdf` |
| **DOCX** | Pandoc | `pandoc input.md -o output.docx --reference-doc=template.docx` |
| **DOCX (styled)** | Reference doc | `pandoc input.md -o output.docx --reference-doc=~/.claude/templates/reference.docx` |

---

## Installed Tools

| Tool | Version | Purpose |
|:--|:--|:--|
| **Typst** | 0.14.2 | Fast PDF generation (27x faster than LaTeX) |
| **Pandoc** | System | Universal document converter |
| **WeasyPrint** | pip | HTML/CSS to PDF |
| **doc-ops-mcp** | npm | MCP server for document operations |
| **python-docx** | pip | Python Word document library |

---

## PDF Generation Options

### Typst (Recommended for Speed)

```bash
# Basic conversion
pandoc input.md -o output.pdf --pdf-engine=typst

# With custom template
pandoc input.md -o output.pdf --pdf-engine=typst --template=custom.typ
```

**Pros**: 27x faster than LaTeX, ~40MB vs 1GB+, CSS-like syntax
**Cons**: Smaller ecosystem than LaTeX

### WeasyPrint (Recommended for CSS Styling)

```bash
# Via HTML intermediate
pandoc input.md -o temp.html --standalone && weasyprint temp.html output.pdf && rm temp.html

# With custom CSS
pandoc input.md -o temp.html --standalone --css=style.css && weasyprint temp.html output.pdf
```

**Pros**: Full CSS support, paged media features
**Cons**: Slower than Typst, no JavaScript

### LaTeX (For Complex Documents)

```bash
# XeLaTeX for custom fonts
pandoc input.md -o output.pdf --pdf-engine=xelatex

# With Eisvogel template
pandoc input.md -o output.pdf --template=eisvogel --pdf-engine=xelatex
```

**Pros**: Huge ecosystem, best for academic/math
**Cons**: Large install, complex syntax

---

## DOCX Styling

### Using Reference Documents

```bash
# Generate default reference
pandoc -o ~/.claude/templates/reference.docx --print-default-data-file reference.docx

# Use reference doc (apply your styled template)
pandoc input.md -o output.docx --reference-doc=~/.claude/templates/reference.docx
```

### Creating Custom Reference Doc

1. Generate default: `pandoc -o ref.docx --print-default-data-file reference.docx`
2. Open in Word
3. Modify styles (Home → Styles panel): Title, Heading 1-6, Normal, Code, etc.
4. Save as `custom-reference.docx`
5. Use: `--reference-doc=custom-reference.docx`

---

## MCP Server: doc-ops

**Location**: `~/.claude/mcp-configs/mcp-full.json`

**Tools Available**:
- Document format conversion (PDF, DOCX, HTML, Markdown)
- Text extraction from documents
- Web scraping with Playwright
- Document processing automation

**Config**:
```json
{
  "doc-ops": {
    "command": "npx",
    "args": ["doc-ops-mcp"]
  }
}
```

---

## Resume Templates (ATS-Friendly)

### Installed Templates

| Template | Location | Best For |
|:--|:--|:--|
| **pandoc-resume** | `~/.claude/templates/pandoc-resume/` | Markdown → multiple formats |
| **markdown-resume** | `~/.claude/templates/markdown-resume/` | ATS + human friendly |
| **rover-resume** | `~/.claude/templates/rover-resume/` | LaTeX, no custom fonts needed |

### Usage

```bash
# Pandoc Resume (Markdown → PDF/HTML/DOCX)
cd ~/.claude/templates/pandoc-resume
# Edit resume.md, then:
make pdf  # or make html, make docx

# Markdown Resume
cd ~/.claude/templates/markdown-resume
# Edit your markdown, use their build system

# Rover Resume (LaTeX)
cd ~/.claude/templates/rover-resume
# Edit .tex file, compile with pdflatex
```

### ATS Tips

- **Single column layout** — multi-column breaks parsing
- **No icons/graphics** — ATS can't read them
- **Standard fonts** — Arial, Calibri, Times New Roman
- **Simple headers** — "Experience", "Education", not creative alternatives
- **No tables for layout** — use plain text with clear sections
- **PDF or DOCX** — never image-based PDFs

---

## Template Locations

```
~/.claude/templates/
├── reference.docx          # Default Word reference doc
├── pandoc-resume/          # Markdown resume template
├── markdown-resume/        # ATS-friendly markdown resume
└── rover-resume/           # LaTeX ATS resume template
```

---

## Professional Document Workflow

### For Outreach Kits / Business Docs

```bash
# 1. Write in Markdown
vim document.md

# 2. Generate all formats
pandoc document.md -o document.docx --reference-doc=~/.claude/templates/reference.docx
pandoc document.md -o document.pdf --pdf-engine=typst

# 3. For styled PDF with CSS
pandoc document.md -o temp.html --standalone --css=style.css
weasyprint temp.html document.pdf
rm temp.html
```

### For Resumes

```bash
# Option 1: Markdown Resume (simplest)
cd ~/.claude/templates/markdown-resume
cp example.md my-resume.md
# Edit my-resume.md
make pdf

# Option 2: Pandoc Resume
cd ~/.claude/templates/pandoc-resume
cp resume.md my-resume.md
# Edit my-resume.md
make pdf
```

---

## Resources

- [Pandoc User's Guide](https://pandoc.org/MANUAL.html)
- [Typst Documentation](https://typst.app/docs/)
- [WeasyPrint Docs](https://doc.courtbouillon.org/weasyprint/stable/)
- [Eisvogel Template](https://github.com/Wandmalfarbe/pandoc-latex-template)
- [Pandoc Templates Gallery](https://pandoc-templates.org/)
- [junian/markdown-resume](https://github.com/junian/markdown-resume)
- [subidit/rover-resume](https://github.com/subidit/rover-resume)

---

*Created: February 5, 2026*

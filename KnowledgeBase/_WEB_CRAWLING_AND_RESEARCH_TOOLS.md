# Web Crawling, Research & Codebase Indexing Tools

**Created**: 2026-02-19 | **Source**: Deep research across official docs + GitHub repos
**Verification**: All tools confirmed actively maintained with 2025-2026 releases

---

## Research Protocol (Cross-CLI)

1. Search `~/KnowledgeBase/` first
2. Use CLI's built-in web search (WebSearch, @web, Google Search)
3. Validate against official docs
4. Triple-verify before saving to KB: (1) confirmed working, (2) matches docs, (3) reusable

---

## Web Crawlers

### Tier 1: Recommended

| Tool | Language | JS Rendering | LLM Output | Speed | Maintained |
|------|----------|-------------|-------------|-------|------------|
| **Crawlee** | Node.js/TS | Yes (Playwright) | Yes (AI extraction) | Fast | Active (apify/crawlee) |
| **Crawl4AI** | Python | Yes (Playwright) | Markdown + BM25 filter | Fast | Active (v0.8.x, Jan 2026) |
| **Katana** | Go | Yes (headless mode) | JSONL + stdout | Fastest | Active (v1.4.0, Jan 2026) |

### Tier 2: Established

| Tool | Language | JS Rendering | Speed | Notes |
|------|----------|-------------|-------|-------|
| **Colly** | Go | No | Very fast | 1,791 importers, updated Feb 2026 |
| **GoSpider** | Go | No | Fast | jaeles-project, 2.7k stars, stale since Apr 2024 |

### When to Use What

- **API scraping (no JS)**: axios+cheerio (already in WarpJobs) or Colly
- **JS-rendered pages**: Crawlee (Node.js stack) or Katana (Go, fastest)
- **LLM pipelines / RAG**: Crawl4AI (markdown output, BM25 filtering, fit_markdown)
- **Security/recon**: Katana (JSONL, pipes into nuclei/httpx)
- **One-off page fetch**: Claude Code `WebFetch` / `curl` (no library needed)

---

## GitHub Discovery

| Method | Best For | Free? |
|--------|----------|-------|
| `gh api search/repositories?q=TOPIC` | Targeted search | Yes (5k req/hr) |
| `gh api search/code?q=KEYWORD` | Code search across repos | Yes (30 req/min) |
| GH Archive + BigQuery | Trend analysis at scale | 1 TB/month free |
| Changelog Nightly | Daily trending digest | Free email |

### Quick Examples

```bash
# Search repos by topic
gh api search/repositories?q=unity+XR+language:csharp --jq '.items[].full_name'

# Search code across GitHub
gh api search/code?q=ARFoundation+VFXGraph --jq '.items[] | "\(.repository.full_name): \(.path)"'

# Trending repos (unofficial)
curl -s https://api.gitterapp.com/repositories?language=csharp&since=weekly
```

---

## Codebase Indexing (for AI Agents)

### MCP-Based (2026 Standard)

| Tool | Type | Integration |
|------|------|------------|
| **ast-grep** | AST structural search | MCP server for Claude Code/Cursor |
| **Semgrep** | AST search + security | MCP server, autofix engine |
| **Sourcegraph** | Org-wide code search | MCP server, deterministic search |
| **CodeRLM** | Tree-sitter symbol index | Rust server + JSON API |

### CLI Tools (Already Available)

| Tool | Purpose | Install |
|------|---------|---------|
| `ripgrep` (rg) | Text search (fastest) | Pre-installed |
| `scc` | Code stats, lines, languages | `brew install scc` |
| `tree-sitter` | AST parsing, 200+ languages | `brew install tree-sitter` |
| Git Truck | Treemap viz of repos | `npx -y git-truck` |
| `gdu-go` | Disk/folder size analysis | `brew install gdu` (alias: diskmap) |

---

## Key Insight

> Don't build crawling infrastructure. Install a tool when you need it.
> Most research needs are covered by: CLI web search + `gh api` + ripgrep + KB.
> Only install Crawlee/Crawl4AI/Katana when you need to crawl an entire site.

---

## Sources

- [Crawlee](https://crawlee.dev/) | [GitHub](https://github.com/apify/crawlee)
- [Crawl4AI](https://docs.crawl4ai.com/) | [GitHub](https://github.com/unclecode/crawl4ai)
- [Katana](https://docs.projectdiscovery.io/tools/katana/overview) | [GitHub](https://github.com/projectdiscovery/katana)
- [Colly](https://pkg.go.dev/github.com/gocolly/colly/v2) | [GitHub](https://github.com/gocolly/colly)
- [ast-grep MCP](https://ast-grep.github.io/advanced/prompting.html)
- [Semgrep MCP](https://semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026/)
- [CodeRLM](https://github.com/JaredStewart/coderlm)
- [GH Archive](https://www.gharchive.org/)
- [GitHub REST API Rate Limits](https://docs.github.com/en/rest/rate-limit/rate-limit)

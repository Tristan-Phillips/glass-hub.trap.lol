# hub.trap.lol

Personal dashboard and sovereign infrastructure index deployed via GitHub Pages at [hub.trap.lol](https://hub.trap.lol).

**Stack:** Vanilla HTML / CSS / JS — zero frameworks, zero build steps, zero dependencies.
**Data:** Flat `.json` files. Client renders everything. Server does nothing.
**CDN:** Self-hosted shards at `cdn.trap.lol` (Lucide, marked.js).

---

## Structure

```
index.html              — Single-page dashboard
guide/index.html        — Markdown reader (?md=<filename>)
glass/
  script/app.js         — Config-first boot, parallel data fetch, dynamic render
  style/style.css       — Strict BEM, Dune × Arcane palette, mobile-first
  data/
    config.json         — CDN shard URLs + site metadata
    hosting.json        — Sovereign Nodes (self-hosted services)
    bots.json           — Drone Fleet (Telegram bots)
    guides.json         — Sacred Codex (markdown guides)
    extlinks.json       — Signal Mesh (curated external links)
    tools.json          — Ordnance Depot (CLI tools from payloads repo)
  markdown/             — Guide .md source files
api/
  llm/
    context.md          — Universal LLM directive (curl-includeable)
    context.json        — Structured machine-readable version
```

## Local Dev

Shards (`lucide.min.js`, `marked.min.js`) are CDN-restricted in production. For local dev:

1. Drop files into `/shards/` (gitignored)
2. Set `config.json` shard paths to `/shards/lucide.min.js` etc.
3. Restore CDN URLs before pushing

## LLM Context

Universal project directives available at:

```bash
curl -sL https://hub.trap.lol/api/llm/context.md
curl -sL https://hub.trap.lol/api/llm/context.json
```

---

GPL-3.0 — [trap.lol](https://trap.lol)

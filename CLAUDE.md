# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static personal dashboard deployed via GitHub Pages at `glass-hub.trap.lol`. Zero build tools, zero frameworks — pure vanilla HTML/CSS/JS with `.json` flat-file data. Hosted by Cloudflare-fronted GitHub Pages (`CNAME` present).

## Architecture

```
index.html              — Main dashboard (single page)
guide/index.html        — Markdown reader; receives ?md=<filename> query param
glass/
  script/app.js         — Single JS file: fetches all JSON, renders all sections, keyboard routing
  style/style.css       — All styles; BEM naming; self-hosted fonts via @font-face
  data/
    hosting.json        — Sovereign Nodes cards: { name, hosting, icon, url, status }
    bots.json           — Drone Fleet: { name, icon, chat_url, repo_url, status, description }
    guides.json         — Sacred Codex flip cards: { title, description, icon, file, read_time }
    extlinks.json       — Signal Mesh links: [{ category, links: [{ name, shortcut, url, trust_level, info }] }]
  markdown/             — Raw .md files served to guide/index.html via fetch
  fonts/                — Self-hosted Fira Code + Inter .woff2 files
shards/
  lucide.min.js         — Self-hosted Lucide icon library (required before app.js)
```

## Data-Driven Rendering

`app.js` fetches all 4 JSON files in parallel on `DOMContentLoaded`, then renders each section via `innerHTML +=` template literals. `lucide.createIcons()` is called once after all innerHTML is populated — icon registration will silently fail if called before DOM population.

## Guide Reader

`guide/index.html` reads `?md=` query param, fetches `/glass/markdown/<filename>`, and renders via `marked` (loaded from CDN — only external dependency). To add a guide: drop a `.md` file in `glass/markdown/` and add an entry to `guides.json`.

## Keyboard Shortcut System

Signal Mesh links define a `shortcut` string (e.g. `"A1"`). `app.js` builds a `Map<shortcut.toLowerCase(), url>` and intercepts `keydown` globally. A 2-second idle timeout auto-resets the buffer. Shortcut strings must be unique across all categories.

## Theming

CSS custom properties in `:root` define the full Dune x Arcane palette — dual accent system: `--accent` (purple `#BE29EC`) and `--accent-warm` (amber `#F4A830`). Do not introduce new color values directly; reference existing variables.

## Bot Status Values

Valid `.status` values for `bots.json` (maps to CSS `.bot-status.<value>`): `online`, `dev`, `offline`, `onhold`, `planned`, `conceptual`.

## Icons

Use Lucide icon names only (self-hosted at `/shards/lucide.min.js`). The `guides.json` currently references a Font Awesome class (`fa-brands fa-linux`) which does not render correctly — Lucide does not support FA classes.

## Deployment

Push to `main` — GitHub Pages deploys automatically. No CI, no build step.

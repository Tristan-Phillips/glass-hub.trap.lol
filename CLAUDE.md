# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static personal dashboard deployed via GitHub Pages at `hub.trap.lol`. Zero build tools, zero frameworks — pure vanilla HTML/CSS/JS with `.json` flat-file data. Hosted by Cloudflare-fronted GitHub Pages (`CNAME` present).

## Architecture

```
index.html              — Main dashboard (single page)
guide/index.html        — Markdown reader; receives ?md=<filename> query param
glass/
  script/app.js         — Config-first boot: fetches all JSON, injects shards dynamically, renders all sections
  style/style.css       — All styles; strict BEM naming; system font stacks; mobile-first responsive
  data/
    config.json         — CDN shard URLs + universal site metadata (title, domain, tagline, eyebrow, author, year)
    hosting.json        — Sovereign Nodes cards: { name, hosting, icon, url, status }
    bots.json           — Drone Fleet: { name, icon, chat_url, repo_url, status, description }
    guides.json         — Sacred Codex flip cards: { title, description, icon, file, read_time }
    extlinks.json       — Signal Mesh links: [{ category, links: [{ name, shortcut, url, trust_level, info }] }]
    tools.json          — Ordnance Depot: { name, icon, description, target, repo_url, install_cmd }
  markdown/             — Raw .md files served to guide/index.html via fetch
shards/                 — Local copies for dev only (gitignored); production uses cdn.trap.lol
```

## Data-Driven Rendering

`app.js` fetches `config.json` first (blocking boot), then all 5 data JSON files + lucide shard in parallel. All sections rendered via single-pass string accumulation → one `innerHTML =` assignment. `lucide.createIcons()` fires once after all DOM is populated.

Header content (eyebrow, title, tagline) and footer content (domain, tagline, copyright) are injected from `config.json` — not hardcoded in HTML.

## Shard Loading (CDN vs Local)

Production shards: `https://cdn.trap.lol/shards/lucide.min.js` and `https://cdn.trap.lol/shards/marked.min.js`. The CDN enforces referrer allowlisting — won't load locally.

Local dev: drop files into `/shards/` (gitignored), set `config.json` shards to `/shards/lucide.min.js` etc. Before pushing, restore CDN URLs in `config.json`.

## Guide Reader

`guide/index.html` reads `?md=` query param, fetches `/glass/markdown/<filename>`, renders via `marked`. To add a guide: drop `.md` into `glass/markdown/` and add an entry to `guides.json`.

## BEM Class Conventions

Strict BEM throughout. Key blocks:
- `.card-primary` — hosting node cards (`.card-primary__sub` for hosting label)
- `.tool-card` — ordnance depot cards (`.tool-card__header`, `__name`, `__target`, `__desc`, `__cmd`, `__copy`, `__link`)
- `.tool-card__copy--copied` — clipboard success modifier
- `.bot-profile` / `.bot-avatar` / `.bot-btn--chat` / `.bot-btn--code`
- `.flip-card` / `.flip-card__inner` / `.flip-card__front` / `.flip-card__back` / `.flip-card--flipped`
- `.carousel` / `.carousel__track` / `.carousel__arrow` / `.carousel__arrow--hidden`
- `.site-footer` / `.site-footer__grid` / `.site-footer__bar`
- `.trust-badge--high` / `.trust-badge--med` / `.trust-badge--low`
- `.item-ext` / `.ext-shortcut` / `.ext-name` / `.tooltip-data`

## Keyboard Shortcut System

Signal Mesh links define a `shortcut` string (e.g. `"A1"`). `app.js` builds a `Map<shortcut.toLowerCase(), url>` and intercepts `keydown` globally — **desktop only** (`IS_TOUCH` guard). Shortcut strings must be unique across all categories.

## Bot Status Values

Valid `.status` values for `bots.json`: `online`, `dev`, `offline`, `onhold`, `planned`, `conceptual`.

## Trust Badge Values

Valid `trust_level` in `extlinks.json`: `High`, `Med`, `Low` — rendered as `.trust-badge--high/med/low`.

## Icons

Lucide only (`/shards/lucide.min.js`). Use lowercase Lucide icon names as `data-lucide` attribute values.

## QoL Features

- **Copy-to-clipboard**: `.tool-card__copy` buttons in Ordnance Depot — delegated click on `document`
- **Carousel arrows**: prev/next scroll `.carousel__track` by one card width; auto-hide when at bounds
- **Flip cards**: hover on desktop, tap on touch (`IS_TOUCH`), Enter/Space on keyboard focus
- **Scroll-to-top**: `#scroll-top` button appears after 400px scroll
- **`prefers-reduced-motion`**: kills all animations at OS level

## Deployment

Push to `main` — GitHub Pages deploys automatically. No CI, no build step.

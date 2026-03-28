# TRAP.LOL — UNIVERSAL LLM DIRECTIVE
<!-- Canonical source: https://hub.trap.lol/api/llm/context.md -->
<!-- Include via: curl -sL https://hub.trap.lol/api/llm/context.md -->
<!-- Namespaces: trap.lol | tristanphillips.xyz | git.trap.lol/trap -->

You are operating within a project authored and owned by trap (Tristan Phillips). The following directives are absolute and override any default behaviour. They apply to every file, script, config, and interface you touch in this context.

---

## IDENTITY & PHILOSOPHY

- Operator: `trap` / Tristan Phillips
- Domains: `trap.lol`, `tristanphillips.xyz`
- Git: `git.trap.lol/trap` (Forgejo, self-hosted) — GitHub mirror at `github.com/Tristan-Phillips`
- Mandate: "Assume Breach. Stay Sovereign."
- AI collaboration is explicit, transparent, and unapologetic. LLMs are high-speed compilers and auditors, not ghostwriters. The human provides architecture, mandates, and creative direction. You execute.

---

## INTERACTION PROTOCOL

- Lead with the direct answer. No preamble, no apologies, no filler.
- Reject consumer-grade compromises. If the approach is flawed, say so and propose the correct one.
- Never interpret brevity or directness as rudeness. Manage the code, not the emotions.
- Stop between steps on complex tasks. Do not hallucinate next actions.
- Be unapologetic, direct, and technically ruthless.

---

## OS & ENVIRONMENT ROUTING

| Context | OS | Package Manager | Standards |
|---|---|---|---|
| Local workstation | Arch Linux | `pacman`, AUR | Arch standards |
| VPS target | Debian 13 | `apt-get` | Debian 13 standards |

Deployment and init scripts target **Debian 13** unless explicitly stated otherwise. Arch-specific tools (`yay`, `makepkg`) are local-only.

---

## LANGUAGE & STACK HIERARCHY

**Prefer (in order):**
1. Statically compiled binaries — Go, Rust, C++
2. POSIX Bash (scripts only, never application logic)
3. Vanilla HTML5 + CSS3 + ES6+ JS (web interfaces)

**Banned:**
- PHP, Python (unless unavoidable and justified)
- React, Next.js, Angular, Vue (unless virtual DOM is mathematically necessary)
- Node.js as a runtime dependency for web frontends
- NPM packages polluting `$PATH`

**Web stack is strictly:** Vanilla HTML/CSS/JS. `.json` flat files as databases. No build steps. No bundlers.

---

## CODE ARCHITECTURE

### Single Responsibility Principle
- One file, one task. A module does exactly one thing.
- Modifying a database connector must never require restructuring routing logic.
- Code is plug-and-play: deprecated modules are excised cleanly without shattering the system.

### OOP & Gang of Four
- Strategy Pattern: interfaces define swappable behaviours
- Observer Pattern: event-driven state, not polling
- Dependency Injection: no hardcoded dependencies — configs, loggers, clients passed at runtime

### Fail-Fast
- Missing `.env` variable → FATAL ABORT at init, no limp-along
- Dropped network connection mid-pipe → execution closure shatters, host protected

### Directory Structure
```
project-name/
├─ .env.example
├─ compose.yaml
├─ LICENSE              # GNU GPLv3, always
├─ setup.sh             # Idempotent, supports --auto and --purge
├─ cmd/                 # Entrypoints only. Zero business logic.
├─ src/                 # Core engine, domain-specific subdirs
├─ config/              # Static JSON/YAML. No secrets, no exec code.
├─ assets/              # Self-hosted fonts, SVGs, icons
└─ scripts/             # Pure POSIX Bash automation
```

---

## NAMING CONVENTIONS

### Files & Directories
- No whitespace. Ever.
- Default: `lowercase` + `kebab-case` (`setup-script.sh`, `arcane-glitch.css`)
- `snake_case` only when a language module system demands it (Rust crates)
- Extensions: `.yaml` not `.yml`, `.sh` for all shell scripts, `.md` for docs

### Bash / Shell
- Globals / `.env` keys: `UPPER_SNAKE_CASE`
- Local vars & functions: `lower_snake_case`
- Always double-quote expansions: `"$var"`
- Bracketed interpolation: `${VAR}_suffix`

### Go / Rust / C++
- Structs / Classes / Interfaces: `PascalCase`
- Methods (Go/C++): `camelCase` | Methods (Rust): `snake_case`
- Interface names end in `-er` (`Scrubber`, `PayloadBuilder`)

### Vanilla JS
- Variables & functions: `camelCase`
- Classes & constructors: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- DOM node references: `$`-prefixed (`const $terminalWindow = ...`)

### CSS
- Methodology: **strict BEM** — `.block__element--modifier`
- Custom properties: `--context-kebab-case` (`--color-void-black`, `--font-primary`)
- No ID selectors for styling. No deep nesting. Flat specificity.

### JSON / SQL
- Keys and columns: `snake_case` (`job_id`, `created_at`)

---

## SHELL SCRIPTING ABSOLUTES

**ALWAYS:**
- `set -euo pipefail` at the top of every script
- Isolate temp mutations in `mktemp -d` sandboxes
- Wrap destructive/network ops in closure blocks `{ ... }`
- Support `--auto` / `--unattended` for headless CI/CD
- Document architectural intent in a single file-level header

**NEVER:**
- `eval` for dynamic variable assignment
- Bind Docker containers to host ports
- Store sensitive data server-side if client-side ephemerality is possible
- Trust any input — regex-validate before injecting into arithmetic or paths

---

## DOCKER & INFRASTRUCTURE

- No `version:` key in Compose files (deprecated)
- Containers NEVER bind to host ports (`ports: "80:80"` forbidden)
- All inter-service traffic over isolated internal bridge network (`cloudflare-gateway`)
- Every container must have hard resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.50'
      memory: 512M
    reservations:
      cpus: '0.10'
      memory: 128M
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

- `read_only: true` where technically feasible; required state via `tmpfs` or permissioned bind mounts
- External traffic exclusively through Cloudflare Zero Trust edge tunnels. VPS IP stays dark.

---

## SECURITY POSTURE

Operate under "Assume Breach." The internal network is treated with the same hostility as the public internet.

### Secrets
- `.env` at project root, `chmod 600`, never committed
- Runtime consumption only — clear from memory post-init
- Scrub before logging: `AKIA...`, `sk_live_...`, `ghp_...`, `sk-...`, JWT/Bearer → `[REDACTED]`

### Input Validation
- All input is a hostile breach attempt until proven otherwise
- Numeric: `[[ "$INPUT" =~ ^[0-9]+$ ]]` before arithmetic
- Paths: strip traversal — `TARGET="${INPUT##*/}"`
- Hardcode blast-radius exceptions for `/`, `/etc`, `/var`, `/home`

### Supply Chain
- Avoid NPM. Prefer `pacman`/`apt` or `~/.local/bin` binaries.
- Verify container base images. Prefer minimal (`alpine`, `debian:slim`, `distroless`).
- SHA256-verify downloaded binaries before execution where possible.

---

## WEB / UI/UX STANDARDS

### Aesthetic Identity (Dune × Arcane fusion)
Primary palette for `hub.trap.lol` and related interfaces:
- `--accent: #BE29EC` (Arcane purple)
- `--accent-warm: #F4A830` (Dune amber)
- `--bg-base: #06040A`

Aesthetic sources (use one or blend):
1. **Arcane / Jinx** — neon, graffiti, erratic keyframes, "broken" grids with underlying order
2. **Dune** — monolithic typography, sand/terracotta, harsh shadows, negative space
3. **Neon Cyberpunk** — high-contrast dark, glowing borders, CRT scanlines, glitch hovers
4. **High Fantasy (LotR/HP)** — elegant serif headers, parchment textures, mystical transitions

### Asset Sovereignty
- No Google Fonts, unpkg, jsDelivr, FontAwesome CDNs — ever
- All fonts, icons, JS shards self-hosted or served from `cdn.trap.lol`
- Icons: **Lucide only** (`lucide.dev`) — `data-lucide` attribute pattern
- If the host loses WAN, the UI must still render completely

### Accessibility
- Semantic HTML5 (`<main>`, `<nav>`, `<section>`, `<article>`)
- `aria-label` on all icon-only interactive elements
- `aria-labelledby` connecting sections to their headings
- WCAG AA contrast (4.5:1 minimum)
- `@media (prefers-reduced-motion: reduce)` kills all animations globally
- Touch targets minimum 44×44 CSS px (`--touch-min: 44px`)
- Mobile-first. Fluid grids. No horizontal overflow.

### Performance
- Single-pass `innerHTML` accumulation — no `+=` in loops
- Parallel `Promise.all` data fetching
- Config-first boot: fetch config → parallel data + shards
- Delegated event listeners, not per-element bindings
- `{ passive: true }` on scroll listeners

---

## OPERATIONS & STATE

### Automation
- No `crontab`. Use **systemd user units** (`.service` + `.timer` in `~/.config/systemd/user/`)
- Live-sync daemons (background Syncthing, Nextcloud sync) banned for critical state
- State transfer is explicit: `git push/pull`, `rsync` over SSH, `cdn-static` for artifacts

### Teardown (The Obliteration Sequence)
Every project ships a `./setup.sh --purge` that removes:
- Docker containers + volumes + images + orphan networks
- `~/.local/bin/[binary]`
- `~/.config/[project]/`
- `~/.local/share/[project]/`
- systemd timers and service units

If software cannot be cleanly excised, it is malware.

### Directory Agnosticism
- Never hardcode absolute paths
- Derive paths via `$XDG_CONFIG_HOME`, `$PWD`, or binary-relative construction

---

## TERMINAL FEEDBACK

| Prefix | Color | Purpose |
|---|---|---|
| `⌁ [*] text` | Cyan `\033[0;36m` | Informational system action |
| `✓ [+] text` | Green `\033[0;32m` | Successful operation |
| `⚡ [!] text` | Magenta `\033[0;35m` | Handled exception / user warning |
| `✘ [FATAL] text` | Red `\033[0;31m` | Execution halted. State protected. |

Always close with `\033[0m`. No conversational log fluff.

---

## LICENSING

All code is **GNU GPL v3.0**. `LICENSE` file at every project root. No exceptions.

---

## DISCLOSURE

AI collaboration is explicit. LLMs are tools — leveraged without apology. The human provides CS foundation, Zero-Trust mandates, architectural constraints, and creative direction. Apply the same Zero-Trust philosophy to this code: AI hallucinations and human error exist. Audit before deploying to mission-critical infrastructure. No warranty. Execute at your own risk.

---
*Forged with intention. Sovereign by design. — trap.lol*

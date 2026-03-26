/* hub.trap.lol — Glass/Script
   Config-first boot. Fetches all data, injects shards, renders sections.
   GPL-3.0 — trap.lol */

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load shard: ${src}`));
    document.head.appendChild(s);
  });
}

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json();
}

function renderError(container, message) {
  container.innerHTML = `<span class="render-error">ERR: ${message}</span>`;
}

document.addEventListener("DOMContentLoaded", async () => {

  // ── 1. Boot: load config, then all data + shards in parallel ────────────
  let config;
  try {
    config = await fetchJSON("glass/data/config.json");
  } catch (e) {
    console.error("[boot] config.json failed:", e);
    return;
  }

  let hostingData, extData, guideData, botsData, toolsData;
  try {
    [hostingData, extData, guideData, botsData, toolsData] = await Promise.all([
      fetchJSON("glass/data/hosting.json"),
      fetchJSON("glass/data/extlinks.json"),
      fetchJSON("glass/data/guides.json"),
      fetchJSON("glass/data/bots.json"),
      fetchJSON("glass/data/tools.json"),
    ]);
  } catch (e) {
    console.error("[boot] data fetch failed:", e);
    return;
  }

  try {
    await loadScript(config.shards.lucide);
  } catch (e) {
    console.error("[boot] lucide shard failed:", e);
  }

  // ── 2. Inject config-driven header content ───────────────────────────────
  const eyebrowEl  = document.getElementById("header-eyebrow");
  const titleEl    = document.getElementById("header-title");
  const subtitleEl = document.getElementById("header-subtitle");
  if (eyebrowEl)  eyebrowEl.textContent          = config.site.eyebrow;
  if (titleEl)  { titleEl.textContent            = config.site.title;
                  titleEl.setAttribute("data-text", config.site.title); }
  if (subtitleEl) subtitleEl.textContent         = config.site.tagline;

  // ── 3. Sovereign Nodes ───────────────────────────────────────────────────
  const hostGrid = document.getElementById("hosting-grid");
  if (hostGrid) {
    try {
      let html = "";
      hostingData.forEach((node) => {
        html += `
          <a href="${node.url}" class="card-primary">
            <i data-lucide="${node.icon}"></i>
            <div><h3>${node.name}</h3></div>
          </a>
        `;
      });
      hostGrid.innerHTML = html;
    } catch (e) {
      renderError(hostGrid, "Failed to render hosting nodes.");
      console.error("[render] hosting:", e);
    }
  }

  // ── 4. Ordnance Depot ────────────────────────────────────────────────────
  const toolsContainer = document.getElementById("tools-container");
  if (toolsContainer) {
    try {
      let html = "";
      toolsData.forEach((tool) => {
        html += `
          <div class="tool-card">
            <div class="tool-card__header">
              <i data-lucide="${tool.icon}"></i>
              <span class="tool-card__name">${tool.name}</span>
              <span class="tool-card__target">${tool.target}</span>
            </div>
            <p class="tool-card__desc">${tool.description}</p>
            <div class="tool-card__cmd">
              <code>${tool.install_cmd}</code>
            </div>
            <a href="${tool.repo_url}" target="_blank" class="tool-card__link">
              <i data-lucide="git-branch"></i> Source
            </a>
          </div>
        `;
      });
      toolsContainer.innerHTML = html;
    } catch (e) {
      renderError(toolsContainer, "Failed to render ordnance depot.");
      console.error("[render] tools:", e);
    }
  }

  // ── 5. Drone Fleet ──────────────────────────────────────────────────────
  const botsContainer = document.getElementById("bots-container");
  if (botsContainer) {
    try {
      let html = "";
      botsData.forEach((bot) => {
        html += `
          <div class="bot-profile">
            <div class="bot-avatar">
              <i data-lucide="${bot.icon}"></i>
              <div class="bot-status ${bot.status}"></div>
            </div>
            <div class="agent-tooltip">
              <span class="agent-id">ID: ${bot.name.toUpperCase()}</span>
              <p>${bot.description}</p>
            </div>
            <span class="bot-name">${bot.name}</span>
            <div class="bot-actions">
              <a href="${bot.chat_url}" target="_blank" class="bot-btn chat" title="Message Bot">
                <i data-lucide="message-circle"></i>
              </a>
              <a href="${bot.repo_url}" target="_blank" class="bot-btn code" title="View Source Code">
                <i data-lucide="git-branch"></i>
              </a>
            </div>
          </div>
        `;
      });
      botsContainer.innerHTML = html;
    } catch (e) {
      renderError(botsContainer, "Failed to render drone fleet.");
      console.error("[render] bots:", e);
    }
  }

  // ── 5. Signal Mesh ───────────────────────────────────────────────────────
  const extContainer = document.getElementById("extlinks-container");
  const shortcutMap  = new Map();
  if (extContainer) {
    try {
      let html = "";
      extData.forEach((category) => {
        let linksHTML = "";
        category.links.forEach((link) => {
          shortcutMap.set(link.shortcut.toLowerCase(), link.url);
          linksHTML += `
            <a href="${link.url}" target="_blank" class="item-ext">
              <span class="ext-shortcut">[${link.shortcut}]</span>
              <span class="ext-name">${link.name}</span>
              <div class="tooltip-data">
                <span class="trust-badge trust-${link.trust_level}">Trust: ${link.trust_level}</span>
                <span>${link.info}</span>
              </div>
            </a>
          `;
        });
        html += `
          <div class="ext-category">
            <h3>${category.category}</h3>
            <div class="ext-list">${linksHTML}</div>
          </div>
        `;
      });
      extContainer.innerHTML = html;
    } catch (e) {
      renderError(extContainer, "Failed to render signal mesh.");
      console.error("[render] extlinks:", e);
    }
  }

  // ── 6. Sacred Codex ──────────────────────────────────────────────────────
  const guidesCarousel = document.getElementById("guides-carousel");
  if (guidesCarousel) {
    try {
      let html = "";
      guideData.forEach((guide) => {
        html += `
          <div class="flip-card">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <i data-lucide="${guide.icon}" class="card-front-icon"></i>
                <h3 class="card-front-title">${guide.title}</h3>
                <div class="guide-meta">ETA: ${guide.read_time}</div>
                <div class="card-front-hint">hover to flip</div>
              </div>
              <div class="flip-card-back">
                <h4 class="card-back-title">
                  <i data-lucide="${guide.icon}"></i>${guide.title}
                </h4>
                <p class="card-back-description">${guide.description}</p>
                <div class="card-back-meta">
                  <span>ETA: ${guide.read_time}</span>
                  <a href="guide/?md=${guide.file}" class="card-back-button">
                    <i data-lucide="external-link"></i> Read Guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      guidesCarousel.innerHTML = html;
    } catch (e) {
      renderError(guidesCarousel, "Failed to render codex.");
      console.error("[render] guides:", e);
    }
  }

  // ── 7. Init Lucide icons ─────────────────────────────────────────────────
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.warn("[lucide] library not available — icons will not render.");
  }

  // ── 8. Terminal keystroke routing ────────────────────────────────────────
  let keyBuffer = "";
  let cmdTimeout;
  const cmdOverlay = document.getElementById("cmd-overlay");
  const cmdText    = document.getElementById("cmd-text");

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (!/^[a-zA-Z0-9]$/.test(e.key)) return;

    keyBuffer += e.key.toLowerCase();
    cmdText.textContent = keyBuffer.toUpperCase();
    cmdOverlay.classList.remove("hidden");

    if (shortcutMap.has(keyBuffer)) {
      cmdText.textContent = "ROUTING...";
      cmdText.style.color = "#fff";
      setTimeout(() => { window.open(shortcutMap.get(keyBuffer), "_blank"); resetBuffer(); }, 300);
    } else if (keyBuffer.length >= 2) {
      setTimeout(resetBuffer, 500);
    }

    clearTimeout(cmdTimeout);
    cmdTimeout = setTimeout(resetBuffer, 2000);
  });

  function resetBuffer() {
    keyBuffer = "";
    cmdOverlay.classList.add("hidden");
    cmdText.style.color = "var(--accent)";
  }

  // ── 9. Mobile flip support ───────────────────────────────────────────────
  if ("ontouchstart" in window) {
    document.querySelectorAll(".flip-card").forEach((card) => {
      card.addEventListener("click", function () { this.classList.toggle("flipped"); });
    });
  }
});

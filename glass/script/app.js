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

function renderError($container, message) {
  $container.innerHTML = `<span class="render-error">ERR: ${message}</span>`;
}

const IS_TOUCH = "ontouchstart" in window;

document.addEventListener("DOMContentLoaded", async () => {

  // ── 1. Boot: load config, then all data + shard in parallel ─────────────
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

  // ── 2. Header ────────────────────────────────────────────────────────────
  const $eyebrow  = document.getElementById("header-eyebrow");
  const $title    = document.getElementById("header-title");
  const $subtitle = document.getElementById("header-subtitle");
  if ($eyebrow)  $eyebrow.textContent = config.site.eyebrow;
  if ($title)  { $title.textContent   = config.site.title;
                 $title.setAttribute("data-text", config.site.title); }
  if ($subtitle) $subtitle.textContent = config.site.tagline;

  // ── 3. Footer ────────────────────────────────────────────────────────────
  const $footerDomain = document.getElementById("footer-domain");
  const $footerTagline = document.getElementById("footer-tagline");
  const $footerCopy   = document.getElementById("footer-copy");
  if ($footerDomain)  $footerDomain.textContent  = config.site.domain;
  if ($footerTagline) $footerTagline.textContent = config.site.tagline;
  if ($footerCopy)    $footerCopy.textContent    = `© ${config.site.year} ${config.site.author}`;

  // ── 4. Sovereign Nodes ───────────────────────────────────────────────────
  const $hostGrid = document.getElementById("hosting-grid");
  if ($hostGrid) {
    try {
      let html = "";
      hostingData.forEach((node) => {
        html += `
          <a href="${node.url}" target="_blank" rel="noopener" class="card-primary" aria-label="${node.name} — ${node.hosting}">
            <i data-lucide="${node.icon}"></i>
            <div><h3>${node.name}</h3><span class="card-primary__sub">${node.hosting}</span></div>
          </a>
        `;
      });
      $hostGrid.innerHTML = html;
    } catch (e) {
      renderError($hostGrid, "Failed to render hosting nodes.");
      console.error("[render] hosting:", e);
    }
  }

  // ── 5. Ordnance Depot ────────────────────────────────────────────────────
  const $toolsContainer = document.getElementById("tools-container");
  if ($toolsContainer) {
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
              <button class="tool-card__copy" aria-label="Copy install command" data-cmd="${tool.install_cmd}">
                <i data-lucide="copy"></i>
              </button>
            </div>
            <a href="${tool.repo_url}" target="_blank" rel="noopener" class="tool-card__link" aria-label="View ${tool.name} source on Forgejo">
              <i data-lucide="git-branch"></i> Source
            </a>
          </div>
        `;
      });
      $toolsContainer.innerHTML = html;
    } catch (e) {
      renderError($toolsContainer, "Failed to render ordnance depot.");
      console.error("[render] tools:", e);
    }
  }

  // ── 6. Drone Fleet ───────────────────────────────────────────────────────
  const $botsContainer = document.getElementById("bots-container");
  if ($botsContainer) {
    try {
      let html = "";
      botsData.forEach((bot) => {
        html += `
          <div class="bot-profile">
            <div class="bot-avatar" tabindex="0" aria-label="${bot.name}: ${bot.description}">
              <i data-lucide="${bot.icon}"></i>
              <div class="bot-status ${bot.status}"></div>
            </div>
            <div class="agent-tooltip" role="tooltip">
              <span class="agent-id">ID: ${bot.name.toUpperCase()}</span>
              <p>${bot.description}</p>
            </div>
            <span class="bot-name">${bot.name}</span>
            <div class="bot-actions">
              <a href="${bot.chat_url}" target="_blank" rel="noopener" class="bot-btn bot-btn--chat" aria-label="Message ${bot.name} on Telegram">
                <i data-lucide="message-circle"></i>
              </a>
              <a href="${bot.repo_url}" target="_blank" rel="noopener" class="bot-btn bot-btn--code" aria-label="View ${bot.name} source code">
                <i data-lucide="git-branch"></i>
              </a>
            </div>
          </div>
        `;
      });
      $botsContainer.innerHTML = html;
    } catch (e) {
      renderError($botsContainer, "Failed to render drone fleet.");
      console.error("[render] bots:", e);
    }
  }

  // ── 7. Signal Mesh ───────────────────────────────────────────────────────
  const $extContainer = document.getElementById("extlinks-container");
  const shortcutMap   = new Map();
  if ($extContainer) {
    try {
      let html = "";
      extData.forEach((category) => {
        let linksHTML = "";
        category.links.forEach((link) => {
          shortcutMap.set(link.shortcut.toLowerCase(), link.url);
          linksHTML += `
            <a href="${link.url}" target="_blank" rel="noopener" class="item-ext" aria-label="${link.name}">
              <span class="ext-shortcut">[${link.shortcut}]</span>
              <span class="ext-name">${link.name}</span>
              <div class="tooltip-data" role="tooltip">
                <span class="trust-badge trust-badge--${link.trust_level.toLowerCase()}">Trust: ${link.trust_level}</span>
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
      $extContainer.innerHTML = html;
    } catch (e) {
      renderError($extContainer, "Failed to render signal mesh.");
      console.error("[render] extlinks:", e);
    }
  }

  // ── 8. Sacred Codex ──────────────────────────────────────────────────────
  const $guidesTrack = document.getElementById("guides-track");
  if ($guidesTrack) {
    try {
      let html = "";
      const flipHint = IS_TOUCH ? "tap to flip" : "hover to flip";
      guideData.forEach((guide) => {
        html += `
          <div class="flip-card" tabindex="0" aria-label="${guide.title} guide">
            <div class="flip-card__inner">
              <div class="flip-card__front">
                <i data-lucide="${guide.icon}" class="flip-card__icon"></i>
                <h3 class="flip-card__title">${guide.title}</h3>
                <div class="flip-card__meta">ETA: ${guide.read_time}</div>
                <div class="flip-card__hint">${flipHint}</div>
              </div>
              <div class="flip-card__back">
                <h4 class="flip-card__back-title">
                  <i data-lucide="${guide.icon}"></i>${guide.title}
                </h4>
                <p class="flip-card__back-desc">${guide.description}</p>
                <div class="flip-card__back-meta">
                  <span>ETA: ${guide.read_time}</span>
                  <a href="guide/?md=${guide.file}" class="flip-card__read-btn">
                    <i data-lucide="external-link"></i> Read Guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      $guidesTrack.innerHTML = html;
    } catch (e) {
      renderError($guidesTrack, "Failed to render codex.");
      console.error("[render] guides:", e);
    }
  }

  // ── 9. Init Lucide icons ─────────────────────────────────────────────────
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.warn("[lucide] library not available — icons will not render.");
  }

  // ── 10. Copy-to-clipboard (Ordnance Depot) ───────────────────────────────
  document.addEventListener("click", (e) => {
    const $btn = e.target.closest(".tool-card__copy");
    if (!$btn) return;
    const cmd = $btn.dataset.cmd;
    navigator.clipboard.writeText(cmd).then(() => {
      $btn.classList.add("tool-card__copy--copied");
      setTimeout(() => $btn.classList.remove("tool-card__copy--copied"), 1800);
    }).catch(() => {
      console.warn("[clipboard] write failed");
    });
  });

  // ── 11. Carousel arrows (Sacred Codex) ───────────────────────────────────
  const $carousel = document.querySelector(".carousel");
  const $track    = document.getElementById("guides-track");
  const $btnPrev  = document.querySelector(".carousel__arrow--prev");
  const $btnNext  = document.querySelector(".carousel__arrow--next");

  function scrollCarousel(dir) {
    if (!$track) return;
    const cardWidth = $track.querySelector(".flip-card")?.offsetWidth + 16 || 276;
    $track.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  }

  if ($btnPrev) $btnPrev.addEventListener("click", () => scrollCarousel(-1));
  if ($btnNext) $btnNext.addEventListener("click", () => scrollCarousel(1));

  // Hide arrows if not needed
  function updateArrows() {
    if (!$track || !$btnPrev || !$btnNext) return;
    $btnPrev.classList.toggle("carousel__arrow--hidden", $track.scrollLeft <= 0);
    $btnNext.classList.toggle("carousel__arrow--hidden",
      $track.scrollLeft + $track.clientWidth >= $track.scrollWidth - 2);
  }
  if ($track) {
    $track.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
  }

  // ── 12. Flip cards — touch + keyboard ───────────────────────────────────
  document.addEventListener("click", (e) => {
    const $card = e.target.closest(".flip-card");
    if (!$card) return;
    // Only toggle on touch; hover handles it on desktop
    if (IS_TOUCH) $card.classList.toggle("flip-card--flipped");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const $card = document.activeElement?.closest(".flip-card");
      if ($card) { e.preventDefault(); $card.classList.toggle("flip-card--flipped"); }
    }
  });

  // ── 13. Scroll-to-top ────────────────────────────────────────────────────
  const $scrollTop = document.getElementById("scroll-top");
  if ($scrollTop) {
    window.addEventListener("scroll", () => {
      $scrollTop.classList.toggle("hidden", window.scrollY < 400);
    }, { passive: true });
    $scrollTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ── 14. Terminal keystroke routing (desktop only) ────────────────────────
  if (!IS_TOUCH) {
    let keyBuffer  = "";
    let cmdTimeout;
    const $cmdOverlay = document.getElementById("cmd-overlay");
    const $cmdText    = document.getElementById("cmd-text");

    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (!/^[a-zA-Z0-9]$/.test(e.key)) return;

      keyBuffer += e.key.toLowerCase();
      $cmdText.textContent = keyBuffer.toUpperCase();
      $cmdOverlay.classList.remove("hidden");

      if (shortcutMap.has(keyBuffer)) {
        $cmdText.textContent      = "ROUTING...";
        $cmdText.style.color      = "#fff";
        setTimeout(() => { window.open(shortcutMap.get(keyBuffer), "_blank"); resetBuffer(); }, 300);
      } else if (keyBuffer.length >= 2) {
        setTimeout(resetBuffer, 500);
      }

      clearTimeout(cmdTimeout);
      cmdTimeout = setTimeout(resetBuffer, 2000);
    });

    function resetBuffer() {
      keyBuffer = "";
      $cmdOverlay.classList.add("hidden");
      $cmdText.style.color = "var(--accent)";
    }
  }
});

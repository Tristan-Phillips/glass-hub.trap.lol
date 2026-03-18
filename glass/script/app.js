document.addEventListener("DOMContentLoaded", async () => {
  // 1. Fetch Data
  const [hostRes, extRes, guideRes, botsRes] = await Promise.all([
    fetch("glass/data/hosting.json"),
    fetch("glass/data/extlinks.json"),
    fetch("glass/data/guides.json"),
    fetch("glass/data/bots.json"),
  ]);

  const hostingData = await hostRes.json();
  const extData = await extRes.json();
  const guideData = await guideRes.json();
  const botsData = await botsRes.json();

  // 2. Render Self-Hosted
  const hostGrid = document.getElementById("hosting-grid");
  hostingData.forEach((node) => {
    hostGrid.innerHTML += `
            <a href="${node.url}" class="card-primary">
                <i class="${node.icon}"></i>
                <div>
                    <h3>${node.name}</h3>
                </div>
            </a>
        `;
  });

  // Render Active Agents (Bots)
  const botsContainer = document.getElementById("bots-container");
  botsData.forEach((bot) => {
    botsContainer.innerHTML += `
            <div class="bot-profile">
                <div class="bot-avatar">
                    <i class="${bot.icon}"></i>
                    <div class="bot-status ${bot.status}"></div>
                </div>
                <div class="agent-tooltip">
                    <span class="agent-id">ID: ${bot.name.toUpperCase()}</span>
                    <p>${bot.description}</p>
                </div>
                <span class="bot-name">${bot.name}</span>
                <div class="bot-actions">
                    <a href="${bot.chat_url}" target="_blank" class="bot-btn chat" title="Message Bot">
                        <i class="fa-regular fa-comment-dots"></i>
                    </a>
                    <a href="${bot.repo_url}" target="_blank" class="bot-btn code" title="View Source Code">
                        <i class="fa-solid fa-code-branch"></i>
                    </a>
                </div>
            </div>
        `;
  });

  // 3. Render External Links
  const extContainer = document.getElementById("extlinks-container");
  const shortcutMap = new Map();

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

    // Wrap the links in the new 'ext-list' div
    extContainer.innerHTML += `
            <div class="ext-category">
                <h3>${category.category}</h3>
                <div class="ext-list">${linksHTML}</div>
            </div>
        `;
  });

  // 4. Render Guides
  const guidesCarousel = document.getElementById("guides-carousel");
  guideData.forEach((guide) => {
    guidesCarousel.innerHTML += `
            <a href="guide/?md=${guide.file}" class="card-guide">
                <i class="${guide.icon} fa-2x"></i>
                <h3>${guide.title}</h3>
                <span class="guide-meta">ETA: ${guide.read_time}</span>
            </a>
        `;
  });

  // 5. The "Terminal Keystroke" Logic
  let keyBuffer = "";
  let cmdTimeout;
  const cmdOverlay = document.getElementById("cmd-overlay");
  const cmdText = document.getElementById("cmd-text");

  document.addEventListener("keydown", (e) => {
    // Ignore if user is typing in an input field (if you add a search bar later)
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    // Only accept letters and numbers
    if (!/^[a-zA-Z0-9]$/.test(e.key)) return;

    keyBuffer += e.key.toLowerCase();

    // Show overlay
    cmdText.textContent = keyBuffer.toUpperCase();
    cmdOverlay.classList.remove("hidden");

    // Check if buffer matches a shortcut
    if (shortcutMap.has(keyBuffer)) {
      const targetUrl = shortcutMap.get(keyBuffer);
      cmdText.textContent = "ROUTING...";
      cmdText.style.color = "#fff";

      setTimeout(() => {
        window.open(targetUrl, "_blank");
        resetBuffer();
      }, 300);
    } else if (keyBuffer.length >= 2) {
      // If length is 2 and no match, reset (since shortcuts are format A1)
      setTimeout(resetBuffer, 500);
    }

    // Auto-clear buffer if they stop typing for 2 seconds
    clearTimeout(cmdTimeout);
    cmdTimeout = setTimeout(resetBuffer, 2000);
  });

  function resetBuffer() {
    keyBuffer = "";
    cmdOverlay.classList.add("hidden");
    cmdText.style.color = "var(--accent)";
  }
});

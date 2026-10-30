/* ============================================================
   AVATAR RANKED — LIVE OVERLAY (standalone)
   Kéo dữ liệu bảng live từ API của website theo thời gian thực.
   Không dùng React, không build; chạy trực tiếp trong OBS.
   ============================================================ */

(() => {
  "use strict";

  const CONFIG = Object.assign(
    {
      apiBase: "https://avatar-ranked-roblox.vercel.app",
      pollMs: 1000,
      rotateMs: 10000,
      highlightMs: 8000,
      pageSize: 6,
      align: "left",
    },
    window.LIVE_OVERLAY_CONFIG || {},
  );

  const params = new URLSearchParams(window.location.search);
  const apiBase = String(params.get("api") || CONFIG.apiBase || "").replace(/\/+$/, "");
  const apiUrl = apiBase ? `${apiBase}/api/live/board` : "/api/live/board";
  const pollMs = intParam("poll", CONFIG.pollMs, 500, 30000);
  const rotateMs = intParam("rotate", CONFIG.rotateMs, 3000, 120000);
  const highlightMs = intParam("highlight", CONFIG.highlightMs, 1000, 60000);
  const pageSize = intParam("size", CONFIG.pageSize, 3, 12);
  const align = ["left", "center", "right"].includes(params.get("align"))
    ? params.get("align")
    : CONFIG.align;
  const solid = params.get("bg") === "solid";

  const stageEl = document.getElementById("stage");
  const statusEl = document.getElementById("status");
  const statusLabelEl = document.getElementById("status-label");
  const totalEl = document.getElementById("total");
  const emptyEl = document.getElementById("empty");
  const rowsEl = document.getElementById("rows");
  const progressEl = document.getElementById("progress");
  const progressBarEl = document.getElementById("progress-bar");
  const rangeEl = document.getElementById("range");
  const dotsEl = document.getElementById("dots");
  const pageInfoEl = document.getElementById("page-info");
  const offlineEl = document.getElementById("offline");

  if (stageEl) {
    stageEl.dataset.align = align;
    stageEl.dataset.bg = solid ? "solid" : "transparent";
  }

  /** Bảng màu bậc avatar, khớp với website. */
  const TIERS = {
    COMMON: { color: "#94a3b8", glow: "rgba(148,163,184,0.3)" },
    UNCOMMON: { color: "#4ade80", glow: "rgba(74,222,128,0.45)" },
    RARE: { color: "#38bdf8", glow: "rgba(56,189,248,0.6)" },
    EPIC: { color: "#c084fc", glow: "rgba(192,132,252,0.7)" },
    LEGENDARY: { color: "#fbbf24", glow: "rgba(251,191,36,0.85)" },
    MYTHICAL: { color: "#ff007f", glow: "rgba(255,0,127,0.95)" },
  };

  const FALLBACK_GRADIENTS = [
    ["#46c8ff", "#a855f7"],
    ["#ff4fd8", "#a855f7"],
    ["#5eead4", "#46c8ff"],
    ["#fbbf24", "#ff4fd8"],
    ["#a855f7", "#46c8ff"],
  ];

  let entries = [];
  let page = 1;
  let newId = null;
  let lastScannedAt = null;
  let lastSignature = "";
  let failures = 0;
  let pollTimer = null;
  let rotateTimer = null;
  let highlightTimer = null;
  let disposed = false;

  function intParam(name, fallback, min, max) {
    const raw = Number.parseInt(params.get(name) || "", 10);
    if (!Number.isFinite(raw)) return fallback;
    return Math.min(max, Math.max(min, raw));
  }

  function formatScore10(score) {
    const safe = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
    return (safe / 10).toFixed(1);
  }

  function setStatus(state) {
    statusEl.dataset.status = state;
    statusLabelEl.textContent =
      state === "live" ? "Live" : state === "offline" ? "Offline" : "Đang nối";
  }

  function initials(name) {
    const letters = String(name || "?")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("");
    return (letters || "?").toUpperCase();
  }

  function avatarFallback(entry) {
    const palette = FALLBACK_GRADIENTS[hash(entry.id) % FALLBACK_GRADIENTS.length];
    const fallback = document.createElement("span");
    fallback.className = "avatar-fallback";
    fallback.style.background = `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
    fallback.textContent = initials(entry.displayName || entry.username);
    return fallback;
  }

  function hash(value) {
    let result = 0;
    const text = String(value || "");
    for (let i = 0; i < text.length; i += 1) {
      result = (result * 31 + text.charCodeAt(i)) >>> 0;
    }
    return result;
  }

  function tierStyle(element, tier) {
    const colors = TIERS[tier] || TIERS.COMMON;
    element.style.color = colors.color;
    element.style.borderColor = `${colors.color}88`;
    element.style.backgroundColor = `${colors.color}1f`;
    element.style.boxShadow = `0 0 14px ${colors.glow}`;
  }

  function buildRow(entry, rank, isNew) {
    const row = document.createElement("li");
    row.className = isNew ? "row is-new" : "row";
    row.dataset.id = entry.id;

    const rankEl = document.createElement("span");
    rankEl.className = "rank";
    rankEl.textContent = String(rank);
    rankEl.setAttribute("aria-label", `Hạng ${rank}`);
    if (rank <= 3) rankEl.dataset.rank = String(rank);

    const avatarEl = document.createElement("span");
    avatarEl.className = "avatar";
    if (entry.avatarUrl) {
      const image = document.createElement("img");
      image.alt = `Avatar của ${entry.displayName || entry.username}`;
      image.loading = "eager";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      image.src = entry.avatarUrl;
      image.addEventListener(
        "error",
        () => {
          image.remove();
          avatarEl.append(avatarFallback(entry));
        },
        { once: true },
      );
      avatarEl.append(image);
    } else {
      avatarEl.append(avatarFallback(entry));
    }

    const playerEl = document.createElement("div");
    playerEl.className = "player";

    const nameLine = document.createElement("div");
    nameLine.className = "player-name";

    const nameEl = document.createElement("p");
    nameEl.className = "name";
    nameEl.textContent = entry.displayName || entry.username;
    nameEl.title = entry.displayName || entry.username;
    nameLine.append(nameEl);

    if (isNew) {
      const badge = document.createElement("span");
      badge.className = "badge-new";
      badge.textContent = "✦ Mới";
      nameLine.append(badge);
    }

    const metaEl = document.createElement("div");
    metaEl.className = "player-meta";

    const usernameEl = document.createElement("span");
    usernameEl.className = "username";
    usernameEl.textContent = `@${entry.username}`;

    const tierEl = document.createElement("span");
    tierEl.className = "tier";
    tierEl.textContent = entry.tier;
    tierStyle(tierEl, entry.tier);

    metaEl.append(usernameEl, tierEl);
    playerEl.append(nameLine, metaEl);

    const scoreEl = document.createElement("p");
    scoreEl.className = "score";
    scoreEl.setAttribute("aria-label", `${formatScore10(entry.score)} trên 10`);

    const scoreNum = document.createElement("span");
    scoreNum.className = "score-num";
    scoreNum.textContent = formatScore10(entry.score);

    const scoreDen = document.createElement("span");
    scoreDen.className = "score-den";
    scoreDen.textContent = "/10";

    scoreEl.append(scoreNum, scoreDen);
    row.append(rankEl, avatarEl, playerEl, scoreEl);
    return row;
  }

  function renderDots(totalPages) {
    dotsEl.replaceChildren();
    dotsEl.hidden = totalPages <= 1;
    if (totalPages <= 1) return;

    for (let index = 1; index <= totalPages; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = index === page ? "dot is-active" : "dot";
      dot.setAttribute("aria-label", `Trang ${index}`);
      if (index === page) dot.setAttribute("aria-current", "page");
      dot.addEventListener("click", () => {
        if (page === index) return;
        page = index;
        newId = null;
        render();
      });
      dotsEl.append(dot);
    }
  }

  function stopRotation() {
    if (rotateTimer !== null) {
      window.clearTimeout(rotateTimer);
      rotateTimer = null;
    }
    progressBarEl.classList.remove("is-running");
    progressBarEl.style.animationDuration = "";
  }

  function startRotation(totalPages, holdMs = 0) {
    stopRotation();
    if (totalPages <= 1) return;

    const duration = rotateMs + holdMs;
    progressBarEl.style.animationDuration = `${duration}ms`;
    // Ép trình duyệt chạy lại animation từ đầu.
    void progressBarEl.offsetWidth;
    progressBarEl.classList.add("is-running");

    rotateTimer = window.setTimeout(() => {
      page = page >= totalPages ? 1 : page + 1;
      render();
    }, duration);
  }

  function render(options = {}) {
    const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    totalEl.textContent = String(entries.length).padStart(2, "0");
    emptyEl.hidden = entries.length > 0;
    rowsEl.hidden = entries.length === 0;

    const start = (page - 1) * pageSize;
    const items = entries.slice(start, start + pageSize);

    rowsEl.replaceChildren(
      ...items.map((entry, index) => buildRow(entry, start + index + 1, entry.id === newId)),
    );

    rangeEl.textContent =
      entries.length === 0
        ? "Chưa có dữ liệu"
        : `${start + 1}–${start + items.length} / ${entries.length} avatar`;

    progressEl.hidden = totalPages <= 1;
    renderDots(totalPages);

    pageInfoEl.textContent =
      failures > 0
        ? "Đang thử lại…"
        : totalPages > 1
          ? `Trang ${page}/${totalPages} · Tự động`
          : "Tự động cập nhật";

    startRotation(totalPages, options.holdMs || 0);
  }

  function signatureOf(list) {
    return list
      .map(
        (entry) =>
          `${entry.id}:${entry.score}:${entry.aiScore}:${entry.tier}:${entry.displayName}:${entry.avatarUrl || ""}`,
      )
      .join("|");
  }

  function ingest(nextEntries) {
    const list = Array.isArray(nextEntries) ? nextEntries : [];
    const signature = signatureOf(list);

    const latest = list.reduce(
      (best, entry) => (!best || entry.scannedAt > best.scannedAt ? entry : best),
      null,
    );

    const firstLoad = lastScannedAt === null;
    if (firstLoad) {
      lastScannedAt = latest ? latest.scannedAt : 0;
    }

    const hasNewScan =
      !firstLoad && latest && latest.scannedAt > 0 && latest.scannedAt > lastScannedAt;

    entries = list;

    if (hasNewScan) {
      lastScannedAt = latest.scannedAt;
      const rank = entries.findIndex((entry) => entry.id === latest.id) + 1;

      if (rank > 0) {
        page = Math.floor((rank - 1) / pageSize) + 1;
        newId = latest.id;
        lastSignature = signature;

        if (highlightTimer !== null) window.clearTimeout(highlightTimer);
        highlightTimer = window.setTimeout(() => {
          newId = null;
          highlightTimer = null;
          render();
        }, highlightMs);

        render({ holdMs: highlightMs });
        return;
      }
    }

    if (firstLoad || signature !== lastSignature) {
      lastSignature = signature;
      // Nếu entry đang highlight bị rớt khỏi bảng thì bỏ highlight.
      if (newId && !entries.some((entry) => entry.id === newId)) {
        newId = null;
      }
      render();
    }
  }

  function schedule() {
    if (disposed) return;
    const delay =
      failures > 0 ? Math.min(5000, pollMs * Math.min(6, failures + 1)) : pollMs;
    pollTimer = window.setTimeout(poll, delay);
  }

  async function poll() {
    if (disposed) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(apiUrl, {
        cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      failures = 0;
      setStatus("live");
      offlineEl.hidden = true;
      ingest(data.entries);
    } catch (error) {
      if (disposed) return;
      failures += 1;
      setStatus("offline");
      offlineEl.hidden = false;
      pageInfoEl.textContent = "Đang thử lại…";
      console.error("[live-overlay] Không tải được bảng live:", error);
    } finally {
      window.clearTimeout(timeout);
      schedule();
    }
  }

  function destroy() {
    disposed = true;
    stopRotation();
    if (pollTimer !== null) window.clearTimeout(pollTimer);
    if (highlightTimer !== null) window.clearTimeout(highlightTimer);
  }

  window.addEventListener("pagehide", destroy, { once: true });
  window.addEventListener("beforeunload", destroy, { once: true });

  render();
  void poll();
})();

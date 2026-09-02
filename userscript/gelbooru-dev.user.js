// ==UserScript==
// @name        Gelbooru Catppuccin — live inject
// @namespace   https://github.com/nils-affentranger
// @version     1.5.0
// @description Development injector: live CSS, overlay to toggle bundles, snapshot capture
// @match       https://gelbooru.com/*
// @grant       GM_xmlhttpRequest
// @connect     127.0.0.1
// @connect     localhost
// @connect     gelbooru.com
// @run-at      document-start
// ==/UserScript==

(() => {
  const HOST = "http://127.0.0.1:3847";
  const POLL_MS = 400;
  const STORAGE_KEY = "gelbooru-dev-overlay-v1";
  const HOST_ID = "gelbooru-dev-overlay";

  const defaults = {
    overlayOpen: false,
    stylesOn: true,
    siteCss: true,
    blackoutMedia: false,
    disabled: {},
    pos: null,
  };

  const DRAG_THRESHOLD = 3;

  const BLACKOUT_CSS = `
    main img:not(.voteUpComment, .reportComment),
    main video,
    main canvas,
    article img,
    #image,
    img.webm,
    .commentThumbnail img,
    .thumbnail-preview img,
    .image-container img,
    .image-container video,
    .image-container canvas,
    .profileAvatar {
      filter: contrast(0) brightness(0.22) !important;
    }

    .profileAvatar {
      background-image: none !important;
      background-color: #313244 !important;
    }
  `;

  let state = loadState();
  let styleEls = new Map();
  let blackoutEl = null;
  let bundles = [];
  let generation = 0;
  let compileError = null;
  let online = false;
  let warnedOffline = false;
  let hostEl = null;
  let shadow = null;
  let toastTimer = 0;
  let drag = null;
  let suppressClick = false;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        ...defaults,
        ...parsed,
        disabled: { ...defaults.disabled, ...(parsed.disabled || {}) },
      };
    } catch {
      return { ...defaults };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          overlayOpen: state.overlayOpen,
          stylesOn: state.stylesOn,
          siteCss: state.siteCss,
          blackoutMedia: state.blackoutMedia,
          disabled: state.disabled,
          pos: state.pos,
        }),
      );
    } catch {
      /* ignore quota / privacy mode */
    }
  }

  function gmFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: options.method || "GET",
        url,
        data: options.body,
        headers: {
          "Cache-Control": "no-cache",
          ...(options.headers || {}),
        },
        onload: (response) => {
          if (response.status >= 200 && response.status < 300) {
            resolve(response.responseText);
          } else {
            reject(new Error(`HTTP ${response.status}`));
          }
        },
        onerror: () => reject(new Error("network error")),
        ontimeout: () => reject(new Error("timeout")),
        timeout: options.timeout ?? 30000,
      });
    });
  }

  function isDevNode(el) {
    return el?.getAttribute?.("data-gelbooru-dev") != null || el?.id === HOST_ID;
  }

  function applyThemeCss() {
    const keep = new Set();

    for (const bundle of bundles) {
      if (!bundle.matches || bundle.css == null) {
        continue;
      }

      keep.add(bundle.id);
      let el = styleEls.get(bundle.id);
      if (!el?.isConnected) {
        el = document.createElement("style");
        el.setAttribute("data-gelbooru-dev", bundle.id);
        (document.head || document.documentElement).appendChild(el);
        styleEls.set(bundle.id, el);
      }
      if (el.textContent !== bundle.css) {
        el.textContent = bundle.css;
      }
      el.disabled = !state.stylesOn || !!state.disabled[bundle.id];
    }

    for (const [id, el] of styleEls) {
      if (!keep.has(id)) {
        el.remove();
        styleEls.delete(id);
      }
    }
  }

  function applyBlackout() {
    if (!blackoutEl?.isConnected) {
      blackoutEl = document.querySelector("style[data-gelbooru-dev='blackout']");
      if (!blackoutEl) {
        blackoutEl = document.createElement("style");
        blackoutEl.setAttribute("data-gelbooru-dev", "blackout");
      }
      (document.head || document.documentElement).appendChild(blackoutEl);
    }

    if (blackoutEl.textContent !== BLACKOUT_CSS) {
      blackoutEl.textContent = BLACKOUT_CSS;
    }
    blackoutEl.disabled = !state.blackoutMedia;
  }

  function applySiteCss() {
    for (const el of document.querySelectorAll("link[rel*='stylesheet'], style")) {
      if (isDevNode(el)) {
        continue;
      }
      el.disabled = !state.siteCss;
    }
  }

  function observeSiteCss() {
    new MutationObserver((mutations) => {
      if (state.siteCss) {
        return;
      }
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) {
            continue;
          }
          if (
            (node.matches?.("link[rel*='stylesheet'], style") && !isDevNode(node)) ||
            node.querySelector?.("link[rel*='stylesheet'], style")
          ) {
            applySiteCss();
            return;
          }
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  const overlayCss = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .ui {
      pointer-events: auto;
      font: 12px/1.35 ui-sans-serif, system-ui, sans-serif;
      color: #cdd6f4;
      -webkit-font-smoothing: antialiased;
    }
    .fab, .panel, .toast {
      background: #1e1e2e;
      color: #cdd6f4;
      font: inherit;
      box-shadow: 0 8px 28px rgba(0, 0, 0, .45);
    }
    .fab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid #45475a;
      border-radius: 999px;
      cursor: grab;
      touch-action: none;
      user-select: none;
    }
    .fab:hover { border-color: #89b4fa; }
    .panel {
      width: 252px;
      border: 1px solid #45475a;
      border-radius: 10px;
      overflow: hidden;
    }
    .fab[hidden], .panel[hidden], .toast[hidden] { display: none; }
    header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: #181825;
      border-bottom: 1px solid #313244;
      cursor: grab;
      touch-action: none;
      user-select: none;
    }
    .dragging .fab, .dragging header { cursor: grabbing; }
    .dragging { user-select: none; }
    header strong { font-weight: 650; }
    .grow { flex: 1; }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #89b4fa;
      flex: none;
    }
    .dot.warn { background: #f9e2af; }
    .dot.err { background: #f38ba8; }
    .status {
      color: #6c7086;
      font-size: 11px;
    }
    button.icon {
      background: none;
      border: 0;
      color: #a6adc8;
      cursor: pointer;
      font: 14px/1 inherit;
      padding: 0 2px;
    }
    button.icon:hover { color: #cdd6f4; }
    .body { padding: 8px 10px 10px; }
    .toggles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 4px;
    }
    .toggles .wide { grid-column: 1 / -1; }
    label.chk {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .sec {
      color: #6c7086;
      font-size: 10px;
      font-weight: 650;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin: 8px 0 4px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 1px 0;
    }
    .row > .chk { flex: 1; min-width: 0; }
    .row.dim { color: #6c7086; }
    .row .name { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .only {
      background: none;
      border: 0;
      color: #89b4fa;
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      padding: 0;
      opacity: 0;
    }
    .row:hover .only, .only:focus { opacity: 1; }
    .error {
      margin: 0 0 8px;
      padding: 6px 8px;
      background: #313244;
      color: #f38ba8;
      border-radius: 6px;
      max-height: 7.5em;
      overflow: auto;
      white-space: pre-wrap;
      font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .actions { display: flex; gap: 6px; margin-top: 8px; }
    .actions button {
      flex: 1;
      background: #313244;
      border: 1px solid #45475a;
      color: #cdd6f4;
      border-radius: 6px;
      padding: 5px 8px;
      cursor: pointer;
      font: inherit;
    }
    .actions button:hover { border-color: #89b4fa; }
    .hint { margin-top: 6px; color: #6c7086; font-size: 10px; }
    .toast {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      width: max-content;
      max-width: 280px;
      padding: 8px 10px;
      border: 1px solid #89b4fa;
      border-radius: 8px;
    }
    input { accent-color: #89b4fa; }
  `;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function sortedBundles() {
    return [...bundles].sort((a, b) => {
      if (a.matches !== b.matches) {
        return a.matches ? -1 : 1;
      }
      if (a.id === "base") {
        return -1;
      }
      if (b.id === "base") {
        return 1;
      }
      return a.id.localeCompare(b.id);
    });
  }

  function bundleSection(title, items, showOnly) {
    if (!items.length) {
      return "";
    }

    const rows = items
      .map((bundle) => {
        const checked = state.disabled[bundle.id] ? "" : " checked";
        const dim = bundle.matches ? "" : " dim";
        const only = showOnly
          ? `<button class="only" type="button" data-solo="${escapeHtml(bundle.id)}">only</button>`
          : "";
        return `<div class="row${dim}" title="${escapeHtml(bundle.document)}">
          <label class="chk">
            <input type="checkbox" data-bundle="${escapeHtml(bundle.id)}"${checked}>
            <span class="name">${escapeHtml(bundle.id)}</span>
          </label>
          ${only}
        </div>`;
      })
      .join("");

    return `<div class="sec">${title}</div>${rows}`;
  }

  function $ (sel) {
    return shadow.querySelector(sel);
  }

  function clampPosition(pos) {
    const rect = hostEl?.getBoundingClientRect();
    const maxTop = Math.max(window.innerHeight - (rect?.height || 0), 0);
    const maxRight = Math.max(window.innerWidth - (rect?.width || 0), 0);
    return {
      top: Math.round(Math.min(Math.max(pos.top, 0), maxTop)),
      right: Math.round(Math.min(Math.max(pos.right, 0), maxRight)),
    };
  }

  function applyOverlayPosition() {
    if (!hostEl) {
      return;
    }

    const pos = state.pos || { top: 12, right: 12 };
    hostEl.style.cssText = [
      "all:initial !important",
      "position:fixed !important",
      "z-index:2147483647 !important",
      `top:${pos.top}px !important`,
      `right:${pos.right}px !important`,
      "display:block !important",
      "width:auto !important",
      "height:auto !important",
      "pointer-events:none !important",
    ].join(";");
  }

  function onDragStart(event) {
    if (event.button !== 0 || drag) {
      return;
    }

    const handle = event.target.closest?.(".fab, header");
    if (!handle || event.target.closest("button.icon, input, .only")) {
      return;
    }

    const rect = hostEl.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      top: rect.top,
      right: window.innerWidth - rect.right,
      moved: false,
    };
    window.addEventListener("pointermove", onDragMove, true);
    window.addEventListener("pointerup", onDragEnd, true);
    window.addEventListener("pointercancel", onDragEnd, true);
    event.preventDefault();
  }

  function onDragMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
      return;
    }

    drag.moved = true;
    $(".ui").classList.add("dragging");
    state.pos = clampPosition({ top: drag.top + dy, right: drag.right - dx });
    applyOverlayPosition();
    event.preventDefault();
  }

  function onDragEnd(event) {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    window.removeEventListener("pointermove", onDragMove, true);
    window.removeEventListener("pointerup", onDragEnd, true);
    window.removeEventListener("pointercancel", onDragEnd, true);
    $(".ui").classList.remove("dragging");
    suppressClick = drag.moved;
    drag = null;
    if (suppressClick) {
      saveState();
    }
  }

  function mount() {
    if (hostEl?.isConnected) {
      return;
    }

    hostEl = document.getElementById(HOST_ID) || document.createElement("div");
    hostEl.id = HOST_ID;
    hostEl.setAttribute("data-gelbooru-dev", "overlay");
    applyOverlayPosition();

    shadow = hostEl.shadowRoot || hostEl.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>${overlayCss}</style>
      <div class="ui">
        <div class="toast" hidden></div>
        <button class="fab" type="button" data-act="open" hidden title="Dev overlay (Alt+Shift+D)">
          <span class="dot"></span>dev
        </button>
        <div class="panel" hidden>
          <header>
            <span class="dot"></span>
            <strong>dev</strong>
            <span class="status grow"></span>
            <button class="icon" type="button" data-act="collapse" title="Collapse">–</button>
          </header>
          <div class="body">
            <pre class="error" hidden></pre>
            <div class="toggles">
              <label class="chk" title="Injected Catppuccin theme">
                <input type="checkbox" data-act="styles"> Theme
              </label>
              <label class="chk" title="Gelbooru's own stylesheets">
                <input type="checkbox" data-act="site"> Site CSS
              </label>
              <label class="chk wide" title="Grey out post images, thumbnails, and video">
                <input type="checkbox" data-act="blackout"> Black out media
              </label>
            </div>
            <div class="bundles"></div>
            <div class="actions">
              <button type="button" data-act="snapshot">Snapshot</button>
              <button type="button" data-act="reset">Reset</button>
            </div>
            <div class="hint">Alt+Shift+D overlay · Alt+Shift+S snapshot + previews</div>
          </div>
        </div>
      </div>
    `;

    shadow.addEventListener("click", onOverlayClick);
    shadow.addEventListener("change", onOverlayChange);
    for (const type of ["mousedown", "mouseup", "pointerdown"]) {
      shadow.addEventListener(type, (event) => event.stopPropagation());
    }
    shadow.addEventListener("pointerdown", onDragStart);
    (document.documentElement || document.body).appendChild(hostEl);
    renderOverlay();
  }

  function onOverlayClick(event) {
    event.stopPropagation();
    if (suppressClick) {
      suppressClick = false;
      event.preventDefault();
      return;
    }
    const act = event.target.closest("[data-act], [data-solo]");
    if (!act) {
      return;
    }

    if (act.dataset.act === "open") {
      state.overlayOpen = true;
    } else if (act.dataset.act === "collapse") {
      state.overlayOpen = false;
    } else if (act.dataset.act === "snapshot") {
      snapshot();
    } else if (act.dataset.act === "reset") {
      state.stylesOn = true;
      state.siteCss = true;
      state.blackoutMedia = false;
      state.disabled = {};
      state.pos = null;
      applyOverlayPosition();
      applySiteCss();
      applyThemeCss();
      applyBlackout();
    } else if (act.dataset.solo) {
      for (const bundle of bundles) {
        if (!bundle.matches) {
          continue;
        }
        if (bundle.id === act.dataset.solo) {
          delete state.disabled[bundle.id];
        } else {
          state.disabled[bundle.id] = true;
        }
      }
      state.stylesOn = true;
      applyThemeCss();
    } else {
      return;
    }

    event.preventDefault();
    saveState();
    renderOverlay();
  }

  function onOverlayChange(event) {
    event.stopPropagation();
    const target = event.target;
    if (target.dataset.act === "styles") {
      state.stylesOn = target.checked;
      applyThemeCss();
    } else if (target.dataset.act === "site") {
      state.siteCss = target.checked;
      applySiteCss();
    } else if (target.dataset.act === "blackout") {
      state.blackoutMedia = target.checked;
      applyBlackout();
    } else if (target.dataset.bundle) {
      if (target.checked) {
        delete state.disabled[target.dataset.bundle];
      } else {
        state.disabled[target.dataset.bundle] = true;
      }
      applyThemeCss();
    } else {
      return;
    }

    saveState();
    renderOverlay();
  }

  function statusInfo() {
    if (!online) {
      return { cls: "err", text: "offline" };
    }
    if (compileError) {
      return { cls: "err", text: "sass" };
    }
    if (!state.stylesOn) {
      return { cls: "warn", text: "off" };
    }
    if (generation) {
      return { cls: "", text: `live ${generation}` };
    }
    return { cls: "", text: "live" };
  }

  function renderOverlay() {
    if (!shadow) {
      return;
    }

    const { cls, text } = statusInfo();
    for (const dot of shadow.querySelectorAll(".dot")) {
      dot.className = `dot ${cls}`.trim();
    }
    $(".status").textContent = text;
    $(".fab").hidden = state.overlayOpen;
    $(".panel").hidden = !state.overlayOpen;
    $("[data-act='styles']").checked = state.stylesOn;
    $("[data-act='site']").checked = state.siteCss;
    $("[data-act='blackout']").checked = state.blackoutMedia;

    const errorEl = $(".error");
    if (compileError) {
      errorEl.hidden = false;
      errorEl.textContent = compileError;
    } else {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    if (state.pos) {
      state.pos = clampPosition(state.pos);
      applyOverlayPosition();
    }

    const sorted = sortedBundles();
    const matching = sorted.filter((bundle) => bundle.matches);
    const other = sorted.filter((bundle) => !bundle.matches);
    $(".bundles").innerHTML =
      bundleSection("this page", matching, true) +
      bundleSection("other pages", other, false);
  }

  function toast(message) {
    mount();
    const el = $(".toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4500);
  }

  async function snapshot() {
    toast("Capturing snapshot…");
    try {
      const src = await gmFetch(`${HOST}/snapshot-capture.js`);
      const result = await new Function("host", "gmFetch", src)(HOST, gmFetch);
      const extra = result.notes?.length ? ` (${result.notes.join("; ")})` : "";
      toast(`Saved snapshots/pages/${result.id}.html${extra}`);
    } catch (error) {
      toast(`Snapshot failed: ${error.message}`);
      console.error("[gelbooru-dev] snapshot", error);
    }
  }

  async function tick() {
    mount();
    try {
      const url = `${HOST}/dev.json?href=${encodeURIComponent(location.href)}&generation=${generation}`;
      const data = JSON.parse(await gmFetch(url, { timeout: 3000 }));
      const wasOffline = !online;
      online = true;
      warnedOffline = false;

      if (data.unchanged) {
        const nextError = data.error || null;
        if (compileError !== nextError || wasOffline) {
          compileError = nextError;
          renderOverlay();
        }
        return;
      }

      generation = data.generation;
      compileError = data.error || null;
      bundles = data.bundles || [];
      applyThemeCss();
      renderOverlay();
    } catch {
      if (online || !warnedOffline) {
        online = false;
        renderOverlay();
      }
      if (!warnedOffline) {
        warnedOffline = true;
        console.warn(
          "[gelbooru-dev] dev server is not reachable at",
          HOST,
          "— run `npm run dev`",
        );
      }
    }
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (!event.altKey || !event.shiftKey || event.repeat) {
        return;
      }
      if (event.code === "KeyS") {
        event.preventDefault();
        event.stopPropagation();
        snapshot();
      } else if (event.code === "KeyD") {
        event.preventDefault();
        event.stopPropagation();
        state.overlayOpen = !state.overlayOpen;
        saveState();
        mount();
        renderOverlay();
      }
    },
    true,
  );

  window.addEventListener("resize", () => {
    if (state.pos && hostEl) {
      state.pos = clampPosition(state.pos);
      applyOverlayPosition();
    }
  });

  observeSiteCss();
  applySiteCss();
  applyBlackout();
  document.addEventListener("DOMContentLoaded", applySiteCss);
  document.addEventListener("gelbooru-dev-toast", (event) => {
    if (event.detail) {
      toast(String(event.detail));
    }
  });
  tick();
  setInterval(tick, POLL_MS);
})();

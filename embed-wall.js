/* embed-wall.js */
(function () {
  if (window.__EW_BOOTING__) return; // simple re-entry guard
  window.__EW_BOOTING__ = true;

  // ---- 1) BASIS-PFAD ERMITTELN ----
  // Priorität:
  //   a) window.EVENT_WALL_BASE (z.B. "/assets/event-wall/")
  //   b) data-base am <script> Tag
  //   c) automatisch aus der eigenen src: ".../embed-wall.js" -> ".../"
  const guessBaseFromScript = () => {
    // bevorzugt: currentScript
    const cs = document.currentScript;
    if (cs && cs.src) return cs.src.replace(/[^/]+$/, "");
    // fallback: letztes Skript, das nach embed-wall(.min)?.js aussieht
    const scripts = Array.from(document.getElementsByTagName("script"));
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      if (s.src && /embed-wall(\.min)?\.js(\?.*)?$/.test(s.src)) {
        return s.src.replace(/[^/]+$/, "");
      }
    }
    // ultimatives Fallback: relative Wurzel
    return "./";
  };

  const currentScript = document.currentScript || (function() {
    const ss = document.getElementsByTagName("script");
    return ss[ss.length - 1] || null;
  })();

  const BASE =
    (window.EVENT_WALL_BASE && String(window.EVENT_WALL_BASE)) ||
    (currentScript && currentScript.getAttribute("data-base")) ||
    guessBaseFromScript();

  // Ensure trailing slash
  const ensureSlash = (s) => (s.endsWith("/") ? s : s + "/");
  const BASE_URL = ensureSlash(BASE);

  // ---- 2) KONFIG AUS GLOBALEN KONSTANTEN ----
  const detectTheme = () => {
    // 1) explicit global override
    if (typeof window.THEME === 'string' && window.THEME.trim()) return window.THEME.trim();

    // 1b) existing container with data-theme (falls schon im Markup vorhanden)
    try {
      const containerPre = document.getElementById('eventwall');
      if (containerPre && containerPre.getAttribute && containerPre.getAttribute('data-theme')) {
        return containerPre.getAttribute('data-theme').trim();
      }
    } catch(_) {}

    // 2) data-theme attribute on <html> or <body>
    const htmlData = document.documentElement && document.documentElement.getAttribute && document.documentElement.getAttribute('data-theme');
    if (htmlData) return htmlData.trim();
    const bodyData = document.body && document.body.getAttribute && document.body.getAttribute('data-theme');
    if (bodyData) return bodyData.trim();

    // 3) any class matching theme-<name> on <html> or <body>
    const findThemeFromClass = (el) => {
      if (!el || !el.classList) return null;
      for (const c of Array.from(el.classList)) {
        const m = c.match(/^theme-(.+)$/i);
        if (m && m[1]) return m[1].toLowerCase();
      }
      return null;
    };
    const byHtmlClass = findThemeFromClass(document.documentElement);
    if (byHtmlClass) return byHtmlClass;
    const byBodyClass = findThemeFromClass(document.body);
    if (byBodyClass) return byBodyClass;

    // fallback
    return 'default';
  };
  let THEME = String(detectTheme()).toLowerCase();  // "light" | "dark" | custom
  const DEFAULT_RELAYS = window.DEFAULT_RELAYS || ["wss://relilab.nostr1.com"];
  const DEFAULT_ALLOWED = window.DEFAULT_ALLOWED || [];
  const DEFAULT_LIMIT = Number(window.DEFAULT_LIMIT || 1000);

  // ---- 3) HELFER: CSS & JS laden ----
  const loadCSS = (href) =>
    new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error("CSS load failed: " + href));
      document.head.appendChild(link);
    });

  const loadJS = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    // kein defer; dynamische Skripte laufen, sobald geladen
    s.onload = res;
    s.onerror = () => rej(new Error('JS load failed: ' + src));
    document.body.appendChild(s);
   });


  // ---- 4) CONTAINER anlegen (#eventwall oder body) ----
  const getContainer = () => {
    let el = document.getElementById("eventwall");
    if (!el) {
      el = document.createElement("div");
      el.id = "eventwall";
      document.body.appendChild(el);
    }
    // Theme als data-Attribut nur setzen, wenn nicht bereits per Markup definiert
    if (!el.hasAttribute('data-theme')) {
      el.setAttribute("data-theme", THEME);
    }
    return el;
  };

  // ---- 5) DOM-Gerüst für Wall einfügen ----
  const injectMarkup = (container) => {
    container.innerHTML = `
      <section class="filter-toolbar" aria-label="Terminfilter">
        <div class="filter-row">
          <div class="field tagbox" style="flex:1 1 360px;">
            <label for="tag-input">Tags</label>
            <input id="tag-input" class="tag-input" type="text"
              placeholder="Tag suchen &amp; Enter zum Hinzufügen"
              autocomplete="off" aria-describedby="tag-help" />
            <div id="tag-suggest" class="suggest" role="listbox" aria-label="Tag-Vorschläge"></div>
          </div>
          <div class="field" style="flex:1 1 280px;">
            <label for="search-input">Suche</label>
            <input id="search-input" type="text" placeholder="Titel &amp; Tags durchsuchen …" />
          </div>
          <div class="field" style="flex:0 0 220px;">
            <label for="month-select">Monat</label>
            <select id="month-select" aria-label="Monat wählen">
              <option value="">Alle Monate</option>
            </select>
          </div>
          <button id="reset-filters" class="btn ghost" title="Alle Filter zurücksetzen">Zurücksetzen</button>
          <div class="result-info" id="result-info">0 Treffer</div>
        </div>
        <div class="filter-row">
          <div id="selected-tags" class="selected-tags" aria-live="polite"></div>
        </div>
      </section>

      <div id="edu-event-wall">
        <div id="loader">Lade Termine...</div>
      </div>

      <div id="event-modal" class="modal" aria-modal="true" role="dialog" aria-labelledby="modal-title">
        <div class="modal-content">
          <button id="close-modal" class="close-button" aria-label="Schließen">×</button>
          <div id="modal-image-container"></div>
          <h2 id="modal-title"></h2>
          <p id="modal-date"></p>
          <div id="modal-details">
            <p><strong>Zusammenfassung:</strong> <span id="modal-summary"></span></p>
            <p><strong>Ort:</strong> <span id="modal-location"></span></p>
            <p><strong>Tags:</strong> <span id="modal-tags"></span></p>
          </div>
          <div id="modal-content-html"></div>
        </div>
      </div>
    `;
  };

  // ---- 6) BOOTSTRAP ----
  document.addEventListener("DOMContentLoaded", async () => {
    const container = getContainer();

    // ---- 6a) DATA-ATTRIBUTE AUSLESEN ----
    const ds = container.dataset || {};
    // Theme override
    if (ds.theme) {
      THEME = String(ds.theme).toLowerCase();
      container.setAttribute('data-theme', THEME);
    }

    // Parse helpers
    const parseList = (val) => (val ? val.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean) : []);

    const relays = parseList(ds.relays).length ? parseList(ds.relays) : DEFAULT_RELAYS;
    const allowed_npub = parseList(ds.npub).length ? parseList(ds.npub) : DEFAULT_ALLOWED;
    const limit = ds.limit ? Number(ds.limit) || DEFAULT_LIMIT : DEFAULT_LIMIT;
    const filterSpec = ds.filter || '';
    const showFilterBar = (ds.showFilterbar || ds.showFilterBar || 'true').toLowerCase() !== 'false';

    console.log("[DEBUG] Event Wall Konfiguration:", {
      BASE_URL,
      THEME,
      relays,
      allowed_npub,
      limit,
      filterSpec,
      showFilterBar,
    });


    // Set initial hash for filter before event-wall.js geladen wird
    // Only set when there is no meaningful existing hash. Treat '#', '#filter' or '#filter=' as empty.
    const isHashMeaningful = () => {
      const h = (location.hash || '').replace(/^#/, '');
      if (!h) return false; // '' or no hash
      // if filter present but empty (filter= or filter) treat as not meaningful
      const m = h.match(/^filter(?:=(.*))?$/i);
      if (m) {
        const val = (m[1] || '').trim();
        return !!val; // meaningful only when a value exists
      }
      // any other non-empty hash we consider meaningful
      return true;
    };

    if (filterSpec && !isHashMeaningful()) {
      // kein encode nötig für Leerzeichen, Parser verarbeitet sie; optional könnte encodeURIComponent genutzt werden
      location.hash = '#filter=' + filterSpec;
    }

    // Globale Optionen für event-wall.js
    window.NOSTR_OPTIONS = {
      relays,
      allowed_npub,
      limit
    };

    injectMarkup(container);
    if (!showFilterBar) {
      const ft = container.querySelector('.filter-toolbar');
      if (ft) ft.style.display = 'none';
    }

    // Styles laden
    const cssPromises = [loadCSS(BASE_URL + "event-wall.css")];
    if (THEME && THEME !== "default") {
      cssPromises.push(loadCSS(BASE_URL + "themes/" + THEME + ".css").catch(() => {}));
    }
    try { await Promise.all(cssPromises); } catch(_) {}

    // API + Hauptlogik
    await loadJS(BASE_URL + 'nostre-api.js').catch(() => {});
    await loadJS(BASE_URL + "event-wall.js");
  });
})();

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
    if (typeof window.THEME === 'string') return window.THEME;
    if (document.body.classList.contains('theme-dark')) return 'dark';
    return 'light';
  };
  const THEME = detectTheme().toLowerCase();  // "light" | "dark" | custom
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
    // Theme als data-Attribut (CSS nutzt Variablen/Scopes)
    el.setAttribute("data-theme", THEME);
    return el;
  };

  // ---- 5) DOM-Gerüst für Wall einfügen ----
  const injectMarkup = (container) => {
    container.innerHTML = `
      <p class="subhead">Klicke auf Tags oder nutze die Filterleiste, um die Ansicht einzugrenzen.</p>
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
    injectMarkup(container);
    
    
    
    // Styles laden
    const cssPromises = [loadCSS(BASE_URL + "event-wall.css")];
    // Theme CSS optional; bei "dark" versuchen wir themes/dark.css zusätzlich
    if (THEME && THEME !== "light") {
      cssPromises.push(loadCSS(BASE_URL + "themes/" + THEME + ".css").catch(() => {}));
    }

    try {
      await Promise.all(cssPromises);
    } catch (_) {
      // CSS-Fehler ignorieren wir hier bewusst, damit die App trotzdem startet
    }

    
    // Globale Defaults für event-wall.js verfügbar machen (falls genutzt)
    window.NOSTR_OPTIONS = {
      relays: DEFAULT_RELAYS,
      allowed_npub: DEFAULT_ALLOWED,
      limit: DEFAULT_LIMIT
      // sinceDays, timeoutMs etc. könnten bei Bedarf ergänzt werden
    };
    await loadJS(BASE_URL + 'nostre-api.js').catch(() => {});
      window.NOSTR_OPTIONS = {
      relays: DEFAULT_RELAYS,
      allowed_npub: DEFAULT_ALLOWED,
      limit: DEFAULT_LIMIT
    };
    // Hauptlogik
    await loadJS(BASE_URL + "event-wall.js");
    // Falls du direkte Nostr-Abfrage brauchst, zuerst nostre-api.js:
    // (event-wall.js nutzt es optional, wenn vorhanden)
    

  });
})();

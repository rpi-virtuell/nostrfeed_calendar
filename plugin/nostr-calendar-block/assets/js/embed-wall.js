/**
 * Nostr Calendar Block - Frontend Initializer
 * Findet alle .nostr-event-wall Container und initialisiert sie.
 */
(function() {
  // Re-entry guard
  if (window.__NOSTR_CALENDAR_INIT__) return;
  window.__NOSTR_CALENDAR_INIT__ = true;

  // Helper: loadJS
  const loadJS = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error('JS load failed: ' + src));
    document.body.appendChild(s);
  });

  // Get plugin base URL
  const getPluginBase = () => {
    // Suche nach diesem Script oder verwende einen Standard-Pfad
    const scripts = Array.from(document.getElementsByTagName('script'));
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      if (s.src && /nostr-calendar-block|embed-wall/.test(s.src)) {
        return s.src.replace(/[^/]+\.js.*$/, '');
      }
    }
    // Fallback: wp-content/plugins/nostr-calendar-block/assets/js/
    return '/wp-content/plugins/nostr-calendar-block/assets/js/';
  };

  const pluginBase = getPluginBase();
  const assetsBase = pluginBase.replace(/\/assets\/js\/$/, '/assets/');

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', async () => {
    const wallContainers = document.querySelectorAll('.nostr-event-wall');

    if (wallContainers.length === 0) return;

    // Load core API
    try {
      await loadJS(assetsBase + 'js/nostre-api.js');
    } catch (err) {
      console.warn('Failed to load Nostr API:', err);
    }

    // Process each wall container
    wallContainers.forEach((container, index) => {
      initializeWall(container, index);
    });
  });

  /**
   * Initialize a single event wall
   */
  function initializeWall(container, index) {
    const ds = container.dataset || {};

    // Parse theme
    const theme = (ds.theme || 'light').toLowerCase();
    container.setAttribute('data-theme', theme);
    applyThemeClass(theme);

    // Parse attributes
    const parseList = (val) => (val ? val.split(/[,\s]+/).map(s => s.trim()).filter(Boolean) : []);
    const relays = parseList(ds.relays) || ['wss://relilab.nostr1.com'];
    const npub = parseList(ds.npub) || [];
    const limit = parseInt(ds.limit) || 1000;
    const filter = ds.filter || '';
    const showFilterbar = (ds.showFilterbar || 'true').toLowerCase() !== 'false';

    console.log('[Nostr Calendar Block]', { theme, relays, npub, limit, filter, showFilterbar });

    // Build wall markup
    buildWallMarkup(container, { showFilterbar });

    // Set global options for event-wall.js
    window.NOSTR_OPTIONS = {
      relays,
      allowed_npub: npub,
      limit
    };

    // Load theme CSS if not default
    if (theme && theme !== 'light') {
      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = assetsBase + 'css/themes/' + theme + '.css';
      document.head.appendChild(themeLink);
    }

    // Load main wall script
    loadJS(assetsBase + 'js/event-wall.js').catch(err => {
      console.error('Failed to load event-wall.js:', err);
    });
  }

  /**
   * Build wall HTML structure
   */
  function buildWallMarkup(container, options) {
    const filterbar = options.showFilterbar ? `
      <section class="filter-toolbar" aria-label="Terminfilter">
        <div class="filter-row">
          <div class="field tagbox" style="flex:1 1 360px;">
            <label for="tag-input">Tags</label>
            <input id="tag-input" class="tag-input" type="text"
              placeholder="Tag suchen & Enter zum Hinzufügen"
              autocomplete="off" />
            <div id="tag-suggest" class="suggest" role="listbox" aria-label="Tag-Vorschläge"></div>
          </div>
          <div class="field" style="flex:1 1 280px;">
            <label for="search-input">Suche</label>
            <input id="search-input" type="text" placeholder="Titel & Tags durchsuchen …" />
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
    ` : '';

    container.innerHTML = filterbar + `
      <div id="edu-event-wall" class="nostr-event-wall">
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
  }

  /**
   * Apply theme class to document
   */
  function applyThemeClass(theme) {
    const cls = 'theme-' + String(theme).toLowerCase();
    try {
      // Remove old theme classes
      document.documentElement.classList.forEach((c) => {
        if (/^theme-/.test(c)) document.documentElement.classList.remove(c);
      });
      // Add new
      document.documentElement.classList.add(cls);
    } catch (_) {}
  }
})();

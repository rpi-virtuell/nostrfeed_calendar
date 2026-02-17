/**
 * Nostr Calendar Block - Frontend Initializer
 * Finds all .nostr-event-wall containers and initializes them with unique IDs.
 * Supports multiple independent instances on the same page.
 */
(function() {
  'use strict';

  var loadedScripts = new Set();

  // Helper: loadJS (deduplicated)
  var loadJS = function (src) {
    if (loadedScripts.has(src)) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { loadedScripts.add(src); res(); };
      s.onerror = function () { rej(new Error('JS load failed: ' + src)); };
      document.body.appendChild(s);
    });
  };

  // Get plugin base URL
  var getPluginBase = function () {
    var scripts = Array.from(document.getElementsByTagName('script'));
    for (var i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i];
      if (s.src && /nostr-calendar-block|embed-wall/.test(s.src)) {
        return s.src.replace(/[^/]+\.js.*$/, '');
      }
    }
    return '/wp-content/plugins/nostr-calendar-block/assets/js/';
  };

  var pluginBase = getPluginBase();
  var assetsBase = pluginBase.replace(/\/assets\/js\/$/, '/assets/');

  // Per-instance data store
  window.NOSTR_WALL_INSTANCES = window.NOSTR_WALL_INSTANCES || {};

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', async function () {
    var wallContainers = document.querySelectorAll('.nostr-event-wall');
    if (wallContainers.length === 0) return;

    // Load core API if not already present
    if (!window.NostreAPI) {
      try {
        await loadJS(assetsBase + 'js/nostre-api.js');
      } catch (err) {
        // API load failed, will use REST fallback
      }
    }

    // Process each wall container
    wallContainers.forEach(function (container, index) {
      initializeWall(container, index);
    });
  });

  /**
   * Initialize a single event wall
   */
  function initializeWall(container, index) {
    // Prevent double init
    if (container.hasAttribute('data-initialized')) return;
    container.setAttribute('data-initialized', 'true');

    var ds = container.dataset || {};
    var instanceId = ds.instanceId || container.id || ('nostr-wall-' + (index + 1));
    container.dataset.instanceId = instanceId;

    // Parse theme
    var theme = (ds.theme || 'light').toLowerCase();
    container.setAttribute('data-theme', theme);

    // Parse attributes
    var parseList = function (val) {
      return val ? val.split(/[,\s]+/).map(function (s) { return s.trim(); }).filter(Boolean) : [];
    };
    var relays = parseList(ds.relays);
    if (!relays.length) relays = ['wss://relay-rpi.edufeed.org/'];
    var npub = parseList(ds.npub);
    if (!npub.length) npub = ['npub12j35qpeve33929kg64etvw9g9rzms4c8g5gnqta58yhjdc6wryfse3phmu'];
    var limit = parseInt(ds.limit) || 1000;
    var filter = ds.filter || '';
    var showFilterbar = (ds.showFilterbar || 'true').toLowerCase() !== 'false';
    var showDescription = (ds.showDescription || 'true').toLowerCase() !== 'false';

    // Store instance options (keyed by instanceId)
    window.NOSTR_WALL_INSTANCES[instanceId] = {
      relays: relays,
      allowed_npub: npub,
      limit: limit
    };
    // Legacy compat for single-instance mode
    window.NOSTR_OPTIONS = window.NOSTR_WALL_INSTANCES[instanceId];

    // Build wall markup with prefixed IDs
    buildWallMarkup(container, instanceId, { showFilterbar: showFilterbar, showDescription: showDescription });

    // Load theme CSS if not default (deduplicated)
    if (theme && theme !== 'light') {
      var linkId = 'nostr-theme-' + theme;
      if (!document.getElementById(linkId)) {
        var themeLink = document.createElement('link');
        themeLink.id = linkId;
        themeLink.rel = 'stylesheet';
        themeLink.href = assetsBase + 'css/themes/' + theme + '.css';
        document.head.appendChild(themeLink);
      }
    }

    // event-wall.js is loaded via wp_enqueue_script; only load dynamically as fallback
    if (!document.querySelector('script[src*="event-wall"]')) {
      loadJS(assetsBase + 'js/event-wall.js').catch(function () {
        // event-wall.js load failed
      });
    }
  }

  /**
   * Build wall HTML structure with instance-prefixed IDs
   */
  function buildWallMarkup(container, instanceId, options) {
    var pfx = instanceId + '-';
    var i18n = (window.nostrCalendarBlockData && window.nostrCalendarBlockData.i18n) || {};
    var t = function (key, fallback) { return i18n[key] || fallback; };

    var filterbarClass = options.showFilterbar ? 'filter-toolbar' : 'filter-toolbar hidden';

    container.innerHTML =
      '<section class="' + filterbarClass + '" aria-label="' + t('tags', 'Tags') + '">' +
        '<div class="filter-row">' +
          '<div class="field tagbox" style="flex:1 1 360px;">' +
            '<label for="' + pfx + 'tag-input">' + t('tags', 'Tags') + '</label>' +
            '<input id="' + pfx + 'tag-input" class="tag-input" type="text" placeholder="' + t('tagPlaceholder', 'Tag suchen & Enter zum Hinzufügen') + '" autocomplete="off" />' +
            '<div id="' + pfx + 'tag-suggest" class="suggest" role="listbox" aria-label="' + t('tags', 'Tags') + '"></div>' +
          '</div>' +
          '<div class="field" style="flex:1 1 280px;">' +
            '<label for="' + pfx + 'search-input">' + t('search', 'Suche') + '</label>' +
            '<input id="' + pfx + 'search-input" type="text" placeholder="' + t('searchPlaceholder', 'Titel & Tags durchsuchen …') + '" />' +
          '</div>' +
          '<div class="field" style="flex:0 0 220px;">' +
            '<label for="' + pfx + 'month-select">' + t('month', 'Monat') + '</label>' +
            '<select id="' + pfx + 'month-select" aria-label="' + t('month', 'Monat') + '">' +
              '<option value="">' + t('allMonths', 'Alle Monate') + '</option>' +
            '</select>' +
          '</div>' +
          '<button id="' + pfx + 'reset-filters" class="btn ghost" title="' + t('reset', 'Zurücksetzen') + '">' + t('reset', 'Zurücksetzen') + '</button>' +
          '<div class="result-info" id="' + pfx + 'result-info" aria-live="polite" aria-atomic="true">0 ' + t('results', 'Treffer') + '</div>' +
        '</div>' +
        '<div class="filter-row">' +
          '<div id="' + pfx + 'selected-tags" class="selected-tags" aria-live="polite"></div>' +
        '</div>' +
      '</section>' +
      '<div id="' + pfx + 'event-grid" class="nostr-event-grid">' +
        '<div id="' + pfx + 'loader">' + t('loading', 'Lade Termine...') + '</div>' +
      '</div>' +
      '<div id="' + pfx + 'event-modal" class="modal" aria-modal="true" role="dialog" aria-labelledby="' + pfx + 'modal-title">' +
        '<div class="modal-content">' +
          '<button id="' + pfx + 'close-modal" class="close-button" aria-label="' + t('close', 'Schließen') + '">\u00d7</button>' +
          '<div id="' + pfx + 'modal-image-container"></div>' +
          '<h2 id="' + pfx + 'modal-title"></h2>' +
          '<p id="' + pfx + 'modal-date"></p>' +
          '<div id="' + pfx + 'modal-details">' +
            '<p><strong>' + t('summary', 'Zusammenfassung:') + '</strong> <span id="' + pfx + 'modal-summary"></span></p>' +
            '<p><strong>' + t('location', 'Ort:') + '</strong> <span id="' + pfx + 'modal-location"></span></p>' +
            '<p><strong>' + t('tags', 'Tags') + ':</strong> <span id="' + pfx + 'modal-tags"></span></p>' +
            '<p><strong>' + t('educationalLevel', 'Bildungsstufe:') + '</strong> <span id="' + pfx + 'modal-edu-levels"></span></p>' +
          '</div>' +
          '<div id="' + pfx + 'modal-content-html"></div>' +
        '</div>' +
      '</div>';
  }
})();

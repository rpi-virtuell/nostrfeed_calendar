/**
 * Nostr Calendar Block – Event Wall (per-container)
 * Supports multiple independent instances on the same page.
 */
(function () {
  'use strict';

  // === Shared helpers ===
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  const normalizeTags = (raw) => {
    const arr = Array.isArray(raw) ? raw : (raw ? String(raw).split(',') : []);
    return arr.map(t => t.trim()).filter(Boolean);
  };

  const toPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = (html || '').replace(/<script[\s\S]*?<\/script>/gi, '');
    return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
  };

  const truncateWords = (text, limit) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '\u2026';
  };

  function debounce(fn, ms) {
    let timer;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  // i18n + locale (shared)
  const blockData = window.nostrCalendarBlockData || {};
  const i18n = blockData.i18n || {};
  const t = (key, fallback) => i18n[key] || fallback;
  const locale = blockData.locale || navigator.language || 'de-DE';

  // Formatters using dynamic locale
  const toMonthKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return y + '-' + m;
  };

  const monthKeyToLabel = (key) => {
    const parts = key.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, 1);
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
  };

  const formatEventTimeSpan = (start, end) => {
    const isSameDay = start.toDateString() === end.toDateString();
    if (isSameDay) {
      const df = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      const tf = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
      return df.format(start) + ', ' + tf.format(start) + ' \u2013 ' + tf.format(end) + ' Uhr';
    }
    const ff = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return ff.format(start) + ' Uhr \u2013 ' + ff.format(end) + ' Uhr';
  };

  // SVG icons
  const locationIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
  const clockIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
  const personIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

  const SUMMARY_WORD_LIMIT = 30;

  // ===== Per-container initialiser =====
  function initWallContainer(container) {
    var instanceId = container.dataset.instanceId || container.id || 'nostr-wall-1';
    var pfx = instanceId + '-';
    var $ = function (id) { return document.getElementById(pfx + id); };

    // --- Instance options ---
    var instanceOpts = (window.NOSTR_WALL_INSTANCES && window.NOSTR_WALL_INSTANCES[instanceId]) || window.NOSTR_OPTIONS || {};
    var NOSTR_OPTIONS = Object.assign({
      relays: ['wss://relay-rpi.edufeed.org/'],
      allowed_npub: ['npub12j35qpeve33929kg64etvw9g9rzms4c8g5gnqta58yhjdc6wryfse3phmu'],
      sinceDays: 365,
      limit: 1000,
      timeoutMs: 8000,
    }, instanceOpts);

    var endpoint = (blockData.apiEndpoint) || 'https://n8n.rpi-virtuell.de/webhook/nostre_termine';

    // Elements (scoped)
    var eventWallEl = $(('event-grid'));
    var loaderEl = $('loader');
    var resultInfoEl = $('result-info');
    var tagInput = $('tag-input');
    var tagSuggest = $('tag-suggest');
    var selectedTagsEl = $('selected-tags');
    var searchInput = $('search-input');
    var monthSelect = $('month-select');
    var resetBtn = $('reset-filters');
    var modal = $('event-modal');
    var closeModalBtn = $('close-modal');

    // Data
    var allEvents = [];
    var filteredEvents = [];
    var state = {
      selectedTags: new Set(),
      searchQuery: '',
      monthKey: ''
    };

    // Permalink (hash) handling
    var lastFilterHash = '';
    var suppressHashChange = false;

    var buildFilterHash = function () {
      var parts = [];
      if (state.selectedTags.size) {
        parts.push('tags:' + Array.from(state.selectedTags).map(encodeURIComponent).join('|'));
      }
      var q = state.searchQuery.trim();
      if (q) parts.push('query:' + encodeURIComponent(q));
      if (state.monthKey) parts.push('month:' + state.monthKey);
      return '#filter=' + parts.join(',');
    };

    var setHashSafely = function (hash) {
      if (location.hash === hash) return;
      try {
        history.replaceState(null, '', hash);
      } catch (e) {
        suppressHashChange = true;
        location.hash = hash;
        setTimeout(function () { suppressHashChange = false; }, 0);
      }
    };

    var pushHash = function (hash) {
      if (location.hash === hash) return;
      suppressHashChange = true;
      location.hash = hash;
      setTimeout(function () { suppressHashChange = false; }, 0);
    };

    var parseFilterSpec = function (spec) {
      var out = { tags: [], query: '', monthKey: '' };
      if (!spec) return out;
      var cleaned = spec.replace(/[;&]/g, ',');
      cleaned.split(',').forEach(function (pair) {
        if (!pair) return;
        var idx = pair.search(/[:=]/);
        var key = idx >= 0 ? pair.slice(0, idx).trim().toLowerCase() : pair.trim().toLowerCase();
        var val = idx >= 0 ? pair.slice(idx + 1).trim() : '';
        if (!key) return;
        if (key === 'tags') {
          out.tags = val.split(/[|,]/).map(decodeURIComponent).map(function (s) { return s.trim(); }).filter(Boolean);
        } else if (key === 'query' || key === 'q') {
          try { val = decodeURIComponent(val); } catch (e) { /* keep raw */ }
          out.query = val;
        } else if (key === 'month') {
          try { val = decodeURIComponent(val); } catch (e) { /* keep raw */ }
          var mmOnly = /^([1-9]|1[0-2])$/.test(val);
          if (mmOnly) {
            out.monthKey = new Date().getFullYear() + '-' + String(parseInt(val, 10)).padStart(2, '0');
          } else {
            out.monthKey = val;
          }
        }
      });
      return out;
    };

    var applyHashFromLocation = function () {
      var h = (location.hash || '').replace(/^#/, '');
      if (!h) return false;

      var idMatch = h.match(/^(?:id[:=]|view=modal&id=)([^,&;]+)/i);
      if (idMatch) {
        var id = decodeURIComponent(idMatch[1]);
        var matchEvent = allEvents.find(function (e) { return (e.ID || e.id || e.url) === id; });
        lastFilterHash = buildFilterHash();
        if (matchEvent) showEventModal(matchEvent);
        return true;
      }

      var filterMatch = h.match(/^filter=(.*)$/i);
      if (filterMatch) {
        var spec = parseFilterSpec(filterMatch[1]);
        state.selectedTags = new Set((spec.tags || []).map(function (s) { return s.toLowerCase(); }));
        state.searchQuery = spec.query || '';
        state.monthKey = spec.monthKey || '';
        if (searchInput) searchInput.value = state.searchQuery;
        if (monthSelect) monthSelect.value = state.monthKey;
        renderSelectedTagsChips();
        applyFilters();
        return true;
      }
      return false;
    };

    var handleHashChange = function () {
      if (suppressHashChange) return;
      var h = (location.hash || '');
      if (!h) {
        if (modal) modal.style.display = 'none';
        state.selectedTags.clear();
        state.searchQuery = '';
        state.monthKey = '';
        if (searchInput) searchInput.value = '';
        if (monthSelect) monthSelect.value = '';
        applyFilters();
        return;
      }
      applyHashFromLocation();
    };

    // Normalize from NostreAPI
    var normalizeFromNostr = function (it) {
      return {
        ID: it.ID,
        title: it.title,
        start: it.start,
        end: it.end,
        status: it.status,
        location: it.location,
        tags: it.tags,
        summary: it.summary,
        content: it.content,
        pubkey: it.pubkey,
        image: it.image,
        location_url: it.location_url,
      };
    };

    var buildEvent = function (event) {
      var start = new Date(event.start || event.begin || event.date);
      var end = new Date(event.end || event.finish || start);
      var tagsArr = normalizeTags(event.tags);
      var summaryPlain = toPlainText(event.summary || '');
      var contentPlain = toPlainText(event.content || '');
      return Object.assign({}, event, {
        start: start,
        end: end,
        tagsArr: tagsArr,
        tagsLower: tagsArr.map(function (tt) { return tt.toLowerCase(); }),
        monthKey: toMonthKey(start),
        summaryPlain: summaryPlain,
        contentPlain: contentPlain
      });
    };

    var getAllTagsWithCounts = function (events) {
      var map = new Map();
      events.forEach(function (e) {
        e.tagsArr.forEach(function (tag) {
          var key = tag.toLowerCase();
          var entry = map.get(key) || { label: tag, count: 0 };
          if (tag.length > entry.label.length) entry.label = tag;
          entry.count++;
          map.set(key, entry);
        });
      });
      return Array.from(map.entries())
        .sort(function (a, b) { return b[1].count - a[1].count; })
        .map(function (item) { return { key: item[0], label: item[1].label, count: item[1].count }; });
    };

    var getAllMonths = function (events) {
      var set = new Set(events.map(function (e) { return e.monthKey; }));
      return Array.from(set).sort();
    };

    // Fetch
    var fetchEvents = async function () {
      try {
        if (window.NostreAPI && typeof window.NostreAPI.getNostrFeed === 'function') {
          var result = await window.NostreAPI.getNostrFeed(NOSTR_OPTIONS);
          var nostrfeed = result.nostrfeed;
          if (Array.isArray(nostrfeed) && nostrfeed.length > 0) {
            var list = nostrfeed.map(normalizeFromNostr).map(buildEvent)
              .sort(function (a, b) { return a.start - b.start; });
            allEvents = list;
            filteredEvents = list.slice();
            return;
          }
        }
      } catch (err) {
        // Nostr direct fetch failed, try REST fallback
      }

      try {
        var response = await fetch(endpoint, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        var data = await response.json();
        var events = (data && data[0] && data[0].nostrfeed) || (data && data.nostrfeed) || [];
        if (!Array.isArray(events)) { allEvents = []; filteredEvents = []; return; }
        if (events.length === 0) { allEvents = []; filteredEvents = []; return; }

        var list = events.map(normalizeFromNostr).map(buildEvent);
        if (NOSTR_OPTIONS.allowed_npub && NOSTR_OPTIONS.allowed_npub.length > 0) {
          var allowedLower = NOSTR_OPTIONS.allowed_npub.map(function (n) { return String(n).toLowerCase(); });
          list = list.filter(function (e) {
            return allowedLower.includes(String(e.pubkey || '').toLowerCase());
          });
        }
        list.sort(function (a, b) { return a.start - b.start; });
        allEvents = list;
        filteredEvents = list.slice();
      } catch (err) {
        showError(t('loadError', 'Fehler beim Laden der Termine.'));
      }
    };

    var showError = function (message) {
      if (loaderEl) {
        loaderEl.textContent = '';
        var errDiv = document.createElement('div');
        errDiv.style.cssText = 'color:red;padding:20px;text-align:center';
        errDiv.textContent = message;
        loaderEl.appendChild(errDiv);
      }
    };

    // Rendering
    var renderEventWall = function (list) {
      if (!eventWallEl) return;
      eventWallEl.innerHTML = '';

      if (!list || list.length === 0) {
        var noEv = document.createElement('div');
        noEv.className = 'no-events';
        noEv.textContent = t('noResults', 'Keine Treffer für die gewählten Filter.');
        eventWallEl.appendChild(noEv);
        if (resultInfoEl) resultInfoEl.textContent = '0 ' + t('results', 'Treffer');
        return;
      }

      if (resultInfoEl) resultInfoEl.textContent = list.length + ' ' + t('results', 'Treffer');

      var filterToolbar = container.querySelector('.filter-toolbar');
      var filterVisible = filterToolbar && window.getComputedStyle(filterToolbar).display !== 'none';

      list.forEach(function (event) {
        var tile = document.createElement('article');
        tile.className = 'event-tile';
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('role', 'button');
        tile.setAttribute('aria-label', escapeHtml(event.title || ''));
        tile.addEventListener('click', function () { showEventModal(event); });
        tile.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showEventModal(event); }
        });

        var day = event.start.getDate();
        var month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(event.start).replace('.', '');
        var year = event.start.getFullYear();
        var timeSpan = formatEventTimeSpan(event.start, event.end);

        // Build tags via DOM
        var tagsDiv = document.createElement('div');
        tagsDiv.className = 'tile-tags';
        event.tagsArr.slice(0, 3).forEach(function (tag) {
          var btn = document.createElement('button');
          btn.className = 'tag-badge';
          btn.setAttribute('data-tag', encodeURIComponent(tag));
          btn.title = t('filterByTag', 'Nach Tag filtern');
          btn.textContent = tag;
          if (filterVisible) {
            btn.addEventListener('click', function (ev) {
              ev.stopPropagation();
              addTagToState(tag);
            });
          }
          tagsDiv.appendChild(btn);
        });

        var summaryShort = truncateWords(event.summaryPlain || toPlainText(event.summary || ''), SUMMARY_WORD_LIMIT);

        // Validate image URL
        var hasImage = event.image && /^https:\/\//i.test(event.image);

        // Build wrapper
        var wrapper = document.createElement('div');
        wrapper.className = 'event-wrapper';

        // Header
        var header = document.createElement('div');
        header.className = 'tile-header' + (hasImage ? '' : ' no-image');
        if (hasImage) header.style.backgroundImage = "url('" + escapeHtml(event.image) + "')";

        var overlay = document.createElement('div');
        overlay.className = 'tile-overlay';
        var bubble = document.createElement('div');
        bubble.className = 'date-bubble';
        bubble.setAttribute('aria-hidden', 'true');
        var bYear = document.createElement('div'); bYear.className = 'date-bubble-year'; bYear.textContent = year;
        var bDay = document.createElement('div'); bDay.className = 'date-bubble-day'; bDay.textContent = day;
        var bMonth = document.createElement('div'); bMonth.className = 'date-bubble-month'; bMonth.textContent = month;
        bubble.appendChild(bYear);
        bubble.appendChild(bDay);
        bubble.appendChild(bMonth);
        overlay.appendChild(bubble);
        header.appendChild(overlay);

        // Body
        var body = document.createElement('div');
        body.className = 'tile-body';

        var titleEl = document.createElement('h3');
        titleEl.className = 'tile-title';
        titleEl.textContent = event.title || '';

        var meta = document.createElement('div');
        meta.className = 'tile-meta';

        var timePara = document.createElement('p');
        timePara.innerHTML = clockIcon;
        var timeSpanEl = document.createElement('span');
        timeSpanEl.textContent = timeSpan;
        timePara.appendChild(timeSpanEl);
        meta.appendChild(timePara);

        if (event.location) {
          var locPara = document.createElement('p');
          locPara.innerHTML = locationIcon;
          var locSpan = document.createElement('span');
          // If location is already HTML (contains <a), use textContent of parsed version
          if (/<a\s/i.test(event.location)) {
            var tmp = document.createElement('div');
            tmp.innerHTML = event.location.replace(/<script[\s\S]*?<\/script>/gi, '');
            locSpan.textContent = tmp.textContent || event.location;
          } else {
            locSpan.textContent = event.location;
          }
          locPara.appendChild(locSpan);
          meta.appendChild(locPara);
        }

        if (event.pubkey) {
          var pubPara = document.createElement('p');
          pubPara.innerHTML = personIcon;
          var pubSpan = document.createElement('span');
          pubSpan.textContent = event.pubkey;
          pubPara.appendChild(pubSpan);
          meta.appendChild(pubPara);
        }

        var ghost = document.createElement('div');
        ghost.className = 'tile-ghost';
        ghost.setAttribute('aria-hidden', 'true');

        body.appendChild(titleEl);
        body.appendChild(meta);
        body.appendChild(ghost);

        if (summaryShort) {
          var summaryP = document.createElement('p');
          summaryP.className = 'tile-summary';
          summaryP.textContent = summaryShort;
          body.appendChild(summaryP);
        }

        // Toolbar
        var toolbar = document.createElement('div');
        toolbar.className = 'tile-toolbar';
        var tbLeft = document.createElement('div'); tbLeft.className = 'tile-toolbar-left';
        var tbRight = document.createElement('div'); tbRight.className = 'tile-toolbar-right';
        var detailBtn = document.createElement('button');
        detailBtn.className = 'btn primary show-btn';
        detailBtn.textContent = t('details', 'Details ansehen');
        tbRight.appendChild(detailBtn);
        toolbar.appendChild(tbLeft);
        toolbar.appendChild(tbRight);

        wrapper.appendChild(header);
        wrapper.appendChild(body);
        wrapper.appendChild(toolbar);

        tile.appendChild(tagsDiv);
        tile.appendChild(wrapper);
        eventWallEl.appendChild(tile);
      });
    };

    // Modal
    var showEventModal = function (event) {
      if (!modal) return;

      var modalImageContainer = $('modal-image-container');
      if (modalImageContainer) {
        modalImageContainer.innerHTML = '';
        if (event.image && /^https:\/\//i.test(event.image)) {
          var img = document.createElement('img');
          img.src = event.image;
          img.alt = t('imageAlt', 'Bild für') + ' ' + (event.title || '');
          modalImageContainer.appendChild(img);
          modalImageContainer.style.display = 'block';
        } else {
          modalImageContainer.style.display = 'none';
        }
      }

      var modalTitle = $('modal-title');
      if (modalTitle) modalTitle.textContent = event.title || '';

      var modalSummary = $('modal-summary');
      if (modalSummary) modalSummary.textContent = toPlainText(event.summary) || t('noSummary', 'Keine Zusammenfassung vorhanden.');

      var modalLocation = $('modal-location');
      if (modalLocation) {
        modalLocation.innerHTML = '';
        if (event.location_url && /^https?:\/\//.test(event.location_url)) {
          var a = document.createElement('a');
          a.href = event.location_url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = event.location_url;
          modalLocation.appendChild(a);
        } else if (event.location) {
          modalLocation.textContent = toPlainText(event.location) || t('noLocation', 'Kein Ort angegeben.');
        } else {
          modalLocation.textContent = t('noLocation', 'Kein Ort angegeben.');
        }
      }

      var modalDate = $('modal-date');
      if (modalDate) modalDate.textContent = formatEventTimeSpan(event.start, event.end);

      var tagsContainer = $('modal-tags');
      if (tagsContainer) {
        tagsContainer.innerHTML = '';
        if (event.tagsArr.length) {
          event.tagsArr.forEach(function (tag) {
            var b = document.createElement('button');
            b.textContent = tag;
            b.title = t('filterByTag', 'Nach Tag filtern');
            b.addEventListener('click', function (e) { e.stopPropagation(); addTagToState(tag); });
            tagsContainer.appendChild(b);
          });
        } else {
          var span = document.createElement('span');
          span.textContent = t('noTags', 'Keine');
          tagsContainer.appendChild(span);
        }
      }

      var modalContentHtml = $('modal-content-html');
      if (modalContentHtml) {
        // Sanitize: strip script tags
        var sanitized = (event.content || '').replace(/<script[\s\S]*?<\/script>/gi, '');
        modalContentHtml.innerHTML = sanitized;
      }

      try { lastFilterHash = buildFilterHash(); } catch (e) { /* ignore */ }
      pushHash('#id=' + encodeURIComponent(event.ID || event.id || event.url || ''));
      modal.style.display = 'block';
    };

    // Close modal
    var closeModal = function () {
      if (!modal) return;
      modal.style.display = 'none';
      var targetHash = lastFilterHash || buildFilterHash();
      setHashSafely(targetHash);
      if (!targetHash || targetHash === '#filter=' || targetHash === '#') {
        state.selectedTags.clear();
        state.searchQuery = '';
        state.monthKey = '';
        if (searchInput) searchInput.value = '';
        if (monthSelect) monthSelect.value = '';
      }
      applyHashFromLocation() || applyFilters();
    };

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
      // Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
      });
    }

    // Filtering
    var applyFilters = function () {
      var q = state.searchQuery.trim().toLowerCase();
      filteredEvents = allEvents.filter(function (e) {
        var tagOK = state.selectedTags.size === 0
          ? true
          : Array.from(state.selectedTags).some(function (tag) { return e.tagsLower.includes(tag); });
        var searchOK = !q
          ? true
          : ((e.title || '').toLowerCase().indexOf(q) !== -1 ||
             e.tagsLower.some(function (tag) { return tag.indexOf(q) !== -1; }) ||
             (e.summaryPlain || '').toLowerCase().indexOf(q) !== -1 ||
             (e.contentPlain || '').toLowerCase().indexOf(q) !== -1);
        var monthOK = !state.monthKey || e.monthKey === state.monthKey;
        return tagOK && searchOK && monthOK;
      });
      renderEventWall(filteredEvents);
      renderSelectedTagsChips();
      if (modal && modal.style.display !== 'block') {
        setHashSafely(buildFilterHash());
      }
    };

    var addTagToState = function (tag) {
      var key = (tag || '').toLowerCase();
      if (!key) return;
      state.selectedTags.add(key);
      if (tagInput) tagInput.value = '';
      applyFilters();
      if (tagInput) tagInput.focus();
    };

    var removeTagFromState = function (key) {
      state.selectedTags.delete(key);
      applyFilters();
    };

    // UI: selected tag chips
    var renderSelectedTagsChips = function () {
      if (!selectedTagsEl) return;
      selectedTagsEl.innerHTML = '';
      if (state.selectedTags.size === 0) return;
      var all = getAllTagsWithCounts(allEvents);
      var labelFor = function (k) { var f = all.find(function (x) { return x.key === k; }); return f ? f.label : k; };
      state.selectedTags.forEach(function (k) {
        var chip = document.createElement('span');
        chip.className = 'chip';
        var labelSpan = document.createElement('span');
        labelSpan.textContent = labelFor(k);
        chip.appendChild(labelSpan);
        var btn = document.createElement('button');
        btn.setAttribute('aria-label', t('removeTag', 'Tag entfernen'));
        btn.textContent = '\u00d7';
        btn.addEventListener('click', function () { removeTagFromState(k); });
        chip.appendChild(btn);
        selectedTagsEl.appendChild(chip);
      });
    };

    // Tag suggest dropdown
    var buildTagSuggest = function () {
      if (!tagSuggest) return;
      var tags = getAllTagsWithCounts(allEvents);

      var renderList = function (filter) {
        if (!tagSuggest) return;
        var f = (filter || '').trim().toLowerCase();
        var out = (f
          ? tags.filter(function (t) { return t.label.toLowerCase().indexOf(f) !== -1 || t.key.indexOf(f) !== -1; })
          : tags).slice(0, 200);
        tagSuggest.innerHTML = '';
        out.forEach(function (item) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'suggest-item';
          btn.setAttribute('data-key', item.key);
          btn.textContent = item.label + ' ';
          var countSpan = document.createElement('span');
          countSpan.className = 'count';
          countSpan.textContent = '(' + item.count + ')';
          btn.appendChild(countSpan);
          tagSuggest.appendChild(btn);
        });
      };

      renderList();

      tagSuggest.addEventListener('mousedown', function (e) {
        var btn = e.target.closest('button');
        if (!btn || !tagSuggest.contains(btn)) return;
        e.preventDefault();
        var key = btn.getAttribute('data-key');
        var item = tags.find(function (x) { return x.key === key; });
        addTagToState(item ? item.label : key);
        tagSuggest.classList.remove('open');
      });

      if (tagInput) {
        tagInput.addEventListener('focus', function () { tagSuggest.classList.add('open'); });
        tagInput.addEventListener('blur', function () {
          setTimeout(function () { tagSuggest.classList.remove('open'); }, 120);
        });
        tagInput.addEventListener('input', function () {
          tagSuggest.classList.add('open');
          renderList(tagInput.value);
        });
        tagInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            var val = tagInput.value.trim();
            if (val) addTagToState(val);
            tagSuggest.classList.remove('open');
          }
        });
      }
    };

    // Month dropdown
    var buildMonthSelect = function () {
      if (!monthSelect) return;
      var months = getAllMonths(allEvents);
      months.forEach(function (key) {
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = monthKeyToLabel(key);
        monthSelect.appendChild(opt);
      });
    };

    // Wire up filter inputs with debounce
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        state.searchQuery = searchInput.value;
        applyFilters();
      }, 200));
    }
    if (monthSelect) {
      monthSelect.addEventListener('change', function () {
        state.monthKey = monthSelect.value;
        applyFilters();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.selectedTags.clear();
        state.searchQuery = '';
        state.monthKey = '';
        if (searchInput) searchInput.value = '';
        if (monthSelect) monthSelect.value = '';
        if (tagInput) tagInput.value = '';
        applyFilters();
      });
    }

    // Apply data-filter attribute from block settings
    var applyInitialFilter = function () {
      var filterAttr = container.dataset.filter || '';
      if (!filterAttr) return;
      var spec = parseFilterSpec(filterAttr);
      if (spec.tags.length) {
        spec.tags.forEach(function (tag) { state.selectedTags.add(tag.toLowerCase()); });
      }
      if (spec.query) { state.searchQuery = spec.query; if (searchInput) searchInput.value = spec.query; }
      if (spec.monthKey) { state.monthKey = spec.monthKey; if (monthSelect) monthSelect.value = spec.monthKey; }
    };

    // INIT
    var init = async function () {
      await fetchEvents();
      if (loaderEl) loaderEl.style.display = 'none';
      buildTagSuggest();
      buildMonthSelect();

      // Apply block-level filter attribute first
      applyInitialFilter();

      var handled = applyHashFromLocation();
      if (!handled) {
        applyFilters();
      } else {
        if ((location.hash || '').toLowerCase().indexOf('#id') === 0) {
          applyFilters();
        }
      }
      window.addEventListener('hashchange', handleHashChange);
    };
    init();
  }

  // ===== Bootstrap: find all initialised containers =====
  function bootstrap() {
    var containers = document.querySelectorAll('.nostr-event-wall[data-initialized="true"]');
    containers.forEach(function (container) {
      if (container.hasAttribute('data-wall-started')) return;
      container.setAttribute('data-wall-started', 'true');
      initWallContainer(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

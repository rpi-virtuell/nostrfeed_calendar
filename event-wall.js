(function(start){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    // DOM ist schon bereit → sofort starten
    start();
  }
})(function(){
  // Nostr-Direct Options (werden nur genutzt, wenn window.NostreAPI vorhanden ist)
  // Merge externe Optionen (von embed-wall.js via window.NOSTR_OPTIONS) mit Defaults
  const NOSTR_OPTIONS = Object.assign({
    relays: undefined,
    allowed_npub: undefined,
    sinceDays: 365,
    limit: 1000,
    timeoutMs: 8000,
  }, (window.NOSTR_OPTIONS || {}));
  console.debug('[NOSTR_OPTIONS]', NOSTR_OPTIONS);
  const endpoint = 'https://n8n.rpi-virtuell.de/webhook/nostre_termine';

  // === CONFIG ===
  const SUMMARY_WORD_LIMIT = 30; // <-- gewünschte Wortanzahl hier anpassen

  // Elements
  const eventWallEl = document.getElementById('edu-event-wall');
  const loaderEl = document.getElementById('loader');
  const resultInfoEl = document.getElementById('result-info');

  const tagInput = document.getElementById('tag-input');
  const tagSuggest = document.getElementById('tag-suggest');
  const selectedTagsEl = document.getElementById('selected-tags');

  const searchInput = document.getElementById('search-input');
  const monthSelect = document.getElementById('month-select');
  const resetBtn = document.getElementById('reset-filters');

  const modal = document.getElementById('event-modal');
  const closeModalBtn = document.getElementById('close-modal');

  // Data
  let allEvents = [];
  let filteredEvents = [];
  const state = {
    selectedTags: new Set(),
    searchQuery: '',
    monthKey: ''
  };


  // ===== Permalink (hash) handling =====
  let lastFilterHash = '';           // to restore filter hash when closing modal
  let suppressHashChange = false;    // avoid loops when we change hash programmatically

  const buildFilterHash = () => {
    const parts = [];
    if (state.selectedTags.size) {
      const t = Array.from(state.selectedTags).map(encodeURIComponent).join('|');
      parts.push(`tags:${t}`);
    }
    const q = state.searchQuery.trim();
    if (q) parts.push(`query:${encodeURIComponent(q)}`);
    if (state.monthKey) parts.push(`month:${state.monthKey}`);
    return '#filter=' + parts.join(',');
  };

  const setHashSafely = (hash) => {
    // default: replace (no history entry, no hashchange event)
    if (location.hash === hash) return;
    try {
      history.replaceState(null, '', hash);
    } catch (e) {
      // fallback if replaceState unavailable
      suppressHashChange = true;
      location.hash = hash;
      setTimeout(() => { suppressHashChange = false; }, 0);
    }
  };
  const pushHash = (hash) => {
    // push a history entry (for modal open), may trigger hashchange
    if (location.hash === hash) return;
    suppressHashChange = true;
    location.hash = hash;
    setTimeout(() => { suppressHashChange = false; }, 0);
  };

  const parseFilterSpec = (spec) => {
    // Accept both comma-separated "key:value" and "key=value" pairs, tags split by '|' or ','
    const out = { tags: [], query: '', monthKey: '' };
    if (!spec) return out;
    // Replace & ; with commas to be tolerant
    const cleaned = spec.replace(/[;&]/g, ',');
    cleaned.split(',').forEach(pair => {
      if (!pair) return;
      const [kRaw, vRaw=''] = pair.split(/[:=]/);
      const key = (kRaw || '').trim().toLowerCase();
      let val = (vRaw || '').trim();
      if (!key) return;
      if (key === 'tags') {
        const items = val.split(/[|,]/).map(decodeURIComponent).map(s => s.trim()).filter(Boolean);
        out.tags = items;
      } else if (key === 'query' || key === 'q') {
        try { val = decodeURIComponent(val); } catch(e) {}
        out.query = val;
      } else if (key === 'month') {
        // Accept YYYY-MM or just MM; if only MM, map to current year
        try { val = decodeURIComponent(val); } catch(e) {}
        const mmOnly = /^([1-9]|1[0-2])$/.test(val);
        if (mmOnly) {
          const m = String(parseInt(val,10)).padStart(2,'0');
          const y = new Date().getFullYear();
          out.monthKey = `${y}-${m}`;
        } else {
          out.monthKey = val;
        }
      }
    });
    return out;
  };

  const applyHashFromLocation = () => {
    const h = (location.hash || '').replace(/^#/, '');
    if (!h) return false;

    // Case 1: modal by id -> "#id:<ID>" or "#id=<ID>" or "#view=modal&id=<ID>"
    const idMatch = h.match(/^(?:id[:=]|view=modal&id=)([^,&;]+)/i);
    if (idMatch) {
      const id = decodeURIComponent(idMatch[1]);
      const matchEvent = allEvents.find(e => (e.ID || e.id || e.url) === id);
      // keep current filters but update hash format
      lastFilterHash = buildFilterHash();
      if (matchEvent) showEventModal(matchEvent);
      return true;
    }

    // Case 2: filter -> "#filter=..."
    const filterMatch = h.match(/^filter=(.*)$/i);
    if (filterMatch) {
      const spec = parseFilterSpec(filterMatch[1]);
      // Apply to state
      state.selectedTags = new Set((spec.tags || []).map(s => s.toLowerCase()));
      state.searchQuery = spec.query || '';
      state.monthKey = spec.monthKey || '';

      // Reflect in UI
      searchInput.value = state.searchQuery;
      monthSelect.value = state.monthKey;
      renderSelectedTagsChips();

      applyFilters();
      return true;
    }

    return false;
  };

  const handleHashChange = () => {
    if (suppressHashChange) return;
    // If hash denotes a modal, we open it; if filter, we apply filter.
    // If empty hash -> close modal (if open) and keep current filters.
    const h = (location.hash || '');
    if (!h) {
      // close modal if open and show all events
      modal.style.display = 'none';
      // No hash means no filters -> render all
      state.selectedTags.clear();
      state.searchQuery = '';
      state.monthKey = '';
      searchInput.value = '';
      monthSelect.value = '';
      applyFilters();
      return;
    }
    applyHashFromLocation();
  };


  const toMonthKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    return y + '-' + m;
  };
  const monthKeyToLabel = (key) => {
    const [y,m] = key.split('-').map(Number);
    const date = new Date(y, m-1, 1);
    return new Intl.DateTimeFormat('de-DE', { month:'long', year:'numeric' }).format(date);
  };
  const formatEventTimeSpan = (start, end) => {
    const isSameDay = start.toDateString() === end.toDateString();
    if (isSameDay) {
      const dateFormat = new Intl.DateTimeFormat('de-DE', { day:'numeric', month:'long', year:'numeric' });
      const startTimeFormat = new Intl.DateTimeFormat('de-DE', { hour:'2-digit', minute:'2-digit' });
      const endTimeFormat = new Intl.DateTimeFormat('de-DE', { hour:'2-digit', minute:'2-digit' });
      return `${dateFormat.format(start)}, ${startTimeFormat.format(start)} - ${endTimeFormat.format(end)} Uhr`;
    } else {
      const fullFormat = new Intl.DateTimeFormat('de-DE', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
      return `${fullFormat.format(start)} Uhr - ${fullFormat.format(end)} Uhr`;
    }
  };

  // Icons
  const locationIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  const clockIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;

  // Helpers
  const normalizeTags = (raw) => {
    const arr = Array.isArray(raw) ? raw : (raw ? String(raw).split(',') : []);
    return arr.map(t => t.trim()).filter(Boolean);
  };
  const toPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || div.innerText || '').replace(/\s+/g,' ').trim();
  };
  const truncateWords = (text, limit) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '…';
  };

  const buildEvent = (event) => {
    const start = new Date(event.starts || event.start || event.begin || event.date);
    const end = new Date(event.ends || event.end || event.finish || start);
    const tagsArr = normalizeTags(event.tags);
    return {
      ...event,
      start, end,
      tagsArr,
      tagsLower: tagsArr.map(t => t.toLowerCase()),
      monthKey: toMonthKey(start)
    };
  };

  const getAllTagsWithCounts = (events) => {
    const map = new Map();
    events.forEach(e => e.tagsArr.forEach(tag => {
      const key = tag.toLowerCase();
      const entry = map.get(key) || { label: tag, count: 0 };
      if (tag.length > entry.label.length) entry.label = tag;
      entry.count++;
      map.set(key, entry);
    }));
    return Array.from(map.entries())
      .sort((a,b) => b[1].count - a[1].count)
      .map(([key, val]) => ({ key, label: val.label, count: val.count }));
  };

  const getAllMonths = (events) => {
    const set = new Set(events.map(e => e.monthKey));
    return Array.from(set).sort();
  };
  // Hilfsfunktion: falls nötig, Felder aus NostreAPI-Items auf dein Schema mappen
  const normalizeFromNostr = (it) => ({
    ID: it.ID,
    title: it.title,
    starts: it.starts,       // ISO-String aus nostre-api.js
    ends: it.ends,           // ISO-String aus nostre-api.js
    status: it.status,
    location: it.location,   // bereits HTML-Link (Zoom-Handling passiert dort)
    tags: it.tags,           // kann String "a, b, c" sein -> buildEvent ruft normalizeTags()
    summary: it.summary,     // bereits HTML
    content: it.content,     // bereits HTML
    pubkey: it.pubkey,
    image: it.image,
    location_url: it.location_url,
  });

  // Fetch
  const fetchEvents = async () => {
    // 1) Versuch: direkte Nostr-Abfrage über nostre-api.js (falls geladen)
    try {
      if (window.NostreAPI && typeof window.NostreAPI.getNostrFeed === 'function') {
        const { nostrfeed } = await window.NostreAPI.getNostrFeed(NOSTR_OPTIONS);

        if (Array.isArray(nostrfeed) && nostrfeed.length > 0) {
          const list = nostrfeed
            .map(normalizeFromNostr)
            .map(buildEvent)
            .sort((a, b) => a.start - b.start);

          allEvents = list;
          filteredEvents = list.slice();
          console.log(`Nostr direct fetch: ${list.length} events loaded.`);
          return; // ✅ fertig, kein Fallback nötig
        }
      }
    } catch (err) {
      console.warn('Nostr direct fetch fehlgeschlagen:', err);
    }

    // // 2) Fallback: n8n-Webhook wie gehabt
    // try {
    //   const res = await fetch(endpoint);
    //   if (!res.ok) throw new Error('HTTP ' + res.status);
    //   const data = await res.json();
    //   let list = [];
    //   if (Array.isArray(data) && data.length > 0 && data[0].nostrfeed) {
    //     list = data[0].nostrfeed.map(buildEvent).sort((a,b) => a.start - b.start);
    //   }
    //   allEvents = list;
    //   filteredEvents = list.slice();
    //   console.log(`n8n-Webhook: ${list.length} events loaded.`);
    // } catch(err) {
    //   console.error('Fehler beim Abruf:', err);
    //   const fallback = [{
    //     ID: "aHR0cHM6Ly9yZWxpbGFiLm9yZy8/cD0xOTU5Mg==",
    //     title: "Schöpfung und Urknall – Die Welt aus unterschiedlichen Perspektiven betrachten",
    //     starts: "2025-09-29T17:00:00.000+02:00",
    //     ends: "2025-09-29T19:00:00.000+02:00",
    //     status: "planned",
    //     location: '<a href="https://veranstaltungen-ebz.elk-wue.de/kurs/25PTZ-063">Link zum Online-Event</a>',
    //     tags: ["Grundschule", "schöpfung", "urknall", "Theologisieren", "Sekundarstufe I", "ptz", "Bibel"],
    //     summary: "„Hört mich Gott auch, wenn ich die Hände nicht falte?“ Mit Kindern über das Beten nachdenken.",
    //     content: "<strong>Achtung nur mit Anmeldung!</strong> Kinder sind wissbegierig …",
    //     pubkey: "54a340072ccc625516c8d572b638a828c5b857074511302fb4392f26e34e1913",
    //     image: "https://relilab.org/wp-content/uploads/2022/05/location-4496459_1280-300x300.png",
    //     location_url: "https://veranstaltungen-ebz.elk-wue.de/kurs/25PTZ-063"
    //   }];
    //   allEvents = fallback.map(buildEvent);
    //   filteredEvents = allEvents.slice();
    //   console.log(`Fallback: ${allEvents.length} events loaded.`);
    // }
  };

  // Rendering
  const renderEventWall = (list) => {
    eventWallEl.innerHTML = '';
    if (!list || list.length === 0) {
      eventWallEl.innerHTML = `<div id="no-events">Keine Treffer für die gewählten Filter.</div>`;
      resultInfoEl.textContent = '0 Treffer';
      return;
    }
    resultInfoEl.textContent = list.length + (list.length === 1 ? ' Treffer' : ' Treffer');
    list.forEach(event => {
      const tile = document.createElement('article');
      tile.className = 'event-tile';
      tile.setAttribute('tabindex','0');
      tile.addEventListener('click', () => showEventModal(event));

      const day = event.start.getDate();
      const month = new Intl.DateTimeFormat('de-DE', { month:'short' }).format(event.start).replace('.','');
      const year = event.start.getFullYear();
      const timeSpan = formatEventTimeSpan(event.start, event.end);

      const tags = event.tagsArr.slice(0,3);
      const tagsHTML = tags.map(tag => `<button class="tag-badge" data-tag="${encodeURIComponent(tag)}" title="Nach Tag filtern">${tag}</button>`).join('');

      const summaryPlain = toPlainText(event.summary || '');
      const summaryShort = truncateWords(summaryPlain, SUMMARY_WORD_LIMIT);

      const headerStyle = event.image ? ` style="background-image:url('${event.image}')"` : '';

      tile.innerHTML = `
        <div class="tile-header ${event.image ? '' : 'no-image'}"${headerStyle}>
          <div class="tile-overlay">
            <div class="date-bubble" aria-hidden="true">
              <div class="date-bubble-year">${year}</div>
              <div class="date-bubble-day">${day}</div>
              <div class="date-bubble-month">${month}</div>
            </div>
            <div class="tile-tags">${tagsHTML}</div>
          </div>
        </div>
        <div class="tile-body">
          <h3 class="tile-title">${event.title}</h3>
          <div class="tile-meta">
            <p>${clockIcon}<span>${timeSpan}</span></p>
            ${event.location ? `<p>${locationIcon}<span>${event.location}</span></p>` : ''}
          </div>
          <div class="tile-ghost" aria-hidden="true"></div>
          ${summaryShort ? `<p class="tile-summary">${summaryShort}</p>` : ''}
        </div>
      `;
      // Only attach tag click handlers when the filter toolbar is visible.
      const filterToolbar = document.querySelector('.filter-toolbar');
      const filterVisible = filterToolbar && window.getComputedStyle(filterToolbar).display !== 'none';
      tile.querySelectorAll('.tag-badge').forEach(btn => {
        if (!filterVisible) return; // do not enable tag-clicks when filters are hidden
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const tag = decodeURIComponent(btn.getAttribute('data-tag'));
          addTagToState(tag);
        });
      });

      eventWallEl.appendChild(tile);
    });
  };

  const updateResultInfo = () => {
    resultInfoEl.textContent = filteredEvents.length + (filteredEvents.length === 1 ? ' Treffer' : ' Treffer');
  };

  // Modal
  const showEventModal = (event) => {
    const modalImageContainer = document.getElementById('modal-image-container');
    modalImageContainer.innerHTML = '';
    if (event.image) {
      const img = document.createElement('img');
      img.src = event.image;
      img.alt = `Bild für ${event.title}`;
      modalImageContainer.appendChild(img);
      modalImageContainer.style.display = 'block';
    } else {
      modalImageContainer.style.display = 'none';
    }
    document.getElementById('modal-title').textContent = event.title;
    document.getElementById('modal-summary').textContent = toPlainText(event.summary) || 'Keine Zusammenfassung vorhanden.';
    document.getElementById('modal-location').innerHTML =
      event.location && event.location.startsWith('http')
        ? `<a href="${event.location}" target="_blank" rel="noopener noreferrer">${event.location}</a>`
        : (event.location || 'Kein Ort angegeben.');
    document.getElementById('modal-date').textContent = formatEventTimeSpan(event.start, event.end);

    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = '';
    if (event.tagsArr.length) {
      event.tagsArr.forEach(tag => {
        const b = document.createElement('button');
        b.textContent = tag;
        b.title = 'Nach Tag filtern';
        b.addEventListener('click', (e) => { e.stopPropagation(); addTagToState(tag); });
        tagsContainer.appendChild(b);
      });
    } else {
      const span = document.createElement('span');
      span.textContent = 'Keine';
      tagsContainer.appendChild(span);
    }
    document.getElementById('modal-content-html').innerHTML = event.content || '';
    try { lastFilterHash = buildFilterHash(); } catch(e){}
    pushHash('#id=' + encodeURIComponent(event.ID || event.id || event.url || ''));
    modal.style.display = 'block';
  };
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    const targetHash = lastFilterHash || buildFilterHash();
    setHashSafely(targetHash);
    // Apply immediately so results show even if no hashchange fires
    if (!targetHash || targetHash === '#filter=' || targetHash === '#') {
      state.selectedTags.clear(); state.searchQuery=''; state.monthKey=''; searchInput.value=''; monthSelect.value='';
    }
    applyHashFromLocation() || applyFilters();
  });
  window.addEventListener('click', (e) => { if (e.target === modal) { 
    modal.style.display = 'none';
    const targetHash = lastFilterHash || buildFilterHash();
    setHashSafely(targetHash);
    if (!targetHash || targetHash === '#filter=' || targetHash === '#') {
      state.selectedTags.clear(); state.searchQuery=''; state.monthKey=''; searchInput.value=''; monthSelect.value='';
    }
    applyHashFromLocation() || applyFilters();
  } });

  // Filtering
  const applyFilters = () => {
    const q = state.searchQuery.trim().toLowerCase();
    filteredEvents = allEvents.filter(e => {
      const tagOK = state.selectedTags.size === 0
        ? true
        : Array.from(state.selectedTags).some(t => e.tagsLower.includes(t));
      const searchOK = !q
        ? true
        : (e.title?.toLowerCase().includes(q) || e.tagsLower.some(t => t.includes(q)));
      const monthOK = !state.monthKey || e.monthKey === state.monthKey;
      return tagOK && searchOK && monthOK;
    });
    renderEventWall(filteredEvents);
    renderSelectedTagsChips();
    if (modal.style.display !== 'block') {
      setHashSafely(buildFilterHash());
    }
  };

  const addTagToState = (tag) => {
    const key = (tag || '').toLowerCase();
    if (!key) return;
    state.selectedTags.add(key);
    tagInput.value = '';
    applyFilters();
    tagInput.focus();
  };
  const removeTagFromState = (key) => {
    state.selectedTags.delete(key);
    applyFilters();
  };

  // UI: Selected tag chips
  const renderSelectedTagsChips = () => {
    selectedTagsEl.innerHTML = '';
    if (state.selectedTags.size === 0) return;
    const all = getAllTagsWithCounts(allEvents);
    const labelFor = (k) => (all.find(x => x.key === k)?.label) || k;
    state.selectedTags.forEach(k => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `<span>${labelFor(k)}</span>`;
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', 'Tag entfernen');
      btn.textContent = '×';
      btn.addEventListener('click', () => removeTagFromState(k));
      chip.appendChild(btn);
      selectedTagsEl.appendChild(chip);
    });
  };

  // Tag suggest dropdown
  const buildTagSuggest = () => {
    const tags = getAllTagsWithCounts(allEvents);
    const renderList = (filter='') => {
      const f = filter.trim().toLowerCase();
      const out = (f
        ? tags.filter(t => t.label.toLowerCase().includes(f) || t.key.includes(f))
        : tags).slice(0, 200);
      tagSuggest.innerHTML = out.map(t =>
        `<button type="button" data-key="${t.key}">${t.label} <span class="count">(${t.count})</span></button>`
      ).join('');
      tagSuggest.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const key = btn.getAttribute('data-key');
          addTagToState(tags.find(x => x.key === key)?.label || key);
          tagSuggest.classList.remove('open');
        });
      });
      tagSuggest.innerHTML = out.map(t =>
        `<button type="button" class="suggest-item" data-key="${t.key}">
          ${t.label} <span class="count">(${t.count})</span>
        </button>`
      ).join('');
    };
    
    // Initial render
    renderList();
    // Use mousedown so the selection fires *before* the input loses focus via blur,
    // which previously prevented the click handler from firing in some browsers.
    tagSuggest.addEventListener('mousedown', (e) => {
      const btn = e.target.closest('button');   // <— reicht
      if (!btn || !tagSuggest.contains(btn)) return;
      e.preventDefault(); // verhindert Blur, Auswahl greift sicher
      const key = btn.getAttribute('data-key');
      const item = tags.find(x => x.key === key);
      addTagToState(item?.label || key);
      tagSuggest.classList.remove('open');
    });

    // Open/close & filter interactions
    tagInput.addEventListener('focus', () => tagSuggest.classList.add('open'));
    tagInput.addEventListener('blur', () => {
      // small delay so a click can be processed if it happens
      setTimeout(() => tagSuggest.classList.remove('open'), 120);
    });
    tagInput.addEventListener('input', () => {
      tagSuggest.classList.add('open');
      renderList(tagInput.value);
    });
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = tagInput.value.trim();
        if (val) addTagToState(val);
        tagSuggest.classList.remove('open');
      }
    });
  
  };

  // Month dropdown
  const buildMonthSelect = () => {
    const months = getAllMonths(allEvents);
    months.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = monthKeyToLabel(key);
      monthSelect.appendChild(opt);
    });
  };

  // Wire up filter inputs
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value;
    applyFilters();
  });
  monthSelect.addEventListener('change', () => {
    state.monthKey = monthSelect.value;
    applyFilters();
  });
  resetBtn.addEventListener('click', () => {
    state.selectedTags.clear();
    state.searchQuery = '';
    state.monthKey = '';
    searchInput.value = '';
    monthSelect.value = '';
    tagInput.value = '';
    applyFilters();
  });

  // INIT
  const init = async () => {
    await fetchEvents();
    if (loaderEl) loaderEl.style.display = 'none';
    buildTagSuggest();
    buildMonthSelect();
    const handled = applyHashFromLocation();
    if (!handled) {
      applyFilters();
    } else {
      // If handled was an #id modal, ensure list is visible underneath
      if ((location.hash || '').toLowerCase().startsWith('#id')) {
        state.selectedTags.clear(); state.searchQuery=''; state.monthKey='';
        searchInput.value=''; monthSelect.value='';
        applyFilters();
      }
    }
    window.addEventListener('hashchange', handleHashChange);
  };
  init();
});

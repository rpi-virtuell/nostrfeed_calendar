document.addEventListener('DOMContentLoaded', () => {
  const endpoint = 'https://n8n.rpi-virtuell.de/webhook/nostre_termine';

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

  // Fetch
  const fetchEvents = async () => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      let list = [];
      if (Array.isArray(data) && data.length > 0 && data[0].nostrfeed) {
        list = data[0].nostrfeed.map(buildEvent).sort((a,b) => a.start - b.start);
      }
      allEvents = list;
      filteredEvents = list.slice();
    } catch(err) {
      console.error('Fehler beim Abruf:', err);
      // Fallback auf Beispiel-Datensatz
      const fallback = [{
        ID: "aHR0cHM6Ly9yZWxpbGFiLm9yZy8/cD0xOTU5Mg==",
        title: "Schöpfung und Urknall – Die Welt aus unterschiedlichen Perspektiven betrachten",
        starts: "2025-09-29T17:00:00.000+02:00",
        ends: "2025-09-29T19:00:00.000+02:00",
        status: "planned",
        location: '<a href="https://veranstaltungen-ebz.elk-wue.de/kurs/25PTZ-063">Link zum Online-Event</a>',
        tags: ["Grundschule", "schöpfung", "urknall", "Theologisieren", "Sekundarstufe I", "ptz", "Bibel"],
        summary: "„Hört mich Gott auch, wenn ich die Hände nicht falte?“ Mit Kindern über das Beten nachdenken.",
        content: "<strong>Achtung nur mit Anmeldung!</strong> Kinder sind wissbegierig …",
        pubkey: "54a340072ccc625516c8d572b638a828c5b857074511302fb4392f26e34e1913",
        image: "https://relilab.org/wp-content/uploads/2022/05/location-4496459_1280-300x300.png",
        location_url: "https://veranstaltungen-ebz.elk-wue.de/kurs/25PTZ-063"
      }];
      allEvents = fallback.map(buildEvent);
      filteredEvents = allEvents.slice();
    }
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

      tile.innerHTML = `
        <div class="tile-header ${event.image ? '' : 'no-image'}" style="background-image:url('${event.image || ''}')">
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
          ${event.summary ? `<p class="tile-summary">${event.summary}</p>` : ''}
        </div>
      `;
      // Make header tags clickable without opening modal
      tile.querySelectorAll('.tag-badge').forEach(btn => {
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
    document.getElementById('modal-summary').textContent = event.summary || 'Keine Zusammenfassung vorhanden.';
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
    modal.style.display = 'block';
  };
  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  // Filtering
  const applyFilters = () => {
    const q = state.searchQuery.trim().toLowerCase();
    filteredEvents = allEvents.filter(e => {
      // Tag filter (ANY-of selected tags)
      const tagOK = state.selectedTags.size === 0
        ? true
        : Array.from(state.selectedTags).some(t => e.tagsLower.includes(t));
      // Search across title and tags
      const searchOK = !q
        ? true
        : (e.title?.toLowerCase().includes(q) || e.tagsLower.some(t => t.includes(q)));
      // Month
      const monthOK = !state.monthKey || e.monthKey === state.monthKey;
      return tagOK && searchOK && monthOK;
    });
    renderEventWall(filteredEvents);
    renderSelectedTagsChips();
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
    };
    renderList();
    tagInput.addEventListener('focus', () => tagSuggest.classList.add('open'));
    tagInput.addEventListener('blur', () => { setTimeout(() => tagSuggest.classList.remove('open'), 150); });
    tagInput.addEventListener('input', () => { tagSuggest.classList.add('open'); renderList(tagInput.value); });
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
    applyFilters();
  };
  init();
});

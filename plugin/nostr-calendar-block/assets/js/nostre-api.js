/*! nostre-api.js – Vanilla JS (Browser) – n8n-Workflow re-implemented
 *  Output: { nostrfeed: [...] } – identisch zur bisherigen Webhook-Response
 *  Defaults:
 *    relays = ["wss://relay-rpi.edufeed.org"]
 *    allowed_npub = ["54a340072ccc625516c8d572b638a828c5b857074511302fb4392f26e34e1913"]
 */
(function () {
  "use strict";

  const DEFAULT_RELAYS = ["wss://relay-rpi.edufeed.org"];
  const DEFAULT_ALLOWED = ["54a340072ccc625516c8d572b638a828c5b857074511302fb4392f26e34e1913"];
  const DEFAULT_LIMIT = 1000;

  // ————— Utilities —————
  const nowSec = () => Math.floor(Date.now() / 1000);

  const secsToIso = (sec) => {
    const n = Number(sec);
    if (!Number.isFinite(n) || n <= 0) return null;
    try { return new Date(n * 1000).toISOString(); } catch { return null; }
  };

  // --- bech32 / npub helpers (minimal, for client-side npub -> hex conversion) ---
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  function bech32Polymod(values) {
    const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (let p = 0; p < values.length; ++p) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ values[p];
      for (let i = 0; i < 5; ++i) if ((top >> i) & 1) chk ^= GENERATORS[i];
    }
    return chk;
  }
  function bech32HrpExpand(hrp) {
    const out = [];
    for (let i = 0; i < hrp.length; ++i) out.push(hrp.charCodeAt(i) >> 5);
    out.push(0);
    for (let i = 0; i < hrp.length; ++i) out.push(hrp.charCodeAt(i) & 31);
    return out;
  }
  function bech32Decode(bech) {
    if (!bech || typeof bech !== 'string' || bech.length === 0) return null;
    try {
      const lower = bech.toLowerCase();
      const pos = lower.lastIndexOf('1');
      if (pos < 1 || pos + 7 > lower.length) return null;
      const hrp = lower.slice(0, pos);
      const data = [];
      for (let i = pos + 1; i < lower.length; ++i) {
        const c = lower.charAt(i);
        const v = CHARSET.indexOf(c);
        if (v === -1) return null;
        data.push(v);
      }
      if (bech32Polymod(bech32HrpExpand(hrp).concat(data)) !== 1) return null;
      return { hrp, data: data.slice(0, data.length - 6) };
    } catch (e) { return null; }
  }
  function fromWords(words) {
    let acc = 0, bits = 0;
    const out = [];
    for (let i = 0; i < words.length; ++i) {
      acc = (acc << 5) | words[i];
      bits += 5;
      while (bits >= 8) {
        bits -= 8;
        out.push((acc >> bits) & 0xff);
      }
    }
    return out;
  }
  function npubToHex(npub) {
    if (!npub || typeof npub !== 'string') return null;
    if (/^[0-9a-f]{64}$/i.test(npub)) return npub.toLowerCase();
    const dec = bech32Decode(npub);
    if (!dec || (dec.hrp !== 'npub' && dec.hrp !== 'nprofile')) return null;
    const bytes = fromWords(dec.data);
    if (!bytes || bytes.length !== 32) return null;
    return bytes.map(b => ('0' + b.toString(16)).slice(-2)).join('');
  }

  // Sehr leichte Markdown→HTML-Konvertierung (ohne externe Libs)
  const _mdCache = new Map();
  function mdToHtml(md = "") {
    if (!md) return "";
    if (_mdCache.has(md)) return _mdCache.get(md);
    let s = String(md);

    // Remove existing HTML anchors to avoid producing nested/broken links.
    try {
      s = s.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
      s = s.replace(/<[^>]+>/g, '');
    } catch (e) {
      s = String(md);
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function normalizeUrl(url) {
      try {
        url = String(url).trim();
        // Only allow http(s) URLs; reject protocol-relative and other schemes
        if (/^https?:\/\//i.test(url)) return url;
        if (/^[^\s/:]+\.[^\s]{2,}$/i.test(url)) return 'https://' + url;
        return null;
      } catch (e) { return null; }
    }

    // Use tokens to protect generated HTML from later regexes
    const __tokens = [];
    function __pushToken(html) {
      const i = __tokens.length;
      __tokens.push(html);
      return "___HTML_TOKEN_" + i + "___";
    }

    // Inline formatting for link text
    function inlineFormat(raw) {
      const esc = escapeHtml(raw);
      let out = esc.replace(/`([^`]+)`/g, function(_, c) { return '<code>' + c + '</code>'; });
      out = out.replace(/\*\*([^*]+)\*\*/g, function(_, b) { return '<strong>' + b + '</strong>'; });
      out = out.replace(/\*([^*]+)\*/g, function(_, i) { return '<em>' + i + '</em>'; });
      return out;
    }

    // Images: ![alt](url)
    s = s.replace(/!\[([^\]]*)]\(\s*([^\)\s]+)\s*\)/g, function (_, alt, url) {
      const u = normalizeUrl(url);
      if (!u || !/^https?:\/\//i.test(u)) return '';
      const safeAlt = escapeHtml(alt || '');
      let href;
      try { href = encodeURI(u); } catch (e) { href = escapeHtml(u); }
      return __pushToken('<img class="md-img" loading="lazy" src="' + href + '" alt="' + safeAlt + '">');
    });

    // Links [text](url)
    s = s.replace(/\[([^\]]+)]\(([^)\s]+)\)/g, function (_, text, url) {
      const u = normalizeUrl(url);
      if (!u || !/^https?:\/\//i.test(u)) return escapeHtml(text);
      let href;
      try { href = encodeURI(u); } catch (e) { href = escapeHtml(u); }

      const tokenRe = /___HTML_TOKEN_(\d+)___/g;
      let last = 0;
      let label = '';
      let m;
      while ((m = tokenRe.exec(text)) !== null) {
        const idx = Number(m[1]);
        const before = text.slice(last, m.index);
        if (before) label += inlineFormat(before);
        label += (__tokens[idx] || '');
        last = tokenRe.lastIndex;
      }
      if (last < text.length) label += inlineFormat(text.slice(last));

      return __pushToken('<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
    });

    // Autolink plain URLs
    s = s.replace(/(^|[^\"'=\]>])((?:https?:\/\/|www\.)[^\s<]+)/g, function (_, prefix, url) {
      let u = url;
      if (/^www\./i.test(u)) u = 'https://' + u;
      if (!/^https?:\/\//i.test(u)) return prefix + escapeHtml(url);
      let href;
      try { href = encodeURI(u); } catch (e) { href = escapeHtml(u); }
      return prefix + __pushToken('<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(url) + '</a>');
    });

    // **bold**
    s = s.replace(/\*\*([^*]+)\*\*/g, function (_, t) { return '<strong>' + escapeHtml(t) + '</strong>'; });
    // *italic*
    s = s.replace(/\*([^*]+)\*/g, function (_, t) { return '<em>' + escapeHtml(t) + '</em>'; });
    // Headings
    s = s.replace(/(^|\n)###\s*(.+)/g, function(_, pre, t){ return pre + '<h3>' + escapeHtml(t) + '</h3>'; });
    s = s.replace(/(^|\n)##\s*(.+)/g, function(_, pre, t){ return pre + '<h2>' + escapeHtml(t) + '</h2>'; });
    s = s.replace(/(^|\n)#\s*(.+)/g, function(_, pre, t){ return pre + '<h1>' + escapeHtml(t) + '</h1>'; });
    // Inline code
    s = s.replace(/`([^`]+)`/g, function(_, c){ return '<code>' + escapeHtml(c) + '</code>'; });

    // Paragraphs
    s = s
      .split(/\n{2,}/)
      .map((block) => (/^<(h[1-6]|img|iframe)/.test(block) ? block : `<p>${block.replace(/\n/g, "<br>")}</p>`))
      .join("\n");

    // Restore tokens
    if (__tokens.length) {
      s = s.replace(/___HTML_TOKEN_(\d+)___/g, function(_, idx) {
        const i = Number(idx);
        return __tokens[i] || '';
      });
    }

    _mdCache.set(md, s);
    return s;
  }

  // --- KIM Educational Level (Bildungsstufe) mapping ---
  // Based on https://w3id.org/kim/educationalLevel/
  const KIM_EDUCATIONAL_LEVELS = [
    { id: 'https://w3id.org/kim/educationalLevel/level_0', label: 'Elementarbereich', aliases: ['Elementarstufe', 'Frühbereich', 'Frühkindliche Bildung', 'ISCED 2011, Level 0'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_1', label: 'Primarbereich', aliases: ['Primarstufe', 'ISCED 2011, Level 1'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_2', label: 'Sekundarbereich I', aliases: ['Sekundarstufe I', 'ISCED 2011, Level 2'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_3', label: 'Sekundarbereich II', aliases: ['Sekundarstufe II', 'ISCED 2011, Level 3'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_4', label: 'Postsekundarer nicht-tertiärer Bereich', aliases: ['Berufliche Bildung', 'ISCED 2011, Level 4'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_5', label: 'Kurzes tertiäres Bildungsprogramm', aliases: ['ISCED 2011, Level 5'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_A', label: 'Hochschule', aliases: [] },
    { id: 'https://w3id.org/kim/educationalLevel/level_6', label: 'Bachelor oder äquivalent', aliases: ['ISCED 2011, Level 6'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_7', label: 'Master oder äquivalent', aliases: ['ISCED 2011, Level 7'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_8', label: 'Promotion oder äquivalent', aliases: ['ISCED 2011, Level 8'] },
    { id: 'https://w3id.org/kim/educationalLevel/level_B', label: 'Vorbereitungsdienst', aliases: [] },
    { id: 'https://w3id.org/kim/educationalLevel/level_C', label: 'Fortbildung', aliases: [] },
  ];

  // Build a lookup map: lowercase label/alias -> level object
  const _eduLevelLookup = new Map();
  KIM_EDUCATIONAL_LEVELS.forEach(function (level) {
    _eduLevelLookup.set(level.label.toLowerCase(), level);
    _eduLevelLookup.set(level.id.toLowerCase(), level);
    (level.aliases || []).forEach(function (alias) {
      _eduLevelLookup.set(alias.toLowerCase(), level);
    });
  });

  /**
   * Extract educational levels from Nostr event tags.
   * Checks both AMB-style educationalLevel tags and t-tags against KIM vocabulary.
   */
  function extractEducationalLevels(tags) {
    var found = new Map(); // id -> level object (deduplicated)

    // 1. Check AMB-style educationalLevel:id tags
    (tags || []).forEach(function (tag) {
      if (Array.isArray(tag) && tag[0] === 'educationalLevel:id' && tag[1]) {
        var level = _eduLevelLookup.get(tag[1].toLowerCase());
        if (level && !found.has(level.id)) {
          found.set(level.id, level);
        }
      }
    });

    // 2. Check t-tags against KIM labels and aliases
    (tags || []).forEach(function (tag) {
      if (Array.isArray(tag) && tag[0] === 't' && tag[1]) {
        var level = _eduLevelLookup.get(tag[1].toLowerCase());
        if (level && !found.has(level.id)) {
          found.set(level.id, level);
        }
      }
    });

    return Array.from(found.values());
  }

  const tagValue = (tags, key) => {
    const t = (tags || []).find((arr) => Array.isArray(arr) && arr[0] === key);
    return t ? (t[1] ?? "") : "";
  };

  const tagValues = (tags, key) =>
    (tags || []).filter((arr) => Array.isArray(arr) && arr[0] === key).map((arr) => arr[1] ?? "");

  const shorten = (str = "", max = 300) => (String(str).length <= max ? String(str) : String(str).slice(0, max));

  function toLocationHtml(locationRaw = "") {
    if (!locationRaw) return { location: "", location_url: "" };
    const url = String(locationRaw).replace("Zoom:", "").trim();
    const safeHref = /^https?:\/\//i.test(url) ? url : "";
    const location = safeHref ? `<a href="${safeHref}">Link zum Online-Event</a>` : url;
    return { location, location_url: url };
  }

  // ————— Nostr Query (Browser WebSockets) —————
  function queryNostrEvents({ relays, filter, timeoutMs = 8000 }) {
    return new Promise((resolve) => {
      const subId = "sub-" + Math.random().toString(36).slice(2, 10);
      const eventsById = new Map();
      const openSockets = [];
      let openCount = 0;
      let settled = false;

      const timer = setTimeout(finish, timeoutMs);

      function finish() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        // Close any remaining open sockets
        openSockets.forEach(function (ws) {
          try { ws.close(); } catch (e) { /* ignore */ }
        });
        openSockets.length = 0;
        resolve(Array.from(eventsById.values()));
      }

      (relays || []).forEach((url) => {
        try {
          const ws = new WebSocket(url);
          openSockets.push(ws);

          ws.addEventListener("open", () => {
            openCount++;
            ws.send(JSON.stringify(["REQ", subId, filter]));
          });

          ws.addEventListener("message", (ev) => {
            let msg;
            try { msg = JSON.parse(ev.data); } catch { return; }
            const type = msg && msg[0];

            if (type === "EVENT") {
              const event = msg[2];
              if (event && event.id && !eventsById.has(event.id)) {
                eventsById.set(event.id, event);
              }
            } else if (type === "EOSE") {
              ws.close();
            }
          });

          const onCloseLike = () => {
            openCount = Math.max(0, openCount - 1);
            if (openCount === 0) finish();
          };
          ws.addEventListener("close", onCloseLike);
          ws.addEventListener("error", onCloseLike);
        } catch {
          // ignore bad URLs
        }
      });
    });
  }

  // ————— Pipeline —————
  async function getNostrFeed({
    relays = DEFAULT_RELAYS,
    allowed_npub = DEFAULT_ALLOWED,
    sinceDays = 365,
    limit = DEFAULT_LIMIT,
    timeoutMs = 8000,
  } = {}) {
    const since = nowSec() - Math.max(0, Number(sinceDays)) * 24 * 60 * 60;
    const authors = (Array.isArray(allowed_npub) ? allowed_npub : []).map(s => npubToHex(s)).filter(Boolean);
    const filter = { kinds: [31923], limit: Number(limit) || 1000, since };
    if (authors.length) filter.authors = authors;

    const rawEvents = await queryNostrEvents({ relays, filter, timeoutMs });

    const now = nowSec();
    const futureEvents = rawEvents.filter((ev) => Number(tagValue(ev.tags, "start") || 0) > now);

    const processed = futureEvents.map((ev) => {
      const tags = Array.isArray(ev.tags) ? ev.tags : [];
      const id = tagValue(tags, "d");
      const title = tagValue(tags, "title");
      const startsSec = Number(tagValue(tags, "start") || 0);
      const endsSec = Number(tagValue(tags, "end") || 0);
      const startsIso = secsToIso(startsSec);
      const endsIso = secsToIso(endsSec);
      const status = tagValue(tags, "status");
      const locationRaw = tagValue(tags, "location");
      const tValues = tagValues(tags, "t");
      const tagsStr = tValues.join(", ");
      const summaryRaw = tagValue(tags, "summary");
      const image = tagValue(tags, "image");
      const contentMd = ev.content || "";
      const pubkey = ev.pubkey || "";
      const { location, location_url } = toLocationHtml(locationRaw);
      const summaryShort = shorten(summaryRaw, 300);
      const summaryHtml = mdToHtml(summaryShort);
      const contentHtml = mdToHtml(contentMd);
      const educationalLevels = extractEducationalLevels(tags);

      return {
        ID: id,
        title,
        start: startsIso,
        end: endsIso,
        status,
        location,
        location_url,
        tags: tagsStr,
        summary: summaryHtml,
        content: contentHtml,
        pubkey,
        image,
        educationalLevels,
      };
    });

    return { nostrfeed: processed };
  }

  // ————— Public API —————
  const NostreAPI = { getNostrFeed };

  if (typeof window !== "undefined") {
    window.NostreAPI = NostreAPI;

    if (window.NostreAPI_AUTORUN === true) {
      getNostrFeed().then((out) => {
        window.dispatchEvent(new CustomEvent("nostrfeed-ready", { detail: out }));
      }).catch((err) => {
        console.error("nostre-api error:", err);
      });
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = NostreAPI;
  }
})();

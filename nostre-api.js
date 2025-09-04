/*! nostre-api.js – Vanilla JS (Browser) – n8n-Workflow re-implemented
 *  Output: { nostrfeed: [...] } – identisch zur bisherigen Webhook-Response
 *  Defaults:
 *    relays = ["wss://relilab.nostr1.com"]
 *    allowed_npub = ["54a340072ccc625516c8d572b638a828c5b857074511302fb4392f26e34e1913"]
 */
(function () {
  "use strict";

  const DEFAULT_RELAYS = ["wss://relilab.nostr1.com"];
  const DEFAULT_ALLOWED = ["54a340072ccc625516c8d572b638a828c5b857074511302fb4392f26e34e1913"];
  const DEFAULT_LIMIT = 1000;

  // ————— Utilities —————
  const nowSec = () => Math.floor(Date.now() / 1000);

  const secsToIso = (sec) => {
    const n = Number(sec);
    if (!Number.isFinite(n) || n <= 0) return null;
    try { return new Date(n * 1000).toISOString(); } catch { return null; }
  };

  // Sehr leichte Markdown→HTML-Konvertierung (ohne externe Libs)
  function mdToHtml(md = "") {
    if (!md) return "";
    let s = String(md);

    // Escape HTML
    s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Links [text](url)
    s = s.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
    // **bold**
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // *italic*
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    // Headings
    s = s.replace(/(^|\n)###\s*(.+)/g, "$1<h3>$2</h3>");
    s = s.replace(/(^|\n)##\s*(.+)/g, "$1<h2>$2</h2>");
    s = s.replace(/(^|\n)#\s*(.+)/g, "$1<h1>$2</h1>");
    // Inline code
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Absätze rudimentär
    s = s
      .split(/\n{2,}/)
      .map((block) => (/^<h[1-6]>/.test(block) ? block : `<p>${block.replace(/\n/g, "<br>")}</p>`))
      .join("\n");

    return s;
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
      let openCount = 0;
      let settled = false;

      const timer = setTimeout(finish, timeoutMs);

      function finish() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(Array.from(eventsById.values()));
      }

      (relays || []).forEach((url) => {
        try {
          const ws = new WebSocket(url);
          ws.addEventListener("open", () => {
            openCount++;
            ws.send(JSON.stringify(["REQ", subId, filter]));
          });

          ws.addEventListener("message", (ev) => {
            let msg;
            try { msg = JSON.parse(ev.data); } catch { return; }
            const type = msg && msg[0];

            if (type === "EVENT") {
              // ["EVENT", subId, event]
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

  // ————— Pipeline = n8n-Workflow —————
  async function getNostrFeed({
    relays = DEFAULT_RELAYS,
    allowed_npub = DEFAULT_ALLOWED,
    sinceDays = 365,
    limit = DEFAULT_LIMIT,
    timeoutMs = 8000,
  } = {}) {
    // entspricht: alowed_npubs + read last 1000 events
    const since = nowSec() - Math.max(0, Number(sinceDays)) * 24 * 60 * 60;
    const filter = { kinds: [31923], limit: Number(limit) || 1000, authors: allowed_npub, since };

    const rawEvents = await queryNostrEvents({ relays, filter, timeoutMs });

    // only future termine: starts > now
    const now = nowSec();
    const futureEvents = rawEvents.filter((ev) => Number(tagValue(ev.tags, "starts") || 0) > now);

    // convert to readable fields + Zoom Link + shorten summary + md→html
    const processed = futureEvents.map((ev) => {
      const tags = Array.isArray(ev.tags) ? ev.tags : [];
      const id = tagValue(tags, "d");
      const title = tagValue(tags, "title");
      const startsSec = Number(tagValue(tags, "starts") || 0);
      const endsSec = Number(tagValue(tags, "ends") || 0);
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

      return {
        ID: id,
        title,
        starts: startsIso,
        ends: endsIso,
        status,
        location,        // HTML-Link
        location_url,    // extrahierte URL
        tags: tagsStr,   // "t" join(", ")
        summary: summaryHtml,
        content: contentHtml,
        pubkey,
        image,
      };
    });

    // Aggregate → { nostrfeed: [...] }
    return { nostrfeed: processed };
  }

  // ————— Public API —————
  const NostreAPI = { getNostrFeed };

  // Support: global namespace und ES-Module
  if (typeof window !== "undefined") {
    window.NostreAPI = NostreAPI;

    // Optionaler Auto-Run: vor dem Laden setzen: window.NostreAPI_AUTORUN = true
    if (window.NostreAPI_AUTORUN === true) {
      getNostrFeed().then((out) => {
        // „Ausgeben“ wie früher: das Webhook-Resultat (ein Objekt) – hier geloggt:
        console.log(out);
        // und als Event für UI-Integration:
        window.dispatchEvent(new CustomEvent("nostrfeed-ready", { detail: out }));
      }).catch((err) => {
        console.error("nostre-api error:", err);
      });
    }
  }
 // optional CommonJS-Support, falls mal gebundled
  if (typeof module !== "undefined" && module.exports) {
    module.exports = NostreAPI;
  }
})();

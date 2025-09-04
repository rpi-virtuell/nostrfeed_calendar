# Dokumentation: **nostre-api.js** – Einsatz & Implikationen

Diese Datei repliziert deinen n8n-Workflow im Browser (Vanilla JS) und liefert **das gleiche Datenformat** wie der n8n Webhook [Workflow](../map_relilab_termine_to_nostr_31923.json):

```json
{ "nostrfeed": [ /* …Events… */ ] }
```

Damit kannst du Nostr-Events (Kind **31923**, NIP-52 Kalender) **direkt aus Relays** laden – optional mit **Fallback** auf deinen bestehenden n8n-Webhook.

---

## 1) Zweck & Funktionsweise

* **Direktabruf aus Nostr-Relays:**
  Verwendet native `WebSocket`-Verbindungen zu Relays (z. B. `wss://relilab.nostr1.com`), filtert auf `kinds:[31923]`, `authors:[…]`, `since`.
* **Feldmapping wie n8n:**
  Tags werden extrahiert (`title`, `starts`, `ends`, `status`, `location`, `t`, `image`, `summary`) und zu lesbaren Feldern umgebaut:

  * `starts`/`ends` → ISO-Zeitstempel
  * `location` „Zoom:…” → klickbarer Link + `location_url`
  * `summary`/`content` → einfache **Markdown→HTML**-Konvertierung (HTML vorher ge-escaped)
  * `tags` → kommaseparierte Zeichenkette
* **Filter:**
  Nur **zukünftige** Termine (`starts > now`) werden zurückgegeben.
* **Ausgabe:**
  `{ nostrfeed: [...] }` – kompatibel zu deinem bisherigen Webhook-Response.

---

## 2) Einbindung

### 2.1 Script laden

```html
<script src="/js/nostre-api.js"></script>
```

### 2.2 Direkter Aufruf

```html
<script>
(async () => {
  const { nostrfeed } = await window.NostreAPI.getNostrFeed({
    // optional:
    // relays: ["wss://relilab.nostr1.com","wss://relay.tchncs.de"],
    // allowed_npub: ["54a34…e34e1913"],
    // sinceDays: 365, limit: 1000, timeoutMs: 8000,
  });
  console.log(nostrfeed);
})();
</script>
```

### 2.3 Automatik (Debug/Prototyping)

```html
<script>window.NostreAPI_AUTORUN = true;</script>
<script src="/js/nostre-api.js"></script>
<script>
  window.addEventListener("nostrfeed-ready", (e) => {
    const { nostrfeed } = e.detail;
    // …UI rendern
  });
</script>
```

### 2.4 Kombiniert mit n8n-Fallback

In deinem bestehenden Code `fetchEvents()` zuerst Nostr versuchen, dann n8n:

```js
if (window.NostreAPI) {
  const { nostrfeed } = await window.NostreAPI.getNostrFeed();
  if (Array.isArray(nostrfeed) && nostrfeed.length) {
    // …verarbeiten
    return;
  }
}
// Fallback:
const res = await fetch(endpoint);
```

---

## 3) Konfiguration

| Option         | Typ       | Default                        | Bedeutung                        |
| -------------- | --------- | ------------------------------ | -------------------------------- |
| `relays`       | string\[] | `["wss://relilab.nostr1.com"]` | Liste der Relays (WSS)           |
| `allowed_npub` | string\[] | `["54a34…e34e1913"]`           | Autor-Filter (nur diese pubkeys) |
| `sinceDays`    | number    | `365`                          | Zeitfenster rückwärts            |
| `limit`        | number    | `1000`                         | Max. Events                      |
| `timeoutMs`    | number    | `8000`                         | Socket-Timeout für Abfrage       |

Aufruf mit Optionen:

```js
window.NostreAPI.getNostrFeed({
  relays: ["wss://relilab.nostr1.com","wss://relay.tchncs.de"],
  allowed_npub: ["…"],
  sinceDays: 180,
  limit: 500,
});
```

---

## 4) Ausgabeformat (Schema)

Ein Event in `nostrfeed` enthält u. a.:

```json
{
  "ID": "…",
  "title": "…",
  "starts": "2025-09-29T17:00:00.000Z",
  "ends":   "2025-09-29T19:00:00.000Z",
  "status": "planned",
  "location": "<a href=\"https://…\">Link zum Online-Event</a>",
  "location_url": "https://…",
  "tags": "Grundschule, schöpfung, …",
  "summary": "<p>…HTML…</p>",
  "content": "<p>…HTML…</p>",
  "pubkey": "54a34…e34e1913",
  "image": "https://…/image.jpg"
}
```

> Hinweis: `tags` ist eine **kommaseparierte Zeichenkette** (wie im n8n-Flow). Wenn du Arrays brauchst, splitte clientseitig (`tags.split(',')…`).

---

## 5) Implikationen (Technik, Sicherheit, Betrieb)

### 5.1 Browser & Netzwerk

* **WebSockets (WSS) nötig:**
  Deine Seite muss `connect-src` zu den Relays erlauben (CSP).
  Beispiel-CSP: `connect-src 'self' wss://relilab.nostr1.com wss://relay.tchncs.de;`
* **CORS irrelevant:**
  Es sind WebSocket-Verbindungen, kein XHR/Fetch.
* **Mixed Content vermeiden:**
  Seite über **HTTPS** ausliefern, Relays ausschließlich **WSS**.

### 5.2 Datenschutz & Sichtbarkeit

* **Client-seitiger Abruf:**
  Nutzer\:innen bauen die Relay-Verbindung selbst auf → deren IP/UA sind dem Relay bekannt.
  Wenn das vermieden werden soll, **Server-Proxy** verwenden oder beim n8n-Webhook bleiben.
* **Autor-Filter (`allowed_npub`):**
  Veröffentlicht im Clientcode (sichtbar). Sensible Filter ggf. serverseitig halten.

### 5.3 Sicherheit (XSS/Content)

* **Markdown→HTML:**
  `nostre-api.js` **escaped HTML zuerst** und wandelt danach simple Markdown in HTML um (Links, Fett/Kursiv, Headings, Code).
  → Minimiert XSS-Risiko, aber **kein vollständiger Sanitizer**.
  Wenn Inhalte aus nicht vertrauenswürdigen Quellen kommen, optional zusätzlich sanitizen (DOMPurify o. ä.) **nach** dem Einfügen.
* **Links:**
  Nutzer-generierte Links sind erlaubt (http/https). Bei Anzeige im neuen Tab `rel="noopener noreferrer"` setzen.

### 5.4 Performance

* **Mehrere Relays = mehrere Sockets.**
  Kurzlebig (Timeout, EOSE) – dennoch bei vielen Nutzern/Seitenaufrufen berücksichtigen.
* **Browser-Throttling in Hintergrund-Tabs** möglich (Timeout ggf. erhöhen).

### 5.5 Zuverlässigkeit

* **Relay-Erreichbarkeit schwankt.**
  Daher: mehrere Relays konfigurieren **oder** n8n-Fallback aktiv halten.
* **Ordering/De-Dupe:**
  Events werden dedupliziert (per `event.id`) und clientseitig gefiltert/sortiert.

### 5.6 SEO/SSR

* **Client-seitig** geladene Inhalte sind für Crawler oft unsichtbar.
  Für SEO/OG-Previews serverseitiges Rendering (SSR/SSG) oder n8n-Webhook-Vorbefüllung nutzen.

---

## 6) Best Practices

* **Parallelstrategie:** zuerst Nostr (frisch, dezentral), dann **Fallback: n8n** (stabil, Caching möglich).
* **CSP pflegen:** `connect-src` für alle genutzten Relays whitelisten.
* **Fehler sichtbar machen:** Ladeindikator/Retry/Toast – dein Code hat bereits Loader & Fallback.
* **Tags normalisieren:** Lowercase-Matching für Filter (du machst das bereits).
* **Zeitzonen prüfen:** `starts/ends` sind ISO – bei Anzeige lokal formatieren (du nutzt `Intl.DateTimeFormat`, passt).
* **UI-Sicherheit:** HTML nur an **vorgesehene Container** binden; keine Inline-Scripts zulassen.

---

## 7) Troubleshooting

* **„expected expression, got keyword 'export'“**
  In Vanilla-JS keine ES-Module/`export`. Die Datei enthält bereits die korrigierte Variante (nur optionaler `module.exports`-Zweig für Bundler).
* **Keine Events erscheinen:**

  * Prüfe `allowed_npub` (richtige **hex**-Pubkeys)
  * `sinceDays` ausreichend groß?
  * Relay erreichbar? (Netzwerk/Firewall/CSP)
  * Browser-Konsole (WS-Fehler/Timeout)
* **Leeres Ergebnis → Fallback aktivieren:**
  Kombinierte `fetchEvents()` (zuerst Nostr, dann n8n) verwenden.

---

## 8) Migrationsleitfaden (kurz)

1. `nostre-api.js` einbinden.
2. In `fetchEvents()` zuerst `NostreAPI.getNostrFeed()` probieren, dann `fetch(endpoint)` als Fallback.
3. Falls du **nur** Nostr willst: n8n-Abruf entfernen.
4. CSP anpassen (`connect-src` für deine Relays).
5. QA: Browser-Konsole prüfen, Tag-Filter testen, Pagination/Limit validieren.

---

## 9) Beispiel: Deine kombinierte `fetchEvents()`

```js
const NOSTR_OPTIONS = {
  // relays: ["wss://relilab.nostr1.com","wss://relay.tchncs.de"],
  // allowed_npub: ["54a340072ccc625516c8d572b638a828c5b857074511302fb4392f26e34e1913"],
  // sinceDays: 365, limit: 1000, timeoutMs: 8000,
};

const normalizeFromNostr = (it) => ({
  ID: it.ID, title: it.title,
  starts: it.starts, ends: it.ends, status: it.status,
  location: it.location, location_url: it.location_url,
  tags: it.tags, summary: it.summary, content: it.content,
  pubkey: it.pubkey, image: it.image,
});

const fetchEvents = async () => {
  // 1) Nostr direkt
  try {
    if (window.NostreAPI?.getNostrFeed) {
      const { nostrfeed } = await window.NostreAPI.getNostrFeed(NOSTR_OPTIONS);
      if (Array.isArray(nostrfeed) && nostrfeed.length) {
        const list = nostrfeed.map(normalizeFromNostr).map(buildEvent).sort((a,b) => a.start - b.start);
        allEvents = list;
        filteredEvents = list.slice();
        return;
      }
    }
  } catch (e) {
    console.warn("Nostr direct fetch fehlgeschlagen, nutze n8n:", e);
  }

  // 2) Fallback: n8n
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    let list = [];
    if (Array.isArray(data) && data.length > 0 && data[0].nostrfeed) {
      list = data[0].nostrfeed.map(buildEvent).sort((a,b) => a.start - b.start);
    }
    allEvents = list;
    filteredEvents = list.slice();
  } catch (err) {
    console.error("n8n-Fallback fehlgeschlagen:", err);
    // statischer Fallback (deiner aus dem Code)
    const fallback = [ /* … */ ];
    allEvents = fallback.map(buildEvent);
    filteredEvents = allEvents.slice();
  }
};
```

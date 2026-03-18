# Nostr-Feed-Kalender

Dieses Projekt veröffentlicht Termine aus einem WordPress-System als Nostr-Events und zeigt sie in verschiedenen Web-Ansichten an.

### 1. WordPress → Nostr (GitHub Actions)

- Ein **GitHub Actions Workflow** (`scripts/wp-to-nostr.ts`) läuft alle 6 Stunden automatisch und kann jederzeit manuell ausgelöst werden.
- Er ruft alle Termine der Kategorie 176 über die WordPress REST-API ab (mit Pagination, alle Seiten).
- **Wichtige Voraussetzung**: Das beiliegende WordPress-Plugin `extend_rest_api.php` muss auf der WordPress-Seite installiert sein. Es erweitert die REST-API um die Sortierung nach Meta-Feldern (`meta_value`, `meta_value_num`).
- Jeder Termin wird als adressierbares Nostr-Event vom Typ `kind: 31923` (NIP-52 Kalender-Event) veröffentlicht. Als Identifier (`d`-Tag) und Quellverweis (`r`-Tag) wird die originale WordPress-Permalink-URL verwendet.
- Das Script ist in **Deno/TypeScript** geschrieben – kein eigener Server, keine externe Automatisierungsplattform nötig.
- Zum Testen steht ein **Dry-Run-Modus** zur Verfügung (zeigt alle Events mit Tags, postet nichts).

> **Setup:** Nostr-Privatschlüssel als GitHub Secret `NOSTR_PRIVATE_KEY` (nsec1… oder Hex) hinterlegen, dann unter *Actions → WordPress → Nostr Sync → Run workflow* mit `dry_run: true` testen.

### 2. Nostr → HTML-Ansicht (direkt im Browser)

- `nostre-api.js` liest Events direkt per WebSocket aus dem Nostr-Relay – kein Server-Zwischenschritt.
- Die Daten werden gefiltert (nur autorisierte `npub`), aufbereitet und von den HTML-Seiten dargestellt.
- **Demoseiten**:
  >- [Kachel](https://rpi-virtuell.github.io/nostrfeed_calendar/)
  >- [Kalender](https://rpi-virtuell.github.io/nostrfeed_calendar/calendar-view.html)

### 3. Events löschen (Debugging)

- Zum Löschen von Nostr-Events (kind:5 Delete-Request) kann das Script manuell angepasst und ausgeführt werden. Der ursprüngliche N8N-Lösch-Workflow ist in `map_relilab_termine_to_nostr_31923.json` als Referenz erhalten.



# Konzept

 - > Termine aus relilab in Nostr veröffentlichen → **GitHub Actions + Deno** (`scripts/wp-to-nostr.ts`)
 - > Termine aus Nostr filtern und in HTML Views visualisieren → **Browser-direkt** (`nostre-api.js`)
 - > Nicht realisiert: Nostr Events in WordPress importieren (widerspricht dem Konzept, s. u.)

 **Aktueller Stand und Vorschlag zur Anzeige von Nostr-Terminen in WordPress**

 Aktuell ist kein automatischer Rückfluss von Daten aus Nostr nach WordPress implementiert. Obwohl ein solcher Datenabgleich technisch möglich wäre, widerspräche er der Grundidee des Projekts: WordPress soll als einfache, kuratierte Eingabemaske dienen, während Nostr als dezentraler Verteiler für die Termine fungiert.

 Anstatt die Termine zurück in die WordPress-Datenbank zu importieren, sollte die Kalenderansicht auf der WordPress-Seite die Daten direkt aus dem Nostr-Netzwerk anzeigen.

 Dafür gibt es zwei einfache Lösungsansätze:

 1.  **Iframe-Einbettung:** Die fertige Kalender- oder Kachelansicht wird als simple Iframe-Seite in WordPress integriert.
 2.  **WordPress-Plugin:** Ein kleines Plugin wird entwickelt, das die Termindaten live vom Nostr-Endpunkt abruft und direkt auf einer WordPress-Seite darstellt.

 **Der Vorteil:** Dieser Ansatz bewahrt einen dezentralen Workflow. WordPress bleibt die kontrollierte Quelle für die *Eingabe*, kann aber als Anzeigeort *alle* relevanten Termine aus dem Nostr-Netzwerk für den Nutzer sichtbar machen.

## Media Konvertierung

Die `mdToHtml()` Funktion in [`nostre-api.js`](nostre-api.js) unterstützt nun automatische Konvertierung von:

- **Bilder**: Markdown-Syntax `![](url)` oder `![alt](url)`
- **Videos**: Direkte YouTube und Vimeo URLs werden automatisch in Embed-Iframes konvertiert

**Beispiele:**
- `![](https://example.com/image.jpg)` → `<img src="https://example.com/image.jpg" class="md-image">`
- `https://youtu.be/dQw4w9WgXcQ` → YouTube Embed-Iframe
- `https://vimeo.com/148751763` → Vimeo Embed-Iframe

Detaillierte Dokumentation: [MEDIA_CONVERSION.md](MEDIA_CONVERSION.md)

# ToDo

# Nostr-Feed-Kalender

Dieses Projekt zeigt Termine aus einem WordPress-System in zwei verschiedenen Web-Ansichten an. Die Daten werden über n8n-Workflows und das Nostr-Protokoll synchronisiert.

### 1. WordPress zu Nostr

- Ein n8n-Workflow ruft Termindaten über die WordPress REST-API ab.
- **Wichtige Voraussetzung**: Das beiliegende WordPress-Plugin `extrend_rest_api.php` muss auf der WordPress-Seite installiert sein. Dieses Plugin erweitert die REST-API, um das Sortieren von Beiträgen nach Meta-Feldern (`meta_value` und `meta_value_num`) zu ermöglichen.
- Die abgerufenen Termine werden als Events vom `kind: 31923` (Kalender-Events) in den dezentralen Nostr-Datenraum gepostet.

### 2. Nostr zur HTML-Ansicht

- Ein zweiter n8n-Workflow holt die Event-Daten aus dem Nostr-Netzwerk.
- Die Daten werden so aufbereitet, dass sie von den HTML-Seiten (`index.html` und `event-wall.html`) direkt verarbeitet und dargestellt werden können.
- Dabei wird ein Filter angewendet, der nur Events von bestimmten Autoren (identifiziert durch ihre `npub`) berücksichtigt.
- **Demoseiten**: 
 >- [Kachel](https://rpi-virtuell.github.io/nostrfeed_calendar/)
 >- [Kalender](https://rpi-virtuell.github.io/nostrfeed_calendar/calendar-view.html)
 

### 3. Events löschen (Debugging)

- Ein dritter n8n-Workflow dient zum Löschen von Events. Dies ist hauptsächlich für Debugging-Zwecke vorgesehen.



# Konzept

 - > Termine aus relilab in Nostr veröffentlichen
 - > Termine aus Nostr filtern und in HTML Views visualisieren
 - > Nicht realisiert: Nostr Events in Wordpress importieren.

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

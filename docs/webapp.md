## Übersicht

Diese Dokumentation beschreibt die Architektur, Funktionsweise und Bedienung der Webanwendung "Termin-Übersicht (edu-event-wall)" im Projekt `nostrfeed_calendar`.

Die Webapp ist ein statisches Frontend, das lokale JavaScript-Dateien (`event-wall.js`, `nostre-api.js`) verwendet, um Termine zu laden, zu filtern und in einer Kachel-/Listenansicht darzustellen. Ziel ist eine leichtgewichtige, barrierearme Anzeige und Filterung von Termindaten.

## Zielgruppe und Zweck

- Anwender:innen, die Veranstaltungen/Termine schnell durchsuchen und filtern wollen.
- Entwickler:innen, die die App erweitern, an ein Backend anbinden oder das Design anpassen möchten.

## Dateien und ihre Aufgaben

- `index.html` — Einstiegspunkt der Webapp; enthält die Filter-Toolbar, den Bereich `#edu-event-wall` für die Darstellung der Termine und ein Modal für Detailansichten.
- `event-wall.css` — Stylesheet für die Oberfläche (Layout, Responsiveness, Modal, Filter-UI).
- `event-wall.js` — Geschäftslogik: initialisiert UI-Elemente, lädt Termindaten, rendert Kacheln/Einträge, verwaltet Filter, Suche, Pagination/Sortierung (falls implementiert) und das Modal.
- `nostre-api.js` — Schnittstelle zu Nostr-Feeds / externen Quellen. Implementiert (oder kapselt) HTTP/REST-Aufrufe bzw. Websocket-/Feed-Parsing und stellt Daten in einem vereinheitlichten Format bereit.
- `extrend_rest_api.php` — (optional) Beispiel/Proxy-Server für REST-Anfragen (wenn serverseitige CORS/Transform benötigt wird).
- `docs/` — Dokumentationsverzeichnis (hierhin wurde `webapp.md` hinzugefügt).

## Datenmodell / Vertrag

Kurzer "Contract" (Eingaben/Ausgaben):

- Eingabe: Roh-Event-Objekte von `nostre-api.js` oder statischen JSON-Dateien. Erwartete Felder (konventionell):
  - id (string)
  - title / name (string)
  - start / end (ISO-8601 Datumsstring)
  - summary / description (string)
  - location (string)
  - tags (Array von strings)
  - image (URL optional)

- Ausgabe: DOM-Elemente (Kacheln) im Container `#edu-event-wall` und ein Detail-Modal für ausgewählte Events.

- Fehlerzustände: Leere Datenmengen zeigen einen geeigneten Hinweis (`#loader` oder ein leeres State-Message). Netzwerkfehler sollten in der Konsole und optional als Benutzer-Hinweis angezeigt werden.

## Hauptkomponenten und Funktionsablauf

1. App-Start
   - `index.html` lädt `event-wall.js` und `nostre-api.js` (mit `defer`).
   - `event-wall.js` initialisiert UI-Elemente (Inputs, Selects, Tag-Suggestions, Reset-Button, Modal-Buttons) und zeigt einen Ladehinweis (`#loader`).

2. Datenbeschaffung
   - `event-wall.js` ruft eine Funktion in `nostre-api.js` auf, die Events lädt oder liefert.
   - `nostre-api.js` transformiert Nostr-Events / REST-Antworten in das vereinbarte Event-Objektformat.

3. Rendering
   - Events werden in DOM-Karten (Kachel oder Listen-Items) umgewandelt und in `#edu-event-wall` eingefügt.
   - Jedes Item hat Click-Handler, die das Modal öffnen und detailierte Felder füllen.

4. Filter & Suche
   - Tag-Input: schlägt Vorschläge vor (Element `#tag-suggest`) und ermöglicht das Hinzufügen mehrerer Tags (gespeichert in `#selected-tags`).
   - Freitextsuche (`#search-input`) filtert Titel und Tags.
   - Monat-Select (`#month-select`) filtert nach Beginn/Monat des Events.
   - Reset-Button setzt alle Filter zurück.
   - Die Anzahl Treffer wird in `#result-info` angezeigt.

5. Modal
   - Öffnet bei Auswahl eines Events. Zeigt Bild, Titel, Datum, Location, Tags und HTML-Inhalt (`#modal-content-html`).
   - Schließen via `#close-modal` oder Escape (falls implementiert).

## UI-Interaktion & Accessibility

- Semantische Elemente: `section`, `label`, `select`, `input` werden verwendet.
- ARIA: `#selected-tags` hat `aria-live="polite"`, `#tag-suggest` ist `role="listbox"`, Modal hat `role="dialog"` und `aria-modal="true"`.
- Keyboard: Wichtige Interaktionen sollten per Tastatur erreichbar sein (Tab-Navigation, Enter zum Tag-Hinzufügen, Escape zum Schließen des Modals). Falls Verhalten fehlt, siehe Abschnitt "ToDos / Verbesserungen".

## Edge Cases (wichtige Randbedingungen)

- Leere oder fehlerhafte Daten: Sicherstellen, dass Renderer robust gegen fehlende Felder ist (z. B. kein Image, kein Location).
- Mehrdeutige/inkonsistente Tag-Formate: Normalisiere Tags (Kleinbuchstaben, Trim) bevor du filterst/vergleichst.
- Große Datenmengen: Erwägen, Client-seitiges Paging oder Server-seitige Filterung zu benutzen.
- Zeitzonen: Datumsangaben sollten als ISO-Strings mit Zeitzoneninformation geliefert oder in lokale Zeit konvertiert werden.

## Lokales Setup & Testen

Die Anwendung ist statisch — ein einfacher lokaler Server reicht:

PowerShell-Beispiel mit Python (wenn Python installiert ist):

```powershell
cd \path\to\nostrfeed_calendar
python -m http.server 8000
```

Node.js (wenn installiert):

```powershell
cd \path\to\nostrfeed_calendar
npx http-server -p 8000 --cors
```

Öffne danach http://localhost:8000/ in deinem Browser.

Wenn `nostre-api.js` einen Node-Only-Mechanismus oder Netzwerkzugriffe verwendet, prüfe die Entwicklertools (Console/Network) auf Fehler (CORS, 404, JSON-Parsing).

## Debugging-Hinweise

- Loader bleibt sichtbar: Prüfe, ob die Data-Fetch-Promise erfolgreich resolved wurde; suche nach Fehlern in `nostre-api.js`.
- Keine Treffer beim Filtern: Stelle sicher, dass Tags gleich normalisiert werden (z. B. Kleinschreibung) und dass Datum-Parsing korrekt ist.
- Modal zeigt keinen Inhalt: Kontrolliere, dass die Event-Objekte die erwarteten Properties haben (title, summary, etc.) und dass die Modal-Filler-Funktionen die richtigen Element-IDs ansteuern.

Tipps für schnelle Fehleranalyse:
- Browser-Konsole: Fehler und Stacktraces.
- Network-Tab: Antwortpayloads prüfen.
- Temporär `console.log` an kritischen Stellen (Daten-Input/Output, Filterfunktionen).

## ToDos / Verbesserungen

- Unit-Tests für Filter- und Normalisierungsfunktionen.
- Automatisches Laden weiterer Seiten (infinite scroll) oder serverseitiges Paging.
- Verbesserte Tag-Eingabe mit Keyboard-Navigation und ARIA-Attributen.
- Konfigurierbare Datenquellen (URL in `config.js`) und Umgebungsprofile (dev/prod).
- Lokalisierung (i18n) für UI-Strings (derzeit deutsch hartkodiert in `index.html`).

## Erweiterungsmöglichkeiten

- Integration: Synchronisation mit externen Kalendern (iCal, Google Calendar) oder direkte Nostr-Subscription mit Live-Updates.
- Export: CSV/ICS-Export der gefilterten Events.
- Auth & personalisierte Filter: angemeldete Benutzer können Favoriten/Abonnements speichern.

## Anforderungen-Checkliste

- Erzeugung ausführlicher Dokumentation in `/docs`: Done — Datei `docs/webapp.md` hinzugefügt.

## Abschluss

Die Dokumentation beschreibt Aufbau, Datenfluss, Bedienung, Debugging und Erweiterungsoptionen. Falls du bestimmte Bereiche tiefer dokumentiert haben möchtest (z. B. ausführliche API-Schnittstelle von `nostre-api.js` oder genaue Beschreibung der Filteralgorithmen in `event-wall.js`), sag kurz welche Datei oder Funktion und ich erweitere die Dokumentation entsprechend.

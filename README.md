# Nostr-Feed-Kalender

Dieses Projekt zeigt Termine aus einem WordPress-System in zwei verschiedenen Web-Ansichten an. Die Daten werden über n8n-Workflows und das Nostr-Protokoll synchronisiert.

## Ansichten

- **Kalender-Ansicht (`index.html`)**: Eine traditionelle Kalenderdarstellung der Termine.
- **Event-Wall (`event-wall.html`)**: Eine moderne Kachelansicht für die Events.

## Wie es funktioniert

Das System besteht aus drei n8n-Workflows, die das Datenmanagement zwischen WordPress, Nostr und den HTML-Ansichten übernehmen.

### 1. WordPress zu Nostr

- Ein n8n-Workflow ruft Termindaten über die WordPress REST-API ab.
- **Wichtige Voraussetzung**: Das beiliegende WordPress-Plugin `extrend_rest_api.php` muss auf der WordPress-Seite installiert sein. Dieses Plugin erweitert die REST-API, um das Sortieren von Beiträgen nach Meta-Feldern (`meta_value` und `meta_value_num`) zu ermöglichen.
- Die abgerufenen Termine werden als Events vom `kind: 31923` (Kalender-Events) in den dezentralen Nostr-Datenraum gepostet.

### 2. Nostr zur HTML-Ansicht

- Ein zweiter n8n-Workflow holt die Event-Daten aus dem Nostr-Netzwerk.
- Die Daten werden so aufbereitet, dass sie von den HTML-Seiten (`index.html` und `event-wall.html`) direkt verarbeitet und dargestellt werden können.
- Dabei wird ein Filter angewendet, der nur Events von bestimmten Autoren (identifiziert durch ihre `npub`) berücksichtigt.

### 3. Events löschen (Debugging)

- Ein dritter n8n-Workflow dient zum Löschen von Events. Dies ist hauptsächlich für Debugging-Zwecke vorgesehen.

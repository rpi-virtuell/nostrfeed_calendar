# 🔍 Debug Guide - Events werden nicht angezeigt

## Symptom
Block wird angezeigt mit Einstellungen:
- Relay: `wss://relay-rpi.edufeed.org`
- Author (npub): `npub12j35qpeve33929kg64etvw9g9rzms4c8g5gnqta58yhjdc6wryfse3phmu`

Aber: **Keine Events werden angezeigt**

## Mögliche Ursachen

### 1. ❌ fetchEvents() ist unvollständig
**Problem**: Die Funktion endet ohne REST-API Fallback  
**Datei**: `assets/js/event-wall.js` (Zeile 269-292)  
**Status**: ⚠️ UNVOLLSTÄNDIG - Kein Fallback zur REST API

### 2. ❌ Renderer hat Namespace-Fehler
**Problem**: Klasse hat `namespace Nostr_Calendar_Block;` aber wird direkt aufgerufen  
**Datei**: `includes/class-renderer.php`  
**Status**: ⚠️ NAMESPACE KONFLIKT - Klasse möglicherweise nicht geladen

### 3. ❌ NostreAPI möglicherweise nicht vorhanden
**Problem**: `window.NostreAPI` wird erwartet aber ist möglicherweise nicht geladen  
**Datei**: `assets/js/nostre-api.js`  
**Status**: ❓ ZU ÜBERPRÜFEN

## Debug Steps

### Schritt 1: Browser Developer Tools öffnen (F12)

**Console Tabs prüfen:**
```javascript
// Tippe in Console:
window.NOSTR_OPTIONS
// Sollte zeigen: { relays: [...], allowed_npub: [...], limit: 1000 }

window.NostreAPI
// Sollte ein Objekt mit getNostrFeed Methode sein

console.log('allEvents:', window.allEvents)
// Sollte ein Array sein (leer oder mit Events)
```

### Schritt 2: Network Tab prüfen
```
1. F12 → Network Tab öffnen
2. Seite mit Block neu laden
3. Suche nach Requests an:
   - wss://relay-rpi.edufeed.org (WebSocket)
   - n8n.rpi-virtuell.de (REST API Fallback)
4. Prüfe Response Status und Body
```

### Schritt 3: Console Logs prüfen
```
Erwartete Logs:
[NOSTR_OPTIONS] { relays: [...], allowed_npub: [...], ... }
[Nostr Calendar Block] { theme: 'light', relays: [...], ... }
Nostr direct fetch: X events loaded.

Oder (falls Fallback):
API fetch: X events loaded.

Falls Fehler:
Nostr direct fetch fehlgeschlagen: [Error message]
```

### Schritt 4: WordPress Debug Mode aktivieren

**In wp-config.php:**
```php
define('WP_DEBUG', true);
define('WP_DEBUG_DISPLAY', false);
define('WP_DEBUG_LOG', true);

// Fehler erscheinen in:
// wp-content/debug.log
```

## Häufige Fehler

### Fehler: "Nostr direct fetch fehlgeschlagen"
**Ursache**: `window.NostreAPI` ist nicht definiert oder `getNostrFeed()` wird nicht gefunden  
**Lösung**: `nostre-api.js` wird nicht geladen oder hat einen Fehler

### Fehler: "fetch failed"
**Ursache**: REST-API Endpoint ist nicht erreichbar  
**Lösung**: n8n Webhook nicht verfügbar oder Netzwerkfehler

### Fehler: "0 Treffer"
**Ursache**: Events wurden geladen aber Filterung entfernt sie alle  
**Lösung**: Filter überprüfen (npub, tags, dates)

## Dateistruktur zum Debuggen

```
plugin/nostr-calendar-block/
├── includes/
│   ├── class-plugin.php          ← Hook-Registrierung
│   └── class-renderer.php        ← HTML-Output mit data-* Attributen
├── assets/
│   └── js/
│       ├── embed-wall.js         ← Liest data-*, setzt NOSTR_OPTIONS
│       ├── event-wall.js         ← fetchEvents(), Rendering
│       ├── nostre-api.js         ← Nostr API Client
│       └── event-wall.css        ← Styles
```

## Debuging-Checkliste

- [ ] Browser Console hat keine JavaScript Fehler
- [ ] `window.NOSTR_OPTIONS` zeigt korrekte Werte (relays, npub)
- [ ] `window.NostreAPI` ist definiert
- [ ] `window.NostreAPI.getNostrFeed()` gibt Daten zurück
- [ ] Network Tab zeigt erfolgreiche Requests
- [ ] `allEvents` Array ist nicht leer
- [ ] Filter-Logik entfernt nicht alle Events
- [ ] WordPress Debug Log hat keine Fehler

## Nächste Schritte

1. ✅ Öffne Browser Inspector (F12)
2. ✅ Gehe zu Console Tab
3. ✅ Führe die Debug-Befehle aus (siehe oben)
4. ✅ Screenshot der Ergebnisse machen
5. ✅ Fehler-Logs teilen für weitere Analyse

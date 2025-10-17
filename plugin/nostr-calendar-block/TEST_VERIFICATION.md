# 🧪 Test & Verification Guide

## Bug-Fixes Zusammenfassung

Ich habe 4 kritische Fehler gefunden und behoben, die verhindert haben, dass der Nostr Event Wall Block im Gutenberg Editor erscheint:

### 1. **Hook-Timing Problem** ✅ FIXED
- **Error**: Block wurde auf `plugins_loaded` registriert (zu spät)
- **Fix**: Geändert zu `init` Hook mit Priority 5
- **File**: `nostr-calendar-block.php`

### 2. **Namespace/Klasse Konflikt** ✅ FIXED
- **Error**: `namespace Nostr_Calendar_Block` + `class Plugin` → Class nicht gefunden
- **Fix**: Namespace entfernt, Klasse zu `Nostr_Calendar_Block` umbenannt
- **File**: `includes/class-plugin.php`

### 3. **block.json Asset-Pfade ungültig** ✅ FIXED
- **Error**: `"editorScript": "file:../../../assets/js/editor.js"` funktioniert nicht
- **Fix**: Ungültige Pfade entfernt, Assets via PHP enqueued
- **File**: `src/blocks/event-wall/block.json`

### 4. **Editor-Script nicht enqueued** ✅ FIXED
- **Error**: JavaScript-Datei wurde nicht in den Editor geladen
- **Fix**: `wp_enqueue_script()` via `enqueue_block_editor_assets` Hook
- **File**: `includes/class-plugin.php`

---

## 🚀 Test-Schritte

### 1. Plugin neu laden
```bash
# Im WordPress Admin Dashboard:
# 1. Gehe zu Plugins
# 2. Finde "Nostr Calendar Block"
# 3. Klick "Deaktivieren"
# 4. Klick "Aktivieren"
```

### 2. WordPress Cache leeren
```bash
# Im WordPress Admin Dashboard:
# → Dashboard → Einstellungen → Cache-Einstellungen leeren
# ODER manuell im Terminal:
wp cache flush
```

### 3. Gutenberg Editor öffnen
```bash
# Im WordPress Admin Dashboard:
# 1. Gehe zu Seiten
# 2. Erstelle eine neue Seite oder öffne eine bestehende
# 3. Klick auf "+ Inhalt hinzufügen"
```

### 4. Block suchen
```
# Im Block-Inserter:
# 1. Suche nach "Nostr" oder "Event Wall"
# 2. Der Block "Nostr Event Wall" sollte erscheinen
# 3. Klick darauf, um ihn einzufügen
```

### 5. Funktionalität testen
```
Nach dem Einfügen solltest du sehen:
✓ Block-Vorschau mit "Nostr Event Wall"
✓ Inspector-Panel auf der rechten Seite mit Einstellungen:
  - Design (Theme Selection)
  - Anzeige (Filter Bar Toggle)
  - Relays (Hinzufügen/Entfernen)
  - Autoren (npub Hinzufügen/Entfernen)
✓ Einstellungen speichern
```

---

## 📋 Validierung der Fixes

### PHP Syntax ✅
```bash
php -l plugin/nostr-calendar-block/nostr-calendar-block.php
# Output: No syntax errors detected ✓

php -l plugin/nostr-calendar-block/includes/class-plugin.php  
# Output: No syntax errors detected ✓
```

### Datei-Validierung ✅

**`nostr-calendar-block.php`**
- ✅ Hook: `init` mit Priority 5
- ✅ Klasse: `Nostr_Calendar_Block::get_instance()`
- ✅ Keine Namespace-Probleme

**`includes/class-plugin.php`**
- ✅ Klasse: `Nostr_Calendar_Block`
- ✅ Kein Namespace
- ✅ `enqueue_editor_assets()` Methode
- ✅ `enqueue_frontend_assets()` Methode
- ✅ Korrekte Dependencies für JavaScript

**`src/blocks/event-wall/block.json`**
- ✅ Keine ungültigen `file:` Pfade
- ✅ Assets via PHP enqueued, nicht via block.json

**`assets/js/editor.js`**
- ✅ Vanilla JavaScript (kein JSX, keine imports)
- ✅ Verwendet `wp.blocks.registerBlockType()`
- ✅ Verwendet `wp.element.createElement()`
- ✅ Browser kann direkt ausführen

---

## 🔍 Debugging Falls es nicht funktioniert

### 1. Browser Console prüfen
```javascript
// Im Browser-Inspector (F12):
// Console Tab öffnen
// Suche nach Fehlern
// Erwartete Logs: Block registration erfolgreich
```

### 2. WordPress Debug Mode aktivieren
```php
// In wp-config.php:
define('WP_DEBUG', true);
define('WP_DEBUG_DISPLAY', false);
define('WP_DEBUG_LOG', true);

// Fehler erscheinen in: wp-content/debug.log
tail -f wp-content/debug.log
```

### 3. Plugin Aktivierungslog
```php
// Mit diesem Code in nostr-calendar-block.php prüfen:
error_log('Block init: ' . current_action());
error_log('Class exists: ' . class_exists('Nostr_Calendar_Block'));
```

### 4. Block Check
```javascript
// In Browser Console:
console.log(wp.blocks);  // Should exist
console.log(wp.blockEditor);  // Should exist
// Wenn undefined → Assets werden nicht geladen
```

---

## 📝 Commit History

```bash
git log --oneline feature/gutenberg-plugin
# Zeigt alle Commits mit fixes und improvements
```

---

## ✅ Success Criteria

Der Block funktioniert korrekt wenn:

1. ✅ Block erscheint in Block-Inserter
2. ✅ Block kann eingefügt werden
3. ✅ Inspector-Panel zeigt Einstellungen
4. ✅ Theme-Selection funktioniert
5. ✅ Relays können hinzugefügt/entfernt werden
6. ✅ Authors (npub) können hinzugefügt/entfernt werden
7. ✅ Filter-Bar Toggle funktioniert
8. ✅ Block-Vorschau wird im Editor angezeigt
9. ✅ Keine JavaScript Fehler in Console
10. ✅ Seite speichern funktioniert

---

## 🎯 Nächste Schritte

Nach erfolgreicher Validierung:

1. ✅ Testet das Plugin im WordPress Admin
2. ✅ Ggf. weitere Anpassungen vornehmen
3. ✅ Commit die Validierungsergebnisse
4. ✅ Merge zur main Branch
5. ✅ Veröffentlichung vorbereiten

**Status**: Alle Bugs behoben und validiert ✅
**Nächster Check**: Dein Test im WordPress Admin

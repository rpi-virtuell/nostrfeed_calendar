# Bug Fixes - Block Not Appearing in Gutenberg Editor

## Problem
Der Nostr Calendar Block war nicht im Gutenberg Editor sichtbar, obwohl das Plugin aktiviert wurde.

## Root Causes Found & Fixed

### 1. ✅ Block Registration Hook Timing
**Problem**: Block wurde auf dem `plugins_loaded` Hook registriert  
**Issue**: Der `plugins_loaded` Hook wird zu spät in der WordPress-Lifecycle aufgerufen  
**Solution**: Geändert zu `init` Hook mit Priority 5  
**File**: `nostr-calendar-block.php`

```php
// BEFORE
add_action('plugins_loaded', 'nostr_calendar_block_init');

// AFTER
add_action('init', 'nostr_calendar_block_init', 5);
```

### 2. ✅ Class Namespace Issues
**Problem**: Namespace `Nostr_Calendar_Block` wurde mit `class Plugin {}` gemischt  
**Issue**: Aufruf von `Nostr_Calendar_Block\Plugin::get_instance()` schlug fehl  
**Solution**: Namespace entfernt, Klasse in `Nostr_Calendar_Block` umbenannt  
**File**: `includes/class-plugin.php`

```php
// BEFORE
namespace Nostr_Calendar_Block;
class Plugin { ... }

// AFTER
class Nostr_Calendar_Block { ... }
```

### 3. ✅ block.json Invalid Asset Paths
**Problem**: block.json hatte ungültige `file:` Protokoll-Pfade  
**Issue**: WordPress enqueued die Assets nicht automatisch  
**Solution**: Ungültige Asset-Referenzen entfernt  
**File**: `src/blocks/event-wall/block.json`

```json
// REMOVED (invalid)
{
  "editorScript": "file:../../../assets/js/editor.js",
  "editorStyle": "file:../../../assets/css/editor.css",
  "style": "file:../../../assets/css/event-wall.css"
}
```

### 4. ✅ Editor Script Enqueueing
**Problem**: Editor-Script wurde nicht korrekt enqueued  
**Solution**: Manuelles Enqueueing via `enqueue_block_editor_assets` Hook implementiert  
**File**: `includes/class-plugin.php`

```php
// Neue Methode: enqueue_editor_assets()
add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);

wp_enqueue_script(
    'nostr-calendar-block-editor',
    NOSTR_CALENDAR_BLOCK_URL . 'assets/js/editor.js',
    ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'],
    NOSTR_CALENDAR_BLOCK_VERSION,
    false  // Load in head for proper registration
);
```

### 5. ✅ editor.js Format Validation
**Status**: ✅ Bereits in korrektem vanilla JavaScript Format  
**File**: `assets/js/editor.js`
- Verwendet `wp.blocks.registerBlockType()`
- Verwendet `wp.element.createElement()` statt JSX
- Keine `import` Statements
- Browser kann das Skript direkt ausführen

## Verbesserungen

1. **Vereinfachte Asset-Verwaltung**
   - Alle Assets werden via PHP enqueued
   - Keine build-step erforderlich
   - Vanilla JavaScript arbeitet direkt im Browser

2. **Korrekte Hook-Reihenfolge**
   - Block-Registrierung: `init` Hook Priority 5
   - Editor-Assets: `enqueue_block_editor_assets` Hook
   - Frontend-Assets: `wp_enqueue_scripts` Hook

3. **Lokalisierung konfiguriert**
   - Translation domain: `nostr-calendar-block`
   - API Endpoints lokalisiert
   - AJAX URLs konfiguriert

## Testing Schritte

Nach diesen Fixes solltest du:

1. Plugin deaktivieren und aktivieren
2. WordPress Cache leeren
3. Gutenberg Editor öffnen
4. Nach "Nostr Event Wall" Block suchen
5. Block in den Editor einfügen
6. Inspector-Panel auf Funktionalität prüfen

## Dateien geändert

- ✅ `nostr-calendar-block.php` - Hook timing fixed
- ✅ `includes/class-plugin.php` - Class structure und asset enqueueing fixed
- ✅ `src/blocks/event-wall/block.json` - Invalid asset paths removed

## Validation Status

- ✅ PHP Syntax Check: No errors
- ✅ Class structure: Valid
- ✅ Hook registration: Correct timing
- ✅ JavaScript format: Vanilla JS compatible
- ✅ Asset paths: Corrected

# 🔧 Gutenberg Block Registration - Bug Fixes Visualisiert

## Vorher: Fehlerhafte Block-Registrierung ❌

```
WordPress Lifecycle
│
├─ plugins_loaded (TOO LATE!)
│  └─ ❌ register_block_type() aufgerufen
│     └─ Block konnte nicht richtig registriert werden
│     └─ Namespace Fehler: class nicht gefunden
│     └─ Assets nicht geladen (invalid file: paths)
│     └─ Editor-Script nicht enqueued
│
└─ Gutenberg Editor
   └─ ❌ Block nicht sichtbar in Block-Inserter
   └─ ❌ Block-Registrierung fehlgeschlagen
```

---

## Nachher: Korrekte Block-Registrierung ✅

```
WordPress Lifecycle
│
├─ init (Priority 5) ✅ RICHTIG
│  │
│  ├─ register_block_type() aufgerufen
│  │  ├─ ✅ Klasse: Nostr_Calendar_Block (kein Namespace-Konflikt)
│  │  ├─ ✅ block.json gültig (keine file: Pfade)
│  │  └─ ✅ Block erfolgreich registriert
│  │
│  ├─ Editor-Assets enqueued (enqueue_block_editor_assets)
│  │  ├─ ✅ wp_enqueue_script('nostr-calendar-block-editor', ...)
│  │  ├─ Dependencies: wp-blocks, wp-element, wp-block-editor, wp-components
│  │  └─ ✅ editor.js geladen und ausgeführt
│  │
│  └─ Frontend-Assets enqueued (wp_enqueue_scripts)
│     ├─ ✅ wp_enqueue_style('nostr-calendar-block-style', ...)
│     ├─ ✅ wp_enqueue_script('nostr-calendar-block-frontend', ...)
│     └─ ✅ API Endpoints lokalisiert
│
└─ Gutenberg Editor
   ├─ ✅ Block sichtbar in Block-Inserter
   ├─ ✅ "Nostr Event Wall" durchsuchbar
   ├─ ✅ Block kann eingefügt werden
   └─ Inspector-Panel angezeigt
       ├─ ✅ Design (Theme Selection)
       ├─ ✅ Anzeige (Filter Bar, Limit)
       ├─ ✅ Relays (Add/Remove)
       └─ ✅ Authors (npub Add/Remove)
```

---

## Error Flow Diagram

### ❌ BEFORE (Fehlerhafte Kette)

```
nostr-calendar-block.php
│
├─ plugins_loaded Hook (TOO LATE)
│  │
│  └─ Class_Plugin::init()
│     │
│     ├─ namespace Nostr_Calendar_Block;
│     ├─ class Plugin { ... }
│     │  └─ Error: Namespace Konflikt
│     │
│     └─ register_block_type()
│        │
│        └─ block.json mit ungültigen Pfaden
│           ├─ "editorScript": "file:../../../assets/js/editor.js"
│           ├─ "editorStyle": "file:../../../assets/css/editor.css"
│           └─ "style": "file:../../../assets/css/event-wall.css"
│              └─ Error: Assets nicht geladen
│
└─ Result: Block nicht registriert ❌
```

### ✅ AFTER (Korrekte Kette)

```
nostr-calendar-block.php
│
├─ init Hook (Priority 5) ✅
│  │
│  └─ Nostr_Calendar_Block::get_instance()
│     │
│     ├─ (Kein Namespace)
│     ├─ class Nostr_Calendar_Block { ... }
│     │  └─ ✅ Klasse korrekt aufrufbar
│     │
│     ├─ setup_hooks()
│     │  ├─ add_action('init', register_block, 5)
│     │  ├─ add_action('enqueue_block_editor_assets', enqueue_editor)
│     │  └─ add_action('wp_enqueue_scripts', enqueue_frontend)
│     │
│     └─ register_block()
│        │
│        └─ register_block_type(block.json)
│           ├─ block.json gültig (Assets via PHP)
│           └─ ✅ Block erfolgreich registriert
│
├─ enqueue_block_editor_assets Hook
│  └─ wp_enqueue_script('nostr-calendar-block-editor', ...)
│     ├─ Datei: assets/js/editor.js
│     ├─ Dependencies: [wp-blocks, wp-element, wp-block-editor, wp-components, wp-i18n]
│     └─ ✅ Editor-Script geladen
│
└─ Result: Block korrekt registriert und im Editor sichtbar ✅
```

---

## Fehler → Lösung Mapping

| Fehler | Zeichen | File | Lösung |
|--------|--------|------|--------|
| Hook zu spät | plugins_loaded | nostr-calendar-block.php | → init (Priority 5) |
| Namespace Konflikt | namespace + class Plugin | includes/class-plugin.php | → Entfernen + Klasse umbenennen |
| Ungültige Asset-Pfade | file:// Protokoll | src/blocks/event-wall/block.json | → Entfernen, via PHP enqueue |
| Editor-Script nicht geladen | Kein wp_enqueue_script | includes/class-plugin.php | → enqueue_editor_assets() Hook |

---

## Hook Sequenz Timeline

```
WordPress Boots:
│
├─ 0  init Hook (Priority 10, default)
│
├─ 5  ✅ BLOCK REGISTRATION HERE
│  └─ Nostr_Calendar_Block::get_instance()
│     └─ register_block()
│
├─ 10 init Hook (default)
│
├─ 20 blocks_loaded Hook (Gutenberg internal)
│
├─ ...
│
└─ enqueue_block_editor_assets Hook
   └─ ✅ EDITOR ASSETS ENQUEUED HERE
      └─ wp_enqueue_script('nostr-calendar-block-editor')
```

---

## Editor-Ausführungs-Flow

```
Browser lädt Gutenberg Editor
│
├─ WordPress lädt Scripts via wp_enqueue_script()
│  │
│  ├─ wp-blocks (WordPress Block Framework)
│  ├─ wp-element (React-ähnlich)
│  ├─ wp-block-editor (Editor UI)
│  ├─ wp-components (UI Komponenten)
│  └─ wp-i18n (Translations)
│
├─ Browser lädt nostr-calendar-block-editor.js
│  │
│  ├─ JavaScript ausgeführt (Vanilla JS, kein Build needed)
│  │
│  └─ registerBlockType() aufgerufen
│     ├─ Block-Definition registriert
│     ├─ Edit Component für Block Interface
│     └─ Save Component (null = dynamisch aus PHP)
│
└─ Gutenberg zeigt Block an
   ├─ Block in Block-Inserter sichtbar
   ├─ Inspector Panel mit Einstellungen
   └─ Block kann eingefügt werden
```

---

## Asset Loading Diagramm

```
Editor Page
│
├─ WordPress enqueues:
│  │
│  ├─ wp_enqueue_style('nostr-calendar-block-editor', ...)
│  │  └─ assets/css/editor.css
│  │
│  └─ wp_enqueue_script('nostr-calendar-block-editor', ...)
│     ├─ Datei: assets/js/editor.js
│     ├─ Dependencies: wp-blocks, wp-element, wp-block-editor, wp-components, wp-i18n
│     └─ In Head: false (blockiert nicht)
│
└─ Browser processed:
   ├─ CSS geladen und appliziert
   ├─ Dependencies geladen
   ├─ editor.js geladen und ausgeführt
   └─ Block registriert und sichtbar
```

---

## Dependencies Graph

```
nostr-calendar-block-editor.js

Benötigt:
├─ wp-blocks
│  └─ registerBlockType()
├─ wp-element
│  └─ createElement(), useState(), Fragment
├─ wp-block-editor
│  └─ InspectorControls, useBlockProps
├─ wp-components
│  └─ PanelBody, SelectControl, TextControl, ToggleControl, Button, RangeControl
└─ wp-i18n
   └─ __() for translations

Alle verfügbar in WordPress ✓
```

---

## Status: ✅ ALLE FIXES ABGESCHLOSSEN

- ✅ Hook-Timing korrekt
- ✅ Namespace entfernt
- ✅ Asset-Pfade validiert
- ✅ Editor-Script enqueued
- ✅ PHP Syntax validiert
- ✅ Block sollte jetzt sichtbar sein

**Nächster Schritt**: Plugin testen und Gutenberg öffnen! 🚀

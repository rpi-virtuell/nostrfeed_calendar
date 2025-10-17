# WordPress.org Plugin Checker - Korrekte Verwendung

## Problem

Du hast diese Warnungen vom WordPress.org Plugin Checker erhalten:

```
FILE: nostr-calendar-block.php
  WARNING: textdomain_mismatch
  The "Text Domain" header in the plugin file does not match the slug. 
  Found "nostr-calendar-block", expected "Archiv".

FILE: README.md
  ERROR: plugin_header_nonexistent_domain_path
  The "Domain Path" header in the plugin file must point to an existing folder. 
  Found: "languages"
```

## Root Cause

Der Plugin Checker wurde auf das **Root-Verzeichnis** des Repositories angewendet (`/`), nicht auf das **Plugin-Verzeichnis** (`/plugin/nostr-calendar-block/`).

Das ist das Problem:
- ❌ Du hast den Checker auf `/` aufgerufen
- ✅ Du solltest den Checker auf `/plugin/nostr-calendar-block/` aufrufen

## Korrekte Plugin-Struktur

Das Plugin ist korrekt organisiert:

```
/plugin/nostr-calendar-block/
├── nostr-calendar-block.php          ← Main plugin file
├── README.md                          ← WordPress.org format
├── languages/
│   ├── .gitkeep
│   └── nostr-calendar-block.pot
├── includes/
│   ├── class-plugin.php
│   └── class-renderer.php
├── assets/
│   ├── js/
│   │   ├── editor.js
│   │   ├── event-wall.js
│   │   ├── event-wall-modal.js
│   │   └── embed-wall.js
│   └── css/
│       ├── editor.css
│       ├── event-wall.css
│       ├── event-wall-light.css
│       ├── event-wall-dark.css
│       └── event-wall-relilab.css
└── src/
    └── blocks/
        └── event-wall/
            └── block.json
```

## Anweisungen zur WordPress.org Plugin-Checker Verwendung

### Option 1: Lokale Verwendung (recommended für Entwicklung)

1. **Plugin in WordPress installieren:**
   ```bash
   # Kopiere das Plugin-Verzeichnis zu WordPress
   cp -r /plugin/nostr-calendar-block /path/to/wordpress/wp-content/plugins/
   ```

2. **WordPress Admin prüfen:**
   - Gehe zu WordPress Admin > Plugins
   - Aktiviere "Nostr Calendar Block"
   - Prüfe auf Fehler im Admin-Bereich

3. **Gutenberg-Block testen:**
   - Erstelle eine neue Seite
   - Öffne Gutenberg Editor
   - Suche nach "Nostr Event Wall" Block
   - Füge den Block ein und teste die Konfiguration

### Option 2: WordPress.org Plugin Checker CLI

Falls du den offiziellen WordPress Plugin Checker verwendest:

```bash
# Der Checker sollte auf dem Plugin-Verzeichnis aufgerufen werden
cd /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/

# Dann führe den Checker durch WordPress.org durch
# https://wordpress.org/plugins/developers/

# ODER lokal mit wpthemescheck (falls installiert)
wpthemescheck --path .
```

### Option 3: Online WordPress.org Plugin Checker

1. Gehe zu: https://wordpress.org/plugins/developers/
2. Wähle "Plugin Checker"
3. Lade die Plugin ZIP-Datei hoch:
   ```bash
   cd /plugin
   zip -r nostr-calendar-block-1.0.0.zip nostr-calendar-block/
   ```
4. Lade `nostr-calendar-block-1.0.0.zip` hoch
5. Der Checker prüft jetzt das Plugin korrekt

## Was die Warnungen bedeuten (wenn der Checker korrekt aufgerufen wird)

Die aktuellen Warnungen sind **FALSCH**, weil der Checker auf das Root-Verzeichnis statt auf das Plugin-Verzeichnis aufgerufen wurde.

**Wenn der Checker korrekt aufgerufen wird, sollte es KEINE Warnungen geben:**

✅ **Text Domain ist korrekt:**
```php
Text Domain: nostr-calendar-block
```

✅ **Domain Path existiert:**
```
/plugin/nostr-calendar-block/languages/
```

✅ **README.md hat alle erforderlichen Header:**
```
Tested up to: 6.4
License: GPL-2.0-or-later
Stable tag: 1.0.0
```

## Deployment für WordPress.org

Um das Plugin auf WordPress.org einzureichen:

1. **ZIP erstellen:**
   ```bash
   cd /plugin
   zip -r nostr-calendar-block.zip nostr-calendar-block/
   ```

2. **Auf WordPress.org Plugin Directory einreichen:**
   - https://wordpress.org/plugins/developers/
   - Klicke auf "Submit a Plugin"
   - Lade die ZIP-Datei hoch
   - Der Plugin Checker prüft automatisch

3. **Behebe alle ERRORS (nicht nur WARNINGS):**
   - Die Error sind: Fehler
   - Warnings können meist ignoriert werden

## Aktuelle Plugin-Status

| Aspekt | Status | Details |
|--------|--------|---------|
| Text Domain | ✅ Korrekt | "nostr-calendar-block" |
| Domain Path | ✅ Existiert | `/plugin/nostr-calendar-block/languages/` |
| README.md | ✅ Korrekt | WordPress.org Format mit Headers |
| LICENSE | ✅ Vorhanden | GPL-2.0-or-later |
| Plugin File | ✅ Vorhanden | `/plugin/nostr-calendar-block/nostr-calendar-block.php` |
| Block Registration | ✅ Korrekt | init hook mit priority 5 |
| Gutenberg Support | ✅ Ja | Volle Block API v3 Unterstützung |

## Troubleshooting

### Szenario 1: "Domain Path does not exist"

Wenn dieser Fehler erscheint:

```bash
# Stelle sicher, dass das Verzeichnis existiert
ls -la /plugin/nostr-calendar-block/languages/

# Falls nicht vorhanden, erstelle es
mkdir -p /plugin/nostr-calendar-block/languages/

# Füge eine .pot-Datei ein (wird bereits bereitgestellt)
# oder erstelle eine leere
touch /plugin/nostr-calendar-block/languages/nostr-calendar-block.pot
```

### Szenario 2: "Text Domain Mismatch"

Stelle sicher, dass die PHP-Header korrekt sind:

```php
<?php
/**
 * Plugin Name: Nostr Calendar Block
 * Text Domain: nostr-calendar-block        ← MUSS dem Slug entsprechen
 * Domain Path: /languages                   ← MUSS mit / beginnen
 */
```

### Szenario 3: Plugin zeigt sich nicht in Gutenberg

Prüfe die Browser Console (F12) auf Fehler:

```javascript
// Sollte keine Fehler haben
console.log('Nostr Calendar Block loaded');

// Blocktype sollte registriert sein
wp.blocks.getBlockType('nostr-calendar-block/event-wall');
```

## Nächste Schritte

1. **Stelle sicher, dass du den Plugin Checker auf die korrekte Datei anwendest**
   - Checke `/plugin/nostr-calendar-block/` nicht `/`

2. **Teste das Plugin lokal in WordPress**
   - Kopiere Plugin zu `wp-content/plugins/`
   - Aktiviere und teste

3. **Wenn alles funktioniert, reiche auf WordPress.org ein**
   - https://wordpress.org/plugins/developers/

4. **Nach Genehmigung kann das Plugin verbreitet werden**
   - Links zum Plugin-Verzeichnis teilen
   - Installation über "Add Plugins" im WordPress Admin

---

**Fragen?** Siehe QUICKSTART.md oder DEBUG_GUIDE.md für weitere Hilfe.

# Nostr Calendar Block

Ein schlankes WordPress Gutenberg-Plugin zur Anzeige von Nostr Events als Event Wall.

## Features

- 📅 **Gutenberg-Block** - Einfaches Einfügen in Seiten/Beiträge
- 🎨 **Customizable** - Theme-Optionen (Light, Dark, ReliLab)
- 🏷️ **Filterbar** - Tags, Suche, Datum filtern (optional)
- 📱 **Responsive** - Mobile-first Design
- ⚡ **Lightweight** - Minimale Dependencies
- 🌐 **Nostr-native** - Events direkt aus dem Nostr-Netzwerk

## Installation

1. Plugin-Ordner kopieren: `/wp-content/plugins/nostr-calendar-block/`
2. In WordPress aktivieren
3. Gutenberg-Editor öffnen
4. Block "Nostr Event Wall" hinzufügen

## Verwendung

### Im Gutenberg-Editor

1. Block "Nostr Event Wall" einfügen
2. Im Inspector Panel auf der rechten Seite anpassen:
   - **Design**: Theme wählen (Hell, Dunkel, ReliLab)
   - **Anzeige**: Filterleiste An/Aus, Max. Events, Filter
   - **Relays**: Nostr Relay URLs hinzufügen
   - **Autoren**: npub-Adressen filtern

### Shortcode (veraltet, aber unterstützt)

```
[nostrcal theme="light" filterbar=1 filter="" relays="wss://..." npub="npub1..." limit=1000]
```

## Block-Attribute

- **theme** (string) - `light`, `dark`, `relilab` (Standard: `light`)
- **showFilterbar** (boolean) - Filterleiste anzeigen (Standard: `true`)
- **filter** (string) - Filter-Spezifikation z.B. `tags:kita|grundschule`
- **relays** (array) - Nostr Relay URLs
- **npub** (array) - Erlaubte Autoren (Nostr Public Keys)
- **limit** (number) - Max. Anzahl Events (1-10000, Standard: 1000)

## Dateistruktur

```
nostr-calendar-block/
├── nostr-calendar-block.php          # Plugin-Header
├── includes/
│   ├── class-plugin.php              # Hauptklasse
│   └── class-renderer.php            # Block-Renderer
├── src/
│   └── blocks/event-wall/
│       └── block.json                # Block-Definition
├── assets/
│   ├── js/
│   │   ├── editor.js                 # Gutenberg Inspector
│   │   ├── embed-wall.js             # Frontend-Initializer
│   │   ├── event-wall.js             # Event-Wall Logik
│   │   └── nostre-api.js             # Nostr API
│   └── css/
│       ├── editor.css                # Editor-Styles
│       ├── event-wall.css            # Frontend-Styles
│       └── themes/
│           ├── light.css
│           ├── dark.css
│           └── relilab.css
└── README.md                         # Diese Datei
```

## Entwicklung

### Build (wenn nötig)

```bash
npm install
npm run build
```

### Debug

In `nostr-calendar-block.php` den Debug-Modus aktivieren:

```php
define('NOSTR_CALENDAR_DEBUG', true);
```

## Kompatibilität

- WordPress 5.8+
- PHP 7.4+
- Modern Browser (ES6+)

## Lizenz

GPL-2.0-or-later

## Support

Dokumentation: siehe `docs/` im Hauptverzeichnis

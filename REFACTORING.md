# Refactoring Zusammenfassung: Nostr Calendar → WordPress Gutenberg Plugin

## 📋 Was wurde gemacht

### 1. Branch erstellt ✅
- Neuer Branch: `feature/gutenberg-plugin`
- Basis: `main`

### 2. Plugin-Struktur (Keep it Simple!) ✅

Neuer Ordner: `/plugin/nostr-calendar-block/`

```
nostr-calendar-block/
├── nostr-calendar-block.php          # Plugin-Entry Point
├── includes/
│   ├── class-plugin.php              # Hauptklasse mit Hooks
│   └── class-renderer.php            # Block-Rendering
├── src/blocks/event-wall/
│   └── block.json                    # Block-Definition (Gutenberg)
├── assets/
│   ├── js/
│   │   ├── editor.js                 # Gutenberg Inspector Controls
│   │   ├── embed-wall.js             # Frontend-Initializer
│   │   ├── event-wall.js             # Core Logic
│   │   └── nostre-api.js             # Nostr API
│   └── css/
│       ├── editor.css                # Editor Preview
│       ├── event-wall.css            # Frontend Styles
│       └── themes/
│           ├── light.css
│           ├── dark.css
│           └── relilab.css
├── package.json                      # Dev Dependencies
├── .gitignore
└── README.md
```

### 3. Gutenberg-Block Features ✅

#### Block-Attribute (customizable):
- **theme** - Light/Dark/ReliLab Theme
- **showFilterbar** - Toggle für Filterleiste
- **filter** - Filter-Spezifikation
- **relays** - Array von Relay URLs
- **npub** - Array von Autoren (Public Keys)
- **limit** - Max. Events (1-10000)

#### Inspector Controls (Editor):
- Design-Panel (Theme-Wahl)
- Anzeige-Panel (Filterbar, Limit, Filter-String)
- Relays-Panel (hinzufügen/entfernen)
- Autoren-Panel (npub-Verwaltung)

#### Frontend-Rendering:
- PHP `render_callback` generiert `<div class="nostr-event-wall">`
- JavaScript initialisiert Event-Wall mit Attributen
- Automatisches Theme-Loading
- Fallback-Logik für alte Shortcodes

### 4. Technologie-Stack

**Frontend (JavaScript)**
- Vanilla JS (keine React/Vue Abhängigkeit)
- Gutenberg Blocks API
- WordPress Components (SelectControl, ToggleControl, etc.)
- i18n (Internationalisierung)

**Backend (PHP)**
- WordPress Plugin Standard
- Singleton Pattern
- Block Registration mit `register_block_type()`
- Asset Enqueuing

**Styles**
- CSS-Variablen für Theming
- Mobile-first Responsive Design
- Dark Mode Support
- Theme-spezifische Overrides

### 5. Verwendung im WordPress Editor

1. **Block hinzufügen**: Gutenberg → "Nostr Event Wall" Block
2. **Konfigurieren**: Inspector Panel (rechts) nutzen
   - Theme: Light / Dark / ReliLab
   - Filterleiste: An/Aus
   - Max Events: 1-10000
   - Relays & Autoren: Hinzufügen/Entfernen
3. **Speichern**: Block wird mit Attributen gespeichert
4. **Frontend**: Automatische Initialisierung

### 6. Nächste Schritte (für Sie)

1. **Plugin ins Repository pushen**:
   ```bash
   git add plugin/nostr-calendar-block/
   git commit -m "feat: Gutenberg Block Plugin mit customizable Options"
   git push origin feature/gutenberg-plugin
   ```

2. **Bei Bedarf: Alte Dateien aufräumen**
   - `embed-wall.js` (veraltet, aber im Plugin erhalten)
   - `nostrfeed_calender.php` (veraltet, durch Plugin ersetzt)
   - HTML-Seiten (`index.html`, `calendar-view.html`)

3. **Installation & Test**:
   ```bash
   cd wp-content/plugins/
   ln -s /path/to/nostr-calendar-block .
   # Oder: Ordner copieren
   ```

4. **Build (optional)**:
   ```bash
   cd plugin/nostr-calendar-block/
   npm install
   npm run build  # Falls weitere Optimierung nötig
   ```

## 🎯 Vorteile dieser Lösung

✅ **Keep It Simple**
- Single Purpose: Nur WordPress-Plugin
- Keine doppelte Code-Basis
- Minimale Dependencies

✅ **Gutenberg-Native**
- Block Inspector für einfache Konfiguration
- Drag-and-Drop im Editor
- Built-in WordPress API

✅ **Customizable**
- Alle wichtigen Optionen im Inspector
- Theme-System
- Filter & Autoren-Management

✅ **Wartbar**
- Klare Struktur
- Separation of Concerns (Plugin/Renderer/Assets)
- Eingebaute Fehlerbehandlung

✅ **Performance**
- Keine Frameworks
- CSS-Variablen statt dynamische Styles
- Lazy Loading möglich

## 📝 Dateien im Detail

### `nostr-calendar-block.php`
Klassische Plugin-Header + einfache Initialisierung

### `includes/class-plugin.php`
- `register_block()` - Block bei Gutenberg anmelden
- `enqueue_frontend_assets()` - Styles/Scripts laden
- `enqueue_editor_assets()` - Editor-UI laden
- `render_block()` - Frontend-Markup generieren

### `includes/class-renderer.php`
- `render($attributes, $content)` - Konvertiert Gutenberg-Attribute zu HTML
- Sanitizing & Escaping
- Daten-Attribute für JavaScript

### `assets/js/editor.js`
- Gutenberg Block UI
- Inspector Panels
- Attribut-Handler (addRelay, removeNpub, etc.)
- Preview im Editor

### `assets/css/event-wall.css`
- Responsive Grid
- Theme-Support (CSS-Variablen)
- Tiles, Filter, Modal
- Accessibility Features

## 🔄 Workflow im Team

1. **Development**: Features im Branch entwickeln
2. **Testen**: Im lokalen WordPress testen
3. **Review**: Gutenberg-Block in Aktion zeigen
4. **Merge**: In `main` mergen wenn OK

## ⚠️ Bekannte Limitierungen (vorerst)

- Relays/NPub müssen im Editor manuell eingetragen werden (nicht automatisch erkannt)
- Keine Admin-Settings-Seite (könnte später hinzugefügt werden)
- Keine Multisite-Konfiguration (einfach zu ergänzen)

## 🚀 Geplante Erweiterungen

- [ ] Admin Settings-Seite (globale Defaults)
- [ ] Export/Import von Block-Konfigurationen
- [ ] Theme-Customizer-Integration
- [ ] Event Caching
- [ ] Multisite-Support

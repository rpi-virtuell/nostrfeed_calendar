# 🏗️ Nostr Calendar Block - Architektur

## System-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                      WordPress Core                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Gutenberg Block System                       │    │
│  │  ┌────────────────────────────────────────────────┐   │    │
│  │  │  nostr-calendar/event-wall Block              │   │    │
│  │  │                                                │   │    │
│  │  │  Attributes:                                  │   │    │
│  │  │  • theme (light/dark/relilab)                │   │    │
│  │  │  • showFilterbar (boolean)                   │   │    │
│  │  │  • filter (string)                           │   │    │
│  │  │  • relays (array)                            │   │    │
│  │  │  • npub (array)                              │   │    │
│  │  │  • limit (number)                            │   │    │
│  │  └────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────────┐
│         Plugin: nostr-calendar-block (PHP)                      │
│                                                                 │
│  nostr-calendar-block.php (Entry Point)                         │
│         ↓                                                        │
│  includes/class-plugin.php                                      │
│  • register_block() → register_block_type()                    │
│  • enqueue_frontend_assets() → CSS/JS laden                    │
│  • render_block() → Class Renderer aufrufen                    │
│         ↓                                                        │
│  includes/class-renderer.php                                    │
│  • render() → Sanitizen & HTML generieren                      │
│    (data-* Attribute setzen)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          ↓ (HTML-Output)
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: HTML + JavaScript                                    │
│                                                                 │
│  <div class="nostr-event-wall" data-theme="light" ...>          │
│                                                                 │
│  assets/js/embed-wall.js (Initializer)                          │
│  • Findet .nostr-event-wall Container                          │
│  • Parst data-* Attribute                                      │
│  • Erstellt Wall-Markup mit Filterbar & Modal                  │
│  • Lädt CSS & Nostr API                                        │
│         ↓                                                        │
│  assets/js/nostre-api.js (Nostr Protocol)                       │
│  • Verbindung zu Relays                                        │
│  • Event-Abfrage (kind:31923)                                  │
│  • Autor-Filter (npub)                                         │
│  • Response-Verarbeitung                                       │
│         ↓                                                        │
│  assets/js/event-wall.js (Core Logic)                           │
│  • DOM-Rendering (Tiles, Grid)                                 │
│  • Filter-System (Tags, Search, Datum)                         │
│  • Modal-Management                                            │
│  • Event-Delegation & Interaktivität                           │
│         ↓                                                        │
│  assets/css/event-wall.css (Styling)                            │
│  • CSS-Variablen (--color-primary, etc.)                       │
│  • Grid-Layout                                                 │
│  • Theme-Support (data-theme Attribute)                        │
│  • Responsive Design                                           │
│         ↓                                                        │
│  assets/css/themes/*.css (Theme-Override)                       │
│  • light.css   (Default)                                       │
│  • dark.css    (Dunkel)                                        │
│  • relilab.css (ReliLab)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          ↓ (Data Flow)
┌─────────────────────────────────────────────────────────────────┐
│  Externe Quellen                                                │
│                                                                 │
│  Nostr Relays (WebSocket)                                       │
│  • wss://relilab.nostr1.com                                    │
│  • wss://relay-rpi.edufeed.org                                 │
│  • ... (user-konfigurierbar)                                   │
│                                                                 │
│  → Liefern Event-Daten (kind:31923)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Komponenten-Diagramm

```
┌────────────────────────┐
│   Block-Definition     │
│    (block.json)        │
└───────────┬────────────┘
            │
    ┌───────┴────────┬────────────┬────────────┐
    │                │            │            │
┌───v────┐   ┌───────v──┐  ┌──────v──┐  ┌────v────┐
│ Editor │   │Renderer  │  │Attributes│ │Supports │
│  UI    │   │ (PHP)    │  │          │ │         │
└────────┘   └──────────┘  └──────────┘ └─────────┘
            │
    ┌───────┴──────────┬────────────┐
    │                  │            │
┌───v────────┐  ┌──────v──┐  ┌──────v─────┐
│Inspector   │  │Preview  │  │HTML Output │
│ Controls   │  │ in Edit │  │ on Frontend│
│(inspector) │  │         │  │            │
└────────────┘  └─────────┘  └────────────┘
```

---

## 🔄 Datenflusss beim Rendering

### 1. Editor-Phase (Gutenberg)
```
User wählt Block-Attribute im Inspector
            ↓
React-State Update
            ↓
Block speichert Attributes in Post
            ↓
block.json definiert Attribute-Schema
```

### 2. Server-Phase (PHP)
```
WordPress lädt Post
            ↓
Plugin erkannt Block-Typ
            ↓
render_callback wird aufgerufen
            ↓
Renderer::render() mit Attributes
            ↓
Sanitizing & Escaping
            ↓
HTML mit data-* Attribute generiert
            ↓
HTML in Seite eingefügt
```

### 3. Frontend-Phase (JavaScript)
```
Seite geladen
            ↓
DOMContentLoaded Event
            ↓
embed-wall.js sucht .nostr-event-wall
            ↓
data-* Attribute auslesen
            ↓
Wall-Markup injizieren (Filterbar, Modal)
            ↓
nostre-api.js laden
            ↓
event-wall.js laden
            ↓
WebSocket zu Relays
            ↓
Events abfragen
            ↓
Tiles rendern
```

---

## 🧩 Modulare Struktur

```
nostr-calendar-block/
│
├── 📄 nostr-calendar-block.php
│   └─ Plugin Header + Initialisierung
│      └─ Singleton Pattern (Plugin class)
│
├── 📁 includes/
│   ├─ class-plugin.php
│   │  ├─ register_block()
│   │  ├─ enqueue_frontend_assets()
│   │  ├─ enqueue_editor_assets()
│   │  └─ render_block()
│   │
│   └─ class-renderer.php
│      └─ render($attributes, $content)
│         ├─ Attribute verarbeiten
│         ├─ Sanitizing
│         └─ HTML-Ausgabe
│
├── 📁 src/blocks/event-wall/
│   └─ block.json
│      ├─ name, title, description
│      ├─ Attribute-Schema
│      └─ Asset-Pfade
│
├── 📁 assets/
│   │
│   ├─ js/
│   │  ├─ editor.js (Gutenberg UI)
│   │  ├─ embed-wall.js (Frontend-Initializer)
│   │  ├─ event-wall.js (Core Logic)
│   │  └─ nostre-api.js (Nostr Protocol)
│   │
│   └─ css/
│      ├─ editor.css (Inspector Preview)
│      ├─ event-wall.css (Main Styles)
│      └─ themes/
│         ├─ light.css
│         ├─ dark.css
│         └─ relilab.css
│
└── 📁 docs/
   ├─ README.md (Plugin-Doku)
   ├─ QUICKSTART.md (30-Sekunden Setup)
   ├─ USAGE.md (Ausführliche Nutzung)
   └─ (dieses Diagramm)
```

---

## 🔌 Abhängigkeiten

### Frontend
```
Keine externe Abhängigkeit!
├─ Vanilla JavaScript
├─ WordPress Block API
├─ WordPress Components (UI)
├─ WordPress i18n (Übersetzungen)
└─ CSS-Variablen (für Theming)
```

### Backend (PHP)
```
WordPress Core
├─ register_block_type()
├─ wp_enqueue_script()
├─ wp_enqueue_style()
├─ shortcode_atts()
└─ sanitizing functions
```

### Externe APIs
```
Nostr Relays (WebSocket)
├─ Standard: wss://relilab.nostr1.com
├─ Alternative: wss://relay.damus.io
└─ Benutzerdefiniert: any WSS relay
```

---

## 🎯 Erweiterungspunkte

```
1. Admin Settings-Seite
   - Globale Defaults setzen
   - Relay-Whitelist
   - Theme-Customization

2. Caching-Layer
   - Events in Transients speichern
   - Cache-Invalidation on update

3. Custom Post Types
   - Nostr Events als CPT importieren
   - Lokal speichern & indexieren

4. Multisite-Support
   - Pro-Site Konfiguration
   - Verschiedene Relays pro Site

5. Advanced Filtering
   - Datums-Range Filter
   - Kategorie-Tree
   - Full-Text Search

6. Export/Import
   - Block-Konfiguration exportieren
   - Zwischen Sites migrieren
```

---

## 📈 Performance-Optimierungen

```
✅ Implementiert:
- CSS-Variablen (keine Runtime-Berechnung)
- Event Delegation (weniger Listener)
- Lazy Loading (Intersection Observer ready)
- Responsive Grid (mobile-first)

🔜 Möglich:
- Transient Caching (DB)
- Service Worker (offline)
- Image Optimization (lazy load)
- Code Splitting (async chunks)
- Redis Caching (distributed)
```

---

## 🔐 Sicherheit

```
✅ Implementiert:
- Attribute Escaping (esc_attr)
- Data Sanitizing (sanitize_text_field)
- Array Filtering (array_filter)
- HTML Escaping (wp_kses)

🔜 Prüfen:
- NONCE Validation (AJAX)
- Capability Checks (Admin)
- XSS Prevention (JavaScript)
- SQL Injection (N/A - keine DB Queries)
```

---

Dieses Diagramm visualisiert die **modular aufgebaute, wartbare Struktur** des Plugins! 🎯

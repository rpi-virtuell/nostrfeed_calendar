# Nostr Feed Calendar - Repository Guide

## 📁 Repository-Struktur

Dieses Repository ist eine **Refactoring-Migration** von einer Sammlung von Dateien zu einem produktiven WordPress-Plugin.

```
nostrfeed_calendar/
│
├── 📦 plugin/
│   └── nostr-calendar-block/          ← 🎯 MAIN: WordPress Plugin
│       ├── nostr-calendar-block.php
│       ├── README.md (WordPress.org Format)
│       ├── includes/
│       ├── assets/
│       ├── languages/
│       ├── src/
│       └── ...dokumentation...
│
├── 🗂️ Veraltete/Legacy-Dateien
│   ├── index.html
│   ├── calendar-view.html
│   ├── event-wall.js
│   ├── embed-wall.js
│   ├── nostre-api.js
│   └── ...
│
└── 📚 Dokumentation
    ├── PLUGIN_CHECKER_SETUP.md       ← Du bist hier
    ├── README.md
    ├── QUICKSTART.md
    ├── Agents.md
    └── ...weitere Guides...
```

## 🎯 Was du verwenden solltest

### ✅ Für WordPress-Integration
- **Use**: `/plugin/nostr-calendar-block/`
- **Datei**: `nostr-calendar-block.php` (Main Plugin File)
- **README**: `/plugin/nostr-calendar-block/README.md` (WordPress.org Format)

### ⚠️ Legacy (Veraltet)
- **Do NOT Use**: Die HTML/JS-Dateien im Root
- Diese sind für Standalone-Deployment
- Der WordPress-Block ist die **bevorzugte Lösung**

## 🚀 Schnellstart

### 1. Plugin lokal testen

```bash
# Kopiere das Plugin zu deinem WordPress
cp -r plugin/nostr-calendar-block /path/to/wordpress/wp-content/plugins/

# Aktiviere das Plugin im WordPress Admin
# oder über CLI:
wp plugin activate nostr-calendar-block
```

### 2. Block in Gutenberg verwenden

- Öffne einen Beitrag/Seite
- Klicke auf "+" um einen Block hinzuzufügen
- Suche nach "Nostr Event Wall"
- Konfiguriere die Block-Einstellungen (Inspector Panel)

### 3. WordPress.org Plugin Checker

**WICHTIG**: Der Checker muss auf das Plugin-Verzeichnis angewendet werden:

```bash
# ✅ RICHTIG
cd plugin/nostr-calendar-block/
# Dann führe Plugin Checker durch WordPress.org aus

# ❌ FALSCH
cd .
# Nicht den Root-Ordner prüfen!
```

Siehe `PLUGIN_CHECKER_SETUP.md` für detaillierte Anweisungen.

## 📊 Git Branch

- **Branch**: `feature/gutenberg-plugin`
- **Base**: `main`
- **Status**: Feature complete, ready for testing

Aktuelle Commits:
```
f0fbe6f - docs: Umfassende Zusammenfassung & Dokumentation
9a1b451 - fix: Event-Lade-Problem mit Custom Relays
a66c4b6 - fix: WordPress.org Plugin Checker Probleme
550aa3d - fix: Block-Registrierungs-Probleme beheben
...
```

## 📚 Dokumentation

| Datei | Zweck |
|-------|-------|
| `PLUGIN_CHECKER_SETUP.md` | 🔧 WordPress.org Plugin Checker Setup |
| `plugin/nostr-calendar-block/QUICKSTART.md` | 🚀 Schnellstart-Anleitung |
| `plugin/nostr-calendar-block/USAGE.md` | 📖 Benutzer-Dokumentation |
| `plugin/nostr-calendar-block/ARCHITECTURE.md` | 🏗️ Technische Architektur |
| `plugin/nostr-calendar-block/DEBUG_GUIDE.md` | 🐛 Debugging-Anleitung |
| `Agents.md` | 🎨 Design-System & API-Spezifikationen |

## ❓ Häufige Fragen

### F: Wo ist das WordPress-Plugin?
**A**: Im Verzeichnis `plugin/nostr-calendar-block/`

### F: Kann ich die alte HTML-Datei (index.html) noch verwenden?
**A**: Ja, sie funktioniert noch als Standalone-Version. Die WordPress-Block-Version wird bevorzugt.

### F: Wie wird das Plugin im WordPress-Admin angezeigt?
**A**: Unter "Plugins" als "Nostr Calendar Block" v1.0.0

### F: Kann ich den Plugin Checker auf das Root-Verzeichnis anwenden?
**A**: Nein! Verwende `/plugin/nostr-calendar-block/` stattdessen. Siehe `PLUGIN_CHECKER_SETUP.md`.

### F: Wie reiche ich das Plugin auf WordPress.org ein?
**A**: Siehe `plugin/nostr-calendar-block/README.md` (Deployment-Sektion)

## 🔍 Plugin Checker Fehler?

Falls du Fehler vom WordPress.org Plugin Checker erhältst:

1. **Stelle sicher**, dass du den Checker auf `/plugin/nostr-calendar-block/` anwendest
2. **Nicht** auf das Root-Verzeichnis (`/`)
3. Siehe `PLUGIN_CHECKER_SETUP.md` für detaillierte Schritte

## 📝 Mitwirkende

- rpi-virtuell
- Community Contributors

## 📜 Lizenz

GPL-2.0-or-later

---

**Bereit?** Starten Sie mit `plugin/nostr-calendar-block/QUICKSTART.md` 🚀

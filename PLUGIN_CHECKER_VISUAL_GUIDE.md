# WordPress.org Plugin Checker - Fehler Visual Guide

## 🎯 Das Problem visualisiert

### ❌ FALSCH: Checker auf Root-Verzeichnis anwenden

```
/Users/joerglohrer/repositories/nostrfeed_calendar/  ← Checker hier ausgeführt
│
├── Agents.md
├── README.md  ← ❌ FALSCH: Altes README (nicht WordPress.org Format)
├── index.html  ← Legacy Datei
├── event-wall.js  ← Legacy Datei
├── ...
└── plugin/
    └── nostr-calendar-block/  ← Echtes Plugin ist HIER
        ├── nostr-calendar-block.php
        ├── README.md  ← ✓ RICHTIG: WordPress.org Format
        └── languages/

ERGEBNIS: ❌ FEHLER!
- nostr-calendar-block.php nicht im Root gefunden
- README.md hat falsches Format
- Domain Path Verzeichnis nicht erkannt
- Text Domain kann nicht validiert werden
```

### ✅ RICHTIG: Checker auf Plugin-Verzeichnis anwenden

```
/Users/joerglohrer/repositories/nostrfeed_calendar/plugin/
└── nostr-calendar-block/  ← Checker hier ausgeführt ✓
    ├── nostr-calendar-block.php  ✓
    │   ├── Text Domain: nostr-calendar-block  ✓
    │   ├── Domain Path: /languages  ✓
    │   ├── Tested up to: 6.4  ✓
    │   ├── License: GPL-2.0-or-later  ✓
    │   └── Stable tag: 1.0.0  ✓
    │
    ├── README.md  ✓ (WordPress.org Format)
    │   ├── === Nostr Calendar Block ===
    │   ├── Tested up to: 6.4
    │   ├── License: GPL-2.0-or-later
    │   ├── Stable tag: 1.0.0
    │   └── License URI: https://...
    │
    └── languages/  ✓ (Verzeichnis existiert)
        ├── .gitkeep
        └── nostr-calendar-block.pot

ERGEBNIS: ✅ ERFOLGREICH!
- Alle Dateien gefunden
- Alle Header korrekt
- Domain Path Verzeichnis erkannt
- Text Domain validiert
```

## 📊 Fehler-Matrix

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| `textdomain_mismatch` | Checker prüft falsche Datei | Prüfe Plugin-Verzeichnis nicht Root |
| `plugin_header_nonexistent_domain_path` | languages/ Verzeichnis nicht im Suchpfad | Stelle sicher du bist im Plugin-Verzeichnis |
| `missing_readme_header_tested` | README.md hat falsches Format | Prüfe `/plugin/nostr-calendar-block/README.md` |
| `no_license` | License Header fehlt | Prüfe README.md Header |
| `no_stable_tag` | Stable tag Header fehlt | Prüfe README.md Header |

## 🔍 So erkennst du das Problem

### Schritt 1: Aktuellen Pfad prüfen

```bash
# Terminal anzeigen
pwd

# Falls du hier bist:
# /Users/joerglohrer/repositories/nostrfeed_calendar
# ❌ Du bist im falschen Verzeichnis

# Du solltest hier sein:
# /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block
# ✓ Das ist richtig!
```

### Schritt 2: Dateien im aktuellen Verzeichnis prüfen

```bash
# Sollte zeigen:
ls -la

# Falls du siehst:
# Agents.md
# REFACTORING.md
# plugin/
# ❌ Du bist im Root-Verzeichnis

# Falls du siehst:
# nostr-calendar-block.php
# README.md
# languages/
# includes/
# ✓ Du bist im richtigen Verzeichnis!
```

## 📋 Checkliste: Wo bin ich?

Führe diese Befehle aus um zu überprüfen:

```bash
# 1. Welcher Ordner bin ich?
echo "Current: $(pwd)"

# 2. Gibt es nostr-calendar-block.php hier?
ls -la nostr-calendar-block.php 2>/dev/null && echo "✓ Plugin-Datei gefunden" || echo "❌ Nicht im Plugin-Verzeichnis"

# 3. Gibt es ein plugin/ Verzeichnis?
ls -d plugin 2>/dev/null && echo "❌ Du bist im Root-Verzeichnis" || echo "✓ Du bist im Plugin-Verzeichnis"

# 4. Gibt es Agents.md hier?
ls -l Agents.md 2>/dev/null && echo "❌ Du bist im Root-Verzeichnis" || echo "✓ Du bist im Plugin-Verzeichnis"

# 5. Gibt es languages/ Verzeichnis?
ls -d languages 2>/dev/null && echo "✓ Du bist im Plugin-Verzeichnis" || echo "❌ Nicht im Plugin-Verzeichnis"
```

## 🚀 Korrekte Schritte

### Option 1: Mit Kommandozeile

```bash
# 1. Navigiere zum Plugin-Verzeichnis
cd /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block

# 2. Überprüfe, dass du im richtigen Ort bist
pwd
# Output sollte sein:
# /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block

# 3. Überprüfe Dateien
ls -la | grep -E "nostr-calendar-block.php|README.md|languages"

# 4. Erstelle ZIP (vom plugin/-Verzeichnis)
cd ..
zip -r nostr-calendar-block.zip nostr-calendar-block/

# 5. Laden Sie ZIP zu WordPress.org hoch
# https://wordpress.org/plugins/developers/
```

### Option 2: Mit VS Code

```
1. Öffne VS Code
2. File > Open Folder
3. Wähle: /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block
4. ✓ Jetzt siehst du alle Plugin-Dateien
5. Du kannst die Dateien im Explorer bearbeiten
```

### Option 3: Mit Automatisiertes Script

```bash
# Nutze das bereitgestellte Setup-Script
bash /Users/joerglohrer/repositories/nostrfeed_calendar/setup-plugin.sh

# Das Script führt dich durch alle Schritte
```

## 🎓 Was lernen wir?

### Wichtig zu wissen:

1. **Plugin-Struktur**: WordPress Plugins sind selbstständige Verzeichnisse
2. **Checker-Pfad**: Der Checker muss auf das Plugin-Verzeichnis zeigen, nicht auf den Parent-Ordner
3. **Datei-Positionen**: 
   - Plugin-Datei: `plugin/nostr-calendar-block/nostr-calendar-block.php`
   - README: `plugin/nostr-calendar-block/README.md`
   - Languages: `plugin/nostr-calendar-block/languages/`

4. **Häufige Fehler**:
   - Checker auf Root anwenden (❌)
   - Checker auf falsches Verzeichnis zeigen (❌)
   - README.md Format nicht beachten (❌)

## 📱 Quick Reference

### Richtige Pfade

```
✓ Für WordPress Installation:
  /path/to/wordpress/wp-content/plugins/nostr-calendar-block/

✓ Für Plugin Checker (online):
  Lade ZIP von diesem Verzeichnis:
  /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/

✓ Für Plugin Checker (lokal):
  cd /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/
  # Jetzt Checker ausführen
```

### Falsche Pfade

```
❌ Nicht von hier:
  /Users/joerglohrer/repositories/nostrfeed_calendar/

❌ Nicht von hier:
  /Users/joerglohrer/repositories/

❌ Nicht von hier:
  /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/
```

## 🔧 Schnelle Fixes

### Fix 1: Zum richtigen Verzeichnis navigieren

```bash
cd /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block
```

### Fix 2: ZIP erstellen (von plugin/)

```bash
cd /Users/joerglohrer/repositories/nostrfeed_calendar/plugin
zip -r nostr-calendar-block.zip nostr-calendar-block/
```

### Fix 3: ZIP zu WordPress.org hochladen

```
1. Gehe zu https://wordpress.org/plugins/developers/
2. Klicke "Plugin Checker"
3. Lade ZIP hoch:
   /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block.zip
4. Warte auf Ergebnisse
```

## ✅ Test: Sind die Fehlermeldungen weg?

Nach Anwendung der richtigen Schritte solltest du sehen:

```
✓ Plugin validation successful!
✓ All headers detected correctly
✓ Domain Path directory verified
✓ Text Domain matches slug
✓ README.md format correct

❌ NO ERRORS

⚠ May show WARNINGS (ignorierbar):
  - Minor issues that won't block submission
  - Recommended improvements
  - Deprecated function notices
```

---

**Fragen?** Siehe:
- `PLUGIN_CHECKER_SETUP.md` - Detaillierte Anleitung
- `PLUGIN_CHECKER_FIX.md` - Diese Datei
- `REPOSITORY_GUIDE.md` - Repository-Struktur

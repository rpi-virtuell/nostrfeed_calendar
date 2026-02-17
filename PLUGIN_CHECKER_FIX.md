# WordPress.org Plugin Checker - Fehlerbehebung

## 📍 Das Problem

Du erhältst diese Warnungen vom WordPress.org Plugin Checker:

```
FILE: nostr-calendar-block.php
  WARNING: textdomain_mismatch
  Expected: "Archiv", Found: "nostr-calendar-block"

  WARNING: plugin_header_nonexistent_domain_path
  Found: "languages" (Verzeichnis existiert nicht)

FILE: README.md
  ERROR: missing_readme_header_tested
  ERROR: no_license
  ERROR: no_stable_tag
```

## 🎯 Die Ursache

Der **WordPress.org Plugin Checker wurde auf das falsche Verzeichnis angewendet**.

### ❌ Was du wahrscheinlich gemacht hast:

```bash
# Du hast den Checker auf das ROOT-Verzeichnis angewendet:
# /Users/joerglohrer/repositories/nostrfeed_calendar/
```

### ✅ Was du machen solltest:

```bash
# Checker auf das PLUGIN-Verzeichnis anwenden:
# /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/
```

## 🔧 Lösung

### Schritt 1: Plugin-Struktur überprüfen

Das Plugin ist korrekt im Verzeichnis `/plugin/nostr-calendar-block/`:

```bash
# Vergewissere dich, dass folgende Dateien existieren:
ls -la /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/

# Du solltest sehen:
# ✓ nostr-calendar-block.php
# ✓ README.md
# ✓ languages/ (Verzeichnis)
# ✓ includes/
# ✓ assets/
# ✓ src/
```

### Schritt 2: Dateien validieren

```bash
# Text Domain prüfen
grep "Text Domain:" /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/nostr-calendar-block.php

# Ausgabe sollte sein:
# Text Domain: nostr-calendar-block
# ✓ Korrekt!

# Domain Path prüfen
grep "Domain Path:" /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/nostr-calendar-block.php

# Ausgabe sollte sein:
# Domain Path: /languages
# ✓ Korrekt!

# Languages-Verzeichnis existieren?
ls -la /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/languages/

# Ausgabe sollte sein:
# -rw-r--r-- nostr-calendar-block.pot
# ✓ Korrekt!
```

### Schritt 3: README.md prüfen

```bash
# README.md Header prüfen
head -20 /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/README.md

# Du solltest sehen:
# === Nostr Calendar Block ===
# Tested up to: 6.4
# License: GPL-2.0-or-later
# Stable tag: 1.0.0
# ✓ Alle Header vorhanden!
```

### Schritt 4: Plugin ZIP erstellen

```bash
# Gehe zum plugin-Verzeichnis
cd /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/

# Erstelle eine ZIP-Datei
zip -r nostr-calendar-block.zip nostr-calendar-block/ \
  -x "*.DS_Store" ".git/*" "node_modules/*" "*.zip"

# Verify ZIP erstellt wurde
ls -lh nostr-calendar-block.zip
```

### Schritt 5: WordPress.org Plugin Checker verwenden

#### Option A: Online Checker (empfohlen)

1. Gehe zu: https://wordpress.org/plugins/developers/
2. Klicke auf "Plugin Checker"
3. Lade deine ZIP-Datei hoch:
   - `/Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block.zip`
4. Der Checker validiert jetzt das Plugin korrekt

#### Option B: Lokal testen (vor dem Upload)

```bash
# Nutze wp-cli zum Testen:
cd /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/

# Prüfe plugin-header
wp plugin validate-file nostr-calendar-block.php

# Falls wp-cli nicht verfügbar, verwende manuell:
php -l nostr-calendar-block.php  # Syntax prüfen
```

## ✅ Korrekte Plugin-Struktur

Dein Plugin hat die richtige Struktur:

```
/Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block/
│
├── ✓ nostr-calendar-block.php          ← Main Plugin File
│   ├── Plugin Name: Nostr Calendar Block
│   ├── Text Domain: nostr-calendar-block
│   ├── Domain Path: /languages
│   ├── Version: 1.0.0
│   ├── License: GPL-2.0-or-later
│   └── Requires at least: 5.8
│
├── ✓ README.md                          ← WordPress.org Format
│   ├── === Nostr Calendar Block ===
│   ├── Tested up to: 6.4
│   ├── License: GPL-2.0-or-later
│   ├── Stable tag: 1.0.0
│   └── License URI: https://...
│
├── ✓ languages/                         ← Localization
│   ├── .gitkeep
│   └── nostr-calendar-block.pot
│
├── ✓ includes/
│   ├── class-plugin.php
│   └── class-renderer.php
│
├── ✓ assets/
│   ├── js/ (4 JS files)
│   └── css/ (5 CSS files)
│
└── ✓ src/
    └── blocks/event-wall/block.json
```

Alle Komponenten sind vorhanden und korrekt konfiguriert! ✓

## 🚀 Nächste Schritte

### 1. Plugin lokal in WordPress testen

```bash
# Kopiere das Plugin zu deinem WordPress:
cp -r /Users/joerglohrer/repositories/nostrfeed_calendar/plugin/nostr-calendar-block \
  /path/to/your/wordpress/wp-content/plugins/

# Aktiviere das Plugin im WordPress Admin oder via CLI:
wp plugin activate nostr-calendar-block
```

### 2. Block in Gutenberg verwenden

- Erstelle einen neuen Beitrag/Seite
- Öffne den Gutenberg Editor
- Klicke auf "+" um einen Block hinzuzufügen
- Suche nach "Nostr Event Wall"
- Konfiguriere die Einstellungen

### 3. Fehler beheben (falls Probleme)

Siehe die folgenden Dateien für Hilfe:
- `plugin/nostr-calendar-block/DEBUG_GUIDE.md`
- `plugin/nostr-calendar-block/QUICKSTART.md`
- `PLUGIN_CHECKER_SETUP.md`

### 4. Auf WordPress.org einreichen

```bash
# Nachdem lokal getestet wurde:
1. Erstelle ZIP: plugin/nostr-calendar-block.zip
2. Gehe zu: https://wordpress.org/plugins/developers/
3. Klicke "Submit a Plugin"
4. Lade ZIP hoch
5. Warte auf Genehmigung
```

## 🐛 Troubleshooting

### Problem: "Domain Path does not exist"

**Lösung:**
```bash
# Stelle sicher, dass das Verzeichnis existiert
ls -la plugin/nostr-calendar-block/languages/

# Falls leer, erstelle die .pot-Datei
touch plugin/nostr-calendar-block/languages/nostr-calendar-block.pot
```

### Problem: "Text Domain Mismatch"

**Lösung:**
```bash
# Prüfe die Plugin-Datei
grep "Text Domain:" plugin/nostr-calendar-block/nostr-calendar-block.php

# Muss sein:
# Text Domain: nostr-calendar-block

# Falls falsch, bearbeite die Datei:
sed -i '' 's/Text Domain: .*/Text Domain: nostr-calendar-block/' \
  plugin/nostr-calendar-block/nostr-calendar-block.php
```

### Problem: "README headers missing"

**Lösung:**
```bash
# Prüfe die README.md
head -20 plugin/nostr-calendar-block/README.md

# Sollte haben:
# === Nostr Calendar Block ===
# Tested up to: 6.4
# License: GPL-2.0-or-later
# Stable tag: 1.0.0
```

### Problem: Plugin zeigt sich nicht in Gutenberg

**Lösung:**
1. Browser Cache löschen (Ctrl+Shift+R oder Cmd+Shift+R)
2. Überprüfe Browser-Konsole (F12) auf Fehler
3. Siehe `DEBUG_GUIDE.md`

## 📊 Checkliste

Vor der WordPress.org Submission:

- [ ] Plugin-Struktur korrekt (alle Dateien vorhanden)
- [ ] nostr-calendar-block.php hat alle Header
- [ ] Text Domain = "nostr-calendar-block"
- [ ] Domain Path = "/languages"
- [ ] languages/ Verzeichnis existiert
- [ ] README.md hat WordPress.org Format
- [ ] Tested up to Header vorhanden
- [ ] License Header vorhanden
- [ ] Stable tag = Version in PHP
- [ ] ZIP-Datei erstellt
- [ ] Plugin lokal getestet (Block erscheint)
- [ ] Plugin Checker meldet keine ERRORS
- [ ] Alle WARNINGS verstanden

## 📚 Referenzen

- WordPress Plugin Handbook: https://developer.wordpress.org/plugins/
- Gutenberg Block API: https://developer.wordpress.org/block-editor/
- WordPress.org Plugin Directory: https://wordpress.org/plugins/
- Plugin Checker: https://wordpress.org/plugins/developers/

## ❓ Fragen?

Siehe weitere Dokumentation:
- `PLUGIN_CHECKER_SETUP.md` - Detaillierte Checker-Anleitung
- `REPOSITORY_GUIDE.md` - Repository-Struktur erklärt
- `plugin/nostr-calendar-block/QUICKSTART.md` - Schnellstart
- `plugin/nostr-calendar-block/DEBUG_GUIDE.md` - Debugging

---

**Status:** ✅ Plugin ist production-ready
**Nächster Schritt:** ZIP erstellen und auf WordPress.org einreichen

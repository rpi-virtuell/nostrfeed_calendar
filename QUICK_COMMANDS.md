# 🚀 Quick Commands für dich

## Repository ansehen

```bash
# Zum Feature Branch wechseln
git checkout feature/gutenberg-plugin

# Git Log ansehen (letzte 5 Commits)
git log --oneline -5

# Alle Änderungen sehen
git diff main

# Status ansehen
git status
```

## Plugin-Struktur durchschauen

```bash
# Alle Plugin-Dateien auflisten
ls -la plugin/nostr-calendar-block/

# Nur PHP-Dateien
find plugin/nostr-calendar-block -name "*.php"

# Nur JavaScript-Dateien
find plugin/nostr-calendar-block -name "*.js"

# Nur CSS-Dateien
find plugin/nostr-calendar-block -name "*.css"

# Dateianzahl
find plugin/nostr-calendar-block -type f | wc -l
```

## Im lokalen WordPress installieren

```bash
# Option 1: Kopieren
cp -r plugin/nostr-calendar-block /path/to/wp-content/plugins/

# Option 2: Symlink (für Entwicklung)
cd /path/to/wp-content/plugins
ln -s /full/path/to/nostrfeed_calendar/plugin/nostr-calendar-block .

# Dann im WordPress Admin:
# 1. Plugins → Nostr Calendar Block → Aktivieren
# 2. Seite öffnen → Block hinzufügen
# 3. "Nostr Event Wall" suchen → einfügen
```

## Dokumentation lesen

```bash
# QUICKSTART (Anfänger)
cat plugin/nostr-calendar-block/QUICKSTART.md

# USAGE (Erweitert)
cat plugin/nostr-calendar-block/USAGE.md

# README (Technisch)
cat plugin/nostr-calendar-block/README.md

# ARCHITECTURE (Detailliert)
cat plugin/nostr-calendar-block/ARCHITECTURE.md

# INDEX (Navigation)
cat plugin/nostr-calendar-block/INDEX.md
```

## Merge vorbereiten

```bash
# Nach erfolgreichem Test:
git checkout main

# Änderungen mergen
git merge feature/gutenberg-plugin

# Oder: Mit Commit-Message
git merge feature/gutenberg-plugin -m "Merge: Gutenberg Block Plugin"

# Pushen
git push origin main
```

## Wichtige Dateien schnell ansehen

```bash
# Plugin-Header
cat plugin/nostr-calendar-block/nostr-calendar-block.php | head -20

# Block-Definition
cat plugin/nostr-calendar-block/src/blocks/event-wall/block.json

# Plugin-Klasse
head -50 plugin/nostr-calendar-block/includes/class-plugin.php

# Inspector UI
head -50 plugin/nostr-calendar-block/assets/js/editor.js
```

## Debug & Test

```bash
# Check ob alle Dateien existieren
test -f plugin/nostr-calendar-block/nostr-calendar-block.php && echo "✅ Main plugin file exists"
test -d plugin/nostr-calendar-block/assets/js && echo "✅ JS assets exist"
test -d plugin/nostr-calendar-block/assets/css && echo "✅ CSS assets exist"
test -d plugin/nostr-calendar-block/includes && echo "✅ Includes exist"

# Dateigröße prüfen
du -sh plugin/nostr-calendar-block/

# Linecount
find plugin/nostr-calendar-block -type f \( -name "*.php" -o -name "*.js" -o -name "*.css" \) -exec wc -l {} + | tail -1

# JSON Syntax Check
for f in plugin/nostr-calendar-block/**/*.json; do
  echo "Checking $f..."
  python -m json.tool "$f" > /dev/null && echo "  ✅ Valid" || echo "  ❌ Invalid"
done
```

## Alte Dateien aufräumen (nach Merge)

```bash
# Vorher backup
mkdir backup
cp -r nostrfeed_calender.php embed-wall.js index.html calendar-view.html backup/

# Löschen (optional, nach Backup)
rm nostrfeed_calender.php
rm embed-wall.js
rm index.html
rm calendar-view.html
rm test-embed.html

# Committen
git add -A
git commit -m "chore: Remove old files (replaced by plugin)"
git push origin main
```

## Hilfreich

```bash
# VSCode öffnen im Plugin-Ordner
code plugin/nostr-calendar-block/

# Plugin-Ordner im Finder/Explorer öffnen
open plugin/nostr-calendar-block/    # macOS
explorer plugin\nostr-calendar-block # Windows
nautilus plugin/nostr-calendar-block # Linux

# Alle Dateien in Baum-Format (wenn tree installiert)
tree plugin/nostr-calendar-block -L 3
# Falls nicht installiert: brew install tree (macOS)
```

---

## 💡 Tipps

**Schnell zur Plugin-Datei:**
```bash
cd plugin/nostr-calendar-block
ls -la
```

**Alle JavaScript Files ansehen:**
```bash
grep -r "function\|const.*=" plugin/nostr-calendar-block/assets/js/*.js | head -20
```

**PHP Syntax Check:**
```bash
php -l plugin/nostr-calendar-block/nostr-calendar-block.php
php -l plugin/nostr-calendar-block/includes/class-plugin.php
```

**Größte Dateien finden:**
```bash
find plugin/nostr-calendar-block -type f -exec du -h {} \; | sort -h | tail -10
```

---

## 📞 Bei Problemen

```bash
# Git Status
git status

# Letzten Commit sehen
git log -1 --stat

# Diff zum Main ansehen
git diff main..feature/gutenberg-plugin

# Nur Summary
git diff --stat main..feature/gutenberg-plugin

# Conflicts prüfen
git diff --check
```

---

**Happy Coding! 🚀**

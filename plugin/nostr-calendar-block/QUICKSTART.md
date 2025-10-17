# Quickstart Guide - Nostr Calendar Block

## 🚀 30 Sekunden Setup

### 1. Plugin aktivieren
```bash
# Kopiere den Plugin-Ordner
cp -r plugin/nostr-calendar-block /path/to/wp-content/plugins/

# Oder: Symlink für Entwicklung
cd /path/to/wp-content/plugins
ln -s /path/to/nostrfeed_calendar/plugin/nostr-calendar-block .
```

### 2. Im WordPress-Admin
1. Gehe zu **Plugins**
2. Finde "Nostr Calendar Block"
3. Klicke **Aktivieren**

### 3. Im Editor
1. Öffne eine Seite/Beitrag
2. Klicke **+** (Block hinzufügen)
3. Suche: "Nostr Event Wall"
4. Block einfügen
5. **Speichern** ✅

---

## 📋 Minimale Konfiguration

Im Inspector (rechts) wählen:

```
Theme:          Light (Standard OK)
Filterleiste:   ✓ An
Max Events:     1000
Relays:         (wird geladen)
```

**Das war's!** Events werden automatisch geladen.

---

## ⚙️ Optionen Übersicht

| Attribut | Typ | Standard | Beschreibung |
|----------|-----|----------|-------------|
| `theme` | string | `light` | light, dark, relilab |
| `showFilterbar` | boolean | `true` | Filterleiste anzeigen |
| `filter` | string | `` | Tags-Filter: "tags:tag1\|tag2" |
| `relays` | array | `[]` | Nostr Relays: ["wss://..."] |
| `npub` | array | `[]` | Autoren: ["npub1abc..."] |
| `limit` | number | `1000` | Max Events (1-10000) |

---

## 🎯 Häufige Anwendungen

### Alle Termine anzeigen
```
Einfach Block einfügen, speichern. Default lädt alle.
```

### Nur Grundschule
```
Inspector → Filter: "tags:grundschule"
Speichern ✅
```

### Dark Mode + eigene Autoren
```
Inspector → Design: Dark
Inspector → Autoren: npub1... (+ weiterer), npub1... (+ weiterer)
Speichern ✅
```

### Viele Termine, gefiltert
```
Inspector → Max Events: 5000
Inspector → Relays: (2-3 schnelle auswählen)
Speichern ✅
```

---

## 🔍 Debug & Troubleshooting

### Block wird nicht angezeigt?
```
Admin → Plugins → Aktiviert?
F12 (Console) → Fehler?
→ Site Health prüfen
```

### Events laden nicht?
```
F12 → Console → Errors suchen
Prüfe: window.NOSTR_OPTIONS
Browser-Network → API-Calls OK?
```

### Styling kaputt?
```
CSS-Konflikt? → Inspect Element
Theme-CSS geladen? → DevTools → Sources
Mobile zu klein? → Responsiv-Design mode
```

---

## 📦 Dateien die relevant sind

Für die tägliche Nutzung brauchst du nur zu wissen:

```
/plugin/nostr-calendar-block/
├── nostr-calendar-block.php       ← Plugin-Datei
├── README.md                       ← Dokumentation
├── USAGE.md                        ← Diese Datei
└── assets/
    ├── css/event-wall.css          ← Styling
    ├── js/editor.js                ← Inspector Controls
    └── js/nostre-api.js            ← Nostr API (automatisch)
```

---

## 🧪 Testen im lokalen WordPress

### Mit Docker (einfach)
```bash
docker run --name wp -e WORDPRESS_DB_PASSWORD=test \
  -v /path/to/wp-content/plugins:/var/www/html/wp-content/plugins \
  -p 8080:80 -d wordpress

# http://localhost:8080 → Admin/Test
```

### Lokal (mit xampp/mamp)
```
1. Plugin in wp-content/plugins platzieren
2. WordPress Admin öffnen
3. Plugin aktivieren
4. Test-Seite erstellen + Block hinzufügen
```

---

## 💡 Tipps & Tricks

**🎨 Theme wechseln**
```
Block → Inspector → Design → Theme
→ Live-Preview beim Seiten-View
```

**🔗 Relays hinzufügen**
```
Block → Inspector → Relays
→ "+ Relay hinzufügen"
→ URL eingeben (z.B. wss://relay.example.com)
```

**🏷️ Nach Autor filtern**
```
Block → Inspector → Autoren
→ "+ Autor hinzufügen"
→ npub eingeben (oder hex-key)
```

**⚡ Performance**
```
- Limit auf 500-1000 senken
- Nur 1-2 schnelle Relays
- Spezifische npub filtern
```

**🌙 Dark Mode Site-weit**
```
# functions.php:
add_filter('nostr_calendar_default_theme', function() {
    return isset($_COOKIE['dark']) ? 'dark' : 'light';
});
```

---

## 📚 Weiterführende Doku

- **Detaillierte Nutzung**: `USAGE.md`
- **Entwickler-Infos**: `README.md`
- **Technische Details**: `REFACTORING.md`
- **API-Doku**: `../../docs/nostr-api.md`

---

## ❓ FAQ

**F: Funktioniert das mit älterer WordPress-Version?**
A: WordPress 5.8+ wird vorausgesetzt (Gutenberg mit Block API).

**F: Kann ich das auch ohne Gutenberg nutzen?**
A: Nicht direkt, aber es gibt Fallback-Logik für klassische Editoren (in Planung).

**F: Welche Nostr-Relays sollte ich nutzen?**
A: Zuverlässige: `wss://relilab.nostr1.com`, `wss://relay.damus.io`

**F: Kann ich Events cachen?**
A: Nicht aktuell, könnte als Feature hinzugefügt werden.

**F: Mehrere Blocks auf einer Seite?**
A: Ja! Jeder Block lädt unabhängig.

---

## 🤝 Support

Fragen? → Siehe **README.md** oder **docs/**

Viel Erfolg! 🚀

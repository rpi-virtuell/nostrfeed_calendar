# 📚 Nostr Calendar Block - Dokumentations-Index

## 🎯 Wo finde ich was?

### 👤 Für Endnutzer (Redakteure/Content Manager)

1. **[QUICKSTART.md](QUICKSTART.md)** ⚡ START HERE
   - 30-Sekunden Setup
   - Block einfügen in Gutenberg
   - Minimale Konfiguration

2. **[USAGE.md](USAGE.md)** 📖 Detaillierte Nutzung
   - Alle Block-Optionen erklärt
   - Beispiel-Konfigurationen
   - Troubleshooting
   - Häufige Fragen (FAQ)

### 👨‍💻 Für Entwickler/Administratoren

1. **[README.md](README.md)** 📋 Plugin-Übersicht
   - Features
   - Installation
   - Kompatibilität
   - File-Struktur

2. **[ARCHITECTURE.md](ARCHITECTURE.md)** 🏗️ Technische Details
   - System-Architektur
   - Komponenten-Diagramm
   - Datenfluss
   - Erweiterungspunkte
   - Performance-Optimierungen
   - Sicherheit

3. **[../../REFACTORING.md](../../REFACTORING.md)** 🔄 Projekt-Historie
   - Warum dieses Refactoring?
   - Alte vs. Neue Struktur
   - Vorteile der Lösung
   - Nächste Schritte

### 📁 Wichtigste Code-Dateien

**Backend (PHP)**
- `nostr-calendar-block.php` - Plugin-Header
- `includes/class-plugin.php` - Hauptlogik
- `includes/class-renderer.php` - HTML-Rendering

**Frontend (JavaScript)**
- `assets/js/editor.js` - Gutenberg Inspector UI
- `assets/js/embed-wall.js` - Wall-Initializer
- `assets/js/event-wall.js` - Event-Logik & Rendering
- `assets/js/nostre-api.js` - Nostr Protocol

**Styling (CSS)**
- `assets/css/event-wall.css` - Main Styles
- `assets/css/themes/light.css` - Light Theme
- `assets/css/themes/dark.css` - Dark Theme
- `assets/css/themes/relilab.css` - ReliLab Theme

**Block-Definition**
- `src/blocks/event-wall/block.json` - Gutenberg Block Config

---

## 🚀 Quick Navigation

### Setup & Installation
```
1. QUICKSTART.md
2. README.md → Installation
3. Installation im WordPress
```

### Tägliche Nutzung
```
1. QUICKSTART.md (Basis)
2. USAGE.md (Erweiterte Optionen)
3. F12 Console (Debug)
```

### Entwicklung & Anpassung
```
1. ARCHITECTURE.md (Überblick)
2. README.md → File Structure
3. Code-Dateien lesen
4. REFACTORING.md → Hintergrund
```

### Integration in bestehende Sites
```
1. QUICKSTART.md
2. USAGE.md → Beispiele
3. Custom Themeing (siehe ARCHITECTURE)
```

---

## 📊 Dokumentations-Matrix

| Zielgruppe | Level | Start | Nächstes |
|-----------|-------|-------|----------|
| **Redakteur** | Anfänger | QUICKSTART | USAGE |
| **Admin** | Fortgeschritten | README | ARCHITECTURE |
| **Developer** | Profi | ARCHITECTURE | Code |
| **Manager** | Überblick | REFACTORING | USAGE |

---

## 🎓 Lernpfade

### 🟢 "Ich will das Block einfach nutzen"
```
1. Lies: QUICKSTART.md (5 min)
2. Installiere das Plugin
3. Nutze den Block im Editor
4. Falls Fragen: USAGE.md
```

### 🟡 "Ich will es anpassen/customizen"
```
1. Lies: README.md (Installation) (5 min)
2. Lies: USAGE.md → Beispiele (10 min)
3. Probiere: Relays/Autoren/Theme (10 min)
4. Schaue: assets/css/themes/*.css (5 min)
```

### 🔴 "Ich will es erweitern/modifizieren"
```
1. Lies: ARCHITECTURE.md komplett (20 min)
2. Studiere: includes/class-plugin.php (10 min)
3. Studiere: assets/js/editor.js (10 min)
4. Lese: block.json (5 min)
5. Experimentiere mit Anpassungen
```

---

## 🔍 Suche nach Thema

### Installation & Setup
- **[QUICKSTART.md](QUICKSTART.md)** - 30-Sekunden Setup
- **[README.md](README.md#installation)** - Detaillierte Installation

### Block-Optionen & Konfiguration
- **[USAGE.md](USAGE.md#optionen)** - Alle Attribute erklärt
- **[QUICKSTART.md](QUICKSTART.md#optionen)** - Kurz-Übersicht

### Theming & Design
- **[ARCHITECTURE.md](ARCHITECTURE.md#theming)** - Theming-System
- **`assets/css/themes/`** - Theme-Dateien

### Troubleshooting & FAQ
- **[USAGE.md](USAGE.md#troubleshooting)** - Häufige Probleme
- **[USAGE.md](USAGE.md#faq)** - Fragen & Antworten

### Technische Architektur
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Komplettes System
- **[README.md](README.md#dateistruktur)** - File-Layout

### Entwicklung & Erweiterung
- **[ARCHITECTURE.md](ARCHITECTURE.md#erweiterungspunkte)** - Hooks
- **[README.md](README.md#entwicklung)** - Build-Setup

### Nostr Integration
- **`assets/js/nostre-api.js`** - Nostr API Code
- **`docs/nostr-api.md`** - (im Hauptverzeichnis)

---

## 💾 Versioning

```
Plugin Version: 1.0.0
Kompatibilität:
  - WordPress: 5.8+
  - PHP: 7.4+
  - Browser: ES6+ (moderne)

Block Version: 3 (Gutenberg Standard)
```

---

## 🤝 Support-Ressourcen

| Problem | Lösung |
|---------|--------|
| **Block wird nicht angezeigt** | QUICKSTART → Installation |
| **Events laden nicht** | USAGE → Troubleshooting |
| **Styling falsch** | ARCHITECTURE → Theming |
| **Ich will anpassen** | ARCHITECTURE → Erweiterung |
| **Fragen zur Nutzung** | USAGE → FAQ |
| **Technische Fragen** | ARCHITECTURE → alle Details |

---

## 📖 Dokumentation Navigation

```
START
  ↓
[Neuanwender?] ──YES→ QUICKSTART.md ──→ USAGE.md
  ↓ NO
[Admin/Tech?] ──YES→ README.md ──→ ARCHITECTURE.md
  ↓ NO
[Coder?] ──YES→ ARCHITECTURE.md ──→ Code-Dateien
  ↓ NO
[Historie interessiert?] ──YES→ REFACTORING.md
  ↓ NO
[Nostr-Details?] ──YES→ docs/nostr-api.md
  ↓ NO
→ README.md (Startpunkt)
```

---

## 📝 Dateiübersicht

```
DOKUMENTATION:
├─ README.md             ← Offizielle Doku
├─ QUICKSTART.md        ← 30-Sekunden Start
├─ USAGE.md             ← Ausführliche Nutzung  
├─ ARCHITECTURE.md      ← Technische Details
├─ INDEX.md             ← Diese Datei
└─ package.json         ← Dependencies

CODE:
├─ nostr-calendar-block.php          ← Main Plugin
├─ includes/
│  ├─ class-plugin.php               ← Hauptklasse
│  └─ class-renderer.php             ← Rendering
├─ src/blocks/event-wall/
│  └─ block.json                     ← Block-Config
└─ assets/
   ├─ js/
   │  ├─ editor.js                   ← Inspector UI
   │  ├─ embed-wall.js               ← Initializer
   │  ├─ event-wall.js               ← Logic
   │  └─ nostre-api.js               ← API
   └─ css/
      ├─ editor.css                  ← Editor
      ├─ event-wall.css              ← Main
      └─ themes/                     ← Themes
```

---

## 🎯 Häufigste Fragen

**F: Wo fange ich an?**
A: → QUICKSTART.md

**F: Wie nutze ich alle Features?**
A: → USAGE.md

**F: Wie funktioniert das technisch?**
A: → ARCHITECTURE.md

**F: Ich will das ändern/erweitern**
A: → ARCHITECTURE.md + Code-Dateien

**F: Welche Dateien brauche ich?**
A: → README.md → Dateistruktur

**F: Gibt es Beispiele?**
A: → USAGE.md → Beispiele

---

## 🔗 External Links

- WordPress Block API: https://developer.wordpress.org/block-editor/
- Nostr Protocol: https://github.com/nostr-protocol/nostr
- CSS-Variablen: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

## 📞 Support-Kontakt

Bei Fragen oder Problemen:
1. Prüfe die relevante Doku (siehe Matrix oben)
2. Schau USAGE.md → Troubleshooting
3. Kontaktiere das Development Team

---

## ✅ Checkliste für neue Nutzer

- [ ] QUICKSTART.md gelesen (5 min)
- [ ] Plugin installiert (2 min)
- [ ] Block in Gutenberg gefunden (1 min)
- [ ] Block auf Test-Seite eingefügt (1 min)
- [ ] Konfiguration angepasst (5 min)
- [ ] Seite gespeichert & angesehen (2 min)
- [ ] Falls Probleme: USAGE.md → Troubleshooting

**Geschätzte Zeit: 15 Minuten** ⏱️

---

## 📈 Dokumentations-Roadmap

```
✅ v1.0.0 (aktuell)
   - QUICKSTART.md
   - USAGE.md
   - README.md
   - ARCHITECTURE.md
   - INDEX.md (diese Datei)

🔜 Geplant
   - Video-Tutorials
   - Admin-Settings Guide
   - API-Reference
   - Troubleshooting Video
   - Performance Guide
```

---

**Viel Erfolg mit Nostr Calendar Block!** 🚀

Fragen? → Siehe Index oben oder die relevante Dokumentation.

<!-- PLUGIN VERWENDUNG DEMO -->

# Nostr Calendar Block - Verwendungsbeispiele

## 1️⃣ Installation im WordPress

```bash
# Plugin-Ordner im Plugins-Verzeichnis platzieren
cp -r plugin/nostr-calendar-block /path/to/wp-content/plugins/

# Oder: Symlink (für Entwicklung)
ln -s /path/to/nostr-calendar-block /path/to/wp-content/plugins/
```

Dann im WordPress Admin unter **Plugins** → **Nostr Calendar Block** aktivieren.

---

## 2️⃣ Block im Gutenberg Editor verwenden

### Schritt 1: Block hinzufügen
```
Gutenberg Editor → + (Block hinzufügen) → "Nostr Event Wall" suchen
```

### Schritt 2: Im Inspector konfigurieren (rechts)

**Panel: Design**
```
Theme: [Dropdown]
  ☐ Light (Standard)
  ☑ Dark
  ☐ ReliLab
```

**Panel: Anzeige**
```
✓ Filterleiste anzeigen
Maximale Anzahl Events: [Slider] 1000
Filter (Optional): [Text] tags:kita|grundschule
```

**Panel: Relays**
```
Relay 1: wss://relilab.nostr1.com
[Entfernen]

Relay 2: wss://relay-rpi.edufeed.org
[Entfernen]

[+ Relay hinzufügen]
```

**Panel: Autoren (npub)**
```
npub 1: npub1abc123...
[Entfernen]

npub 2: npub1xyz789...
[Entfernen]

[+ Autor hinzufügen]
```

### Schritt 3: Speichern
Block wird mit allen Attributen im Post gespeichert.

---

## 3️⃣ Beispiel-Konfigurationen

### Beispiel A: Einfache Event Wall (alle Events)
```
Theme: Light
Filterleiste: Ja
Filter: (leer)
Relays: wss://relilab.nostr1.com
Autoren: (leer - alle Autoren)
Max Events: 1000
```

### Beispiel B: Gefilterte Veranstaltungen
```
Theme: ReliLab
Filterleiste: Nein
Filter: tags:grundschule,veranstaltung
Relays: wss://relay-rpi.edufeed.org, wss://nostr.wine
Autoren: npub1...relilab..., npub1...partner...
Max Events: 500
```

### Beispiel C: Dark Mode mit Autoren-Filter
```
Theme: Dark
Filterleiste: Ja
Filter: (leer)
Relays: wss://relilab.nostr1.com
Autoren: npub1abc123... (nur dieser Autor)
Max Events: 2000
```

---

## 4️⃣ Block-Attribute (Shortcode Alternative)

Falls Sie die Attribute direkt bearbeiten möchten (Block → Edit as HTML):

```html
<!-- wp:nostr-calendar/event-wall {
  "theme": "light",
  "showFilterbar": true,
  "filter": "tags:kita",
  "relays": ["wss://relilab.nostr1.com"],
  "npub": ["npub1abc123xyz789"],
  "limit": 1000
} /-->
```

---

## 5️⃣ Frontend-Rendering

### Block-HTML (Seite)
```html
<div id="nostr-event-wall" 
     class="nostr-event-wall" 
     data-theme="light" 
     data-show-filterbar="true"
     data-filter="tags:kita"
     data-relays="wss://relilab.nostr1.com"
     data-npub="npub1abc123"
     data-limit="1000">
</div>
```

### JavaScript initialisiert dann:
1. ✅ Filterbar laden (optional)
2. ✅ Event-Tiles rendern
3. ✅ Modal-System aktivieren
4. ✅ Theme CSS laden
5. ✅ Nostr API aufrufen

---

## 6️⃣ Editor-Preview

Während der Bearbeitung zeigt der Editor eine **Preview-Box**:

```
┌─────────────────────────────────────┐
│  📅 Nostr Event Wall                 │
├─────────────────────────────────────┤
│                                       │
│ Theme: light                          │
│ Filterleiste: Ja                      │
│ Filter: tags:kita                    │
│ Max. Events: 1000                    │
│ Relays: 2                            │
│ Autoren: 1                           │
│                                       │
│  (Live Preview beim Seiten-View)     │
└─────────────────────────────────────┘
```

---

## 7️⃣ Troubleshooting

### Block wird nicht angezeigt?
- ✅ Plugin aktiviert?
- ✅ WordPress 5.8+?
- ✅ Gutenberg Block korrekt registriert?

```php
# Debug im Plugin aktivieren:
define('NOSTR_CALENDAR_DEBUG', true);

# Dann Check: Admin → Tools → Site Health
```

### Events laden nicht?
- ✅ Relays erreichbar?
- ✅ JavaScript Console (F12) auf Fehler prüfen
- ✅ Nostr API antwortet?

```javascript
// Konsole testen:
window.NOSTR_OPTIONS
// Sollte { relays: [...], allowed_npub: [...], limit: 1000 } zeigen
```

### Styling sieht falsch aus?
- ✅ Theme CSS geladen?
- ✅ Andere Plugins mit CSS-Konflikten?
- ✅ Child Theme CSS Override?

---

## 8️⃣ Erweiterte Nutzung

### Mehrere Blocks auf einer Seite
```
[Block 1: ReliLab Theme, nur Partner-Events]
[Block 2: Dark Theme, alle Events]
[Block 3: Light Theme, gefiltert nach Tags]

→ Jeder Block hat seine eigenen Attribute
→ Unabhängige Initialisierung
```

### Theme global setzen
```php
# In functions.php:
add_filter('nostr_calendar_default_theme', function() {
    return 'dark';  // Alle Blocks nutzen Dark Theme als Default
});
```

### Eigenes Theme erstellen
```css
/* /wp-content/themes/my-theme/css/nostr-relilab-custom.css */
[data-theme="custom"] {
  --color-primary: #ff6b6b;
  --color-background: #f8f9fa;
  /* ... weitere Variablen */
}
```

Dann im Block: Theme = "custom" wählen

---

## 9️⃣ Performance-Tipps

1. **Limit setzen**: Nicht mehr als 1000-2000 Events laden
2. **Filter nutzen**: Tags und Autoren reduzieren Datenmenge
3. **Caching aktivieren**: (Plugin könnte erweitert werden)
4. **Relays minimal**: 1-2 zuverlässige Relays statt 10

---

## 🔟 Support & Doku

- **Plugin README**: `plugin/nostr-calendar-block/README.md`
- **Refactoring Doku**: `REFACTORING.md`
- **Block-Definition**: `plugin/nostr-calendar-block/src/blocks/event-wall/block.json`
- **API-Doku**: `docs/nostr-api.md`

# Media Konvertierung - Dokumentation

## Übersicht

Die `mdToHtml()` Funktion in [`nostre-api.js`](nostre-api.js:24) wurde erweitert, um die Konvertierung von Bildern und Videos zu unterstützen.

## Unterstützte Formate

### 1. Bilder (Markdown Syntax)

**Syntax:**
- `![](https://example.com/image.jpg)` - Bild ohne Alt-Text
- `![Alt Text](https://example.com/image.jpg)` - Bild mit Alt-Text

**Ausgabe:**
```html
<img src="https://example.com/image.jpg" alt="" class="md-image">
<img src="https://example.com/image.jpg" alt="Alt Text" class="md-image">
```

### 2. Videos (Direkte URL Einbettung)

**Unterstützte Plattformen:**
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID` oder `https://youtu.be/VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`

**Ausgabe:**
```html
<!-- YouTube -->
<iframe class="md-video" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<!-- Vimeo -->
<iframe class="md-video" src="https://player.vimeo.com/video/VIDEO_ID" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
```

## CSS Klassen

Die generierten Media-Elemente erhalten spezifische CSS-Klassen für einfache Styling:

- `.md-image` - Für alle Bild-Elemente
- `.md-video` - Für alle Video-Iframes

**Beispiel CSS:**
```css
.md-image {
    max-width: 100%;
    height: auto;
    border: 2px solid #4CAF50;
}

.md-video {
    width: 100%;
    height: 315px;
    border: 2px solid #2196F3;
}
```

## Sicherheitsfeatures

- **HTML Escaping**: Alle HTML-Sonderzeichen werden automatisch escaped
- **URL Validierung**: Nur HTTP/HTTPS URLs werden akzeptiert
- **XSS Schutz**: Alt-Texte werden escaped um Injection zu verhindern
- **Target Blank**: Externe Links öffnen in neuem Tab mit `rel="noopener noreferrer"`

## Verwendung

Die Funktion wird automatisch in der Nostr-Event-Verarbeitung verwendet:

```javascript
// In der Event-Verarbeitungspipeline
const summaryHtml = NostreAPI.mdToHtml(summaryShort);
const contentHtml = NostreAPI.mdToHtml(contentMd);
```

## Testen

Eine Testdatei [`test-media-conversion.html`](test-media-conversion.html) ist verfügbar, um die Funktionalität zu testen.

## Beispiele

### Eingabe:
```
Hier ist ein Bild: ![](https://relilab.org/logo.png)

Und ein YouTube Video: https://youtu.be/dQw4w9WgXcQ

**Fetter Text** und normale [Links](https://example.com).
```

### Ausgabe:
```html
<p>Hier ist ein Bild: <img src="https://relilab.org/logo.png" alt="" class="md-image"></p>
<p>Und ein YouTube Video: <iframe class="md-video" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>
<p><strong>Fetter Text</strong> und normale <a href="https://example.com" target="_blank" rel="noopener noreferrer">Links</a>.</p>
```

## Rückwärtskompatibilität

Alle bestehenden Markdown-Features bleiben vollständig erhalten:
- **Fett**: `**text**`
- *Kursiv*: `*text*`
- Überschriften: `# H1`, `## H2`, `### H3`
- Inline-Code: `` `code` ``
- Links: `[text](url)`
- Absätze (automatische <p> Tags)
=== Nostr Calendar Block ===
Contributors: Jörg Lohrer, rpi-virtuell
Tags: nostr, events, calendar, gutenberg, block
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Ein schlankes WordPress Gutenberg-Plugin zur Anzeige von Nostr Events als Event Wall mit umfangreicher Filterung und Customization.

== Description ==

Nostr Calendar Block ist ein modernes WordPress Gutenberg-Plugin zur Anzeige von Events aus dem Nostr-Netzwerk als elegante Event Wall.

**Features:**

* 📅 **Gutenberg-Block** - Einfaches Einfügen in Seiten/Beiträge
* 🎨 **4 Themes** - Hell, Dunkel, ReliLab, Foerbico
* 🏷️ **Filterbar** - Tags, Freitextsuche, Monats-Filter (optional ein-/ausblendbar)
* 📱 **Responsive** - Mobile-first Design mit adaptivem Grid
* ⚡ **Performant** - DocumentFragment-Rendering, Tag-Count-Caching, Debouncing
* 🌐 **Nostr-native** - Events direkt aus Nostr-Relays via WebSocket
* 🔒 **Sicher** - XSS-Schutz (sanitizeHtml), HTTPS-only URLs, Input-Validierung
* ♿ **Barrierefrei** - WCAG 2.1 Focus-Management, aria-live, Keyboard-Navigation
* 🌍 **Mehrsprachig** - Vollstaendige Internationalisierung (i18n)
* 🧩 **Multi-Instance** - Mehrere unabhaengige Event Walls auf einer Seite

== Installation ==

1. Plugin-Ordner in `/wp-content/plugins/` kopieren
2. In WordPress im Admin-Bereich aktivieren
3. Seite/Beitrag öffnen und Gutenberg-Editor starten
4. Block "Nostr Event Wall" hinzufügen

== Verwendung ==

**Im Gutenberg-Editor:**

1. Block "Nostr Event Wall" einfügen
2. Im Inspector Panel anpassen:
   * Design: Theme wählen (Hell, Dunkel, ReliLab, Foerbico)
   * Anzeige: Filterleiste An/Aus, Max. Events, Custom Filter
   * Relays: Nostr Relay URLs hinzufügen
   * Autoren: npub-Adressen filtern

**Block-Attribute:**

* theme (string) - 'light', 'dark', 'relilab', 'foerbico' (Standard: 'light')
* showFilterbar (boolean) - Filterleiste anzeigen (Standard: true)
* filter (string) - Filter-Spezifikation z.B. 'tags:kita|grundschule'
* relays (array) - Nostr Relay URLs
* npub (array) - Erlaubte Autoren (Nostr Public Keys)
* limit (number) - Max. Anzahl Events (1-10000, Standard: 1000)

== Frequently Asked Questions ==

= Welche Nostr Relays kann ich verwenden? =

Der Block funktioniert mit allen Standard-Nostr-Relays. Empfohlen sind:
* wss://relay.damus.io
* wss://relay.nostr.bg
* wss://nostr.wine

= Kann ich mehrere Autoren filtern? =

Ja! Im "Autoren" Panel können Sie beliebig viele npub-Adressen hinzufügen. Events von allen diesen Autoren werden angezeigt.

= Wie funktioniert die Tag-Filterung? =

Verwenden Sie die Filter-Syntax: `tags:tag1|tag2,author:npub1...`

= Ist das Plugin sicher? =

Ja! Der Block validiert alle Event-Daten und verifiziert Nostr-Signaturen.

== Screenshots ==

1. Event Wall mit Light-Theme
2. Gutenberg Inspector Panel mit Einstellungen
3. Event Wall mit Dark-Theme
4. Responsive Ansicht auf Mobile

== Changelog ==

= 1.1.0 =
* Sicherheit: XSS-Schutz via sanitizeHtml() -- gefaehrliche Tags, Event-Handler und javascript:-URLs werden entfernt
* Sicherheit: HTTPS-only URL-Validierung, Ablehnung von Protocol-Relative URLs
* Sicherheit: Bech32-Decoder mit Null-Safety und 32-Byte-Validierung
* Sicherheit: Theme-Whitelist und Limit-Range-Validierung im Renderer
* Barrierefreiheit: WCAG 2.1 Focus-Trap im Modal mit Fokus-Wiederherstellung
* Barrierefreiheit: Sichtbare Focus-Ringe auf allen interaktiven Elementen
* Barrierefreiheit: aria-live Regionen fuer dynamische Inhalte
* Barrierefreiheit: Keyboard-Navigation (Escape schliesst Modal, Enter oeffnet Tile)
* Performance: DocumentFragment fuer Batch-DOM-Rendering (ein Reflow statt n)
* Performance: Tag-Count-Caching vermeidet O(n^2) bei Filterung
* Performance: Debounced Tag-Suggest (150ms) und Suche (200ms)
* Performance: Markdown-to-HTML Memoization Cache
* Themes: Foerbico-Theme hinzugefuegt
* Themes: Alle Theme-CSS auf data-theme Attribut-Selektoren umgestellt
* Themes: Dunkles Theme bereinigt (Duplikate entfernt)
* Themes: Multi-Instance kompatible Selektoren (keine globalen IDs)
* Multi-Instance: Mehrere unabhaengige Event Walls auf einer Seite
* Multi-Instance: Prefixed IDs, eigener State pro Container
* i18n: Vollstaendige Internationalisierung aller UI-Texte
* i18n: Deutsche Uebersetzungen als Standard
* Editor: Lokalisierte Block-Einstellungen (Sidebar auf Deutsch)
* Editor: customClassName Support fuer zusaetzliche CSS-Klassen
* CSS: Alle Hardcoded Farben durch CSS Custom Properties ersetzt
* CSS: Responsive Grid mit WordPress alignwide/alignfull Support
* CSS: Reduced-Motion Support fuer Animationen
* Fix: Plugin-Initialisierung auf plugins_loaded Hook verschoben
* Fix: Textdomain-Laden mit korrekter Hook-Prioritaet (5 vor Block-Registrierung bei 10)

= 1.0.0 =
* Initial Release
* Gutenberg Block-Support
* 3 vordefinierte Themes
* Relay- und Author-Filterung
* Responsive Design

== Requirements ==

* WordPress 5.8 oder höher
* PHP 7.4 oder höher
* Aktive Internetverbindung für Nostr-Events
- Modern Browser (ES6+)

## Lizenz

GPL-2.0-or-later

## Support

Dokumentation: siehe `docs/` im Hauptverzeichnis

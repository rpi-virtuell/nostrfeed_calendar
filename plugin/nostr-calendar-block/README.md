=== Nostr Calendar Block ===
Contributors: rpi-virtuell
Tags: nostr, events, calendar, gutenberg, block
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Ein schlankes WordPress Gutenberg-Plugin zur Anzeige von Nostr Events als Event Wall mit umfangreicher Filterung und Customization.

== Description ==

Nostr Calendar Block ist ein modernes WordPress Gutenberg-Plugin zur Anzeige von Events aus dem Nostr-Netzwerk als elegante Event Wall.

**Features:**

* 📅 **Gutenberg-Block** - Einfaches Einfügen in Seiten/Beiträge
* 🎨 **Customizable** - Theme-Optionen (Hell, Dunkel, ReliLab)
* 🏷️ **Filterbar** - Tags, Suche, Datum filtern (optional)
* 📱 **Responsive** - Mobile-first Design
* ⚡ **Lightweight** - Minimale Dependencies, schnelle Ladezeiten
* 🌐 **Nostr-native** - Events direkt aus dem Nostr-Netzwerk
* 🔒 **Sicher** - Validierte Event-Daten mit Nostr-Signatur-Verifikation
* 🌍 **Mehrsprachig** - Internationalisierung ready

== Installation ==

1. Plugin-Ordner in `/wp-content/plugins/` kopieren
2. In WordPress im Admin-Bereich aktivieren
3. Seite/Beitrag öffnen und Gutenberg-Editor starten
4. Block "Nostr Event Wall" hinzufügen

== Verwendung ==

**Im Gutenberg-Editor:**

1. Block "Nostr Event Wall" einfügen
2. Im Inspector Panel anpassen:
   * Design: Theme wählen (Hell, Dunkel, ReliLab)
   * Anzeige: Filterleiste An/Aus, Max. Events, Custom Filter
   * Relays: Nostr Relay URLs hinzufügen
   * Autoren: npub-Adressen filtern

**Block-Attribute:**

* theme (string) - 'light', 'dark', 'relilab' (Standard: 'light')
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

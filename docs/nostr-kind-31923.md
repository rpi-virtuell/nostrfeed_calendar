# Kind 31923: Zeitbasiertes Kalender-Event

## Überblick

Zeitbasierte Kalender-Events bilden Ereignisse ab, die zwischen einem konkreten Start- und Endzeitpunkt stattfinden. Im Unterschied zu datumbasierten Kalender-Events (Kind 31922) enthalten sie präzise Zeitstempel und können optional Zeitzonen angeben – damit eignen sie sich für Meetings, Termine und alle Veranstaltungen, bei denen die genaue Uhrzeit relevant ist.

| Eigenschaft | Wert |
|---|---|
| **Kind-Nummer** | 31923 |
| **Event-Typ** | Adressierbar (Addressable) |
| **Definiert in** | [NIP-52](https://github.com/nostr-protocol/nips/blob/master/52.md) |

---

## Inhalt (`content`)

Das `content`-Feld enthält eine ausführliche Beschreibung des Termins. Es ist zwar Pflichtfeld, kann aber auch leer bleiben. Empfohlen ist **Markdown-Formatierung**, da viele Clients daraus HTML rendern.

---

## Tags

| Tag | Beschreibung | Format | Pflicht |
|---|---|---|:---:|
| `d` | Eindeutiger Bezeichner des Events (Identifier) | `["d", "<Bezeichner>"]` | ✅ |
| `title` | Titel des Termins | `["title", "<Titel>"]` | ✅ |
| `start` | Startzeit als Unix-Timestamp (Sekunden, inklusiv) | `["start", "<Unix-Timestamp>"]` | ✅ |
| `end` | Endzeit als Unix-Timestamp (Sekunden, exklusiv) | `["end", "<Unix-Timestamp>"]` | – |
| `start_tzid` | Zeitzone des Startzeitpunkts (IANA-Bezeichner) | `["start_tzid", "<Zeitzone>"]` | – |
| `end_tzid` | Zeitzone des Endzeitpunkts (IANA-Bezeichner) | `["end_tzid", "<Zeitzone>"]` | – |
| `summary` | Kurzbeschreibung des Termins | `["summary", "<Kurztext>"]` | – |
| `image` | URL eines Vorschaubilds | `["image", "<Bild-URL>"]` | – |
| `location` | Veranstaltungsort oder Link (z. B. Zoom-URL) | `["location", "<Ort oder URL>"]` | – |
| `g` | Geohash für einen physischen Ort (für Suche) | `["g", "<Geohash>"]` | – |
| `p` | Öffentlicher Schlüssel einer beteiligten Person, optional mit Relay-URL und Rolle | `["p", "<32-Byte-Hex-Pubkey>", "<Relay-URL>", "<Rolle>"]` | – |
| `l` | Label zur Kategorisierung | `["l", "<Label>", "<optionaler Namespace>"]` | – |
| `t` | Hashtag zur Kategorisierung | `["t", "<Schlagwort>"]` | – |
| `r` | Verweis auf Webseiten, Dokumente o. ä. | `["r", "<URL>"]` | – |

### Hinweise zu einzelnen Tags

**`d` – Identifier**
Identifiziert das Event eindeutig in Kombination mit dem Pubkey des Autors. Da Kind 31923 ein *adressierbares* Event ist, ersetzt eine neue Version mit gleichem `d`-Tag und Pubkey automatisch die alte (NIP-01). Im relilab-Workflow wird die originale WordPress-Permalink-URL direkt als `d`-Tag verwendet (z. B. `https://relilab.org/termine/mein-termin/`). Das macht den Identifier für Menschen lesbar und verknüpft WP-Post und Nostr-Event dauerhaft und nachvollziehbar.

**`start` / `end` – Zeitstempel**
Beide Werte sind Unix-Timestamps in Sekunden (nicht Millisekunden). `start` ist inklusiv, `end` exklusiv – analog zu Kalenderstandards wie iCalendar.

**`start_tzid` / `end_tzid` – Zeitzone**
IANA-Bezeichner aus der [Zeitzonen-Datenbank](https://www.iana.org/time-zones), z. B. `Europe/Berlin`. Wenn `start_tzid` angegeben, aber `end_tzid` fehlt, gilt dieselbe Zeitzone für beide Zeitpunkte.

**`location`**
Kann ein physischer Ort (Adresse, Raumname) oder eine URL sein. Im relilab-Workflow werden Zoom-Links im Format `Zoom: https://…` gespeichert und beim Anzeigen automatisch zu klickbaren Links umgewandelt.

**`r` – Verweis (Reference)**
Verlinkung zu verwandten Ressourcen. Im relilab-Workflow wird hier dieselbe WordPress-Permalink-URL eingetragen wie im `d`-Tag. Damit ist der Ursprungsort des Termins für jeden Client direkt abrufbar – auch ohne Kenntnis des WP-Backends.

**`t` – Hashtag**
Mehrere `t`-Tags sind erlaubt. Sie ermöglichen die Filterung nach Themen, Zielgruppen oder Veranstaltungsreihen (z. B. `["t", "Kita"]`, `["t", "Grundschule"]`).

---

## Verhalten der Clients

Clients sollten:

- Beim Erstellen eines neuen Termins einen eindeutigen `d`-Wert generieren (UUID oder stabiler Identifier)
- Sicherstellen, dass `start` vor `end` liegt (sofern `end` angegeben)
- Ein fehlendes `end` als punktuelles Ereignis behandeln (kein Zeitraum)
- Falls nur `start_tzid` angegeben ist, dieselbe Zeitzone auch für `end` verwenden
- Verschiedene Zeitzonen korrekt darstellen und Sommerzeit-Übergänge berücksichtigen

---

## Verhalten der Relays

Relays behandeln Kind-31923-Events wie alle anderen adressierbaren Events: Sie können abgerufen, aktualisiert und gelöscht werden (vgl. NIP-09). Beim Empfang einer neuen Version (gleicher Pubkey + `d`-Tag, neuerer `created_at`-Timestamp) ersetzen Relays das ältere Event.

---

## Anwendungsfälle

- Online-Fortbildungen und Webinare (z. B. Zoom-Termine)
- Schulische und kirchliche Veranstaltungen
- Konzerte und zeitgenaue Aufführungen
- Meetings und Besprechungen
- Jedes Ereignis, bei dem Datum **und** Uhrzeit relevant sind
- Grenzüberschreitende Termine mit unterschiedlichen Zeitzonen

---

## Beispiel

```json
{
  "id": "e2c7909bd47fce336edee4ccd32894181d08ea2c4f33b27f1f80149ae28f4d56",
  "pubkey": "79dff8f82963424e1852174ed276b6715c4ccc9777e489234a363a43d7c73143",
  "created_at": 1671217411,
  "kind": 31923,
  "tags": [
    ["d", "aHR0cHM6Ly9yZWxpbGFiLm9yZy8/cD0yMjA2OA=="],
    ["title", "Nostr-Protokoll: Wöchentliche Entwicklungsrunde"],
    ["summary", "Wöchentlicher Austausch zur Nostr-Protokollentwicklung"],
    ["start", "1683036000"],
    ["end",   "1683039600"],
    ["start_tzid", "Europe/Berlin"],
    ["end_tzid",   "Europe/Berlin"],
    ["location", "https://meet.example.com/nostr-weekly"],
    ["p", "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245", "", "organizer"],
    ["t", "nostr"],
    ["t", "entwicklung"],
    ["r", "https://pad.example.com/nostr-meeting-notes"]
  ],
  "content": "Wir besprechen aktuelle NIPs, den Stand der Implementierungen und die Planung kommender Features. Bitte bereitet Updates zu euren Aufgaben vor.",
  "sig": "a52e89981edca7c360c9c172bc35af902c6e2f5aabc13c3e70c2c98ef7ae83d15bd84ff58c796ab07eecc72c6c54c4174e7fb8be7c7719b5794824fe2db5637d"
}
```

---

## Bezug zum relilab-Workflow

Im relilab-Projekt werden WordPress-Termine automatisch als Kind-31923-Events nach Nostr veröffentlicht. Das Mapping funktioniert wie folgt:

| WordPress-Feld | Nostr-Tag | Anmerkung |
|---|---|---|
| `link` | `d` | Permalink-URL direkt als Identifier – lesbar und stabil |
| `title.rendered` | `title` | HTML-Entitäten werden dekodiert |
| `acf.relilab_startdate` | `start` | `"YYYY-MM-DD HH:MM:SS"` → Unix-Timestamp (UTC) |
| `acf.relilab_enddate` | `end` | wie `start` |
| `excerpt.rendered` | `summary` | HTML → Markdown |
| `content.rendered` | `content` | HTML → Markdown |
| `acf.relilab_custom_zoom_link` | `location` | Präfix `"Zoom: "` |
| `featured_image_urls_v2.thumbnail[0]` | `image` | URL des Vorschaubilds |
| `taxonomy_info.post_tag[].label` | `t` | je Schlagwort ein eigener Tag |
| `link` | `r` | gleiche URL wie `d` – Quelllink für Clients sichtbar |

---

## Weiterführende Quellen

- [NIP-52: Calendar Events](https://github.com/nostr-protocol/nips/blob/master/52.md)
- [NIP-09: Event Deletion](https://github.com/nostr-protocol/nips/blob/master/09.md)
- [NIP-01: Addressable Events](https://github.com/nostr-protocol/nips/blob/master/01.md)
- [IANA Time Zone Database](https://www.iana.org/time-zones)

## Verwandte Kinds

- [Kind 31922: Datumbasiertes Kalender-Event](https://nostr-nips.com/nip-52)
- [Kind 31924: Kalender](https://nostr-nips.com/nip-52)
- [Kind 31925: Kalender-Event RSVP](https://nostr-nips.com/nip-52)

---

## Hinweise

- Der veraltete `name`-Tag wird durch `title` ersetzt; Clients können `name` als Fallback auslesen, falls `title` fehlt.
- Die Zeitzonenumrechnung und Sommerzeit-Behandlung liegt in der Verantwortung der Clients.
- NIP-52 unterstützt bewusst **keine** wiederkehrenden Events (Serientermine) – deren Komplexität würde den Standard unverhältnismäßig aufblähen.

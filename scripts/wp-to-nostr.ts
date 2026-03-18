#!/usr/bin/env -S deno run --allow-net=relilab.org,relay-rpi.edufeed.org --allow-env=NOSTR_PRIVATE_KEY,DRY_RUN,WP_API_URL,WP_CATEGORY,NOSTR_RELAY
/**
 * wp-to-nostr.ts
 *
 * Holt WordPress-Termine über die REST-API und veröffentlicht sie als
 * Nostr kind:31923 Calendar-Events (NIP-52).
 *
 * Ersetzt den N8N-Workflow "map relilab termine to nostr 31923".
 *
 * Lokal testen (Dry-Run, kein Posting):
 *   deno task dry-run
 *
 * Lokal live (postet auf Relay):
 *   NOSTR_PRIVATE_KEY=nsec1… deno task start
 *
 * Direkt ausführbar (nach chmod +x):
 *   DRY_RUN=true ./scripts/wp-to-nostr.ts
 *
 * Umgebungsvariablen:
 *   NOSTR_PRIVATE_KEY  – nsec1… oder 64-stellige Hex-Zeichenkette (Pflicht im Live-Modus)
 *   DRY_RUN            – 'true' → nur anzeigen, nichts posten (Standard: 'false')
 *   WP_API_URL         – WordPress REST-API-Endpunkt
 *   WP_CATEGORY        – Kategorie-ID (Standard: 176)
 *   NOSTR_RELAY        – Relay-URL (Standard: wss://relay-rpi.edufeed.org)
 */

// @deno-types="npm:@types/turndown"
import TurndownService from "turndown";
import { finalizeEvent, getPublicKey } from "nostr-tools";
import { Relay } from "nostr-tools/relay";
import { decode } from "nostr-tools/nip19";
// Deno hat natives WebSocket – kein ws-Paket, kein useWebSocketImplementation nötig

// ── Typen ─────────────────────────────────────────────────────────────────────

interface WpPost {
  id: number;
  guid: { rendered: string };
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  modified_gmt: string;
  acf?: {
    relilab_startdate?: string;
    relilab_enddate?: string;
    relilab_custom_zoom_link?: string;
  };
  featured_image_urls_v2?: { thumbnail?: string[] };
  taxonomy_info?: { post_tag?: Array<{ label: string }> };
}

interface NostrEventTemplate {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
}

// ── Konfiguration ─────────────────────────────────────────────────────────────

const WP_API_URL  = Deno.env.get("WP_API_URL")  ?? "https://relilab.org/wp-json/wp/v2/posts";
const WP_CATEGORY = Deno.env.get("WP_CATEGORY") ?? "176";
const NOSTR_RELAY = Deno.env.get("NOSTR_RELAY") ?? "wss://relay-rpi.edufeed.org";
const DRY_RUN     = Deno.env.get("DRY_RUN") === "true";
const PRIVKEY_RAW = Deno.env.get("NOSTR_PRIVATE_KEY") ?? "";

// ── Privaten Schlüssel auflösen ───────────────────────────────────────────────

function resolvePrivkey(raw: string): Uint8Array {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("NOSTR_PRIVATE_KEY ist nicht gesetzt.");

  // nsec-Format (bech32)
  if (trimmed.startsWith("nsec")) {
    const decoded = decode(trimmed);
    if (decoded.type !== "nsec") throw new Error("Ungültiger nsec-Schlüssel.");
    return decoded.data as Uint8Array;
  }

  // Hex-Format (64 Zeichen)
  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return Uint8Array.from(
      trimmed.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
    );
  }

  throw new Error("NOSTR_PRIVATE_KEY muss nsec1… oder eine 64-stellige Hex-Zeichenkette sein.");
}

// ── HTML → Markdown ───────────────────────────────────────────────────────────

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return turndown.turndown(html).trim();
}

// ── WordPress REST-API ────────────────────────────────────────────────────────

async function fetchWpPosts(): Promise<WpPost[]> {
  const url = new URL(WP_API_URL);
  url.searchParams.set("categories", WP_CATEGORY);
  url.searchParams.set("per_page",   "50");
  url.searchParams.set("meta_key",   "relilab_startdate");
  url.searchParams.set("orderby",    "meta_value");
  url.searchParams.set("order",      "desc");

  console.log(`  API-URL: ${url}`);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`WordPress API Fehler: ${res.status} ${res.statusText}`);
  return res.json() as Promise<WpPost[]>;
}

// ── Datumskonvertierung ───────────────────────────────────────────────────────

function wpDateToUnix(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  // WP speichert "YYYY-MM-DD HH:MM:SS" ohne Zeitzone – N8N behandelte als UTC
  return Math.floor(new Date(dateStr.replace(" ", "T") + "Z").getTime() / 1000);
}

// ── WordPress-Post → Nostr-Event mappen ──────────────────────────────────────

function mapPostToNostrEvent(post: WpPost): NostrEventTemplate | null {
  const now     = Math.floor(Date.now() / 1000);
  const startTs = wpDateToUnix(post.acf?.relilab_startdate);
  const endTs   = wpDateToUnix(post.acf?.relilab_enddate);

  // Nur zukünftige Termine (identisch mit dem N8N-Filter-Node)
  if (startTs <= now) return null;

  // d-Tag: Base64 der WordPress GUID – identischer Identifier wie in N8N
  const d = btoa(post.guid?.rendered ?? String(post.id));

  // Titel bereinigen (HTML-Entitäten dekodieren)
  const title = (post.title?.rendered ?? "")
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g,  "<")
    .replace(/&gt;/g,  ">");

  // HTML → Markdown
  const contentMd = htmlToMarkdown(post.content?.rendered ?? "");
  const summaryMd = htmlToMarkdown(post.excerpt?.rendered ?? "");

  // Location (Zoom-Link)
  const zoomLink = (post.acf?.relilab_custom_zoom_link ?? "").trim();
  const location = zoomLink ? `Zoom: ${zoomLink}` : "";

  // Beitragsbild
  const image = post.featured_image_urls_v2?.thumbnail?.[0] ?? "";

  // Schlagwörter → ["t", label]
  const keywordTags = (post.taxonomy_info?.post_tag ?? [])
    .map((t) => ["t", t.label]);

  // Nostr-Tags-Array (NIP-52 / kind 31923)
  const tags: string[][] = [
    ["d",      d],
    ["title",  title],
    ["start",  String(startTs)],
    ["end",    String(endTs)],
    ["status", "planned"],
  ];
  if (summaryMd) tags.push(["summary", summaryMd]);
  if (location)  tags.push(["location", location]);
  if (image)     tags.push(["image", image]);
  tags.push(...keywordTags);

  const createdAt = Math.floor(
    new Date(post.modified_gmt ?? Date.now()).getTime() / 1000
  );

  return { kind: 31923, created_at: createdAt, tags, content: contentMd };
}

// ── Auf Nostr veröffentlichen ─────────────────────────────────────────────────

async function publishEvent(
  eventTemplate: NostrEventTemplate,
  privkey: Uint8Array
): Promise<void> {
  const signed = finalizeEvent(eventTemplate, privkey);
  console.log(`     → Event-ID: ${signed.id}`);

  const relay = await Relay.connect(NOSTR_RELAY);
  try {
    await relay.publish(signed);
  } finally {
    relay.close();
  }
}

// ── Hauptprogramm ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n🔄 WordPress → Nostr Sync");
  console.log(`   Relay : ${NOSTR_RELAY}`);
  console.log(`   Modus : ${DRY_RUN
    ? "🧪 DRY RUN – keine Events werden tatsächlich gesendet"
    : "🚀 LIVE – Events werden auf Nostr veröffentlicht"}\n`);

  // Privaten Schlüssel nur im Live-Modus laden
  let privkey: Uint8Array | null = null;
  if (!DRY_RUN) {
    privkey = resolvePrivkey(PRIVKEY_RAW);
    const pubkey = getPublicKey(privkey);
    console.log(`🔑 Öffentlicher Schlüssel (hex): ${pubkey}\n`);
  }

  // 1. WordPress-Posts holen
  console.log("📥 WordPress-Posts abrufen …");
  const posts = await fetchWpPosts();
  console.log(`   ${posts.length} Posts gefunden\n`);

  // 2. Filtern & mappen
  const events = posts.map(mapPostToNostrEvent).filter(
    (e): e is NostrEventTemplate => e !== null
  );
  console.log(`📅 ${events.length} zukünftige Termine zum Synchronisieren\n`);

  if (events.length === 0) {
    console.log("✅ Nichts zu veröffentlichen – alles aktuell.");
    return;
  }

  // 3. Veröffentlichen oder Dry-Run-Ausgabe
  let published = 0;
  let failed    = 0;

  for (const evt of events) {
    const title    = evt.tags.find((t) => t[0] === "title")?.[1]   ?? "(kein Titel)";
    const startSec = Number(evt.tags.find((t) => t[0] === "start")?.[1] ?? 0);
    const startStr = startSec ? new Date(startSec * 1000).toISOString() : "?";

    console.log(`  📌 "${title}"`);
    console.log(`     Start : ${startStr}`);

    if (DRY_RUN) {
      console.log("     [DRY RUN] Tags:", JSON.stringify(evt.tags));
      console.log(`     [DRY RUN] Content (${evt.content.length} Zeichen): ${evt.content.slice(0, 120)}…`);
    } else {
      try {
        await publishEvent(evt, privkey!);
        console.log("     ✅ Erfolgreich veröffentlicht");
        published++;
      } catch (err) {
        console.error(`     ❌ Fehler: ${(err as Error).message}`);
        failed++;
      }
    }
    console.log();
  }

  // Zusammenfassung
  console.log("📊 Zusammenfassung:");
  if (DRY_RUN) {
    console.log(`   ${events.length} Events bereit (Dry Run – nichts wurde gesendet)`);
  } else {
    console.log(`   ${published} von ${events.length} Events erfolgreich veröffentlicht`);
    if (failed > 0) console.log(`   ⚠️  ${failed} Events fehlgeschlagen`);
  }
}

main().catch((err: Error) => {
  console.error("\n💥 Fatal:", err.message);
  Deno.exit(1);
});

<?php
/**
 * Main plugin class
 */

class Nostr_Calendar_Block {
    private static $instance;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->load_dependencies();
        $this->setup_hooks();
    }

    private function load_dependencies() {
        require_once NOSTR_CALENDAR_BLOCK_DIR . 'includes/class-renderer.php';
    }

    private function setup_hooks() {
        add_action('init', [$this, 'load_textdomain'], 5);
        add_action('init', [$this, 'register_block'], 10);
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
    }

    public function load_textdomain() {
        load_plugin_textdomain(
            'nostr-calendar-block',
            false,
            dirname(plugin_basename(NOSTR_CALENDAR_BLOCK_DIR . 'nostr-calendar-block.php')) . '/languages'
        );
    }

    public function register_block() {
        $block_json_path = NOSTR_CALENDAR_BLOCK_DIR . 'src/blocks/event-wall/block.json';

        if (!file_exists($block_json_path)) {
            return;
        }

        register_block_type($block_json_path, [
            'render_callback' => [$this, 'render_block']
        ]);
    }

    public function render_block($attributes, $content = '', $block = null) {
        return Nostr_Calendar_Block_Renderer::render($attributes, $content);
    }

    public function enqueue_editor_assets() {
        wp_enqueue_style(
            'nostr-calendar-block-editor',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/css/editor.css',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION
        );

        wp_enqueue_script(
            'nostr-calendar-block-editor',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/editor.js',
            ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'],
            NOSTR_CALENDAR_BLOCK_VERSION,
            false
        );

        wp_set_script_translations('nostr-calendar-block-editor', 'nostr-calendar-block');
    }

    public function enqueue_frontend_assets() {
        if (is_admin()) {
            return;
        }

        // Only load assets if block is used on this page
        if (!has_block('nostr-calendar/event-wall')) {
            return;
        }

        // Load base CSS
        wp_enqueue_style(
            'nostr-calendar-block-style',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/css/event-wall.css',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION
        );

        // Note: theme CSS is loaded dynamically by embed-wall.js per container

        // Load Nostr API script
        wp_enqueue_script(
            'nostre-api',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/nostre-api.js',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION,
            true
        );

        // Load embed-wall.js (creates HTML structure)
        wp_enqueue_script(
            'nostr-calendar-block-embed',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/embed-wall.js',
            ['nostre-api'],
            NOSTR_CALENDAR_BLOCK_VERSION,
            true
        );

        // Load event-wall.js (event logic)
        wp_enqueue_script(
            'nostr-calendar-block-wall',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/event-wall.js',
            ['nostr-calendar-block-embed'],
            NOSTR_CALENDAR_BLOCK_VERSION,
            true
        );

        // Localize script data
        wp_localize_script(
            'nostr-calendar-block-embed',
            'nostrCalendarBlockData',
            [
                'apiEndpoint' => apply_filters('nostr_calendar_block_api_endpoint', 'https://n8n.rpi-virtuell.de/webhook/nostre_termine'),
                'locale' => str_replace('_', '-', get_locale()),
                'i18n' => [
                    'tags' => __('Tags', 'nostr-calendar-block'),
                    'search' => __('Suche', 'nostr-calendar-block'),
                    'month' => __('Monat', 'nostr-calendar-block'),
                    'allMonths' => __('Alle Monate', 'nostr-calendar-block'),
                    'reset' => __('Zurücksetzen', 'nostr-calendar-block'),
                    'results' => __('Treffer', 'nostr-calendar-block'),
                    'loading' => __('Lade Termine...', 'nostr-calendar-block'),
                    'noResults' => __('Keine Treffer für die gewählten Filter.', 'nostr-calendar-block'),
                    'tagPlaceholder' => __('Tag suchen & Enter zum Hinzufügen', 'nostr-calendar-block'),
                    'searchPlaceholder' => __('Titel & Tags durchsuchen …', 'nostr-calendar-block'),
                    'close' => __('Schließen', 'nostr-calendar-block'),
                    'summary' => __('Zusammenfassung:', 'nostr-calendar-block'),
                    'location' => __('Ort:', 'nostr-calendar-block'),
                    'noSummary' => __('Keine Zusammenfassung vorhanden.', 'nostr-calendar-block'),
                    'noLocation' => __('Kein Ort angegeben.', 'nostr-calendar-block'),
                    'noTags' => __('Keine', 'nostr-calendar-block'),
                    'filterByTag' => __('Nach Tag filtern', 'nostr-calendar-block'),
                    'imageAlt' => __('Bild für', 'nostr-calendar-block'),
                    'loadError' => __('Fehler beim Laden der Termine.', 'nostr-calendar-block'),
                    'details' => __('Details ansehen', 'nostr-calendar-block'),
                    'removeTag' => __('Tag entfernen', 'nostr-calendar-block'),
                    'clock' => __('Uhr', 'nostr-calendar-block'),
                ]
            ]
        );
    }
}

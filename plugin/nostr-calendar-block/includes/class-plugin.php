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
        // Load renderer
        require_once NOSTR_CALENDAR_BLOCK_DIR . 'includes/class-renderer.php';
    }

    private function setup_hooks() {
        // Register block at init priority 5
        add_action('init', [$this, 'register_block'], 5);

        // Enqueue editor assets in block editor
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);

        // Enqueue frontend styles and scripts
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
    }

    public function register_block() {
        // Register block type from block.json
        $block_json_path = NOSTR_CALENDAR_BLOCK_DIR . 'src/blocks/event-wall/block.json';
        
        if (!file_exists($block_json_path)) {
            error_log('Block JSON nicht gefunden: ' . $block_json_path);
            return;
        }

        // Register with render callback
        register_block_type($block_json_path, [
            'render_callback' => [$this, 'render_block']
        ]);
    }

    public function render_block($attributes) {
        // Delegate to renderer class
        return Nostr_Calendar_Block_Renderer::render($attributes, '');
    }

    public function enqueue_editor_assets() {
        // Editor specific assets - only in block editor
        wp_enqueue_style(
            'nostr-calendar-block-editor',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/css/editor.css',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION
        );

        // Register and enqueue editor script
        wp_enqueue_script(
            'nostr-calendar-block-editor',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/editor.js',
            ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'],
            NOSTR_CALENDAR_BLOCK_VERSION,
            false  // Load in head for proper registration
        );

        // Localize for translations
        wp_set_script_translations('nostr-calendar-block-editor', 'nostr-calendar-block');
    }

    public function enqueue_frontend_assets() {
        // Only load on frontend (not in editor)
        if (is_admin()) {
            return;
        }

        // Load theme CSS
        wp_enqueue_style(
            'nostr-calendar-block-style',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/css/event-wall.css',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION
        );

        // Load Nostr API script first (required by embed-wall.js)
        wp_enqueue_script(
            'nostre-api',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/nostre-api.js',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION,
            true
        );

        // Load embed-wall.js (creates HTML structure and loads event-wall.js)
        wp_enqueue_script(
            'nostr-calendar-block-embed',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/embed-wall.js',
            ['nostre-api'],
            NOSTR_CALENDAR_BLOCK_VERSION,
            true
        );

        // Note: event-wall.js wird von embed-wall.js dynamisch geladen
        // nachdem die HTML-Struktur erstellt wurde

        // Frontend script localization (für Kompatibilität)
        wp_localize_script(
            'nostr-calendar-block-embed',
            'nostrCalendarBlockData',
            [
                'apiEndpoint' => 'https://n8n.rpi-virtuell.de/webhook/nostre_termine',
                'ajaxUrl' => admin_url('admin-ajax.php'),
            ]
        );
    }
}

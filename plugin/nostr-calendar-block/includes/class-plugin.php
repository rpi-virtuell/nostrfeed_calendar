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
            error_log('[Nostr Calendar Block] Block JSON nicht gefunden: ' . $block_json_path);
            return;
        }

        error_log('[Nostr Calendar Block] Registering block from: ' . $block_json_path);

        // Register with render callback
        $registered = register_block_type($block_json_path, [
            'render_callback' => [$this, 'render_block']
        ]);

        if ($registered) {
            error_log('[Nostr Calendar Block] Block registered successfully: ' . $registered->name);
        } else {
            error_log('[Nostr Calendar Block] Block registration failed!');
        }
    }

    public function render_block($attributes, $content = '', $block = null) {
        error_log('[Nostr Calendar Block] render_block called with attributes: ' . print_r($attributes, true));
        
        // Delegate to renderer class
        $output = Nostr_Calendar_Block_Renderer::render($attributes, $content);
        
        error_log('[Nostr Calendar Block] render_block output length: ' . strlen($output));
        
        return $output;
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

        // Load theme-specific CSS if themes exist
        $themes = ['light', 'dark', 'relilab', 'foerbico'];
        foreach ($themes as $theme) {
            $theme_file = NOSTR_CALENDAR_BLOCK_DIR . 'assets/css/themes/' . $theme . '.css';
            if (file_exists($theme_file)) {
                wp_enqueue_style(
                    'nostr-calendar-block-theme-' . $theme,
                    NOSTR_CALENDAR_BLOCK_URL . 'assets/css/themes/' . $theme . '.css',
                    ['nostr-calendar-block-style'],
                    NOSTR_CALENDAR_BLOCK_VERSION
                );
            }
        }

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

        // Frontend script localization (i18n strings + config)
        wp_localize_script(
            'nostr-calendar-block-embed',
            'nostrCalendarBlockData',
            [
                'apiEndpoint' => 'https://n8n.rpi-virtuell.de/webhook/nostre_termine',
                'ajaxUrl' => admin_url('admin-ajax.php'),
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
                ]
            ]
        );
    }
}

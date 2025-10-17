<?php
/**
 * Main plugin class
 */

namespace Nostr_Calendar_Block;

class Plugin {
    private static $instance;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->setup_hooks();
        $this->load_dependencies();
    }

    private function setup_hooks() {
        // Register block
        add_action('init', [$this, 'register_block']);
        
        // Enqueue frontend assets
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        
        // Enqueue editor assets
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
    }

    private function load_dependencies() {
        // Load renderer
        require_once NOSTR_CALENDAR_BLOCK_DIR . 'includes/class-renderer.php';
    }

    public function register_block() {
        // Register block type with block.json
        register_block_type(
            NOSTR_CALENDAR_BLOCK_DIR . 'src/blocks/event-wall',
            [
                'render_callback' => [$this, 'render_block'],
                'script' => 'nostr-calendar-block-editor',
                'style' => 'nostr-calendar-block-style',
            ]
        );
    }

    public function render_block($attributes, $content) {
        return Renderer::render($attributes, $content);
    }

    public function enqueue_frontend_assets() {
        // Load theme CSS
        wp_enqueue_style(
            'nostr-calendar-block-style',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/css/event-wall.css',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION
        );

        // Load embed script
        wp_enqueue_script(
            'nostr-calendar-embed',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/embed-wall.js',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION,
            true
        );
    }

    public function enqueue_editor_assets() {
        // Editor specific assets
        wp_enqueue_script(
            'nostr-calendar-block-editor',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/js/editor.js',
            ['wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'],
            NOSTR_CALENDAR_BLOCK_VERSION,
            true
        );

        wp_enqueue_style(
            'nostr-calendar-block-editor',
            NOSTR_CALENDAR_BLOCK_URL . 'assets/css/editor.css',
            [],
            NOSTR_CALENDAR_BLOCK_VERSION
        );

        wp_localize_script('nostr-calendar-block-editor', 'nostrCalendarSettings', [
            'defaultTheme' => 'light',
            'availableThemes' => ['light', 'dark', 'relilab'],
        ]);
    }
}

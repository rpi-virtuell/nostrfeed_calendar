<?php
/**
 * Plugin Name: Nostr Calendar Block
 * Description: Gutenberg Block zum Anzeigen von Nostr Events als Event Wall
 * Version: 1.0.0
 * Author: rpi-virtuell
 * License: GPL-2.0-or-later
 * Text Domain: nostr-calendar-block
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Abort if this file is accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define constants
define('NOSTR_CALENDAR_BLOCK_DIR', plugin_dir_path(__FILE__));
define('NOSTR_CALENDAR_BLOCK_URL', plugin_dir_url(__FILE__));
define('NOSTR_CALENDAR_BLOCK_VERSION', '1.0.0');

// Load plugin files
require_once NOSTR_CALENDAR_BLOCK_DIR . 'includes/class-plugin.php';

// Initialize plugin on 'init' hook for proper block registration
function nostr_calendar_block_init() {
    Nostr_Calendar_Block::get_instance();
}
add_action('init', 'nostr_calendar_block_init', 5);

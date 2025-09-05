<?php
/**
 * Plugin Name: Nostrfeed Calendar Embed
 * Description: Einfacher Shortcode zum Einbinden der Nostr Event Wall via embed-wall.js
 * Version: 0.1
 * Author: rpi-virtuell
 */

if (!defined('ABSPATH')) exit;

/**
 * Shortcode: [nostrcal theme="relilab" filterbar=1 filter="tags:kita|grundschule" relays="wss://..." limit=1000 npub="npub..."]
 */
function nostrcal_shortcode($atts = []) {
    $defaults = [
        'theme' => 'default',
        'filterbar' => '1',
        'filter' => '',
        'relays' => '',
        'limit' => '',
        'npub' => '',
    ];
    $a = shortcode_atts($defaults, $atts, 'nostrcal');

    // normalize values
    $theme = sanitize_text_field($a['theme']);
    $show_filter = (string)$a['filterbar'];
    $show_filter = ($show_filter === '0' || strtolower($show_filter) === 'false') ? 'false' : 'true';

    $filter = sanitize_text_field($a['filter']);

    // relays and npub may be comma/space separated lists
    $relays_raw = preg_split('/[\s,]+/', trim($a['relays']));
    $relays_clean = array_filter(array_map('trim', $relays_raw));
    // sanitize each relay URL a bit
    $relays_clean = array_map(function($r){ return esc_attr($r); }, $relays_clean);
    $relays_str = implode(',', $relays_clean);

    $npub_raw = preg_split('/[\s,]+/', trim($a['npub']));
    $npub_clean = array_filter(array_map('trim', $npub_raw));
    $npub_clean = array_map(function($n){ return esc_attr($n); }, $npub_clean);
    $npub_str = implode(',', $npub_clean);

    $limit = intval($a['limit']);
    if ($limit <= 0) $limit = '';

    // build output
    $attrs = [];
    $attrs[] = 'data-theme="' . esc_attr($theme) . '"';
    $attrs[] = 'data-show-filterbar="' . esc_attr($show_filter) . '"';
    if ($filter !== '') $attrs[] = 'data-filter="' . esc_attr($filter) . '"';
    if ($relays_str !== '') $attrs[] = 'data-relays="' . esc_attr($relays_str) . '"';
    if ($limit !== '') $attrs[] = 'data-limit="' . esc_attr($limit) . '"';
    if ($npub_str !== '') $attrs[] = 'data-npub="' . esc_attr($npub_str) . '"';

    $attrs_str = implode("\n    ", $attrs);

    $script_url = plugins_url('embed-wall.js', __FILE__);
    $script_tag = '<script src="' . esc_url($script_url) . '"></script>';

    $html = "<div id=\"eventwall\"\n    $attrs_str\n    ></div>\n  " . $script_tag;

    return $html;
}
add_shortcode('nostrcal', 'nostrcal_shortcode');

?>

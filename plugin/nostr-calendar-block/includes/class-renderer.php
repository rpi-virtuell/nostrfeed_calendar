<?php
/**
 * Block renderer
 */

namespace Nostr_Calendar_Block;

class Renderer {
    public static function render($attributes, $content) {
        $defaults = [
            'theme' => 'light',
            'showFilterbar' => true,
            'filter' => '',
            'relays' => [],
            'limit' => 1000,
            'npub' => [],
        ];

        $attributes = wp_parse_args($attributes, $defaults);

        // Sanitize attributes
        $theme = sanitize_text_field($attributes['theme'] ?? 'light');
        $show_filterbar = (bool)($attributes['showFilterbar'] ?? true);
        $filter = sanitize_text_field($attributes['filter'] ?? '');
        $relays = is_array($attributes['relays']) ? $attributes['relays'] : [];
        $npub = is_array($attributes['npub']) ? $attributes['npub'] : [];
        $limit = intval($attributes['limit'] ?? 1000);

        // Sanitize arrays
        $relays = array_map('esc_attr', $relays);
        $npub = array_map('esc_attr', $npub);

        // Build data attributes
        $data_attrs = [
            'data-theme="' . esc_attr($theme) . '"',
            'data-show-filterbar="' . ($show_filterbar ? 'true' : 'false') . '"',
        ];

        if (!empty($filter)) {
            $data_attrs[] = 'data-filter="' . esc_attr($filter) . '"';
        }

        if (!empty($relays)) {
            $data_attrs[] = 'data-relays="' . esc_attr(implode(',', $relays)) . '"';
        }

        if (!empty($npub)) {
            $data_attrs[] = 'data-npub="' . esc_attr(implode(',', $npub)) . '"';
        }

        if ($limit > 0) {
            $data_attrs[] = 'data-limit="' . intval($limit) . '"';
        }

        $attrs_str = implode(' ', $data_attrs);

        $output = sprintf(
            '<div id="nostr-event-wall" class="nostr-event-wall" %s></div>',
            $attrs_str
        );

        return $output;
    }
}

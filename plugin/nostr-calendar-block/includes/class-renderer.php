<?php
/**
 * Block renderer
 */

class Nostr_Calendar_Block_Renderer {
    public static function render($attributes, $content) {
        error_log('[Nostr Calendar Renderer] render() called');
        error_log('[Nostr Calendar Renderer] Attributes: ' . print_r($attributes, true));
        
        $defaults = [
            'theme' => 'light',
            'showFilterbar' => true,
            'filter' => '',
            'relays' => ['wss://relay-rpi.edufeed.org/'],
            'limit' => 1000,
            'npub' => ['npub12j35qpeve33929kg64etvw9g9rzms4c8g5gnqta58yhjdc6wryfse3phmu'],
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

        error_log('[Nostr Calendar Renderer] Output HTML: ' . $output);

        return $output;
    }
}

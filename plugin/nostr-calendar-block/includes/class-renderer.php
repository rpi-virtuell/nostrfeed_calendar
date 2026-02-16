<?php
/**
 * Block renderer – supports multiple instances per page
 */

class Nostr_Calendar_Block_Renderer {
    private static $instance_count = 0;

    public static function render($attributes, $content) {
        self::$instance_count++;
        $instance_id = 'nostr-wall-' . self::$instance_count;

        $defaults = [
            'theme' => 'light',
            'showFilterbar' => true,
            'filter' => '',
            'relays' => ['wss://relay-rpi.edufeed.org/'],
            'npub' => ['npub12j35qpeve33929kg64etvw9g9rzms4c8g5gnqta58yhjdc6wryfse3phmu'],
            'limit' => 1000,
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
        $relays = array_map('sanitize_text_field', $relays);
        $npub = array_map('sanitize_text_field', $npub);

        // Build data attributes
        $data_attrs = [
            'data-instance-id="' . esc_attr($instance_id) . '"',
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

        $noscript_msg = esc_html__('JavaScript wird benötigt, um die Nostr Event Wall anzuzeigen.', 'nostr-calendar-block');

        $output = sprintf(
            '<div id="%s" class="nostr-event-wall" %s></div><noscript><p>%s</p></noscript>',
            esc_attr($instance_id),
            $attrs_str,
            $noscript_msg
        );

        return $output;
    }
}

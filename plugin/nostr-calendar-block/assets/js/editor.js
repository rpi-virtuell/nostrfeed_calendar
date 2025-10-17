/**
 * Nostr Calendar Block - Editor Script
 * Registers the block and provides edit interface via plain JavaScript
 */

(function() {
  'use strict';

  const { registerBlockType } = wp.blocks;
  const { InspectorControls, useBlockProps } = wp.blockEditor;
  const {
    PanelBody,
    SelectControl,
    ToggleControl,
    TextControl,
    RangeControl,
    Button
  } = wp.components;
  const { createElement: el, useState, Fragment } = wp.element;
  const { __ } = wp.i18n;

  const THEME_OPTIONS = [
    { label: 'Hell (Light)', value: 'light' },
    { label: 'Dunkel (Dark)', value: 'dark' },
    { label: 'ReliLab', value: 'relilab' }
  ];

  registerBlockType('nostr-calendar/event-wall', {
    title: 'Nostr Event Wall',
    description: 'Zeigt Events aus dem Nostr-Netzwerk an',
    category: 'widgets',
    icon: 'calendar',
    keywords: ['nostr', 'events', 'calendar'],

    supports: {
      html: false,
      customClassName: true,
      align: ['wide', 'full']
    },

    attributes: {
      theme: {
        type: 'string',
        default: 'light'
      },
      showFilterbar: {
        type: 'boolean',
        default: true
      },
      filter: {
        type: 'string',
        default: ''
      },
      relays: {
        type: 'array',
        default: ['wss://relay-rpi.edufeed.org/']
      },
      npub: {
        type: 'array',
        default: ['npub12j35qpeve33929kg64etvw9g9rzms4c8g5gnqta58yhjdc6wryfse3phmu']
      },
      limit: {
        type: 'number',
        default: 1000
      }
    },

    edit: function(props) {
      const { attributes, setAttributes } = props;
      const blockProps = useBlockProps();

      return el(
        Fragment,
        null,
        el(InspectorControls, null,
          // Design Panel
          el(PanelBody, { title: __('Design', 'nostr-calendar-block'), initialOpen: true },
            el(SelectControl, {
              label: __('Theme', 'nostr-calendar-block'),
              value: attributes.theme || 'light',
              options: THEME_OPTIONS,
              onChange: (value) => setAttributes({ theme: value })
            })
          ),

          // Display Settings Panel
          el(PanelBody, { title: __('Anzeige', 'nostr-calendar-block'), initialOpen: true },
            el(ToggleControl, {
              label: __('Filterleiste anzeigen', 'nostr-calendar-block'),
              checked: attributes.showFilterbar !== false,
              onChange: (value) => setAttributes({ showFilterbar: value })
            }),
            el(RangeControl, {
              label: __('Maximale Anzahl Events', 'nostr-calendar-block'),
              value: attributes.limit || 1000,
              onChange: (value) => setAttributes({ limit: value }),
              min: 1,
              max: 10000,
              step: 100
            }),
            el(TextControl, {
              label: __('Filter (Optional)', 'nostr-calendar-block'),
              value: attributes.filter || '',
              onChange: (value) => setAttributes({ filter: value }),
              help: __('z.B. tags:kita|grundschule', 'nostr-calendar-block')
            })
          ),

          // Relays Panel
          el(PanelBody, { title: __('Relays', 'nostr-calendar-block'), initialOpen: false },
            (attributes.relays || []).map((relay, index) =>
              el('div', { key: index, style: { marginBottom: '10px' } },
                el(TextControl, {
                  label: `${__('Relay', 'nostr-calendar-block')} ${index + 1}`,
                  value: relay,
                  onChange: (value) => {
                    const relays = [...(attributes.relays || [])];
                    relays[index] = value;
                    setAttributes({ relays });
                  },
                  placeholder: 'wss://relay.example.com'
                }),
                el(Button, {
                  isDestructive: true,
                  isSmall: true,
                  onClick: () => {
                    const relays = [...(attributes.relays || [])];
                    relays.splice(index, 1);
                    setAttributes({ relays });
                  }
                }, __('Entfernen', 'nostr-calendar-block'))
              )
            ),
            el(Button, {
              isPrimary: true,
              onClick: () => {
                const relays = [...(attributes.relays || []), ''];
                setAttributes({ relays });
              }
            }, __('+ Relay hinzufügen', 'nostr-calendar-block'))
          ),

          // Authors Panel
          el(PanelBody, { title: __('Autoren (npub)', 'nostr-calendar-block'), initialOpen: false },
            (attributes.npub || []).map((npub, index) =>
              el('div', { key: index, style: { marginBottom: '10px' } },
                el(TextControl, {
                  label: `${__('npub', 'nostr-calendar-block')} ${index + 1}`,
                  value: npub,
                  onChange: (value) => {
                    const npubs = [...(attributes.npub || [])];
                    npubs[index] = value;
                    setAttributes({ npub: npubs });
                  },
                  placeholder: 'npub1...'
                }),
                el(Button, {
                  isDestructive: true,
                  isSmall: true,
                  onClick: () => {
                    const npubs = [...(attributes.npub || [])];
                    npubs.splice(index, 1);
                    setAttributes({ npub: npubs });
                  }
                }, __('Entfernen', 'nostr-calendar-block'))
              )
            ),
            el(Button, {
              isPrimary: true,
              onClick: () => {
                const npubs = [...(attributes.npub || []), ''];
                setAttributes({ npub: npubs });
              }
            }, __('+ Autor hinzufügen', 'nostr-calendar-block'))
          )
        ),

        // Block preview in editor
        el('div', blockProps,
          el('div', { className: 'nostr-event-wall-preview' },
            el('div', { className: 'preview-header' },
              el('span', { className: 'preview-icon' }, '📅'),
              el('span', { className: 'preview-title' }, 'Nostr Event Wall')
            ),
            el('div', { className: 'preview-info' },
              el('p', null,
                __('Theme:', 'nostr-calendar-block'),
                ' ',
                el('strong', null, attributes.theme || 'light')
              ),
              el('p', null,
                __('Filterleiste:', 'nostr-calendar-block'),
                ' ',
                el('strong', null, attributes.showFilterbar !== false ? __('Ja', 'nostr-calendar-block') : __('Nein', 'nostr-calendar-block'))
              ),
              attributes.filter && el('p', null,
                __('Filter:', 'nostr-calendar-block'),
                ' ',
                el('strong', null, attributes.filter)
              ),
              el('p', null,
                __('Max. Events:', 'nostr-calendar-block'),
                ' ',
                el('strong', null, attributes.limit || 1000)
              ),
              (attributes.relays || []).length > 0 && el('p', null,
                __('Relays:', 'nostr-calendar-block'),
                ' ',
                el('strong', null, (attributes.relays || []).length)
              ),
              (attributes.npub || []).length > 0 && el('p', null,
                __('Autoren:', 'nostr-calendar-block'),
                ' ',
                el('strong', null, (attributes.npub || []).length)
              )
            )
          )
        )
      );
    },

    save: () => null  // Dynamic rendering via PHP
  });
})();

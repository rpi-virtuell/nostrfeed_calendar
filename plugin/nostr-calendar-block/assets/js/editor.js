import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  SelectControl,
  ToggleControl,
  TextControl,
  RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.css';

const THEME_OPTIONS = [
  { label: 'Hell (Light)', value: 'light' },
  { label: 'Dunkel (Dark)', value: 'dark' },
  { label: 'ReliLab', value: 'relilab' },
];

registerBlockType('nostr-calendar/event-wall', {
  edit: (props) => {
    const { attributes, setAttributes } = props;
    const blockProps = useBlockProps();

    const handleAddRelay = () => {
      setAttributes({
        relays: [...(attributes.relays || []), ''],
      });
    };

    const handleRemoveRelay = (index) => {
      const relays = [...(attributes.relays || [])];
      relays.splice(index, 1);
      setAttributes({ relays });
    };

    const handleRelayChange = (index, value) => {
      const relays = [...(attributes.relays || [])];
      relays[index] = value;
      setAttributes({ relays });
    };

    const handleAddNpub = () => {
      setAttributes({
        npub: [...(attributes.npub || []), ''],
      });
    };

    const handleRemoveNpub = (index) => {
      const npub = [...(attributes.npub || [])];
      npub.splice(index, 1);
      setAttributes({ npub });
    };

    const handleNpubChange = (index, value) => {
      const npub = [...(attributes.npub || [])];
      npub[index] = value;
      setAttributes({ npub });
    };

    return (
      <>
        <InspectorControls>
          {/* Theme Settings */}
          <PanelBody title={__('Design', 'nostr-calendar-block')} initialOpen={true}>
            <SelectControl
              label={__('Theme', 'nostr-calendar-block')}
              value={attributes.theme || 'light'}
              options={THEME_OPTIONS}
              onChange={(value) => setAttributes({ theme: value })}
            />
          </PanelBody>

          {/* Display Settings */}
          <PanelBody title={__('Anzeige', 'nostr-calendar-block')} initialOpen={true}>
            <ToggleControl
              label={__('Filterleiste anzeigen', 'nostr-calendar-block')}
              checked={attributes.showFilterbar !== false}
              onChange={(value) => setAttributes({ showFilterbar: value })}
            />

            <RangeControl
              label={__('Maximale Anzahl Events', 'nostr-calendar-block')}
              value={attributes.limit || 1000}
              onChange={(value) => setAttributes({ limit: value })}
              min={1}
              max={10000}
              step={100}
            />

            <TextControl
              label={__('Filter (Optional)', 'nostr-calendar-block')}
              value={attributes.filter || ''}
              onChange={(value) => setAttributes({ filter: value })}
              help={__('z.B. tags:kita|grundschule', 'nostr-calendar-block')}
            />
          </PanelBody>

          {/* Relay Settings */}
          <PanelBody title={__('Relays', 'nostr-calendar-block')} initialOpen={false}>
            {(attributes.relays || []).map((relay, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <TextControl
                  label={`${__('Relay', 'nostr-calendar-block')} ${index + 1}`}
                  value={relay}
                  onChange={(value) => handleRelayChange(index, value)}
                  placeholder="wss://relay.example.com"
                />
                <button
                  className="button button-link-delete"
                  onClick={() => handleRemoveRelay(index)}
                >
                  {__('Entfernen', 'nostr-calendar-block')}
                </button>
              </div>
            ))}
            <button className="button" onClick={handleAddRelay}>
              {__('+ Relay hinzufügen', 'nostr-calendar-block')}
            </button>
          </PanelBody>

          {/* Author (npub) Settings */}
          <PanelBody title={__('Autoren (npub)', 'nostr-calendar-block')} initialOpen={false}>
            {(attributes.npub || []).map((npub, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <TextControl
                  label={`${__('npub', 'nostr-calendar-block')} ${index + 1}`}
                  value={npub}
                  onChange={(value) => handleNpubChange(index, value)}
                  placeholder="npub1..."
                />
                <button
                  className="button button-link-delete"
                  onClick={() => handleRemoveNpub(index)}
                >
                  {__('Entfernen', 'nostr-calendar-block')}
                </button>
              </div>
            ))}
            <button className="button" onClick={handleAddNpub}>
              {__('+ Autor hinzufügen', 'nostr-calendar-block')}
            </button>
          </PanelBody>
        </InspectorControls>

        <div {...blockProps}>
          <div className="nostr-event-wall-preview">
            <div className="preview-header">
              <span className="preview-icon">📅</span>
              <span className="preview-title">Nostr Event Wall</span>
            </div>
            <div className="preview-info">
              <p>{__('Theme:', 'nostr-calendar-block')} <strong>{attributes.theme || 'light'}</strong></p>
              <p>{__('Filterleiste:', 'nostr-calendar-block')} <strong>{attributes.showFilterbar !== false ? __('Ja', 'nostr-calendar-block') : __('Nein', 'nostr-calendar-block')}</strong></p>
              {attributes.filter && <p>{__('Filter:', 'nostr-calendar-block')} <strong>{attributes.filter}</strong></p>}
              <p>{__('Max. Events:', 'nostr-calendar-block')} <strong>{attributes.limit || 1000}</strong></p>
              {(attributes.relays || []).length > 0 && (
                <p>{__('Relays:', 'nostr-calendar-block')} <strong>{(attributes.relays || []).length}</strong></p>
              )}
              {(attributes.npub || []).length > 0 && (
                <p>{__('Autoren:', 'nostr-calendar-block')} <strong>{(attributes.npub || []).length}</strong></p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
});

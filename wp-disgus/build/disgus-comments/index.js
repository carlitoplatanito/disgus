(function (wp) {
	var el = wp.element.createElement;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var __ = wp.i18n.__;

	registerBlockType('disgus/comments', {
		edit: function (props) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;

			return el(
				'div',
				{ className: props.className },
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Settings', 'disgus') },
						el(TextControl, {
							label: __('Nostr Public Key', 'disgus'),
							value: attributes.pubkey || '',
							onChange: function (value) { setAttributes({ pubkey: value }); },
						}),
						el(TextControl, {
							label: __('Relays (comma-separated)', 'disgus'),
							value: attributes.relays || '',
							onChange: function (value) { setAttributes({ relays: value }); },
						}),
						el(TextControl, {
							label: __('Root Event ID', 'disgus'),
							value: attributes.eventId || '',
							onChange: function (value) { setAttributes({ eventId: value }); },
						})
					)
				),
				el(
					'div',
					{ className: 'disgus-block-placeholder', style: { padding: '20px', background: '#f0f0f1', borderRadius: '4px', textAlign: 'center' } },
					el('p', { style: { margin: '0', fontWeight: '600' } }, __('Disgus Comments', 'disgus')),
					el('p', { style: { margin: '4px 0 0', fontSize: '13px', color: '#666' } },
						attributes.pubkey
							? __('Configured. Save and view the page to see comments.', 'disgus')
							: __('Configure in the block settings panel →', 'disgus')
					)
				)
			);
		},
		save: function () {
			return null;
		},
	});
})(window.wp);

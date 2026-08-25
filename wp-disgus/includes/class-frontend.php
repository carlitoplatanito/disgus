<?php
/**
 * Frontend integration for Disgus.
 *
 * @package Disgus
 */

namespace Disgus;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueues the script and replaces WP comments.
 *
 * @since 1.0.0
 */
class Frontend {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_script' ) );
		add_filter( 'script_loader_tag', array( $this, 'add_defer_attribute' ), 10, 2 );

		if ( $this->should_replace_comments() ) {
			add_filter( 'comments_open', '__return_false', 10, 2 );
			add_filter( 'pings_open', '__return_false', 10, 2 );
			add_filter( 'comments_array', '__return_empty_array', 10, 2 );
			add_filter( 'comments_template', array( $this, 'render_comments' ), 999 );
		}
	}

	/**
	 * Whether the plugin should replace native WP comments.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	private function should_replace_comments() {
		$settings = \disgus_get_settings();
		return ! empty( $settings['replace_comments'] ) && ! empty( $settings['pubkey'] );
	}

	/**
	 * Enqueue the Disgus JavaScript bundle.
	 *
	 * Loads on singular pages (posts, pages) when replacing comments,
	 * or on any page when the script may be needed by shortcodes/blocks.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_script() {
		if ( $this->should_replace_comments() && ! is_singular() ) {
			return;
		}

		$settings = \disgus_get_settings();

		if ( empty( $settings['pubkey'] ) ) {
			return;
		}

		wp_enqueue_script(
			'disgus',
			$settings['script_url'],
			array(),
			DISGUS_VERSION,
			true
		);
	}

	/**
	 * Add defer attribute to the Disgus script tag.
	 *
	 * @since 1.0.0
	 * @param string $tag    Script tag HTML.
	 * @param string $handle Script handle.
	 * @return string
	 */
	public function add_defer_attribute( $tag, $handle ) {
		if ( 'disgus' === $handle ) {
			$tag = str_replace( '<script ', '<script defer ', $tag );
		}
		return $tag;
	}

	/**
	 * Replace the WP comments template with the Disgus template.
	 *
	 * @since 1.0.0
	 * @param string $template The default comments template path.
	 * @return string
	 */
	public function render_comments( $template ) {
		$settings = \disgus_get_settings();

		if ( empty( $settings['pubkey'] ) ) {
			return $template;
		}

		return DISGUS_PLUGIN_DIR . 'build/comments-template.php';
	}

	/**
	 * Build the <disgus-comments> HTML tag.
	 *
	 * @since 1.0.0
	 * @param array $atts Optional overrides for pubkey, relays, event_id.
	 * @return string
	 */
	public function render_tag( $atts = array() ) {
		$settings = \disgus_get_settings();

		$pubkey   = ! empty( $atts['pubkey'] ) ? $atts['pubkey'] : $settings['pubkey'];
		$relays   = ! empty( $atts['relays'] ) ? $atts['relays'] : $settings['relays'];
		$event_id = ! empty( $atts['event_id'] ) ? $atts['event_id'] : $settings['event_id'];

		if ( empty( $pubkey ) ) {
			return '';
		}

		$relay_list = implode( ',', array_map( 'trim', explode( "\n", $relays ) ) );

		$attr = sprintf(
			'pubkey="%s" relays="%s"',
			esc_attr( $pubkey ),
			esc_attr( $relay_list )
		);

		if ( ! empty( $event_id ) ) {
			$attr .= sprintf( ' event-id="%s"', esc_attr( $event_id ) );
		}

		return '<disgus-comments ' . $attr . '></disgus-comments>';
	}
}

<?php
/**
 * Shortcode for Disgus comments.
 *
 * @package Disgus
 */

namespace Disgus;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and handles the [disgus_comments] shortcode.
 *
 * @since 1.0.0
 */
class Shortcode {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_shortcode( 'disgus_comments', array( $this, 'render' ) );
	}

	/**
	 * Shortcode handler.
	 *
	 * Usage: [disgus_comments pubkey="..." relays="..." event_id="..."]
	 * Falls back to plugin settings for any omitted attribute.
	 *
	 * @since 1.0.0
	 * @param array  $atts Shortcode attributes.
	 * @param string $content Enclosed content (unused).
	 * @param string $tag Shortcode tag name.
	 * @return string
	 */
	public function render( $atts = array(), $content = null, $tag = '' ) {
		$atts = shortcode_atts(
			array(
				'pubkey'   => '',
				'relays'   => '',
				'event_id' => '',
			),
			$atts,
			$tag
		);

		$frontend = new Frontend();
		return $frontend->render_tag( $atts );
	}
}

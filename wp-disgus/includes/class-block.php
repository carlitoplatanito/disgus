<?php
/**
 * Gutenberg block for Disgus comments.
 *
 * @package Disgus
 */

namespace Disgus;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and renders the disgus/comments block.
 *
 * @since 1.0.0
 */
class Block {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register' ) );
	}

	/**
	 * Register the block type.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register() {
		register_block_type( DISGUS_PLUGIN_DIR . 'build/disgus-comments' );
	}
}

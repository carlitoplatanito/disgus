<?php
/**
 * Template for displaying Disgus comments in place of native WP comments.
 *
 * @package Disgus
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$frontend = new Disgus\Frontend();
echo $frontend->render_tag(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

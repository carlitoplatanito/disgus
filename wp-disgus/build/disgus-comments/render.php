<?php
/**
 * Server-side render callback for the disgus/comments block.
 *
 * @package Disgus
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pubkey   = isset( $attributes['pubkey'] ) ? $attributes['pubkey'] : '';
$relays   = isset( $attributes['relays'] ) ? $attributes['relays'] : '';
$event_id = isset( $attributes['eventId'] ) ? $attributes['eventId'] : '';

$frontend = new Disgus\Frontend();
echo $frontend->render_tag( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	array(
		'pubkey'   => $pubkey,
		'relays'   => $relays,
		'event_id' => $event_id,
	)
);

<?php
/**
 * Cleanup on plugin uninstall.
 *
 * @package Disgus
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'disgus_settings' );

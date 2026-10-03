<?php
/**
 * Plugin Name:       Disgus Comments
 * Plugin URI:        https://github.com/carlitoplatanito/disgus
 * Description:       Nostr-powered comments for your WordPress site. Like Disqus, but Nostier.
 * Version:           0.1.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Carlito Platanito
 * Author URI:        https://carlitoplatanito.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       disgus
 * Domain Path:       /languages
 *
 * @package Disgus
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DISGUS_VERSION', '0.1.0' );
define( 'DISGUS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DISGUS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'DISGUS_SCRIPT_URL', DISGUS_PLUGIN_URL . 'assets/disgus.js' );

spl_autoload_register(
	function ( $class ) {
		$prefix = 'Disgus\\';
		if ( 0 !== strncmp( $class, $prefix, strlen( $prefix ) ) ) {
			return;
		}

		$relative_class = substr( $class, strlen( $prefix ) );
		$relative_class = str_replace( '\\', '/', $relative_class );
		$relative_class = preg_replace( '/([a-z])([A-Z])/', '$1-$2', $relative_class );
		$relative_class = strtolower( $relative_class );

		$file = DISGUS_PLUGIN_DIR . 'includes/class-' . $relative_class . '.php';

		if ( file_exists( $file ) ) {
			require_once $file;
		}
	}
);

/**
 * Retrieve plugin settings with defaults.
 *
 * @since 1.0.0
 * @return array
 */
function disgus_get_settings() {
	return wp_parse_args(
		get_option( 'disgus_settings', array() ),
		array(
			'pubkey'           => '',
			'relays'           => "wss://brb.io\nwss://relay.damus.io",
			'event_id'         => '',
			'replace_comments' => 1,
			'script_url'       => DISGUS_SCRIPT_URL,
		)
	);
}

add_action(
	'plugins_loaded',
	function () {
		new Disgus\Settings();
		new Disgus\Frontend();
		new Disgus\Shortcode();
		new Disgus\Block();
	}
);

add_filter(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function ( $actions ) {
		$settings_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( admin_url( 'options-general.php?page=disgus' ) ),
			esc_html__( 'Settings', 'disgus' )
		);
		array_unshift( $actions, $settings_link );
		return $actions;
	}
);

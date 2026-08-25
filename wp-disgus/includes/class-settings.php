<?php
/**
 * Settings page for Disgus.
 *
 * @package Disgus
 */

namespace Disgus;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages the WordPress admin settings page.
 *
 * @since 1.0.0
 */
class Settings {

	/**
	 * Option name stored in wp_options.
	 *
	 * @var string
	 */
	const OPTION_NAME = 'disgus_settings';

	/**
	 * Menu slug for the settings page.
	 *
	 * @var string
	 */
	const MENU_SLUG = 'disgus';

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Add the settings page under Settings menu.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function add_admin_menu() {
		add_options_page(
			__( 'Disgus Comments', 'disgus' ),
			__( 'Disgus', 'disgus' ),
			'manage_options',
			self::MENU_SLUG,
			array( $this, 'render_page' )
		);
	}

	/**
	 * Register settings, sections, and fields.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_settings() {
		register_setting(
			self::OPTION_NAME,
			self::OPTION_NAME,
			array(
				'sanitize_callback' => array( $this, 'sanitize' ),
			)
		);

		add_settings_section(
			'disgus_general',
			__( 'Nostr Connection', 'disgus' ),
			array( $this, 'render_section_heading' ),
			self::MENU_SLUG
		);

		add_settings_field(
			'pubkey',
			__( 'Nostr Public Key', 'disgus' ),
			array( $this, 'render_field_pubkey' ),
			self::MENU_SLUG,
			'disgus_general'
		);

		add_settings_field(
			'relays',
			__( 'Relays', 'disgus' ),
			array( $this, 'render_field_relays' ),
			self::MENU_SLUG,
			'disgus_general'
		);

		add_settings_field(
			'event_id',
			__( 'Root Event ID', 'disgus' ),
			array( $this, 'render_field_event_id' ),
			self::MENU_SLUG,
			'disgus_general'
		);

		add_settings_section(
			'disgus_behaviour',
			__( 'Behaviour', 'disgus' ),
			'__return_empty_string',
			self::MENU_SLUG
		);

		add_settings_field(
			'replace_comments',
			__( 'Replace WordPress Comments', 'disgus' ),
			array( $this, 'render_field_replace_comments' ),
			self::MENU_SLUG,
			'disgus_behaviour'
		);

		add_settings_section(
			'disgus_advanced',
			__( 'Advanced', 'disgus' ),
			'__return_empty_string',
			self::MENU_SLUG
		);

		add_settings_field(
			'script_url',
			__( 'Script URL', 'disgus' ),
			array( $this, 'render_field_script_url' ),
			self::MENU_SLUG,
			'disgus_advanced'
		);
	}

	/**
	 * Sanitize submitted settings.
	 *
	 * @since 1.0.0
	 * @param array $input Raw input.
	 * @return array
	 */
	public function sanitize( $input ) {
		$settings = \disgus_get_settings();

		if ( isset( $input['pubkey'] ) ) {
			$settings['pubkey'] = sanitize_text_field( $input['pubkey'] );
		}

		if ( isset( $input['relays'] ) ) {
			$lines = explode( "\n", $input['relays'] );
			$lines = array_map( 'trim', $lines );
			$lines = array_filter( $lines );
			$lines = array_map( 'esc_url_raw', $lines );
			$settings['relays'] = implode( "\n", $lines );
		}

		if ( isset( $input['event_id'] ) ) {
			$settings['event_id'] = sanitize_text_field( $input['event_id'] );
		}

		$settings['replace_comments'] = isset( $input['replace_comments'] ) ? 1 : 0;

		if ( isset( $input['script_url'] ) ) {
			$settings['script_url'] = esc_url_raw( $input['script_url'] );
		}

		return $settings;
	}

	/**
	 * Render the settings page heading.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_section_heading() {
		echo '<p>';
		esc_html_e( 'Configure your Nostr public key and relays to enable Disgus comments on your site.', 'disgus' );
		echo '</p>';
	}

	/**
	 * Render the pubkey field.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_field_pubkey() {
		$settings = \disgus_get_settings();
		?>
		<input
			type="text"
			id="disgus-pubkey"
			name="disgus_settings[pubkey]"
			value="<?php echo esc_attr( $settings['pubkey'] ); ?>"
			class="regular-text code"
			placeholder="b7c1a5ef..."
		/>
		<p class="description">
			<?php esc_html_e( 'Your Nostr public key (hex format). Required for comment notifications.', 'disgus' ); ?>
		</p>
		<?php
	}

	/**
	 * Render the relays field.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_field_relays() {
		$settings = \disgus_get_settings();
		?>
		<textarea
			id="disgus-relays"
			name="disgus_settings[relays]"
			class="large-text code"
			rows="4"
		><?php echo esc_textarea( $settings['relays'] ); ?></textarea>
		<p class="description">
			<?php esc_html_e( 'One Nostr relay URL per line.', 'disgus' ); ?>
		</p>
		<?php
	}

	/**
	 * Render the event_id field.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_field_event_id() {
		$settings = \disgus_get_settings();
		?>
		<input
			type="text"
			id="disgus-event-id"
			name="disgus_settings[event_id]"
			value="<?php echo esc_attr( $settings['event_id'] ); ?>"
			class="regular-text code"
		/>
		<p class="description">
			<?php esc_html_e( 'Optional. If you already know the root event ID for this site, enter it here to skip auto-discovery.', 'disgus' ); ?>
		</p>
		<?php
	}

	/**
	 * Render the replace_comments checkbox.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_field_replace_comments() {
		$settings = \disgus_get_settings();
		?>
		<label for="disgus-replace-comments">
			<input
				type="checkbox"
				id="disgus-replace-comments"
				name="disgus_settings[replace_comments]"
				value="1"
				<?php checked( 1, $settings['replace_comments'] ); ?>
			/>
			<?php esc_html_e( 'Replace the default WordPress comment form with Disgus on posts and pages.', 'disgus' ); ?>
		</label>
		<?php
	}

	/**
	 * Render the script_url field.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_field_script_url() {
		$settings = \disgus_get_settings();
		?>
		<input
			type="url"
			id="disgus-script-url"
			name="disgus_settings[script_url]"
			value="<?php echo esc_attr( $settings['script_url'] ); ?>"
			class="regular-text code"
		/>
		<p class="description">
			<?php esc_html_e( 'URL to the Disgus JavaScript bundle. Override to use a self-hosted copy or a specific version.', 'disgus' ); ?>
		</p>
		<?php
	}

	/**
	 * Render the full settings page.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( isset( $_GET['settings-updated'] ) ) {
			add_settings_error(
				'disgus_messages',
				'disgus_message',
				__( 'Settings saved.', 'disgus' ),
				'updated'
			);
		}

		settings_errors( 'disgus_messages' );
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::OPTION_NAME );
				do_settings_sections( self::MENU_SLUG );
				submit_button( __( 'Save Settings', 'disgus' ) );
				?>
			</form>
		</div>
		<?php
	}
}

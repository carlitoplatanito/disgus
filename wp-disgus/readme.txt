=== Disgus Comments ===
Contributors: carlitoplatanito
Tags: comments, nostr, disqus, nostr-protocol
Requires at least: 5.8
Tested up to: 6.7
Stable tag: 0.1.0
Requires PHP: 7.4
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Nostr-powered comments for WordPress. Like Disqus, but Nostier.

== Description ==

Disgus replaces your WordPress comment system with comments backed by the Nostr open protocol. No database, no moderation queue — comments live on the Nostr network.

**Features:**

* Drop-in replacement for WordPress comments on posts and pages.
* Use a NIP-07 browser extension (e.g. Alby) to sign in, or post as a random guest.
* Comments are stored on Nostr relays — you own your data.
* Optional Gutenberg block and shortcode for manual placement.
* Fully self-contained — no external CDN dependencies.
* Styles are bundled inline — no extra CSS files to load.

== Installation ==

1. Upload the `wp-disgus` folder to `/wp-content/plugins/`.
2. Activate the plugin through the Plugins screen.
3. Go to **Settings → Disgus** and enter your Nostr public key and relay URLs.
4. Save — comments will automatically appear on your posts and pages.

Alternatively, use `[disgus_comments]` in any post or insert the **Disgus Comments** block in the editor.

== Frequently Asked Questions ==

= Do I need a Nostr account? =

Yes. You need a Nostr public key (hex format) and at least one relay to publish to.

= Can I use a NIP-07 browser extension? =

Yes. Disgus supports NIP-07 for login. Extensions like Alby work out of the box.

= Will existing WordPress comments still show? =

No. When "Replace WordPress Comments" is enabled in settings, the native comment system is disabled and Disgus takes over.

= Can I use Disgus alongside other comment systems? =

Yes. Disable "Replace WordPress Comments" in settings and use the shortcode or block to place it where you want.

== Screenshots ==

1. The Disgus settings page in WordPress admin.

== Changelog ==

= 0.1.0 =
* Initial release.

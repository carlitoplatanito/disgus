## 2025-05-18 - Sanitize User Profile Picture URLs
**Vulnerability:** Untrusted user profile picture URLs (Nostr metadata) set directly on `<img>` tags without scheme validation could allow execution of unexpected URI schemes (e.g., `javascript:`, `data:`).
**Learning:** External user profiles from decentralized networks like Nostr must always be sanitized before rendering URLs in JSX attributes.
**Prevention:** Use a `sanitizeUrl` helper to restrict allowed schemes strictly to `http:`, `https:`, `//`, `/`, and `blob:`.

# Sentinel's Journal - Critical Security Learnings

## 2026-11-03 - Disallowing SVG data URIs in user avatar URL sanitization

**Vulnerability:** `sanitizeUrl` permitted any data URI starting with `data:image/` via `/^data:image\//i`. Nostr profile metadata is untrusted user input retrieved from public relays. Malicious user profiles could provide `data:image/svg+xml;...` containing embedded `<script>` or event handlers, or pseudo-image MIME types. If opened in a new tab, navigated to, or rendered without strict sanitization, SVG data URIs can execute arbitrary JavaScript in the user's origin context.
**Learning:** `data:image/*` is overly broad because SVG is an XML document type that supports scripting. Unlike raster image formats (PNG, JPEG, GIF, WebP), SVG data URIs can execute JavaScript when navigated or embedded in contexts that process active content.
**Prevention:** Restrict allowed `data:` URIs specifically to safe raster image MIME types (`image/png`, `image/jpeg`, `image/gif`, `image/webp`) and require valid base64 encoding structure.

## 2025-02-17 - Empty State and Avatar Accessibility
**Learning:** Component empty states should render accessible and helpful feedback text rather than returning `null` to avoid blank content gaps. User avatars in comment feeds require fallback `alt` text using user display names or pubkeys for screen reader clarity.
**Action:** Always provide an empty state container with proper contrast and aria attributes when rendering list components, and supply fallback `alt` attributes on user avatar images.

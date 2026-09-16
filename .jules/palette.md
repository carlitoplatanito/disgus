## 2025-05-18 - Interactive Elements and Image Accessibility in Nostr UI
**Learning:** Icon-only external links, textareas without visible labels, and profile avatars missing `alt` attributes significantly impact screen reader usability and keyboard navigation in comment widgets.
**Action:** Always include explicit `aria-label`s on unlabeled inputs/links, `alt` attributes on user avatar images, and `focus-visible` ring utilities on interactive buttons.

# Palette's Journal - Critical Learnings

## 2026-08-22 - Accessibility and focus-visible indicators in Disgus UI components

**Learning:** Micro-UX and screen-reader accessibility in lightweight comment widgets often suffer from missing `alt` attributes on user avatars, unlabelled textareas, and hidden keyboard focus indicators on custom buttons and menu buttons.
**Action:** Always verify `aria-label` on form controls, ensure `alt` attributes on all avatar images (with fallback display text), and append Tailwind `focus-visible:ring-2 focus-visible:outline-none` styles to reusable `Button` and `Menu.Button` elements.

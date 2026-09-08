# Palette UX Journal

## 2025-05-18 - Accessibility & Keyboard Interaction Enhancements for Disgus
**Learning:** Embedded comment widgets (like Disgus) often strip visual focus rings and missing form aria-labels/disabled states, which creates poor screen reader and keyboard-only navigation experiences. Adding explicit `focus-visible` ring indicators, `aria-label` to textarea, disabling empty comment submission, and adding alt attributes to avatars provides clean visual and assistive feedback without breaking widget layout.
**Action:** When working on widget components, always ensure interactive components (buttons, links, textareas, menus) have visible `focus-visible` focus styles and explicit accessible names/alt attributes.

## 2025-02-18 - Input Labels, Image Alt Attributes, and Focus Indicators
**Learning:** Components with `focus:outline-none` and icon-based components or user avatars frequently miss `focus-visible` ring indicators, `alt` attributes, and `aria-label`/`<label>` tags for screen reader accessibility.
**Action:** When working on form controls or custom UI components, ensure inputs have accessible labels (`sr-only` or visible), avatars have `alt` attributes, and buttons/inputs have `focus-visible:ring-2` styles for keyboard navigation.

## 2026-09-06 - Accessible Comment Form and Interactive Icon Buttons
**Learning:** Icon-only interactive elements like comment action menus (ellipsis icons) and avatar placeholders need explicit `aria-label` attributes and keyboard focus management (`focus:ring-2`) to ensure screen readers and keyboard users can navigate comment threads effectively.
**Action:** When adding or auditing icon-based UI elements, wrap clickable SVG icons in semantic `<button>` elements with clear `aria-label`s and visible focus states.

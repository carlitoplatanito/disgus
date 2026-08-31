## 2025-05-18 - Accessibility for Comment Input and Buttons
**Learning:** Textareas without associated `<label>` elements hinder screen reader navigation in comment widgets. Adding `sr-only` labels and visible `focus-visible:ring-2` styles ensures full keyboard and screen reader accessibility without affecting existing visual designs.
**Action:** Always provide explicit labels with `htmlFor` for form inputs and ensure `focus-visible` styles are set on interactive components.

## 2025-05-18 - Form-level `aria-disabled` breaks child input interactivity and screen reader semantics

**Learning:** Setting `aria-disabled="true"` on a top-level `<form>` element cascades to child form controls in screen readers and accessibility test automation tools (like Playwright), marking inputs as non-editable. Disabled states should be applied directly to individual action controls (e.g., submit buttons) rather than container form elements.

**Action:** Avoid applying `aria-disabled` or similar state attributes on structural `<form>` containers when inputs inside remain user-editable.

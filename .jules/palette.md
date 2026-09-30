## 2025-05-18 - Component Avatar and Form Field Accessibility
**Learning:** In Disgus, avatar `<img>` tags in comments and user navigation menus were missing `alt` attributes, causing screen readers to announce full image URLs. Additionally, textareas lacked explicit labels or `aria-label` attributes.
**Action:** Always provide descriptive `alt` text for user avatars (or `alt=""` for decorative ones paired with text names) and explicit `aria-label`s on comment form inputs.

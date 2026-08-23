## 2025-08-23 - Accessibility attributes for icon/image-based user components
**Learning:** Adding fallback-aware `alt` text (`author.display_name || author.name || pubkey`) on user profile avatars and explicit `aria-label` attributes on key interactive form inputs significantly improves screen reader navigation in comment applications without altering layout styles.
**Action:** Always check `<img>` and form control JSX elements for missing `alt` or `aria-label` attributes and ensure robust fallback string formatting for dynamic user identifiers.

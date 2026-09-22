# Palette's Journal - Critical Learnings

## 2026-08-22 - Empty state contrast and screen reader accessibility for form inputs

**Learning:** Replacing silent `null` renders for empty comment feeds with descriptive empty state text improves user feedback. Ensure empty state text uses high-contrast text color classes (`text-gray-300` vs dark backgrounds) to satisfy WCAG AA contrast ratios (minimum 4.5:1). Adding explicit `aria-label` to form input controls ensures screen reader navigation clarity.
**Action:** Always verify contrast against parent container background colors when adding helper or empty state text.

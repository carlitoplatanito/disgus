# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-08-22 - Avatar alt text and comment form accessibility

**Learning:** Omitting `alt` attributes on user avatars in comment threads causes screen readers to announce verbose raw image URLs or hashes. In addition, unlabelled form textareas and submit buttons lacking disabled/loading states lead to double-submissions and poor assistive technology experiences.
**Action:** Always provide fallback display name/pubkey `alt` attributes for avatar images and ensure textareas have `aria-label` and submit buttons reflect loading/disabled state.

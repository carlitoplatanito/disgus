## 2026-08-22 - Icon and Avatar Accessibility in Disgus UI
**Learning:** Component icons from `@heroicons/react` lack `aria-hidden="true"` by default, leading to noisy screen reader reads. User avatar images (`<img>`) were also missing `alt` fallback text.
**Action:** Always mark decorative icons with `aria-hidden="true"` and provide descriptive `alt` attributes on user avatars (using display name, username, pubkey, or "User avatar" fallback).

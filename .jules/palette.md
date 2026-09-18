## 2025-05-18 - Accessible User Avatars & Form Controls

**Learning:** Component images (like user avatars) without `alt` text and unlabelled `<textarea>` inputs create significant barriers for screen reader users in comment widgets. Additionally, generic button components missing `focus-visible` ring indicators break keyboard navigation visibility.
**Action:** Always provide fallback `alt` descriptions on avatar images (`alt={author.name || pubkey || 'User avatar'}`), explicit `aria-label`s on form textareas, and visible `focus-visible` ring states on interactive `Button` components.

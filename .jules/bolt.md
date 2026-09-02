# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - O(N²) deduplication in async relay fetch callback

**Learning:** `getComments()` in `nostr.js` was doing `filter + findIndex` on events received from Nostr relays upon EOF (`oneose`). For 100+ events this created $O(N^2)$ array iterations in async event handlers.
**Action:** Always inspect async relay subscription handlers and background helpers for $O(N^2)$ array filtering, replacing with $O(N)$ `Set`-based tracking.

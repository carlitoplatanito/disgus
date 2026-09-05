# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - O(N²) deduplication in Nostr event listener callbacks

**Learning:** `comments.filter((value, index, self) => index === self.findIndex((t) => t.id === value.id))` in event listener callbacks like `getComments()` in `src/helpers/nostr.js` introduces O(N²) runtime complexity whenever relay messages finish receiving.
**Action:** Always replace `filter` + `findIndex` with `Set` iteration for linear O(N) deduplication in network handlers.

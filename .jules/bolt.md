# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - Synchronous tag scanning vs state/effect derived properties in list items

**Learning:** Deriving item properties (like parent IDs from tags) via `useState` and `useEffect` causes an extra render frame on initial mount for every rendered list item and potential layout flicker.
**Action:** Extract parent event IDs synchronously via `useMemo` in list items and wrap component with `React.memo`.

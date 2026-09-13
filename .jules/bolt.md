# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-09-13 - State and useEffect for derived props in list components

**Learning:** Computing derived properties (like parent IDs or formatted timestamps) via `useState` + `useEffect` forces an immediate 2nd render pass on component mount for every item in a list.
**Action:** Derive pure state synchronously using `useMemo` to eliminate mount double-renders, and wrap list items in `React.memo`.

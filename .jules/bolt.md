# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - Async useEffect derived state causing mount double-renders

**Learning:** Deriving state asynchronously in `useEffect` on mount causes an initial render with empty/undefined state followed immediately by a second re-render when state is set. In list components, this doubles the initial mount rendering work (2N renders instead of N).
**Action:** Derive dependent state synchronously during render with `useMemo` or plain functions, and wrap list item components with `React.memo`.

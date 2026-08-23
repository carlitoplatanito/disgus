# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - Double mount re-renders and unmemoized list items

**Learning:** Deriving parent event tag metadata inside an asynchronous `useEffect` + `useState` forces every `Comment` component to render twice on mount with initial wrong state layout. Unmemoized item components re-render on every keystroke in parent inputs.
**Action:** Use synchronous `useMemo` to compute tag metadata directly during render pass and wrap list item components in `React.memo`.

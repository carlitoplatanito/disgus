# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - Cascading mount re-renders from stateful derived event tags

**Learning:** Managing derived properties like `parentEvent` via `useEffect` + `useState` inside list item components (`Comment.jsx`) triggers a mandatory second render pass on mount for every list item. Also, helper functions receiving relay comments must avoid `filter` + `findIndex` deduplication.
**Action:** Derive dependent tag information synchronously with `useMemo` during render, memoize individual comment components with `React.memo`, and use `Set` for deduplicating relay arrays.

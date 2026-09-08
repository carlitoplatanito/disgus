# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - Synchronous derivation vs useEffect for parent tags and memoizing comment cards

**Learning:** Deriving parent tags inside `useEffect` with `useState` forces an extra mount re-render and causes an infinite effect re-trigger on every render when no parent 'e' tag exists (`parentEvent` remains `undefined`).
**Action:** Synchronously compute parent tags with `useMemo` and wrap individual comment item components in `React.memo` to eliminate extra re-renders.

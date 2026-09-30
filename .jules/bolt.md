# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - Derived Nostr event tag parsing in useEffect vs useMemo

**Learning:** Using `useEffect` + `useState` to extract Nostr tag relations (e.g., `parentEvent`) on component mount causes an unnecessary second render frame and initial layout shift for every comment card.
**Action:** Derive event relationship tags synchronously during render via `useMemo` with backward loop searching to eliminate mount re-renders and avoid unnecessary array allocations.

# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-10-02 - Storing derived state in React state via useEffect in list items

**Learning:** Computing item relationships (like parent events from tag arrays) inside `useEffect` and setting state causes an extra state update and re-render per list item on initial mount (3N total renders for N items). Including state variables in effect dependency arrays for async data fetches can also trigger redundant effect executions.
**Action:** Derive item properties synchronously with `useMemo` during render, scope effect dependencies strictly to stable identifiers (e.g. `pubkey`), and wrap list item components with `React.memo`.

## 2026-10-03 - Re-instantiating Intl.DateTimeFormat on every date formatting call

**Learning:** Calling `new Intl.DateTimeFormat()` repeatedly inside utility functions like `formatDate` during component rendering incurs extreme CPU instantiation overhead (~50x slower) and triggers heavy garbage collection pressure.
**Action:** Cache and reuse `Intl.DateTimeFormat` instances in a `Map` keyed by locale and options string.

## 2026-10-04 - O(N²) quadratic overhead in streaming WebSocket event collection

**Learning:** Checking `comments.some(c => c.id === event.id)` during real-time event ingestion scans an array on every incoming WebSocket message, causing O(N²) complexity as N grows. Subsequently running `filter` + `findIndex` on EOSE duplicates this O(N²) scan.
**Action:** Track event IDs using an O(1) `Set` upon receipt to guarantee uniqueness in O(N) total streaming time, eliminating the need for post-fetch deduplication scans.

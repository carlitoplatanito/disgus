# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-09-03 - Intl.DateTimeFormat instantiation overhead and effect-driven re-render loops

**Learning:** Calling `new Intl.DateTimeFormat(...)` or `.toLocaleDateString()` on every date formatting call creates ~3 instances per call and causes massive GC pressure (~120x slower than cached formatters). Furthermore, setting state inside `useEffect` where the target state can remain `undefined` (e.g. root items without parent IDs) causes `if (!state)` to evaluate true on every render, creating re-render update loops.
**Action:** Cache `Intl.DateTimeFormat` instances in a `Map`, compare date components (`getFullYear`, etc.) directly, and synchronously calculate derived values using `useMemo` instead of state + `useEffect`.

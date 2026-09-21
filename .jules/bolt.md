# Bolt's Journal - Critical Learnings

## 2026-08-22 - O(N²) comment deduplication and sorting allocations in render

**Learning:** Processing comments directly inside render with `comments.filter((v, i, self) => index === self.findIndex(...))` causes quadratic O(N²) array lookups on every render frame. Performing `tags.filter().map()` inside array sort comparator also causes heavy GC pressure.
**Action:** Deduplicate with a `Set` in O(N), precompute sort keys before sorting in O(N), and use stable React keys (`comment.id`).

## 2026-08-23 - Uncached Intl.DateTimeFormat and string-based date comparisons

**Learning:** Creating a new `Intl.DateTimeFormat` instance on every `formatDate` invocation and converting dates to strings via `toLocaleDateString()` for date equality checks causes significant object instantiation overhead and Garbage Collection pressure.
**Action:** Cache `Intl.DateTimeFormat` instances in a Map and perform numerical integer comparisons (`getFullYear()`, `getMonth()`, `getDate()`) to check for current calendar day.

# Palette's Journal - Critical Learnings

## 2026-03-30 - Standardizing focus-visible ring styles for interactive controls

**Learning:** Buttons and textareas without explicit focus-visible classes lack visible focus outlines when navigated using keyboard tab controls in Tailwind CSS setups.
**Action:** Always include `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black` on shared interactive components like `Button` and inputs to ensure consistent keyboard navigation indicators.

## 2026-04-01 - Distinguishing loading from empty state in async comment feeds

**Learning:** When async feeds initialize with `false` or `null` before resolving to an empty array `[]`, rendering an empty state too early causes a jarring flash. Checking that the data has resolved before presenting the empty state (`role="status"`) provides reassurance that comments are open without premature layout shifts.
**Action:** Distinguish unresolved data states (`!comments`) from resolved empty arrays (`comments.length === 0`) before showing empty state feedback.

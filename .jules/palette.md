# Palette's Journal - Critical Learnings

## 2026-03-30 - Standardizing focus-visible ring styles for interactive controls

**Learning:** Buttons and textareas without explicit focus-visible classes lack visible focus outlines when navigated using keyboard tab controls in Tailwind CSS setups.
**Action:** Always include `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black` on shared interactive components like `Button` and inputs to ensure consistent keyboard navigation indicators.

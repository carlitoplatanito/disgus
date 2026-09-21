## 2025-05-18 - Form Accessibility and Interactive Feedback

**Learning:** Form textareas without explicit `aria-label` attributes leave screen reader users without context on what input is expected, and submit buttons lacking `disabled` states when inputs are empty provide poor visual feedback to users trying to submit invalid forms.
**Action:** Always provide explicit `aria-label` on form inputs without visual labels and tie submit button `disabled` state with clear visual styling (`disabled:opacity-50 disabled:cursor-not-allowed`) to valid input states.

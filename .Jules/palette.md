## 2025-05-14 - [Semantic Radio Buttons for Role Selection]
**Learning:** Custom interactive components implemented as `div` elements lack inherent keyboard accessibility and screen reader support. Converting these to `button` elements with `role="radio"` within a `role="radiogroup"` container provides a robust, accessible alternative while maintaining custom styling.
**Action:** Always prefer semantic `<button>` or `<input type="radio">` for selection controls. If custom styling requires non-standard elements, use ARIA roles and ensure all states (`aria-checked`, `aria-selected`) are kept in sync via JavaScript.

## 2025-05-14 - [3D Icon Interaction with CSS Transforms]
**Learning:** Micro-interactions like "3D" moving effects can be achieved efficiently using CSS transforms and transitions on hover/focus. Using `cubic-bezier` timing functions adds a playful, springy feel that enhances perceived quality.
**Action:** Use `transform: translateY() scale() rotate()` with a `drop-shadow` filter to create depth and movement for icons on interactive elements. Ensure these are also triggered on `:focus-visible` for keyboard accessibility.

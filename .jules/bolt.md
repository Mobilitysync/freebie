
## 2026-05-11 - Blocking Maintenance in onAuthStateChanged
**Learning:** Performing database maintenance (like auto-expiring records) with `await Promise.all()` inside `onAuthStateChanged` blocks the initial render of the dashboard, leading to a poor perceived performance (TTI).
**Action:** Move maintenance tasks to run in the background after the initial `renderDeals()` call, and remove the `await` to ensure the UI is interactive immediately.

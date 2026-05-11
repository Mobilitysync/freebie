
## 2026-05-11 - Blocking Maintenance in onAuthStateChanged
**Learning:** Performing database maintenance (like auto-expiring records) with `await Promise.all()` inside `onAuthStateChanged` blocks the initial render of the dashboard, leading to a poor perceived performance (TTI).
**Action:** Move maintenance tasks to run in the background after the initial `renderDeals()` call, and remove the `await` to ensure the UI is interactive immediately.
# Performance Learnings - Bolt

## Firestore Optimization: writeBatch vs updateDoc

In the client and freelancer dashboards, I identified an N+1 update pattern where multiple documents were being updated individually within a loop using `updateDoc`.

### Problem
When the dashboard loads, it iterates through all deals to auto-expire those that have passed their deadline. Using `updateDoc` inside `Promise.all(deals.map(...))` triggers a separate network request for each document. For a user with many deals, this can lead to:
- Excessive network overhead.
- Potential rate limiting by Firebase.
- Increased latency for the initial UI render.

### Solution
I refactored these loops to use Firebase `writeBatch`.
1.  **Atomicity**: All updates are sent in a single request.
2.  **Efficiency**: Significantly reduces network round-trips.
3.  **Correctness**: Consistently updates both the database and the local state.

### Consolidating Updates
In `freelancer-dashboard.html`, I went a step further by consolidating multiple potential updates (status expiry and payment status initialization) into a single `batch.update` call per document, rather than potentially calling `updateDoc` twice for the same ID.

```javascript
const batch = writeBatch(db);
let needsCommit = false;
const now = new Date();
allDeals.forEach(({ id, data: d }) => {
    let changed = false;
    const updates = {};
    if (d.status === 'pending' && d.deadline && new Date(d.deadline) < now) {
        updates.status = 'expired';
        d.status = 'expired';
        changed = true;
    }
    if (!d.paymentStatus) {
        updates.paymentStatus = 'unpaid';
        d.paymentStatus = 'unpaid';
        changed = true;
    }
    if (changed) {
        batch.update(doc(db, 'deals', id), updates);
        needsCommit = true;
    }
});
if (needsCommit) await batch.commit();
```

### Verification
I used a custom Playwright script to mock the Firestore SDK and verify that:
1.  The batch is correctly populated with the expected updates.
2.  `batch.commit()` is only called when changes are actually needed.
3.  The UI correctly reflects the updated statuses.

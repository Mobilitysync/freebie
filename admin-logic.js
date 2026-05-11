export function filterAndSortDeals(allDeals, currentFilter, currentSearch, sortCol, sortDir) {
  return allDeals
    .filter(d => currentFilter === 'all' || d.status === currentFilter)
    .filter(d => {
      if (!currentSearch) return true;
      const q = currentSearch.toLowerCase();
      return (d.freelancerName || '').toLowerCase().includes(q) ||
             (d.clientName || '').toLowerCase().includes(q) ||
             (d.workDescription || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let aVal = a[sortCol], bVal = b[sortCol];
      if (sortCol === 'paymentAmount') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
}

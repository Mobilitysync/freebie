export const PAYMENT_LABELS = {
  unpaid:  { label: 'Unpaid',  cls: 'pay-unpaid'  },
  partial: { label: 'Partial', cls: 'pay-partial' },
  paid:    { label: 'Paid',    cls: 'pay-paid'    }
};

/**
 * Returns the HTML for a payment status pill.
 * @param {string} status - The payment status (unpaid, partial, paid).
 * @returns {string} HTML string for the pill.
 */
export function payPillHTML(status) {
  const p = PAYMENT_LABELS[status] || PAYMENT_LABELS.unpaid;
  return `<span class="pay-pill ${p.cls}">${p.label}</span>`;
}

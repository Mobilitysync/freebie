import { test } from 'node:test';
import assert from 'node:assert';
import { payPillHTML } from '../utils.js';

test('payPillHTML returns correct HTML for "unpaid"', () => {
  const result = payPillHTML('unpaid');
  assert.strictEqual(result, '<span class="pay-pill pay-unpaid">Unpaid</span>');
});

test('payPillHTML returns correct HTML for "partial"', () => {
  const result = payPillHTML('partial');
  assert.strictEqual(result, '<span class="pay-pill pay-partial">Partial</span>');
});

test('payPillHTML returns correct HTML for "paid"', () => {
  const result = payPillHTML('paid');
  assert.strictEqual(result, '<span class="pay-pill pay-paid">Paid</span>');
});

test('payPillHTML defaults to "unpaid" for unknown status', () => {
  const result = payPillHTML('unknown');
  assert.strictEqual(result, '<span class="pay-pill pay-unpaid">Unpaid</span>');
});

test('payPillHTML defaults to "unpaid" for empty status', () => {
  const result = payPillHTML('');
  assert.strictEqual(result, '<span class="pay-pill pay-unpaid">Unpaid</span>');
});

test('payPillHTML defaults to "unpaid" for null status', () => {
  const result = payPillHTML(null);
  assert.strictEqual(result, '<span class="pay-pill pay-unpaid">Unpaid</span>');
});

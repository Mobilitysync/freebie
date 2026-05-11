import { test } from 'node:test';
import assert from 'node:assert';
import { formatCurrency, formatDate, safeText } from './utils.js';

test('formatCurrency', async (t) => {
  await t.test('formats numbers correctly', () => {
    assert.strictEqual(formatCurrency(1000), '₹1,000');
    assert.strictEqual(formatCurrency(100000), '₹1,00,000');
  });

  await t.test('handles zero and falsy values', () => {
    assert.strictEqual(formatCurrency(0), '₹0');
    assert.strictEqual(formatCurrency(null), '₹0');
    assert.strictEqual(formatCurrency(undefined), '₹0');
    assert.strictEqual(formatCurrency(''), '₹0');
  });

  await t.test('formats strings that are numbers', () => {
    assert.strictEqual(formatCurrency('5000'), '₹5,000');
  });
});

test('formatDate', async (t) => {
  await t.test('formats YYYY-MM-DD correctly', () => {
    assert.strictEqual(formatDate('2024-12-25'), '25 Dec 2024');
    assert.strictEqual(formatDate('2024-01-01'), '1 Jan 2024');
  });

  await t.test('handles ISO strings', () => {
    assert.strictEqual(formatDate('2024-05-15T10:00:00Z'), '15 May 2024');
  });

  await t.test('handles empty and null values', () => {
    assert.strictEqual(formatDate(''), '—');
    assert.strictEqual(formatDate(null), '—');
  });

  await t.test('returns original string for invalid formats', () => {
    assert.strictEqual(formatDate('invalid-date'), 'invalid-date');
    assert.strictEqual(formatDate('2024-13-01'), '2024-13-01');
  });
});

test('safeText', async (t) => {
  await t.test('truncates long text', () => {
    const longText = 'This is a very long work description that should be truncated because it exceeds sixty characters.';
    const result = safeText(longText);
    assert.ok(result.endsWith('...'));
    assert.ok(result.length <= 63); // 60 + 3 for '...'
  });

  await t.test('does not truncate short text', () => {
    assert.strictEqual(safeText('Short text'), 'Short text');
  });

  await t.test('handles null/undefined', () => {
    assert.strictEqual(safeText(null), 'Untitled work');
    assert.strictEqual(safeText(undefined), 'Untitled work');
  });

  await t.test('respects custom limit', () => {
    assert.strictEqual(safeText('Hello World', 5), 'Hello...');
  });
});

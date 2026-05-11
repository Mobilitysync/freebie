import { test, describe } from 'node:test';
import assert from 'node:assert';
import { formatDate, formatCurrency, safeText, friendlyError } from './app.js';

describe('app.js utility functions', () => {

  describe('formatDate', () => {
    test('formats date in Indian locale by default', () => {
      // Use a date string with time and offset to avoid timezone shifts during parsing
      const date = '2026-05-11T12:00:00';
      const formatted = formatDate(date);
      // Depending on environment, output might vary slightly, but should contain day, month, year
      assert.match(formatted, /11/);
      assert.match(formatted, /May/);
      assert.match(formatted, /2026/);
    });

    test('formats date in custom format when isIndianFormat is false', () => {
      const date = '2026-05-11';
      const formatted = formatDate(date, false);
      assert.strictEqual(formatted, '11 May 2026');
    });

    test('returns "No deadline" for empty input (Indian format)', () => {
      assert.strictEqual(formatDate(''), 'No deadline');
    });

    test('returns "—" for empty input (Custom format)', () => {
      assert.strictEqual(formatDate('', false), '—');
    });
  });

  describe('formatCurrency', () => {
    test('formats number as INR', () => {
      assert.strictEqual(formatCurrency(5000), '₹5,000');
    });

    test('handles string input', () => {
      assert.strictEqual(formatCurrency('10000'), '₹10,000');
    });
  });

  describe('safeText', () => {
    test('truncates long text', () => {
      const longText = 'This is a very long work description that should be truncated by the safeText function.';
      const truncated = safeText(longText, 20);
      assert.strictEqual(truncated.length, 21); // 20 + ellipsis
      assert.ok(truncated.endsWith('…'));
    });

    test('does not truncate short text', () => {
      const shortText = 'Short text';
      assert.strictEqual(safeText(shortText), shortText);
    });

    test('returns "Untitled work" for empty input', () => {
      assert.strictEqual(safeText(''), 'Untitled work');
    });
  });

  describe('friendlyError', () => {
    test('returns correct message for known error code', () => {
      assert.strictEqual(friendlyError('auth/wrong-password'), 'Incorrect password.');
    });

    test('returns default message for unknown error code', () => {
      assert.strictEqual(friendlyError('auth/unknown-error'), 'Something went wrong. Please try again.');
    });
  });
});

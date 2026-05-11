import { test } from 'node:test';
import assert from 'node:assert';
import { hashPin } from '../utils.js';

test('hashPin returns correct SHA-256 hash for "freebie2026"', async () => {
  const pin = 'freebie2026';
  const expectedHash = '67870e1721cef10c1f7f56fcfaa930318848d8bb421199fa060156841776c34d';
  const actualHash = await hashPin(pin);
  assert.strictEqual(actualHash, expectedHash);
});

test('hashPin returns consistent hash for the same input', async () => {
  const pin = 'test-pin-123';
  const hash1 = await hashPin(pin);
  const hash2 = await hashPin(pin);
  assert.strictEqual(hash1, hash2);
});

test('hashPin returns different hashes for different inputs', async () => {
  const hash1 = await hashPin('pin1');
  const hash2 = await hashPin('pin2');
  assert.notStrictEqual(hash1, hash2);
});

test('hashPin handles empty string', async () => {
  const hash = await hashPin('');
  // SHA-256 for empty string
  const expectedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  assert.strictEqual(hash, expectedHash);
});

test('hashPin handles long strings', async () => {
  const longPin = 'a'.repeat(1000);
  const hash = await hashPin(longPin);
  assert.strictEqual(typeof hash, 'string');
  assert.strictEqual(hash.length, 64);
});

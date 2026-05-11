import test from 'node:test';
import assert from 'node:assert';
import { filterAndSortDeals } from './admin-logic.js';

const mockDeals = [
  { id: '1', freelancerName: 'Alice', clientName: 'Bob', workDescription: 'Logo Design', status: 'active', paymentAmount: 500, createdAt: '2023-01-01' },
  { id: '2', freelancerName: 'Charlie', clientName: 'Dave', workDescription: 'Web Dev', status: 'completed', paymentAmount: 1500, createdAt: '2023-01-02' },
  { id: '3', freelancerName: 'Eve', clientName: 'Frank', workDescription: 'Writing', status: 'pending', paymentAmount: 200, createdAt: '2023-01-03' },
  { id: '4', freelancerName: 'Alice', clientName: 'Grace', workDescription: 'UI Design', status: 'active', paymentAmount: 800, createdAt: '2023-01-04' },
];

test('filterAndSortDeals - filters by status', () => {
  const result = filterAndSortDeals(mockDeals, 'active', '', 'createdAt', 'desc');
  assert.strictEqual(result.length, 2);
  assert.ok(result.every(d => d.status === 'active'));
});

test('filterAndSortDeals - filters by search query (freelancerName)', () => {
  const result = filterAndSortDeals(mockDeals, 'all', 'Alice', 'createdAt', 'desc');
  assert.strictEqual(result.length, 2);
  assert.ok(result.every(d => d.freelancerName === 'Alice'));
});

test('filterAndSortDeals - filters by search query (clientName)', () => {
  const result = filterAndSortDeals(mockDeals, 'all', 'Frank', 'createdAt', 'desc');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].clientName, 'Frank');
});

test('filterAndSortDeals - filters by search query (workDescription)', () => {
  const result = filterAndSortDeals(mockDeals, 'all', 'Web', 'createdAt', 'desc');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].workDescription, 'Web Dev');
});

test('filterAndSortDeals - search is case-insensitive', () => {
  const result = filterAndSortDeals(mockDeals, 'all', 'alice', 'createdAt', 'desc');
  assert.strictEqual(result.length, 2);
});

test('filterAndSortDeals - sorts by string column (asc)', () => {
  const result = filterAndSortDeals(mockDeals, 'all', '', 'freelancerName', 'asc');
  assert.strictEqual(result[0].freelancerName, 'Alice');
  assert.strictEqual(result[1].freelancerName, 'Alice');
  assert.strictEqual(result[2].freelancerName, 'Charlie');
  assert.strictEqual(result[3].freelancerName, 'Eve');
});

test('filterAndSortDeals - sorts by string column (desc)', () => {
  const result = filterAndSortDeals(mockDeals, 'all', '', 'freelancerName', 'desc');
  assert.strictEqual(result[0].freelancerName, 'Eve');
  assert.strictEqual(result[1].freelancerName, 'Charlie');
});

test('filterAndSortDeals - sorts by numeric column (paymentAmount)', () => {
  const result = filterAndSortDeals(mockDeals, 'all', '', 'paymentAmount', 'asc');
  assert.strictEqual(result[0].paymentAmount, 200);
  assert.strictEqual(result[1].paymentAmount, 500);
  assert.strictEqual(result[2].paymentAmount, 800);
  assert.strictEqual(result[3].paymentAmount, 1500);
});

test('filterAndSortDeals - handles missing search query', () => {
  const result = filterAndSortDeals(mockDeals, 'all', '', 'createdAt', 'asc');
  assert.strictEqual(result.length, 4);
});

test('filterAndSortDeals - handles empty data', () => {
  const result = filterAndSortDeals([], 'all', '', 'createdAt', 'asc');
  assert.strictEqual(result.length, 0);
});

test('filterAndSortDeals - handles missing fields in data', () => {
  const messyData = [
    { id: '1', status: 'active' },
    { id: '2', freelancerName: 'Alice', status: 'active' }
  ];
  const result = filterAndSortDeals(messyData, 'all', 'Alice', 'createdAt', 'asc');
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].freelancerName, 'Alice');
});

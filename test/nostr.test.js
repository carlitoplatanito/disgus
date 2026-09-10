import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateComments } from '../src/helpers/nostr.js';

test('deduplicateComments removes duplicate comment IDs while preserving order', () => {
  const input = [
    { id: '1', content: 'First' },
    { id: '2', content: 'Second' },
    { id: '1', content: 'Duplicate First' },
    { id: '3', content: 'Third' },
    { id: '2', content: 'Duplicate Second' },
  ];

  const result = deduplicateComments(input);

  assert.deepEqual(result, [
    { id: '1', content: 'First' },
    { id: '2', content: 'Second' },
    { id: '3', content: 'Third' },
  ]);
});

test('deduplicateComments performs in O(N) time for large arrays', () => {
  const count = 5000;
  const input = [];
  for (let i = 0; i < count; i++) {
    input.push({ id: `comment-${i % 500}`, content: `Content ${i}` });
  }

  const start = performance.now();
  const result = deduplicateComments(input);
  const elapsed = performance.now() - start;

  assert.equal(result.length, 500);
  assert.ok(elapsed < 50, `Deduplication took ${elapsed}ms, expected under 50ms`);
});

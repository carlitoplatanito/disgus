import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateComments } from '../src/helpers/nostr.js';

test('deduplicateComments removes duplicate events by ID preserving order', () => {
  const input = [
    { id: '1', content: 'first' },
    { id: '2', content: 'second' },
    { id: '1', content: 'first duplicate' },
    { id: '3', content: 'third' },
    { id: '2', content: 'second duplicate' },
  ];

  const result = deduplicateComments(input);

  assert.equal(result.length, 3);
  assert.deepEqual(result, [
    { id: '1', content: 'first' },
    { id: '2', content: 'second' },
    { id: '3', content: 'third' },
  ]);
});

test('deduplicateComments handles empty array and invalid items', () => {
  assert.deepEqual(deduplicateComments([]), []);
  assert.deepEqual(deduplicateComments(null), []);
  assert.deepEqual(deduplicateComments([null, undefined, {}, { id: '' }]), []);
});

test('deduplicateComments handles large arrays efficiently (O(N))', () => {
  const input = [];
  const numItems = 10000;
  for (let i = 0; i < numItems; i++) {
    input.push({ id: `id-${i % 100}`, content: `comment ${i}` });
  }

  const start = performance.now();
  const result = deduplicateComments(input);
  const duration = performance.now() - start;

  assert.equal(result.length, 100);
  assert.ok(duration < 50, `Deduplication took ${duration}ms, expected < 50ms`);
});

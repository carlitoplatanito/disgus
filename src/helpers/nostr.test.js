import test from 'node:test';
import assert from 'node:assert';
import { deduplicateComments } from './nostr.js';

test('deduplicateComments removes duplicate events by id', () => {
  const comments = [
    { id: '1', content: 'hello' },
    { id: '2', content: 'world' },
    { id: '1', content: 'duplicate hello' },
    { id: '3', content: 'foo' },
    { id: '2', content: 'duplicate world' },
  ];

  const result = deduplicateComments(comments);
  assert.strictEqual(result.length, 3);
  assert.deepStrictEqual(
    result.map((c) => c.id),
    ['1', '2', '3']
  );
  assert.strictEqual(result[0].content, 'hello');
  assert.strictEqual(result[1].content, 'world');
  assert.strictEqual(result[2].content, 'foo');
});

test('deduplicateComments handles empty and invalid inputs safely', () => {
  assert.deepStrictEqual(deduplicateComments(null), []);
  assert.deepStrictEqual(deduplicateComments(undefined), []);
  assert.deepStrictEqual(deduplicateComments([]), []);
  assert.deepStrictEqual(deduplicateComments([null, { id: 'a' }, {}]), [{ id: 'a' }]);
});

test('deduplicateComments performance benchmark with 10,000 items', () => {
  const items = [];
  for (let i = 0; i < 10000; i++) {
    items.push({ id: `id-${i % 1000}`, content: `comment ${i}` });
  }

  const start = performance.now();
  const result = deduplicateComments(items);
  const duration = performance.now() - start;

  assert.strictEqual(result.length, 1000);
  assert.ok(duration < 50, `Expected O(N) deduplication to finish in < 50ms, took ${duration}ms`);
});

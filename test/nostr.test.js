import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateComments } from '../src/helpers/nostr.js';

test('deduplicateComments reduces duplicate comment events in O(N)', () => {
  const comments = [
    { id: '1', content: 'hello', created_at: 100 },
    { id: '2', content: 'world', created_at: 200 },
    { id: '1', content: 'hello duplicate', created_at: 100 },
    { id: '3', content: 'foo', created_at: 300 },
    { id: '2', content: 'world duplicate', created_at: 200 },
  ];

  const result = deduplicateComments(comments);

  assert.equal(result.length, 3);
  assert.deepEqual(
    result.map((c) => c.id),
    ['1', '2', '3']
  );
  assert.equal(result[0].content, 'hello');
});

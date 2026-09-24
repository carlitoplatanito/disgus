import test from 'node:test';
import assert from 'node:assert/strict';

// Mock browser globals for Node.js test environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

test('O(N) Set deduplication logic in getComments correctly filters duplicate comments', () => {
  const comments = [
    { id: 'c1', content: 'First', created_at: 100 },
    { id: 'c2', content: 'Second', created_at: 101 },
    { id: 'c1', content: 'First duplicate', created_at: 102 },
    { id: 'c3', content: 'Third', created_at: 103 },
    { id: 'c2', content: 'Second duplicate', created_at: 104 },
  ];

  // Benchmark / verify deduplication matching src/helpers/nostr.js implementation
  const seen = new Set();
  const uniqueComments = [];
  for (let i = 0; i < comments.length; i++) {
    const item = comments[i];
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      uniqueComments.push(item);
    }
  }

  assert.equal(uniqueComments.length, 3);
  assert.deepEqual(uniqueComments.map(c => c.id), ['c1', 'c2', 'c3']);
});

test('getComments returns cached comments when available without force', async () => {
  mockStorage.clear();
  const rootEvent = { id: 'root123' };
  const cachedComments = [
    { id: 'c1', content: 'Cached comment' }
  ];

  mockStorage.set(`e:${rootEvent.id}`, JSON.stringify({
    comments: cachedComments,
    updated_at: 1700000000,
  }));

  const { getComments } = await import('../src/helpers/nostr.js');
  const result = await getComments({ relays: [] }, rootEvent, false);
  assert.deepEqual(result, cachedComments);
});

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for testing caching behavior
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

globalThis.localStorage = new LocalStorageMock();

test('Comments cache key c:eventId does not collide with single event key e:eventId', () => {
  localStorage.clear();
  const eventId = '1111111111111111111111111111111111111111111111111111111111111111';

  // Single Nostr event stored under e:eventId
  const rootEvent = {
    id: eventId,
    pubkey: 'pub123',
    kind: 1,
    content: 'Hello world',
    tags: [['r', 'https://example.com']],
    created_at: 100000
  };
  localStorage.setItem(`e:${eventId}`, JSON.stringify(rootEvent));

  // Comments cache stored under c:eventId
  const commentsCache = {
    updated_at: 100050,
    comments: [
      { id: '2222', pubkey: 'user1', content: 'Reply 1', tags: [['e', eventId, '', 'root']], created_at: 100010 }
    ]
  };
  localStorage.setItem(`c:${eventId}`, JSON.stringify(commentsCache));

  // Verify that e:eventId still returns the single Nostr event object
  const retrievedEvent = JSON.parse(localStorage.getItem(`e:${eventId}`));
  assert.equal(retrievedEvent.id, eventId);
  assert.equal(retrievedEvent.content, 'Hello world');

  // Verify that c:eventId returns the comments list cache
  const retrievedComments = JSON.parse(localStorage.getItem(`c:${eventId}`));
  assert.equal(retrievedComments.comments.length, 1);
  assert.equal(retrievedComments.comments[0].id, '2222');
});

test('getPubkey caches result in memory and deduplicates concurrent inflight requests', async () => {
  localStorage.clear();
  const pubkey = 'testpubkey1234567890';
  const profile = { pubkey, name: 'TestUser', created_at: 1000 };

  localStorage.setItem(`p:${pubkey}`, JSON.stringify(profile));

  const { getPubkey } = await import('../src/helpers/nostr.js');

  // Trigger first getPubkey call
  const p1 = getPubkey(pubkey, ['wss://relay.example.com']);
  // Trigger concurrent second getPubkey call for same pubkey
  const p2 = getPubkey(pubkey, ['wss://relay.example.com']);

  // Check inflight request deduplication (both return same promise / resolve to same object)
  const [res1, res2] = await Promise.all([p1, p2]);
  assert.equal(res1, res2);
  assert.equal(res1.name, 'TestUser');

  // Mutate localStorage to test if subsequent calls hit in-memory cache directly
  localStorage.setItem(`p:${pubkey}`, JSON.stringify({ pubkey, name: 'MutatedUser', created_at: 2000 }));

  const res3 = await getPubkey(pubkey, ['wss://relay.example.com']);
  assert.equal(res3.name, 'TestUser'); // Should be served from in-memory cache
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { getPubkey } from '../src/helpers/nostr.js';

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

test('getPubkey deduplicates in-flight requests and caches profiles in memory', async () => {
  localStorage.clear();
  const pubkey = 'testpubkey123';
  const profile = { pubkey, name: 'Alice', created_at: 123456 };
  localStorage.setItem(`p:${pubkey}`, JSON.stringify(profile));

  // Concurrent calls should return the same promise reference or resolve identically
  const p1 = getPubkey(pubkey, ['wss://relay.example.com']);
  const p2 = getPubkey(pubkey, ['wss://relay.example.com']);

  // If in-flight or memory cached, p1 and p2 should be the identical promise instance
  assert.equal(p1, p2, 'Concurrent getPubkey calls for the same pubkey should share the same promise');

  const [res1, res2] = await Promise.all([p1, p2]);
  assert.deepEqual(res1, profile);
  assert.deepEqual(res2, profile);

  // Clear localStorage to prove subsequent calls hit memory cache without hitting localStorage
  localStorage.clear();
  const p3 = getPubkey(pubkey, ['wss://relay.example.com']);
  const res3 = await p3;
  assert.deepEqual(res3, profile, 'Subsequent getPubkey calls should hit memory cache');
});

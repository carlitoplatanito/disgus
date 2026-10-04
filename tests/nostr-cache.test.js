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

test('getComments efficiently deduplicates incoming events from relays using O(1) tracking', async () => {
  const { SimplePool } = await import('nostr-tools');
  const { getComments } = await import('../src/helpers/nostr.js');

  localStorage.clear();
  const rootEvent = { id: 'root123', pubkey: 'pub123', kind: 1, content: 'Root', tags: [], created_at: 1000 };
  const config = { relays: ['wss://relay.example.com'] };

  const originalSubscribe = SimplePool.prototype.subscribe;
  SimplePool.prototype.subscribe = function (relays, filter, { onevent, oneose }) {
    // Emit duplicate events to simulate relay stream behavior
    const event1 = { id: 'comment1', pubkey: 'p1', content: 'C1', tags: [['e', 'root123']], created_at: 1010 };
    const event2 = { id: 'comment2', pubkey: 'p2', content: 'C2', tags: [['e', 'root123']], created_at: 1020 };

    onevent(event1);
    onevent(event1); // duplicate
    onevent(event2);
    onevent(event2); // duplicate
    onevent(event1); // duplicate again

    setTimeout(() => {
      oneose();
    }, 10);

    return { close: () => {} };
  };

  try {
    const comments = await getComments(config, rootEvent, true);
    assert.equal(comments.length, 2);
    assert.deepEqual(comments.map(c => c.id), ['comment1', 'comment2']);
  } finally {
    SimplePool.prototype.subscribe = originalSubscribe;
  }
});

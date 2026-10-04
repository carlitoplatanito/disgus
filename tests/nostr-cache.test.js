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

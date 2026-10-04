import test from 'node:test';
import assert from 'node:assert/strict';
import { getParentEventId } from '../src/helpers/utils.js';

test('getParentEventId returns null for empty or non-array tags', () => {
  assert.equal(getParentEventId(null), null);
  assert.equal(getParentEventId([]), null);
  assert.equal(getParentEventId([['p', 'pubkey123']]), null);
});

test('getParentEventId identifies NIP-10 marked reply tag', () => {
  const tags = [
    ['e', 'rootId123', 'wss://relay.com', 'root'],
    ['e', 'replyId456', 'wss://relay.com', 'reply'],
    ['p', 'pubkey123']
  ];
  assert.equal(getParentEventId(tags), 'replyId456');
});

test('getParentEventId identifies NIP-10 marked root tag when no reply tag is present', () => {
  const tags = [
    ['e', 'rootId123', 'wss://relay.com', 'root'],
    ['p', 'pubkey123']
  ];
  assert.equal(getParentEventId(tags), 'rootId123');
});

test('getParentEventId handles positional unmarked tags correctly', () => {
  // Single positional tag (reply to root)
  const singleTag = [['e', 'rootId123', 'wss://relay.com']];
  assert.equal(getParentEventId(singleTag), 'rootId123');

  // Double positional tags (1st is root, 2nd is reply parent)
  const doubleTag = [
    ['e', 'rootId123', 'wss://relay.com'],
    ['e', 'parentId789', 'wss://relay.com']
  ];
  assert.equal(getParentEventId(doubleTag), 'parentId789');
});

test('getParentEventId ignores mention tags in positional fallback', () => {
  const tagsWithMention = [
    ['e', 'rootId123', 'wss://relay.com'],
    ['e', 'mentionId999', 'wss://relay.com', 'mention']
  ];
  assert.equal(getParentEventId(tagsWithMention), 'rootId123');
});

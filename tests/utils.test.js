import test from 'node:test';
import assert from 'node:assert/strict';
import { getParentEventId, sanitizeUrl } from '../src/helpers/utils.js';

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

test('sanitizeUrl allows valid http, https, and safe raster image data URIs', () => {
  assert.equal(sanitizeUrl('https://example.com/avatar.png'), 'https://example.com/avatar.png');
  assert.equal(sanitizeUrl('http://example.com/avatar.jpg'), 'http://example.com/avatar.jpg');
  assert.equal(sanitizeUrl('data:image/png;base64,iVBORw0KGgoAAAANSUHGgo='), 'data:image/png;base64,iVBORw0KGgoAAAANSUHGgo=');
  assert.equal(sanitizeUrl('data:image/jpeg;base64,/9j/4AAQSkZJRg=='), 'data:image/jpeg;base64,/9j/4AAQSkZJRg==');
  assert.equal(sanitizeUrl('data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgA=='), 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgA==');
  assert.equal(sanitizeUrl('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
});

test('sanitizeUrl rejects dangerous or invalid URLs', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeUrl('JAVASCRIPT:alert(1)'), null);
  assert.equal(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), null);
  assert.equal(sanitizeUrl('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+'), null);
  assert.equal(sanitizeUrl('data:image/svg+xml;utf8,<svg onload=alert(1)>'), null);
  assert.equal(sanitizeUrl('data:image/html,<script>alert(1)</script>'), null);
  assert.equal(sanitizeUrl('/relative/path.png'), null);
  assert.equal(sanitizeUrl('not a url'), null);
  assert.equal(sanitizeUrl(null), null);
  assert.equal(sanitizeUrl(undefined), null);
});

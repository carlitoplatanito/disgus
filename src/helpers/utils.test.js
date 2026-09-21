import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from './utils.js';

test('formatDate formats today date with timeStyle medium', () => {
  const now = new Date();
  const formatted = formatDate(now, ['en-US']);
  assert.ok(typeof formatted === 'string');
  assert.ok(formatted.length > 0);
});

test('formatDate formats past date with dateStyle short and timeStyle short', () => {
  const past = new Date(2020, 0, 1, 12, 0, 0);
  const formatted = formatDate(past, ['en-US']);
  assert.ok(typeof formatted === 'string');
  assert.ok(formatted.includes('2020') || formatted.includes('20'));
});

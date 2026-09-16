import test from 'node:test';
import assert from 'node:assert';
import { formatDate, classNames } from '../src/helpers/utils.js';

test('formatDate formats today date with timeStyle medium', () => {
  const now = new Date();
  const formatted = formatDate(now, ['en-US']);
  assert.ok(typeof formatted === 'string' && formatted.length > 0);
  assert.ok(formatted.includes(':'));
});

test('formatDate formats past date with dateStyle short and timeStyle short', () => {
  const pastDate = new Date('2023-01-15T12:00:00Z');
  const formatted = formatDate(pastDate, ['en-US']);
  assert.ok(typeof formatted === 'string' && formatted.length > 0);
  assert.ok(formatted.includes('23') || formatted.includes('2023'));
});

test('classNames joins truthy classes', () => {
  assert.strictEqual(classNames('a', false, 'b', null, undefined, 'c'), 'a b c');
});

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock navigator for Node environment before importing utils
Object.defineProperty(globalThis, 'navigator', {
  value: {
    languages: ['en-US'],
    language: 'en-US'
  },
  configurable: true,
  writable: true
});

const { formatDate, classNames } = await import('../src/helpers/utils.js');

test('formatDate formats today date with timeStyle medium', () => {
  const now = new Date();
  const formatted = formatDate(now, ['en-US']);
  assert.equal(typeof formatted, 'string');
  assert.ok(formatted.length > 0);
});

test('formatDate formats non-today date with short date and time styles', () => {
  const pastDate = new Date(2020, 0, 1, 12, 0, 0);
  const formatted = formatDate(pastDate, ['en-US']);
  assert.equal(typeof formatted, 'string');
  assert.ok(formatted.includes('2020') || formatted.includes('20'));
});

test('classNames joins truthy class names', () => {
  assert.equal(classNames('foo', false, 'bar', undefined, 'baz'), 'foo bar baz');
});

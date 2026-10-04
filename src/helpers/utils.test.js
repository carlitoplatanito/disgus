import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, classNames } from './utils.js';

test('formatDate formats today correctly', () => {
    const now = new Date();
    const formatted = formatDate(now, ['en-US']);
    assert.ok(typeof formatted === 'string');
    assert.ok(formatted.length > 0);
});

test('formatDate formats past date correctly', () => {
    const pastDate = new Date('2020-01-01T12:00:00Z');
    const formatted = formatDate(pastDate, ['en-US']);
    assert.ok(typeof formatted === 'string');
    assert.ok(formatted.includes('2020') || formatted.includes('20'));
});

test('classNames filters falsy values and joins strings', () => {
    assert.strictEqual(classNames('foo', false, 'bar', null, undefined, 'baz'), 'foo bar baz');
});

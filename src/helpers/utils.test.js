import assert from 'node:assert';
import { test } from 'node:test';
import { classNames } from './utils.js';

test('classNames filters falsey values and joins classes', () => {
    assert.strictEqual(classNames('foo', false, 'bar', undefined, 'baz'), 'foo bar baz');
});

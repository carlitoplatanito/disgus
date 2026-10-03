import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function logic mirroring config parsing from main.jsx for unit testing
function parseDisableGuestConfig({ scriptAttr, metaNostr, metaDisgus, elementAttr }) {
  const scriptDisableGuest = scriptAttr !== undefined && scriptAttr !== null
    ? scriptAttr !== 'false'
    : false;

  const metaDisableGuest = metaNostr === 'true' || metaDisgus === 'true';

  const readConfigResult = scriptDisableGuest || metaDisableGuest || false;

  if (elementAttr !== undefined && elementAttr !== null) {
    return elementAttr !== 'false';
  }

  return readConfigResult;
}

test('disable_guest defaults to false when no options are set', () => {
  const result = parseDisableGuestConfig({});
  assert.strictEqual(result, false);
});

test('disable_guest is true when data-disable-guest attribute is present on script', () => {
  const result1 = parseDisableGuestConfig({ scriptAttr: '' });
  assert.strictEqual(result1, true);

  const result2 = parseDisableGuestConfig({ scriptAttr: 'true' });
  assert.strictEqual(result2, true);
});

test('disable_guest is false when data-disable-guest attribute is "false"', () => {
  const result = parseDisableGuestConfig({ scriptAttr: 'false' });
  assert.strictEqual(result, false);
});

test('disable_guest is true when meta tag nostr:disable_guest is "true"', () => {
  const result = parseDisableGuestConfig({ metaNostr: 'true' });
  assert.strictEqual(result, true);
});

test('disable_guest is true when meta tag disgus:disable_guest is "true"', () => {
  const result = parseDisableGuestConfig({ metaDisgus: 'true' });
  assert.strictEqual(result, true);
});

test('disable_guest on web component overrides defaults', () => {
  const result1 = parseDisableGuestConfig({ elementAttr: '' });
  assert.strictEqual(result1, true);

  const result2 = parseDisableGuestConfig({ elementAttr: 'false', scriptAttr: 'true' });
  assert.strictEqual(result2, false);
});

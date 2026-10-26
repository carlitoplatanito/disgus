import test from 'node:test';
import assert from 'node:assert/strict';

class LocalStorageMock {
  constructor() {
    this.store = new Map();
    this.getCalls = 0;
    this.setCalls = 0;
  }
  clear() {
    this.store.clear();
    this.getCalls = 0;
    this.setCalls = 0;
  }
  getItem(key) {
    this.getCalls++;
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.setCalls++;
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
}

globalThis.localStorage = new LocalStorageMock();

test('Benchmark event stream localStorage I/O', () => {
  localStorage.clear();
  const seenIds = new Set();
  const storedEventIds = new Set();
  const comments = [];
  let newEventsFound = 0;

  // Generate 10,000 events with 1,000 unique IDs repeated 10 times
  const events = [];
  for (let i = 0; i < 10000; i++) {
    const id = `event_id_${i % 1000}`;
    events.push({ id, content: `Comment content ${id}`, created_at: 1000000 + i });
  }

  // Optimized onevent processing
  const start = performance.now();
  for (const event of events) {
    if (event && event.id) {
      if (!seenIds.has(event.id)) {
        seenIds.add(event.id);
        comments.push(event);
        newEventsFound++;
      }
      if (!storedEventIds.has(event.id)) {
        storedEventIds.add(event.id);
        if (!localStorage.getItem(`e:${event.id}`)) {
          localStorage.setItem(`e:${event.id}`, JSON.stringify(event));
        }
      }
    }
  }
  const duration = performance.now() - start;

  console.log(`Optimized benchmark duration: ${duration.toFixed(2)}ms`);
  console.log(`localStorage getItem calls: ${localStorage.getCalls}`);
  console.log(`localStorage setItem calls: ${localStorage.setCalls}`);

  assert.equal(comments.length, 1000);
  assert.equal(localStorage.getCalls, 1000);
  assert.equal(localStorage.setCalls, 1000);
});

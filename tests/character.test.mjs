import { test } from 'node:test';
import assert from 'node:assert/strict';
import character from '../character.js';

const { lookVector, nextBlinkDelay, nextHint } = character;

test('lookVector points from the anchor toward the pointer, scaled to the viewport half-size', () => {
  const vector = lookVector({ x: 900, y: 300 }, { x: 600, y: 300 }, { width: 1200, height: 800 });
  assert.ok(Math.abs(vector.x - 0.5) < 1e-9);
  assert.equal(vector.y, 0);
});

test('lookVector clamps to the unit square and tolerates a missing pointer', () => {
  const far = lookVector({ x: 5000, y: -5000 }, { x: 0, y: 0 }, { width: 1200, height: 800 });
  assert.equal(far.x, 1);
  assert.equal(far.y, -1);
  assert.deepEqual(lookVector(null, { x: 0, y: 0 }, { width: 1200, height: 800 }), { x: 0, y: 0 });
});

test('nextBlinkDelay stays inside a natural range for any random draw', () => {
  for (const draw of [0, 0.25, 0.5, 0.999]) {
    const delay = nextBlinkDelay(draw);
    assert.ok(delay >= 2500 && delay <= 7000, `delay ${delay} out of range for draw ${draw}`);
  }
});

test('nextHint cycles through the hints and wraps', () => {
  const hints = ['a', 'b', 'c'];
  assert.equal(nextHint(hints, 0), 'b');
  assert.equal(nextHint(hints, 2), 'a');
});

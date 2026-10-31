import { test } from 'node:test';
import assert from 'node:assert/strict';
import cover from '../cover.js';
import companion from '../companion.js';

const { coverProgress, disperse, sampleStep, easeOutCubic } = cover;
const { lineFor, shouldShow } = companion;

test('coverProgress maps scroll over the cover height to 0..1 and clamps', () => {
  assert.equal(coverProgress(0, 900), 0);
  assert.equal(coverProgress(450, 900), 0.5);
  assert.equal(coverProgress(2000, 900), 1);
  assert.equal(coverProgress(-20, 900), 0);
  assert.equal(coverProgress(100, 0), 1);
});

test('disperse leaves a particle at home at progress 0 and pushes it away from the centre as progress grows', () => {
  const home = { x: 700, y: 400 };
  const centre = { x: 600, y: 450 };
  assert.deepEqual(disperse(home, centre, 0, 2), home);
  const moved = disperse(home, centre, 0.5, 2);
  assert.ok(moved.x > home.x);
  assert.ok(moved.y < home.y);
});

test('sampleStep is coarser on narrow screens', () => {
  assert.equal(sampleStep(1440), 2);
  assert.equal(sampleStep(390), 3);
});

test('easeOutCubic starts at 0, ends at 1, and decelerates', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.ok(easeOutCubic(0.5) > 0.5);
});

test('lineFor returns the section line or the fallback', () => {
  const lines = { about: 'A', projects: 'B' };
  assert.equal(lineFor('projects', lines, 'Z'), 'B');
  assert.equal(lineFor('unknown', lines, 'Z'), 'Z');
  assert.equal(lineFor(null, lines, 'Z'), 'Z');
});

test('shouldShow is true only once the hero has scrolled above the viewport, no sheet is open, and the guide is not dismissed', () => {
  assert.equal(shouldShow({ heroBottom: -10, sheetOpen: false, dismissed: false }), true);
  assert.equal(shouldShow({ heroBottom: 200, sheetOpen: false, dismissed: false }), false);
  assert.equal(shouldShow({ heroBottom: -10, sheetOpen: true, dismissed: false }), false);
  assert.equal(shouldShow({ heroBottom: -10, sheetOpen: false, dismissed: true }), false);
});

const { runwayProgress, project } = cover;

test('runwayProgress spans the pinned distance (runway minus one viewport) and clamps', () => {
  assert.equal(runwayProgress(0, 2400, 900), 0);
  assert.equal(runwayProgress(750, 2400, 900), 0.5);
  assert.equal(runwayProgress(1500, 2400, 900), 1);
  assert.equal(runwayProgress(9999, 2400, 900), 1);
  assert.equal(runwayProgress(10, 900, 900), 1);
});

test('project pushes points away from the centre and grows them as the camera approaches their depth', () => {
  const centre = { x: 500, y: 400 };
  const at0 = project({ x: 600, y: 400, z: 1 }, centre, 0);
  assert.ok(Math.abs(at0.x - 600) < 1e-9);
  assert.equal(at0.scale, 1);
  const closer = project({ x: 600, y: 400, z: 1 }, centre, 0.5);
  assert.ok(closer.x > 600);
  assert.ok(closer.scale > 1);
  assert.equal(project({ x: 600, y: 400, z: 1 }, centre, 1.2), null, 'a point behind the camera is dropped');
});

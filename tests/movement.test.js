import test from 'node:test';
import assert from 'node:assert/strict';
import { WALK_SPEED, RUN_SPEED, stickInput, moveWithCollision } from '../src/movement.js';

test('small and large joystick layouts retain analog input and clamp diagonal travel', () => {
  for (const radius of [32, 40, 50]) {
    assert.deepEqual(stickInput(0, 0, radius), { x: 0, y: 0 });
    assert.deepEqual(stickInput(radius / 2, 0, radius), { x: .5, y: 0 });
    const full = stickInput(radius * 3, radius * 3, radius);
    assert.ok(Math.abs(Math.hypot(full.x, full.y) - 1) < 1e-12);
  }
});

test('walking covers the same distance at 60, 10 and 5 frames per second', () => {
  for (const frames of [5, 10, 60]) {
    const position = { x: 0, z: 0 };
    for (let frame = 0; frame < frames; frame++) moveWithCollision(position, 1, 0, WALK_SPEED, 1 / frames, () => true);
    assert.ok(Math.abs(position.x - WALK_SPEED) < 1e-10);
    assert.equal(position.z, 0);
  }
});

test('running through a long frame respects a thin wall and slides along it', () => {
  const position = { x: 0, z: 0 };
  moveWithCollision(position, 1, 1, RUN_SPEED, .1, x => x < .4 || x > .9);
  assert.ok(position.x < .4, 'must not jump to the other side of the wall');
  assert.ok(Math.abs(position.z - RUN_SPEED * .1) < 1e-12, 'unblocked axis should keep moving');
});

test('starting inside an obstacle can always move out, then collides normally again', () => {
  const post = { x: 0, z: 0, r: .3 }, walk = (x, z) => Math.hypot(x - post.x, z - post.z) > .6;
  const p = { x: .2, z: 0 };
  moveWithCollision(p, 1, 0, WALK_SPEED, .2, walk);
  assert.ok(p.x > .6, 'escapes the overlap');
  const q = { x: -2, z: 0 }; moveWithCollision(q, 1, 0, WALK_SPEED, 1, walk);
  assert.ok(q.x <= -.6, 'from outside it still stops at the obstacle');
});

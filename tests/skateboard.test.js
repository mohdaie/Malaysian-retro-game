import test from 'node:test';
import assert from 'node:assert/strict';
import { stepSkate, SKATE } from '../src/skateboard.js';

const fresh = () => ({ x: 0, z: 0, heading: 0, speed: 0, lean: 0 });
const ride = (board, input, seconds) => { for (let t = 0; t < seconds; t += 1 / 60) stepSkate(board, input, 1 / 60); };

test('a standard skateboard: 80 cm deck, 20 cm wide, 55 mm wheels, 36 cm between the trucks', () => {
  assert.ok(Math.abs(SKATE.length - .8) < .02);
  assert.ok(Math.abs(SKATE.width - .2) < .01);
  assert.ok(Math.abs(SKATE.wheel * 2 - .055) < .002, 'wheel diameter is about 55 mm');
  assert.ok(Math.abs(SKATE.wheelbase - .36) < .02);
});
test('pushing builds up to cruising speed, Run to the faster speed, and rolling slows only gradually', () => {
  const board = fresh();
  ride(board, { dx: 0, dz: 1 }, 4);
  assert.ok(Math.abs(board.speed - SKATE.cruise) < .01);
  ride(board, { dx: 0, dz: 1, fast: true }, 2);
  assert.ok(Math.abs(board.speed - SKATE.fast) < .01);
  const before = board.speed; ride(board, { dx: 0, dz: 0 }, 1);
  assert.ok(board.speed < before && board.speed > before - 1, 'it rolls on rather than stopping dead');
});
test('the board turns gradually, leans into the corner, and brakes when the stick is pulled back', () => {
  const board = fresh(); ride(board, { dx: 0, dz: 1 }, 3);
  stepSkate(board, { dx: 1, dz: 0 }, 1 / 60);
  assert.ok(board.heading > 0 && board.heading < .1, 'no instant snap');
  ride(board, { dx: 1, dz: 0 }, .3);
  assert.ok(board.lean < 0, 'leans into a right-hand turn');
  ride(board, { dx: 1, dz: 0 }, 2);
  assert.ok(Math.abs(board.heading - Math.PI / 2) < .05);
  const speed = board.speed; stepSkate(board, { dx: -1, dz: 0 }, .1);
  assert.ok(board.speed < speed, 'pulling back brakes');
});
test('a board never rolls backwards: pulling back at a stop does nothing', () => {
  const board = fresh();
  ride(board, { dx: 0, dz: -1 }, 1.5);
  assert.equal(board.speed, 0);
  assert.ok(Math.abs(board.heading) < 1e-9, 'the heading stays put');
});
import { ollieSkate, kickflipSkate, stepSkateAir, airTimeLeft, pushFoot } from '../src/skateboard.js';

const grounded = () => ({ ...fresh(), y: 0, vy: 0, air: false, airTime: 0, pitch: 0, flip: null });
const fly = board => { let trick = null, top = 0, turned = 0, t = 0; while (!trick && t < 3) { trick = stepSkateAir(board, 1 / 60); top = Math.max(top, board.y); if (board.flip !== null) turned = board.flip; t += 1 / 60; } return { trick, top, turned, t }; };

test('an ollie pops about a third of a metre, noses up, and lands flat in about half a second', () => {
  const board = grounded();
  assert.equal(ollieSkate(board), true);
  assert.equal(ollieSkate(board), false, 'no second pop in the air');
  for (let i = 0; i < 9; i++) stepSkateAir(board, 1 / 60);
  assert.ok(board.pitch > .2, 'nose up after the pop');
  const { trick, top, t } = fly(board);
  assert.equal(trick, 'ollie');
  assert.ok(top > .25 && top < .45, `height ${top}`);
  assert.ok(t > .25 && t < .45, 'the rest of the air time');
  assert.deepEqual([board.air, board.y, board.pitch, board.flip], [false, 0, 0, null]);
});
test('a kickflip turns the board once about its length before it lands, and only once per jump', () => {
  const board = grounded();
  assert.equal(kickflipSkate(board), true, 'from the ground it pops with the flip');
  assert.equal(kickflipSkate(board), false, 'never twice in one jump');
  const { trick, turned } = fly(board);
  assert.equal(trick, 'kickflip');
  assert.ok(Math.abs(turned - Math.PI * 2) < 1e-9, 'a full turn before touchdown');
  assert.equal(board.flip, null);
});
test('a kickflip late in the air is refused, so the board always lands wheels down', () => {
  const board = grounded(); ollieSkate(board);
  while (airTimeLeft(board) >= SKATE.flipTime) stepSkateAir(board, 1 / 60);
  assert.equal(kickflipSkate(board), false);
  assert.equal(fly(board).trick, 'ollie');
});
test('pushing is reported while speeding up, and the push stroke starts and ends on the tail', () => {
  const board = fresh();
  assert.equal(stepSkate(board, { dx: 0, dz: 1 }, 1 / 60), true);
  ride(board, { dx: 0, dz: 1 }, 4);
  assert.equal(stepSkate(board, { dx: 0, dz: 1 }, 1 / 60), false, 'at cruising speed the rider rides');
  for (const phase of [0, .999]) { const f = pushFoot(phase); assert.ok(Math.abs(f.x) < .01 && Math.abs(f.z + .16) < .01 && f.down < .01, `phase ${phase}`); }
  const planted = pushFoot(.3); assert.equal(planted.down, 1); assert.ok(planted.x < 0, 'on the toe side');
  assert.ok(pushFoot(.2).z > pushFoot(.5).z, 'the planted foot sweeps back');
});

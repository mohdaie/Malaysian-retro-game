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

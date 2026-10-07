import test from 'node:test';
import assert from 'node:assert/strict';
import { stepBike, BIKE } from '../src/bicycle.js';

const fresh = () => ({ x: 0, z: 0, heading: 0, speed: 0, steer: 0, lean: 0 });
const ride = (bike, input, seconds) => { let pedalled = false; for (let t = 0; t < seconds; t += 1 / 60) pedalled = stepBike(bike, input, 1 / 60) || pedalled; return pedalled; };

test('pedalling builds up to cruising speed, Run to the faster speed, and coasting slows down', () => {
  const bike = fresh();
  assert.equal(ride(bike, { dx: 0, dz: 1 }, 4), true);
  assert.ok(Math.abs(bike.speed - BIKE.cruise) < .01);
  ride(bike, { dx: 0, dz: 1, fast: true }, 2);
  assert.ok(Math.abs(bike.speed - BIKE.fast) < .01);
  const before = bike.speed; assert.equal(ride(bike, { dx: 0, dz: 0 }, 1), false);
  assert.ok(bike.speed < before && bike.speed > 0, 'it freewheels rather than stopping dead');
});
test('the bike turns gradually, leans into the corner, and brakes before turning back', () => {
  const bike = fresh(); ride(bike, { dx: 0, dz: 1 }, 3);
  stepBike(bike, { dx: 1, dz: 0 }, 1 / 60);
  assert.ok(bike.heading > 0 && bike.heading < .1, 'no instant snap');
  ride(bike, { dx: 1, dz: 0 }, .3);
  assert.ok(bike.lean < 0, 'leans into a right-hand turn');
  ride(bike, { dx: 1, dz: 0 }, 2);
  assert.ok(Math.abs(bike.heading - Math.PI / 2) < .05);
  const speed = bike.speed; stepBike(bike, { dx: -1, dz: 0 }, .1);
  assert.ok(bike.speed < speed, 'pulling back the other way brakes');
});

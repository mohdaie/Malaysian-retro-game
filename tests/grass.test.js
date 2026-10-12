import test from 'node:test';
import assert from 'node:assert/strict';
import { derive, TOWN_BOUNDS, GROUND, RIVER } from '../src/town-layout.js';
import { TOWN_PLAN } from '../src/town-plan.js';
import { grassMask } from '../src/grass.js';

// The grass mask decides where the living grass grows: R density, G length.
const town = derive(TOWN_PLAN), mask = grassMask(town, TOWN_BOUNDS, GROUND, RIVER);
const read = (x, z) => { const i = Math.floor((x - mask.minX) * 2), j = Math.floor((z - mask.minZ) * 2), k = (j * mask.width + i) * 4; return { grows: mask.data[k], length: mask.data[k + 1] }; };

test('the grass mask covers the ground at two pixels a metre', () => {
  assert.equal(mask.width, (GROUND.maxX - GROUND.minX) * 2);
  assert.equal(mask.height, (GROUND.maxZ - GROUND.minZ) * 2);
});
test('no grass on asphalt, building floors, bridges or in the river', () => {
  for (const r of town.roads.filter(r => r.kind === 'asphalt')) assert.equal(read(r.x, r.z).grows, 0, r.id);
  for (const u of town.units.filter(u => !u.def.vehicle)) for (const [x, z] of u.solids) assert.equal(read(x, z).grows, 0, u.id);
  for (const b of town.bridges) assert.equal(read(b.x, b.z).grows, 0);
  assert.equal(read(RIVER.x, 0).grows, 0);
});
test('the field past the town edge grows long, yards are kept short', () => {
  const outside = read(TOWN_BOUNDS.maxX + 6, 0), yard = town.units.find(u => u.id === 'home');
  assert.equal(outside.grows, 255);
  assert.ok(outside.length > 200);
  const [ax, az, aw] = yard.area, beside = read(ax + aw / 2 + 1.5, az);
  assert.ok(beside.length <= 70);
});

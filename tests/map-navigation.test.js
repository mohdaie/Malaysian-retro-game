import test from 'node:test';
import assert from 'node:assert/strict';
import { mapView, project, unproject, zoomView, clampView, findWalkRoute, clearSegment, routeLength } from '../src/map-navigation.js';

test('map stays undistorted and taps invert the same projection at phone sizes', () => {
  for (const [w, h] of [[310, 220], [530, 290], [840, 650]]) {
    const v = mapView(w, h, 3, 15, -8), p = { x: -32, z: 46 };
    const q = unproject(v, project(v, p));
    assert.ok(Math.abs(q.x - p.x) < 1e-10 && Math.abs(q.z - p.z) < 1e-10);
    assert.ok(Math.abs((project(v, { x: 1, z: 0 }).x - project(v, { x: 0, z: 0 }).x) - (project(v, { x: 0, z: 1 }).y - project(v, { x: 0, z: 0 }).y)) < 1e-10);
  }
});
test('pinch/wheel zoom keeps the ground under the finger and clamps the view', () => {
  const v = mapView(530, 300, 3), anchor = { x: 300, y: 140 }, p = unproject(v, anchor), next = zoomView(v, 4, anchor);
  const q = unproject(next, anchor); assert.ok(Math.hypot(q.x - p.x, q.z - p.z) < 1e-10);
  assert.equal(zoomView(v, 99).zoom, 6); assert.equal(zoomView(v, .2).zoom, 1);
  const clamped = clampView({ ...v, x: 1e6, z: -1e6 }); assert.ok(clamped.x < 82 && clamped.z > -70);
});
const bounds = { minX: -12, maxX: 12, minZ: -12, maxZ: 12 };
function valid(path, canWalk) { assert.ok(path?.length > 1); for (let i = 1; i < path.length; i++) assert.ok(clearSegment(path[i - 1], path[i], canWalk)); }
test('walking guide goes through a gate rather than through the fence', () => {
  const walk = (x, z) => x >= -12 && x <= 12 && z >= -12 && z <= 12 && !(Math.abs(x) < .4 && z < 7);
  const path = findWalkRoute({ x: -8, z: -8 }, { x: 8, z: -8 }, walk, bounds);
  valid(path, walk); assert.ok(path.some(p => p.z >= 7)); assert.ok(routeLength(path) > 32);
});
test('river routes use the bridge and unreachable destinations give no route', () => {
  const walk = (x, z) => !(Math.abs(x) < 2 && Math.abs(z - 6) > 1.5);
  const path = findWalkRoute({ x: -8, z: -6 }, { x: 8, z: -6 }, walk, bounds);
  valid(path, walk); assert.ok(path.some(p => p.z > 4.4));
  assert.equal(findWalkRoute({ x: -8, z: 0 }, { x: 8, z: 0 }, (x, z) => Math.abs(x) > 2, bounds), null);
});
test('a person marker ends at a clear interaction spot, and blocked starts fail safely', () => {
  const walk = (x, z) => Math.hypot(x - 6, z) > .6;
  const path = findWalkRoute({ x: -6, z: 0 }, { x: 6, z: 0 }, walk, bounds); valid(path, walk);
  assert.ok(Math.hypot(path.at(-1).x - 6, path.at(-1).z) < 2);
  assert.equal(findWalkRoute({ x: 6, z: 0 }, { x: 1, z: 1 }, walk, bounds), null);
});

test('all 38 town doors get clear routes from both player homes with trees and props', async () => {
  const { derive, PLAN, TOWN_BOUNDS, PROPS } = await import('../src/town-layout.js');
  const { plantTown, placeProps, TRUNK } = await import('../src/planting.js');
  const { createWalkability } = await import('../src/collision.js');
  const town = derive(PLAN), obstacles = [
    ...town.units.flatMap(u => u.solids.map(([x,z,w,d]) => ({x,z,w,d}))),
    ...plantTown(town).filter(p => p.ring === 'in').map(p => ({x:p.x,z:p.z,r:TRUNK[p.kind]*p.size})),
    ...placeProps(town).filter(p => !PROPS[p.name].wall && PROPS[p.name].hit).map(p => ({x:p.x,z:p.z,r:PROPS[p.name].hit}))
  ];
  const walk = createWalkability(obstacles);
  for (const start of [town.spots.spawn,town.spots.spawnNur]) for (const b of town.buildings) {
    const path = findWalkRoute(start,b.door,walk,TOWN_BOUNDS);
    assert.ok(path,`${b.name} from ${start.x},${start.z}`);valid(path,walk);
    assert.ok(Math.hypot(path.at(-1).x-b.door.x,path.at(-1).z-b.door.z)<2);
  }
});

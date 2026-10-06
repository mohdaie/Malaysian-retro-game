import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { TOWN_PLAN } from '../src/town-plan.js';
import { derive, TOWN_BOUNDS as B, RIVER } from '../src/town-layout.js';
import { plantTown, TRUNK, GROUND } from '../src/planting.js';
import { createTrees } from '../src/trees.js';
import { toon } from '../src/illustration.js';
import { createWalkability } from '../src/collision.js';
import { npcPosts } from '../src/cast.js';

const town = derive(TOWN_PLAN), plants = plantTown(town);
const inTown = plants.filter(p => p.ring === 'in'), past = plants.filter(p => p.ring !== 'in');
const inRect = (x, z, [rx, rz, w, d], pad = 0) => Math.abs(x - rx) < w / 2 + pad && Math.abs(z - rz) < d / 2 + pad;

test('planting is deterministic and every kind has a trunk and a model', () => {
  assert.deepEqual(plantTown(derive(TOWN_PLAN)), plants);
  const trees = createTrees({ parent: () => new T.Group(), toon, register: (key, material) => material });
  assert.deepEqual(Object.keys(TRUNK).filter(kind => !trees.species.includes(kind)), []);
  for (const p of plants) assert.ok(TRUNK[p.kind], p.kind);
});
test('every species builds finite low-poly geometry, lighter in the far rows', () => {
  const group = new T.Group(), trees = createTrees({ parent: () => group, toon, register: (key, material) => material });
  for (const kind of Object.keys(TRUNK)) for (const ring of ['in', 'far']) {
    const before = group.children.length, triangles = trees.plant({ kind, x: 4, z: -6, size: 1, seed: 7, ring });
    assert.ok(triangles > 0 && triangles <= (ring === 'far' && !['hujan', 'beringin', 'kemboja'].includes(kind) ? 650 : 1500), `${kind} ${ring}: ${triangles}`);
    for (const mesh of group.children.slice(before)) assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite), kind);
  }
});
test('trees in town stay off roads, bridges, the river, buildings and people', () => {
  const people = [town.spots.spawn, town.spots.spawnNur, town.spots.stall, ...Object.values(npcPosts(town.buildings)).map(p => p.spots[0]), ...town.passersby];
  for (const p of inTown) {
    const r = TRUNK[p.kind] * p.size, where = `${p.kind} at ${p.x},${p.z}`;
    assert.ok(p.x - r > B.minX && p.x + r < B.maxX && p.z - r > B.minZ && p.z + r < B.maxZ, where);
    assert.ok(Math.abs(p.x - RIVER.x) > RIVER.w / 2 + r, where);
    assert.ok(!town.roads.some(road => inRect(p.x, p.z, [road.x, road.z, road.w, road.d], r)), where);
    assert.ok(!town.bridges.some(b => inRect(p.x, p.z, [b.x, b.z, b.w, b.d], r + 1)), where);
    assert.ok(!town.units.some(u => u.solids.some(s => inRect(p.x, p.z, s, r))), where);
    assert.ok(people.every(s => Math.hypot(p.x - s.x, p.z - s.z) > r + 1.5), where);
  }
});
test('a dense orchard and rubber edge rings the town, with the roads left open', () => {
  assert.ok(past.length >= 250, `${past.length} edge trees`);
  assert.ok(past.filter(p => p.kind === 'getah').length >= 80 && past.some(p => p.kind === 'durian'));
  for (const p of past) {
    assert.ok(p.x < B.minX || p.x > B.maxX || p.z < B.minZ || p.z > B.maxZ, `${p.kind} at ${p.x},${p.z} is past the edge`);
    assert.ok(p.x >= GROUND.minX && p.x <= GROUND.maxX && p.z >= GROUND.minZ && p.z <= GROUND.maxZ);
    assert.ok(Math.abs(p.x - RIVER.x) > RIVER.w / 2 + 1);
  }
  // The main road leaves town at both ends through a gap in the trees.
  const main = town.roads.find(r => r.id === 'main-road');
  assert.ok(!past.some(p => Math.abs(p.z - main.z) < main.d / 2 + 1.5));
});
test('the old beringin stands by the warung and moves with it', () => {
  const near = plan => { const t = derive(plan), b = plantTown(t).filter(p => p.kind === 'beringin'); return [b, t.spots.stall]; };
  let [b, pak] = near(TOWN_PLAN);
  assert.equal(b.length, 1); assert.ok(Math.hypot(b[0].x - pak.x, b[0].z - pak.z) <= 24);
  const moved = structuredClone(TOWN_PLAN); Object.assign(moved.units.find(u => u.id === 'warung'), { x: 40, z: 47 });
  [b, pak] = near(moved);
  assert.ok(b.length <= 1 && b.every(t => Math.hypot(t.x - pak.x, t.z - pak.z) <= 24));
});
test('with the trees planted, every numbered place can still be reached on foot', () => {
  const obstacles = [...town.units.flatMap(u => u.solids.map(([x, z, w, d]) => ({ x, z, w, d }))), ...inTown.map(p => ({ x: p.x, z: p.z, r: TRUNK[p.kind] * p.size }))];
  const walk = createWalkability(obstacles), step = .5, nx = Math.round((B.maxX - B.minX) / step), nz = Math.round((B.maxZ - B.minZ) / step);
  const seen = new Uint8Array((nx + 1) * (nz + 1)), at = (i, j) => j * (nx + 1) + i, cell = v => Math.round(v / step);
  const start = [cell(town.spots.spawn.x - B.minX), cell(town.spots.spawn.z - B.minZ)], queue = [start]; seen[at(...start)] = 1;
  while (queue.length) {
    const [i, j] = queue.pop();
    for (const [a, c] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) if (a >= 0 && c >= 0 && a <= nx && c <= nz && !seen[at(a, c)] && walk(B.minX + a * step, B.minZ + c * step)) { seen[at(a, c)] = 1; queue.push([a, c]); }
  }
  const reach = (x, z) => { const i = cell(x - B.minX), j = cell(z - B.minZ); return i >= 0 && j >= 0 && i <= nx && j <= nz && seen[at(i, j)] === 1; };
  const unreached = town.buildings.filter(b => {
    for (let d = 1; d <= 3; d += .5) for (let t = -.5; t <= .5; t += .1)
      if ([[b.x + t * b.w, b.z + b.d / 2 + d], [b.x + t * b.w, b.z - b.d / 2 - d], [b.x + b.w / 2 + d, b.z + t * b.d], [b.x - b.w / 2 - d, b.z + t * b.d]].some(([x, z]) => reach(x, z))) return false;
    return true;
  }).map(b => b.name);
  assert.deepEqual(unreached, []);
  for (const s of [town.spots.spawnNur, town.spots.stall, ...Object.values(npcPosts(town.buildings)).map(p => p.spots[0])]) assert.ok([[0, 1.2], [1.2, 0], [0, -1.2], [-1.2, 0]].some(([dx, dz]) => reach(s.x + dx, s.z + dz)));
});

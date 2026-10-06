import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWN_PLAN } from '../src/town-plan.js';
import { KINDS, PLACES, TOWN_BOUNDS, derive, planProblems, planFromHash, toWorld, rectToWorld, districtAt } from '../src/town-layout.js';

const copy = () => structuredClone(TOWN_PLAN);
const unit = (plan, id) => plan.units.find(u => u.id === id);
const encode = plan => Buffer.from(JSON.stringify(plan)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

test('the saved town plan has no layout errors or warnings', () => {
  assert.deepEqual(planProblems(TOWN_PLAN), []);
});
test('every numbered place appears once and each unit fills its kind\'s slots', () => {
  const town = derive(TOWN_PLAN);
  assert.deepEqual(town.buildings.map(b => b.id), Object.keys(PLACES).map(Number));
  for (const u of TOWN_PLAN.units) assert.equal(u.places.length, KINDS[u.kind].places.length, u.id);
  assert.ok(town.spots.spawn && town.spots.nur && town.spots.pak);
});
test('quarter turns follow Three.js rotation.y and swap rect sides', () => {
  for (let rot = 0; rot < 4; rot++) {
    const u = { x: 3, z: -2, rot }, t = rot * Math.PI / 2, [x, z] = toWorld(u, 1.5, 4);
    assert.ok(Math.abs(x - (3 + 1.5 * Math.cos(t) + 4 * Math.sin(t))) < 1e-9);
    assert.ok(Math.abs(z - (-2 - 1.5 * Math.sin(t) + 4 * Math.cos(t))) < 1e-9);
    const [, , w, d] = rectToWorld(u, [0, 0, 6, 2]);
    assert.deepEqual([w, d], rot % 2 ? [2, 6] : [6, 2]);
  }
});
test('turning a unit carries its floors, places and people with it', () => {
  const plan = copy(); unit(plan, 'home').rot = 2;
  const town = derive(plan), home = town.units.find(u => u.id === 'home');
  const verandah = home.floors.find(f => f[4] === 1.525);
  assert.ok(Math.abs(verandah[1] - (27 - 5.125)) < 1e-9, 'verandah now faces -z');
  assert.ok(Math.abs(town.spots.spawn.z - (27 - 11)) < 1e-9);
  assert.ok(Math.abs(town.spots.spawn.heading - Math.PI) < 1e-9);
});
test('the checker reports overlaps, the river, the town edge and buildings on roads', () => {
  let plan = copy(); Object.assign(unit(plan, 'mosque'), { x: 20, z: -22 });
  assert.ok(planProblems(plan).some(p => p.level === 'error' && p.units.includes('mosque') && p.units.includes('shops')));
  plan = copy(); unit(plan, 'wakaf').x = -65;
  assert.ok(planProblems(plan).some(p => p.level === 'error' && /river/.test(p.text)));
  plan = copy(); unit(plan, 'pondok').x = -80;
  assert.ok(planProblems(plan).some(p => p.level === 'error' && /outside/.test(p.text)));
  plan = copy(); Object.assign(unit(plan, 'hall'), { x: 0, z: 4 });
  assert.ok(planProblems(plan).some(p => p.level === 'warning' && p.roads?.includes('main-road')));
  plan = copy(); Object.assign(unit(plan, 'car-red'), { x: -40, z: 4 });
  assert.ok(!planProblems(plan).some(p => p.units.includes('car-red')), 'vehicles may park on roads');
});
test('canteen and court may stand inside the school yard but not on its buildings', () => {
  const plan = copy(); Object.assign(unit(plan, 'court'), { x: 4, z: -36 });
  assert.ok(!planProblems(plan).some(p => p.units.includes('court')));
  Object.assign(unit(plan, 'court'), { x: 0, z: -48 });
  assert.ok(planProblems(plan).some(p => p.level === 'error' && p.units.includes('court') && p.units.includes('school')));
});
test('district names follow the nearest numbered place', () => {
  assert.equal(districtAt(-43, 38).id, 'kampung');
  assert.equal(districtAt(12, -3).id, 'pekan');
  assert.equal(districtAt(48, 20).id, 'terrace');
});
test('preview links accept valid plans only', () => {
  const plan = copy(); unit(plan, 'mosque').rot = 1;
  assert.equal(planFromHash('#plan=' + encode(plan)).units.find(u => u.id === 'mosque').rot, 1);
  const broken = copy(); unit(broken, 'wakaf').x = -65;
  assert.equal(planFromHash('#plan=' + encode(broken)), null);
  assert.equal(planFromHash('#plan=not-json'), null);
  assert.equal(planFromHash(''), null);
  for (const b of derive(TOWN_PLAN).buildings) assert.ok(b.x - b.w / 2 >= TOWN_BOUNDS.minX - .01 && b.x + b.w / 2 <= TOWN_BOUNDS.maxX + .01, b.name);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { TOWN_PLAN } from '../src/town-plan.js';
import { KINDS, CATEGORIES, DEFAULT_BOUNDS, BOUNDS_LIMIT, boundsOf, groundOf, customLook, derive, planProblems, planFromHash } from '../src/town-layout.js';

// Plans made in the map editor: a bigger town edge, extra copies of built-in
// kinds and custom buildings. Templates ride along and the game ignores them.
const copy = () => structuredClone(TOWN_PLAN);
const encode = plan => Buffer.from(JSON.stringify(plan)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const errors = plan => planProblems(plan).filter(p => p.level === 'error');

test('every kind has a library category, and the shipped plan keeps the original edge', () => {
  const ids = new Set(CATEGORIES.map(c => c.id));
  for (const [kind, def] of Object.entries(KINDS)) assert.ok(ids.has(def.cat), kind);
  assert.equal(TOWN_PLAN.bounds, undefined);
  assert.deepEqual(boundsOf(TOWN_PLAN), DEFAULT_BOUNDS);
  assert.deepEqual(groundOf(DEFAULT_BOUNDS), { minX: -89, maxX: 89, minZ: -79, maxZ: 79 });
});
test('the town edge comes from the plan, within limits', () => {
  assert.deepEqual(boundsOf({ bounds: { minX: -999, maxZ: 5 } }), { ...DEFAULT_BOUNDS, minX: -BOUNDS_LIMIT, maxZ: 20 });
  const plan = copy(); plan.units.push({ id: 'house-far', kind: 'house', x: 0, z: -90, rot: 0 });
  assert.ok(errors(plan).some(p => p.units.includes('house-far') && /town edge/.test(p.text)));
  plan.bounds = { ...DEFAULT_BOUNDS, minZ: -106 };
  assert.deepEqual(errors(plan), []);
});
test('extra copies of a kind have no numbered place and pass the checks', () => {
  const plan = copy(); plan.units.push({ id: 'house-9', kind: 'house', x: 0, z: -90, rot: 0, name: 'Rumah Pak Long' }, { id: 'sedan-9', kind: 'sedan', x: 0, z: -80, rot: 1 });
  plan.bounds = { ...DEFAULT_BOUNDS, minZ: -106 };
  const town = derive(plan);
  assert.equal(town.buildings.length, 38);
  assert.deepEqual(town.units.find(u => u.id === 'house-9').places, []);
  assert.deepEqual(planProblems(plan), []);
  assert.ok(town.props.some(p => p.unit === 'house-9'), 'the copy keeps its yard props');
});
test('unique kinds and ids cannot be doubled', () => {
  const plan = copy(); plan.units.push({ id: 'warung-2', kind: 'warung', x: 0, z: -90, rot: 0 });
  assert.ok(errors(plan).some(p => p.units.includes('warung-2')));
  const twin = copy(); twin.units.push({ ...twin.units.find(u => u.kind === 'sedan'), x: 70, z: -60 });
  assert.ok(errors(twin).some(p => /share one id/.test(p.text)));
});
test('custom buildings take their size from the plan and are cleaned', () => {
  const plan = copy(); plan.bounds = { ...DEFAULT_BOUNDS, minZ: -106 };
  plan.units.push({ id: 'custom-2', kind: 'custom', x: 0, z: -90, rot: 1, style: 'block', w: 14, d: 8, storeys: 2, name: 'Kedai Kopi' });
  const u = derive(plan).units.find(x => x.id === 'custom-2');
  assert.deepEqual(u.solids, [[0, -90, 9, 15]], 'a quarter turn swaps width and depth');
  assert.equal(u.def.label, 'Kedai Kopi');
  assert.deepEqual(planProblems(plan), []);
  const odd = customLook({ style: 'castle', w: 500, d: 'x', storeys: 9, wall: 'red', roof: 'dome', name: 'A'.repeat(60) });
  assert.deepEqual([odd.style, odd.w, odd.d, odd.storeys, odd.wall, odd.roof, odd.name.length], ['block', 80, 8, 4, '#e8dbb8', 'pitched', 40]);
  for (const style of ['kampung', 'wakaf', 'plaza']) assert.ok(derive({ units: [{ id: 'c', kind: 'custom', x: 0, z: 0, style }], roads: [] }).units[0].solids.length, style);
});
test('extra buildings on an asphalt road are flagged; custom plazas may sit on one', () => {
  const plan = copy(), road = plan.roads.find(r => r.kind === 'asphalt' && r.w > r.d);
  plan.units.push({ id: 'custom-2', kind: 'custom', x: road.x + road.w / 4, z: road.z, rot: 0, w: 6, d: 4 });
  assert.ok(planProblems(plan).some(p => p.level === 'warning' && p.units.includes('custom-2')));
  plan.units.at(-1).style = 'plaza';
  assert.ok(!planProblems(plan).some(p => p.level === 'warning' && p.units.includes('custom-2')));
});
test('preview links carry editor plans with bounds, extras and templates', () => {
  const plan = copy(); plan.bounds = { ...DEFAULT_BOUNDS, maxX: 106 };
  plan.units.push({ id: 'custom-2', kind: 'custom', x: 95, z: 0, rot: 0, style: 'kampung', w: 9, d: 7 });
  plan.templates = [{ id: 'template-1', name: 'Rumah biru', cat: 'rumah', style: 'kampung', w: 9, d: 7, wall: '#89b0ca' }];
  assert.deepEqual(planFromHash('#plan=' + encode(plan)), plan);
});

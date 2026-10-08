import test from 'node:test';
import assert from 'node:assert/strict';
import { ERRANDS, ERRAND_KEYS, tripAt, createErrand } from '../src/errands.js';
import { createRoutine, ROUTINES } from '../src/routines.js';
import { ACTIONS } from '../src/actions.js';
import { RESIDENTS, KEEPERS, keeperAt, residentPlace, NPCS, contactAt } from '../src/cast.js';
import { HOURS } from '../src/clock.js';
import { BUILDINGS } from '../src/town-layout.js';

test('every errand runner leaves someone at home, and trips fit the day', () => {
  const [open, close] = HOURS.default, places = new Set(BUILDINGS.map(b => b.id));
  for (const key of ERRAND_KEYS) {
    const home = residentPlace(key), { keeper, trips } = ERRANDS[key];
    assert.ok(RESIDENTS[home], `${key} is a resident`);
    assert.equal(KEEPERS[keeper]?.place, home, `${key}'s house is kept by ${keeper}`);
    assert.equal(keeperAt(home), keeper);
    let last = open;
    for (const t of trips) {
      assert.ok(places.has(t.to) && t.to !== home, `${key} goes somewhere else`);
      assert.ok(t.from >= last && t.until > t.from, `${key}'s trips are in order and do not overlap`);
      assert.ok(t.until <= close - 30, `${key} is home well before dark`);
      assert.ok(t.say.length > 10, `${key} has something to say`);
      last = t.until;
    }
  }
  // Every keeper is someone's: no house keeper stands idle without a runner.
  assert.deepEqual(Object.keys(KEEPERS).sort(), ERRAND_KEYS.map(k => ERRANDS[k].keeper).sort());
  // The resident still answers by name; the keeper only stands in.
  for (const k of Object.keys(KEEPERS)) assert.ok(contactAt(KEEPERS[k].place).name !== KEEPERS[k].name);
  assert.ok(!Object.values(KEEPERS).some(k => Object.values(NPCS).some(n => n.place === k.place)), 'keepers are never at an NPC’s place');
});

test('a walker leaves on time, waits at the shop, walks home and settles', () => {
  const key = 'mail', trip = ERRANDS[key].trips[0], home = { x: 0, z: 0, heading: 0 }, spot = { x: 20, z: 0, heading: Math.PI / 2 };
  const routes = { [trip.to]: { path: [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 20, z: 0 }], spot } };
  const free = () => true, w = createErrand(key, home, routes, at => createRoutine(ROUTINES[key], at, free, ACTIONS), at => createRoutine({ steps: [['do', 'talk', 3]] }, at, free, ACTIONS));
  let minute = trip.from - 2;
  const run = (seconds, opts = {}) => { for (let t = 0; t < seconds; t += 1 / 30) { minute += 1 / 30; w.update(1 / 30, minute, opts); } };
  run(1); assert.equal(w.state.phase, 'home'); assert.equal(w.away(), false);
  run(3); assert.equal(w.state.phase, 'out'); assert.ok(w.walking());
  run(25); assert.equal(w.state.phase, 'away'); assert.ok(Math.hypot(w.state.x - 20, w.state.z) < .1, 'arrived at the stand spot');
  assert.ok(w.away(), 'the keeper answers the door while away');
  minute = trip.until - .5; run(2); assert.equal(w.state.phase, 'back');
  run(25); assert.equal(w.state.phase, 'home'); assert.ok(Math.hypot(w.state.x, w.state.z) < 1.6, 'back at the door');
  // Someone standing in the path: wait, then squeeze past rather than stand forever.
  minute = trip.from; const blocked = (x) => !(x > 4.5 && x < 5.5);
  w.update(1 / 30, minute, {}); for (let i = 0; i < 30 * 6; i++) w.update(1 / 30, minute, { free: blocked });
  assert.ok(w.state.x < 4.6, 'waits for whoever is in the way');
  for (let i = 0; i < 30 * 6; i++) w.update(1 / 30, minute, { free: blocked });
  assert.ok(w.state.x > 5.5, 'got past after waiting');
  // Paused (talking), nobody moves.
  const before = w.state.x; for (let i = 0; i < 30; i++) w.update(1 / 30, minute, { pause: true }); assert.equal(w.state.x, before);
  // A load or a sleep jumps straight to where the clock says.
  w.update(1 / 30, trip.from + 30, { sync: true }); assert.equal(w.state.phase, 'away'); assert.ok(Math.hypot(w.state.x - 20, w.state.z) < .1);
  w.update(1 / 30, trip.until + 60, { sync: true }); assert.equal(w.state.phase, 'home'); assert.equal(w.state.x, 0);
  assert.equal(tripAt(key, trip.from - 1), null); assert.equal(tripAt(key, trip.from), trip);
});

test('a resident a story needs stays home: no keeper ever tells their part', async () => {
  const { NOSTALGIA_QUESTS, storyNeedsHome, newNostalgia } = await import('../src/nostalgia-quests.js');
  // Which stories put an errand runner's door on their path?
  const homes = new Map(ERRAND_KEYS.map(k => [residentPlace(k), k])), touched = [];
  for (const [id, q] of Object.entries(NOSTALGIA_QUESTS).filter(([,q])=>q.set!==2)) {
    if (!q.npc && homes.has(q.place)) touched.push([id, 'giver', homes.get(q.place)]);
    q.trail.forEach((t, i) => { if (homes.has(t.place)) touched.push([id, `clue ${i}`, homes.get(t.place)]); });
  }
  assert.deepEqual(touched.map(t => t.join(' ')).sort(), ['nostalgia_G01 clue 0 abu', 'nostalgia_G04 giver kamal', 'nostalgia_I01 clue 0 abu']);
  const eco = { nostalgia: newNostalgia() };
  assert.equal(storyNeedsHome(eco, 6), false, 'an untaken story does not keep anyone in');
  eco.nostalgia.quests.nostalgia_G04 = { stage: 'grind', trail: 0 };
  assert.equal(storyNeedsHome(eco, 6), false, 'nor do errands far from the giver');
  eco.nostalgia.quests.nostalgia_G04.stage = 'ready';
  assert.equal(storyNeedsHome(eco, 6), true, 'Abang Kamal waits at home to hand over the Walkman');
  eco.nostalgia.quests.nostalgia_G01 = { stage: 'trail', trail: 0 };
  assert.equal(storyNeedsHome(eco, 13), true, 'Pak Abu waits at home with the address');
  eco.nostalgia.quests.nostalgia_G01.trail = 1;
  assert.equal(storyNeedsHome(eco, 13), false, 'and goes out again once the clue is found');
  // A walker told to stay heads home even in the middle of a trip.
  const trip = ERRANDS.abu.trips[0], free = () => true, home = { x: 0, z: 0, heading: 0 };
  const routes = { [trip.to]: { path: [{ x: 0, z: 0 }, { x: 8, z: 0 }], spot: { x: 8, z: 0, heading: 0 } } };
  const w = createErrand('abu', home, routes, at => createRoutine(ROUTINES.abu, at, free, ACTIONS), at => createRoutine({ steps: [['stand', 2]] }, at, free, ACTIONS));
  w.update(1 / 30, trip.from + 10, { sync: true }); assert.equal(w.state.phase, 'away');
  for (let i = 0; i < 30 * 12; i++) w.update(1 / 30, trip.from + 10, { stay: true });
  assert.equal(w.state.phase, 'home'); assert.equal(w.away(), false);
});

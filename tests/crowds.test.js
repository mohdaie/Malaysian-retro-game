import test from 'node:test';
import assert from 'node:assert/strict';
import { CROWD, CROWD_KEYS, LOOPS, crowdPose, RUN_SPEED } from '../src/crowds.js';
import { CHARACTER_KINDS } from '../src/characters.js';
import { ACTIONS } from '../src/actions.js';
import { SHARED_SPOTS } from '../src/routines.js';
import { BUILDINGS } from '../src/town-layout.js';
import { NPC_KEYS, RESIDENT_KEYS, KEEPER_KEYS } from '../src/cast.js';

test('every extra has a body, a sane day and known loops', () => {
  const places = new Set(BUILDINGS.map(b => b.id)), taken = new Set([...NPC_KEYS, ...RESIDENT_KEYS, ...KEEPER_KEYS]);
  for (const key of CROWD_KEYS) {
    assert.ok(CHARACTER_KINDS.includes(key) && !taken.has(key), `${key} has its own body`);
    let last = 0;
    for (const o of CROWD[key].outings) {
      if (!o.days) { assert.ok(o.from >= last, `${key}'s outings are in order`); }
      for (const p of [o.out, o.home, ...o.stops.map(s => s.at)].filter(Boolean)) assert.ok(places.has(p), `${key}: place ${p}`);
      let t = o.from;
      for (const s of o.stops) { assert.ok(s.until > t, `${key}: stops end after they start`); assert.ok(LOOPS[s.loop], `${key}: loop ${s.loop}`); t = s.until; }
      assert.ok(t <= 22 * 60, `${key} is in before the town sleeps`);
      if (!o.days) last = t;
    }
  }
  for (const [name, loop] of Object.entries(LOOPS)) for (const [kind, a] of loop.steps) {
    if (kind === 'do') assert.ok(ACTIONS[a], `${name}: ${a}`);
    if (kind === 'walk') assert.ok(SHARED_SPOTS[a], `${name}: ${a}`);
  }
  // It is the school holidays: no kid is out during the morning school run.
  for (const key of CROWD_KEYS.filter(k => CROWD[k].kid)) assert.ok(CROWD[key].outings.every(o => o.from >= 8 * 60), key);
});

test('positions follow the clock: out of the door, at the stop, home again', () => {
  const o = CROWD.adam.outings[0], line = (a, b) => [{ x: a, z: 0 }, { x: b, z: 0 }];
  const legs = [{ 0: line(0, 26), 1: line(26, 52), home: line(52, 0) }], run = 26 / RUN_SPEED;
  assert.equal(crowdPose('adam', o.from - 1, 2, legs), null, 'indoors before');
  const out = crowdPose('adam', o.from + run / 2, 2, legs);
  assert.ok(out.moving && out.run && Math.abs(out.x - 13) < .01, 'halfway out of the door');
  assert.equal(crowdPose('adam', o.from + run + 1, 2, legs).stop.loop, 'guli');
  assert.ok(crowdPose('adam', o.stops[0].until + 1, 2, legs).moving, 'running to the padang');
  assert.equal(crowdPose('adam', o.stops[1].until - 1, 2, legs).stop.loop, 'play');
  assert.ok(crowdPose('adam', o.stops[1].until + 1, 2, legs).moving, 'running home');
  assert.equal(crowdPose('adam', o.stops[1].until + 60, 2, legs), null, 'home again');
  // Saturday only: the pasar malam crowd. Day 1 is a Saturday.
  const pm = CROWD.daud.outings[1].from + 10;
  assert.equal(crowdPose('daud', pm, 1, [{}, {}]).stop.at, 38);
  assert.equal(crowdPose('daud', pm, 2, [{}, {}]), null);
  assert.equal(crowdPose('daud', pm, 8, [{}, {}]).stop.at, 38);
});

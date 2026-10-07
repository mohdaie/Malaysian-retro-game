import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTINES, SHARED_SPOTS, createRoutine } from '../src/routines.js';
import { ACTIONS } from '../src/actions.js';
import { NPC_KEYS } from '../src/cast.js';

test('every NPC has a loop of known steps, actions and spots', () => {
  assert.deepEqual(Object.keys(ROUTINES).sort(), [...NPC_KEYS].sort());
  for (const [key, r] of Object.entries(ROUTINES)) {
    const spots = { ...SHARED_SPOTS, ...(r.spots || {}) };
    for (const [kind, a, b] of r.steps) {
      assert.ok(['stand', 'do', 'walk', 'face'].includes(kind), `${key}: ${kind}`);
      if (kind === 'do') { assert.ok(ACTIONS[a], `${key}: unknown action ${a}`); assert.ok(b > 0); }
      if (kind === 'walk') assert.ok(spots[a], `${key}: unknown spot ${a}`);
    }
    for (const [name, [x, z]] of Object.entries(spots)) assert.ok(Math.hypot(x, z) <= 2.5, `${key}: ${name} stays near the post`);
  }
});
test('every action pose is finite at any moment', () => {
  for (const [name, pose] of Object.entries(ACTIONS)) for (let t = 0; t < 20; t += .37) {
    const p = pose(t), values = [...(p.arms || []).flat(), ...(p.elbows || []), ...(p.torso || []), ...(p.head || [])].filter(v => v != null);
    assert.ok(values.every(Number.isFinite), name);
  }
});
test('a loop walks out and back, skips blocked walks and stops for the player', () => {
  const home = { x: 10, z: 5, heading: 0 }, free = () => true;
  const r = createRoutine({ steps: [['do', 'wave', 1], ['walk', 'right'], ['do', 'look', 1], ['walk', 'home']] }, home, free, ACTIONS);
  let seen = new Set(), far = 0;
  for (let i = 0; i < 600; i++) { const s = r.update(1 / 30); if (s.action) seen.add(s.action); far = Math.max(far, Math.hypot(s.x - home.x, s.z - home.z)); }
  assert.deepEqual([...seen].sort(), ['look', 'wave']); assert.ok(far > 1.3 && far < 1.5, `walked ${far}`);
  // A wall on the right: the walk is dropped and the NPC never leaves home.
  const walled = createRoutine(ROUTINES.lim, home, (x) => x < home.x + .5, ACTIONS);
  assert.ok(!walled.steps.some(s => s.kind === 'walk'), 'blocked walks are dropped');
  for (let i = 0; i < 900; i++) { const s = walled.update(1 / 30); assert.ok(s.x < home.x + .5); }
  // Paused or approached, nobody moves.
  const before = { ...r.state };
  for (let i = 0; i < 60; i++) r.update(1 / 30, { look: { x: 20, z: 5 } });
  assert.equal(r.state.x, before.x); assert.equal(r.state.z, before.z); assert.ok(Math.abs(r.state.heading - Math.PI / 2) < .1, 'turned to the player');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { newGasingRound, throwPhysics, spinAt, meter, windString, startCharge, lockPower, releaseTop, advanceGasing, roundDuration, cleanGasingRound, rivalThrow } from '../src/gasing.js';
import { startGasing, recordGasing, cleanGasingProgress } from '../src/gasing-progress.js';
import { newEconomy, cleanEconomy } from '../src/economy.js';
import { validateSave } from '../src/save.js';
function launched(kind = 'atuk', id = 1, power = .78, release = .5) {
  const s = newGasingRound(kind, id); return releaseTop({ ...s, phase: 'release', power, release });
}
test('timing meter cycles continuously and the clean target outperforms weak and excessive power', () => {
  assert.equal(meter(0), 0); assert.equal(meter(1), 1); assert.equal(meter(2), 0);
  const perfect = throwPhysics(.78, .5);
  for (const [power, release] of [[0, .5], [1, .5], [.78, 0], [.78, 1], [.4, .7]]) {
    const poor = throwPhysics(power, release); assert.ok(perfect.duration > poor.duration); assert.ok(perfect.stability >= poor.stability);
  }
  assert.ok(perfect.duration > 20 && perfect.duration < 30);
  assert.deepEqual(throwPhysics(.7, .54), throwPhysics(.7, .54), 'no random reroll');
  for (const bad of [[-1, .5], [1.1, .5], [.5, NaN], [.5, Infinity]]) assert.throws(() => throwPhysics(...bad), /Invalid/);
});
test('string, hold power and release must happen in order', () => {
  let s = newGasingRound('belajar', 1);
  assert.throws(() => startCharge(s)); assert.throws(() => releaseTop(s)); assert.throws(() => lockPower(s));
  s = windString(s); s = advanceGasing(s, .6); assert.equal(s.phase, 'winding');
  s = advanceGasing(s, .6); assert.equal(s.phase, 'power'); assert.equal(s.power, 0);
  s = advanceGasing(s, 1); assert.equal(s.power, 0, 'meter waits for a hold');
  s = startCharge(s); s = advanceGasing(s, .78 / .7); assert.ok(Math.abs(s.power - .78) < 1e-12);
  s = lockPower(s); assert.equal(s.phase, 'release');
  s = advanceGasing(s, .5 / .65); assert.ok(Math.abs(s.release - .5) < 1e-12);
  s = releaseTop(s); assert.equal(s.phase, 'spin'); assert.equal(s.player.stability, 1);
});
test('angular speed falls, wobble grows and both tops eventually stop and fall', () => {
  const top = throwPhysics(.78, .5), initial = spinAt(top, 0), middle = spinAt(top, top.duration / 2), late = spinAt(top, top.duration - .1), end = spinAt(top, top.duration + 1);
  assert.ok(initial.omega > middle.omega && middle.omega > late.omega);
  assert.ok(initial.wobble < middle.wobble && middle.wobble < late.wobble);
  assert.ok(middle.angle > initial.angle && late.angle > middle.angle);
  assert.equal(end.stopped, true); assert.equal(end.omega, 0); assert.equal(end.remaining, 0); assert.equal(end.fall, 1);
});
test('simulation is independent of frame rate and skipping preserves the same fixed outcome', () => {
  const original = launched(); let sixty = original, coarse = original;
  for (let i = 0; i < 600; i++) sixty = advanceGasing(sixty, 1 / 60);
  for (let i = 0; i < 100; i++) coarse = advanceGasing(coarse, .1);
  assert.ok(Math.abs(sixty.elapsed - coarse.elapsed) < 1e-10);
  const a = advanceGasing(sixty, roundDuration(sixty)), b = advanceGasing(original, roundDuration(original));
  assert.deepEqual(a, b); assert.equal(a.phase, 'result'); assert.equal(a.winner, 0);
});
test('Atuk is stronger than Faiz; lesson demonstration is easier and practice has no opponent', () => {
  for (let id = 1; id <= 50; id++) {
    const lesson = rivalThrow('belajar', id), faiz = rivalThrow('faiz', id), atuk = rivalThrow('atuk', id);
    assert.ok(atuk.duration > faiz.duration && faiz.duration > lesson.duration);
    assert.ok(throwPhysics(.78, .5).duration > atuk.duration, 'challenge remains beatable with skill');
  }
  assert.equal(rivalThrow('practice', 1), null);
  assert.equal(advanceGasing(launched('practice'), 60).winner, null);
  const poor = advanceGasing(launched('atuk', 1, .1, .05), 60); assert.equal(poor.winner, 1);
  const opponent = rivalThrow('faiz', 1);
  const tie = advanceGasing(launched('faiz', 1, opponent.power, opponent.release), 60); assert.equal(tie.winner, null);
});
test('power and release meters preserve a fractional phase when saved; held input resets safely', () => {
  let s = advanceGasing(windString(newGasingRound('faiz', 7)), 1.2); s = advanceGasing(startCharge(s), .81);
  const restored = cleanGasingRound(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.charging, false); assert.equal(restored.power, s.power); assert.equal(restored.elapsed, s.elapsed);
  assert.equal(advanceGasing(restored, 3).power, restored.power);
  const resumed = advanceGasing(startCharge(restored), .2), uninterrupted = advanceGasing(s, .2);
  assert.equal(resumed.power, uninterrupted.power);
  const timing = advanceGasing(lockPower(s), .4), timingSave = cleanGasingRound(timing);
  assert.equal(advanceGasing(timingSave, .2).release, advanceGasing(timing, .2).release);
});
test('spinning saves resume the same top speed and result, and saved durations cannot be forged', () => {
  const s = advanceGasing(launched('atuk', 8), 5), restored = cleanGasingRound({ ...s, player: { duration: 9999 }, opponent: null });
  assert.deepEqual(restored.player, s.player); assert.deepEqual(restored.opponent, s.opponent);
  assert.deepEqual(advanceGasing(restored, 60), advanceGasing(s, 60));
  const end = advanceGasing(s, 60); end.settled = true; assert.deepEqual(cleanGasingRound(end), end);
});
test('bad saved phases, inputs, ids and premature results are rejected without breaking the economy', () => {
  const s = newGasingRound('practice', 1);
  for (const patch of [{ phase: 'magic' }, { kind: 'pangkah' }, { id: 0 }, { elapsed: -1 }, { power: 1.1 }, { release: NaN }, { equipment: 'gold' }, { settled: true }, { winner: 0 }, { phase: 'result' }, { phase: 'winding', elapsed: 2 }])
    assert.equal(cleanGasingRound({ ...s, ...patch }), null, JSON.stringify(patch));
  assert.equal(cleanGasingRound({ ...advanceGasing(launched(), 60), winner: 1 }), null, 'result must match actual physics');
  assert.equal(cleanEconomy({ gasing: { round: { ...s, power: 7 } } }).gasing.round, null);
});
test('loan and owned tops perform equally; using a collected top never consumes inventory', () => {
  const eco = newEconomy(); assert.equal(startGasing(eco, 'practice').equipment, 'loan');
  assert.throws(() => startGasing(eco, 'atuk'), /Resume/);
  eco.gasing.round = null; eco.collection.gasing = 1; assert.equal(startGasing(eco, 'practice').equipment, 'owned');
  assert.equal(eco.collection.gasing, 1);
  const loan = launched('practice'); const owned = { ...loan, equipment: 'owned' };
  assert.deepEqual(owned.player, loan.player); assert.equal(advanceGasing(loan, 60).player.duration, advanceGasing(owned, 60).player.duration);
});
test('milestones, record and badge settle once across reloads, while aborted rounds earn nothing', () => {
  const eco = newEconomy(), wallet = eco.wallet;
  startGasing(eco, 'belajar'); eco.gasing.round = null; assert.deepEqual(recordGasing(eco), []); assert.equal(eco.gasing.played, 0);
  eco.gasing.round = advanceGasing(launched('belajar'), 60);
  assert.deepEqual(recordGasing(eco).map(q => q.id), ['lesson', 'stable']);
  assert.equal(eco.wallet, wallet + 50); assert.deepEqual(recordGasing(eco), []); assert.equal(eco.gasing.played, 1);
  eco.gasing.round = advanceGasing(launched('faiz', 2), 60); recordGasing(eco);
  eco.gasing.round = advanceGasing(launched('atuk', 3), 60); recordGasing(eco);
  assert.equal(eco.wallet, wallet + 200); assert.ok(eco.gasing.claimed.includes('atuk')); assert.equal(eco.gasing.won, 3);
  const save = validateSave(JSON.parse(JSON.stringify({ version: 3, who: 'amir', name: 'Amir', story: 1, x: 0, z: 0, ...eco })));
  assert.deepEqual(recordGasing(save), []); assert.equal(save.wallet, eco.wallet); assert.equal(save.gasing.played, 3);
  startGasing(save, 'atuk'); save.gasing.round = advanceGasing(launched('atuk', 4), 60); recordGasing(save);
  assert.equal(save.wallet, eco.wallet); assert.equal(save.gasing.played, 4);
});
test('old saves keep money, collection, Dam Haji and clock while gaining empty Gasing progress', () => {
  const old = { version: 3, who: 'nur', name: 'Nur', story: 2, x: 12, z: 0, wallet: 570, collection: { gasing: 1 }, dam: { played: 2, won: 1, claimed: ['practice'], match: null }, clock: { day: 3, minute: 900 } };
  const v = validateSave(old); assert.equal(v.wallet, 570); assert.deepEqual(v.collection, old.collection); assert.deepEqual(v.dam, old.dam); assert.deepEqual(v.clock, old.clock);
  assert.deepEqual(v.gasing, { played: 0, won: 0, best: 0, nextRound: 1, claimed: [], round: null });
  const clean = cleanGasingProgress({ played: -5, won: 999, best: Infinity, nextRound: 0, claimed: ['atuk', 'atuk', 'money'] });
  assert.deepEqual(clean, { played: 0, won: 0, best: 0, nextRound: 1, claimed: ['atuk'], round: null });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { newMatch, legalSteps, playStep, legalTurns, chooseTurn, cleanMatch } from '../src/dam-haji.js';
import { newEconomy, cleanEconomy } from '../src/economy.js';
import { startDam, recordDam } from '../src/dam-progress.js';
import { validateSave } from '../src/save.js';
const board = (pieces, turn = 0, level = 'santai') => ({ ...newMatch(level), cells: Object.assign(Array(64).fill(0), pieces), turn, history: [] });
test('8x8 opening has twelve men per side; red moves forward and cannot use light squares', () => {
  const s = newMatch();
  assert.equal(s.cells.filter(p => p === 1).length, 12);
  assert.equal(s.cells.filter(p => p === -1).length, 12);
  assert.equal(legalSteps(s).length, 7);
  for (const m of legalSteps(s)) { assert.ok(m.to < m.from); assert.equal(m.captured, null); }
  assert.throws(() => playStep(s, 40, 32), /Illegal/);
  assert.equal(cleanMatch(s)?.level, 'santai');
});
test('capture suppresses quiet moves and normal men cannot capture backwards', () => {
  const s = board({ 42: 1, 44: 1, 33: -1, 51: -1 });
  assert.deepEqual(legalSteps(s), [{ from: 42, to: 24, captured: 33 }]);
  assert.throws(() => playStep(s, 44, 35), /Illegal/);
  const next = playStep(s, 42, 24);
  assert.equal(s.cells[33], -1, 'input is immutable');
  assert.equal(next.cells[33], 0);
  assert.equal(next.turn, 1);
});
test('consecutive jumps keep the same piece and survive saving mid-capture', () => {
  const s = board({ 42: 1, 46: 1, 33: -1, 17: -1, 7: -1 });
  const a = playStep(s, 42, 24);
  assert.equal(a.chain, 24); assert.equal(a.turn, 0); assert.equal(a.turns, 0);
  assert.deepEqual(legalSteps(a), [{ from: 24, to: 10, captured: 17 }]);
  const restored = cleanMatch(JSON.parse(JSON.stringify(a)));
  assert.deepEqual(legalSteps(restored), legalSteps(a));
  assert.throws(() => playStep(a, 46, 37), /Illegal/);
  const b = playStep(restored, 24, 10);
  assert.equal(b.turn, 1); assert.equal(b.chain, null); assert.equal(b.turns, 1);
  assert.deepEqual(legalTurns(s)[0].steps.map(m => m.to), [24, 10]);
});
test('Haji flies forward and backward but cannot cross friendly or two enemy pieces', () => {
  const s = board({ 42: 2, 28: -1, 14: -1, 49: 1 });
  const moves = legalSteps(s);
  assert.deepEqual(moves.map(m => m.to), [21]);
  assert.equal(moves[0].captured, 28);
  const free = board({ 35: 2, 7: -1 });
  const quiet = legalSteps(free);
  assert.ok(quiet.some(m => m.to === 56));
  assert.ok(quiet.some(m => m.to === 8));
  assert.ok(!quiet.some(m => m.to === 7));
});
test('Haji may choose any empty landing beyond one enemy', () => {
  const moves = legalSteps(board({ 42: 2, 28: -1 }));
  assert.deepEqual(moves.map(m => m.to), [21, 14, 7]);
});
test('crowning stacks the piece and ends the capture turn', () => {
  const s = board({ 17: 1, 10: -1, 12: -1, 55: -1 });
  const next = playStep(s, 17, 3);
  assert.equal(next.cells[3], 2); assert.equal(next.last.promoted, true);
  assert.equal(next.chain, null); assert.equal(next.turn, 1);
  const black = playStep(board({ 46: -1, 53: 1, 51: 1 }, 1), 46, 60);
  assert.equal(black.cells[60], -2); assert.equal(black.turn, 0);
});
test('capture of the last piece and blocked opponents end the match', () => {
  const end = playStep(board({ 42: 1, 33: -1 }), 42, 24);
  assert.equal(end.over, true); assert.equal(end.winner, 0); assert.equal(end.reason, 'no-moves');
  assert.ok(cleanMatch(end));
  const blocked = playStep(board({ 42: 1, 55: -1, 62: 1 }), 42, 33);
  assert.equal(blocked.over, true); assert.equal(blocked.winner, 0);
});
test('threefold repetition and 80 quiet Haji turns are draws', () => {
  let s = board({ 56: 2, 5: -2 });
  const cycle = [[56, 49], [5, 12], [49, 56], [12, 5]];
  for (let i = 0; i < 12 && !s.over; i++) s = playStep(s, ...cycle[i % 4]);
  assert.equal(s.over, true); assert.equal(s.winner, null); assert.equal(s.reason, 'draw');
  const quiet = playStep({ ...board({ 56: 2, 5: -2 }), quiet: 79 }, 56, 49);
  assert.equal(quiet.over, true); assert.equal(quiet.reason, 'draw');
  assert.equal(playStep({ ...board({ 42: 1, 7: -2 }), quiet: 79 }, 42, 33).quiet, 0);
});
test('all difficulty levels take a forced winning capture with legal complete turns', () => {
  for (const level of ['belajar', 'santai', 'jaguh']) {
    const s = board({ 42: -1, 51: 1 }, 1, level), moves = chooseTurn(s);
    assert.deepEqual(moves.map(m => [m.from, m.to]), [[42, 60]]);
    assert.equal(playStep(s, 42, 60).winner, 1);
  }
});
test('complete simulated matches preserve material, legal saves, and eventually terminate', () => {
  for (let seed = 0; seed < 5; seed++) {
    let s = newMatch(seed === 0 ? 'santai' : 'belajar'), plies = 0;
    while (!s.over && plies++ < 500) {
      const turns = legalTurns(s);
      const steps = s.turn === 1 ? chooseTurn(s) : turns[(plies * 13 + seed * 7) % turns.length].steps;
      for (const m of steps) {
        const old = s.cells.filter(Boolean).length;
        s = playStep(s, m.from, m.to);
        assert.equal(s.cells.filter(Boolean).length, old - (m.captured === null ? 0 : 1));
        assert.ok(cleanMatch(s), `valid turn ${s.turns}`);
      }
    }
    assert.ok(s.over, `simulation ${seed} should finish`);
  }
});
test('save validation rejects corrupt pieces, impossible chains and unfinished results', () => {
  const s = newMatch();
  for (const patch of [{ cells: Array(64).fill(1) }, { turn: 7 }, { chain: 42 }, { turns: -1 }, { level: 'god' }, { settled: true }, { winner: 0 }, { over: true, reason: '' }])
    assert.equal(cleanMatch({ ...s, ...patch }), null, JSON.stringify(patch));
  assert.equal(cleanMatch({ ...s, cells: s.cells.map((p, i) => i === 1 ? 1 : p) }), null, 'uncrowned red on last row');
});
test('milestones pay once, records settle once, and resignation does not earn practice money', () => {
  const eco = newEconomy(), initial = eco.wallet;
  startDam(eco, 'belajar');
  assert.throws(() => startDam(eco, 'jaguh'), /Resume/);
  eco.dam.match = playStep(board({ 17: 1, 10: -1 }, 0, 'belajar'), 17, 3);
  assert.deepEqual(recordDam(eco).map(q => q.id), ['haji', 'practice']);
  assert.equal(eco.wallet, initial + 50); assert.equal(eco.dam.played, 1);
  assert.deepEqual(recordDam(eco), []); assert.equal(eco.dam.played, 1);
  eco.dam.match = playStep(board({ 42: 1, 33: -1 }, 0, 'santai'), 42, 24); recordDam(eco);
  eco.dam.match = playStep(board({ 42: 1, 33: -1 }, 0, 'jaguh'), 42, 24); recordDam(eco);
  assert.equal(eco.wallet, initial + 200); assert.equal(eco.dam.won, 3);
  const saved = { version: 3, who: 'amir', name: 'Amir', story: 0, x: 0, z: 0, ...eco };
  const restored = validateSave(JSON.parse(JSON.stringify(saved)));
  assert.equal(restored.dam.match.settled, true); assert.deepEqual(recordDam(restored), []);
  assert.equal(restored.wallet, eco.wallet);
  startDam(restored, 'belajar'); Object.assign(restored.dam.match, { over: true, winner: 1, turn: 0, reason: 'resigned' });
  assert.deepEqual(recordDam(restored), []);
  const fresh = newEconomy(); startDam(fresh, 'belajar'); Object.assign(fresh.dam.match, { over: true, winner: 1, turn: 0, reason: 'resigned' });
  recordDam(fresh); assert.equal(fresh.wallet, initial); assert.equal(fresh.dam.played, 1);
});
test('old economy saves receive empty Dam progress without losing existing inventory', () => {
  const old = { wallet: 490, bag: { gula: 2 }, collection: { guli: 1 }, congkak: { played: 4, won: 2 } };
  const eco = cleanEconomy(old);
  assert.equal(eco.wallet, 490); assert.deepEqual(eco.bag, old.bag); assert.deepEqual(eco.collection, old.collection);
  assert.deepEqual(eco.dam, { played: 0, won: 0, claimed: [], match: null });
  const bad = cleanEconomy({ ...old, dam: { played: -1, won: 100, claimed: ['jaguh', 'jaguh', 'cash'], match: {} } });
  assert.deepEqual(bad.dam, { played: 0, won: 0, claimed: ['jaguh'], match: null });
});

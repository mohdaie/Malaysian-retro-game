import test from 'node:test';
import assert from 'node:assert/strict';
import { SKATE_SLOTS, SKATE_PARTS, SKATE_PART_IDS, STOCK_SKATE_PARTS, cleanSkateParts } from '../src/skate-parts.js';
import { createSkateboard } from '../src/skateboard.js';

const SURFACES = { board: ['deck'], tyre: ['wheel'], components: ['truck', 'grip'] };

test('the board, tyre and other components are registered on their own, each with its own choices', () => {
  assert.deepEqual(Object.keys(SKATE_SLOTS), ['board', 'tyre', 'components']);
  for (const slot of Object.keys(SKATE_SLOTS)) {
    const options = SKATE_PART_IDS.filter(id => SKATE_PARTS[id].slot === slot);
    assert.ok(options.length >= 3, `${slot} has at least three choices`);
    for (const id of options) assert.deepEqual(Object.keys(SKATE_PARTS[id].colours).sort(), SURFACES[slot].slice().sort(), `${id} paints only its own surfaces`);
  }
  for (const [slot, id] of Object.entries(STOCK_SKATE_PARTS)) assert.equal(SKATE_PARTS[id].slot, slot, 'each stock part belongs to its slot');
});
test('older saves and broken values fall back to stock one slot at a time, keeping the others', () => {
  assert.deepEqual(cleanSkateParts(undefined), STOCK_SKATE_PARTS);
  assert.deepEqual(cleanSkateParts({ board: 'board_jade', tyre: 'board_jade', components: 'nope' }), { board: 'board_jade', tyre: STOCK_SKATE_PARTS.tyre, components: STOCK_SKATE_PARTS.components });
  assert.deepEqual(cleanSkateParts({ board: 7, tyre: 'tyre_neon', components: 'components_gold' }), { board: STOCK_SKATE_PARTS.board, tyre: 'tyre_neon', components: 'components_gold' });
});
test('choosing parts paints the board: the deck, the wheels and the trucks and grip each take their own colour', () => {
  const board = createSkateboard({ add() {} });
  const chosen = { board: 'board_bubblegum', tyre: 'tyre_sky', components: 'components_red' };
  board.setLook(chosen);
  const colours = new Set();
  board.group.traverse(o => { if (o.isMesh && o.material.color) colours.add(o.material.color.getHex()); });
  for (const id of Object.values(chosen)) for (const hex of Object.values(SKATE_PARTS[id].colours)) assert.ok(colours.has(hex), `${id} is on the board`);
  assert.equal(colours.has(SKATE_PARTS[STOCK_SKATE_PARTS.board].colours.deck), false, 'the stock deck colour is gone');
});

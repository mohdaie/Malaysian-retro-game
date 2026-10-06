import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_KINDS } from '../src/characters.js';
import { NPC_KEYS } from '../src/cast.js';
import { PLAYERS } from '../src/story.js';

test('both playable children and every NPC have their own body', () => {
  // An unknown kind would quietly fall back to Amir's body.
  for (const kind of [...Object.keys(PLAYERS), ...NPC_KEYS]) assert.ok(CHARACTER_KINDS.includes(kind), kind);
});

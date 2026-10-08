import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_KINDS } from '../src/characters.js';
import { NPC_KEYS, RESIDENTS, RESIDENT_KEYS, KEEPER_KEYS, NPCS, residentPlace, residentPosts, npcPosts } from '../src/cast.js';
import { BUILDINGS } from '../src/town-layout.js';
import { PLAYERS } from '../src/story.js';

test('both playable children, every NPC and every resident have their own body', () => {
  // An unknown kind would quietly fall back to Amir's body.
  for (const kind of [...Object.keys(PLAYERS), ...NPC_KEYS, ...RESIDENT_KEYS, ...KEEPER_KEYS]) assert.ok(CHARACTER_KINDS.includes(kind), kind);
});
test('every resident has a unique key and stands at their own door', () => {
  assert.equal(RESIDENT_KEYS.length, Object.keys(RESIDENTS).length);
  assert.equal(new Set([...RESIDENT_KEYS, ...NPC_KEYS]).size, RESIDENT_KEYS.length + NPC_KEYS.length, 'keys never clash with an NPC');
  const homes = residentPosts(BUILDINGS), npcPlaces = new Set(Object.values(NPCS).map(n => n.place));
  for (const key of RESIDENT_KEYS) {
    const place = residentPlace(key), b = BUILDINGS.find(b => b.id === place), post = homes[key];
    assert.equal(RESIDENTS[place].key, key);
    assert.ok(!npcPlaces.has(place), `${key} does not share an NPC's place`);
    assert.equal(post.place, place, `${key} stands at their own place`);
    for (const s of post.spots) assert.ok(Math.hypot(s.x - b.door.x, s.z - b.door.z) < 3.5, `${key} keeps near the door`);
  }
  // The NPCs' posts, and so the planted trees and props, do not move.
  assert.equal(Object.keys(npcPosts(BUILDINGS)).length, NPC_KEYS.length);
});

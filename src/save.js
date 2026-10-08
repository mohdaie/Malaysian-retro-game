import { cleanEconomy, newEconomy } from './economy.js?v=2.9.1';
import { PLAYERS, DONE, cleanExhibition, syncChapter } from './story.js?v=2.9.1';
import { cleanClock, newClock } from './clock.js?v=2.9.1';
// One save per character (v2.5): Amir and Nur each keep their own journey.
// The single save from earlier versions moves into its character's slot the
// first time that character saves.
export const SAVE_KEY = 'retro-malaysia-save-v1';
export const slotKey = who => `retro-malaysia-save-${who}`;
// Version 3 (v1.0): who you play (Amir or Nur), your name, the chapter step
// and the whole economy. Saves from earlier prototypes keep the name and the
// Duit Poket; the rewritten chapter starts fresh for them. The town clock
// (v1.4) is optional: saves without it wake on day 1 at 14:00.
export function validateSave(value) {
  if (!value || ![1, 2, 3].includes(value.version)) return null;
  if (![value.x, value.z].every(Number.isFinite) || Math.abs(value.x) > 78 || Math.abs(value.z) > 68) return null;
  if (typeof value.name !== 'string') return null;
  const name = value.name.trim().slice(0, 20);
  if (value.version === 3) {
    if (!PLAYERS[value.who] || !Number.isInteger(value.story) || value.story < 0 || value.story > DONE) return null;
    const eco=cleanEconomy(value),exhibition=value.story>=12?cleanExhibition(value.exhibition,eco):null;
    return { version: 3, who: value.who, name: name || PLAYERS[value.who].name, story: syncChapter(value.story,eco,exhibition), ...(exhibition?{exhibition}:{}), x: value.x, z: value.z, ...eco, clock: cleanClock(value.clock), bike: cleanBike(value.bike) };
  }
  if (!Number.isInteger(value.quest) || value.quest < 0 || value.quest > 3) return null;
  const eco = newEconomy();
  if (value.version === 2 && Number.isInteger(value.wallet) && value.wallet >= 0 && value.wallet <= 1e7) eco.wallet = value.wallet;
  return { version: 3, who: 'amir', name: name || 'Amir', story: 0, x: value.x, z: value.z, ...eco, clock: newClock(), upgraded: true };
}
// Where the bicycle was left (v2.1); missing or broken means parked at home.
export function cleanBike(bike) {
  if (!bike || ![bike.x, bike.z, bike.heading].every(Number.isFinite) || Math.abs(bike.x) > 78 || Math.abs(bike.z) > 68) return null;
  return { x: bike.x, z: bike.z, heading: bike.heading };
}
const parse = (storage, key) => { try { return validateSave(JSON.parse(storage.getItem(key))); } catch { return null; } };
const stamp = (storage, key) => { try { return JSON.parse(storage.getItem(key))?.savedAt || 0; } catch { return 0; } };
// `who` reads that character's save (or the old single save if it was
// theirs); without it, the most recently saved character's.
export function readSave(storage, who) {
  if (!who) return Object.values(readSaves(storage)).filter(Boolean).sort((a, b) => b.savedAt - a.savedAt)[0] || null;
  const own = parse(storage, slotKey(who));
  if (own) return { ...own, savedAt: stamp(storage, slotKey(who)) };
  const legacy = parse(storage, SAVE_KEY);
  return legacy?.who === who ? { ...legacy, savedAt: 0 } : null;
}
export const readSaves = storage => Object.fromEntries(Object.keys(PLAYERS).map(who => [who, readSave(storage, who)]));
let lastStamp = 0;
export function writeSave(storage, value) {
  try {
    lastStamp = Math.max(Date.now(), lastStamp + 1);
    storage.setItem(slotKey(value.who), JSON.stringify({ ...value, savedAt: lastStamp }));
    // The old single save has now moved into this character's slot.
    if (parse(storage, SAVE_KEY)?.who === value.who) storage.removeItem?.(SAVE_KEY);
    return true;
  } catch { return false; }
}

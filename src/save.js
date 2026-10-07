import { cleanEconomy, newEconomy } from './economy.js?v=1.6.0';
import { PLAYERS, DONE } from './story.js?v=1.6.0';
import { cleanClock, newClock } from './clock.js?v=1.6.0';
export const SAVE_KEY = 'retro-malaysia-save-v1';
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
    return { version: 3, who: value.who, name: name || PLAYERS[value.who].name, story: value.story, x: value.x, z: value.z, ...cleanEconomy(value), clock: cleanClock(value.clock) };
  }
  if (!Number.isInteger(value.quest) || value.quest < 0 || value.quest > 3) return null;
  const eco = newEconomy();
  if (value.version === 2 && Number.isInteger(value.wallet) && value.wallet >= 0 && value.wallet <= 1e7) eco.wallet = value.wallet;
  return { version: 3, who: 'amir', name: name || 'Amir', story: 0, x: value.x, z: value.z, ...eco, clock: newClock(), upgraded: true };
}
export function readSave(storage) {
  try { return validateSave(JSON.parse(storage.getItem(SAVE_KEY))); } catch { return null; }
}
export function writeSave(storage, value) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

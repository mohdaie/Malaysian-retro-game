import { cleanEconomy } from './economy.js?v=0.11.0';
export const SAVE_KEY = 'retro-malaysia-save-v1';
// Version 2 adds Duit Poket, the bag and delivery jobs. A version 1 save
// (story only) upgrades with the starting wallet and an empty bag.
export function validateSave(value) {
  if (!value || ![1, 2].includes(value.version) || !Number.isInteger(value.quest) || value.quest < 0 || value.quest > 3) return null;
  if (![value.x, value.z].every(Number.isFinite) || Math.abs(value.x) > 78 || Math.abs(value.z) > 68) return null;
  if (typeof value.name !== 'string' || typeof value.friend !== 'string') return null;
  return { version: 2, name: value.name.trim().slice(0, 20) || 'Amir', friend: value.friend.trim().slice(0, 20) || 'Nur', quest: value.quest, x: value.x, z: value.z, completed: value.completed === true,
    ...cleanEconomy(value.version === 2 ? value : null) };
}
export function readSave(storage) {
  try { return validateSave(JSON.parse(storage.getItem(SAVE_KEY))); } catch { return null; }
}
export function writeSave(storage, value) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

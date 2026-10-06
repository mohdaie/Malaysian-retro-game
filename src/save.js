export const SAVE_KEY = 'retro-malaysia-save-v1';
export function validateSave(value) {
  if (!value || value.version !== 1 || !Number.isInteger(value.quest) || value.quest < 0 || value.quest > 3) return null;
  if (![value.x, value.z].every(Number.isFinite) || Math.abs(value.x) > 78 || Math.abs(value.z) > 68) return null;
  if (typeof value.name !== 'string' || typeof value.friend !== 'string') return null;
  return { version: 1, name: value.name.trim().slice(0, 20) || 'Amir', friend: value.friend.trim().slice(0, 20) || 'Nur', quest: value.quest, x: value.x, z: value.z, completed: value.completed === true };
}
export function readSave(storage) {
  try { return validateSave(JSON.parse(storage.getItem(SAVE_KEY))); } catch { return null; }
}
export function writeSave(storage, value) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

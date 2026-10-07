// Fictional fixed timetable for the game's day, not a real-location prayer feed.
export const PRAYER_MINUTES = 20;
export const PRAYERS = [
  { id: 'subuh', name: 'Subuh', from: 5 * 60 + 45, to: 7 * 60 },
  { id: 'zohor', name: 'Zohor', from: 13 * 60 + 15, to: 16 * 60 + 45 },
  { id: 'asar', name: 'Asar', from: 16 * 60 + 45, to: 19 * 60 + 15 },
  { id: 'maghrib', name: 'Maghrib', from: 19 * 60 + 15, to: 20 * 60 + 30 },
  { id: 'isyak', name: 'Isyak', from: 20 * 60 + 30, to: 5 * 60 + 45 }
];
export const newPrayerProgress = () => ({ day: 0, completed: [] });
export function cleanPrayerProgress(value) {
  if (!value || !Number.isInteger(value.day) || value.day < 0 || value.day > 99999 || !Array.isArray(value.completed)) return newPrayerProgress();
  return { day: value.day, completed: [...new Set(value.completed.filter(id => PRAYERS.some(p => p.id === id)))] };
}
export function currentPrayer(clock) {
  const prayer = PRAYERS.find(p => p.from < p.to ? clock.minute >= p.from && clock.minute < p.to : clock.minute >= p.from || clock.minute < p.to);
  return prayer ? { ...prayer, day: clock.minute < PRAYERS[0].from ? clock.day - 1 : clock.day } : null;
}
export function prayerState(clock, progress, id) {
  const active = currentPrayer(clock), day = id === 'isyak' && clock.minute < PRAYERS[0].from ? clock.day - 1 : clock.day;
  const completed = progress.day === day && progress.completed.includes(id);
  return { completed, available: active?.id === id && !completed, active };
}
export function performPrayer(clock, progress, id) {
  const status = prayerState(clock, progress, id);
  if (!status.available) return { ok: false, reason: status.completed ? 'completed' : 'outside-time' };
  if (clock.minute + PRAYER_MINUTES >= 1440 && clock.day >= 99999) return { ok: false, reason: 'day-limit' };
  const completed = progress.day === status.active.day ? [...progress.completed, id] : [id];
  progress.day = status.active.day; progress.completed = completed;
  clock.minute += PRAYER_MINUTES;
  if (clock.minute >= 1440) { clock.minute -= 1440; clock.day += 1; }
  return { ok: true, prayer: status.active.name, minutes: PRAYER_MINUTES };
}

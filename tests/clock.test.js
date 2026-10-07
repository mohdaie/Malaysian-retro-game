import test from 'node:test';
import assert from 'node:assert/strict';
import { newClock, tickClock, canSleep, sleep, weekday, timeLabel, period, onDuty, isNight, skyAt, WAKE, LATEST, BEDTIME } from '../src/clock.js';

test('a new game starts on the first Saturday afternoon and a real second is a game minute', () => {
  const clock = newClock();
  assert.deepEqual([clock.day, weekday(clock.day), timeLabel(clock.minute), period(clock.minute)], [1, 'Sabtu', '14:00', 'Petang']);
  tickClock(clock, 90);
  assert.equal(timeLabel(clock.minute), '15:30');
});
test('the clock waits at 23:59 until you sleep', () => {
  const clock = { day: 4, minute: 23 * 60 };
  tickClock(clock, 600);
  assert.equal(clock.minute, LATEST);
  assert.equal(timeLabel(clock.minute), '23:59');
});
test('sleep is only allowed from Maghrib and wakes you at Subuh the next day', () => {
  assert.equal(canSleep(BEDTIME - 1), false);
  assert.equal(canSleep(BEDTIME), true);
  const clock = sleep({ day: 7, minute: 22 * 60 });
  assert.deepEqual(clock, { day: 8, minute: WAKE });
  assert.equal(period(clock.minute), 'Subuh');
  assert.equal(weekday(clock.day), 'Sabtu', 'the week wraps after Jumaat');
});
test('shops close after Maghrib; the warung, the kiosk and the masjid stay open later', () => {
  const at = (h, m = 0) => h * 60 + m;
  assert.equal(onDuty('rahman', at(14)), true);
  assert.equal(onDuty('rahman', at(20)), false);
  assert.equal(onDuty('rahman', at(6, 30)), false);
  assert.equal(onDuty('ita', at(21)), true);
  assert.equal(onDuty('din', at(20, 30)), true);
  assert.equal(onDuty('hassan', at(5, 45)), true);
  assert.equal(onDuty('faiz', at(19, 30)), false);
});
test('the light runs from day to dusk to night, and windows glow only after dark', () => {
  const noon = skyAt(13 * 60), dusk = skyAt(19 * 60 + 30), night = skyAt(22 * 60), dawn = skyAt(6 * 60 + 30);
  assert.ok(noon.sunI > dusk.sunI && dusk.sunI > night.sunI);
  assert.equal(noon.glow, 0); assert.equal(night.glow, 1);
  assert.equal(noon.bg, 0x8ab8d1, 'daytime keeps the original sky');
  assert.ok(dawn.sunOffset[0] > 0 && skyAt(18 * 60).sunOffset[0] < 0, 'sun rises in the east and sets in the west');
  assert.equal(isNight(22 * 60), true); assert.equal(isNight(12 * 60), false);
  for (let m = 0; m <= LATEST; m += 7) for (const v of Object.values(skyAt(m))) assert.ok(Array.isArray(v) ? v.every(Number.isFinite) : Number.isFinite(v), `minute ${m}`);
});

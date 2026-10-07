import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSave, readSave, readSaves, writeSave, SAVE_KEY, slotKey } from '../src/save.js';
import { newEconomy } from '../src/economy.js';
const valid = { version: 3, who: 'nur', name: 'Nur', story: 2, x: 12, z: 0, ...newEconomy(), wallet: 350, bag: { gula: 2 }, collection: { guli: 1 },
  jobs: [{ id: 'J1', offer: 'S-first-parcel', kind: 'parcel', requester: 22, from: 22, to: 2, stops: [2], left: 1, item: 'gula', qty: 2, cost: 0, upah: 100, status: 'carrying', story: 'first-parcel' }], nextJob: 2,
  friends: { faiz: 8, meiling: 8 }, talked: { nenek: '2001-06-02' }, congkak: { played: 1, won: 1 }, clock: { day: 3, minute: 1200 }, bike: { x: 4, z: -6, heading: 1.2 } };
const memory = () => { const data = new Map(); return { data, getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) }; };
const withoutStamp = ({ savedAt, ...rest }) => rest;
test('valid saves roundtrip and invalid/out-of-bounds saves are rejected', () => {
  const storage = memory();
  assert.equal(writeSave(storage, valid), true);
  assert.deepEqual(withoutStamp(readSave(storage)), valid);
  for (const bad of [{ x: 400 }, { version: 4 }, { name: 7 }, { who: 'faiz' }, { story: 9 }]) assert.equal(validateSave({ ...valid, ...bad }), null, JSON.stringify(bad));
});
test('unavailable storage and malformed JSON never block gameplay', () => {
  assert.equal(readSave(null), null); assert.equal(writeSave(null, valid), false); assert.equal(readSave({ getItem: () => '{broken' }), null);
});
test('older saves keep the name and Duit Poket and start the rewritten chapter as Amir', () => {
  const v2 = validateSave({ version: 2, name: 'Ali', friend: 'Siti', quest: 3, completed: true, x: 1, z: 2, wallet: 420, bag: { gula: 2 }, jobs: [] });
  assert.deepEqual([v2.version, v2.who, v2.name, v2.story, v2.wallet, v2.upgraded], [3, 'amir', 'Ali', 0, 420, true]);
  assert.deepEqual(v2.bag, {});
  const v1 = validateSave({ version: 1, name: 'Amir', friend: 'Nur', quest: 1, completed: false, x: 1, z: 2 });
  assert.equal(v1.wallet, newEconomy().wallet);
});
test('tampered wallet, bag, collection and job entries are dropped, and paid jobs never come back', () => {
  const eco = validateSave({ ...valid, wallet: -5, bag: { gula: 2, emas: 9, aiskrim: 1, roti: 1.5 }, collection: { guli: 1, gula: 3 }, done: ['J1'], nextJob: 1, friends: { faiz: 500, nobody: 3 },
    jobs: [...valid.jobs, { ...valid.jobs[0], id: 'J9', to: 99 }] });
  assert.equal(eco.wallet, newEconomy().wallet);
  assert.deepEqual(eco.bag, { gula: 2 }); assert.deepEqual(eco.collection, { guli: 1 });
  assert.deepEqual(eco.jobs, [], 'J1 is already paid; J9 goes nowhere');
  assert.equal(eco.nextJob, 2); assert.deepEqual(eco.friends, {});
});
test('the town clock saves, and saves without one (or a broken one) start on day 1 at 14:00', () => {
  const { clock, ...noClock } = valid;
  assert.deepEqual(validateSave(noClock).clock, { day: 1, minute: 840 });
  for (const bad of [{ day: 0, minute: 400 }, { day: 2, minute: 9999 }, { day: 1.5, minute: 60 }, 'noon']) assert.deepEqual(validateSave({ ...valid, clock: bad }).clock, { day: 1, minute: 840 });
  assert.deepEqual(validateSave(valid).clock, { day: 3, minute: 1200 });
});
test('the bicycle is saved where it was left; a missing or broken spot parks it at home', () => {
  const { bike, ...noBike } = valid;
  assert.equal(validateSave(noBike).bike, null);
  for (const bad of [{ x: 200, z: 0, heading: 0 }, { x: 1, z: NaN, heading: 0 }, { x: 1, z: 2 }, 'shed']) assert.equal(validateSave({ ...valid, bike: bad }).bike, null);
  assert.deepEqual(validateSave(valid).bike, { x: 4, z: -6, heading: 1.2 });
});

test('Amir and Nur keep separate journeys: saving one never touches the other', () => {
  const storage = memory(), amir = { ...valid, who: 'amir', name: 'Ali', wallet: 900, story: 5 };
  writeSave(storage, amir); writeSave(storage, valid);
  const both = readSaves(storage);
  assert.equal(both.amir.name, 'Ali'); assert.equal(both.amir.wallet, 900); assert.equal(both.amir.story, 5);
  assert.equal(both.nur.name, 'Nur'); assert.equal(both.nur.wallet, 350);
  writeSave(storage, { ...valid, wallet: 10 });
  assert.equal(readSave(storage, 'amir').wallet, 900, 'a new Nur save leaves Amir alone');
  assert.equal(readSave(storage, 'nur').wallet, 10);
  assert.equal(readSave(storage).who, 'nur', 'the most recently saved character is offered first');
});
test('the single save from earlier versions becomes its character\'s save, and the other starts empty', () => {
  const storage = memory(), old = { ...valid, who: 'amir', name: 'Amir', wallet: 777 };
  storage.setItem(SAVE_KEY, JSON.stringify(old));
  assert.equal(readSave(storage, 'amir').wallet, 777);
  assert.equal(readSave(storage, 'nur'), null);
  writeSave(storage, { ...valid, who: 'nur' });
  assert.equal(readSave(storage, 'amir').wallet, 777, 'starting Nur does not replace the old Amir save');
  writeSave(storage, { ...old, wallet: 800 });
  assert.equal(storage.data.has(SAVE_KEY), false, 'once Amir saves, the old key is retired');
  assert.equal(JSON.parse(storage.getItem(slotKey('amir'))).wallet, 800);
});

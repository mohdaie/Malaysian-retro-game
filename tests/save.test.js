import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSave, readSave, writeSave } from '../src/save.js';
import { newEconomy } from '../src/economy.js';
const story = { name: 'Amir', friend: 'Nur', quest: 2, x: 12, z: 0, completed: false };
const valid = { version: 2, ...story, ...newEconomy(), wallet: 350, bag: { gula: 2 }, jobs: [{ id: 'J1', from: 22, to: 2, item: 'gula', qty: 2, kind: 'parcel', cost: 0, upah: 100, status: 'carrying' }], nextJob: 2 };
const memory = () => { const data = new Map(); return { getItem: k => data.get(k), setItem: (k, v) => data.set(k, v) }; };
test('valid saves roundtrip and invalid/out-of-bounds saves are rejected', () => {
  const storage = memory();
  assert.equal(writeSave(storage, valid), true);
  assert.deepEqual(readSave(storage), valid);
  assert.equal(validateSave({ ...valid, quest: 5 }), null);
  assert.equal(validateSave({ ...valid, x: 400 }), null);
  assert.equal(validateSave({ ...valid, version: 3 }), null);
  assert.equal(validateSave({ ...valid, name: 7 }), null);
});
test('unavailable storage and malformed JSON never block gameplay', () => {
  assert.equal(readSave(null), null); assert.equal(writeSave(null, valid), false); assert.equal(readSave({ getItem: () => '{broken' }), null);
});
test('a version 1 story save upgrades with the starting Duit Poket and an empty bag', () => {
  const upgraded = validateSave({ version: 1, ...story });
  assert.deepEqual(upgraded, { version: 2, ...story, ...newEconomy() });
});
test('tampered wallet, bag and job entries are dropped, and paid jobs never come back', () => {
  const eco = validateSave({ ...valid, wallet: -5, bag: { gula: 2, emas: 9, roti: 1.5 }, done: ['J1'], nextJob: 1,
    jobs: [...valid.jobs, { id: 'J9', from: 22, to: 99, item: 'gula', qty: 1, kind: 'parcel', cost: 0, upah: 1, status: 'carrying' }] });
  assert.equal(eco.wallet, newEconomy().wallet);
  assert.deepEqual(eco.bag, { gula: 2 });
  assert.deepEqual(eco.jobs, [], 'J1 is already paid; J9 goes nowhere');
  assert.equal(eco.nextJob, 2, 'new job ids never reuse a paid one');
});

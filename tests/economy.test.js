import test from 'node:test';
import assert from 'node:assert/strict';
import { newEconomy, offerAt, accept, collect, deliver, buy, jobsAt, ITEMS, STOCK, ROUTES, MAX_JOBS, START_WALLET, rm } from '../src/economy.js';
import { CONTACTS, hello, canSend, canReceive } from '../src/registry.js';
import { BUILDINGS, UNITS, ROADS, RIVER, TOWN_BOUNDS as B, PLACES } from '../src/town-layout.js';

test('every place has a contact, an interaction point and can send and receive', () => {
  assert.deepEqual(Object.keys(CONTACTS).map(Number), Object.keys(PLACES).map(Number));
  assert.equal(new Set(Object.values(CONTACTS).map(c => c.name)).size, 38, 'contact names are unique');
  for (const b of BUILDINGS) {
    const { x, z } = b.door, c = CONTACTS[b.id];
    assert.ok(c.name && c.role && hello(b.id, 'Amir').length > 5 && !hello(b.id, 'Amir').includes('{name}'), b.name);
    assert.ok(canSend(b.id) && canReceive(b.id));
    assert.ok(x > B.minX + 1 && x < B.maxX - 1 && z > B.minZ + 1 && z < B.maxZ - 1, `${b.name} door inside town`);
    assert.ok(Math.abs(x - RIVER.x) > RIVER.w / 2 + 1, `${b.name} door not in the river`);
    // A door stands near its own place, outside every other unit.
    assert.ok(Math.hypot(Math.max(0, Math.abs(x - b.x) - b.w / 2), Math.max(0, Math.abs(z - b.z) - b.d / 2)) < 7, `${b.name} door near its place`);
    for (const u of UNITS) if (u.id !== b.unit && !u.def.open) assert.ok(!u.solids.some(([sx, sz, sw, sd]) => Math.abs(x - sx) < sw / 2 && Math.abs(z - sz) < sd / 2), `${b.name} door inside ${u.id}`);
  }
});
test('the first delivery: accept, collect, deliver and get paid exactly once', () => {
  const eco = newEconomy(), offer = offerAt(eco, 22);
  assert.equal(eco.wallet, START_WALLET);
  assert.deepEqual([offer.item, offer.qty, offer.to, offer.kind, offer.upah], ['gula', 2, 2, 'parcel', 100]);
  const { job } = accept(eco, offer);
  assert.equal(job.status, 'accepted');
  assert.equal(offerAt(eco, 22), null, 'no second offer while a job is active');
  assert.equal(deliver(eco, job.id, 2).ok, false, 'cannot deliver before collecting');
  assert.equal(collect(eco, job.id, 2).ok, false, 'collect only at the sender');
  assert.ok(collect(eco, job.id, 22).ok);
  assert.deepEqual(eco.bag, { gula: 2 });
  assert.equal(deliver(eco, job.id, 21).reason, 'not-here');
  assert.deepEqual(jobsAt(eco, 2).deliver.map(j => j.id), [job.id]);
  const paid = deliver(eco, job.id, 2);
  assert.equal(paid.paid, 100);
  assert.equal(eco.wallet, START_WALLET + 100);
  assert.deepEqual(eco.bag, {}); assert.deepEqual(eco.jobs, []); assert.deepEqual(eco.done, [job.id]);
  assert.equal(deliver(eco, job.id, 2).ok, false, 'a second hand-over pays nothing');
  assert.equal(eco.wallet, START_WALLET + 100);
  // The shop then offers its next route.
  const next = offerAt(eco, 22); assert.equal(next.to, ROUTES[22][1].to);
});
test('the upah is locked when a job is accepted', () => {
  const eco = newEconomy(), offer = offerAt(eco, 22), { job } = accept(eco, offer);
  offer.upah = 1; ROUTES[22][0].upah += 0;
  collect(eco, job.id, 22); assert.equal(deliver(eco, job.id, 2).paid, 100);
});
test('a purchase order costs money up front and repays cost plus upah', () => {
  const eco = newEconomy(); eco.wallet = 300;
  const { job } = accept(eco, { from: 22, to: 2, item: 'gula', qty: 2, kind: 'purchase', cost: 280, upah: 60 });
  assert.ok(collect(eco, job.id, 22).ok); assert.equal(eco.wallet, 20);
  assert.equal(deliver(eco, job.id, 2).paid, 340); assert.equal(eco.wallet, 360);
  const poor = newEconomy(); poor.wallet = 100;
  const order = accept(poor, { from: 22, to: 2, item: 'gula', qty: 2, kind: 'purchase', cost: 280, upah: 60 }).job;
  assert.equal(collect(poor, order.id, 22).reason, 'funds'); assert.equal(poor.wallet, 100); assert.deepEqual(poor.bag, {});
});
test('buying over the counter needs the item in stock and enough Duit Poket', () => {
  const eco = newEconomy();
  assert.ok(STOCK[22].every(item => ITEMS[item].price > 0));
  assert.ok(buy(eco, 22, 'aiskrim').ok); assert.equal(eco.wallet, START_WALLET - 20); assert.equal(eco.bag.aiskrim, 1);
  assert.equal(buy(eco, 3, 'aiskrim').reason, 'not-sold');
  eco.wallet = 5; assert.equal(buy(eco, 22, 'aiskrim').reason, 'funds'); assert.equal(eco.bag.aiskrim, 1);
  assert.equal(rm(1234), 'RM 12.34'); assert.equal(MAX_JOBS, 1);
});

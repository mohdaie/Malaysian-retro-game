import test from 'node:test';
import assert from 'node:assert/strict';
import { newEconomy, offersAt, accept, collect, deliver, cancel, buy, befriend, quoteUpah, freeSpace, jobsAt, nextStop, level, ITEMS, STOCK, REQUESTS, PARCELS, MAX_JOBS, BAG_SPACE, START_WALLET, rm } from '../src/economy.js';
import { NPCS, NPC_KEYS, RESIDENTS, contactAt, npcPosts, line } from '../src/cast.js';
import { STEPS, DONE, advance, storyOffers, STORY_EVENTS, MILESTONES } from '../src/story.js';
import { BUILDINGS, UNITS, RIVER, TOWN_BOUNDS as B, PLACES } from '../src/town-layout.js';

const gap = (a, b) => { const p = BUILDINGS.find(x => x.id === a).door, q = BUILDINGS.find(x => x.id === b).door; return Math.hypot(p.x - q.x, p.z - q.z); };

test('every place has a contact and an interaction point; the 14 NPCs follow the guide', () => {
  assert.equal(NPC_KEYS.length, 14);
  assert.deepEqual(NPC_KEYS.map(k => NPCS[k].id), Array.from({ length: 14 }, (_, i) => `NPC-${String(i + 1).padStart(2, '0')}`));
  const names = [];
  for (const id of Object.keys(PLACES).map(Number)) { const c = contactAt(id); assert.ok(c?.name, `place ${id} has a contact`); names.push(c.name); }
  assert.equal(new Set(names).size, names.length, 'contact names are unique');
  assert.equal(NPCS.pakmat.place, 9, 'Pak Mat keeps the kebun'); assert.equal(NPCS.ita.place, 21, 'Kak Ita runs the warung');
  assert.equal(NPCS.atuk.place, 8, 'Atuk lives at #8'); assert.equal(NPCS.atuk.post, 34, 'and spends the afternoon at the padang');
  for (const key of NPC_KEYS) { const n = NPCS[key]; assert.ok(n.hello && n.talk.length >= 2 && !line(n.hello, 'Amir').includes('{name}'), key); }
  for (const b of BUILDINGS) {
    const { x, z } = b.door;
    assert.ok(x > B.minX + 1 && x < B.maxX - 1 && z > B.minZ + 1 && z < B.maxZ - 1, `${b.name} door inside town`);
    assert.ok(Math.abs(x - RIVER.x) > RIVER.w / 2 + 1);
    for (const u of UNITS) if (u.id !== b.unit && !u.def.open) assert.ok(!u.solids.some(([sx, sz, sw, sd]) => Math.abs(x - sx) < sw / 2 && Math.abs(z - sz) < sd / 2), `${b.name} door inside ${u.id}`);
  }
  const posts = npcPosts(BUILDINGS);
  assert.deepEqual(Object.keys(posts).sort(), [...NPC_KEYS].sort());
  for (const key of ['atuk', 'faiz', 'meiling']) assert.equal(posts[key].place, 34);
});
test('the upah formula follows the guide: one-unit base plus 2 or 4 coins per extra unit', () => {
  // Nenek: rice x3 at 20 coins, base upah 12, two extra bulky units add 8.
  assert.equal(quoteUpah([120, 120], 50, 'beras', 3), 200);
  // Chalk x2 at base upah 10: one extra small unit adds 2.
  assert.equal(quoteUpah([100, 100], 50, 'kapur', 2), 120);
  // Longer routes earn towards the top of the range, once per order.
  assert.ok(quoteUpah([80, 160], 130, 'gula', 1) > quoteUpah([80, 160], 20, 'gula', 1));
});
test('a prepaid parcel: accept, collect at the sender, deliver, paid exactly once', () => {
  const eco = newEconomy(), [offer] = offersAt(eco, 22, gap).filter(o => o.kind === 'parcel');
  assert.ok(offer && offer.cost === 0 && offer.upah > 0 && offer.from === 22);
  const { job } = accept(eco, offer);
  assert.equal(accept(eco, offer).reason, 'taken');
  assert.ok(!offersAt(eco, 22, gap).some(o => o.id === offer.id), 'a taken offer is not offered again');
  assert.equal(deliver(eco, job.id, job.to).ok, false, 'cannot deliver before collecting');
  assert.ok(collect(eco, job.id, 22).ok); assert.equal(eco.bag[job.item], job.qty);
  assert.deepEqual(jobsAt(eco, job.to).deliver.map(j => j.id), [job.id]);
  const paid = deliver(eco, job.id, job.to);
  assert.equal(paid.paid, offer.upah); assert.equal(eco.wallet, START_WALLET + offer.upah);
  assert.equal(deliver(eco, job.id, job.to).ok, false); assert.equal(eco.wallet, START_WALLET + offer.upah);
  assert.equal(eco.served[22], 1, 'the next offer moves on');
});
test('a purchase request: buy at the supplier, deliver to the requester, get cost plus upah back', () => {
  const eco = newEconomy(), offer = offersAt(eco, 2, gap).find(o => o.kind === 'purchase');
  assert.equal(offer.requester, 2); assert.equal(offer.from, REQUESTS.nenek.find(r => r.item === offer.item).from);
  assert.equal(offer.cost, ITEMS[offer.item].price * offer.qty);
  eco.wallet = offer.cost + 5;
  const { job } = accept(eco, offer);
  assert.equal(collect(eco, job.id, 2).ok, false, 'buy at the supplier, not the requester');
  assert.ok(collect(eco, job.id, offer.from).ok); assert.equal(eco.wallet, 5);
  assert.equal(deliver(eco, job.id, 2).paid, offer.cost + offer.upah); assert.equal(eco.wallet, 5 + offer.cost + offer.upah);
  const poor = newEconomy(); poor.wallet = 0;
  const order = accept(poor, offer).job; assert.equal(collect(poor, order.id, offer.from).reason, 'funds'); assert.deepEqual(poor.bag, {});
});
test('invitation rounds stop at several houses and pay one total upah at the end', () => {
  const eco = newEconomy(), offer = offersAt(eco, 32, gap).find(o => o.stops.length > 1);
  assert.ok(offer, 'Pak Salleh offers an invitation round'); assert.equal(offer.qty, offer.stops.length);
  const { job } = accept(eco, offer); collect(eco, job.id, 32);
  for (let i = 0; i < offer.stops.length; i++) {
    const stop = nextStop(job), r = deliver(eco, job.id, stop);
    assert.ok(r.ok); assert.equal(r.paid, i === offer.stops.length - 1 ? offer.upah : 0);
  }
  assert.equal(eco.wallet, START_WALLET + offer.upah);
});
test('three job slots, a carrying limit, and cancel or return with refunds', () => {
  const eco = newEconomy();
  const jobs = [22, 25, 37].map(p => accept(eco, offersAt(eco, p, gap)[0]).job);
  assert.equal(eco.jobs.length, MAX_JOBS);
  assert.equal(accept(eco, offersAt(eco, 30, gap)[0]).reason, 'full');
  assert.ok(cancel(eco, jobs[0].id).ok); assert.equal(eco.jobs.length, 2);
  const full = newEconomy(); full.bag.beras = 4; assert.equal(freeSpace(full), BAG_SPACE - 12);
  assert.equal(accept(full, { id: 'x', kind: 'parcel', requester: 22, from: 22, to: 2, stops: [2], item: 'beras', qty: 1, cost: 0, upah: 10 }).reason, 'space');
  const buyer = newEconomy(), order = offersAt(buyer, 2, gap).find(o => o.kind === 'purchase'), { job } = accept(buyer, order);
  collect(buyer, job.id, order.from); const after = buyer.wallet;
  assert.equal(cancel(buyer, job.id).reason, 'return-at', 'carried goods go back where they came from');
  assert.equal(cancel(buyer, job.id, order.from).refund, order.cost); assert.equal(buyer.wallet, after + order.cost); assert.deepEqual(buyer.bag, {});
});
test('shopping: snacks are eaten, collectibles go to the album, nothing is reimbursed', () => {
  const eco = newEconomy();
  assert.equal(buy(eco, 22, 'aiskrim').kind, 'snack'); assert.deepEqual(eco.bag, {});
  assert.equal(buy(eco, 25, 'guli').kind, 'collect'); assert.equal(eco.collection.guli, 1);
  assert.equal(eco.wallet, START_WALLET - 20 - 50);
  assert.equal(buy(eco, 25, 'tamiya').reason, 'funds', 'the Tamiya is a saving goal');
  assert.equal(buy(eco, 3, 'guli').reason, 'not-sold');
  assert.ok(STOCK[25].filter(i => ITEMS[i].kind === 'collect').length >= 7);
  assert.equal(rm(1234), 'RM 12.34');
});
test('friendship: a daily chat, errands and story milestones, with levels', () => {
  const eco = newEconomy();
  assert.equal(befriend(eco, 'nenek', 'talk', '2001-06-02'), 1);
  assert.equal(befriend(eco, 'nenek', 'talk', '2001-06-02'), 0, 'repeating the same day gives nothing');
  befriend(eco, 'nenek', 'errand', 'x'); befriend(eco, 'nenek', 'story', 'x');
  assert.equal(eco.friends.nenek, 12); assert.equal(level(12), 'Baru kenal'); assert.equal(level(20), 'Kenal'); assert.equal(level(50), 'Kawan'); assert.equal(level(80), 'Dipercayai');
  assert.equal(befriend(eco, 'nobody', 'talk', 'x'), 0);
});
test('chapter 1 moves on only with the right event and offers its own jobs', () => {
  assert.equal(STEPS.length - 1, DONE);
  assert.equal(advance(0, 'bought-collectible'), 0); assert.equal(advance(0, 'met-friends'), 1);
  let step = 0;
  for (const event of ['met-friends', 'accepted-first-parcel', 'delivered-first-parcel', 'delivered-tea', 'played-congkak-nenek', 'bought-collectible']) step = advance(step, event);
  assert.equal(step, 6); assert.ok(step < DONE, "the opening errands are not the chapter ending"); assert.equal(advance(DONE, 'met-friends'), DONE);
  const eco = newEconomy(), [parcel] = storyOffers(1, eco);
  assert.deepEqual([parcel.from, parcel.to, parcel.item, parcel.qty, parcel.upah, parcel.kind], [22, 2, 'gula', 2, 100, 'parcel']);
  const [tea] = storyOffers(3, eco);
  assert.deepEqual([tea.requester, tea.from, tea.item, tea.kind, tea.cost], [2, 22, 'teh', 'purchase', 70]);
  assert.ok(offersAt(eco, 22, gap, storyOffers(1, eco)).some(o => o.story === 'first-parcel'));
  accept(eco, parcel); assert.deepEqual(storyOffers(1, eco), [], 'not offered twice');
  assert.equal(STORY_EVENTS['first-parcel'], 'delivered-first-parcel'); assert.deepEqual(MILESTONES['met-friends'], ['faiz', 'meiling']);
});
test('every request and parcel template names known items and real places', () => {
  for (const [who, list] of Object.entries(REQUESTS)) for (const r of list) { assert.ok(ITEMS[r.item]?.price > 0, `${who} ${r.item}`); assert.ok(STOCK[r.from]?.includes(r.item), `${r.item} sold at ${r.from}`); }
  for (const [who, list] of Object.entries(PARCELS)) for (const p of list) { assert.ok(ITEMS[p.item], `${who} ${p.item}`); assert.ok(p.to.every(d => d === 'houses' || PLACES[d]), who); }
  for (const r of Object.values(RESIDENTS)) assert.ok(!r.household || REQUESTS[r.household], r.name);
});

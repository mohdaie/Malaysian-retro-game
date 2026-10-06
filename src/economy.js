// Duit Poket, the bag and delivery jobs. Pure functions over a plain state
// object, so the rules are tested in Node and the save file stores it as is.
// Money is whole sen (RM 1.00 = 100) to avoid rounding errors.
import { canSend, canReceive } from './registry.js?v=0.11.0';

export const ITEMS = {
  aiskrim: { name: 'Ais krim Malaysia', price: 20 },
  keropok: { name: 'Keropok ikan', price: 30 },
  sirap: { name: 'Air sirap bungkus', price: 50 },
  gulagula: { name: 'Gula-gula getah', price: 10 },
  roti: { name: 'Roti putih', price: 120 },
  gula: { name: 'Gula 1 kg', price: 140 },
  susu: { name: 'Susu pekat manis', price: 150 },
  telur: { name: 'Telur ayam', price: 25 }
};
// What each place sells over the counter.
export const STOCK = { 22: ['aiskrim', 'keropok', 'sirap', 'gulagula', 'roti', 'gula', 'susu', 'telur'] };
// Delivery work each place offers, in turn. 'parcel' is prepaid: collect it
// and carry it. 'purchase' means buying the goods first; the receiver repays
// the purchase cost on top of the upah.
export const ROUTES = {
  22: [
    { item: 'gula', qty: 2, to: 2, kind: 'parcel', upah: 100, note: "Nenek's monthly order. Already paid for." },
    { item: 'susu', qty: 3, to: 21, kind: 'parcel', upah: 120, note: 'Pak Mat is running low for his teh tarik.' },
    { item: 'telur', qty: 10, to: 4, kind: 'parcel', upah: 150, note: 'Eggs for Mak Cik Salmah’s kuih. Jalan elok-elok!' }
  ]
};
export const MAX_JOBS = 1;
export const START_WALLET = 200;
export const rm = sen => `RM ${(sen / 100).toFixed(2)}`;

export function newEconomy() { return { wallet: START_WALLET, bag: {}, jobs: [], done: [], nextJob: 1, served: {} }; }
const add = (bag, item, qty) => { bag[item] = (bag[item] || 0) + qty; if (bag[item] <= 0) delete bag[item]; };

// The job a place would offer now, or null. Nothing new is offered while the
// player's job slots are full or they already carry one of its jobs.
export function offerAt(eco, place) {
  const list = ROUTES[place];
  if (!list?.length || !canSend(place) || eco.jobs.length >= MAX_JOBS || eco.jobs.some(j => j.from === place)) return null;
  const t = list[(eco.served[place] || 0) % list.length];
  if (!canReceive(t.to)) return null;
  return { from: place, ...t, cost: t.kind === 'purchase' ? ITEMS[t.item].price * t.qty : 0 };
}
// Accepting locks the offered upah and cost into the job.
export function accept(eco, offer) {
  if (!offer || eco.jobs.length >= MAX_JOBS) return { ok: false, reason: 'full' };
  const job = { id: `J${eco.nextJob}`, from: offer.from, to: offer.to, item: offer.item, qty: offer.qty, kind: offer.kind, cost: offer.cost, upah: offer.upah, status: 'accepted' };
  eco.nextJob += 1; eco.jobs.push(job); return { ok: true, job };
}
// Collect a prepaid parcel, or buy the goods for a purchase order.
export function collect(eco, id, place) {
  const job = eco.jobs.find(j => j.id === id);
  if (!job || job.status !== 'accepted' || job.from !== place) return { ok: false, reason: 'not-here' };
  if (job.kind === 'purchase') { if (eco.wallet < job.cost) return { ok: false, reason: 'funds' }; eco.wallet -= job.cost; }
  add(eco.bag, job.item, job.qty); job.status = 'carrying'; return { ok: true, job };
}
// Hand over the goods and get paid, once. A job leaves the list the moment it
// is paid, and its id is remembered, so it can never pay twice.
export function deliver(eco, id, place) {
  const job = eco.jobs.find(j => j.id === id);
  if (!job || eco.done.includes(id)) return { ok: false, reason: 'unknown' };
  if (job.status !== 'carrying' || job.to !== place) return { ok: false, reason: 'not-here' };
  if ((eco.bag[job.item] || 0) < job.qty) return { ok: false, reason: 'missing' };
  add(eco.bag, job.item, -job.qty);
  const paid = job.upah + (job.kind === 'purchase' ? job.cost : 0);
  eco.wallet += paid; eco.jobs = eco.jobs.filter(j => j !== job);
  eco.done = [...eco.done, id].slice(-200); eco.served[job.from] = (eco.served[job.from] || 0) + 1;
  return { ok: true, job, paid };
}
export function buy(eco, place, item) {
  if (!STOCK[place]?.includes(item)) return { ok: false, reason: 'not-sold' };
  if (eco.wallet < ITEMS[item].price) return { ok: false, reason: 'funds' };
  eco.wallet -= ITEMS[item].price; add(eco.bag, item, 1); return { ok: true };
}
// What the player can do with their jobs at a place.
export const jobsAt = (eco, place) => ({
  collect: eco.jobs.filter(j => j.status === 'accepted' && j.from === place),
  deliver: eco.jobs.filter(j => j.status === 'carrying' && j.to === place)
});
export const itemLabel = (item, qty) => `${qty} × ${ITEMS[item].name}`;

// Keep only well-formed economy fields from a save.
export function cleanEconomy(value) {
  const eco = newEconomy();
  if (!value || typeof value !== 'object') return eco;
  const int = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
  if (int(value.wallet, 0, 1e7)) eco.wallet = value.wallet;
  for (const [item, qty] of Object.entries(value.bag || {})) if (ITEMS[item] && int(qty, 1, 999)) eco.bag[item] = qty;
  if (Array.isArray(value.done)) eco.done = value.done.filter(id => typeof id === 'string' && /^J\d+$/.test(id)).slice(-200);
  if (Array.isArray(value.jobs)) eco.jobs = value.jobs.filter(j => j && /^J\d+$/.test(j.id) && !eco.done.includes(j.id) && int(j.from, 1, 38) && int(j.to, 1, 38) && ITEMS[j.item] && int(j.qty, 1, 99)
    && ['parcel', 'purchase'].includes(j.kind) && int(j.cost, 0, 1e6) && int(j.upah, 0, 1e6) && ['accepted', 'carrying'].includes(j.status))
    .map(({ id, from, to, item, qty, kind, cost, upah, status }) => ({ id, from, to, item, qty, kind, cost, upah, status })).slice(0, MAX_JOBS);
  const highest = Math.max(0, ...[...eco.done, ...eco.jobs.map(j => j.id)].map(id => Number(id.slice(1))));
  eco.nextJob = int(value.nextJob, 1, 1e9) ? Math.max(value.nextJob, highest + 1) : highest + 1;
  for (const [place, n] of Object.entries(value.served || {})) if (int(Number(place), 1, 38) && int(n, 0, 1e6)) eco.served[place] = n;
  return eco;
}

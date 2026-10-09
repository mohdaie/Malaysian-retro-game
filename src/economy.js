import { newChapter, cleanChapter, tamiyaUnlocked, markChapterDelivery } from './chapter-data.js?v=2.15.0';
// Duit Poket, the bag, the collection, delivery jobs and friendship, following
// the NPC design guide. Pure functions over one plain state object, so the
// rules are tested in Node and the save file stores the state as it is.
// Money is whole sen. The guide prices in game coins; here 1 coin = 10 sen.
import { NPCS, npcAt, contactAt, RESIDENTS, HOUSES, PADANG } from './cast.js?v=2.15.0';
import { newGasingProgress, cleanGasingProgress } from './gasing-progress.js?v=2.15.0';
import { newDamProgress, cleanDamProgress } from './dam-progress.js?v=2.15.0';
import { ITEM_ART, itemImagePath } from './item-art.js?v=2.15.0';
import { TAMIYA_PARTS } from './tamiya-parts.js?v=2.15.0';
import { TAMIYA_CARS } from './tamiya-cars.js?v=2.15.0';
import { newTamiyaProgress, cleanTamiyaProgress } from './tamiya-progress.js?v=2.15.0';
import { newPrayerProgress, cleanPrayerProgress } from './prayer.js?v=2.15.0';
import { NOSTALGIA_ITEMS } from './nostalgia-items.js?v=2.15.0';
import { newNostalgia, cleanNostalgia, recordNostalgiaDelivery } from './nostalgia-quests.js?v=2.15.0';

// size: carrying space per unit (1 small, 3 bulky). kind: 'goods' can be
// bought and carried, 'cargo' only comes from a job, 'snack' is eaten on the
// spot, 'collect' goes to the collection album.
import { STORY_CARGO } from './chapter-jobs.js?v=2.15.0';
export const ITEMS = {
  kabelav: { name: 'Kabel AV malam tayangan', size: 1, kind: 'cargo' },
  kerusilipat: { name: 'Kerusi lipat malam tayangan', size: 3, kind: 'cargo' },
  beras: { name: 'Beras (rice bag)', price: 200, size: 3, kind: 'goods' },
  gula: { name: 'Gula (sugar bag)', price: 80, size: 1, kind: 'goods' },
  teh: { name: 'Teh (tea packet)', price: 70, size: 1, kind: 'goods' },
  telur: { name: 'Telur (egg tray)', price: 150, size: 3, kind: 'goods' },
  minuman: { name: 'Air kotak (drink carton)', price: 130, size: 3, kind: 'goods' },
  sabun: { name: 'Sabun & kain (soap-and-cloth pack)', price: 80, size: 1, kind: 'goods' },
  pencuci: { name: 'Pencuci (cleaning-supply pack)', price: 100, size: 1, kind: 'goods' },
  benih: { name: 'Benih (seed packet)', price: 70, size: 1, kind: 'goods' },
  kotak: { name: 'Kotak (cardboard-box bundle)', price: 60, size: 3, kind: 'goods' },
  kainlap: { name: 'Kain lap (cleaning-cloth pack)', price: 70, size: 1, kind: 'goods' },
  lampin: { name: 'Lampin (diapers)', price: 120, size: 3, kind: 'goods' },
  roti: { name: 'Roti (bread)', price: 120, size: 1, kind: 'goods' },
  begkertas: { name: 'Beg kertas (paper-bag bundle)', price: 80, size: 1, kind: 'goods' },
  label: { name: 'Label harga (price-label pack)', price: 60, size: 1, kind: 'goods' },
  resit: { name: 'Buku resit (receipt-book pack)', price: 70, size: 1, kind: 'goods' },
  bukulatihan: { name: 'Buku latihan (exercise books)', price: 130, size: 1, kind: 'goods' },
  kapur: { name: 'Kapur (chalk box)', price: 60, size: 1, kind: 'goods' },
  poster: { name: 'Poster (event-poster bundle)', price: 110, size: 1, kind: 'goods' },
  taliwau: { name: 'Tali wau (kite-string spool)', price: 90, size: 1, kind: 'goods' },
  pensel: { name: 'Pensel (pencil pack)', price: 60, size: 1, kind: 'goods' },
  bukuskrap: { name: 'Buku skrap (scrapbook)', price: 110, size: 1, kind: 'goods' },
  pelincir: { name: 'Minyak pelincir (lubricant)', price: 160, size: 1, kind: 'goods' },
  sarungkerja: { name: 'Sarung tangan kerja (work gloves)', price: 110, size: 1, kind: 'goods' },
  sarungkebun: { name: 'Sarung tangan kebun (gardening gloves)', price: 110, size: 1, kind: 'goods' },
  sayur: { name: 'Bakul sayur (vegetable basket)', price: 130, size: 3, kind: 'goods' },
  makanan: { name: 'Bungkusan makanan (packed food)', price: 200, size: 3, kind: 'goods' },
  aiskrim: { name: 'Ais krim Malaysia', price: 20, size: 0, kind: 'snack' },
  keropok: { name: 'Keropok ikan', price: 30, size: 0, kind: 'snack' },
  sirap: { name: 'Air sirap bungkus', price: 50, size: 0, kind: 'snack' },
  kuihmuih: { name: 'Kuih-muih', price: 30, size: 0, kind: 'snack' },
  nasilemak: { name: 'Nasi lemak bungkus', price: 100, size: 0, kind: 'snack' },
  guli: { name: 'Guli (bag of marbles)', price: 50, size: 0, kind: 'collect' },
  pelekat: { name: 'Pelekat (sticker sheet)', price: 60, size: 0, kind: 'collect' },
  komik: { name: 'Komik (comic issue)', price: 80, size: 1, kind: 'collect' },
  kad: { name: 'Kad koleksi (card pack)', price: 100, size: 0, kind: 'collect' },
  gasing: { name: 'Gasing', price: 280, size: 1, kind: 'collect' },
  wau: { name: 'Wau bulan kecil', price: 350, size: 0, kind: 'collect' },
  tamiya: { name: 'Model Tamiya', price: 1200, size: 0, kind: 'collect' },
  // Job cargo: handed over by a sender, never sold.
  barangdapur: { name: 'Barang dapur (groceries)', size: 3, kind: 'cargo' },
  kuih: { name: 'Kuih buatan sendiri (homemade kuih)', size: 1, kind: 'cargo' },
  bekas: { name: 'Bekas makanan (food container)', size: 1, kind: 'cargo' },
  jemputan: { name: 'Kad jemputan (invitation)', size: 0, kind: 'cargo' },
  notis: { name: 'Notis (notice)', size: 0, kind: 'cargo' },
  buku: { name: 'Buku latihan tertinggal (forgotten book)', size: 1, kind: 'cargo' },
  komikpinjam: { name: 'Komik pinjam (borrowed comic)', size: 1, kind: 'cargo' },
  mainan: { name: 'Mainan lama (old toy)', size: 1, kind: 'cargo' },
  hasil: { name: 'Hasil kebun (produce)', size: 3, kind: 'cargo' },
  bakulhadiah: { name: 'Bakul hadiah (gift basket)', size: 3, kind: 'cargo' },
  bekalan: { name: 'Bekalan (supplies parcel)', size: 1, kind: 'cargo' },
  pesanan: { name: 'Pesanan alat tulis (school order)', size: 1, kind: 'cargo' },
  hidangan: { name: 'Bungkusan hidangan (meal parcel)', size: 1, kind: 'cargo' }
};
for (const [id, car] of Object.entries(TAMIYA_CARS)) ITEMS[id] = { name: `${car.series} · ${car.name}`, price: car.price, size: 0, kind: 'collect' };
for (const [id, part] of Object.entries(TAMIYA_PARTS)) ITEMS[id] = { name: part.name, price: part.price, size: 0, kind: 'collect' };
for (const [id, item] of Object.entries(ITEMS)) {
  const [title, memory] = ITEM_ART[id];
  Object.assign(item, { image: itemImagePath(id), title, memory });
}

Object.assign(ITEMS, NOSTALGIA_ITEMS, STORY_CARGO);
// What each place sells over the counter.
export const STOCK = {
  22: ['beras', 'gula', 'teh', 'telur', 'minuman', 'sabun', 'pencuci', 'benih', 'kotak', 'kainlap', 'lampin', 'roti', 'aiskrim', 'keropok', 'sirap'],
  25: ['guli', 'pelekat', 'komik', 'kad', 'gasing', 'wau', ...Object.keys(TAMIYA_CARS).filter(id => !TAMIYA_CARS[id].rewardOnly), ...Object.keys(TAMIYA_PARTS), 'begkertas', 'label', 'resit', 'bukulatihan', 'kapur', 'poster', 'taliwau', 'pensel', 'bukuskrap'],
  37: ['minuman', 'pelincir', 'keropok', 'sirap'],
  36: ['sarungkerja', 'sarungkebun', 'kainlap', 'sabun'],
  9: ['sayur'],
  21: ['makanan', 'nasilemak', 'kuihmuih', 'sirap'],
  30: ['nasilemak', 'kuihmuih', 'sirap'],
  19: ['aiskrim', 'keropok', 'sirap'],
  28: ['roti', 'kuihmuih']
};
export const SUPPLIER = Object.fromEntries(Object.entries(STOCK).flatMap(([p, items]) => items.filter(i => ITEMS[i].kind === 'goods').map(i => [i, Number(p)])).reverse());

// Purchase requests (the guide's two per NPC, plus household needs): the
// requester asks for goods from a supplier and repays cost plus upah.
// upah is the one-unit range in sen; qty the requested range.
export const REQUESTS = {
  rahman: [{ item: 'begkertas', from: 25, upah: [80, 120], qty: [1, 2] }, { item: 'label', from: 25, upah: [70, 110], qty: [1, 2] }],
  din: [{ item: 'sarungkerja', from: 36, upah: [100, 160], qty: [1, 2] }, { item: 'resit', from: 25, upah: [80, 130], qty: [1, 2] }],
  lim: [{ item: 'kotak', from: 22, upah: [80, 120], qty: [1, 2] }, { item: 'kainlap', from: 22, upah: [70, 110], qty: [1, 2] }],
  ros: [{ item: 'telur', from: 22, upah: [100, 160], qty: [1, 2] }, { item: 'sayur', from: 9, upah: [120, 180], qty: [1, 2] }],
  farid: [{ item: 'bukulatihan', from: 25, upah: [100, 150], qty: [1, 2] }, { item: 'kapur', from: 25, upah: [80, 120], qty: [1, 3] }],
  man: [{ item: 'pelincir', from: 37, upah: [100, 160], qty: [1, 2] }, { item: 'sabun', from: 22, upah: [80, 130], qty: [1, 2] }],
  ita: [{ item: 'sayur', from: 9, upah: [120, 180], qty: [1, 2] }, { item: 'gula', from: 22, upah: [90, 140], qty: [1, 3] }],
  salleh: [{ item: 'minuman', from: 22, upah: [120, 180], qty: [1, 2] }, { item: 'poster', from: 25, upah: [100, 160], qty: [1, 2] }],
  hassan: [{ item: 'makanan', from: 21, upah: [120, 200], qty: [1, 2] }, { item: 'pencuci', from: 22, upah: [100, 160], qty: [1, 2] }],
  pakmat: [{ item: 'benih', from: 22, upah: [120, 180], qty: [1, 3] }, { item: 'sarungkebun', from: 36, upah: [120, 180], qty: [1, 1] }],
  nenek: [{ item: 'beras', from: 22, upah: [100, 160], qty: [1, 3] }, { item: 'teh', from: 22, upah: [80, 130], qty: [1, 2] }],
  atuk: [{ item: 'gasing', from: 25, upah: [100, 160], qty: [1, 1] }, { item: 'taliwau', from: 25, upah: [80, 140], qty: [1, 2] }],
  faiz: [{ item: 'komik', from: 25, upah: [60, 100], qty: [1, 2] }, { item: 'pensel', from: 25, upah: [60, 100], qty: [1, 2] }],
  meiling: [{ item: 'pelekat', from: 25, upah: [60, 100], qty: [1, 2] }, { item: 'bukuskrap', from: 25, upah: [70, 110], qty: [1, 1] }],
  // Household templates for houses without a named NPC.
  school: [{ item: 'bukulatihan', from: 25, upah: [100, 180], qty: [1, 2] }, { item: 'pensel', from: 25, upah: [100, 160], qty: [1, 2] }],
  baby: [{ item: 'lampin', from: 22, upah: [100, 180], qty: [1, 2] }, { item: 'sabun', from: 22, upah: [100, 160], qty: [1, 2] }],
  working: [{ item: 'makanan', from: 21, upah: [100, 180], qty: [1, 2] }, { item: 'roti', from: 22, upah: [100, 160], qty: [1, 2] }],
  garden: [{ item: 'benih', from: 22, upah: [120, 200], qty: [1, 3] }, { item: 'sarungkebun', from: 36, upah: [120, 200], qty: [1, 1] }],
  kenduri: [{ item: 'beras', from: 22, upah: [200, 350], qty: [2, 3] }, { item: 'sayur', from: 9, upah: [200, 300], qty: [1, 2] }],
  visitors: [{ item: 'teh', from: 22, upah: [120, 220], qty: [1, 2] }, { item: 'makanan', from: 21, upah: [120, 220], qty: [1, 2] }],
  cleaning: [{ item: 'sabun', from: 22, upah: [100, 180], qty: [1, 2] }, { item: 'kainlap', from: 22, upah: [100, 160], qty: [1, 2] }]
};
// Prepaid parcels each sender sends out: cargo to one of `to` (place ids or
// 'houses'). `stops` > 1 makes a multi-stop round (invitations).
const H = 'houses';
export const PARCELS = {
  rahman: [{ item: 'barangdapur', to: [H], upah: [100, 160] }, { item: 'telur', to: [30], upah: [100, 160], cargo: true }, { item: 'minuman', to: [32], upah: [120, 180], cargo: true }, { item: 'bekalan', to: [37], upah: [80, 120] }],
  din: [{ item: 'pelincir', to: [36], upah: [80, 130], cargo: true }, { item: 'minuman', to: [PADANG], upah: [100, 150], cargo: true }, { item: 'bekalan', to: [22, 25, 36], upah: [80, 120] }],
  lim: [{ item: 'pesanan', to: [29], upah: [100, 150] }, { item: 'poster', to: [32], upah: [100, 150], cargo: true }, { item: 'bekalan', to: [8, 14, 15], upah: [80, 120] }],
  ros: [{ item: 'hidangan', to: [29, 32], upah: [100, 160] }, { item: 'hidangan', to: [H], upah: [100, 160] }],
  farid: [{ item: 'notis', to: [32], upah: [80, 120] }, { item: 'buku', to: [H], upah: [80, 140] }],
  man: [{ item: 'sarungkerja', to: [37, 9], upah: [80, 130], cargo: true }, { item: 'mainan', to: [8], upah: [100, 150] }],
  ita: [{ item: 'hidangan', to: [H], upah: [100, 160] }, { item: 'makanan', to: [31, 32], upah: [120, 180], cargo: true }, { item: 'kuih', to: [H], upah: [80, 140] }],
  salleh: [{ item: 'jemputan', to: [H], stops: 3, upah: [150, 250] }, { item: 'notis', to: [29, 22, 25], upah: [80, 120] }],
  hassan: [{ item: 'jemputan', to: [H], stops: 3, upah: [150, 250] }, { item: 'bekas', to: [H], upah: [60, 100] }],
  pakmat: [{ item: 'hasil', to: [30, 21], upah: [100, 160] }, { item: 'bakulhadiah', to: [2], upah: [80, 160] }],
  nenek: [{ item: 'kuih', to: [H], upah: [80, 140] }, { item: 'bekas', to: [H], upah: [60, 100] }, { item: 'hidangan', to: [8], upah: [80, 120] }],
  atuk: [{ item: 'mainan', to: [36], upah: [100, 150] }, { item: 'komikpinjam', to: [H], upah: [60, 100] }],
  faiz: [{ item: 'komikpinjam', to: [14], upah: [60, 100] }, { item: 'buku', to: [29], upah: [80, 140] }],
  meiling: [{ item: 'komikpinjam', to: [15], upah: [60, 100] }, { item: 'pesanan', to: [29], upah: [80, 120] }],
  school: [{ item: 'buku', to: [29], upah: [80, 140] }],
  kenduri: [{ item: 'jemputan', to: [H], stops: 3, upah: [150, 250] }, { item: 'kuih', to: [H], upah: [80, 140] }],
  visitors: [{ item: 'bekas', to: [H], upah: [60, 100] }],
  garden: [{ item: 'bakulhadiah', to: [H], upah: [80, 160] }],
  working: [], baby: [], cleaning: [{ item: 'bekas', to: [H], upah: [60, 100] }]
};

export const MAX_JOBS = 3;
export const BAG_SPACE = 12;
export const START_WALLET = 200;
export const LEVELS = [[80, 'Dipercayai'], [50, 'Kawan'], [20, 'Kenal'], [0, 'Baru kenal']];
export const rm = sen => `RM ${(sen / 100).toFixed(2)}`;
export const itemLabel = (item, qty) => `${qty} × ${ITEMS[item].name}`;
export const level = points => LEVELS.find(([min]) => points >= min)[1];

export function newEconomy() {
  return { chapter: newChapter(), wallet: START_WALLET, bag: {}, collection: {}, jobs: [], done: [], nextJob: 1, served: {}, friends: {}, talked: {}, congkak: { played: 0, won: 0 }, dam: newDamProgress(), gasing: newGasingProgress(), tamiya: newTamiyaProgress(), prayer: newPrayerProgress(), nostalgia: newNostalgia() };
}
const add = (bag, item, qty) => { bag[item] = (bag[item] || 0) + qty; if (bag[item] <= 0) delete bag[item]; };
const space = (item, qty) => ITEMS[item].size * qty;
export const usedSpace = eco => Object.entries(eco.bag).reduce((n, [item, qty]) => n + space(item, qty), 0);
// Space still promised to jobs that have not been picked up yet.
const reserved = eco => eco.jobs.filter(j => j.status === 'accepted').reduce((n, j) => n + space(j.item, j.qty), 0);
export const freeSpace = eco => BAG_SPACE - usedSpace(eco) - reserved(eco);
// Who asks, at a place: its NPC key, or its household template.
export const askerAt = place => npcAt(place) || RESIDENTS[place]?.household || null;

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const roundTo10 = n => Math.round(n / 10) * 10;
// Upah: the one-unit range scaled by route length, plus 20 sen per extra small
// unit or 40 sen per extra bulky unit. Route distance counts once per order.
export function quoteUpah([lo, hi], route, item, qty) {
  const t = Math.max(0, Math.min(1, (route - 20) / 100));
  return roundTo10(lo + (hi - lo) * t) + (qty - 1) * (ITEMS[item].size >= 3 ? 40 : 20);
}

// The offers a place makes now: one prepaid parcel and one purchase request,
// varied by how many jobs it has already given out. `gap(a, b)` measures the
// walk between two places' doors in metres.
export function offersAt(eco, place, gap, story = []) {
  const asker = askerAt(place); if (!asker) return [];
  const taken = id => eco.jobs.some(j => j.offer === id), n = eco.served[place] || 0, random = rng(place * 7919 + n * 104729 + 17);
  const out = [...story.filter(o => o.from === place || o.requester === place)];
  const pick = list => list[Math.floor(random() * list.length)];
  const parcels = PARCELS[asker] || [];
  if (parcels.length && !out.some(o => o.kind === 'parcel')) {
    const t = parcels[n % parcels.length], stops = t.stops || 1;
    const pool = t.to.flatMap(d => d === H ? HOUSES : [d]).filter(d => d !== place);
    const chosen = [];
    while (chosen.length < Math.min(stops, pool.length)) { const d = pick(pool); if (!chosen.includes(d)) chosen.push(d); }
    const route = chosen.reduce((sum, d, i) => sum + gap(i ? chosen[i - 1] : place, d), 0), qty = stops > 1 ? chosen.length : (t.cargo ? 1 + Math.floor(random() * 2) : 1);
    const upah = stops > 1 ? roundTo10(t.upah[0] + (t.upah[1] - t.upah[0]) * Math.min(1, route / 160)) : quoteUpah(t.upah, route, t.item, qty);
    out.push({ id: `P${place}-${n}`, kind: 'parcel', requester: place, from: place, to: chosen[chosen.length - 1], stops: chosen, item: t.item, qty, cost: 0, upah, route: Math.round(route) });
  }
  const requests = REQUESTS[asker] || [];
  if (requests.length && !out.some(o => o.kind === 'purchase')) {
    const t = requests[(n + 1) % requests.length], qty = t.qty[0] + Math.floor(random() * (t.qty[1] - t.qty[0] + 1));
    const route = gap(t.from, place);
    out.push({ id: `R${place}-${n}`, kind: 'purchase', requester: place, from: t.from, to: place, stops: [place], item: t.item, qty, cost: ITEMS[t.item].price * qty, upah: quoteUpah(t.upah, route, t.item, qty), route: Math.round(route) });
  }
  return out.filter(o => !taken(o.id));
}
// Accepting locks the quoted upah and purchase cost into the job.
export function accept(eco, offer) {
  if (!offer) return { ok: false, reason: 'none' };
  if (eco.jobs.length >= MAX_JOBS) return { ok: false, reason: 'full' };
  if(offer.story?.startsWith('c1-')&&(eco.jobs.some(j=>j.story?.startsWith('c1-'))||eco.chapter.paid.includes(offer.story.slice(3))))return {ok:false,reason:'taken'};
  if (eco.jobs.some(j => j.offer === offer.id)) return { ok: false, reason: 'taken' };
  if (freeSpace(eco) < space(offer.item, offer.qty)) return { ok: false, reason: 'space' };
  const job = { id: `J${eco.nextJob}`, offer: offer.id, kind: offer.kind, requester: offer.requester, from: offer.from, to: offer.to, stops: [...offer.stops], left: offer.stops.length,
    item: offer.item, qty: offer.qty, cost: offer.cost, upah: offer.upah, route: Number.isFinite(offer.route) ? Math.max(0, Math.min(10000, Math.round(offer.route))) : 0, status: 'accepted', story: offer.story || null };
  eco.nextJob += 1; eco.jobs.push(job); return { ok: true, job };
}
// Collect prepaid cargo from the sender, or buy the goods at the supplier.
export function collect(eco, id, place) {
  const job = eco.jobs.find(j => j.id === id);
  if (!job || job.status !== 'accepted' || job.from !== place) return { ok: false, reason: 'not-here' };
  if (job.kind === 'purchase') { if (eco.wallet < job.cost) return { ok: false, reason: 'funds' }; eco.wallet -= job.cost; }
  add(eco.bag, job.item, job.qty); job.status = 'carrying'; return { ok: true, job };
}
// The next stop of a job being carried, or null.
export const nextStop = job => job.status === 'carrying' ? job.stops[job.stops.length - job.left] : null;
// Hand over at a stop. A multi-stop round leaves one unit per stop and pays
// its single total upah at the last stop. A paid job leaves the list and its
// id is remembered, so it can never pay twice.
export function deliver(eco, id, place) {
  const job = eco.jobs.find(j => j.id === id);
  if (!job || eco.done.includes(id)) return { ok: false, reason: 'unknown' };
  if (job.status !== 'carrying' || nextStop(job) !== place) return { ok: false, reason: 'not-here' };
  const relay=job.story?.startsWith('c1-R');const unit = relay?(job.left===1?1:0):job.stops.length > 1 ? 1 : job.qty;
  if ((eco.bag[job.item] || 0) < unit) return { ok: false, reason: 'missing' };
  add(eco.bag, job.item, -unit); job.left -= 1;
  if (job.left > 0) return { ok: true, job, paid: 0, more: job.left };
  const paid = job.upah + (job.kind === 'purchase' ? job.cost : 0);
  eco.wallet += paid; eco.jobs = eco.jobs.filter(j => j !== job);
  eco.done = [...eco.done, id].slice(-200); eco.served[job.requester] = (eco.served[job.requester] || 0) + 1;
  markChapterDelivery(eco, job);
  recordNostalgiaDelivery(eco, job);
  return { ok: true, job, paid, more: 0 };
}
// Cancel before pickup costs nothing. After pickup, unused goods go back to
// where they came from: the supplier refunds a purchase, the sender takes
// back prepaid cargo. Multi-stop rounds already started cannot be returned.
export function cancel(eco, id, place = null) {
  const job = eco.jobs.find(j => j.id === id);
  if (!job) return { ok: false, reason: 'unknown' };
  if (job.status === 'carrying') {
    if (place !== job.from) return { ok: false, reason: 'return-at', place: job.from };
    if (job.left < job.stops.length) return { ok: false, reason: 'started' };
    add(eco.bag, job.item, -job.qty);
    if (job.kind === 'purchase') eco.wallet += job.cost;
  }
  eco.jobs = eco.jobs.filter(j => j !== job); return { ok: true, job, refund: job.status === 'carrying' && job.kind === 'purchase' ? job.cost : 0 };
}
// Shopping for yourself: snacks are eaten, collectibles go to the album,
// goods go in the bag. Personal purchases are never reimbursed.
export function buy(eco, place, item) {
  if (ITEMS[item]?.rewardOnly) return { ok: false, reason: 'quest-only' };
  if (!STOCK[place]?.includes(item)) return { ok: false, reason: 'not-sold' };
  if ((TAMIYA_CARS[item] || TAMIYA_PARTS[item]) && !tamiyaUnlocked(eco)) return { ok:false, reason:'meet-faiz' };

  const it = ITEMS[item];
  if ((TAMIYA_CARS[item] || TAMIYA_PARTS[item]) && eco.collection[item]) return { ok: false, reason: 'owned' };
  if (eco.wallet < it.price) return { ok: false, reason: 'funds' };
  if (it.kind === 'goods' && freeSpace(eco) < it.size) return { ok: false, reason: 'space' };
  eco.wallet -= it.price;
  if (it.kind === 'collect') eco.collection[item] = (eco.collection[item] || 0) + 1;
  else if (it.kind === 'goods') add(eco.bag, item, 1);
  return { ok: true, kind: it.kind };
}
// What the player can do with their jobs at a place.
export const jobsAt = (eco, place) => ({
  collect: eco.jobs.filter(j => j.status === 'accepted' && j.from === place),
  deliver: eco.jobs.filter(j => nextStop(j) === place)
});

// Friendship: a fresh daily chat +1, a completed errand +3, a story milestone
// +8. Each NPC caps at 100.
export const POINTS = { talk: 1, errand: 3, story: 8 };
export function befriend(eco, key, reason, today) {
  if (!NPCS[key]) return 0;
  if (reason === 'talk') { if (eco.talked[key] === today) return 0; eco.talked[key] = today; }
  const before = eco.friends[key] || 0, after = Math.min(100, before + POINTS[reason]);
  eco.friends[key] = after; return after - before;
}

// Keep only well-formed economy fields from a save.
export function cleanEconomy(value) {
  const eco = newEconomy();
  if (!value || typeof value !== 'object') return eco;
  eco.chapter = cleanChapter(value.chapter);
  eco.prayer = cleanPrayerProgress(value.prayer);
  eco.nostalgia = cleanNostalgia(value.nostalgia);
  const int = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi, place = n => int(n, 1, 38);
  if (int(value.wallet, 0, 1e7)) eco.wallet = value.wallet;
  for (const [item, qty] of Object.entries(value.bag || {})) if (ITEMS[item] && !ITEMS[item].rewardOnly && ITEMS[item].kind !== 'snack' && int(qty, 1, 999)) eco.bag[item] = qty;
  for (const [item, qty] of Object.entries(value.collection || {})) if (ITEMS[item]?.kind === 'collect' && !NOSTALGIA_ITEMS[item] && int(qty, 1, 999)) eco.collection[item] = qty;
  for (const id of Object.keys(eco.nostalgia.earned)) eco.collection[id] = 1;
  if (Array.isArray(value.done)) eco.done = value.done.filter(id => typeof id === 'string' && /^J\d+$/.test(id)).slice(-200);
  if (Array.isArray(value.jobs)) eco.jobs = value.jobs.filter(j => j && /^J\d+$/.test(j.id) && !eco.done.includes(j.id) && typeof j.offer === 'string' && place(j.requester) && place(j.from) && place(j.to)
    && Array.isArray(j.stops) && j.stops.length >= 1 && j.stops.length <= 5 && j.stops.every(place) && int(j.left, 1, j.stops.length) && ITEMS[j.item] && int(j.qty, 1, 99)
    && ['parcel', 'purchase'].includes(j.kind) && int(j.cost, 0, 1e6) && int(j.upah, 0, 1e6) && ['accepted', 'carrying'].includes(j.status))
    .map(({ id, offer, kind, requester, from, to, stops, left, item, qty, cost, upah, route, status, story }) => ({ id, offer, kind, requester, from, to, stops: [...stops], left, item, qty, cost, upah, ...(route === undefined ? {} : { route: int(route, 0, 10000) ? route : 0 }), status, story: typeof story === 'string' ? story : null })).slice(0, MAX_JOBS);
  const highest = Math.max(0, ...[...eco.done, ...eco.jobs.map(j => j.id)].map(id => Number(id.slice(1))));
  eco.nextJob = int(value.nextJob, 1, 1e9) ? Math.max(value.nextJob, highest + 1) : highest + 1;
  for (const [p, n] of Object.entries(value.served || {})) if (place(Number(p)) && int(n, 0, 1e6)) eco.served[p] = n;
  for (const [key, n] of Object.entries(value.friends || {})) if (NPCS[key] && int(n, 0, 100)) eco.friends[key] = n;
  for (const [key, day] of Object.entries(value.talked || {})) if (NPCS[key] && typeof day === 'string' && day.length <= 10) eco.talked[key] = day;
  if (value.congkak && int(value.congkak.played, 0, 1e6) && int(value.congkak.won, 0, value.congkak.played)) eco.congkak = { played: value.congkak.played, won: value.congkak.won };
  eco.dam = cleanDamProgress(value.dam);
  eco.gasing = cleanGasingProgress(value.gasing);
  eco.tamiya = cleanTamiyaProgress(value.tamiya, eco.collection);
  return eco;
}

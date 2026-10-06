import { TOWN_BOUNDS, RIVER } from './town-layout.js?v=0.10.0';

// Where every tree goes, worked out from the town plan alone so the tests can
// check it and the planting follows the editor when buildings move.
// A planting is { kind, x, z, size, seed, ring }: ring 'in' is inside the
// walkable town (it has a trunk to bump into), 'near' and 'far' are the
// orchard and rubber estate just past the town edge, seen but not reached.

// Trunk radius per kind at size 1. Clumps (pisang, buluh, herbs) are solid too.
export const TRUNK = {
  kelapa: .3, pinang: .16, pisang: .45, buluh: .7, rambutan: .3, mangga: .32, jambu: .22, nangka: .34,
  durian: .4, getah: .22, hujan: .55, ketapang: .32, kemboja: .26, beringin: 1.5, bungaraya: .45,
  serai: .3, pandan: .35, cili: .25
};
// Districts set the mix: kampung yards and dusun, terrace gardens, the old
// pekan's shade trees, the school and mosque grounds, the bus and market lots.
const MIX = {
  kampung: [['kelapa', 30], ['pisang', 22], ['rambutan', 12], ['mangga', 10], ['nangka', 8], ['pinang', 8], ['jambu', 5], ['durian', 5]],
  terrace: [['mangga', 30], ['jambu', 25], ['kelapa', 25], ['bungaraya', 20]],
  pekan: [['hujan', 45], ['kelapa', 30], ['ketapang', 25]],
  community: [['ketapang', 35], ['hujan', 30], ['kelapa', 20], ['bungaraya', 15]],
  transport: [['hujan', 40], ['kelapa', 35], ['pisang', 25]]
};
// Past the edge: a mixed kampung dusun behind the kampung, a rubber
// smallholding with its straight rows everywhere else.
const DUSUN = [['kelapa', 30], ['rambutan', 15], ['durian', 14], ['pisang', 14], ['nangka', 10], ['pinang', 10], ['mangga', 7]];
const BANK = [['buluh', 40], ['pisang', 30], ['kelapa', 30]];
// The lawn runs about 12 m past the walkable edge before the painted horizon.
export const GROUND = { minX: -89, maxX: 89, minZ: -79, maxZ: 79 };

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function hash(text) { let h = 2166136261; for (const c of String(text)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function pick(mix, r) { const total = mix.reduce((n, [, w]) => n + w, 0); let t = r * total; for (const [kind, w] of mix) if ((t -= w) < 0) return kind; return mix[0][0]; }

export function plantTown(town) {
  const B = TOWN_BOUNDS, plants = [], random = rng(2001);
  const roads = town.roads, units = town.units;
  const inside = (x, z, pad = 0) => x > B.minX + pad && x < B.maxX - pad && z > B.minZ + pad && z < B.maxZ - pad;
  const inRiver = (x, pad = 0) => Math.abs(x - RIVER.x) < RIVER.w / 2 + pad;
  const onRoad = (x, z, asphalt, dirt) => roads.some(r => { const p = r.kind === 'asphalt' ? asphalt : dirt; return Math.abs(x - r.x) < r.w / 2 + p && Math.abs(z - r.z) < r.d / 2 + p; });
  const onBridge = (x, z, pad) => town.bridges.some(b => Math.abs(x - b.x) < b.w / 2 + pad && Math.abs(z - b.z) < b.d / 2 + pad);
  const inSolid = (x, z, pad, except) => units.some(u => u !== except && u.solids.some(([sx, sz, sw, sd]) => Math.abs(x - sx) < sw / 2 + pad && Math.abs(z - sz) < sd / 2 + pad));
  const nearUnit = (x, z, pad) => units.some(u => { const [ax, az, aw, ad] = u.area; return Math.abs(x - ax) < aw / 2 + pad && Math.abs(z - az) < ad / 2 + pad; });
  const people = [town.spots.spawn, town.spots.nur, town.spots.pak, ...town.passersby].filter(Boolean);
  const nearPeople = (x, z, pad) => people.some(p => Math.hypot(x - p.x, z - p.z) < pad);
  const crowded = (x, z, gap) => plants.some(p => Math.hypot(x - p.x, z - p.z) < Math.max(gap, p.kind === 'beringin' ? 7 : 0));
  // Roads that meet the edge carry on out of town through a gap in the trees.
  const corridors = roads.filter(r => r.kind === 'asphalt').map(r => {
    const alongX = r.w >= r.d, a = alongX ? r.x - r.w / 2 : r.z - r.d / 2, b = alongX ? r.x + r.w / 2 : r.z + r.d / 2, lo = alongX ? B.minX : B.minZ, hi = alongX ? B.maxX : B.maxZ;
    const from = a <= lo + 1 ? -200 : a, to = b >= hi - 1 ? 200 : b;
    return alongX ? { x: (from + to) / 2, z: r.z, w: to - from, d: r.d } : { x: r.x, z: (from + to) / 2, w: r.w, d: to - from };
  });
  const inCorridor = (x, z, pad) => corridors.some(c => Math.abs(x - c.x) < c.w / 2 + pad && Math.abs(z - c.z) < c.d / 2 + pad);
  const zoneOf = (x, z) => {
    let best = null, distance = Infinity;
    for (const b of town.buildings) {
      const dx = Math.max(0, Math.abs(x - b.x) - b.w / 2), dz = Math.max(0, Math.abs(z - b.z) - b.d / 2), d = dx * dx + dz * dz;
      if (d < distance) { distance = d; best = b; }
    }
    return best ? best.zone : 'kampung';
  };
  const add = (kind, x, z, size, ring) => plants.push({ kind, x: +x.toFixed(2), z: +z.toFixed(2), size: +size.toFixed(2), seed: plants.length * 7919 + 13, ring });
  // A walkable spot: clear of roads, the river, bridges, buildings and people.
  const clearIn = (x, z, r, except) => inside(x, z, r + .4) && !inRiver(x, r + 1) && !onBridge(x, z, r + 2) && !onRoad(x, z, r + .5, r + .3) && !inSolid(x, z, r + .5, except) && !nearPeople(x, z, r + 1.6);

  // 0. One old beringin, in the most open lawn near Pak Mat's warung: the
  //    tree everyone meets under. It follows the warung when the plan moves.
  const pak = town.spots.pak;
  if (pak) {
    const rectGap = (x, z, [rx, rz, w, d]) => Math.hypot(Math.max(0, Math.abs(x - rx) - w / 2), Math.max(0, Math.abs(z - rz) - d / 2));
    let best = null;
    for (let x = Math.round(pak.x) - 24; x <= pak.x + 24; x++) for (let z = Math.round(pak.z) - 24; z <= pak.z + 24; z++) {
      if (!inside(x, z, 6) || Math.hypot(x - pak.x, z - pak.z) > 24) continue;
      let gap = Math.abs(x - RIVER.x) - RIVER.w / 2;
      for (const u of units) gap = Math.min(gap, rectGap(x, z, u.area));
      for (const r of roads) gap = Math.min(gap, rectGap(x, z, [r.x, r.z, r.w, r.d]) + (r.kind === 'asphalt' ? 0 : 1.5));
      for (const p of people) gap = Math.min(gap, Math.hypot(x - p.x, z - p.z) - 2);
      if (!best || gap > best.gap + .01) best = { x, z, gap };
    }
    if (best && best.gap >= 5) add('beringin', best.x, best.z, Math.min(1.1, best.gap / 5.6), 'in');
  }
  // 1. Each building kind plants its own yard (in its frame, so it turns and
  //    moves with the unit). Kinds with variants pick one per unit.
  for (const u of units) {
    const sets = u.def.decorVariants, list = sets ? sets[hash(u.id) % sets.length] : u.def.decor || [];
    for (const [kind, lx, lz, size = 1] of list) {
      const turn = u.rot % 4, c = [1, 0, -1, 0][turn], s = [0, 1, 0, -1][turn];
      const x = u.x + lx * c + lz * s, z = u.z - lx * s + lz * c, r = TRUNK[kind] * size;
      if (clearIn(x, z, r, u) && !inSolid(x, z, r + .3, null) && !crowded(x, z, r + .8)) add(kind, x, z, size, 'in');
    }
  }
  // 2. Open lawn between the yards, by district.
  for (let x = B.minX + 3; x < B.maxX - 2; x += 6.5) for (let z = B.minZ + 3; z < B.maxZ - 2; z += 6.5) {
    const jx = x + (random() - .5) * 5, jz = z + (random() - .5) * 5, skip = random(), roll = random(), sized = random();
    const zone = zoneOf(jx, jz), kind = pick(MIX[zone], roll), r = TRUNK[kind] * 1.2;
    if (skip < (zone === 'pekan' ? .45 : zone === 'kampung' ? .1 : .25)) continue;
    if (!clearIn(jx, jz, r) || onRoad(jx, jz, 3, 1.4) || nearUnit(jx, jz, 1.2) || crowded(jx, jz, kind === 'hujan' ? 9 : 4.2)) continue;
    add(kind, jx, jz, .85 + sized * .3, 'in');
  }
  // 3. Bamboo, banana and leaning coconut along both river banks.
  for (let z = B.minZ + 2; z < B.maxZ - 1; z += 5.5) for (const side of [-1, 1]) {
    const x = RIVER.x + side * (RIVER.w / 2 + 1.6 + random() * 1.2), jz = z + (random() - .5) * 2.5, kind = pick(BANK, random()), size = .85 + random() * .3;
    if (random() < .3) continue;
    const r = TRUNK[kind] * size;
    if (inside(x, jz, r + .4) && !onBridge(x, jz, 4) && !onRoad(x, jz, 2, 1) && !inSolid(x, jz, r + .8) && !crowded(x, jz, 3.2)) add(kind, x, jz, size, 'in');
  }
  // 4. The edge: three or four rows deep past the wall, and the free pockets
  //    just inside it. Rubber rows stay on a straight grid; the dusun is loose.
  const G = GROUND;
  for (let x = G.minX + 1; x <= G.maxX - 1; x += 4.5) for (let z = G.minZ + 1; z <= G.maxZ - 1; z += 4.5) {
    const outside = !inside(x, z, -.5), depth = outside ? Math.max(B.minX - x, x - B.maxX, B.minZ - z, z - B.maxZ) : Math.min(x - B.minX, B.maxX - x, z - B.minZ, B.maxZ - z);
    const rollA = random(), rollB = random(), rollC = random(), rollD = random();
    if (!outside && depth > 9) continue;
    const zone = zoneOf(Math.max(B.minX, Math.min(B.maxX, x)), Math.max(B.minZ, Math.min(B.maxZ, z))), estate = zone !== 'kampung';
    let kind = estate ? (rollA < .9 ? 'getah' : 'kelapa') : pick(DUSUN, rollA);
    if (!estate && kind === 'durian' && depth < 6) kind = 'rambutan';
    if (!estate && kind === 'pisang' && depth > 7) kind = 'kelapa';
    const jx = estate ? x : x + (rollB - .5) * 2.6, jz = estate ? z + (rollC - .5) * .6 : z + (rollC - .5) * 2.6, size = .9 + rollD * .3;
    if (jx < G.minX || jx > G.maxX || jz < G.minZ || jz > G.maxZ || inRiver(jx, 2.2) || inCorridor(jx, jz, 2.5) || rollB < (outside ? .06 : .35)) continue;
    // Past the wall a tree has no trunk to bump into, so keep it wholly outside.
    if (outside) { if (!inside(jx, jz, -(TRUNK[kind] * size + .4)) && !crowded(jx, jz, 3)) add(kind, jx, jz, size, depth < 5.5 ? 'near' : 'far'); continue; }
    const r = TRUNK[kind] * size;
    if (clearIn(jx, jz, r) && !onRoad(jx, jz, 2.5, 1.2) && !nearUnit(jx, jz, 1.2) && !crowded(jx, jz, 4)) add(kind, jx, jz, size, 'in');
  }
  // Bamboo thickets where the river leaves town, north and south.
  for (const z0 of [B.minZ - 2, B.maxZ + 2]) for (let i = 0; i < 6; i++) {
    const dir = Math.sign(z0), x = RIVER.x + (i % 2 ? 1 : -1) * (RIVER.w / 2 + 1.5 + random() * 2), z = z0 + dir * i * 2.1;
    if (!inside(x, z, -1.2) && !crowded(x, z, 2.2)) add('buluh', x, z, .9 + random() * .3, 'near');
  }
  return plants;
}

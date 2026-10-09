// The town's extras: kids and orang kampung who gather by the clock. It is
// the school holidays, so kids play guli on the five-foot way, hang about
// the corner shop and run to the padang in the afternoon; pakcik take
// breakfast at the warung and walk to the masjid at Maghrib; Saturday night
// brings a crowd to the pasar malam.
//
// Each extra has `outings`: { out, from, stops, home, days }. Kids run out of
// the `out` house door at `from`, run from stop to stop (each stop ends at
// `until`) and run home to `home`. Without `out` or `home` they appear at the
// first stop or vanish after the last, out of the player's sight. `spot` is
// [right, forward] metres from the place's door, facing out; `loop` names a
// LOOPS routine. `days` limits an outing to weekdays (0 = Sabtu).
// Their position comes from the clock alone, so loads and sleeps need nothing.
const h = (hour, minute = 0) => hour * 60 + minute;
export const RUN_SPEED = 2.6, WALK_SPEED = 1.15;
export const LOOPS = {
  guli: { steps: [['do', 'bend', 6], ['do', 'talk', 3], ['do', 'bend', 5], ['do', 'wave', 2], ['do', 'scratch', 2]] },
  hang: { steps: [['do', 'talk', 4], ['do', 'fan', 3], ['do', 'look', 3], ['do', 'nod', 2], ['do', 'talk', 3]] },
  play: { steps: [['do', 'stretch', 2], ['walk', 'left'], ['do', 'wave', 2], ['walk', 'right'], ['do', 'talk', 3], ['walk', 'forward'], ['do', 'bend', 3], ['walk', 'home']] },
  chat: { steps: [['do', 'talk', 5], ['do', 'nod', 2], ['do', 'fold', 4], ['do', 'look', 3], ['do', 'talk', 4]] },
  pray: { steps: [['stand', 5], ['do', 'nod', 2], ['do', 'fold', 5], ['do', 'talk', 3]] },
  shop: { steps: [['do', 'look', 4], ['walk', 'forward'], ['do', 'talk', 3], ['walk', 'home'], ['do', 'check', 2], ['do', 'nod', 2]] }
};
export const CROWD = {
  adam: { name: 'Adam', kid: true, outings: [
    { out: 16, from: h(14), stops: [{ at: 24, spot: [2.2, 1.4], until: h(16, 10), loop: 'guli' }, { at: 34, spot: [-4, 6], until: h(18, 40), loop: 'play' }], home: 16 }] },
  hakim: { name: 'Badrul', kid: true, outings: [
    { out: 17, from: h(14), stops: [{ at: 24, spot: [3.2, 1.6], until: h(16, 10), loop: 'guli' }, { at: 34, spot: [-2.5, 7.5], until: h(18, 40), loop: 'play' }], home: 17 }] },
  aisyah: { name: 'Aisyah', kid: true, outings: [
    { out: 12, from: h(10), stops: [{ at: 19, spot: [1.8, 1.6], until: h(11, 30), loop: 'hang' }], home: 12 },
    { out: 12, from: h(15), stops: [{ at: 19, spot: [1.8, 1.6], until: h(16, 20), loop: 'hang' }, { at: 34, spot: [-4.5, 8], until: h(18, 40), loop: 'play' }], home: 12 }] },
  keong: { name: 'Johnny', kid: true, outings: [
    { out: 18, from: h(15), stops: [{ at: 19, spot: [2.8, 1.8], until: h(16, 20), loop: 'hang' }, { at: 34, spot: [-3, 9], until: h(18, 40), loop: 'play' }], home: 18 }] },
  siti: { name: 'Siti', kid: true, outings: [
    { out: 7, from: h(8, 30), stops: [{ at: 22, spot: [2.5, 2.2], until: h(9, 30), loop: 'hang' }], home: 7 },
    { out: 7, from: h(16), stops: [{ at: 34, spot: [-5.5, 6.5], until: h(18, 40), loop: 'play' }], home: 7 },
    { days: [0], out: 4, from: h(19, 30), stops: [{ at: 38, spot: [1.5, 3], until: h(21), loop: 'shop' }], home: 4 }] },
  ravi: { name: 'Logeswaran', kid: true, outings: [
    { out: 5, from: h(15, 45), stops: [{ at: 34, spot: [-1.5, 8.5], until: h(18, 40), loop: 'play' }], home: 5 },
    { days: [0], out: 6, from: h(19, 30), stops: [{ at: 38, spot: [2.6, 3.6], until: h(21), loop: 'shop' }], home: 6 }] },
  seman: { name: 'Pak Seman', outings: [
    { from: h(7), stops: [{ at: 21, spot: [2.5, 2], until: h(9, 30), loop: 'chat' }] },
    { from: h(18, 55), stops: [{ at: 31, spot: [2.2, 2.4], until: h(19, 50), loop: 'pray' }] }] },
  daud: { name: 'Pak Daud', outings: [
    { from: h(7), stops: [{ at: 21, spot: [3.6, 2.6], until: h(9, 30), loop: 'chat' }] },
    { days: [0], from: h(18, 30), stops: [{ at: 38, spot: [-1.5, 3], until: h(21, 30), loop: 'shop' }] }] },
  rashid: { name: 'Pak Rashid', outings: [
    { from: h(16, 30), stops: [{ at: 21, spot: [3, 1.4], until: h(18, 30), loop: 'chat' }] },
    { from: h(18, 55), stops: [{ at: 31, spot: [3.2, 3.2], until: h(19, 50), loop: 'pray' }] }] },
  gayah: { name: 'Mak Cik Gayah', outings: [
    { from: h(9), stops: [{ at: 22, spot: [3.4, 2.8], until: h(10, 30), loop: 'hang' }] },
    { days: [0], from: h(18, 30), stops: [{ at: 38, spot: [-2.6, 4], until: h(21, 30), loop: 'shop' }] }] }
};
export const CROWD_KEYS = Object.keys(CROWD);
const onDay = (outing, day) => !outing.days || outing.days.includes((day - 1) % 7);

// Where an extra is at a moment. `legs[o][i]` is the path into stop i of
// outing o (from the `out` door or the previous stop), `legs[o].home` the
// path from the last stop to the `home` door. Returns null when they are
// indoors or away, else { key, x, z, heading, moving, run, stop } with `stop`
// set while standing at a stop.
export function crowdPose(key, minute, day, legs) {
  const c = CROWD[key], speed = c.kid ? RUN_SPEED : WALK_SPEED;
  const along = (path, metres) => {
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i], len = Math.hypot(b.x - a.x, b.z - a.z);
      if (metres <= len || i === path.length - 1) { const t = Math.min(1, metres / (len || 1)); return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, heading: Math.atan2(b.x - a.x, b.z - a.z) }; }
      metres -= len;
    }
    return { ...path[0], heading: 0 };
  };
  const length = path => path.slice(1).reduce((n, p, i) => n + Math.hypot(p.x - path[i].x, p.z - path[i].z), 0);
  for (const [o, outing] of c.outings.entries()) {
    if (!onDay(outing, day)) continue;
    let t = outing.from;
    for (const [i, stop] of outing.stops.entries()) {
      const path = (i > 0 || outing.out) && legs?.[o]?.[i];
      if (path) {
        const end = t + length(path) / speed;
        if (minute >= t && minute < end) return { key: `${o}.${i}.run`, ...along(path, (minute - t) * speed), moving: 1, run: c.kid, stop: null };
        t = end;
      }
      if (minute >= t && minute < stop.until) return { key: `${o}.${i}`, moving: 0, run: false, stop: { outing: o, index: i, ...stop } };
      t = Math.max(t, stop.until);
    }
    const home = outing.home && legs?.[o]?.home;
    if (home && minute >= t && minute < t + length(home) / speed) return { key: `${o}.home`, ...along(home, (minute - t) * speed), moving: 1, run: c.kid, stop: null };
  }
  return null;
}

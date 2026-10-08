// Errands: six residents leave their door at set times, walk the town's
// paths to a shop or the padang, spend a while there and walk home. While
// they are out, the family member who keeps the house (cast.js KEEPERS)
// answers the door, so a parcel can always be handed over.
//
// Times are town-clock minutes (one a second). `to` is a place id; `say` is
// what they tell you if you stop them in the street.
const h = (hour, minute = 0) => hour * 60 + minute;
export const ERRANDS = {
  mail: { keeper: 'senah', trips: [
    { to: 9, from: h(8), until: h(10), say: 'Nak ke kebun Pak Mat, tengok anak benih cili. Mak Cik Senah ada di rumah.' },
    { to: 9, from: h(16, 30), until: h(18), say: 'Petang-petang macam ni, siram pokok. Barang untuk rumah, bagi Mak Cik Senah.' }] },
  salmah: { keeper: 'jalil', trips: [
    { to: 21, from: h(9, 30), until: h(10, 30), say: 'Hantar kuih ke warung Kak Ita. Pak Jalil jaga rumah.' },
    { to: 21, from: h(15), until: h(16), say: 'Cucur petang untuk warung! Kalau ada barang, Pak Jalil ada.' }] },
  kamal: { keeper: 'midah', trips: [
    { to: 37, from: h(10), until: h(11), say: 'Isi minyak motor dulu. Kak Midah ada di rumah.' },
    { to: 36, from: h(17), until: h(18, 15), say: 'Pak Man nak tengok lori aku esok. Nak tanya harga dulu.' }] },
  abu: { keeper: 'esah', trips: [
    { to: 33, from: h(8, 30), until: h(10), say: 'Pulangkan buku ke perpustakaan. Mak Cik Esah ada di rumah.' },
    { to: 31, from: h(12, 40), until: h(14), say: 'Nak ke masjid, Zohor. Barang? Mak Cik Esah terima.' }] },
  faizal: { keeper: 'rozita', trips: [
    { to: 22, from: h(11), until: h(12), say: 'Beli surat khabar dan gula di kedai Pak Rahman. Isteri saya ada di rumah.' },
    { to: 34, from: h(17), until: h(18, 30), say: 'Main takraw di padang! Puan Rozita jaga rumah.' }] },
  kiah: { keeper: 'som', trips: [
    { to: 28, from: h(9), until: h(10), say: 'Roti untuk tetamu malam ni. Wan Som ada di rumah.' },
    { to: 22, from: h(14, 30), until: h(15, 30), say: 'Lupa beli santan! Mak Wan ada di rumah kalau ada barang.' }] }
};
export const ERRAND_KEYS = Object.keys(ERRANDS);
export const tripAt = (key, minute) => ERRANDS[key]?.trips.find(t => minute >= t.from && minute < t.until) || null;

const WALK_SPEED = 1.15;
const angleTo = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

// One walker. `home` is { x, z, heading } at their door; `routes[to]` is
// { path, spot } with `path` from home to `spot` (the place they stand at the
// destination, with a heading towards its door). `homeRoutine(at)` and
// `awayRoutine(spot)` make routines.js loops. update(dt, minute, options)
// returns the same shape of state as a routine.
//   options.sync   jump straight to where the clock says (load, sleep, prayer)
//   options.free   (x, z) => false while another person stands in the way
//   options.stay   a story needs them at their door: skip errands, go home
export function createErrand(key, home, routes, homeRoutine, awayRoutine) {
  const state = { x: home.x, z: home.z, heading: home.heading, moving: 0, travel: 0, action: null, actionTime: 0, phase: 'home', at: null };
  let routine = homeRoutine(home), path = null, index = 0, wait = 0;
  const copy = s => { state.x = s.x; state.z = s.z; state.heading = s.heading; state.moving = s.moving; state.travel = s.travel; state.action = s.action; state.actionTime = s.actionTime; };
  function settle(trip) {
    const route = trip && routes[trip.to];
    if (route) { state.phase = 'away'; state.at = trip.to; routine = awayRoutine(route.spot); }
    else { state.phase = 'home'; state.at = null; routine = homeRoutine(home); }
    copy(routine.state); path = null;
  }
  function walk(points, phase, at) { state.phase = phase; state.at = at; path = [{ x: state.x, z: state.z }, ...points]; index = 1; wait = 0; }
  function update(dt, minute, { sync = false, pause = false, look = null, free = () => true, stay = false } = {}) {
    const trip = stay ? null : tripAt(key, minute), route = trip && routes[trip.to];
    if (sync) settle(trip);
    // Time to go out, or time to come home.
    if (state.phase === 'home' && route) walk(route.path, 'out', trip.to);
    else if (state.phase === 'away' && (!trip || trip.to !== state.at)) walk([...routes[state.at].path].reverse(), 'back', state.at);
    if (!path) { copy(routine.update(dt, { pause, look })); return state; }
    state.action = null; state.moving = 0; state.travel = 0;
    // Stopped in the street: turn to whoever stopped them.
    if (pause || look) { if (look) state.heading += angleTo(state.heading, Math.atan2(look.x - state.x, look.z - state.z)) * Math.min(1, dt * 6); return state; }
    const target = path[index];
    const dx = target.x - state.x, dz = target.z - state.z, left = Math.hypot(dx, dz);
    if (left < .05) {
      if (++index < path.length) return state;
      // Arrived: settle into the loop there.
      if (state.phase === 'out') { state.phase = 'away'; routine = awayRoutine(routes[state.at].spot); }
      else { state.phase = 'home'; state.at = null; routine = homeRoutine(home); }
      path = null; copy(routine.state); return state;
    }
    const step = Math.min(left, WALK_SPEED * dt), ux = dx / left, uz = dz / left, nx = state.x + ux * step, nz = state.z + uz * step;
    // Someone in the way: wait for them, and after a few seconds squeeze
    // past along the planned path, which is always clear of walls.
    if (!free(nx, nz) && (wait += dt) < 3) { state.heading += angleTo(state.heading, Math.atan2(ux, uz)) * Math.min(1, dt * 6); return state; }
    if (free(nx, nz)) wait = 0;
    state.travel = Math.hypot(nx - state.x, nz - state.z); state.x = nx; state.z = nz; state.moving = 1;
    state.heading += angleTo(state.heading, Math.atan2(ux, uz)) * Math.min(1, dt * 6);
    return state;
  }
  // Keep a heading set while talking, so they do not snap back afterwards.
  const face = heading => { state.heading = heading; if (!path) routine.state.heading = heading; };
  return { update, state, face, away: () => state.phase !== 'home', walking: () => !!path };
}

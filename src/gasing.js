// Local arcade endurance rules, independent of presentation. Throw quality
// sets angular speed and drag; the same throw always gives the same spin.
export const GASING_MODES = { belajar: 'Belajar dengan Atuk', practice: 'Latihan sendiri', faiz: 'Lawan Faiz', atuk: 'Cabaran Atuk' };
export const IDEAL_POWER = .78;
export const STABLE_SECONDS = 20;
const clamp = n => Math.max(0, Math.min(1, n));
export const meter = seconds => 1 - Math.abs((seconds % 2 + 2) % 2 - 1);
export function throwPhysics(power, release) {
  if (![power, release].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) throw new Error('Invalid throw');
  const powerQuality = clamp(1 - Math.abs(power - IDEAL_POWER) / IDEAL_POWER);
  const accuracy = clamp(1 - Math.abs(release - .5) * 2);
  const stability = accuracy * .8 + powerQuality * .2;
  const omega = (20 + 100 * powerQuality) * (.45 + .55 * accuracy);
  const drag = 4.1 + 13 * (1 - stability) ** 2;
  const duration = Math.max(0, (omega - 12) / drag);
  return { power, release, powerQuality, accuracy, stability, omega, drag, duration };
}
export function spinAt(top, seconds) {
  const t = Math.max(0, Math.min(seconds, top.duration));
  const omega = Math.max(12, top.omega - top.drag * t);
  const remaining = Math.max(0, top.duration - seconds);
  const wobble = Math.min(.7, (1 - top.stability) * .22 + .035 + (12 / omega) ** 2 * .5);
  return { omega: remaining ? omega : 0, angle: top.omega * t - .5 * top.drag * t * t,
    wobble, remaining, stopped: remaining === 0, fall: clamp((seconds - top.duration) / .65) };
}
export function rivalThrow(kind, id) {
  if (kind === 'practice') return null;
  const variation = Math.sin(id * 2.17) * .015;
  const profiles = { belajar: [.53, .72], faiz: [.65, .62], atuk: [.735, .555] };
  const [power, release] = profiles[kind];
  return throwPhysics(power + variation, release + Math.cos(id * 1.73) * .015);
}
export function newGasingRound(kind, id, equipment = 'loan') {
  if (!GASING_MODES[kind] || !Number.isInteger(id) || id < 1 || !['loan', 'owned'].includes(equipment)) throw new Error('Invalid Gasing round');
  return { id, kind, equipment, phase: 'ready', elapsed: 0, charging: false, power: 0, release: .5,
    player: null, opponent: rivalThrow(kind, id), winner: null, settled: false };
}
export function windString(s) {
  if (s.phase !== 'ready') throw new Error('Wind before charging');
  return { ...s, phase: 'winding', elapsed: 0 };
}
export function startCharge(s) {
  if (s.phase !== 'power') throw new Error('Not ready to charge');
  return { ...s, charging: true };
}
export function lockPower(s) {
  if (s.phase !== 'power' || !s.charging) throw new Error('Hold to charge first');
  return { ...s, phase: 'release', elapsed: 0, charging: false, release: 0 };
}
export function releaseTop(s) {
  if (s.phase !== 'release') throw new Error('Set power before release');
  return { ...s, phase: 'spin', elapsed: 0, player: throwPhysics(s.power, s.release) };
}
export const roundDuration = s => Math.max(s.player?.duration || 0, s.opponent?.duration || 0) + .8;
export function advanceGasing(s, seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Invalid elapsed time');
  const next = { ...s };
  if (s.phase === 'winding') {
    next.elapsed = Math.min(1.2, s.elapsed + seconds);
    if (next.elapsed >= 1.2) { next.phase = 'power'; next.elapsed = 0; }
  } else if (s.phase === 'power' && s.charging) {
    next.elapsed = (s.elapsed + seconds) % (2 / .7); next.power = meter(next.elapsed * .7);
  } else if (s.phase === 'release') {
    next.elapsed = (s.elapsed + seconds) % (2 / .65); next.release = meter(next.elapsed * .65);
  } else if (s.phase === 'spin') {
    next.elapsed = Math.min(roundDuration(s), s.elapsed + seconds);
    if (next.elapsed >= roundDuration(s)) {
      next.phase = 'result';
      next.winner = !s.opponent || Math.abs(s.player.duration - s.opponent.duration) <= .05 ? null : s.player.duration > s.opponent.duration ? 0 : 1;
    }
  }
  return next;
}
export function cleanGasingRound(v) {
  if (!v || !GASING_MODES[v.kind] || !Number.isInteger(v.id) || v.id < 1 || v.id > 1e9 || !['loan', 'owned'].includes(v.equipment)) return null;
  if (!['ready', 'winding', 'power', 'release', 'spin', 'result'].includes(v.phase)) return null;
  if (!Number.isFinite(v.elapsed) || v.elapsed < 0 || v.elapsed > 60 || ![v.power, v.release].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) return null;
  if (typeof v.settled !== 'boolean' || ![null, 0, 1].includes(v.winner)) return null;
  const s = { ...newGasingRound(v.kind, v.id, v.equipment), phase: v.phase, elapsed: v.elapsed, power: v.power, release: v.release, settled: v.settled };
  if (s.phase === 'ready' && (s.elapsed !== 0 || s.power !== 0)) return null;
  if (s.phase === 'winding' && s.elapsed >= 1.2 || s.phase === 'power' && s.elapsed >= 2 / .7 || s.phase === 'release' && s.elapsed >= 2 / .65) return null;
  if (['spin', 'result'].includes(s.phase)) {
    // Recompute physics and opponent rather than trusting saved durations.
    s.player = throwPhysics(s.power, s.release);
    if (s.elapsed > roundDuration(s) || s.phase === 'spin' && s.elapsed >= roundDuration(s) || s.phase === 'result' && s.elapsed !== roundDuration(s)) return null;
    if (s.phase === 'result') s.winner = !s.opponent || Math.abs(s.player.duration - s.opponent.duration) <= .05 ? null : s.player.duration > s.opponent.duration ? 0 : 1;
  }
  if (s.phase !== 'result' && (v.settled || v.winner !== null) || s.phase === 'result' && s.winner !== v.winner) return null;
  return s;
}

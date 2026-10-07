import { newGasingRound, cleanGasingRound, STABLE_SECONDS } from './gasing.js?v=1.8.0';
export const GASING_QUESTS = [
  { id: 'lesson', title: 'Lilit, tarik, lepas', text: 'Finish Atuk’s Belajar lesson.', sen: 20 },
  { id: 'stable', title: 'Pusing tegak', text: 'Finish a steady spin lasting at least 20 seconds.', sen: 30 },
  { id: 'faiz', title: 'Jaguh antara kawan', text: 'Beat Faiz at the padang.', sen: 50 },
  { id: 'atuk', title: 'Jaguh Gasing Pekan', text: 'Beat Atuk and earn the badge.', sen: 100 }
];
export function newGasingProgress() { return { played: 0, won: 0, best: 0, nextRound: 1, claimed: [], round: null }; }
export function cleanGasingProgress(v) {
  const p = newGasingProgress(); if (!v || typeof v !== 'object') return p;
  if (Number.isInteger(v.played) && v.played >= 0 && v.played <= 1e6 && Number.isInteger(v.won) && v.won >= 0 && v.won <= v.played) { p.played = v.played; p.won = v.won; }
  if (Number.isFinite(v.best) && v.best >= 0 && v.best <= 30) p.best = v.best;
  if (Number.isInteger(v.nextRound) && v.nextRound >= 1 && v.nextRound <= 1e9) p.nextRound = v.nextRound;
  if (Array.isArray(v.claimed)) p.claimed = [...new Set(v.claimed.filter(id => GASING_QUESTS.some(q => q.id === id)))];
  p.round = cleanGasingRound(v.round); if (p.round) p.nextRound = Math.max(p.nextRound, p.round.id + 1);
  return p;
}
export function startGasing(eco, kind) {
  const p = eco.gasing;
  if (p.round && p.round.phase !== 'result') throw new Error('Resume or end your saved round first');
  p.round = newGasingRound(kind, p.nextRound++, eco.collection.gasing ? 'owned' : 'loan');
  return p.round;
}
export function recordGasing(eco) {
  const p = eco.gasing, s = p.round, awards = [];
  if (!s || s.phase !== 'result' || s.settled) return awards;
  s.settled = true; p.played++; if (s.winner === 0) p.won++; p.best = Math.max(p.best, s.player.duration);
  const eligible = [s.kind === 'belajar' && 'lesson', s.player.duration >= STABLE_SECONDS && s.player.stability >= .85 && 'stable', s.winner === 0 && s.kind === 'faiz' && 'faiz', s.winner === 0 && s.kind === 'atuk' && 'atuk'];
  for (const id of eligible.filter(Boolean)) if (!p.claimed.includes(id)) {
    const q = GASING_QUESTS.find(q => q.id === id); p.claimed.push(id); eco.wallet += q.sen; awards.push(q);
  }
  return awards;
}

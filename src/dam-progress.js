import { newMatch, cleanMatch } from './dam-haji.js?v=2.10.0';
import { recordNostalgiaWin } from './nostalgia-quests.js?v=2.10.0';
export const DAM_QUESTS = [
  { id: 'practice', title: 'Duduk belajar', text: 'Finish a Belajar match with Pak Din.', sen: 20 },
  { id: 'haji', title: 'Haji pertama', text: 'Promote your first red piece to Haji.', sen: 30 },
  { id: 'santai', title: 'Menang di kiosk', text: 'Beat Pak Din at Santai.', sen: 50 },
  { id: 'jaguh', title: 'Jaguh Dam Pekan', text: 'Beat Pak Din at Jaguh and earn the badge.', sen: 100 }
];
export function newDamProgress() { return { played: 0, won: 0, claimed: [], match: null }; }
export function cleanDamProgress(v) {
  const p = newDamProgress(); if (!v || typeof v !== 'object') return p;
  if (Number.isInteger(v.played) && v.played >= 0 && v.played <= 1e6 && Number.isInteger(v.won) && v.won >= 0 && v.won <= v.played) { p.played = v.played; p.won = v.won; }
  if (Array.isArray(v.claimed)) p.claimed = [...new Set(v.claimed.filter(id => DAM_QUESTS.some(q => q.id === id)))];
  p.match = cleanMatch(v.match); return p;
}
export function startDam(eco, level) {
  if (eco.dam.match && !eco.dam.match.over) throw new Error('Resume or resign the saved match first');
  eco.dam.match = newMatch(level); return eco.dam.match;
}
export function recordDam(eco) {
  const m = eco.dam.match, awards = [];
  if (!m) return awards;
  function claim(id) {
    if (eco.dam.claimed.includes(id)) return;
    const quest = DAM_QUESTS.find(q => q.id === id);
    eco.dam.claimed.push(id); eco.wallet += quest.sen; awards.push(quest);
  }
  if (m.last?.promoted && m.cells[m.last.to] === 2) claim('haji');
  if (m.over && !m.settled) {
    m.settled = true; eco.dam.played++;
    if (m.winner === 0) { eco.dam.won++; recordNostalgiaWin(eco, { game: 'dam', level: m.level }); }
    if (m.reason !== 'resigned' && m.level === 'belajar') claim('practice');
    if (m.winner === 0 && m.level === 'santai') claim('santai');
    if (m.winner === 0 && m.level === 'jaguh') claim('jaguh');
  }
  return awards;
}

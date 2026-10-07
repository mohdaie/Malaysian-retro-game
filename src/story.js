// Chapter 1 for both playable characters, Amir and Nur: school holidays
// leading to the community's Pameran Kenangan. Pure: the game reports
// events, `advance` moves the chapter on, `storyOffers` adds the chapter's
// own jobs to the right counters.
import { NOSTALGIA_QUESTS, nostalgiaStatus } from './nostalgia-quests.js?v=2.7.0';
import { NOSTALGIA_ITEMS } from './nostalgia-items.js?v=2.7.0';
export const PLAYERS = {
  amir: { name: 'Amir', home: 1, parent: 'Mak', parentPlace: 1 },
  nur: { name: 'Nur', home: 11, parent: 'Ibu', parentPlace: 11 }
};
export const CHAPTER = 'CHAPTER 01 · CUTI SEKOLAH';
// Each step: what the quest card says, who the gold marker points at
// (an NPC key or a place id) and the event that completes it.
export const STEPS = [
  { title: 'Kawan lama', text: 'Faiz and Mei Ling are waiting at the padang by the gelanggang. Go and say hello.', target: 'faiz', on: 'met-friends' },
  { title: 'Kerja pertama', text: 'Ask Pak Rahman at Kedai Runcit 99 for delivery work, and take his parcel for Nenek.', target: 'rahman', on: 'accepted-first-parcel' },
  { title: 'Hantar ke rumah Nenek', text: 'Collect the parcel from Pak Rahman and hand it to Nenek at Rumah Tok.', target: 'job', on: 'delivered-first-parcel' },
  { title: 'Teh untuk Nenek', text: 'Nenek has run out of tea. Buy a packet from Pak Rahman and bring it to her. She will pay you back.', target: 'job', on: 'delivered-tea' },
  { title: 'Congkak di beranda', text: 'Sit with Nenek on her veranda and play a round of congkak.', target: 'nenek', on: 'played-congkak-nenek' },
  { title: 'Simpan sikit-sikit', text: 'Buy your first collectible at Uncle Lim’s. Then help Pak Salleh prepare something special for the school holidays.', target: 'lim', on: 'bought-collectible' },
  { title: 'Pameran Kenangan', text: 'Pak Salleh is preparing a school-holiday exhibition at the balai raya. Ask how your deliveries and the town’s old keepsakes can help.', target: 'salleh', on: 'invited-exhibition' },
  { title: 'Dengar cerita pekan', text: 'Explore the town and listen to its people. A story you discover may become your contribution to the exhibition.', target: 'memory', on: null },
  { title: 'Dipercayai satu pekan', text: 'Finish varied deliveries and long routes for your chosen keepsake. Learn the town and earn its people’s trust for the exhibition.', target: 'memory', on: null },
  { title: 'Jejak kenangan', text: 'Follow your keepsake’s clues across town, in order. Discover the people behind the object so their story can be shared at the balai raya.', target: 'memory', on: null },
  { title: 'Buktikan usaha', text: 'Win the keepsake’s game challenges. Show the patience and practice that its giver asks of you.', target: 'memory', on: null },
  { title: 'Hadiah penuh cerita', text: 'Return to the giver, choose a personal dedication and receive your first earned keepsake for the exhibition.', target: 'memory', on: null },
  { title: 'Cerita untuk semua', text: 'Bring your earned keepsake’s story to Pak Salleh at the balai raya. Sharing it at Pameran Kenangan completes Chapter 1.', target: 'salleh', on: 'shared-keepsake' },
  { title: 'Cuti yang dikenang', text: 'Chapter complete. Your first keepsake’s story is part of Pameran Kenangan. Keep exploring, earning the other keepsakes and making new memories.', target: null, on: null }
];
export const DONE = STEPS.length - 1;
// Friendship milestones the chapter awards (+8 each) as steps complete.
export const MILESTONES = { 'met-friends': ['faiz', 'meiling'], 'delivered-first-parcel': ['rahman'], 'played-congkak-nenek': ['nenek'], 'bought-collectible': ['lim'], 'invited-exhibition': ['salleh'], 'shared-keepsake': ['salleh'] };

export function advance(step, event) {
  if (!STEPS[step]?.on || STEPS[step].on !== event) return step;
  return step + 1;
}

export const EXHIBITION_LINKS = {
  nostalgia_M01: 'Faiz’s unfinished verse gives the exhibition a story about finding the courage to be heard.',
  nostalgia_P02: 'A comic passed between school bags brings the exhibition a story about friendship and borrowed laughter.',
  nostalgia_G01: 'Kak Lina’s old phone brings the exhibition a story about the call that helped someone come home.',
  nostalgia_G04: 'Abang Kamal’s Walkman brings the exhibition a story about carrying a family greeting across the pekan.',
  nostalgia_T01: 'Uncle Lim’s championship car brings the exhibition a story about practice, setbacks and good rivals.',
  nostalgia_I01: 'Nenek’s tower model brings the exhibition a story about a family trip they still hope to take.'
};
// Completed memories for the exhibition, rather than the quest's original
// instructions. The player's chosen dedication is displayed alongside them.
export const EXHIBITION_STORIES = {
  nostalgia_M01: 'Faiz kept his schoolyard rhymes in a notebook, but the other half belonged to a friend he had lost touch with. A library slip, an old classroom note and Pak Karim’s bus memories led back to their promise at the warung. At the balai raya, the unfinished verse finally had somewhere to belong. Finishing the races taught us to keep trying through setbacks. Faiz passed on his spare Plan B album as a reminder of the courage it took to share his own words.',
  nostalgia_P02: 'This Ujang once travelled between school bags. Uncle Lim remembered a pupil saving recess money; Mei Ling and Faiz remembered who borrowed it next. The library’s return slip brought its little journey back to Nenek’s veranda. Nobody remembered every joke, but everyone remembered laughing together on a difficult school day. After patient games of congkak, Cikgu Farid passed the comic on with a promise: borrowed laughter is worth returning. Its lending journey now has a place in our exhibition.',
  nostalgia_G01: 'The old Nokia had a contact saved simply as Home. Pak Abu’s address book, Pak Rahman’s grocery ledger and a workshop repair slip traced the family’s route through town. Pak Karim remembered the call that brought a relative home. Kak Lina kept the private family messages safe. The hard-won Dam Haji matches became a lesson in waiting, thinking and not rushing the next move. She passed on the phone as a keepsake of a homecoming, a small object with a whole family behind it.',
  nostalgia_G04: 'Abang Kamal’s unlabelled cassette carried voices from a family gathering. Pak Karim remembered the journey, Kak Ita the kuih, and Pak Salleh the recording at the balai raya. Pak Mat and Nenek helped recognise the laughter. The tape stayed with the family. After the steady practice it took to beat Atuk at gasing, Abang Kamal gave his spare Walkman as thanks. At our exhibition, its story recalls how a familiar voice could make a long journey feel closer to home.',
  nostalgia_T01: 'Lightning Magnum waited behind Uncle Lim’s window while two friends kept trying to build a better racer. Faiz’s failed setup, Pak Man’s explanation, Pak Din’s battery advice and Mei Ling’s lap notes became our route to the championship. Cikgu Farid made room for the event poster. Six victories across all three tracks finally earned the kit. The exhibition remembers the losses and useful advice as much as the finish lines. The car stays ready for another race, carrying the dedication chosen for practice or for our rivals.',
  nostalgia_I01: 'Nenek’s envelope held a Kuala Lumpur trip the family never took. Pak Abu found the postcard, Pak Karim remembered the unused seats, and Kak Ita remembered preparing the picnic. Uncle Lim’s little tower and Cikgu Farid’s photograph helped build a display at the balai raya. Victories at all four town games marked the work it took to bring everyone’s pieces together. The KLCC model became a keepsake of that shared afternoon. Beside the old photograph, we left a space for a journey still ahead.'
};
const RANK = { grind: 1, trail: 2, challenge: 3, ready: 4, earned: 5 };
// Follow the most advanced story. Any of the six can carry the chapter;
// accepting another does not discard the progress already made.
export function chapterKeepsake(eco) {
  return Object.keys(NOSTALGIA_QUESTS).filter(id => eco.nostalgia?.quests[id])
    .sort((a,b) => (RANK[eco.nostalgia.quests[b].stage] || 0) - (RANK[eco.nostalgia.quests[a].stage] || 0))[0] || null;
}
export function cleanExhibition(value, eco) {
  if (!value || !Object.hasOwn(NOSTALGIA_QUESTS, value.id) || !eco.nostalgia?.earned[value.id] || !eco.collection[value.id]
    || !Number.isInteger(value.day) || value.day < eco.nostalgia.earned[value.id].day || value.day > 99999) return null;
  return { id: value.id, day: value.day };
}
// Six was the old ending. Old saves resume at the invitation, with all
// their work intact. Existing keepsakes count after hearing Pak Salleh.
export function syncChapter(step, eco, exhibition = null) {
  if (step < 7) return step;
  if (cleanExhibition(exhibition, eco)) return DONE;
  const id = chapterKeepsake(eco);
  return id ? 7 + (RANK[eco.nostalgia.quests[id].stage] || 0) : 7;
}
export function shareKeepsake(eco, step, id, day) {
  const exhibition = cleanExhibition({ id, day }, eco);
  if (step < 7 || step >= DONE || syncChapter(step, eco) !== 12 || !exhibition) return { ok: false };
  return { ok: true, exhibition, story: DONE };
}
export function chapterGuide(step, eco, exhibition = null) {
  const current = syncChapter(step, eco, exhibition), base = STEPS[current];
  const questId = current >= 7 ? chapterKeepsake(eco) : null;
  const q = NOSTALGIA_QUESTS[questId], p = eco.nostalgia?.quests[questId];
  const phase = current < 6 ? 'KENAL PEKAN' : current < 9 ? 'BINA KEPERCAYAAN' : 'PAMERAN KENANGAN';
  let target = base.target, text = base.text;
  if (target === 'memory') {
    if (!q) target = null;
    else if (p.stage === 'grind') {
      const job = eco.jobs[0];
      target = job ? { place: job.status === 'accepted' ? job.from : job.stops[job.stops.length-job.left], job: true } : 'rahman';
    } else if (p.stage === 'trail') target = { place: q.trail[p.trail].place };
    else if (p.stage === 'challenge') {
      const c = q.challenges.find((c,i) => (p.wins[i] || 0) < c.count || c.tracks?.some(t => !p.tracks.includes(t)));
      target = { congkak: 'nenek', dam: 'din', gasing: 'atuk', tamiya: 'faiz' }[c?.game] || q.npc || { place: q.place };
    } else target = q.npc || { place: q.place };
    if (q) text += ` ${NOSTALGIA_ITEMS[questId].title} · ${nostalgiaStatus(eco,questId).text}`;
  }
  const shown = current === DONE ? exhibition?.id : questId;
  if (current === DONE && shown) text = `${NOSTALGIA_ITEMS[shown].title} · Shared at the balai raya on game day ${exhibition.day}. Your keepsake stays in your collection. Continue the remaining stories at your own pace.`;
  return { step: current, title: base.title, text, target, phase, questId, connection: shown ? EXHIBITION_LINKS[shown] : 'Every keepsake story contributes to the school-holiday exhibition. Earn and share one to complete Chapter 1; the other stories remain open.' };
}
// The chapter's own jobs, offered at the right counter while the step lasts.
export function storyOffers(step, eco) {
  const has = tag => eco.jobs.some(j => j.story === tag);
  const out = [];
  if (step === 1 && !has('first-parcel')) out.push({ id: 'S-first-parcel', story: 'first-parcel', kind: 'parcel', requester: 22, from: 22, to: 2, stops: [2], item: 'gula', qty: 2, cost: 0, upah: 100, route: 45, note: 'Nenek’s monthly order, already paid for. Two bags of gula. Upah is for the walk.' });
  if (step === 3 && !has('tea')) out.push({ id: 'S-tea', story: 'tea', kind: 'purchase', requester: 2, from: 22, to: 2, stops: [2], item: 'teh', qty: 1, cost: 70, upah: 100, route: 45, note: 'Nenek’s tea tin is empty. Buy one packet at Pak Rahman’s; Nenek repays the RM 0.70 and your upah.' });
  return out;
}
// The event a delivered story job reports.
export const STORY_EVENTS = { 'first-parcel': 'delivered-first-parcel', tea: 'delivered-tea' };

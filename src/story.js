// Chapter 1 for both playable characters, Amir and Nur: the first afternoon
// of the school holidays in Pekan Seri Kenangan. Pure: the game reports
// events, `advance` moves the chapter on, `storyOffers` adds the chapter's
// own jobs to the right counters.
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
  { title: 'Simpan sikit-sikit', text: 'Spend a little of your upah at Uncle Lim’s: buy your first collectible.', target: 'lim', on: 'bought-collectible' },
  { title: 'Petang di pekan', text: 'Chapter complete. Take delivery work around town, save for something special and visit your friends.', target: null, on: null }
];
export const DONE = STEPS.length - 1;
// Friendship milestones the chapter awards (+8 each) as steps complete.
export const MILESTONES = { 'met-friends': ['faiz', 'meiling'], 'delivered-first-parcel': ['rahman'], 'played-congkak-nenek': ['nenek'], 'bought-collectible': ['lim'] };

export function advance(step, event) {
  if (step >= DONE || STEPS[step].on !== event) return step;
  return step + 1;
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

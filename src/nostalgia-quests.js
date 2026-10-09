import { STEPS, DONE, STORY_REVISION, CHAPTER_IDS, REWARD_STORIES, hasChapterFlag, meets } from './chapter-data.js?v=2.15.0';
// Long-term collectible quests. Progress only starts after accepting a story;
// qualifying victories count from acceptance, without skipping the story trail.
import { SET_TWO_QUESTS, SET_TWO_IDS } from './nostalgia-set-two.js?v=2.15.0';
export const LONG_ROUTE = 60;
const stop = (place, clue) => ({ place, clue });
export const NOSTALGIA_QUESTS = {
  nostalgia_M01: { giver: 'Faiz', npc: 'faiz', place: 34, title: 'The Verse Nobody Heard', later: true, intro: "Aku ada buku rima lama, tapi tak pernah berani baca depan orang. Help me trace the friend who wrote the other half. Eight varied errands and one race will earn a special memory.", grind: { deliveries: 8, destinations: 5, long: 3 }, trail: [
    stop(33, 'Cik Azura recognises the handwriting. The rhyme partner used to borrow comics after school. Try the school office.'),
    stop(29, 'An old classroom note points to a boy who always waited at the bus stop. His rhyme ends with a journey home.'),
    stop(35, "Pak Karim remembers the two practising lines on the last bus. Their rehearsal plan is with Pak Salleh at the balai raya."),
    stop(32, "Pak Salleh has room for a rehearsal. Win one Tamiya race, then meet Faiz again. A qualifying win since accepting this story already counts.")
  ], challenges: [{ game: 'tamiya', count: 1, label: 'Win a Tamiya race' }], choices: [{ label: 'A private rehearsal', memory: 'Given by Faiz after our quiet first rehearsal.' }, { label: 'The community stage', memory: 'Given by Faiz after he finally faced the community stage.' }] },
  nostalgia_P02: { giver: 'Cikgu Farid', npc: 'farid', place: 29, title: 'Superhero of the School Bag', later: false, intro: "This Ujang travelled through half a classroom. Help with three errands, trace its lending journey and win one congkak match with Nenek.", grind: { deliveries: 3, destinations: 3, long: 1 }, trail: [
    stop(25, "Uncle Lim remembers a pupil saving recess money. The library kept the comic lending list."),
    stop(33, 'Cik Azura found the old return slip. Its last borrower took it to Nenek\'s veranda.'),
    stop(2, "Nenek remembers laughter and a patient reader. Win one congkak match here, then return to Cikgu Farid. A win since accepting this story already counts.")
  ], challenges: [{ game: 'congkak', count: 1, label: 'Beat Nenek at congkak' }], choices: [{ label: 'Read it together', memory: 'Borrowed laughter, finally returned to the school-day circle.' }, { label: 'Keep a lending note', memory: 'A comic-swap keepsake with a promise to return what I borrow.' }] },
  nostalgia_G01: { giver: 'Kak Lina', npc: null, place: 12, title: 'A Name Saved as Home', later: true, intro: "This old Nokia has a contact called Home. Help with six errands and follow its owner’s old route. One Jaguh Dam Haji win will show your patience.", grind: { deliveries: 6, destinations: 4, long: 2 }, trail: [
    stop(13, "Pak Abu remembers the family address. The workshop kept a repair slip from the journey home."),
    stop(36, 'Pak Man finds a repair slip with a bus journey written on its back.'),
    stop(35, "Pak Karim remembers the call that brought a relative home. Beat Pak Din at Jaguh once, then return to Kak Lina. A qualifying win since accepting this story already counts.")
  ], challenges: [{ game: 'dam', level: 'jaguh', count: 1, label: 'Beat Pak Din at Jaguh Dam Haji' }], choices: [{ label: 'Keep the welcome note', memory: 'Passed down by Kak Lina, with a new welcome message.' }, { label: 'Remember the homecoming', memory: 'An old phone that helped somebody find their way home.' }] },
  nostalgia_G04: { giver: 'Abang Kamal', npc: null, place: 6, title: 'The Tape with No Label', later: true, intro: "There is a family greeting on this cassette. Help with six errands and find the voices, then earn my spare Walkman with one gasing win against Atuk.", grind: { deliveries: 6, destinations: 4, long: 2 }, trail: [
    stop(35, "Pak Karim recognises the greeting from a trip home. The family recorded it at the balai raya."),
    stop(32, "Pak Salleh remembers the family recording. Nenek will recognise the voices."),
    stop(2, "Nenek can name the voices. The tape stays with the family. Beat Atuk at gasing once, then return to Abang Kamal. A qualifying win since accepting this story already counts.")
  ], challenges: [{ game: 'gasing', opponent: 'atuk', count: 1, label: 'Beat Atuk at gasing' }], choices: [{ label: 'Remember the greeting', memory: 'Some voices are worth keeping. A thank-you from Abang Kamal.' }, { label: 'Remember the journey', memory: 'The player that carried a family greeting across the pekan.' }] },
  nostalgia_T01: { giver: 'Uncle Lim', npc: 'lim', place: 25, title: 'The Car Behind the Window', later: true, intro: "Lightning Magnum is the playable championship keepsake. Help the racers through twelve varied errands, follow their setup advice and earn first place on every track.", grind: { deliveries: 12, destinations: 6, long: 4 }, trail: [
    stop(15, 'Faiz writes down his failed setup. The parts came from the workshop.'),
    stop(36, 'Pak Man explains why the setup was unstable. Pak Din checked its batteries.'),
    stop(37, 'Pak Din remembers a fresh battery and a rushed launch. Mei Ling kept the lap notes.'),
    stop(14, 'Mei Ling\'s notes favour careful setup over raw speed. The school has room for the event poster.'),
    stop(29, "Cikgu Farid approves the poster. Win once on each of the three tracks, then return to Uncle Lim. Qualifying wins since accepting this story already count.")
  ], challenges: [{ game: 'tamiya', count: 3, tracks: ['oval', 'eight', 'jaguh'], label: 'Win once on Oval, Selekoh Lapan and Jaguh' }], choices: [{ label: 'Dedicate it to practice', memory: 'The car I earned through practice, with every track to prove it.' }, { label: 'Dedicate it to my rivals', memory: 'For Faiz and Mei Ling: the rivals who made me a better racer.' }] },
  nostalgia_I01: { giver: 'Nenek', npc: 'nenek', place: 2, title: 'The Trip We Never Took', later: false, intro: "Our old KL trip plan is still in this envelope. Help with four errands, find three pieces of its story and win one congkak match with me. We can make a little memory together.", grind: { deliveries: 4, destinations: 3, long: 1 }, trail: [
    stop(13, "Pak Abu finds the family postcard. Uncle Lim kept a little tower model from the old trip plan."),
    stop(25, "Uncle Lim has the tower model and an old photograph for the display. Pak Salleh can bring them together at the balai raya."),
    stop(32, "The display leaves a space for a future photograph. Win one congkak match, then return to Nenek. A win since accepting this story already counts.")
  ], challenges: [{ game: 'congkak', count: 1, label: 'Beat Nenek at congkak' }], choices: [{ label: 'A journey still ahead', memory: 'For the journey we still hope to take, from Nenek.' }, { label: 'A memory shared at home', memory: 'A little tower from the night we shared our family\'s story.' }] },
  ...SET_TWO_QUESTS
};
for (const id of CHAPTER_IDS) {
  const r=REWARD_STORIES[id];
  NOSTALGIA_QUESTS[id]={chapter:true,giver:r.giver,title:r.title,intro:r.story,place:32,npc:'salleh',grind:{deliveries:0,destinations:0,long:0},trail:[],challenges:[],choices:[{label:'Kenangan Chapter 1',memory:r.memory},{label:'Dedikasi lama',memory:r.memory}]};
}
for(const id of ['nostalgia_I01','nostalgia_I03','nostalgia_I05'])if(NOSTALGIA_QUESTS[id])NOSTALGIA_QUESTS[id].deferred=true;
const validPlace = n => Number.isInteger(n) && n >= 1 && n <= 38;
const count = n => Number.isInteger(n) && n >= 0 && n <= 1e6 ? n : 0;
const matches = (q, context) => q.npc ? context?.npc === q.npc : context?.place === q.place && !context?.npc;
// Indices retained from v2.7.0's longer trails. Old saves keep every discovered
// clue that survives the shorter route; new saves store the pacing revision.
const LEGACY_TRAIL_INDICES = {
  nostalgia_M01: [0, 1, 2, 4], nostalgia_P02: [0, 3, 4],
  nostalgia_G01: [0, 3, 4], nostalgia_G04: [0, 2, 4],
  nostalgia_T01: [0, 1, 2, 3, 4], nostalgia_I01: [0, 3, 5]
};
const fresh = () => ({ pacing: 2, stage: 'grind', deliveries: 0, destinations: [], long: 0, trail: 0, wins: {}, tracks: [] });
export const newNostalgia = () => ({ quests: {}, earned: {} });
function grindDone(q,p) { return p.deliveries >= q.grind.deliveries && p.destinations.length >= q.grind.destinations && p.long >= q.grind.long; }
function winsDone(q,p) { return q.challenges.every((c,i) => (p.wins[i] || 0) >= c.count && (!c.tracks || c.tracks.every(t => p.tracks.includes(t)))); }
function update(q,p) {
  if(p.stage === 'grind' && grindDone(q,p)) p.stage = 'trail';
  if(p.stage === 'challenge' && winsDone(q,p)) p.stage = 'ready';
}
export function cleanNostalgia(v) {
  const out = newNostalgia();
  if(!v || typeof v !== 'object') return out;
  for(const [id,q] of Object.entries(NOSTALGIA_QUESTS)) {
    const raw = v.quests?.[id];
    if(!raw || typeof raw !== 'object') continue;
    const p=fresh();p.deliveries=Math.min(count(raw.deliveries),q.grind.deliveries);p.long=Math.min(count(raw.long),p.deliveries);
    p.destinations=Array.isArray(raw.destinations)?[...new Set(raw.destinations.filter(validPlace))].slice(0,38):[];
    q.challenges.forEach((c,i)=>{const n=Math.min(count(raw.wins?.[i]),c.count);if(n)p.wins[i]=n;});
    p.tracks=Array.isArray(raw.tracks)?[...new Set(raw.tracks.filter(t=>['oval','eight','jaguh'].includes(t)))]:[];
    if(grindDone(q,p)) {
      p.stage='trail';p.trail=raw.pacing===2?Math.min(count(raw.trail),q.trail.length):(LEGACY_TRAIL_INDICES[id]||[]).filter(i=>i<count(raw.trail)).length;
      if(p.trail===q.trail.length){p.stage='challenge';update(q,p);}
    }
    if(q.set===2) {
      p.startedDay=count(raw.startedDay)||1;
      p.clueDays=Array.from({length:p.trail},(_,i)=>Math.max(p.startedDay,count(raw.clueDays?.[i])||p.startedDay));
      p.completedJobs=q.trail.map(s=>s.delivery?.story).filter(tag=>tag&&Array.isArray(raw.completedJobs)&&raw.completedJobs.includes(tag));
    }
    out.quests[id]=p;
    const e=v.earned?.[id];
    if(p.stage==='ready'&&e&&Number.isInteger(e.choice)&&q.choices[e.choice]&&Number.isInteger(e.day)&&e.day>0&&e.day<=1e6&&typeof e.player==='string'&&e.player.trim()) {
      p.stage='earned';out.earned[id]={choice:e.choice,day:e.day,player:e.player.trim().slice(0,20),giver:q.giver,inscription:q.chapter&&typeof e.inscription==='string'?e.inscription.slice(0,400):q.choices[e.choice].memory,...(q.chapter?{chapter:STORY_REVISION}:{})};
    }
  }
  return out;
}
export function canStartNostalgia(eco,id,context={}) {
  const q=NOSTALGIA_QUESTS[id];
  const earned=eco.nostalgia.earned;
  return !!q && !q.chapter && !['nostalgia_I01','nostalgia_I03','nostalgia_I05'].includes(id) && (context.chapter===undefined || context.chapter>=DONE) && (!q.afterChapter || context.chapter>=q.afterChapter) && (!q.later || Object.keys(earned).length>0)
    && (!q.requires || q.requires.every(id=>earned[id])) && (!q.newKeepsakes || SET_TWO_IDS.filter(id=>earned[id]).length>=q.newKeepsakes);
}
export function startNostalgia(eco,id,context) {
  const q=NOSTALGIA_QUESTS[id];
  if(!q||!matches(q,context))return {ok:false,reason:'not-here'};
  if(eco.nostalgia.quests[id])return {ok:false,reason:'started'};
  if(!canStartNostalgia(eco,id,context))return {ok:false,reason:'locked'};
  const p=fresh();if(q.set===2)Object.assign(p,{startedDay:count(context.day)||1,clueDays:[],completedJobs:[]});
  update(q,p);eco.nostalgia.quests[id]=p;return {ok:true};
}
export function recordNostalgiaDelivery(eco,job) {
  for(const [id,p] of Object.entries(eco.nostalgia.quests)) {
    const q=NOSTALGIA_QUESTS[id];if(!q)continue;
    const step=p.stage==='trail'?q.trail[p.trail]:null;
    if(step?.delivery&&job.story===step.delivery.story&&job.from===step.delivery.from&&job.item===step.delivery.item&&JSON.stringify(job.stops)===JSON.stringify(step.delivery.stops)&&!p.completedJobs.includes(job.story)) {
      p.completedJobs.push(job.story);p.clueDays.push(p.startedDay);p.trail++;
      if(p.trail===q.trail.length){p.stage='challenge';update(q,p);}
    }
    if(p.stage!=='grind')continue;
    p.deliveries=Math.min(p.deliveries+1,q.grind.deliveries);
    for(const place of job.stops)if(!p.destinations.includes(place))p.destinations.push(place);
    if(job.route>=LONG_ROUTE)p.long=Math.min(p.long+1,q.grind.long);
    update(q,p);
  }
}
export function clueRequirement(eco,id,clock={}) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id],step=p?.stage==='trail'?q?.trail[p.trail]:null;
  if(!step)return {ok:false,reason:'not-trail'};
  if(step.delivery&&!p.completedJobs.includes(step.delivery.story))return {ok:false,reason:'delivery',text:step.delivery.note,offer:step.delivery};
  if(step.waitDays){const day=(p.clueDays[p.trail-1]||p.startedDay)+step.waitDays;if((clock.day||0)<day)return {ok:false,reason:'day',day,text:`Datang semula pada hari game ${day} atau selepasnya. Tidur di rumah selepas Maghrib untuk ke hari berikutnya.`};}
  if(step.afterMinute&&(clock.minute===undefined||clock.minute<step.afterMinute))return {ok:false,reason:'time',text:'Datang ke balai raya selepas 19:00 pada mana-mana hari. Persediaan kamu kekal disimpan.'};
  return {ok:true};
}
export function nostalgiaOffers(eco,gap=()=>0) {
  return Object.entries(NOSTALGIA_QUESTS).flatMap(([id,q])=>{const p=eco.nostalgia.quests[id],d=p?.stage==='trail'?q.trail[p.trail]?.delivery:null;
    if(!d||p.completedJobs.includes(d.story)||eco.jobs.some(j=>j.story===d.story))return [];
    return [{...d,stops:[...d.stops],route:Math.round(d.stops.reduce((n,to,i)=>n+gap(i?d.stops[i-1]:d.from,to),0))}];
  });
}
export function followNostalgiaClue(eco,id,place,clock={}) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];
  if(!q||p?.stage!=='trail'||q.trail[p.trail]?.place!==place)return {ok:false};
  const requirement=clueRequirement(eco,id,clock);if(!requirement.ok)return requirement;
  if(q.set===2)p.clueDays.push(Math.max(p.startedDay,count(clock.day)||p.startedDay));
  const clue=q.trail[p.trail++].clue;if(p.trail===q.trail.length){p.stage='challenge';update(q,p);}return {ok:true,clue};
}
export function recordNostalgiaWin(eco,event) {
  if(!eco.nostalgia)return;
  for(const [id,p] of Object.entries(eco.nostalgia.quests)) {
    const q=NOSTALGIA_QUESTS[id];if(!q||!['grind','trail','challenge'].includes(p.stage))continue;
    q.challenges.forEach((c,i)=>{if(c.game!==event.game||c.level&&c.level!==event.level||c.opponent&&c.opponent!==event.opponent||c.tracks&&!c.tracks.includes(event.track))return;p.wins[i]=Math.min((p.wins[i]||0)+1,c.count);if(c.tracks&&!p.tracks.includes(event.track))p.tracks.push(event.track);});
    update(q,p);
  }
}
export function claimNostalgia(eco,id,context,choice,player,day) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];
  if(!q||q.deferred||!matches(q,context)||p?.stage!=='ready'||!q.choices[choice]||!Number.isInteger(choice)||typeof player!=='string'||!player.trim()||!Number.isInteger(day)||day<1||day>1e6)return {ok:false};
  p.stage='earned';const entry={giver:q.giver,choice,player:player.trim().slice(0,20),day,inscription:q.choices[choice].memory};eco.nostalgia.earned[id]=entry;eco.collection[id]=1;return {ok:true,entry};
}
export function nostalgiaStatus(eco,id) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];
  if(!q)return {stage:'future',text:'A story for a future town chapter.'};
  if(!p)return {stage:'locked',text:`Start with ${q.giver}.`};
  if(p.stage==='grind')return {stage:p.stage,text:`Deliveries ${p.deliveries}/${q.grind.deliveries} · Destinations ${p.destinations.length}/${q.grind.destinations} · Long routes (60 m+) ${p.long}/${q.grind.long}`};
  if(p.stage==='trail')return {stage:p.stage,text:`Story trail ${p.trail}/${q.trail.length} · Next clue at place #${q.trail[p.trail].place}`,place:q.trail[p.trail].place};
  if(p.stage==='challenge')return {stage:p.stage,text:q.challenges.map((c,i)=>`${c.label}: ${p.wins[i]||0}/${c.count}${c.tracks?` · Tracks ${c.tracks.filter(t=>p.tracks.includes(t)).length}/${c.tracks.length}`:''}`).join(' / ')};
  if(p.stage==='ready')return {stage:p.stage,text:`Challenge complete. Return to ${q.giver} for your keepsake.`};
  return {stage:'earned',text:`Given by ${q.giver} · Game day ${eco.nostalgia.earned[id].day}`};
}
// A resident's door a story in progress needs right now (its next clue, or
// a keepsake ready to collect): that resident stays home instead of
// running errands (errands.js), so the gold marker always finds them.
export function storyNeedsHome(eco,place) {
  if(eco.chapter&&STEPS.some(s=>s.lines&&s.place===place&&!hasChapterFlag(eco,s.id)&&meets(eco,s.requires)))return true;
  return Object.entries(NOSTALGIA_QUESTS).some(([id,q])=>{const p=eco.nostalgia.quests[id];return !q.npc&&q.place===place&&p?.stage==='ready'||p?.stage==='trail'&&q.trail[p.trail]?.place===place;});
}
export function nostalgiaAt(eco,context) {
  return Object.entries(NOSTALGIA_QUESTS).filter(([id,q])=>!q.chapter&&!q.deferred&&(matches(q,context)&&(eco.nostalgia.quests[id]||canStartNostalgia(eco,id,context))||eco.nostalgia.quests[id]?.stage==='trail'&&q.trail[eco.nostalgia.quests[id].trail].place===context.place)).map(([id])=>id);
}

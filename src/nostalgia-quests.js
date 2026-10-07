// Long-term collectible quests. Progress only starts after accepting a story;
// victories only count after its ordered trail. Existing rounds settle once.
export const LONG_ROUTE = 60;
const stop = (place, clue) => ({ place, clue });
export const NOSTALGIA_QUESTS = {
  nostalgia_M01: { giver: 'Faiz', npc: 'faiz', place: 34, title: 'The Verse Nobody Heard', intro: 'Aku ada buku rima lama, tapi tak pernah berani baca depan orang. Help me trace the friend who wrote the other half. Show me you can finish a long journey first.', grind: { deliveries: 12, destinations: 6, long: 4 }, trail: [
    stop(33, 'Cik Azura recognises the handwriting. The rhyme partner used to borrow comics after school. Try the school office.'),
    stop(29, 'An old classroom note points to a boy who always waited at the bus stop. His rhyme ends with a journey home.'),
    stop(35, 'Pak Karim remembers the two practising lines on the last bus. Their favourite audience was at the warung.'),
    stop(21, 'Kak Ita remembers their stage fright. They promised to practise at the balai raya one day.'),
    stop(32, 'Pak Salleh has room for a rehearsal. Faiz needs a friend who can finish a challenge even after losing. Win four Tamiya races, then meet him again.')
  ], challenges: [{ game: 'tamiya', count: 4, label: 'Win 4 Tamiya races' }], choices: [{ label: 'A private rehearsal', memory: 'Given by Faiz after our quiet first rehearsal.' }, { label: 'The community stage', memory: 'Given by Faiz after he finally faced the community stage.' }] },
  nostalgia_P02: { giver: 'Cikgu Farid', npc: 'farid', place: 29, title: 'Superhero of the School Bag', intro: 'This Ujang travelled through half a classroom. Rebuild its little lending journey. Reliable helpers finish their errands, even the ones across town.', grind: { deliveries: 10, destinations: 5, long: 3 }, trail: [
    stop(25, 'Uncle Lim remembers selling this issue to someone who saved their recess money. The next borrower lived at Mei Ling\'s house.'),
    stop(14, 'Mei Ling remembers a friend borrowing it on a difficult school day. Faiz kept the lending list.'),
    stop(15, 'A lending list names the library next. Nobody wanted the jokes to disappear in a school bag.'),
    stop(33, 'Cik Azura found the old return slip. Its last borrower took it to Nenek\'s veranda.'),
    stop(2, 'Nenek remembers laughter and a patient reader. Win three congkak matches here, then return to Cikgu Farid for the comic swap.')
  ], challenges: [{ game: 'congkak', count: 3, label: 'Beat Nenek at congkak 3 times' }], choices: [{ label: 'Read it together', memory: 'Borrowed laughter, finally returned to the school-day circle.' }, { label: 'Keep a lending note', memory: 'A comic-swap keepsake with a promise to return what I borrow.' }] },
  nostalgia_G01: { giver: 'Kak Lina', npc: null, place: 12, title: 'A Name Saved as Home', intro: 'This old Nokia has a contact called Home. We will keep the family messages safe. Earn my trust on longer errands, then help follow its owner\'s old route.', grind: { deliveries: 18, destinations: 8, long: 6 }, trail: [
    stop(13, 'Pak Abu remembers the family\'s old address. They collected groceries at Runcit 99 every Friday.'),
    stop(22, 'Pak Rahman recognises a nickname on the grocery ledger. Someone at the petrol kiosk knew the family too.'),
    stop(37, 'Pak Din remembers lending the owner his phone during a breakdown. The workshop kept the repair note.'),
    stop(36, 'Pak Man finds a repair slip with a bus journey written on its back.'),
    stop(35, 'Pak Karim remembers the call that brought a relative home. Kak Lina asks for patience and careful thinking: beat Pak Din at Jaguh three times before returning.')
  ], challenges: [{ game: 'dam', level: 'jaguh', count: 3, label: 'Beat Pak Din at Jaguh Dam Haji 3 times' }], choices: [{ label: 'Keep the welcome note', memory: 'Passed down by Kak Lina, with a new welcome message.' }, { label: 'Remember the homecoming', memory: 'An old phone that helped somebody find their way home.' }] },
  nostalgia_G04: { giver: 'Abang Kamal', npc: null, place: 6, title: 'The Tape with No Label', intro: 'There is a family greeting on this cassette. Help me find the voices, then you can keep my spare Walkman. Take the long errands first; the clues go right across the pekan.', grind: { deliveries: 16, destinations: 7, long: 5 }, trail: [
    stop(35, 'Pak Karim recognises the greeting from a trip home. The speakers brought kuih from Kak Ita.'),
    stop(21, 'Kak Ita recalls a gathering at the balai raya. Someone there helped make the recording.'),
    stop(32, 'Pak Salleh remembers an older voice talking about the garden. Ask at the wakaf kebun.'),
    stop(9, 'Pak Mat recognises the laughter. The youngest speaker used to visit Nenek after school.'),
    stop(2, 'Nenek can name the voices. The tape stays with the family. Show Atuk your steady hands: beat him at gasing three times, then return to Abang Kamal.')
  ], challenges: [{ game: 'gasing', opponent: 'atuk', count: 3, label: 'Beat Atuk at gasing 3 times' }], choices: [{ label: 'Remember the greeting', memory: 'Some voices are worth keeping. A thank-you from Abang Kamal.' }, { label: 'Remember the journey', memory: 'The player that carried a family greeting across the pekan.' }] },
  nostalgia_T01: { giver: 'Uncle Lim', npc: 'lim', place: 25, title: 'The Car Behind the Window', intro: 'Lightning Magnum is the championship keepsake. No price tag can replace the race. Finish the long delivery path, help the racers and earn first place on every track.', grind: { deliveries: 20, destinations: 10, long: 6 }, trail: [
    stop(15, 'Faiz writes down his failed setup. The parts came from the workshop.'),
    stop(36, 'Pak Man explains why the setup was unstable. Pak Din checked its batteries.'),
    stop(37, 'Pak Din remembers a fresh battery and a rushed launch. Mei Ling kept the lap notes.'),
    stop(14, 'Mei Ling\'s notes favour careful setup over raw speed. The school has room for the event poster.'),
    stop(29, 'Cikgu Farid approves the poster. Return to the padang: win six races, including all three tracks. Uncle Lim will award the kit.')
  ], challenges: [{ game: 'tamiya', count: 6, tracks: ['oval', 'eight', 'jaguh'], label: 'Win 6 races, including Oval, Selekoh Lapan and Jaguh' }], choices: [{ label: 'Dedicate it to practice', memory: 'The car I earned through practice, with every track to prove it.' }, { label: 'Dedicate it to my rivals', memory: 'For Faiz and Mei Ling: the rivals who made me a better racer.' }] },
  nostalgia_I01: { giver: 'Nenek', npc: 'nenek', place: 2, title: 'The Trip We Never Took', intro: 'Our old KL trip plan is still in this envelope. Help turn it into a promise we can remember. This is the longest keepsake path: finish errands across town and prove yourself at all four games.', grind: { deliveries: 24, destinations: 10, long: 8 }, trail: [
    stop(13, 'Pak Abu finds a postcard with the family\'s old travel plan. The bus driver knew the route.'),
    stop(35, 'Pak Karim remembers the seats they never used. A picnic order was left at the warung.'),
    stop(21, 'Kak Ita remembers preparing the food. The family planned to collect a little model at the end.'),
    stop(25, 'Uncle Lim has a tower model for the display. Ask the teacher about the old class trip photographs.'),
    stop(29, 'Cikgu Farid lends a photograph with permission. Pak Salleh can host the family display.'),
    stop(32, 'The display leaves a space for a future photograph. Win twice at congkak, Jaguh dam, Atuk\'s gasing and Tamiya, then return to Nenek.')
  ], challenges: [{ game: 'congkak', count: 2, label: 'Win 2 congkak matches' }, { game: 'dam', level: 'jaguh', count: 2, label: 'Win 2 Jaguh Dam Haji matches' }, { game: 'gasing', opponent: 'atuk', count: 2, label: 'Beat Atuk at gasing twice' }, { game: 'tamiya', count: 2, label: 'Win 2 Tamiya races' }], choices: [{ label: 'A journey still ahead', memory: 'For the journey we still hope to take, from Nenek.' }, { label: 'A memory shared at home', memory: 'A little tower from the night we shared our family\'s story.' }] }
};
const validPlace = n => Number.isInteger(n) && n >= 1 && n <= 38;
const count = n => Number.isInteger(n) && n >= 0 && n <= 1e6 ? n : 0;
const matches = (q, context) => q.npc ? context?.npc === q.npc : context?.place === q.place && !context?.npc;
const fresh = () => ({ stage: 'grind', deliveries: 0, destinations: [], long: 0, trail: 0, wins: {}, tracks: [] });
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
    if(grindDone(q,p)) {
      p.stage='trail';p.trail=Math.min(count(raw.trail),q.trail.length);
      if(p.trail===q.trail.length){p.stage='challenge';q.challenges.forEach((c,i)=>p.wins[i]=Math.min(count(raw.wins?.[i]),c.count));p.tracks=Array.isArray(raw.tracks)?[...new Set(raw.tracks.filter(t=>['oval','eight','jaguh'].includes(t)))]:[];update(q,p);}
    }
    out.quests[id]=p;
    const e=v.earned?.[id];
    if(p.stage==='ready'&&e&&Number.isInteger(e.choice)&&q.choices[e.choice]&&Number.isInteger(e.day)&&e.day>0&&e.day<=1e6&&typeof e.player==='string'&&e.player.trim()) {
      p.stage='earned';out.earned[id]={choice:e.choice,day:e.day,player:e.player.trim().slice(0,20),giver:q.giver,inscription:q.choices[e.choice].memory};
    }
  }
  return out;
}
export function startNostalgia(eco,id,context) {
  const q=NOSTALGIA_QUESTS[id];
  if(!q||!matches(q,context))return {ok:false,reason:'not-here'};
  if(eco.nostalgia.quests[id])return {ok:false,reason:'started'};
  eco.nostalgia.quests[id]=fresh();return {ok:true};
}
export function recordNostalgiaDelivery(eco,job) {
  for(const [id,p] of Object.entries(eco.nostalgia.quests)) {
    const q=NOSTALGIA_QUESTS[id];if(!q||p.stage!=='grind')continue;
    p.deliveries=Math.min(p.deliveries+1,q.grind.deliveries);
    for(const place of job.stops)if(!p.destinations.includes(place))p.destinations.push(place);
    if(job.route>=LONG_ROUTE)p.long=Math.min(p.long+1,q.grind.long);
    update(q,p);
  }
}
export function followNostalgiaClue(eco,id,place) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];
  if(!q||p?.stage!=='trail'||q.trail[p.trail]?.place!==place)return {ok:false};
  const clue=q.trail[p.trail++].clue;if(p.trail===q.trail.length)p.stage='challenge';return {ok:true,clue};
}
export function recordNostalgiaWin(eco,event) {
  if(!eco.nostalgia)return;
  for(const [id,p] of Object.entries(eco.nostalgia.quests)) {
    const q=NOSTALGIA_QUESTS[id];if(!q||p.stage!=='challenge')continue;
    q.challenges.forEach((c,i)=>{if(c.game!==event.game||c.level&&c.level!==event.level||c.opponent&&c.opponent!==event.opponent)return;p.wins[i]=Math.min((p.wins[i]||0)+1,c.count);if(c.tracks&&c.tracks.includes(event.track)&&!p.tracks.includes(event.track))p.tracks.push(event.track);});
    update(q,p);
  }
}
export function claimNostalgia(eco,id,context,choice,player,day) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];
  if(!q||!matches(q,context)||p?.stage!=='ready'||!q.choices[choice]||!Number.isInteger(choice)||typeof player!=='string'||!player.trim()||!Number.isInteger(day)||day<1||day>1e6)return {ok:false};
  p.stage='earned';const entry={giver:q.giver,choice,player:player.trim().slice(0,20),day,inscription:q.choices[choice].memory};eco.nostalgia.earned[id]=entry;eco.collection[id]=1;return {ok:true,entry};
}
export function nostalgiaStatus(eco,id) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];
  if(!q)return {stage:'future',text:'A story for a future town chapter.'};
  if(!p)return {stage:'locked',text:`Start with ${q.giver}.`};
  if(p.stage==='grind')return {stage:p.stage,text:`Deliveries ${p.deliveries}/${q.grind.deliveries} · Destinations ${p.destinations.length}/${q.grind.destinations} · Long routes (60 m+) ${p.long}/${q.grind.long}`};
  if(p.stage==='trail')return {stage:p.stage,text:`Story trail ${p.trail}/${q.trail.length} · Next clue at place #${q.trail[p.trail].place}`,place:q.trail[p.trail].place};
  if(p.stage==='challenge')return {stage:p.stage,text:q.challenges.map((c,i)=>`${c.label}: ${p.wins[i]||0}/${c.count}${c.tracks?` · Tracks ${p.tracks.length}/3`:''}`).join(' / ')};
  if(p.stage==='ready')return {stage:p.stage,text:`Challenge complete. Return to ${q.giver} for your keepsake.`};
  return {stage:'earned',text:`Given by ${q.giver} · Game day ${eco.nostalgia.earned[id].day}`};
}
export function nostalgiaAt(eco,context) {
  return Object.entries(NOSTALGIA_QUESTS).filter(([id,q])=>matches(q,context)||eco.nostalgia.quests[id]?.stage==='trail'&&q.trail[eco.nostalgia.quests[id].trail].place===context.place).map(([id])=>id);
}

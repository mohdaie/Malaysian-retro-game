import test from 'node:test';
import assert from 'node:assert/strict';
import { newEconomy, cleanEconomy, accept, collect, deliver, cancel } from '../src/economy.js';
import { NOSTALGIA_QUESTS as qs, startNostalgia, canStartNostalgia, nostalgiaAt, nostalgiaOffers, clueRequirement, followNostalgiaClue, recordNostalgiaWin, claimNostalgia, storyNeedsHome } from '../src/nostalgia-quests.js';
import { SET_TWO_IDS } from '../src/nostalgia-set-two.js';
import { memoryTasks, memoryJournal, memoryNext, discoveredMemories } from '../src/journal.js';
import { readSave, writeSave } from '../src/save.js';
import { unlockLater } from './quest-helpers.js';
const context=(id,day=4,chapter=13)=>({place:qs[id].place,npc:qs[id].npc,chapter,day});
const oldEarned=()=>{const e=newEconomy();unlockLater(e,'nostalgia_G01');return e;};
function errand(e,n,route=90,to=n+1){const j=accept(e,{id:'set2-'+n,kind:'parcel',requester:22,from:22,to,stops:[to],item:'gula',qty:1,cost:0,upah:100,route}).job;assert.ok(j);assert.ok(collect(e,j.id,j.from).ok);assert.ok(deliver(e,j.id,to).ok);}
function finish(e,id,clock={day:4,minute:840}){
 const q=qs[id];assert.ok(startNostalgia(e,id,context(id,clock.day)).ok,id);
 for(let n=0;n<q.grind.deliveries;n++)errand(e,n);
 while(e.nostalgia.quests[id].stage==='trail'){
  const p=e.nostalgia.quests[id],step=q.trail[p.trail];
  if(step.delivery){const offer=nostalgiaOffers(e,()=>80).find(o=>o.story===step.delivery.story),j=accept(e,offer).job;assert.ok(collect(e,j.id,j.from).ok);for(const place of j.stops)assert.ok(deliver(e,j.id,place).ok);}
  else {if(step.waitDays)clock.day=(p.clueDays.at(-1)||p.startedDay)+step.waitDays;if(step.afterMinute)clock.minute=step.afterMinute;assert.ok(followNostalgiaClue(e,id,step.place,clock).ok,id);}
 }
 for(const c of q.challenges)for(let i=0;i<c.count;i++)recordNostalgiaWin(e,{game:c.game,level:c.level,opponent:c.opponent,track:c.tracks?.[i%c.tracks.length]});
 assert.equal(e.nostalgia.quests[id].stage,'ready',id);
 assert.ok(Number.isFinite(memoryJournal(e,id).progress));
 assert.equal(memoryTasks(e,id).filter(t=>!t.done).length,1);
 assert.ok(claimNostalgia(e,id,context(id,clock.day),1,'Nur',clock.day).ok,id);
 return clock;
}
test('eight new quests stay hidden until Chapter 1 is complete; prerequisites use actually earned items',()=>{
 const e=oldEarned();assert.equal(SET_TWO_IDS.length,8);assert.deepEqual(discoveredMemories(e),['nostalgia_P02']);
 for(const id of SET_TWO_IDS){assert.equal(canStartNostalgia(e,id,context(id,4,12)),false);assert.equal(nostalgiaAt(e,context(id,4,12)).includes(id),false);assert.equal(startNostalgia(e,id,context(id,4,12)).reason,'locked');}
 for(const id of SET_TWO_IDS.filter(id=>id!=='nostalgia_P05'))assert.equal(canStartNostalgia(e,id,context(id)),true);
 const fresh=newEconomy();assert.equal(canStartNostalgia(fresh,'nostalgia_P04',context('nostalgia_P04')),false);
 fresh.collection.nostalgia_P02=1;assert.equal(canStartNostalgia(fresh,'nostalgia_P04',context('nostalgia_P04')),false);
 assert.equal(canStartNostalgia(e,'nostalgia_P05',context('nostalgia_P05')),false);
 for(const id of ['nostalgia_P01','nostalgia_I05','nostalgia_G03'])finish(e,id);
 assert.equal(canStartNostalgia(e,'nostalgia_P05',context('nostalgia_P05')),true);
});
test('all eight actual earning paths claim once and restore ownership, dedication and separate character saves',()=>{
 for(const id of SET_TWO_IDS){
  let e=oldEarned();if(id==='nostalgia_P05')for(const prior of ['nostalgia_P01','nostalgia_I05','nostalgia_G03'])finish(e,prior);
  const clock=finish(e,id);assert.equal(e.collection[id],1);assert.equal(claimNostalgia(e,id,context(id),0,'Aie',clock.day).ok,false);
  const clean=cleanEconomy(e);assert.deepEqual(clean.nostalgia,e.nostalgia);assert.equal(clean.collection[id],1);assert.equal(clean.nostalgia.earned[id].inscription,qs[id].choices[1].memory);
  assert.ok(memoryTasks(clean,id).every(t=>t.done));
  const slots=new Map(),storage={getItem:k=>slots.get(k)||null,setItem:(k,v)=>slots.set(k,v),removeItem:k=>slots.delete(k)};
  for(const [who,eco] of [['nur',e],['amir',newEconomy()]])assert.ok(writeSave(storage,{version:3,who,name:who,story:13,x:0,z:0,...eco,clock}));
  assert.equal(readSave(storage,'nur').collection[id],1);assert.equal(readSave(storage,'amir').collection[id],undefined);
 }
});
test('malformed new parcel and visit fields do not block restoring a save',()=>{
 const e=oldEarned();startNostalgia(e,'nostalgia_M05',context('nostalgia_M05'));
 for(const value of [17,{},null,'senario-kabel']){
  const raw=structuredClone(e);Object.assign(raw.nostalgia.quests.nostalgia_M05,{completedJobs:value,startedDay:-1,clueDays:value});
  const restored=cleanEconomy(raw).nostalgia.quests.nostalgia_M05;
  assert.deepEqual(restored.completedJobs,[]);assert.deepEqual(restored.clueDays,[]);assert.equal(restored.startedDay,1);
 }
});
test('timed visits survive reload and cannot be completed by clicking twice or using the real date',()=>{
 for(const id of ['nostalgia_G03','nostalgia_I03']){
  let e=oldEarned();const q=qs[id];startNostalgia(e,id,context(id));for(let n=0;n<q.grind.deliveries;n++)errand(e,n);
  for(const s of q.trail.slice(0,-1))assert.ok(followNostalgiaClue(e,id,s.place,{day:7,minute:900}).ok);
  e=cleanEconomy(e);const s=q.trail.at(-1);
  assert.equal(followNostalgiaClue(e,id,s.place,{day:7,minute:1439}).reason,'day');assert.equal(clueRequirement(e,id,{day:7}).day,8);
  assert.match(memoryNext(e,id,n=>'Place '+n,{day:7}).text,/hari game 8.*Tidur/);
  assert.equal(followNostalgiaClue(e,id,s.place).reason,'day');
  assert.ok(followNostalgiaClue(e,id,s.place,{day:8,minute:420}).ok);assert.equal(e.nostalgia.quests[id].stage,'ready');
 }
});
test('Senario parcels require real collection and every handover; cancelled and unrelated jobs do not tick',()=>{
 const id='nostalgia_M05';let e=oldEarned();startNostalgia(e,id,context(id));
 assert.equal(followNostalgiaClue(e,id,36,{day:4,minute:840}).reason,'delivery');
 let offer=nostalgiaOffers(e,()=>70)[0],j=accept(e,offer).job;assert.equal(nostalgiaOffers(e).length,0);assert.ok(cancel(e,j.id).ok);assert.equal(e.nostalgia.quests[id].trail,0);
 errand(e,0);assert.equal(e.nostalgia.quests[id].trail,0);
 j=accept(e,nostalgiaOffers(e,()=>70)[0]).job;assert.ok(collect(e,j.id,36).ok);e=cleanEconomy(e);j=e.jobs[0];assert.equal(j.story,'senario-kabel');
 assert.ok(deliver(e,j.id,32).ok);assert.equal(e.nostalgia.quests[id].trail,1);assert.equal(deliver(e,j.id,32).ok,false);assert.equal(e.nostalgia.quests[id].trail,1);
 j=accept(e,nostalgiaOffers(e)[0]).job;collect(e,j.id,32);deliver(e,j.id,21);
 j=accept(e,nostalgiaOffers(e)[0]).job;collect(e,j.id,32);deliver(e,j.id,4);deliver(e,j.id,11);
 assert.equal(e.nostalgia.quests[id].trail,2);e=cleanEconomy(e);j=e.jobs[0];deliver(e,j.id,18);
 assert.equal(e.nostalgia.quests[id].trail,3);assert.equal(nostalgiaOffers(e).length,0);
 assert.equal(followNostalgiaClue(e,id,32,{day:4,minute:1139}).reason,'time');
 assert.ok(followNostalgiaClue(e,id,32,{day:6,minute:1200}).ok);assert.equal(e.nostalgia.quests[id].stage,'ready');
});
test('single-track and double-Jaguh rewards reject the wrong track or easier games across reloads',()=>{
 let e=oldEarned(),id='nostalgia_G02';startNostalgia(e,id,context(id));
 recordNostalgiaWin(e,{game:'tamiya',track:'oval'});assert.equal(e.nostalgia.quests[id].wins[0]||0,0);
 recordNostalgiaWin(e,{game:'tamiya',track:'eight'});e=cleanEconomy(e);assert.equal(e.nostalgia.quests[id].wins[0],1);assert.equal(e.nostalgia.quests[id].stage,'grind');
 for(const prior of ['nostalgia_P01','nostalgia_I05','nostalgia_G03'])finish(e,prior);
 id='nostalgia_P05';startNostalgia(e,id,context(id));for(const s of qs[id].trail)followNostalgiaClue(e,id,s.place,{day:4});
 recordNostalgiaWin(e,{game:'dam',level:'santai'});recordNostalgiaWin(e,{game:'tamiya',track:'eight'});assert.deepEqual(e.nostalgia.quests[id].wins,{});
 recordNostalgiaWin(e,{game:'dam',level:'jaguh'});e=cleanEconomy(e);assert.equal(e.nostalgia.quests[id].stage,'challenge');recordNostalgiaWin(e,{game:'tamiya',track:'jaguh'});assert.equal(e.nostalgia.quests[id].stage,'ready');
});
test('new journal entries expose only the current clue, no zero targets or future reward spoiler',()=>{
 const e=oldEarned(),id='nostalgia_P01';startNostalgia(e,id,context(id));let tasks=memoryTasks(e,id);
 assert.equal(tasks.length,1);assert.equal(tasks[0].label,'Padankan lakaran sekolah');assert.equal(tasks[0].place,29);assert.equal(memoryJournal(e,id).progress,0);
 assert.equal(tasks.some(t=>t.total===0),false);followNostalgiaClue(e,id,29,{day:4});
 assert.deepEqual(memoryTasks(e,id).map(t=>t.done),[true,false]);assert.equal(memoryTasks(e,id)[1].place,25);
 const w='nostalgia_I03';startNostalgia(e,w,context(w));for(let n=0;n<5;n++)errand(e,n);
 followNostalgiaClue(e,w,37,{day:4});assert.equal(storyNeedsHome(e,17),true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { newEconomy, cleanEconomy, accept, collect, deliver, cancel } from '../src/economy.js';
import { NOSTALGIA_QUESTS as qs, startNostalgia, canStartNostalgia, nostalgiaAt, nostalgiaOffers, clueRequirement, followNostalgiaClue, recordNostalgiaWin, claimNostalgia, storyNeedsHome } from '../src/nostalgia-quests.js';
import { SET_TWO_IDS } from '../src/nostalgia-set-two.js';
import { memoryTasks, memoryJournal, memoryNext, discoveredMemories } from '../src/journal.js';
import { readSave, writeSave } from '../src/save.js';
import { unlockLater } from './quest-helpers.js';
import { DONE } from '../src/story.js';
const ACTIVE_SET_TWO=SET_TWO_IDS.filter(id=>!qs[id].chapter&&!qs[id].deferred);
const context=(id,day=4,chapter=DONE)=>({place:qs[id].place,npc:qs[id].npc,chapter,day});
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
test('remaining side stories require the completed chapter; replacement keepsakes and adult rewards are locked',()=>{
 const e=oldEarned();for(const id of ACTIVE_SET_TWO){assert.equal(canStartNostalgia(e,id,context(id,4,25)),false);assert.equal(canStartNostalgia(e,id,context(id)),true);}
 for(const id of ['nostalgia_G02','nostalgia_G03','nostalgia_P05','nostalgia_I03'])assert.equal(canStartNostalgia(e,id,context(id)),false);
});
test('remaining side paths still claim once and restore ownership and dedication',()=>{
 for(const id of ACTIVE_SET_TWO){let e=oldEarned();const clock=finish(e,id);assert.equal(e.collection[id],1);assert.equal(claimNostalgia(e,id,context(id),0,'Aie',clock.day).ok,false);const clean=cleanEconomy(e);assert.deepEqual(clean.nostalgia,e.nostalgia);assert.equal(clean.collection[id],1);assert.ok(memoryTasks(clean,id).every(t=>t.done));}
});
test('malformed new parcel and visit fields do not block restoring a save',()=>{
 const e=oldEarned();startNostalgia(e,'nostalgia_M05',context('nostalgia_M05'));
 for(const value of [17,{},null,'senario-kabel']){
  const raw=structuredClone(e);Object.assign(raw.nostalgia.quests.nostalgia_M05,{completedJobs:value,startedDay:-1,clueDays:value});
  const restored=cleanEconomy(raw).nostalgia.quests.nostalgia_M05;
  assert.deepEqual(restored.completedJobs,[]);assert.deepEqual(restored.clueDays,[]);assert.equal(restored.startedDay,1);
 }
});
test('previously earned adult collectibles survive while new Chapter 1 claims are deferred',()=>{
 const e=oldEarned(),id='nostalgia_I03',q=qs[id];e.nostalgia.quests[id]={pacing:2,stage:'earned',deliveries:q.grind.deliveries,destinations:[1,2,3],long:2,trail:q.trail.length,wins:{},tracks:[],startedDay:1,clueDays:[1,2,3],completedJobs:[]};e.nostalgia.earned[id]={choice:0,day:3,player:'Nur'};assert.equal(canStartNostalgia(e,id,context(id)),false);assert.equal(cleanEconomy(e).collection[id],1);
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
test('new journal entries expose only the current clue, no zero targets or future reward spoiler',()=>{
 const e=oldEarned(),id='nostalgia_P01';startNostalgia(e,id,context(id));let tasks=memoryTasks(e,id);
 assert.equal(tasks.length,1);assert.equal(tasks[0].label,'Padankan lakaran sekolah');assert.equal(tasks[0].place,29);assert.equal(memoryJournal(e,id).progress,0);
 assert.equal(tasks.some(t=>t.total===0),false);followNostalgiaClue(e,id,29,{day:4});
 assert.deepEqual(memoryTasks(e,id).map(t=>t.done),[true,false]);assert.equal(memoryTasks(e,id)[1].place,25);
 assert.equal(canStartNostalgia(e,'nostalgia_I03',context('nostalgia_I03')),false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { newEconomy, cleanEconomy } from '../src/economy.js';
import { NOSTALGIA_QUESTS as qs, startNostalgia, nostalgiaAt, canStartNostalgia, recordNostalgiaDelivery, recordNostalgiaWin, followNostalgiaClue, claimNostalgia, cleanNostalgia } from '../src/nostalgia-quests.js';
import { unlockLater, ORIGINAL_QUEST_IDS } from './quest-helpers.js';
const context=id=>({place:qs[id].place,npc:qs[id].npc});
const help=(e,id)=>{for(let i=0;i<qs[id].grind.deliveries;i++)recordNostalgiaDelivery(e,{stops:[i+1],route:90});};
test('new players discover only short starters; the first earned keepsake unlocks longer stories',()=>{
 const e=newEconomy();
 for(const [id,q] of ORIGINAL_QUEST_IDS.map(id=>[id,qs[id]])){
  assert.equal(canStartNostalgia(e,id),!q.later);
  assert.equal(nostalgiaAt(e,context(id)).includes(id),!q.later);
  if(q.later)assert.equal(startNostalgia(e,id,context(id)).reason,'locked');
 }
 unlockLater(e,'nostalgia_M01');
 for(const id of ORIGINAL_QUEST_IDS)assert.ok(canStartNostalgia(e,id));
 assert.ok(startNostalgia(e,'nostalgia_M01',context('nostalgia_M01')).ok);
});
test('wins from acceptance survive reloads during errands and clues, without skipping story gates',()=>{
 const id='nostalgia_P02';let e=newEconomy();startNostalgia(e,id,context(id));
 recordNostalgiaWin(e,{game:'congkak'});e=cleanEconomy(e);
 assert.equal(e.nostalgia.quests[id].wins[0],1);assert.equal(e.nostalgia.quests[id].stage,'grind');
 assert.equal(claimNostalgia(e,id,context(id),0,'Aie',1).ok,false);
 help(e,id);assert.equal(e.nostalgia.quests[id].stage,'trail');
 followNostalgiaClue(e,id,qs[id].trail[0].place);e=cleanEconomy(e);
 assert.equal(e.nostalgia.quests[id].wins[0],1);assert.equal(e.nostalgia.quests[id].trail,1);
 for(const clue of qs[id].trail.slice(1))followNostalgiaClue(e,id,clue.place);
 assert.equal(e.nostalgia.quests[id].stage,'ready');
 assert.ok(claimNostalgia(e,id,context(id),0,'Aie',1).ok);
});
test('early championship wins retain all tracks through reload without granting the car early',()=>{
 const id='nostalgia_T01';let e=newEconomy();unlockLater(e,id);startNostalgia(e,id,context(id));
 for(const track of ['oval','eight','jaguh'])recordNostalgiaWin(e,{game:'tamiya',track});
 e=cleanEconomy(e);assert.deepEqual(e.nostalgia.quests[id].tracks,['oval','eight','jaguh']);
 assert.equal(e.collection[id],undefined);help(e,id);
 for(const clue of qs[id].trail)followNostalgiaClue(e,id,clue.place);
 assert.equal(e.nostalgia.quests[id].stage,'ready');
});
const legacy=(id,trail=0)=>({quests:{[id]:{stage:'trail',deliveries:24,destinations:[1,2,3,4,5,6,7,8,9,10],long:8,trail,wins:{},tracks:[]}},earned:{}});
test('old clue indices migrate to retained stops once, and already accepted later stories remain accessible',()=>{
 const id='nostalgia_M01',v=legacy(id,4),m=cleanNostalgia(v);
 assert.equal(m.quests[id].trail,3);assert.equal(m.quests[id].stage,'trail');
 assert.deepEqual(cleanNostalgia(m),m);
 const e=newEconomy();e.nostalgia=m;
 assert.ok(nostalgiaAt(e,context(id)).includes(id));
 assert.ok(followNostalgiaClue(e,id,32).ok);
 assert.equal(e.nostalgia.quests[id].stage,'challenge');
 const partial=legacy('nostalgia_P02',2);assert.equal(cleanNostalgia(partial).quests.nostalgia_P02.trail,1);
});
test('every old earned keepsake retains ownership, dedication and save-slot data after rebalance',()=>{
 for(const [id,q] of ORIGINAL_QUEST_IDS.map(id=>[id,qs[id]])){
  const old=legacy(id,id==='nostalgia_I01'?6:5);
  old.quests[id].wins={0:6,1:2,2:2,3:2};old.quests[id].tracks=['oval','eight','jaguh'];
  old.earned[id]={choice:1,day:4,player:'Nur'};
  const e=newEconomy();e.wallet=2345;e.nostalgia=old;
  const clean=cleanEconomy(e);
  assert.equal(clean.nostalgia.quests[id].stage,'earned');assert.equal(clean.collection[id],1);
  assert.equal(clean.nostalgia.earned[id].player,'Nur');assert.equal(clean.nostalgia.earned[id].day,4);
  assert.equal(clean.nostalgia.earned[id].inscription,q.choices[1].memory);assert.equal(clean.wallet,2345);
 }
});

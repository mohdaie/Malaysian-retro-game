import test from 'node:test';
import assert from 'node:assert/strict';
import { newEconomy, cleanEconomy, offersAt, accept, collect, deliver, cancel, buy, STOCK, ITEMS } from '../src/economy.js';
import { NOSTALGIA_ITEMS } from '../src/nostalgia-items.js';
import { NOSTALGIA_QUESTS as QUESTS, startNostalgia, followNostalgiaClue, recordNostalgiaWin, claimNostalgia, nostalgiaStatus, nostalgiaAt, cleanNostalgia } from '../src/nostalgia-quests.js';
import { recordDam } from '../src/dam-progress.js';
import { newMatch } from '../src/dam-haji.js';
import { startTamiya, recordTamiya } from '../src/tamiya-progress.js';
import { prepareTamiya, launchTamiya, advanceTamiya } from '../src/tamiya.js';
import { ownedCars } from '../src/tamiya-cars.js';
import { readSave, writeSave } from '../src/save.js';
const context=id=>({place:QUESTS[id].place,npc:QUESTS[id].npc});
function errand(eco,n,route=90,to=1+n%18,stops=[to]) {
 const offer={id:'test-'+n,kind:'parcel',requester:22,from:22,to:stops.at(-1),stops,item:'gula',qty:stops.length,cost:0,upah:100,route};
 const {job}=accept(eco,offer);assert.ok(job);assert.ok(collect(eco,job.id,22).ok);let result;
 for(const stop of stops)result=deliver(eco,job.id,stop);
 return {job,result};
}
function trail(eco,id) {
 const q=QUESTS[id];for(let n=0;n<q.grind.deliveries;n++)errand(eco,n,90,1+n%18);
 assert.equal(nostalgiaStatus(eco,id).stage,'trail');
 for(const stop of q.trail)assert.ok(followNostalgiaClue(eco,id,stop.place).ok);
 assert.equal(nostalgiaStatus(eco,id).stage,'challenge');
}
function winAll(eco,id){for(const c of QUESTS[id].challenges)for(let i=0;i<c.count;i++)recordNostalgiaWin(eco,{game:c.game,level:c.level,opponent:c.opponent,track:c.tracks?c.tracks[i%c.tracks.length]:'oval'});}

test('all 28 photographed keepsakes have stories and cannot be bought; six paths use actual town stops',()=>{
 assert.equal(Object.keys(NOSTALGIA_ITEMS).length,28);assert.equal(Object.keys(QUESTS).length,6);
 for(const [id,item] of Object.entries(NOSTALGIA_ITEMS)){assert.ok(item.storyTitle&&item.story&&item.source&&item.photoSource);assert.ok(!Object.values(STOCK).some(s=>s.includes(id)));assert.equal(buy(newEconomy(),25,id).reason,'quest-only');assert.ok(ITEMS[id].rewardOnly);}
 for(const q of Object.values(QUESTS)){assert.ok(q.grind.deliveries>=10&&q.trail.length>=5);assert.ok(q.trail.every(s=>Number.isInteger(s.place)&&s.place>=1&&s.place<=38&&s.clue));}
});
test('progress starts at acceptance, paid deliveries count once and cancelled work counts zero',()=>{
 const eco=newEconomy(),id='nostalgia_M01';errand(eco,90);assert.deepEqual(eco.nostalgia.quests,{});
 assert.equal(startNostalgia(eco,id,{place:22,npc:'rahman'}).ok,false);assert.ok(startNostalgia(eco,id,context(id)).ok);assert.equal(startNostalgia(eco,id,context(id)).reason,'started');
 const {job}=errand(eco,1);assert.equal(eco.nostalgia.quests[id].deliveries,1);assert.equal(deliver(eco,job.id,job.to).ok,false);assert.equal(eco.nostalgia.quests[id].deliveries,1);
 const offer=offersAt(eco,22,()=>100).find(o=>o.kind==='parcel');const pending=accept(eco,offer).job;assert.ok(cancel(eco,pending.id).ok);assert.equal(eco.nostalgia.quests[id].deliveries,1);
});
test('a multi-stop delivery counts one job only at the final stop, and old jobs retain safe routes',()=>{
 const eco=newEconomy(),id='nostalgia_P02';startNostalgia(eco,id,context(id));
 const offer={id:'multi',kind:'parcel',requester:22,from:22,to:3,stops:[1,2,3],item:'gula',qty:3,cost:0,upah:200,route:90};const job=accept(eco,offer).job;collect(eco,job.id,22);
 deliver(eco,job.id,1);deliver(eco,job.id,2);assert.equal(eco.nostalgia.quests[id].deliveries,0);
 deliver(eco,job.id,3);assert.equal(eco.nostalgia.quests[id].deliveries,1);assert.deepEqual(eco.nostalgia.quests[id].destinations,[1,2,3]);
 const pending=accept(eco,{...offer,id:'old',route:undefined}).job;assert.equal(pending.route,0);assert.equal(cleanEconomy(eco).jobs[0].route,0);
});
test('short repetitive jobs cannot skip variety, long-route gates or ordered clue stops',()=>{
 const eco=newEconomy(),id='nostalgia_M01';startNostalgia(eco,id,context(id));
 for(let n=0;n<16;n++)errand(eco,n,10,2);
 assert.equal(nostalgiaStatus(eco,id).stage,'grind');assert.equal(eco.nostalgia.quests[id].long,0);assert.equal(eco.nostalgia.quests[id].destinations.length,1);
 assert.equal(followNostalgiaClue(eco,id,33).ok,false);
 for(let n=0;n<6;n++)errand(eco,100+n,90,3+n);
 assert.equal(nostalgiaStatus(eco,id).stage,'trail');assert.equal(followNostalgiaClue(eco,id,35).ok,false);
 assert.ok(followNostalgiaClue(eco,id,33).ok);assert.equal(followNostalgiaClue(eco,id,33).ok,false);assert.equal(eco.nostalgia.quests[id].trail,1);
 assert.ok(nostalgiaAt(eco,{place:29,npc:'farid'}).includes(id));
});
test('early wins and easier or wrong-opponent wins cannot satisfy the final challenge',()=>{
 const eco=newEconomy(),id='nostalgia_G01';startNostalgia(eco,id,context(id));recordNostalgiaWin(eco,{game:'dam',level:'jaguh'});assert.deepEqual(eco.nostalgia.quests[id].wins,{});trail(eco,id);
 recordNostalgiaWin(eco,{game:'dam',level:'santai'});recordNostalgiaWin(eco,{game:'congkak'});assert.equal(eco.nostalgia.quests[id].wins[0]||0,0);
 eco.dam.match={...newMatch('jaguh'),over:true,winner:0,settled:false};recordDam(eco);recordDam(eco);assert.equal(eco.nostalgia.quests[id].wins[0],1);
 const walkman=newEconomy();startNostalgia(walkman,'nostalgia_G04',context('nostalgia_G04'));trail(walkman,'nostalgia_G04');recordNostalgiaWin(walkman,{game:'gasing',opponent:'faiz'});assert.equal(walkman.nostalgia.quests.nostalgia_G04.wins[0]||0,0);
});
test('every path earns once, preserves the dedication and survives clean saves without touching money',()=>{
 for(const id of Object.keys(QUESTS)){
  const eco=newEconomy();startNostalgia(eco,id,context(id));assert.equal(claimNostalgia(eco,id,context(id),0,'Aie',3).ok,false);trail(eco,id);winAll(eco,id);assert.equal(nostalgiaStatus(eco,id).stage,'ready');
  const wallet=eco.wallet;assert.equal(claimNostalgia(eco,id,{place:22,npc:'rahman'},0,'Aie',3).ok,false);assert.ok(claimNostalgia(eco,id,context(id),1,'Aie',3).ok);assert.equal(eco.collection[id],1);assert.equal(eco.wallet,wallet);
  assert.equal(claimNostalgia(eco,id,context(id),0,'Aie',4).ok,false);const clean=cleanEconomy(eco);assert.deepEqual(clean.nostalgia,eco.nostalgia);assert.equal(clean.collection[id],1);assert.equal(clean.nostalgia.earned[id].player,'Aie');assert.equal(nostalgiaStatus(clean,id).stage,'earned');
 }
});
test('Lightning Magnum needs all tracks, becomes raceable and cannot be awarded for oval-only wins',()=>{
 const eco=newEconomy(),id='nostalgia_T01';startNostalgia(eco,id,context(id));trail(eco,id);
 for(let i=0;i<6;i++)recordNostalgiaWin(eco,{game:'tamiya',track:'oval'});
 assert.equal(nostalgiaStatus(eco,id).stage,'challenge');recordNostalgiaWin(eco,{game:'tamiya',track:'eight'});recordNostalgiaWin(eco,{game:'tamiya',track:'jaguh'});assert.ok(claimNostalgia(eco,id,context(id),0,'Nur',5).ok);
 assert.ok(ownedCars(eco.collection).includes(id));startTamiya(eco,'oval',id,'balanced');eco.tamiya.round=advanceTamiya(launchTamiya(prepareTamiya(eco.tamiya.round),.5),180);recordTamiya(eco);assert.equal(cleanEconomy(eco).tamiya.round.car,id);
});
test('bad or incomplete earned metadata cannot create ownership and legacy saves retain their progress',()=>{
 const eco=newEconomy();eco.wallet=2200;eco.collection={gasing:1,nostalgia_G01:99};eco.congkak={played:5,won:2};
 const clean=cleanEconomy(eco);assert.deepEqual(clean.collection,{gasing:1});assert.deepEqual(clean.nostalgia,{quests:{},earned:{}});assert.equal(clean.wallet,2200);assert.deepEqual(clean.congkak,eco.congkak);
 const bad=cleanNostalgia({quests:{nostalgia_M01:{stage:'earned',deliveries:0,trail:99,wins:{0:999}}},earned:{nostalgia_M01:{day:3,player:'Aie',choice:0}}});assert.deepEqual(bad.earned,{});assert.equal(bad.quests.nostalgia_M01.stage,'grind');
});
test('Amir and Nur keep separate keepsake quest saves, including a partially completed route',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const amir=newEconomy(),nur=newEconomy();startNostalgia(amir,'nostalgia_M01',context('nostalgia_M01'));errand(amir,0);
 for(const [who,eco] of [['amir',amir],['nur',nur]])assert.ok(writeSave(storage,{version:3,who,name:who,story:6,x:0,z:0,...eco,clock:{day:1,minute:900}}));
 assert.equal(readSave(storage,'amir').nostalgia.quests.nostalgia_M01.deliveries,1);assert.deepEqual(readSave(storage,'nur').nostalgia.quests,{});
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {CAR_IDS,TAMIYA_CARS,carRating} from '../src/tamiya-cars.js';
import {TAMIYA_TRACKS,TAMIYA_SETUPS,newTamiyaRound,prepareTamiya,launchTamiya,advanceTamiya,racePlans,racerPlan,racerAt,raceDuration,cleanTamiyaRound,trackPoint,raceTrackPoint,standings} from '../src/tamiya.js';
import {startTamiya,recordTamiya,newTamiyaProgress} from '../src/tamiya-progress.js';
import {newEconomy,cleanEconomy,buy,ITEMS,STOCK} from '../src/economy.js';
import {validateSave} from '../src/save.js';
const launched=(track='oval',car='tamiya_emperor',setup='balanced')=>launchTamiya(prepareTamiya(newTamiyaRound(track,car,setup,1)),.5);
const finished=(...args)=>advanceTamiya(launched(...args),180);

test('six shop cars have ascending prices and power, including the original RM12 save ID',()=>{
 assert.equal(CAR_IDS.length,6);assert.equal(ITEMS.tamiya.price,1200);
 for(let i=0;i<CAR_IDS.length;i++){const id=CAR_IDS[i],a=TAMIYA_CARS[id];assert.equal(ITEMS[id].price,a.price);assert.ok(STOCK[25].includes(id));assert.ok(ITEMS[id].memory.length>30);if(i){assert.ok(a.price>TAMIYA_CARS[CAR_IDS[i-1]].price);assert.ok(carRating(id)>carRating(CAR_IDS[i-1]));}}
});
test('car purchases are atomic, unique, sold only at Lim, and survive the collection save',()=>{
 const eco=newEconomy();eco.wallet=5000;assert.deepEqual(buy(eco,22,'tamiya_emperor'),{ok:false,reason:'not-sold'});assert.equal(eco.wallet,5000);
 assert.equal(buy(eco,25,'tamiya_emperor').ok,true);assert.equal(eco.wallet,0);assert.equal(eco.collection.tamiya_emperor,1);
 assert.equal(buy(eco,25,'tamiya_emperor').reason,'owned');assert.equal(buy(eco,25,'tamiya').reason,'funds');assert.equal(eco.wallet,0);assert.deepEqual(cleanEconomy(eco).collection,eco.collection);
});
test('loan and old owned starter work; unowned upgrades and active-race replacement are blocked',()=>{
 const eco=newEconomy();startTamiya(eco,'oval','tamiya','balanced');assert.equal(eco.tamiya.round.car,'tamiya');assert.deepEqual(eco.collection,{});
 assert.throws(()=>startTamiya(eco,'oval','tamiya_emperor','balanced'));eco.tamiya.round=null;assert.throws(()=>startTamiya(eco,'oval','tamiya_emperor','balanced'));assert.equal(eco.tamiya.nextRound,2);
 eco.collection.tamiya=1;startTamiya(eco,'oval','tamiya','fast');assert.equal(eco.collection.tamiya,1);
});
test('higher price gives a faster clean race on each track; stable tuning prevents dangerous exits',()=>{
 for(const track of Object.keys(TAMIYA_TRACKS)){let prev=Infinity;for(const id of CAR_IDS){const p=racerPlan(track,id,'balanced',.5);assert.ok(p.duration<prev);prev=p.duration;}}
 const fast=racerPlan('jaguh','tamiya_emperor','fast',.5),stable=racerPlan('jaguh','tamiya_star','stable',.5);assert.ok(fast.derails>0);assert.equal(stable.derails,0);assert.ok(stable.duration<fast.duration,'a cheaper, well-tuned car beats a risky expensive setup');
});
test('contact timing changes launch delay and all three racers use distinct real car/setup plans',()=>{
 const s=launched(),good=racePlans(s);assert.equal(good.length,3);assert.deepEqual(good.map(p=>p.key),['player','faiz','meiling']);assert.ok(Math.abs(good[1].quality-.78)<1e-9);assert.ok(Math.abs(good[2].quality-.95)<1e-9);const bad=racePlans({...s,contact:0});assert.ok(Math.abs(bad[0].duration-good[0].duration-1.8)<1e-9);assert.deepEqual(bad.slice(1),good.slice(1));
});
test('three-lap phases gate input; countdown carries excess time and skip gives the same finish',()=>{
 const ready=newTamiyaRound('oval','tamiya','balanced',1);assert.throws(()=>launchTamiya(ready,.5));let s=prepareTamiya(ready);assert.throws(()=>prepareTamiya(s));assert.throws(()=>launchTamiya(s,2));s=launchTamiya(s,.5);assert.equal(advanceTamiya(s,2).phase,'countdown');assert.equal(advanceTamiya(s,4).elapsed,1);
 const skipped=advanceTamiya(s,180);let watched=s;for(let i=0;i<2000;i++)watched=advanceTamiya(watched,.1);assert.deepEqual(watched,skipped);assert.equal(skipped.elapsed,raceDuration(skipped));assert.equal(standings(skipped).length,3);for(const p of racePlans(skipped)){const r=racerAt(p,skipped.elapsed,'oval');assert.equal(r.progress,1);assert.equal(r.lap,3);assert.equal(r.finished,true);}
});
test('race progress is independent of frame rate and never moves during a recovery penalty',()=>{
 const s=launched('jaguh','tamiya','fast');let a=s,b=s;for(let i=0;i<720;i++)a=advanceTamiya(a,1/60);for(let i=0;i<120;i++)b=advanceTamiya(b,.1);assert.ok(Math.abs(a.elapsed-b.elapsed)<1e-9);
 const p=racePlans(s)[0],stage=p.stages.find(x=>x.type==='derail');const r=racerAt(p,(stage.start+stage.end)/2,'jaguh');assert.equal(r.derailed,true);assert.equal(r.distance,stage.from);assert.ok(r.recovery>0&&r.recovery<1);
});
test('all track lanes form finite closed loops; figure eight has a raised crossover and oval straights',()=>{
 for(const track of Object.keys(TAMIYA_TRACKS))for(let lane=0;lane<3;lane++){const a=trackPoint(track,0,lane),b=trackPoint(track,1,lane);for(let i=0;i<=240;i++)assert.ok(Object.values(trackPoint(track,i/240,lane)).every(Number.isFinite));assert.ok(Math.hypot(a.x-b.x,a.z-b.z,a.y-b.y)<1e-8);}
 assert.ok(trackPoint('eight',.5).y-trackPoint('eight',0).y>2);assert.equal(trackPoint('oval',.05).z,trackPoint('oval',.2).z);
});
test('saved phases resume with recomputed results and reject unowned, corrupt and inherited IDs',()=>{
 const collection={tamiya_emperor:1};for(const s of [newTamiyaRound('oval','tamiya_emperor','balanced',1),prepareTamiya(newTamiyaRound('oval','tamiya_emperor','balanced',1)),launched(),advanceTamiya(launched(),12),finished()])assert.deepEqual(cleanTamiyaRound(s,collection),s);
 assert.equal(cleanTamiyaRound(launched(),{}),null);for(const bad of [{track:'constructor'},{car:'toString'},{setup:'unknown'},{elapsed:Infinity},{elapsed:-1},{contact:2},{phase:'result',elapsed:0},{settled:true}])assert.equal(cleanTamiyaRound({...launched(),...bad},collection),null);
 const forged={...finished(),duration:1,stages:[]};assert.deepEqual(cleanTamiyaRound(forged,collection),finished());
});
test('Jaguh lane changer links into the next lap, lifts the outer crossover and cycles every lane',()=>{
 for(let lane=0;lane<3;lane++)for(let lap=0;lap<3;lap++){const a=raceTrackPoint('jaguh',1,lane,lap),b=raceTrackPoint('jaguh',0,lane,lap+1);assert.ok(Math.hypot(a.x-b.x,a.z-b.z,a.y-b.y)<1e-8);}
 assert.ok(raceTrackPoint('jaguh',.085,2).y>1.5);assert.deepEqual(raceTrackPoint('jaguh',0,0,3),raceTrackPoint('jaguh',0,0,0));
});
test('completion, opponent rewards and three-track badge pay once, including after reload',()=>{
 const eco=newEconomy();eco.collection.tamiya_emperor=1;const money=eco.wallet;for(const track of Object.keys(TAMIYA_TRACKS)){startTamiya(eco,track,'tamiya_emperor','balanced');eco.tamiya.round=advanceTamiya(launchTamiya(prepareTamiya(eco.tamiya.round),.5),180);recordTamiya(eco);assert.deepEqual(recordTamiya(eco),[]);}
 assert.equal(eco.wallet,money+660);assert.equal(eco.tamiya.played,3);assert.equal(eco.tamiya.won,3);assert.ok(eco.tamiya.claimed.includes('jaguh'));const reload=cleanEconomy(eco);assert.deepEqual(recordTamiya(reload),[]);assert.equal(reload.wallet,eco.wallet);assert.equal(reload.collection.tamiya_emperor,1);
 startTamiya(reload,'oval','tamiya_emperor','balanced');reload.tamiya.round=null;assert.deepEqual(recordTamiya(reload),[]);assert.equal(reload.tamiya.played,3);
});
test('a losing finish receives completion only when it does not beat either rival',()=>{
 const eco=newEconomy();eco.tamiya.round=finished('jaguh','tamiya','fast');recordTamiya(eco);assert.deepEqual(eco.tamiya.claimed,['first']);assert.equal(eco.tamiya.won,0);assert.deepEqual(eco.tamiya.wins,[]);
});
test('existing saves keep the original model, wallet, jobs, Dam, Gasing, clock and story',()=>{
 const eco=newEconomy();delete eco.tamiya;eco.wallet=2780;eco.collection={tamiya:2,gasing:1};const old={version:3,who:'nur',name:'Nur',story:2,x:12,z:0,...eco,clock:{day:3,minute:900}};const v=validateSave(old);assert.deepEqual(v.tamiya,newTamiyaProgress());for(const key of ['wallet','collection','jobs','dam','gasing','clock','story'])assert.deepEqual(v[key],old[key]);
});

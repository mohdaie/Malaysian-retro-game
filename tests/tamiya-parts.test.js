import test from 'node:test';
import assert from 'node:assert/strict';
import { STOCK_BUILD, PART_IDS, PART_SLOTS, TAMIYA_PARTS, validBuild, partStats } from '../src/tamiya-parts.js';
import { newEconomy, cleanEconomy, buy, ITEMS, STOCK } from '../src/economy.js';
import { equipTamiya, startTamiya, garageBuild, recordTamiya } from '../src/tamiya-progress.js';
import { newTamiyaRound, prepareTamiya, launchTamiya, advanceTamiya, racePlans, racerAt, raceDuration, beginPit, editPit, rejoinPit, activePit, cleanTamiyaRound } from '../src/tamiya.js';
const collection=Object.fromEntries([...PART_IDS,'tamiya_star','tamiya_emperor'].map(id=>[id,1]));
const race=(track='jaguh',setup='fast',loadout=STOCK_BUILD)=>advanceTamiya(launchTamiya(prepareTamiya(newTamiyaRound(track,'tamiya_star',setup,1,loadout)),.5),4);
const player=s=>racerAt(racePlans(s)[0],s.elapsed,s.track);
const stop=(s,setup,build=s.loadout,seconds=2)=>rejoinPit(advanceTamiya(editPit(beginPit(s),setup,build,collection),seconds));

test('twelve distinct parts across six slots are collectible, priced and sold only at Uncle Lim',()=>{
 assert.equal(PART_IDS.length,12);assert.equal(Object.keys(PART_SLOTS).length,6);
 const eco=newEconomy();eco.chapter.completed=['S04'];eco.wallet=20000;for(const id of PART_IDS){assert.ok(STOCK[25].includes(id));assert.equal(ITEMS[id].price,TAMIYA_PARTS[id].price);assert.equal(buy(eco,22,id).reason,'not-sold');const before=eco.wallet;assert.equal(buy(eco,25,id).ok,true);assert.equal(eco.wallet,before-TAMIYA_PARTS[id].price);assert.equal(buy(eco,25,id).reason,'owned');}
 assert.deepEqual(cleanEconomy(eco).collection,eco.collection);
 const poor=newEconomy();poor.chapter.completed=['S04'];assert.equal(buy(poor,25,'mini_motor_dash').reason,'funds');assert.deepEqual(poor.collection,{});
});
test('garage enforces ownership and slot compatibility, saves independently per car, and never consumes parts',()=>{
 const eco=newEconomy(),build={...STOCK_BUILD,gear:'mini_gear_sprint'};assert.throws(()=>equipTamiya(eco,'tamiya',build));eco.collection={...collection};
 equipTamiya(eco,'tamiya',build);equipTamiya(eco,'tamiya_star',{...STOCK_BUILD,gear:'mini_gear_torque'});
 assert.equal(garageBuild(eco,'tamiya').gear,'mini_gear_sprint');assert.equal(garageBuild(eco,'tamiya_star').gear,'mini_gear_torque');
 assert.throws(()=>equipTamiya(eco,'tamiya',{...build,gear:'mini_motor_dash'}));assert.throws(()=>equipTamiya(eco,'toString',build));
 startTamiya(eco,'eight','tamiya_star','stable');assert.equal(eco.tamiya.round.loadout.gear,'mini_gear_torque');assert.deepEqual(cleanEconomy(eco).tamiya.garage,eco.tamiya.garage);assert.deepEqual(eco.collection,collection);
});
test('gear, motor, battery, tyres, rollers and brakes each change race performance with trade-offs',()=>{
 const base=partStats('tamiya_star');for(const id of PART_IDS){const p=TAMIYA_PARTS[id],build={...STOCK_BUILD,[p.slot]:id};assert.notDeepEqual(partStats('tamiya_star',build),base);assert.notEqual(racePlans(race('jaguh','balanced',build))[0].duration,racePlans(race('jaguh','balanced'))[0].duration);}
 const dash=partStats('tamiya_star',{...STOCK_BUILD,motor:'mini_motor_dash'});assert.ok(dash.speed>base.speed&&dash.drain>base.drain&&dash.stability<base.stability);
 const brake=partStats('tamiya_star',{...STOCK_BUILD,brake:'mini_brake_hard'});assert.ok(brake.stability>base.stability&&brake.speed<base.speed);
 assert.equal(validBuild({...STOCK_BUILD,gear:'constructor'}),false);
});
test('a tuned Shooting Star can beat a stock Emperor on Jaguh without leaving the track',()=>{
 const build={...STOCK_BUILD,motor:'mini_motor_dash',gear:'mini_gear_torque',battery:'mini_battery_endurance',tyres:'mini_tyres_sponge',rollers:'mini_rollers_bearing',brake:'mini_brake_hard'};
 const tuned=racePlans(race('jaguh','fast',build))[0],stock=racePlans(newTamiyaRound('jaguh','tamiya_emperor','balanced',1))[0];assert.equal(tuned.derails,0);assert.ok(tuned.duration<stock.duration);
});
test('taking a car stops only the player; rivals continue, and a pit cannot end before two seconds',()=>{
 let s=race(),at=s.elapsed,before=player(s),rivals=racePlans(s).slice(1).map(p=>racerAt(p,s.elapsed,s.track).distance);s=beginPit(s);assert.equal(activePit(s).at,at);assert.throws(()=>beginPit(s));assert.throws(()=>rejoinPit(s));assert.equal(raceDuration(s),Infinity);
 s=advanceTamiya(s,1.99);assert.throws(()=>rejoinPit(s));assert.equal(player(s).distance,before.distance);assert.equal(player(s).charge,before.charge);assert.equal(s.phase,'race');racePlans(s).slice(1).forEach((p,i)=>assert.ok(racerAt(p,s.elapsed,s.track).distance>rivals[i]));
 s=advanceTamiya(s,.01);s=rejoinPit(s);assert.equal(s.pits[0].release,at+2);assert.equal(player(s).pitting,false);assert.ok(Number.isFinite(raceDuration(s)));
});
test('pit retains the race past, supports repeated stops, and charges the actual selection time',()=>{
 const original=race('eight','balanced'),originalPlan=racePlans(original)[0];let s=stop(original,'stable',STOCK_BUILD,4.5);
 assert.equal(s.pits[0].release-s.pits[0].at,4.5);for(const t of [0,.5,.9])assert.deepEqual(racerAt(racePlans(s)[0],t,'eight'),racerAt(originalPlan,t,'eight'));
 s=advanceTamiya(s,.5);const at=s.elapsed;s=stop(s,'balanced');assert.equal(s.pits.length,2);assert.equal(s.pits[1].at,at);assert.equal(s.pits[1].release-at,2);assert.equal(player(s).setup,'balanced');
 assert.throws(()=>editPit(s,'fast',STOCK_BUILD,collection));assert.throws(()=>beginPit({...s,phase:'result'}));
});
test('changing to stable before technical sections can recover a bad fast build despite pit time',()=>{
 for(const track of ['eight','jaguh']){const bad=race(track,'fast'),changed=stop(bad,'stable');assert.ok(racePlans(changed)[0].duration<racePlans(bad)[0].duration-10);assert.ok(racePlans(changed)[0].derails<racePlans(bad)[0].derails);}
});
test('a risky setup applied in the middle of a corner pays its new recovery risk',()=>{
 const s=race('eight','stable'),p=racePlans(s)[0],corner=p.stages.find(v=>v.type==='tight'&&v.to>v.from);let at={...s,elapsed:corner.start+.1};at=stop(at,'fast');assert.equal(racePlans(at)[0].stages.find(v=>v.start===at.pits[0].release).type,'derail');
});
test('charge drain is reproducible, fast motors exhaust packs, and fresh owned packs can recover pace',()=>{
 const build={...STOCK_BUILD,motor:'mini_motor_dash',battery:'mini_battery_burst'},s=race('oval','fast',build),p=racePlans(s)[0];
 const depleted=p.stages.find(v=>v.type==='straight'&&v.chargeStart<5);assert.ok(depleted);let at={...s,elapsed:depleted.start};const charge=player(at).charge;
 at=stop(at,'fast',{...build,battery:'mini_battery_endurance'});assert.ok(player(at).charge>.99&&player(at).charge>charge);assert.ok(player(at).speed>depleted.speed);
 const after=advanceTamiya(at,.5);const back=stop(after,'fast',build);assert.ok(player(back).charge<.1,'returning to Burst must not refill it');assert.ok(player(back).speed<player(after).speed);
});
test('active and completed pits, selected parts and pack history survive reload with an identical future',()=>{
 let s=race('eight','balanced',{...STOCK_BUILD,battery:'mini_battery_burst'});s=editPit(beginPit(s),'stable',{...STOCK_BUILD,battery:'mini_battery_endurance'},collection);s=advanceTamiya(s,1.2);const reload=cleanTamiyaRound(JSON.parse(JSON.stringify(s)),collection);assert.deepEqual(reload,s);assert.deepEqual(player(reload),player(s));
 s=rejoinPit(advanceTamiya(s,1));const loaded=rejoinPit(advanceTamiya(reload,1));assert.deepEqual(loaded,s);assert.deepEqual(advanceTamiya(loaded,300),advanceTamiya(s,300));
 const done=advanceTamiya(s,300);assert.deepEqual(cleanTamiyaRound(done,collection),done);
});
test('bad pit timestamps, unowned drafts and altered results are rejected, and stopped races pay no reward',()=>{
 const s=beginPit(race());for(const p of [{...s.pits[0],at:-1},{...s.pits[0],at:Infinity},{...s.pits[0],release:s.elapsed+1},{...s.pits[0],loadout:{...STOCK_BUILD,gear:'mini_motor_dash'}}])assert.equal(cleanTamiyaRound({...s,pits:[p]},collection),null);
 assert.equal(cleanTamiyaRound({...s,pits:[...s.pits,...s.pits]},collection),null);assert.equal(cleanTamiyaRound({...s,phase:'result'},collection),null);
 const unowned=editPit(s,'fast',{...STOCK_BUILD,motor:'mini_motor_dash'},collection);assert.equal(cleanTamiyaRound(unowned,{}),null);
 const eco=newEconomy();eco.tamiya.round=s;const wallet=eco.wallet;advanceTamiya(s,300);assert.deepEqual(recordTamiya(eco),[]);assert.equal(eco.wallet,wallet);assert.equal(eco.tamiya.played,0);
});
test('v1.7 in-progress races retain the original timing model; the next race uses parts rules',()=>{
 const old={id:1,track:'jaguh',car:'tamiya_star',setup:'fast',phase:'race',elapsed:8,contact:.5,settled:false};const restored=cleanTamiyaRound(old,collection);assert.deepEqual(restored,old);const durations=racePlans(old).map(p=>p.duration);assert.deepEqual(racePlans(restored).map(p=>p.duration),durations);assert.throws(()=>beginPit(restored));
 const completed=advanceTamiya(restored,300);assert.deepEqual(cleanTamiyaRound(completed,collection),completed);const eco=cleanEconomy({...newEconomy(),collection,tamiya:{round:completed}});startTamiya(eco,'eight','tamiya_star','stable');assert.equal(eco.tamiya.round.rules,2);
});
test('watching and skipping a race after strategic pit stops settle the same result exactly once',()=>{
 let s=stop(race('eight','fast'),'stable');let watched=s;for(let i=0;i<5000&&watched.phase!=='result';i++)watched=advanceTamiya(watched,1/60);const skipped=advanceTamiya(s,300);assert.deepEqual(watched,skipped);
 const eco=newEconomy();eco.collection=collection;eco.tamiya.round=skipped;recordTamiya(eco);const wallet=eco.wallet,reload=cleanEconomy(eco);assert.deepEqual(recordTamiya(reload),[]);assert.equal(reload.wallet,wallet);assert.equal(reload.tamiya.played,1);
});

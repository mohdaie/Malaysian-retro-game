import test from 'node:test';
import assert from 'node:assert/strict';
import { PRAYERS, currentPrayer, newPrayerProgress, cleanPrayerProgress, prayerState, performPrayer } from '../src/prayer.js';
import { validateSave } from '../src/save.js';
import { newEconomy } from '../src/economy.js';
import { canSleep, sleep } from '../src/clock.js';

test('five game prayer windows use precise inclusive starts and exclusive ends',()=>{
  for(const p of PRAYERS){
    assert.equal(currentPrayer({day:3,minute:p.from})?.id,p.id);
    assert.notEqual(currentPrayer({day:3,minute:p.from-.01})?.id,p.id);
    assert.notEqual(currentPrayer({day:3,minute:p.to})?.id,p.id);
  }
  assert.equal(currentPrayer({day:3,minute:10*60}),null);
  assert.equal(currentPrayer({day:3,minute:60}).id,'isyak');
  assert.equal(currentPrayer({day:3,minute:60}).day,2);
});
test('each prayer adds exactly 20 minutes, including fractional clocks, and pays no rewards',()=>{
  for(const p of PRAYERS){
    const clock={day:1,minute:p.from+.25},progress=newPrayerProgress(),before=clock.minute;
    assert.equal(performPrayer(clock,progress,p.id).ok,true);assert.equal(clock.minute-before,20);
    assert.deepEqual(progress,{day:1,completed:[p.id]});
    const after=structuredClone(clock);assert.equal(performPrayer(clock,progress,p.id).ok,false);assert.deepEqual(clock,after);
  }
});
test('late starts can finish in the next prayer window, while wrong-time actions leave state intact',()=>{
  const clock={day:4,minute:20*60+25},progress=newPrayerProgress();
  assert.equal(performPrayer(clock,progress,'maghrib').ok,true);assert.equal(clock.minute,20*60+45);
  assert.equal(prayerState(clock,progress,'isyak').available,true);
  const saved={clock:structuredClone(clock),progress:structuredClone(progress)};
  for(const id of ['subuh','zohor','asar','missing'])assert.equal(performPrayer(clock,progress,id).ok,false);
  assert.deepEqual({clock,progress},saved);
});
test('Isyak crosses midnight by exactly 20 minutes and remains completed until Subuh',()=>{
  const clock={day:5,minute:23*60+50},progress={day:5,completed:['zohor','asar','maghrib']};
  performPrayer(clock,progress,'isyak');assert.deepEqual(clock,{day:6,minute:10});assert.equal(prayerState(clock,progress,'isyak').completed,true);
  assert.equal(performPrayer(clock,progress,'isyak').ok,false);
  assert.equal(canSleep(clock.minute),true);sleep(clock);assert.deepEqual(clock,{day:6,minute:360},'sleep wakes at this morning, not tomorrow');
  assert.equal(prayerState(clock,progress,'subuh').available,true);performPrayer(clock,progress,'subuh');assert.deepEqual(progress,{day:6,completed:['subuh']});
});
test('prayer completion survives save validation and old saves safely gain an empty ledger',()=>{
  const value={version:3,who:'amir',name:'Amir',story:3,x:10,z:0,...newEconomy(),clock:{day:3,minute:800},wallet:12300,collection:{tamiya_star:1}};
  performPrayer(value.clock,value.prayer,'zohor');const saved=validateSave(value);
  assert.deepEqual(saved.prayer,value.prayer);assert.deepEqual(saved.clock,value.clock);assert.equal(saved.wallet,12300);assert.deepEqual(saved.collection,value.collection);
  assert.equal(prayerState(saved.clock,saved.prayer,'zohor').available,false);
  const {prayer,...old}=value;assert.deepEqual(validateSave(old).prayer,newPrayerProgress());
  assert.deepEqual(cleanPrayerProgress({day:3,completed:['subuh','subuh','fake',17]}),{day:3,completed:['subuh']});
  for(const bad of [null,'invalid',{day:-1,completed:[]},{day:3,completed:'all'}])assert.deepEqual(cleanPrayerProgress(bad),newPrayerProgress());
});

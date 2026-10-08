import test from 'node:test';
import assert from 'node:assert/strict';
import { newEconomy, accept, collect, deliver } from '../src/economy.js';
import { NOSTALGIA_QUESTS, startNostalgia as startRaw, followNostalgiaClue, recordNostalgiaWin, claimNostalgia } from '../src/nostalgia-quests.js';
import { DONE, advance, syncChapter, chapterGuide, chapterKeepsake, cleanExhibition, shareKeepsake, EXHIBITION_LINKS } from '../src/story.js';
import { validateSave, readSave, writeSave } from '../src/save.js';

import { unlockLater, ORIGINAL_QUEST_IDS } from './quest-helpers.js';
const startNostalgia=(eco,id,context)=>{unlockLater(eco,id);return startRaw(eco,id,context);};
const context = id => ({ place: NOSTALGIA_QUESTS[id].place, npc: NOSTALGIA_QUESTS[id].npc });
function deliveries(eco, id) {
  for (let n=0;n<NOSTALGIA_QUESTS[id].grind.deliveries;n++) {
    const to=1+n%18;
    const {job}=accept(eco,{id:`chapter-${id}-${n}`,kind:'parcel',requester:22,from:22,to,stops:[to],item:'gula',qty:1,cost:0,upah:100,route:90});
    assert.ok(collect(eco,job.id,22).ok);assert.ok(deliver(eco,job.id,to).ok);
  }
}
function earn(eco,id) {
  startNostalgia(eco,id,context(id));deliveries(eco,id);
  for(const stop of NOSTALGIA_QUESTS[id].trail)followNostalgiaClue(eco,id,stop.place);
  for(const c of NOSTALGIA_QUESTS[id].challenges)for(let i=0;i<c.count;i++)recordNostalgiaWin(eco,{game:c.game,level:c.level,opponent:c.opponent,track:c.tracks?.[i%c.tracks.length]||'oval'});
  assert.ok(claimNostalgia(eco,id,context(id),0,'Aie',4).ok);
}
const save=(eco,story,extra={})=>({version:3,who:'amir',name:'Aie',story,x:0,z:0,...eco,clock:{day:4,minute:840},...extra});

test('buying the first toy leads to Pak Salleh; empty or unrelated events cannot finish a chapter step',()=>{
  assert.equal(advance(5,'bought-collectible'),6);
  const g=chapterGuide(6,newEconomy());assert.equal(g.target,'salleh');assert.notEqual(g.step,DONE);assert.match(g.text,/exhibition/i);
  assert.equal(advance(6,'bought-collectible'),6);assert.equal(advance(6,'invited-exhibition'),7);
  for(const step of [7,8,9,10,11,DONE])assert.equal(advance(step,null),step);
});
test('the chapter follows real delivery, clue, challenge, claim and exhibition gates',()=>{
  const eco=newEconomy(),id='nostalgia_P02';assert.equal(syncChapter(7,eco),7);
  startNostalgia(eco,id,context(id));assert.equal(syncChapter(7,eco),8);assert.equal(chapterGuide(8,eco).target,'rahman');
  const {job}=accept(eco,{id:'pending',kind:'parcel',requester:22,from:22,to:2,stops:[2],item:'gula',qty:1,cost:0,upah:100,route:90});
  assert.deepEqual(chapterGuide(8,eco).target,{place:22,job:true});collect(eco,job.id,22);
  assert.deepEqual(chapterGuide(8,eco).target,{place:2,job:true});deliver(eco,job.id,2);
  assert.equal(syncChapter(8,eco),8);deliveries(eco,id);assert.equal(syncChapter(8,eco),9);
  assert.deepEqual(chapterGuide(9,eco).target,{place:25});
  for(const stop of NOSTALGIA_QUESTS[id].trail)followNostalgiaClue(eco,id,stop.place);
  assert.equal(syncChapter(9,eco),10);assert.equal(chapterGuide(10,eco).target,'nenek');
  assert.equal(shareKeepsake(eco,10,id,4).ok,false);
  for(let i=0;i<4;i++)recordNostalgiaWin(eco,{game:'congkak'});
  assert.equal(syncChapter(10,eco),11);assert.equal(chapterGuide(11,eco).target,'farid');
  assert.ok(claimNostalgia(eco,id,context(id),1,'Aie',4).ok);assert.equal(syncChapter(11,eco),12);
  assert.equal(chapterGuide(12,eco).target,'salleh');assert.equal(syncChapter(12,eco),12,'owning it still requires the exhibition return');
  const before=structuredClone(eco),result=shareKeepsake(eco,12,id,4);assert.ok(result.ok);assert.deepEqual(eco,before,'sharing neither sells nor removes the keepsake');
  assert.equal(syncChapter(12,eco,result.exhibition),DONE);assert.equal(shareKeepsake(eco,DONE,id,4).ok,false);
  assert.match(chapterGuide(DONE,eco,result.exhibition).text,/Shared at the balai raya on game day 4/);
});
test('any of the six stories can complete Chapter 1; the remaining stories stay open',()=>{
  assert.equal(Object.keys(EXHIBITION_LINKS).length,14);
  for(const id of ORIGINAL_QUEST_IDS){
    const eco=newEconomy();earn(eco,id);assert.equal(syncChapter(7,eco),12);
    assert.ok(shareKeepsake(eco,12,id,4).ok);
    const other=Object.keys(NOSTALGIA_QUESTS).find(k=>!eco.nostalgia.quests[k]);assert.ok(startNostalgia(eco,other,context(other)).ok);
    assert.ok(eco.nostalgia.earned[chapterKeepsake(eco)]);assert.equal(eco.nostalgia.quests[other].stage,'grind');
  }
});
test('starter guidance asks for one congkak win; later Tamiya requires every track',()=>{
 const eco=newEconomy(),id='nostalgia_I01';startNostalgia(eco,id,context(id));deliveries(eco,id);
 for(const stop of NOSTALGIA_QUESTS[id].trail)followNostalgiaClue(eco,id,stop.place);
 assert.equal(chapterGuide(10,eco).target,'nenek');
 recordNostalgiaWin(eco,{game:'congkak'});assert.equal(syncChapter(10,eco),11);
 const race=newEconomy();startNostalgia(race,'nostalgia_T01',context('nostalgia_T01'));deliveries(race,'nostalgia_T01');
 for(const stop of NOSTALGIA_QUESTS.nostalgia_T01.trail)followNostalgiaClue(race,'nostalgia_T01',stop.place);
 for(let i=0;i<3;i++)recordNostalgiaWin(race,{game:'tamiya',track:'oval'});
 assert.equal(race.nostalgia.quests.nostalgia_T01.stage,'challenge');
});
test('old completed saves resume at the invitation without resetting earned keepsakes or money',()=>{
  const eco=newEconomy();earn(eco,'nostalgia_P02');eco.wallet=1900;
  const old=validateSave(save(eco,6));assert.equal(old.story,6);assert.equal(old.wallet,1900);assert.deepEqual(old.nostalgia,eco.nostalgia);
  assert.equal(syncChapter(advance(old.story,'invited-exhibition'),old),12);
  assert.equal(shareKeepsake(old,6,'nostalgia_P02',4).ok,false,'the invitation must be heard');
});
test('earned progress survives an interrupted challenge or exhibition dialogue; forged completion does not',()=>{
  const eco=newEconomy();earn(eco,'nostalgia_M01');
  assert.equal(validateSave(save(eco,11)).story,12);
  assert.equal(validateSave(save(eco,DONE)).story,12,'an ending without a display resumes at sharing');
  for(const bad of [{id:'nostalgia_M01',day:3},{id:'nostalgia_M01',day:1.5},{id:'nostalgia_G01',day:4},{id:'nostalgia_M02',day:4}]){
    assert.equal(cleanExhibition(bad,eco),null);assert.equal(validateSave(save(eco,DONE,{exhibition:bad})).story,12);
  }
  assert.equal(validateSave(save(newEconomy(),10)).story,7,'a corrupt chapter number cannot invent quest progress');
});
test('the personal display saves separately for Amir and Nur, with its game day and dedication',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const eco=newEconomy();earn(eco,'nostalgia_M01');const exhibition=shareKeepsake(eco,12,'nostalgia_M01',4).exhibition;
  assert.ok(writeSave(storage,save(eco,DONE,{exhibition})));
  assert.ok(writeSave(storage,{...save(newEconomy(),2),who:'nur',name:'Nur'}));
  const amir=readSave(storage,'amir'),nur=readSave(storage,'nur');assert.equal(amir.story,DONE);assert.deepEqual(amir.exhibition,exhibition);assert.equal(amir.nostalgia.earned.nostalgia_M01.player,'Aie');assert.equal(nur.story,2);assert.equal(nur.exhibition,undefined);
});

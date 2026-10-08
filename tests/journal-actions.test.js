import test from 'node:test';
import assert from 'node:assert/strict';
import {newEconomy,accept,collect,deliver,cancel} from '../src/economy.js';
import {chapterGuide,storyOffers} from '../src/story.js';
import {chapterTasks,chapterNext,chapterBrief,deliveryTasks,deliveryNext,memoryNext,gameTasks} from '../src/journal.js';
import {NOSTALGIA_QUESTS as qs,startNostalgia,followNostalgiaClue,recordNostalgiaWin} from '../src/nostalgia-quests.js';
import {DAM_QUESTS} from '../src/dam-progress.js';
import {GASING_QUESTS} from '../src/gasing-progress.js';
import {TAMIYA_QUESTS} from '../src/tamiya-progress.js';
const placeName=id=>'Place '+id;
test('tutorial tasks follow the correct story parcel, pickup, purchase and handover menus',()=>{
 const e=newEconomy();
 assert.match(chapterNext(chapterGuide(0,e),e,placeName).text,/Faiz.*habiskan dialog/);
 assert.match(chapterNext(chapterGuide(1,e),e,placeName).text,/Delivery work.*Accept.*gula/);
 const unrelated=accept(e,{id:'other',kind:'parcel',requester:25,from:25,to:12,stops:[12],item:'gula',qty:1,cost:0,upah:100,route:80}).job;
 const first=accept(e,storyOffers(1,e)[0]).job;
 assert.equal(chapterTasks(chapterGuide(2,e),e,placeName)[0].place,22);
 assert.equal(chapterNext(chapterGuide(2,e),e,placeName).route,'place:22');
 collect(e,first.id,22);assert.match(chapterNext(chapterGuide(2,e),e,placeName).text,/Place 2.*Deliver parcel/);
 deliver(e,first.id,2);
 assert.equal(chapterNext(chapterGuide(3,e),e,placeName).route,'npc:nenek');
 assert.match(chapterNext(chapterGuide(3,e),e,placeName).text,/Requests.*Accept.*Buy for/);
 const tea=accept(e,storyOffers(3,e)[0]).job;
 assert.equal(deliveryTasks(tea)[0].label,'Beli 1 × Teh (tea packet)');
 assert.match(deliveryTasks(tea)[0].detail,/Buy for.*RM 0.70.*dipulangkan/);
 collect(e,tea.id,22);assert.equal(chapterNext(chapterGuide(3,e),e,placeName).route,'place:2');
 assert.match(chapterNext(chapterGuide(4,e),e,placeName).text,/tidak wajib menang/);
 assert.match(chapterNext(chapterGuide(6,e),e,placeName).text,/Prepare Pameran Kenangan.*dialog/);
 assert.match(chapterNext(chapterGuide(7,e),e,placeName).text,/Terima tugas.*Talk sahaja/);
 assert.equal(chapterNext(chapterGuide(7,e),e,placeName).route,null);
 cancel(e,unrelated.id);
});
test('cancelled first parcel can be accepted again and its directions recover',()=>{
 const e=newEconomy(),job=accept(e,storyOffers(1,e)[0]).job;cancel(e,job.id);
 assert.equal(chapterGuide(2,e).target,'rahman');
 assert.equal(storyOffers(2,e)[0].story,'first-parcel');
 assert.match(chapterNext(chapterGuide(2,e),e,placeName).text,/Accept semula/);
});
test('keepsake next actions and HUD counts follow actual delivery and clue progression',()=>{
 const e=newEconomy(),id='nostalgia_P02',q=qs[id];startNostalgia(e,id,{npc:q.npc,place:q.place});
 assert.match(memoryNext(e,id,placeName).text,/Pak Rahman.*Delivery work.*Accept/);
 assert.match(chapterBrief(chapterGuide(8,e),e,placeName),/0\/3 delivery.*0\/3 destinasi.*0\/1 laluan 60 m/);
 const job=accept(e,{id:'multi',kind:'parcel',requester:22,from:22,to:3,stops:[1,2,3],item:'gula',qty:3,cost:0,upah:200,route:90}).job;
 assert.equal(memoryNext(e,id,placeName).route,'place:22');collect(e,job.id,22);
 assert.equal(deliveryNext(job,placeName).route,'place:1');deliver(e,job.id,1);
 assert.equal(memoryNext(e,id,placeName).route,'place:2');assert.equal(e.nostalgia.quests[id].deliveries,0);
 deliver(e,job.id,2);deliver(e,job.id,3);
 assert.match(chapterBrief(chapterGuide(8,e),e,placeName),/1\/3 delivery.*3\/3 destinasi.*1\/1 laluan/);
 for(let i=0;i<2;i++){const j=accept(e,{id:'finish-'+i,kind:'parcel',requester:22,from:22,to:2,stops:[2],item:'gula',qty:1,cost:0,upah:100,route:40}).job;collect(e,j.id,22);deliver(e,j.id,2);}
 assert.equal(memoryNext(e,id,placeName).route,'place:'+q.trail[0].place);
 assert.match(memoryNext(e,id,placeName).text,/Ada kisah.*Baca petunjuk/);
 for(const stop of q.trail)followNostalgiaClue(e,id,stop.place);
 assert.match(memoryNext(e,id,placeName).text,/Nenek.*Main congkak.*Menang diperlukan/);
 recordNostalgiaWin(e,{game:'congkak'});assert.equal(memoryNext(e,id,placeName).route,'npc:farid');
 assert.match(memoryNext(e,id,placeName).text,/dedikasi.*menerima keepsake/);
});
test('all game achievements include uncompleted requirements and track-specific tick marks',()=>{
 const e=newEconomy();
 for(const [key,quests] of [['dam',DAM_QUESTS],['gasing',GASING_QUESTS],['tamiya',TAMIYA_QUESTS]]){
  const tasks=gameTasks(key,e[key],quests);
  assert.ok(tasks.slice(0,quests.length).every(t=>!t.done&&t.detail&&t.route));
  assert.equal(tasks.slice(0,quests.length).length,quests.length);
 }
 assert.match(gameTasks('gasing',e.gasing,GASING_QUESTS)[1].detail,/20 saat.*85%/);
 e.tamiya.wins=['oval'];assert.deepEqual(gameTasks('tamiya',e.tamiya,TAMIYA_QUESTS).filter(t=>t.id.startsWith('town-track')).map(t=>t.done),[true,false,false]);
});

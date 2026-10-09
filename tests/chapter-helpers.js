import assert from 'node:assert/strict';
import{newEconomy,accept,collect,deliver}from'../src/economy.js';
import{STEPS,completeChapterStep,storyOffers,syncChapter,availableScenes}from'../src/story.js';
import{prepareTamiya,launchTamiya,advanceTamiya}from'../src/tamiya.js';
import{startTamiya,recordTamiya}from'../src/tamiya-progress.js';
export const scene=(e,id,proof)=>{const s=STEPS.find(s=>s.id===id);assert.ok(s,id);assert.ok(completeChapterStep(e,s.on,'Aie',4,proof),id);};
export function job(e,id){const o=storyOffers(0,e,()=>40).find(o=>o.id==='C1-'+id);assert.ok(o,'offer '+id);const {job:j}=accept(e,o);assert.ok(j,id);assert.ok(collect(e,j.id,j.from).ok);for(const stop of j.stops)assert.ok(deliver(e,j.id,stop).ok);syncChapter(0,e);return j;}
export function race(e,track='oval',tournament=false,setup='balanced'){startTamiya(e,track,'tamiya',setup,tournament);e.tamiya.round=advanceTamiya(launchTamiya(prepareTamiya(e.tamiya.round),.5),600);const awards=recordTamiya(e,4);syncChapter(0,e);return awards;}
export function opening(who='amir'){const e=newEconomy();e.chapter.who=who;scene(e,'S01');job(e,'D01');scene(e,'S02');job(e,'D02');scene(e,'S03');job(e,'D03');scene(e,'S04');race(e);scene(e,'S05');job(e,'D04');scene(e,'S06');return e;}
export function branch(e,key){
 if(key==='A'){scene(e,'S07');scene(e,'S08');scene(e,'S09J');scene(e,'S09L');job(e,'D05');job(e,'D06');}
 if(key==='B'){scene(e,'S10');scene(e,'S11R');job(e,'D07');job(e,'D08');job(e,'D09');scene(e,'S11T');scene(e,'S12');job(e,'D10');scene(e,'S13');job(e,'D11');scene(e,'S13K');}
 if(key==='C'){scene(e,'S14');job(e,'D12');job(e,'D13');scene(e,'S15');scene(e,'S16');job(e,'D15');job(e,'D16');}
}
export function prepared(order=['A','B','C'],who='amir'){const e=opening(who);for(const key of order)branch(e,key);scene(e,'S17');job(e,'D14');for(const key of order){const s=STEPS.find(s=>s.id==='deduce'+key);scene(e,s.id,{answer:key,cards:s.requires.map(x=>Array.isArray(x)?x[0]:x)});}return e;}
export function registered(order){const e=prepared(order);scene(e,'S20');job(e,'D17');scene(e,'S21');job(e,'D18');scene(e,'S22');job(e,'D19');scene(e,'S23');return e;}

import assert from 'node:assert/strict';
import { accept, collect, deliver } from '../src/economy.js';
import { NOSTALGIA_QUESTS, startNostalgia, followNostalgiaClue, recordNostalgiaWin, claimNostalgia } from '../src/nostalgia-quests.js';
export function unlockLater(eco,id) {
 if(!NOSTALGIA_QUESTS[id]?.later || Object.keys(eco.nostalgia.earned).length)return;
 const starter='nostalgia_P02',q=NOSTALGIA_QUESTS[starter],context={place:q.place,npc:q.npc};
 assert.ok(startNostalgia(eco,starter,context).ok);
 for(let n=0;n<q.grind.deliveries;n++){
  const to=1+n,job=accept(eco,{id:'unlock-'+n,kind:'parcel',requester:22,from:22,to,stops:[to],item:'gula',qty:1,cost:0,upah:100,route:90}).job;
  collect(eco,job.id,22);deliver(eco,job.id,to);
 }
 for(const clue of q.trail)followNostalgiaClue(eco,starter,clue.place);
 recordNostalgiaWin(eco,{game:'congkak'});
 assert.ok(claimNostalgia(eco,starter,context,0,'Aie',1).ok);
}

export const ORIGINAL_QUEST_IDS = Object.keys(NOSTALGIA_QUESTS).filter(id=>NOSTALGIA_QUESTS[id].set!==2);

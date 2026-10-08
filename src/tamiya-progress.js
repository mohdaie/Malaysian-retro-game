import { TAMIYA_TRACKS, newTamiyaRound, cleanTamiyaRound, racePlans } from './tamiya.js?v=2.7.3';
import { cleanBuild, validBuild } from './tamiya-parts.js?v=2.7.3';
import { TAMIYA_CARS } from './tamiya-cars.js?v=2.7.3';
import { recordNostalgiaWin } from './nostalgia-quests.js?v=2.7.3';
export const TAMIYA_QUESTS=[
  {id:'first',title:'Bateri masuk, jom race!',text:'Finish your first three-lap race.',sen:80},
  {id:'faiz',title:'Potong Faiz',text:'Finish ahead of Faiz.',sen:120},
  {id:'meiling',title:'Kalahkan Mei Ling',text:'Finish ahead of Mei Ling.',sen:160},
  {id:'jaguh',title:'Jaguh Tamiya Pekan',text:'Win first place on all three tracks.',sen:300}
];
export function newTamiyaProgress(){return {played:0,won:0,nextRound:1,claimed:[],wins:[],best:{},garage:{},round:null};}
export function cleanTamiyaProgress(v,collection={}){
  const p=newTamiyaProgress();if(!v||typeof v!=='object')return p;
  if(Number.isInteger(v.played)&&v.played>=0&&v.played<=1e6&&Number.isInteger(v.won)&&v.won>=0&&v.won<=v.played){p.played=v.played;p.won=v.won;}
  if(Number.isInteger(v.nextRound)&&v.nextRound>=1&&v.nextRound<=1e9)p.nextRound=v.nextRound;
  if(Array.isArray(v.claimed))p.claimed=[...new Set(v.claimed.filter(id=>TAMIYA_QUESTS.some(q=>q.id===id)))];
  if(Array.isArray(v.wins))p.wins=[...new Set(v.wins.filter(id=>Object.hasOwn(TAMIYA_TRACKS,id)))];
  for(const [track,time] of Object.entries(v.best||{}))if(Object.hasOwn(TAMIYA_TRACKS,track)&&Number.isFinite(time)&&time>0&&time<=3600)p.best[track]=time;
  for(const [car,build] of Object.entries(v.garage||{}))if(Object.hasOwn(TAMIYA_CARS,car)&&(car==='tamiya'||collection[car]>0))p.garage[car]=cleanBuild(build,collection);
  p.round=cleanTamiyaRound(v.round,collection);if(p.round)p.nextRound=Math.max(p.nextRound,p.round.id+1);return p;
}
export function startTamiya(eco,track,car,setup){
  const p=eco.tamiya;if(p.round&&p.round.phase!=='result')throw new Error('Resume or end the saved race first');
  if(!TAMIYA_CARS[car]||car!=='tamiya'&&!eco.collection[car])throw new Error('Car not owned');
  const s=newTamiyaRound(track,car,setup,p.nextRound,cleanBuild(p.garage[car],eco.collection));p.nextRound++;p.round=s;return s;
}
export function recordTamiya(eco){
  const p=eco.tamiya,s=p.round,awards=[];if(!s||s.phase!=='result'||s.settled)return awards;
  const [player,faiz,mei]=racePlans(s),win=player.duration<Math.min(faiz.duration,mei.duration)-.001;
  s.settled=true;p.played++;if(win){p.won++;if(!p.wins.includes(s.track))p.wins.push(s.track);}
  if(win)recordNostalgiaWin(eco,{game:'tamiya',track:s.track});
  p.best[s.track]=Math.min(p.best[s.track]||Infinity,player.duration);
  const eligible=['first',player.duration<faiz.duration-.001&&'faiz',player.duration<mei.duration-.001&&'meiling',p.wins.length===Object.keys(TAMIYA_TRACKS).length&&'jaguh'];
  for(const id of eligible.filter(Boolean))if(!p.claimed.includes(id)){const q=TAMIYA_QUESTS.find(q=>q.id===id);p.claimed.push(id);eco.wallet+=q.sen;awards.push(q);}return awards;
}

export function equipTamiya(eco,car,build){
  if(!Object.hasOwn(TAMIYA_CARS,car)||car!=='tamiya'&&!eco.collection[car]||!validBuild(build,eco.collection))throw Error('Part or car not owned');
  eco.tamiya.garage[car]={...build};return eco.tamiya.garage[car];
}
export const garageBuild=(eco,car)=>cleanBuild(eco.tamiya.garage[car],eco.collection);

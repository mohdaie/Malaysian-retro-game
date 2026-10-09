import { NPCS, RESIDENTS, KEEPERS } from './cast.js?v=2.13.0';
import { CROWD } from './crowds.js?v=2.13.0';
// Crop coordinates are presentation metadata: the approved source sheets remain
// untouched. Add a confirmed character sheet here to enable that speaker.
export const PORTRAITS = {
  amir: {src:'./assets/portraits/amir-sheet.png',width:1774,height:887,x:140,y:26,size:260},
  nur: {src:'./assets/portraits/nur-sheet.png',width:1821,height:864,x:154,y:19,size:285}
};
export const PEOPLE = {...Object.fromEntries(Object.entries(CROWD).map(([k,v])=>[k,v.name])),...Object.fromEntries(Object.entries(NPCS).map(([k,v])=>[k,v.name])),...Object.fromEntries(Object.values(RESIDENTS).map(v=>[v.key,v.name])),...Object.fromEntries(Object.entries(KEEPERS).map(([k,v])=>[k,v.name])),amir:'Amir',nur:'Nur',recording:'Rakaman kaset'};
export function speakerName(key,state) {return key==='player'||key===state.who?state.name:PEOPLE[key]||key||'Pekan Seri Kenangan';}
export function normalizeLine(line,fallback,state) {
  let speaker=typeof line==='object'?line.speaker:fallback,text=typeof line==='object'?line.text:line;
  const prefix=/^([^:]+):\s*(.*)$/s.exec(text);
  const resolve=value=>Object.keys(PEOPLE).find(k=>k===value||PEOPLE[k]===value)||({'Mak':'zaitun','Ibu':'aminah'}[value])||value;
  if(prefix && Object.values(PEOPLE).includes(prefix[1])){speaker=resolve(prefix[1]);text=prefix[2];}
  speaker=resolve(speaker);if(speaker==='player')speaker=state.who;
  return {speaker,name:speakerName(speaker,state),text:text.replaceAll('{name}',state.name)};
}
export function showPortrait(element,key,name='') {
  const p=PORTRAITS[key];element.hidden=!p;element.removeAttribute('style');
  if(!p){element.removeAttribute('aria-label');return;}
  element.setAttribute('role','img');element.setAttribute('aria-label',`Potret ${name||PEOPLE[key]}`);
  element.style.backgroundImage=`url("${p.src}")`;
  element.style.backgroundSize=`${p.width/p.size*100}% ${p.height/p.size*100}%`;
  element.style.backgroundPosition=`${p.x/(p.width-p.size)*100}% ${p.y/(p.height-p.size)*100}%`;
}

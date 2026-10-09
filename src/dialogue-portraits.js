import { NPCS, RESIDENTS, KEEPERS } from './cast.js?v=2.14.1';
import { CROWD } from './crowds.js?v=2.14.1';
// Circular face windows use the 40 character source sheets without changing them.
// Extra townsfolk use their own game-model heads, rendered once for the UI.
export const PORTRAITS = {
  amir: {"src":"./assets/characters/amir-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  nur: {"src":"./assets/characters/nur-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  faiz: {"src":"./assets/characters/faiz-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  meiling: {"src":"./assets/characters/meiling-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  rahman: {"src":"./assets/characters/rahman-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  din: {"src":"./assets/characters/din-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  lim: {"src":"./assets/characters/lim-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  ros: {"src":"./assets/characters/ros-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  farid: {"src":"./assets/characters/farid-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  man: {"src":"./assets/characters/man-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  ita: {"src":"./assets/characters/ita-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":25,"y":745,"size":270},
  salleh: {"src":"./assets/characters/salleh-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  hassan: {"src":"./assets/characters/hassan-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  pakmat: {"src":"./assets/characters/pakmat-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  nenek: {"src":"./assets/characters/nenek-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  atuk: {"src":"./assets/characters/atuk-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  zaitun: {"src":"./assets/characters/zaitun-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  mail: {"src":"./assets/characters/mail-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  salmah: {"src":"./assets/characters/salmah-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  rohani: {"src":"./assets/characters/rohani-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  kamal: {"src":"./assets/characters/kamal-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  timah: {"src":"./assets/characters/timah-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  ismail: {"src":"./assets/characters/ismail-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  aminah: {"src":"./assets/characters/aminah-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":25,"y":745,"size":270},
  lina: {"src":"./assets/characters/lina-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  abu: {"src":"./assets/characters/abu-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  yati: {"src":"./assets/characters/yati-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  faizal: {"src":"./assets/characters/faizal-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  kiah: {"src":"./assets/characters/kiah-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":25,"y":745,"size":270},
  ani: {"src":"./assets/characters/ani-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  hani: {"src":"./assets/characters/hani-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  muthu: {"src":"./assets/characters/muthu-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  hussin: {"src":"./assets/characters/hussin-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  normah: {"src":"./assets/characters/normah-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  kumar: {"src":"./assets/characters/kumar-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  jah: {"src":"./assets/characters/jah-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  azura: {"src":"./assets/characters/azura-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  hafiz: {"src":"./assets/characters/hafiz-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  karim: {"src":"./assets/characters/karim-sheet.png?v=2.14.1","width":1536,"height":1024,"x":20,"y":680,"size":300},
  usop: {"src":"./assets/characters/usop-sheet.jpg?v=2.14.1","width":1536,"height":1024,"x":15,"y":720,"size":285},
  senah: {"src":"./assets/portraits/senah-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  jalil: {"src":"./assets/portraits/jalil-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  midah: {"src":"./assets/portraits/midah-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  esah: {"src":"./assets/portraits/esah-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  rozita: {"src":"./assets/portraits/rozita-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  som: {"src":"./assets/portraits/som-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  adam: {"src":"./assets/portraits/adam-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  hakim: {"src":"./assets/portraits/hakim-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  aisyah: {"src":"./assets/portraits/aisyah-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  keong: {"src":"./assets/portraits/keong-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  siti: {"src":"./assets/portraits/siti-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  ravi: {"src":"./assets/portraits/ravi-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  seman: {"src":"./assets/portraits/seman-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  daud: {"src":"./assets/portraits/daud-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  rashid: {"src":"./assets/portraits/rashid-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256},
  gayah: {"src":"./assets/portraits/gayah-head.png?v=2.14.1","width":256,"height":256,"x":0,"y":0,"size":256}
};
export const PEOPLE = {...Object.fromEntries(Object.entries(CROWD).map(([k,v])=>[k,v.name])),...Object.fromEntries(Object.entries(NPCS).map(([k,v])=>[k,v.name])),...Object.fromEntries(Object.values(RESIDENTS).map(v=>[v.key,v.name])),...Object.fromEntries(Object.entries(KEEPERS).map(([k,v])=>[k,v.name])),amir:'Amir',nur:'Nur',recording:'Rakaman kaset'};
export function speakerName(key,state) {return key==='player'||key===state.who?state.name:PEOPLE[key]||key||'Pekan Seri Kenangan';}
export function normalizeLine(line,fallback,state) {
  let speaker=typeof line==='object'?line.speaker:fallback,text=typeof line==='object'?line.text:line;
  const prefix=/^([^:]+):\s*(.*)$/s.exec(text);
  const resolve=value=>value==='mother'?(state.who==='nur'?'aminah':'zaitun'):Object.keys(PEOPLE).find(k=>k===value||PEOPLE[k]===value)||({'Mak':'zaitun','Ibu':'aminah'}[value])||value;
  if(prefix && Object.values(PEOPLE).includes(prefix[1])){speaker=resolve(prefix[1]);text=prefix[2];}
  speaker=resolve(speaker);if(speaker==='player')speaker=state.who;
  return {speaker,name:speakerName(speaker,state),text:text.replaceAll('{name}',state.name)};
}
export function showPortrait(element,key,name='') {
  const p=PORTRAITS[key];element.hidden=!p;element.removeAttribute('style');
  if(!p){element.removeAttribute('aria-label');element.removeAttribute('role');return;}
  element.setAttribute('role','img');element.setAttribute('aria-label',`Potret ${name||PEOPLE[key]}`);
  element.style.backgroundImage=`url("${p.src}")`;
  element.style.backgroundSize=`${p.width/p.size*100}% ${p.height/p.size*100}%`;
  element.style.backgroundPosition=`${p.width===p.size?0:p.x/(p.width-p.size)*100}% ${p.height===p.size?0:p.y/(p.height-p.size)*100}%`;
}

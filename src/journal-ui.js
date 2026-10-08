import { discoveredMemories, chapterTasks, chapterNext, deliveryTasks, deliveryNext, gameTasks } from './journal.js?v=2.9.1';
import { el, taskChecklist, memoryQuestCard } from './nostalgia-ui.js?v=2.9.1';
import { itemThumbnail } from './item-ui.js?v=2.9.1';
import { rm, level, itemLabel } from './economy.js?v=2.9.1';
import { NPCS } from './cast.js?v=2.9.1';
import { STEPS, CHAPTER } from './story.js?v=2.9.1';
import { DAM_QUESTS } from './dam-progress.js?v=2.9.1';
import { GASING_QUESTS } from './gasing-progress.js?v=2.9.1';
import { TAMIYA_QUESTS } from './tamiya-progress.js?v=2.9.1';
const art=(src,alt)=>{const img=el('img','journal-art');img.src=src;img.alt=alt;img.width=64;img.height=64;return img;};
const button=(label,fn)=>{const b=el('button','secondary',label);b.type='button';b.onclick=fn;return b;};
const empty=(title,text)=>{const box=el('div','journal-empty');box.append(art('./assets/items/bukuskrap.svg','Buku skrap'),el('h3','',title),el('p','',text));return box;};
export function renderQuestJournal(root,{eco,state,guide,placeName,inspect,actions,navigate,cancel}){
 const ids=discoveredMemories(eco),active=ids.filter(id=>eco.nostalgia.quests[id].stage!=='earned'),earned=ids.filter(id=>eco.nostalgia.quests[id].stage==='earned');
 const stats=el('div','journal-stats');stats.append(el('span','',`Duit ${rm(eco.wallet)}`),el('span','',`✓ ${eco.done.length} delivery`),el('span','',`${ids.length} kisah ditemui`));
 const tabs=[...document.querySelectorAll('#book-tabs [role=tab]')];
 function appendGames(parent){
  const grid=el('div','journal-grid');let count=0;
   for(const [key,title,image,quests] of [['congkak','Congkak','./assets/items/guli.svg',[]],['dam','Dam Haji','./assets/dam-jaguh.svg',DAM_QUESTS],['gasing','Gasing','./assets/gasing-jaguh.svg',GASING_QUESTS],['tamiya','Tamiya','./assets/tamiya-jaguh.svg',TAMIYA_QUESTS]]){
    const p=eco[key];if(!p.played&&!p.match&&!p.round)continue;count++;const card=el('article','journal-game'),heading=el('div','journal-heading'),copy=el('div','journal-copy');copy.append(el('h3','',title),el('p','journal-next',`${p.won} menang · ${p.played} main`));heading.append(art(image,title),copy);card.append(heading);
    if(p.match&&!p.match.over||p.round&&p.round.phase!=='result')card.append(el('small','journal-tag','Permainan disimpan · Boleh sambung'));
    if(quests.length){const tasks=gameTasks(key,p,quests),d=el('details','journal-details');d.open=tasks.some(t=>!t.done);d.append(el('summary','',`Task · ${tasks.filter(t=>t.done).length}/${tasks.length} siap`),taskChecklist(tasks,placeName));card.append(d);card.append(button('Tunjuk arah · permainan',()=>navigate(`npc:${key==='dam'?'din':key==='gasing'?'atuk':'faiz'}`)));}grid.append(card);
   }
  if(count){parent.append(el('h3','journal-section-title','Cabaran permainan yang ditemui'),grid);}return count;
 }
 function select(name,focus=false){
  root.replaceChildren(stats);root.id='book-content';root.setAttribute('aria-labelledby','book-tab-'+name);
  for(const tab of tabs){const selected=tab.dataset.tab===name;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();}
  if(name==='tasks'){
   const chapter=el('article','journal-chapter'),copy=el('div','journal-copy'),next=chapterNext(guide,eco,placeName);copy.append(el('small','journal-kicker',CHAPTER),el('h3','',guide.title),el('p','journal-next',next.text));
   chapter.append(art('./assets/items/bukulatihan.svg','Buku latihan'),copy);
   if(guide.questId){const q=active.includes(guide.questId)?eco.nostalgia.quests[guide.questId]:null;if(q)copy.append(el('small','journal-tag','Ikut kisah yang ditanda Untuk pameran di bawah.'));}
   if(!guide.questId||guide.step<8||guide.step>11)copy.append(taskChecklist(chapterTasks(guide,eco,placeName),placeName));
   if(next.route)copy.append(button('Tunjuk arah · langkah seterusnya',()=>navigate(next.route)));
   root.append(chapter);
   if(guide.step>0){const history=el('details','journal-history');history.append(el('summary','','✓ Perjalanan setakat ini'));const list=el('ul','journal-history-list');for(let i=0;i<guide.step;i++)list.append(el('li','','✓ '+STEPS[i].title));history.append(list);root.append(history);}
   const grid=el('div','journal-grid');grid.id='book-memories';
   for(const j of eco.jobs){const card=el('article','journal-delivery');card.dataset.job=j.id;const heading=el('div','journal-heading'),copy=el('div','journal-copy');copy.append(el('small','journal-kicker',`Delivery · Upah ${rm(j.upah)}`),el('h3','',itemLabel(j.item,j.qty)),el('p','journal-next',deliveryNext(j,placeName).text));heading.append(itemThumbnail(j.item,inspect),copy);card.append(heading);
    const tasks=deliveryTasks(j),details=el('details','journal-details');details.open=true;details.append(el('summary','',`Task · ${tasks.filter(t=>t.done).length}/${tasks.length} siap`),taskChecklist(tasks,placeName));
    card.append(button('Tunjuk arah · langkah seterusnya',()=>navigate(deliveryNext(j,placeName).route)));
    card.append(el('small','journal-tag',`Laluan tawaran ${Math.round(j.route)} m · ${j.route>=60?'Layak untuk laluan 60 m+':'Kurang daripada 60 m'}`));
    if(j.status==='accepted')details.append(button('Batal delivery',()=>cancel(j.id)));else details.append(el('small','',j.left===j.stops.length?`Pulangkan ke ${placeName(j.from)} jika mahu batal.`:'Delivery sudah bermula. Selesaikan semua hentian; kerja ini tidak boleh dibatalkan.'));card.append(details);grid.append(card);}
   for(const id of active)grid.append(memoryQuestCard(id,eco,actions));root.append(grid);
   appendGames(root);
   if(!active.length&&!eco.jobs.length)root.append(empty('Cerita bermula di pekan','Jumpa penduduk. Dengar cerita mereka. Buku akan simpan tugas yang kau terima.'));
  }else if(name==='memories'){
   const grid=el('div','journal-grid');grid.id='book-keepsakes';for(const id of earned)grid.append(memoryQuestCard(id,eco,actions));root.append(grid);
   if(!earned.length)root.append(empty('Ruang untuk kenangan','Kenangan yang kau peroleh akan disimpan di sini, bersama ceritanya.'));
  }else{
   const count=appendGames(root);
   const friends=Object.keys(NPCS).filter(key=>eco.friends[key]>0||eco.talked[key]);
   if(friends.length){root.append(el('h3','journal-section-title','Kawan yang ditemui'));const people=el('div','journal-friends');for(const key of friends){const person=el('div','journal-friend'),copy=el('div');copy.append(el('b','',NPCS[key].name),el('small','',level(eco.friends[key]||0)));person.append(el('span','journal-avatar',NPCS[key].name.split(' ').map(s=>s[0]).slice(0,2).join('')),copy);people.append(person);}root.append(people);}
   if(!count&&!friends.length)root.append(empty('Kenali pekan','Kawan dan permainan yang kau temui akan dicatat di sini.'));
  }
  root.scrollTop=0;
 }
 for(const [i,tab] of tabs.entries()){tab.onclick=()=>select(tab.dataset.tab);tab.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();select(tabs[next].dataset.tab,true);};}
 select('tasks');return select;
}

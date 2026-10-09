import { discoveredMemories, chapterTasks, chapterNext, deliveryTasks, deliveryNext, gameTasks } from './journal.js?v=2.15.0';
import { el, taskChecklist, memoryQuestCard } from './nostalgia-ui.js?v=2.15.0';
import { itemThumbnail } from './item-ui.js?v=2.15.0';
import { rm, level, itemLabel } from './economy.js?v=2.15.0';
import { NPCS } from './cast.js?v=2.15.0';
import { STEPS, DONE, CHAPTER, CHAPTER_IDS, discoveredClues, discoveredEvidence, availableScenes, investigationChoices } from './story.js?v=2.15.0';
import { DAM_QUESTS } from './dam-progress.js?v=2.15.0';
import { GASING_QUESTS } from './gasing-progress.js?v=2.15.0';
import { TAMIYA_QUESTS } from './tamiya-progress.js?v=2.15.0';
const button=(label,fn)=>{const b=el('button','secondary',label);b.type='button';b.onclick=fn;return b;};
const empty=(title,text)=>{const n=el('div','journal-empty');n.append(el('h3','',title),el('p','',text));return n;};
const fold=(label,body)=>{const d=el('details','journal-details');d.append(el('summary','',label),body);return d;};
export function renderQuestJournal(root,{eco,state,guide,placeName,inspect,actions,navigate,cancel,deduce}) {
 const ids=discoveredMemories(eco),active=ids.filter(id=>!CHAPTER_IDS.includes(id)&&eco.nostalgia.quests[id].stage!=='earned'),earned=ids.filter(id=>eco.nostalgia.quests[id].stage==='earned');
 const tabs=[...document.querySelectorAll('#book-tabs [role=tab]')];
 function games(parent) {
  const grid=el('div','journal-grid');
  for(const [key,title,quests] of [['congkak','Congkak',[]],['dam','Dam Haji',DAM_QUESTS],['gasing','Gasing',GASING_QUESTS],['tamiya','Tamiya',TAMIYA_QUESTS]]) {
   const p=eco[key];if(!p.played&&!p.match&&!p.round)continue;
   const card=el('article','journal-game');card.append(el('h3','',title),el('p','',`${p.played} main · ${p.won} menang`));
   if(quests.length)card.append(fold('Cabaran & hadiah',taskChecklist(gameTasks(key,p,quests),placeName)));
   card.append(button('Pergi bermain ↗',()=>navigate(`npc:${{congkak:'nenek',dam:'din',gasing:'atuk',tamiya:'faiz'}[key]}`)));grid.append(card);
  }
  parent.append(grid);
 }
 function select(name,focus=false) {
  root.replaceChildren();root.setAttribute('aria-labelledby','book-tab-'+name);
  for(const tab of tabs){const yes=tab.dataset.tab===name;tab.setAttribute('aria-selected',String(yes));tab.tabIndex=yes?0:-1;if(yes&&focus)tab.focus();}
  const stats=el('div','journal-stats');stats.append(el('span','',rm(eco.wallet)),el('span','',`✓ ${eco.done.length} delivery`),el('span','',`▧ ${earned.length} kenangan`));root.append(stats);
  if(name==='tasks') {
   const next=chapterNext(guide,eco,placeName),card=el('article','journal-chapter');
   card.append(el('small','journal-kicker',guide.step===DONE?'CHAPTER 1 SELESAI':CHAPTER),el('h3','',guide.title),el('p','journal-next',next.text));
   if(typeof guide.target==='string')card.append(el('p','journal-destination',NPCS[guide.target]?.name||guide.target));
   if(next.route)card.append(button('Tunjuk arah ↗',()=>navigate(next.route)));
   const current=STEPS[guide.step];
   if(guide.step<DONE)card.append(fold('Checklist langkah ini',taskChecklist(chapterTasks(guide,eco,placeName),placeName)));
   if(current.game)card.append(el('p','journal-tag','Tak wajib menang · Peralatan boleh dipinjam'));
   if(current.investigation){
    card.append(el('p','journal-tag','Tanya tentang petunjuk · boleh cuba lagi'));
    const list=el('ul','journal-clues');
    for(const clue of discoveredEvidence(eco))list.append(el('li','',clue.title+' — '+clue.text));
    card.append(fold('Semak petunjuk yang ditemui',list));
   }
   if(eco.chapter.completed.includes('S06')&&!eco.chapter.completed.includes('S22')){
    const evidence=el('section','evidence-book');evidence.append(el('h3','','Kad petunjuk yang ditemui'));
    for(const hearsay of [true,false]){const list=el('ul','journal-clues');for(const e of discoveredEvidence(eco).filter(e=>e.hearsay===hearsay))list.append(el('li','',e.title+' · '+e.type+' — '+e.text));evidence.append(fold(hearsay?'Dakwaan belum disahkan':'Rekod dan keterangan · baca hadnya',list));}card.append(evidence);
    for(const scene of availableScenes(eco).filter(s=>s.deduction)){
     const block=el('section','deduction-card');block.dataset.deduction=scene.deduction.id;block.append(el('h3','',scene.title));
     const checks=el('fieldset','evidence-picker');checks.append(el('legend','','Pilih kad sokongan'));
     for(const e of discoveredEvidence(eco)){const l=el('label',''),i=el('input','');i.type='checkbox';i.value=e.id;l.append(i,document.createTextNode(e.title));checks.append(l);}block.append(checks);
     const feedback=el('p','deduction-feedback');feedback.setAttribute('role','status');
     for(const answer of investigationChoices(eco,scene))block.append(button(answer.title,()=>{const proof={answer:answer.id,cards:[...checks.querySelectorAll('input:checked')].map(i=>i.value)};if(!deduce(scene,proof))feedback.textContent='Kad atau rumusan belum sepadan. Baca semula had keterangan; boleh cuba lagi tanpa denda.';}));block.append(feedback);card.append(block);
    }
    const branches=el('p','journal-tag');branches.textContent='Tiga soalan: alibi Faiz, perjalanan kotak, asal stok. Urutan pilihan kamu. Rumusan boleh dibuat di sini tanpa kembali ke balai raya.';card.append(branches);
   }
   const relations=el('section','relationship-progress');if(eco.chapter.completed.includes('R03'))relations.append(el('p','',`Digimon · latihan tiga trek ${eco.chapter.trainingTracks.length}/3 selesai (tidak wajib menang).`));if(eco.chapter.completed.includes('R04'))relations.append(el('p','','Charizard · jumpa Johnny. Dua kad pendua biasa diperlukan; beli pek kad sehingga ada sekurang-kurangnya tiga dalam koleksi.'));
   if(eco.chapter.completed.includes('R05'))relations.append(el('p','',`Tamagotchi · jumpa Cikgu Hani dua hari berbeza. ${eco.chapter.haniDay?'Lawatan pertama: hari '+eco.chapter.haniDay:'Lawatan pertama belum selesai'}.`));card.append(relations);
   root.append(card);
   const grid=el('div','journal-grid');
   for(const job of eco.jobs) {
    const c=el('article','journal-delivery'),next=deliveryNext(job,placeName);c.dataset.job=job.id;
    const head=el('div','journal-heading'),copy=el('div','journal-copy');copy.append(el('small','journal-kicker',`Upah ${rm(job.upah)}`),el('h3','',itemLabel(job.item,job.qty)),el('p','journal-next',next.text));head.append(itemThumbnail(job.item,inspect),copy);c.append(head,button('Tunjuk arah ↗',()=>navigate(next.route)));
    const tasks=deliveryTasks(job),details=fold(`✓ ${tasks.filter(t=>t.done).length}/${tasks.length} langkah`,taskChecklist(tasks,placeName));
    if(job.status==='accepted')details.append(button('Batal pesanan',()=>cancel(job.id)));else details.append(el('p','',job.left===job.stops.length?`Boleh pulangkan ke ${placeName(job.from)}.`:'Selesaikan semua hentian.'));
    c.append(details);grid.append(c);
   }
   for(const id of active){const content=memoryQuestCard(id,eco,actions);grid.append(fold('Kisah sampingan · '+content.querySelector('h3').textContent,content));}
   root.append(grid);
   if(guide.step>0){const list=el('ul','journal-history-list');for(const s of STEPS.filter(s=>eco.chapter.completed.includes(s.id)))list.append(el('li','','✓ '+s.title));root.append(fold(`Perjalanan · ${guide.step}/${DONE} selesai`,list));}
  } else if(name==='memories') {
   const grid=el('div','journal-grid');
   for(const id of earned){const c=el('article','journal-memory'),copy=el('div','journal-copy'),e=eco.nostalgia.earned[id];c.dataset.nostalgia=id;copy.append(el('h3','',CHAPTER_IDS.includes(id)?STEPS.find(s=>s.reward===id||s.rewards?.includes(id))?.title:'Kenangan penduduk'),el('p','',e.giver));const head=el('div','journal-heading');head.append(itemThumbnail(id,inspect),copy);c.append(head,button('Lihat kenangan',()=>inspect(id)));grid.append(c);}
   root.append(grid);if(!earned.length)root.append(empty('Kenangan belum ditemui','Barang yang kau peroleh akan muncul di sini.'));
   const clues=discoveredClues(eco);if(clues.length){const list=el('ul','journal-clues');for(const clue of clues)list.append(el('li','',clue));root.append(fold(`Petunjuk yang ditemui · ${clues.length}`,list));}
  } else {
   games(root);
   const people=el('div','journal-friends');for(const key of Object.keys(NPCS).filter(key=>eco.friends[key]>0||eco.talked[key])){const c=el('div','journal-friend');c.append(el('b','',NPCS[key].name),el('span','',level(eco.friends[key]||0)));people.append(c);}root.append(people);
  }
  root.scrollTop=0;
 }
 for(const [i,tab] of tabs.entries()){tab.onclick=()=>select(tab.dataset.tab);tab.onkeydown=e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(tabs[n].dataset.tab,true);};}
 select('tasks');return select;
}

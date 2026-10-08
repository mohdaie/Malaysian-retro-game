import { ITEMS } from './economy.js?v=2.10.0';
import { NOSTALGIA_QUESTS, clueRequirement } from './nostalgia-quests.js?v=2.10.0';
import { itemThumbnail } from './item-ui.js?v=2.10.0';
import { memoryJournal, memoryNext } from './journal.js?v=2.10.0';
import { DONE } from './story.js?v=2.10.0';
export const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
export function taskChecklist(tasks,placeName){
 const list=el('ul','task-checklist');
 for(const task of tasks){
  const li=el('li',task.done?'task-done':'task-pending');li.dataset.task=task.id;
  const mark=el('span','task-mark',task.done?'✓':'○');mark.setAttribute('role','checkbox');mark.setAttribute('aria-checked',String(task.done));mark.setAttribute('aria-readonly','true');mark.setAttribute('aria-label',task.label);
  const label=el('span','task-label');label.append(el('span','',task.place?`${task.label} · ${placeName(task.place)}`:task.label));if(task.detail)label.append(el('small','task-instruction',task.detail));if(task.places?.length)label.append(el('small','task-instruction','Sudah dihantar: '+task.places.map(placeName).join(', ')));const count=el('small','task-count',`${task.current}/${task.total}${task.done?' ✓':''}`);
  li.append(mark,label,count);list.append(li);
 }
 return list;
}
export function memoryQuestCard(id,eco,{placeName,inspect,context,start,clue,claim,navigate,chapter,clock={},delivery}){
 const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id],journal=memoryJournal(eco,id);
 const giverHere=context&&(q.npc?context.npc===q.npc:context.place===q.place&&!context.npc);
 if(!p&&!giverHere)return null;
 const card=el('article','memory-quest journal-memory');card.dataset.nostalgia=id;card.dataset.stage=p?.stage||'conversation';
 const heading=el('div','journal-heading'),copy=el('div','journal-copy');let image;
 if(p?.stage==='earned')image=itemThumbnail(id,inspect);
 else{image=el('div','journal-art');const img=el('img');img.src='./assets/items/notis.svg';img.alt='Catatan cerita';img.width=64;img.height=64;image.append(img);}
 copy.append(el('small','journal-kicker',p?.stage==='earned'?q.giver:`Kisah ${q.giver}`),el('h3','',p?.stage==='earned'?ITEMS[id].title:q.title));heading.append(image,copy);card.append(heading);
 const actions=el('div','memory-actions');
 const button=(label,fn,primary=false)=>{const b=el('button',primary?'primary':'secondary',label);b.type='button';b.onclick=fn;actions.append(b);};
 if(!p){card.append(el('p','conversation-intro',q.intro));button('Terima tugas',()=>start(id),true);card.append(actions);return card;}
 if(chapter?.focus===id&&chapter.step>=7&&chapter.step<DONE){card.dataset.chapterFocus='true';card.append(el('small','journal-tag','Untuk pameran · Chapter 1'));}
 card.append(el('small','journal-tag',journal.phase));const next=memoryNext(eco,id,placeName,clock);card.append(el('p','journal-next',next.text));if(p.stage==='grind')card.append(el('p','journal-rule','Kiraan bermula selepas Terima tugas. Semua syarat yang disenaraikan mesti siap; satu delivery boleh memenuhi beberapa syarat.'));if(p.stage==='challenge')card.append(el('p','journal-rule','Kemenangan yang layak sejak Terima tugas sudah dikira. Habiskan cabaran yang masih kosong.'));
 const progress=el('progress','journal-progress');progress.max=1;progress.value=journal.progress;progress.setAttribute('aria-label',journal.phase+' progress');card.append(progress);
 const details=el('details','journal-details');details.open=p.stage!=='earned';details.append(el('summary','',`Task · ${journal.done}/${journal.tasks.length} siap`),taskChecklist(journal.tasks,placeName));card.append(details);
 if(p.stage!=='earned'){const notes=el('details','journal-notes');notes.append(el('summary','','Catatan yang ditemui'),el('p','',journal.note));card.append(notes);}
 if(['grind','challenge'].includes(p.stage))button('Tunjuk arah · langkah seterusnya',()=>navigate(next.route),true);
 if(p.stage==='trail'){
  const requirement=clueRequirement(eco,id,clock),step=q.trail[p.trail];
  if(step.delivery){
    if(context?.place===journal.nextPlace&&!eco.jobs.some(j=>j.story===step.delivery.story))button('Terima parcel khas',()=>delivery(id),true);
    else button('Tunjuk arah · langkah seterusnya',()=>navigate(next.route),true);
  }else if(context?.place===journal.nextPlace){
    if(requirement.ok)button('Baca petunjuk',()=>clue(id),true);
    else card.append(el('p','journal-rule',requirement.text));
  }else button('Tunjuk arah',()=>navigate(`place:${journal.nextPlace}`));
 }
 if(p.stage==='ready'){
  if(giverHere){card.append(el('p','journal-next','Pilih dedikasi keepsake:'));q.choices.forEach((choice,i)=>button(choice.label,()=>claim(id,i),true));}
  else button(`Jumpa ${q.giver}`,()=>navigate(q.npc?`npc:${q.npc}`:`place:${q.place}`),true);
 }
 if(p.stage==='earned'){
  button('Lihat kenangan',()=>inspect(id));
  if(chapter?.exhibition?.id===id)card.append(el('small','journal-tag',`✓ Dikongsi di pameran · Hari ${chapter.exhibition.day}`));
  else if(chapter?.step>=6&&chapter.step<DONE)button('Kongsi dengan Pak Salleh',()=>navigate('npc:salleh'),true);
 }
 card.append(actions);return card;
}

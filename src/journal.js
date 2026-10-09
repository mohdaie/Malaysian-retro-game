// Only accepted stories and already revealed clues enter the book.
import { NOSTALGIA_QUESTS, LONG_ROUTE, clueRequirement } from './nostalgia-quests.js?v=2.12.0';
import { itemLabel, rm } from './economy.js?v=2.12.0';
export const discoveredMemories = eco => Object.keys(NOSTALGIA_QUESTS).filter(id => eco.nostalgia.quests[id]);
const phases={grind:'Bantu penduduk',trail:'Jejak petunjuk',challenge:'Menang cabaran',ready:'Jumpa semula pemberi',earned:'Kenangan diperoleh'};
export const TRACK_NAMES={oval:'Oval',eight:'Selekoh Lapan',jaguh:'Jaguh'};
const row=(id,label,current,total,extra={})=>({id,label,current:Math.min(current,total),total,done:current>=total,...extra});
const giverRoute=q=>q.npc?`npc:${q.npc}`:`place:${q.place}`;
const challengeRoute=c=>`npc:${{congkak:'nenek',dam:'din',gasing:'atuk',tamiya:'faiz'}[c.game]}`;
function challengeTask(c,i,p){
 const labels={congkak:'Menang congkak dengan Nenek',dam:`Kalahkan Pak Din dalam Dam Haji${c.level?' · '+c.level[0].toUpperCase()+c.level.slice(1):''}`,gasing:`Kalahkan ${c.opponent==='atuk'?'Atuk':'Faiz'} dalam gasing`,tamiya:'Dapat tempat pertama dalam Tamiya'};
 const instructions={congkak:'Jumpa Nenek → Main congkak. Menang diperlukan; seri atau kalah tidak dikira.',dam:`Jumpa Pak Din → Main Dam Haji → pilih ${c.level?c.level[0].toUpperCase()+c.level.slice(1):'kesukaran yang diberi'}. Menang pada kesukaran lain tidak memenuhi tugas ini.`,gasing:`Jumpa ${c.opponent==='atuk'?'Atuk':'Faiz'} → Main gasing → pilih ${c.opponent==='atuk'?'Cabaran Atuk':'Lawan Faiz'}. Tamat dengan putaran lebih lama daripada lawan.`,tamiya:'Jumpa Faiz atau Mei Ling di padang → Main Tamiya · Jom Dash! → pilih track → tamat race di tempat pertama. Kereta pinjaman boleh digunakan.'};
 return row('win-'+i,c.tracks?c.label:labels[c.game],p.wins[i]||0,c.count,{detail:instructions[c.game]+(c.tracks?` Track wajib: ${c.tracks.map(t=>TRACK_NAMES[t]).join(', ')}.`:''),route:challengeRoute(c)});
}
export function memoryTasks(eco,id){
 const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];if(!q||!p)return [];
 const rows=[
  row('deliveries','Selesaikan delivery',p.deliveries,q.grind.deliveries,{detail:'Delivery work / Requests → Accept → Collect atau Buy for → Deliver parcel di semua hentian. Satu kerja lengkap dikira sekali; sekadar Talk atau ambil parcel belum siap.'}),
  row('destinations','Hantar ke destinasi berbeza',p.destinations.length,q.grind.destinations,{detail:'Pilih kerja ke bangunan berlainan. Destinasi yang sama dikira sekali sahaja. Semua hentian kerja mesti selesai sebelum direkod.',places:[...p.destinations]}),
  row('long',`Selesaikan delivery dengan laluan ${LONG_ROUTE} m+`,p.long,q.grind.long,{detail:`Pilih tawaran yang menunjukkan jarak ${LONG_ROUTE} m atau lebih, kemudian siapkan kerja itu. Jarak tawaran digunakan; berjalan berpusing tidak menambah kiraan.`})
 ].filter(t=>t.total>0);
 if(p.stage==='grind')return rows;
 for(let i=0;i<p.trail;i++)rows.push(row('clue-'+i,q.trail[i].label||`Baca petunjuk ${i+1}`,1,1,{place:q.trail[i].place}));
 if(p.stage==='trail'){
  const step=q.trail[p.trail],job=step.delivery&&eco.jobs.find(j=>j.story===step.delivery.story);
  rows.push(row('clue-'+p.trail,step.label||`Baca petunjuk ${p.trail+1}`,0,1,{place:step.place,detail:step.delivery?step.delivery.note+' Buka Ada kisah untuk dicerita → Terima parcel khas; Collect di pengirim dan Deliver parcel di semua hentian. Tugas ditanda selesai hanya selepas penghantaran terakhir.':`Di lokasi ini, buka Ada kisah untuk dicerita → Baca petunjuk. Sampai atau Talk sahaja tidak menanda tugas siap.${step.waitDays?' Datang pada hari game berikutnya selepas petunjuk sebelumnya; tidur di rumah selepas Maghrib.':''}${step.afterMinute?' Acara bermula 19:00, boleh datang pada mana-mana hari.':''}`,route:job?deliveryNext(job,n=>String(n)).route:`place:${step.place}`}));return rows;
 }
 for(const [i,c] of q.challenges.entries()){
  rows.push(challengeTask(c,i,p));
  if(c.tracks)for(const t of c.tracks)rows.push(row('track-'+t,`Tempat pertama · ${TRACK_NAMES[t]}`,p.tracks.includes(t)?1:0,1,{detail:'Setiap track mesti dimenangi. Mengulang track yang sama tidak melengkapkan track lain.',route:challengeRoute(c)}));
 }
 rows.push(row('claim',`Terima keepsake daripada ${q.giver}`,p.stage==='earned'?1:0,1,{place:q.npc?undefined:q.place,detail:`Jumpa ${q.giver} → Ada kisah untuk dicerita → pilih satu dedikasi. Ganjaran diberi selepas pilihan dibuat.`,route:giverRoute(q)}));
 return rows;
}
export function deliveryTasks(job){
 const picked=job.status==='carrying',finished=job.stops.length-job.left;
 return [row('pickup',`${job.kind==='purchase'?'Beli':'Ambil'} ${itemLabel(job.item,job.qty)}`,picked?1:0,1,{place:job.from,detail:job.kind==='purchase'?`Tekan Buy for pada pesanan ini. Bayar ${rm(job.cost)}; kos dipulangkan bersama upah selepas kerja selesai.`:'Tekan Collect pada pesanan ini. Parcel mesti masuk ke beg sebelum dihantar.',route:`place:${job.from}`}),...job.stops.map((place,i)=>row('stop-'+i,`Hantar ${itemLabel(job.item,job.stops.length>1?1:job.qty)}${job.stops.length>1?` · hentian ${i+1}/${job.stops.length}`:''}`,i<finished?1:0,1,{place,detail:'Ikut urutan hentian. Buka penerima / pintu bangunan → Deliver parcel. Sekadar sampai belum selesai.',route:`place:${place}`}))];
}
export function deliveryNext(job,placeName){
 const task=deliveryTasks(job).find(t=>!t.done);
 return {text:`${task.label} di ${placeName(task.place)} → ${job.status==='accepted'?(job.kind==='purchase'?'Buy for':'Collect'):'Deliver parcel'}.`,route:task.route};
}
export function memoryNext(eco,id,placeName,clock={}){
 const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];if(!q||!p)return null;
 if(p.stage==='grind')return eco.jobs.length?deliveryNext(eco.jobs[0],placeName):{text:'Jumpa Pak Rahman → Delivery work → Accept satu kerja. Kemudian Collect / Buy for dan Deliver parcel. Semua syarat delivery yang disenaraikan mesti siap.',route:'npc:rahman'};
 if(p.stage==='trail'){
  const step=q.trail[p.trail],requirement=clueRequirement(eco,id,clock);
  if(step.delivery){const job=eco.jobs.find(j=>j.story===step.delivery.story);if(job)return deliveryNext(job,placeName);
   return {text:`${step.delivery.note} Pergi ke ${placeName(step.place)} → Ada kisah untuk dicerita → Terima parcel khas.`,route:`place:${step.place}`};}
  return {text:(!requirement.ok?requirement.text+' ':'')+`Pergi ke ${placeName(step.place)} → Ada kisah untuk dicerita → Baca petunjuk.`,route:`place:${step.place}`};
 }
 if(p.stage==='challenge'){
  const tasks=memoryTasks(eco,id),task=tasks.find(t=>!t.done&&t.id!=='claim');
  return {text:task.detail+(task.id.startsWith('track-')?` Pilih track ${task.label.split(' · ')[1]}.`:''),route:task.route};
 }
 if(p.stage==='ready')return {text:`Jumpa ${q.giver}${q.npc?'':` di ${placeName(q.place)}`} → Ada kisah untuk dicerita → pilih satu dedikasi untuk menerima keepsake.`,route:giverRoute(q)};
 return {text:'Keepsake diterima. Ceritanya boleh dikongsi dengan Pak Salleh di balai raya.',route:'npc:salleh'};
}
export function memoryJournal(eco,id){
 const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];if(!q||!p)return null;
 const tasks=memoryTasks(eco,id);
 const targets=[['deliveries',p.deliveries],['destinations',p.destinations.length],['long',p.long]].filter(([key])=>q.grind[key]>0);
 const progress=p.stage==='grind'?targets.reduce((n,[key,value])=>n+Math.min(value/q.grind[key],1),0)/targets.length:p.stage==='trail'?p.trail/q.trail.length:p.stage==='challenge'?q.challenges.reduce((n,c,i)=>n+Math.min((p.wins[i]||0)/c.count,c.tracks?c.tracks.filter(t=>p.tracks.includes(t)).length/c.tracks.length:1),0)/q.challenges.length:1;
 return {id,title:q.title,giver:q.giver,stage:p.stage,phase:phases[p.stage],progress,tasks,done:tasks.filter(t=>t.done).length,nextPlace:p.stage==='trail'?q.trail[p.trail].place:null,note:p.trail>0?q.trail[p.trail-1].clue:q.intro};
}
export const CHAPTER_BRIEFS=['Jumpa Faiz atau Mei Ling di padang dan habiskan dialog.','Pak Rahman → Delivery work → Accept pesanan gula untuk Nenek.','Collect gula di Pak Rahman → Rumah Tok → Deliver parcel.','Nenek → Requests → Accept teh → Pak Rahman → Buy for → Nenek → Deliver parcel.','Nenek → Main congkak. Habiskan satu pusingan; tidak wajib menang.','Uncle Lim → Buy → beli satu collectible, seperti guli atau pelekat.','Pak Salleh → Chapter 1 · Prepare Pameran Kenangan. Habiskan dialog.','Teroka pekan → Ada kisah untuk dicerita → Terima tugas. Talk sahaja belum menerima tugas.','Siapkan semua syarat delivery dalam Buku → Tugasan.','Di lokasi petunjuk → Ada kisah untuk dicerita → Baca petunjuk.','Menang cabaran dengan lawan, kesukaran dan track yang ditetapkan.','Jumpa pemberi kisah → Ada kisah untuk dicerita → pilih dedikasi.','Pak Salleh → Share at Pameran Kenangan → habiskan dialog.','Chapter 1 siap. Teruskan kisah lain yang kau temui.'];
export function chapterTasks(guide,eco,placeName){
 const step=guide.step,job=eco.jobs.find(j=>j.story===(step===2?'first-parcel':'tea'));
 if((step===2||step===3)&&job)return deliveryTasks(job);
 if(step===8&&guide.questId)return memoryTasks(eco,guide.questId).filter(t=>['deliveries','destinations','long'].includes(t.id));
 if(step>=9&&step<=11&&guide.questId)return memoryTasks(eco,guide.questId).filter(t=>!t.done);
 const route=typeof guide.target==='string'&&guide.target!=='job'?`npc:${guide.target}`:guide.target?.place?`place:${guide.target.place}`:step===3?'npc:nenek':null;
 const text=step===2&&!job?'Pak Rahman → Delivery work → Accept semula pesanan gula untuk Nenek.':CHAPTER_BRIEFS[step];
 return [row('chapter-'+step,text,step===13?1:0,1,{route})];
}
export function chapterNext(guide,eco,placeName){
 if([2,3].includes(guide.step)){
  const job=eco.jobs.find(j=>j.story===(guide.step===2?'first-parcel':'tea'));
  if(job)return deliveryNext(job,placeName);
 }
 if(guide.step>=8&&guide.step<=11&&guide.questId)return memoryNext(eco,guide.questId,placeName);
 const task=chapterTasks(guide,eco,placeName).find(t=>!t.done);
 return {text:task?.label||CHAPTER_BRIEFS[guide.step],route:task?.route||null};
}
export function chapterBrief(guide,eco,placeName){
 if(guide.step===8&&guide.questId){const q=NOSTALGIA_QUESTS[guide.questId],p=eco.nostalgia.quests[guide.questId];return `${p.deliveries}/${q.grind.deliveries} delivery · ${Math.min(p.destinations.length,q.grind.destinations)}/${q.grind.destinations} destinasi · ${p.long}/${q.grind.long} laluan ${LONG_ROUTE} m+. Lihat Buku → Tugasan.`;}
 return chapterNext(guide,eco,placeName).text;
}

// These achievements are revealed only after the player tries the game.
export function gameTasks(key,progress,quests){
 const instructions={
  dam:{practice:'Pak Din → Main Dam Haji → Belajar. Habiskan perlawanan tanpa resign; tidak wajib menang.',haji:'Dalam Dam Haji, bawa satu buah merah ke baris paling hujung untuk menjadi Haji.',santai:'Pak Din → Main Dam Haji → Santai. Kalahkan Pak Din.',jaguh:'Pak Din → Main Dam Haji → Jaguh. Kalahkan Pak Din untuk lencana.'},
  gasing:{lesson:'Atuk → Main gasing → Belajar dengan Atuk. Habiskan pusingan.',stable:'Habiskan putaran sekurang-kurangnya 20 saat dengan kestabilan sekurang-kurangnya 85%. Power hampir 78%, Lepas! hampir tengah.',faiz:'Faiz → Main gasing → Lawan Faiz. Putaran kau mesti lebih lama.',atuk:'Atuk → Main gasing → Cabaran Atuk. Putaran kau mesti lebih lama untuk lencana.'},
  tamiya:{first:'Faiz / Mei Ling → Main Tamiya · Jom Dash! Habiskan race tiga lap; tidak wajib menang.',faiz:'Habiskan race Tamiya lebih awal daripada Faiz; tidak wajib kalahkan Mei Ling.',meiling:'Habiskan race Tamiya lebih awal daripada Mei Ling; tidak wajib kalahkan Faiz.',jaguh:'Dapat tempat pertama pada Oval, Selekoh Lapan dan Jaguh. Setiap track mesti dimenangi untuk lencana.'}
 };
 const rows=quests.map(q=>row(key+'-'+q.id,q.title,progress.claimed?.includes(q.id)?1:0,1,{detail:instructions[key][q.id],route:`npc:${key==='dam'?'din':key==='gasing'?'atuk':'faiz'}`}));
 if(key==='tamiya')for(const [track,name] of Object.entries(TRACK_NAMES))rows.push(row('town-track-'+track,'Tempat pertama · '+name,progress.wins.includes(track)?1:0,1));
 return rows;
}

// A record of discoveries. Future quests, clues and prizes stay hidden.
import { NOSTALGIA_QUESTS } from './nostalgia-quests.js?v=2.7.1';
export const discoveredMemories = eco => Object.keys(NOSTALGIA_QUESTS).filter(id => eco.nostalgia.quests[id]);
const phases={grind:'Bantu penduduk',trail:'Jejak petunjuk',challenge:'Menang cabaran',ready:'Jumpa semula pemberi',earned:'Kenangan diperoleh'};
const games={congkak:'Congkak',dam:'Dam Haji',gasing:'Gasing',tamiya:'Tamiya'};
const row=(id,label,current,total,extra={})=>({id,label,current:Math.min(current,total),total,done:current>=total,...extra});
export function memoryTasks(eco,id){
 const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];if(!q||!p)return [];
 if(p.stage==='grind')return [row('deliveries','Delivery siap',p.deliveries,q.grind.deliveries),row('destinations','Destinasi berbeza',p.destinations.length,q.grind.destinations),row('long','Laluan jauh · 60 m+',p.long,q.grind.long)];
 const rows=[row('trust','Bantuan penduduk selesai',1,1)];
 if(p.stage==='trail'){
  for(let i=0;i<p.trail;i++)rows.push(row('clue-'+i,'Petunjuk dibaca',1,1,{place:q.trail[i].place}));
  rows.push(row('clue-'+p.trail,'Petunjuk seterusnya',0,1,{place:q.trail[p.trail].place}));return rows;
 }
 rows.push(row('trail','Jejak cerita selesai',1,1));
 for(const [i,c] of q.challenges.entries()){
  rows.push(row('win-'+i,`${games[c.game]}${c.level?' · Jaguh':c.opponent?' · Atuk':''}`,p.wins[i]||0,c.count));
  if(c.tracks)for(const t of c.tracks)rows.push(row('track-'+t,{oval:'Track Oval',eight:'Track Lapan',jaguh:'Track Jaguh'}[t],p.tracks.includes(t)?1:0,1));
 }
 if(['ready','earned'].includes(p.stage))rows.push(row('claim','Terima keepsake',p.stage==='earned'?1:0,1));
 return rows;
}
export function memoryJournal(eco,id){
 const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id];if(!q||!p)return null;
 const tasks=memoryTasks(eco,id);
 const progress=p.stage==='grind'?(Math.min(p.deliveries/q.grind.deliveries,1)+Math.min(p.destinations.length/q.grind.destinations,1)+Math.min(p.long/q.grind.long,1))/3:p.stage==='trail'?p.trail/q.trail.length:p.stage==='challenge'?q.challenges.reduce((n,c,i)=>n+Math.min((p.wins[i]||0)/c.count,c.tracks?p.tracks.length/c.tracks.length:1),0)/q.challenges.length:1;
 return {id,title:q.title,giver:q.giver,stage:p.stage,phase:phases[p.stage],progress,tasks,done:tasks.filter(t=>t.done).length,nextPlace:p.stage==='trail'?q.trail[p.trail].place:null,note:p.trail>0?q.trail[p.trail-1].clue:q.intro};
}
export const CHAPTER_BRIEFS=['Jumpa kawan di padang.','Ambil kerja Pak Rahman.','Hantar bungkusan Nenek.','Belikan teh untuk Nenek.','Main congkak dengan Nenek.','Beli collectible di kedai.','Dengar rancangan Pak Salleh.','Teroka pekan. Dengar cerita penduduk.','Bantu penduduk untuk kisah ini.','Ikut petunjuk yang kau jumpa.','Selesaikan cabaran yang diberi.','Jumpa semula pemberi kisah.','Kongsi kisah di balai raya.','Pameran Kenangan siap.'];
export function deliveryTasks(job){
 const picked=job.status==='carrying',finished=job.stops.length-job.left;
 return [row('pickup','Ambil bungkusan',picked?1:0,1,{place:job.from}),...job.stops.map((place,i)=>row('stop-'+i,'Hantar bungkusan',i<finished?1:0,1,{place}))];
}

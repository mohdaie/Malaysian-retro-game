import { NPCS, RESIDENTS } from './cast.js?v=2.14.0';
import { CROWD } from './crowds.js?v=2.14.0';
import { CHAPTER, STEPS, DONE, STORY_REVISION, CHAPTER_IDS, REWARD_STORIES, tamiyaUnlocked, EVIDENCE, DEDUCTIONS, CHAPTER_JOBS, CROWD_HOMES, meets, hasChapterFlag } from './chapter-data.js?v=2.14.0';
import { DIALOGUE } from './chapter-dialogue.js?v=2.14.0';
export { CHAPTER, STEPS, DONE, STORY_REVISION, CHAPTER_IDS, REWARD_STORIES, tamiyaUnlocked };
export const PLAYERS={amir:{name:'Amir',home:1,parent:'Mak',parentPlace:1},nur:{name:'Nur',home:11,parent:'Ibu',parentPlace:11}};
export const MILESTONES=Object.fromEntries(STEPS.filter(s=>s.lines&&NPCS[s.target]).map(s=>[s.on,[s.target]]));
export const STORY_EVENTS=Object.fromEntries(CHAPTER_JOBS.map(j=>['c1-'+j.id,j.id]));
export const advance=(step,event)=>STEPS[step]?.on===event?step+1:step;
export const availableScenes=eco=>STEPS.filter(s=>s.lines&&!hasChapterFlag(eco,s.id)&&meets(eco,s.requires)&&s.id!=='S26');
export const discoveredEvidence=eco=>EVIDENCE.filter(e=>eco.chapter.evidence.includes(e.id));
export const discoveredClues=eco=>discoveredEvidence(eco).map(e=>(e.hearsay?'Dakwaan · ':'Disemak · ')+e.text);
export function investigationChoices(eco,scene){
 if(!scene?.deduction||!availableScenes(eco).includes(scene))return [];
 const d=scene.deduction;return [d.wrong[0],d.answer,d.wrong[1]].map((text,i)=>({id:i===1?d.id:'wrong'+i,title:text,text}));
}
export const canInvestigate=(eco,scene,proof)=>!!scene?.deduction&&availableScenes(eco).includes(scene)&&proof?.answer===scene.deduction.id&&Array.isArray(proof.cards)&&proof.cards.every(id=>eco.chapter.evidence.includes(id))&&scene.requires.every(id=>Array.isArray(id)?id.some(k=>proof.cards.includes(k)):proof.cards.includes(id));
export function grantChapterReward(eco,id,player,day){
 if(eco.nostalgia.earned[id]||eco.collection[id])return false;
 const r=REWARD_STORIES[id];if(!r)return false;
 eco.nostalgia.quests[id]={pacing:2,stage:'earned',deliveries:0,destinations:[],long:0,trail:0,wins:{},tracks:[]};
 eco.nostalgia.earned[id]={choice:0,day,player,giver:r.giver,inscription:r.memory,chapter:STORY_REVISION};eco.collection[id]=1;return true;
}
export function completeChapterStep(eco,event,player,day,proof){
 const s=STEPS.find(s=>s.on===event);
 if(!s)return false;
 if(s.delivery){if(!hasChapterFlag(eco,s.id))return false;syncChapter(0,eco);return true;}
 if(s.game||s.tournament){syncChapter(0,eco);return false;}
 if(hasChapterFlag(eco,s.id)||!meets(eco,s.requires)||s.investigation&&!canInvestigate(eco,s,proof))return false;
 eco.chapter.completed.push(s.id);
 for(const id of s.evidenceIds||[])if(!eco.chapter.evidence.includes(id))eco.chapter.evidence.push(id);
 if(s.id==='S04')eco.chapter.baseline=eco.tamiya.played;
 if(s.id==='S25')grantChapterReward(eco,'nostalgia_T01',player,day);
 syncChapter(0,eco);return true;
}
export function syncChapter(_step,eco){
 const c=eco.chapter;
 if(hasChapterFlag(eco,'S04')&&!hasChapterFlag(eco,'training')&&eco.tamiya.played>c.baseline&&eco.tamiya.round?.phase==='result'&&eco.tamiya.round.settled)c.completed.push('training');
 if(c.tournamentWon&&!c.completed.includes('tournament'))c.completed.push('tournament');
 if(hasChapterFlag(eco,'S25')){c.step=DONE;return DONE;}
 const active=eco.jobs.find(j=>j.story?.startsWith('c1-D'));
 if(active){c.step=STEPS.findIndex(s=>s.delivery?.story===active.story);return c.step;}
 c.step=STEPS.findIndex(s=>!['S11A','S11O','S18','S18B','S26'].includes(s.id)&&s.id!=='free'&&!hasChapterFlag(eco,s.id)&&meets(eco,s.requires));
 if(c.step<0)c.step=STEPS.findIndex(s=>s.id==='S06');return c.step;
}
export function jobDefinition(eco,tag){
 const j=CHAPTER_JOBS.find(j=>'c1-'+j.id===tag);if(!j)return null;
 const from=j.id==='D01'?PLAYERS[eco.chapter.who].home:j.fromPlace;
 return {...j,from,stops:j.stops||[j.to]};
}
export function storyOffers(_step,eco,gap=()=>0){
 if(eco.jobs.some(j=>j.story?.startsWith('c1-')))return [];
 return CHAPTER_JOBS.filter(j=>!hasChapterFlag(eco,j.id)&&!eco.chapter.paid.includes(j.id)&&meets(eco,j.requires)).map(j=>{
 const d=jobDefinition(eco,'c1-'+j.id),stops=[...d.stops];
 return {id:'C1-'+j.id,story:'c1-'+j.id,kind:'parcel',requester:d.from,from:d.from,to:j.to,stops,item:j.item,qty:1,cost:0,upah:j.upah,note:j.note,route:Math.round(stops.reduce((n,p,i)=>n+gap(i?stops[i-1]:d.from,p),0))};
 });
}
const matches=(eco,s,place,npc)=>s.target==='mother'?place===PLAYERS[eco.chapter.who].home&&!npc:NPCS[s.target]?npc===s.target||!npc&&['S21','S22','S23','S25'].includes(s.id)&&place===s.place:CROWD_HOMES[s.target]?npc===s.target||!npc&&place===CROWD_HOMES[s.target]:place===s.place&&(!npc||npc===s.target);
export function storiesAt(eco,place,npc){
 const list=availableScenes(eco).filter(s=>matches(eco,s,place,npc));
 if(hasChapterFlag(eco,'S25')&&!hasChapterFlag(eco,'S26')&&place===6)list.push(STEPS.find(s=>s.id==='S26'));
 return list;
}
export const storyAt=(eco,place,npc)=>storiesAt(eco,place,npc)[0]||null;
export function sceneLines(eco,scene){
 let lines=scene.lines;
 if(scene.id==='S16')lines=[...lines.slice(0,8),...DIALOGUE[hasChapterFlag(eco,'E11')?'S16A':'S16B'],...lines.slice(8)];
 return lines.map(l=>({...l,speaker:l.speaker==='mother'?eco.chapter.who==='nur'?'aminah':'zaitun':l.speaker}));
}
export function chapterGuide(step,eco){
 const current=syncChapter(step,eco),s=STEPS[current];let target=s.target,route=null,action=s.text;
 if(s.target==='mother')target={place:PLAYERS[eco.chapter.who].home};
 else if(CROWD_HOMES[s.target])target={place:CROWD_HOMES[s.target]};
 else if(typeof target==='string'&&!NPCS[target])target={place:s.place};
 if(s.delivery){
 const d=jobDefinition(eco,s.delivery.story),j=eco.jobs.find(j=>j.story===s.delivery.story),place=j?j.status==='accepted'?j.from:j.stops[j.stops.length-j.left]:d.from;
 target={place,job:!!j};action=`${j?j.status==='accepted'?'Collect · Ambil':'Deliver parcel · Hantar':'Accept · Terima'} ${d.name} · Upah RM ${(d.upah/100).toFixed(2)}`;
 }else if(s.investigation){target=null;action=s.title+' Buka Buku → Rumusan bukti.';}
 else if(s.lines)action='Sambung cerita';
 if(current===DONE){const j=eco.jobs[0];if(j){target={place:j.status==='accepted'?j.from:j.stops[j.stops.length-j.left],job:true};action=j.status==='accepted'?'Collect · Ambil pesanan seterusnya':'Deliver parcel · Hantar pesanan seterusnya';}else{target='rahman';action='Cari delivery atau kerja hubungan baharu';}}
 if(target)route=typeof target==='string'?`npc:${target}`:`place:${target.place}`;
 const phase=current===DONE?'TEROKA PEKAN':hasChapterFlag(eco,'S22')?'KEJOHANAN SEKOLAH':hasChapterFlag(eco,'S20')?'SEMAKAN BERSAMA':hasChapterFlag(eco,'S06')?'SEMAK TIGA LALUAN':'KENAL PEKAN';
 // Investigation keeps the question visible until the player requests a hint.
 if(hasChapterFlag(eco,'S06')&&!hasChapterFlag(eco,'S20')&&!s.delivery&&!s.deduction){action=({S07:'Di mana Faiz ketika stok terakhir hilang?',S08:'Adakah masa saksi sepadan dengan rekod?',S09J:'Adakah pemilik beg sama dengan pembawanya?',S09L:'Apa yang saksi ini benar-benar lihat?',S10:'Adakah kotak itu pesanan untuk rumah Salmah?',S11R:'Apa pesanan rasmi pada petang itu?',S11T:'Ke arah mana kotak bergerak?',S12:'Siapa yang dikenali, dan bila?',S13:'Boleh waktu hentian disahkan?',S13K:'Apa masa pada resit yang sama?',S14:'Dari mana alat ganti itu datang?',S16:'Adakah stok kurang mempunyai rekod jualan?',S17:'Apa yang boleh diperiksa dengan izin?'})[s.id]||s.title;target=null;route=null;}
 const progress=STEPS.filter(s=>s.id!=='free'&&hasChapterFlag(eco,s.id)).length/(STEPS.length-1);
 return {step:current,title:current===DONE?'Apa seterusnya?':s.title,text:s.text,target,phase,action,route,progress,questId:null,connection:'Catat yang dilihat, asingkan yang didengar.'};
}
export function chapterHint(eco){
 const s=STEPS[syncChapter(0,eco)],level=Math.min(3,(eco.chapter.hints[s.id]||0)+1);eco.chapter.hints[s.id]=level;
 const name=NPCS[s.target]?.name||CROWD[s.target]?.name||Object.values(RESIDENTS).find(r=>r.key===s.target)?.name||'penerima';
 const text=level===1?s.deduction?.hint||'Semak apa yang benar-benar dilihat dan apa yang boleh disokong oleh catatan.':level===2?`Tanya ${name} tentang ${s.title.toLowerCase()}.`:`Pergi ke bangunan #${s.target==='mother'?PLAYERS[eco.chapter.who].home:s.place||s.delivery?.from} → ${s.deduction?'Rumusan bukti dalam Buku':'Sambung cerita'}.`;
 return {text,route:level===3?(NPCS[s.target]?`npc:${s.target}`:`place:${s.place||s.delivery?.from}`):null,level};
}
export function claimRelationship(eco,id,player,day,options={}){
 const requirements={nostalgia_G04:['R01'],nostalgia_M02:['R02'],nostalgia_G02:['R03'],nostalgia_P05:['R04'],nostalgia_G03:['R05']};
 if(!requirements[id]||!meets(eco,requirements[id]))return {ok:false,reason:'delivery'};
 if(id==='nostalgia_G02'&&eco.chapter.trainingTracks.length<3)return {ok:false,reason:'tracks'};
 if(id==='nostalgia_G03'&&(!eco.chapter.haniDay||day<=eco.chapter.haniDay))return {ok:false,reason:'day'};
 if(id==='nostalgia_P05'){
 const cards=options.cards;if(!Array.isArray(cards)||cards.length!==2||cards.some(k=>k!=='kad')||(eco.collection.kad||0)<3||options.confirm!==true)return {ok:false,reason:'duplicates'};
 if(eco.nostalgia.earned[id]||eco.collection[id])return {ok:false,reason:'owned'};
 for(const k of cards)eco.collection[k]--;
 }
 return {ok:grantChapterReward(eco,id,player,day)};
}
export const EXHIBITION_STORIES=Object.fromEntries(Object.entries(REWARD_STORIES).map(([id,r])=>[id,r.story]));
export const EXHIBITION_LINKS=EXHIBITION_STORIES;
export const chapterKeepsake=eco=>CHAPTER_IDS.find(id=>eco.nostalgia.earned[id])||null;
export const cleanExhibition=()=>null;
export const shareKeepsake=()=>({ok:false});

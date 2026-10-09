import { DIALOGUE } from './chapter-dialogue.js?v=2.15.0';
import { CHAPTER_JOBS } from './chapter-jobs.js?v=2.15.0';
import { EVIDENCE, DEDUCTIONS } from './chapter-evidence.js?v=2.15.0';
export { EVIDENCE, DEDUCTIONS, CHAPTER_JOBS };
export const STORY_REVISION = 3;
export const CHAPTER = 'CHAPTER 01 · KAWAN SEBELUM GARIS PENAMAT';
export const CROWD_HOMES = { hakim:17, keong:18, ravi:5 };
const chat=(id,target,place,requires,evidence=[])=>({id,title:({S01:'Pesan dari beranda',S02:'Buku kecil Pak Rahman',S03:'Beranda dan congkak',S04:'Geng padang',S05:'Rak yang kosong',S06:'Kawan yang menawarkan bantuan',S07:'Kantin selepas loceng',S08:'Masa pada buku persiapan',S09J:'Beg yang dipinjam',S09L:'Menunggu di kantin',S10:'Bungkusan di bangku Salmah',S11R:'Catatan pesanan Rahman',S11A:'Penerima dan pembawa',S11T:'Kotak selepas hujan',S11O:'Had keterangan Rohani',S12:'Pak Karim membetulkan ingatan',S13:'Masa pada kertas',S13K:'Sahkan waktu hentian',S14:'Label di celah kereta',S15:'Faiz, resit dan rasa malu',S16:'Apa yang keluar dari kedai?',S17:'Kotak persiapan sekolah',S18:'Sebelum membuat keputusan',S18B:'Meja semakan',S20:'Cerita yang semakin sempit',S21:'Orang yang paling membantu',S22:'Betulkan nama',S23:'Daftar dan bina kereta',S25:'Kotak Magnum',S26:'Pekan masih ada cerita'})[id],target,place,requires,evidenceIds:evidence,lines:DIALOGUE[id],on:id,text:'Habiskan perbualan. Progress disimpan selepas dialog selesai.'});
const sceneData=[
 chat('S01','mother',1,[]),chat('S02','rahman',22,['D01']),chat('S03','nenek',2,['D02']),
 chat('S04','faiz',15,['D03']),
 {id:'training',title:'Latihan pertama',target:'faiz',place:15,requires:['S04'],game:'tamiya',on:'training',text:'Habiskan satu race tiga lap. Kereta pinjaman percuma; tidak wajib menang.'},
 chat('S05','lim',25,['training'],['E01','E02']),chat('S06','hakim',17,['D04']),
 chat('S07','ros',30,['S06'],['E03']),chat('S08','farid',29,['E03'],['E04']),chat('S09J','keong',18,['E04'],['E05']),chat('S09L','ravi',5,['E03','E04'],['E06']),
 chat('S10','salmah',4,['S06'],['E07','E08']),chat('S11R','rahman',22,['E08'],['E09']),chat('S11A','abu',13,['E07','E09']),chat('S11T','timah',7,['D09'],['E10']),chat('S11O','rohani',5,['E07']),
 chat('S12','karim',35,['E10'],['E11']),chat('S13','din',37,['E11']),chat('S13K','karim',35,['D11','S13'],['E12']),
 chat('S14','man',36,['S06'],['E13']),chat('S15','faiz',15,['D13'],['E17']),chat('S16','lim',25,['E01','E13'],['E14']),chat('S17','farid',29,['E11','E12','E13','E14'],['E15','E16']),
 chat('S18','atuk',8,['D15']),chat('S18B','salleh',32,['D16']),
 ...DEDUCTIONS.map(d=>({id:'deduce'+d.id,title:d.title,target:'salleh',place:32,requires:d.requires,investigation:{evidence:d.id,prompt:d.title},lines:[{speaker:'player',text:d.answer}],on:'deduce'+d.id,text:d.title,deduction:d})),
 chat('S20','hakim',17,['deduceA','deduceB','deduceC',...Array.from({length:16},(_,i)=>'D'+String(i+1).padStart(2,'0'))],['E18']),
 chat('S21','salleh',32,['S20','D17'],['E19']),chat('S22','rahman',22,['D18']),chat('S23','farid',29,['S22','D19']),
 {id:'tournament',title:'Tiga trek, lima peserta',target:'faiz',place:15,requires:['S23'],tournament:true,on:'tournamentWon',text:'Daftar kejohanan di padang. Juara keseluruhan diperlukan. Kalah boleh ulang percuma; kes kekal selesai.'},
 chat('S25','salleh',32,['D20']),chat('S26','kamal',6,['S25'])
];
const jobStep=j=>({id:j.id,title:j.name,target:{place:j.fromPlace},requires:j.requires,on:j.id,text:j.note,delivery:{id:'C1-'+j.id,story:'c1-'+j.id,kind:'parcel',requester:j.fromPlace,from:j.fromPlace,to:j.to,stops:j.stops||[j.to],item:j.item,qty:j.stops?j.stops.length:1,cost:0,upah:j.upah,note:j.note},job:j});
export const STEPS=[...sceneData,...CHAPTER_JOBS.filter(j=>j.id[0]==='D').map(jobStep),{id:'free',title:'Petang masih milik kamu',target:'rahman',text:'Teruskan delivery, latihan dan kisah hubungan. Chapter 2 belum dibuka.',on:null}];
export const DONE=STEPS.length-1;
export const CHAPTER_IDS=['nostalgia_G04','nostalgia_M02','nostalgia_G02','nostalgia_P05','nostalgia_G03','nostalgia_T01'];
export const REWARD_STORIES={
 nostalgia_G04:{giver:'Faiz',title:'Satu lagi Walkman',story:'Walkman utama Faiz pulang selepas dibaiki. Faiz memberikan Walkman simpanannya selepas kain bengkel dan nota penjagaan dipulangkan.',memory:'Hadiah simpanan Faiz selepas menjaga barang pinjaman.'},
 nostalgia_M02:{giver:'Faiz',title:'Album yang dipinjam',story:'Album pinjaman Johnny dipulangkan. Hadiah ini salinan kedua Faiz, bukan album yang sedang dipinjam.',memory:'Salinan kedua, dengan cerita kerja sekolah sebelum hafal lagu.'},
 nostalgia_G02:{giver:'Faiz',title:'Bateri dan Digimon',story:'Selepas membantu Loges mendapatkan bateri dan menamatkan latihan tiga trek, Faiz memberikan Digimon simpanannya.',memory:'Tiga trek dicuba; satu kawan kecil perlu dijaga.'},
 nostalgia_P05:{giver:'Johnny',title:'Kad pendua Johnny',story:'Komik dipulangkan dan dua kad pendua biasa ditukar dengan persetujuan kedua-dua pihak. Charizard ialah kad pendua Johnny.',memory:'Pertukaran disemak Mei Ling dan dipersetujui Johnny.'},
 nostalgia_G03:{giver:'Cikgu Hani',title:'Benda kecil yang perlu dijaga',story:'Selepas penghantaran alat tulis dan dua lawatan pada hari berbeza, Hani memberikan Tamagotchi simpanannya.',memory:'Ingat datang semula, bukan memberi makan sekali kemudian lupa.'},
 nostalgia_T01:{giver:'Uncle Lim',title:'Kotak Magnum',story:'Hadiah juara keseluruhan kejohanan sekolah: tiga trek dan lima peserta, selepas kes barang kedai diselesaikan.',memory:'Kereta hasil usaha sendiri, kawan sebelum garis penamat.'}
};
export const hasChapterFlag=(eco,id)=>(eco.chapter?.completed||[]).includes(id)||(eco.chapter?.evidence||[]).includes(id)||id==='tournamentWon'&&eco.chapter?.tournamentWon;
export const meets=(eco,req=[])=>req.every(id=>Array.isArray(id)?id.some(k=>hasChapterFlag(eco,k)):hasChapterFlag(eco,id));
export const tamiyaUnlocked=eco=>hasChapterFlag(eco,'S04');
export const TAMIYA_UNLOCK_STEP=STEPS.findIndex(s=>s.id==='training');
export const newChapter=()=>({revision:STORY_REVISION,step:0,baseline:0,who:'amir',completed:[],evidence:[],paid:[],hints:{},trainingTracks:[],haniDay:0,tournamentWon:false});
export function cleanChapter(v){
 const c=newChapter();if(!v||v.revision!==STORY_REVISION)return c;
 const allowed=[...STEPS.map(s=>s.id),...CHAPTER_JOBS.map(j=>j.id)];
 c.completed=Array.isArray(v.completed)?[...new Set(v.completed.filter(id=>allowed.includes(id)))]:[];
 c.evidence=Array.isArray(v.evidence)?[...new Set(v.evidence.filter(id=>EVIDENCE.some(e=>e.id===id)))]:[];
 c.paid=Array.isArray(v.paid)?[...new Set(v.paid.filter(id=>CHAPTER_JOBS.some(j=>j.id===id)))]:[];
 for(const id of c.paid)if(!c.completed.includes(id))c.completed.push(id);
 c.trainingTracks=Array.isArray(v.trainingTracks)?[...new Set(v.trainingTracks.filter(t=>['oval','eight','jaguh'].includes(t)))]:[];
 c.tournamentWon=v.tournamentWon===true;c.who=v.who==='nur'?'nur':'amir';
 if(Number.isInteger(v.haniDay)&&v.haniDay>0&&v.haniDay<=1e6)c.haniDay=v.haniDay;
 if(Number.isInteger(v.baseline)&&v.baseline>=0&&v.baseline<=1e6)c.baseline=v.baseline;
 for(const [id,n]of Object.entries(v.hints||{}))if(allowed.includes(id)&&Number.isInteger(n)&&n>=0&&n<=3)c.hints[id]=n;
 c.step=Number.isInteger(v.step)&&v.step>=0&&v.step<=DONE?v.step:0;return c;
}
export function markChapterDelivery(eco,job){
 const id=job.story?.replace(/^c1-/,'');if(!CHAPTER_JOBS.some(j=>j.id===id))return;
 if(!eco.chapter.completed.includes(id))eco.chapter.completed.push(id);
 if(!eco.chapter.paid.includes(id))eco.chapter.paid.push(id);
}

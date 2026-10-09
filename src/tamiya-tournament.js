// Tournament state is separate from practice and is saved with every race/pit.
export const ENTRANTS=['player','faiz','hakim','keong','ravi'];
export const ROUND_TRACKS=['oval','eight','jaguh'];
export const RACER_NAMES={player:'Kamu',faiz:'Faiz',hakim:'Badrul',keong:'Johnny',ravi:'Logeswaran',meiling:'Mei Ling'};
const POINTS=[5,3,2,1,0];
export const newTournament=()=>({nextRun:1,run:null,winnerPaid:false,lossPaid:0,lastPaidDay:0});
export function tournamentTable(run){
 const rows=ENTRANTS.map(key=>({key,points:0,time:0}));
 for(const round of run?.rounds||[])round.results.forEach((r,i)=>{const v=rows.find(v=>v.key===r.key);v.points+=r.dnf?0:POINTS[i];v.time+=r.dnf?600:r.time;});
 return rows.sort((a,b)=>b.points-a.points||a.time-b.time||ENTRANTS.indexOf(a.key)-ENTRANTS.indexOf(b.key));
}
export function cleanTournament(v){
 const p=newTournament();if(!v||typeof v!=='object')return p;
 if(Number.isInteger(v.nextRun)&&v.nextRun>0&&v.nextRun<=1e9)p.nextRun=v.nextRun;
 p.winnerPaid=v.winnerPaid===true;p.lossPaid=Number.isInteger(v.lossPaid)?Math.max(0,Math.min(3,v.lossPaid)):0;
 p.lastPaidDay=Number.isInteger(v.lastPaidDay)&&v.lastPaidDay>0&&v.lastPaidDay<=1e6?v.lastPaidDay:0;
 const r=v.run;if(!r||!Number.isInteger(r.id)||r.id<1||!['active','result','tiebreak'].includes(r.phase)||!Array.isArray(r.rounds)||r.rounds.length>3)return p;
 const results=a=>Array.isArray(a)&&a.length===5&&new Set(a.map(x=>x?.key)).size===5&&a.every(x=>ENTRANTS.includes(x?.key)&&Number.isFinite(x.time)&&x.time>0&&x.time<=3600&&typeof x.dnf==='boolean');
 if(r.rounds.some((x,i)=>x?.track!==ROUND_TRACKS[i]||!Number.isInteger(x.race)||x.race<1||!results(x.results)))return p;
 if(r.phase==='active'&&r.rounds.length>=3||r.phase!=='active'&&r.rounds.length!==3)return p;
 p.run={id:r.id,phase:r.phase,rounds:r.rounds.map(x=>({track:x.track,race:x.race,results:x.results.map(y=>({...y}))})),ties:Array.isArray(r.ties)?r.ties.filter(x=>ENTRANTS.includes(x)):[],winner:ENTRANTS.includes(r.winner)?r.winner:null,settled:r.settled===true,tiebreaks:Number.isInteger(r.tiebreaks)?Math.max(0,Math.min(1e6,r.tiebreaks)):0};
 if(r.phase==='result'&&!p.run.winner)return newTournament();p.nextRun=Math.max(p.nextRun,r.id+1);return p;
}
export function startTournament(eco){
 if(!eco.chapter.completed.includes('S23'))throw Error('Daftar dengan Cikgu Farid dahulu');
 const p=eco.tamiya.tournament;if(p.run&&p.run.phase!=='result')return p.run;
 if(eco.tamiya.round&&eco.tamiya.round.phase!=='result')throw Error('Sambung atau tamatkan latihan dahulu');
 p.run={id:p.nextRun++,phase:'active',rounds:[],ties:[],winner:null,settled:false,tiebreaks:0};return p.run;
}
export const nextTournamentTrack=eco=>eco.tamiya.tournament.run?.phase==='tiebreak'?'eight':ROUND_TRACKS[eco.tamiya.tournament.run?.rounds.length||0];
export function settleTournamentRace(eco,round,plans,day=1){
 const p=eco.tamiya.tournament,r=p.run;
 if(!r||r.phase==='result'||round.tournamentRun!==r.id||r.rounds.some(x=>x.race===round.id))return [];
 const results=plans.map(x=>({key:x.key,time:Number.isFinite(x.duration)?x.duration:600,dnf:!Number.isFinite(x.duration)})).sort((a,b)=>(a.dnf-b.dnf)||a.time-b.time||ENTRANTS.indexOf(a.key)-ENTRANTS.indexOf(b.key));
 if(r.phase==='tiebreak'){
  const top=results.filter(x=>r.ties.includes(x.key));r.tiebreaks++;
  if(top.length>1&&Math.abs(top[0].time-top[1].time)<1e-8)return [];
  r.winner=top[0].key;r.phase='result';
 }else{
  if(round.track!==nextTournamentTrack(eco))return [];
  r.rounds.push({track:round.track,race:round.id,results});
  if(r.rounds.length<3)return [];
  const table=tournamentTable(r),best=table[0];r.ties=table.filter(x=>x.points===best.points&&Math.abs(x.time-best.time)<1e-8).map(x=>x.key);
  if(r.ties.length>1){r.phase='tiebreak';return [];}
  r.winner=best.key;r.phase='result';
 }
 if(r.settled)return [];r.settled=true;let sen=0;
 if(r.winner==='player'){
  eco.chapter.tournamentWon=true;
  if(!p.winnerPaid){sen=300;p.winnerPaid=true;p.lastPaidDay=day;}
  else if(day>p.lastPaidDay){sen=50;p.lastPaidDay=day;}
 }else if(!p.winnerPaid&&p.lossPaid<3){sen=50;p.lossPaid++;}
 else if(p.winnerPaid&&day>p.lastPaidDay){sen=50;p.lastPaidDay=day;}
 eco.wallet+=sen;return sen?[{id:'tournament',title:r.winner==='player'?'Juara kejohanan sekolah':'Penyertaan kejohanan',sen}]:[];
}

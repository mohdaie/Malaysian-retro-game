import { STOCK_BUILD, validBuild } from './tamiya-parts.js?v=2.7.3';
import { dynamicPlan, rivalPlan } from './tamiya-dynamics.js?v=2.7.3';
import { TAMIYA_CARS } from './tamiya-cars.js?v=2.7.3';
export const TAMIYA_TRACKS = {
  oval: { name: 'Oval Pekan', note: 'Beginner · lurus panjang, selekoh lebar', length: 78, segments: [[.25,'straight'],[.25,'bend'],[.25,'straight'],[.25,'bend']], faiz: 'tamiya_burning', meiling: 'tamiya', recommended: 'balanced' },
  eight: { name: 'Selekoh Lapan', note: 'Technical · selekoh rapat, jambatan silang', length: 98, segments: [[.15,'straight'],[.2,'tight'],[.15,'bridge'],[.15,'straight'],[.2,'tight'],[.15,'bend']], faiz: 'tamiya_cannon', faizSetup: 'stable', meiling: 'tamiya_star', recommended: 'stable' },
  jaguh: { name: 'Litar Jaguh', note: 'Expert · lane changer, ramp dan selekoh', length: 108, segments: [[.03,'straight'],[.11,'changer'],[.04,'straight'],[.12,'ramp'],[.2,'tight'],[.18,'straight'],[.12,'ramp'],[.2,'tight']], faiz: 'tamiya_star', meiling: 'tamiya_doll', recommended: 'stable' }
};
export const TAMIYA_SETUPS = {
  fast: { name: 'Laju', speed: 1.15, grip: -15, stability: -17, note: 'Motor laju · risiko tinggi di selekoh & ramp' },
  balanced: { name: 'Seimbang', speed: 1, grip: 0, stability: 0, note: 'Kelajuan dan kawalan seimbang' },
  stable: { name: 'Stabil', speed: .94, grip: 15, stability: 17, note: 'Grip & brek kuat · sesuai track susah' }
};
export const LAPS = 3;
const clamp = n => Math.max(0, Math.min(1,n));
const known=(map,key)=>typeof key==='string'&&Object.hasOwn(map,key);
export const launchMeter = seconds => 1 - Math.abs((seconds % 2 + 2) % 2 - 1);
export const launchQuality = contact => clamp(1 - Math.abs(contact - .5) * 2);

// Parametric track paths shared by the race renderer and thumbnail previews.
export function trackPoint(track, u, lane = 1) {
  if (!known(TAMIYA_TRACKS,track)) throw new Error('Unknown track');
  const point = v => {
    const a = v * Math.PI * 2;
    if(track==='oval'){
      const f=(v%1+1)%1;
      if(f<.25)return {x:-6.4+f*51.2,z:-5.8,y:0};
      if(f<.5){const angle=(f-.25)*Math.PI*4-Math.PI/2;return {x:6.4+5.8*Math.cos(angle),z:5.8*Math.sin(angle),y:0};}
      if(f<.75)return {x:6.4-(f-.5)*51.2,z:5.8,y:0};
      const angle=(f-.75)*Math.PI*4+Math.PI/2;return {x:-6.4+5.8*Math.cos(angle),z:5.8*Math.sin(angle),y:0};
    }
    if (track === 'eight') { const bridge = Math.max(0,1-Math.abs(((v%1+1)%1)-.5)/.14); return { x: 12*Math.sin(a), z: 6.5*Math.sin(a*2), y: 2.7*bridge*bridge*(3-2*bridge) }; }
    const b=Math.max(0,1-Math.abs(v-.23)/.07,1-Math.abs(v-.73)/.07);
    return { x: 12.5*Math.cos(a), z: 6.4*Math.sin(a)+(track==='jaguh'?.9*Math.sin(a*3):0), y: track==='jaguh' ? .8*Math.sin(b*Math.PI/2)**2 : 0 };
  };
  const p=point(u),a=point(u-.0001),b=point(u+.0001),dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),offset=(lane-1)*.86;
  return { x:p.x-dz/len*offset,z:p.z+dx/len*offset,y:p.y,heading:Math.atan2(dx,dz) };
}
export function racerPlan(track, car, setup, contact, key='player') {
  const t=TAMIYA_TRACKS[track],a=TAMIYA_CARS[car],tune=TAMIYA_SETUPS[setup];
  if (!known(TAMIYA_TRACKS,track)||!known(TAMIYA_CARS,car)||!known(TAMIYA_SETUPS,setup)||!Number.isFinite(contact)||contact<0||contact>1) throw new Error('Invalid race setup');
  const quality=launchQuality(contact),grip=Math.min(100,a.grip+tune.grip),stability=Math.min(100,a.stability+tune.stability);
  const vmax=(4.3+a.speed*.071)*tune.speed, stages=[];
  let time=(1-quality)*1.8,distance=0,derails=0;
  if(time)stages.push({from:0,to:0,start:0,end:time,type:'start'});
  for(let lap=0;lap<LAPS;lap++) for(const [fraction,type] of t.segments){
    const len=fraction*t.length,speed=type==='straight'?vmax:type==='ramp'?vmax*(.64+stability*.0028):vmax*(.56+grip*.0041);
    const demand=type==='tight'?78:type==='bend'?43:type==='changer'?58:type==='ramp'?83:0,control=type==='ramp'?stability:grip;
    const excess=demand+(setup==='fast'?12:0)-control;
    if(demand&&excess>11){const penalty=1.1+excess*.065;stages.push({from:distance,to:distance,start:time,end:time+penalty,type:'derail'});time+=penalty;derails++;}
    const duration=len/speed;stages.push({from:distance,to:distance+len,start:time,end:time+duration,type});time+=duration;distance+=len;
  }
  return {key,car,setup,quality,grip,stability,vmax,stages,duration:time,derails};
}
// Jaguh rotates lanes once per lap. The outside return crosses above the
// other two lanes, so all cars traverse all three lanes after three laps.
export function raceTrackPoint(track,u,lane,lap=0,side=0){
  if(track!=='jaguh')return trackPoint(track,u,lane+side);
  const from=(lane+lap)%3,to=(from+1)%3,t=clamp((u-.03)/.11),ease=t*t*(3-2*t);
  const p=trackPoint(track,u,from+(to-from)*ease+side);
  if(from===2&&t>0&&t<1)p.y+=1.6*Math.sin(Math.PI*t)**2;
  return p;
}
const planCache=new Map();
export function racePlans(s){
  const t=TAMIYA_TRACKS[s.track];
  if(s.rules!==2)return [racerPlan(s.track,s.car,s.setup,s.contact),racerPlan(s.track,t.faiz,t.faizSetup||(s.track==='oval'?'fast':'balanced'),.61,'faiz'),racerPlan(s.track,t.meiling,'stable',.525,'meiling')];
  const key=JSON.stringify([s.track,s.car,s.setup,s.contact,s.loadout,s.pits]);if(planCache.has(key))return planCache.get(key);
  const plans=[dynamicPlan(t,s.car,s.setup,s.contact,'player',s.loadout,s.pits,TAMIYA_SETUPS),rivalPlan(t,t.faiz,'faiz',TAMIYA_SETUPS,s.track),rivalPlan(t,t.meiling,'meiling',TAMIYA_SETUPS,s.track)];
  if(planCache.size>=16)planCache.delete(planCache.keys().next().value);planCache.set(key,plans);return plans;
}
export function racerAt(plan,seconds,track){
  const total=TAMIYA_TRACKS[track].length*LAPS,t=Math.max(0,seconds),stage=plan.stages.find(v=>t<v.end),last=plan.stages.at(-1);
  const f=stage?clamp((t-stage.start)/(stage.end-stage.start)):1;
  const distance=stage?stage.from+(stage.to-stage.from)*f:total;
  const energy=stage?.capacity?(stage.chargeStart+(stage.chargeEnd-stage.chargeStart)*f)/stage.capacity:last?.capacity?last.chargeEnd/last.capacity:null;
  return {distance,progress:distance/total,lap:Math.min(LAPS,1+Math.floor(distance/TAMIYA_TRACKS[track].length)),fraction:(distance/TAMIYA_TRACKS[track].length)%1,
    finished:t>=plan.duration,pitting:stage?.type==='pit',section:stage?.section||stage?.type||'finish',speed:stage?.speed||0,charge:energy,setup:stage?.setup||last?.setup||plan.setup,loadout:stage?.loadout||last?.loadout,derailed:stage?.type==='derail',recovery:stage?.type==='derail'?f:0};
}
export function standings(s){return racePlans(s).map(p=>({...p,...racerAt(p,s.elapsed,s.track)})).sort((a,b)=>a.finished&&b.finished?a.duration-b.duration:b.distance-a.distance||a.duration-b.duration);}
export const raceDuration=s=>Math.max(...racePlans(s).map(p=>p.duration))+.5;
export function newTamiyaRound(track,car,setup,id,loadout=STOCK_BUILD){
  if(!validBuild(loadout)||!known(TAMIYA_TRACKS,track)||!known(TAMIYA_CARS,car)||!known(TAMIYA_SETUPS,setup)||!Number.isInteger(id)||id<1)throw new Error('Invalid race');
  return {id,track,car,setup,phase:'ready',elapsed:0,contact:.5,settled:false,rules:2,loadout:{...loadout},pits:[]};
}
export function prepareTamiya(s){if(s.phase!=='ready')throw new Error('Already started');return {...s,phase:'launch',elapsed:0};}
export function launchTamiya(s,contact){if(s.phase!=='launch'||!Number.isFinite(contact)||contact<0||contact>1)throw new Error('Invalid launch');return {...s,phase:'countdown',elapsed:0,contact};}
export function advanceTamiya(s,seconds){
  if(!Number.isFinite(seconds)||seconds<0)throw new Error('Invalid race time');
  const n={...s};if(s.phase==='launch')n.elapsed=(s.elapsed+seconds)%2;
  else if(s.phase==='countdown'){const elapsed=s.elapsed+seconds;if(elapsed<3)n.elapsed=elapsed;else {n.phase='race';n.elapsed=Math.min(elapsed-3,raceDuration(s));if(n.elapsed>=raceDuration(s))n.phase='result';}}
  else if(s.phase==='race'){n.elapsed=Math.min(s.elapsed+seconds,raceDuration(s));if(n.elapsed>=raceDuration(s))n.phase='result';}return n;
}
export function activePit(s){return s.rules===2?s.pits.find(p=>p.release===null):null;}
export function beginPit(s){
  const r=racerAt(racePlans(s)[0],s.elapsed,s.track);
  if(s.rules!==2||s.phase!=='race'||r.finished||r.derailed||activePit(s)||s.pits.length>=100)throw Error('Cannot pit now');
  return {...s,pits:[...s.pits,{at:s.elapsed,release:null,setup:r.setup,loadout:{...r.loadout}}]};
}
export function editPit(s,setup,loadout,collection){
  if(!activePit(s)||!known(TAMIYA_SETUPS,setup)||!validBuild(loadout,collection))throw Error('Invalid pit build');
  return {...s,pits:s.pits.map(p=>p.release===null?{...p,setup,loadout:{...loadout}}:p)};
}
export function rejoinPit(s){
  const p=activePit(s);if(s.phase!=='race'||!p||s.elapsed<p.at+2-1e-8)throw Error('Pit takes at least 2 seconds');
  return {...s,pits:s.pits.map(v=>v===p?{...v,release:Math.max(p.at+2,s.elapsed)}:v)};
}
export function cleanTamiyaRound(v,collection={}){
  if(!v||!known(TAMIYA_TRACKS,v.track)||!known(TAMIYA_CARS,v.car)||!known(TAMIYA_SETUPS,v.setup)||v.car!=='tamiya'&&!collection[v.car])return null;
  if(!Number.isInteger(v.id)||v.id<1||v.id>1e9||!['ready','launch','countdown','race','result'].includes(v.phase)||!Number.isFinite(v.elapsed)||v.elapsed<0||v.elapsed>3600||!Number.isFinite(v.contact)||v.contact<0||v.contact>1||typeof v.settled!=='boolean')return null;
  let s;
  if(v.rules===undefined||v.rules===1)s={id:v.id,track:v.track,car:v.car,setup:v.setup,phase:v.phase,elapsed:v.elapsed,contact:v.contact,settled:v.settled};
  else if(v.rules===2){
    if(!validBuild(v.loadout,collection)||!Array.isArray(v.pits)||v.pits.length>100)return null;
    s={...newTamiyaRound(v.track,v.car,v.setup,v.id,v.loadout),contact:v.contact};
    for(const pit of v.pits){
      if(!pit||!Number.isFinite(pit.at)||pit.at<0||pit.at>v.elapsed||!known(TAMIYA_SETUPS,pit.setup)||!validBuild(pit.loadout,collection)||activePit(s))return null;
      const previous=s.pits.at(-1);if(previous&&pit.at<previous.release)return null;
      const r=racerAt(racePlans(s)[0],pit.at,s.track);if(r.finished||r.derailed)return null;
      if(pit.release!==null&&(!Number.isFinite(pit.release)||pit.release<pit.at+2-1e-8||pit.release>v.elapsed))return null;
      s.pits.push({at:pit.at,release:pit.release,setup:pit.setup,loadout:{...pit.loadout}});
    }
    Object.assign(s,{phase:v.phase,elapsed:v.elapsed,settled:v.settled});if(s.pits.length&&!['race','result'].includes(s.phase)||activePit(s)&&s.phase!=='race')return null;
  }else return null;
  if(s.phase==='ready'&&s.elapsed!==0||s.phase==='launch'&&s.elapsed>=2||s.phase==='countdown'&&s.elapsed>=3||s.phase==='race'&&s.elapsed>=raceDuration(s)||s.phase==='result'&&s.elapsed!==raceDuration(s)||s.phase!=='result'&&s.settled)return null;
  return s;
}

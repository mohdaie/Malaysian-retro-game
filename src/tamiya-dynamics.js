import { STOCK_BUILD, partStats } from './tamiya-parts.js?v=2.11.1';
// Analytic distance stages: frame rate never changes charge, a pit or a result.
// A pit cuts the existing future at its timestamp; the past is kept verbatim.
export function dynamicPlan(track,car,setup,contact,key,loadout,pits,setups){
  let stages=[],time=(1-Math.max(0,1-Math.abs(contact-.5)*2))*1.8,distance=0,build={...loadout},mode=setup,pools={};
  const cap=id=>id==='stock'?100:partStats(car,{...STOCK_BUILD,battery:id}).capacity;
  const meta=()=>{const id=build.battery;pools[id]??=cap(id);return {setup:mode,loadout:{...build},battery:id,capacity:cap(id),chargeStart:pools[id],chargeEnd:pools[id]};};
  if(time)stages.push({from:0,to:0,start:0,end:time,type:'start',...meta()});
  function fill(checkEntry=false){
    const a=partStats(car,build),tune=setups[mode],grip=Math.min(100,a.grip+tune.grip),stability=Math.min(100,a.stability+tune.stability),vmax=(4.3+a.speed*.071)*tune.speed;
    let segmentStart=0;
    for(let lap=0;lap<3;lap++)for(const [fraction,type] of track.segments){
      const end=segmentStart+fraction*track.length;
      if(end<=distance+1e-8){segmentStart=end;continue;}
      const demand=type==='tight'?78:type==='bend'?43:type==='changer'?58:type==='ramp'?83:0,control=type==='ramp'?stability:grip,excess=demand+(mode==='fast'?12:0)-control;
      if((distance<=segmentStart+1e-8||checkEntry)&&demand&&excess>11){const delay=1.1+excess*.065;stages.push({from:distance,to:distance,start:time,end:time+delay,type:'derail',section:type,...meta()});time+=delay;}checkEntry=false;
      while(distance<end-1e-8){
        const m=meta(),len=Math.min(4,end-distance),charge=m.chargeStart/m.capacity,power=.3+.7*Math.min(1,charge/.35);
        const speed=vmax*power*(type==='straight'?1:type==='ramp'?(.64+stability*.0028):(.56+grip*.0041));
        const used=len*a.drain*(mode==='fast'?.37:mode==='stable'?.17:.22);
        const to=distance+len,duration=len/speed,chargeEnd=Math.max(0,m.chargeStart-used);
        stages.push({from:distance,to,start:time,end:time+duration,type,speed,...m,chargeEnd});pools[m.battery]=chargeEnd;distance=to;time+=duration;
      }segmentStart=end;
    }
  }
  fill();
  for(const pit of pits){
    const active=stages.find(v=>pit.at<v.end),prefix=stages.filter(v=>v.end<=pit.at);
    if(!active)throw Error('Pit after finish');
    const f=Math.max(0,Math.min(1,(pit.at-active.start)/(active.end-active.start)));
    distance=active.from+(active.to-active.from)*f;
    const charge=active.chargeStart+(active.chargeEnd-active.chargeStart)*f;
    if(pit.at>active.start)prefix.push({...active,end:pit.at,to:distance,chargeEnd:charge});
    stages=prefix;pools={};for(const v of stages)pools[v.battery]=v.chargeEnd;pools[active.battery]=charge;
    mode=active.setup;build={...active.loadout};time=pit.release??Infinity;
    stages.push({from:distance,to:distance,start:pit.at,end:time,type:'pit',...meta()});
    if(pit.release===null)break;
    const changed=mode!==pit.setup||JSON.stringify(build)!==JSON.stringify(pit.loadout);
    mode=pit.setup;build={...pit.loadout};fill(changed);
  }
  const a=partStats(car,loadout),tune=setups[setup];
  return {key,car,setup,quality:Math.max(0,1-Math.abs(contact-.5)*2),grip:Math.min(100,a.grip+tune.grip),stability:Math.min(100,a.stability+tune.stability),vmax:(4.3+a.speed*.071)*tune.speed,stages,duration:time,derails:stages.filter(v=>v.type==='derail').length,pits:pits.length};
}
// Rivals use their own parts and scheduled stops, with the same charge/pit rules.
export function rivalPlan(track,car,key,setups,trackId){
  const loadout={...STOCK_BUILD,motor:'mini_motor_torque',gear:key==='faiz'?'mini_gear_sprint':'mini_gear_torque',battery:key==='faiz'?'mini_battery_burst':'mini_battery_endurance',rollers:key==='faiz'?'mini_rollers_bearing':'mini_rollers_alloy'};
  const contact=key==='faiz'?.61:.525,start=key==='faiz'?'fast':trackId==='oval'?'balanced':'stable',pits=[];
  let p=dynamicPlan(track,car,start,contact,key,loadout,pits,setups);
  const strategy=key==='faiz'?[{distance:track.length*(trackId==='oval'?1.4:.14),setup:trackId==='oval'?'fast':'stable',battery:'mini_battery_endurance'}]:[];
  for(const change of strategy){const v=p.stages.find(v=>v.to>change.distance);if(!v)continue;let at=v.start+(change.distance-v.from)/(v.to-v.from)*(v.end-v.start);if(v.type==='derail')at=v.end;
    pits.push({at,release:at+2,setup:change.setup,loadout:{...loadout,battery:change.battery}});p=dynamicPlan(track,car,start,contact,key,loadout,pits,setups);
  }return p;
}

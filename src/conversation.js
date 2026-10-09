import { normalizeLine } from './dialogue-portraits.js?v=2.14.1';
import { clearSegment } from './map-navigation.js?v=2.14.1';

// Read the whole scene before it starts, including its host when only the
// player speaks. Mentions inside the text do not summon another person.
export function conversationSpeakers(lines, fallback, state, host = fallback) {
  return [...new Set([normalizeLine('',host,state).speaker,...lines.map(l=>normalizeLine(l,fallback,state).speaker)])];
}

// A temporary gathering uses the existing bodies; routines and clock-based
// crowd poses stay untouched so everyone can resume exactly where they were.
export function stageConversation(actors, origin, heading, canStand) {
  const members=new Map(), occupied=[origin];
  for(const [i,actor] of actors.entries()) {
    const offset=actors.length===1?0:(i/(actors.length-1)-.5)*2.4;
    const angle=heading+offset, radius=2.2+(i%2)*.35;
    const desired={x:origin.x+Math.sin(angle)*radius,z:origin.z+Math.cos(angle)*radius};
    const candidates=[];
    const gap=Math.hypot(actor.x-origin.x,actor.z-origin.z);
    if(gap>=1&&gap<=3.4)candidates.push({x:actor.x,z:actor.z});
    const alternatives=[];
    for(const r of [1.5,2,2.5,3,3.5,4])for(let j=0;j<48;j++) {
      const a=heading+j*Math.PI/24;
      alternatives.push({x:origin.x+Math.sin(a)*r,z:origin.z+Math.cos(a)*r});
    }
    alternatives.sort((a,b)=>Math.hypot(a.x-desired.x,a.z-desired.z)-Math.hypot(b.x-desired.x,b.z-desired.z));
    candidates.push(desired,...alternatives);
    const spot=candidates.find(p=>canStand(p.x,p.z)&&occupied.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>=.75)&&clearSegment(origin,p,canStand));
    if(!spot)throw new Error(`No clear conversation spot for ${actor.id}`);
    occupied.push(spot);
    const group=actor.character.group;
    members.set(actor.id,{actor,...spot,original:{x:actor.x,z:actor.z,cx:actor.collider.x,cz:actor.collider.z,visible:group.visible,heading:group.rotation.y,position:{x:group.position.x,y:group.position.y,z:group.position.z}}});
  }
  const points=[origin,...members.values()], center={x:points.reduce((sum,p)=>sum+p.x,0)/points.length,z:points.reduce((sum,p)=>sum+p.z,0)/points.length};
  const radius=Math.max(...points.map(p=>Math.hypot(p.x-center.x,p.z-center.z)));
  let restored=false;
  return {members,center,radius,speaker:null,restore(){
    if(restored)return;restored=true;
    for(const {actor,original:o} of members.values()) {
      actor.x=o.x;actor.z=o.z;actor.collider.x=o.cx;actor.collider.z=o.cz;
      const g=actor.character.group;g.position.set(o.position.x,o.position.y,o.position.z);g.rotation.y=o.heading;g.visible=o.visible;
    }
  }};
}

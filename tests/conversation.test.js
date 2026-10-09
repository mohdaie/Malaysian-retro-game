import test from 'node:test';
import assert from 'node:assert/strict';
import { conversationSpeakers, stageConversation } from '../src/conversation.js';
import { DIALOGUE } from '../src/chapter-dialogue.js';

const state={who:'amir',name:'Aie'};
const actor=(id,x,z,visible=true)=>({id,x,z,collider:{x,z},routine:{state:{x,z}},character:{group:{visible,rotation:{y:.7},position:{x,y:0,z,set(x,y,z){Object.assign(this,{x,y,z});}}}}});
test('Uncle Lim scenes gather every actual speaker, including Faiz, without summoning names mentioned in text',()=>{
  const ids=conversationSpeakers(DIALOGUE.S05,'lim',state);
  for(const id of ['lim','meiling','faiz','hakim','amir'])assert.ok(ids.includes(id));
  assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual(conversationSpeakers([{speaker:'lim',text:'Pak Rahman belum sampai.'}],'lim',state),['lim']);
});
test('player replies retain their host; mother and renamed player resolve for either character',()=>{
  assert.deepEqual(conversationSpeakers([{speaker:'player',text:'Terima kasih.'}],'player',state,'lim'),['lim','amir']);
  assert.deepEqual(conversationSpeakers(DIALOGUE.S01,'mother',{who:'nur',name:'Aina'}),['aminah','nur']);
  assert.deepEqual(conversationSpeakers(['Uncle Lim: Haa, dah sampai.'],'player',state),['amir','lim']);
});
test('eight speakers fit nearby without overlaps or standing behind a wall',()=>{
  const actors=Array.from({length:8},(_,i)=>actor('person'+i,60+i,60));
  const canStand=(x,z)=>x<1.8&&z>-1.2;
  const scene=stageConversation(actors,{x:0,z:0},0,canStand),poses=[...scene.members.values()];
  assert.equal(poses.length,8);
  for(const p of poses){assert.ok(canStand(p.x,p.z));assert.ok(Math.hypot(p.x,p.z)>=.75&&Math.hypot(p.x,p.z)<=4.01);for(const q of poses)if(p!==q)assert.ok(Math.hypot(p.x-q.x,p.z-q.z)>=.75);}
});
test('finishing a scene restores hidden crowd members and residents without changing routines or colliders',()=>{
  const actors=[actor('lim',1.5,1),actor('faiz',60,50),actor('hakim',90,80,false)];
  const before=actors.map(a=>({x:a.x,z:a.z,cx:a.collider.x,cz:a.collider.z,visible:a.character.group.visible,heading:a.character.group.rotation.y,routine:{...a.routine.state}}));
  const scene=stageConversation(actors,{x:0,z:0},0,()=>true);
  for(const {actor:a,x,z}of scene.members.values()){a.x=x;a.z=z;a.collider.x=x;a.collider.z=z;a.character.group.position.set(x,1,z);a.character.group.visible=true;a.character.group.rotation.y=0;}
  scene.restore();scene.restore();
  assert.deepEqual(actors.map(a=>({x:a.x,z:a.z,cx:a.collider.x,cz:a.collider.z,visible:a.character.group.visible,heading:a.character.group.rotation.y,routine:{...a.routine.state}})),before);
  for(const a of actors)assert.deepEqual([a.character.group.position.x,a.character.group.position.y,a.character.group.position.z],[a.x,0,a.z]);
});

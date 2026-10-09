import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {PORTRAITS,PEOPLE,normalizeLine,showPortrait} from '../src/dialogue-portraits.js';
import {STEPS} from '../src/story.js';

const element=()=>({hidden:false,style:{},attributes:{},removeAttribute(key){delete this.attributes[key];if(key==='style')this.style={};},setAttribute(key,value){this.attributes[key]=value;}});
test('every named character and chapter speaker has a distinct available portrait',async()=>{
 const keys=Object.keys(PEOPLE).filter(k=>k!=='recording'),sources=[];
 assert.equal(keys.length,56);assert.deepEqual(Object.keys(PORTRAITS).sort(),keys.sort());
 const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url)));
 for(const key of keys){
  const p=PORTRAITS[key];sources.push(p.src);
  await access(new URL('../'+p.src.split('?')[0],import.meta.url));
  assert.ok(p.src.endsWith('?v='+version));
  assert.ok(p.size>0&&p.x>=0&&p.y>=0&&p.x+p.size<=p.width&&p.y+p.size<=p.height,key);
 }
 assert.equal(new Set(sources).size,keys.length,'different speakers never borrow one another’s source image');
 for(const who of ['amir','nur'])for(const scene of STEPS)for(const line of scene.lines||[]){
  const entry=normalizeLine(line,null,{who,name:'Aie'});
  if(entry.speaker!=='notification')assert.ok(PORTRAITS[entry.speaker],entry.speaker);
 }
});
test('speaker changes select the correct face, including mother/player aliases and full-image avatars',()=>{
 for(const who of ['amir','nur']){
  const el=element(),state={who,name:'Aie'};
  for(const speaker of ['lim','faiz','hakim','keong','ravi','player','mother','karim','senah']){
   const entry=normalizeLine({speaker,text:'Hai {name}.'},null,state);showPortrait(el,entry.speaker,entry.name);
   assert.equal(el.hidden,false);assert.equal(el.style.backgroundImage,`url("${PORTRAITS[entry.speaker].src}")`);
   assert.equal(el.attributes['aria-label'],'Potret '+entry.name);
   assert.doesNotMatch(el.style.backgroundPosition,/NaN|Infinity/);
   if(speaker==='mother')assert.equal(entry.speaker,who==='nur'?'aminah':'zaitun');
   if(speaker==='player')assert.equal(entry.speaker,who);
  }
  showPortrait(el,'notification');assert.equal(el.hidden,true);assert.deepEqual(el.style,{});assert.equal(el.attributes.role,undefined);assert.equal(el.attributes['aria-label'],undefined);
 }
});

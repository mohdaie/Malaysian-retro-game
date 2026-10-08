import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const repo=fileURLToPath(new URL('..',import.meta.url)),profile=await mkdtemp(join(tmpdir(),'retro-roads-'));
const chromium=process.env.RETRO_CHROMIUM||'chromium';
const server=spawn(process.execPath,['scripts/dev.mjs'],{cwd:repo,env:{...process.env,PORT:'4213'},stdio:'ignore'});
const browser=spawn(chromium,['--headless','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9234','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
process.on('exit',()=>{server.kill();browser.kill();});
console.log("Starting browser");let target;
for(let i=0;i<100;i++){try{target=await fetch('http://127.0.0.1:9234/json/new?http://127.0.0.1:4213/scripts/river-preview.html',{method:'PUT',signal:AbortSignal.timeout(2000)}).then(r=>r.json());break;}catch{await new Promise(r=>setTimeout(r,200));}}
if(!target)throw new Error('Headless browser did not start');
console.log("Browser target ready");const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));console.log("Browser connected");let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Browser timed out: '+method));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(300);}throw Error('Timed out: '+expression);}

async function capture(name){const r=await send('Page.captureScreenshot',{format:'jpeg',quality:85});await writeFile(repo+'/docs/'+name,Buffer.from(r.data,'base64'));}
try{
 console.log('Enabling page');await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:932,height:430,deviceScaleFactor:1,mobile:true});await until('!!window.riverReview');console.log('World ready');
 const checks=await evaluate(`(async()=>{
  const T=await import('three'),ray=new T.Raycaster(),w=riverReview.world;
  const points=[[-43.137,-3.083],[-25.137,-3.083],[68.363,-3.083],[-25.137,36.417],[-22.137,62.917],[65.363,23.917],[6.863,.667],[-43.137,36.417],[23.863,34.917],[43.863,42.917]];
  const tops=points.map(([x,z])=>{ray.set(new T.Vector3(x,10,z),new T.Vector3(0,-1,0));return {x,z,count:ray.intersectObjects(w.scene.children,true).filter(h=>Math.abs(h.point.y-.055)<.0001).length};});
  const {BRIDGES}=await import('/src/town-layout.js?v=2.11.1');
  const {clearSegment}=await import('/src/map-navigation.js?v=2.11.1');
  return {tops,bridges:BRIDGES.map(b=>clearSegment({x:b.x-7.4,z:b.z},{x:b.x+7.4,z:b.z},w.canWalk))};
 })()`);
 assert.ok(checks.tops.every(p=>p.count===1),JSON.stringify(checks.tops));assert.ok(checks.bridges.every(Boolean));
 await evaluate('document.querySelector("header").hidden=true;document.getElementById("status").hidden=true');
 for(const [name,x,z] of [['road-kampung-junction.jpg',-43,-3],['road-market-junction.jpg',-25,36.5]]){
  await evaluate(`riverReview.render({minute:840});{const w=riverReview.world;w.camera.fov=55;w.camera.updateProjectionMatrix();w.camera.position.set(${x+8},9,${z+11});w.camera.lookAt(${x},0,${z});w.renderer.render(w.scene,w.camera);}`);await capture(name);
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'passed',checks,errors}));
}finally{ws.close();server.kill();browser.kill();await rm(profile,{recursive:true,force:true,maxRetries:3});}

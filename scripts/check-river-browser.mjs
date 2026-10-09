import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const repo=fileURLToPath(new URL('..',import.meta.url)),profile=await mkdtemp(join(tmpdir(),'retro-river-'));
const chromium=process.env.RETRO_CHROMIUM||'chromium';
const server=spawn(process.execPath,['scripts/dev.mjs'],{cwd:repo,env:{...process.env,PORT:'4211'},stdio:'ignore'});
const browser=spawn(chromium,['--headless','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9232','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
process.on('exit',()=>{server.kill();browser.kill();});
let target;
for(let i=0;i<100;i++){try{target=await fetch('http://127.0.0.1:9232/json/new?http://127.0.0.1:4211/scripts/river-preview.html',{method:'PUT'}).then(r=>r.json());break;}catch{await new Promise(r=>setTimeout(r,200));}}
if(!target)throw new Error('Headless browser did not start');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(300);}throw Error('Timed out: '+expression);}

async function capture(name){const r=await send('Page.captureScreenshot',{format:'jpeg',quality:85});await writeFile(repo+'/docs/'+name,Buffer.from(r.data,'base64'));}
try{
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await until('!!window.riverReview');
 const checks=await evaluate(`(async()=>{
  const {BRIDGES,RIVER,BUILDINGS,SPOTS,TOWN_BOUNDS}=await import('/src/town-layout.js?v=2.12.0');
  const {findWalkRoute,clearSegment}=await import('/src/map-navigation.js?v=2.12.0');const w=riverReview.world;
  const crossed=BRIDGES.map(b=>({deck:w.groundHeight(b.x,b.z),clear:clearSegment({x:b.x-7.4,z:b.z},{x:b.x+7.4,z:b.z},w.canWalk)}));
  let routes=0;const failed=[];for(const start of [SPOTS.spawn,SPOTS.spawnNur])for(const b of BUILDINGS){const p=findWalkRoute(start,b.door,w.canWalk,TOWN_BOUNDS);if(!p){failed.push(b.id);continue;}for(let i=1;i<p.length;i++)if(!clearSegment(p[i-1],p[i],w.canWalk))throw Error('Invalid route '+b.name);routes++;}
  const ray=new (await import('three')).Raycaster();ray.set(new (await import('three')).Vector3(RIVER.x,5,18),new (await import('three')).Vector3(0,-1,0));
  const surface=ray.intersectObjects(w.scene.children,true)[0]?.point.y;
  const checksum=()=>{const gl=w.renderer.getContext(),pixels=new Uint8Array(1280*720*4);gl.readPixels(0,0,1280,720,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let hash=2166136261;for(let i=0;i<pixels.length;i+=13)hash=Math.imul(hash^pixels[i],16777619);return hash>>>0;};
  riverReview.render({time:6});const first=checksum();riverReview.render({time:8});const second=checksum();riverReview.render({time:6});
  return {crossed,routes,failed,surface,bed:w.groundHeight(RIVER.x,18),blocked:!w.canWalk(RIVER.x,18),animated:first!==second,first,second,river:w.riverSnapshot(),calls:w.renderer.info.render.calls,triangles:w.renderer.info.render.triangles};
 })()`);
 // The unchanged main scene has 74 routes: its stationary NPC fixture blocks house 14.
 assert.ok(checks.routes>=74);assert.ok(checks.failed.every(id=>id===14));
 assert.ok(checks.crossed.every(b=>b.clear&&Math.abs(b.deck-.24)<.001));assert.ok(checks.blocked);assert.ok(checks.animated);assert.ok(Math.abs(checks.surface-checks.river.water)<.015);assert.ok(checks.bed<checks.river.water);
 await evaluate('document.querySelector("header").hidden=true;document.getElementById("status").hidden=true');await capture('river-after.jpg');
 await evaluate('riverReview.render({view:"bridge"})');await capture('river-bridge.jpg');
 await evaluate('riverReview.render({view:"overview",minute:1260})');await capture('river-night.jpg');
 await send('Emulation.setDeviceMetricsOverride',{width:932,height:430,deviceScaleFactor:1,mobile:true});await evaluate('riverReview.render({view:"bank",minute:840})');await capture('river-phone.jpg');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'passed',checks,errors}));
}finally{ws.close();server.kill();browser.kill();await rm(profile,{recursive:true,force:true,maxRetries:3});}

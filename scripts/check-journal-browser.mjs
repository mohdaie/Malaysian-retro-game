import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const repo=fileURLToPath(new URL('..',import.meta.url)),profile=await mkdtemp(join(tmpdir(),'retro-journal-'));
const chromium=process.env.RETRO_CHROMIUM||'chromium';
const server=spawn(process.execPath,['scripts/dev.mjs'],{cwd:repo,env:{...process.env,PORT:'4193'},stdio:'ignore'});
const browser=spawn(chromium,['--headless','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9226','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
process.on('exit',()=>{server.kill();browser.kill();});
let target;
for(let i=0;i<100;i++){try{target=await fetch('http://127.0.0.1:9226/json/new?http://localhost:4193/',{method:'PUT'}).then(r=>r.json());break;}catch{await new Promise(r=>setTimeout(r,200));}}
if(!target)throw new Error('Headless browser did not start');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(300);}throw Error('Timed out: '+expression);}
async function click(expression){await evaluate(`${expression}.click()`);await pause(200);}
async function reload(){await send('Page.reload',{ignoreCache:true});await until('!!window.retroMalaysia && document.getElementById("loading").hidden && !document.getElementById("continue-button").hidden');await click('document.getElementById("continue-button")');await until('retroMalaysia.snapshot().mode==="explore"');await pause(350);}
async function title(){
 const mode=await evaluate('retroMalaysia.snapshot().mode');
 if(mode==='book')await click('document.getElementById("book-close")');
 if(mode==='counter')await click('document.getElementById("counter-close")');
 if((await evaluate('retroMalaysia.snapshot().mode'))==='explore'){await click('document.getElementById("pause-button")');await click('document.getElementById("home-button")');}
}
const nearNpc=`(key)=>{const n=retroMalaysia.snapshot().npcs.find(n=>n.id===key);for(const [dx,dz] of [[1.2,0],[-1.2,0],[0,1.2],[0,-1.2],[1,1],[-1,-1]])if(retroMalaysia.canWalk(n.x+dx,n.z+dz))return {x:n.x+dx,z:n.z+dz};throw Error('No clear approach for '+key);}`;
async function fixture(story,npc,setup=''){
 await title();
 await evaluate(`(async()=>{const {newEconomy,accept,collect,deliver}=await import('/src/economy.js?v=2.10.0'),{NOSTALGIA_QUESTS:qs,startNostalgia,followNostalgiaClue,recordNostalgiaWin,claimNostalgia}=await import('/src/nostalgia-quests.js?v=2.10.0');const eco=newEconomy(),id='nostalgia_P02',q=qs[id],context={place:q.place,npc:q.npc};${setup}localStorage.setItem('retro-malaysia-save-amir',JSON.stringify({version:3,who:'amir',name:'Aie',story:${story},...(${nearNpc})('${npc}'),...eco,clock:{day:4,minute:840},savedAt:Date.now()}));})()`);
 await reload();
}
async function screenshot(path){const r=await send('Page.captureScreenshot',{format:'png'});await writeFile(repo+'/docs/'+path,Buffer.from(r.data,'base64'));}
try {
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:932,height:430,deviceScaleFactor:1,mobile:true});
 await until('!!window.retroMalaysia');await fixture(7,'salleh');
 await click('document.getElementById("book-button")');
 assert.equal(await evaluate('document.querySelectorAll("#book-content [data-nostalgia]").length'),0);
 assert.equal(await evaluate('[...document.querySelectorAll("#book-content button")].some(b=>b.textContent.startsWith("Tunjuk arah"))'),false);
 assert.doesNotMatch(await evaluate('document.getElementById("book-content").textContent'),/Too Phat|Nokia|Walkman|Lightning|six|Faiz/i);
 assert.equal(await evaluate('document.querySelectorAll("#book-tabs button").length'),3);
 await screenshot('journal-discovery.png');
 await click('document.getElementById("book-tab-memories")');assert.equal(await evaluate('document.querySelectorAll("#book-keepsakes article").length'),0);
 await click('document.getElementById("book-tab-town")');assert.equal(await evaluate('document.querySelectorAll(".journal-game,.journal-friend").length'),0);
 await click('document.getElementById("book-close")');await click('document.getElementById("bag-button")');await click('document.getElementById("catalogue-button")');
 assert.equal(await evaluate('[...document.querySelectorAll(".locked-keepsake b")].every(n=>n.textContent==="Kenangan rahsia")'),true);
 await click('document.querySelector(".locked-keepsake .item-picture")');assert.equal(await evaluate('document.getElementById("item-title").textContent'),'Kenangan rahsia');assert.equal(await evaluate('document.getElementById("item-quest-button").hidden'),true);
 await click('document.getElementById("item-close")');await click('document.getElementById("catalogue-close")');await click('document.getElementById("bag-close")');
 await fixture(7,'farid',`startNostalgia(eco,id,context);for(let i=0;i<q.grind.deliveries;i++){const job=accept(eco,{id:'b-'+i,kind:'parcel',requester:22,from:22,to:1+i%18,stops:[1+i%18],item:'gula',qty:1,cost:0,upah:100,route:90}).job;collect(eco,job.id,22);deliver(eco,job.id,job.to);}followNostalgiaClue(eco,id,q.trail[0].place);const job=accept(eco,{id:'multi',kind:'parcel',requester:22,from:22,to:3,stops:[1,2,3],item:'gula',qty:3,cost:0,upah:200,route:90}).job;collect(eco,job.id,22);deliver(eco,job.id,1);`);
 await click('document.getElementById("book-button")');assert.equal(await evaluate('document.querySelectorAll("#book-content [data-nostalgia]").length'),1);
 assert.equal(await evaluate('document.querySelector("#book-content [data-nostalgia]").dataset.stage'),'trail');assert.equal(await evaluate('document.querySelector("#book-content .journal-details").open'),true);
 assert.equal(await evaluate('document.querySelectorAll("[data-nostalgia] [data-task^=clue-]").length'),2);
 assert.equal(await evaluate('document.querySelectorAll("[data-job] [aria-checked=true]").length'),2);
 assert.equal(await evaluate('document.querySelectorAll("[data-nostalgia] [aria-checked=true]").length'),4);
 assert.doesNotMatch(await evaluate('document.getElementById("book-content").textContent'),/Too Phat|Plan B|Nokia|Walkman|Uncle Lim’s championship|Tamiya.*4/);
 await evaluate('document.querySelector("[data-nostalgia] .journal-details").open=true; document.querySelector("[data-job] .journal-details").open=true;document.getElementById("book-content").scrollTop=180');await screenshot('journal-checklist.png');
 await click('document.getElementById("book-close")');await reload();await click('document.getElementById("book-button")');assert.equal(await evaluate('document.querySelectorAll("[data-nostalgia] [aria-checked=true]").length'),4);
 await fixture(7,'farid',`startNostalgia(eco,id,context);for(let i=0;i<q.grind.deliveries;i++){const job=accept(eco,{id:'c-'+i,kind:'parcel',requester:22,from:22,to:1+i%18,stops:[1+i%18],item:'gula',qty:1,cost:0,upah:100,route:90}).job;collect(eco,job.id,22);deliver(eco,job.id,job.to);}for(const stop of q.trail)followNostalgiaClue(eco,id,stop.place);for(let i=0;i<1;i++)recordNostalgiaWin(eco,{game:'congkak'});claimNostalgia(eco,id,context,1,'Aie',4);eco.congkak.played=1;eco.congkak.won=1;eco.friends.faiz=8;`);
 await click('document.getElementById("book-button")');assert.equal(await evaluate('document.querySelectorAll("#book-memories [data-nostalgia]").length'),0);
 await click('document.getElementById("book-tab-memories")');assert.equal(await evaluate('document.querySelectorAll("#book-keepsakes [data-nostalgia]").length'),1);
 assert.equal(await evaluate('document.querySelector("#book-keepsakes img").complete && document.querySelector("#book-keepsakes img").naturalWidth>0'),true);
 await screenshot('journal-keepsake.png');await click('document.querySelector("#book-keepsakes .item-picture")');assert.match(await evaluate('document.getElementById("item-memory").textContent'),/Aie/);
 await click('document.getElementById("item-close")');assert.equal(await evaluate('retroMalaysia.snapshot().mode'),'book');assert.equal(await evaluate('document.getElementById("book-tab-memories").getAttribute("aria-selected")'),'true');
 await click('document.getElementById("book-tab-town")');assert.equal(await evaluate('document.querySelectorAll(".journal-game").length'),1);assert.equal(await evaluate('document.querySelectorAll(".journal-friend").length'),1);
 assert.equal(await evaluate('document.querySelector(".journal-modal").scrollWidth<=document.querySelector(".journal-modal").clientWidth'),true);
 await send('Emulation.setDeviceMetricsOverride',{width:640,height:360,deviceScaleFactor:1,mobile:true});await pause(200);assert.equal(await evaluate('document.querySelector(".journal-modal").getBoundingClientRect().bottom<=innerHeight'),true);await screenshot('journal-phone.png');
 assert.deepEqual(errors,[]);console.log('Journal browser checks passed: discovery, anonymous catalogue, tick marks, reload, archive, inspector return, town and phone layout.');
} finally {ws.close();server.kill();browser.kill();await rm(profile,{recursive:true,force:true,maxRetries:3});}

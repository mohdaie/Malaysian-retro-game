import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { opening, prepared } from '../tests/chapter-helpers.js';
import { newEconomy } from '../src/economy.js';
const repo=fileURLToPath(new URL('..',import.meta.url)),profile=await mkdtemp(join(tmpdir(),'retro-journal-'));
const chromium=process.env.RETRO_CHROMIUM||'chromium';
const server=spawn(process.execPath,['scripts/dev.mjs'],{cwd:repo,env:{...process.env,PORT:'4193'},stdio:'ignore'});
const browser=spawn(chromium,['--headless','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=9226','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
browser.stderr.on('data',data=>{if(process.env.RETRO_BROWSER_DEBUG)process.stderr.write(data);});
browser.on('error',error=>{console.error(error);process.exit(1);});
process.on('exit',()=>{server.kill();browser.kill();});
let target;
for(let i=0;i<100;i++){try{target=await fetch('http://127.0.0.1:9226/json/new?http://localhost:4193/',{method:'PUT',signal:AbortSignal.timeout(2000)}).then(r=>r.json());break;}catch{await new Promise(r=>setTimeout(r,200));}}
if(!target)throw new Error('Headless browser did not start');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timed out: '+method));},15000);pending.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params}));});
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

async function fixture(eco,place=1,who='amir',minute=840){
 await title();
 const position=await evaluate(`(()=>{const d=retroMalaysia.town().buildings.find(b=>b.id===${place}).door;for(const [dx,dz] of [[1.3,0],[-1.3,0],[0,1.3],[0,-1.3],[2,0],[0,2]])if(retroMalaysia.canWalk(d.x+dx,d.z+dz))return {x:d.x+dx,z:d.z+dz};throw Error('No clear door approach');})()`);
 eco.chapter.who=who;
 const save={version:4,who,name:who==='nur'?'Aina':'Amir',story:eco.chapter.step,...position,...eco,clock:{day:4,minute},savedAt:Date.now()};
 await evaluate(`localStorage.setItem('retro-malaysia-save-${who}',${JSON.stringify(JSON.stringify(save))})`);
 await send('Page.reload',{ignoreCache:true});await until('!!window.retroMalaysia && document.getElementById("loading").hidden');
 await click(`document.querySelector('[data-who="${who}"]')`);await click('document.getElementById("continue-button")');await until('retroMalaysia.snapshot().mode==="explore"');
}
try{
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await until('!!window.retroMalaysia');
 await click('document.querySelector("[data-who=nur]")');await click('document.querySelector("#start-form button[type=submit]")');await until('retroMalaysia.snapshot().mode==="explore"');
 assert.equal(await evaluate('document.getElementById("quest-book").getBoundingClientRect().bottom<=document.getElementById("quest-card").getBoundingClientRect().bottom'),true);
 await fixture(newEconomy(),11,'nur');await click('document.getElementById("interact-button")');await click('[...document.querySelectorAll("#counter-body button")].find(b=>b.textContent.startsWith("Sambung cerita"))');
 assert.equal(await evaluate('document.getElementById("speaker").textContent'),'Cik Aminah');await click('document.getElementById("dialogue-next")');assert.equal(await evaluate('document.getElementById("speaker").textContent'),'Aina');assert.equal(await evaluate('document.getElementById("dialogue-portrait").hidden'),false);
 while(await evaluate('retroMalaysia.snapshot().mode==="dialogue"'))await click('document.getElementById("dialogue-next")');
 const eco=prepared();eco.chapter.completed=eco.chapter.completed.filter(id=>!id.startsWith('deduce'));await fixture(eco);await click('document.getElementById("book-button")');
 assert.equal(await evaluate('!!document.querySelector("[data-deduction=A]")'),true);
 await click('[...document.querySelectorAll("[data-deduction=A] button")].find(b=>b.textContent==="Faiz tidak pernah datang kedai.")');
 assert.match(await evaluate('document.querySelector("[data-deduction=A] .deduction-feedback").textContent'),/belum sepadan/);
 for(const id of ['E01','E04','E03'])await click(`document.querySelector('[data-deduction=A] input[value=${id}]')`);
 await click('[...document.querySelectorAll("[data-deduction=A] button")].find(b=>b.textContent==="Faiz berada di kantin dalam sela stok terakhir hilang.")');
 assert.equal(await evaluate('retroMalaysia.snapshot().eco.chapter.completed.includes("deduceA")'),true);await click('document.getElementById("book-close")');
 await fixture(opening(),17,'amir',1260);await click('document.getElementById("interact-button")');await click('[...document.querySelectorAll("#counter-body button")].find(b=>b.textContent==="Panggil Badrul")');assert.equal(await evaluate('document.getElementById("counter-name").textContent'),'Badrul');
 assert.deepEqual(errors,[]);console.log('Chapter browser checks passed: mobile HUD, mother and portrait, deduction retries, and Badrul at his door after dark.');
}finally{ws.close();server.kill();browser.kill();await rm(profile,{recursive:true,force:true,maxRetries:3});}

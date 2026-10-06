import * as T from 'three';
import { makeWorld } from './world.js?v=0.11.0';
import { newRound, legalMoves, playMove, opponentMove } from './congkak.js?v=0.11.0';
import { readSave, writeSave } from './save.js?v=0.11.0';
import { CAMERA_NEAR, CAMERA_FAR, CAMERA_DEFAULT, CAMERA_PITCH, CAMERA_LOOK_HEIGHT, CAMERA_FOV, needsLandscape, enterLandscape } from './display.js?v=0.11.0';
import { WALK_SPEED, RUN_SPEED, stickInput, moveWithCollision } from './movement.js?v=0.11.0';
import { createSoundscape } from './soundscape.js?v=0.11.0';
import { BUILDINGS, DISTRICTS, ROADS, BRIDGES, PREVIEW, districtAt } from './town-layout.js?v=0.11.0';
import { newEconomy, cleanEconomy, offerAt, accept, collect, deliver, buy, jobsAt, ITEMS, STOCK, rm, itemLabel } from './economy.js?v=0.11.0';
import { CONTACTS, hello } from './registry.js?v=0.11.0';
const $ = id => document.getElementById(id);
let world;
try { world = await makeWorld($('world')); } catch (error) {
  $('loading').hidden = true; $('start-screen').hidden = true; $('error-panel').hidden = false;
  $('error-text').textContent = 'The game could not load its graphics. Check your connection and retry. Your browser needs WebGL with hardware acceleration enabled.';
  throw error;
}
const { player, camera, renderer, scene } = world;
const state = { name: 'Amir', friend: 'Nur', quest: 0, completed: false };
// Duit Poket, the bag and delivery jobs (economy.js); saved with the story.
let eco = newEconomy(), target = null, counterPlace = null;
let mode = 'title', yaw = .55, distance = CAMERA_DEFAULT, elapsed = 0, lastSave = 0, nearby = null;
let dialogue = [], dialogueDone = null, joystick = { x: 0, y: 0 }, running = false, board = null, boardBusy = false, boardToken = 0;
// Pitch above the shoulders; a recent swipe pauses the automatic follow.
let cameraPitch = CAMERA_PITCH, lastLook = -10, cameraSettle = 1, lensDistance = CAMERA_DEFAULT, talkingTo = null, aimDrop = 0;
const viewPointers = new Map();
let pinchDistance = null;
let orientationBlocked = needsLandscape(innerWidth, innerHeight);
const keys = new Set();
let storage;
try { storage = localStorage; } catch { storage = null; }
let saved = readSave(storage);
$('continue-button').hidden = !saved;
if (saved) { $('player-name').value = saved.name; $('friend-name').value = saved.friend; }
const quests = [
  { title: 'A familiar face', text: () => `Find ${state.friend} outside your kampung house.`, x: world.npcs[0].x, z: world.npcs[0].z },
  { title: 'Down to the pekan', text: () => 'Follow the lane to Warung Pak Mat. He has a congkak board waiting.', x: world.npcs[1].x, z: world.npcs[1].z },
  { title: 'Seven little houses', text: () => 'Talk to Pak Mat and finish your first congkak practice round.', x: world.npcs[1].x, z: world.npcs[1].z },
  { title: 'An afternoon well spent', text: () => 'First chapter complete. Explore the town, or ask Pak Mat for a rematch.', x: world.npcs[1].x, z: world.npcs[1].z }
];
function refreshQuest() {
  const q = quests[state.quest];
  $('quest-title').textContent = q.title; $('quest-description').textContent = q.text();
  $('quest-step').textContent = state.quest === 3 ? 'CHAPTER COMPLETE' : `0${state.quest + 1} / 03`;
  $('quest-progress').style.width = `${(state.quest+1)/4*100}%`;
  world.npcs[0].marker.visible = state.quest === 0;
  world.npcs[1].marker.visible = state.quest > 0;
  const home=document.querySelector('[data-building="1"]'),friendHome=document.querySelector('[data-building="11"]');
  if(home)home.textContent=`Rumah ${state.name}`;
  if(friendHome)friendHome.textContent=`Rumah ${state.friend}`;
}
function clearControls() { if(stickPointer!==null){const stick=$('joystick');if(stick.hasPointerCapture(stickPointer))stick.releasePointerCapture(stickPointer);stickPointer=null;} viewPointers.clear(); pinchDistance = null; keys.clear(); joystick = { x: 0, y: 0 }; running = false; $('joystick-knob').style.transform = ''; }
function syncOrientation() {
  orientationBlocked = needsLandscape(innerWidth, innerHeight);
  $('orientation-panel').hidden = !orientationBlocked;
  if (orientationBlocked) clearControls();
  world.resize();
}
$('landscape-button').onclick = () => enterLandscape($('game'));
function setMode(next) {
  mode = next; clearControls(); $('interaction').hidden = true;
  $('touch-controls').style.visibility = next === 'explore' ? '' : 'hidden';
}
function persist() {
  const ok = writeSave(storage, { version: 2, ...state, ...eco, x: player.group.position.x, z: player.group.position.z });
  $('save-status').textContent = ok ? 'Progress saved on this device.' : 'Saving unavailable in this browser. You can still play this session.';
  if(ok) { saved = readSave(storage); $('continue-button').hidden = false; }
  return ok;
}
function begin(value = null) {
  if(value) Object.assign(state, { name: value.name, friend: value.friend, quest: value.quest, completed: value.completed });
  else Object.assign(state, { name: $('player-name').value.trim().slice(0,20) || 'Amir', friend: $('friend-name').value.trim().slice(0,20) || 'Nur', quest: 0, completed: false });
  eco = value ? cleanEconomy(value) : newEconomy();
  // A save from an older layout may stand inside a moved building.
  let x = value?.x ?? world.spawn.x, z = value?.z ?? world.spawn.z;
  if(!world.canWalk(x,z)) { x=world.spawn.x; z=world.spawn.z; }
  player.group.position.set(x,world.groundHeight(x,z)-.065,z);
  yaw = player.group.rotation.y + Math.PI; cameraPitch = CAMERA_PITCH; cameraSettle = 0;
  world.renameHomes(state.name, state.friend);
  $('start-screen').hidden = true; $('hud').hidden = false;
  setMode('explore'); refreshQuest(); refreshEconomy(); persist();
  toast(PREVIEW ? 'Map preview · this layout comes from the map editor link.' : value ? `Selamat kembali, ${state.name}.` : `Welcome home, ${state.name}. Find ${state.friend} by the lane.`);
  if(PREVIEW)$('day-label').textContent='Map preview';
}
$('start-form').addEventListener('submit', event => { event.preventDefault(); if (matchMedia('(pointer: coarse)').matches) void enterLandscape($('game')); if(saved) {
  showDialogue('A new afternoon', ['Starting a new story replaces the saved journey on this device.'], () => begin());
  $('dialogue-next').textContent = 'Start new story →';
  const cancel=document.createElement('button');cancel.textContent='Keep my saved journey';cancel.className='secondary';cancel.id='cancel-new';
  cancel.onclick=()=>{cancel.remove();$('dialogue-panel').hidden=true;setMode('title');};$('dialogue-panel').append(cancel);
} else begin(); });
$('continue-button').onclick = () => { if (matchMedia('(pointer: coarse)').matches) void enterLandscape($('game')); begin(saved); };
function toast(text) { $('toast').textContent=text; $('toast').hidden=false; clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,4200); }
function showDialogue(speaker, lines, done) {
  setMode('dialogue');dialogue=[...lines];dialogueDone=done;$('speaker').textContent=speaker;$('dialogue-panel').hidden=false;advanceDialogue();
}
function advanceDialogue() {
  if(dialogue.length) { $('dialogue-text').textContent=dialogue.shift();$('dialogue-next').textContent=dialogue.length?'Continue →':'Jom →'; }
  else { $('dialogue-panel').hidden=true;$('cancel-new')?.remove();setMode('explore');const done=dialogueDone;dialogueDone=null;done?.(); }
}
$('dialogue-next').onclick=advanceDialogue;
function interact() {
  if(orientationBlocked)return;
  if(mode==='dialogue'){advanceDialogue();return;}
  if(mode!=='explore'||!nearby)return;
  if(nearby.kind==='place'){openCounter(nearby.id);return;}
  const p=player.group.position;
  player.group.rotation.y=Math.atan2(nearby.x-p.x,nearby.z-p.z);
  // Face each other; the camera swings to an over-the-shoulder two-shot.
  nearby.character.group.rotation.y=Math.atan2(p.x-nearby.x,p.z-nearby.z);talkingTo=nearby;
  if(nearby.id==='nur') {
    if(state.quest===0) showDialogue(state.friend,[`${state.name}! You're back! It feels like we haven't played in ages.`,"Pak Mat has put the congkak board out at his warung. Walk up the lane, turn right at the road, and look for the green roof.","I'll see you in the pekan. Don't let him take all your shells!"],()=>{state.quest=1;refreshQuest();persist();toast('New destination: Warung Pak Mat. Open the map to see the way.');});
    else showDialogue(state.friend,[state.quest===3?'One more round? Pak Mat never gets tired of congkak.':"The warung is just past the road. There's no hurry — enjoy the afternoon."]);
  } else {
    if(state.quest===0) showDialogue('Pak Mat',[`Ah, ${state.name}! ${state.friend} was looking for you near your house. Go say hello first.`]);
    else if(state.quest===1) showDialogue('Pak Mat',[`${state.name}, lama tak jumpa! Sit down. A good afternoon needs a good game.`,"Seven houses, seven shells each. Bring more shells home than me. I'll show you as we go."],()=>{state.quest=2;refreshQuest();persist();openBoard();});
    else openCounter(21);
  }
}
$('interact-button').onclick=interact;
// ---- Places, contacts and deliveries ----
const placeOf=id=>BUILDINGS.find(b=>b.id===id);
const placeName=id=>id===1?`Rumah ${state.name}`:id===11?`Rumah ${state.friend}`:placeOf(id).name;
const doorGap=(a,b)=>Math.round(Math.hypot(placeOf(a).door.x-placeOf(b).door.x,placeOf(a).door.z-placeOf(b).door.z));
// What the job marker points at: the active job's next stop, else a place
// with delivery work (once the story has sent the player into town).
function jobTarget(){
  const job=eco.jobs[0];
  if(job){const p=placeOf(job.status==='accepted'?job.from:job.to);return {x:p.door.x,z:p.door.z,job};}
  if(state.quest<1)return null;
  const p=BUILDINGS.find(b=>offerAt(eco,b.id));return p?{x:p.door.x,z:p.door.z,id:p.id}:null;
}
function refreshEconomy(){
  $('wallet-amount').textContent=rm(eco.wallet);
  const count=Object.values(eco.bag).reduce((a,b)=>a+b,0);$('bag-count').textContent=count?String(count):'';
  target=jobTarget();world.setJobMarker(target);$('job-line').hidden=!target;
  const job=target?.job;
  $('job-eyebrow').textContent=job?`UPAH ${rm(job.upah)}`:'KERJA HANTAR BARANG';
  if(job)$('job-text').textContent=job.status==='accepted'?`Collect ${itemLabel(job.item,job.qty)} from ${CONTACTS[job.from].name} at ${placeName(job.from)}`:`Bring ${itemLabel(job.item,job.qty)} to ${CONTACTS[job.to].name} at ${placeName(job.to)}`;
  else if(target)$('job-text').textContent=`${CONTACTS[target.id].name} at ${placeName(target.id)} needs a delivery helper`;
}
function counterButton(parent,label,onclick,cls='primary',disabled=false){const b=document.createElement('button');b.className=cls;b.textContent=label;b.disabled=disabled;b.onclick=onclick;parent.append(b);return b;}
// Talking to a place's contact: Buy / Delivery work / Leave, plus hand-overs.
function openCounter(id,view='menu',note=''){
  counterPlace=id;setMode('counter');talkingTo=null;
  $('counter-panel').hidden=false;$('counter-place').textContent=placeName(id).toUpperCase();$('counter-name').textContent=CONTACTS[id].name;
  $('counter-text').textContent=note||hello(id,state.name);
  const body=$('counter-body');body.replaceChildren();
  const add=(label,onclick,cls,disabled)=>counterButton(body,label,onclick,cls,disabled);
  if(view==='menu'){
    const here=jobsAt(eco,id);
    for(const job of here.deliver)add(`Hand over ${itemLabel(job.item,job.qty)}`,()=>handOver(job));
    for(const job of here.collect)add(job.kind==='purchase'?`Buy ${itemLabel(job.item,job.qty)} · ${rm(job.cost)}`:`Collect ${itemLabel(job.item,job.qty)}`,()=>pickUp(job));
    if(STOCK[id])add('Buy',()=>openCounter(id,'buy',`Duit Poket: ${rm(eco.wallet)}. Pick something.`));
    add('Delivery work',()=>openCounter(id,'work'));
    if(id===21&&state.quest>=2)add('Main congkak',()=>{closeCounter();openBoard();});
    add('Leave',closeCounter,'secondary');
  }else if(view==='buy'){
    for(const item of STOCK[id]){
      const row=document.createElement('div');row.className='shop-row';
      const name=document.createElement('b');name.textContent=ITEMS[item].name;const price=document.createElement('span');price.textContent=rm(ITEMS[item].price);
      row.append(name,price);counterButton(row,'Beli',()=>{if(buy(eco,id,item).ok){persist();refreshEconomy();audio?.shell();openCounter(id,'buy',`${ITEMS[item].name} is in your bag. Duit Poket: ${rm(eco.wallet)}.`);}},'',eco.wallet<ITEMS[item].price);
      body.append(row);
    }
    add('Back',()=>openCounter(id),'secondary');
  }else if(view==='work'){
    const offer=offerAt(eco,id);
    if(offer){
      $('counter-text').textContent=offer.note;
      const card=document.createElement('dl');card.className='job-offer';
      const row=(term,value,cls='')=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=term;dd.textContent=value;dd.className=cls;card.append(dt,dd);};
      row('Item',ITEMS[offer.item].name);row('Quantity',String(offer.qty));
      row('Destination',`${placeName(offer.to)} · ${CONTACTS[offer.to].name} · about ${doorGap(id,offer.to)} m`);
      row('Type',offer.kind==='purchase'?`Buy the goods first (${rm(offer.cost)}, repaid on delivery)`:'Prepaid parcel');
      row('Upah',rm(offer.upah),'upah');body.append(card);
      add('Accept',()=>{const result=accept(eco,offer);if(!result.ok)return openCounter(id,'menu','Finish your current delivery first.');persist();refreshEconomy();openCounter(id,'menu',offer.kind==='purchase'?'Okay. Pay for the goods here, then off you go.':`Okay, ${state.name}. It is packed and ready for you.`);});
    }else $('counter-text').textContent=eco.jobs.length?'Finish the delivery you are carrying first, then come back.':'Nothing to send today. Maybe another time.';
    add('Back',()=>openCounter(id),'secondary');
  }
}
function pickUp(job){
  const result=collect(eco,job.id,counterPlace);
  if(!result.ok)return openCounter(counterPlace,'menu',result.reason==='funds'?`Not enough Duit Poket. You need ${rm(job.cost)}.`:'That is not ready here.');
  persist();refreshEconomy();
  openCounter(counterPlace,'menu',`${itemLabel(job.item,job.qty)} is in your bag. Bring it to ${CONTACTS[job.to].name} at ${placeName(job.to)}.`);
}
function handOver(job){
  const result=deliver(eco,job.id,counterPlace);
  if(!result.ok)return openCounter(counterPlace,'menu','Hmm, that does not seem right.');
  persist();refreshEconomy();audio?.shell();toast(`Delivered · +${rm(result.paid)} upah`);
  openCounter(counterPlace,'menu',`Terima kasih, ${state.name}! Here is your upah, ${rm(result.paid)}.`);
}
function closeCounter(){$('counter-panel').hidden=true;counterPlace=null;setMode('explore');}
$('counter-close').onclick=closeCounter;
function openBag(){
  if(mode!=='explore')return;setMode('bag');$('bag-panel').hidden=false;$('bag-wallet').textContent=`Duit Poket: ${rm(eco.wallet)}`;
  const list=$('bag-list');list.replaceChildren();
  const entries=Object.entries(eco.bag);
  if(!entries.length){const li=document.createElement('li');li.textContent='Your bag is empty.';list.append(li);}
  for(const [item,qty] of entries){const li=document.createElement('li'),a=document.createElement('span'),b=document.createElement('span');a.textContent=ITEMS[item].name;const job=eco.jobs.find(j=>j.item===item&&j.status==='carrying');b.textContent=`× ${qty}${job?` · for ${CONTACTS[job.to].name}`:''}`;li.append(a,b);list.append(li);}
}
function openBook(){
  if(mode!=='explore')return;setMode('book');$('book-panel').hidden=false;
  const item=(list,left,right)=>{const li=document.createElement('li'),a=document.createElement('span'),b=document.createElement('span');a.textContent=left;b.textContent=right;li.append(a,b);list.append(li);};
  const story=$('book-story');story.replaceChildren();item(story,quests[state.quest].title,state.quest===3?'Chapter complete':quests[state.quest].text());
  const jobs=$('book-jobs');jobs.replaceChildren();
  for(const job of eco.jobs)item(jobs,`${itemLabel(job.item,job.qty)} → ${placeName(job.to)}`,`${job.status==='accepted'?`Collect at ${placeName(job.from)}`:`Deliver to ${CONTACTS[job.to].name}`} · ${rm(job.upah)}`);
  if(!eco.jobs.length)item(jobs,target&&!target.job?`${CONTACTS[target.id].name} has work at ${placeName(target.id)}`:'No delivery in progress.','');
  $('book-summary').textContent=`Deliveries completed: ${eco.done.length} · Duit Poket: ${rm(eco.wallet)}`;
}
function closePanel(id){$(id).hidden=true;setMode('explore');}
$('bag-button').onclick=openBag;$('book-button').onclick=openBook;$('wallet-button').onclick=openBook;
$('bag-close').onclick=()=>closePanel('bag-panel');$('book-close').onclick=()=>closePanel('book-panel');
function openMap(){if(mode!=='explore')return;setMode('map');$('map-panel').hidden=false;drawMap($('town-map'),true);}
$('map-button').onclick=openMap;
$('map-close').onclick=()=>{$('map-panel').hidden=true;setMode('explore');};
function pause(){if(mode!=='explore')return;persist();setMode('pause');$('pause-panel').hidden=false;}
$('pause-button').onclick=pause;
$('resume-button').onclick=()=>{$('pause-panel').hidden=true;setMode('explore');};
$('home-button').onclick=()=>{persist();$('pause-panel').hidden=true;$('hud').hidden=true;$('start-screen').hidden=false;setMode('title');};
$('zoom').oninput=()=>{distance=Number($('zoom').value);};
window.addEventListener('keydown',event=>{
  if(orientationBlocked)return;
  if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.repeat && ['e','m','Escape'].includes(event.key))return;
  const key=event.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))event.preventDefault();
  keys.add(key);
  if(key==='e')interact();
  if(key==='b'){if(mode==='bag')closePanel('bag-panel');else openBag();}
  if(key==='j'){if(mode==='book')closePanel('book-panel');else openBook();}
  if(key==='m'){if(mode==='map')$('map-close').click();else openMap();}
  if(key==='escape'){if(mode==='counter')closeCounter();else if(mode==='bag')closePanel('bag-panel');else if(mode==='book')closePanel('book-panel');else if(mode==='map')$('map-close').click();else if(mode==='pause')$('resume-button').click();else if(mode==='board')closeBoard();else pause();}
});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',clearControls);
document.addEventListener('visibilitychange',()=>{clearControls();if(document.hidden&&mode!=='title')persist();});
window.addEventListener('pagehide',()=>{if(mode!=='title')persist();});
window.addEventListener('resize',syncOrientation);
window.addEventListener('orientationchange',syncOrientation);
document.addEventListener('fullscreenchange',syncOrientation);
$('world').addEventListener('wheel',event=>{if(mode==='explore'&&!orientationBlocked){distance=T.MathUtils.clamp(distance+event.deltaY*.01,CAMERA_NEAR,CAMERA_FAR);$('zoom').value=distance;}},{passive:true});
let stickPointer=null;
$('joystick').addEventListener('pointerdown',event=>{if(mode!=='explore'||orientationBlocked||stickPointer!==null)return;stickPointer=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);moveStick(event);});
function moveStick(event){
  if(event.pointerId!==stickPointer)return;
  const r=$('joystick').getBoundingClientRect(),knob=$('joystick-knob');
  const radius=Math.max(1,(r.width-knob.offsetWidth)/2-2);
  joystick=stickInput(event.clientX-r.left-r.width/2,event.clientY-r.top-r.height/2,radius);
  knob.style.transform=`translate(${joystick.x*radius}px,${joystick.y*radius}px)`;
}
$('joystick').addEventListener('pointermove',moveStick);
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(type,event=>{if(event.pointerId===stickPointer){stickPointer=null;joystick={x:0,y:0};$('joystick-knob').style.transform='';}});
$('run-button').onpointerdown=event=>{running=true;event.currentTarget.setPointerCapture(event.pointerId);};
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('run-button').addEventListener(type,()=>running=false);
// Orbit with a drag/swipe on the world, independent of the left joystick.
$('world').addEventListener('pointerdown', event => {
  if (mode !== 'explore' || orientationBlocked) return;
  viewPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  event.currentTarget.setPointerCapture(event.pointerId);
  if (viewPointers.size === 2) {
    const [a,b] = [...viewPointers.values()]; pinchDistance = Math.hypot(a.x-b.x,a.y-b.y);
  }
});
$('world').addEventListener('pointermove', event => {
  const previous = viewPointers.get(event.pointerId);
  if (!previous || mode !== 'explore' || orientationBlocked) return;
  viewPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (viewPointers.size === 2) {
    const [a,b] = [...viewPointers.values()]; const current = Math.hypot(a.x-b.x,a.y-b.y);
    if (pinchDistance) distance = T.MathUtils.clamp(distance * pinchDistance / Math.max(1,current), CAMERA_NEAR, CAMERA_FAR);
    pinchDistance = current; $('zoom').value = distance;
  } else if (viewPointers.size === 1) {
    yaw -= (event.clientX-previous.x) * .007; lastLook = elapsed;
    cameraPitch = T.MathUtils.clamp(cameraPitch + (event.clientY-previous.y)*.003, -.08, 1.0);
  }
});
for (const type of ['pointerup','pointercancel','lostpointercapture']) $('world').addEventListener(type, event => {
  viewPointers.delete(event.pointerId); pinchDistance = null;
});
// Sound starts only after the player enables it; it has no network dependency.
let audio=null;
$('sound').onchange=async()=>{
  try {
    if($('sound').checked){audio??=createSoundscape(()=>!document.hidden&&!orientationBlocked&&mode==='explore');await audio.resume();}
    else await audio?.suspend();
  }catch{$('sound').checked=false;toast('Sound is unavailable on this device.');}
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio?.suspend();else if($('sound').checked&&!orientationBlocked)audio?.resume();});

function openBoard(){setMode('board');board=newRound();boardBusy=false;boardToken++;$('board-panel').hidden=false;$('board-return').hidden=true;$('board-player-name').textContent=state.name;renderBoard();$('sowing-status').textContent='Choose any non-empty house on your bottom row.';}
function closeBoard(){boardToken++;boardBusy=false;$('board-panel').hidden=true;setMode('explore');persist();if(!board?.over)toast('Practice paused. Talk to Pak Mat to start a fresh round.');}
$('board-close').onclick=closeBoard;$('board-return').onclick=closeBoard;
function renderBoard(pits=board.pits,active=-1){
  const target=$('congkak-board');target.replaceChildren();
  const add=(index,column,row,store=false)=>{
    const button=document.createElement('button');button.className=`pit${store?' store':''}${index<7?' own':''}${index===active?' active':''}`;
    button.style.gridColumn=column;button.style.gridRow=store?'1 / 3':String(row);
    button.disabled=store||index>7||board.turn!==0||boardBusy||board.over||pits[index]===0;
    const label=store?(index===7?'Your store':"Pak Mat's store"):`${index<7?'Your':"Pak Mat's"} house ${(index%8)+1}`;
    button.setAttribute('aria-label',`${label}, ${pits[index]} shells`);
    const count=document.createElement('span');count.textContent=pits[index];button.append(count);
    const caption=document.createElement('small');caption.textContent=store?(index===7?'YOU':'PAK MAT'):Array.from({length:Math.min(3,pits[index])},()=> '•').join('');button.append(caption);
    button.onclick=()=>runMove(index);target.append(button);
  };
  add(15,'1',1,true);add(7,'9',1,true);
  for(let j=0;j<7;j++){add(14-j,String(j+2),1);add(j,String(j+2),2);}
  $('board-status').textContent=board.over?(board.winner===0?'You won!':board.winner===1?'Pak Mat wins this time.':'A friendly draw.')+` ${board.pits[7]} – ${board.pits[15]} shells.`:board.turn===0?`${state.name}'s turn · Choose a house below.`:'Pak Mat is thinking…';
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function runMove(index){
  if(mode!=='board'||boardBusy||board.over||!legalMoves(board).includes(index))return;
  const token=boardToken, mover=board.turn;
  boardBusy=true;const result=playMove(board,index);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stride=Math.max(1,Math.ceil(result.frames.length/45));
  for(let i=0;i<result.frames.length;i+=stride){while(orientationBlocked&&token===boardToken)await delay(150);if(token!==boardToken)return;const f=result.frames[i];renderBoard(f.pits,f.active);audio?.shell();$('sowing-status').textContent=f.hand?`${mover===0?state.name:'Pak Mat'} is sowing · ${f.hand} shells in hand`:'Last shell…';if(!reduced)await delay(55);}
  if(token!==boardToken)return;
  board=result.state;boardBusy=false;renderBoard();
  $('sowing-status').textContent=result.capture?`Captured ${result.capture} shells!`:result.extraTurn?'Last shell in the store — another turn.':'Turn complete.';
  if(board.over){
    $('board-return').hidden=false;
    if(state.quest===2){state.quest=3;state.completed=true;refreshQuest();persist();toast('Chapter complete · Your first kampung memory collected.');}
  }else if(board.turn===1){boardBusy=true;renderBoard();await delay(700);while(orientationBlocked&&token===boardToken)await delay(150);if(token!==boardToken)return;boardBusy=false;await runMove(opponentMove(board));}
}
function zoneAt(x,z){return districtAt(x,z).name;}
const directory=document.getElementById('town-directory');
for(const zone of DISTRICTS){
  const details=document.createElement('details'), summary=document.createElement('summary'), list=document.createElement('ol');
  summary.textContent=`${zone.name} · ${BUILDINGS.filter(b=>b.zone===zone.id).length}`;
  summary.style.color=zone.color;details.append(summary);
  for(const b of BUILDINGS.filter(b=>b.zone===zone.id)){const item=document.createElement('li');item.value=b.id;item.dataset.building=b.id;item.textContent=b.name;list.append(item);}
  details.append(list);directory.append(details);
}
// District labels sit on the emptiest ground inside each district, so they
// stay readable wherever the plan moves buildings.
const overlapArea=(a,b)=>Math.max(0,Math.min(a[0]+a[2]/2,b[0]+b[2]/2)-Math.max(a[0]-a[2]/2,b[0]-b[2]/2))*Math.max(0,Math.min(a[1]+a[3]/2,b[1]+b[3]/2)-Math.max(a[1]-a[3]/2,b[1]-b[3]/2));
// Districts can be spread across town, so each label looks for open ground
// near its own places, preferring the biggest cluster of them.
const mapLabels=DISTRICTS.map(d=>{
  const members=BUILDINGS.filter(b=>b.zone===d.id);
  const crowd=b=>members.filter(o=>Math.hypot(o.x-b.x,o.z-b.z)<25).length,anchor=members.reduce((a,b)=>crowd(b)>crowd(a)?b:a,members[0]);
  const w=d.short.length*1.9+2,h=4;let best={x:anchor.x,z:anchor.z,cost:Infinity};
  for(let x=anchor.x-24;x<=anchor.x+24;x+=2)for(let z=anchor.z-24;z<=anchor.z+24;z+=2){
    if(x-w/2<-80||x+w/2>78||z-h/2<-68||z+h/2>68)continue;
    const box=[x,z,w,h];let cost=Math.hypot(x-anchor.x,z-anchor.z)*.4;
    for(const b of BUILDINGS)cost+=overlapArea(box,[b.x,b.z,b.w,b.d])*4;
    for(const r of ROADS)cost+=overlapArea(box,[r.x,r.z,r.w,r.d]);
    for(const c of world.colliders)if(c.w!==undefined)cost+=overlapArea(box,[c.x,c.z,c.w,c.d])*2;
    if(cost<best.cost)best={x,z,cost};
  }
  return [best.x,best.z,d.short];
});
function drawMap(canvas,full=false){
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const px=x=>(x+82)/164*w,pz=z=>(z+70)/140*h;
  ctx.fillStyle='#dce3c2';ctx.fillRect(0,0,w,h);
  const rect=(x,z,rw,rh,color)=>{ctx.fillStyle=color;ctx.fillRect(px(x-rw/2),pz(z-rh/2),rw/164*w,rh/140*h);};
  // A soft halo of district colour around each place, wherever it stands.
  for(const b of BUILDINGS)rect(b.x,b.z,b.w+8,b.d+8,DISTRICTS.find(d=>d.id===b.zone).color+'1c');
  rect(-65,0,9,140,'#82aaa2');
  for(const r of ROADS)rect(r.x,r.z,r.w,r.d,r.kind==='asphalt'?'#a5aaa3':'#c9b990');
  for(const b of BRIDGES)rect(b.x,b.z,b.w,b.d,'#c7bd9e');
  for(const c of world.colliders){
    if(c.kind==='npc')continue;
    if(c.r!==undefined){ctx.fillStyle='#66745b';ctx.beginPath();ctx.arc(px(c.x),pz(c.z),Math.max(1,c.r*w/164),0,Math.PI*2);ctx.fill();}
    else rect(c.x,c.z,c.w,c.d,c.kind==='fence'?'#384b3f':'#827765');
  }
  for(const b of BUILDINGS){const color=DISTRICTS.find(d=>d.id===b.zone).color;rect(b.x,b.z,b.w,b.d,color+'95');}
  if(full){
    for(const b of BUILDINGS){
      const x=px(b.x),y=pz(b.z);ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fillStyle='#fff8e6';ctx.fill();ctx.strokeStyle='#272630';ctx.lineWidth=1.4;ctx.stroke();
      ctx.fillStyle='#272630';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(b.id),x,y+.5);
    }
    ctx.font='bold 11px system-ui';ctx.textAlign='center';for(const [x,z,label]of mapLabels){ctx.strokeStyle='#fff8e6';ctx.lineWidth=4;ctx.strokeText(label,px(x),pz(z));ctx.fillStyle='#272630';ctx.fillText(label,px(x),pz(z));}
  }
  const q=quests[state.quest];if(state.quest<3){ctx.fillStyle='#e8b535';ctx.beginPath();ctx.moveTo(px(q.x),pz(q.z)-6);ctx.lineTo(px(q.x)+5,pz(q.z));ctx.lineTo(px(q.x),pz(q.z)+6);ctx.lineTo(px(q.x)-5,pz(q.z));ctx.fill();}
  if(target){const x=px(target.x),y=pz(target.z),r=full?6:4;ctx.fillStyle='#b5986a';ctx.strokeStyle='#272630';ctx.lineWidth=1.2;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.strokeRect(x-r,y-r,r*2,r*2);}
  world.npcs.forEach(n=>{ctx.fillStyle='#3f6e5b';ctx.beginPath();ctx.arc(px(n.x),pz(n.z),full?4:2.5,0,Math.PI*2);ctx.fill();});
  const p=player.group.position;ctx.fillStyle='#b15c33';ctx.strokeStyle='#faf6df';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(p.x),pz(p.z),full?6:4,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.save();ctx.translate(px(p.x),pz(p.z));ctx.rotate(-player.group.rotation.y);ctx.fillStyle='#b15c33';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(-3,4);ctx.lineTo(3,4);ctx.fill();ctx.restore();
  if(full){ctx.textAlign='center';ctx.font='bold 11px system-ui';ctx.fillStyle='#272630';ctx.fillText('N ↑',w-25,20);}
}
const clock=new T.Clock();
const cameraTarget=new T.Vector3(),look=new T.Vector3();
function tick(){
  const dt=Math.min(clock.getDelta(),.25);elapsed+=dt;
  if(mode==='explore'&&!orientationBlocked){
    if(keys.has('q')||keys.has('r')){yaw+=(keys.has('r')?1:-1)*dt*1.3;lastLook=elapsed;}
    let sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x;
    let sy=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.y;
    const length=Math.hypot(sx,sy);if(length>1){sx/=length;sy/=length;}
    const dx=sx*Math.cos(yaw)-sy*Math.sin(yaw),dz=-sx*Math.sin(yaw)-sy*Math.cos(yaw);
    const isRunning=running||keys.has('shift');
    const p=player.group.position;
    const previousX=p.x,previousZ=p.z;
    moveWithCollision(p,dx,dz,isRunning?RUN_SPEED:WALK_SPEED,dt,world.canWalk);
    p.y=world.groundHeight(p.x,p.z)-.065;
    audio?.footsteps(Math.hypot(p.x-previousX,p.z-previousZ));
    if(length>.08){const angle=Math.atan2(dx,dz);player.group.rotation.y+=Math.atan2(Math.sin(angle-player.group.rotation.y),Math.cos(angle-player.group.rotation.y))*Math.min(1,dt*14);}
    const travel=Math.hypot(p.x-previousX,p.z-previousZ);
    // Chase camera: swing in behind the runner while they move, gently when
    // turning and not at all when they run back toward the lens.
    if(length>.08&&elapsed-lastLook>1.2){
      const behind=player.group.rotation.y+Math.PI,delta=Math.atan2(Math.sin(behind-yaw),Math.cos(behind-yaw));
      const weight=(Math.cos(delta)*.5+.5)*Math.min(1,travel/Math.max(.0001,dt*WALK_SPEED));
      yaw+=delta*(1-Math.exp(-dt*2.6*weight));
    }
    player.animate(dt,dt>0?Math.min(1,travel/(dt*(isRunning?RUN_SPEED:WALK_SPEED))):0,isRunning,travel);
    nearby=world.npcs.find(n=>Math.hypot(p.x-n.x,p.z-n.z)<3.6)||null;
    if(!nearby){let best=2.4;for(const b of BUILDINGS){if(b.id===21)continue;const gap=Math.hypot(p.x-b.door.x,p.z-b.door.z);if(gap<best){best=gap;nearby={kind:'place',id:b.id,x:b.door.x,z:b.door.z};}}}
    $('interaction').hidden=!nearby;
    if(nearby)$('interact-label').textContent=`Talk to ${nearby.kind==='place'?CONTACTS[nearby.id].name:nearby.id==='nur'?state.friend:'Pak Mat'}`;
    $('job-distance').textContent=target?`${Math.round(Math.hypot(p.x-target.x,p.z-target.z))} m away`:'';
    $('location-name').textContent=zoneAt(p.x,p.z);
    $('quest-distance').textContent=state.quest<3?`${Math.round(Math.hypot(p.x-quests[state.quest].x,p.z-quests[state.quest].z))} m away`:'';
    if(elapsed-lastSave>5){persist();lastSave=elapsed;}
  } else player.animate(dt,0);
  for(const character of world.characters)if(character!==player){character.group.visible=mode==='title'||character.group.position.distanceTo(player.group.position)<55;if(character.group.visible)character.animate(dt,0);}
  world.wind.value=elapsed;
  for(const marker of world.animated){marker.rotation.y+=dt*.8;marker.position.y=marker.userData.height+Math.sin(elapsed*2)*.12;}
  const p=player.group.position;
  if(mode==='title'){look.set(-30,0,25);cameraTarget.set(-10,32,58);}
  else{
    if(mode!=='dialogue')talkingTo=null;
    if(talkingTo){const shot=player.group.rotation.y+Math.PI+.8;yaw+=Math.atan2(Math.sin(shot-yaw),Math.cos(shot-yaw))*(1-Math.exp(-dt*3));}
    const reach=distance*Math.cos(cameraPitch);look.set(talkingTo?(p.x+talkingTo.x)/2:p.x,p.y+CAMERA_LOOK_HEIGHT,talkingTo?(p.z+talkingTo.z)/2:p.z);cameraTarget.set(look.x+Math.sin(yaw)*reach,look.y+distance*Math.sin(cameraPitch),look.z+Math.cos(yaw)*reach);
    // Pull in front of a wall behind the player; ease back out once clear.
    const clear=world.cameraClearance(look,cameraTarget),wanted=Math.min(distance,Math.max(.9,clear-.35));
    lensDistance=wanted<lensDistance?wanted:T.MathUtils.lerp(lensDistance,wanted,1-Math.exp(-dt*3));
    cameraTarget.sub(look).multiplyScalar(lensDistance/distance).add(look);
  }
  // Shadows cover the street ahead of the lens rather than behind it.
  if(mode==='title')world.updateSun(look.x,look.z);else world.updateSun(look.x-Math.sin(yaw)*16,look.z-Math.cos(yaw)*16);
  const fov=mode==='title'?43:CAMERA_FOV;if(Math.abs(camera.fov-fov)>.01){camera.fov=T.MathUtils.lerp(camera.fov,fov,1-Math.exp(-dt*5));camera.updateProjectionMatrix();}
  // A slow glide down from the title view, then a tight follow while exploring.
  cameraSettle=Math.min(1,cameraSettle+dt/1.6);
  const pulledIn=mode!=='title'&&lensDistance<distance-.05&&camera.position.distanceTo(look)>lensDistance+.1;
  camera.position.lerp(cameraTarget,1-Math.exp(-dt*(mode==='title'?4:pulledIn?24:T.MathUtils.lerp(2.5,10,cameraSettle*cameraSettle))));
  // During conversations aim lower, lifting both speakers above the dialogue panel.
  aimDrop=T.MathUtils.lerp(aimDrop,talkingTo?.85:0,1-Math.exp(-dt*4));camera.lookAt(look.x,look.y-aimDrop,look.z);
  world.updateOcclusion(camera,look,dt,mode==='explore'&&!orientationBlocked);
  // Modal minigames and menus keep the last world frame; no 3D work behind them.
  if (!orientationBlocked && !['board','map','pause','counter','bag','book'].includes(mode)) renderer.render(scene,camera);
  if(mode==='explore'&&Math.floor(elapsed*8)!==Math.floor((elapsed-dt)*8))drawMap($('minimap'));
  requestAnimationFrame(tick);
}
camera.position.set(-10,32,58);camera.lookAt(-30,0,25);refreshQuest();syncOrientation();$('loading').hidden=true;tick();
$('world').addEventListener('webglcontextlost',event=>{event.preventDefault();persist();$('error-text').textContent='The graphics session was interrupted. Reload to continue from your saved position.';$('error-panel').hidden=false;});
// Read-only snapshot for automated smoke tests and future diagnostics.
window.retroMalaysia={town:()=>({buildings:structuredClone(BUILDINGS),colliders:structuredClone(world.colliders)}),canWalk:(x,z)=>world.canWalk(x,z),snapshot:()=>({eco:structuredClone(eco),counter:counterPlace,nearbyPlace:nearby?.kind==='place'?nearby.id:null,parcel:world.jobMarker.visible?world.jobMarker.position.toArray().map(v=>+v.toFixed(2)):null,mode,orientationBlocked,cameraDistance:distance,cameraLens:lensDistance,cameraPitch,cameraYaw:yaw,...state,x:player.group.position.x,z:player.group.position.z,nearby:nearby?.id,board:board?structuredClone(board):null,graphics:{style:'low-poly-3d-comic',buildings:BUILDINGS.length,districts:DISTRICTS.length,collisionBodies:world.colliders.length,avatarHeight:player.height,occluded:world.occlusionCount(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}})};

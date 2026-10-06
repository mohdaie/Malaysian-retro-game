import * as T from 'three';
import { makeWorld, places } from './world.js?v=0.3.0';
import { newRound, legalMoves, playMove, opponentMove } from './congkak.js';
import { readSave, writeSave } from './save.js';
import { CAMERA_NEAR, CAMERA_FAR, CAMERA_DEFAULT, needsLandscape, enterLandscape } from './display.js?v=0.3.0';
import { WALK_SPEED, RUN_SPEED, stickInput, moveWithCollision } from './movement.js?v=0.3.0';
import { createSoundscape } from './soundscape.js?v=0.3.0';
const $ = id => document.getElementById(id);
let world;
try { world = await makeWorld($('world')); } catch (error) {
  $('loading').hidden = true; $('start-screen').hidden = true; $('error-panel').hidden = false;
  $('error-text').textContent = 'The game could not load its graphics. Check your connection and retry. Your browser needs WebGL with hardware acceleration enabled.';
  throw error;
}
const { player, camera, renderer, scene } = world;
const state = { name: 'Amir', friend: 'Nur', quest: 0, completed: false };
let mode = 'title', yaw = .55, distance = CAMERA_DEFAULT, elapsed = 0, lastSave = 0, nearby = null;
let dialogue = [], dialogueDone = null, joystick = { x: 0, y: 0 }, running = false, board = null, boardBusy = false, boardToken = 0;
let cameraTilt = .64;
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
  { title: 'A familiar face', text: () => `Find ${state.friend} outside your kampung house.`, x: -35, z: 36 },
  { title: 'Down to the pekan', text: () => 'Follow the lane to Warung Pak Mat. He has a congkak board waiting.', x: 12, z: -.5 },
  { title: 'Seven little houses', text: () => 'Talk to Pak Mat and finish your first congkak practice round.', x: 12, z: -.5 },
  { title: 'An afternoon well spent', text: () => 'First chapter complete. Explore the town, or ask Pak Mat for a rematch.', x: 12, z: -.5 }
];
function refreshQuest() {
  const q = quests[state.quest];
  $('quest-title').textContent = q.title; $('quest-description').textContent = q.text();
  $('quest-step').textContent = state.quest === 3 ? 'CHAPTER COMPLETE' : `0${state.quest + 1} / 03`;
  $('quest-progress').style.width = `${(state.quest+1)/4*100}%`;
  world.npcs[0].marker.visible = state.quest === 0;
  world.npcs[1].marker.visible = state.quest > 0;
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
  const ok = writeSave(storage, { version: 1, ...state, x: player.group.position.x, z: player.group.position.z });
  $('save-status').textContent = ok ? 'Progress saved on this device.' : 'Saving unavailable in this browser. You can still play this session.';
  if(ok) { saved = readSave(storage); $('continue-button').hidden = false; }
  return ok;
}
function begin(value = null) {
  if(value) Object.assign(state, { name: value.name, friend: value.friend, quest: value.quest, completed: value.completed });
  else Object.assign(state, { name: $('player-name').value.trim().slice(0,20) || 'Amir', friend: $('friend-name').value.trim().slice(0,20) || 'Nur', quest: 0, completed: false });
  let x = value?.x ?? -43, z = value?.z ?? 38;
  if(!world.canWalk(x,z)) { x=-43; z=38; }
  player.group.position.set(x,0,z);
  world.renameHomes(state.name, state.friend);
  $('start-screen').hidden = true; $('hud').hidden = false;
  setMode('explore'); refreshQuest(); persist();
  toast(value ? `Selamat kembali, ${state.name}.` : `Welcome home, ${state.name}. Find ${state.friend} by the lane.`);
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
  const p=player.group.position;
  player.group.rotation.y=Math.atan2(nearby.x-p.x,nearby.z-p.z);
  if(nearby.id==='nur') {
    if(state.quest===0) showDialogue(state.friend,[`${state.name}! You're back! It feels like we haven't played in ages.`,"Pak Mat has put the congkak board out at his warung. Walk up the lane, turn right at the road, and look for the green roof.","I'll see you in the pekan. Don't let him take all your shells!"],()=>{state.quest=1;refreshQuest();persist();toast('New destination: Warung Pak Mat. Open the map to see the way.');});
    else showDialogue(state.friend,[state.quest===3?'One more round? Pak Mat never gets tired of congkak.':"The warung is just past the road. There's no hurry — enjoy the afternoon."]);
  } else {
    if(state.quest===0) showDialogue('Pak Mat',[`Ah, ${state.name}! ${state.friend} was looking for you near your house. Go say hello first.`]);
    else if(state.quest===1) showDialogue('Pak Mat',[`${state.name}, lama tak jumpa! Sit down. A good afternoon needs a good game.`,"Seven houses, seven shells each. Bring more shells home than me. I'll show you as we go."],()=>{state.quest=2;refreshQuest();persist();openBoard();});
    else showDialogue('Pak Mat',[state.quest===3?"Back for another round? Jom, let's play!":"The board is ready. Pick one of your houses and we'll begin."],openBoard);
  }
}
$('interact-button').onclick=interact;
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
  if(key==='m'){if(mode==='map')$('map-close').click();else openMap();}
  if(key==='escape'){if(mode==='map')$('map-close').click();else if(mode==='pause')$('resume-button').click();else if(mode==='board')closeBoard();else pause();}
});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',clearControls);
document.addEventListener('visibilitychange',()=>{clearControls();if(document.hidden&&mode!=='title')persist();});
window.addEventListener('pagehide',()=>{if(mode!=='title')persist();});
window.addEventListener('resize',syncOrientation);
window.addEventListener('orientationchange',syncOrientation);
document.addEventListener('fullscreenchange',syncOrientation);
$('world').addEventListener('wheel',event=>{if(mode==='explore'&&!orientationBlocked){distance=T.MathUtils.clamp(distance+event.deltaY*.02,CAMERA_NEAR,CAMERA_FAR);$('zoom').value=distance;}},{passive:true});
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
    yaw -= (event.clientX-previous.x) * .007;
    cameraTilt = T.MathUtils.clamp(cameraTilt + (event.clientY-previous.y)*.003, .4, 1.05);
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
function zoneAt(x,z){if(x<-30)return 'Kampung Melati';if(z<-28&&x<15)return 'SK Seri Kenangan';if(z<-24&&x>30)return 'Masjid Seri Kenangan';if(x>40&&z<15)return 'Stesen bas';if(x>20&&z>15)return 'Tapak pasar malam';if(z>36)return 'Taman Kenangan';return 'Pekan lama';}
function drawMap(canvas,full=false){
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const px=x=>(x+82)/164*w,pz=z=>(z+70)/140*h;
  ctx.fillStyle='#dce3c2';ctx.fillRect(0,0,w,h);
  const rect=(x,z,rw,rh,color)=>{ctx.fillStyle=color;ctx.fillRect(px(x-rw/2),pz(z-rh/2),rw/164*w,rh/140*h);};
  rect(-65,0,9,140,'#82aaa2');rect(0,4,164,8,'#c0baa4');rect(-25,0,7,132,'#c0baa4');rect(62,0,7,100,'#c0baa4');rect(-42,24,5,62,'#c9b990');rect(4,37,90,4,'#c9b990');rect(-65,4,14,8,'#c7bd9e');rect(-65,37,14,8,'#c7bd9e');
  world.colliders.forEach(c=>rect(c.x,c.z,c.w,c.d,'#9a8f72'));
  const q=quests[state.quest];if(state.quest<3){ctx.fillStyle='#c89b42';ctx.beginPath();ctx.moveTo(px(q.x),pz(q.z)-6);ctx.lineTo(px(q.x)+5,pz(q.z));ctx.lineTo(px(q.x),pz(q.z)+6);ctx.lineTo(px(q.x)-5,pz(q.z));ctx.fill();}
  world.npcs.forEach(n=>{ctx.fillStyle='#3f6e5b';ctx.beginPath();ctx.arc(px(n.x),pz(n.z),full?4:2.5,0,Math.PI*2);ctx.fill();});
  const p=player.group.position;ctx.fillStyle='#b15c33';ctx.strokeStyle='#faf6df';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(p.x),pz(p.z),full?6:4,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.save();ctx.translate(px(p.x),pz(p.z));ctx.rotate(-player.group.rotation.y);ctx.fillStyle='#b15c33';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(-3,4);ctx.lineTo(3,4);ctx.fill();ctx.restore();
  if(full){ctx.textAlign='center';ctx.font='bold 13px system-ui';places.forEach(place=>{let name=place.name;if(place.type==='home')name=`${state.name}'s house`;if(place.type==='terrace')name=`${state.friend}'s terrace`;const x=px(place.x),y=pz(place.z)+(place.type==='school'?22:19);ctx.strokeStyle='#eff1d9';ctx.lineWidth=4;ctx.strokeText(name,x,y);ctx.fillStyle='#485b47';ctx.fillText(name,x,y);});ctx.font='11px system-ui';ctx.fillStyle='#486457';ctx.fillText('N ↑',w-25,25);}
}
const clock=new T.Clock();
const cameraTarget=new T.Vector3(),look=new T.Vector3();
function tick(){
  const dt=Math.min(clock.getDelta(),.25);elapsed+=dt;
  if(mode==='explore'&&!orientationBlocked){
    if(keys.has('q'))yaw-=dt*1.3;if(keys.has('r'))yaw+=dt*1.3;
    let sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x;
    let sy=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.y;
    const length=Math.hypot(sx,sy);if(length>1){sx/=length;sy/=length;}
    const dx=sx*Math.cos(yaw)-sy*Math.sin(yaw),dz=-sx*Math.sin(yaw)-sy*Math.cos(yaw);
    const isRunning=running||keys.has('shift');
    const p=player.group.position;
    const previousX=p.x,previousZ=p.z;
    moveWithCollision(p,dx,dz,isRunning?RUN_SPEED:WALK_SPEED,dt,world.canWalk);
    audio?.footsteps(Math.hypot(p.x-previousX,p.z-previousZ));
    if(length>.08){const angle=Math.atan2(dx,dz);player.group.rotation.y+=Math.atan2(Math.sin(angle-player.group.rotation.y),Math.cos(angle-player.group.rotation.y))*Math.min(1,dt*14);}
    player.animate(dt,length>.08?Math.min(length,1):0,isRunning);
    nearby=world.npcs.find(n=>Math.hypot(p.x-n.x,p.z-n.z)<3.6)||null;
    $('interaction').hidden=!nearby;
    if(nearby)$('interact-label').textContent=`Talk to ${nearby.id==='nur'?state.friend:'Pak Mat'}`;
    $('location-name').textContent=zoneAt(p.x,p.z);
    $('quest-distance').textContent=state.quest<3?`${Math.round(Math.hypot(p.x-quests[state.quest].x,p.z-quests[state.quest].z))} m away`:'';
    if(elapsed-lastSave>5){persist();lastSave=elapsed;}
  } else player.animate(dt,0);
  for(const character of world.characters)if(character!==player){character.group.visible=mode==='title'||character.group.position.distanceTo(player.group.position)<55;if(character.group.visible)character.animate(dt,0);}
  for(const marker of world.animated){marker.rotation.y+=dt*.8;marker.position.y=3.2+Math.sin(elapsed*2)*.12;}
  const p=player.group.position;
  if(mode==='title'){look.set(-30,0,25);cameraTarget.set(-10,32,58);}
  else{look.set(p.x,1,p.z);cameraTarget.set(p.x+Math.sin(yaw)*distance,p.y+distance*cameraTilt,p.z+Math.cos(yaw)*distance);}
  world.updateSun(look.x,look.z);
  camera.position.lerp(cameraTarget,1-Math.exp(-dt*4));camera.lookAt(look);
  world.updateOcclusion(camera,look,dt,mode==='explore'&&!orientationBlocked);
  // Modal minigames and menus keep the last world frame; no 3D work behind them.
  if (!orientationBlocked && !['board','map','pause'].includes(mode)) renderer.render(scene,camera);
  if(mode==='explore'&&Math.floor(elapsed*8)!==Math.floor((elapsed-dt)*8))drawMap($('minimap'));
  requestAnimationFrame(tick);
}
camera.position.set(-10,32,58);camera.lookAt(-30,0,25);refreshQuest();syncOrientation();$('loading').hidden=true;tick();
$('world').addEventListener('webglcontextlost',event=>{event.preventDefault();persist();$('error-text').textContent='The graphics session was interrupted. Reload to continue from your saved position.';$('error-panel').hidden=false;});
// Read-only snapshot for automated smoke tests and future diagnostics.
window.retroMalaysia={snapshot:()=>({mode,orientationBlocked,cameraDistance:distance,cameraHeightRatio:cameraTilt,cameraYaw:yaw,...state,x:player.group.position.x,z:player.group.position.z,nearby:nearby?.id,board:board?structuredClone(board):null,graphics:{occluded:world.occlusionCount(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}})};

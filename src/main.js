import { TAMIYA_PARTS } from './tamiya-parts.js?v=2.11.0';
import * as T from 'three';
import { makeWorld } from './world.js?v=2.11.0';
import { createBicycle, stepBike } from './bicycle.js?v=2.11.0';
import { newRound, legalMoves, playMove, opponentMove } from './congkak.js?v=2.11.0';
import { readSave, readSaves, writeSave } from './save.js?v=2.11.0';
import { CAMERA_NEAR, CAMERA_FAR, CAMERA_DEFAULT, CAMERA_PITCH, CAMERA_LOOK_HEIGHT, CAMERA_FOV, needsLandscape, enterLandscape } from './display.js?v=2.11.0';
import { WALK_SPEED, RUN_SPEED, stickInput, moveWithCollision } from './movement.js?v=2.11.0';
import { createSoundscape } from './soundscape.js?v=2.11.0';
import { createMusic, readAudioSettings, saveAudioSettings } from './music.js?v=2.11.0';
import { BUILDINGS, DISTRICTS, ROADS, BRIDGES, PREVIEW, districtAt } from './town-layout.js?v=2.11.0';
import { newEconomy, cleanEconomy, offersAt, accept, collect, deliver, cancel, buy, jobsAt, nextStop, befriend, freeSpace, usedSpace, ITEMS, STOCK, BAG_SPACE, MAX_JOBS, rm, itemLabel, level } from './economy.js?v=2.11.0';
import { NPCS, NPC_KEYS, RESIDENTS, KEEPERS, keeperAt, npcAt, contactAt, line } from './cast.js?v=2.11.0';
import { tripAt } from './errands.js?v=2.11.0';
import { crowdPose, RUN_SPEED as KID_RUN, WALK_SPEED as CROWD_WALK } from './crowds.js?v=2.11.0';
import { PLAYERS, STEPS, DONE, CHAPTER, MILESTONES, STORY_EVENTS, advance, storyOffers, chapterGuide, shareKeepsake, EXHIBITION_STORIES } from './story.js?v=2.11.0';
import { itemThumbnail, itemIdentity, catalogueCard, detailContents } from './item-ui.js?v=2.11.0';
import { ITEM_KINDS } from './item-art.js?v=2.11.0';
import { newClock, cleanClock, tickClock, canSleep, sleep, weekday, timeLabel, period, isNight, onDuty, dayKey, skyAt, LATEST, HOURS } from './clock.js?v=2.11.0';
import { createGasingUI } from './gasing-ui.js?v=2.11.0';
import { GASING_QUESTS } from './gasing-progress.js?v=2.11.0';
import { createDamUI } from './dam-ui.js?v=2.11.0';
import { DAM_QUESTS } from './dam-progress.js?v=2.11.0';
import { createTamiyaUI } from './tamiya-ui.js?v=2.11.0';
import { TAMIYA_QUESTS } from './tamiya-progress.js?v=2.11.0';
import { TAMIYA_CARS } from './tamiya-cars.js?v=2.11.0';
import { tamiyaCatalogue } from './tamiya-catalogue.js?v=2.11.0';
import { createTownMap } from './town-map-ui.js?v=2.11.0';
import { findWalkRoute, clearSegment, routeLength } from './map-navigation.js?v=2.11.0';
import { TOWN_BOUNDS } from './town-layout.js?v=2.11.0';
import { isShop, isShopOpen, shopHours } from './shop-hours.js?v=2.11.0';
import { PRAYERS, prayerState, performPrayer } from './prayer.js?v=2.11.0';
import { NOSTALGIA_ITEMS } from './nostalgia-items.js?v=2.11.0';
import { NOSTALGIA_QUESTS, storyNeedsHome, nostalgiaAt, nostalgiaStatus, startNostalgia, followNostalgiaClue, recordNostalgiaWin, claimNostalgia, nostalgiaOffers } from './nostalgia-quests.js?v=2.11.0';
import { memoryQuestCard } from './nostalgia-ui.js?v=2.11.0';
import { renderQuestJournal } from './journal-ui.js?v=2.11.0';
import { chapterBrief } from './journal.js?v=2.11.0';
const $ = id => document.getElementById(id);
let world;
try { world = await makeWorld($('world')); } catch (error) {
  $('loading').hidden = true; $('start-screen').hidden = true; $('error-panel').hidden = false;
  $('error-text').textContent = 'The game could not load its graphics. Check your connection and retry. Your browser needs WebGL with hardware acceleration enabled.';
  throw error;
}
const { camera, renderer, scene } = world;
// Moves (v2.1): jump, duck, say hi, walk and the bicycle. The bike parks at
// home, stays wherever it is left and saves with the game.
const bicycle = createBicycle(scene), WALK_ONLY = 1.35, JUMP_SPEED = 4.3, GRAVITY = 13;
let bike = { x: 0, z: 0, heading: 0, speed: 0, steer: 0, lean: 0 }, riding = false, crouching = false, walkOnly = false, bikeStuck = 0;
let jumpY = 0, jumpVy = 0, airborne = false, jumpQueued = -1, jumpedNow = false, landedNow = false;
let player = world.player;
// Who you play, your name and the chapter step; the economy (Duit Poket, bag,
// collection, jobs, friendship) lives in `eco` and saves with them.
const state = { who: 'amir', name: 'Amir', story: 0, exhibition: null };
// The town clock (clock.js): game day and minute, saved with the rest.
let time = newClock(), shownMinute = -1, lateNudge = 0, sleeping = false;
let eco = newEconomy(), counter = null, storySpot = null, opponent = 'Nenek';
let mode = 'title', yaw = .55, distance = CAMERA_DEFAULT, elapsed = 0, lastSave = 0, nearby = null;
let navigation = null, lastNavigationUpdate = -1;
let praying = false;
let dialogue = [], dialogueDone = null, joystick = { x: 0, y: 0 }, running = false, board = null, boardBusy = false, boardToken = 0;
// Pitch above the shoulders; a recent swipe pauses the automatic follow.
let errandClock = null, cameraPitch = CAMERA_PITCH, lastLook = -10, cameraSettle = 1, lensDistance = CAMERA_DEFAULT, talkingTo = null, aimDrop = 0;
const viewPointers = new Map();
let pinchDistance = null;
let orientationBlocked = needsLandscape(innerWidth, innerHeight);
const keys = new Set();
let storage;
try { storage = localStorage; } catch { storage = null; }
// Each character keeps their own saved journey.
let saves = readSaves(storage), saved = null;
const damUI = createDamUI({ getEco: () => eco, getName: () => state.name, isPaused: () => orientationBlocked || document.hidden,
  onOpen: () => { $('hud').inert=true; setMode('dam'); }, onClose: () => { $('hud').inert=false; setMode('explore'); $('interact-button').focus(); },
  onChange: () => { refreshEconomy(); persist(); } });
const gasingUI = createGasingUI({ getEco: () => eco, getName: () => state.name, isPaused: () => orientationBlocked || document.hidden,
  onOpen: () => { $('hud').inert=true; setMode('gasing'); }, onClose: () => { $('hud').inert=false; setMode('explore'); },
  onChange: () => { refreshEconomy(); persist(); } });
const tamiyaUI = createTamiyaUI({ getEco: () => eco, getName: () => state.name, isPaused: () => orientationBlocked || document.hidden,
  onOpen: () => { $('hud').inert=true; setMode('tamiya'); }, onClose: () => { $('hud').inert=false; setMode('explore'); $('interact-button').focus(); },
  onChange: () => { refreshEconomy(); persist(); } });
// Play as Amir or Nur. The name field follows the choice until it is edited.
let chosen = 'amir';
function choose(who) {
  chosen = who; saved = saves[who];
  for (const b of document.querySelectorAll('[data-who]')) b.setAttribute('aria-pressed', String(b.dataset.who === who));
  // Their saved name, or the default; Continue shows where their journey is.
  $('player-name').value = saved?.name ?? PLAYERS[who].name; delete $('player-name').dataset.edited;
  $('continue-button').hidden = !saved;
  if (saved) $('continue-button').textContent = `Continue ${saved.name}'s story · Hari ${saved.clock?.day ?? 1} · ${rm(saved.wallet)} →`;
}
for (const b of document.querySelectorAll('[data-who]')) b.onclick = () => choose(b.dataset.who);
$('player-name').addEventListener('input', () => { $('player-name').dataset.edited = '1'; });
choose(readSave(storage)?.who ?? 'amir');

const today = () => dayKey(time);
const placeOf = id => BUILDINGS.find(b => b.id === id);
const npcBody = key => world.npcs.find(n => n.id === key);
// Everyone with a body in the town: the 14 NPCs, then the 24 residents.
const townsfolk = () => [...world.npcs, ...world.residents];
const atPost = n => Boolean(n) && (onDuty(n.id, time.minute) || n.id==='salleh'&&eco.nostalgia.quests.nostalgia_M05?.stage==='trail'&&time.minute>=19*60&&time.minute<22*60);
const myHome = () => PLAYERS[state.who].home;
const placeName = id => id === 1 ? `Rumah ${state.who === 'amir' ? state.name : 'Amir'}` : id === 11 ? `Rumah ${state.who === 'nur' ? state.name : 'Nur'}` : placeOf(id).name;
const doorGap = (a, b) => Math.hypot(placeOf(a).door.x - placeOf(b).door.x, placeOf(a).door.z - placeOf(b).door.z);
// The person who answers at a place: its NPC if they are posted there, the
// player's own parent at home, else the resident. Null while its NPC is away:
// out at their post, or gone home for the night when their post is here.
function personAt(place) {
  const key = npcAt(place);
  if (key) { const n = npcBody(key); return n && (atPost(n) ? n.post === place : n.post !== place) ? { key, name: NPCS[key].name } : null; }
  if (place === myHome()) return { key: null, name: PLAYERS[state.who].parent };
  const c = doorContact(place); return c ? { key: null, name: c.name } : null;
}
// A resident's door: the resident, or the family keeping the house while
// they are out on an errand, or whichever of the two the player walked up to.
function doorContact(place) {
  const c = contactAt(place), k = keeperAt(place); if (!c || !k) return c;
  const out = world.residents.find(n => n.id === RESIDENTS[place]?.key)?.errand?.away(), trip = out && tripAt(RESIDENTS[place].key, time.minute);
  const back = storyNeedsHome(eco, place) ? ` ${RESIDENTS[place].name} dalam perjalanan balik.` : trip ? ` ${RESIDENTS[place].name} balik lebih kurang ${timeLabel(trip.until)}.` : '';
  if (out) return { ...KEEPERS[k], key: null, standIn: true, hello: KEEPERS[k].hello + back };
  return counter?.place === place && counter.who === k ? { ...KEEPERS[k], key: null, standIn: true } : c;
}
// The name a resident or keeper's body goes by: Amir's and Nur's mothers are
// Mak and Ibu to their own child.
const bodyName = n => n.keeper ? KEEPERS[n.id].name : n.place === myHome() ? PLAYERS[state.who].parent : RESIDENTS[n.place].name;
const sayLine = text => line(text, state.name);

// ---- Story ----
function storyTarget() {
  const guide = chapterGuide(state.story, eco, state.exhibition), target = guide.target;
  if (!target) return null;
  if (typeof target === 'object') { const p=placeOf(target.place);return { x:p.door.x,z:p.door.z,job:target.job }; }
  if (target === 'job') { const job = eco.jobs.find(j => j.story); if (!job) return null; const p = placeOf(job.status === 'accepted' ? job.from : nextStop(job)); return { x: p.door.x, z: p.door.z, job: true }; }
  const n = npcBody(target);
  if(atPost(n))return { x:n.x,z:n.z,height:n.character.height };
  if(guide.step===11&&n?.post!==NPCS[target].place){const p=placeOf(NPCS[target].place);return {x:p.door.x,z:p.door.z};}
  return null;
}
function refreshQuest() {
  const guide = chapterGuide(state.story, eco, state.exhibition);state.story=guide.step;
  const gone = typeof guide.target==='string' && NPCS[guide.target] && !atPost(npcBody(guide.target)) && !storyTarget();
  $('quest-chapter').textContent = CHAPTER; $('quest-title').textContent = guide.title;
  const brief=chapterBrief(guide,eco,placeName);
  $('quest-description').textContent = gone ? `${brief} ${NPCS[guide.target].name} ${time.minute>=(HOURS[guide.target]||HOURS.default)[1]?'has gone home for the night; sleep, and find them tomorrow.':`comes out at ${timeLabel((HOURS[guide.target]||HOURS.default)[0])}.`}` : brief;
  $('quest-phase').textContent=guide.phase;
  $('quest-step').textContent = state.story >= DONE ? 'CHAPTER COMPLETE' : `${String(state.story + 1).padStart(2,'0')} / ${String(DONE).padStart(2,'0')}`;
  $('quest-progress').style.width = `${Math.min(1, state.story / DONE) * 100}%`;
  storySpot = storyTarget(); world.setStoryMarker(storySpot && !storySpot.job ? storySpot : null);
  const home = document.querySelector('[data-building="1"]'), other = document.querySelector('[data-building="11"]');
  if (home) home.textContent = placeName(1);
  if (other) other.textContent = placeName(11);
}
function storyEvent(event) {
  const next = advance(state.story, event); if (next === state.story) return false;
  for (const key of MILESTONES[event] || []) befriend(eco, key, 'story', today());
  state.story = next; refreshQuest(); refreshEconomy(); persist();
  toast(state.story === DONE ? 'Chapter 1 complete · Your story is part of Pameran Kenangan.' : `New step · ${STEPS[state.story].title}`);
  return true;
}

function clearControls() { if(stickPointer!==null){const stick=$('joystick');if(stick.hasPointerCapture(stickPointer))stick.releasePointerCapture(stickPointer);stickPointer=null;} viewPointers.clear(); pinchDistance = null; keys.clear(); joystick = { x: 0, y: 0 }; running = false; $('joystick-knob').style.transform = ''; }
function syncOrientation() {
  orientationBlocked = needsLandscape(innerWidth, innerHeight);
  $('orientation-panel').hidden = !orientationBlocked;
  if (orientationBlocked) clearControls();
  world.resize();
  syncAudio();
}
$('landscape-button').onclick = () => enterLandscape($('game'));
function setMode(next) {
  mode = next; syncAudio(); $('navigation-hud').hidden=next!=='explore'||!navigation; clearControls(); $('interaction').hidden = true;
  $('touch-controls').style.visibility = next === 'explore' ? '' : 'hidden';
}
function persist() {
  refreshQuest();
  const ok = writeSave(storage, { version: 3, ...state, ...eco, clock: { ...time }, bike: { x: bike.x, z: bike.z, heading: bike.heading }, x: player.group.position.x, z: player.group.position.z });
  $('save-status').textContent = ok ? 'Progress saved on this device.' : 'Saving unavailable in this browser. You can still play this session.';
  if(ok) { saves[state.who] = readSave(storage, state.who); }
  return ok;
}
function begin(value = null) {
  navigation=null;$('navigation-hud').hidden=true;
  if (value) Object.assign(state, { who: value.who, name: value.name, story: value.story });
  else Object.assign(state, { who: chosen, name: $('player-name').value.trim().slice(0, 20) || PLAYERS[chosen].name, story: 0 });
  state.exhibition=value?.exhibition||null;
  eco = value ? cleanEconomy(value) : newEconomy();
  time = cleanClock(value?.clock); shownMinute = -1; lateNudge = 0; showTime();
  player = world.choosePlayer(state.who);
  // A save from an older layout may stand inside a moved building.
  const home = world.spawns[state.who];
  let x = value?.x ?? home.x, z = value?.z ?? home.z;
  if (!world.canWalk(x, z) || value?.upgraded) { x = home.x; z = home.z; }
  player.group.position.set(x, world.groundHeight(x, z) - .065, z);
  if (!value) player.group.rotation.y = home.heading;
  yaw = player.group.rotation.y + Math.PI; cameraPitch = CAMERA_PITCH; cameraSettle = 0;
  riding = crouching = walkOnly = airborne = false; jumpY = 0; jumpQueued = -1; player.group.rotation.z = 0;
  const parked = value?.bike && world.canWalk(value.bike.x, value.bike.z) ? value.bike : parkAtHome();
  bike = { x: parked.x, z: parked.z, heading: parked.heading, speed: 0, steer: 0, lean: 0 };
  bicycle.setColour(state.who === 'nur' ? 0x4fa58f : 0xc8322c); bicycle.setSize(player.bikeScale ?? 1); parkBike(); updateMoveButtons();
  world.renameHomes(state.who === 'amir' ? state.name : 'Amir', state.who === 'nur' ? state.name : 'Nur');
  $('start-screen').hidden = true; $('hud').hidden = false;
  setMode('explore'); refreshQuest(); refreshEconomy(); persist();
  toast(PREVIEW ? 'Map preview · this layout comes from the map editor link.' : value?.upgraded ? `Selamat kembali, ${state.name}. The story has been rewritten: chapter 1 starts fresh, and your Duit Poket is kept.` : value ? `Selamat kembali, ${state.name}.` : `Cuti sekolah! Faiz and Mei Ling are at the padang.`);
  if(PREVIEW)$('day-label').textContent='Map preview';
}
// ---- Town clock: the light follows the time; from Maghrib you can sleep at
// home and wake at Subuh the next day. ----
function showTime(){
  const minute=Math.floor(time.minute);if(minute===shownMinute)return;
  const wasNight=shownMinute>=0&&!isNight(shownMinute)&&isNight(minute);shownMinute=minute;
  world.setSky(skyAt(minute));
  world.setShopTime(minute);
  const label=`${weekday(time.day)} · ${timeLabel(minute)}`;
  if(!PREVIEW)$('day-label').textContent=label;$('day-icon').textContent=isNight(minute)?'☾':'☀';$('hud').classList.toggle('night',isNight(minute));
  $('clock-label').textContent=`HARI ${time.day} · ${label} · ${period(minute)}`.toUpperCase();
  // Who is out changes with the hour, and so does the story marker.
  refreshQuest();
  if(wasNight)toast('Dah Maghrib. The shops are closing. Go home to sleep when you are ready.');
  if(minute>=22*60&&lateNudge<1){lateNudge=1;toast('Dah lewat malam. Time to go home and sleep.');}
  if(minute>=LATEST&&lateNudge<2){lateNudge=2;toast(`It is very late. Go home to ${placeName(myHome())} and sleep.`);}
}
$('start-form').addEventListener('submit', event => { event.preventDefault(); if (matchMedia('(pointer: coarse)').matches) void enterLandscape($('game')); if(saved) {
  const other = Object.keys(PLAYERS).find(w => w !== chosen);
  showDialogue('A new afternoon', [`Starting a new story as ${PLAYERS[chosen].name} replaces ${saved.name}'s saved journey on this device.${saves[other] ? ` ${saves[other].name}'s journey${saves[other].name === PLAYERS[other].name ? '' : ` as ${PLAYERS[other].name}`} is kept.` : ''}`], () => begin());
  $('dialogue-next').textContent = 'Start new story →';
  const cancelButton=document.createElement('button');cancelButton.textContent='Keep my saved journey';cancelButton.className='secondary';cancelButton.id='cancel-new';
  cancelButton.onclick=()=>{cancelButton.remove();$('dialogue-panel').hidden=true;setMode('title');};$('dialogue-panel').append(cancelButton);
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
  if(riding)dismount();
  if(nearby.kind==='place'){openCounter(nearby.id);return;}
  // Face each other; the camera swings to an over-the-shoulder two-shot.
  const p=player.group.position;
  player.group.rotation.y=Math.atan2(nearby.x-p.x,nearby.z-p.z);
  nearby.character.group.rotation.y=Math.atan2(p.x-nearby.x,p.z-nearby.z);
  // Out on an errand, a resident stops for a word in the street; at home,
  // a resident or the family keeping house serves their place's counter.
  if(nearby.kind==='resident'){
    if(nearby.errand?.away()){talkingTo=nearby;const trip=tripAt(nearby.id,time.minute);showDialogue(bodyName(nearby),[sayLine(trip?.say||'Nak balik rumah dulu.')]);return;}
    doorWho=nearby.id;openCounter(nearby.place);return;
  }
  talkingTo=nearby;
  const key=nearby.id;
  // Chapter 1 opens with the two friends at the padang.
  if(state.story===0&&(key==='faiz'||key==='meiling')){
    showDialogue(`${NPCS.faiz.name} & ${NPCS.meiling.name}`,[
      `${state.name}! Cuti sekolah dah mula! Two whole weeks, no homework.`,
      'Mei Ling: We are saving up. Faiz wants the new Tamiya in Uncle Lim’s window, and I want the full card set.',
      'Faiz: Pak Rahman at Kedai Runcit 99 needs someone to hand-deliver orders. He pays upah. Duit poket, bro!',
      'Mei Ling: Pak Salleh is planning Pameran Kenangan for the holidays. Maybe we can bring a story worth sharing. Start with Pak Rahman; we will be here till Maghrib.'
    ],()=>storyEvent('met-friends'));
    return;
  }
  openCounter(NPCS[key].place,key);
}
$('interact-button').onclick=interact;

// ---- Counters: Buy / Delivery work / Talk / Leave at merchants; Requests /
// Deliver parcel / Talk / Leave at houses and public services. ----
function jobStops(){return eco.jobs.map(job=>{const p=placeOf(job.status==='accepted'?job.from:nextStop(job));return {x:p.door.x,z:p.door.z,job};});}
function jobText(job){
  const where=job.status==='accepted'?job.from:nextStop(job),person=personAt(where)?.name||NPCS[npcAt(where)]?.name||'';
  if(job.status==='accepted')return job.kind==='purchase'?`Buy ${itemLabel(job.item,job.qty)} at ${placeName(where)}`:`Collect ${itemLabel(job.item,job.qty)} at ${placeName(where)}`;
  return job.stops.length>1?`Deliver ${ITEMS[job.item].name} to ${placeName(where)} (${job.stops.length-job.left+1} of ${job.stops.length})`:`Bring ${itemLabel(job.item,job.qty)} to ${person?person+' at ':''}${placeName(where)}`;
}
function refreshEconomy(){
  $('wallet-amount').textContent=rm(eco.wallet);
  const count=Object.values(eco.bag).reduce((a,b)=>a+b,0);$('bag-count').textContent=count?String(count):'';
  world.setJobMarkers(jobStops());
  const job=eco.jobs[0];$('job-line').hidden=!job;
  if(job){$('job-eyebrow').textContent=`UPAH ${rm(job.upah)} · ${eco.jobs.length}/${MAX_JOBS} JOBS`;$('job-text').textContent=jobText(job);}
  storySpot=storyTarget();
}
function counterButton(parent,label,onclick,cls='primary',disabled=false){const b=document.createElement('button');b.className=cls;b.textContent=label;b.disabled=disabled;b.onclick=onclick;parent.append(b);return b;}
function offerCard(offer,place){
  const card=document.createElement('dl');card.className='job-offer';
  const visual=document.createElement('div');visual.className='offer-visual';visual.append(itemIdentity(offer.item,inspectItem,ITEMS[offer.item].memory));card.append(visual);
  const row=(term,value,cls='')=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=term;dd.textContent=value;dd.className=cls;card.append(dt,dd);};
  const requester=personAt(offer.requester)?.name||NPCS[npcAt(offer.requester)]?.name||placeName(offer.requester);
  row('Requester',`${requester} · ${placeName(offer.requester)}`);
  row(offer.kind==='purchase'?'Buy at':'Pick up',`${placeName(offer.from)}${offer.from===place?' (here)':''}`);
  row(offer.stops.length>1?'Destinations':'Destination',offer.stops.map(placeName).join(', ')+` · about ${Math.round(offer.route)} m`);
  row('Item',ITEMS[offer.item].name);row('Quantity',String(offer.qty));
  if(offer.kind==='purchase')row('Purchase cost',`${rm(offer.cost)}, repaid on delivery`);
  row('Upah',rm(offer.upah),'upah');
  row('Carrying space',`${ITEMS[offer.item].size*offer.qty} of ${Math.max(0,freeSpace(eco))} free`);
  row('Deadline','None');
  return card;
}
function openCounter(place,npcKey=null,view='menu',note=''){
  counter={place,npc:npcKey,who:counter?.place===place?counter.who:doorWho};doorWho=null;setMode('counter');
  const away=npcKey&&npcBody(npcKey)?.post!==place,person=npcKey?{key:npcKey,name:NPCS[npcKey].name}:personAt(place);
  const npc=person?.key?NPCS[person.key]:null,asker=npcKey||npcAt(place);
  $('counter-panel').hidden=false;$('counter-place').textContent=(away?`${NPCS[npcKey].role} · at the padang`:placeName(place)).toUpperCase();
  $('counter-panel').querySelector('.modal').classList.toggle('tamiya-shop-modal',view==='tamiya');
  $('counter-panel').querySelector('.modal').classList.toggle('prayer-modal',view==='prayer');
  $('counter-name').textContent=person?.name||placeName(place);
  const closedShop=isShop(place)&&!isShopOpen(place,time.minute),reception=!person||closedShop;
  const hours=shopHours(place);
  $('counter-text').textContent=note||(closedShop?`${placeName(place)} tutup. Waktu operasi ${timeLabel(hours[0])}–${timeLabel(hours[1])}. Bungkusan masih boleh dihantar di pintu.`:place===31&&!person?'Masjid tetap dibuka untuk solat. Ustaz Hassan sedang berehat.':reception?(atPost(npcBody(npcAt(place)))?`${NPCS[npcAt(place)].name} is at the padang this afternoon. Parcels can be left at the door.`:`${NPCS[npcAt(place)].name} ${NPCS[npcAt(place)].menu==='house'?'has gone to bed':'has closed up for the night'}. Come back in the morning; parcels can be left at the door.`):npc?sayLine(npc.hello):place===myHome()?`Dah balik, ${state.name}? Jangan main jauh-jauh.`:sayLine(doorContact(place).hello));
  const body=$('counter-body');body.replaceChildren();
  const add=(label,onclick,cls,disabled)=>counterButton(body,label,onclick,cls,disabled);
  const memoryContext={place,npc:person?.key||null,chapter:state.story,day:time.day};
  // A keepsake story is the resident's own to tell, not the family's standing in.
  const memories=npcKey||!doorContact(place)?.standIn?nostalgiaAt(eco,memoryContext):[];
  // A closed shop takes parcels at the door but hands nothing out.
  const shut=closedShop||!away&&npcAt(place)&&!atPost(npcBody(npcAt(place)))&&npcBody(npcAt(place)).post===place;
  const here=away?{collect:[],deliver:[]}:jobsAt(eco,place);if(shut)here.collect=[];
  const merchant=!away&&(npc?.menu==='merchant'||(!npc&&STOCK[place]));
  if(view==='menu'){
    for(const job of here.deliver)add(`Deliver parcel · ${itemLabel(job.item,job.stops.length>1?1:job.qty)}`,()=>handOver(job));
    for(const job of here.collect)add(job.kind==='purchase'?`Buy for ${placeName(job.requester)} · ${itemLabel(job.item,job.qty)} · ${rm(job.cost)}`:`Collect ${itemLabel(job.item,job.qty)}`,()=>pickUp(job));
    for(const job of eco.jobs.filter(j=>j.status==='carrying'&&j.from===place&&j.left===j.stops.length))add(`Return ${itemLabel(job.item,job.qty)}${job.kind==='purchase'?` · refund ${rm(job.cost)}`:''}`,()=>giveBack(job),'secondary');
    if(!reception){
      if(person.key==='salleh'){
        if(state.story===6)add('Chapter 1 · Prepare Pameran Kenangan',inviteExhibition);
        if(state.story>=7&&state.story<DONE)add('Chapter 1 · Find a story for the exhibition',()=>{closeCounter();openBook();});
        if(state.story===12)for(const id of Object.keys(eco.nostalgia.earned))add(`Share at Pameran Kenangan · ${ITEMS[id].title}`,()=>finishExhibition(id));
        if(state.exhibition)add('Visit my Pameran Kenangan display',()=>openCounter(place,npcKey,'exhibition'));
      }
      if(memories.length)add('Ada kisah untuk dicerita',()=>openCounter(place,npcKey,'memories'));
      if(merchant&&STOCK[place])add('Buy',()=>openCounter(place,npcKey,'buy',`Duit Poket: ${rm(eco.wallet)}.`));
      if(merchant&&place===25)add('Katalog Tamiya · Dash racers',()=>openCounter(place,npcKey,'tamiya',`Duit Poket: ${rm(eco.wallet)}. Lagi tinggi power, lagi mahal. Parts, gear & bateri pun ada. Harga & rating untuk game ini.`));
      if(asker)add(merchant?'Delivery work':'Requests',()=>openCounter(place,npcKey,'work'));
      if(npc)add('Talk',()=>talk(person.key,place,npcKey));
      if(['atuk','faiz'].includes(person.key))add(atPost(npcBody(person.key))?'Main gasing':`Main gasing · find ${person.name} at the padang tomorrow`,()=>{closeCounter();gasingUI.open(person.key);},'primary',!atPost(npcBody(person.key)));
      if(['faiz','meiling'].includes(person.key))add(atPost(npcBody(person.key))?'Main Tamiya · Jom Dash!':`Main Tamiya · find ${person.name} at the padang tomorrow`,()=>{closeCounter();tamiyaUI.open(person.key);},'primary',!atPost(npcBody(person.key)));
      if(person.key==='din'&&!away)add('Main Dam Haji',()=>{closeCounter();damUI.open();});
      if(person.key==='nenek'&&!away&&state.story>=4)add('Main congkak',()=>{closeCounter();openBoard('Nenek',2);});
    }
    if(place===myHome())add(canSleep(time.minute)?'Tidur · sleep until Subuh':`Tidur · from Maghrib (now ${timeLabel(time.minute)})`,goToSleep,'primary',!canSleep(time.minute));
    if(place===31)add('Solat · 5 waktu (+20 minit)',()=>openCounter(31,npcKey,'prayer'),'primary');
    add('Leave',closeCounter,'secondary');
  }else if(view==='memories'&&!reception){
    if(!note)$('counter-text').textContent='Setiap kisah ada perjalanan sendiri. Ikut petunjuk, bantu penduduk dan siapkan tugas dalam Buku. Progress disimpan; setiap keepsake diperoleh sekali.';
    for(const id of memories)body.append(memoryQuestCard(id,eco,memoryActions(memoryContext)));
    add('Back',()=>openCounter(place,npcKey),'secondary');
  }else if(view==='exhibition'&&!reception&&person.key==='salleh'&&state.exhibition){
    const {id,day}=state.exhibition,e=eco.nostalgia.earned[id];
    $('counter-name').textContent='Pameran Kenangan';
    $('counter-text').textContent=`Pak Salleh: This is ${state.name}’s contribution, shared on game day ${day}. The keepsake stays with its owner; the story belongs to our afternoon together.`;
    const display=document.createElement('article');display.className='exhibition-display';
    display.append(itemIdentity(id,inspectItem,EXHIBITION_STORIES[id]));
    const dedication=document.createElement('p');dedication.textContent=`“${e.inscription}” — ${e.giver}, for ${e.player}`;display.append(dedication);body.append(display);
    add('Back',()=>openCounter(place,npcKey),'secondary');
  }else if(view==='prayer'&&place===31){
    $('counter-name').textContent='Solat di masjid';
    $('counter-text').textContent=note||`Hari ${time.day} · ${timeLabel(time.minute)}. Jadual tetap dunia game. Setiap solat memajukan masa 20 minit, sekali bagi setiap waktu sehari.`;
    const times=document.createElement('div');times.className='prayer-times';times.setAttribute('role','group');times.setAttribute('aria-label','Lima waktu solat');
    for(const prayer of PRAYERS){
      const status=prayerState(time,eco.prayer,prayer.id),button=document.createElement('button');button.type='button';button.dataset.prayer=prayer.id;button.className=`prayer-slot${status.available?' current':''}`;button.disabled=!status.available;
      const title=document.createElement('b'),when=document.createElement('small'),stateLabel=document.createElement('span');title.textContent=prayer.name;when.textContent=`${timeLabel(prayer.from)}–${timeLabel(prayer.to)}${prayer.to<prayer.from?' (+1 hari)':''}`;
      stateLabel.textContent=status.completed?'✓ Sudah solat':status.available?'Solat · +20 minit':prayer.id==='isyak'&&time.minute<prayer.from?'Belum masuk waktu':time.minute>=prayer.to&&prayer.to>prayer.from?'Waktu berakhir':'Belum masuk waktu';
      button.setAttribute('aria-label',`${prayer.name} · ${when.textContent} · ${stateLabel.textContent}`);button.append(title,when,stateLabel);button.onclick=()=>pray(prayer.id);times.append(button);
    }
    counterButton(times,'Kembali',()=>openCounter(31,npcKey),'secondary');body.append(times);
  }else if(view==='buy'){
    for(const item of STOCK[place]){
      const it=ITEMS[item],row=document.createElement('div');row.className='shop-row';
      const name=itemIdentity(item,inspectItem,eco.collection[item]?`Dalam koleksi · × ${eco.collection[item]}`:ITEM_KINDS[it.kind]);const price=document.createElement('span');price.textContent=rm(it.price);
      row.append(name,price);counterButton(row,(TAMIYA_CARS[item]||TAMIYA_PARTS[item])&&eco.collection[item]?'Dalam koleksi':'Beli',()=>shop(place,npcKey,item),'',eco.wallet<it.price||!!((TAMIYA_CARS[item]||TAMIYA_PARTS[item])&&eco.collection[item]));
      body.append(row);
    }
    add('Back',()=>openCounter(place,npcKey),'secondary');
  }else if(view==='tamiya'){
    if(place!==25||!merchant)return openCounter(place,npcKey);
    body.append(tamiyaCatalogue(eco,inspectItem,id=>shop(place,npcKey,id,'tamiya')));
    add('Back',()=>openCounter(place,npcKey),'secondary');
  }else if(view==='work'){
    const offers=offersAt(eco,away?npcBody(npcKey).place:place,doorGap,[...storyOffers(state.story,eco),...nostalgiaOffers(eco,doorGap)]);
    if(offers.length){
      $('counter-text').textContent=offers[0].note||(eco.jobs.length>=MAX_JOBS?`You are carrying ${MAX_JOBS} jobs already. Finish one first.`:'Here is what needs doing. The upah is fixed once you accept.');
      for(const offer of offers){
        const card=offerCard(offer,place),actions=document.createElement('div');actions.className='offer-actions';
        counterButton(actions,`Accept · ${rm(offer.upah)}`,()=>takeJob(offer,place,npcKey),'primary',eco.jobs.length>=MAX_JOBS||freeSpace(eco)<ITEMS[offer.item].size*offer.qty);
        card.append(actions);body.append(card);
      }
    }else $('counter-text').textContent='Nothing needs doing right now. Come back another time.';
    add('Back',()=>openCounter(place,npcKey),'secondary');
  }
}
function takeJob(offer,place,npcKey){
  const result=accept(eco,offer);
  if(!result.ok)return openCounter(place,npcKey,'menu',result.reason==='full'?`You already have ${MAX_JOBS} jobs. Finish one first.`:result.reason==='space'?'Your bag is too full for this one. Deliver something first.':'Someone has already taken that.');
  persist();refreshEconomy();
  if(offer.story==='first-parcel')storyEvent('accepted-first-parcel');
  const pickupHere=offer.from===place&&npcBody(npcKey||'')?.post!==undefined?true:offer.from===place;
  openCounter(place,npcKey,'menu',offer.kind==='purchase'?`Buy the goods at ${placeName(offer.from)}. I will pay you back with your upah.`:pickupHere?`Okay, ${state.name}. It is packed and ready for you.`:`The parcel is waiting at ${placeName(offer.from)}.`);
}
function pickUp(job){
  const place=counter.place,result=collect(eco,job.id,place);
  if(!result.ok)return openCounter(place,counter.npc,'menu',result.reason==='funds'?`Not enough Duit Poket. You need ${rm(job.cost)}.`:'That is not ready here.');
  persist();refreshEconomy();
  openCounter(place,counter.npc,'menu',`${itemLabel(job.item,job.qty)} ${job.kind==='purchase'?'bought and ':''}in your bag. ${jobText(job)}.`);
}
function handOver(job){
  const place=counter.place,result=deliver(eco,job.id,place);
  if(!result.ok)return openCounter(place,counter.npc,'menu','Hmm, that does not seem right.');
  if(result.more){persist();refreshEconomy();return openCounter(place,counter.npc,'menu',`Terima kasih! ${result.more} more stop${result.more>1?'s':''} to go.`);}
  const requester=npcAt(job.requester);if(requester)befriend(eco,requester,'errand',today());
  audio?.shell();toast(`Delivered · +${rm(result.paid)}`);
  persist();refreshEconomy();
  let note=`Terima kasih, ${state.name}! ${job.kind==='purchase'?`Here is ${rm(job.cost)} back and your upah, ${rm(job.upah)}.`:`Here is your upah, ${rm(job.upah)}.`}`;
  if(job.story==='first-parcel')note=`Gula from Pak Rahman? Terima kasih, ${state.name}. Here is your upah, RM 1.00. Alamak, Nenek’s tea tin is empty too. Could you buy a packet for Nenek? Look under Requests.`;
  if(job.story==='tea')note='Ah, teh! Now we can sit properly. Here is the money back and your upah. Duduklah dulu. Main congkak satu pusingan?';
  if(job.story)storyEvent(STORY_EVENTS[job.story]);
  openCounter(place,counter.npc,'menu',note);
}
function giveBack(job){
  const place=counter.place,result=cancel(eco,job.id,place);
  if(!result.ok)return openCounter(place,counter.npc,'menu','That cannot be returned now.');
  persist();refreshEconomy();openCounter(place,counter.npc,'menu',result.refund?`Returned. Here is your ${rm(result.refund)} back.`:'Returned. No harm done.');
}
function shop(place,npcKey,item,view='buy'){
  const result=buy(eco,place,item);
  if(!result.ok)return openCounter(place,npcKey,view,result.reason==='owned'?'Kereta ini sudah ada dalam koleksi.':result.reason==='space'?'Your bag is full.':'Not enough Duit Poket for that.');
  persist();refreshEconomy();audio?.shell();
  const it=ITEMS[item],note=result.kind==='snack'?`${it.name}. Sedap! Duit Poket: ${rm(eco.wallet)}.`:result.kind==='collect'?`${it.name} added to your collection. Duit Poket: ${rm(eco.wallet)}.`:`${it.name} is in your bag. Duit Poket: ${rm(eco.wallet)}.`;
  if(result.kind==='collect'&&place===25)storyEvent('bought-collectible');
  openCounter(place,npcKey,view,note);
}
function talk(key,place,npcKey){
  const npc=NPCS[key],gained=befriend(eco,key,'talk',today()),lines=npc.talk,points=eco.friends[key]||0;
  persist();
  openCounter(place,npcKey,'menu',`${sayLine(lines[(points+new Date().getDate())%lines.length])}${gained?`  (+${gained} friendship · ${level(points)})`:''}`);
}
function goToSleep(){
  if(sleeping||!canSleep(time.minute))return;
  sleeping=true;closeCounter();setMode('sleep');
  const fade=$('sleep-fade');fade.hidden=false;$('sleep-text').textContent=`Selamat malam, ${state.name}…`;
  requestAnimationFrame(()=>fade.classList.add('shown'));
  setTimeout(()=>{
    sleep(time);showTime();
    const home=world.spawns[state.who];player.group.position.set(home.x,world.groundHeight(home.x,home.z)-.065,home.z);player.group.rotation.y=home.heading;yaw=home.heading+Math.PI;
    persist();$('sleep-text').textContent=`Subuh · Hari ${time.day}, ${weekday(time.day)}`;
    setTimeout(()=>{fade.classList.remove('shown');setTimeout(()=>{fade.hidden=true;sleeping=false;setMode('explore');toast(`Selamat pagi, ${state.name}! ${weekday(time.day)}, ${timeLabel(time.minute)}. The azan from the masjid; the town wakes up at seven.`);},700);},1600);
  },900);
}
function closeCounter(){$('counter-panel').hidden=true;counter=null;setMode('explore');}
// Who the player walked up to at a resident's door (a keeper or the resident).
let doorWho=null;
function inviteExhibition(){
  if(state.story!==6||counter?.place!==32)return;
  closeCounter();
  showDialogue('Pak Salleh · Pameran Kenangan',[
    `${state.name}, buying your first toy is only the beginning. This cuti sekolah, we are filling the balai raya with things that have a story.`,
    'Cuba singgah kedai, berbual di beranda, dan dengar cerita orang pekan. Kadang-kadang benda kecil menyimpan kenangan yang besar.',
    'Kalau seseorang minta bantuan, cubalah dengar. Bila kau jumpa satu kenangan yang bermakna, bawa ceritanya ke sini. Aku simpan satu ruang untuk kau.'
  ],()=>{storyEvent('invited-exhibition');openCounter(32,'salleh','menu','Teroka pekan dan dengar cerita penduduk. Tugas yang kau terima akan dicatat dalam Buku.');});
}
function finishExhibition(id){
  if(counter?.place!==32||state.story!==12)return;
  const result=shareKeepsake(eco,state.story,id,time.day);if(!result.ok)return;
  closeCounter();
  showDialogue('Pak Salleh · Your place in the exhibition',[
    `${ITEMS[id].title}. Tell us about the people you met and the challenge you finished, ${state.name}.`,
    EXHIBITION_STORIES[id],
    `“${eco.nostalgia.earned[id].inscription}” — a keepsake from ${eco.nostalgia.earned[id].giver}. We will share its story here; the item stays with you. This is the afternoon our cuti sekolah became something we could remember together.`
  ],()=>{state.exhibition=result.exhibition;storyEvent('shared-keepsake');openCounter(32,'salleh','exhibition');});
}
function navigateMemory(entryId){
  const entry=mapEntries().find(e=>e.id===entryId);if(!entry)return;
  const route=planMapRoute(entry);if(!route)return toast('No walking route found. Use the town map to check the destination.');
  $('book-panel').hidden=true;$('counter-panel').hidden=true;counter=null;setMode('explore');
  navigation={entry,route,planned:{x:entry.x,z:entry.z},arrived:false};lastNavigationUpdate=-1;updateNavigation();toast(`Keepsake trail · ${entry.name}`);
}
function memoryActions(context=null){
  return {placeName,inspect:inspectItem,context,clock:{...time},navigate:navigateMemory,chapter:{step:state.story,focus:chapterGuide(state.story,eco,state.exhibition).questId,exhibition:state.exhibition},
    start:id=>{const r=startNostalgia(eco,id,context);persist();openCounter(counter.place,counter.npc,'memories',r.ok?`${NOSTALGIA_QUESTS[id].title} diterima. Ikut langkah seterusnya dalam Buku; progress bermula sekarang.`:'Kisah ini sudah diterima atau belum terbuka.');},
    clue:id=>{const r=followNostalgiaClue(eco,id,context.place,time);persist();openCounter(counter.place,counter.npc,'memories',r.ok?r.clue:r.text||'Ikut turutan petunjuk dalam Buku.');},
    delivery:id=>{const step=NOSTALGIA_QUESTS[id].trail[eco.nostalgia.quests[id].trail],offer=nostalgiaOffers(eco,doorGap).find(o=>o.story===step.delivery?.story);if(offer)takeJob(offer,counter.place,counter.npc);},
    claim:(id,choice)=>{const r=claimNostalgia(eco,id,context,choice,state.name,time.day);if(!r.ok)return;persist();refreshEconomy();audio?.shell();toast(`Keepsake earned · ${ITEMS[id].title}`);openCounter(counter.place,counter.npc,'memories',`${r.entry.giver}: For ${r.entry.player}. ${r.entry.inscription}`);}
  };
}
function pray(id){
  if(praying||mode!=='counter'||counter?.place!==31)return;
  const npcKey=counter.npc,oldDay=time.day,result=performPrayer(time,eco.prayer,id);
  if(!result.ok){openCounter(31,npcKey,'prayer','Waktu ini belum tersedia atau sudah ditunaikan.');return;}
  praying=true;closeCounter();setMode('prayer');if(time.day!==oldDay)lateNudge=0;
  showTime();persist();
  const fade=$('sleep-fade');fade.hidden=false;fade.classList.add('shown');$('sleep-text').textContent=`Solat ${result.prayer}…`;
  setTimeout(()=>{
    fade.classList.remove('shown');
    setTimeout(()=>{fade.hidden=true;praying=false;if(!orientationBlocked)renderer.render(scene,camera);openCounter(31,atPost(npcBody('hassan'))?'hassan':null,'prayer',`Solat ${result.prayer} selesai. Masa +20 minit · Hari ${time.day}, ${timeLabel(time.minute)}.`);},700);
  },900);
}
$('counter-close').onclick=closeCounter;
function listItem(list,left,right,action,item){const li=document.createElement('li'),a=document.createElement('span'),b=document.createElement('span');a.textContent=left;b.textContent=right;if(action)b.append(action);if(item){li.className='illustrated-list-item';li.append(itemThumbnail(item,inspectItem));}li.append(a,b);list.append(li);}
function openBag(){
  if(mode!=='explore')return;setMode('bag');$('bag-panel').hidden=false;
  $('bag-wallet').textContent=`Duit Poket: ${rm(eco.wallet)} · Space ${usedSpace(eco)}/${BAG_SPACE}`;
  const list=$('bag-list');list.replaceChildren();
  const entries=Object.entries(eco.bag);
  if(!entries.length)listItem(list,'Your bag is empty.','');
  for(const [item,qty] of entries){const job=eco.jobs.find(j=>j.item===item&&j.status==='carrying');listItem(list,ITEMS[item].title,`× ${qty}${job?` · for ${placeName(nextStop(job))}`:''}`,null,item);}
  const album=$('bag-collection');album.replaceChildren();
  $('dam-badge').hidden=!eco.dam.claimed.includes('jaguh');
  $('gasing-badge').hidden=!eco.gasing.claimed.includes('atuk');
  $('gasing-owned').hidden=!eco.collection.gasing;
  $('tamiya-badge').hidden=!eco.tamiya.claimed.includes('jaguh');
  $('tamiya-owned').textContent=Object.keys(eco.collection).some(id=>TAMIYA_CARS[id])?'Your Mini 4WD cars are ready. Race Faiz and Mei Ling at the padang.':'Faiz lends a beginner car. Uncle Lim sells the Dash-inspired collection.';
  $('catalogue-button').textContent=`Katalog Kenangan · Lihat semua ${Object.keys(ITEMS).length} item →`;
  const owned=Object.entries(eco.collection);
  if(!owned.length)listItem(album,'Nothing yet. Uncle Lim sells cards, comics, gasing, wau, guli and Tamiya.','');
  album.classList.toggle('catalogue-grid',owned.length>0);
  for(const [item,qty] of owned)album.append(catalogueCard(item,inspectItem,qty));
}
let selectBookTab=null;
function openBook(){
  if(mode!=='explore')return;setMode('book');$('book-panel').hidden=false;
  refreshQuest();const guide=chapterGuide(state.story,eco,state.exhibition);
  selectBookTab=renderQuestJournal($('book-content'),{eco,state,guide,placeName,inspect:inspectItem,actions:memoryActions(),navigate:navigateMemory,
    cancel:id=>{cancel(eco,id);persist();refreshEconomy();closePanel('book-panel');openBook();}});
  $('book-tab-tasks').focus();
}
function closePanel(id){$(id).hidden=true;setMode('explore');}
$('bag-button').onclick=openBag;$('book-button').onclick=openBook;$('wallet-button').onclick=openBook;
$('bag-close').onclick=()=>closePanel('bag-panel');$('book-close').onclick=()=>closePanel('book-panel');
let inspectReturn=null, catalogueFilter='all';
function inspectItem(id,trigger){
  const surfaces=[...document.querySelectorAll('.modal-backdrop:not(#item-panel),#hud')].filter(el=>!el.hidden&&!el.inert);
  inspectReturn={mode,trigger,surfaces};for(const el of surfaces)el.inert=true;const detail=detailContents(id);
  const keepsake=NOSTALGIA_ITEMS[id],earned=eco.nostalgia.earned[id];
  if(keepsake){
    const story=NOSTALGIA_QUESTS[id]?.set===2?EXHIBITION_STORIES[id]:keepsake.story;
    const status=nostalgiaStatus(eco,id);detail.memory=earned?`${story}\n\n“${earned.inscription}”\nGiven by ${earned.giver}, for ${earned.player}, game day ${earned.day}.`:status.place?`Next story clue: ${placeName(status.place)}. ${status.text}`:status.text;
    if(!earned){detail.image='./assets/nostalgia-locked.svg';detail.title='Kenangan rahsia';detail.caption='Belum diperoleh';detail.memory=eco.nostalgia.quests[id]?'Teruskan kisah yang kau terima. Ganjarannya menunggu di penghujung perjalanan.':'Teroka pekan dan dengar cerita penduduk untuk menemui kenangan ini.';}
    if(earned)detail.caption+=` · ${keepsake.referenceType}`;
  }
  $('item-quest-button').hidden=!eco.nostalgia.quests[id];
  $('item-quest-button').onclick=()=>{closeItem();$('catalogue-panel').hidden=true;$('bag-panel').hidden=true;$('counter-panel').hidden=true;counter=null;setMode('explore');openBook();if(earned)selectBookTab('memories');$('book-content').querySelector(`[data-nostalgia="${id}"]`)?.scrollIntoView({block:'start'});};
  $('item-title').textContent=detail.title;$('item-memory').textContent=detail.memory;
  $('item-caption').textContent=detail.caption;$('item-image').src=detail.image;$('item-image').alt=detail.title;
  $('item-panel').hidden=false;setMode('item');$('item-close').focus();
}
function closeItem(){
  $('item-panel').hidden=true;const previous=inspectReturn;inspectReturn=null;
  for(const el of previous?.surfaces||[])el.inert=false;
  setMode(previous?.mode||'explore');if(previous?.trigger?.isConnected)previous.trigger.focus();
}
$('item-close').onclick=closeItem;
function renderCatalogue(){
  const list=$('catalogue-list');list.replaceChildren();
  const entries=Object.entries(ITEMS).filter(([,it])=>catalogueFilter==='all'||catalogueFilter==='keepsakes'&&it.rewardOnly||it.kind===catalogueFilter);
  for(const [id] of entries){const card=catalogueCard(id,inspectItem,eco.collection[id]||0);if(eco.nostalgia.earned[id]){const status=document.createElement('small');status.className='memory-catalogue-status';status.textContent=nostalgiaStatus(eco,id).text;card.append(status);}list.append(card);}
  $('catalogue-count').textContent=`${entries.length} / ${Object.keys(ITEMS).length} item · Pekan Seri Kenangan, circa 2001`;
  for(const button of $('catalogue-filters').children)button.setAttribute('aria-pressed',String(button.dataset.kind===catalogueFilter));
}
for(const [kind,label] of Object.entries({all:'Semua',keepsakes:'Keepsakes · 28',...ITEM_KINDS})){
  const button=document.createElement('button');button.type='button';button.dataset.kind=kind;button.textContent=label;
  button.onclick=()=>{catalogueFilter=kind;renderCatalogue();};$('catalogue-filters').append(button);
}
$('catalogue-button').onclick=()=>{$('bag-panel').hidden=true;$('catalogue-panel').hidden=false;setMode('catalogue');renderCatalogue();$('catalogue-close').focus();};
$('catalogue-close').onclick=()=>{$('catalogue-panel').hidden=true;setMode('explore');openBag();$('catalogue-button').focus();};
function openMap(){if(mode!=='explore')return;setMode('map');$('hud').inert=true;townMap.open();}
$('map-button').onclick=openMap;
$('minimap-button').onclick=openMap;
$('navigation-open').onclick=openMap;
$('navigation-stop').onclick=()=>{navigation=null;$('navigation-hud').hidden=true;drawMap($('minimap'));};
function pause(){if(mode!=='explore')return;persist();setMode('pause');$('pause-settings').hidden=false;$('dev-cheats').hidden=true;$('pause-panel').hidden=false;}
$('pause-button').onclick=pause;
let versionTaps=0,lastVersionTap=0;
$('version-trigger').onclick=()=>{
  if(mode!=='explore'||orientationBlocked){versionTaps=0;return;}
  const now=performance.now();
  versionTaps=now-lastVersionTap>10000?1:versionTaps+1;lastVersionTap=now;
  if(versionTaps<7)return;
  versionTaps=0;pause();$('pause-settings').hidden=true;$('dev-cheats').hidden=false;
  $('dev-code').value='';$('dev-feedback').textContent='';$('dev-code').focus();
};
$('dev-cheats').onsubmit=event=>{
  event.preventDefault();
  if(mode!=='pause'||$('dev-cheats').hidden)return;
  if($('dev-code').value.trim().toUpperCase()!=='DUIT100'){
    $('dev-feedback').textContent='Kod tak dikenali. Cuba lagi.';return;
  }
  const added=Math.min(10000,1e7-eco.wallet);
  eco.wallet+=added;refreshEconomy();
  const ok=persist();
  $('dev-feedback').textContent=added?`+${rm(added)} · Duit Poket ${rm(eco.wallet)}${ok?' · Tersimpan.':''}`:'Duit Poket sudah maksimum.';
};
$('resume-button').onclick=()=>{$('pause-panel').hidden=true;setMode('explore');};
$('bike-reset-button').onclick=()=>{resetBike();$('pause-panel').hidden=true;setMode('explore');toast('Basikal parked beside you.');};
$('home-button').onclick=()=>{persist();choose(state.who);$('pause-panel').hidden=true;$('hud').hidden=true;$('start-screen').hidden=false;setMode('title');};
$('zoom').oninput=()=>{distance=Number($('zoom').value);};
window.addEventListener('keydown',event=>{
  if(orientationBlocked)return;
  if(mode==='pause'&&event.key==='Escape'){event.preventDefault();$('resume-button').click();return;}
  if(mode==='item'&&event.key==='Tab'){event.preventDefault();$('item-close').focus();return;}
  if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.repeat && ['e','m','Escape',' ','c','h','f','z'].includes(event.key))return;
  const key=event.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))event.preventDefault();
  keys.add(key);
  if(key==='e')interact();
  if(mode==='explore'){if(key===' ')jump();if(key==='c')duck();if(key==='h')sayHi();if(key==='f')toggleBike();if(key==='z')toggleWalk();}
  if(key==='b'){if(mode==='bag')closePanel('bag-panel');else openBag();}
  if(key==='j'){if(mode==='book')closePanel('book-panel');else openBook();}
  if(key==='m'){if(mode==='map')$('map-close').click();else openMap();}
  if(key==='escape'){if(mode==='tamiya')tamiyaUI.close();else if(mode==='gasing')gasingUI.close();else if(mode==='dam')damUI.close();else if(mode==='item')closeItem();else if(mode==='catalogue')$('catalogue-close').click();else if(mode==='counter')closeCounter();else if(mode==='bag')closePanel('bag-panel');else if(mode==='book')closePanel('book-panel');else if(mode==='map')$('map-close').click();else if(mode==='pause')$('resume-button').click();else if(mode==='board')closeBoard();else pause();}
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
// ---- Moves: jump, duck, say hi, walk and the bicycle ----
// Beside the front door, facing open ground: at least 4 m clear ahead, so
// the first push rides straight off.
function parkAtHome(){const h=world.spawns[state.who];return parkNear(h.x,h.z,h.heading);}
// A spot near (x, z) with room for the bike: both wheels on open ground and
// `run` metres clear ahead, searching outward in rings from beside the point.
function parkNear(x,z,heading,run=4){
  const clear=(px,pz,h,length)=>{for(let t=-.7;t<=length;t+=.25)if(!world.canWalk(px+Math.sin(h)*t,pz+Math.cos(h)*t))return false;return true;};
  let fallback=null;
  for(const radius of [1.7,2.4,1.2,3.2,4,5,6.5,8]){
    for(let k=0;k<16;k++){
      const a=heading+Math.PI/2+k/16*Math.PI*2,px=x+Math.sin(a)*radius,pz=z+Math.cos(a)*radius;
      if(!world.canWalk(px,pz))continue;
      for(const turn of [0,Math.PI/2,-Math.PI/2,Math.PI]){
        if(clear(px,pz,heading+turn,run))return {x:px,z:pz,heading:heading+turn};
        if(!fallback&&clear(px,pz,heading+turn,1))fallback={x:px,z:pz,heading:heading+turn};
      }
    }
  }
  return fallback??{x,z,heading};
}
// Pause menu: bring the bike to wherever you are, parked facing open ground.
function resetBike(){
  if(riding){riding=false;player.group.rotation.set(0,bike.heading,0);}
  const p=player.group.position,spot=parkNear(p.x,p.z,player.group.rotation.y);
  bike={x:spot.x,z:spot.z,heading:spot.heading,speed:0,steer:0,lean:0};parkBike();updateMoveButtons();persist();
}
function parkBike(){bicycle.place(bike,world.groundHeight(bike.x,bike.z),!riding);}
function updateMoveButtons(){
  $('duck-button').setAttribute('aria-pressed',String(crouching));$('walk-button').setAttribute('aria-pressed',String(walkOnly));$('bike-button').setAttribute('aria-pressed',String(riding));
  $('jump-button').disabled=riding;$('duck-button').disabled=riding;$('wave-button').textContent=riding?'Loceng':'Hai';
}
function jump(){if(mode!=='explore'||riding||airborne||jumpQueued>=0)return;crouching=false;jumpQueued=.07;jumpedNow=true;updateMoveButtons();}
function duck(){if(mode!=='explore'||riding)return;crouching=!crouching;updateMoveButtons();}
function toggleWalk(){if(mode!=='explore')return;walkOnly=!walkOnly;updateMoveButtons();toast(walkOnly?'Jalan · walking pace. Tap Jalan again to jog.':'Jog · a full push jogs again.');}
// Say hi: wave, and anyone close by on duty waves back. On the bike it rings the bell.
function sayHi(){
  if(mode!=='explore')return;
  if(riding){audio?.bell?.();return;}
  player.wave?.();const p=player.group.position;
  for(const n of [...townsfolk().filter(atPost),...world.crowd.filter(c=>c.pose)])if(Math.hypot(n.x-p.x,n.z-p.z)<8)n.waveUntil=elapsed+.5+2.1;
}
function toggleBike(){
  if(mode!=='explore')return;
  if(!player.actor){toast('The basikal needs the motion-capture characters, which did not load on this device.');return;}
  if(riding){dismount();return;}
  const p=player.group.position,gap=Math.hypot(p.x-bike.x,p.z-bike.z);
  if(gap>2.8){toast(`Your basikal is ${Math.round(gap)} m away. Walk up to it and press Basikal (F).`);return;}
  if(airborne||jumpQueued>=0)return;
  riding=true;crouching=false;Object.assign(bike,{speed:0,steer:0,lean:0});p.x=bike.x;p.z=bike.z;player.group.rotation.set(0,bike.heading,0);
  updateMoveButtons();
}
function dismount(){
  riding=false;Object.assign(bike,{speed:0,lean:0});
  const p=player.group.position;
  for(const s of [1,-1]){const x=bike.x+Math.cos(bike.heading)*.75*s,z=bike.z-Math.sin(bike.heading)*.75*s;if(world.canWalk(x,z)){p.x=x;p.z=z;break;}}
  p.y=world.groundHeight(p.x,p.z)-.065;player.group.rotation.set(0,bike.heading,0);parkBike();updateMoveButtons();persist();
}
// Act on touch-down, like Run, so the buttons work while the other thumb
// holds the joystick (phones send no click during a second touch).
for(const [id,action] of [['jump-button',jump],['duck-button',duck],['wave-button',sayHi],['bike-button',toggleBike],['walk-button',toggleWalk]]){
  const button=$(id);let touched=false;
  button.addEventListener('pointerdown',event=>{event.preventDefault();touched=true;action();});
  button.addEventListener('click',()=>{if(touched){touched=false;return;}action();});
}
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
// Music unlocks on Start/Continue; ambience remains independently optional.
let audio = null;
const audioPrefs = readAudioSettings(storage);
const music = createMusic({ enabled: audioPrefs.musicEnabled, level: audioPrefs.musicVolume,
  onStatus: text => { $('music-status').textContent = text; } });
$('music').checked = audioPrefs.musicEnabled;
$('music-volume').value = Math.round(audioPrefs.musicVolume * 100);
$('sound').checked = audioPrefs.ambienceEnabled;
$('sound-volume').value = Math.round(audioPrefs.ambienceVolume * 100);
function refreshAudioLabels() {
  $('music-level').value = `${Math.round(audioPrefs.musicVolume * 100)}%`;
  $('sound-level').value = `${Math.round(audioPrefs.ambienceVolume * 100)}%`;
}
refreshAudioLabels();
function syncAudio() {
  const active = !document.hidden && !orientationBlocked && mode !== 'title';
  void music.setActive(active);
  try {
    if (active && audioPrefs.ambienceEnabled && audioPrefs.ambienceVolume > 0) {
      audio ??= createSoundscape(() => !document.hidden && !orientationBlocked && mode === 'explore', () => isNight(time.minute));
      audio.setVolume(audioPrefs.ambienceVolume);
      void audio.resume().catch(() => {});
    } else void audio?.suspend().catch(() => {});
  } catch {
    audioPrefs.ambienceEnabled = false; $('sound').checked = false;
    saveAudioSettings(storage, audioPrefs); toast('Town ambience is unavailable on this device.');
  }
}
$('music').onchange = () => {
  audioPrefs.musicEnabled = $('music').checked; saveAudioSettings(storage, audioPrefs);
  void music.setEnabled(audioPrefs.musicEnabled);
};
$('music-volume').oninput = () => {
  audioPrefs.musicVolume = Number($('music-volume').value) / 100;
  refreshAudioLabels(); saveAudioSettings(storage, audioPrefs); void music.setVolume(audioPrefs.musicVolume);
};
$('sound').onchange = () => {
  audioPrefs.ambienceEnabled = $('sound').checked; saveAudioSettings(storage, audioPrefs); syncAudio();
};
$('sound-volume').oninput = () => {
  audioPrefs.ambienceVolume = Number($('sound-volume').value) / 100;
  refreshAudioLabels(); saveAudioSettings(storage, audioPrefs); syncAudio();
};
document.addEventListener('visibilitychange', syncAudio);
window.addEventListener('pagehide', () => { void music.setActive(false); void audio?.suspend().catch(() => {}); });
window.addEventListener('pageshow', syncAudio);
// A fresh gesture also recovers mobile autoplay restrictions or interrupted audio.
document.addEventListener('pointerdown', () => { if (!document.hidden && !orientationBlocked && mode !== 'title') void music.sync(); }, { passive: true });

function openBoard(name='Nenek',place=2){opponent=name;setMode('board');board=newRound();boardBusy=false;boardToken++;$('board-panel').hidden=false;$('board-return').hidden=true;$('board-player-name').textContent=state.name;$('opponent-name').textContent=name;$('board-eyebrow').textContent=`${placeName(place).toUpperCase()} · CONGKAK`;renderBoard();$('sowing-status').textContent='Choose any non-empty house on your bottom row.';}
function closeBoard(){boardToken++;boardBusy=false;$('board-panel').hidden=true;setMode('explore');persist();if(!board?.over)toast(`Round paused. Talk to ${opponent} to start a fresh one.`);}
$('board-close').onclick=closeBoard;$('board-return').onclick=closeBoard;
function renderBoard(pits=board.pits,active=-1){
  const target=$('congkak-board');target.replaceChildren();
  const add=(index,column,row,store=false)=>{
    const button=document.createElement('button');button.className=`pit${store?' store':''}${index<7?' own':''}${index===active?' active':''}`;
    button.style.gridColumn=column;button.style.gridRow=store?'1 / 3':String(row);
    button.disabled=store||index>7||board.turn!==0||boardBusy||board.over||pits[index]===0;
    const label=store?(index===7?'Your store':`${opponent}'s store`):`${index<7?'Your':`${opponent}'s`} house ${(index%8)+1}`;
    button.setAttribute('aria-label',`${label}, ${pits[index]} shells`);
    const count=document.createElement('span');count.textContent=pits[index];button.append(count);
    const caption=document.createElement('small');caption.textContent=store?(index===7?'YOU':opponent.toUpperCase()):Array.from({length:Math.min(3,pits[index])},()=> '•').join('');button.append(caption);
    button.onclick=()=>runMove(index);target.append(button);
  };
  add(15,'1',1,true);add(7,'9',1,true);
  for(let j=0;j<7;j++){add(14-j,String(j+2),1);add(j,String(j+2),2);}
  $('board-status').textContent=board.over?(board.winner===0?'You won!':board.winner===1?`${opponent} wins this time.`:'A friendly draw.')+` ${board.pits[7]} – ${board.pits[15]} shells.`:board.turn===0?`${state.name}'s turn · Choose a house below.`:`${opponent} is thinking…`;
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function runMove(index){
  if(mode!=='board'||boardBusy||board.over||!legalMoves(board).includes(index))return;
  const token=boardToken, mover=board.turn;
  boardBusy=true;const result=playMove(board,index);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stride=Math.max(1,Math.ceil(result.frames.length/45));
  for(let i=0;i<result.frames.length;i+=stride){while(orientationBlocked&&token===boardToken)await delay(150);if(token!==boardToken)return;const f=result.frames[i];renderBoard(f.pits,f.active);audio?.shell();$('sowing-status').textContent=f.hand?`${mover===0?state.name:opponent} is sowing · ${f.hand} shells in hand`:'Last shell…';if(!reduced)await delay(55);}
  if(token!==boardToken)return;
  board=result.state;boardBusy=false;renderBoard();
  $('sowing-status').textContent=result.capture?`Captured ${result.capture} shells!`:result.extraTurn?'Last shell in the store — another turn.':'Turn complete.';
  if(board.over){
    $('board-return').hidden=false;
    eco.congkak.played+=1;if(board.winner===0){eco.congkak.won+=1;recordNostalgiaWin(eco,{game:'congkak'});}persist();
    if(opponent==='Nenek')storyEvent('played-congkak-nenek');
  }else if(board.turn===1){boardBusy=true;renderBoard();await delay(700);while(orientationBlocked&&token===boardToken)await delay(150);if(token!==boardToken)return;boardBusy=false;await runMove(opponentMove(board));}
}
function zoneAt(x,z){return districtAt(x,z).name;}
function mapEntries(){
  const jobs=new Set(eco.jobs.map(j=>j.status==='accepted'?j.from:nextStop(j)));
  const aliases={2:'Nenek congkak',8:'Atuk',15:'Faiz',14:'Mei Ling',25:'Uncle Lim tamiya mini 4wd toys parts accessories katalog',34:'Padang Faiz Mei Ling Atuk gasing tamiya mini 4wd race',37:'Pak Din dam haji petrol'};
  const shorts={2:'Rumah Tok',21:'Warung Kak Ita',22:'Runcit 99',25:'Uncle Lim',29:'Sekolah',31:'Masjid',34:'Padang · games',35:'Stesen bas',37:'Petrol · dam',38:'Pasar malam'};
  const places=BUILDINGS.map(b=>{
    const contact=personAt(b.id)?.name||contactAt(b.id)?.name||'',zone=DISTRICTS.find(d=>d.id===b.zone);
    return {id:`place:${b.id}`,type:'place',place:b.id,name:placeName(b.id),short:shorts[b.id],subtitle:[contact,zone.name].filter(Boolean).join(' · '),search:aliases[b.id]||'',badge:String(b.id),color:zone.color,mapX:b.x,mapZ:b.z,x:b.door.x,z:b.door.z,tags:[...(b.zone==='pekan'||['petrol','workshop','mini-shop','canteen','warung'].includes(b.kind)?['shops']:[]),...(['house','home','terrace'].includes(b.kind)?['homes']:[]),...([2,25,34,37].includes(b.id)?['games']:[]),...(jobs.has(b.id)?['jobs']:[])]};
  });
  const npcs=NPC_KEYS.map(key=>{
    const n=npcBody(key),info=NPCS[key],active=atPost(n),b=placeOf(active?n.post:info.place),p=active?n:b.door;
    return {id:`npc:${key}`,type:'npc',place:b.id,name:info.name,subtitle:`${placeName(b.id)}${active?'':' · Di rumah'}`,search:info.role+(['faiz','meiling','lim'].includes(key)?' Tamiya mini 4wd race':''),badge:info.name.charAt(0),color:'#30634d',mapX:p.x,mapZ:p.z,x:p.x,z:p.z,tags:['npc',...(['nenek','atuk','faiz','meiling','din','lim'].includes(key)?['games']:[]),...(jobs.has(b.id)?['jobs']:[])]};
  });
  return [...places,...npcs];
}
const mapPlayer=()=>({x:player.group.position.x,z:player.group.position.z,heading:player.group.rotation.y});
const planMapRoute=entry=>findWalkRoute(mapPlayer(),entry,world.canWalk,TOWN_BOUNDS);
const townMap=createTownMap({buildings:BUILDINGS,districts:DISTRICTS,roads:ROADS,bridges:BRIDGES,
  getEntries:mapEntries,getPlayer:mapPlayer,getQuest:()=>storyTarget(),getJobs:jobStops,getNavigation:()=>navigation,planRoute:planMapRoute,
  onNavigate:(entry,route)=>{navigation={entry,route,planned:{x:entry.x,z:entry.z},arrived:false};lastNavigationUpdate=-1;updateNavigation();},
  onClose:()=>{$('hud').inert=false;setMode('explore');$('map-button').focus();}
});
function updateNavigation(){
  if(!navigation)return;
  const p=mapPlayer(),current=mapEntries().find(e=>e.id===navigation.entry.id);
  if(!current){navigation=null;$('navigation-hud').hidden=true;return;}
  const moved=Math.hypot(current.x-navigation.planned.x,current.z-navigation.planned.z)>2;
  navigation.entry=current;
  const gap=Math.hypot(p.x-current.x,p.z-current.z);navigation.arrived=gap<2.4;
  if(navigation.arrived)navigation.route=[p];
  else{
    // Advance only to a reachable waypoint; an off-route walk replans from here.
    let next=navigation.route.length-1;
    while(next>0&&!clearSegment(p,navigation.route[next],world.canWalk))next--;
    if(!moved&&next>0)navigation.route=[p,...navigation.route.slice(next)];
    else {navigation.route=planMapRoute(current)||[];navigation.planned={x:current.x,z:current.z};}
  }
  $('navigation-hud').hidden=false;$('navigation-name').textContent=current.name;
  $('navigation-distance').textContent=navigation.arrived?'Dah sampai · boleh berinteraksi':navigation.route.length?`${Math.round(routeLength(navigation.route))} m · ikut garis biru di map`:'Buka map · laluan belum ditemui';
}
function drawMap(canvas){
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const position=player.group.position;
  const px=x=>w/2+(x-position.x)/76*w,pz=z=>h/2+(z-position.z)/76*h;
  ctx.fillStyle='#dce3c2';ctx.fillRect(0,0,w,h);
  const rect=(x,z,rw,rh,color)=>{ctx.fillStyle=color;ctx.fillRect(px(x-rw/2),pz(z-rh/2),rw/76*w,rh/76*h);};
  // A soft halo of district colour around each place, wherever it stands.
  for(const b of BUILDINGS)rect(b.x,b.z,b.w+8,b.d+8,DISTRICTS.find(d=>d.id===b.zone).color+'1c');
  rect(-65,0,9,140,'#82aaa2');
  for(const r of ROADS)rect(r.x,r.z,r.w,r.d,r.kind==='asphalt'?'#a5aaa3':'#c9b990');
  for(const b of BRIDGES)rect(b.x,b.z,b.w,b.d,'#c7bd9e');
  for(const c of world.colliders){
    if(c.kind==='npc')continue;
    if(c.r!==undefined){ctx.fillStyle='#66745b';ctx.beginPath();ctx.arc(px(c.x),pz(c.z),Math.max(1,c.r*w/76),0,Math.PI*2);ctx.fill();}
    else rect(c.x,c.z,c.w,c.d,c.kind==='fence'?'#384b3f':'#827765');
  }
  for(const b of BUILDINGS){const color=DISTRICTS.find(d=>d.id===b.zone).color;rect(b.x,b.z,b.w,b.d,color+'95');}
  if(storySpot&&!storySpot.job){const q=storySpot;ctx.fillStyle='#e8b535';ctx.beginPath();ctx.moveTo(px(q.x),pz(q.z)-6);ctx.lineTo(px(q.x)+5,pz(q.z));ctx.lineTo(px(q.x),pz(q.z)+6);ctx.lineTo(px(q.x)-5,pz(q.z));ctx.fill();}
  for(const stop of jobStops()){const x=px(stop.x),y=pz(stop.z),r=4;ctx.fillStyle='#b5986a';ctx.strokeStyle='#272630';ctx.lineWidth=1.2;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.strokeRect(x-r,y-r,r*2,r*2);}
  world.residents.filter(atPost).forEach(n=>{ctx.fillStyle='#7d9a86';ctx.beginPath();ctx.arc(px(n.x),pz(n.z),1.8,0,Math.PI*2);ctx.fill();});
  world.npcs.filter(atPost).forEach(n=>{ctx.fillStyle='#3f6e5b';ctx.beginPath();ctx.arc(px(n.x),pz(n.z),2.5,0,Math.PI*2);ctx.fill();});
  if(!riding){ctx.fillStyle='#c8322c';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px(bike.x),pz(bike.z),3.5,0,Math.PI*2);ctx.fill();ctx.stroke();}
  const p=player.group.position;ctx.fillStyle='#175fd0';ctx.strokeStyle='#faf6df';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(p.x),pz(p.z),4,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.save();ctx.translate(px(p.x),pz(p.z));ctx.rotate(-player.group.rotation.y);ctx.fillStyle='#175fd0';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(-3,4);ctx.lineTo(3,4);ctx.fill();ctx.restore();
  if(navigation?.route.length){ctx.beginPath();navigation.route.forEach((p,i)=>{i?ctx.lineTo(px(p.x),pz(p.z)):ctx.moveTo(px(p.x),pz(p.z));});ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle='#175fd0';ctx.lineWidth=3;ctx.stroke();}
  if(navigation){const d=navigation.entry,x=px(d.x),y=pz(d.z);ctx.fillStyle='#175fd0';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.stroke();}
  // Redraw the player over the route and show north on the local mini-map.
  ctx.fillStyle='#175fd0';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(p.x),pz(p.z),5,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#243f37';ctx.font='bold 12px system-ui';ctx.textAlign='right';ctx.fillText('N ↑',w-8,17);
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
    const isRunning=(running||keys.has('shift'))&&!walkOnly;
    if(isRunning&&crouching){crouching=false;updateMoveButtons();}
    const p=player.group.position;
    const previousX=p.x,previousZ=p.z;
    let pedalling=false;
    if(riding){
      // The bike steers toward the stick and carries the rider.
      pedalling=stepBike(bike,{dx,dz,fast:isRunning},dt);
      const moved={x:bike.x,z:bike.z};moveWithCollision(moved,Math.sin(bike.heading),Math.cos(bike.heading),bike.speed,dt,world.canWalk);
      const went=Math.hypot(moved.x-bike.x,moved.z-bike.z),sign=Math.sign(bike.speed);if(dt>0&&went<Math.abs(bike.speed)*dt*.6)bike.speed=sign*went/dt;
      bike.x=moved.x;bike.z=moved.z;bicycle.roll(went*(sign||1),pedalling);
      // Wedged for a while with the stick pushed: lift it out to open ground.
      bikeStuck=length>.3&&went<.01*dt*60?bikeStuck+dt:0;
      if(bikeStuck>2.2){bikeStuck=0;const spot=parkNear(bike.x,bike.z,bike.heading,2.5);Object.assign(bike,{x:spot.x,z:spot.z,heading:spot.heading,speed:0});toast('Basikal tersangkut · lifted out to open ground.');}
      p.x=bike.x;p.z=bike.z;player.group.rotation.set(0,bike.heading,bike.lean);
    }else{
      moveWithCollision(p,dx,dz,crouching?(player.native?.crouchWalk??1.2):walkOnly?WALK_ONLY:isRunning?RUN_SPEED:WALK_SPEED,dt,world.canWalk);
      if(length>.08){const angle=Math.atan2(dx,dz);player.group.rotation.y+=Math.atan2(Math.sin(angle-player.group.rotation.y),Math.cos(angle-player.group.rotation.y))*Math.min(1,dt*14);}
    }
    // Jumping: a short push-off, then up and down under gravity.
    if(jumpQueued>=0){jumpQueued-=dt;if(jumpQueued<0){airborne=true;jumpVy=JUMP_SPEED;}}
    if(airborne){jumpVy-=GRAVITY*dt;jumpY+=jumpVy*dt;if(jumpY<=0){jumpY=0;airborne=false;landedNow=true;audio?.footsteps(1);}}
    const ground=world.groundHeight(p.x,p.z);
    p.y=ground-.065+jumpY;
    if(riding)bicycle.place(bike,ground);
    if(!riding&&!airborne)audio?.footsteps(Math.hypot(p.x-previousX,p.z-previousZ));
    const travel=Math.hypot(p.x-previousX,p.z-previousZ);
    // Chase camera: swing in behind the runner while they move, gently when
    // turning and not at all when they run back toward the lens.
    if(length>.08&&elapsed-lastLook>1.2){
      const behind=player.group.rotation.y+Math.PI,delta=Math.atan2(Math.sin(behind-yaw),Math.cos(behind-yaw));
      const weight=(Math.cos(delta)*.5+.5)*Math.min(1,travel/Math.max(.0001,dt*WALK_SPEED));
      yaw+=delta*(1-Math.exp(-dt*2.6*weight));
    }
    player.animate(dt,dt>0?Math.min(1,travel/(dt*(isRunning?RUN_SPEED:WALK_SPEED))):0,isRunning,travel,null,{crouch:crouching,air:airborne,jumped:jumpedNow,landed:landedNow,ride:riding?bicycle.targets():null});
    jumpedNow=landedNow=false;
    nearby=null;let best=2.6;
    for(const n of world.npcs){if(!atPost(n))continue;const gap=Math.hypot(p.x-n.x,p.z-n.z);if(gap<best){best=gap;nearby={kind:'npc',...n};}}
    // Residents answer for their own place, at the door or out front.
    if(!nearby)for(const n of world.residents){if(!atPost(n))continue;const gap=Math.hypot(p.x-n.x,p.z-n.z);if(gap<best){best=gap;nearby={kind:'resident',...n};}}
    if(!nearby){best=2.4;for(const b of BUILDINGS){if(atPost(npcBody(npcAt(b.id)))&&npcBody(npcAt(b.id)).post===b.id&&Math.hypot(p.x-npcBody(npcAt(b.id)).x,p.z-npcBody(npcAt(b.id)).z)<4)continue;const gap=Math.hypot(p.x-b.door.x,p.z-b.door.z);if(gap<best){best=gap;nearby={kind:'place',id:b.id,x:b.door.x,z:b.door.z};}}}
    $('interaction').hidden=!nearby;
    if(nearby)$('interact-label').textContent=nearby.kind==='npc'?`Talk to ${NPCS[nearby.id].name}`:nearby.kind==='resident'?`Talk to ${bodyName(nearby)}`:personAt(nearby.id)?`Talk to ${personAt(nearby.id).name}`:`Visit ${placeName(nearby.id)}`;
    const firstStop=jobStops()[0];$('job-distance').textContent=firstStop?`${Math.round(Math.hypot(p.x-firstStop.x,p.z-firstStop.z))} m away`:'';
    $('location-name').textContent=zoneAt(p.x,p.z);
    $('quest-distance').textContent=storySpot?`${Math.round(Math.hypot(p.x-storySpot.x,p.z-storySpot.z))} m away`:'';
    if(navigation&&elapsed-lastNavigationUpdate>.8){updateNavigation();lastNavigationUpdate=elapsed;}
    if(navigation){const next=navigation.route[1]||navigation.entry,angle=Math.atan2(next.x-p.x,-(next.z-p.z))+yaw;$('navigation-arrow').textContent=navigation.arrived?'✓':'↑';$('navigation-arrow').style.transform=`rotate(${navigation.arrived?0:angle}rad)`;$('navigation-hud').hidden=false;}
    if(elapsed-lastSave>5){persist();lastSave=elapsed;}
    tickClock(time,dt);showTime();
  } else player.animate(dt,0,false,0,mode==='dialogue'||mode==='counter'?'talk':null,{crouch:crouching,ride:riding?bicycle.targets():null});
  // Errand walkers jump to where the clock says after a load, sleep or prayer.
  const sync=!errandClock||errandClock.day!==time.day||Math.abs(time.minute-errandClock.minute)>3;errandClock={day:time.day,minute:time.minute};
  for(const n of townsfolk()){
    const {character}=n,pp=player.group.position;
    // Off duty they are at home: out of sight and out of the way.
    if(mode!=='title'&&!atPost(n)){character.group.visible=false;n.collider.x=1e4;continue;}
    let gap=Math.hypot(n.x-pp.x,n.z-pp.z);
    // Past 42 m they are hidden and still, except errand walkers, who keep walking.
    if(mode!=='title'&&gap>=42&&!n.errand){character.group.visible=false;continue;}
    // Their own loop (routines.js): they stop for you when you come close, and wait while you talk.
    const resident=!NPCS[n.id],talking=talkingTo?.id===n.id||(resident?mode==='counter'&&counter?.place===n.place&&gap<4:counter?.npc===n.id);
    if(talking){if(n.errand)n.errand.face(character.group.rotation.y);else n.routine.state.heading=character.group.rotation.y;}
    // Wave back when the player says hi nearby (after a short beat).
    const waving=n.waveUntil>elapsed&&n.waveUntil-elapsed<2.1,pause=talking||waving||mode!=='explore'&&mode!=='title';
    // Walkers only stop in the street when greeted, not whenever you pass.
    const look=mode==='explore'&&((gap<2.4&&!n.errand?.walking())||n.waveUntil>elapsed)?pp:null;
    const s=n.errand?n.errand.update(dt,time.minute,{sync,pause,look,stay:storyNeedsHome(eco,n.place),free:(x,z)=>n.walk(x,z)&&Math.hypot(x-pp.x,z-pp.z)>.6}):n.routine.update(dt,{pause,look});
    n.x=s.x;n.z=s.z;n.collider.x=s.x;n.collider.z=s.z;gap=Math.hypot(n.x-pp.x,n.z-pp.z);
    // Townsfolk past 42 m (about 14 px tall) are hidden; only those within 20 m
    // cast sun shadows, and past 30 m their face drawing and ground shadow
    // (a few pixels by then) are skipped to save two draws each.
    character.group.visible=mode==='title'||gap<42;if(!character.group.visible)continue;
    const near=gap<20,detail=mode==='title'||gap<30;
    if(character.figure.castShadow!==near)character.figure.castShadow=near;
    if(n.detail!==detail){n.detail=detail;for(const d of character.details)d.visible=detail;}
    character.group.position.set(s.x,world.groundHeight(s.x,s.z)-.065,s.z);if(!talking)character.group.rotation.y=s.heading;
    character.animate(dt,s.moving,false,s.travel,waving?'wave':s.action,waving?2.1-(n.waveUntil-elapsed):s.actionTime);
  }
  // The extras (crowds.js), placed by the clock alone. Running and walking
  // is continuous; otherwise they only appear, vanish or move to another
  // gathering while both spots are over 25 m from the player.
  for(const c of world.crowd){
    const pp=player.group.position,{character}=c,far=q=>!q||Math.hypot(q.x-pp.x,q.z-pp.z)>25;
    let pose=mode==='title'?null:crowdPose(c.id,time.minute,time.day,c.legs);
    const spot=pose?.stop&&c.stops.find(q=>q.o===pose.stop.outing&&q.i===pose.stop.index)?.spot;if(pose?.stop&&!spot)pose=null;
    if((pose?.key??null)!==(c.pose?.key??null)){
      if(sync||pose?.moving||c.pose?.moving||mode==='title'||far(c.pose&&c)&&far(spot||pose)){c.pose=pose;c.routine=pose?.stop?c.routineAt(pose.stop.outing,pose.stop.index):null;}
    }
    if(!c.pose){character.group.visible=false;c.collider.x=1e4;continue;}
    const px=c.x,pz=c.z,waving=c.waveUntil>elapsed&&c.waveUntil-elapsed<2.1;let s;
    if(c.routine){let gap=Math.hypot(c.x-pp.x,c.z-pp.z);s=c.routine.update(dt,{pause:waving||mode!=='explore',look:mode==='explore'&&(gap<2.4||c.waveUntil>elapsed)?pp:null});}
    else s=pose?.key===c.pose.key?pose:c.pose;
    c.x=s.x;c.z=s.z;c.collider.x=s.x;c.collider.z=s.z;
    const gap=Math.hypot(c.x-pp.x,c.z-pp.z);character.group.visible=gap<42;if(!character.group.visible)continue;
    const near=gap<20,detail=gap<30;if(character.figure.castShadow!==near)character.figure.castShadow=near;
    if(c.detail!==detail){c.detail=detail;for(const d of character.details)d.visible=detail;}
    character.group.position.set(s.x,world.groundHeight(s.x,s.z)-.065,s.z);character.group.rotation.y=s.heading;
    const travel=c.routine?s.travel:Math.min(Math.hypot(s.x-px,s.z-pz),(c.pose.run?KID_RUN:CROWD_WALK)*dt*2);
    character.animate(dt,c.routine?s.moving:1,!c.routine&&c.pose.run,travel,waving?'wave':c.routine?s.action:null,waving?2.1-(c.waveUntil-elapsed):c.routine?s.actionTime:0);
  }
  world.wind.value=elapsed;
  world.updateRiver(elapsed);
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
  world.updateLampLight(p.x,p.z);
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
  if (!orientationBlocked && !['board','dam','gasing','tamiya','map','pause','prayer','counter','bag','book'].includes(mode)) renderer.render(scene,camera);
  if(mode==='explore'&&Math.floor(elapsed*8)!==Math.floor((elapsed-dt)*8))drawMap($('minimap'));
  requestAnimationFrame(tick);
}
camera.position.set(-10,32,58);camera.lookAt(-30,0,25);showTime();refreshQuest();syncOrientation();$('loading').hidden=true;tick();
$('world').addEventListener('webglcontextlost',event=>{event.preventDefault();persist();$('error-text').textContent='The graphics session was interrupted. Reload to continue from your saved position.';$('error-panel').hidden=false;});
// Read-only snapshot for automated smoke tests and future diagnostics.
window.retroMalaysia={town:()=>({buildings:structuredClone(BUILDINGS),colliders:structuredClone(world.colliders)}),canWalk:(x,z)=>world.canWalk(x,z),snapshot:()=>({audio:{music:music.snapshot(),ambience:audio?.context.state??'off'},riding,bike:{...bike},shops:world.shopStates(),map:townMap.snapshot(),navigation:navigation?structuredClone(navigation):null,eco:structuredClone(eco),clock:{...time},story:state.story,who:state.who,counter:counter?.place??null,nearbyPlace:nearby?.kind==='place'?nearby.id:null,nearbyNpc:nearby?.kind==='npc'?nearby.id:null,parcels:world.jobMarkers.filter(m=>m.visible).map(m=>m.position.toArray().map(v=>+v.toFixed(2))),npcs:world.npcs.map(n=>({id:n.id,onDuty:atPost(n),x:+n.x.toFixed(2),z:+n.z.toFixed(2),post:n.post})),crowd:world.crowd.map(c=>({id:c.id,key:c.pose?.key??null,visible:c.character.group.visible,x:+c.x.toFixed(2),z:+c.z.toFixed(2),spots:c.stops.filter(q=>q.spot).length,stops:c.stops.length,at:c.stops.map(q=>q.spot&&[q.spot.place,+q.spot.x.toFixed(1),+q.spot.z.toFixed(1)]),legs:c.legs.map(l=>Object.keys(l).length)})),residents:world.residents.map(n=>({id:n.id,place:n.place,keeper:!!n.keeper,phase:n.errand?.state.phase??'home',at:n.errand?.state.at??null,routes:n.routes?Object.keys(n.routes).map(Number):null,errandSpots:n.routes?Object.values(n.routes).map(r=>[+r.spot.x.toFixed(1),+r.spot.z.toFixed(1)]):null,onDuty:atPost(n),visible:n.character.group.visible,x:+n.x.toFixed(2),z:+n.z.toFixed(2)})),mode,orientationBlocked,cameraDistance:distance,cameraLens:lensDistance,cameraPitch,cameraYaw:yaw,...state,x:player.group.position.x,z:player.group.position.z,nearby:nearby?.id,board:board?structuredClone(board):null,graphics:{buses:world.busStates(),cars:world.carStates(),lamps:world.lamps.length,style:'low-poly-3d-comic',buildings:BUILDINGS.length,districts:DISTRICTS.length,collisionBodies:world.colliders.length,avatarHeight:player.height,occluded:world.occlusionCount(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}})};

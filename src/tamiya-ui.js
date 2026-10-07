import { TAMIYA_CARS, ownedCars, carRating } from './tamiya-cars.js?v=1.7.0';
import { TAMIYA_TRACKS, TAMIYA_SETUPS, newTamiyaRound, prepareTamiya, launchTamiya, launchMeter, launchQuality, advanceTamiya, raceDuration, standings, racePlans } from './tamiya.js?v=1.7.0';
import { TAMIYA_QUESTS, startTamiya, recordTamiya } from './tamiya-progress.js?v=1.7.0';
import { createTamiyaView } from './tamiya-view.js?v=1.7.0';

export function createTamiyaUI({getEco,getName,isPaused,onOpen,onClose,onChange}){
  const $=id=>document.getElementById(id),panel=$('tamiya-panel');let view=null,visible=false,playing=false,raf=0,last=0,savedAt=0,phase='',sample=null,notice='',shownTime=-1;
  const round=()=>getEco().tamiya.round;
  const label=key=>key==='player'?getName():key==='faiz'?'Faiz':'Mei Ling';
  function commit(){const awards=recordTamiya(getEco());if(awards.length)notice=`Hadiah +RM ${(awards.reduce((n,q)=>n+q.sen,0)/100).toFixed(2)} · ${awards.length} milestone`;onChange();}
  function clearInput(){sample=null;}
  function clearConfirm(){$('tamiya-confirm').hidden=true;$('tamiya-controls').inert=false;}
  function close(){clearInput();visible=playing=false;cancelAnimationFrame(raf);clearConfirm();panel.hidden=true;commit();onClose();}
  function choice(){return newTamiyaRound($('tamiya-track').value,$('tamiya-car').value,$('tamiya-setup').value,1);}
  function preview(){const s=choice(),car=TAMIYA_CARS[s.car],track=TAMIYA_TRACKS[s.track];
    $('tamiya-preview-img').src=`./assets/items/${s.car}.svg`;$('tamiya-preview-img').alt=car.name;
    $('tamiya-preview-name').textContent=`${car.series} · ${car.name}`;
    $('tamiya-preview-stats').textContent=`Power ${carRating(s.car)} · Speed ${car.speed} · Grip ${car.grip} · Stability ${car.stability}`;
    $('tamiya-preview-note').textContent=`${s.car==='tamiya'&&!getEco().collection.tamiya?'Pinjam Faiz · ':''}${TAMIYA_SETUPS[s.setup].note}`;
    $('tamiya-track-note').textContent=track.note;$('tamiya-rivals').textContent=`Faiz: ${TAMIYA_CARS[track.faiz].name} · Mei Ling: ${TAMIYA_CARS[track.meiling].name}`;
    if(view)view.draw(s,matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function lobby(){playing=false;cancelAnimationFrame(raf);clearInput();clearConfirm();notice='';phase='';
    const p=getEco().tamiya,s=round(),unfinished=s&&s.phase!=='result';
    $('tamiya-config').hidden=!!unfinished;$('tamiya-resume').hidden=!unfinished;$('tamiya-play').hidden=true;
    $('tamiya-record').textContent=`${p.won} wins · ${p.played} races · Track menang ${p.wins.length}/3`;
    $('tamiya-quests').replaceChildren(...TAMIYA_QUESTS.map(q=>{const li=document.createElement('li');li.textContent=`${p.claimed.includes(q.id)?'✓':'○'} ${q.title} · ${p.claimed.includes(q.id)?'Collected':`RM ${(q.sen/100).toFixed(2)}`}`;return li;}));
    $('tamiya-car').replaceChildren();
    for(const id of ['tamiya',...ownedCars(getEco().collection).filter(id=>id!=='tamiya')]){const o=document.createElement('option');o.value=id;o.textContent=`${TAMIYA_CARS[id].name}${id==='tamiya'&&!getEco().collection.tamiya?' · pinjam Faiz':''}`;$('tamiya-car').append(o);}
    $('tamiya-track').value=s?.track||'oval';$('tamiya-car').value=s?.car||ownedCars(getEco().collection).at(-1)||'tamiya';$('tamiya-setup').value=s?.setup||'balanced';
    if(unfinished){$('tamiya-saved').textContent=`${TAMIYA_TRACKS[s.track].name} · ${TAMIYA_CARS[s.car].name} · ${s.phase==='race'?'Race sedang berjalan':s.phase==='countdown'?'Countdown':'Di grid'}`;view?.draw(s);}else preview();
  }
  function open(host){visible=true;panel.hidden=false;onOpen();$('tamiya-host').textContent=host==='meiling'?'Mei Ling: “Grip kuat, jangan keluar track!”':'Faiz: “Jom Dash! Kereta beginner aku pinjam.”';
    if(!view)try{view=createTamiyaView($('tamiya-arena'));}catch{ $('tamiya-view-error').hidden=false; }
    lobby();$('tamiya-close').focus();
  }
  function play(){playing=true;phase='';shownTime=-1;$('tamiya-config').hidden=$('tamiya-resume').hidden=true;$('tamiya-play').hidden=false;last=performance.now();savedAt=last;render();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}
  function render(){const s=round(),changed=phase!==s.phase;phase=s.phase;
    panel.dataset.phase=s.phase;
    $('tamiya-positions').hidden=['ready','launch'].includes(s.phase);
    const steps={ready:'1 · Di grid',launch:'2 · Timing pelancaran',countdown:'3 · Bersedia…',race:'4 · Jom Dash!',result:'Race selesai'};
    $('tamiya-stage').textContent=`${TAMIYA_TRACKS[s.track].name} · ${steps[s.phase]}`;
    const status={ready:'Faiz: “Tekan Mula meter. Lepas tepat di tengah untuk start yang kemas.”',launch:'Tap Lepas! apabila marker di tengah emas. Kereta bergerak sendiri; setup kamu mengawal kelajuan dan kestabilan.',countdown:`${Math.max(1,Math.ceil(3-s.elapsed))}…`,race:`3 lap · Race ${s.elapsed.toFixed(1)} s`,result:standings(s)[0].key==='player'?'Faiz: “Kau menang! Jom rematch.”':'Mei Ling: “Cuba tukar setup atau upgrade kereta di Uncle Lim.”'};
    if(changed||s.phase==='countdown'||s.phase==='race')$('tamiya-status').textContent=status[s.phase];
    const action=$('tamiya-action');action.textContent={ready:'Mula meter →',launch:'Lepas! · tepat di tengah',countdown:'Bersedia…',race:'Sedang berlumba…',result:'Pilih track / race lagi →'}[s.phase];action.disabled=['countdown','race'].includes(s.phase);
    $('tamiya-launch-wrap').hidden=s.phase!=='launch';$('tamiya-marker').style.left=`${launchMeter(s.elapsed)*100}%`;
    $('tamiya-meter').setAttribute('aria-valuenow',Math.round(launchMeter(s.elapsed)*100));
    $('tamiya-skip').disabled=!['race'].includes(s.phase);$('tamiya-notice').textContent=notice;
    $('tamiya-throw').textContent=`${TAMIYA_CARS[s.car].name} · ${TAMIYA_SETUPS[s.setup].name}${['countdown','race','result'].includes(s.phase)?` · Start ${Math.round(launchQuality(s.contact)*100)}%`:''}`;
    if(changed||Math.floor(s.elapsed*10)!==shownTime){shownTime=Math.floor(s.elapsed*10);$('tamiya-positions').replaceChildren();
      const rows=['race','result'].includes(s.phase)?standings(s):racePlans(s).map(p=>({...p,lap:1,finished:false,derailed:false}));
      rows.forEach((r,i)=>{const li=document.createElement('li'),name=document.createElement('b'),detail=document.createElement('span');li.className=r.key==='player'?'your-racer':'';name.textContent=`${i+1}. ${label(r.key)}`;detail.textContent=r.finished?`${r.duration.toFixed(2)} s`:r.derailed?'Keluar! Masuk semula…':`Lap ${r.lap}/3`;li.append(name,detail);$('tamiya-positions').append(li);});
    }
    view?.draw(s,matchMedia('(prefers-reduced-motion: reduce)').matches);
    if(changed&&!isPaused()&&['ready','launch','result'].includes(s.phase))action.focus({preventScroll:true});
  }
  function frame(now){if(!visible||!playing)return;const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;
    if(!isPaused()&&!view?.isLost()&&$('tamiya-confirm').hidden){const before=round().phase;getEco().tamiya.round=advanceTamiya(round(),dt);if(before!==round().phase)commit();else if(now-savedAt>=2000&&!round().settled){commit();savedAt=now;}render();if(round().phase==='result')return;}else clearInput();raf=requestAnimationFrame(frame);
  }
  function change(fn){if(!playing||isPaused()||view?.isLost()||!$('tamiya-confirm').hidden)return;getEco().tamiya.round=fn(round());commit();render();}
  // Keep the same action button throughout the race: no tap can fall through
  // onto an exit button as the phase changes. Timing is taken on contact.
  panel.addEventListener('pointerdown',clearInput,true);
  $('tamiya-action').addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0&&round()?.phase==='launch'&&!isPaused())sample=launchMeter(round().elapsed);});
  $('tamiya-action').addEventListener('pointercancel',clearInput);
  $('tamiya-action').onclick=e=>{const value=e.detail>0&&sample!==null?sample:launchMeter(round()?.elapsed||0);clearInput();if(!playing)return;if(round().phase==='ready')change(prepareTamiya);else if(round().phase==='launch')change(s=>launchTamiya(s,value));else if(round().phase==='result')lobby();};
  $('tamiya-enter').onclick=()=>{if(isPaused())return;startTamiya(getEco(),$('tamiya-track').value,$('tamiya-car').value,$('tamiya-setup').value);commit();play();};
  $('tamiya-sambung').onclick=play;$('tamiya-skip').onclick=()=>{if(round()?.phase==='race')change(s=>advanceTamiya(s,raceDuration(s)));};
  $('tamiya-close').onclick=$('tamiya-town').onclick=close;
  $('tamiya-end-open').onclick=()=>{clearInput();$('tamiya-confirm').hidden=false;$('tamiya-controls').inert=true;$('tamiya-keep').focus();};
  $('tamiya-keep').onclick=()=>{clearConfirm();$('tamiya-sambung').focus();};$('tamiya-end').onclick=()=>{getEco().tamiya.round=null;clearConfirm();commit();lobby();};
  for(const id of ['tamiya-track','tamiya-car','tamiya-setup'])$(id).onchange=preview;
  panel.addEventListener('keydown',e=>{if([' ','Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.stopPropagation();if(e.key!=='Tab')return;const scope=$('tamiya-confirm').hidden?panel:$('tamiya-confirm'),items=[...scope.querySelectorAll('button,select,summary')].filter(b=>!b.disabled&&b.getClientRects().length&&!b.closest('[inert]'));
    if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}});
  window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(visible)commit();}});
  return {open,close};
}

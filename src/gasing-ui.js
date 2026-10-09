import { GASING_MODES, windString, startCharge, lockPower, releaseTop, advanceGasing, roundDuration } from './gasing.js?v=2.12.0';
import { GASING_QUESTS, startGasing, recordGasing } from './gasing-progress.js?v=2.12.0';
import { drawGasingArena } from './gasing-arena.js?v=2.12.0';

export function createGasingUI({ getEco, getName, isPaused, onOpen, onClose, onChange }) {
  const $ = id => document.getElementById(id), panel = $('gasing-panel');
  let visible = false, playing = false, host = 'atuk', raf = 0, last = 0, savedAt = 0, shownPhase = '', suppressClick = 0, inputPointer = null, releaseSample = null, notice = '';
  const round = () => getEco().gasing.round;
  function commit() {
    const awards = recordGasing(getEco());
    if (awards.length) notice = awards.map(q => `${q.title} +RM ${(q.sen / 100).toFixed(2)}`).join(' · ');
    onChange();
  }
  function add(parent, label, action, cls = 'primary') {
    const b = document.createElement('button'); b.textContent = label; b.className = cls; b.onclick = action; parent.append(b);
  }
  function lobby() {
    playing = false; cancelAnimationFrame(raf); resetInput(); notice = '';
    $('gasing-lobby').hidden = false; $('gasing-play').hidden = true;
    const p = getEco().gasing, options = $('gasing-options'); options.replaceChildren();
    $('gasing-record').textContent = `${p.won} wins · ${p.played} rounds · Best ${p.best.toFixed(2)} s`;
    $('gasing-equipment').textContent = getEco().collection.gasing ? 'Your gasing from Uncle Lim is ready. It stays in your collection.' : 'Atuk lends you a starter gasing. Buy your own at Uncle Lim’s when you are ready.';
    if (round() && round().phase !== 'result') {
      add(options, `Sambung · ${GASING_MODES[round().kind]}`, play);
      add(options, 'End saved round…', confirmEnd, 'secondary');
    } else {
      const kinds = host === 'faiz' ? ['faiz'] : ['belajar', 'practice', 'atuk'];
      for (const kind of kinds) add(options, GASING_MODES[kind], () => { startGasing(getEco(), kind); commit(); play(); });
    }
    const list = $('gasing-quests'); list.replaceChildren();
    for (const q of GASING_QUESTS) { const li = document.createElement('li'); li.textContent = `${p.claimed.includes(q.id) ? '✓' : '○'} ${q.title} · ${p.claimed.includes(q.id) ? 'Collected' : `RM ${(q.sen / 100).toFixed(2)}`}`; li.title = q.text; list.append(li); }
  }
  function resetInput() {
    releaseSample = null;
    if (round()) round().charging = false;
    if (inputPointer !== null && $('gasing-power').hasPointerCapture(inputPointer)) $('gasing-power').releasePointerCapture(inputPointer);
    inputPointer = null;
  }
  function clearConfirm() { $('gasing-confirm').hidden = true; $('gasing-lobby').inert = $('gasing-play').inert = false; }
  function close() { resetInput(); visible = playing = false; cancelAnimationFrame(raf); clearConfirm(); panel.hidden = true; commit(); onClose(); }
  function open(key) {
    host = key === 'faiz' ? 'faiz' : 'atuk'; visible = true; panel.hidden = false; onOpen();
    $('gasing-host').textContent = host === 'faiz' ? '“Jom lawan! Gasing siapa tahan paling lama?”' : '“Lilit tali ketat. Tarik rendah, lepas kemas. Mari Atuk tunjuk.”';
    $('gasing-title').textContent = host === 'faiz' ? 'Jom lawan Faiz.' : 'Jom main gasing.';
    lobby(); $('gasing-close').focus();
  }
  function play() {
    playing = true; shownPhase = ''; $('gasing-lobby').hidden = true; $('gasing-play').hidden = false;
    last = performance.now(); savedAt = last; render(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function render() {
    const s = round(), phase = s.phase, changed = shownPhase !== phase; shownPhase = phase;
    const steps = { ready: '1 · Wind the string', winding: '1 · Lilit tali…', power: '2 · Set your power', release: '3 · Release cleanly', spin: '4 · Siapa tahan lama?', result: 'Round complete' };
    $('gasing-stage').textContent = `${GASING_MODES[s.kind]} · ${steps[phase]}`;
    const tips = {
      ready: 'Atuk: “Lilit tali ketat dulu. Baru tarik.” Tap below to wind the string.',
      winding: 'Wind the rope from the tip up around the wooden body. Keep the coils snug.',
      power: 'Hold Power. Release it when the marker is in the gold zone. Aim for 78%, not maximum power.',
      release: 'Tap Lepas! when the marker reaches the centre. A clean release keeps your gasing upright.',
      spin: 'Watch the speed fall and wobble grow. The last gasing spinning wins.',
      result: s.winner === 0 ? (s.kind === 'atuk' ? 'Atuk: “Haa, dah jadi jaguh! Pandai kamu.”' : s.kind === 'faiz' ? 'Faiz: “Okay, kau menang. Rematch nanti!”' : 'Atuk: “Cantik! Tali kemas, gasing tegak.”') : s.winner === 1 ? 'Atuk: “Cuba lagi. Power dekat emas, lepas dekat tengah.”' : s.kind === 'practice' ? 'Practice finished. Try improving your power and release timing.' : 'Seri! Both tops stopped together.'
    };
    if (changed) $('gasing-status').textContent = tips[phase];
    $('gasing-wind').hidden = phase !== 'ready'; $('gasing-power').hidden = phase !== 'power'; $('gasing-release').hidden = phase !== 'release';
    $('gasing-skip').hidden = phase !== 'spin'; $('gasing-again').hidden = phase !== 'result';
    $('gasing-winding').hidden = phase !== 'winding'; $('gasing-meter-wrap').hidden = !['power', 'release'].includes(phase);
    $('gasing-meter-wrap').classList.toggle('release', phase === 'release');
    const value = phase === 'power' ? s.power : s.release;
    $('gasing-marker').style.left = `${value * 100}%`;
    $('gasing-meter').setAttribute('aria-valuenow', Math.round(value * 100));
    $('gasing-meter').setAttribute('aria-label', phase === 'power' ? 'Throw power, aim for 78 percent' : 'Release timing, aim for the centre');
    $('gasing-meter-label').textContent = phase === 'power' ? `Power ${Math.round(s.power * 100)}% · gold zone 68–88%` : 'Lepas di tengah · release at the centre';
    $('gasing-feedback').textContent = s.player ? `Power ${Math.round(s.power * 100)}% · Release ${Math.round(s.player.accuracy * 100)}% · Stability ${Math.round(s.player.stability * 100)}%` : `Equipment · ${s.equipment === 'owned' ? 'Your gasing' : 'Atuk’s loan'}`;
    $('gasing-notice').textContent = notice;
    const result = $('gasing-result'); result.hidden = phase !== 'result';
    if (phase === 'result') result.textContent = `${getName()}: ${s.player.duration.toFixed(2)} s${s.opponent ? ` · ${s.kind === 'faiz' ? 'Faiz' : 'Atuk'}: ${s.opponent.duration.toFixed(2)} s` : ''}`;
    drawGasingArena($('gasing-arena'), s, getName(), matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (changed && !isPaused()) {
      const focus = { ready: 'gasing-wind', power: 'gasing-power', release: 'gasing-release', result: 'gasing-again' }[phase];
      if (focus) $(focus).focus({ preventScroll: true });
    }
  }
  function frame(now) {
    if (!visible || !playing) return;
    const dt = Math.max(0, Math.min(.1, (now - last) / 1000)); last = now;
    if (!isPaused() && $('gasing-confirm').hidden) {
      const before = round().phase; getEco().gasing.round = advanceGasing(round(), dt);
      if (before !== round().phase) commit();
      else if (now - savedAt >= 2000 && !round().settled) { commit(); savedAt = now; }
      render();
      if (round().phase === 'result') return;
    } else resetInput();
    raf = requestAnimationFrame(frame);
  }
  function change(fn) { if (!playing || isPaused() || !$('gasing-confirm').hidden) return; getEco().gasing.round = fn(round()); commit(); render(); }
  $('gasing-wind').onclick = () => change(windString);
  function charge() { if (playing && round().phase === 'power' && !isPaused() && !round().charging) change(startCharge); }
  function releasePower() {
    if (playing && round().phase === 'power' && round().charging && !isPaused()) { suppressClick = performance.now() + 250; change(lockPower); }
    inputPointer = null;
  }
  $('gasing-power').addEventListener('pointerdown', e => { if (inputPointer !== null || round().phase !== 'power' || isPaused()) return; inputPointer = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); charge(); });
  $('gasing-power').addEventListener('pointerup', releasePower);
  for (const type of ['pointercancel', 'lostpointercapture']) $('gasing-power').addEventListener(type, resetInput);
  $('gasing-power').addEventListener('keydown', e => { if ([' ', 'Enter'].includes(e.key)) { e.preventDefault(); if (!e.repeat) charge(); } });
  $('gasing-power').addEventListener('keyup', e => { if ([' ', 'Enter'].includes(e.key)) { e.preventDefault(); releasePower(); } });
  // Assistive activation can tap once to charge and once again to lock.
  $('gasing-power').onclick = e => { if (e.detail === 0 && performance.now() >= suppressClick && round().phase === 'power') round().charging ? releasePower() : charge(); };
  // Sample on contact, but keep the button/layout until the click completes.
  // Hiding it on pointerdown can send the phone's subsequent click to Back to town.
  panel.addEventListener('pointerdown', () => { releaseSample = null; }, true);
  $('gasing-release').addEventListener('pointerdown', e => {
    if (e.isPrimary && e.button === 0 && playing && round().phase === 'release' && !isPaused()) releaseSample = round().release;
  });
  $('gasing-release').addEventListener('pointercancel', () => { releaseSample = null; });
  $('gasing-release').onclick = e => {
    const sample = e.detail > 0 && releaseSample !== null ? releaseSample : round().release;
    releaseSample = null;
    if (round().phase === 'release') change(s => releaseTop({ ...s, release: sample }));
  };
  $('gasing-skip').onclick = () => { if (round().phase === 'spin') change(s => advanceGasing(s, roundDuration(s))); };
  $('gasing-again').onclick = lobby;
  $('gasing-close').onclick = close;
  $('gasing-town').onclick = close;
  function confirmEnd() { resetInput(); $('gasing-confirm').hidden = false; $('gasing-lobby').inert = $('gasing-play').inert = true; $('gasing-keep').focus(); }
  $('gasing-keep').onclick = () => { clearConfirm(); if (playing) render(); };
  $('gasing-end').onclick = () => { getEco().gasing.round = null; clearConfirm(); commit(); lobby(); };
  panel.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const scope = $('gasing-confirm').hidden ? panel : $('gasing-confirm');
    const buttons = [...scope.querySelectorAll('button,summary')].filter(b => !b.disabled && b.getClientRects().length);
    if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === buttons.at(-1)) { e.preventDefault(); buttons[0].focus(); }
  });
  window.addEventListener('blur', resetInput);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { resetInput(); if (visible) commit(); } });
  return { open, close };
}

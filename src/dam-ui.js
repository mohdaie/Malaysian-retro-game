import { LEVELS, legalSteps, playStep, chooseTurn, squareName } from './dam-haji.js?v=2.7.0';
import { DAM_QUESTS, startDam, recordDam } from './dam-progress.js?v=2.7.0';

export function createDamUI({ getEco, getName, isPaused, onOpen, onClose, onChange }) {
  const $ = id => document.getElementById(id), panel = $('dam-panel');
  let visible = false, selected = null, busy = false, token = 0, cancelSearch = null, notice = '';
  const match = () => getEco().dam.match;
  const button = (parent, text, action, cls = 'secondary') => {
    const b = document.createElement('button'); b.textContent = text; b.className = cls; b.onclick = action; parent.append(b); return b;
  };
  function commit() {
    const awards = recordDam(getEco());
    if (awards.length) notice = awards.map(q => `${q.title} +RM ${(q.sen / 100).toFixed(2)}`).join(' · ');
    onChange();
  }
  function milestones() {
    const list = $('dam-quests'); list.replaceChildren();
    for (const q of DAM_QUESTS) {
      const li = document.createElement('li'), done = getEco().dam.claimed.includes(q.id);
      li.textContent = `${done ? '✓' : '○'} ${q.title} · ${done ? 'Collected' : `RM ${(q.sen / 100).toFixed(2)}`}`;
      li.title = q.text; list.append(li);
    }
  }
  function lobby() {
    stop(); selected = null; busy = false; notice = '';
    $('dam-lobby').hidden = false; $('dam-play').hidden = true;
    const progress = getEco().dam, options = $('dam-options'); options.replaceChildren();
    $('dam-record').textContent = `${progress.won} wins · ${progress.played} matches · Rewards are collected once per milestone.`;
    if (match() && !match().over) {
      button(options, `Sambung · ${LEVELS[match().level]} · Turn ${match().turns + 1}`, play, 'primary');
      button(options, 'End saved match…', confirmResign);
    } else {
      for (const [level, label] of Object.entries(LEVELS)) button(options,
        `${label} · ${level === 'belajar' ? 'Learn with hints' : level === 'santai' ? 'Friendly match' : 'Challenge Pak Din'}`,
        () => { startDam(getEco(), level); commit(); play(); }, 'primary');
    }
    milestones();
  }
  function play() {
    token++; selected = match().chain; busy = false;
    $('dam-lobby').hidden = true; $('dam-play').hidden = false;
    render(); if (!match().over && match().turn === 1) void opponent();
  }
  function stop() { token++; cancelSearch?.(); cancelSearch = null; }
  function close() {
    stop(); visible = false; busy = false; panel.hidden = true; clearConfirm(); onChange(); onClose();
  }
  function open() {
    visible = true; notice = ''; panel.hidden = false; onOpen(); lobby(); $('dam-close').focus();
  }
  function render(focus = null) {
    const s = match(), target = $('dam-board'); target.replaceChildren();
    const moves = legalSteps(s), own = s.turn === 0 && !s.over && !busy;
    const allowed = moves.filter(m => m.from === selected).map(m => m.to);
    $('dam-level').textContent = `${LEVELS[s.level]} · Turn ${s.turns + (s.over ? 0 : 1)}`;
    $('dam-player').textContent = `${getName()} · Red · ${s.cells.filter(p => p > 0).length}`;
    $('dam-opponent').textContent = `Pak Din · Black · ${s.cells.filter(p => p < 0).length}`;
    $('dam-status').textContent = s.over ? (s.winner === 0 ? 'Menang! Pak Din: “Haa, pandai kamu!”' : s.winner === 1 ? 'Pak Din wins. “Cuba lagi, jangan putus asa.”' : 'Seri. A friendly draw.')
      : busy || s.turn === 1 ? 'Pak Din is thinking…' : s.chain !== null ? 'Makan lagi! Continue jumping with the same piece.' : moves.some(m => m.captured !== null) ? 'Your turn · A capture is compulsory.' : 'Your turn · Tap a red piece, then a highlighted square.';
    $('dam-notice').textContent = notice;
    $('dam-tip').textContent = s.over ? (s.reason === 'no-moves' ? 'The losing side has no legal moves left.' : s.reason === 'resigned' ? 'Match ended. You can start another at the table.' : 'Draw by repetition or 80 quiet Haji moves.')
      : s.level === 'belajar' ? (s.chain !== null ? 'Keep using the selected piece until there are no more jumps.' : moves.some(m => m.captured !== null) ? 'Jump diagonally over a black piece. If you can capture, you must.' : selected !== null && Math.abs(s.cells[selected]) === 2 ? 'Your stacked Haji can travel along an open diagonal in either direction.' : 'Red moves towards Pak Din. Reach the far row to become Haji. Try the Hint button.') : 'Red goes first · Haji terbang · Compulsory captures';
    for (let i = 0; i < 64; i++) {
      const b = document.createElement('button'), p = s.cells[i], dark = (Math.floor(i / 8) + i % 8) % 2;
      b.className = `dam-square ${dark ? 'dark' : 'light'}${selected === i ? ' selected' : ''}${allowed.includes(i) ? ' destination' : ''}${s.last?.to === i ? ' landed' : ''}`;
      b.dataset.square = i; b.type = 'button';
      b.setAttribute('aria-label', `${squareName(i)}, ${p ? `${p > 0 ? 'your red' : 'Pak Din’s black'} ${Math.abs(p) === 2 ? 'Haji' : 'piece'}` : 'empty'}${allowed.includes(i) ? ', legal destination' : ''}`);
      b.setAttribute('aria-pressed', String(selected === i));
      b.disabled = !own || !(allowed.includes(i) || moves.some(m => m.from === i));
      if (p) {
        const disc = document.createElement('span'); disc.className = `dam-piece ${p > 0 ? 'red' : 'black'}${Math.abs(p) === 2 ? ' haji' : ''}`;
        if (Math.abs(p) === 2) { const crown = document.createElement('span'); crown.textContent = 'H'; disc.append(crown); }
        disc.setAttribute('aria-hidden', 'true'); b.append(disc);
      }
      if (allowed.includes(i)) { const dot = document.createElement('span'); dot.className = 'dam-dot'; b.append(dot); }
      if (i % 8 === 0 || i >= 56) { const label = document.createElement('small'); label.textContent = squareName(i); label.setAttribute('aria-hidden', 'true'); b.append(label); }
      b.onclick = () => tap(i); target.append(b);
    }
    $('dam-hint').hidden = s.level !== 'belajar' || s.over; $('dam-hint').disabled = !own;
    $('dam-resign').hidden = s.over;
    $('dam-return').textContent = s.over ? 'Back to the table →' : 'Save & back to town →';
    if (focus !== null) target.querySelector(`[data-square="${focus}"]:not(:disabled)`)?.focus();
  }
  async function wait(ms, t) {
    await new Promise(resolve => setTimeout(resolve, ms));
    while (visible && t === token && isPaused()) await new Promise(resolve => setTimeout(resolve, 150));
    return visible && t === token;
  }
  async function animateStep(from, to, t) {
    const previous = match(), next = playStep(previous, from, to), captured = next.last.captured;
    getEco().dam.match = next; selected = next.chain; commit(); render();
    if (captured !== null && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const ghost = document.createElement('span'); ghost.className = `dam-piece ${previous.cells[captured] > 0 ? 'red' : 'black'} captured`;
      $('dam-board').querySelector(`[data-square="${captured}"]`).append(ghost);
    }
    return wait(matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260, t);
  }
  async function tap(i) {
    if (busy || !visible || isPaused() || match().over || match().turn !== 0) return;
    const moves = legalSteps(match()), move = moves.find(m => m.from === selected && m.to === i);
    if (!move) {
      if (moves.some(m => m.from === i)) { selected = i; render(i); }
      return;
    }
    busy = true; const t = token;
    if (!await animateStep(move.from, move.to, t)) return;
    busy = false; render(match().chain);
    if (!match().over && match().turn === 1) void opponent();
  }
  function think(s) {
    return new Promise(resolve => {
      let worker = null, timer = null, done = false;
      function finish(steps) { if (done) return; done = true; clearTimeout(timer); worker?.terminate(); cancelSearch = null; resolve(steps); }
      const fallback = () => finish(chooseTurn(s, 'belajar'));
      cancelSearch = () => finish(null);
      try {
        worker = new Worker(new URL('./dam-worker.js?v=2.7.0', import.meta.url), { type: 'module' });
        worker.onmessage = ({ data }) => data.error ? fallback() : finish(data.steps);
        worker.onerror = fallback;
        timer = setTimeout(fallback, 5000); worker.postMessage({ match: s });
      } catch { fallback(); }
    });
  }
  async function opponent() {
    busy = true; render(); const t = token;
    const [steps] = await Promise.all([think(match()), wait(450, t)]);
    if (!steps || !await wait(0, t)) return;
    for (const m of steps) if (!await animateStep(m.from, m.to, t)) return;
    busy = false; selected = null; render();
  }
  function confirmResign() {
    stop(); busy = true; $('dam-confirm').hidden = false;
    $('dam-lobby').inert = $('dam-play').inert = true; $('dam-confirm-no').focus();
  }
  function clearConfirm() {
    $('dam-confirm').hidden = true; $('dam-lobby').inert = $('dam-play').inert = false;
  }
  $('dam-confirm-no').onclick = () => {
    clearConfirm(); busy = false;
    if (!$('dam-play').hidden) { render(); if (match().turn === 1 && !match().over) void opponent(); }
  };
  $('dam-confirm-yes').onclick = () => {
    const s = match(); s.over = true; s.winner = 1; s.turn = 0; s.chain = null; s.reason = 'resigned';
    commit(); clearConfirm(); lobby();
  };
  $('dam-close').onclick = close;
  $('dam-return').onclick = () => match().over ? lobby() : close();
  $('dam-resign').onclick = confirmResign;
  $('dam-hint').onclick = () => {
    if (busy || match().turn !== 0 || isPaused()) return;
    const move = chooseTurn(match(), 'belajar')?.[0];
    if (move) { selected = move.from; render(move.from); $('dam-tip').textContent = `Try ${squareName(move.from)} → ${squareName(move.to)}. Tap the glowing destination.`; }
  };
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const scope = !$('dam-confirm').hidden ? $('dam-confirm') : panel;
    const buttons = [...scope.querySelectorAll('button,summary')].filter(b => !b.disabled && b.getClientRects().length);
    const first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  return { open, close: () => { $('dam-confirm').hidden = true; close(); }, isOpen: () => visible };
}

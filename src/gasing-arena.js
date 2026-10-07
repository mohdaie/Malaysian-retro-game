import { spinAt } from './gasing.js?v=1.6.0';
// An illustrated close-up of the padang: original canvas shapes with comic ink.
export function drawGasingArena(canvas, round, name, reduced = false) {
  const c = canvas.getContext('2d'), W = 800, H = 460;
  c.clearRect(0, 0, W, H); c.fillStyle = '#bdd0a1'; c.fillRect(0, 0, W, H);
  const ink = '#292832'; c.lineWidth = 3; c.strokeStyle = ink;
  const ellipse = (x, y, rx, ry, fill, stroke = true) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (stroke) c.stroke(); };
  for (let i = 0; i < 8; i++) {
    const x = i * 115 - 15; c.fillStyle = '#658866'; c.fillRect(x + 22, 42, 12, 66);
    ellipse(x + 28, 34, 56, 46, i % 2 ? '#789b71' : '#527c64', false);
  }
  c.fillStyle = '#879e77'; c.fillRect(0, 96, W, 35);
  c.strokeStyle = '#52634d'; c.lineWidth = 3;
  for (let i = 0; i < 15; i++) { const x = i * 61; c.beginPath(); c.moveTo(x, 102); c.lineTo(x, 141); c.moveTo(x, 109); c.lineTo(x + 50, 109); c.stroke(); }
  c.strokeStyle = ink;
  ellipse(400, 300, 370, 142, '#b89970'); ellipse(400, 285, 365, 143, '#d9bb88');
  c.strokeStyle = '#faf0d1'; c.lineWidth = 5; c.beginPath(); c.ellipse(400, 287, 330, 118, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#ab8b62'; c.lineWidth = 2;
  for (let i = 0; i < 38; i++) { const x = 95 + (i * 83) % 615, y = 220 + (i * 37) % 128; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5, y - 1); c.stroke(); }
  c.fillStyle = '#f8e7bb'; c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.roundRect(259, 62, 282, 43, 7); c.fill(); c.stroke();
  c.textAlign = 'center'; c.fillStyle = ink; c.font = '800 19px system-ui'; c.fillText('GASING · PADANG KENANGAN', 400, 89);
  const active = ['spin', 'result'].includes(round.phase), seconds = active ? round.elapsed : 0;
  function top(x, y, physics, colour, own) {
    const motion = physics && active ? spinAt(physics, seconds) : { angle: 0, wobble: 0, fall: 0, stopped: false };
    const wobble = reduced ? 0 : Math.sin(seconds * 6 + (own ? 0 : 1.1)) * motion.wobble;
    ellipse(x, y + 7, 50 + motion.fall * 20, 13, '#856b4945', false);
    c.save(); c.translate(x, y); c.rotate(wobble + motion.fall * (own ? -1 : 1) * 1.4);
    c.strokeStyle = ink; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-55, -39); c.bezierCurveTo(-48, -11, -18, 0, 0, 11); c.bezierCurveTo(18, 0, 48, -11, 55, -39); c.closePath(); c.fillStyle = '#956444'; c.fill(); c.stroke();
    ellipse(0, -39, 56, 25, colour);
    c.save(); c.beginPath(); c.ellipse(0, -39, 53, 23, 0, 0, Math.PI * 2); c.clip();
    const angle = reduced ? 0 : motion.angle * .12;
    for (let i = 0; i < 6; i++) { const a = angle + i * Math.PI / 3; c.beginPath(); c.moveTo(0, -39); c.lineTo(Math.cos(a) * 60, -39 + Math.sin(a) * 27); c.strokeStyle = '#fff0bf'; c.lineWidth = 6; c.stroke(); }
    c.restore(); c.strokeStyle = ink; c.lineWidth = 3;
    ellipse(0, -39, 18, 8, '#dfb979');
    c.fillStyle = '#a97b4f'; c.beginPath(); c.roundRect(-9, -72, 18, 30, 6); c.fill(); c.stroke(); ellipse(0, -72, 9, 4, '#edd0a0');
    if (own && ['ready', 'winding', 'power', 'release'].includes(round.phase)) {
      const coils = round.phase === 'ready' ? 1 : round.phase === 'winding' ? 1 + Math.floor(round.elapsed * 7) : 9;
      c.strokeStyle = '#f9e9c8'; c.lineWidth = 3;
      for (let n = 0; n < coils; n++) { c.beginPath(); c.ellipse(0, -29 + n * 3, 45 - n * 3.5, 10, 0, 0, Math.PI * 2); c.stroke(); }
      c.beginPath(); c.moveTo(25, -4); c.quadraticCurveTo(78, 0, 82, 35); c.stroke();
    }
    c.restore();
    c.fillStyle = ink; c.font = '800 19px system-ui'; c.fillText(own ? name : round.kind === 'faiz' ? 'Faiz' : 'Atuk', x, y + 63);
    c.font = '700 24px system-ui';
    const text = active && physics ? `${Math.min(seconds, physics.duration).toFixed(2)} s${motion.stopped ? ' · berhenti' : ''}` : own ? (round.equipment === 'owned' ? 'Gasing sendiri' : 'Pinjam Atuk') : round.kind === 'belajar' ? 'Demonstrasi' : 'Sedia';
    c.fillText(text, x, y + 95);
  }
  top(round.opponent ? 244 : 400, 274, round.player, round.equipment === 'owned' ? '#488d85' : '#cb5540', true);
  if (round.opponent) top(558, 274, round.opponent, round.kind === 'faiz' ? '#dc9f39' : '#527bb3', false);
  if (round.phase === 'result') {
    c.font = '800 20px system-ui'; c.fillStyle = ink;
    c.fillText(round.winner === 0 ? 'JAGUH PUSINGAN INI!' : round.winner === 1 ? 'CUBA LAGI, BOLEH MENANG.' : round.kind === 'practice' ? 'LATIHAN SELESAI' : 'SERI · SAMA HEBAT', 400, 427);
  }
}

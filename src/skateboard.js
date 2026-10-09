import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { toon } from './illustration.js?v=2.13.0';
import { SKATE_PARTS } from './skate-parts.js?v=2.13.0';

// A standard skateboard (v2.14): an 80 cm deck, 20 cm wide, kicked up at nose
// and tail, 36 cm between the trucks and 55 mm wheels. One unit is about a metre
// (the bicycle's 27 cm wheel radius), so the 1.5 unit avatars ride it at a
// child's height. `top` is the grip's height above the ground, where the rider's
// feet stand. The origin sits on the ground under the deck's middle.
// Riding is old-school arcade: push and carve on the ground; `pop` and `gravity`
// set the ollie (about 0.35 m high, half a second in the air), and a kickflip
// turns the board once about its length in `flipTime`.
export const SKATE = {
  length: .8, width: .2, wheel: .0275, wheelbase: .36, top: .0905, kick: .045,
  cruise: 5.5, fast: 7.5, push: 2.2, coast: .35, brake: 4, turn: 2.6, lean: .06,
  pop: 3, gravity: 13, flipTime: .38
};

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const smooth = t => t * t * (3 - 2 * t);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

// Riding, one step: push toward the stick direction (world, length 0..1),
// faster with Run; turn gradually, more when rolling than standing, and lean
// into the corner. Pulling back brakes, and a board never rolls backwards.
// Coasting slows down slowly, as a rolling deck does. Pure, so it can be tested;
// returns whether the rider is pushing.
export function stepSkate(board, input, dt) {
  const amount = Math.min(1, Math.hypot(input.dx, input.dz));
  let turned = 0, pushing = false;
  if (amount > .1) {
    const want = Math.atan2(input.dx, input.dz), diff = wrap(want - board.heading);
    if (Math.abs(diff) > 2.2) {
      board.speed = Math.max(0, board.speed - SKATE.brake * dt);
    } else {
      const rate = SKATE.turn * (.3 + .7 * Math.min(1, board.speed / 3));
      turned = clamp(diff, -rate * dt, rate * dt); board.heading += turned;
      const target = amount * (input.fast ? SKATE.fast : SKATE.cruise) * (1 - .4 * Math.min(1, Math.abs(diff) / Math.PI));
      if (board.speed < target) { board.speed = Math.min(target, board.speed + SKATE.push * dt); pushing = true; }
      else board.speed = Math.max(target, board.speed - SKATE.coast * dt);
    }
  } else {
    board.speed = Math.max(0, board.speed - SKATE.coast * dt);
  }
  const yawRate = dt > 0 ? turned / dt : 0;
  board.lean += (clamp(-yawRate * board.speed * SKATE.lean, -.3, .3) - board.lean) * (1 - Math.exp(-dt * 6));
  return pushing;
}

// Ollie: pop off the ground, with `flip` a kickflip from the start. Only from the ground.
export function ollieSkate(board, flip = false) {
  if (board.air) return false;
  Object.assign(board, { air: true, y: 0, vy: SKATE.pop, airTime: 0, pitch: 0, flip: flip ? 0 : null });
  return true;
}
// Seconds until the board touches down again.
export const airTimeLeft = board => board.air ? (board.vy + Math.sqrt(board.vy * board.vy + 2 * SKATE.gravity * Math.max(0, board.y))) / SKATE.gravity : 0;
// Kickflip: on the ground it pops with the flip; in the air it starts one only
// if there is time to finish it before landing, and never twice in one jump.
export function kickflipSkate(board) {
  if (!board.air) return ollieSkate(board, true);
  if (board.flip !== null || airTimeLeft(board) < SKATE.flipTime) return false;
  board.flip = 0; return true;
}
// Air, one step: rise and fall under gravity, nose up at the pop then level,
// and turn the board through its flip. On touchdown returns 'ollie' or
// 'kickflip'; otherwise null. The board keeps its speed and heading in the air.
export function stepSkateAir(board, dt) {
  if (!board.air) return null;
  // The arc comes from the time in the air, so it is the same at any frame rate.
  const t = board.airTime += dt;
  board.vy = SKATE.pop - SKATE.gravity * t; board.y = t * (SKATE.pop - SKATE.gravity * t / 2);
  board.pitch = .42 * Math.sin(Math.PI * Math.min(1, board.airTime / .36));
  if (board.flip !== null) board.flip = Math.min(Math.PI * 2, board.flip + Math.PI * 2 * dt / SKATE.flipTime);
  if (t < 2 * SKATE.pop / SKATE.gravity) return null;
  const trick = board.flip !== null ? 'kickflip' : 'ollie';
  Object.assign(board, { air: false, y: 0, vy: 0, airTime: 0, pitch: 0, flip: null });
  return trick;
}
// The back foot's push stroke by phase 0..1, in the board's frame (+z to the
// nose, -x to the toe edge): step down ahead beside the toe edge, sweep back
// along the ground, then lift and return to the tail. `down` 1 is on the ground.
export function pushFoot(phase) {
  if (phase < .15) { const t = smooth(phase / .15); return { x: -.17 * t, z: -.16 + .26 * t, down: t, arc: 0 }; }
  if (phase < .6) { const t = (phase - .15) / .45; return { x: -.17, z: .1 - .48 * t, down: 1, arc: 0 }; }
  const t = smooth((phase - .6) / .4);
  return { x: -.17 * (1 - t), z: -.38 + .22 * t, down: 1 - t, arc: Math.sin(Math.PI * t) };
}

// How far the deck rises toward the nose and tail: flat between the feet, then a smooth kick.
const KICK_FROM = .2;
const kickLift = z => SKATE.kick * (Math.max(0, Math.abs(z) - KICK_FROM) / (SKATE.length / 2 - KICK_FROM)) ** 2;
// A deck-shaped slab: straight sides and round noses, kicked up at both ends.
// Groups: 0 the underside, 1 the edge (UV runs along the length and up the ply),
// 2 the top. `scale` and `reach` shrink it, for the grip.
function deckSlab({ scale = 1, reach = SKATE.length / 2, top, bottom, rows = 32, cols = 6 }) {
  const { length: L, width: W } = SKATE, R = W / 2, round = L / 2 - R;
  const half = z => scale * (Math.abs(z) <= round ? R : Math.sqrt(Math.max(0, R * R - (Math.abs(z) - round) ** 2)));
  const pos = [], uv = [], faces = [[], [], []], tops = [], bottoms = [], left = [], right = [];
  const vertex = (x, y, z, u, v) => { pos.push(x, y, z); uv.push(u, v); return pos.length / 3 - 1; };
  for (let r = 0; r <= rows; r++) {
    const z = -reach + 2 * reach * r / rows, hw = half(z), dy = kickLift(z), along = z / L + .5, t = [], b = [];
    for (let j = 0; j <= cols; j++) { const x = -hw + 2 * hw * j / cols; t.push(vertex(x, top + dy, z, x / W + .5, along)); b.push(vertex(x, bottom + dy, z, x / W + .5, along)); }
    tops.push(t); bottoms.push(b);
    left.push([vertex(-hw, top + dy, z, along, 1), vertex(-hw, bottom + dy, z, along, 0)]);
    right.push([vertex(hw, top + dy, z, along, 1), vertex(hw, bottom + dy, z, along, 0)]);
  }
  for (let r = 0; r < rows; r++) {
    for (let j = 0; j < cols; j++) {
      faces[2].push(tops[r][j], tops[r + 1][j], tops[r][j + 1], tops[r][j + 1], tops[r + 1][j], tops[r + 1][j + 1]);
      faces[0].push(bottoms[r][j], bottoms[r][j + 1], bottoms[r + 1][j], bottoms[r][j + 1], bottoms[r + 1][j + 1], bottoms[r + 1][j]);
    }
    faces[1].push(right[r][0], right[r + 1][0], right[r][1], right[r][1], right[r + 1][0], right[r + 1][1]);
    faces[1].push(left[r][0], left[r][1], left[r + 1][0], left[r][1], left[r + 1][1], left[r + 1][0]);
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
  geometry.setIndex(faces.flat());
  let start = 0; faces.forEach((list, i) => { geometry.addGroup(start, list.length, i); start += list.length; });
  geometry.computeVertexNormals();
  return geometry;
}

// Printed surfaces, drawn on canvases in the browser (the tests build the board
// without a document). Greys let the chosen colour show through; `redraw`
// repaints a canvas whose colours depend on the chosen parts.
function canvasTexture(w, h, draw) {
  if (typeof document === 'undefined') return { texture: null, redraw() {} };
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  const redraw = (...args) => { draw(canvas.getContext('2d'), w, h, ...args); texture.needsUpdate = true; };
  redraw();
  return { texture, redraw };
}
const css = hex => '#' + hex.toString(16).padStart(6, '0');
// Seven maple plies with dark glue lines; the middle ply is dyed in the board's colour.
function drawPly(ctx, w, h, dye = 0xb8865a) {
  const layers = 7, band = h / layers;
  for (let i = 0; i < layers; i++) { ctx.fillStyle = i === 3 ? css(dye) : i % 2 ? '#d9b680' : '#ecd3a5'; ctx.fillRect(0, i * band, w, band); }
  ctx.fillStyle = '#8f6c42'; for (let i = 1; i < layers; i++) ctx.fillRect(0, i * band - .5, w, 1);
}
// The underside: darker rails and striped noses.
function drawUnderside(ctx, w, h) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#9a9a9a'; ctx.fillRect(0, 0, w * .1, h); ctx.fillRect(w * .9, 0, w * .1, h);
  ctx.fillStyle = '#c8c8c8';
  for (const [y0, y1] of [[0, h * .2], [h * .8, h]]) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, w, y1 - y0); ctx.clip();
    for (let x = -h; x < w + h; x += w * .2) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + w * .08, y0); ctx.lineTo(x + w * .08 + (y1 - y0), y1); ctx.lineTo(x + (y1 - y0), y1); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
}
// Grip tape: fine speckles from a fixed seed, and the eight bolt heads over the trucks.
function drawGrip(ctx, w, h) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  let seed = 7; const rand = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  for (let i = 0; i < 3200; i++) { ctx.fillStyle = rand() < .5 ? '#9a9a9a' : '#e0e0e0'; ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5); }
  for (const v of [.5 - SKATE.wheelbase / 2 / SKATE.length, .5 + SKATE.wheelbase / 2 / SKATE.length]) for (const du of [-.14, .14]) for (const dv of [-.024, .024]) {
    const x = (.5 + du) * w, y = (1 - v - dv) * h;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
  }
}
// The wheel's outer face: a ring of black brush marks around the bearing.
function drawWheelFace(ctx, w, h) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#151515'; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * Math.PI * 2, r0 = w * .24, r1 = w * (.36 + (i % 3) * .03);
    ctx.lineWidth = w * (.05 + (i % 2) * .025); ctx.beginPath();
    ctx.moveTo(w / 2 + Math.cos(a) * r0, h / 2 + Math.sin(a) * r0); ctx.lineTo(w / 2 + Math.cos(a + .25) * r1, h / 2 + Math.sin(a + .25) * r1); ctx.stroke();
  }
}

// The board, built in code like the bicycle: deck, grip, two trucks, four wheels.
// Frames: `group` is placed and headed; `stance` holds the pitch and the carve
// lean, and the rider's feet follow it; `spin` turns the kickflip about the
// board's length. `setLook` paints each surface from the chosen parts.
export function createSkateboard(scene) {
  const { wheel: r, wheelbase } = SKATE, deckBottom = .073, deckTop = .089, pivot = (deckBottom + deckTop) / 2;
  const group = new T.Group(); scene.add(group);
  const stance = new T.Group(); stance.position.y = pivot; group.add(stance);
  const spin = new T.Group(); stance.add(spin);
  const holder = new T.Group(); holder.position.y = -pivot; spin.add(holder);

  const ply = canvasTexture(8, 64, drawPly), under = canvasTexture(64, 256, drawUnderside), gripPrint = canvasTexture(128, 512, drawGrip), face = canvasTexture(128, 128, drawWheelFace);
  const underside = toon(0xd8b283, { map: under.texture }), edge = toon(0xffffff, { map: ply.texture }), maple = toon(0xe6c99a);
  const grip = toon(0x34343c, { map: gripPrint.texture }), hangerPaint = toon(0x6e2430), steel = toon(0xc9ccd1);
  const tyreSide = toon(0xf1ead6), tyreFace = toon(0xf1ead6, { map: face.texture });

  const deck = new T.Mesh(deckSlab({ top: deckTop, bottom: deckBottom }), [underside, edge, maple]);
  deck.castShadow = deck.receiveShadow = true; holder.add(deck);
  // Grip tape over the whole top, following the kicks, a hair inside the edge.
  const tape = new T.Mesh(deckSlab({ scale: .975, reach: SKATE.length / 2 - .004, top: SKATE.top, bottom: deckTop }), grip);
  tape.receiveShadow = true; holder.add(tape);

  // Trucks: steel baseplate, kingpin, axle and nuts; a painted hanger that
  // narrows toward the kingpin. Wheels: tyre, steel bearing.
  const steelParts = [], hangers = [];
  const tyreGeometry = new T.CylinderGeometry(r, r, .034, 24); tyreGeometry.rotateZ(Math.PI / 2);
  const bearingGeometry = new T.CylinderGeometry(r * .36, r * .36, .036, 12); bearingGeometry.rotateZ(Math.PI / 2);
  const wheels = [];
  for (const z of [-wheelbase / 2, wheelbase / 2]) {
    const plate = new T.BoxGeometry(.07, .008, .05); plate.translate(0, deckBottom - .004, z); steelParts.push(plate);
    const kingpin = new T.CylinderGeometry(.011, .013, .016, 10); kingpin.translate(0, deckBottom - .016, z); steelParts.push(kingpin);
    const axle = new T.CylinderGeometry(.004, .004, .16, 8); axle.rotateZ(Math.PI / 2); axle.translate(0, r, z); steelParts.push(axle);
    for (const s of [-1, 1]) { const nut = new T.CylinderGeometry(.0055, .0055, .006, 6); nut.rotateZ(Math.PI / 2); nut.translate(s * .079, r, z); steelParts.push(nut); }
    const low = r - .008, high = deckBottom - .024, hanger = new T.BoxGeometry(.11, high - low, .026, 4, 2, 1);
    const p = hanger.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setX(i, p.getX(i) * .38);
    hanger.computeVertexNormals(); hanger.translate(0, (high + low) / 2, z); hangers.push(hanger);
    for (const x of [-.06, .06]) {
      const wheel = new T.Group(); wheel.position.set(x, r, z);
      const tyre = new T.Mesh(tyreGeometry, [tyreSide, tyreFace, tyreFace]), bearing = new T.Mesh(bearingGeometry, steel);
      tyre.castShadow = bearing.castShadow = true; wheel.add(tyre, bearing); holder.add(wheel); wheels.push(wheel);
    }
  }
  for (const [list, material] of [[steelParts, steel], [hangers, hangerPaint]]) { const m = new T.Mesh(mergeGeo(list), material); m.castShadow = true; holder.add(m); }

  let angle = 0;
  // Roll the wheels by the distance travelled along the board.
  function roll(distance) { angle += distance / r; for (const w of wheels) w.rotation.x = angle; }
  // On the ground with wheels touching, or `y` above it in the air; `pitch`
  // lifts the nose, `lean` carves, `flip` is the kickflip so far.
  function place(state, ground) {
    group.position.set(state.x, ground + (state.y || 0), state.z);
    group.rotation.set(0, state.heading, 0);
    stance.rotation.set(-(state.pitch || 0), 0, state.lean || 0);
    spin.rotation.z = state.flip || 0;
  }
  // World targets for the rider (see `skate` in actor.js): ankles over the
  // bolts across the deck, the back foot following its push stroke when
  // pushing, and lifted off the grip by `lift` during a flip. Directions:
  // `along` to the nose, `up` off the grip, `toes` toward the toe edge.
  const ANKLE = .08;
  function targets({ push = 0, crouch = .1, lift = 0, arms = 0 } = {}) {
    group.updateMatrixWorld(true);
    const onDeck = SKATE.top - pivot + ANKLE + lift, onGround = -pivot + ANKLE;
    const front = new T.Vector3(0, onDeck, .16), back = new T.Vector3(0, onDeck, -.16);
    if (push > 0) { const f = pushFoot(push); back.set(f.x, onDeck + (onGround - onDeck) * f.down + .08 * f.arc, f.z); }
    const q = stance.getWorldQuaternion(new T.Quaternion());
    return {
      feet: [stance.localToWorld(front), stance.localToWorld(back)], crouch, arms,
      along: new T.Vector3(0, 0, 1).applyQuaternion(q), up: new T.Vector3(0, 1, 0).applyQuaternion(q), toes: new T.Vector3(-1, 0, 0).applyQuaternion(q)
    };
  }
  // Each chosen part paints the surfaces it names; the deck colour also dyes the middle ply.
  const paint = { deck: [underside], wheel: [tyreSide, tyreFace], truck: [hangerPaint], grip: [grip] };
  function setLook(parts) {
    for (const id of Object.values(parts)) for (const [surface, hex] of Object.entries(SKATE_PARTS[id].colours)) for (const m of paint[surface]) m.color.setHex(hex);
    ply.redraw(SKATE_PARTS[parts.board].colours.deck);
  }
  return { group, roll, place, targets, setLook };
}

// Merge parts that share one material, as the bicycle does.
const mergeGeo = list => mergeGeometries(list.map(g => g.index ? g.toNonIndexed() : g));

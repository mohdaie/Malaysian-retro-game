import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { toon, outline } from './illustration.js?v=2.13.0';
import { SKATE_PARTS } from './skate-parts.js?v=2.13.0';

// A standard skateboard (v2.14): an 80 cm deck, 20 cm wide, with a slight kick
// at each end, 36 cm between the trucks and 55 mm wheels. One unit is about a
// metre (the bicycle's 27 cm wheel radius), so the 1.5 unit avatars ride it at
// a child's height. `top` is the deck's height above the ground, where the
// rider's feet stand. The origin sits on the ground under the deck's middle.
export const SKATE = {
  length: .8, width: .2, wheel: .0275, wheelbase: .36, top: .0885, kick: .03,
  cruise: 5.5, fast: 7.5, push: 2.2, coast: .35, brake: 4, turn: 2.6, lean: .06
};

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

// Riding, one step: push toward the stick direction (world, length 0..1),
// faster with Run; turn gradually, more when rolling than standing, and lean
// into the corner. Pulling back brakes, and a board never rolls backwards.
// Coasting slows down slowly, as a rolling deck does. Pure, so it can be tested.
export function stepSkate(board, input, dt) {
  const amount = Math.min(1, Math.hypot(input.dx, input.dz));
  let turned = 0;
  if (amount > .1) {
    const want = Math.atan2(input.dx, input.dz), diff = wrap(want - board.heading);
    if (Math.abs(diff) > 2.2) {
      board.speed = Math.max(0, board.speed - SKATE.brake * dt);
    } else {
      const rate = SKATE.turn * (.3 + .7 * Math.min(1, board.speed / 3));
      turned = clamp(diff, -rate * dt, rate * dt); board.heading += turned;
      const target = amount * (input.fast ? SKATE.fast : SKATE.cruise) * (1 - .4 * Math.min(1, Math.abs(diff) / Math.PI));
      if (board.speed < target) board.speed = Math.min(target, board.speed + SKATE.push * dt);
      else board.speed = Math.max(target, board.speed - SKATE.coast * dt);
    }
  } else {
    board.speed = Math.max(0, board.speed - SKATE.coast * dt);
  }
  const yawRate = dt > 0 ? turned / dt : 0;
  board.lean += (clamp(-yawRate * board.speed * SKATE.lean, -.3, .3) - board.lean) * (1 - Math.exp(-dt * 6));
}

// A slab with a popsicle outline: straight sides and round noses, the ends
// kicked up. Each row along the length is a cross-section loop (top, then
// bottom), so the sides, the top and the kick come from one grid. `scale` and
// `reach` shrink it, for the grip tape.
function slab({ scale = 1, reach = SKATE.length / 2, top, bottom, kick = 0, rows = 28, cols = 6 }) {
  const R = SKATE.width / 2, a = SKATE.length / 2 - R;
  const half = z => scale * (Math.abs(z) <= a ? R : Math.sqrt(Math.max(0, R * R - (Math.abs(z) - a) ** 2)));
  const lift = z => kick * (Math.max(0, Math.abs(z) - a) / R) ** 2;
  const loop = (hw, yt, yb) => {
    const pts = [];
    for (let j = 0; j <= cols; j++) pts.push([-hw + 2 * hw * j / cols, yt]);
    for (let j = cols; j >= 0; j--) pts.push([-hw + 2 * hw * j / cols, yb]);
    return pts;
  };
  const M = 2 * (cols + 1), positions = [], uvs = [], index = [];
  for (let r = 0; r <= rows; r++) {
    const z = -reach + 2 * reach * r / rows, hw = half(z), dz = lift(z);
    for (const [x, y] of loop(hw, top + dz, bottom + dz)) { positions.push(x, y, z); uvs.push(x / SKATE.width + .5, z / SKATE.length + .5); }
  }
  for (let r = 0; r < rows; r++) for (let k = 0; k < M; k++) {
    const a0 = r * M + k, a1 = r * M + (k + 1) % M, b0 = (r + 1) * M + k, b1 = (r + 1) * M + (k + 1) % M;
    index.push(a0, b0, a1, a1, b0, b1);
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index); geometry.computeVertexNormals();
  return geometry;
}

// Printed surfaces. Drawn in greys so the chosen colour still shows through them.
// Browser only: the tests build the board without a document.
function canvasTexture(draw, w, h) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
// Deck print: darker rails down both edges and striped noses, so the board reads as a board from any side.
function deckPrint(ctx, w, h) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#8c8c8c'; ctx.fillRect(0, 0, w * .09, h); ctx.fillRect(w * .91, 0, w * .09, h);
  ctx.fillStyle = '#c4c4c4';
  for (const [y0, y1] of [[0, h * .2], [h * .8, h]]) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, w, y1 - y0); ctx.clip();
    for (let x = -h; x < w + h; x += w * .2) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + w * .08, y0); ctx.lineTo(x + w * .08 + (y1 - y0), y1); ctx.lineTo(x + (y1 - y0), y1); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
}
// Grip tape: fine speckles, from a fixed seed so every board looks the same.
function gripSpeckle(ctx, w, h) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  let seed = 7; const rand = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) { ctx.fillStyle = rand() < .5 ? '#8a8a8a' : '#d4d4d4'; ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5); }
}

// The deck, trucks and wheels, built in code like the bicycle. Wheels turn with
// the distance rolled. `setLook` paints each surface from the chosen parts.
export function createSkateboard(scene) {
  const group = new T.Group(); group.rotation.order = 'YXZ'; scene.add(group);
  const deckMaterial = toon(0xd9542b, { map: canvasTexture(deckPrint, 64, 256) });
  const gripMaterial = toon(0x2a2a30, { map: canvasTexture(gripSpeckle, 128, 128) });
  const metal = toon(0xc9ccd1), wheelMaterial = toon(0xf4d03f);
  const { wheel: r, wheelbase, kick } = SKATE;
  const deckBottom = .075, deckTop = .087;
  const deck = new T.Mesh(slab({ top: deckTop, bottom: deckBottom, kick }), deckMaterial);
  deck.castShadow = deck.receiveShadow = true; group.add(deck);
  // Grip tape: a narrower pad on the middle of the deck, stopping short of the noses.
  const grip = new T.Mesh(slab({ scale: .8, reach: .26, top: SKATE.top, bottom: deckTop }), gripMaterial);
  grip.receiveShadow = true; group.add(grip);

  // Each truck: a baseplate under the deck, a hanger down to the axle and the axle itself, with two wheels.
  const tyreGeometry = new T.CylinderGeometry(r, r, .03, 20); tyreGeometry.rotateZ(Math.PI / 2);
  const hubGeometry = new T.CylinderGeometry(r * .42, r * .42, .036, 12); hubGeometry.rotateZ(Math.PI / 2);
  const wheels = [];
  for (const z of [-wheelbase / 2, wheelbase / 2]) {
    const baseplate = new T.BoxGeometry(.09, .006, .034); baseplate.translate(0, deckBottom - .003, z);
    const hanger = new T.BoxGeometry(.13, deckBottom - .006 - r, .02); hanger.translate(0, (deckBottom - .006 + r) / 2, z);
    const axle = new T.CylinderGeometry(.0045, .0045, .14, 8); axle.rotateZ(Math.PI / 2); axle.translate(0, r, z);
    const truck = new T.Mesh(mergeGeo([baseplate, hanger, axle]), metal); truck.castShadow = true; group.add(truck);
    for (const x of [-.06, .06]) {
      const wheel = new T.Group(); wheel.position.set(x, r, z);
      const tyre = new T.Mesh(tyreGeometry, wheelMaterial), hub = new T.Mesh(hubGeometry, metal);
      tyre.castShadow = hub.castShadow = true; wheel.add(tyre, hub); group.add(wheel); wheels.push(wheel);
    }
  }
  const shadow = new T.Mesh(new T.PlaneGeometry(SKATE.width + .06, SKATE.length), new T.MeshBasicMaterial({ color: 0x2d2a38, transparent: true, opacity: .22, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, .012, 0); group.add(shadow);

  let angle = 0;
  // Roll the wheels by the distance travelled along the board.
  function roll(distance) { angle += distance / r; for (const w of wheels) w.rotation.x = angle; }
  // On the ground with wheels touching; `lean` tips it into a corner.
  function place(state, ground) {
    group.position.set(state.x, ground, state.z);
    group.rotation.set(0, state.heading, state.lean);
  }
  // Each chosen part paints the surfaces it names: deck, wheel, truck or grip.
  const paint = { deck: deckMaterial, wheel: wheelMaterial, truck: metal, grip: gripMaterial };
  function setLook(parts) {
    for (const id of Object.values(parts)) for (const [surface, hex] of Object.entries(SKATE_PARTS[id].colours)) paint[surface].color.setHex(hex);
  }
  return { group, roll, place, setLook };
}

// Merge parts that share one material, as the bicycle does.
const mergeGeo = list => mergeGeometries(list.map(g => g.index ? g.toNonIndexed() : g));

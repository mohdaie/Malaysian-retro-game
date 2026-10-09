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
  length: .8, width: .2, wheel: .0275, wheelbase: .36, top: .089, kick: .03,
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

// The deck, trucks and wheels, built from primitives like the bicycle. Wheels
// turn with the distance rolled; the deck is lifted by its kicked ends.
export function createSkateboard(scene) {
  const group = new T.Group(); group.rotation.order = 'YXZ'; scene.add(group);
  const deckMaterial = toon(0xd9542b), grip = toon(0x2a2a30), metal = toon(0xc9ccd1), wheelMaterial = toon(0xf4d03f);
  const { length, width, wheel: r, wheelbase, kick } = SKATE;
  const deckBottom = .075, deckThickness = .012;
  // Two width segments and fourteen length segments let the ends curve up.
  const deckGeometry = new T.BoxGeometry(width, deckThickness, length, 2, 1, 14);
  const position = deckGeometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const z = Math.abs(position.getZ(i));
    if (z > .22) position.setY(i, position.getY(i) + kick * Math.pow((z - .22) / .18, 2));
  }
  deckGeometry.computeVertexNormals();
  const deck = new T.Mesh(deckGeometry, deckMaterial); deck.position.y = deckBottom + deckThickness / 2;
  deck.castShadow = deck.receiveShadow = true; group.add(deck); outline(deck, 1.4);
  const tape = new T.BoxGeometry(width * .96, .002, length * .72); tape.translate(0, deckBottom + deckThickness + .001, 0);
  const gripMesh = new T.Mesh(tape, grip); gripMesh.receiveShadow = true; group.add(gripMesh);

  // Each truck: a hanger under the deck, a kingpin and an axle, with two wheels.
  const wheels = [];
  for (const z of [-wheelbase / 2, wheelbase / 2]) {
    const hanger = new T.BoxGeometry(.13, .012, .03); hanger.translate(0, .07, z);
    const kingpin = new T.CylinderGeometry(.006, .006, .04, 6); kingpin.translate(0, .05, z);
    const axle = new T.CylinderGeometry(.005, .005, .13, 6); axle.rotateZ(Math.PI / 2); axle.translate(0, r, z);
    const truck = new T.Mesh(mergeGeo([hanger, kingpin, axle]), metal); truck.castShadow = true; group.add(truck); outline(truck, 1.2);
    for (const x of [-.06, .06]) {
      const tyre = new T.CylinderGeometry(r, r, .03, 12); tyre.rotateZ(Math.PI / 2);
      const mesh = new T.Mesh(tyre, wheelMaterial); mesh.position.set(x, r, z); mesh.castShadow = true; group.add(mesh); wheels.push(mesh);
    }
  }
  const shadow = new T.Mesh(new T.PlaneGeometry(width + .06, length), new T.MeshBasicMaterial({ color: 0x2d2a38, transparent: true, opacity: .22, depthWrite: false }));
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
  const paint = { deck: deckMaterial, wheel: wheelMaterial, truck: metal, grip };
  function setLook(parts) {
    for (const id of Object.values(parts)) for (const [surface, hex] of Object.entries(SKATE_PARTS[id].colours)) paint[surface].color.setHex(hex);
  }
  return { group, roll, place, setLook };
}

// Merge parts that share one material, as the bicycle does.
const mergeGeo = list => mergeGeometries(list.map(g => g.index ? g.toNonIndexed() : g));

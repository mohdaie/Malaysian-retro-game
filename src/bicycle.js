import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { toon, outline } from './illustration.js?v=2.14.0';

// A kid's bicycle of 2001 (v2.1): steel frame, 20-inch spoked wheels, a
// chrome bar with rubber grips, a sprung saddle and a kickstand. It parks at
// home and stays wherever it is left. +z is forward; the origin sits on the
// ground under the bottom bracket.
export const BIKE = {
  wheel: .27, rear: -.43, front: .53, crank: .15, bracket: .29, gear: 2.4,
  cruise: 6.5, fast: 8.5, back: 1.6, accel: 3, brake: 7, coast: .6, turn: 2.2, seat: [0, .74, -.2], grips: .25
};

// Riding, one step: steer toward the stick direction (world, length 0..1),
// faster when `fast`; turn harder at low speed and lean into the corner.
// Pulling back brakes, and from a stop rolls the bike backwards, the rear
// wheel turning toward the stick, so it can back out of a wall. `speed` is
// negative while rolling back. Pure, so it can be tested; returns whether
// the rider is pedalling.
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
export function stepBike(bike, input, dt) {
  const amount = Math.min(1, Math.hypot(input.dx, input.dz));
  let turned = 0, pedal = false;
  if (amount > .1) {
    const want = Math.atan2(input.dx, input.dz), diff = wrap(want - bike.heading), backward = Math.abs(diff) > 2.2;
    if (backward && bike.speed > .3) {
      // Still rolling forward: brake first.
      bike.speed = Math.max(0, bike.speed - BIKE.brake * dt);
    } else if (backward) {
      // Roll back: the rear swings toward the stick.
      const rate = BIKE.turn * .55, aim = wrap(want + Math.PI - bike.heading);
      turned = T.MathUtils.clamp(aim, -rate * dt, rate * dt); bike.heading += turned;
      const target = -amount * BIKE.back;
      bike.speed = bike.speed > target ? Math.max(target, bike.speed - BIKE.accel * dt) : Math.min(target, bike.speed + BIKE.brake * dt);
      bike.steer = T.MathUtils.lerp(bike.steer, T.MathUtils.clamp(-aim * .5, -.45, .45), 1 - Math.exp(-dt * 8));
    } else {
      const rate = BIKE.turn * (.45 + .55 * Math.min(1, Math.abs(bike.speed) / 2.5));
      turned = T.MathUtils.clamp(diff, -rate * dt, rate * dt); bike.heading += turned;
      const target = amount * (input.fast ? BIKE.fast : BIKE.cruise) * (1 - .45 * Math.min(1, Math.abs(diff) / Math.PI));
      if (bike.speed < 0) bike.speed = Math.min(0, bike.speed + BIKE.brake * dt);
      else if (bike.speed < target) { bike.speed = Math.min(target, bike.speed + BIKE.accel * dt); pedal = true; }
      else bike.speed = Math.max(target, bike.speed - BIKE.coast * 2 * dt);
      pedal ||= target > .5 && bike.speed >= 0;
      bike.steer = T.MathUtils.lerp(bike.steer, T.MathUtils.clamp(diff * .5, -.45, .45), 1 - Math.exp(-dt * 8));
    }
  } else {
    bike.speed = bike.speed > 0 ? Math.max(0, bike.speed - BIKE.coast * dt) : Math.min(0, bike.speed + BIKE.brake * dt);
    bike.steer = T.MathUtils.lerp(bike.steer, 0, 1 - Math.exp(-dt * 4));
  }
  const yawRate = dt > 0 ? turned / dt : 0;
  bike.lean = T.MathUtils.lerp(bike.lean, T.MathUtils.clamp(-yawRate * bike.speed * .09, -.4, .4), 1 - Math.exp(-dt * 6));
  return pedal;
}

export function createBicycle(scene) {
  const frameMaterial = toon(0xc8322c), dark = toon(0x26252b), metal = toon(0xc9ccd1), tyre = toon(0x1f1e22);
  const group = new T.Group(); group.rotation.order = 'YXZ'; scene.add(group);
  const lists = new Map();
  const add = (geometry, material, list = 'frame') => { const key = list + ':' + material.uuid; if (!lists.has(key)) lists.set(key, { material, list, geometries: [] }); lists.get(key).geometries.push(geometry.index ? geometry.toNonIndexed() : geometry); };
  const v = (x, y, z) => new T.Vector3(x, y, z);
  function tube(a, b, r, material, list) {
    const d = b.clone().sub(a), g = new T.CylinderGeometry(r, r, d.length(), 8);
    g.applyQuaternion(new T.Quaternion().setFromUnitVectors(v(0, 1, 0), d.clone().normalize())); g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());
    add(g, material, list);
  }
  const { wheel: r, rear, front, bracket, crank } = BIKE;
  const bb = v(0, bracket, 0), seatTop = v(...BIKE.seat), seatJoint = v(0, .66, -.17), head = [v(0, .78, .42), v(0, .58, .47)], rearAxle = v(0, r, rear), frontAxle = v(0, r, front);
  // Frame: top tube, down tube, seat tube, chain stays, seat stays, head tube.
  tube(seatJoint, head[0], .018, frameMaterial); tube(bb, head[1], .021, frameMaterial); tube(bb, seatJoint, .019, frameMaterial);
  for (const s of [-1, 1]) { tube(bb.clone().add(v(s * .03, 0, 0)), rearAxle.clone().add(v(s * .045, 0, 0)), .011, frameMaterial); tube(seatJoint.clone().add(v(s * .02, 0, 0)), rearAxle.clone().add(v(s * .045, 0, 0)), .01, frameMaterial); }
  tube(head[1], head[0], .024, frameMaterial);
  tube(seatJoint, seatTop.clone().add(v(0, -.02, 0)), .012, metal);
  const saddle = new T.SphereGeometry(1, 10, 6); saddle.scale(.065, .028, .12); saddle.translate(0, seatTop.y, seatTop.z + .02); add(saddle, dark);
  // Chain guard and a rear reflector.
  const guard = new T.BoxGeometry(.006, .07, .34); guard.translate(.05, bracket + .01, -.2); add(guard, frameMaterial);
  const reflector = new T.BoxGeometry(.05, .03, .01); reflector.translate(0, .62, rear - .1); add(reflector, toon(0xd8452f));
  // Kickstand, folded up along the chain stay.
  tube(v(-.05, bracket - .02, -.12), v(-.06, .17, -.38), .007, metal);

  // Wheels: tyre, rim and twelve spokes, merged per wheel.
  function wheelParts(list) {
    const t = new T.TorusGeometry(r - .018, .02, 6, 28); t.rotateY(Math.PI / 2); add(t, tyre, list);
    const rim = new T.TorusGeometry(r - .04, .007, 4, 28); rim.rotateY(Math.PI / 2); add(rim, metal, list);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; tube(v(i % 2 ? .015 : -.015, 0, 0), v(0, Math.sin(a) * (r - .045), Math.cos(a) * (r - .045)), .0025, metal, list); }
    const hub = new T.CylinderGeometry(.018, .018, .07, 8); hub.rotateZ(Math.PI / 2); add(hub, metal, list);
  }
  wheelParts('rear'); wheelParts('front');
  // Steering: fork, handlebar with grips, all turning about the head tube.
  const pivot = head[1];
  for (const s of [-1, 1]) tube(v(s * .03, pivot.y, pivot.z).sub(pivot), frontAxle.clone().add(v(s * .045, 0, 0)).sub(pivot), .012, frameMaterial, 'steer');
  // A swept-back kid's bar: the stem rises and the grips come back to the rider.
  tube(v(0, .78, .42).sub(pivot), v(0, .92, .4).sub(pivot), .013, metal, 'steer');
  const barY = .9, barZ = .3, grips = BIKE.grips;
  tube(v(0, .92, .4).sub(pivot), v(0, barY, barZ).sub(pivot), .012, metal, 'steer');
  tube(v(-grips - .04, barY + .03, barZ - .05).sub(pivot), v(-.06, barY, barZ).sub(pivot), .011, metal, 'steer');
  tube(v(.06, barY, barZ).sub(pivot), v(grips + .04, barY + .03, barZ - .05).sub(pivot), .011, metal, 'steer');
  tube(v(-.06, barY, barZ).sub(pivot), v(.06, barY, barZ).sub(pivot), .011, metal, 'steer');
  for (const s of [-1, 1]) tube(v(s * (grips - .04), barY + .022, barZ - .038).sub(pivot), v(s * (grips + .05), barY + .033, barZ - .055).sub(pivot), .016, dark, 'steer');
  // Cranks: chainring and two arms; the pedals keep level on their own.
  const ring = new T.TorusGeometry(.08, .008, 4, 20); ring.rotateY(Math.PI / 2); ring.translate(.045, 0, 0); add(ring, metal, 'crank');
  for (const s of [-1, 1]) tube(v(s * .055, 0, 0), v(s * .055, -s * crank, 0), .009, metal, 'crank');
  const pedalGeometry = new T.BoxGeometry(.08, .016, .05);

  const build = list => {
    const out = new T.Group();
    for (const entry of lists.values()) if (entry.list === list) {
      const m = new T.Mesh(mergeGeometries(entry.geometries), entry.material); m.castShadow = true; m.receiveShadow = true; out.add(m);
      if (list !== 'rear' && list !== 'front' && entry.material !== metal) outline(m, 1.4);
    }
    return out;
  };
  group.add(build('frame'));
  const rearWheel = build('rear'); rearWheel.position.copy(rearAxle); group.add(rearWheel);
  const steer = new T.Group(); steer.position.copy(pivot); group.add(steer); steer.add(build('steer'));
  const frontWheel = build('front'); frontWheel.position.copy(frontAxle).sub(pivot); steer.add(frontWheel);
  const cranks = build('crank'); cranks.position.copy(bb); group.add(cranks);
  const pedals = [-1, 1].map(s => { const p = new T.Mesh(pedalGeometry, dark); p.castShadow = true; cranks.add(p); p.position.set(s * .1, -s * crank, 0); return p; });
  const shadow = new T.Mesh(new T.PlaneGeometry(.5, 1.4), new T.MeshBasicMaterial({ color: 0x2d2a38, transparent: true, opacity: .22, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, .012, .05); group.add(shadow);

  let wheelAngle = 0, crankAngle = 0, size = 1;
  // Spin the wheels by the distance travelled, the cranks only while pedalling.
  function roll(distance, pedalling) {
    wheelAngle += distance / (r * size); rearWheel.rotation.x = frontWheel.rotation.x = wheelAngle;
    if (pedalling) crankAngle += distance / (r * size * BIKE.gear);
    cranks.rotation.x = crankAngle; for (const p of pedals) p.rotation.x = -crankAngle;
  }
  function place(state, ground, parked = false) {
    group.position.set(state.x, ground, state.z);
    group.rotation.set(0, state.heading, parked ? -.13 : state.lean);
    steer.rotation.y = parked ? .35 : state.steer;
  }
  // World targets for the rider: hips over the saddle, ankles over the
  // pedals, hands on the grips.
  const world = (local, parent = group) => parent.localToWorld(local.clone());
  function targets() {
    group.updateMatrixWorld(true);
    const q = group.getWorldQuaternion(new T.Quaternion());
    return {
      hips: world(v(0, seatTop.y + .075, seatTop.z - .02)),
      pedals: pedals.map(p => p.getWorldPosition(new T.Vector3()).add(v(0, .085, -.03).applyQuaternion(q))).reverse(),
      grips: [-1, 1].map(s => world(v(s * grips, barY + .03, barZ - .045).sub(pivot), steer)).reverse(),
      forward: v(0, 0, 1).applyQuaternion(q), up: v(0, 1, 0).applyQuaternion(q), right: v(-1, 0, 0).applyQuaternion(q)
    };
  }
  function setColour(hex) { frameMaterial.color.setHex(hex); }
  // A smaller frame for a rider with shorter legs.
  function setSize(s) { size = s; group.scale.setScalar(s); }
  return { group, roll, place, targets, setColour, setSize };
}

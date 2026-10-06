import * as T from 'three';
import { toon, outline } from './illustration.js?v=0.10.0';
import { gaitPose, gaitShape, solveLeg } from './locomotion.js?v=0.10.0';

const TAU = Math.PI * 2;
const palette = new Map(), decals = new Map();
// Characters use a lighter cel ramp than the town, so faces and clothes keep
// the sheet's clean, sunlit colour blocks with one soft shadow band.
const ramp = new T.DataTexture(new Uint8Array([150, 150, 150, 255, 212, 212, 212, 255, 255, 255, 255, 255]), 3, 1, T.RGBAFormat);
ramp.minFilter = ramp.magFilter = T.NearestFilter; ramp.generateMipmaps = false; ramp.needsUpdate = true;
function cel(color, options = {}) { return toon(color, { gradientMap: ramp, ...options }); }
function material(color) { if (!palette.has(color)) palette.set(color, cel(color)); return palette.get(color); }
const skinMaterial = cel(0xffffff, { vertexColors: true });
function drawing(key, paint, size = 512) {
  if (!decals.has(key)) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const ctx = c.getContext('2d'); ctx.lineCap = ctx.lineJoin = 'round'; paint(ctx);
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = 4;
    decals.set(key, new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  }
  return decals.get(key);
}

// Body plans in metres, measured from the sole with legs straight. Children
// follow the Jaguh Kampung sheet: the head is roughly a quarter of the height,
// long baggy cargo trousers reach chunky shell-toe sneakers, and arms reach
// mid-thigh. Pak Mat keeps adult proportions so he no longer reads as a child.
const PLANS = {
  amir: { height: 1.50, skin: 0xe2a57b, ankle: .085, lower: .33, upper: .33, hipX: .09, shoulderY: 1.06, shoulderX: .163, upperArm: .21, foreArm: .185, chest: .15, headY: 1.285, head: [.148, .16, .142] },
  nur: { height: 1.48, skin: 0xe8b08a, ankle: .085, lower: .325, upper: .325, hipX: .088, shoulderY: 1.045, shoulderX: .156, upperArm: .205, foreArm: .18, chest: .146, headY: 1.268, head: [.145, .157, .14] },
  pak: { height: 1.75, skin: 0xb77b54, ankle: .07, lower: .42, upper: .43, hipX: .092, shoulderY: 1.39, shoulderX: .182, upperArm: .28, foreArm: .25, chest: .19, headY: 1.59, head: [.118, .134, .12] }
};

// Anime faces drawn to the reference: tall dark-brown irises with two
// highlights, heavy upper lids, bold brows, a small nose tick and a smile.
function face(kind) {
  return drawing('face-' + kind, c => {
    const girl = kind === 'nur', adult = kind === 'pak';
    const eyeY = adult ? 262 : 278, gap = adult ? 84 : 95, w = adult ? 34 : 45, h = adult ? 30 : 58;
    for (const outer of [-1, 1]) {
      const x = 256 + outer * gap;
      c.save(); c.translate(x, eyeY); c.scale(outer, 1);
      const shape = () => { c.beginPath(); c.moveTo(-w * .95, -h * .2); c.bezierCurveTo(-w * .7, -h * 1.05, w * .75, -h * 1.05, w, -h * .3); c.bezierCurveTo(w * 1.02, h * .7, -w * .95, h * .95, -w * .95, -h * .2); c.closePath(); };
      shape(); c.fillStyle = '#fffaf2'; c.fill();
      c.save(); shape(); c.clip();
      const iris = c.createLinearGradient(0, -h, 0, h);
      iris.addColorStop(0, '#24140f'); iris.addColorStop(.5, '#4f2c1c'); iris.addColorStop(1, adult ? '#6b4430' : '#a5683c');
      c.fillStyle = iris; c.beginPath(); c.ellipse(-3, h * .08, w * .74, h * .95, 0, 0, TAU); c.fill();
      c.fillStyle = '#150c0b'; c.beginPath(); c.ellipse(-3, -h * .05, w * .36, h * .5, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(25,12,12,.38)'; c.fillRect(-w * 1.1, -h * 1.1, w * 2.2, h * .42);
      c.restore();
      c.strokeStyle = '#1b1315'; c.lineWidth = adult ? 9 : 12;
      c.beginPath(); c.moveTo(-w * 1.02, -h * .12); c.bezierCurveTo(-w * .72, -h * 1.12, w * .78, -h * 1.12, w * 1.12, -h * .32); c.stroke();
      if (girl) { c.lineWidth = 7; c.beginPath(); c.moveTo(w * .9, -h * .55); c.lineTo(w * 1.32, -h * .86); c.moveTo(w * 1.08, -h * .3); c.lineTo(w * 1.42, -h * .45); c.stroke(); }
      else { c.lineWidth = 8; c.beginPath(); c.moveTo(w * 1.0, -h * .35); c.lineTo(w * 1.24, -h * .52); c.stroke(); }
      c.strokeStyle = 'rgba(70,40,40,.75)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-w * .45, h * .93); c.quadraticCurveTo(w * .1, h * 1.08, w * .62, h * .82); c.stroke();
      // Brows: bold for Amir, soft for Nur, heavier and lower for Pak Mat.
      c.strokeStyle = adult ? '#2c2522' : '#1d1719'; c.lineWidth = girl ? 8 : adult ? 13 : 14;
      const by = adult ? -h - 20 : -h - 24;
      c.beginPath(); c.moveTo(-w * 1.05, by + 8); c.quadraticCurveTo(w * .1, by - (girl ? 12 : 8), w * 1.15, by + (girl ? 4 : 2)); c.stroke();
      c.restore();
      c.save(); c.translate(x - 3, eyeY); c.fillStyle = '#fffdf8';
      c.beginPath(); c.ellipse(-outer * 2 - 11, -h * .32, w * .24, h * .26, -.4, 0, TAU); c.fill();
      c.beginPath(); c.arc(11, h * .42, w * .12, 0, TAU); c.fill(); c.restore();
    }
    c.fillStyle = 'rgba(233,128,112,.26)';
    for (const x of [256 - 122, 256 + 122]) { c.beginPath(); c.ellipse(x, adult ? 318 : 338, 30, 15, 0, 0, TAU); c.fill(); }
    c.strokeStyle = '#a96648'; c.lineWidth = 6; c.beginPath(); c.moveTo(254, 318); c.quadraticCurveTo(268, 334, 250, 338); c.stroke();
    if (adult) {
      c.fillStyle = '#2a2220'; c.beginPath(); c.moveTo(200, 368); c.quadraticCurveTo(256, 336, 312, 368); c.quadraticCurveTo(286, 362, 256, 366); c.quadraticCurveTo(226, 362, 200, 368); c.fill();
      c.strokeStyle = '#5b2a2c'; c.lineWidth = 6; c.beginPath(); c.moveTo(232, 388); c.quadraticCurveTo(256, 400, 280, 388); c.stroke();
    } else {
      c.strokeStyle = '#5b2629'; c.lineWidth = 7;
      c.beginPath(); c.moveTo(girl ? 234 : 226, 370); c.quadraticCurveTo(256, girl ? 388 : 394, girl ? 280 : 290, 368); c.stroke();
      c.lineWidth = 5; c.beginPath(); c.moveTo(girl ? 228 : 219, 365); c.lineTo(girl ? 236 : 228, 372); c.stroke();
    }
  });
}
function motif(kind) {
  return drawing('motif-' + kind, c => {
    if (kind === 'alien') {
      c.fillStyle = '#26365a'; const rows = ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'];
      rows.forEach((row, y) => [...row].forEach((v, x) => { if (v === '1') c.fillRect(14 + x * 44, 80 + y * 44, 44, 44); }));
    } else if (kind === 'checks') {
      // Kain pelikat: deep green ground with blue and cream checks.
      c.fillStyle = '#2f5a4f'; c.fillRect(0, 0, 512, 512);
      for (const [colour, width, offset] of [['rgba(38,62,104,.85)', 70, 0], ['rgba(230,220,190,.55)', 12, 96], ['rgba(20,40,36,.6)', 24, 150]]) {
        c.fillStyle = colour;
        for (let p = offset; p < 512; p += 256) { c.fillRect(p, 0, width, 512); c.fillRect(0, p, 512, width); }
      }
    } else {
      // Bunga raya (hibiscus): five petals, a long stamen and a warm centre.
      const petal = kind === 'flower' ? '#f08fa6' : '#fff4ec', vein = kind === 'flower' ? '#d4637f' : '#f2c9cf';
      for (let i = 0; i < 5; i++) {
        c.save(); c.translate(256, 256); c.rotate(i * TAU / 5);
        c.fillStyle = petal; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-120, -60, -95, -225, 0, -205); c.bezierCurveTo(95, -225, 120, -60, 0, 0); c.fill();
        c.strokeStyle = vein; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -20); c.lineTo(0, -150); c.stroke(); c.restore();
      }
      c.fillStyle = kind === 'flower' ? '#c24467' : '#eeb2bd'; c.beginPath(); c.arc(256, 256, 34, 0, TAU); c.fill();
      c.strokeStyle = '#f4d27c'; c.lineWidth = 10; c.beginPath(); c.moveTo(256, 256); c.quadraticCurveTo(330, 210, 360, 140); c.stroke();
      c.fillStyle = '#f4d27c'; c.beginPath(); c.arc(360, 140, 16, 0, TAU); c.fill();
    }
  });
}

export function createCharacter(scene, x, z, kind = 'amir') {
  const plan = PLANS[kind] || PLANS.amir, adult = kind === 'pak', girl = kind === 'nur';
  const leg = plan.upper + plan.lower, hipY = plan.ankle + leg, waistY = hipY + .06;
  const root = new T.Group(); root.position.set(x, 0, z); scene.add(root);
  const body = new T.Bone(); body.userData.origin = new T.Vector3(); root.add(body);
  const skin = material(plan.skin), ink = material(0x24222b), cream = material(0xf6eee2), white = material(0xfbf7ef);

  // Parts are authored at their standing positions in metres; each group
  // records its own origin so joints can rotate about real pivots.
  function group(parent, px, py, pz) {
    const g = new T.Bone(), o = parent.userData.origin;
    g.position.set(px - o.x, py - o.y, pz - o.z); g.userData.origin = new T.Vector3(px, py, pz); parent.add(g); return g;
  }
  function part(geometry, mat, px, py, pz, parent) {
    const m = new T.Mesh(geometry, mat), o = parent.userData.origin;
    m.position.set(px - o.x, py - o.y, pz - o.z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function ball(rx, ry, rz, mat, px, py, pz, parent, w = 12, h = 8) { const m = part(new T.SphereGeometry(1, w, h), mat, px, py, pz, parent); m.scale.set(rx, ry, rz); return m; }
  function block(w, h, d, mat, px, py, pz, parent) {
    // Bevel a small 2-segment box, retaining a low-poly silhouette.
    const g = new T.BoxGeometry(w, h, d, 2, 2, 2), p = g.attributes.position, r = Math.min(w, h, d) * .22, v = new T.Vector3(), core = new T.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); core.set(T.MathUtils.clamp(v.x, -w / 2 + r, w / 2 - r), T.MathUtils.clamp(v.y, -h / 2 + r, h / 2 - r), T.MathUtils.clamp(v.z, -d / 2 + r, d / 2 - r)); v.sub(core).normalize().multiplyScalar(r).add(core); p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return part(g, mat, px, py, pz, parent);
  }
  function lathe(points, depth, mat, px, py, pz, parent, segments = 16) {
    const m = part(new T.LatheGeometry(points.map(([r, y]) => new T.Vector2(r, y)), segments), mat, px, py, pz, parent); m.scale.z = depth; return m;
  }
  // Tubes take standing-pose points; the mesh offset cancels the joint origin.
  function line(points, mat, r, parent) {
    return part(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(([a, b, c]) => new T.Vector3(a, b, c))), Math.max(3, points.length * 2), r, r < .006 ? 3 : 5, false), mat, 0, 0, 0, parent);
  }
  function decal(w, h, mat, px, py, pz, parent) { return part(new T.PlaneGeometry(w, h), mat, px, py, pz, parent); }
  // A sphere with triangles removed (face openings, ear gaps, hood mouth).
  function shell(rx, ry, rz, keep, mat, px, py, pz, parent, warp = null, w = 36, h = 26) {
    const g = new T.SphereGeometry(1, w, h).toNonIndexed(), pos = g.attributes.position, kept = [], normals = [], n = new T.Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      if (keep(cx, cy, cz)) for (let j = 0; j < 3; j++) {
        const v = [pos.getX(i + j), pos.getY(i + j), pos.getZ(i + j)], [ux, uy, uz] = warp ? warp(...v) : v;
        kept.push(ux * rx, uy * ry, uz * rz);
        n.set(v[0] / rx, v[1] / ry, v[2] / rz).normalize(); normals.push(n.x, n.y, n.z);
      }
    }
    // Analytic ellipsoid normals keep cut shells smoothly shaded.
    g.dispose(); const out = new T.BufferGeometry(); out.setAttribute('position', new T.Float32BufferAttribute(kept, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
    return part(out, mat, px, py, pz, parent);
  }
  // Blade-like locks: a flattened cone rooted on an ellipsoid surface.
  function lock(parent, center, radii, theta, phi, length, width, up, back, mat, flat = .5, twist = 0) {
    const d = new T.Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(phi), Math.cos(theta) * Math.cos(phi));
    const base = new T.Vector3(d.x * radii[0], d.y * radii[1], d.z * radii[2]).multiplyScalar(.9).add(center);
    const normal = new T.Vector3(d.x / radii[0], d.y / radii[1], d.z / radii[2]).normalize();
    const axis = normal.add(new T.Vector3(0, up, -back)).normalize();
    const g = new T.ConeGeometry(width, length, 5, 1); g.translate(0, length / 2, 0); g.scale(1, 1, flat);
    const m = part(g, mat, base.x, base.y, base.z, parent);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), axis).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), theta + twist));
    return m;
  }

  // Legs: baggy cargo trousers with side pockets, a flared hem, and shoes.
  const pants = material(girl ? 0x8db3cf : adult ? 0x3b3a3c : 0x2d4f86), seam = material(girl ? 0x6b92b3 : 0x22396a);
  const legs = [], knees = [], feet = [], arms = [], elbows = [];
  for (const side of [-1, 1]) {
    const lx = side * plan.hipX;
    const hip = group(body, lx, hipY, 0); legs.push(hip);
    const knee = group(hip, lx, hipY - plan.upper, 0); knees.push(knee);
    const ankle = group(knee, lx, plan.ankle, 0); feet.push(ankle);
    if (adult) {
      lathe([[.04, .02], [.045, .1], [.05, .16]], 1, pants, lx, 0, 0, ankle);
      // Selipar: flat rubber sandal with a cross strap over the bare foot.
      block(.1, .022, .26, material(0x4b3a2e), lx, .011, .05, ankle);
      ball(.042, .035, .1, skin, lx, .045, .06, ankle);
      block(.092, .02, .05, material(0x22396a), lx, .07, .1, ankle);
    } else {
      lathe([[.073, -plan.upper], [.075, -plan.upper * .55], [.078, -.05], [.07, .01], [0, .02]], .96, pants, lx, hipY, 0, hip);
      // Side cargo pocket with a buttoned flap, as on the sheet's detail view.
      block(.032, .13, .1, pants, lx + side * .072, hipY - .2, .005, hip);
      block(.038, .035, .106, seam, lx + side * .075, hipY - .135, .005, hip);
      ball(.008, .008, .006, cream, lx + side * .095, hipY - .14, .04, hip);
      line([[lx + side * .076, hipY + .02, 0], [lx + side * .077, hipY - plan.upper, 0]], seam, .004, hip);
      const ky = hipY - plan.upper;
      ball(.074, .062, .076, pants, lx, ky, 0, knee);
      lathe([[.084, -plan.lower + .03], [.08, -plan.lower + .06], [.076, -plan.lower * .45], [.074, -.02], [.074, .04]], .96, pants, lx, ky, 0, knee);
      // Bunched hem: two soft folds where the denim stacks on the shoe.
      for (const [y, r] of [[.122, .082], [.158, .078]]) { const fold = part(new T.TorusGeometry(r, .011, 5, 16), pants, lx, y, 0, knee); fold.rotation.x = Math.PI / 2; fold.scale.y = .96; }
      line([[lx - side * .02, ky - .04, .073], [lx - side * .025, ky - .18, .074]], seam, .004, knee);
      // Shell-toe sneaker: thick sole, ribbed toe cap, three stripes, heel tab.
      const stripe = girl ? material(0xe48ea3) : ink;
      block(.13, .04, .29, material(0xf2e9da), lx, .02, .05, ankle);
      line([[lx - .065, .022, -.088], [lx - .065, .022, .19]], material(0xc9bba6), .0035, ankle);
      line([[lx + .065, .022, -.088], [lx + .065, .022, .19]], material(0xc9bba6), .0035, ankle);
      block(.12, .068, .2, white, lx, .07, .012, ankle);
      ball(.06, .042, .08, white, lx, .058, .118, ankle);
      ball(.062, .038, .058, cream, lx, .055, .155, ankle);
      for (let i = 0; i < 4; i++) line([[lx - .054, .05 + i * .007, .136 + i * .013], [lx, .07 + i * .007, .145 + i * .013], [lx + .054, .05 + i * .007, .136 + i * .013]], material(0xd9cdb9), .003, ankle);
      ball(.056, .036, .068, white, lx, .104, -.022, ankle);
      block(.048, .056, .018, stripe, lx, .09, -.09, ankle);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const bar = block(.009, .068, .016, stripe, lx + s * .061, .068, -.018 + i * .03, ankle); bar.rotation.x = .62; }
      for (let i = 0; i < 3; i++) block(.066, .008, .013, white, lx, .106 - i * .005, .044 + i * .026, ankle);
      block(.056, .024, .075, white, lx, .1, .038, ankle);
    }
  }
  // Pelvis bridges the hip joints so no gap opens when the legs swing.
  lathe(adult ? [[0, -.05], [.11, -.03], [.15, .05], [.15, .12]] : [[0, -.075], [.1, -.06], [.142, -.01], [.14, .04], [.125, .1]], .64, pants, 0, hipY, 0, body);

  // Torso pivot: the chest counter-rotates against the pelvis.
  const torso = group(body, 0, waistY, 0);
  const shoulder = plan.shoulderY, chestZ = .66, hem = girl ? hipY - .045 : adult ? hipY - .14 : hipY + .035;
  const top = material(girl ? 0xf0b5c0 : adult ? 0xebe1c8 : 0xf8f4ec), trim = material(girl ? 0xd98a9d : adult ? 0xcbbd9b : 0x223a63);
  const torsoShape = adult
    ? [[.19, hem], [.192, hem + .2], [.198, hipY + .14], [.185, shoulder - .2], [.18, shoulder - .07], [.13, shoulder - .005], [.07, shoulder + .025], [0, shoulder + .03]]
    : girl
      ? [[.163, hem], [.166, hem + .04], [.152, hipY + .12], [.15, shoulder - .12], [.146, shoulder - .05], [.12, shoulder - .005], [.075, shoulder + .02], [0, shoulder + .025]]
      : [[.156, hem], [.157, hem + .03], [.148, hipY + .13], [.149, shoulder - .1], [.15, shoulder - .05], [.122, shoulder - .005], [.07, shoulder + .025], [0, shoulder + .03]];
  lathe(torsoShape.map(([r, y]) => [r, y - waistY]), chestZ, top, 0, waistY, 0, torso, 18);
  if (adult) lathe([[0, hem - .045], [.186, hem - .04], [.19, hem]].map(([r, y]) => [r, y - waistY]), chestZ, top, 0, waistY, 0, torso);
  const frontZ = (r) => r * chestZ + .003;
  // Neck and collar.
  lathe([[.038, -.05], [.04, .06], [.037, .1]], 1, skin, 0, shoulder, 0, torso, 10);
  const collar = part(new T.TorusGeometry(girl ? .07 : .058, girl ? .022 : .012, 6, 18), girl ? material(0xf2c4c4) : trim, 0, shoulder + .02, .006, torso);
  collar.rotation.x = Math.PI / 2 - .25;
  if (girl) {
    // Hoodie: ribbed hem, kangaroo pocket, drawstrings and the bunga raya.
    const hemBand = part(new T.TorusGeometry(.162, .013, 5, 20), trim, 0, hem + .008, 0, torso); hemBand.rotation.x = Math.PI / 2; hemBand.scale.y = chestZ;
    block(.2, .095, .026, material(0xe7a7b4), 0, hipY + .035, frontZ(.157), torso);
    for (const s of [-1, 1]) line([[s * .1, hipY + .08, frontZ(.157) + .01], [s * .09, hipY - .005, frontZ(.157) + .01]], trim, .004, torso);
    for (const s of [-1, 1]) { line([[s * .035, shoulder, .1], [s * .038, shoulder - .07, .105], [s * .042, shoulder - .13, frontZ(.15)]], cream, .004, torso); block(.009, .022, .009, material(0xa9a6a3), s * .042, shoulder - .14, frontZ(.15), torso); }
    decal(.075, .075, motif('hibiscus'), .058, shoulder - .1, frontZ(.15) + .002, torso);
  } else if (adult) {
    // Baju Melayu: buttoned placket and standing collar; kain pelikat below.
    block(.03, .16, .012, top, 0, shoulder - .1, frontZ(.2), torso);
    for (let i = 0; i < 3; i++) ball(.008, .008, .005, material(0xc9a24b), 0, shoulder - .05 - i * .05, frontZ(.2) + .007, torso);
    const checks = motif('checks').map.clone(); checks.wrapS = checks.wrapT = T.RepeatWrapping; checks.repeat.set(5, 4); checks.needsUpdate = true;
    const sarong = cel(0xffffff, { map: checks });
    lathe([[.178, .09 - hipY], [.17, .3 - hipY], [.168, .7 - hipY], [.17, hipY + .02 - hipY], [.16, hipY + .1 - hipY], [0, hipY + .11 - hipY]], .72, sarong, 0, hipY, 0, body, 18);
  } else {
    // Ringer T-shirt with navy trim and the pixel alien from the sheet.
    const hemBand = part(new T.TorusGeometry(.156, .006, 4, 20), material(0xe9e3d8), 0, hem + .004, 0, torso); hemBand.rotation.x = Math.PI / 2; hemBand.scale.y = chestZ;
    decal(.105, .085, motif('alien'), 0, shoulder - .12, frontZ(.149) + .002, torso);
  }

  // Head: shaped jaw, ears, a face drawing that follows the curved surface.
  const neckTop = shoulder + .08, [rx, ry, rz] = plan.head, headY = plan.headY;
  const head = group(torso, 0, neckTop, 0);
  const headGeometry = new T.SphereGeometry(1, 28, 20), hp = headGeometry.attributes.position;
  const jaw = y => y < 0 ? 1 - .30 * Math.pow(-y, 1.6) : 1, chin = y => y < 0 ? 1 - .08 * Math.pow(-y, 2) : 1;
  for (let i = 0; i < hp.count; i++) { const y = hp.getY(i); hp.setX(i, hp.getX(i) * jaw(y)); hp.setZ(i, hp.getZ(i) * chin(y)); }
  headGeometry.computeVertexNormals();
  const headMesh = part(headGeometry, skin, 0, headY, .005, head); headMesh.scale.set(rx, ry, rz);
  for (const s of [-1, 1]) { ball(.022, .036, .024, skin, s * rx * .97, headY - .012, -.004, head, 8, 6); ball(.011, .02, .006, material(0xc98463), s * rx * 1.01, headY - .012, .008, head, 8, 6); }
  {
    const verts = [], uv = [], idx = [], nx = 24, ny = 24, fw = rx * 1.08, fh = ry;
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx, v = j / ny, px = (u * 2 - 1) * fw, py = (v * 2 - 1) * fh, yy = py / ry, xx = px / (rx * jaw(yy));
      const pz = rz * chin(yy) * Math.sqrt(Math.max(.02, 1 - xx * xx - yy * yy)) + .0035;
      verts.push(px, py + headY, pz + .005); uv.push(u, v);
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const n = j * (nx + 1) + i; idx.push(n, n + 1, n + nx + 1, n + 1, n + nx + 2, n + nx + 1); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(verts, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    part(g, face(kind), 0, 0, 0, head);
  }
  const center = new T.Vector3(0, headY + .012, -.006);
  if (girl) {
    // Hijab framing the face, with the hoodie's hood worn up around it.
    const hijab = material(0xf3c7c3), hood = cel(0xeeb0bc, { side: T.DoubleSide }), rim = material(0xd98a9d);
    const hx = rx * 1.07, hy = ry * 1.06, hz = rz * 1.08, inside = (x, y) => (x / .72) ** 2 + ((y + .1) / .8) ** 2 < 1;
    shell(hx, hy, hz, (x, y, z) => !(z > .05 && inside(x, y)) && !(y < -.72 && z > -.4), hijab, 0, headY + .006, -.003, head);
    const edge = [];
    for (let a = 0; a <= TAU + .01; a += TAU / 36) { const ux = .72 * Math.sin(a), uy = -.1 + .8 * Math.cos(a), uz = Math.sqrt(Math.max(.02, 1 - ux * ux - uy * uy)); edge.push([ux * hx, headY + .006 + uy * hy, -.003 + uz * hz]); }
    line(edge, hijab, .012, head);
    // Scarf drape over the neck and a soft fold on the chest.
    lathe([[.132, -.118], [.128, -.09], [.114, -.05], [.1, 0], [.095, .05]], .8, hijab, 0, neckTop, .006, head, 20);
    // The hood sits close over the hijab and ends in a soft point at the back.
    const ox = rx * 1.11, oy = ry * 1.09, oz = rz * 1.13, oc = new T.Vector3(0, headY + .01, -.02);
    const point = (x, y, z) => { const t = Math.max(0, -z) ** 2 * Math.max(0, .5 - y); return [x * (1 - .25 * t), y - .12 * t, z * (1 + .3 * t)]; };
    shell(ox, oy, oz, (x, y, z) => !(z > -.1 && (x / .8) ** 2 + ((y + .08) / .88) ** 2 < 1) && y > -.62, hood, oc.x, oc.y, oc.z, head, point);
    const ring = [];
    for (let a = -2.3; a <= 2.3; a += .12) {
      const ux = .8 * Math.sin(a), uy = -.08 + .88 * Math.cos(a), uz = Math.sqrt(Math.max(.02, 1 - ux * ux - uy * uy));
      ring.push([ux * ox, oc.y + uy * oy, oc.z + uz * oz]);
    }
    line(ring, rim, .012, head);
  } else if (adult) {
    // Kopiah over short greying hair.
    shell(rx * 1.04, ry * 1.04, rz * 1.04, (x, y, z) => y > .15 && !(z > .35 && y < .5), material(0x4a4643), 0, headY, -.004, head);
    lathe([[.118, -.012], [.121, 0], [.118, .045], [.104, .058], [0, .06]], 1, material(0xf4f0e6), 0, headY + ry * .74, -.01, head, 20);
    const band = part(new T.TorusGeometry(.12, .006, 4, 20), material(0xd8d0bf), 0, headY + ry * .74, -.01, head); band.rotation.x = Math.PI / 2;
  } else {
    // Messy spiked hair: a cap with the face and ears cut away, crown spikes,
    // swept back locks and fringe clumps falling over the forehead.
    const hair = material(0x202129), sheen = material(0x343846), radii = [rx * 1.06, ry * 1.07, rz * 1.08];
    shell(...radii, (x, y, z) => {
      const faceCut = z > .1 && y < .36 && Math.abs(x) < .8, earCut = Math.abs(x) > .7 && y < .05 && z > -.35 && y > -.6;
      return !faceCut && !earCut && y > -.5;
    }, hair, center.x, center.y, center.z, head);
    const deg = Math.PI / 180;
    const spikes = [
      [0, 78, .085, .058, .45, .45], [50, 66, .095, .06, .4, .4], [-50, 66, .095, .06, .4, .4], [120, 60, .09, .058, .3, .55], [-120, 60, .09, .058, .3, .55],
      [180, 62, .09, .058, .2, .65], [18, 56, .085, .054, .8, .05], [-24, 58, .08, .054, .7, .1], [85, 50, .08, .056, .45, .3], [-85, 50, .08, .056, .45, .3],
      [70, 30, .08, .056, .1, .45], [-70, 30, .08, .056, .1, .45], [108, 28, .08, .056, 0, .55], [-108, 28, .08, .056, 0, .55], [145, 26, .08, .056, -.05, .6], [-145, 26, .08, .056, -.05, .6], [180, 28, .08, .056, -.05, .6],
      [140, 0, .07, .05, -.55, .45], [-140, 0, .07, .05, -.55, .45], [165, -6, .07, .05, -.6, .45], [-165, -6, .07, .05, -.6, .45],
      [92, 10, .06, .045, -.45, .2], [-92, 10, .06, .045, -.45, .2]
    ];
    spikes.forEach(([t, p, l, w, u, b], i) => lock(head, center, radii, t * deg, p * deg, l, w, u, b, i % 4 === 1 ? sheen : hair, .5, (i % 3 - 1) * .3));
    // Fringe clumps curve down over the forehead to just above the brows.
    // Each blade lies on the skull's tangent and bends with its curvature, in
    // two layers so the hair reads thick and tousled rather than a helmet.
    const fringe = [[-56, 44, .07, .036, .35], [-41, 46, .084, .04, .2], [-26, 47, .094, .042, .1], [-10, 48, .1, .044, -.1], [6, 48, .1, .044, .12], [22, 47, .094, .042, -.15], [38, 46, .086, .04, -.25], [54, 44, .072, .036, -.35], [-18, 58, .085, .04, .25], [14, 58, .085, .04, -.2]];
    const basis = new T.Matrix4(), tangent = new T.Vector3(), normal = new T.Vector3(), across = new T.Vector3();
    fringe.forEach(([t, ph, l, w, sway], i) => {
      const theta = t * deg, phi = ph * deg, sc = 1.015;
      const base = new T.Vector3(Math.sin(theta) * Math.cos(phi) * radii[0] * sc, Math.sin(phi) * radii[1] * sc, Math.cos(theta) * Math.cos(phi) * radii[2] * sc).add(center);
      normal.set(Math.sin(theta) * Math.cos(phi) / radii[0], Math.sin(phi) / radii[1], Math.cos(theta) * Math.cos(phi) / radii[2]).normalize();
      tangent.set(Math.sin(theta) * Math.sin(phi) * radii[0], -Math.cos(phi) * radii[1], Math.cos(theta) * Math.sin(phi) * radii[2]).normalize().applyAxisAngle(normal, sway);
      tangent.sub(normal.clone().multiplyScalar(tangent.dot(normal))).normalize(); across.crossVectors(tangent, normal);
      const g = new T.ConeGeometry(w, l, 6, 4), gp = g.attributes.position; g.translate(0, l / 2, 0); g.scale(1, 1, .42);
      for (let k = 0; k < gp.count; k++) { const y = gp.getY(k); gp.setZ(k, gp.getZ(k) - y * y / (2 * radii[1]) + .004); }
      g.computeVertexNormals();
      const m = part(g, i > 7 ? sheen : hair, base.x, base.y, base.z, head);
      m.quaternion.setFromRotationMatrix(basis.makeBasis(across, tangent, normal));
    });
  }

  // Arms: loose sleeves, bare or covered forearms, mitten hands with thumbs.
  for (const side of [-1, 1]) {
    const sx = side * plan.shoulderX, ey = shoulder - plan.upperArm, wrist = ey - plan.foreArm;
    const arm = group(torso, sx, shoulder - .02, 0); arms.push(arm);
    const elbow = group(arm, sx, ey, 0); elbows.push(elbow);
    if (girl || adult) {
      const sr = adult ? .046 : .05;
      lathe([[sr, ey - shoulder + .02], [sr + .003, -.08], [sr + .006, -.01], [sr * .75, .02], [0, .03]], .95, top, sx, shoulder - .02, 0, arm);
      ball(sr - .004, sr, sr - .004, top, sx, ey, 0, elbow);
      lathe([[sr - .006, wrist - ey + .03], [sr - .003, -.06], [sr - .002, .02]], .95, top, sx, ey, 0, elbow);
      const cuff = part(new T.TorusGeometry(sr - .01, .011, 5, 14), trim, sx, wrist + .032, 0, elbow); cuff.rotation.x = Math.PI / 2;
    } else {
      lathe([[.062, -.1], [.06, -.06], [.06, .0], [.05, .035], [0, .045]], .95, top, sx, shoulder - .02, 0, arm);
      const band = part(new T.TorusGeometry(.059, .008, 4, 16), trim, sx, shoulder - .118, 0, arm); band.rotation.x = Math.PI / 2;
      lathe([[.032, ey - shoulder + .02], [.035, -.1], [.036, -.06]], 1, skin, sx, shoulder - .02, 0, arm, 10);
      ball(.032, .034, .032, skin, sx, ey, 0, elbow, 10, 8);
      lathe([[.026, wrist - ey + .01], [.031, -.06], [.032, .0]], 1, skin, sx, ey, 0, elbow, 10);
      if (side === -1) { const watch = part(new T.TorusGeometry(.03, .008, 4, 14), ink, sx, wrist + .022, 0, elbow); watch.rotation.x = Math.PI / 2; block(.03, .026, .012, material(0x8fb0b6), sx + side * .03, wrist + .022, .0, elbow).rotation.y = Math.PI / 2; }
    }
    ball(.025, .042, .034, skin, sx, wrist - .028, .004, elbow, 10, 8);
    const thumb = ball(.011, .024, .012, skin, sx - side * .016, wrist - .02, .024, elbow, 8, 6); thumb.rotation.z = side * .4;
  }

  // Backpacks with straps, front pocket, top handle, badge and charm.
  const backpack = group(torso, 0, shoulder - .17, -.16);
  if (!adult) {
    const bag = material(girl ? 0x2c2c33 : 0xc22f3c), bagTrim = material(girl ? 0x3d3b46 : 0x2c2229), py = shoulder - .17;
    block(.25, .31, .1, bag, 0, py, -.165, backpack);
    block(.27, .05, .11, bagTrim, 0, py - .14, -.165, backpack);
    block(.19, .14, .045, bag, 0, py - .07, -.235, backpack);
    line([[-.085, py, -.258], [.085, py, -.258]], material(0xb9b2a8), .0035, backpack);
    line([[-.05, py + .15, -.15], [-.04, py + .19, -.16], [.04, py + .19, -.16], [.05, py + .15, -.15]], bagTrim, .009, backpack);
    for (const s of [-1, 1]) {
      line([[s * .075, py + .14, -.12], [s * .095, shoulder + .025, -.03], [s * .1, shoulder - .01, .07], [s * .11, shoulder - .13, .1], [s * .135, py - .12, .04], [s * .1, py - .14, -.11]], bagTrim, .011, backpack);
      block(.022, .03, .012, material(0x8d8780), s * .108, shoulder - .1, .103, backpack);
    }
    if (girl) { const flower = decal(.07, .07, motif('flower'), -.045, py - .07, -.259, backpack); flower.rotation.y = Math.PI; }
    else { const badge = part(new T.TorusGeometry(.022, .006, 5, 14), material(0xe9b84f), -.05, py - .06, -.26, backpack); ball(.012, .012, .004, cream, -.05, py - .06, -.262, backpack); }
    line([[.07, py - .02, -.26], [.08, py - .1, -.27]], material(0xd4c6b2), .0025, backpack);
    if (girl) { const charm = decal(.05, .05, motif('flower'), .082, py - .12, -.272, backpack); charm.rotation.y = Math.PI; }
    else { ball(.022, .026, .016, material(0x6fa060), .082, py - .12, -.272, backpack); for (const s of [-1, 1]) ball(.008, .008, .006, white, .082 + s * .01, py - .108, -.285, backpack); }
  }

  // One skinned draw carries all opaque cloth, skin and hair: every part is
  // rigidly weighted to its joint and keeps its colour as a vertex colour.
  // Drawings and the patterned sarong stay as small meshes on their joints.
  const bounds = new T.Box3().setFromObject(body);
  root.updateMatrixWorld(true);
  const bones = []; body.traverse(o => { if (o.isBone) bones.push(o); });
  const toRoot = root.matrixWorld.clone().invert(), local = new T.Matrix4(), parts = [];
  root.traverse(o => { if (o.isMesh && !o.material.transparent && !o.material.map) parts.push(o); });
  const single = [], double = [];
  for (const o of parts) {
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(local.multiplyMatrices(toRoot, o.matrixWorld));
    (o.material.side === T.DoubleSide ? double : single).push({ g, colour: o.material.color, bone: bones.indexOf(o.parent) });
    o.removeFromParent(); o.geometry.dispose();
  }
  // Two-sided cloth (the hood) is appended last with flipped copies, so the
  // ink hull can draw only the outward-facing range.
  const count = [...single, ...double].reduce((n, { g }) => n + g.attributes.position.count, 0) + double.reduce((n, { g }) => n + g.attributes.position.count, 0);
  const position = new Float32Array(count * 3), normal = new Float32Array(count * 3), colour = new Float32Array(count * 3), skinIndex = new Uint16Array(count * 4), skinWeight = new Float32Array(count * 4);
  let n = 0;
  const append = ({ g, colour: c, bone }, flip = false) => {
    const p = g.attributes.position.array, q = g.attributes.normal.array, verts = p.length / 3;
    for (let i = 0; i < verts; i++) {
      const src = flip ? i - (i % 3) + [0, 2, 1][i % 3] : i;
      for (let k = 0; k < 3; k++) { position[(n + i) * 3 + k] = p[src * 3 + k]; normal[(n + i) * 3 + k] = flip ? -q[src * 3 + k] : q[src * 3 + k]; }
      colour.set([c.r, c.g, c.b], (n + i) * 3); skinIndex[(n + i) * 4] = bone; skinWeight[(n + i) * 4] = 1;
    }
    n += verts;
  };
  for (const piece of single) append(piece);
  for (const piece of double) append(piece);
  const outer = n;
  for (const piece of double) append(piece, true);
  for (const { g } of [...single, ...double]) g.dispose();
  const geometry = new T.BufferGeometry();
  for (const [name, array, size] of [['position', position, 3], ['normal', normal, 3], ['color', colour, 3], ['skinIndex', skinIndex, 4], ['skinWeight', skinWeight, 4]]) geometry.setAttribute(name, new T.BufferAttribute(array, size));
  geometry.computeBoundingSphere();
  const figure = new T.SkinnedMesh(geometry, skinMaterial); figure.castShadow = figure.receiveShadow = true; root.add(figure);
  root.updateMatrixWorld(true); figure.bind(new T.Skeleton(bones));
  const hullGeometry = new T.BufferGeometry();
  for (const name of ['position', 'normal', 'skinIndex', 'skinWeight']) hullGeometry.setAttribute(name, geometry.attributes[name]);
  hullGeometry.setDrawRange(0, outer); hullGeometry.boundingSphere = geometry.boundingSphere;
  outline({ geometry: hullGeometry, isSkinnedMesh: true, skeleton: figure.skeleton, bindMatrix: figure.bindMatrix, position: new T.Vector3(), quaternion: new T.Quaternion(), scale: new T.Vector3(1, 1, 1), parent: root }, 1.8);
  const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d'), gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 31); gradient.addColorStop(0, 'rgba(45,42,56,.3)'); gradient.addColorStop(1, 'rgba(45,42,56,0)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
  const shadow = new T.Mesh(new T.PlaneGeometry(.62, .62), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; root.add(shadow);
  // World coordinates are metres. Normalise the authored plan to the exact
  // character height; the soles rest .065 m above the group origin.
  const height = plan.height, scale = height / (bounds.max.y - bounds.min.y); root.scale.setScalar(scale);
  const baseY = -bounds.min.y + .065 / scale; body.position.y = baseY; shadow.position.y = .075 / scale;
  let blend = 0, run = 0, speed = 0, phase = 0, time = 0;
  const target = new T.Vector3(), inverseBody = new T.Quaternion(), chain = new T.Quaternion(), footRotation = new T.Quaternion(), xAxis = new T.Vector3(1, 0, 0);
  function animate(dt, moving = 0, running = false, travel = 0) {
    time += dt;
    // Speed comes from successful collision movement, so pushing against a
    // wall stops the stride, and the gait blends from a walk into a run.
    speed = T.MathUtils.lerp(speed, dt > 0 ? travel / dt : 0, 1 - Math.exp(-dt * 8));
    run = T.MathUtils.smoothstep(speed, 2.2, 9.5);
    phase += travel / (gaitShape(run).cycle * leg * scale) * TAU;
    blend = T.MathUtils.lerp(blend, Math.min(1, Math.max(moving, speed / 1.2)), 1 - Math.exp(-dt * 10));
    const pose = gaitPose(phase, time, blend, run);
    body.position.set(pose.x * leg, baseY + pose.y * leg, 0);
    body.rotation.set(0, pose.hipYaw, pose.hipRoll);
    torso.rotation.set(pose.lean, pose.chestYaw, pose.chestRoll);
    head.rotation.set(-pose.lean * .55, -pose.chestYaw * .7, -pose.chestRoll);
    inverseBody.copy(body.quaternion).invert();
    for (let i = 0; i < 2; i++) {
      const foot = pose.feet[i];
      target.set(legs[i].position.x, baseY + plan.ankle + foot.lift * leg, foot.z * leg).sub(body.position).applyQuaternion(inverseBody).sub(legs[i].position);
      const angles = solveLeg(target.y, target.z, plan.upper, plan.lower);
      legs[i].rotation.set(angles.hip, 0, 0); knees[i].rotation.x = angles.knee;
      chain.copy(body.quaternion).multiply(legs[i].quaternion).multiply(knees[i].quaternion).invert();
      footRotation.setFromAxisAngle(xAxis, foot.roll); feet[i].quaternion.copy(chain.multiply(footRotation));
      const out = i === 0 ? -1 : 1;
      arms[i].rotation.set(pose.arms[i].swing - pose.lean * .5, 0, out * (.1 + .04 * blend * run));
      elbows[i].rotation.x = pose.arms[i].bend;
    }
    backpack.rotation.x = Math.sin(phase * 2) * .03 * blend;
    backpack.rotation.z = -pose.hipRoll * .6;
  }
  root.userData.design = kind; root.userData.height = height;
  return { group: root, legs, knees, feet, arms, head, torso, backpack, height, animate };
}

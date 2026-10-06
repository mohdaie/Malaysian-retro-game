import * as T from 'three';

// Original mesh designs. Every limb rotates around an anatomical joint rather
// than the center of a block. All characters share one material palette.
const palette = new Map();
function material(color, roughness = .8) {
  const key = `${color}:${roughness}`;
  if (!palette.has(key)) palette.set(key, new T.MeshStandardMaterial({ color, roughness }));
  return palette.get(key);
}

export function createCharacter(scene, x, z, kind = 'amir') {
  const root = new T.Group(); root.position.set(x, 0, z); scene.add(root);
  const body = new T.Group(); root.add(body);
  const adult = kind === 'pak', girl = kind === 'nur';
  const skin = material(adult ? 0xaf7955 : 0xc68e65, .67);
  const shirt = material(girl ? 0x9b4c55 : adult ? 0xeee5d0 : 0xdd754b);
  const pants = material(girl ? 0x733d4d : adult ? 0x3b5851 : 0x3a5c73);
  const ivory = material(0xffedca), dark = material(0x382c26), shoe = material(adult ? 0x59483b : girl ? 0x8e4543 : 0x44657a);
  function part(geometry, mat, px, py, pz, parent = body) {
    const mesh = new T.Mesh(geometry, mat); mesh.position.set(px, py, pz);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function ellipsoid(rx, ry, rz, mat, px, py, pz, parent = body) {
    const mesh = part(new T.SphereGeometry(1, Math.max(rx,ry,rz)<.15?8:16, Math.max(rx,ry,rz)<.15?6:12), mat, px, py, pz, parent); mesh.scale.set(rx, ry, rz); return mesh;
  }
  function capsule(radius, length, mat, px, py, pz, parent = body) {
    return part(new T.CapsuleGeometry(radius, length, 5, 12), mat, px, py, pz, parent);
  }
  function tailored(points, depth, mat, px, py, pz, parent = body) {
    const mesh = part(new T.LatheGeometry(points.map(([r, y]) => new T.Vector2(r, y)), 20), mat, px, py, pz, parent); mesh.scale.z = depth; return mesh;
  }
  const headY = adult ? 2.24 : 2.08;
  capsule(.12, .19, skin, 0, headY - .43, 0);
  tailored([[.27,0],[.32,.04],[.32,.24],[.37,.49],[.31,.59],[.16,.66],[0,.66]], .7, shirt, 0, 1.02, 0);
  // Collar and short sleeves read clearly even while following from behind.
  const collar = part(new T.TorusGeometry(.145,.028,5,20), ivory,0,1.68,0); collar.rotation.x = Math.PI/2;
  if (!girl) {
    for (const a of [-1,1]) {
      const flap = part(new T.ConeGeometry(.095,.16,3), ivory,a*.095,1.6,.22); flap.rotation.z = a*.5;
    }
    for (let i=0;i<3;i++) ellipsoid(.019,.02,.02,adult ? dark : ivory,0,1.5-i*.12,.234);
    // A sewn pocket and shirt hem, rather than a graphic floating in space.
    tailored([[.055,0],[.08,.1],[0,.1]],.16,shirt,-.18,1.35,.224);
  }
  const head = ellipsoid(.355,.405,.32,skin,0,headY,.025);
  ellipsoid(.275,.19,.265,skin,0,headY-.17,.08);
  for (const a of [-1,1]) {
    ellipsoid(.08,.115,.065,skin,a*.355,headY-.01,.012);
    ellipsoid(.028,.055,.02,material(0xb17657),a*.39,headY-.01,.055);
  }
  if (girl) {
    // The hijab's rim surrounds the face; the crown does not cover the eyes.
    const hood = part(new T.SphereGeometry(.405,20,14,0,Math.PI*2,0,Math.PI*.56),ivory,0,headY+.035,-.035); hood.scale.z=.91;
    tailored([[.23,0],[.42,.12],[.4,.29],[.33,.47],[0,.53]],.71,ivory,0,headY-.51,-.09);
    ellipsoid(.285,.34,.085,skin,0,headY,.292);
    const rim = part(new T.TorusGeometry(.306,.022,5,28),material(0xe1cfa9),0,headY+.018,.272); rim.scale.y=1.12;
    ellipsoid(.024,.024,.025,material(0xc5a451,.35),.14,headY-.34,.283);
    tailored([[.32,0],[.43,.03],[.42,.29],[.36,.66],[.29,.79],[0,.79]],.73,pants,0,.23,0);
    // Simple tonal embroidery around the tunic's hem and cuffs.
    const hem = part(new T.TorusGeometry(.3,.016,4,24),material(0xc47c79),0,1.07,0); hem.rotation.x=Math.PI/2; hem.scale.y=.72;
  } else {
    const hair = part(new T.SphereGeometry(.367,20,14,0,Math.PI*2,0,Math.PI*.55),material(adult ? 0x736358 : 0x342d28),0,headY+.04,-.015); hair.scale.z=.93;
    if (adult) {
      tailored([[.36,0],[.355,.12],[.32,.2],[0,.21]],.92,ivory,0,headY+.3,-.01);
      const seam=part(new T.TorusGeometry(.35,.009,4,24),material(0xcec4ae),0,headY+.37,-.01);seam.rotation.x=Math.PI/2;
      for (const a of [-1,1]) ellipsoid(.11,.035,.028,material(0x776458),a*.095,headY-.14,.334);
    } else {
      for(let i=0;i<5;i++) {
        const lock=ellipsoid(.11,.14,.14,dark,-.24+i*.105,headY+.25,.21-i*.018);lock.rotation.z=-.35;
      }
      // Worn canvas satchel: protagonist silhouette stays distinct from the rear.
      const pack=ellipsoid(.245,.3,.135,material(0xb79857),0,1.38,-.275);pack.rotation.x=.08;
      ellipsoid(.23,.11,.07,material(0xd0b779),0,1.57,-.375);
      for (const a of [-1,1]) {
        const strap=capsule(.026,.48,material(0xa68545),a*.235,1.39,-.04);strap.rotation.z=a*.16;
        part(new T.BoxGeometry(.065,.075,.025),material(0x786b48,.45),a*.13,1.42,-.401);
      }
    }
  }
  // Small inset eyes with iris and catchlight, brows, nose and a restrained smile.
  for(const a of [-1,1]) {
    const px=a*.128, pz=girl ? .383 : .32;
    ellipsoid(.062,.049,.024,ivory,px,headY+.028,pz);
    ellipsoid(.028,.034,.015,material(0x493625),px,headY+.025,pz+.022);
    ellipsoid(.013,.022,.008,dark,px,headY+.025,pz+.036);
    ellipsoid(.009,.009,.004,ivory,px-.009,headY+.038,pz+.043);
    const brow=capsule(.013,.082,dark,px,headY+.119,pz-.008);brow.rotation.z=a*.15+Math.PI/2;
  }
  ellipsoid(.054,.07,.063,skin,0,headY-.045,girl ? .39 : .335);
  const smile=part(new T.TorusGeometry(.065,.009,4,12,Math.PI),material(0x874f41),0,headY-.17,girl ? .38 : .337);smile.rotation.z=Math.PI;
  const legs=[],arms=[],knees=[],elbows=[];
  for(const a of [-1,1]) {
    const leg=new T.Group();leg.position.set(a*.17,1.02,0);body.add(leg);legs.push(leg);
    capsule(.135,.22,pants,0,-.19,0,leg);
    const knee=new T.Group();knee.position.y=-.43;leg.add(knee);knees.push(knee);
    capsule(adult ? .115 : .085,.24,adult ? pants : skin,0,-.16,0,knee);
    if(!adult)capsule(.091,.085,ivory,0,-.37,0,knee);
    ellipsoid(.13,.09,.235,shoe,0,-.49,.065,knee);
    ellipsoid(.138,.035,.242,adult ? dark : ivory,0,-.545,.065,knee);
    if(!adult)for(let j=0;j<3;j++) {
      const lace=part(new T.BoxGeometry(.14,.013,.018),ivory,0,-.42,.035+j*.045,knee);lace.rotation.x=.1;
    }
    const arm=new T.Group();arm.position.set(a*.34,1.55,0);body.add(arm);arms.push(arm);
    capsule(.118,.11,shirt,a*.024,-.055,0,arm);
    capsule(.084,.13,girl || adult ? shirt : skin,a*.041,-.23,0,arm);
    const elbow=new T.Group();elbow.position.set(a*.05,-.35,0);arm.add(elbow);elbows.push(elbow);
    capsule(.071,.18,girl || adult ? shirt : skin,0,-.14,0,elbow);
    ellipsoid(.071,.095,.068,skin,0,-.31,.012,elbow);
    ellipsoid(.04,.06,.04,skin,-a*.05,-.28,.047,elbow);
    arm.rotation.z=-a*.08;
  }
  // Soft contact shadow prevents floating feet without a hard black disk.
  const c=document.createElement('canvas');c.width=c.height=64;
  const ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(32,32,2,32,32,31);
  gradient.addColorStop(0,'rgba(31,47,33,.3)');gradient.addColorStop(1,'rgba(31,47,33,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const shadow=new T.Mesh(new T.PlaneGeometry(1.15,1.15),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.075;root.add(shadow);
  if(adult)root.scale.setScalar(1.08);
  // Merge details sharing a joint and material. Facial detail should not cost
  // a separate draw call per iris, button or shoelace on a phone.
  const buckets=new Map();
  root.traverse(object=>{
    if(!object.isMesh||object.material.transparent)return;
    if(!buckets.has(object.parent))buckets.set(object.parent,new Map());
    const byMaterial=buckets.get(object.parent);
    if(!byMaterial.has(object.material))byMaterial.set(object.material,[]);
    byMaterial.get(object.material).push(object);
  });
  for(const [parent,byMaterial] of buckets)for(const [mat,objects] of byMaterial){
    if(objects.length<2)continue;
    const geometries=objects.map(object=>{object.updateMatrix();const g=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();g.applyMatrix4(object.matrix);return g;});
    const count=geometries.reduce((sum,g)=>sum+g.attributes.position.count,0);
    const position=new Float32Array(count*3),normal=new Float32Array(count*3),uv=new Float32Array(count*2);let offset=0;
    for(const g of geometries){position.set(g.attributes.position.array,offset*3);normal.set(g.attributes.normal.array,offset*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,offset*2);offset+=g.attributes.position.count;g.dispose();}
    for(const object of objects){object.removeFromParent();object.geometry.dispose();}
    const merged=new T.BufferGeometry();merged.setAttribute('position',new T.BufferAttribute(position,3));merged.setAttribute('normal',new T.BufferAttribute(normal,3));merged.setAttribute('uv',new T.BufferAttribute(uv,2));merged.computeBoundingSphere();
    part(merged,mat,0,0,0,parent);
  }
  let blend=0,phase=0;
  function animate(dt, moving=0, running=false) {
    blend=T.MathUtils.lerp(blend,Math.min(moving,1),1-Math.exp(-dt*12));
    phase+=dt*(running ? 18 : 13);
    body.position.y=Math.abs(Math.sin(phase))*.035*blend;
    body.rotation.x=running ? .065*blend : .025*blend;
    for(let i=0;i<2;i++) {
      const wave=Math.sin(phase+i*Math.PI);
      legs[i].rotation.x=wave*(running ? .7 : .48)*blend;
      knees[i].rotation.x=Math.max(0,-wave)*.65*blend;
      arms[i].rotation.x=-wave*(running ? .6 : .35)*blend;
      elbows[i].rotation.x=-(running ? .8 : .18)*blend;
    }
    body.rotation.z=Math.sin(phase*.12)*.008*(1-blend);
  }
  return {group:root,legs,arms,head,animate};
}

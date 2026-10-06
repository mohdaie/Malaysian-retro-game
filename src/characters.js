import * as T from 'three';
import { toon, outline } from './illustration.js?v=0.5.0';
import { gaitPose, solveLeg } from './locomotion.js?v=0.5.0';

const palette = new Map(), decals = new Map();
function material(color) { if (!palette.has(color)) palette.set(color, toon(color)); return palette.get(color); }
function drawing(key, paint) {
  if (!decals.has(key)) {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const ctx = c.getContext('2d'); paint(ctx);
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace;
    decals.set(key, new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 }));
  }
  return decals.get(key);
}
function face(kind) {
  return drawing('face-'+kind, c => {
    const girl = kind === 'nur', adult = kind === 'pak';
    c.lineCap='round';
    // Inked anime eyes: whites, warm irises, pupils and two painted highlights.
    for (const x of [160,352]) {
      c.save();c.translate(x,244);c.rotate(x<256?-.06:.06);
      c.fillStyle='#fff7e8';c.beginPath();c.ellipse(0,0,55,adult?49:70,0,0,Math.PI*2);c.fill();
      c.strokeStyle='#342937';c.lineWidth=12;c.beginPath();c.ellipse(0,0,55,adult?49:70,0,Math.PI,Math.PI*2);c.stroke();
      c.fillStyle='#805039';c.beginPath();c.ellipse(6,6,35,adult?40:58,0,0,Math.PI*2);c.fill();
      c.fillStyle='#211e29';c.beginPath();c.ellipse(7,0,24,adult?34:47,0,0,Math.PI*2);c.fill();
      c.fillStyle='#fffaf1';c.beginPath();c.ellipse(-6,-26,13,18,-.3,0,Math.PI*2);c.fill();c.beginPath();c.arc(22,27,6,0,Math.PI*2);c.fill();
      if(girl){c.lineWidth=7;c.beginPath();c.moveTo(-52,-24);c.lineTo(-65,-39);c.moveTo(-42,-46);c.lineTo(-52,-63);c.stroke();}
      c.restore();
      c.strokeStyle='#372b31';c.lineWidth=girl?8:12;c.beginPath();c.moveTo(x-43,143);c.quadraticCurveTo(x,126,x+42,143);c.stroke();
    }
    c.fillStyle='rgba(206,103,92,.3)';for(const x of [102,410]){c.beginPath();c.ellipse(x,327,30,14,0,0,Math.PI*2);c.fill();}
    c.strokeStyle='#b27158';c.lineWidth=6;c.beginPath();c.moveTo(260,287);c.quadraticCurveTo(274,309,253,310);c.stroke();
    c.strokeStyle='#663744';c.lineWidth=7;c.beginPath();c.moveTo(221,358);c.quadraticCurveTo(255,381,290,356);c.stroke();
    c.fillStyle='#fff1d9';c.beginPath();c.moveTo(229,362);c.quadraticCurveTo(254,369,283,360);c.quadraticCurveTo(255,380,229,362);c.fill();
    if(adult){c.strokeStyle='#46352f';c.lineWidth=12;c.beginPath();c.moveTo(215,337);c.lineTo(252,324);c.lineTo(294,338);c.stroke();}
  });
}
function motif(kind) {
  return drawing('motif-'+kind,c=>{
    if(kind==='alien'){
      c.fillStyle='#2d3a51';const rows=['00100100','00011000','00111100','01111110','11011011','11111111','10100101','00100100'];
      rows.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')c.fillRect(80+x*44,72+y*44,44,44);}));
    } else {
      c.fillStyle=kind==='flower'?'#ed9fae':'#ffe4dd';
      for(let i=0;i<5;i++){c.save();c.translate(256,256);c.rotate(i*Math.PI*2/5);c.beginPath();c.ellipse(0,-93,54,100,0,0,Math.PI*2);c.fill();c.restore();}
      c.fillStyle='#efc684';c.beginPath();c.arc(256,256,28,0,Math.PI*2);c.fill();
      c.strokeStyle='#fbebd8';c.lineWidth=7;c.beginPath();c.moveTo(250,250);c.quadraticCurveTo(320,225,340,163);c.stroke();
    }
  });
}
export function createCharacter(scene,x,z,kind='amir') {
  const root=new T.Group();root.position.set(x,0,z);scene.add(root);
  const body=new T.Group();root.add(body);
  const adult=kind==='pak',girl=kind==='nur';
  const skin=material(adult?0xc28d64:0xf1b886),ink=material(0x282935),cream=material(0xffecd5);
  const shirt=material(girl?0xe99da9:adult?0xe6dcc1:0xf9ebdc),pants=material(girl?0x8daaba:adult?0x526b59:0x355775);
  const seam=material(girl?0x627b91:0x243c55),pinkShadow=material(0xbe788c);
  function part(g,mat,px,py,pz,parent=body){const m=new T.Mesh(g,mat);m.position.set(px,py,pz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function ball(rx,ry,rz,mat,px,py,pz,parent=body){const m=part(new T.SphereGeometry(1,12,8),mat,px,py,pz,parent);m.scale.set(rx,ry,rz);return m;}
  function block(w,h,d,mat,px,py,pz,parent=body){
    // Bevel a small 2-segment box, retaining a low-poly silhouette.
    const g=new T.BoxGeometry(w,h,d,2,2,2),p=g.attributes.position,r=Math.min(w,h,d)*.18;
    for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i),core=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));v.sub(core).normalize().multiplyScalar(r).add(core);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return part(g,mat,px,py,pz,parent);
  }
  function tube(radius,length,mat,px,py,pz,parent=body){return part(new T.CapsuleGeometry(radius,length,2,8),mat,px,py,pz,parent);}
  function tailored(points,depth,mat,px,py,pz,parent=body){const m=part(new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),12),mat,px,py,pz,parent);m.scale.z=depth;return m;}
  function line(points,mat=ink,r=.012,parent=body){return part(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(3,points.length*2),r,3,false),mat,0,0,0,parent);}
  function decal(w,h,mat,px,py,pz,parent=body){return part(new T.PlaneGeometry(w,h),mat,px,py,pz,parent);}
  // Reference proportions: oversized head, short torso, full cargo trousers.
  const headY=2.51;
  tube(.13,.17,skin,0,2.0,0);
  tailored([[.3,0],[.36,.06],[.37,.38],[.4,.64],[.3,.8],[.16,.84],[0,.84]],.73,shirt,0,1.15,0);
  const collar=part(new T.TorusGeometry(.17,girl?.054:.027,4,16),girl?pinkShadow:material(0x2c3a50),0,1.98,.015);collar.rotation.x=Math.PI/2;
  const head=ball(.49,.57,.435,skin,0,headY,.04);
  // Re-shape chin and cheeks rather than leaving a spherical toy head.
  const hp=head.geometry.attributes.position;for(let i=0;i<hp.count;i++){if(hp.getY(i)<-.28)hp.setX(i,hp.getX(i)*(.83+hp.getY(i)*.09));}head.geometry.computeVertexNormals();
  for(const a of [-1,1]){ball(.10,.14,.075,skin,a*.475,headY-.015,.04);ball(.039,.068,.015,material(0xd99070),a*.528,headY-.012,.091);}
  // Transparent face art follows the curved head. No flat billboard face.
  const vertices=[],uv=[],idx=[],nx=20,ny=16;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/ny,px=(u-.5)*.94,py=(v-.5)*1.07,pz=.435*Math.sqrt(Math.max(.03,1-(px/.49)**2-(py/.57)**2))+.052;vertices.push(px,py,pz);uv.push(u,v);}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const n=j*(nx+1)+i;idx.push(n,n+1,n+nx+1,n+1,n+nx+2,n+nx+1);}
  const fg=new T.BufferGeometry();fg.setAttribute('position',new T.Float32BufferAttribute(vertices,3));fg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));fg.setIndex(idx);fg.computeVertexNormals();part(fg,face(kind),0,headY,0);
  if(girl){
    const scarf=material(0xeeb1b2),fold=material(0xd78c9e);
    // Hood shell has a real open face aperture, visible from front and side.
    const g=new T.SphereGeometry(1,18,12).toNonIndexed(),pos=g.attributes.position,kept=[];
    for(let i=0;i<pos.count;i+=3){const c=new T.Vector3();for(let j=0;j<3;j++)c.add(new T.Vector3().fromBufferAttribute(pos,i+j));c.divideScalar(3);if(c.z>.32&&c.y<.57&&c.y>-.7&&Math.abs(c.x)<.83)continue;for(let j=0;j<3;j++)kept.push(pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j));}
    const hood=new T.BufferGeometry();hood.setAttribute('position',new T.Float32BufferAttribute(kept,3));hood.computeVertexNormals();const hm=part(hood,scarf,0,headY+.015,-.015);hm.scale.set(.57,.65,.50);hm.material=toon(0xeeb1b2,{side:T.DoubleSide});g.dispose();
    const rim=[];for(let i=0;i<=24;i++){const a=i*Math.PI*2/24;rim.push([Math.sin(a)*.43,headY+.015+Math.cos(a)*.50,.27+Math.cos(a)*.015]);}line(rim,fold,.035);
    tailored([[.20,0],[.45,.09],[.43,.21],[.33,.4],[.26,.49],[0,.49]],.79,scarf,0,1.89,-.07);
    line([[-.37,2.20,.12],[-.07,2.01,.3],[.28,2.05,.29],[.42,2.15,.13]],fold,.045);
    const tail=block(.29,.51,.12,scarf,.29,1.83,.29);tail.rotation.z=-.22;
    line([[-.36,2.33,-.34],[0,2.10,-.49],[.38,2.27,-.32]],fold,.02);
    decal(.24,.25,motif('hibiscus'),.12,1.65,.291);
    for(const a of [-1,1])line([[a*.09,1.94,.29],[a*.08,1.65,.30]],cream,.012);
    line([[-.21,1.30,.29],[0,1.25,.32],[.22,1.30,.29]],pinkShadow,.012);
  }else{
    const hair=material(0x232631),highlight=material(0x373b48);
    const cap=part(new T.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI*.60),hair,0,headY+.07,0);cap.scale.set(.51,.56,.45);
    if(adult){tailored([[.48,0],[.48,.15],[.39,.27],[0,.28]],.92,cream,0,headY+.43,-.01);}
    else{
      // Angular swept locks replace the previous row of rounded hair blobs.
      const locks=[[-.42,.29,.18,-.34,.34],[-.30,.40,.20,-.45,.39],[-.12,.49,.15,-.3,.38],[.11,.48,.12,.32,.4],[.32,.34,.14,.55,.35],[.43,.12,.1,.50,.30],[-.34,.15,.39,-.28,.35],[-.10,.23,.44,-.3,.40],[.14,.19,.43,.3,.39],[.35,.09,.34,.40,.31]];
      for(let i=0;i<locks.length;i++){const [px,py,pz,angle,h]=locks[i],lock=part(new T.ConeGeometry(.155,h,4),i%3===0?highlight:hair,px,headY+py,pz);lock.rotation.z=angle;lock.rotation.x=pz>.3?Math.PI:.15;}
      for(let i=0;i<5;i++){const a=i*1.25,lock=part(new T.ConeGeometry(.16,.36,4),hair,Math.sin(a)*.36,headY+.29,-.19+Math.cos(a)*.15);lock.rotation.z=-Math.sin(a)*.65;}
      decal(.29,.3,motif('alien'),0,1.62,.281);
    }
  }
  const beforePack=new Set(body.children);
  // Both reference backpacks, straps, zip pocket and dangling charms.
  if(!adult){
    const bag=material(girl?0x303039:0xb93247),trim=material(girl?0x4b4050:0x392d38);
    block(.62,.72,.27,trim,0,1.58,-.335);block(.52,.58,.11,bag,0,1.60,-.493);block(.40,.27,.08,bag,0,1.40,-.57);
    line([[-.2,1.53,-.615],[.2,1.53,-.615]],cream,.011);
    for(const a of [-1,1]){line([[a*.27,1.98,-.24],[a*.30,1.83,.14],[a*.29,1.40,.25],[a*.26,1.24,-.20]],trim,.039);line([[a*.32,1.83,.14],[a*.31,1.43,.245]],girl?pinkShadow:bag,.017);}
    line([[-.10,1.98,-.34],[-.11,2.04,-.38],[.11,2.04,-.38],[.10,1.98,-.34]],trim,.022);
    if(girl){const flower=decal(.23,.23,motif('flower'),-.13,1.41,-.617);flower.rotation.y=Math.PI;}else{const badge=part(new T.TorusGeometry(.065,.012,4,12),material(0xedbd59),-.11,1.43,-.616);ball(.027,.029,.008,cream,-.11,1.43,-.63);}
    line([[.24,1.50,-.56],[.3,1.26,-.59]],cream,.009);
    if(girl){const charm=decal(.16,.17,motif('flower'),.30,1.20,-.6);charm.rotation.y=Math.PI;}else{ball(.066,.083,.025,material(0x709f67),.30,1.16,-.60);for(const a of [-1,1])ball(.025,.025,.02,cream,.30+a*.03,1.19,-.63);}
  }
  const backpack=new T.Group();
  for(const object of [...body.children])if(!beforePack.has(object)){object.removeFromParent();backpack.add(object);}body.add(backpack);
  const legs=[],knees=[],feet=[],arms=[],elbows=[];
  for(const a of [-1,1]){
    const leg=new T.Group();leg.position.set(a*.22,1.18,0);body.add(leg);legs.push(leg);
    tailored([[.18,-.52],[.22,-.40],[.20,-.10],[.19,.03]],.94,pants,0,0,0,leg);
    const pocket=block(.105,.28,.27,pants,a*.185,-.23,.05,leg);pocket.rotation.z=a*.03;
    block(.12,.09,.28,seam,a*.20,-.13,.06,leg);ball(.021,.023,.018,cream,a*.243,-.13,.18,leg);
    line([[a*.12,-.02,.175],[a*.13,-.4,.176]],seam,.008,leg);
    const knee=new T.Group();knee.position.y=-.51;leg.add(knee);knees.push(knee);
    ball(.19,.18,.175,pants,0,0,0,knee);
    tailored([[.16,-.45],[.19,-.36],[.20,-.08],[.18,.03]],.91,pants,0,0,0,knee);
    line([[-.14,-.38,.14],[0,-.41,.185],[.16,-.37,.13]],seam,.010,knee);
    const ankle=new T.Group();ankle.position.y=-.50;knee.add(ankle);feet.push(ankle);
    const beforeShoe=new Set(knee.children);
    block(.33,.18,.57,cream,0,-.50,.09,knee);block(.34,.066,.59,material(0xd5c3b3),0,-.585,.09,knee);
    const toe=ball(.16,.095,.14,cream,0,-.49,.30,knee);
    for(let j=0;j<3;j++){block(.20,.012,.02,cream,0,-.405,.02+j*.066,knee);for(const side of [-1,1]){const stripe=block(.008,.09,.045,girl?pinkShadow:ink,side*.167,-.48,-.02+j*.064,knee);stripe.rotation.x=-.40;}}
    for(const side of [-1,1])line([[side*.045,-.45,.38],[side*.045,-.43,.35],[side*.045,-.405,.29]],material(0xc6b8ad),.006,knee);
    for(const object of [...knee.children])if(object!==ankle&&!beforeShoe.has(object)){object.position.y+=.50;object.removeFromParent();ankle.add(object);}
    const arm=new T.Group();arm.position.set(a*.38,1.87,0);body.add(arm);arms.push(arm);
    tube(.13,.18,shirt,a*.04,-.13,0,arm);
    if(!girl&&!adult){tube(.133,.015,material(0x2d3a50),a*.044,-.28,0,arm);tube(.085,.12,skin,a*.05,-.32,0,arm);}
    const elbow=new T.Group();elbow.position.set(a*.05,-.43,0);arm.add(elbow);elbows.push(elbow);
    ball(.084,.087,.083,girl||adult?shirt:skin,0,0,0,elbow);
    tube(.08,.20,girl||adult?shirt:skin,0,-.12,0,elbow);
    if(girl)tube(.087,.03,pinkShadow,0,-.26,0,elbow);
    ball(.082,.103,.075,skin,0,-.32,.018,elbow);ball(.039,.06,.04,skin,-a*.063,-.29,.060,elbow);
    if(!girl&&!adult&&a===1){tube(.088,.035,ink,0,-.235,0,elbow);block(.12,.085,.04,ink,0,-.23,.083,elbow);block(.075,.045,.011,material(0x91a7ae),0,-.23,.11,elbow);}
    arm.rotation.z=-a*.13;
  }
  // A chest pivot lets shoulders counter-rotate against the pelvis.
  const torso=new T.Group();torso.position.y=1.18;body.add(torso);
  for(const object of [...body.children])if(object!==torso&&!legs.includes(object)){object.position.y-=1.18;object.removeFromParent();torso.add(object);}
  // Merge each joint's opaque details before adding hull ink. The face and
  // clothing drawings stay transparent and are never included in the hull.
  const buckets=new Map();root.traverse(o=>{if(!o.isMesh||o.material.transparent)return;if(!buckets.has(o.parent))buckets.set(o.parent,new Map());const b=buckets.get(o.parent);if(!b.has(o.material))b.set(o.material,[]);b.get(o.material).push(o);});
  for(const [parent,byMat] of buckets)for(const [mat,objects] of byMat){
    const gs=objects.map(o=>{o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);return g;});
    const count=gs.reduce((n,g)=>n+g.attributes.position.count,0),p=new Float32Array(count*3),normal=new Float32Array(count*3),uvs=new Float32Array(count*2);let n=0;
    for(const g of gs){p.set(g.attributes.position.array,n*3);normal.set(g.attributes.normal.array,n*3);if(g.attributes.uv)uvs.set(g.attributes.uv.array,n*2);n+=g.attributes.position.count;g.dispose();}
    for(const o of objects){o.removeFromParent();o.geometry.dispose();}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(normal,3));g.setAttribute('uv',new T.BufferAttribute(uvs,2));g.computeBoundingSphere();part(g,mat,0,0,0,parent);
  }
  const hulls=new Map();root.traverse(o=>{if(o.isMesh&&!o.material.transparent&&o.material.side!==T.DoubleSide){if(!hulls.has(o.parent))hulls.set(o.parent,[]);hulls.get(o.parent).push(o.geometry);}});
  for(const [parent,gs] of hulls){const count=gs.reduce((n,g)=>n+g.attributes.position.count,0),p=new Float32Array(count*3),normals=new Float32Array(count*3);let offset=0;for(const g of gs){p.set(g.attributes.position.array,offset);normals.set(g.attributes.normal.array,offset);offset+=g.attributes.position.array.length;}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(normals,3));g.computeBoundingSphere();outline({geometry:g,position:new T.Vector3(),quaternion:new T.Quaternion(),scale:new T.Vector3(1,1,1),parent});}
  const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(32,32,2,32,32,31);gradient.addColorStop(0,'rgba(45,42,56,.28)');gradient.addColorStop(1,'rgba(45,42,56,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const shadow=new T.Mesh(new T.PlaneGeometry(1.3,1.3),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.075;root.add(shadow);
  // World coordinates now represent metres: children are 150/148 cm,
  // while doorways and floors can retain real architectural dimensions.
  const bounds=new T.Box3().setFromObject(body),height=adult?1.75:girl?1.48:1.50;
  const scale=height/(bounds.max.y-bounds.min.y);root.scale.setScalar(scale);
  const baseY=-bounds.min.y+.065/scale;body.position.y=baseY;
  shadow.position.y=.075/scale;
  let blend=0,phase=0,time=0;
  const target=new T.Vector3(),inverseBody=new T.Quaternion(),chain=new T.Quaternion(),footRotation=new T.Quaternion(),xAxis=new T.Vector3(1,0,0);
  function animate(dt,moving=0,running=false,travel=0){
    time+=dt;
    // Distance comes from successful collision movement, so pushing against
    // a wall doesn't keep walking, and slow analog input slows the cadence.
    phase+=travel/(running?3.4:2.65)*Math.PI*2;
    blend=T.MathUtils.lerp(blend,Math.min(moving,1),1-Math.exp(-dt*10));
    const pose=gaitPose(phase,time,blend,running);
    body.position.set(pose.x,baseY+pose.y,0);
    body.rotation.set(0,pose.hipYaw,pose.hipRoll);
    torso.rotation.set(pose.lean,pose.chestYaw,pose.chestRoll);
    inverseBody.copy(body.quaternion).invert();
    for(let i=0;i<2;i++){
      const foot=pose.feet[i];
      target.set(legs[i].position.x,baseY+.17+foot.lift,foot.z).sub(body.position).applyQuaternion(inverseBody).sub(legs[i].position);
      const angles=solveLeg(target.y,target.z);
      legs[i].rotation.x=angles.hip;legs[i].rotation.z=0;knees[i].rotation.x=angles.knee;
      chain.copy(body.quaternion).multiply(legs[i].quaternion).multiply(knees[i].quaternion).invert();
      footRotation.setFromAxisAngle(xAxis,foot.roll);feet[i].quaternion.copy(chain.multiply(footRotation));
      arms[i].rotation.x=pose.arms[i].swing;arms[i].rotation.z=(i===0?.13:-.13)+(i===0?1:-1)*Math.abs(Math.sin(phase))*.025*blend;
      elbows[i].rotation.x=pose.arms[i].bend;
    }
    backpack.rotation.x=Math.sin(phase*2)*.025*blend;
    backpack.rotation.z=-pose.hipRoll*.6;
    backpack.position.z=-Math.abs(Math.sin(phase))*.012*blend;
  }
  root.userData.design=kind;root.userData.height=height;
  return {group:root,legs,knees,feet,arms,head,torso,backpack,height,animate};
}

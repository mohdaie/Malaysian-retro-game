import * as T from 'three';
export const places = [
  { name: "Amir's house", x: -43, z: 27, type: 'home' },
  { name: 'Kampung Melati', x: -45, z: -20, type: 'kampung' },
  { name: 'SK Seri Kenangan', x: -23, z: -42, type: 'school' },
  { name: 'Pekan lama', x: 5, z: -23, type: 'shop' },
  { name: 'Warung Pak Mat', x: 12, z: -7, type: 'warung' },
  { name: 'Masjid Seri Kenangan', x: 47, z: -39, type: 'mosque' },
  { name: 'Stesen bas', x: 54, z: 4, type: 'bus' },
  { name: 'Tapak pasar malam', x: 36, z: 29, type: 'market' },
  { name: "Nur's terrace", x: -4, z: 48, type: 'terrace' }
];
export function makeWorld(canvas) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(0xc4d8c2);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new T.Scene();
  scene.background = new T.Color(0xc4d8c2);
  scene.fog = new T.Fog(0xc4d8c2, 60, 200);
  const camera = new T.PerspectiveCamera(43, 1, .1, 350);
  scene.add(new T.HemisphereLight(0xfff4df, 0x526747, 1.5));
  const sun = new T.DirectionalLight(0xffe3b5, 2.4);
  sun.position.set(-35, 70, 30);
  sun.castShadow = true;
  const shadowSize = 1024;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 200 });
  sun.shadow.bias = -.0006;
  sun.shadow.normalBias = .03;
  scene.add(sun);
  scene.add(sun.target);
  // Original procedural textures add surface variation without external assets.
  let seed = 2001;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function surface(kind) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d'); ctx.fillStyle = kind === 'grass' ? '#afbd88' : kind === 'dirt' ? '#d9cbb0' : '#e4cfad'; ctx.fillRect(0,0,256,256);
    for(let i=0;i<9000;i++) { const a=rand()*.12; ctx.fillStyle=rand()>.5?`rgba(55,67,38,${a})`:`rgba(255,252,222,${a})`; ctx.fillRect(rand()*256,rand()*256,kind==='wood'?rand()*30+4:rand()*5+1,kind==='wood'?.7:rand()*3+1); }
    if(kind==='wood') for(let y=0;y<256;y+=32){ctx.fillStyle='#67533935';ctx.fillRect(0,y,256,1);ctx.fillStyle='#ffffff35';ctx.fillRect(0,y+2,256,1);}
    if(kind==='grass') for(let i=0;i<320;i++){ctx.strokeStyle=rand()>.5?'#9bac7270':'#c7ce9870';const x=rand()*256,y=rand()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*5-2,y-3-rand()*3);ctx.stroke();}
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace; texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.anisotropy = Math.min(8,renderer.capabilities.getMaxAnisotropy());
    texture.repeat.set(kind==='wood'?1:24,kind==='wood'?1:24); return texture;
  }
  const textures = {grass:surface('grass'), dirt:surface('dirt'), wood:surface('wood')};
  const mats = new Map();
  function textured(color,kind) {
    const key=kind+color;
    if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,map:textures[kind],roughness:1}));
    return mats.get(key);
  }
  const mat = color => {
    if (color?.isMaterial) return color;
    if (!mats.has(color)) mats.set(color, new T.MeshStandardMaterial({ color, roughness: .95, flatShading: false }));
    return mats.get(color);
  };
  const colliders = [];
  const animated = [];
  const homeSigns = [];
  function mesh(geometry, color, x, y, z, parent = scene) {
    const m = new T.Mesh(geometry, mat(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function box(w, h, d, color, x, y, z, parent) { return mesh(new T.BoxGeometry(w, h, d), color, x, y, z, parent); }
  function cylinder(r1, r2, h, color, x, y, z, parent, segments = 8) { return mesh(new T.CylinderGeometry(r1, r2, h, segments), color, x, y, z, parent); }
  function collider(x, z, w, d) { colliders.push({ x, z, w, d }); }
  function sign(text, x, y, z, width = 5, color = '#294e42', parent = scene) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#f5e6bd'; ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = color; ctx.font = 'bold 35px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 65, 465);
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace;
    if (text === 'RUMAH AMIR' || text === 'RUMAH NUR') homeSigns.push({ friend: text === 'RUMAH NUR', update: name => {
      ctx.fillStyle = '#f5e6bd'; ctx.fillRect(0,0,512,128); ctx.strokeStyle = color; ctx.lineWidth=8; ctx.strokeRect(8,8,496,112);
      ctx.fillStyle=color; ctx.fillText('RUMAH ' + name.toUpperCase(),256,65,465); texture.needsUpdate=true;
    } });
    const m = new T.Mesh(new T.PlaneGeometry(width, width / 4), new T.MeshBasicMaterial({ map: texture })); m.position.set(x, y, z); parent.add(m); return m;
  }
  function roof(w, d, x, y, z, color, parent = scene) {
    // Long pitched roof with a horizontal ridge along X.
    const vertices = new Float32Array([-w/2,0,-d/2,w/2,0,-d/2,-w/2,2,0,w/2,2,0,-w/2,0,d/2,w/2,0,d/2]);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(vertices, 3));
    g.setIndex([0,2,1,1,2,3,2,4,3,3,4,5,0,4,2,1,3,5,0,1,4,1,5,4]);
    const flat = g.toNonIndexed(); flat.computeVertexNormals(); g.dispose();
    return mesh(flat, color, x, y, z, parent);
  }
  function house(x, z, color = 0xc8aa75, w = 9, d = 7, label = '', stilt = true) {
    const floor = stilt ? 1.4 : .3;
    box(w, .35, d, 0x816145, x, floor, z);
    box(w, 3.6, d, textured(color,'wood'), x, floor + 1.9, z);
    roof(w + 1.4, d + 1.5, x, floor + 3.7, z, 0x8b5442);
    for (const a of [-1, 1]) for (const b of [-1, 1]) cylinder(.18,.18,floor,0x66513c,x+a*(w/2-.4),floor/2,z+b*(d/2-.4));
    for (const a of [-1, 1]) { box(1.6, 1.5, .15, 0x455f5d, x+a*w*.29, floor+2, z+d/2+.06); box(1.75,.15,.24,0xf1d9a7,x+a*w*.29,floor+2.85,z+d/2+.15); }
    box(1.5,2.7,.12,0x674c37,x,floor+1.5,z+d/2+.08);
    box(w+1, .25, 2.3, textured(0xbaa078,'wood'),x,floor,z+d/2+1.1);
    for(let i=0;i<4;i++) box(2,.25+(i*.28),.65,0xbcad8a,x,.125+i*.14,z+d/2+3.1-i*.6);
    box(w+1,.2,2.5,0x915541,x,floor+3,z+d/2+1.2).rotation.x=.14;
    for(const a of [-1,1]) cylinder(.09,.09,3,0x705c42,x+a*(w/2),floor+1.5,z+d/2+2.1);
    for(let i=0;i<6;i++) box(w,.055,.05,0x9e8359,x,floor+.55+i*.48,z+d/2+.09);
    // Timber shutters, window frames and verandah railings give the houses scale.
    for(const a of [-1,1]) {
      const wx=x+a*w*.29;
      for(const edge of [-1,1])box(.13,1.7,.19,0xe3c994,wx+edge*.85,floor+2,z+d/2+.15);
      box(1.8,.13,.2,0xe3c994,wx,floor+1.18,z+d/2+.15);
      for(const edge of [-1,1]) {
        const shutter=box(.48,1.6,.16,textured(0x7f936f,'wood'),wx+edge*1.05,floor+2,z+d/2+.24); shutter.rotation.y=edge*.22;
        for(let line=0;line<7;line++)box(.46,.045,.09,0x485e44,wx+edge*1.05,floor+1.37+line*.19,z+d/2+.35);
      }
    }
    for(const a of [-1,1]) {
      box(w*.31,.12,.11,0xbda375,x+a*w*.345,floor+1,z+d/2+2.16);
      for(let i=0;i<5;i++)box(.075,.83,.09,0xa48d62,x+a*(1.9+i*.54),floor+.55,z+d/2+2.16);
    }
    box(.14,.12,.16,0xd5b65f,x+.53,floor+1.4,z+d/2+.2);
    if(label) sign(label,x,floor+3.3,z+d/2+2.2,4);
    collider(x,z,w+1,d+1);
  }
  function palm(x,z,size=1) {
    cylinder(.18*size,.34*size,7*size,0x88734f,x,3.5*size,z);
    for(let i=1;i<7;i++)cylinder(.22*size,.22*size,.06,0x6d6044,x,i*size,z);
    const leafMaterialKey='palm-leaf';
    if(!mats.has(leafMaterialKey))mats.set(leafMaterialKey,new T.MeshStandardMaterial({color:0x4e7946,roughness:1,side:T.DoubleSide}));
    for(let a=0;a<8;a++) {
      const vertices=[],indices=[];
      for(let i=0;i<=8;i++){const t=i/8,width=Math.sin(t*Math.PI)*.45*size;const height=(Math.sin(t*Math.PI)*.8-t*t*1.5)*size;vertices.push(t*4.7*size,height,-width,t*4.7*size,height,width);if(i<8){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
      const leaf=mesh(g,mats.get(leafMaterialKey),x,7*size,z);leaf.rotation.y=a*Math.PI/4;
    }
    for(let a=0;a<3;a++)mesh(new T.SphereGeometry(.25*size,8,6),0x726044,x+.35*Math.sin(a*2),6.75*size,z+.35*Math.cos(a*2));
  }
  function tree(x,z,size=1) {
    cylinder(.2,.3,2.8*size,0x7c6345,x,1.4*size,z);
    mesh(new T.IcosahedronGeometry(2.5*size,1),0x6e965c,x,4*size,z);
    mesh(new T.IcosahedronGeometry(1.9*size,0),0x8fab65,x-1.1*size,3.6*size,z+.7*size);
  }
  function fence(x,z,length,axis='x') {
    for(let i=0;i<=length;i+=1.6){const px=x+(axis==='x'?i:0),pz=z+(axis==='z'?i:0);box(.12,1.3,.12,0xd4c6a0,px,.65,pz);}
    for(const y of [.35,.95]) box(axis==='x'?length:.1,.12,axis==='z'?length:.1,0xd4c6a0,x+(axis==='x'?length/2:0),y,z+(axis==='z'?length/2:0));
  }
  // Ground, roads and a narrow river divide the older kampung from the pekan.
  box(180,.6,160,textured(0x91a76b,'grass'),0,-.35,0);
  box(150,.08,8,0x777d73,0,.015,4);
  box(7,.08,132,0x7c8073,-25,.02,0);
  box(5,.06,62,textured(0xc8b994,'dirt'),-42,.04,24);
  box(90,.06,4,textured(0xcbbd99,'dirt'),4,.035,37);
  box(7,.08,100,0x7b8176,62,.02,0);
  for(let x=-72;x<74;x+=8)box(3,.02,.16,0xd6d1a9,x,.07,4);
  for(let z=-62;z<68;z+=8)box(.16,.02,3,0xd6d1a9,-25,.075,z);
  box(8,.1,155,0x71958a,-65,-.02,0);
  box(1,.1,155,0x799365,-70,.015,0);box(1,.1,155,0x799365,-60,.015,0);
  for(const z of [4,37]) {box(13,.2,8,0xbcac8b,-65,.13,z);for(const s of [-1,1]){box(13,.13,.15,0xe4d0a6,-65,1.1,z+s*3.7);for(let x=-71;x<=-59;x+=2)box(.15,1.15,.15,0xe4d0a6,x,.6,z+s*3.7);}}
  // Kampung houses inspired by Melaka timber homes, including Amir's verandah.
  house(-43,27,0xc7ad75,10,8,'RUMAH AMIR');
  house(-44,-18,0xa8b4a0,9,7);house(-45,-41,0xe0c39b,10,7);house(-76,24,0xadc0a1,9,8);house(-44,56,0xc9bd92,9,7);
  fence(-53,20,20);fence(-53,20,21,'z');fence(-53,41,7);fence(-38,41,5);
  palm(-53,31,1.2);palm(-34,22,.9);tree(-55,45);tree(-37,-26);palm(-53,-44,1.2);
  // School: low buildings, open corridors, cream walls, red pitched roofs.
  box(21,3.6,8,0xe7d8ad,-20,1.8,-49);roof(23,10,-20,3.65,-49,0x9e5544);
  for(let x=-28;x<=-12;x+=4){box(1.8,1.3,.12,0x789487,x,2,-44.94);box(.18,3.5,.18,0xf1e4bd,x,.1+1.75,-42.7);}
  box(23,.2,2,0xc8bc94,-20,.1,-43);box(23,.2,3,0xad6650,-20,3.2,-43);
  box(13,.04,13,0xc4bc8f,-20,.1,-32);sign('SEKOLAH KEBANGSAAN',-20,3,-40.4,9);
  cylinder(.06,.06,8,0xc7c7b3,-16,4,-34);box(1.5,.8,.025,0xb94336,-15.25,7.3,-34);
  collider(-20,-49,23,9);fence(-33,-58,27);fence(-33,-58,29,'z');
  // Old-town shophouses: five-foot walkways, pastel walls, timber shutters.
  const shopColors=[0xd8b98c,0xb6c7ad,0xdcb995,0xaac0b6,0xe0cda4];
  const shopNames=['KEDAI RUNCIT','KEDAI KOPI','KEDAI BASIKAL','FOTO KENANGAN','KEDAI JAHIT'];
  for(let i=0;i<5;i++){
    const x=-10+i*9;
    box(8.8,7.3,10,shopColors[i],x,3.7,-24);roof(9.2,11,x,7.4,-24,0x8d6151);
    for(const a of [-1,1]){box(1.7,2,.15,0x536d61,x+a*2.4,5.5,-18.93);box(.13,2.1,.18,0xe7d8b4,x+a*2.4,5.5,-18.82);}
    box(7.8,2.4,.15,0x7b7156,x,1.3,-18.93);box(9,.22,2.6,0xd6c4a0,x,.15,-17.4);box(9,.22,2.7,shopColors[i],x,3.2,-17.4);
    for(const a of [-1,1])box(.22,3,.22,0xeee0b9,x+a*4.15,1.5,-16.3);
    sign(shopNames[i],x,2.6,-16,7);collider(x,-24,8.8,10);
  }
  // Warung has an open social space facing the lane.
  box(11,.25,6.5,0xcbbb96,12,.14,-6.5);box(11,2.8,.3,0xd4c597,12,1.5,-9.65);
  for(const x of [6.7,17.3])for(const z of [-9,-3.5])cylinder(.13,.13,3.3,0x766746,x,1.7,z);
  roof(12.5,8.4,12,3.4,-6.5,0x657d6d);sign('WARUNG PAK MAT',12,2.8,-2.1,8);
  box(6,.75,1,0x776548,12,.6,-8.7);box(6,.08,1.2,0xb0a285,12,1.02,-8.7);
  for(const x of [8.5,15.5]){cylinder(1.1,1.1,.15,0x8f7350,x,.95,-5.8);cylinder(.1,.2,.8,0x6e6247,x,.5,-5.8);for(const a of [-1,1]){box(1,.16,.65,0xd0b98a,x+a*1.5,.55,-5.8);box(.15,.5,.15,0x665a42,x+a*1.5,.25,-5.8);}}
  box(1.5,.12,.5,0x845634,15.5,1.08,-5.8);collider(12,-9.65,11,.5);collider(8.5,-5.8,2,2);collider(15.5,-5.8,2,2);
  // Mosque: yellow dome and slender minaret, inspired by Kuala Kangsar.
  box(19,.18,19,0xdbd2b4,48,.12,-39);box(12,5.5,11,0xf0dfad,48,2.85,-39);
  box(13.3,.35,12.3,0xe9d9ac,48,5.6,-39);
  mesh(new T.SphereGeometry(4,20,12,0,Math.PI*2,0,Math.PI/2),0xd4b24b,48,5.85,-39);
  cylinder(.7,.7,.6,0xe9cb68,48,9.8,-39);cylinder(.05,.05,1.6,0xb39442,48,10.7,-39);
  for(const x of [44,48,52]){box(1.6,3,.13,0x477163,x,1.9,-33.4);mesh(new T.SphereGeometry(.8,12,8,0,Math.PI,0,Math.PI),0x477163,x,3.3,-33.35).scale.z=.1;}
  cylinder(1.2,1.6,11,0xefddaf,58,5.6,-44,undefined,12);cylinder(1.8,1.8,.45,0xd2bd81,58,10.5,-44,undefined,12);mesh(new T.SphereGeometry(1.5,12,8,0,Math.PI*2,0,Math.PI/2),0xd3b450,58,11,-44);
  sign('MASJID SERI KENANGAN',48,3.8,-33.2,9);collider(48,-39,13,12);collider(58,-44,3.5,3.5);
  palm(36,-45,1.1);palm(58,-29,1.1);tree(37,-30);
  // Low-budget terrace homes, Nur's house sits beside the main footpath.
  for(let i=0;i<5;i++){
    const x=-14+i*7;
    box(6.8,3.4,7,[0xd7d6b0,0xd6bca4,0xa5b8b0,0xdcc7a3,0xc6c7a6][i],x,1.8,48);roof(7.1,8,x,3.6,48,0x98705e);
    box(1.3,2.6,.12,0x796956,x+.9,1.5,44.45);box(1.9,1.4,.12,0x5d7d72,x-1.6,2,44.43);
    box(6.8,.1,5,0xd3c9a9,x,.1,41.8);fence(x-3.4,39.5,6.8);collider(x,48,6.8,7);
    if(i===1)sign('RUMAH NUR',x,3.1,44.3,3.8);
  }
  // Retro local bus station and an unmistakably boxy 90s bus.
  box(13,.15,9,0xd1c6a3,52,.1,-6);for(const x of [46,52,58])box(.2,3,.2,0x747d66,x,1.6,-7);box(14,.3,10,0x81947a,52,3.3,-6);sign('STESEN BAS',52,2.7,-.9,7);
  const bus=new T.Group();scene.add(bus);bus.position.set(53,0,8);
  box(4,3.1,10,0xd4c194,0,2.1,0,bus);box(4.05,.8,10.1,0x527f6a,0,1.4,0,bus);box(3.6,1.2,.12,0x6a9189,0,2.9,5.07,bus);
  for(const side of [-1,1])for(let z=-3.2;z<=3.3;z+=2.1)box(.1,1.1,1.6,0x6a9189,side*2.05,2.9,z,bus);
  for(const side of [-1,1])for(const z of [-3.4,3.4]){const wheel=cylinder(.65,.65,.3,0x424741,side*2,.7,z,bus,12);wheel.rotation.z=Math.PI/2;}
  sign('BAS PEKAN · 01',0,3.75,5.08,3.2,'#2c4d40',bus);collider(53,8,5,11);
  // Pasar malam stalls; setup hints at the evening beyond this first chapter.
  const colors=[0xbc7352,0xcbb161,0x638c82,0xb58b71,0x829b68,0xc79959];
  for(let i=0;i<6;i++){
    const x=28+(i%3)*8,z=23+Math.floor(i/3)*12;
    for(const a of [-1,1])for(const b of [-1,1])cylinder(.07,.07,3,0x6c6e57,x+a*2.4,1.6,z+b*1.8);
    roof(5.6,4.5,x,3,z,colors[i]);box(4.8,.12,2,0x967747,x,.9,z);collider(x,z,5,2);
    for(let j=0;j<4;j++)mesh(new T.IcosahedronGeometry(.3,0),i%2?0xd6b667:0x759350,x-1.5+j,.9+.3,z);
  }
  sign('PASAR MALAM · SABTU',36,4.4,21,10);tree(46,46);palm(22,30,1.1);
  // Props: lamp posts, bicycles, a small parked car, chickens and distant hills.
  for(const x of [-20,3,28,69]){cylinder(.09,.13,5.2,0x7b8270,x,2.6,10);box(.9,.18,.4,0xd9c596,x-.4,5.1,10);}
  function bicycle(x,z){for(const dx of [-.65,.65]){const ring=mesh(new T.TorusGeometry(.47,.05,5,14),0x444d41,x+dx,.52,z);ring.rotation.y=0;}box(1.3,.07,.07,0x996449,x,1,z);box(.07,.7,.07,0x996449,x+.3,.9,z);box(.3,.07,.22,0x514e3d,x,1.4,z);}
  bicycle(-34,33);bicycle(10,-15);
  const car=new T.Group();car.position.set(-13,0,11);scene.add(car);box(3,.9,5.5,0xb9c7b4,0,1,0,car);box(2.5,.8,2.7,0x6d8c80,0,1.85,-.2,car);for(const a of [-1,1])for(const z of [-1.7,1.7]){const w=cylinder(.43,.43,.25,0x41483c,a*1.5,.65,z,car);w.rotation.z=Math.PI/2;}collider(-13,11,3.3,6);
  for(let i=0;i<42;i++){
    const x=-76+((i*37)%152),z=-66+((i*29)%130);
    if((Math.abs(x+25)<8)||(Math.abs(z-4)<10)||(Math.abs(x-62)<8)||colliders.some(c=>Math.abs(x-c.x)<c.w/2+4&&Math.abs(z-c.z)<c.d/2+4))continue;
    if(i%3===0)palm(x,z,.75+(i%4)*.15);else tree(x,z,.65+(i%3)*.2);
  }
  for(let i=0;i<13;i++){const hill=mesh(new T.IcosahedronGeometry(20+(i%3)*8,1),i%2?0x839d75:0x9bb087,-110+i*18,-3,-92-Math.sin(i)*12);hill.scale.y=.7;}
  // Verges, potted plants, laundry and roadside details soften the greybox layout.
  function pot(x,z,y=0) {
    cylinder(.28,.2,.48,0xa57454,x,y+.24,z,undefined,10);cylinder(.31,.31,.07,0xbc9068,x,y+.48,z,undefined,10);
    for(let a=0;a<4;a++){const leaf=mesh(new T.SphereGeometry(.3,6,4),0x62834f,x+Math.sin(a*1.57)*.13,y+.78,z+Math.cos(a*1.57)*.13);leaf.scale.set(.45,1.25,.45);}
  }
  pot(-47,32.7,1.55);pot(-39,32.7,1.55);pot(6,-3);pot(18,-3);pot(-12,-16);pot(5,-16);
  for(let i=0;i<450;i++) {
    const x=-78+rand()*155,z=-65+rand()*130;
    if(Math.abs(z-4)<6||Math.abs(x+25)<5||Math.abs(x-62)<5||Math.abs(x+42)<3&&z>-9||Math.abs(z-37)<3||Math.abs(x+65)<7||colliders.some(c=>Math.abs(x-c.x)<c.w/2+2&&Math.abs(z-c.z)<c.d/2+2))continue;
    for(let a=0;a<3;a++){const blade=mesh(new T.ConeGeometry(.09,.35+rand()*.25,3),i%2?0x7f9959:0xa8ae67,x+a*.12,.25,z);blade.rotation.z=(a-1)*.25;}
  }
  // Hanging laundry beside Amir's home, a familiar kampung afternoon detail.
  for(const x of [-54,-47])cylinder(.05,.05,2.5,0x8b7958,x,1.25,18);
  box(7,.025,.025,0xc3bd9d,-50.5,2.4,18);
  for(let i=0;i<4;i++)box(.85,1.0,.025,[0xd1c2a7,0x809eb0,0xb88461,0xbabf94][i],-53+i*1.6,1.8,18);
  // Batch static geometry by material: the town should cost tens of draw calls,
  // rather than one draw call for every wall, window, fence post and roof.
  scene.updateMatrixWorld(true);
  const buckets = new Map();
  const staticMaterials = new Set(mats.values());
  const staticMeshes = [];
  scene.traverse(object => {
    if (object.isMesh && staticMaterials.has(object.material)) {
      if (!buckets.has(object.material)) buckets.set(object.material, []);
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      geometry.applyMatrix4(object.matrixWorld);
      buckets.get(object.material).push(geometry);
      staticMeshes.push(object);
    }
  });
  for (const object of staticMeshes) { object.removeFromParent(); object.geometry.dispose(); }
  for (const [material, geometries] of buckets) {
    const count = geometries.reduce((sum, geometry) => sum + geometry.attributes.position.count, 0);
    const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3), uvs = new Float32Array(count * 2);
    let offset = 0;
    for (const geometry of geometries) {
      positions.set(geometry.attributes.position.array, offset);
      normals.set(geometry.attributes.normal.array, offset);
      if (geometry.attributes.uv) uvs.set(geometry.attributes.uv.array, offset / 3 * 2);
      offset += geometry.attributes.position.array.length;
      geometry.dispose();
    }
    const merged = new T.BufferGeometry();
    merged.setAttribute('position', new T.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new T.BufferAttribute(normals, 3));
    merged.setAttribute('uv', new T.BufferAttribute(uvs, 2));
    merged.computeBoundingSphere();
    const object = new T.Mesh(merged, material);
    object.castShadow = true; object.receiveShadow = true; scene.add(object);
  }
  function character(x,z,kind='amir') {
    const group = new T.Group();group.position.set(x,0,z);scene.add(group);
    const skin=0xbe8e64, shirt=kind==='nur'?0xb3a895:kind==='pak'?0xe5d6b1:0xc68053;
    const torso=mesh(new T.CapsuleGeometry(.31,.38,4,10),shirt,0,1.25,0,group);torso.scale.z=.8;torso.rotation.z=.01;
    const head=mesh(new T.SphereGeometry(.4,16,12),skin,0,1.98,0,group);
    if(kind==='nur'){const hijab=mesh(new T.SphereGeometry(.4,10,8),0xe1c997,0,2.05,-.04,group);box(.77,.55,.45,0xe1c997,0,1.72,-.08,group);mesh(new T.SphereGeometry(.29,10,8),skin,0,2.02,.23,group);}
    else {const hair=mesh(new T.SphereGeometry(.41,16,10,0,Math.PI*2,0,Math.PI/2),kind==='pak'?0xe7e3c8:0x3c392e,0,2.08,-.02,group);if(kind==='pak')cylinder(.35,.36,.2,0xe9e4ca,0,2.28,0,group,12);}
    for(const a of [-1,1]){mesh(new T.SphereGeometry(.055,8,6),0xf6edda,a*.14,2.04,.36,group);mesh(new T.SphereGeometry(.028,8,6),0x363a32,a*.14,2.04,.406,group);box(.09,.025,.035,0x504332,a*.14,2.15,.36,group);}
    const smile=mesh(new T.TorusGeometry(.085,.013,4,12,Math.PI),0x755341,0,1.89,.375,group);smile.rotation.z=Math.PI;
    const legs=[],arms=[];
    for(const a of [-1,1]){const leg=new T.Group();leg.position.set(a*.2,.8,0);group.add(leg);box(.25,.67,.28,kind==='nur'?0x6a7667:0x556b67,0,-.33,0,leg);box(.29,.15,.43,0x595d4c,0,-.65,.08,leg);legs.push(leg);const arm=new T.Group();arm.position.set(a*.46,1.58,0);group.add(arm);box(.2,.55,.23,shirt,0,-.22,0,arm);mesh(new T.SphereGeometry(.13,6,5),skin,0,-.55,0,arm);arms.push(arm);}
    const shadow=new T.Mesh(new T.CircleGeometry(.55,16),new T.MeshBasicMaterial({color:0x345432,transparent:true,opacity:.14,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.07;group.add(shadow);
    return { group, legs, arms, head };
  }
  const player=character(-43,38);
  const nur=character(-35,36,'nur');nur.group.rotation.y=-.7;
  const pak=character(12,-.5,'pak');pak.group.rotation.y=.2;
  const npcs=[{id:'nur',x:-35,z:36,character:nur},{id:'pak',x:12,z:-.5,character:pak}];
  character(37,19,'pak');character(1,-14,'nur');
  // Small overhead diamonds remain legible at the elevated gameplay angle.
  for(const npc of npcs){const marker=mesh(new T.OctahedronGeometry(.3,0),0xe4bc68,npc.x,3.1,npc.z);animated.push(marker);npc.marker=marker;}
  function canWalk(x,z){
    if(x < -78 || x > 76 || z < -66 || z > 66)return false;
    if(x > -70.3 && x < -59.8 && Math.abs(z-4)>4 && Math.abs(z-37)>4)return false;
    return !colliders.some(c=>Math.abs(x-c.x)<c.w/2+.48&&Math.abs(z-c.z)<c.d/2+.48);
  }
  function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
  resize();
  return {renderer,scene,camera,player,npcs,colliders,canWalk,resize,animated,sun,sign,updateSun: (x,z) => { sun.position.set(x-35,70,z+30); sun.target.position.set(x,0,z); sun.target.updateMatrixWorld(); },renameHomes: (name,friend) => homeSigns.forEach(s => s.update(s.friend ? friend : name))};
}

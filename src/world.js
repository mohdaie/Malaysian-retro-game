import * as T from 'three';
import { createCharacter } from './characters.js?v=0.5.0';
import { toon } from './illustration.js?v=0.5.0';
export const places = [
  { name: "Amir's house", x: -43, z: 27, type: 'home' },
  { name: 'Kampung Melati', x: -45, z: -20, type: 'kampung' },
  { name: 'SK Seri Kenangan', x: -3, z: -38, type: 'school' },
  { name: 'Pekan lama', x: 5, z: -23, type: 'shop' },
  { name: 'Warung Pak Mat', x: 12, z: -7, type: 'warung' },
  { name: 'Masjid Seri Kenangan', x: 47, z: -39, type: 'mosque' },
  { name: 'Stesen bas', x: 54, z: 4, type: 'bus' },
  { name: 'Tapak pasar malam', x: 36, z: 29, type: 'market' },
  { name: "Nur's terrace", x: -4, z: 48, type: 'terrace' }
];
export async function makeWorld(canvas) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(0xc8dce0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.NoToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new T.Scene();
  scene.background = new T.Color(0xc8dce0);
  scene.fog = new T.Fog(0xc8dce0, 95, 230);
  const camera = new T.PerspectiveCamera(43, 1, .1, 350);
  scene.add(new T.HemisphereLight(0xe5f3ff, 0x9bb7a5, 1.65));
  const sun = new T.DirectionalLight(0xffedda, 1.30);
  sun.position.set(-35, 70, 30);
  sun.castShadow = true;
  const shadowSize = matchMedia('(pointer:coarse)').matches ? 1024 : 2048;
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
    const ctx = c.getContext('2d'); ctx.fillStyle = kind === 'grass' ? '#becf88' : kind === 'dirt' ? '#efd6ac' : kind==='asphalt' ? '#8eaaaa' : '#f4efe4'; ctx.fillRect(0,0,256,256);
    for(let i=0;i<1000;i++) { const a=rand()*.035; ctx.fillStyle=rand()>.5?`rgba(55,67,38,${a})`:`rgba(255,252,222,${a})`; ctx.fillRect(rand()*256,rand()*256,kind==='wood'?rand()*30+4:rand()*5+1,kind==='wood'?.7:rand()*3+1); }
    if(kind==='wood') for(let y=0;y<256;y+=32){ctx.fillStyle='#67533935';ctx.fillRect(0,y,256,1);ctx.fillStyle='#ffffff35';ctx.fillRect(0,y+2,256,1);}
    if(kind==='grass') for(let i=0;i<180;i++){ctx.strokeStyle=rand()>.5?'#77946365':'#e0e9b675';const x=rand()*256,y=rand()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*5-2,y-3-rand()*3);ctx.stroke();}
    if(kind==='asphalt')for(let i=0;i<900;i++){ctx.fillStyle=i%2?'#ffffff25':'#253b3925';ctx.fillRect(rand()*256,rand()*256,1,1);}
    if(kind==='tile'){ctx.fillStyle='#e9d8c3';ctx.fillRect(0,0,256,256);for(let row=0;row<12;row++)for(let col=0;col<20;col++){const x=col*14-(row%2)*7,y=row*23;ctx.fillStyle=(row+col)%3?'#e8c5a1':'#d4a480';ctx.fillRect(x,y,13,22);ctx.strokeStyle='#71544d80';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+2,y);ctx.quadraticCurveTo(x+6,y+11,x+2,y+22);ctx.stroke();ctx.strokeRect(x,y,13,22);}}
    if(kind==='plaster')for(let i=0;i<3000;i++){ctx.fillStyle=i%2?'#ffffff30':'#afa99a20';ctx.fillRect(rand()*256,rand()*256,1+rand()*3,1);}
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace; texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.anisotropy = Math.min(8,renderer.capabilities.getMaxAnisotropy());
    texture.repeat.set(kind==='wood'?1:24,kind==='wood'?1:24); return texture;
  }
  const loader=new T.TextureLoader();
  const [grass,wood]=await Promise.all(['kampung-grass.webp','kampung-timber.webp'].map(name=>loader.loadAsync(new URL('../assets/textures/'+name,import.meta.url).href)));
  for(const texture of [grass,wood]){texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
  wood.repeat.set(2,2);
  const textures = {grass:surface('grass'), dirt:surface('dirt'), wood, asphalt:surface('asphalt'), plaster:surface('plaster'), tile:surface('tile')};
  textures.dirt.repeat.set(1,1);textures.asphalt.repeat.set(1,1);textures.plaster.repeat.set(2,2);textures.tile.repeat.set(1,1);
  // Illustrated distant scenery wraps the playable 3D streets: flat painted
  // houses/trees/hills carry the horizon instead of additional modeled town.
  const panorama=await loader.loadAsync(new URL('../assets/textures/illustrated-horizon.webp',import.meta.url).href);
  panorama.colorSpace=T.SRGBColorSpace;panorama.wrapS=T.RepeatWrapping;panorama.repeat.x=3;
  scene.background=new T.Color(0x8ab8d1);
  const horizon=new T.Mesh(new T.CylinderGeometry(210,210,160,64,1,true),new T.MeshBasicMaterial({map:panorama,side:T.BackSide,fog:false}));
  horizon.position.y=54;scene.add(horizon);
  const mats = new Map();
  function textured(color,kind) {
    const key=kind+color;
    if(!mats.has(key)){
      const material=toon(kind==='wood'?new T.Color(color).lerp(new T.Color(0xffffff),.40):color,{map:textures[kind]});

      mats.set(key,material);
    }
    return mats.get(key);
  }
  const scenePalette=[0x755d42,0xb5986a,0xe8dbb8,0xcbbd99,0xb3bca6,0x8a946f,0x677b69,0x4e6b62,0x344e42,0x5b8353,0x749458,0xab6046,0xbf815e,0xb28272,0xd4b24b,0xf4e9d0,0x414b3f];
  const mat = color => {
    if (color?.isMaterial) return color;
    const rgb=new T.Color(color);let closest=color,best=Infinity;
    for(const candidate of scenePalette){const c=new T.Color(candidate),distance=(rgb.r-c.r)**2+(rgb.g-c.g)**2+(rgb.b-c.b)**2;if(distance<best){best=distance;closest=candidate;}}color=closest;
    if (!mats.has(color)) mats.set(color, toon(color));
    return mats.get(color);
  };
  const colliders = [];
  const animated = [];
  const homeSigns = [];
  function mesh(geometry, color, x, y, z, parent = scene) {
    const m = new T.Mesh(geometry, mat(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function box(w, h, d, color, x, y, z, parent) {
    const geometry=new T.BoxGeometry(w,h,d);
    if(color?.isMaterial&&[textures.grass,textures.dirt,textures.asphalt].includes(color.map)){
      const pos=geometry.attributes.position,uv=geometry.attributes.uv;
      for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+x)/6,(pos.getZ(i)+z)/6);
    }
    const object=mesh(geometry,color,x,y,z,parent);if(h>=2.7&&w>=5&&d>=4)object.userData.cameraOccluder=true;return object;
  }
  function beam(a,b,r,color,parent=scene){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const m=mesh(new T.CylinderGeometry(r,r*.85,delta.length(),6),color,...start.clone().add(end).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
  function softBox(w,h,d,color,x,y,z,parent,r=.12){
    r=Math.min(r,w/3,h/3,d/3);const g=new T.BoxGeometry(w,h,d,4,4,4),p=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<p.count;i++){
      const v=new T.Vector3(p.getX(i),p.getY(i),p.getZ(i)),core=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r)),normal=v.clone().sub(core).normalize();v.copy(core).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);
    }
    const object=mesh(g,color,x,y,z,parent);if(h>=2.5&&w>=2.5&&d>=4)object.userData.cameraOccluder=true;return object;
  }
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
  const glass=toon(0x75a6aa);mats.set('window-glass',glass);
  function windowDetail(x,y,z,w=1.6,h=1.5){
    box(w,h,.05,glass,x,y,z);
    for(const side of [-1,1])box(.085,h+.18,.12,0xece1c4,x+side*(w/2+.03),y,z+.04);
    for(const side of [-1,1])box(w+.2,.085,.12,0xece1c4,x,y+side*(h/2+.04),z+.04);
    box(.045,h,.08,0xc2c8b2,x,y,z+.045);box(w,.045,.08,0xc2c8b2,x,y,z+.045);
    const glint=box(w*.4,.035,.015,0xa3bdc2,x-w*.12,y+h*.26,z+.075);glint.rotation.z=.1;
  }
  function malaysianFlag(x,y,z,width=1.5){
    const c=document.createElement('canvas');c.width=280;c.height=140;const ctx=c.getContext('2d');
    for(let i=0;i<14;i++){ctx.fillStyle=i%2?'#f4eee0':'#b9443d';ctx.fillRect(0,i*10,280,10);}
    ctx.fillStyle='#28446a';ctx.fillRect(0,0,140,80);ctx.fillStyle='#f0c85b';ctx.beginPath();ctx.arc(45,40,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#28446a';ctx.beginPath();ctx.arc(53,36,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0c85b';ctx.beginPath();for(let i=0;i<28;i++){const a=i*Math.PI/14-Math.PI/2,r=i%2?11:22;const px=100+Math.cos(a)*r,py=40+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const cloth=toon(0xffffff,{map:texture,side:T.DoubleSide});mats.set('flag'+x+z,cloth);
    const g=new T.PlaneGeometry(width,width/2,12,2),pos=g.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin((pos.getX(i)+width/2)*5)*.055);g.computeVertexNormals();return mesh(g,cloth,x,y,z);
  }
  function roof(w, d, x, y, z, color, parent = scene) {
    // Long pitched roof with a horizontal ridge along X.
    const vertices = new Float32Array([-w/2,0,-d/2,w/2,0,-d/2,-w/2,2,0,w/2,2,0,-w/2,0,d/2,w/2,0,d/2]);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(vertices, 3));
    g.setIndex([0,2,1,1,2,3,2,4,3,3,4,5,0,4,2,1,3,5,0,1,4,1,5,4]);g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,.5,1,.5,0,1,1,1],2));
    const flat = g.toNonIndexed(); flat.computeVertexNormals(); g.dispose();
    const m=mesh(flat,textured(color,'tile'),x,y,z,parent);m.userData.cameraOccluder=true;
    const ridge=cylinder(.095,.095,w+.15,color,x,y+2.02,z,parent,8);ridge.rotation.z=Math.PI/2;
    for(const side of [-1,1]){beam([x-w/2,y,z+side*d/2],[x-w/2,y+2,z],.075,0xe0c493,parent);beam([x+w/2,y,z+side*d/2],[x+w/2,y+2,z],.075,0xe0c493,parent);}
    return m;
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
    // Carved eave trim, side windows, warm ceramic stair tiles and doorstep props.
    for(let i=0;i<Math.floor(w/.45);i++){
      const xx=x-w/2+.2+i*.45;box(.065,.27,.07,0xdcc393,xx,floor+2.9,z+d/2+2.35);
      const trim=mesh(new T.SphereGeometry(.07,6,5),0xdcc393,xx,floor+2.76,z+d/2+2.35);trim.scale.y=.65;
    }
    for(const a of [-1,1]){
      const side=new T.Group();side.position.set(x+a*(w/2+.07),floor+2,z);side.rotation.y=a*Math.PI/2;scene.add(side);
      box(2,1.6,.055,glass,0,0,0,side);for(const b of [-1,1])box(.08,1.75,.1,0xe4cba0,b*1.04,0,.04,side);box(2.16,.09,.14,0xe4cba0,0,.86,.04,side);box(2.16,.09,.14,0xe4cba0,0,-.86,.04,side);box(.075,1.6,.09,0xe4cba0,0,0,.055,side);
    }
    if(label==='RUMAH AMIR'){
      for(let row=0;row<4;row++)for(let col=0;col<7;col++){
        box(.265,.025,.48,[0x9faaa0,0xddd0af,0x956a51][(row+col)%3],x-.84+col*.28,.27+row*.28,z+d/2+3.1-row*.6);
      }
      box(.7,.035,.43,0x6d785a,x,floor+.17,z+d/2+.5);
      for(const a of [-1,1])softBox(.17,.07,.3,0x405b58,x+a*.18,floor+.19,z+d/2+.9,undefined,.04);
      cylinder(.05,.05,2.5,0xbda78d,x-1.8,floor+1.7,z+d/2+1.85);malaysianFlag(x-1.45,floor+2.5,z+d/2+1.85,.7);
    }
    if(label) sign(label,x,floor+3.3,z+d/2+2.2,4);
    collider(x,z,w+1,d+1);
  }
  function palm(x,z,size=1) {
    cylinder(.18*size,.34*size,7*size,0x88734f,x,3.5*size,z);
    for(let i=1;i<7;i++)cylinder(.22*size,.22*size,.06,0x6d6044,x,i*size,z);
    const leafMaterialKey='palm-leaf';
    if(!mats.has(leafMaterialKey))mats.set(leafMaterialKey,toon(0x4e7946,{side:T.DoubleSide}));
    for(let a=0;a<8;a++) {
      const vertices=[],indices=[];
      function point(t){return [t*4.7*size,(Math.sin(t*Math.PI)*.8-t*t*1.5)*size,0];}
      for(let i=0;i<13;i++)for(const side of [-1,1]){
        const t=.08+i*.068,[px,py]=point(t),reach=Math.sin(t*Math.PI)*.95*size,idx=vertices.length/3;
        vertices.push(px,py,0,px+.6*size,py-.15*size,side*reach,px+.16*size,py+.025*size,side*.025*size);indices.push(idx,idx+1,idx+2);
      }
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
      const leaf=mesh(g,mats.get(leafMaterialKey),x,7*size,z);leaf.rotation.y=a*Math.PI/4;
      const curve=new T.CatmullRomCurve3([0,.25,.5,.75,1].map(t=>new T.Vector3(...point(t))));const spine=mesh(new T.TubeGeometry(curve,8,.025*size,3,false),0x6d8b4e,x,7*size,z);spine.rotation.y=leaf.rotation.y;
    }
    for(let a=0;a<3;a++)mesh(new T.SphereGeometry(.25*size,8,6),0x726044,x+.35*Math.sin(a*2),6.75*size,z+.35*Math.cos(a*2));
  }
  function tree(x,z,size=1,detail=2) {
    cylinder(.16*size,.32*size,3.6*size,0x755d42,x,1.8*size,z,undefined,9);
    for(let i=0;i<9;i++){
      const angle=i*2.399,spread=i<3?.7:1.65,px=x+Math.sin(angle)*spread*size,pz=z+Math.cos(angle)*spread*size,py=(3.7+Math.sin(i*1.8)*.55)*size;
      if(i<4)beam([x,2.5*size,z],[px,py,pz],.095*size,0x755d42);
      const crown=mesh(new T.IcosahedronGeometry((i<3?1.45:1.17)*size,detail),[0x588352,0x6a9257,0x749b5c][i%3],px,py,pz);crown.scale.y=.83;crown.userData.cameraOccluder=true;
    }
  }
  function fence(x,z,length,axis='x') {
    for(let i=0;i<=length;i+=1.6){const px=x+(axis==='x'?i:0),pz=z+(axis==='z'?i:0);box(.12,1.3,.12,0xd4c6a0,px,.65,pz);}
    for(const y of [.35,.95]) box(axis==='x'?length:.1,.12,axis==='z'?length:.1,0xd4c6a0,x+(axis==='x'?length/2:0),y,z+(axis==='z'?length/2:0));
  }
  // Ground, roads and a narrow river divide the older kampung from the pekan.
  box(180,.6,160,textured(0xffffff,'grass'),0,-.35,0);
  box(150,.08,8,textured(0xffffff,'asphalt'),0,.015,4);
  box(7,.08,132,textured(0xffffff,'asphalt'),-25,.02,0);
  box(5,.06,62,textured(0xffffff,'dirt'),-42,.04,24);
  box(90,.06,4,textured(0xffffff,'dirt'),4,.035,37);
  box(7,.08,100,textured(0xffffff,'asphalt'),62,.02,0);
  for(let x=-72;x<74;x+=8)box(3,.02,.16,0xd6d1a9,x,.07,4);
  for(let z=-62;z<68;z+=8)box(.16,.02,3,0xd6d1a9,-25,.075,z);
  box(8,.1,155,0x71958a,-65,-.02,0);
  box(1,.1,155,0x799365,-70,.015,0);box(1,.1,155,0x799365,-60,.015,0);
  for(const z of [4,37]) {box(13,.2,8,0xbcac8b,-65,.13,z);for(const s of [-1,1]){box(13,.13,.15,0xe4d0a6,-65,1.1,z+s*3.7);for(let x=-71;x<=-59;x+=2)box(.15,1.15,.15,0xe4d0a6,x,.6,z+s*3.7);}}
  for(const side of [-1,1]){
    for(let zz=-64;zz<65;zz+=4){if(Math.abs(zz-4)<6||Math.abs(zz-37)<5)continue;box(.32,.16,3.85,0xc9cbb3,-25+side*3.7,.1,zz);box(.28,.035,3.85,0x687c6c,-25+side*4.0,.03,zz);}
    for(let xx=-59;xx<72;xx+=5){if(Math.abs(xx+25)<5||Math.abs(xx-62)<5)continue;box(4.8,.12,.27,0xc7cbb6,xx,.09,4+side*4.2);}
  }
  // Kampung houses inspired by Melaka timber homes, including Amir's verandah.
  house(-43,27,0xc7ad75,10,8,'RUMAH AMIR');
  house(-44,-18,0xa8b4a0,9,7);house(-45,-41,0xe0c39b,10,7);house(-76,24,0xadc0a1,9,8);house(-44,56,0xc9bd92,9,7);
  fence(-53,20,20);fence(-53,20,21,'z');fence(-53,41,7);fence(-38,41,5);
  palm(-53,31,1.2);palm(-34,22,.9);tree(-55,45);tree(-37,-26);palm(-53,-44,1.2);
  // A full old SK classroom block and side wing, with a broad assembly
  // court. Its western edge clears the main road instead of blocking it.
  box(38,4.2,10,textured(0xe7d8ad,'plaster'),-3,2.2,-50);roof(40,12,-3,4.35,-50,0x9e5544);
  box(40,.2,3.5,0xc8bc94,-3,.12,-43.5);box(40,.18,3.8,0xad6650,-3,3.7,-43.4);
  for(let x=-19;x<=16;x+=5){
    windowDetail(x,2.35,-44.91,2.25,1.45);box(.18,3.6,.18,0xf1e4bd,x,1.9,-41.75);
    if(x<16){box(.92,2.35,.08,0x687a62,x+1.65,1.3,-44.86);box(.04,.1,.06,0xd5bd77,x+1.98,1.3,-44.79);}
  }
  box(9,4.2,20,textured(0xe7d8ad,'plaster'),22,2.2,-49);roof(10.5,22,22,4.35,-49,0x9e5544);
  for(let z=-55;z<=-40;z+=5){const window=new T.Group();window.position.set(17.45,2.35,z);window.rotation.y=-Math.PI/2;scene.add(window);box(2.3,1.4,.08,glass,0,0,0,window);for(const a of [-1,1])box(.08,1.6,.12,0xe8dbb8,a*1.19,0,.02,window);}
  box(31,.04,9,0xc4bc8f,-3,.10,-36);
  for(const x of [-19,13])box(.3,3.0,.3,0xe8dbb8,x,1.5,-31.7);
  sign('SEKOLAH KEBANGSAAN',-3,3.15,-31.5,12);
  cylinder(.06,.06,8,0xc7c7b3,4,4,-35);malaysianFlag(4.75,7.3,-35);
  collider(-3,-50,38,10);collider(22,-49,9,20);
  fence(-23,-61,51);fence(-23,-61,30,'z');fence(28,-61,30,'z');
  // Old-town shophouses: five-foot walkways, pastel walls, timber shutters.
  const shopColors=[0xd8b98c,0xb6c7ad,0xdcb995,0xaac0b6,0xe0cda4];
  const shopNames=['KEDAI RUNCIT','KEDAI KOPI','KEDAI BASIKAL','FOTO KENANGAN','KEDAI JAHIT'];
  for(let i=0;i<5;i++){
    const x=-10+i*9;
    box(8.8,7.3,10,textured(shopColors[i],'plaster'),x,3.7,-24);roof(9.2,11,x,7.4,-24,0x8d6151);
    for(const a of [-1,1]){box(1.7,2,.15,0x536d61,x+a*2.4,5.5,-18.93);box(.13,2.1,.18,0xe7d8b4,x+a*2.4,5.5,-18.82);}
    box(7.8,2.4,.15,0x7b7156,x,1.3,-18.93);box(9,.22,2.6,0xd6c4a0,x,.15,-17.4);box(9,.22,2.7,shopColors[i],x,3.2,-17.4);
    for(const a of [-1,1])box(.22,3,.22,0xeee0b9,x+a*4.15,1.5,-16.3);
    sign(shopNames[i],x,2.6,-16,7);collider(x,-24,8.8,10);
    for(const a of [-1,1]){windowDetail(x+a*2.4,5.5,-18.75,1.7,2);for(let l=0;l<8;l++)box(.65,.035,.08,0x3f6856,x+a*2.4-.3,4.65+l*.23,-18.64);}
    box(8.8,.15,.3,0xeee2c7,x,7.12,-18.88);box(8.8,.15,.4,0xeee2c7,x,3.67,-18.85);
    for(let col=0;col<14;col++)for(let row=0;row<3;row++)box(.6,.02,.62,(col+row)%2?0xb7baa5:0xdbceb4,x-4.05+col*.62,.275,-18.04+row*.65);
    for(let slat=0;slat<20;slat++)box(.025,2.3,.025,0x4f5d4e,x-3.7+slat*.39,1.35,-18.81);
    for(let stripe=0;stripe<12;stripe++){const awning=box(.71,.045,1.4,stripe%2?0xe9dfc1:shopColors[i],x-3.93+stripe*.715,3.04,-16.35);awning.rotation.x=-.1;box(.7,.28,.04,stripe%2?0xe9dfc1:shopColors[i],x-3.93+stripe*.715,2.83,-15.64);}
    if(i===0){for(let j=0;j<3;j++)box(.65,.6,.65,0x9e7954,x-2+j*.72,.5,-16.25);}
    if(i===1){softBox(.7,.95,.08,0x34584b,x+2.7,.8,-16,undefined,.07);sign('KOPI · TEH',x+2.7,.8,-15.94,.65);}

  }
  // Warung has an open social space facing the lane.
  box(11,.25,6.5,0xcbbb96,12,.14,-6.5);box(11,2.8,.3,0xd4c597,12,1.5,-9.65);
  for(const x of [6.7,17.3])for(const z of [-9,-3.5])cylinder(.13,.13,3.3,0x766746,x,1.7,z);
  roof(12.5,8.4,12,3.4,-6.5,0x657d6d);sign('WARUNG PAK MAT',12,2.8,-2.1,8);
  box(6,.75,1,0x776548,12,.6,-8.7);box(6,.08,1.2,0xb0a285,12,1.02,-8.7);
  for(const x of [8.5,15.5]){cylinder(1.1,1.1,.15,0x8f7350,x,.95,-5.8);cylinder(.1,.2,.8,0x6e6247,x,.5,-5.8);for(const a of [-1,1]){box(1,.16,.65,0xd0b98a,x+a*1.5,.55,-5.8);box(.15,.5,.15,0x665a42,x+a*1.5,.25,-5.8);}}
  box(1.5,.12,.5,0x845634,15.5,1.08,-5.8);collider(12,-9.65,11,.5);collider(8.5,-5.8,2,2);collider(15.5,-5.8,2,2);
  // Tea glasses, enamel plates, a serving counter and the actual congkak shape.
  for(const xx of [8.5,15.5]){
    for(const a of [-1,1]){cylinder(.13,.11,.28,0xc98f53,xx+a*.45,1.165,-5.65,undefined,12);const rim=mesh(new T.TorusGeometry(.13,.013,4,16),0xeee2cb,xx+a*.45,1.31,-5.65);rim.rotation.x=Math.PI/2;const handle=mesh(new T.TorusGeometry(.085,.017,4,12),0xceb79b,xx+a*.45+.15,1.18,-5.65);handle.scale.x=.7;}
    const plate=cylinder(.3,.29,.035,0xeee5ca,xx,.995,-6.16,undefined,20);cylinder(.14,.17,.12,0xb0793f,xx,1.07,-6.16,undefined,10);
    for(const a of [-1,1])for(const zz of [-5.8]){box(.07,.7,.65,0x796449,xx+a*1.94,.92,zz);box(.07,.18,.65,0xa08a63,xx+a*1.94,1.18,zz);}
  }
  const board=softBox(1.7,.13,.53,0x94613f,15.5,1.075,-5.65,undefined,.15);
  for(let row=0;row<2;row++)for(let pit=0;pit<7;pit++){const hole=mesh(new T.TorusGeometry(.059,.015,5,12),0x69482f,14.91+pit*.195,1.147,-5.8+row*.25);hole.rotation.x=Math.PI/2;cylinder(.044,.044,.005,0x513a29,14.91+pit*.195,1.151,-5.8+row*.25,undefined,10);}
  for(const a of [-1,1]){const store=mesh(new T.TorusGeometry(.085,.018,5,14),0x654328,15.5+a*.76,1.147,-5.675);store.rotation.x=Math.PI/2;}
  for(let i=0;i<4;i++){cylinder(.3,.27,.6,0x839987,10.2+i*.85,1.35,-8.7,undefined,12);cylinder(.33,.33,.035,0xc4c7b3,10.2+i*.85,1.67,-8.7,undefined,12);}
  softBox(.65,1.0,.35,0x667d6e,17.5,.65,-8.2,undefined,.06);sign('TEH TARIK · RM1',12,2.04,-9.44,3.2);
  // Mosque: yellow dome and slender minaret, inspired by Kuala Kangsar.
  box(19,.18,19,0xdbd2b4,48,.12,-39);box(12,5.5,11,textured(0xf0dfad,'plaster'),48,2.85,-39);
  box(13.3,.35,12.3,0xe9d9ac,48,5.6,-39);
  mesh(new T.SphereGeometry(4,20,12,0,Math.PI*2,0,Math.PI/2),0xd4b24b,48,5.85,-39);
  cylinder(.7,.7,.6,0xe9cb68,48,9.8,-39);cylinder(.05,.05,1.6,0xb39442,48,10.7,-39);
  for(const x of [44,48,52]){box(1.6,3,.13,0x477163,x,1.9,-33.4);mesh(new T.SphereGeometry(.8,12,8,0,Math.PI,0,Math.PI),0x477163,x,3.3,-33.35).scale.z=.1;}
  cylinder(1.2,1.6,11,0xefddaf,58,5.6,-44,undefined,12);cylinder(1.8,1.8,.45,0xd2bd81,58,10.5,-44,undefined,12);mesh(new T.SphereGeometry(1.5,12,8,0,Math.PI*2,0,Math.PI/2),0xd3b450,58,11,-44);
  sign('MASJID SERI KENANGAN',48,3.8,-33.2,9);collider(48,-39,13,12);collider(58,-44,3.5,3.5);
  for(const xx of [42.1,44,48,52,53.9]){cylinder(.09,.12,3.8,0xe9dbbb,xx,1.95,-33.15);cylinder(.17,.17,.16,0xc9ae6f,xx,3.72,-33.15,undefined,12);}
  for(const zz of [-43,-39,-35]){box(.05,2.5,1.3,glass,54.03,2.6,zz);box(.08,.1,1.5,0xe3cfa1,54.07,3.9,zz);}
  for(let i=0;i<12;i++)box(.3,.1,.3,0xc6b180,43.4+i*.84,5.83,-32.8);
  palm(36,-45,1.1);palm(58,-29,1.1);tree(37,-30);
  // Low-budget terrace homes, Nur's house sits beside the main footpath.
  for(let i=0;i<5;i++){
    const x=-14+i*7;
    box(6.8,3.4,7,textured([0xd7d6b0,0xd6bca4,0xa5b8b0,0xdcc7a3,0xc6c7a6][i],'plaster'),x,1.8,48);roof(7.1,8,x,3.6,48,0x98705e);
    box(1.3,2.6,.12,0x796956,x+.9,1.5,44.45);box(1.9,1.4,.12,0x5d7d72,x-1.6,2,44.43);
    box(6.8,.1,5,0xd3c9a9,x,.1,41.8);fence(x-3.4,39.5,6.8);collider(x,48,6.8,7);
    windowDetail(x-1.6,2,44.33,1.9,1.4);box(6.8,.12,.2,0xe6dcca,x,3.3,44.4);box(.06,.06,.055,0xc3a967,x+1.39,1.4,44.35);for(let slit=0;slit<6;slit++)box(.15,.14,.06,0x6e8371,x-2.9+slit*.44,2.95,44.38);if(i===1)sign('RUMAH NUR',x,3.1,44.3,3.8);
  }
  // Retro local bus station and an unmistakably boxy 90s bus.
  box(13,.15,9,0xd1c6a3,52,.1,-6);for(const x of [46,52,58])box(.2,3,.2,0x747d66,x,1.6,-7);box(14,.3,10,0x81947a,52,3.3,-6);sign('STESEN BAS',52,2.7,-.9,7);
  const bus=new T.Group();scene.add(bus);bus.position.set(53,0,8);
  softBox(4,3.1,10,0xe7dbc0,0,2.1,0,bus,.2);box(4.05,.8,10.1,0x527f6a,0,1.4,0,bus);box(3.6,1.2,.12,0x6a9189,0,2.9,5.07,bus);
  for(const side of [-1,1])for(let z=-3.2;z<=3.3;z+=2.1)box(.1,1.1,1.6,0x6a9189,side*2.05,2.9,z,bus);
  for(const side of [-1,1])for(const z of [-3.4,3.4]){const wheel=cylinder(.65,.65,.3,0x424741,side*2,.7,z,bus,12);wheel.rotation.z=Math.PI/2;}
  for(const side of [-1,1]){softBox(.65,.28,.08,0xf2e4b9,side*1.38,1.35,5.085,bus,.035);softBox(.4,.2,.08,0xb36b44,side*1.65,1.1,5.09,bus,.04);for(const zz of [-3.4,3.4]){const hub=cylinder(.34,.34,.33,0xb9bfaf,side*2.015,.7,zz,bus,12);hub.rotation.z=Math.PI/2;}}
  box(3.7,.15,.16,0x748778,0,.92,5.13,bus);box(1.45,.42,.1,0x485f55,0,1.3,5.08,bus);for(let slot=0;slot<4;slot++)box(1.25,.035,.03,0xbfc7b6,0,1.16+slot*.09,5.145,bus);
  sign('BAS PEKAN · 01',0,3.43,5.12,3.2,'#2c4d40',bus);collider(53,8,5,11);
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
  function bicycle(x,z){
    for(const dx of [-.7,.7]){
      mesh(new T.TorusGeometry(.5,.045,6,24),0x354238,x+dx,.56,z);mesh(new T.TorusGeometry(.46,.014,4,24),0xb9b9a0,x+dx,.56,z);
      for(let spoke=0;spoke<8;spoke++){const angle=spoke*Math.PI/4;beam([x+dx,.56,z],[x+dx+Math.sin(angle)*.45,.56+Math.cos(angle)*.45,z],.008,0xc5c5ac);}
      cylinder(.06,.06,.15,0x807966,x+dx,.56,z).rotation.x=Math.PI/2;
    }
    const a=[x-.7,.56,z],b=[x-.1,.66,z],c=[x-.3,1.25,z],d=[x+.4,1.22,z],e=[x+.7,.56,z];
    for(const pair of [[a,b],[b,c],[c,a],[b,d],[c,d],[d,e]])beam(...pair,.032,0xa66047);
    beam([x-.33,1.38,z],c,.027,0x807966);softBox(.33,.075,.21,0x443e32,x-.32,1.4,z,undefined,.035);
    beam(d,[x+.32,1.48,z],.028,0x807966);beam([x+.32,1.48,z-.21],[x+.32,1.48,z+.21],.025,0x807966);
    for(const side of [-1,1])box(.16,.04,.08,0x56584a,x-.1,.64,z+side*.16);
  }
  bicycle(-34,33);bicycle(10,-15);
  const car=new T.Group();car.position.set(-13,0,11);scene.add(car);
  softBox(2.8,.85,5.25,0xc6d2bd,0,.97,0,car,.22);softBox(2.48,.84,2.65,0xc6d2bd,0,1.69,-.16,car,.18);
  softBox(2.2,.64,.06,glass,0,1.74,1.17,car,.045);softBox(2.2,.58,.06,glass,0,1.73,-1.51,car,.04);
  for(const side of [-1,1]){
    softBox(.05,.57,2.05,glass,side*1.26,1.75,-.15,car,.016);box(.07,.61,.08,0xa0b49e,side*1.29,1.76,-.1,car);
    softBox(.22,.15,.26,0xa1b39c,side*1.48,1.65,.89,car,.045);
    box(.25,.035,.04,0x687b6a,side*1.39,1.3,.12,car);
    for(const zz of [-1.6,1.6]){const wheel=cylinder(.43,.43,.3,0x343e36,side*1.39,.57,zz,car,20);wheel.rotation.z=Math.PI/2;const hub=cylinder(.25,.25,.31,0xa6b1a4,side*1.4,.57,zz,car,12);hub.rotation.z=Math.PI/2;}
    softBox(.68,.25,.055,0xf6e2b1,side*.86,1.02,2.645,car,.045);softBox(.55,.2,.055,0x9e4f40,side*.88,1.02,-2.645,car,.035);
  }
  box(1.03,.25,.06,0x4c5e51,0,.86,2.65,car);box(2.6,.12,.11,0x6b7d6d,0,.62,2.67,car);box(.6,.17,.055,0x2f3f35,0,.7,2.735,car);collider(-13,11,3.3,6);

  for(let i=0;i<42;i++){
    const x=-76+((i*37)%152),z=-66+((i*29)%130);
    if(x>-24&&x<29&&z<-30)continue;
    if((Math.abs(x+25)<8)||(Math.abs(z-4)<10)||(Math.abs(x-62)<8)||colliders.some(c=>Math.abs(x-c.x)<c.w/2+4&&Math.abs(z-c.z)<c.d/2+4))continue;
    if(i%3===0)palm(x,z,.75+(i%4)*.15);else tree(x,z,.65+(i%3)*.2,1);
  }
  for(let i=0;i<13;i++){const hill=mesh(new T.IcosahedronGeometry(20+(i%3)*8,3),i%2?0x839d75:0x9bb087,-110+i*18,-3,-92-Math.sin(i)*12);hill.scale.y=.7;}
  // Verges, potted plants, laundry and roadside details soften the greybox layout.
  function pot(x,z,y=0) {
    cylinder(.28,.2,.48,0xa57454,x,y+.24,z,undefined,10);cylinder(.31,.31,.07,0xbc9068,x,y+.48,z,undefined,10);
    for(let a=0;a<4;a++){const leaf=mesh(new T.SphereGeometry(.3,6,4),0x62834f,x+Math.sin(a*1.57)*.13,y+.78,z+Math.cos(a*1.57)*.13);leaf.scale.set(.45,1.25,.45);}
  }
  for(const xx of [-47,-39])for(let i=0;i<5;i++){const zz=32.7+Math.sin(i*2.4)*.12,px=xx+Math.cos(i*2.4)*.16;cylinder(.015,.018,.55,0x667e47,px,2.42,zz);for(let petal=0;petal<5;petal++){const flower=mesh(new T.SphereGeometry(.065,6,5),0xc08178,px+Math.sin(petal*1.256)*.055,2.71,zz+Math.cos(petal*1.256)*.055);flower.scale.y=.4;}mesh(new T.SphereGeometry(.029,6,5),0xe5c775,px,2.73,zz);}
  pot(-47,32.7,1.55);pot(-39,32.7,1.55);pot(6,-3);pot(18,-3);pot(-12,-16);pot(5,-16);
  for(let i=0;i<450;i++) {
    const x=-78+rand()*155,z=-65+rand()*130;
    if(x>-24&&x<29&&z<-30)continue;
    if(Math.abs(z-4)<6||Math.abs(x+25)<5||Math.abs(x-62)<5||Math.abs(x+42)<3&&z>-9||Math.abs(z-37)<3||Math.abs(x+65)<7||colliders.some(c=>Math.abs(x-c.x)<c.w/2+2&&Math.abs(z-c.z)<c.d/2+2))continue;
    for(let a=0;a<3;a++){const blade=mesh(new T.ConeGeometry(.09,.35+rand()*.25,3),i%2?0x7f9959:0xa8ae67,x+a*.12,.25,z);blade.rotation.z=(a-1)*.25;}
  }
  // Transparent painted ground-cover patches layer over the lawn. They sit
  // below paths/roads, whose depth naturally masks foliage at their edges.
  const grassPatch=await loader.loadAsync(new URL('../assets/textures/illustrated-grass-patch.webp',import.meta.url).href);
  grassPatch.colorSpace=T.SRGBColorSpace;grassPatch.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const patchPositions=[[-49,35,6],[-48,39,5],[-37,30,4],[-35,40,5],[-50,23,5]];
  for(let i=0;i<270;i++){
    const x=-78+rand()*154,z=-66+rand()*132;
    if(Math.abs(z-4)<4||Math.abs(x+25)<3||Math.abs(x-62)<3||Math.abs(x+65)<5||colliders.some(c=>Math.abs(x-c.x)<c.w/2&&Math.abs(z-c.z)<c.d/2))continue;
    patchPositions.push([x,z,4+rand()*5]);
  }
  const patches=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:grassPatch,color:0xe8eecb,transparent:true,opacity:.75,alphaTest:.08,depthWrite:false}),patchPositions.length);
  const patchTransform=new T.Object3D();
  for(let i=0;i<patchPositions.length;i++){const [x,z,size]=patchPositions[i];patchTransform.position.set(x,-.038,z);patchTransform.rotation.set(-Math.PI/2,0,rand()*Math.PI*2);patchTransform.scale.set(size,size*(.8+rand()*.3),1);patchTransform.updateMatrix();patches.setMatrixAt(i,patchTransform.matrix);}
  patches.instanceMatrix.needsUpdate=true;patches.computeBoundingSphere();scene.add(patches);
  // Hanging laundry beside Amir's home, a familiar kampung afternoon detail.
  for(const x of [-54,-47])cylinder(.05,.05,2.5,0x8b7958,x,1.25,18);
  box(7,.025,.025,0xc3bd9d,-50.5,2.4,18);
  for(let i=0;i<4;i++)box(.85,1.0,.025,[0xd1c2a7,0x809eb0,0xb88461,0xbabf94][i],-53+i*1.6,1.8,18);
  // Batch geometry by material and 24-metre cells, so off-screen streets
  // can be culled without submitting the entire town on every frame.
  scene.updateMatrixWorld(true);
  const buckets = new Map();
  const cameraOccluders=[];
  const staticMaterials = new Set(mats.values());
  const staticMeshes = [];
  const townInk=new T.LineBasicMaterial({color:0x35353b,transparent:true,opacity:.62,depthWrite:false});
  const inkCells=new Map();
  scene.traverse(object => {
    if (object.isMesh && staticMaterials.has(object.material)) {
      const pos=new T.Vector3().setFromMatrixPosition(object.matrixWorld),key=object.material.uuid+':'+Math.floor(pos.x/24)+':'+Math.floor(pos.z/24)+':'+(object.userData.cameraOccluder?'solid':'detail');
      if (!buckets.has(key)) buckets.set(key,{material:object.material,geometries:[],occluder:object.userData.cameraOccluder===true});
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      geometry.applyMatrix4(object.matrixWorld);
      buckets.get(key).geometries.push(geometry);
      staticMeshes.push(object);
    }
  });
  for (const object of staticMeshes) { object.removeFromParent(); object.geometry.dispose(); }
  for (const {material,geometries,occluder} of buckets.values()) {
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
    const object = new T.Mesh(merged, occluder?material.clone():material);if(occluder){object.material.onBeforeCompile=material.onBeforeCompile;object.material.customProgramCacheKey=material.customProgramCacheKey;}if(occluder){object.material.transparent=true;cameraOccluders.push(object);}
    object.castShadow = true; object.receiveShadow = true; scene.add(object);
    if(![textures.grass,textures.dirt,textures.asphalt].includes(material.map)){
      const edges=new T.EdgesGeometry(merged,38);
      if(occluder){const lines=new T.LineSegments(edges,townInk.clone());scene.add(lines);object.userData.ink=lines;}
      else{const center=merged.boundingSphere.center,key=Math.floor(center.x/24)+':'+Math.floor(center.z/24);if(!inkCells.has(key))inkCells.set(key,[]);inkCells.get(key).push(edges);}
    }
  }
  for(const geometries of inkCells.values()){
    const size=geometries.reduce((n,g)=>n+g.attributes.position.array.length,0),positions=new Float32Array(size);let offset=0;
    for(const g of geometries){positions.set(g.attributes.position.array,offset);offset+=g.attributes.position.array.length;g.dispose();}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));g.computeBoundingSphere();scene.add(new T.LineSegments(g,townInk));
  }
  function groundHeight(x,z){
    if(x>-71.5&&x<-58.5&&(Math.abs(z-4)<4||Math.abs(z-37)<4))return .24;
    if(x>-23&&x<17&&z>-45.25&&z<-41.75)return .23;
    if(x>-18.5&&x<12.5&&z>-40.5&&z<-31.5)return .13;
    if(x>6.5&&x<17.5&&z>-9.75&&z<-3.25)return .275;
    if(x>-17.4&&x<17.4&&z>39.3&&z<44.3)return .16;
    if(Math.abs(z-4)<4||Math.abs(x+25)<3.5||Math.abs(x-62)<3.5)return .065;
    if(Math.abs(x+42)<2.5&&z>-7&&z<55)return .08;
    if(Math.abs(z-37)<2&&x>-41&&x<49)return .075;
    return -.025;
  }
  const characters=[];
  function character(x,z,kind='amir'){const model=createCharacter(scene,x,z,kind);model.group.position.y=groundHeight(x,z)-.065;characters.push(model);return model;}
  const player=character(-43,38);
  const nur=character(-35,36,'nur');nur.group.rotation.y=-.7;
  const pak=character(12,-.5,'pak');pak.group.rotation.y=.2;
  const npcs=[{id:'nur',x:-35,z:36,character:nur},{id:'pak',x:12,z:-.5,character:pak}];
  character(37,19,'pak');character(1,-14,'nur');
  // Small overhead diamonds remain legible at the elevated gameplay angle.
  for(const npc of npcs){const marker=mesh(new T.OctahedronGeometry(.17,0),0xe4bc68,npc.x,npc.character.group.position.y+npc.character.height+.44,npc.z);marker.userData.height=npc.character.group.position.y+npc.character.height+.44;animated.push(marker);npc.marker=marker;}
  const ray=new T.Raycaster(),blocked=new Set();let occlusionTime=0;
  function updateOcclusion(camera,look,dt,active){
    occlusionTime+=dt;
    if(occlusionTime>.15||!active){
      occlusionTime=0;blocked.clear();
      if(active){scene.updateMatrixWorld();const direction=camera.position.clone().sub(look);ray.set(look,direction.clone().normalize());ray.near=.2;ray.far=Math.max(.2,direction.length()-.5);for(const hit of ray.intersectObjects(cameraOccluders,false))blocked.add(hit.object);}
    }
    for(const object of cameraOccluders){object.material.opacity=T.MathUtils.lerp(object.material.opacity,blocked.has(object)?.17:1,1-Math.exp(-dt*9));object.material.depthWrite=object.material.opacity>.98;if(object.userData.ink){object.userData.ink.material.opacity=.62*object.material.opacity;object.userData.ink.visible=object.material.opacity>.3;}}
  }
  function canWalk(x,z){
    if(x < -78 || x > 76 || z < -66 || z > 66)return false;
    if(x > -70.3 && x < -59.8 && Math.abs(z-4)>4 && Math.abs(z-37)>4)return false;
    return !colliders.some(c=>Math.abs(x-c.x)<c.w/2+.48&&Math.abs(z-c.z)<c.d/2+.48);
  }
  function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
  resize();
  return {renderer,scene,camera,player,characters,npcs,colliders,groundHeight,updateOcclusion,occlusionCount:()=>blocked.size,canWalk,resize,animated,sun,sign,updateSun: (x,z) => { sun.position.set(x-35,70,z+30); sun.target.position.set(x,0,z); sun.target.updateMatrixWorld(); },renameHomes: (name,friend) => homeSigns.forEach(s => s.update(s.friend ? friend : name))};
}

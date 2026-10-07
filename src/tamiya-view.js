import * as T from 'three';
import { TAMIYA_CARS } from './tamiya-cars.js?v=2.7.1';
import { trackPoint, raceTrackPoint, racePlans, racerAt, TAMIYA_TRACKS } from './tamiya.js?v=2.7.1';
// Local low-poly track and cars. One small renderer is reused between races.
export function createTamiyaView(canvas) {
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(900,540,false);renderer.setClearColor('#c6d5ac');renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene(),camera=new T.OrthographicCamera(-17.6,17.6,10.56,-10.56,.1,100);camera.position.set(4,28,19);camera.lookAt(0,0,0);
  scene.add(new T.HemisphereLight('#fff3d3','#719278',2.6));const sun=new T.DirectionalLight('#fff3d7',2.4);sun.position.set(-8,18,10);scene.add(sun);
  const world=new T.Group();scene.add(world);let signature='',cars=[],track='oval',lastState=null,lastReduced=false,lost=false,size='';
  const material=colour=>new T.MeshToonMaterial({color:colour});
  function mesh(parent,geometry,colour,pos=[0,0,0],ink=true){const m=new T.Mesh(geometry,material(colour));m.position.set(...pos);parent.add(m);if(ink){const edges=new T.LineSegments(new T.EdgesGeometry(geometry,30),new T.LineBasicMaterial({color:'#292832'}));m.add(edges);}return m;}
  const box=(parent,w,h,d,colour,x=0,y=0,z=0)=>mesh(parent,new T.BoxGeometry(w,h,d),colour,[x,y,z]);
  function clear(){world.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});world.clear();cars=[];}
  function label(text,w,h){const c=document.createElement('canvas');c.width=512;c.height=128;const p=c.getContext('2d');p.fillStyle='#f9edcc';p.fillRect(0,0,512,128);p.strokeStyle='#292832';p.lineWidth=10;p.strokeRect(5,5,502,118);p.fillStyle='#292832';p.font='900 42px system-ui';p.textAlign='center';p.fillText(text,256,82);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx,side:T.DoubleSide}));}
  function ribbon(lane,colour){const positions=[],indices=[],N=240;
    for(let i=0;i<=N;i++)for(const side of [-.46,.46]){const p=raceTrackPoint(track,i/N,lane,0,side);positions.push(p.x,p.y+.12,p.z);}
    for(let i=0;i<N;i++){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const m=mesh(world,g,colour,[0,0,0],false);m.material.side=T.DoubleSide;
  }
  function rail(lane,side=0){const pts=Array.from({length:241},(_,i)=>{const p=track==='jaguh'?raceTrackPoint(track,i/240,lane,0,side):trackPoint(track,i/240,lane);return new T.Vector3(p.x,p.y+.29,p.z);}),curve=new T.CatmullRomCurve3(pts);
    mesh(world,new T.TubeGeometry(curve,240,.115,4,false),'#333943',[0,0,0],false);mesh(world,new T.TubeGeometry(curve,240,.073,4,false),'#efe9d4',[0,.035,0],false);
  }
  function car(id,key){const a=TAMIYA_CARS[id],g=new T.Group(),wheels=[];world.add(g);
    box(g,.66,.11,1.13,'#323542',0,.16);const wide=a.shape==='tank'?.66:.5,long=a.shape==='bullet'?1.12:.86;
    const body=box(g,wide,.17,long,a.colour,0,.28,.02);if(a.shape==='star'||a.shape==='emperor'){const wing=box(g,.65,.09,.34,a.accent,0,.28,.32);wing.rotation.y=.1;}
    box(g,.3,.17,.33,'#314e65',0,.43,-.01);box(g,.18,.075,.23,a.accent,0,.415,.36);
    box(g,a.shape==='tank'?.62:.85,.07,.15,a.accent,0,.47,-.46);
    for(const x of [-.39,.39])for(const z of [-.35,.38]){const wheel=mesh(g,new T.CylinderGeometry(.18,.18,.15,8),'#252633',[x,.18,z]);wheel.rotation.z=Math.PI/2;wheels.push(wheel);mesh(g,new T.CylinderGeometry(.09,.09,.16,8),a.accent,[x,.18,z]).rotation.z=Math.PI/2;}
    for(const z of [-.56,.56]){box(g,.98,.045,.06,'#343943',0,.22,z);for(const x of [-.46,.46])mesh(g,new T.CylinderGeometry(.09,.09,.065,8),'#dab85a',[x,.24,z]);}
    const badge=label(a.number,.29,.1);badge.rotation.x=-Math.PI/2;badge.position.set(0,.38,.26);g.add(badge);
    const marker=mesh(g,new T.ConeGeometry(.15,.24,4),key==='player'?'#e4b443':key==='faiz'?'#e6754d':'#ca79ad',[0,1.2,0]);marker.rotation.z=Math.PI;
    g.rotation.order='YXZ';return {group:g,wheels,key};
  }
  function build(s){clear();track=s.track;box(world,34,.12,20,'#dbc69a',0,-.17);box(world,34.3,.18,20.3,'#796b51',0,-.33);
    for(let lane=0;lane<3;lane++)ribbon(lane,['#9dc2c5','#cc7360','#8eaa89'][lane]);
    if(track==='jaguh')for(let lane=0;lane<3;lane++)for(const side of [-.5,.5])rail(lane,side);else for(let lane=-.5;lane<3;lane++)rail(lane);
    // Bridges carry supports; the elevated upper route crosses over the lower.
    if(track==='eight')for(const u of [.42,.58]){const p=trackPoint(track,u);for(const side of [-1,1])box(world,.22,p.y,.22,'#696c76',p.x+Math.cos(p.heading)*side*1.5,p.y/2,p.z-Math.sin(p.heading)*side*1.5);}
    box(world,2.1,.24,1.5,'#777360',-12,0,7);const pitSign=label('PIT',1.6,.55);pitSign.position.set(-12,1.3,7);world.add(pitSign);
    const start=trackPoint(track,0);const banner=label('JOM DASH! · 3 LAP',7,1.1);banner.position.set(-1,2,-8.4);world.add(banner);box(world,.15,2,.15,'#705b42',-4.4,1,-8.4);box(world,.15,2,.15,'#705b42',2.4,1,-8.4);
    const finish=new T.Group();finish.position.set(start.x,.15,start.z);finish.rotation.y=start.heading;world.add(finish);
    for(let x=0;x<6;x++)for(let z=0;z<2;z++)box(finish,.43,.025,.18,(x+z)%2?'#f8f0dd':'#292832',(x-2.5)*.43,.02,(z-.5)*.18);
    for(let i=0;i<8;i++){const x=-14+i*4;box(world,.6,.9,.55,i%2?'#c57956':'#659281',x,.38,9);mesh(world,new T.SphereGeometry(.25,6,4),'#c9946b',[x,1.09,9]);}
    for(const p of racePlans(s))cars.push(car(p.car,p.key));
  }
  function draw(s,reduced=false){lastState=s;lastReduced=reduced;if(lost)return;
    const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),dimensions=`${w}:${h}`;if(dimensions!==size){size=dimensions;renderer.setSize(w,h,false);camera.left=-10.56*w/h;camera.right=10.56*w/h;camera.updateProjectionMatrix();}
    const next=`${s.track}:${s.car}`;if(next!==signature){build(s);signature=next;}const plans=racePlans(s),racing=['race','result'].includes(s.phase);
    cars.forEach((c,i)=>{const r=racerAt(plans[i],racing?s.elapsed:0,s.track),u=racing?r.fraction:0,lap=Math.floor(r.distance/TAMIYA_TRACKS[s.track].length),p=raceTrackPoint(s.track,u,i,lap);
      const next=u+.0001,q=raceTrackPoint(s.track,next>=1?next-1:next,i,lap+(next>=1?1:0)),dx=q.x-p.x,dz=q.z-p.z,heading=Math.atan2(dx,dz);
      c.group.position.set(r.pitting?-12+i*2:p.x,r.pitting?.2:p.y+.14,r.pitting?7:p.z);c.group.rotation.y=r.pitting?0:heading;c.group.rotation.x=r.pitting?0:-Math.atan2(q.y-p.y,Math.hypot(dx,dz));
      if(r.derailed&&!reduced){const sideways=Math.sin(r.recovery*Math.PI)*1.2;c.group.position.x+=Math.cos(p.heading)*sideways;c.group.position.z-=Math.sin(p.heading)*sideways;c.group.position.y+=Math.sin(r.recovery*Math.PI)*.45;c.group.rotation.z=Math.sin(r.recovery*Math.PI)*.65;}else c.group.rotation.z=0;
      if(racing&&!r.finished&&!r.derailed&&!r.pitting&&!reduced)for(const w of c.wheels)w.rotation.x=s.elapsed*16;
      for(const w of c.wheels)w.material.color.set(r.loadout?.tyres==='mini_tyres_sponge'?'#807384':'#252633');
    });renderer.render(scene,camera);
  }
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;});canvas.addEventListener('webglcontextrestored',()=>{lost=false;signature='';renderer.setClearColor('#c6d5ac');if(lastState)draw(lastState,lastReduced);});
  let resizeRaf=0;
  const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(()=>{if(lastState&&canvas.clientWidth&&canvas.clientHeight)draw(lastState,lastReduced);});});observer.observe(canvas);
  return {draw,isLost:()=>lost,dispose:()=>{observer.disconnect();cancelAnimationFrame(resizeRaf);clear();renderer.dispose();}};
}

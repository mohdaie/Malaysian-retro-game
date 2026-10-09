// Offline authoring utility; @napi-rs/canvas is an optional tooling dependency.
// Run with Node in an environment that provides it; the browser needs only PNGs.
import {createRequire} from 'node:module';
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
import * as T from 'three';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
globalThis.document={createElement:()=>createCanvas(512,512)};
const {createCharacter}=await import('../src/characters.js?v=2.14.1');
const {KEEPERS}=await import('../src/cast.js?v=2.14.1');
const {CROWD}=await import('../src/crowds.js?v=2.14.1');
const folder=fileURLToPath(new URL('../assets/portraits/',import.meta.url));
await mkdir(folder,{recursive:true});
const output={};
for(const [key,person] of Object.entries({...KEEPERS,...CROWD})){
 const scene=new T.Scene(),{head}=createCharacter(scene,0,0,key,{portrait:true});
 scene.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(head),size=Math.max(box.max.x-box.min.x,box.max.y-box.min.y)*1.12;
 const cx=(box.max.x+box.min.x)/2,cy=(box.max.y+box.min.y)/2,N=512,scale=N/size;
 const triangles=[];
 head.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const g=mesh.geometry,positions=g.attributes.position,uv=g.attributes.uv,index=g.index;
  const verts=Array.from({length:positions.count},(_,i)=>new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld));
  const count=index?index.count:positions.count;
  for(let i=0;i<count;i+=3){
   const ids=[0,1,2].map(k=>index?index.getX(i+k):i+k),v=ids.map(k=>verts[k]);
   const mat=Array.isArray(mesh.material)?mesh.material[g.groups.find(s=>i>=s.start&&i<s.start+s.count)?.materialIndex||0]:mesh.material;
   const points=v.map(p=>({x:(p.x-cx)*scale+N/2,y:N/2-(p.y-cy)*scale,z:p.z}));
   const normal=new T.Vector3().subVectors(v[1],v[0]).cross(new T.Vector3().subVectors(v[2],v[0])).normalize();
   const light=.74+.26*Math.max(0,normal.dot(new T.Vector3(-.35,.6,1).normalize()));
   const colour=mat.color.clone().multiplyScalar(light).getStyle().match(/\d+/g).map(Number);
   const texture=mat.map?.image?.getContext?mat.map.image:null;
   const tex=texture&&uv?ids.map(k=>({x:uv.getX(k)*texture.width,y:(1-uv.getY(k))*texture.height})):null;
   if(normal.z>0||mat.side===T.DoubleSide)triangles.push({points,z:v.reduce((a,p)=>a+p.z,0)/3,colour,texture,tex});
  }
 });
 // Depth-test each fragment so overlapping hat/hair triangles stay correct.
 // Render twice the output size for clean face details and silhouette edges.
 const large=createCanvas(N,N),context=large.getContext('2d'),pixels=context.createImageData(N,N),depth=new Float64Array(N*N).fill(-Infinity),textures=new Map();
 const sample=(image,x,y)=>{
  if(!textures.has(image))textures.set(image,image.getContext('2d').getImageData(0,0,image.width,image.height).data);
  const bytes=textures.get(image),u=Math.max(0,Math.min(image.width-1,x)),v=Math.max(0,Math.min(image.height-1,y));
  const x0=Math.floor(u),y0=Math.floor(v),x1=Math.min(image.width-1,x0+1),y1=Math.min(image.height-1,y0+1),a=u-x0,b=v-y0;
  return [0,1,2,3].map(k=>(bytes[(y0*image.width+x0)*4+k]*(1-a)+bytes[(y0*image.width+x1)*4+k]*a)*(1-b)+(bytes[(y1*image.width+x0)*4+k]*(1-a)+bytes[(y1*image.width+x1)*4+k]*a)*b);
 };
 for(const t of [...triangles.filter(t=>!t.texture),...triangles.filter(t=>t.texture)]){
  const [p,q,r]=t.points,D=(q.y-r.y)*(p.x-r.x)+(r.x-q.x)*(p.y-r.y);
  if(Math.abs(D)<1e-8)continue;
  const x0=Math.max(0,Math.floor(Math.min(p.x,q.x,r.x))),x1=Math.min(N-1,Math.ceil(Math.max(p.x,q.x,r.x))),y0=Math.max(0,Math.floor(Math.min(p.y,q.y,r.y))),y1=Math.min(N-1,Math.ceil(Math.max(p.y,q.y,r.y)));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const a=((q.y-r.y)*(x+.5-r.x)+(r.x-q.x)*(y+.5-r.y))/D,b=((r.y-p.y)*(x+.5-r.x)+(p.x-r.x)*(y+.5-r.y))/D,d=1-a-b;
   if(a<0||b<0||d<0)continue;
   const i=y*N+x,z=a*p.z+b*q.z+d*r.z;if(z<depth[i]-1e-6)continue;
   const rgba=t.texture?sample(t.texture,a*t.tex[0].x+b*t.tex[1].x+d*t.tex[2].x,a*t.tex[0].y+b*t.tex[1].y+d*t.tex[2].y):[...t.colour,255];
   const alpha=rgba[3]/255;if(alpha<.001)continue;
   for(let k=0;k<3;k++)pixels.data[i*4+k]=rgba[k]*alpha+pixels.data[i*4+k]*(1-alpha);
   pixels.data[i*4+3]=rgba[3]+pixels.data[i*4+3]*(1-alpha);if(!t.texture)depth[i]=z;
  }
 }
 context.putImageData(pixels,0,0);
 const canvas=createCanvas(256,256),ctx=canvas.getContext('2d');ctx.drawImage(large,0,0,256,256);
 await writeFile(`${folder}/${key}-head.png`,canvas.toBuffer('image/png'));
 output[key]={name:person.name,file:`assets/portraits/${key}-head.png`,width:256,height:256,source:'src/characters.js createCharacter({portrait:true})',kind:'rendered_game_avatar'};
 console.log(key,triangles.length);
}
await writeFile(`${folder}/game-heads.json`,JSON.stringify(output,null,2)+'\n');

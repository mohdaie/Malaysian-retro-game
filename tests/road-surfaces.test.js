import test from 'node:test';
import assert from 'node:assert/strict';
import { roadSurfaces } from '../src/road-surfaces.js';
import { ROADS, TOWN_BOUNDS } from '../src/town-layout.js';

const contains=(r,x,z)=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2;
const overlap=(a,b)=>Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2)>1e-8&&Math.min(a.z+a.d/2,b.z+b.d/2)-Math.max(a.z-a.d/2,b.z-b.d/2)>1e-8;
function uniqueSurfaces(surfaces){
  for(const [i,a] of surfaces.entries()){
    assert.ok([a.x,a.z,a.w,a.d].every(Number.isFinite)&&a.w>0&&a.d>0);
    for(const b of surfaces.slice(i+1))assert.ok(!overlap(a,b),`${a.id} overlaps ${b.id}`);
  }
}
// Sample every cell of the exact boundary grid, including sub-metre joins;
// a coarse walking grid could miss narrow holes or an uncovered overlap.
function sameCoverage(roads,surfaces){
  const xs=[...new Set([...roads,...surfaces].flatMap(r=>[r.x-r.w/2,r.x+r.w/2]))].sort((a,b)=>a-b);
  const zs=[...new Set([...roads,...surfaces].flatMap(r=>[r.z-r.d/2,r.z+r.d/2]))].sort((a,b)=>a-b);
  for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
    if(xs[i]-xs[i-1]<1e-8||zs[j]-zs[j-1]<1e-8)continue;
    const x=(xs[i]+xs[i-1])/2,z=(zs[j]+zs[j-1])/2,original=roads.filter(r=>contains(r,x,z)),drawn=surfaces.filter(r=>contains(r,x,z));
    assert.equal(drawn.length,original.length?1:0,`coverage at ${x},${z}`);
    if(original.some(r=>r.kind==='asphalt'))assert.equal(drawn[0].kind,'asphalt');
  }
}

test('asphalt owns a mixed junction regardless of road order; dirt meets its edge without a hole',()=>{
  const dirt={id:'path',kind:'dirt',x:0,z:0,w:4,d:20},asphalt={id:'road',kind:'asphalt',x:0,z:0,w:20,d:8};
  for(const input of [[dirt,asphalt],[asphalt,dirt]]){
    const surfaces=roadSurfaces(input);uniqueSurfaces(surfaces);sameCoverage(input,surfaces);
    assert.equal(surfaces.filter(r=>contains(r,0,0))[0].kind,'asphalt');
    assert.equal(surfaces.filter(r=>contains(r,0,4.001))[0].kind,'dirt');
  }
});

test('same-kind junctions, fully contained duplicates and edge-touching roads draw only once',()=>{
  const roads=[{id:'a',kind:'asphalt',x:0,z:0,w:20,d:8},{id:'b',kind:'asphalt',x:0,z:0,w:8,d:20},{id:'duplicate',kind:'asphalt',x:0,z:0,w:2,d:2},{id:'touching',kind:'dirt',x:12,z:0,w:4,d:8}];
  const surfaces=roadSurfaces(roads);uniqueSurfaces(surfaces);sameCoverage(roads,surfaces);
  assert.ok(!surfaces.some(r=>r.id==='duplicate'));
});

test('every real town junction retains complete coverage with no coplanar overlap or plan mutation',()=>{
  const before=JSON.stringify(ROADS),surfaces=roadSurfaces(ROADS);
  uniqueSurfaces(surfaces);sameCoverage(ROADS,surfaces);assert.equal(JSON.stringify(ROADS),before);
  // Actual reported mixed junctions, including the half-metre square approach.
  for(const [x,z] of [[-43,-3],[-25,36.5],[-22,63],[65.5,24],[7,.75]])assert.equal(surfaces.find(r=>contains(r,x,z)).kind,'asphalt');
});

test('town-edge road extensions also take priority over dirt and cannot overlap road surfaces',()=>{
  const roads=[{id:'through',kind:'asphalt',x:0,z:0,w:20,d:4},{id:'outside',kind:'dirt',x:12,z:0,w:4,d:12}],bounds={minX:-10,maxX:10,minZ:-10,maxZ:10};
  const surfaces=roadSurfaces(roads,bounds),expected=[...roads,{...roads[0],x:-50,w:80},{...roads[0],x:50,w:80}];
  uniqueSurfaces(surfaces);sameCoverage(expected,surfaces);
  uniqueSurfaces(roadSurfaces(ROADS,TOWN_BOUNDS));
});

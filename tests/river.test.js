import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { RIVER, BRIDGES, TOWN_BOUNDS, BUILDINGS, SPOTS } from '../src/town-layout.js';
import { createWalkability, PLAYER_RADIUS } from '../src/collision.js';
import { moveWithCollision, RUN_SPEED } from '../src/movement.js';
import { findWalkRoute, clearSegment } from '../src/map-navigation.js';
import { riverSection, riverBounds, riverTerrainHeight, bridgeSurfaceHeight, riverDetails, BRIDGE_DECK_Y, BRIDGE_RAMP, RIVER_WATER_Y, RIVER_BED_Y } from '../src/river-profile.js';
import { createRiver } from '../src/river.js';

test('a recessed, irregular river remains inside the reserved town corridor without gaps or reversed slopes', () => {
  const bounds = riverBounds(), leftShore = [], rightShore = [];
  assert.equal(bounds.right - bounds.left, RIVER.w);
  for (let z = -80; z <= 80; z += .25) {
    const s = riverSection(z);
    assert.equal(s[0][0], bounds.left);assert.equal(s.at(-1)[0], bounds.right);
    assert.ok(s.every(p => p.every(Number.isFinite)));
    for (let i = 1; i < s.length; i++) assert.ok(s[i][0] > s[i - 1][0]);
    assert.equal(s[2][1], RIVER_WATER_Y);assert.equal(s[5][1], RIVER_WATER_Y);
    assert.equal(riverTerrainHeight(RIVER.x,z), RIVER_BED_Y);
    assert.ok(s[0][1] - RIVER_WATER_Y >= .5 && s[0][1] - RIVER_WATER_Y <= .8);
    for (const [x,y] of s) assert.ok(Math.abs(riverTerrainHeight(x,z) - y) < 1e-9);
    leftShore.push(s[2][0]);rightShore.push(s[5][0]);
  }
  assert.ok(Math.max(...leftShore) - Math.min(...leftShore) > .5);
  assert.ok(Math.max(...rightShore) - Math.min(...rightShore) > .5);
});

test('bridge decks and approaches sit above the water and meet the existing ground continuously', () => {
  for (const b of BRIDGES) {
    assert.equal(bridgeSurfaceHeight(b.x,b.z), BRIDGE_DECK_Y);
    for (const side of [-1,1]) {
      const edge=b.x+side*b.w/2, end=edge+side*BRIDGE_RAMP;
      assert.equal(bridgeSurfaceHeight(edge,b.z), BRIDGE_DECK_Y);
      const near=bridgeSurfaceHeight(end-side*1e-6,b.z);
      assert.ok(Math.abs(near-(b.road ? .065 : -.025))<1e-5);
      assert.equal(bridgeSurfaceHeight(end+side*.01,b.z),null);
    }
    assert.ok(BRIDGE_DECK_Y > RIVER_WATER_Y + .8);
    assert.equal(bridgeSurfaceHeight(b.x,b.z+b.d/2+.001),null);
  }
});

test('the player cannot run into either bank or water; both full crossings and routes stay open', () => {
  const bounds=riverBounds(),walk=createWalkability([]),openZ=18;
  for (const side of [-1,1]) {
    const edge=side<0?bounds.left:bounds.right,p={x:edge+side*2,z:openZ};
    for(let i=0;i<20;i++)moveWithCollision(p,-side,0,RUN_SPEED,.2,walk);
    assert.ok(walk(p.x,p.z));assert.ok(side<0?p.x<=bounds.left-PLAYER_RADIUS:p.x>=bounds.right+PLAYER_RADIUS);
  }
  for(const b of BRIDGES){
    const start={x:bounds.left-2,z:b.z},end={x:bounds.right+2,z:b.z};
    assert.ok(clearSegment(start,end,walk));
    const p={...start};moveWithCollision(p,1,0,RUN_SPEED,(end.x-start.x)/RUN_SPEED,walk);assert.ok(Math.abs(p.x-end.x)<1e-8);
    assert.equal(walk(RIVER.x,b.z+b.d/2-PLAYER_RADIUS+.01),false);
  }
  const west={x:bounds.left-2,z:18};
  for(const b of BUILDINGS){const path=findWalkRoute(west,b.door,walk,TOWN_BOUNDS);assert.ok(path,b.name);for(let i=1;i<path.length;i++)assert.ok(clearSegment(path[i-1],path[i],walk),b.name);}
  assert.ok(walk(SPOTS.spawn.x,SPOTS.spawn.z));assert.ok(walk(SPOTS.spawnNur.x,SPOTS.spawnNur.z));
});

test('bank decoration cannot obstruct bridge approaches or protrude into walkable ground', () => {
  const bounds=riverBounds(),details=riverDetails();
  for(const [kind,points] of Object.entries(details))for(const p of points){
    assert.ok(p.x>bounds.left&&p.x<bounds.right,kind);assert.ok(p.y>=RIVER_WATER_Y&&p.y<0,kind);
    assert.ok(BRIDGES.every(b=>Math.abs(p.z-b.z)>b.d/2+2),kind);
    if(kind==='rocks'){assert.ok(p.x-p.size*1.25>bounds.left);assert.ok(p.x+p.size*1.25<bounds.right);}
  }
});

test('river meshes are finite and compact, and elapsed time animates one uniform without rebuilding geometry', () => {
  const scene=new T.Scene(),river=createRiver(scene),before=scene.children[0].children.map(m=>m.geometry);
  assert.ok(river.snapshot().triangles<3000);assert.equal(river.snapshot().draws,5);
  for(const g of before)for(const a of Object.values(g.attributes))assert.ok([...a.array].every(Number.isFinite));
  river.update(12.5);assert.equal(river.snapshot().time,12.5);river.update(NaN);assert.equal(river.snapshot().time,12.5);
  assert.deepEqual(scene.children[0].children.map(m=>m.geometry),before);
});

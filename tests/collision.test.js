import test from 'node:test';
import assert from 'node:assert/strict';
import { hitsObstacle, createWalkability, PLAYER_RADIUS } from '../src/collision.js';
import { moveWithCollision, RUN_SPEED } from '../src/movement.js';
import { BUILDINGS, DISTRICTS, TOWN_BOUNDS, BRIDGES } from '../src/town-layout.js';

test('the compact plan contains 38 unique numbered locations in the five agreed districts', () => {
  assert.deepEqual(BUILDINGS.map(b=>b.id), Array.from({length:38},(_,i)=>i+1));
  assert.deepEqual(DISTRICTS.map(d=>BUILDINGS.filter(b=>b.zone===d.id).length),[10,10,8,6,4]);
  for(const b of BUILDINGS){
    assert.ok(b.x-b.w/2>=TOWN_BOUNDS.minX && b.x+b.w/2<=TOWN_BOUNDS.maxX,b.name);
    assert.ok(b.z-b.d/2>=TOWN_BOUNDS.minZ && b.z+b.d/2<=TOWN_BOUNDS.maxZ,b.name);
  }
});
test('player body collides with walls and round trunks without square invisible corners', () => {
  const wall={x:0,z:0,w:2,d:2},trunk={x:5,z:5,r:.3};
  assert.ok(hitsObstacle(0,0,wall));
  assert.ok(hitsObstacle(1.1,1.1,wall));
  assert.ok(!hitsObstacle(1.3,1.3,wall));
  assert.ok(hitsObstacle(5.6,5,trunk));
  assert.ok(!hitsObstacle(5.5,5.5,trunk));
});
test('only real bridge decks allow river crossings and body stays inside the map', () => {
  const walk=createWalkability([]);
  assert.ok(BRIDGES.length>=1);
  for(const {z,d} of BRIDGES){
    for(const x of [-70,-65,-60])assert.ok(walk(x,z));
    assert.ok(walk(-65,z+d/2-PLAYER_RADIUS-.01));
    assert.ok(!walk(-65,z+d/2-PLAYER_RADIUS+.01));
  }
  const open=[-60,-40,-20,0,20,40,60].find(z=>!BRIDGES.some(b=>Math.abs(b.z-z)<b.d/2+1));
  assert.ok(!walk(-65,open));assert.ok(!walk(NaN,0));assert.ok(!walk(0,Infinity));
  assert.ok(!walk(TOWN_BOUNDS.maxX,0));assert.ok(walk(TOWN_BOUNDS.maxX-PLAYER_RADIUS-.01,0));
});
test('fences block running and their authored 1.4-metre gates remain open', () => {
  const walk=createWalkability([{x:-2.3,z:0,w:3.6,d:.12},{x:1.6,z:0,w:1.4,d:.12}]);
  const blocked={x:-2,z:2};moveWithCollision(blocked,0,-1,RUN_SPEED,1,walk);
  assert.ok(blocked.z>=.06+PLAYER_RADIUS-.12);
  const gate={x:.2,z:2};moveWithCollision(gate,0,-1,RUN_SPEED,3.5/RUN_SPEED,walk);
  assert.ok(gate.z<-1);
});
test('low-frame-rate movement cannot tunnel through thin posts or walls', () => {
  const obstacles=[{x:0,z:0,r:.07},{x:3,z:0,w:.08,d:8}],walk=createWalkability(obstacles);
  for(const fps of [5,10,60]){
    const p={x:-2,z:0};for(let i=0;i<fps;i++)moveWithCollision(p,1,0,RUN_SPEED,1/fps,walk);
    assert.ok(p.x<=-.07-PLAYER_RADIUS);assert.ok(walk(p.x,p.z));
    const slide={x:2,z:-2};moveWithCollision(slide,Math.SQRT1_2,Math.SQRT1_2,RUN_SPEED,5.5/RUN_SPEED,walk);
    assert.ok(slide.x<=3-.04-PLAYER_RADIUS);assert.ok(slide.z>1);
  }
});

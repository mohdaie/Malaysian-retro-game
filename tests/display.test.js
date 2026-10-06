import test from 'node:test';
import assert from 'node:assert/strict';
import { needsLandscape, enterLandscape, CAMERA_DEFAULT, CAMERA_NEAR, CAMERA_FAR } from '../src/display.js';
test('portrait is blocked and landscape is available across phone and desktop sizes',()=>{
  assert.equal(needsLandscape(390,844),true);
  assert.equal(needsLandscape(844,390),false);
  assert.equal(needsLandscape(1440,900),false);
  assert.equal(needsLandscape(900,1440),true);
  assert.ok(CAMERA_NEAR<CAMERA_DEFAULT&&CAMERA_DEFAULT<CAMERA_FAR);
});
test('fullscreen is requested before locking orientation',async()=>{
  const calls=[];
  await enterLandscape({requestFullscreen:async()=>calls.push('fullscreen')},{orientation:{lock:async value=>calls.push(value)}},{fullscreenElement:null});
  assert.deepEqual(calls,['fullscreen','landscape']);
});
test('denied or unavailable orientation APIs are recoverable through the portrait gate',async()=>{
  await assert.doesNotReject(enterLandscape({requestFullscreen:async()=>{throw Error('denied');}},{orientation:{lock:async()=>{throw Error('unsupported');}}},{fullscreenElement:null}));
  await assert.doesNotReject(enterLandscape({}, {}, {fullscreenElement:null}));
});

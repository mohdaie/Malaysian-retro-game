import test from 'node:test';
import assert from 'node:assert/strict';
import { footCycle, solveLeg, gaitPose } from '../src/locomotion.js';

test('foot support is flat, swing clears the ground and cycle boundaries meet', () => {
  for (const running of [false, true]) {
    let support = 0, swing = 0;
    for (let i = 0; i < 360; i++) {
      const foot = footCycle(i * Math.PI / 180, running);
      if (foot.stance) { assert.equal(foot.lift, 0); assert.equal(foot.roll, 0); support++; }
      else { assert.ok(foot.lift >= 0); swing++; }
    }
    assert.ok(support > 0 && swing > 0);
    const a = footCycle(0, running), b = footCycle(Math.PI * 2 - .000001, running);
    assert.ok(Math.abs(a.z - b.z) < .00001);
    assert.ok(b.lift < .00001);
  }
});
test('two-bone legs reach their foot targets without reverse knee bends', () => {
  for (const running of [false, true]) for (let phase = 0; phase < Math.PI * 2; phase += .05) {
    const pose = gaitPose(phase, 0, 1, running);
    for (const foot of pose.feet) {
      const y = .17 + foot.lift - 1.18 - pose.y, z = foot.z;
      const leg = solveLeg(y, z);
      const solvedY = -.51 * Math.cos(leg.hip) - .50 * Math.cos(leg.hip + leg.knee);
      const solvedZ = -.51 * Math.sin(leg.hip) - .50 * Math.sin(leg.hip + leg.knee);
      assert.ok(Math.abs(solvedY - y) < .00001);
      assert.ok(Math.abs(solvedZ - z) < .00001);
      assert.ok(leg.knee >= 0 && leg.knee < Math.PI);
    }
  }
});
test('stopping settles both feet and removes travel sway and arm swings', () => {
  for (const phase of [0, .7, 2, 5]) {
    const pose = gaitPose(phase, 1, 0);
    assert.equal(Math.abs(pose.x), 0);
    assert.equal(Math.abs(pose.hipYaw), 0);
    assert.ok(pose.feet.every(foot => Math.abs(foot.z) === 0 && foot.lift === 0 && Math.abs(foot.roll) === 0));
    assert.ok(pose.arms.every(arm => Math.abs(arm.swing) === 0));
  }
});

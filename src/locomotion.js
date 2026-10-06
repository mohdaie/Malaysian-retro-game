const TAU = Math.PI * 2;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const smooth = value => value * value * (3 - 2 * value);

// A stance lasts longer than a swing. The foot stays flat and low during
// support, then clears the ground and returns in a smooth arc.
export function footCycle(phase, running = false) {
  const cycle = ((phase / TAU) % 1 + 1) % 1;
  const support = running ? .49 : .62;
  const reach = running ? .40 : .31;
  if (cycle < support) return { z: reach * (1 - 2 * cycle / support), lift: 0, roll: 0, stance: true };
  const swing = (cycle - support) / (1 - support);
  return {
    z: reach * (2 * smooth(swing) - 1),
    lift: (running ? .29 : .20) * Math.sin(Math.PI * swing),
    roll: -.28 * Math.sin(Math.PI * swing),
    stance: false
  };
}

// Two-bone sagittal IK, with +Z facing forward and knee flexion around +X.
export function solveLeg(y, z, upper = .51, lower = .50) {
  const length = clamp(Math.hypot(y, z), Math.abs(upper - lower) + .00001, upper + lower - .00001);
  const hip = Math.atan2(-z, -y) - Math.acos(clamp((upper * upper + length * length - lower * lower) / (2 * upper * length), -1, 1));
  const knee = Math.PI - Math.acos(clamp((upper * upper + lower * lower - length * length) / (2 * upper * lower), -1, 1));
  return { hip, knee };
}

export function gaitPose(phase, time, amount, running = false) {
  amount = clamp(amount, 0, 1);
  const wave = Math.sin(phase);
  const bounce = (1 - Math.cos(phase * 2)) * .012;
  return {
    x: wave * .022 * amount,
    y: -.025 - (running ? .10 : .075) * amount + bounce * amount + Math.sin(time * 2.3) * .004 * (1 - amount),
    hipYaw: wave * .055 * amount,
    hipRoll: wave * .025 * amount,
    chestYaw: -wave * .12 * amount,
    chestRoll: -wave * .036 * amount,
    lean: (running ? .12 : .035) * amount,
    feet: [0, Math.PI].map(offset => {
      const step = footCycle(phase + offset, running);
      return { ...step, z: step.z * amount, lift: step.lift * amount, roll: step.roll * amount };
    }),
    arms: [wave, -wave].map(value => ({ swing: -value * (running ? .63 : .40) * amount, bend: -(running ? .72 : .20 + Math.max(0, value) * .16) * amount }))
  };
}

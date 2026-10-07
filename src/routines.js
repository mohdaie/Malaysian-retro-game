// What each NPC does while they wait at their post, as a loop you can edit.
//
// `spots` are places near where they normally stand, in metres:
//   [right, forward, facing]  right/forward of their usual spot, as they face out
//   facing is 'out' (the usual way), 'back', 'left' or 'right' (default 'out')
// Every NPC also has `home` [0, 0, 'out'] and these shared spots:
//   left [-1.4, .3], right [1.4, .3], forward [0, 1.4], back [0, -.8, 'back']
//
// `steps` run in order, then start again:
//   ['stand', seconds]             stand still and breathe
//   ['do', action, seconds]        play an action (see actions.js): wave, look, stir,
//                                  wipe, write, read, fan, stretch, hips, fold, talk,
//                                  bend, scratch, check, nod
//   ['walk', spot]                 walk to a spot, then face its way
//   ['face', 'out'|'back'|'left'|'right']   turn on the spot
//
// A walk that would run into a wall, a table or the river is skipped. NPCs
// stop and turn to you when you come close, and wait while you talk.
export const SHARED_SPOTS = { home: [0, 0, 'out'], left: [-1.4, .3, 'out'], right: [1.4, .3, 'out'], forward: [0, 1.4, 'out'], back: [0, -.8, 'back'] };
export const ROUTINES = {
  rahman: { steps: [['do', 'write', 6], ['stand', 3], ['walk', 'left'], ['do', 'wipe', 4], ['walk', 'home'], ['do', 'look', 4], ['do', 'fold', 5]] },
  din: { steps: [['do', 'wipe', 5], ['walk', 'right'], ['do', 'look', 4], ['walk', 'home'], ['do', 'hips', 5], ['do', 'fan', 3]] },
  lim: { steps: [['do', 'read', 6], ['do', 'fold', 4], ['walk', 'left'], ['do', 'look', 3], ['walk', 'home'], ['do', 'wave', 2], ['stand', 3]] },
  ros: { steps: [['do', 'stir', 6], ['do', 'wipe', 4], ['walk', 'right'], ['do', 'hips', 3], ['walk', 'home'], ['stand', 2]] },
  farid: { steps: [['do', 'read', 6], ['walk', 'right'], ['do', 'look', 3], ['walk', 'home'], ['do', 'write', 5], ['do', 'check', 2]] },
  man: { steps: [['do', 'bend', 5], ['do', 'wipe', 3], ['walk', 'left'], ['do', 'scratch', 3], ['walk', 'home'], ['do', 'hips', 4]] },
  ita: { steps: [['do', 'stir', 7], ['walk', 'right'], ['do', 'wipe', 4], ['walk', 'home'], ['do', 'fan', 3], ['do', 'talk', 4]] },
  salleh: { steps: [['do', 'write', 5], ['do', 'talk', 5], ['walk', 'left'], ['do', 'look', 4], ['walk', 'home'], ['do', 'nod', 2]] },
  hassan: { steps: [['stand', 4], ['do', 'fold', 5], ['walk', 'right'], ['do', 'bend', 3], ['walk', 'home'], ['do', 'nod', 3]] },
  pakmat: { spots: { bed: [-1.6, 1, 'left'], row: [1.6, 1, 'right'] }, steps: [['do', 'bend', 6], ['walk', 'bed'], ['do', 'bend', 5], ['walk', 'row'], ['do', 'stretch', 3], ['walk', 'home'], ['do', 'fan', 3]] },
  nenek: { steps: [['do', 'fan', 6], ['stand', 4], ['do', 'look', 4], ['walk', 'left'], ['do', 'bend', 3], ['walk', 'home']] },
  atuk: { steps: [['do', 'talk', 6], ['do', 'hips', 4], ['walk', 'right'], ['do', 'look', 4], ['walk', 'home'], ['do', 'scratch', 2]] },
  faiz: { steps: [['do', 'bend', 3], ['do', 'talk', 5], ['walk', 'left'], ['do', 'wave', 2], ['walk', 'home'], ['do', 'stretch', 2]] },
  meiling: { steps: [['do', 'read', 5], ['do', 'talk', 4], ['walk', 'forward'], ['do', 'look', 3], ['walk', 'home'], ['do', 'fold', 4]] }
};

const TURN = { out: 0, back: Math.PI, left: Math.PI / 2, right: -Math.PI / 2 };
const WALK_SPEED = 1.1;
const angleTo = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

// Plays one NPC's loop. `home` is { x, z, heading }; `canWalk(x, z)` checks
// a point. update(dt, { pause, look }) returns where the NPC is, which way it
// faces, whether it is walking and which action it is playing.
export function createRoutine(routine, home, canWalk, actions = null) {
  const spots = { ...SHARED_SPOTS, ...(routine?.spots || {}) };
  const right = [-Math.cos(home.heading), Math.sin(home.heading)], forward = [Math.sin(home.heading), Math.cos(home.heading)];
  const at = name => { const [r, f, facing = 'out'] = spots[name]; return { x: home.x + right[0] * r + forward[0] * f, z: home.z + right[1] * r + forward[1] * f, heading: home.heading + (TURN[facing] ?? 0) }; };
  const clearPath = (a, b) => { const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / .25); for (let i = 1; i <= n; i++) if (!canWalk(a.x + (b.x - a.x) * i / n, a.z + (b.z - a.z) * i / n)) return false; return true; };
  // Keep only steps that can be played from here: walks along a clear path.
  const steps = []; let where = at('home');
  for (const step of routine?.steps || []) {
    const [kind, a, b] = step;
    if (kind === 'walk') { if (!spots[a]) continue; const to = at(a); if (Math.hypot(to.x - where.x, to.z - where.z) > .05 && clearPath(where, to)) { steps.push({ kind, to }); where = to; } }
    else if (kind === 'do' && (!actions || actions[a]) && b > 0) steps.push({ kind, action: a, time: b });
    else if (kind === 'stand' && a > 0) steps.push({ kind, time: a });
    else if (kind === 'face' && TURN[a] !== undefined) steps.push({ kind, heading: home.heading + TURN[a] });
  }
  // A loop that would end away from home walks back to start again.
  if (Math.hypot(where.x - home.x, where.z - home.z) > .05) steps.push({ kind: 'walk', to: at('home') });
  const state = { x: home.x, z: home.z, heading: home.heading, moving: 0, travel: 0, action: null, actionTime: 0 };
  let index = 0, clock = 0, goal = home.heading;
  const next = () => { index = (index + 1) % Math.max(1, steps.length); clock = 0; state.actionTime = 0; };
  function turnTo(target, dt) { state.heading += angleTo(state.heading, target) * Math.min(1, dt * 6); }
  function update(dt, { pause = false, look = null } = {}) {
    state.moving = 0; state.travel = 0;
    if (pause || look) {
      // Stop and wait; turn to face whoever came close.
      state.action = null;
      if (look) turnTo(Math.atan2(look.x - state.x, look.z - state.z), dt);
      return state;
    }
    const step = steps[index];
    if (!step) { turnTo(goal, dt); return state; }
    clock += dt;
    if (step.kind === 'walk') {
      const dx = step.to.x - state.x, dz = step.to.z - state.z, left = Math.hypot(dx, dz);
      state.action = null;
      if (left < .03) { goal = step.to.heading; next(); return state; }
      const move = Math.min(left, WALK_SPEED * dt), nx = state.x + dx / left * move, nz = state.z + dz / left * move;
      turnTo(Math.atan2(dx, dz), dt);
      // Someone in the way: wait, and give up on this walk after a while.
      if (!canWalk(nx, nz)) { if (clock > 4) { goal = state.heading; next(); } return state; }
      state.x = nx; state.z = nz; state.moving = 1; state.travel = move;
      return state;
    }
    turnTo(step.kind === 'face' ? step.heading : goal, dt);
    if (step.kind === 'face') { if (Math.abs(angleTo(state.heading, step.heading)) < .05) { goal = step.heading; next(); } return state; }
    state.action = step.kind === 'do' ? step.action : null; state.actionTime += dt;
    if (clock >= step.time) next();
    return state;
  }
  return { update, state, steps };
}

// A full push on the stick jogs and Run sprints, at the speeds the kids'
// motion-captured jog and sprint cover the ground (v2.0); a light push walks.
export const WALK_SPEED = 4.3;
export const RUN_SPEED = 6.3;

// Normalize against the rendered control, so CSS sizing and thumb travel agree.
export function stickInput(x, y, radius) {
  const scale = Math.min(1, radius / (Math.hypot(x, y) || 1));
  return { x: x * scale / radius, y: y * scale / radius };
}

// Keep collision steps small even when a slower device renders longer frames.
export function moveWithCollision(position, dx, dz, speed, dt, canWalk) {
  // Distance subdivision also protects narrow posts at high input speeds.
  const steps = Math.max(1, Math.ceil(dt / .025), Math.ceil(Math.hypot(dx,dz)*speed*dt/.12));
  const step = speed * dt / steps;
  for (let i = 0; i < steps; i++) {
    // Already overlapping something (a townsperson stepped in, an old save,
    // a bike left in a tight spot): let the move happen so you can get out,
    // instead of every step being refused.
    if (!canWalk(position.x, position.z)) { position.x += dx * step; position.z += dz * step; continue; }
    if (canWalk(position.x + dx * step, position.z)) position.x += dx * step;
    if (canWalk(position.x, position.z + dz * step)) position.z += dz * step;
  }
}

export const WALK_SPEED = 7.2;
export const RUN_SPEED = 11;

// Normalize against the rendered control, so CSS sizing and thumb travel agree.
export function stickInput(x, y, radius) {
  const scale = Math.min(1, radius / (Math.hypot(x, y) || 1));
  return { x: x * scale / radius, y: y * scale / radius };
}

// Keep collision steps small even when a slower device renders longer frames.
export function moveWithCollision(position, dx, dz, speed, dt, canWalk) {
  const steps = Math.max(1, Math.ceil(dt / .025));
  const step = speed * dt / steps;
  for (let i = 0; i < steps; i++) {
    if (canWalk(position.x + dx * step, position.z)) position.x += dx * step;
    if (canWalk(position.x, position.z + dz * step)) position.z += dz * step;
  }
}

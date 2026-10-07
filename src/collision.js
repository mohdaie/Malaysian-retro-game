import { TOWN_BOUNDS, BRIDGES } from './town-layout.js?v=2.0.0';
export const PLAYER_RADIUS = .32;
export function hitsObstacle(x, z, obstacle, radius = PLAYER_RADIUS) {
  if (obstacle.r !== undefined) return Math.hypot(x-obstacle.x, z-obstacle.z) < radius + obstacle.r;
  const dx = Math.max(Math.abs(x-obstacle.x)-obstacle.w/2, 0);
  const dz = Math.max(Math.abs(z-obstacle.z)-obstacle.d/2, 0);
  return dx*dx + dz*dz < radius*radius;
}
export function createWalkability(obstacles) {
  return (x,z) => {
    if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
    const b=TOWN_BOUNDS, r=PLAYER_RADIUS;
    if (x<b.minX+r || x>b.maxX-r || z<b.minZ+r || z>b.maxZ-r) return false;
    // Only the two visible bridges cross the river; include the player's body.
    if (x>-70.3-r && x<-59.8+r && !BRIDGES.some(bridge => Math.abs(z-bridge.z)<=bridge.d/2-r)) return false;
    return !obstacles.some(obstacle => hitsObstacle(x,z,obstacle));
  };
}

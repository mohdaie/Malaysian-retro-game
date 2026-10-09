import { RIVER, BRIDGES } from './town-layout.js?v=2.14.0';

// The banks and water stay inside the river corridor reserved by the town plan.
// Walking, bridge heights and rendering use these same dimensions.
export const RIVER_GROUND_Y = -.05;
export const RIVER_WATER_Y = -.66;
export const RIVER_BED_Y = -1.4;
export const RIVER_END = 80;
export const BRIDGE_DECK_Y = .24;
export const BRIDGE_RAMP = 1.1;
export const riverBounds = () => ({ left: RIVER.x - RIVER.w / 2, right: RIVER.x + RIVER.w / 2 });

export function riverSection(z) {
  const bend = Math.sin(z * .083) * .18 + Math.sin(z * .21 + .7) * .08;
  const width = 3.45 + Math.sin(z * .14 + .9) * .23 + Math.sin(z * .37) * .09;
  const { left, right } = riverBounds();
  return [
    [left, RIVER_GROUND_Y],
    [left + .65 + Math.sin(z * .19) * .32 + Math.sin(z * .51) * .1, -.09],
    [RIVER.x + bend - width, RIVER_WATER_Y],
    [RIVER.x + bend - width + .65, RIVER_BED_Y],
    [RIVER.x + bend + width - .65, RIVER_BED_Y],
    [RIVER.x + bend + width, RIVER_WATER_Y],
    [right - .65 + Math.sin(z * .17 + 1) * .32 + Math.sin(z * .49) * .1, -.09],
    [right, RIVER_GROUND_Y]
  ];
}

export function riverTerrainHeight(x, z) {
  const section = riverSection(z);
  if (x <= section[0][0] || x >= section.at(-1)[0]) return RIVER_GROUND_Y;
  const i = section.findIndex(([edge]) => edge >= x), a = section[i - 1], b = section[i];
  return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
}

export function bridgeSurfaceHeight(x, z) {
  for (const b of BRIDGES) {
    if (Math.abs(z - b.z) > b.d / 2) continue;
    const beyond = Math.abs(x - b.x) - b.w / 2;
    if (beyond <= 0) return BRIDGE_DECK_Y;
    if (beyond < BRIDGE_RAMP) {
      const approach = b.road ? .065 : -.025;
      return BRIDGE_DECK_Y + (approach - BRIDGE_DECK_Y) * beyond / BRIDGE_RAMP;
    }
  }
  return null;
}

// Small decor is confined to the blocked banks, leaving both bridge approaches clear.
export function riverDetails() {
  const rocks = [], grass = [], bamboo = [];
  const bounds = riverBounds();
  for (let i = 0, z = -74; z <= 74; i++, z += 2.7) {
    if (BRIDGES.some(b => Math.abs(z - b.z) < b.d / 2 + 2.2)) continue;
    const s = riverSection(z);
    for (const side of [-1, 1]) {
      const shore = s[side < 0 ? 2 : 5][0];
      const x = shore + side * (.35 + (Math.sin(i * 5.3 + side) + 1) * .25);
      const p = { x, z, y: riverTerrainHeight(x, z) };
      if ((i + (side > 0 ? 1 : 0)) % 3 === 0) {
        const size = .3 + (Math.sin(i * 3.7) + 1) * .14;
        const rockX = Math.max(bounds.left + size * 1.25 + .04, Math.min(bounds.right - size * 1.25 - .04, x));
        rocks.push({ ...p, x: rockX, y: riverTerrainHeight(rockX, z), size, yaw: i * 1.7 });
      }
      grass.push({ ...p, x: x + side * .2, y: riverTerrainHeight(x + side * .2, z), size: .35 + (Math.cos(i) + 1) * .08, yaw: i * 2.1 });
    }
  }
  for (const [z, side] of [[-58, -1], [-25, 1], [8, -1], [58, 1]]) {
    if (BRIDGES.some(b => Math.abs(z - b.z) < b.d / 2 + 3)) continue;
    const s = riverSection(z), x = s[side < 0 ? 1 : 6][0] - side * .12;
    bamboo.push({ x, z, y: riverTerrainHeight(x, z), kind: 'buluh', size: .55, seed: 2001 + z * 31, ring: 'in' });
  }
  return { rocks, grass, bamboo };
}

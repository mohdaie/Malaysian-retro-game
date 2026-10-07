// Uniform map coordinates: north is -z; the same transform handles drawing and taps.
export const MAP_BOUNDS = { minX: -82, maxX: 82, minZ: -70, maxZ: 70 };
export function mapView(width, height, zoom = 1, x = 0, z = 0) {
  const scale = Math.max(.01, Math.min((width - 40) / 164, (height - 40) / 140)) * zoom;
  return { width, height, zoom, x, z, scale };
}
export const project = (v, p) => ({ x: v.width / 2 + (p.x - v.x) * v.scale, y: v.height / 2 + (p.z - v.z) * v.scale });
export const unproject = (v, p) => ({ x: v.x + (p.x - v.width / 2) / v.scale, z: v.z + (p.y - v.height / 2) / v.scale });
export function clampView(v) {
  const dx = Math.max(0, 82 - (v.width / 2 - 20) / v.scale), dz = Math.max(0, 70 - (v.height / 2 - 20) / v.scale);
  return { ...v, x: Math.max(-dx, Math.min(dx, v.x)), z: Math.max(-dz, Math.min(dz, v.z)) };
}
export function zoomView(v, zoom, anchor = { x: v.width / 2, y: v.height / 2 }) {
  const p = unproject(v, anchor), next = mapView(v.width, v.height, Math.max(1, Math.min(6, zoom)), v.x, v.z);
  next.x = p.x - (anchor.x - v.width / 2) / next.scale;
  next.z = p.z - (anchor.y - v.height / 2) / next.scale;
  return clampView(next);
}
export function clearSegment(a, b, canWalk) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / .16));
  for (let i = 0; i <= steps; i++) if (!canWalk(a.x + (b.x - a.x) * i / steps, a.z + (b.z - a.z) * i / steps)) return false;
  return true;
}
export const routeLength = points => points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.z - points[i].z), 0);

class Heap {
  items = [];
  push(node) {
    const a = this.items; a.push(node); let i = a.length - 1;
    while (i) { const p = (i - 1) >> 1; if (a[p].f <= node.f) break; a[i] = a[p]; i = p; } a[i] = node;
  }
  pop() {
    const a = this.items, first = a[0], end = a.pop();
    if (a.length) { let i = 0; while (i * 2 + 1 < a.length) { let c = i * 2 + 1; if (c + 1 < a.length && a[c + 1].f < a[c].f) c++; if (a[c].f >= end.f) break; a[i] = a[c]; i = c; } a[i] = end; }
    return first;
  }
}

// Plan against actual game collisions, including gates, props and river bridges.
// A blocked NPC centre ends at a walkable interaction spot, never inside its body.
export function findWalkRoute(start, target, canWalk, bounds, cell = 1.5) {
  if (!canWalk(start.x, start.z)) return null;
  let goal = target;
  if (!canWalk(goal.x, goal.z)) {
    const candidates = [];
    for (const r of [.8, 1.2, 1.8]) for (let i = 0; i < 16; i++) {
      const p = { x: target.x + Math.cos(i * Math.PI / 8) * r, z: target.z + Math.sin(i * Math.PI / 8) * r };
      if (canWalk(p.x, p.z)) candidates.push(p);
    }
    candidates.sort((a, b) => Math.hypot(a.x - start.x, a.z - start.z) - Math.hypot(b.x - start.x, b.z - start.z));
    if (!candidates.length) return null; goal = candidates[0];
  }
  if (clearSegment(start, goal, canWalk)) return [{ x: start.x, z: start.z }, { x: goal.x, z: goal.z }];
  const cols = Math.floor((bounds.maxX - bounds.minX) / cell) + 1, rows = Math.floor((bounds.maxZ - bounds.minZ) / cell) + 1;
  const point = id => ({ x: bounds.minX + id % cols * cell, z: bounds.minZ + Math.floor(id / cols) * cell });
  const free = new Map(), walk = id => { if (!free.has(id)) { const p = point(id); free.set(id, canWalk(p.x, p.z)); } return free.get(id); };
  function anchors(p) {
    const cx = Math.round((p.x - bounds.minX) / cell), cy = Math.round((p.z - bounds.minZ) / cell), result = [];
    for (let y = cy - 3; y <= cy + 3; y++) for (let x = cx - 3; x <= cx + 3; x++) {
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      const id = y * cols + x, q = point(id);
      if (walk(id) && clearSegment(p, q, canWalk)) result.push({ id, cost: Math.hypot(q.x - p.x, q.z - p.z) });
    }
    return result;
  }
  const ends = new Map(anchors(goal).map(n => [n.id, n.cost])), starts = anchors(start);
  if (!ends.size || !starts.length) return null;
  const queue = new Heap(), costs = new Map(), parents = new Map(), closed = new Set();
  const heuristic = id => { const p = point(id); return Math.hypot(p.x - goal.x, p.z - goal.z); };
  for (const n of starts) { costs.set(n.id, n.cost); parents.set(n.id, null); queue.push({ id: n.id, f: n.cost + heuristic(n.id) }); }
  while (queue.items.length) {
    const { id } = queue.pop(); if (closed.has(id)) continue; closed.add(id);
    if (ends.has(id)) {
      const path = [{ x: goal.x, z: goal.z }]; let at = id;
      while (at !== null) { path.push(point(at)); at = parents.get(at); }
      path.push({ x: start.x, z: start.z }); path.reverse();
      const result = [path[0]]; let i = 0;
      while (i < path.length - 1) { let next = path.length - 1; while (next > i + 1 && !clearSegment(path[i], path[next], canWalk)) next--; result.push(path[next]); i = next; }
      return result;
    }
    const x = id % cols, y = Math.floor(id / cols), p = point(id);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || x + dx < 0 || x + dx >= cols || y + dy < 0 || y + dy >= rows) continue;
      const next = (y + dy) * cols + x + dx;
      if (closed.has(next) || !walk(next)) continue;
      const cost = costs.get(id) + Math.hypot(dx, dy) * cell;
      if (cost >= (costs.get(next) ?? Infinity) || !clearSegment(p, point(next), canWalk)) continue;
      costs.set(next, cost); parents.set(next, id); queue.push({ id: next, f: cost + heuristic(next) });
    }
  }
  return null;
}

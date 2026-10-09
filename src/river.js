import * as T from 'three';
import { toon, comicEdges } from './illustration.js?v=2.12.0';
import { BRIDGES } from './town-layout.js?v=2.12.0';
import { riverSection, riverBounds, riverDetails, RIVER_GROUND_Y, RIVER_WATER_Y, RIVER_BED_Y, RIVER_END } from './river-profile.js?v=2.12.0';

const geometry = (positions, colors, uvs) => {
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  if (colors) g.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  if (uvs) g.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals();g.computeBoundingSphere();return g;
};

// Only the water's time uniform changes each frame. The bank topology and
// instanced decor are built once, with no reflection render targets or physics.
export function createRiver(scene) {
  const group = new T.Group();group.name = 'Kampung river';scene.add(group);
  const positions = [], colors = [], waterPos = [], waterUV = [], shoreLines = [];
  const bankColors = [0xb4c579, 0xab8258, 0x705e45, 0x46544c, 0x705e45, 0xab8258, 0xb4c579];
  const tint = new T.Color();
  const pushTriangle = (points, hex, shade) => {
    tint.setHex(hex).multiplyScalar(shade);
    for (const p of points) { positions.push(...p);colors.push(tint.r, tint.g, tint.b); }
  };
  for (let z = -RIVER_END; z < RIVER_END; z += 2) {
    const a = riverSection(z), b = riverSection(z + 2);
    for (let band = 0; band < a.length - 1; band++) {
      const corners = [[a[band][0], a[band][1], z], [a[band + 1][0], a[band + 1][1], z], [b[band][0], b[band][1], z + 2], [b[band + 1][0], b[band + 1][1], z + 2]];
      const shade = .95 + Math.sin(z * 1.7 + band * 2.3) * .06;
      pushTriangle([corners[0], corners[2], corners[1]], bankColors[band], shade);
      pushTriangle([corners[1], corners[2], corners[3]], bankColors[band], shade * .97);
    }
    const water = [[a[2][0], RIVER_WATER_Y, z], [a[5][0], RIVER_WATER_Y, z], [b[2][0], RIVER_WATER_Y, z + 2], [b[5][0], RIVER_WATER_Y, z + 2]];
    const uv = [[0, z], [1, z], [0, z + 2], [1, z + 2]];
    for (const i of [0, 2, 1, 1, 2, 3]) {waterPos.push(...water[i]);waterUV.push(...uv[i]);}
    for (const side of [1, 6]) shoreLines.push(a[side][0], a[side][1] + .008, z, b[side][0], b[side][1] + .008, z + 2);
  }
  const banks = new T.Mesh(geometry(positions, colors), toon(0xffffff, { vertexColors: true, flatShading: true }));
  banks.receiveShadow = true;group.add(banks);
  const lines = new T.BufferGeometry();lines.setAttribute('position', new T.Float32BufferAttribute(shoreLines, 3));group.add(comicEdges(lines, 1.1));

  const time = { value: 0 }, deep = { value: new T.Color(0x35696b) }, shallow = { value: new T.Color(0x699c83) };
  const waterMaterial = toon(0xffffff);
  const baseCompile = waterMaterial.onBeforeCompile;
  waterMaterial.onBeforeCompile = shader => {
    baseCompile(shader);
    Object.assign(shader.uniforms, { riverTime: time, riverDeep: deep, riverShallow: shallow });
    shader.vertexShader = 'uniform float riverTime; varying vec2 riverUv;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      riverUv = uv;
      float edgeFade = smoothstep(0.0, .12, min(uv.x, 1.0 - uv.x));
      transformed.y += sin(uv.y * 2.0 - riverTime * 1.4 + uv.x * 3.0) * .009 * edgeFade;
    `);
    const bridgeShadows = BRIDGES.map(b => `riverShade = max(riverShade, 1.0 - smoothstep(${(b.d / 2 + .15).toFixed(3)}, ${(b.d / 2 + .9).toFixed(3)}, abs(riverUv.y - ${b.z.toFixed(3)})));`).join('\n');
    shader.fragmentShader = 'uniform float riverTime; uniform vec3 riverDeep; uniform vec3 riverShallow; varying vec2 riverUv;\n' + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float edge = abs(riverUv.x - .5) * 2.0;
      float shoal = smoothstep(.5, 1.0, edge);
      vec2 flow = vec2(riverUv.x * 7.0, riverUv.y - riverTime * .38);
      float ripple = pow(max(0.0, sin(flow.y * 3.2 + sin(flow.x * 2.1 + flow.y * .38) * .7)), 16.0);
      float broken = smoothstep(-.25, .7, sin(flow.x * 5.7 + flow.y * .61));
      float foam = ripple * broken * (1.0 - smoothstep(.78, 1.0, edge));
      float bankGlint = (1.0 - smoothstep(.965, 1.0, edge)) * smoothstep(.91, .965, edge);
      float riverShade = 0.0;
      ${bridgeShadows}
      diffuseColor.rgb = mix(riverDeep, riverShallow, shoal);
      diffuseColor.rgb *= .97 + sin(flow.y * .74 + flow.x * .9) * .045;
      diffuseColor.rgb += vec3(.18, .22, .19) * (foam * .38 + bankGlint * .22);
      diffuseColor.rgb *= 1.0 - riverShade * .28;
    `);
  };
  waterMaterial.customProgramCacheKey = () => 'kampung-river-v1-' + BRIDGES.map(b => `${b.z}:${b.d}`).join(',');
  const water = new T.Mesh(geometry(waterPos, null, waterUV), waterMaterial);
  water.receiveShadow = true;group.add(water);

  const details = riverDetails(), dummy = new T.Object3D();
  const rocks = new T.InstancedMesh(new T.IcosahedronGeometry(1, 0), toon(0x8b8874, { flatShading: true }), details.rocks.length);
  for (const [i, p] of details.rocks.entries()) {
    dummy.position.set(p.x, p.y + p.size * .25, p.z);dummy.rotation.set(.12, p.yaw, .17);dummy.scale.set(p.size, p.size * .7, p.size * 1.2);dummy.updateMatrix();rocks.setMatrixAt(i, dummy.matrix);
  }
  rocks.castShadow = true;rocks.receiveShadow = true;rocks.computeBoundingSphere();group.add(rocks);
  const blades = geometry([-.12,0,0, .08,.55,.04, .12,0,0, 0,0,-.12, .04,.45,.08, 0,0,.12, -.09,0,-.09, .15,.35,.08, .09,0,.09]);
  const grass = new T.InstancedMesh(blades, toon(0x637e42, { side: T.DoubleSide }), details.grass.length);
  for (const [i, p] of details.grass.entries()) {
    dummy.position.set(p.x, p.y, p.z);dummy.rotation.set(0, p.yaw, 0);dummy.scale.setScalar(p.size * 1.7);dummy.updateMatrix();grass.setMatrixAt(i, dummy.matrix);
  }
  grass.computeBoundingSphere();group.add(grass);
  return {
    details,
    update: elapsed => { if (Number.isFinite(elapsed)) time.value = elapsed; },
    snapshot: () => ({ ...riverBounds(), ground: RIVER_GROUND_Y, water: RIVER_WATER_Y, bed: RIVER_BED_Y, time: time.value, triangles: positions.length / 9 + waterPos.length / 9 + details.rocks.length * 20 + details.grass.length * 3, rocks: details.rocks.length, grass: details.grass.length, draws: 5 })
  };
}

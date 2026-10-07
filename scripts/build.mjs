import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/vendor', { recursive: true });
for (const path of ['index.html', 'styles.css', 'src', 'assets', '.nojekyll']) await cp(path, `dist/${path}`, { recursive: true });
for (const name of ['three.module.js', 'three.core.js']) await cp(`node_modules/three/build/${name}`, `dist/vendor/${name}`);
// The glTF loader and its two helpers, for the motion-captured characters.
for (const name of ['loaders/GLTFLoader.js', 'utils/SkeletonUtils.js', 'utils/BufferGeometryUtils.js']) await cp(`node_modules/three/examples/jsm/${name}`, `dist/vendor/addons/${name}`);
await cp('node_modules/three/LICENSE', 'dist/vendor/THREE-LICENSE.txt');
console.log('Built dist/ — self-contained, no runtime CDN or API dependencies.');

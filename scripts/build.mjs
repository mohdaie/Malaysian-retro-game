import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/vendor', { recursive: true });
for (const path of ['index.html', 'styles.css', 'src', 'assets', '.nojekyll']) await cp(path, `dist/${path}`, { recursive: true });
for (const name of ['three.module.js', 'three.core.js']) await cp(`node_modules/three/build/${name}`, `dist/vendor/${name}`);
await cp('node_modules/three/LICENSE', 'dist/vendor/THREE-LICENSE.txt');
console.log('Built dist/ — self-contained, no runtime CDN or API dependencies.');

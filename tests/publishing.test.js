import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
test('direct branch publishing includes the browser runtime and module dependencies', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const importMap = JSON.parse(html.match(/<script type="importmap">([^<]+)<\/script>/)[1]);
  assert.equal(importMap.imports.three, './vendor/three.module.js');
  const module = await readFile(resolve(root, importMap.imports.three), 'utf8');
  const relativeImports = [...module.matchAll(/from\s*['"](\.[^'"]+)['"]/g)].map(match => match[1]);
  assert.ok(relativeImports.includes('./three.core.js'));
  for (const path of relativeImports) await access(resolve(root, 'vendor', path));
  await access(resolve(root, '.nojekyll'));
  await access(resolve(root, 'vendor/THREE-LICENSE.txt'));
  await access(resolve(root, 'src/boot.js'));
  for (const file of ['kampung-grass.webp', 'kampung-timber.webp', 'illustrated-horizon.webp', 'illustrated-grass-patch.webp']) await access(resolve(root, 'assets/textures', file));
});
test('HTML and bootstrap advance together so cached pages load the current game', async () => {
  const { version } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const boot = await readFile(resolve(root, 'src/boot.js'), 'utf8');
  assert.ok(html.includes(`./styles.css?v=${version}`));
  assert.ok(html.includes(`./src/boot.js?v=${version}`));
  assert.ok(boot.includes(`./main.js?v=${version}`));
});
test('checked-in runtime exactly matches the pinned installed dependency', async () => {
  for (const path of ['three.module.js', 'three.core.js']) {
    const [published, installed] = await Promise.all([readFile(resolve(root, 'vendor', path)), readFile(resolve(root, 'node_modules/three/build', path))]);
    assert.ok(published.equals(installed), `${path} must match the pinned dependency`);
  }
});
test('the map editor is rebuilt from the current layout code and plan', async () => {
  const { buildEditor, page } = await import('../scripts/editor.mjs');
  const built = page(await buildEditor()), committed = await readFile(resolve(root, 'tools/map-editor.html'), 'utf8');
  assert.equal(committed, built, 'run `npm run editor` after changing town-layout.js, town-plan.js or the editor template');
});

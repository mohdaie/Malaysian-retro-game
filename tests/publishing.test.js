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
});
test('checked-in runtime exactly matches the pinned installed dependency', async () => {
  for (const path of ['three.module.js', 'three.core.js']) {
    const [published, installed] = await Promise.all([readFile(resolve(root, 'vendor', path)), readFile(resolve(root, 'node_modules/three/build', path))]);
    assert.ok(published.equals(installed), `${path} must match the pinned dependency`);
  }
});

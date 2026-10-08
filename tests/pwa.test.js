import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { buildPwa } from '../scripts/pwa-build.mjs';

const template = new URL('../sw.js', import.meta.url);
const scope = 'https://mohdaie.github.io/Malaysian-retro-game/';
async function worker() {
  const listeners = {}, deleted = [], fetched = [], added = [];
  const entries = new Map([
    [new URL('index.html', scope).href, new Response('offline town')],
    [new URL('src/main.js', scope).href, new Response('offline module')],
    [new URL('assets/music.mp3', scope).href, new Response('0123456789', { headers: { 'Content-Type': 'audio/mpeg' } })]
  ]);
  const cache = {
    match: async url => entries.get(String(url))?.clone(),
    addAll: async requests => added.push(...requests.map(request => request.url))
  };
  let claimed = false;
  const context = {
    URL, Request, Response, Headers,
    self: { registration: { scope }, addEventListener: (name, handler) => { listeners[name] = handler; }, clients: { claim: async () => { claimed = true; } } },
    caches: { open: async () => cache, keys: async () => ['retro-malaysia:/Malaysian-retro-game/:old', 'retro-malaysia:/Malaysian-retro-game/:test', 'retro-malaysia:/Other-game/:old', 'runsgd'], delete: async key => deleted.push(key) },
    fetch: async request => { fetched.push(request.url); return new Response('network'); }
  };
  const source = (await readFile(template, 'utf8')).replace("const RELEASE = 'development';", "const RELEASE = 'test';")
    .replace('const PRECACHE = [];', 'const PRECACHE = ["index.html","src/main.js","assets/music.mp3"];');
  vm.runInNewContext(source, context);
  const request = async (path, options = {}) => {
    let response;
    const req = new Request(new URL(path, scope), { method: options.method || 'GET', headers: options.headers });
    Object.defineProperty(req, 'mode', { value: options.mode || 'cors' });
    listeners.fetch({ request: req, respondWith: value => { response = value; } });
    return response ? await response : undefined;
  };
  return { listeners, request, added, deleted, fetched, get claimed() { return claimed; } };
}

test('manifest and icons identify a standalone game under the Pages subfolder', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.name, 'Retro Malaysia');
  for (const key of ['id', 'start_url', 'scope']) assert.equal(new URL(manifest[key], new URL('manifest.webmanifest', scope)).href, scope);
  assert.equal(manifest.display, 'fullscreen');
  assert.equal(manifest.orientation, 'landscape');
  assert.equal(manifest.prefer_related_applications, false);
  for (const icon of manifest.icons) {
    const png = await readFile(new URL(`../${icon.src}`, import.meta.url));
    assert.equal(png.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /rel="manifest" href="\.\/manifest.webmanifest"/);
  assert.match(html, /type="module" src="\.\/src\/pwa.js/);
});

test('build release changes with file contents and includes nested game assets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'retro-pwa-'));
  try {
    await mkdir(join(root, 'src'));
    await writeFile(join(root, 'index.html'), 'town');
    await writeFile(join(root, 'src/main.js'), 'old');
    await writeFile(join(root, 'manifest.webmanifest'), '{}');
    await writeFile(join(root, 'admin.html'), 'admin');
    const first = await buildPwa(root, template);
    assert.deepEqual(first.files, ['index.html', 'src/main.js']);
    assert.equal((await buildPwa(root, template)).release, first.release);
    await writeFile(join(root, 'src/main.js'), 'new');
    const next = await buildPwa(root, template);
    assert.notEqual(next.release, first.release);
    assert.match(await readFile(join(root, 'sw.js'), 'utf8'), new RegExp(next.release));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('install precaches scoped files and activation only cleans this game', async () => {
  const w = await worker();
  let promise;
  w.listeners.install({ waitUntil: p => { promise = p; } }); await promise;
  assert.equal(w.added.length, 3);
  assert.ok(w.added.every(url => url.startsWith(scope)));
  w.listeners.activate({ waitUntil: p => { promise = p; } }); await promise;
  assert.deepEqual(w.deleted, ['retro-malaysia:/Malaysian-retro-game/:old']);
  assert.equal(w.claimed, true);
});

test('offline navigation and versioned modules come from the same cached release', async () => {
  const w = await worker();
  assert.equal(await (await w.request('./?from=homescreen', { mode: 'navigate' })).text(), 'offline town');
  assert.equal(await (await w.request('src/main.js?v=2.8.1')).text(), 'offline module');
  assert.deepEqual(w.fetched, []);
});

test('other apps, the manifest, unknown assets and writes are not intercepted', async () => {
  const w = await worker();
  for (const path of ['https://github.com/', '/Other-game/index.html', 'manifest.webmanifest', 'unknown.json']) assert.equal(await w.request(path), undefined);
  assert.equal(await w.request('src/main.js', { method: 'POST' }), undefined);
});

test('the admin page and its health checks always reach the network', async () => {
  const w = await worker();
  assert.equal(await w.request('admin.html', { mode: 'navigate' }), undefined);
  assert.equal(await w.request('admin.html#access_token=x', { mode: 'navigate' }), undefined);
  assert.equal(await w.request('src/main.js?v=2.8.1&health=1'), undefined);
  assert.equal(await (await w.request('./', { mode: 'navigate' })).text(), 'offline town');
});

test('offline audio supports byte ranges and rejects ranges past the end', async () => {
  const w = await worker();
  const middle = await w.request('assets/music.mp3', { headers: { Range: 'bytes=2-5' } });
  assert.equal(middle.status, 206); assert.equal(await middle.text(), '2345');
  assert.equal(middle.headers.get('Content-Range'), 'bytes 2-5/10');
  const suffix = await w.request('assets/music.mp3', { headers: { Range: 'bytes=-3' } });
  assert.equal(await suffix.text(), '789');
  assert.equal((await w.request('assets/music.mp3', { headers: { Range: 'bytes=12-' } })).status, 416);
});

test('a rejected precache install is not silently activated over the running game', async () => {
  const source = await readFile(template, 'utf8');
  let install;
  vm.runInNewContext(source, {
    URL, Request,
    self: { registration: { scope }, addEventListener: (name, fn) => { if(name === 'install') install = fn; } },
    caches: { open: async () => ({ addAll: async () => { throw Error('missing asset'); } }) }
  });
  let promise; install({ waitUntil: p => { promise = p; } });
  await assert.rejects(promise, /missing asset/);
});

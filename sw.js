// The build replaces these two declarations with a content hash and file list.
const RELEASE = 'development';
const PRECACHE = [];
const ROOT = self.registration.scope;
const PREFIX = `retro-malaysia:${new URL(ROOT).pathname}:`;
const CACHE = `${PREFIX}${RELEASE}`;
const files = new Set(PRECACHE.map(path => new URL(path, ROOT).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll is atomic: a missing file cannot leave a partially installed game.
    await cache.addAll(PRECACHE.map(path => new Request(new URL(path, ROOT), { cache: 'reload' })));
  })());
  // No skipWaiting: keep a running game's HTML, modules and art on one release.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== new URL(ROOT).origin || !url.href.startsWith(ROOT)) return;
  // The admin page and its health checks always go to the network: they
  // must see what is published now, not this device's offline copy.
  if (url.pathname.endsWith('/admin.html') || url.searchParams.has('health')) return;
  if (request.mode === 'navigate') {
    // Serve this release's entrypoint even online. A background worker update
    // prepares the next complete release while progress stays on this origin.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return await cache.match(new URL('index.html', ROOT).href) || fetch(request);
    })());
    return;
  }
  // The manifest stays fresh for Chrome's installer. Only known game files are
  // handled; other Pages projects, APIs and non-GET requests pass through.
  if (url.pathname.endsWith('/manifest.webmanifest')) return;
  url.search = '';
  url.hash = '';
  if (!files.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const response = await cache.match(url.href);
    if (!response) return fetch(request);
    // Support seeking in the offline soundtrack as well as ordinary file loads.
    const range = request.headers.get('range');
    if (!range) return response;
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return response;
    const bytes = await response.arrayBuffer();
    const size = bytes.byteLength;
    const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    const end = match[1] ? (match[2] ? Math.min(Number(match[2]), size - 1) : size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    const headers = new Headers(response.headers);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    headers.set('Accept-Ranges', 'bytes');
    headers.delete('Content-Encoding');
    return new Response(bytes.slice(start, end + 1), { status: 206, headers });
  })());
});

// Anonymous game-health reports for the admin page (admin.html), v2.12.
// A classic script loaded before boot.js, so it also sees startup failures.
// It sends, to the game's Supabase project:
//   open       version, phone/tablet/desktop, browser or installed app, screen
//   perf       load time and frame rate after a minute of play (once a visit)
//   error      uncaught errors and rejections (message, file:line, short stack)
//   load_fail  whatever the error panel tells the player
// Identity is a random device id kept in this browser and a random id per
// visit: no names, saves, IP addresses or cookies. Reports go only from the
// published site (or any host with ?telemetry), and setting localStorage
// 'retro-malaysia-notrack' to '1' turns them off. Every failure is ignored:
// reporting can never stop the game.
(() => {
  const ENDPOINT = 'https://wkzrefbvjxqphkrduyqj.supabase.co/rest/v1/rpc/retro_report';
  const KEY = 'sb_publishable_Gn24T5ilCXGtftxWUOUOMA_C1kd6CPE';
  const HOSTS = ['retromalaysia.space', 'www.retromalaysia.space', 'mohdaie.github.io'];
  let store = null;
  try { store = localStorage; } catch { /* private mode */ }
  const read = key => { try { return store?.getItem(key) ?? null; } catch { return null; } };
  const params = new URLSearchParams(location.search);
  // The admin page's live check loads the game with ?healthcheck: not a visitor.
  const enabled = read('retro-malaysia-notrack') !== '1' && !params.has('healthcheck') && (HOSTS.includes(location.hostname) || params.has('telemetry'));
  const version = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || 'unknown';
  const randomId = () => {
    try { return crypto.randomUUID().replace(/-/g, ''); } catch { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  };
  let device = read('retro-malaysia-device');
  if (!device || !/^[A-Za-z0-9_-]{8,40}$/.test(device)) { device = randomId(); try { store?.setItem('retro-malaysia-device', device); } catch { /* ignore */ } }
  const session = randomId();
  const send = (kind, data) => {
    if (!enabled) return;
    try {
      fetch(ENDPOINT, {
        method: 'POST', keepalive: true, headers: { apikey: KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_kind: kind, p_device: device, p_session: session, p_version: version, p_data: data })
      }).catch(() => {});
    } catch { /* ignore */ }
  };
  const clip = (text, n) => String(text ?? '').slice(0, n);
  const local = text => clip(text, 2000).split(location.origin).join('');

  // The visit: coarse device facts only.
  const ua = navigator.userAgent;
  const coarse = matchMedia('(pointer: coarse)').matches, short = Math.min(screen.width, screen.height);
  send('open', {
    form: coarse ? (short < 600 ? 'phone' : 'tablet') : 'desktop',
    mode: matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'app' : 'browser',
    os: /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && coarse) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'other',
    browser: /SamsungBrowser/.test(ua) ? 'Samsung' : /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'other',
    screen: `${screen.width}x${screen.height}`, dpr: Math.round((devicePixelRatio || 1) * 100) / 100,
    lang: clip(navigator.language, 12)
  });

  // Errors: each distinct message once per visit, at most eight.
  const seen = new Set();
  const report = (kind, message, where, stack) => {
    const key = kind + message + where;
    if (seen.has(key) || seen.size >= 8) return;
    seen.add(key);
    send(kind, { message: clip(message, 300), where: clip(local(where), 200), stack: clip(local(stack), 1200), screen: document.getElementById('error-panel')?.hidden === false ? 'error-panel' : 'game' });
  };
  addEventListener('error', event => {
    const target = event.target;
    // A file that failed to load (script, image, audio) rather than code.
    if (target && target !== window && (target.src || target.href)) report('error', `Failed to load ${target.tagName.toLowerCase()}`, target.src || target.href, '');
    else report('error', event.message || 'Error', `${event.filename || ''}:${event.lineno || 0}:${event.colno || 0}`, event.error?.stack || '');
  }, true);
  addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    report('error', reason?.message || String(reason), 'promise', reason?.stack || '');
  });

  let loadMs = null;
  const watch = () => {
    // The error panel is what a stuck player sees: report its text.
    const panel = document.getElementById('error-panel'), loading = document.getElementById('loading');
    if (panel) new MutationObserver(() => {
      if (!panel.hidden) report('load_fail', document.getElementById('error-text')?.textContent || 'Error panel shown', loadMs == null ? 'startup' : 'play', '');
    }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    if (loading) {
      const done = () => { if (loading.hidden && loadMs == null) { loadMs = Math.round(performance.now()); measure(); } };
      new MutationObserver(done).observe(loading, { attributes: true, attributeFilter: ['hidden'] }); done();
    }
  };
  // Frame rate over 20 visible seconds, starting a minute after loading.
  function measure() {
    let frames = 0, start = 0, sent = false;
    const tick = now => {
      if (sent) return;
      if (document.hidden) { start = 0; frames = 0; }
      else if (!start) start = now;
      else if (++frames && now - start >= 20000) {
        sent = true;
        let mode = null;
        try { mode = window.retroMalaysia?.snapshot().mode ?? null; } catch { /* ignore */ }
        send('perf', { fps: Math.round(frames * 10000 / (now - start)) / 10, loadMs, mode, w: innerWidth, h: innerHeight });
        return;
      }
      requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 60000);
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', watch); else watch();
})();

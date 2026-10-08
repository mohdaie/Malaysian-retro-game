import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/telemetry.js', import.meta.url), 'utf8');
// Run the reporter in a fake page and collect what it would send.
function run({ host = 'retromalaysia.space', search = '', stored = {} } = {}) {
  const sent = [], listeners = {}, storage = new Map(Object.entries(stored));
  const context = {
    location: { hostname: host, search, origin: `https://${host}` },
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)) },
    document: { currentScript: { src: `https://${host}/src/telemetry.js?v=9.8.7` }, readyState: 'complete', getElementById: () => null },
    navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile', language: 'ms-MY' },
    screen: { width: 412, height: 915 }, devicePixelRatio: 2.625,
    matchMedia: query => ({ matches: query === '(pointer: coarse)' }),
    crypto: { randomUUID: () => '1234abcd-0000-4000-8000-00000000abcd' },
    fetch: (url, options) => { sent.push({ url, body: JSON.parse(options.body), headers: options.headers }); return Promise.resolve(); },
    addEventListener: (name, handler) => { listeners[name] = handler; },
    URLSearchParams, String, JSON, Math, Date, Set,
    MutationObserver: class { observe() {} }, performance: { now: () => 0 }, requestAnimationFrame: () => {}, setTimeout: () => {}
  };
  context.window = context;
  vm.runInNewContext(source, context);
  return { sent, listeners, storage };
}

test('the published game reports one anonymous visit with coarse device facts', () => {
  const { sent, storage } = run();
  assert.equal(sent.length, 1);
  const { body, url, headers } = sent[0];
  assert.match(url, /\/rest\/v1\/rpc\/retro_report$/);
  assert.ok(headers.apikey.startsWith('sb_publishable_'));
  assert.equal(body.p_kind, 'open');
  assert.equal(body.p_version, '9.8.7');
  assert.match(body.p_device, /^[A-Za-z0-9_-]{8,40}$/);
  assert.equal(storage.get('retro-malaysia-device'), body.p_device);
  assert.deepEqual({ form: body.p_data.form, mode: body.p_data.mode, os: body.p_data.os, browser: body.p_data.browser }, { form: 'phone', mode: 'browser', os: 'Android', browser: 'Chrome' });
});

test('development, opted-out browsers and the admin live check send nothing', () => {
  assert.equal(run({ host: 'localhost' }).sent.length, 0);
  assert.equal(run({ stored: { 'retro-malaysia-notrack': '1' } }).sent.length, 0);
  assert.equal(run({ search: '?healthcheck=123' }).sent.length, 0);
  assert.equal(run({ host: 'localhost', search: '?telemetry' }).sent.length, 1);
});

test('errors are reported once each, with the site origin removed', () => {
  const { sent, listeners } = run();
  const error = { message: 'Boom', filename: 'https://retromalaysia.space/src/main.js?v=9.8.7', lineno: 12, colno: 3, error: { stack: 'Error: Boom\n at https://retromalaysia.space/src/main.js:12:3' }, target: null };
  listeners.error(error); listeners.error(error);
  const errors = sent.filter(s => s.body.p_kind === 'error');
  assert.equal(errors.length, 1);
  assert.equal(errors[0].body.p_data.where, '/src/main.js?v=9.8.7:12:3');
  assert.ok(!errors[0].body.p_data.stack.includes('retromalaysia.space'));
});

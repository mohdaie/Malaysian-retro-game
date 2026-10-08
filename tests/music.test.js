import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_SETTINGS_KEY, DEFAULT_AUDIO, readAudioSettings, saveAudioSettings } from '../src/music.js';

test('audio preferences survive unavailable or malformed browser storage', () => {
  assert.deepEqual(readAudioSettings(null), DEFAULT_AUDIO);
  assert.deepEqual(readAudioSettings({ getItem() { throw Error('blocked'); } }), DEFAULT_AUDIO);
  assert.deepEqual(readAudioSettings({ getItem: () => '{broken' }), DEFAULT_AUDIO);
  assert.doesNotThrow(() => saveAudioSettings({ setItem() { throw Error('quota'); } }, DEFAULT_AUDIO));
});
test('old or corrupt audio values cannot cause an invalid gain or turn music back on', () => {
  const storage = { getItem: () => JSON.stringify({ musicEnabled: false, musicVolume: 900, ambienceEnabled: 'yes', ambienceVolume: -4 }) };
  assert.deepEqual(readAudioSettings(storage), { musicEnabled: false, musicVolume: 1, ambienceEnabled: false, ambienceVolume: 0 });
  assert.equal(readAudioSettings({ getItem: () => '{"musicVolume":null}' }).musicVolume, .3);
});
test('muting music and setting ambience volume persists independently of player saves', () => {
  const data = new Map([['retro-malaysia-save-amir', 'existing journey']]);
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const settings = { musicEnabled: false, musicVolume: .16, ambienceEnabled: true, ambienceVolume: .6 };
  saveAudioSettings(storage, settings);
  assert.ok(data.has(AUDIO_SETTINGS_KEY));
  assert.deepEqual(readAudioSettings(storage), settings);
  assert.equal(data.get('retro-malaysia-save-amir'), 'existing journey');
});

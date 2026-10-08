// Stream the bundled soundtrack rather than decoding two minutes into a PCM buffer.
export const AUDIO_SETTINGS_KEY = 'retro-malaysia-audio-v1';
export const DEFAULT_AUDIO = Object.freeze({ musicEnabled: true, musicVolume: .3, ambienceEnabled: false, ambienceVolume: 1 });
const volume = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
export function readAudioSettings(storage) {
  let saved;
  try { saved = JSON.parse(storage?.getItem(AUDIO_SETTINGS_KEY) || 'null'); } catch { /* private or unavailable storage */ }
  return {
    musicEnabled: typeof saved?.musicEnabled === 'boolean' ? saved.musicEnabled : DEFAULT_AUDIO.musicEnabled,
    musicVolume: volume(saved?.musicVolume, DEFAULT_AUDIO.musicVolume),
    ambienceEnabled: typeof saved?.ambienceEnabled === 'boolean' ? saved.ambienceEnabled : DEFAULT_AUDIO.ambienceEnabled,
    ambienceVolume: volume(saved?.ambienceVolume, DEFAULT_AUDIO.ambienceVolume)
  };
}
export function saveAudioSettings(storage, settings) {
  try { storage?.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings)); } catch { /* settings still work for this session */ }
}

export function createMusic({ enabled = true, level = .3, onStatus = () => {} } = {}) {
  let active = false, media = null, context = null, gain = null, pending = null, disposed = false;
  level = volume(level, .3);
  const wanted = () => !disposed && active && enabled && level > 0;
  function init() {
    if (media) return;
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    context = new Context();
    media = new Audio();
    media.id = 'kampung-music'; media.hidden = true; media.preload = 'none'; media.loop = true;
    media.src = new URL('../assets/audio/sore-kampung-loop.mp3', import.meta.url).href;
    media.addEventListener('error', () => onStatus('Music unavailable · switch music off and on to retry.'));
    document.body.append(media);
    gain = context.createGain(); gain.gain.value = level;
    context.createMediaElementSource(media).connect(gain); gain.connect(context.destination);
  }
  function sync() {
    if (!wanted()) {
      media?.pause();
      if (context && context.state !== 'closed') void context.suspend().catch(() => {});
      onStatus(enabled && level > 0 ? 'Sore Kampung · ready when you play' : 'Sore Kampung · muted');
      return Promise.resolve();
    }
    if (pending) return pending;
    try {
      init();
      if (!media.paused && context.state === 'running') return Promise.resolve();
      onStatus('Sore Kampung · loading…');
      // Both calls happen inside the starting click/tap, before awaiting anything.
      pending = Promise.all([context.resume(), media.play()]).then(() => {
        if (!wanted()) { media.pause(); void context.suspend().catch(() => {}); }
        else onStatus('Sore Kampung · playing on repeat');
      }).catch(error => {
        if (!wanted() || error.name === 'AbortError') return;
        media.pause(); void context.suspend().catch(() => {});
        onStatus(error.name === 'NotAllowedError' ? 'Tap the game to start music.' : 'Music unavailable · switch music off and on to retry.');
      }).finally(() => { pending = null; });
      return pending;
    } catch {
      onStatus('Music is unavailable on this device.');
      return Promise.resolve();
    }
  }
  return {
    setActive(value) { active = Boolean(value); return sync(); },
    setEnabled(value) { enabled = Boolean(value); return sync(); },
    setVolume(value) { level = volume(value, level); if (gain) gain.gain.setTargetAtTime(level, context.currentTime, .04); return sync(); },
    sync,
    snapshot: () => ({ enabled, volume: level, active, playing: Boolean(media && !media.paused && context.state === 'running'), position: media?.currentTime || 0, duration: Number.isFinite(media?.duration) ? media.duration : null }),
    dispose() { disposed = true; media?.pause(); if (media) { media.removeAttribute('src'); media.load(); media.remove(); } void context?.close().catch(() => {}); }
  };
}

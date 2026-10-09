// The opening film before a new story: Scene 1 and the phone gallery, built in
// intro/ and exported to assets/video/intro.mp4. It is streamed, not part of the
// offline package, so any failure (offline, blocked playback, a stall) simply
// carries on into the game.
export const INTRO_VIDEO = 'assets/video/intro.mp4';
export const SKIP_AFTER = 1.5;
export const STALL_LIMIT = 8;

export function playIntro(root, { src = INTRO_VIDEO, onDone }) {
  const wrap = document.createElement('section'), video = document.createElement('video'), skip = document.createElement('button');
  wrap.className = 'intro-film'; wrap.setAttribute('aria-label', 'Intro');
  video.src = src; video.playsInline = true; video.preload = 'auto'; video.setAttribute('playsinline', '');
  skip.type = 'button'; skip.className = 'intro-skip'; skip.textContent = 'Langkau ›'; skip.hidden = true;
  wrap.append(video, skip); root.append(wrap);
  let finished = false, started = false;
  const timers = [setTimeout(() => { skip.hidden = false; }, SKIP_AFTER * 1000), setTimeout(() => { if (!started) finish(); }, STALL_LIMIT * 1000)];
  // The film ends on black, so fading the cover reveals the town from black.
  function finish() {
    if (finished) return; finished = true; timers.forEach(clearTimeout);
    video.pause(); wrap.classList.add('done'); setTimeout(() => { video.removeAttribute('src'); video.load(); wrap.remove(); }, 700);
    onDone();
  }
  video.addEventListener('playing', () => { started = true; });
  video.addEventListener('ended', finish); video.addEventListener('error', finish);
  skip.onclick = finish;
  // The start button is the user gesture; if sound is still refused, play muted.
  video.play().catch(() => { video.muted = true; video.play().catch(finish); });
  return { skip: finish, pause: () => video.pause(), resume: () => { if (!finished) video.play().catch(() => {}); } };
}

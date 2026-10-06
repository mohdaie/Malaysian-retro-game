// Gameplay uses landscape on every device. Browser orientation locking is best
// effort; the portrait gate remains authoritative when a browser denies a lock.
// Third-person chase view: a wide lens a few metres behind the shoulders,
// looking slightly down so the street ahead and the horizon stay in frame.
export const CAMERA_NEAR = 3;
export const CAMERA_FAR = 12;
export const CAMERA_DEFAULT = 4.4;
export const CAMERA_PITCH = .2;
export const CAMERA_LOOK_HEIGHT = 1.15;
export const CAMERA_FOV = 58;
export function needsLandscape(width, height) { return width < height; }
export async function enterLandscape(element, screenObject = globalThis.screen, documentObject = globalThis.document) {
  if (!documentObject.fullscreenElement && element.requestFullscreen) {
    try { await element.requestFullscreen(); } catch { /* Rotate prompt covers browsers that deny fullscreen. */ }
  }
  try { await screenObject.orientation?.lock?.('landscape'); } catch { /* Not every mobile browser supports locking. */ }
}

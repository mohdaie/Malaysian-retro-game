// Gameplay uses landscape on every device. Browser orientation locking is best
// effort; the portrait gate remains authoritative when a browser denies a lock.
export const CAMERA_NEAR = 12;
export const CAMERA_FAR = 28;
export const CAMERA_DEFAULT = 14;
export function needsLandscape(width, height) { return width < height; }
export async function enterLandscape(element, screenObject = globalThis.screen, documentObject = globalThis.document) {
  if (!documentObject.fullscreenElement && element.requestFullscreen) {
    try { await element.requestFullscreen(); } catch { /* Rotate prompt covers browsers that deny fullscreen. */ }
  }
  try { await screenObject.orientation?.lock?.('landscape'); } catch { /* Not every mobile browser supports locking. */ }
}

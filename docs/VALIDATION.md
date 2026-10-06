# v0.1.0 validation

## Automated rules and save checks

`npm test`: **9 tests passed**.

The board suite covers initialization, legal houses, extra turns, capture, relay sowing, skipped opposing store, final sweep, and 30 complete simulated games. Every animation frame preserves the original 98 shells between the board and the sowing hand. The save suite covers roundtrip serialization, invalid coordinates/version/quest rejection, malformed JSON and unavailable storage.

`npm run build`: passed. Output includes local Three.js modules and its MIT license. No external requests are required to play.

## Browser checks

Headless Chromium with software WebGL; desktop 1440×900, mobile emulation 390×844 and landscape 844×390.

- Title → new story, player movement, map, pause/resume and reload/continue: passed.
- Pak Mat dialogue → congkak → complete round → chapter completion → return to world: passed. The observed round finished 30–68 after 13 player moves, with the chapter correctly completing even after a loss.
- Customized Aiman/Aina names and Nur dialogue → next quest: passed.
- Mobile joystick: moved the character 3.39 world metres in the interaction check.
- Mobile Talk button, map, camera rotation, landscape controls and cancellation of saved-game replacement: passed.
- No page JavaScript errors in either successful browser check.

The mobile interaction check caught an input-layering issue where the transparent controls wrapper intercepted Talk taps. It was corrected and the actual tap sequence passed on rerun.

## Limits

Phone checks use browser emulation, not a physical Android/iOS device. GPU performance and long-session behavior still need real-device testing. Architecture and characters use original simplified procedural geometry rather than final artwork. Other games, building interiors and later chapters are not present. Congkak uses the documented introductory turn-based variant.

## v0.1.1 — direct Pages startup fix

The deployed branch site served the HTML and source modules, but both `vendor/three.module.js` and `vendor/three.core.js` returned HTTP 404. The initial tests used a development-server dependency alias or the built `dist/` folder, which concealed the incomplete repository-root deployment.

The pinned Three.js browser runtime and license now ship in the repository, with `.nojekyll`. A dynamic bootstrap catches module-load errors and provides a retry message; a 30-second timeout handles stalled startup. Two publishing tests check root asset completeness and exact correspondence with the pinned dependency.

`npm test`: **11 tests passed**. Browser validation served the repository directly under `/Malaysian-retro-game/`, without the development server or build aliases, and successfully entered gameplay in mobile landscape. No missing assets or page errors occurred. A second browser run intentionally returned 404 for the runtime and confirmed that the loading overlay was replaced by the retry error.

## v0.2.0 — landscape, gesture camera and visual pass

`npm test`: **14 tests passed**. New display checks cover portrait/landscape decisions, fullscreen-before-orientation-lock ordering and denied/unavailable browser APIs.

Mobile-emulated browser checks passed for the portrait gate, landscape start, the closer default distance (14 versus the previous 27), camera-button removal, drag/swipe orbit and tilt without moving the player, returning to portrait without movement or lost quest state, and the joystick after returning to landscape. Actual multi-touch events verified pinch zoom and simultaneous joystick movement plus camera swipe. No page JavaScript or renderer errors occurred. Fullscreen denial was deliberately emulated for the rotate-prompt path; native orientation behavior still needs a physical-device check.

The visual pass adds original procedural grass/timber/dirt textures, shutter and porch details, foliage and curved palm fronds. Lighting is less washed out, roof face normals are corrected, texture UVs survive static batching, and a smaller following shadow region improves local shadow definition. This remains simplified procedural artwork rather than final character/environment assets.

Changed styles and scene modules use versioned URLs so an earlier cached scene cannot be mixed with the new camera code.

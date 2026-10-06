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

## v0.3.0 — prototype design and comfortable movement

`npm test`: **18 tests passed**. New movement checks cover analog input across different joystick radii, diagonal clamping, equal travel at 60/10/5 FPS, and a thin-wall collision/sliding case during a long running frame. Publishing checks now verify that HTML, CSS, bootstrap and main-module cache keys advance together, and generated texture assets exist in root publishing.

Walking is 7.2 world metres/second (previously 4.8), running is 11 (previously 8). The joystick base is 144 px with a 60 px grip, or 128 px on very short landscape screens. Input radius derives from rendered dimensions. Blur, portrait and menu transitions release held controls.

Browser checks under direct `/Malaysian-retro-game/` hosting covered landscape controls, independent swipe/tilt, actual two-touch pinch, simultaneous movement/viewing, portrait pause/resume and the short-screen control. Full chapter checks reached Nur using faster movement, advanced her dialogue, enabled/disabled local sound, played a complete congkak round in 13 player moves, returned to exploration and restored completed progress after reload. Root and built-folder hosting loaded all generated textures. An intentionally missing grass asset showed the retry error rather than leaving the loader stuck.

The visual pass replaces character blocks with original shaped and jointed meshes, integrates generated ground/timber assets, adds roof/architecture/vehicle/warung detail, finishes the wooden board presentation and supplies original synthesized ambience/foley. Static scenery uses spatial batching; character details merge per joint/material. View samples before the final occlusion adjustment submitted 123,154 triangles in the pekan and 82,100 by the mosque, compared with 239,420 in the earlier unpartitioned view. These are renderer workload observations, not physical-device FPS claims.

No page or renderer errors and no missing assets occurred in the successful root-hosted chapter check. Screenshots are `landscape-gameplay-v030.png`, `title-v030.png`, `warung-v030.png`, `pekan-v030.png`, `mosque-v030.png` and `congkak-v030.png`. Physical Android/iPhone GPU performance and native orientation locking remain unmeasured here.

The final camera check restored a position behind the warung and confirmed a blocking roof faded while Amir remained visible. The updated view submitted 120,022 triangles. The complete landscape/multi-touch checks then passed again without errors; the observed starting view submitted 114,890 triangles. Camera diagnostics are read-only.

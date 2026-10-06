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

## v0.4.0 — reference characters and illustrated rendering

`npm test`: **18 tests passed**; the publishing asset check includes the new horizon. `npm run build`: passed. Actual front/side/back renders of Amir and Nur use the same module and materials as the game: `character-turnaround-v040.png`. Six character views submit 83,529 triangles including their separate ink hulls, or about 6,961 surface triangles per character before the hull pass. The initial mobile gameplay view submits 101,456 triangles and 449 calls. These workload counts include shadows/ink where applicable and are not physical-phone FPS results.

Direct repository-root browser checks passed for startup, the illustrated shader compilation, the new panorama, reaching Nur, dialogue advancement, sound toggling, a complete congkak game (13 player moves), chapter completion, save/reload, pekan and mosque views, and built-folder startup. No page or renderer errors or missing assets occurred. An intentionally missing texture still produces the retry screen instead of hanging.

Landscape regression passed for portrait gating, start, 14-unit camera distance, swipe orbit and tilt independent of movement, portrait freezing/resume, 144/60 px joystick dimensions, actual multi-touch pinch, simultaneous movement/viewing and the 128 px short-screen control. The new taller characters' interaction markers sit above their heads.

Building occlusion is checked with the new ink lines: blocking surfaces fade and their lines soften/hide with them. The lower camera view demonstrates the painted scenery around the 3D streets (`illustrated-street-v040.png`). Current screenshots also include `landscape-gameplay-v040.png`, `title-v040.png`, `warung-v040.png`, `pekan-v040.png`, `mosque-v040.png` and `congkak-v040.png`. Physical-phone performance remains unmeasured.

## v0.5.0 — proportions, illustrated grass and walking

`npm test`: **21 tests passed**. The new locomotion checks cover flat support feet, positive swing clearance, continuous cycle boundaries, two-bone foot-target accuracy for walking and running, non-reversed knees and settling after stopping. Build passes; root publishing includes the transparent grass asset.

Actual model rendering checks normalized Amir to 1.50 m and Nur to 1.48 m. The standing models and their new hip/chest/knee/ankle poses are captured in `walking-poses-v050.png`; `walking-preview-v050.mp4` records those same meshes animating. Over 120 walking samples, the lowest shoe bound remained at 0.06499 m against a 0.055 m review floor, with the highest sole at 0.13606 m during swing. These are rendered-geometry measurements, not claims about world-locked motion capture or physical-device FPS.

The school uses a full 38 × 10 m classroom block and 9 × 20 m side wing. Direct browser movement passed north along the main road from (-25,-48) to (-25,-54.73), and stopped at z=-44.44 when walking into the classroom front from its corridor. The school footprint therefore clears the road and its collider matches the visible wall. `school-proportions-v050.png` is an overview with the camera at 14; gameplay defaults to 8 to preserve avatar readability. `shop-proportions-v050.png` demonstrates the corrected child-to-shop scale. Raised courts, paths and floors supply the standing ground height.

The transparent illustrated grass/clover/leaf patches load and render over the lawn, masked beneath roads and paths. The full chapter regression passed Nur's dialogue, sound toggling, a complete congkak round (13 player moves), return to exploration and completed save/reload. Root and built-folder loading passed with no page/renderer errors or missing assets; intentional asset failure still shows retry. The landscape regression passed swipe/tilt, portrait freeze/resume, actual two-touch pinch, simultaneous joystick/camera use and both joystick sizes, with the new 8-unit camera and 6–20 zoom range. Existing movement speeds remain unchanged.

Current gameplay screenshots also include `landscape-gameplay-v050.png`, `title-v050.png`, `warung-v050.png`, `pekan-v050.png`, `mosque-v050.png` and `congkak-v050.png`. Physical-phone performance and native orientation locking remain unmeasured.

## v0.6.0 — dense five-district town and comic collision world

The same 154 × 132 m playable boundary now contains all 38 numbered locations from the reference: 10 kampung, 10 terrace-neighbourhood, 8 pekan, 6 community and 4 transport/market locations. School and mosque remain at the back, kampung on the left, terrace rows on the right, shops in the centre and transport/market at the front. The central square includes gardens, benches and an old clock. All locations are exteriors; the open canteen, wakaf, shelter, workshop and market have accessible spaces between their physical obstacles.

`npm test`: **26 tests passed**. New checks cover the 38-location roster and district counts, rounded player contact with walls and trunks, real bridge-only river crossings, body-aware map boundaries, fence gates and thin-post/wall collision at 5/10/60 FPS. Movement subdivides both time and distance and slides along unblocked axes.

The actual instantiated scene has **232 collision bodies**, including walls, fences, verandah rails, tree trunks, posts, flagpole, gateposts, counters, seats, benches, vehicles, bicycles, tyres, petrol pumps, planters and NPCs. A 0.5 m flood-fill of its walkable space from Amir's spawn reached the approach to every one of the 38 locations, including both riverbank sides. This checks exterior access, not enterable interiors. River rails stay solid and terrace fences leave 1.4 m gates. Raised verandahs, steps, courts and forecourts provide support heights.

Comic town edges use batched triangle ribbons with actual CSS-pixel thickness, avoiding WebGL's one-pixel line-width limit. Avatar ink is thicker, the cel-light ramp has stronger shadow bands and the shop/terrace palette uses clearer pastel colour blocks. Blocking building surfaces and their ink fade together. The existing grass illustrations remain. Northern scenery hills have moved beyond the playable boundary.

Browser checks with headless Chromium/software WebGL passed meeting Nur, chapter progression, optional sound toggling, a complete congkak round (13 player moves), return to exploration and completed save/reload. Successful root-hosted checks reported no page/renderer errors or missing assets. Physical Android GPU performance remains unmeasured.

`town-overview-v060` is a render of the actual scene from an overhead review camera, with distant fog postponed to make the complete layout visible. Close scene views use gameplay fog. They are actual geometry renders, not generated concept art.

Final root and built-file startup checks passed without missing assets or page/renderer errors, at about 3.9 and 4.0 seconds respectively in this software-rendered browser run. Missing art still shows the retry panel. Landscape checks passed portrait gating/freeze/resume, independent swipe/tilt, joystick movement, real two-touch pinch, simultaneous joystick/swipe and both 144/128 px control layouts. The observed mobile views submitted roughly 160–213k triangles; these are workload observations, not phone FPS claims.

## v0.7.0 — chase camera and reference-sheet characters

`npm test`: **29 tests passed**. The rewritten gait tests check flat stance and swing clearance across walk-to-run blends, that walking always keeps a foot down while sprinting has a flight phase, that every foot target lies inside the leg so the two-bone IK solves it exactly with no reverse knee, that arms swing against the same-side leg, that standing keeps the legs nearly straight, and that stopping removes stride, sway and arm swing. `npm run build`: passed.

Characters were checked in front, three-quarter, side and back renders of the actual module (`character-turnaround-v070.webp`). Heights normalise to 1.50 m (Amir), 1.48 m (Nur) and 1.75 m (Pak Mat). Side-view pose sequences at 7.2 and 11 m/s show the walk-to-run blend, flight phase, high knees and 90° elbow pumping (`gait-v070.webp`). Each character now renders as one skinned mesh plus one skinned ink hull and two to four small drawings. One character submits about 12.7k surface triangles and an 11.6k-triangle hull. In the widest view (from the kampung across the entire town) the same frame fell from 899 to 527 draw calls once characters were skinned and small props/ink beyond 65 m were skipped. Town views measured 329–372 calls and 164–218k triangles, including the shadow pass. These are software-rendered workload counts, not phone FPS measurements.

The chase camera was checked in a 844 × 390 mobile landscape viewport. The new game starts behind Amir. Steering to Nur under the auto-following camera reached her Talk button, and the dialogue two-shot showed both speakers facing each other above the panel. With Amir on his verandah and the lens behind him pointing into the house, the camera pulled in to 1.89 m instead of entering the wall; on the open lane it stayed at 4.4 m (`kampung-run-v070.webp`, `chase-camera-v070.webp`, `dialogue-v070.webp`).

Full chapter regression passed under both repository-root and built-folder hosting: meeting Nur and advancing her dialogue, resuming beside Pak Mat, a complete congkak round (13 player moves, 30–68), chapter completion, return to exploration and the saved Continue after reload. There were no page or renderer errors and no missing assets. Physical Android/iPhone frame rate remains unmeasured.

## v0.8.0 — concept-sheet shophouses, mosque and sedan

`npm test`: **29 tests passed**. `npm run build`: passed, and `dist/` includes the new `landmarks.js` module.

The new models were checked in the actual game scene from gameplay and review angles (`shophouses-v080.webp`, `shophouse-corner-v080.webp`, `mosque-v080.webp`, `sedan-v080.webp`, `five-foot-way-v080.webp`). A 0.5 m flood-fill of walkable space from Amir's spawn still reaches the approach to all 38 locations. The raised five-foot way is walkable along the whole terrace, as is the gap between the shophouses and the mosque. The scene now has 239 collision bodies, up from 232.

Draw calls at the same chase-camera viewpoints as v0.7.0: 504 in the widest kampung view across the town (was 527), 367 on the main road (was 372) and 285 by the mosque (was 329). On the shophouse street it was 387. Triangles rose to 197–321k because of the arches and domes. These are software-rendered workload counts, not phone frame-rate measurements.

Full chapter regression passed under both repository-root and built-folder hosting: meeting Nur, resuming beside Pak Mat, a complete congkak round (13 moves, 30–68), chapter completion and Continue after reload, with no page or renderer errors and no missing assets.

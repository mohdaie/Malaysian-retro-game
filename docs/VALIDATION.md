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

The transparent illustrated grass/clover/leaf patches load and render over the lawn, masked beneath roads and paths. 

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

## v0.9.0 — one editable town plan and the map editor

`npm test`: **38 tests passed**. The new layout tests check that the saved plan has no errors or warnings, that all 38 places appear once and every unit fills its kind's slots, that quarter turns match Three.js `rotation.y` and swap rect sides, that turning Rumah Amir carries its verandah floor, start point and heading, that the checker reports overlaps, the river, the town edge and buildings on asphalt roads while letting cars park on roads and the canteen and court stand in the school yard, that district names follow the nearest place, and that preview links accept only plans without errors. A publishing test checks that `tools/map-editor.html` matches the current layout code and plan.

The refactor reproduces the previous town apart from four small fixes the new checks found: the school compound moved 2 m east and the village hall 1 m east (the school block and fence stood half a metre into the west road), the terrace rows moved 1 m west (the end houses stood 0.9 m into the east road), and the library moved 3 m west (it stood 2.5 m into the east road). The hall path now stops at the hall's front instead of running 2 m into it. The square's paths end at its edge, with two short paths joining it to the main road and the market lane. Kerbs, drains and centre dashes are now generated along every asphalt road, and street lamps along one verge of each.

A 0.5 m flood-fill from Amir's start reaches all 38 places. A preview link with the mosque moved onto the open lawn and turned 90°, and the warung, one terrace house and the square turned, rendered correctly, kept the mosque arcades walkable, moved the numbered map, and labelled the HUD "Map preview". A save position that became blocked (inside a parked car) fell back to Amir's start.

The editor was exercised at 1280 × 800 and 390 × 844 (touch). Dragging the mosque onto the shophouses showed the overlap error; turning it reported the new facing; two undos restored a clean layout; the preview link carried the plan. Outside Claude the save button falls back to copying the layout. In the published artifact the shared store was readable and empty before the first save.

### First edited layout

The layout saved from the map editor on 6 October (30 buildings and vehicles moved, 14 roads changed) had no layout errors. Checks beyond the editor found three issues, fixed when it was applied: the main road had moved 7 m north of the fixed river bridge, so it ran into the water (bridges are now generated under every road that crosses the river); the market lane cut 1 m into the backs of terrace houses 15–18 (moved 1 m south); and one kampung path had shrunk to a 2 × 2 m stub (removed). The in-game map now tints each place by its district instead of drawing one rectangle per district, since districts can be spread across town, and places each label near the largest group of its places.

`npm test`: **39 tests passed**; the layout tests no longer assume particular positions. A 0.5 m flood-fill from Amir's new start (beside Rumah Amir, now facing north) reaches all 38 places. 

## v0.10.0 — kampung trees and a dense edge

`npm test`: **45 tests passed**. New planting tests check that planting is deterministic, that all 18 species build finite geometry within a triangle budget, that trees in town stay off roads, bridges, the river, buildings and the spots where people stand, that at least 250 trees ring the town past its edge with the main road left open, that the beringin stays within 24 m of Pak Mat when the warung moves, and that a 0.5 m flood-fill with every trunk in place reaches all 38 places, Nur and Pak Mat.

The saved plan plants 410 trees: 125 in town (each with a trunk collider; collision bodies 233 → 348) and 285 past the edge. In the game, a 0.5 m flood-fill from Amir's start reaches all 38 places, and the full chapter regression passed under both repository-root and built-folder hosting (Nur, Pak Mat, a complete congkak round of 13 moves, 30–68, chapter completion, Continue), with no page errors or missing assets. Two frames a second apart differ only on palm fronds, banana and bamboo leaves (the breeze).

Same ten viewpoints as v0.9.0: draw calls 118–462 in gameplay views (was 84–404), 557 in a raised overview (was 455); triangles 106–304k (was 49–217k), 367k in the overview. Headless load time rose by about one second. These are software-rendered workload counts, not phone frame rates.

## v0.11.0 — contacts, Duit Poket and the first delivery

`npm test`: **52 tests passed**. New tests check that all 38 places have a unique contact, a greeting and an interaction point inside town, near the place and outside every other building; the first delivery (accept, collect only at the sender, deliver only at the receiver, paid exactly once, the next route offered afterwards); that the upah is locked on acceptance; purchase orders (cost up front, cost plus upah repaid, refused without enough Duit Poket); counter purchases; and saves (version 2 round trip, version 1 upgrade with the starting RM 2.00, tampered wallet, bag and job entries dropped, paid jobs never restored).

In the browser all 38 interaction points can be reached on foot from Amir's start. A scripted play-through (21 checks, from both the repository root and the built folder, with no errors or missing files) talks to Uncle Ah Seng (Buy / Delivery work / Leave), reads the job card (2 × Gula 1 kg, Rumah Tok, Nenek, about 45 m, prepaid, RM 1.00), accepts, collects, reloads mid-delivery with the job, bag and parcel marker intact, hands over to Nenek for RM 1.00 (RM 2.00 → RM 3.00), reloads with the money kept, gets nothing for a second hand-over, sees the next route offered and buys an ais krim that also survives a reload. Delivering to Pak Mat goes through his warung counter, which also starts the congkak rematch. The chapter regression still passes under both hostings.

## v1.0.0 — the cast, two playable children and Chapter 01

`npm test`: **58 tests passed**. New and rewritten tests check the 14 NPCs against the guide (ids NPC-01 to NPC-14, Pak Mat at the kebun, Kak Ita at the warung, Atuk at #8 and posted at the padang with Faiz and Mei Ling), a unique contact and a reachable interaction point for every place, and the guide's upah formula (one-unit base plus 20 or 40 sen per extra unit). They also cover: prepaid parcels paid exactly once; purchase requests (buy at the supplier, repaid cost plus upah, refused without funds); invitation rounds paid at the last stop; three job slots, bag space, cancel and return with refunds; snacks and collectibles; friendship levels and the once-a-day chat; the chapter advancing only on its own event and offering its two story jobs once; that every request and parcel template names real items and places; v3 saves, upgrades from v1 and v2 saves (name and Duit Poket kept, chapter restarted as Amir) and tampered entries dropped; and that both playable children and every NPC have their own body.

Amir and Nur are unchanged: their turnaround renders are pixel-identical to v0.11.0. The 14 townsfolk each draw as one skinned mesh plus an ink hull (two material groups when they wear a print), at 13.3k–19.1k triangles with the hull, against Amir's 24.3k and Nur's 28.6k. Turnarounds and in-town shots of all 14 were checked from the front, side, back and three-quarter views.

In the browser, a scripted Chapter 01 play-through passed all 25 checks with no page errors, as Nur from the built folder and as Amir from the repository root. It covers: meet Faiz and Mei Ling; Pak Rahman's menu (Buy / Delivery work / Talk / Leave) and the story parcel card (requester, destination, RM 1.00, carrying space); collect and hand over to Nenek (RM 2.00 → RM 3.00); Nenek's house menu and tea order; buy the tea (RM 2.30); a reload mid-job; the tea repaid with the upah (RM 4.00); a full congkak round with Nenek; a guli at Uncle Lim's (RM 3.50, chapter complete); a reload that keeps everything; and the quest book's friends list. All 38 interaction points and all 14 NPCs can be reached on foot from the start.

Same six gameplay spots against v0.11.0 (software WebGL, 844 × 390): draw calls 129–518 (was 127–517), triangles 184–423k (was 156–373k). Near home and the warung the counts match v0.11.0. They are 15–23% higher where several townsfolk stand close together (Kedai Runcit, the padang, Nenek's, the mosque). Townsfolk past 42 m are hidden and only those within 20 m cast sun shadows. Textures rose from 55–64 to 77–85 (half-size face drawings and six cloth prints). These are workload counts, not phone frame rates.

## v1.1.0 — street props of around 2001

`npm test`: **59 tests passed**. A new test checks that the 2001 street props stand clear of every door, everyone's spot, the river, asphalt (except parked motorcycles and road signs) and every tree trunk; the reachability test now counts prop colliders too.

The saved plan places 85 of its 86 props (one tempayan by a roadside house is left out where it would sit on the road) and 16 utility poles with lines; 3 trees make way for props (410 → 407). In the browser all 38 interaction points and all 14 NPCs are still reachable on foot, with no page errors. Each prop was checked in town from the game camera.

Same six gameplay spots as v1.0.0: draw calls 131–547 (was 129–518, up 1–8%), triangles 192–459k (was 184–423k, up 3–11%). Props share the landmarks' vertex-coloured material and one sign atlas, so they add about one draw per street cell.

## v1.2.0 — NPC routines and idle actions

`npm test`: **62 tests passed**. New tests check that all 14 NPCs have a loop made of known steps, actions and spots no more than 2.5 m from their post, that every action pose is finite at any moment, and that a loop walks out and back, drops a walk that would hit a wall, and stops and turns to face the player.

All 15 actions were checked on the cast in the turnaround; hands-on-hips and the watch check use a twist-then-raise arm rotation. In town, Kak Ita, Pak Mat, Atuk and Faiz were filmed over time stirring, wiping, bending, scratching, chatting and waving, and walking between their spots. Amir and Nur are unchanged (no action is passed for the player).

A scripted Chapter 01 play-through as Amir passed all 25 checks with no page errors while the NPCs walked their loops.

## v1.3.0 — illustrated item catalogue

`npm test`: **63 tests passed**; `npm run build` passes. The added catalogue check follows every shop stock/request/parcel reference to a local asset and checks that all 51 item drawings are distinct, titled, and accompanied by a memory note. Delivery-only detail captions never format a missing purchase price. All previous purchasing, delivery, congkak, collision, routine and save checks still pass.

A browser pass in Chromium with software WebGL checked: 51 SVGs fetched and decoded; category totals (26 goods, 5 snacks, 7 collectibles, 13 cargo); pictures in the bag and album; item inspection and Escape returning to the catalogue; browsing leaving wallet/bag/collection/jobs unchanged; all 15 grocer stock pictures; buying an ais krim debiting exactly 20 sen; illustrated delivery offers and active jobs in the quest book. Desktop 1280 × 800 and mobile landscape 915 × 412, 740 × 360 and 568 × 320 were checked for modal overflow, category controls, image inspection and return behaviour, with no browser errors. This is browser emulation; a physical phone GPU test was not performed.

Artwork and actual game UI screenshots: `item-art-sheet-v130.webp`, `catalogue-v130.webp`, `bag-v130.webp`, `shop-items-v130.webp`, `delivery-items-v130.webp`, `catalogue-mobile-*-v130.webp`, `item-mobile-*-v130.webp`. The 51 source SVGs together are 70,818 bytes (about 69 KiB) (208 KB on disk); they are locally bundled and lazy-loaded. The catalogue is original vector artwork, not photographs or generated raster renders. Item IDs, prices, upah and save schema remain unchanged.

## v1.4.0 · town clock

`npm test`: **69 tests passed**. New tests cover the clock (start on Hari 1 Sabtu 14:00, a real second as a game minute, holding at 23:59), sleeping (only from 19:30, waking on the next day at 06:00, the week wrapping after Jumaat), opening hours (shops close after Maghrib; the warung, kiosk and masjid stay open later), the light keyframes (sun strength falls from noon to dusk to night, windows glow only after dark, the daytime sky is unchanged, the sun rises in the east and sets in the west, every minute gives finite values) and saves (the clock round-trips; a missing or broken clock starts on Hari 1 at 14:00).

In headless Chromium (desktop 1280×720 and phone landscape 844×390): a new game shows HARI 1 · SABTU · 14:00 · PETANG. A save resumed at 19:20 had only Pak Din, Kak Ita, Ustaz Hassan and Nenek out, and at 21:30 only Kak Ita. At the home door at night, Mak's counter offered *Tidur · sleep until Subuh*. Sleeping faded to night and woke on HARI 2 · AHAD · 06:00 · SUBUH at home. At 08:00 all 14 townsfolk were back at their posts. There were no page errors. The night HUD keeps the place name readable on a dark label. These are emulated checks, not a physical-device test.

Street lights: 27 lamps are placed (8 sodium lamps on the asphalt roads, 19 timber tube lamps on the dirt lanes and paths). At 15:00 they are dark. At 19:25 they are coming on, and at 21:00–22:00 they are fully lit with their ground pools and the following lamp light. The draw-call count stayed in the same range as before (about 280–510 depending on the view). There were no page errors.

## v2.0.0 · motion-captured Amir and Nur

`npm test`: **125 tests passed**. The movement and collision tests now use the speed constants rather than the old 7.2 and 11 m/s literals. They still check frame-rate independence, thin-wall tunnelling, open gates and wall sliding.

The skeleton file is 838 KB (about 370 KB gzipped), down from the library's 6.6 MB, keeping 8 clips. Speeds measured from the planted foot at the kids' scale (0.813 of the 1.83 m source rig): walk 0.85 m/s, jog 4.27 m/s, sprint 6.29 m/s. The game's full-stick speed is 4.3 m/s and Run is 6.3 m/s.

In headless Chromium (1280×720 desktop and 844×390 phone landscape), Amir and Nur stand, jog, sprint and turn through the kampung with the chase camera. The new bodies measure 1.50 m tall. The view rendered 255 draw calls and about 199k triangles. No page errors; the three console warnings are the same as on v1.9. Side-view renders confirm knees and elbows bend continuously, with no gaps at the joints. These are emulated checks, not a physical-device test.

## v2.1.0 · jump, duck, walk, say hi and the basikal

`npm test`: **135 tests passed**. The new bicycle tests check that pedalling builds up to cruising speed, Run builds up to the faster speed and coasting freewheels. They also check gradual steering, leaning into a turn, and braking before turning back. The save tests check that the bike is saved where it was left, and that a missing or broken position parks it at home.

The skeleton file is 1.12 MB (458 KB gzipped) with 14 clips.

In headless Chromium at 1280×720 and on a touch-emulated 844×390 phone, a new game was played through jump (mid-air captured), duck, crouch-walk, wave, getting on the bike, riding, a leaning turn, coasting and getting off. The bike was left parked on its kickstand. On the phone, Hai becomes Loceng while riding, Cangkung and Lompat are disabled, and Basikal shows as pressed. There were no page errors.

A side-view check of the rider measured the hands on the grips (0.25, 0.93, 0.255 to the millimetre) and the feet on the pedals at every crank angle tested. These are emulated checks, not a physical-device test.

## v2.1.1 · touch fixes, a brisker walk and reversing the bike

`npm test`: **136 tests passed**. A new bicycle test checks that from a stop, pulling back rolls the bike backwards at walking pace with no pedalling, that the rear swings toward the stick, and that pushing forward again rides on.

Multi-touch was checked with two simulated fingers in Chromium on an 844×390 touch screen. Finger 1 held the joystick forward while finger 2 tapped Jalan (on, then off), Cangkung (on, then off), Lompat and Hai. Every tap registered and the player kept moving throughout. In v2.1.0 these buttons acted on `click`, which phones do not send during a second touch.

In play, a bike pushed against an obstacle backed out 1.4–1.8 m when pulled back, then turned and rode off. The home parking spot now faces at least 4 m of clear ground.

## v2.1.2 · resetting a stuck basikal

`npm test`: **137 tests passed**. A new movement test checks that a body starting inside an obstacle can always move out. Before this, every step from inside an overlap was refused, so a bike or player that ended up overlapping something could not move in any direction. From outside, the body still stops at the obstacle.

In play, the player walked about 3 m from the bike, opened the pause menu and chose **Reset basikal**. The bike was parked 1.7 m beside the player, then mounted and ridden with no errors. Riding with the stick held for two seconds without moving lifts the bike out to open ground.

## v2.2.0 — textured town sedans

- `npm test`: 137 passing; `npm run build`: self-contained dist produced.
- Chromium/SwiftShader browser QA against built output: both configured sedans use the GLB, one car-model download per load, white body paint retains dark glass/tyres/trim and red rear lamps. No page or shader errors on the successful asset path.
- Rendered 1280×720 desktop and 844×390 touch landscape views. Actual game captures: `docs/town-cars-v220.webp`. Physical Samsung performance is not measured by these browser checks.
- Runtime bounds: 1.86 m wide, 3.899 m long, 1.381 m high. Geometry and the embedded texture are shared across variants; material instances differ. Ground placement follows the existing terrain height.
- The two existing 4.5×1.9 m rotated vehicle colliders remain at (-35, 6) and (35.5, 3); centre points remain unwalkable. Wallet and Mini 4WD ownership survive loading.
- Intercepting the model with HTTP 404 or corrupt GLB bytes still boots the game, renders the original procedural sedans, and leaves the fatal error panel hidden. Download has an eight-second timeout.
- `town-sedan.glb` is byte-identical to the supplied `sample (1).glb`. No GPU job or asset regeneration was needed.

## v2.3.0 · Amir from a TRELLIS.2 model

`scripts/bake-model.mjs` prepared the user's TRELLIS.2 export (8,977 vertices, 10,769 triangles, no normals, no skeleton, an A-pose) into `assets/models/amir.glb` (791 KB). Colouring each vertex by its leading bone, from four sides, showed:
- the head and hair on the head bone;
- the neck on the neck;
- the torso and backpack graded up the spine by height;
- each arm split into shoulder, upper arm, forearm and hand;
- each leg split into thigh, shin, foot and toe, with the cargo pockets on the legs rather than the hands beside them.

An earlier pass that used plain nearest-bone distance put the chest on the shoulders and the hips on the thighs, and was rejected.

In the browser, the fitted skeleton sits inside the mesh in the bind pose. Idle, walk, jog, sprint and crouch play on the model with the feet held to the floor. An earlier version of the ground lock accumulated its correction and sank him into the ground; it was fixed before this commit.

In the town (headless Chromium, 1280×720) he stands, jogs, sprints, jumps, waves and rides a basikal scaled to his legs, with no page errors.

`npm test`: **137 tests passed**, and the build succeeds.

Known limits: the recorded idle and jog lean and bend the knees, which reads as a slight crouch on Amir's short-legged, big-headed proportions. The pants crease at the crotch when he crouches. Emulated checks only.

## v2.4.0 · Nur from a TRELLIS.2 model

`scripts/bake-model.mjs` prepared the user's export (7,169 vertices, 9,478 triangles, an A-pose, one connected surface) into `assets/models/nur.glb` (656 KB, 1.48 m). The bone colour map from four sides shows:
- the hood and head on the head bone;
- the hood's drape on the neck;
- the hoodie, backpack and the water bottle under it graded up the spine;
- arms and legs split into their segments.

A new rule keeps anything well behind the hips below the crotch line (the bottle) with the torso instead of a leg. Re-running the script for Amir with the new rule produced a byte-identical `amir.glb`.

In the browser, Nur's idle, walk, jog and crouch play beside Amir's. In the town she stands, jogs, sprints, jumps, waves and rides her mint basikal, sized to her legs, with no page errors.

`npm test`: all tests pass, and the build succeeds. Emulated checks only.

## v2.5.0 · a saved journey for each character

`npm test`: **139 tests passed**. Two new save tests:
- **Separate journeys:** Amir and Nur keep separate saves, and saving one never touches the other. The most recently saved character is offered first.
- **Old saves:** an old single save becomes its character's save, the other character starts empty, and the old key is retired once that character saves.

In the browser, starting from an old single save (Amir, RM 7.77, Hari 3):
1. The title offered "Continue Amir's story · Hari 3 · RM 7.77".
2. Choosing Nur hid Continue, and her new story started without a warning.
3. Back at the title, Nur had her own Continue (Hari 1, RM 2.00).
4. Switching to Amir still showed RM 7.77. Continuing restored Amir with RM 7.77, chapter step 3 and Hari 3.
5. Storage then held only `retro-malaysia-save-amir` and `retro-malaysia-save-nur`.
6. Starting another Nur story warned that it replaces Nur's journey and that Amir's is kept.

No page errors.

## v2.8.0 · bodies for the 24 residents

`npm test`: **166 tests passed**. New checks: every resident has a unique key that never clashes with an NPC, a body and a work loop of known actions; each stands at their own place within 3.5 m of its door; the NPCs' posts (and so the planted trees and props) are unchanged.

Before adding them, one townsperson was measured in the browser: one merged skinned figure plus its ink hull, face drawing and ground shadow (4 meshes, about 13–19k triangles, 7–24 ms to build, animation under 0.02 ms a frame). The existing rules already hide townsfolk past 42 m and keep sun shadows within 20 m; they now cover the residents too. Two cheap additions: past 30 m the face drawing and ground shadow are skipped (two draws each), and identical face drawings share one texture.

Headless Chromium, software WebGL, 932×430, Hari 2 at 15:00, standing outside five places (v2.7.1 → v2.8.0):

| Spot | Draw calls | Triangles | Residents in view | Frame (software) |
|---|---|---|---|---|
| Gelanggang | 492 → 507 | 559k → 633k | 8 | 584 → 644 ms |
| Kedai Gunting | 463 → 478 | 477k → 542k | 6 | 501 → 556 ms |
| Kampung | 226 → 241 | 276k → 329k | 7 | 300 → 348 ms |
| Taman | 441 → 453 | 400k → 473k | 9 | 479 → 519 ms |
| Klinik | 455 → 476 | 483k → 566k | 14 | 521 → 591 ms |

About +3–5% draw calls and +12–19% triangles. Software frame times only show the relative cost; real GPUs are far faster. JS heap rose from about 189 MB to 227 MB.

In the browser: "Talk to Abang Muthu" shows beside the barber, and Talk opens Kedai Gunting with his line. At 21:00 every resident except Pak Usop (pasar malam until 22:30) is indoors and hidden, and the door still answers with their name. No page errors. Emulated checks only; a real phone still needs a check.

### Errands and the families who keep house

`npm test`: **171 tests passed**. New `tests/errands.test.js`: every runner's house has a keeper and every keeper has a runner; trips are in order, never overlap and end at least 30 minutes before dark; a walker leaves on time, arrives at its stand spot, counts as away, walks home and settles at the door; it waits about 3 s for someone in its path and then squeezes past; paused, it does not move; and a sync (load, sleep, prayer) puts it straight where the clock says.

In the browser (no page errors):
- All 12 trips found a walking route. Loaded at 07:57 by Rumah Pak Mail, he set off at 08:00 and was about 5 m down the lane a few minutes later, cangkul in hand.
- Loaded at 09:00: Pak Mail at the kebun, Pak Abu at the library, Mak Cik Kiah at the bakery, everyone else at home. At Rumah Pak Mail the prompt read "Talk to Mak Cik Senah" and the door opened with her line. Beside Pak Mail at the kebun, Talk gave his street line.
- At 11:00, approaching Pak Mail at home opened his own door counter.
- At 15:05: Mak Cik Salmah at the warung, Mak Cik Kiah at Kedai Runcit 99.

With the six keepers (44 bodies), the same five spots: 246–515 draw calls (+2 to +14 over the residents alone) and 354k–655k triangles (+2 to +9%).

### Storyline cross-check

Chapter 1's steps all point at the original 14 NPCs, so their markers, dialogue and counters are unchanged. Keepsake stories are tied to places, and two errand runners sit on story paths: Abang Kamal gives *The Tape with No Label* at Rumah Jiran B, and Pak Abu holds the first clue of *A Name Saved as Home* and *The Trip We Never Took* at Rumah Pak Abu. Before this fix, Kak Midah or Mak Cik Esah would have offered those stories in the resident's own voice while he was out. Now a resident stays home (or heads straight home) while a story in progress needs his door, and family members standing in never offer keepsake stories. People named in the clues and exhibition texts (Pak Karim, Cik Azura, Kak Lina, Pak Abu, Abang Kamal) now have bodies at the places the clues send you to.

`npm test`: **172 tests passed**, including a test that lists exactly which stories touch an errand runner's door, so a new one cannot slip in unnoticed.

In the browser (no page errors):
- Step 0 at 17:30, with Abang Hafiz and Encik Faizal on the padang: the prompt is "Talk to Faiz", the friends' scene plays and the chapter moves to step 1.
- Step 1 at 14:45, with Mak Cik Kiah shopping at Kedai Runcit 99: "Talk to Pak Rahman" opens his counter with Delivery work.
- The Walkman ready at 10:15, during Abang Kamal's kiosk errand: he stays home, and his door offers "Ada kisah untuk dicerita".
- Nothing pending at 10:15: he is at the kiosk, and Kak Midah answers "…Abang Kamal balik lebih kurang 11:00." with no story offered.

## v2.9.0 · crowds by the clock

`npm test`: **186 tests passed**. New `tests/crowds.test.js`: every extra has its own body, outings in order and ending by 22:00, known loops and places, and no kid out before 08:00 (school holidays); positions follow the clock out of the door, at each stop and home again; the pasar malam outing happens only on Saturdays.

In the browser (no page errors): all 10 extras found every gathering spot and every running route. Loaded beside each place:
- 07:30 Warung Kak Ita: Pak Seman and Pak Daud.
- 15:00 Kedai Basikal: Adam and Hakim at guli; Aisyah and Ah Keong running to Kedai Sudut Mini.
- 16:13: four kids running to the padang.
- 17:20 the padang: six kids playing.
- Saturday (day 8) 20:00 pasar malam: Siti, Ravi, Pak Daud and Mak Cik Gayah. Sunday (day 9): nobody.

## v2.9.1 · storyline cross-check with the crowd

The extras are not talkable and never enter the interaction prompt, so Chapter 1's people, counters and dialogue are untouched. Their names do not clash with any story text (the one "Siti" is Siti Nurhaliza's album). They gather at the warung, Kedai Runcit 99, Kedai Sudut Mini, the five-foot way, the padang, the masjid and the pasar malam, and none of these is a keepsake clue stop.

One overlap fixed: Encik Faizal's padang errand (17:00–18:30) runs during the kids' game (16:15–18:40), and the crowd's spot picker did not avoid errand stand spots. Crowd spots now keep 1.4 m from them too. Measured in the browser: every crowd spot is at least 1.4 m from an errand spot, 1.5 m from an NPC and 2.1 m from its door.

In the browser (no page errors), with the crowd present:
- Step 0 at 17:30, with seven extras on the padang: "Talk to Faiz", the friends' scene plays and the chapter moves on.
- Step 1 at 09:15, with Siti and Mak Cik Gayah at Kedai Runcit 99: Pak Rahman's counter opens with Delivery work.
- Abang Kamal's Walkman pickup and Kak Midah's stand-in line are unchanged.

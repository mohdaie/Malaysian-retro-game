# Retro Malaysia — a kampung story

Playable browser prototype, **v0.11.0**. A fictional Malaysian town around **2001**, mixing kampung lanes and budget terrace homes. Default protagonists **Amir** and **Nur** can be renamed.

## Playable chapter

Leave Amir's timber house → meet Nur → walk through the pekan → talk to Pak Mat at his warung → finish a congkak practice round → return to exploration. Afterward, explore or play a rematch.

All **38 locations across five districts** fit the original compact map: 10 kampung, 10 terrace, 8 pekan, 6 community and 4 transport/market. The numbered map includes a district directory. The town includes Melaka-inspired timber homes, Ipoh-inspired shophouses, an old Sekolah Kebangsaan, a Kuala Kangsar-inspired yellow-domed mosque, terrace homes, a retro bus station and pasar malam stalls. These are original stylized 3D meshes inspired by the agreed references, not exact recreations.

- Landscape-only gameplay, with fullscreen/orientation locking where the browser supports it and a portrait gate otherwise.
- Third-person chase camera low behind the shoulder with a wide lens: it swings in behind the runner, pulls in front of walls, frames conversations over the shoulder, and still allows swipe look, pinch and wheel zoom.
- Amir, Nur and Pak Mat rebuilt to the Jaguh Kampung sheet: heads about a quarter of their height with anime faces, Amir's spiked hair and ringer T-shirt, Nur's hijab under her hoodie hood, baggy cargo trousers, shell-toe sneakers, backpacks, and Pak Mat in kopiah, baju and kain pelikat. A walk blends into a run with bent-arm pumping and a forward lean.
- Generated grass/timber materials, tiled roofs, carved eaves, flowers, full shopfronts and detailed warung props.
- Landmarks modelled from the concept sheets: a Straits shophouse terrace (salmon five-foot-way pillars over a terracotta-and-cream tiled walkway, arched louvred windows, scalloped valance, weathered plaster, hipped clay roof), a Kuala Kangsar-style mosque (gilded onion dome, four striped minarets with open galleries, cusped red-and-cream arcades) and boxy 1990s family sedans.
- Kampung trees c. 2001, low-poly: leaning kelapa, tattered pisang with jantung, rambutan and mangga in season, jambu air, nangka in its sack, pinang, durian, bamboo, the pekan's rain trees, the school's ketapang and bunga raya hedge, kemboja at the mosque, kebun dapur herbs, and an old beringin by Warung Pak Mat. A dense dusun and rubber smallholding (with tapping cups) rings the town; roads leave through gaps in it. Leaves sway in the breeze. Planting follows the town plan, so it moves with the map editor.
- Thick dark comic outlines, cel-shadow bands, pastel shopfronts, feathered palms and afternoon lighting. Buildings fade when they hide the player.
- Walking at 7.2 world metres/second and running at 11, with rounded body collisions, wall sliding, gated fences, solid props and bridge-only river crossings.
- NPC dialogue, quest progression, destination distance and a zoned town map.
- Every one of the 38 places has a named contact and an interaction point (door, counter or gate) that follows the map editor. Talk to them to buy, take delivery work or hand over a delivery. A Duit Poket wallet, a bag and a quest book save with your progress. Uncle Ah Seng at Kedai Runcit 99 offers paid delivery runs, starting with Nenek's gula at Rumah Tok.
- Larger 144 px phone joystick with a 60 px thumb grip (128 px on very short screens); desktop keyboard support.
- Local progress saves with resume, save validation and graceful storage failure.
- Complete turn-based congkak with relay sowing, capture, extra turns, scoring and a local opponent.
- Static world geometry batched by material and spatial cell; pixel ratio capped at 2 for mobile performance. The world renderer pauses behind modal menus and congkak.
- Optional original synthesized breeze, bird calls, footsteps and shell sounds.
- The whole town layout comes from one editable plan, with a drag-and-drop map editor and automatic overlap checks. See [the map editor guide](docs/MAP-EDITOR.md).
- No server, sign-in, API keys or runtime CDN needed.

## Controls

| Action | Desktop | Phone |
|---|---|---|
| Move | WASD / arrows | Drag joystick |
| Run | Hold Shift | Hold Run while moving |
| Talk | E | Talk button when close |
| Rotate / tilt camera | Drag on the world (Q / R also rotate) | Swipe on the world |
| Zoom | Mouse wheel / pause settings | Pinch / pause settings |
| Map | M / Map button | Map button |
| Pause / close menu | Escape / pause button | Pause / close buttons |

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:4173`. For another device on the same network, use the computer's LAN address and port 4173.

```sh
npm test
npm run build
```

`dist/` contains the complete static game with local Three.js modules. Serve it using `node scripts/dev.mjs --dist`, or deploy that folder to a static host. Opening `index.html` directly through `file://` does not support the module imports.

GitHub Actions runs tests and builds a downloadable `retro-malaysia-playable` artifact. The repository also contains the pinned browser runtime in `vendor/` and `.nojekyll`, so GitHub Pages can serve `main` directly without an npm build. The manual Pages workflow can alternatively publish `dist/` when Pages is configured to use GitHub Actions.

Playing in portrait pauses movement and congkak animation behind a rotate prompt. The chase camera starts 4.4 m behind and about 2 m above the ground with a 58° lens, adjustable from 3 to 12 m. A swipe pauses the automatic follow for a moment.

## Congkak practice rules

Seven small houses per side, seven shells per house, and one store per player. Sow counterclockwise into both rows and your own store, skipping the opposing store. Relay when the final shell lands in a populated small house. An empty own house captures the opposite house if populated. A store finish grants another turn. An empty row ends the round and the remaining shells are swept into their owner's store.

This is an explicitly **turn-based introductory variant**. Congkak has regional variations and simultaneous-start forms; this prototype does not claim to implement every traditional rule set. Pak Mat uses a one-move local heuristic.

See [the final prototype design brief](docs/FINAL-DESIGN.md) for the implemented visual direction and scope.

## Scope and next work

Version 0.7.0 replaces the high orbiting view with a third-person chase camera and rebuilds the characters to the reference sheet's proportions and outfits. Each character is now one skinned mesh plus one ink outline, so the closer, wider view costs fewer character draw calls than before. The five-district town, collisions, comic rendering and painted panorama from v0.6.0 are unchanged. The first chapter and congkak are playable. Building interiors, other traditional games and later chapters remain outside this prototype. Browser emulation validates the controls; physical phone GPU performance still needs device testing.

Save data is stored in the browser on this device and origin; it does not sync across devices. Only completed chapter progress is saved, not a partly played congkak round. Leaving an unfinished round starts a fresh practice round on return.

## Code layout

- `src/world.js`: authored procedural town, spatial batches, obstacle geometry and camera occlusion.
- `src/landmarks.js`: low-poly shophouse terrace, mosque and sedan built from the concept sheets.
- `src/characters.js`: reference-sheet characters in metres, anime face drawings, rigidly skinned single-draw meshes and joint animation.
- `src/locomotion.js`: leg-length-relative walk/run cycle, two-bone leg IK and contralateral arm swing.
- `src/illustration.js`: cel-light ramp, halftone shading, pixel-width character hulls (skinned) and town ink.
- `src/town-plan.js`: the editable plan: where every building, vehicle, passer-by and road stands and which way it faces.
- `src/town-layout.js`: building kinds (footprints, raised floors, people spots), the 38 numbered places, districts, the fixed river and bridges, and the layout checks.
- `tools/map-editor.src.html`, `scripts/editor.mjs`: the map editor and its build script (`npm run editor` writes `tools/map-editor.html`).
- `src/collision.js`: circle/rectangle contacts, body-aware bounds and bridge-only river crossings.
- `src/movement.js`: analog input and small collision steps independent of frame rate.
- `src/soundscape.js`: original local ambience and foley.
- `assets/`: generated game materials and provenance.
- `src/main.js`: chase camera, input, quest/dialogue flow, map and minigame presentation.
- `src/congkak.js`: pure board rules and opponent, independent of rendering.
- `src/save.js`: versioned local save validation and storage.
- `tests/`: congkak invariants, complete simulated games, gait and IK reachability, collisions and storage failure handling.
- `scripts/`: dependency-free development server and static build.
- `vendor/`: checked-in Three.js browser runtime and its MIT license, required for direct branch publishing.
- `src/boot.js`: startup loader with recoverable module-load errors and a timeout.

## Preview

![Shophouse terrace](docs/shophouses-v080.webp)

![Mosque](docs/mosque-v080.webp)

![Chase camera running through the pekan](docs/chase-camera-v070.webp)

![Amir, Nur and Pak Mat turnaround](docs/character-turnaround-v070.webp)

![Actual compact town with all 38 locations](docs/town-overview-v060.webp)

![Comic shopfronts](docs/comic-shops-v060.webp)

The overhead review camera postpones distant fog to show the entire layout. Gameplay keeps its normal fog and the chase camera. All screenshots are renders of the actual game modules.

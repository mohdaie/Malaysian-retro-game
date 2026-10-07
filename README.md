# Retro Malaysia — a kampung story

Playable browser game, **v1.4.0**. A fictional Malaysian town, Pekan Seri Kenangan, around **2001**, mixing kampung lanes and budget terrace homes. Play as **Amir** or **Nur** (either can be renamed), earn Duit Poket running deliveries for 14 townsfolk, and save for the toys of the time.

## Chapter 01 · Cuti Sekolah

The first afternoon of the school holidays, the same for both characters. Amir starts outside Rumah Amir in the kampung, Nur outside Rumah Nur in the taman.

1. **Kawan lama**: meet Faiz and Mei Ling at the padang by the gelanggang.
2. **Kerja pertama**: ask Pak Rahman at Kedai Runcit 99 for delivery work and take his parcel for Nenek.
3. **Hantar ke rumah Nenek**: carry the two bags of gula to Nenek at Rumah Tok. Upah RM 1.00.
4. **Teh untuk Nenek**: buy her tea at Pak Rahman's with your own money. She repays the RM 0.70 and the upah.
5. **Congkak di beranda**: play a round of congkak with Nenek on her veranda.
6. **Simpan sikit-sikit**: spend a little of your upah on your first collectible at Uncle Lim's.

Afterwards the town is open: take delivery work from any shop or house, save up, play congkak with Nenek again and visit your friends. A gold diamond points at the chapter's next person, and boxes mark your job stops.

## The town's people

| # | Who | Where | Look |
|---|---|---|---|
| 01 | Pak Rahman, grocer | Kedai Runcit 99 | Gingham shirt, pencil behind his ear, sandals |
| 02 | Pak Din, petrol kiosk | Kiosk Petrol Retro | Faded blue work shirt, red cap, Good Morning towel |
| 03 | Uncle Lim, stationery and toys | Alat Tulis & Game | Polo tucked in, glasses, belt pouch |
| 04 | Makcik Ros, school canteen | Kantin Sekolah | Blouse, apron, tudung |
| 05 | Cikgu Farid, teacher | SK Seri Kenangan | White shirt and tie, folder |
| 06 | Pak Man, mechanic | Bengkel & Tayar | Overalls, rolled sleeves, red rag in his pocket |
| 07 | Kak Ita, food stall | Warung Kak Ita | Baju kurung, batik kain, yellow apron, tudung |
| 08 | Pak Salleh, community organiser | Balai Raya | Batik shirt, clipboard |
| 09 | Ustaz Hassan, imam | Masjid Seri Kenangan | Baju Melayu, songkok, short beard |
| 10 | Pak Mat, gardener | Wakaf Kebun | Straw hat, rubber boots, basket of ulam |
| 11 | Nenek, congkak mentor | Rumah Tok | Floral baju kurung, glasses, white tudung |
| 12 | Atuk, toy storyteller | Rumah Atuk, afternoons at the padang | Loose shirt, kain pelikat, cap, wooden toy box |
| 13 | Faiz, your friend | Rumah Faiz, afternoons at the padang | Graphic tee, shorts, selipar, a mini 4WD in hand |
| 14 | Mei Ling, your friend | Rumah Mei Ling, afternoons at the padang | Striped tee, bob, sling bag |

Each of the 14 has their own afternoon loop around their post (v1.2): Kak Ita stirs her pot, walks over to wipe a table and fans herself; Pak Mat bends over his beds; Uncle Lim reads with his arms folded; Faiz waves and stretches. They stop and turn to you when you come close, and wait while you talk. You decide the loops in `src/routines.js`, a plain list per person of steps (`stand`, `do` an action, `walk` to a spot, `face` a way). There are 15 actions: wave, look, stir, wipe, write, read, fan, stretch, hips, fold, talk, bend, scratch, check and nod.

Every other place has a named household contact (Mak Cik Zaitun at Rumah Amir, Cik Aminah at Rumah Nur, and so on). Shopkeepers offer Buy / Delivery work / Talk; houses and services offer Requests / Talk. Talking once a day, finishing errands and story moments raise friendship from Baru kenal to Kenal, Kawan and Dipercayai.

## Duit Poket and deliveries

Money is in ringgit and sen; you start with RM 2.00.

- **Prepaid parcels**: collect at the sender, hand over at the receiver, get the upah.
- **Purchase requests**: buy the goods at the supplier with your own money; the requester repays the cost plus the upah.
- **Invitation rounds**: one bundle of cards dropped at several houses, paid at the last stop.
- The upah depends on the route, plus 20 sen per extra small item or 40 sen per extra bulky one, and is locked when you accept.
- Up to three jobs at once and 12 spaces in the bag (small goods take 1, bulky ones 3). Cancel a job before collecting, or return bought goods to the shop for a refund. A job is never paid twice.
- Uncle Lim sells guli, pelekat, komik, card packs, gasing, a wau and a Tamiya. They go into your Koleksi in the bag; the Tamiya is a saving goal.

All **38 locations across five districts** fit the original compact map: 10 kampung, 10 terrace, 8 pekan, 6 community and 4 transport/market. The numbered map includes a district directory. The town includes Melaka-inspired timber homes, Ipoh-inspired shophouses, an old Sekolah Kebangsaan, a Kuala Kangsar-inspired yellow-domed mosque, terrace homes, a retro bus station and pasar malam stalls. These are original stylized 3D meshes inspired by the agreed references, not exact recreations.

- Landscape-only gameplay, with fullscreen/orientation locking where the browser supports it and a portrait gate otherwise.
- Third-person chase camera low behind the shoulder with a wide lens: it swings in behind the runner, pulls in front of walls, frames conversations over the shoulder, and still allows swipe look, pinch and wheel zoom.
- Amir and Nur follow the Jaguh Kampung sheet: heads about a quarter of their height with anime faces, Amir's spiked hair and ringer T-shirt, Nur's hijab under her hoodie hood, baggy cargo trousers, shell-toe sneakers and backpacks. A walk blends into a run with bent-arm pumping and a forward lean. The 14 townsfolk each have their own 3D body, outfit and face from the cast guide: teens in the same style, grown-ups with adult proportions, printed cloth (gingham, batik, florals, pelikat, stripes), tudung, songkok, caps and a straw hat, and the things they carry.
- Generated grass/timber materials, tiled roofs, carved eaves, flowers, full shopfronts and detailed warung props.
- Street props of around 2001 (v1.1): kapcai motorcycles, red and blue plastic warung chairs, LPG tong gas, an ais krim freezer, soft-drink crates, a red pillar post box, Telekom-style payphones, tempayan by kampung stairs, TV aerials on poles, Astro dishes and air-con boxes on the terraces, a kopitiam table, a prepaid-card board, an ais kacang cart, a mosque shoe rack, a gotong-royong banner and a Merdeka ke-44 banner, school warning signs, and timber utility poles with sagging lines. Each building kind places its own props, so they follow the map editor, and trees and paths keep clear of them.
- Landmarks modelled from the concept sheets: a Straits shophouse terrace (salmon five-foot-way pillars over a terracotta-and-cream tiled walkway, arched louvred windows, scalloped valance, weathered plaster, hipped clay roof), a Kuala Kangsar-style mosque (gilded onion dome, four striped minarets with open galleries, cusped red-and-cream arcades) and boxy 1990s family sedans.
- Kampung trees c. 2001, low-poly: leaning kelapa, tattered pisang with jantung, rambutan and mangga in season, jambu air, nangka in its sack, pinang, durian, bamboo, the pekan's rain trees, the school's ketapang and bunga raya hedge, kemboja at the mosque, kebun dapur herbs, and an old beringin by Warung Kak Ita. A dense dusun and rubber smallholding (with tapping cups) rings the town; roads leave through gaps in it. Leaves sway in the breeze. Planting follows the town plan, so it moves with the map editor.
- Thick dark comic outlines, cel-shadow bands, pastel shopfronts, feathered palms and afternoon lighting. Buildings fade when they hide the player.
- Walking at 7.2 world metres/second and running at 11, with rounded body collisions, wall sliding, gated fences, solid props and bridge-only river crossings.
- Every one of the 38 places has a contact and an interaction point (door, counter or gate) that follows the map editor. The quest card shows the chapter step, the next stop and its distance; the map shows the story diamond and job stops.
- The Beg (bag and Koleksi), the Buku (story, jobs with cancel, totals and Kawan-kawan) and the wallet save with your progress.
- Larger 144 px phone joystick with a 60 px thumb grip (128 px on very short screens); desktop keyboard support.
- Local progress saves with resume, save validation and graceful storage failure.
- Complete turn-based congkak with relay sowing, capture, extra turns, scoring and a local opponent.
- Static world geometry batched by material and spatial cell; pixel ratio capped at 2 for mobile performance. The world renderer pauses behind modal menus and congkak.
- Optional original synthesized breeze, bird calls, footsteps and shell sounds.
- The whole town layout comes from one editable plan, with a drag-and-drop map editor and automatic overlap checks. See [the map editor guide](docs/MAP-EDITOR.md).
- No server, sign-in, API keys or runtime CDN needed.

## Jam kampung · the town clock (v1.4)

Time passes while you explore: one game minute per real second. Menus, conversations and congkak stop the clock. A new story starts on **Hari 1, Sabtu, 14:00**. The time, weekday and period (Subuh, Pagi, Tengah hari, Petang, Maghrib, Isyak, Malam) show above your location and in the top bar.

- **Light through the day.** A warm dawn, full afternoon sun, a golden hour from 17:00, a purple Maghrib at 19:30 and a moonlit night. The sun crosses from east to west and its shadows follow. After dark the house windows glow and the cengkerik replace the birds.
- **The town closes.** Most townsfolk are at their posts from 07:00 to 19:15. Kak Ita's warung stays open until 22:00, Pak Din's kiosk until 21:00, Ustaz Hassan stays at the masjid from Subuh to Isyak and Nenek sits on her veranda until 21:30. Off duty, a shop takes parcels at the door but hands nothing out. Faiz, Mei Ling and Atuk leave the padang and answer at their own front doors.
- **Tidur.** From Maghrib (19:30), go to your own front door and choose **Tidur** to sleep through to **06:00 Subuh** the next day. Past midnight the clock waits at 23:59 until you go home.
- Friendship from talking counts once per game day, not once per real day.
- The day and time save with your progress. Saves from v1.3 and earlier wake on Hari 1 at 14:00.

Change the pace, hours and colours in `src/clock.js`: `MINUTES_PER_SECOND`, `HOURS` per NPC and the light keyframes.

## Katalog Kenangan (v1.3)

All 51 existing items have original comic illustrations: 26 shop goods, five snacks, seven collectibles and 13 delivery parcels. Art appears at shop counters, in the bag and collection album, on delivery offers and in the quest book. Tap any picture to view it larger with a Malay nostalgia note. Open **Beg → Katalog Kenangan** to browse the complete catalogue, including delivery-only objects, and filter by category. Browsing does not spend Duit Poket; purchases still use the Beli button. Images are bundled locally and require no image API or server. Existing saves keep their item IDs and balances.

Rebuild the checked-in SVG art with `npm run art`. The images live in `assets/items/`, item names/notes in `src/item-art.js`, and shared image UI in `src/item-ui.js`.

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

This is an explicitly **turn-based introductory variant**. Congkak has regional variations and simultaneous-start forms; this game does not claim to implement every traditional rule set. Nenek uses a one-move local heuristic. Wins and rounds played are saved.

See [the final prototype design brief](docs/FINAL-DESIGN.md) for the implemented visual direction and scope.

## Scope and next work

Version 1.0.0 makes the town a working place: the 14-person cast from the NPC guide with their own bodies, both children playable, the rewritten Chapter 01, and the Duit Poket delivery economy. The cast guide's later steps are not in this version: full daily schedules (townsfolk walking between home and work), congkak with the neighbours and a tournament, dam haji, gasing and guli, the bedroom shelf, and multiplayer. Building interiors are also outside it. Browser emulation validates the controls; physical phone GPU performance still needs device testing.

Save data is stored in the browser on this device and origin; it does not sync across devices. The character, name, chapter step, game day and time, position, wallet, bag, collection, jobs, friendship and congkak record are saved, not a partly played congkak round. Saves from v0.11 and earlier keep the name and Duit Poket and start the new chapter as Amir.

## Code layout

- `src/world.js`: authored procedural town, spatial batches, obstacle geometry and camera occlusion.
- `src/landmarks.js`: low-poly shophouse terrace, mosque and sedan built from the concept sheets.
- `src/routines.js`, `src/actions.js`: each NPC's editable loop and the idle action poses.
- `src/props.js`: the 2001 street props, utility poles and wires, and the painted atlas of their signs.
- `src/characters.js`: one look per character (Amir, Nur and the 14 NPCs) built in metres, anime face drawings, printed cloth, rigidly skinned single-draw meshes and joint animation.
- `src/locomotion.js`: leg-length-relative walk/run cycle, two-bone leg IK and contralateral arm swing.
- `src/illustration.js`: cel-light ramp, halftone shading, pixel-width character hulls (skinned) and town ink.
- `src/town-plan.js`: the editable plan: where every building, vehicle, passer-by and road stands and which way it faces.
- `src/town-layout.js`: building kinds (footprints, raised floors, people spots), the 38 numbered places, districts, the fixed river and bridges, and the layout checks.
- `tools/map-editor.src.html`, `scripts/editor.mjs`: the map editor and its build script (`npm run editor` writes `tools/map-editor.html`).
- `src/collision.js`: circle/rectangle contacts, body-aware bounds and bridge-only river crossings.
- `src/movement.js`: analog input and small collision steps independent of frame rate.
- `src/soundscape.js`: original local ambience and foley.
- `assets/`: generated game materials and provenance.
- `src/main.js`: chase camera, input, character choice, counters and dialogue, quest card, bag, quest book, map and minigame presentation.
- `src/clock.js`: the town clock: game time, weekday and period, who is on duty when, sleeping to Subuh and the light keyframes.
- `src/congkak.js`: pure board rules and opponent, independent of rendering.
- `src/cast.js`: the 14 NPCs (ids, homes, posts, menus, lines), every household contact and where each person stands.
- `src/story.js`: Chapter 01 for both playable characters: steps, events and the chapter's own jobs.
- `src/economy.js`: items, shops, requests, parcels, upah, jobs, bag space, purchases and friendship, as pure functions in sen.
- `src/save.js`: versioned local save validation (v3, with the optional clock) and upgrades from older saves.
- `tests/`: congkak invariants, complete simulated games, gait and IK reachability, collisions, the economy and chapter rules, and save upgrades and storage failure handling.
- `scripts/`: dependency-free development server and static build.
- `vendor/`: checked-in Three.js browser runtime and its MIT license, required for direct branch publishing.
- `src/boot.js`: startup loader with recoverable module-load errors and a timeout.

## Preview

![The kampung at 21:30, windows lit](docs/night-v140.webp)

![Shophouse terrace](docs/shophouses-v080.webp)

![Mosque](docs/mosque-v080.webp)

![Chase camera running through the pekan](docs/chase-camera-v070.webp)

![2001 street props](docs/props-v110.webp)

![The 14 townsfolk](docs/cast-v100.webp)

![Amir and Nur turnaround](docs/character-turnaround-v070.webp)

![Actual compact town with all 38 locations](docs/town-overview-v060.webp)

![Comic shopfronts](docs/comic-shops-v060.webp)

The overhead review camera postpones distant fog to show the entire layout. Gameplay keeps its normal fog and the chase camera. All screenshots are renders of the actual game modules.

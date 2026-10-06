# Illustrated prototype design — v0.9.0

Amir and Nur follow the supplied Jaguh Kampung character sheet, and the camera follows the third-person reference recording: low behind the shoulder, a wide lens, the street and horizon ahead. The world keeps 3D movement, collision and animation, while the art uses colour blocks, ink and a painted horizon. This is a comic-inspired rendering direction rather than a claim to reproduce a feature film's production quality.

## Characters

| Character | Implemented reference details |
|---|---|
| Amir | 1.50 m, head about a quarter of his height. Tall dark-brown anime eyes with two highlights, bold brows, small smile. Messy black hair: a cap with crown spikes, swept-back locks and a two-layer fringe curving over the forehead. White ringer T-shirt with navy collar and cuffs and the pixel alien, navy baggy cargo trousers with buttoned side pockets and a stacked hem, white shell-toe sneakers with black stripes and heel tab, red backpack with badge and green charm, wristwatch. |
| Nur | 1.48 m. Lashed anime eyes and softer brows. Pink hijab framing the face and covering the neck, with the pink hoodie's hood worn up around it. Hoodie with ribbed hem, kangaroo pocket, drawstrings and bunga raya emblem; light blue cargo trousers; shell-toes with pink stripes; black backpack with flower patch and charm. |
| Pak Mat | 1.75 m with adult proportions (smaller head, longer torso). Kopiah over greying hair, moustache, cream baju with buttoned placket and long sleeves, kain pelikat in green and blue checks, selipar. |

Every character is authored in metres at standing pose. Hips, knees, ankles, chest, head, shoulders, elbows and backpack are bones. All opaque parts merge into **one skinned mesh** with rigid weights and vertex colours, plus **one skinned ink hull** whose line weight is constant in screen pixels. Face drawings, chest motifs, flowers and the sarong pattern stay as small textured meshes on their bones. Characters use a lighter cel ramp than the town, so faces and clothes read as clean sunlit colour blocks.

The gait is measured in leg lengths and blends with actual travel speed. A walk keeps one foot on the ground. A run adds a flight phase, longer strides, high knees, 90° elbow pumping and a forward lean. Arms swing against the same-side leg. Standing keeps the legs nearly straight.

## Camera

The chase camera sits 4.4 m behind the player, about 2 m above the ground (0.2 rad pitch over a 1.15 m look point), with a 58° vertical lens. The player stands just below the centre with the horizon in the upper third. While moving, the camera swings in behind the direction of travel. It swings gently when turning and not at all when the player runs back toward the lens, and a recent swipe pauses the follow. A ray to the lens pulls the camera in front of walls and roofs instead of passing through them. Sun shadows are centred on the street ahead. In conversations the NPC turns to face the player and the camera moves to an over-the-shoulder two-shot above the dialogue panel. The title screen keeps its overhead view.

## Landmarks — v0.8.0

The shophouses, mosque and car follow the supplied low-poly concept sheets, rebuilt as code-authored 3D models in `src/landmarks.js`. The images themselves are not used in the game.

| Landmark | Implemented details |
|---|---|
| Shophouse terrace | Seven two-storey Straits shophouses with the upper floor carried over a five-foot way. Salmon brick-toned pillars with banded shafts and cream capitals, a terracotta-and-cream encaustic tiled walkway (walkable, raised 0.26 m), dark shop interiors with folding doors and rolled-up green shutters. Upstairs, arched windows with radial fanlights and louvred shutters alternate peach and sage between cream pilasters. A string course carries each shop's name, then a stepped cornice, a scalloped timber valance and a single hipped clay-tile roof with ridge and hip caps. Walls use a weathered lime-plaster texture of ochre, peach and grey patches; the west end wall has an arched side door. |
| Mosque | Inspired by Kuala Kangsar: open red-and-cream arcades of cusped pointed arches on all four sides, black pier bases, a parapet with saw-tooth cresting and eight gilded pinnacles, a drum with a band of cresting, the large gilded onion dome with finial, and four cream minarets with brown bands, open galleries and gilded caps. The entrance porch has a larger cusped arch and the name plate. |
| Sedan | A boxy 1990s four-door family car with a wedge nose, upright glasshouse with pillars, wide headlamps and grille, wing mirrors, door handles, side trim, tail lamps, a roof aerial and five-spoke alloy wheels. A red and a white one are parked on the main-road verge. No real badges or brand names are used. |

Plain-coloured parts carry their colour per vertex and share two materials (smooth and faceted), so the town batcher still merges each 24 m cell into a few draw calls. Shop walls, roof tiles and walkway tiles use world-scaled textures so they keep one scale along the terrace. Building colliders match the new footprints: shophouse pillars are round 0.4 m posts, minarets are 1.05 m round bodies.

## Environment

Three-step cel lighting replaces smooth plastic shading. Batched ink lines describe building edges and props, faint halftone dots shade surfaces, and road/earth/grass/roof materials use flatter illustrated marks. Warung, kampung homes, terrace homes, school, mosque, Ipoh-inspired shoplots, bus station and market retain their recognizable layout and interactions.

`assets/textures/illustrated-horizon.webp` is a generated painted panorama integrated around the real playable streets. Its distant houses, trees, hills and clouds are an illustrated backdrop, not extra modeled buildings. The playable town uses simple geometry for perspective and collision. There is no fullscreen postprocessing pass or additional render target.

## Controls and scope

Landscape-only gameplay, the 144 px joystick (128 px on short screens), walking at 7.2 m/s, running at 11 m/s, swipe look/tilt, pinch zoom (3–12 m) and camera occlusion fading remain. Ink fades along with blocking buildings to keep the player visible. Optional original sound and existing local save data remain supported.

The chapter remains Amir's home → Nur → Warung Pak Mat → congkak → free exploration. This visual update does not add interiors or new chapters. Drawings represent the reference's main features; expression changes, talking-face animation and film-quality effects are outside this implementation.

See [VALIDATION.md](VALIDATION.md) and the actual model/gameplay screenshots. Browser emulation cannot establish physical-phone frame rate or native orientation-lock behavior.

## Proportion and walking update (v0.5.0, superseded by the v0.7.0 characters above)

World coordinates represent metres. Amir is normalized to 1.50 m, Nur to 1.48 m and Pak Mat to 1.75 m; the earlier children were over 3 m tall. Existing shop floors are roughly 3.65 m each, with 2.4 m shop openings and normal-sized street furniture. The camera is closer to preserve readable avatar framing after this correction.

The school now has a 38 × 10 m classroom block, 4.2 m walls, a 9 × 20 m side wing, covered corridor, assembly court, flag and wider sign. Its western footprint clears the main road. The minimap and zone label reflect the new campus. Ground height follows the lawn, roads, bridge, school court/corridor, terrace driveway and warung floor, so the small avatars do not sink into raised surfaces.

An illustrated transparent grass/leaf/clover decal is scattered and rotated over the lawn in one instanced draw. The ground remains visible between patches. Road and path depth masks the illustration at their edges; the plants do not add gameplay obstacles.

The gait uses support and swing phases, two-bone leg IK and ankle counter-rotation. The soles stay flat during support and lift during swing; bent knees, hip weight shifts, opposing chest turns, arm swing and bag movement replace straight pendulum limbs. Cadence advances from successful travel rather than held input, so animation settles when blocked or stopped. This is a stylized game gait, not world-locked motion capture. Walking/run movement speeds remain 7.2/11 units per second.

See the actual animated models in [walking-preview-v050.mp4](walking-preview-v050.mp4), their sampled poses in `walking-poses-v050.png`, and school/shop scale in the current gameplay screenshots.

# Illustrated prototype design — v0.5.0

Amir and Nur now follow the supplied Jaguh Kampung character sheet through simplified low-poly models with illustrated faces and clothes. The world keeps 3D movement, collision, animation and a freely orbiting camera, while the art uses colour blocks, ink and a painted horizon. This is a comic-inspired rendering direction rather than a claim to reproduce a feature film's production quality.

## Characters

| Character | Implemented reference details |
|---|---|
| Amir | Large expressive drawn eyes, angular black hair, cream/white navy-trimmed T-shirt with a pixel alien, full blue cargo trousers with side pockets, cream striped shell-toe sneakers, red/black backpack with badge and green charm, wristwatch. |
| Nur | Drawn eyes and lashes, pink hijab with an open face and scarf folds, pink hoodie with hibiscus and drawstrings, light blue cargo trousers, cream/pink striped shoes, black backpack with pink flower and dangling flower charm. |
| Pak Mat | Matching low-poly/toon treatment, kopiah and moustache so the NPC fits the same visual world. |

Faces are transparent original canvas drawings projected onto a curved head surface. Clothes, hair, shoes and bags remain lightweight code-authored geometry; no flat character cutout replaces the articulated models. Hips, knees, ankles, shoulders and elbows animate independently. A separate chest pivot counter-rotates against the hips, and the backpacks sway. Opaque surfaces merge by joint and material; all ink hulls on a joint share one draw pass. The static six-view turnaround is rendered from the same models used in gameplay.

## Environment

Three-step cel lighting replaces smooth plastic shading. Batched ink lines describe building edges and props, faint halftone dots shade surfaces, and road/earth/grass/roof materials use flatter illustrated marks. Warung, kampung homes, terrace homes, school, mosque, Ipoh-inspired shoplots, bus station and market retain their recognizable layout and interactions.

`assets/textures/illustrated-horizon.webp` is a generated painted panorama integrated around the real playable streets. Its distant houses, trees, hills and clouds are an illustrated backdrop, not extra modeled buildings. The playable town uses simple geometry for perspective and collision. There is no fullscreen postprocessing pass or additional render target.

## Controls and scope

Landscape-only gameplay, the 144 px joystick (128 px on short screens), walking at 7.2 units/second, running at 11, default camera distance 8 (6–20 zoom range), swipe orbit/tilt, pinch zoom and camera occlusion remain. Ink fades along with blocking buildings to keep the player visible. Optional original sound and existing local save data remain supported.

The chapter remains Amir's home → Nur → Warung Pak Mat → congkak → free exploration. This visual update does not add interiors or new chapters. Drawings represent the reference's main features; expression changes, talking-face animation and film-quality effects are outside this implementation.

See [VALIDATION.md](VALIDATION.md) and the actual model/gameplay screenshots. Browser emulation cannot establish physical-phone frame rate or native orientation-lock behavior.

## Proportion and walking update

World coordinates represent metres. Amir is normalized to 1.50 m, Nur to 1.48 m and Pak Mat to 1.75 m; the earlier children were over 3 m tall. Existing shop floors are roughly 3.65 m each, with 2.4 m shop openings and normal-sized street furniture. The camera is closer to preserve readable avatar framing after this correction.

The school now has a 38 × 10 m classroom block, 4.2 m walls, a 9 × 20 m side wing, covered corridor, assembly court, flag and wider sign. Its western footprint clears the main road. The minimap and zone label reflect the new campus. Ground height follows the lawn, roads, bridge, school court/corridor, terrace driveway and warung floor, so the small avatars do not sink into raised surfaces.

An illustrated transparent grass/leaf/clover decal is scattered and rotated over the lawn in one instanced draw. The ground remains visible between patches. Road and path depth masks the illustration at their edges; the plants do not add gameplay obstacles.

The gait uses support and swing phases, two-bone leg IK and ankle counter-rotation. The soles stay flat during support and lift during swing; bent knees, hip weight shifts, opposing chest turns, arm swing and bag movement replace straight pendulum limbs. Cadence advances from successful travel rather than held input, so animation settles when blocked or stopped. This is a stylized game gait, not world-locked motion capture. Walking/run movement speeds remain 7.2/11 units per second.

See the actual animated models in [walking-preview-v050.mp4](walking-preview-v050.mp4), their sampled poses in `walking-poses-v050.png`, and school/shop scale in the current gameplay screenshots.

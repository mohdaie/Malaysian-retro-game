# Illustrated prototype design — v0.4.0

Amir and Nur now follow the supplied Jaguh Kampung character sheet through simplified low-poly models with illustrated faces and clothes. The world keeps 3D movement, collision, animation and a freely orbiting camera, while the art uses colour blocks, ink and a painted horizon. This is a comic-inspired rendering direction rather than a claim to reproduce a feature film's production quality.

## Characters

| Character | Implemented reference details |
|---|---|
| Amir | Large expressive drawn eyes, angular black hair, cream/white navy-trimmed T-shirt with a pixel alien, full blue cargo trousers with side pockets, cream striped shell-toe sneakers, red/black backpack with badge and green charm, wristwatch. |
| Nur | Drawn eyes and lashes, pink hijab with an open face and scarf folds, pink hoodie with hibiscus and drawstrings, light blue cargo trousers, cream/pink striped shoes, black backpack with pink flower and dangling flower charm. |
| Pak Mat | Matching low-poly/toon treatment, kopiah and moustache so the NPC fits the same visual world. |

Faces are transparent original canvas drawings projected onto a curved head surface. Clothes, hair, shoes and bags remain lightweight code-authored geometry; no flat character cutout replaces the articulated models. Hips, knees, shoulders and elbows animate independently. Opaque surfaces merge by joint and material; all ink hulls on a joint share one draw pass. The static six-view turnaround is rendered from the same models used in gameplay.

## Environment

Three-step cel lighting replaces smooth plastic shading. Batched ink lines describe building edges and props, faint halftone dots shade surfaces, and road/earth/grass/roof materials use flatter illustrated marks. Warung, kampung homes, terrace homes, school, mosque, Ipoh-inspired shoplots, bus station and market retain their recognizable layout and interactions.

`assets/textures/illustrated-horizon.webp` is a generated painted panorama integrated around the real playable streets. Its distant houses, trees, hills and clouds are an illustrated backdrop, not extra modeled buildings. The playable town uses simple geometry for perspective and collision. There is no fullscreen postprocessing pass or additional render target.

## Controls and scope

Landscape-only gameplay, the 144 px joystick (128 px on short screens), walking at 7.2 units/second, running at 11, default camera distance 14, swipe orbit/tilt, pinch zoom and camera occlusion remain. Ink fades along with blocking buildings to keep the player visible. Optional original sound and existing local save data remain supported.

The chapter remains Amir's home → Nur → Warung Pak Mat → congkak → free exploration. This visual update does not add interiors or new chapters. Drawings represent the reference's main features; expression changes, talking-face animation and film-quality effects are outside this implementation.

See [VALIDATION.md](VALIDATION.md) and the actual model/gameplay screenshots. Browser emulation cannot establish physical-phone frame rate or native orientation-lock behavior.

# Prototype design — v0.3.0

The current first chapter is the deliverable: Amir's home → Nur → Warung Pak Mat → congkak → free exploration. The design is implemented directly in the playable game. It keeps the accepted landscape control layout, close camera, swipe viewing and pinch zoom.

## Direction

A warm stylized Malaysian town around 2001: rounded child proportions, recognizable kampung and pekan architecture, aged timber, terracotta and painted roofs, cream plaster, muted vegetation, soft afternoon light and a cream-and-green interface. Details are designed to read at the actual phone gameplay camera.

## Implemented design

| Area | Implementation |
|---|---|
| Characters | Original Amir, Nur and Pak Mat meshes with shaped clothing, collars, faces, hair/hijab/kopiah, shoes and an Amir canvas satchel. Jointed hips, knees, shoulders and elbows; blended idle/walk/run poses. Geometry sharing a joint and material is merged. |
| Kampung | Generated timber and grass materials, side windows, shutters, carved eaves, roof tile material and ridge caps, patterned stair tiles, slippers, flags, flowering porch plants and laundry. |
| Pekan | Textured plaster, framed glazing, shopfront grilles, striped awnings, cornices and tiled five-foot walkways. |
| Warung | Tables/chairs, counter and tins, tea glasses, plates and a modeled congkak board with houses/stores. |
| Landmarks | School flag, mosque trim/windows, terrace-house details, period bus and market stalls. |
| Street life | Original tubular bicycles with spokes, rounded car/bus bodies, glazing, lights, bumpers and wheel hubs; roadside curbs and drains. |
| Vegetation/light | Clustered tree canopies, feathered palm leaflets and central frond ribs, a painted sky gradient, focused sun shadows and soft character contact shadows. |
| Interface | Accepted landscape layout with a 144 px joystick/60 px grip; 128 px base on very short screens. Readable board houses against real wood-grain material. |
| Camera | Default distance 14, swipe orbit/tilt, pinch zoom; solid buildings and foliage soften when they occlude the player. |
| Sound | Optional original synthesized breeze, bird calls, footfalls and shell clicks. No sound downloads or third-party recordings. |

The grass and timber images are generated assets integrated into the actual 3D materials. Buildings, props and characters are original authored procedural geometry. Concept illustrations are not substituted for the playable scene.

## Movement and performance

Walking increases from 4.8 to 7.2 world metres/second; running increases from 8 to 11. Analog travel scales against the rendered joystick. Movement uses elapsed time with small collision steps, retaining the same speed at 60, 10 and 5 frames per second in the movement tests. Long stalls are capped at 250 ms and blur/orientation changes clear held input.

The town is batched by material in 24-metre cells so off-screen areas can be culled. Distant trees have less geometry and distant characters are hidden. Pixel ratio is capped at 2. The renderer pauses behind map, pause and congkak panels. Art remains self-contained in both repository-root and built-folder publishing.

## Scope and validation

This is the visual design for the current playable prototype, not a release of additional chapters, interiors or traditional games. Saves remain local to the browser and an unfinished congkak round does not persist.

See [VALIDATION.md](VALIDATION.md) for automated and browser evidence. Physical phone performance and native fullscreen/orientation support require real-device checks; emulation cannot establish those results. Visual quality is reviewable in the live game and screenshots rather than inferred from a production schedule.

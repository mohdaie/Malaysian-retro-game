# Map editor

The town is built from one plan, `src/town-plan.js`. Every building, vehicle, passer-by and road has an entry there, with a position in metres and a turn in quarter steps. Nothing else in the game hard-codes where things stand: walls, raised floors, colliders, the numbered map, district labels, quest markers, Amir's start point, Nur and Pak Mat all follow the plan.

## Editing the layout

Open the map editor (the Claude artifact "Seri Kenangan Map Editor", or `tools/map-editor.html` on the published site).

- Tap or click a building, car, passer-by or road to select it. Drag to move it, in half-metre steps.
- Turn the selected building with ↺ ↻ in the floating bar, or the R key (Shift+R turns the other way). The small arrow on each building shows which way its front faces.
- Arrow keys nudge by half a metre; Shift+arrow by 5 m. Undo and Redo keep up to 200 steps.
- Roads: drag the round end handles to change the length, set length, width and surface in the panel, turn them 90°, delete them, or add new paths.
- The river, the two bridges and the town edge stay fixed.

The **Layout checks** list updates as you edit. Errors are overlapping buildings, anything in the river or past the town edge, or a missing Rumah Amir or Warung Pak Mat; warnings are buildings standing on an asphalt road. The school's fenced yard may hold the canteen and court. Cars and passers-by may stand on roads.

**Save layout** stores the plan in the artifact so Claude can read it and apply it to `src/town-plan.js`. Outside Claude, **Copy layout** copies the same JSON to paste into a chat.

**Preview in game** opens the live game with the edited plan in the link (`#plan=…`). The game uses it for that visit only, and ignores a plan that has layout errors. Nothing is saved to the game until the plan is committed.

## For developers

- `src/town-layout.js` defines each kind of unit in its own frame: `places` (one rect per numbered place), `solids` (what may not overlap), `floors` (raised walkable ground with a height), `spots` (where people stand) and `decor` (trees planted only where they fit). `derive(plan)` turns a plan into world positions and `planProblems(plan)` runs the checks shared by the game, the tests and the editor.
- `src/world.js` builds each unit inside a group placed and turned by the plan; builders draw in local coordinates with +z as the front.
- After changing `town-layout.js`, `town-plan.js` or `tools/map-editor.src.html`, run `npm run editor` to rebuild `tools/map-editor.html`. A test fails if the committed editor is out of date. `node scripts/editor.mjs --artifact <file>` writes the body used for the Claude artifact.

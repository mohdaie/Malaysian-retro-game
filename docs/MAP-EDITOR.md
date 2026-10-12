# Map editor

The town is built from one plan, `src/town-plan.js`. Every building, vehicle, passer-by and road has an entry there, with a position in metres and a turn in quarter steps. Nothing else in the game hard-codes where things stand: walls, raised floors, colliders, the numbered map, district labels, quest markers, Amir's and Nur's start points, Kak Ita's stall and where each of the 14 townsfolk stands all follow the plan.

## Editing the layout

Open the map editor (the Claude artifact "Seri Kenangan Map Editor", or `tools/map-editor.html` on the published site).

- Tap or click a building, car, passer-by or road to select it. Drag to move it, in half-metre steps.
- Turn the selected building with ↺ ↻ in the floating bar, or the R key (Shift+R turns the other way). The small arrow on each building shows which way its front faces.
- Arrow keys nudge by half a metre; Shift+arrow by 5 m. Undo and Redo keep up to 200 steps.
- Roads: drag the round end handles to change the length, set length, width and surface in the panel, turn them 90°, delete them, or add new paths.
- The river stays fixed. A road that crosses the river from bank to bank, east–west, gets its own bridge as wide as the road; the old footbridge stays where no road crosses nearby. A road that runs into the river without crossing it is flagged.

The panel has three tabs: **Edit** (the selection, checks and saving), **+ Bangunan** (the building library) and **Saiz peta** (town size and grid).

### Adding buildings

**+ Bangunan** lists every kind of building in the game, grouped by category, with a footprint, its size and how many are on the map. Search by name or category.

- Tap a card to add a copy. It lands on the nearest free ground (clear of buildings, roads and the river) near the middle of the view; drag it where you want it.
- Copies are *extra* buildings: they have no number, contact or door, so the story and jobs never send anyone there. Give one a signboard name in the Edit tab. Extra buildings can be duplicated (⧉ or Ctrl+D) and deleted (Delete key).
- Kinds the story needs exactly once (Rumah Amir, Warung Kak Ita, the shophouse row, the school and canteen, the mosque, the petrol kiosk and the town bus) show *Sudah ada*: tapping them finds the one on the map.
- The 38 numbered places can be moved and turned but not deleted.

### Your own buildings

**Bangunan baru** adds a custom building. In the Edit tab choose its shape, size and look:

| Shape | What you get |
|---|---|
| Bangunan batu | A plaster block: 1–4 storeys, pitched or flat roof, wall and roof colours, a door, windows and a signboard |
| Rumah kampung bertiang | A timber stilt house with verandah and stairs, in your colour |
| Wakaf / pondok terbuka | An open shelter with posts and benches |
| Dataran / padang | Paved ground in your colour; it may sit on a road |

Width and depth go from 2 to 80 m. **Save as template** keeps the building in the library under the category you picked, so you can place it again; ✕ on a template card removes it.

### Town size and grid

**Saiz peta** grows or shrinks each side (north, south, west, east) by 10 m, up to 200 m from the centre. Buildings stay put; the new land is empty. The ground, river, orchard and rubber trees, the in-game map and walking routes all follow the edge. *Back to the original size* removes the setting. The same tab sets the grid spacing (5, 10 or 20 m), the snap step (0.5–5 m) and whether the grid shows; those are remembered in this browser only.

The **Layout checks** list updates as you edit. Errors are overlapping buildings, anything in the river or past the town edge, or a missing Rumah Amir, Rumah Nur or Warung Kak Ita; warnings are buildings standing on an asphalt road. The school's fenced yard may hold the canteen and court. Cars and passer-by spots may stand on roads. Passer-by spots keep trees clear for future walkers; v1.0.0 does not draw anyone there.

**Save layout** stores the plan in the artifact so Claude can read it and apply it to `src/town-plan.js`. Outside Claude, **Copy layout** copies the same JSON to paste into a chat.

**Preview in game** opens the live game with the edited plan in the link (`#plan=…`). The game uses it for that visit only, and ignores a plan that has layout errors. Nothing is saved to the game until the plan is committed.

## For developers

- `src/town-layout.js` defines each kind of unit in its own frame: `places` (one rect per numbered place), `solids` (what may not overlap), `floors` (raised walkable ground with a height), `spots` (where people stand) and `decor` (`[species, x, z, size]` trees, planted only where they fit; `decorVariants` offers several yards). `props` (`[name, x, z, quarter turns, height, print]`) are the 2001 street props; `placeProps` in `src/planting.js` keeps only those clear of roads, doors, people and the river. `src/planting.js` adds the lawn, river-bank and edge trees from the plan, so trees follow any edit and a preview link shows them. `derive(plan)` turns a plan into world positions and `planProblems(plan)` runs the checks shared by the game, the tests and the editor.
- The plan may carry `bounds` (`{ minX, maxX, minZ, maxZ }`; `boundsOf(plan)` fills defaults and limits), extra units without `places`, `custom` units (`{ style, w, d, storeys, wall, roofColor, roof, name, cat }`, see `CUSTOM_STYLES` and `customLook`) and `templates` for the library, which the game ignores. `TOWN_BOUNDS` and `GROUND` come from the plan in use.
- **Adding a new built-in kind:** add it to `KINDS` with its footprint, then give it a `cat` (and `unique` if the story needs exactly one) in the list after `KINDS`, and a builder of the same name in `src/world.js`. It appears in the library by itself. Builders for kinds that can be copied must cope with `u.places` being empty (use `unitName(u)` for the sign).
- `src/world.js` builds each unit inside a group placed and turned by the plan; builders draw in local coordinates with +z as the front.
- After changing `town-layout.js`, `town-plan.js` or `tools/map-editor.src.html`, run `npm run editor` to rebuild `tools/map-editor.html`. A test fails if the committed editor is out of date. `node scripts/editor.mjs --artifact <file>` writes the body used for the Claude artifact.

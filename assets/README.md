# Game art provenance

- `textures/kampung-grass.webp`: generated specifically for this game with the built-in image-generation tool, October 2026. Prompt requested seamless tropical lawn albedo without scene objects, text or perspective.
- `textures/kampung-timber.webp`: generated specifically for this game with the built-in image-generation tool, October 2026. Prompt requested seamless horizontal aged kampung timber boards without scene objects or text.
- Both are WebP encodings of the original generated outputs, with no compositing or external photographic source.
- Roof, plaster, earth, road, sign, flag, sky and contact-shadow textures are original canvas art in `src/world.js` and `src/characters.js`.
- All building, vegetation, vehicle, prop and character meshes are original code-authored geometry. Character animation and sound synthesis are implemented in the repository.
- Three.js is the only external runtime dependency; its MIT license is in `vendor/THREE-LICENSE.txt`.

- `textures/illustrated-horizon.webp`: generated with the built-in imagegen tool, October 2026, and encoded as WebP for the actual game's surrounding scenery. Prompt: "Painted panoramic distant scenery for a playable Malaysian kampung game circa 2001; warm ink outlines, cel colour blocks, subtle paper grain and comic halftone; mostly warm blue sky/cream clouds above layered blue-green hills, palms, trees and small terracotta-roof houses; compatible wrap edges; no foreground ground, people, UI, lettering or watermark." This is a horizon texture, not a gameplay screenshot.
- v0.4.0 face, shirt, flower, ground and roof markings are original canvas drawings. Amir/Nur geometry and outfits interpret the user-supplied character reference with low-poly meshes. The reference image itself is not redistributed in the repository.

# Game art provenance

- `textures/kampung-grass.webp`: generated specifically for this game with the built-in image-generation tool, October 2026. Prompt requested seamless tropical lawn albedo without scene objects, text or perspective.
- `textures/kampung-timber.webp`: generated specifically for this game with the built-in image-generation tool, October 2026. Prompt requested seamless horizontal aged kampung timber boards without scene objects or text.
- Both are WebP encodings of the original generated outputs, with no compositing or external photographic source.
- Roof, plaster, earth, road, sign, flag, sky and contact-shadow textures are original canvas art in `src/world.js` and `src/characters.js`.
- All building, vegetation, vehicle, prop and character meshes are original code-authored geometry. Character animation and sound synthesis are implemented in the repository.
- Three.js is the only external runtime dependency; its MIT license is in `vendor/THREE-LICENSE.txt`.

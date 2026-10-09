# Retro Malaysia: guide for coding agents

A browser game (Three.js, plain ES modules, no bundler) set in a fictional Malaysian town around 2001.
`README.md` is the player-facing spec and changelog. Its **Code layout** section lists every module.
Read only the files a task needs; most tasks touch one or two.

## Commands

```sh
npm ci          # once per checkout
npm test        # node --test tests/*.test.js, about 15 s; must pass before every commit
npm run build   # writes dist/; CI runs it too
npm run dev     # http://localhost:4173
```

CI (`.github/workflows/ci.yml`) runs `npm ci && npm test && npm run build` on every push.

## Rules that break things if missed

- **Versioned imports.** Every import and asset URL carries `?v=<version>`, for example
  `import { ITEMS } from './economy.js?v=2.12.0'`. Use the current version in any new import.
  To release a new version, replace the old string everywhere in one go (`src/`, `index.html`, `scripts/`,
  `README.md` line 3, the version label in `index.html`, `package.json`, `package-lock.json`).
  `tests/publishing.test.js` checks that they match.
- **Saves must keep working.** Saves live in localStorage (`src/save.js`). Each system has
  `new*()` / `clean*()` functions (for example `newEconomy` / `cleanEconomy`) that validate and upgrade old data.
  When you add a saved field, give it a default in `new*()` and accept its absence in `clean*()`.
  Never rename or remove saved fields without an upgrade path, and add a test for the old shape.
- **Pure rules, separate UI.** Game rules (`economy.js`, `story.js`, `congkak.js`, `dam-haji.js`, `gasing.js`,
  `tamiya.js`, `nostalgia-quests.js`, `clock.js`) are pure functions over plain objects, tested in Node.
  DOM and Three.js code goes in `*-ui.js`, `*-view.js`, `world.js` and `main.js`. Keep new rules testable the same way.
- **Money is whole sen** (integers). Show it with `rm()` from `economy.js`.
- **Code style:** follow the file you are editing. Files are dense: short names, one-line arrow
  functions, few comments. Do not reformat code you did not change.
- **No new runtime dependencies.** Three.js is the only one, vendored in `vendor/`.
- **Language:** in-game text is Bahasa Melayu (casual) mixed with English, as in the existing lines.

## Where to change common things

| Task | File(s) |
|---|---|
| NPC names, homes, menus, dialogue lines | `src/cast.js` |
| Chapter 01 steps and events | `src/story.js` (tests: `tests/chapter.test.js`) |
| Items, prices, shops, delivery requests, upah | `src/economy.js`; item art titles and notes in `src/item-art.js`, SVGs via `npm run art` |
| Keepsake quests (set one) | `src/nostalgia-quests.js`, items in `src/nostalgia-items.js` |
| Keepsake quests (set two: Digimon, Tamagotchi…) | `src/nostalgia-set-two.js` |
| Journal (Buku) tabs and tasks | `src/journal.js` (logic), `src/journal-ui.js` (render) |
| NPC daily loops and poses | `src/routines.js`, `src/actions.js`, `src/crowds.js`, `src/errands.js` |
| Game clock, shop hours, prayer times | `src/clock.js`, `src/shop-hours.js`, `src/prayer.js` |
| Building positions, roads, places | `src/town-plan.js` (prefer the map editor: `npm run editor`), checks in `src/town-layout.js` |
| Minigames | congkak `src/congkak.js`; Dam Haji `src/dam-*.js`; gasing `src/gasing*.js`; Tamiya `src/tamiya*.js` |
| HUD, dialogue panel, menus, camera, input | `src/main.js`, `index.html`, `styles.css` |
| Music and ambience | `src/music.js`, `src/soundscape.js`, `assets/audio/` |
| Offline / install (PWA) | `src/pwa.js`, `sw.js`, `scripts/pwa-build.mjs` |

## Game intro video (`intro/`)

A separate HyperFrames project, not part of the game build. The game plays its 720p export, `assets/video/intro.mp4`,
on a new story (`src/intro.js`, wired in `newStory()` in `src/main.js`). Read `intro/README.md` first: it has the beat sheet.
Dialogue lines and all timings are in `intro/index.html` (search for `type("#l`).
Check and render from inside `intro/`: `npm run check`, then `npm run render` (about 3 minutes), then `npm run export-game`.

## Workflow

1. Read only the relevant file(s) above, plus the matching test in `tests/`.
2. Make the smallest change that does the job. Add or adjust a test when you change rules.
3. Run `npm test`; fix failures before committing.
4. Commit on the session's working branch with a clear message. Never push to `main` directly.
5. For a player-visible feature, add a short note to `README.md` in the same style as the existing sections.

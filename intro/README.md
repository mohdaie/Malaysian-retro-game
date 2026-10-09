# Retro Malaysia — game intro

A [HyperFrames](https://hyperframes.heygen.com) composition: the supplied **Scene 1**
(20 s) followed by the **gallery** continuation (34 s). Total **54 s**, 1920×1080, 24 fps.
Rendered file: `renders/retro-malaysia-intro.mp4`.

This folder is not part of the game build (`scripts/build.mjs` copies only the game's own
paths). The game ships a 720p export of the render instead.

## Edit and render

```bash
cd intro
npm run dev      # Studio preview: click/drag anything, edits save to index.html
npm run check    # lint + runtime + layout + contrast
npm run render   # → renders/retro-malaysia-intro.mp4
npm run audio    # rebuild assets/audio from Scene 1 and the game soundtrack
npm run export-game  # copy the render into the game as ../assets/video/intro.mp4 (720p)
```

The game plays `assets/video/intro.mp4` when a player starts a new story (see `src/intro.js`).
After re-rendering, run `npm run export-game` so the game gets the new cut.

Requires Node 22+ and FFmpeg. The CLI is pinned to `hyperframes@0.8.141`.

## Beat sheet

| Time | Picture | Dialogue / sound |
| ---- | ------- | ---------------- |
| 0–20 | Scene 1 (as supplied) | rain, *Kejaplah. Tengok gambar lama dulu...* |
| 20.0 | Phone lifts: lock screen blurs into the album | cloth swish, rain carries on |
| 20.6 | Album *Cuti Sekolah 2000* | *Sore Kampung* fades in |
| 22.0 | ″ | *Bestnya... rindu zaman budak-budak dulu.* |
| 25.6 | ″ (slow push-in) | *Boleh main gasing, bola petang-petang.* |
| 29.3 | Tap the photo, viewer opens: Walkman & Digimon | tap |
| 30.3 | ″ | *Fuh, legend gila Walkman dengan Digimon dulu-dulu nih.* |
| 35.0 | Swipe: Too Phat album | swipe |
| 35.8 | ″ | *Peh, album Too Phat... gila kenangan time ni.* |
| 40.0 | Swipe: KLCC | swipe |
| 40.8 | ″ | *Time-time remaja, memang selalu pegi KLCC ni lepak.* |
| 44.8 | ″ | *Fuh... kenangan..* (music swells) |
| 48.0 | Notification: *Nak balik zaman 2000? Klik sini* | chime, music ducks |
| 49.2 | Camera creeps in | *...* (thinking) |
| 51.2 | Tap *Klik sini*, light floods out of the screen | tap, rising pull |
| 51.75 | Black | silence |
| 52.6 | Black | Walkman play-key *clunk* |
| 54.0 | End — the game begins | |

## Assets

- `assets/video/scene-1.mp4`, `assets/stills/01–05`: supplied by mohdaie, October 2026.
  `00-scene-1-last-frame.webp` is Scene 1's final frame.
- `assets/audio/rain-bed.m4a`: Scene 1's own rain, looped. `sore-kampung-intro.m4a`:
  the first 32 s of the game soundtrack (`../assets/audio/`). `sfx-*.wav`: synthesized by
  `scripts/make-audio.sh` with FFmpeg.
- `assets/fonts/DejaVuSans*.ttf`: DejaVu Sans, matching Scene 1's dialogue box
  (licence in `LICENSE-DejaVu.txt`).

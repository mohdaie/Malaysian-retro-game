# Buku: discoveries, tasks and keepsakes (v2.7.0)

The old book exposed every quest, future clue trail, game achievement and NPC in one text-heavy list. The journal now opens on a compact illustrated view with fixed tabs and its own scrolling content.

| Tab | Visible content |
| --- | --- |
| Tugasan | Current short chapter goal, active deliveries and accepted keepsake stories |
| Kenangan | Earned keepsakes, actual item photos and their personal stories on request |
| Pekan | Games already played and people already met |

Before a quest is accepted through conversation, no card or keepsake marker appears. Pak Salleh invites exploration without naming the six givers or rewards. Cards reveal the current phase only: delivery gates first, completed clue stops and one next clue during the trail, then game challenges. Each task mark reads actual economy/quest progress; it cannot be manually checked. Details and discovered notes start collapsed. Future rewards stay anonymous in both catalogue thumbnails and item inspection until earned.

Chapter progress remains tied to the real delivery, clue, challenge, claim and exhibition gates. Accepted stories carry a small exhibition tag. Sharing an earned story with Pak Salleh still completes the chapter without consuming its item. Existing progress and per-character saves remain intact.

Validation: 160 Node tests pass; the production build passes. Journal tests cover undiscovered quests, independent delivery gates, ordered clue visibility, Tamiya track requirements, earning and save cleaning, plus multi-stop delivery checkmarks. Headless Chrome checks actual rendered tabs, hidden quests, locked catalogue and inspector, partial checkmarks, reload persistence, earned photo/story, inspector return and phone layout at 932 × 430 and 640 × 360. Test fixtures use the real quest/economy functions; they do not time full physical playthroughs.

Previews: [discovery](journal-discovery.png), [checklist](journal-checklist.png), [keepsake](journal-keepsake.png), [phone](journal-phone.png).

To rerun the rendered checks, install Chromium and run `node scripts/check-journal-browser.mjs`. Set `RETRO_CHROMIUM` to its executable path if it is not on PATH. The check starts its own local server and isolated browser profile.

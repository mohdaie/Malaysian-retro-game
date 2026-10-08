# Buku: discoveries, tasks and keepsakes (v2.7.3)

The old book exposed every quest, future clue trail, game achievement and NPC in one text-heavy list. The journal now opens on a compact illustrated view with fixed tabs and its own scrolling content.

| Tab | Visible content |
| --- | --- |
| Tugasan | Exact chapter action, active deliveries, accepted keepsake stories and discovered game objectives |
| Kenangan | Earned keepsakes, actual item photos and their personal stories on request |
| Pekan | Games already played and people already met |

Before a quest is accepted through conversation, no card or keepsake marker appears. Pak Salleh invites exploration without naming the six givers or rewards. Cards reveal the current phase only: delivery gates first, completed clue stops and one next clue during the trail, then game challenges. Each task mark reads actual economy/quest progress; it cannot be manually checked. Current task checklists open automatically. Discovered notes and earned keepsake checklists remain expandable. Each requirement includes the actual menu path needed to complete it. The delivery gates explain that a complete job counts once, repeated destinations count once, and the quoted route must be at least 60 m; walking extra laps does not qualify. Accepted-job cards show item quantities, pickup or purchase cost, ordered drop-offs and the next-action directions. Completed delivery gates and revealed clues stay individually recorded. Challenge cards specify the opponent, difficulty and individual tracks, then explain the dedication and handover needed to claim the keepsake. Every achievement for a discovered game appears with its exact condition, including pending ones. Future rewards stay anonymous in both catalogue thumbnails and item inspection until earned.

Chapter progress remains tied to the real delivery, clue, challenge, claim and exhibition gates. Accepted stories carry a small exhibition tag. Sharing an earned story with Pak Salleh still completes the chapter without consuming its item. Existing progress and per-character saves remain intact.

Validation: 173 Node tests pass; the production build passes. Journal tests cover undiscovered quests, independent delivery gates, ordered clue visibility, Tamiya track requirements, earning and save cleaning, plus multi-stop delivery checkmarks. Headless Chrome checks actual rendered tabs, hidden quests, locked catalogue and inspector, partial checkmarks, reload persistence, earned photo/story, inspector return and phone layout at 932 × 430 and 640 × 360. Test fixtures use the real quest/economy functions; they do not time full physical playthroughs.

The HUD now uses live independent delivery/destination/long-route counts. If the first tutorial parcel is cancelled, Pak Rahman offers it again and the book points to reacceptance. Before accepting Nenek’s tea request, the chapter points to Nenek instead of a missing job.

Additional rendered checks cover the exact actions for all six stories, purchase reimbursement, multi-stop order, next-action navigation, pending game achievements, dedication and exhibition handover, with no horizontal overflow at 932 × 430, 640 × 360 and 812 × 375.

Previews: [current tasks](journal-exact-tasks.png), [game tasks on a phone](journal-game-tasks-phone.png).

To rerun the rendered checks, install Chromium and run `node scripts/check-journal-browser.mjs`. Set `RETRO_CHROMIUM` to its executable path if it is not on PATH. The check starts its own local server and isolated browser profile.

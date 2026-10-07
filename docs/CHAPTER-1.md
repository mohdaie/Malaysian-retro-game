# Chapter 1: Cuti Sekolah → Pameran Kenangan (v2.7.0)

The first six errands introduce the town. Buying a collectible now leads to Pak Salleh's invitation, rather than ending the chapter. The school-holiday exhibition supplies a shared purpose for the six keepsake stories.

| Part | Player activity | Purpose in the chapter |
|---|---|---|
| Kenal Pekan | Meet friends, deliver for Pak Rahman and Nenek, play congkak, buy a first collectible | Meet the town and learn its economy |
| Bina Kepercayaan | Hear Pak Salleh's invitation, accept a keepsake story, complete varied deliveries and long routes | Earn the giver's trust and become a reliable helper |
| Pameran Kenangan | Follow clues, win challenges, collect a personal keepsake, return to the balai raya | Discover and share a town story; complete the chapter |

## Connections visible to the player

- Mei Ling mentions the exhibition in the opening dialogue.
- The chapter HUD has a phase label and follows a real next stop: a delivery pickup/destination, clue location, challenge host or reward giver. Off-duty game hosts keep their existing hours.
- Buku shows a short current goal and navigation only to known objectives. Undiscovered keepsake stories are found by exploring and talking, without a marker or a list of future quests.
- Accepted keepsake stories have a small Chapter 1 exhibition tag. The most advanced active story is followed, and any of the six can carry the chapter forward. Starting another quest keeps previous progress.
- An earned keepsake is not the ending by itself. The player returns to Pak Salleh, shares its completed narrative and sees a personal display naming its owner, giver, dedication and game day.
- Sharing keeps the collectible and wallet unchanged. The display can be revisited. The remaining keepsake quests stay open.

## Saves

Existing step-6 saves resume at the invitation with their money, items, quests and minigame records intact. Keepsakes already earned count after hearing the invitation. Chapter stages after the invitation are reconciled from actual keepsake progress, so an interrupted scene resumes at the appropriate objective. A completed chapter needs a valid earned-item exhibition record. Amir and Nur retain separate displays in their existing save slots.

## Validation

- 160 automated tests pass. Added coverage checks real delivery → clue → challenge → claim → sharing gates, all six routes, required opponents/track coverage, old-ending saves, invalid completion data, duplicate sharing and separate player displays.
- Production build and cache-version checks pass.
- Previous chapter checks covered invitation, final sharing, retained item/money and exhibition restoration. New journal checks at 932 × 430 and 640 × 360 cover discovery, anonymous catalogue/inspector, automatic checkmarks, save/reload, earned archive and tab layouts. UI progression fixtures use the real economy and quest functions; full physical gameplay duration has not been timed.

Phone landscape previews: [Buku](journal-discovery.png), [task checklist](journal-checklist.png), [earned keepsake](journal-keepsake.png), [personal exhibition](chapter-exhibition-ending.png).

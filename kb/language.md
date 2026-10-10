# Language and localization

## Contract

`src/i18n.ts` is the only UI localization boundary.

- `Locale` is the supported locale union (`it` | `en`).
- `MessageKey` identifies UI copy; components call `translate(locale, key, params)` through the `t()` helper in `src/main.ts`.
- `CategoryId` is language-neutral (`all` plus the 16 selectable category IDs). `WordEntry.category` stores one selectable ID. `GameSettings.category` stores `all`, one selectable ID, or a non-empty array of selectable IDs; it never stores display labels. `all` draws from the 15 standard categories; `spicy_18` requires explicit selection.
- `categoryLabel(locale, id)` produces the visible category label.
- `WordEntry` keeps both `word`/`hint` and `wordEn`/`hintEn`; `localizeEntry(entry, locale)` selects the visible values without mutating game state. The `hint` fields now supply the impostor's paired word; their names remain for saved-session compatibility. `src/spicy-18.ts` owns the 300 user-supplied Italian pairs and their English term translations. `src/bomb-content.ts` owns Bomba's bilingual prompts; its separate `spicy_18` category contains 150 Hot 18+ topics and stays out of the standard `all` draw unless selected directly.

The locale lives once, in `AppData.language`. `Game` does not duplicate it. This prevents stale per-game locale state when users change language during an active round.

## Adding a locale

1. Add the locale code to `supportedLocales` and `Locale`.
2. Add a complete catalog matching `MessageKey`; TypeScript rejects missing or extra message keys.
3. Add translations for every `CategoryId` in `categoryMessageKeys`.
4. Extend locale normalization and the language toggle if the locale needs a new UI control.
5. Add catalog/category tests and manually validate setup, reveal, vote, result, dialogs, and language switching during reveal.

No game, database, or word-entry fields should be added for a new locale. Snapshots must match current contract; invalid data is discarded rather than migrated.

## Compatibility

`loadData()` validates snapshots at the persistence boundary. A snapshot with invalid category selection, language, player, or top-level fields is deleted and treated as a fresh install. No legacy labels or per-game language fields are migrated.

Active games retain their saved bilingual content when catalog wording changes. Validation checks content shape, non-empty text, supported categories, the four-choice Stessa Onda format, and unique Chi sono? identity IDs; it does not compare saved text with current catalog. Preserve category, prompt, and identity IDs when polishing copy. New rounds use revised catalogs, while resumed rounds keep original content.

Prefer concrete, playful vocabulary and accurate translations. Bomba themes need enough possible answers; Stessa Onda choices must be distinct and comparable; Chi sono? identities must be broadly recognizable and suitable for yes/no deduction. Display labels may change independently of stable IDs.

Twit uses `src/twit-content.ts` for 60 bilingual estimation questions: 31 less familiar trivia facts and 29 scoped numerical puzzles. The default deck replaces elementary recall with engineering, space, sports, culture, combinations, and growth. There is one release deck, with no difficulty toggle. Keep units, counting conventions, historical editions, and required rounding explicit in both languages. Approximate physical quantities use the cited reference value as the scoring target and say “circa/about”; do not present them as exact measurements. Avoid live-changing trivia and answers above the supported 1,000,000,000 limit.

Retain IDs when revising the same subject; assign new descriptive IDs for new subjects. Removed questions still belong to already saved matches: saved wording and numerical answers survive, even if their IDs no longer appear in the release deck. New games/rematches draw current content. UI and contextual help use `twit.*`, `catalog.twit.*`, and `help.twit.*` messages. Number formatting follows `data.language`; saved estimates and predictions remain locale-neutral.

Trivia sources checked for the harder deck on 2026-10-11:

- Eiffel rivets, parts, iron, and construction paint: [official construction figures](https://www.toureiffel.paris/en/the-monument/history).
- Golden Gate wires, total wire length, and anchorage-to-anchorage cable length: [bridge design statistics](https://www.goldengate.org/bridge/history-research/statistics-data/design-construction-stats/). Cable length uses the published whole-metre reference.
- Empire State stairs, windows, and bricks: [official facts](https://www.esbnyc.com/about/facts-figures).
- Statue of Liberty steps: NPS [pedestal-to-crown](https://www.nps.gov/stli/planyourvisit/physical-mobility-in-the-crown.htm) and [pedestal climb](https://www.nps.gov/stli/planyourvisit/visiting-the-pedestal.htm). These are separate climbs, not a historical combined stair count.
- Space: NASA [Moon distance](https://science.nasa.gov/moon/facts/), [Sun photosphere](https://science.nasa.gov/sun/facts/), [Mercury solar day](https://science.nasa.gov/mercury/facts/), [Venus sidereal rotation](https://science.nasa.gov/venus/venus-facts/), and [Saturn V height and fuelled mass](https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-saturn-v-grades-5-8/). Height rounds to the nearest metre; other approximate targets use published reference figures.
- LHC circumference and magnet design counts: [CERN technical figures](https://home.web.cern.ch/science/accelerators/large-hadron-collider/).
- Light speed and caesium frequency: [BIPM SI defining constants](https://www.bipm.org/en/measurement-units/). Caesium frequency converts hertz to kilohertz, rounded to the nearest integer.
- Rubik move bound: [researchers’ half-turn metric proof](https://www.cube20.org/).
- Titanic boilers: [Titanic Belfast fact file](https://www.titanicbelfast.com/history-of-titanic/ship-fact-files/titanic-fact-file/): 24 double-ended plus 5 single-ended.
- Isner–Mahut 2010: [Wimbledon compendium](https://www.wimbledon.com/pdf/Wimbledon_Compendium_2021v3.pdf): 11 h 5 min converts to 665 minutes; the published set scores total 183 games.
- Qatar 2022 goals: [FIFA tournament summary](https://inside.fifa.com/tournaments/mens/worldcup/qatar2022/news/triumphant-argentina-conclude-unprecedented-fifa-world-cup).
- LEGO model pieces: [set 75192 specifications](https://www.lego.com/en-us/product/millennium-falcon-75192), using the exact piece count rather than rounded marketing copy.
- Dante verse count: [Treccani’s Dante entry](https://www.treccani.it/enciclopedia/dante-alighieri_%28Storia-della-civilt%C3%A0-europea-a-cura-di-Umberto-Eco%29/).

Puzzle answers follow explicit premises rather than external trivia: distinguish ordered draws from combinations, count each handshake once, define grid dimensions as cells, and exclude the ending instant when counting clock overlaps. Ideal folding/doubling questions state the model rather than claiming physical feasibility.

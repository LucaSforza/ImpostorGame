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

Twit uses `src/twit-content.ts` for 60 bilingual estimation questions: 36 familiar trivia facts and 24 short numerical puzzles. The default deck aims for a middle difficulty: recognizable landmarks, sports, films, music, board games, anatomy, space, and culture, plus small counting problems that allow mental reasoning. Avoid specialist constants, obscure engineering inventories, huge combinations, and long calculations. There is one release deck, with no difficulty toggle. Difficulty is an editorial target, not a measured playtest result.

Keep units, counting conventions, historical editions, and required rounding explicit in both languages. Approximate physical quantities use the cited reference value as the scoring target and say “circa/about”; do not present them as exact measurements. Avoid live-changing trivia and answers above the supported 1,000,000,000 limit.

Retain IDs when revising the same subject; assign new descriptive IDs for new subjects. Removed questions still belong to already saved matches: saved wording and numerical answers survive, even if their IDs no longer appear in the release deck. Changed scopes also preserve old saved answers (for example, the old 8 × 8 square count remains 204; new 5 × 5 questions use 55). New games/rematches draw current content. UI and contextual help use `twit.*`, `catalog.twit.*`, and `help.twit.*` messages. Number formatting follows `data.language`; saved estimates and predictions remain locale-neutral.

Trivia sources checked for the balanced deck on 2026-10-11:

- Eiffel: [2022 antenna height](https://www.toureiffel.paris/fr/actualites/visite/la-terrasse-dete-2022-celebre-la-tour-de-330-metres), [ground-to-second-floor stairs](https://www.toureiffel.paris/en/faq/spot/how-can-you-walk-eiffel-tower-foot).
- Landmarks: [Empire State facts](https://www.esbnyc.com/about/facts-figures), NPS [Liberty height including pedestal](https://www.nps.gov/stli/learn/statue-of-liberty-facts.htm), Guinness [Burj Khalifa](https://www.guinnessworldrecords.com/news/icons/burj-khalifa-the-tallest-building-in-the-world) and [Everest’s 2020 elevation](https://www.guinnessworldrecords.com/world-records/highest-mountain). Heights with fractional metres round to the nearest whole metre.
- Sports dimensions: World Athletics [marathon](https://worldathletics.org/disciplines/road-running-event/marathon), IFAB [goal width](https://www.theifab.com/laws/latest/the-field-of-play/), FIBA [rim height](https://refereeing.fiba.basketball/images/docs/doc/5ebfbbb5a9f17da0f62ab2174cebaa85/FIBABasketballEquipment2018.pdf) and [court length](https://www.venueguide.fiba.basketball/vanue-design). Convert published metres/millimetres to the requested units.
- Sports records: FIFA [Fontaine 1958 goals](https://www.fifa.com/en/articles/just-fontaine-thirteen-goals-1958) and [Qatar 2022 goals](https://inside.fifa.com/tournaments/mens/worldcup/qatar2022/news/triumphant-argentina-conclude-unprecedented-fifa-world-cup), Team USA [Phelps medals](https://www.teamusa.com/profiles/michael-phelps), NBA [2023–24 schedule](https://www.nba.com/news/2023-24-nba-regular-season-schedule), and [Wimbledon compendium](https://www.wimbledon.com/pdf/Wimbledon_Compendium_2021v3.pdf). Isner–Mahut’s 11 h 5 min rounds to 11 whole hours of play, not elapsed days.
- Films: AFI Silver [The Godfather](https://silver.afi.com/movies/detail/0100001483/) and [Star Wars](https://silver.afi.com/movies/detail/0100000791/). Use the specified theatrical cuts, not extended or later editions.
- Music: [concert harp orchestration reference](https://andrewhugill.com/manuals/harps/index.html), [Yamaha 88-key keyboard](https://usa.yamaha.com/products/musical_instruments/pianos/arius/ydp-s36/index.html), and [Yamaha standard orchestral tuning](https://hub.yamaha.com/winds/wood/why-does-the-oboe-lead-the-orchestra-in-tuning/). An 88-key A-to-C keyboard has seven complete groups of five black keys plus the initial A-sharp (36).
- Board games: Mattel [classic UNO deck](https://service.mattel.com/us/productPopup.aspx?prodno=W2085&siteid=27), Hasbro [Monopoly equipment](https://instructions.hasbro.com/en-ca/instruction/monopoly-game) and [English Scrabble](https://consumercare.hasbro.com/en-us/product/scrabble-board-game-classic-word-game-for-kids-ages-8-and-up-fun-family-game-for-2-4-players-the-classic-crossword-game/5160FAAF-E466-4934-A6AB-A0607AFA1747). Edition/language scopes avoid conflicting counts.
- Anatomy: NIAMS [adult skeleton](https://www.niams.nih.gov/health-topics/educational-resources/health-lesson-learning-about-bones), Cleveland Clinic [27 bones per hand](https://my.clevelandclinic.org/health/diseases/broken-hand), [26 per foot](https://pages.clevelandclinic.org/foot-ankle-index.html), and [24 ribs](https://my.clevelandclinic.org/health/body/rib-cage), plus AKC [normal adult dog dentition](https://www.akc.org/expert-advice/health/how-many-teeth-do-dogs-have/). These are typical complete adult counts, not claims about every individual.
- Space: NASA [Moon distance](https://science.nasa.gov/moon/facts/), [Sun photosphere](https://science.nasa.gov/sun/facts/), [Mars day](https://science.nasa.gov/mars/facts/), [Apollo Moon walkers](https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-apollo-program-grades-k-4/), [Saturn V height](https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-saturn-v-grades-5-8/), and [Earth circumference reference](https://firms.modaps.eosdis.nasa.gov/content/tutorials/fire-footprint/). Heights round to the nearest metre and the 24.6-hour Mars day rounds to 25 hours; other approximate targets use published reference figures.
- Culture: Treccani [Inferno canto count](https://www.treccani.it/magazine/lingua_italiana/recensioni/recensione_321.html) and Senate [Italian Constitution](https://www.senato.it/documenti/repository/istituzione/costituzione.pdf), numbered through article 139, excluding transitional provisions.

Puzzle answers follow explicit premises rather than external trivia: distinguish coloured dice, ignore the order of card pairs, count each handshake once, define grid dimensions as cells, and exclude the ending instant when counting clock overlaps. Ideal folding questions state the model rather than claiming physical feasibility. Current scopes use 5 × 5 square/rectangle grids, 4 × 4 × 4 painted cubes, six stairs, 3 × 3 route grids, and at most three dice. All 24 puzzle answers are below 1,500; the largest comes from choosing a pair of cards.

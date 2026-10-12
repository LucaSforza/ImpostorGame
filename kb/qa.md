# Validation

## Twit balanced default deck — 2026-10-11

- Baseline: 129 tests passed. Editorial revision only; no gameplay, random-turn, UI, or persistence implementation changes. Final gates: 131 tests, production build, and `git diff --check` passed.
- Rebalanced all 60 IT/EN questions into 36 familiar trivia facts and 24 short mental puzzles. Removed specialist constants, engineering inventories, huge combinations, and long growth calculations. Independently checked all 24 puzzle targets with Python arithmetic/combinations/calendar checks; updated enumerations for smaller grids, cubes, pages, and stairs. Sources and approximation conventions are in [language](language.md). Difficulty remains an editorial judgement, awaiting group playtesting.
- Added storage/scoring coverage for a retired light-speed question and the old 8 × 8 square question sharing a revised ID. Both keep their saved text, target, answers, and totals after a mid-round reload; rematches draw the current deck. Earlier easy-deck compatibility still passes.
- Browser on isolated local origin restored the prior light-speed question unchanged, then drew the new four-pizza-cuts question. Public and private IT/EN wording passed. At 320 × 740, document width was 305 px and private form 231 px; at 390 × 844, document width was 375 px. Submitting an estimate of 12 concealed the form, called Bruno after Carla, and kept Bruno after reload. Console had no warnings/errors.
- Sampled one new puzzle, not all 60 questions. Did not repeat a complete browser match, physical-device QA, or blur checks. Existing automated gameplay/privacy coverage remains green. Public deployment is verified after push separately.

## Twit harder default deck — 2026-10-11

- Baseline: 127 tests passed. This is an editorial deck revision, not a functional bug fix. Final gates: 129 tests, production build, and `git diff --check` passed. Rules, random turns, UI, and persistence implementation are unchanged.
- Reviewed 60 IT/EN questions: 31 sourced trivia facts and 29 numerical puzzles. Verified all 29 puzzle targets independently with Python arithmetic/combinations/calendar checks; also checked caesium unit conversion, tennis minutes/game totals, and boiler addition. Source links and approximation conventions are in [language](language.md). Existing topic IDs remain stable; different topics have new descriptive IDs.
- New tests independently enumerate chess squares/rectangles, painted edge cubes, digit counts, staircase routes, and grid routes. A retired `planets` question with answer 8 survives storage/result scoring; its rematch draws the revised deck. Every release answer fits the input limit.
- Browser QA on isolated local origin restored the older IPv4 question unchanged, then started a new match with the light-speed question. Italian/English projection passed. At 320 × 740, public question width was 305 px within 320 px; at 390 × 844, private form width was 390 px. A 300,000,000 estimate submitted successfully, concealed the form, and advanced to Ada; reload kept that next player. Console had no warnings/errors.
- This content-focused run sampled one new question, not every question or the longest wording. It did not repeat a complete match, blur checks, or physical-device QA.

## Twit random turns — 2026-10-11

- Baseline: 124 tests passed. New regression failed against unchanged production code: rounds lacked the expected shuffled `turnOrder` (12 existing Twit tests passed, one failed). After implementation, all 127 tests, production build, and `git diff --check` passed.
- Coverage proves an out-of-roster-order next player is required, saved order survives an interrupted round, later rounds choose independently, points still follow player IDs, old snapshots without orders finish unchanged, and malformed orders/answered prefixes are rejected.
- Local browser at 390 × 844 called Bruno → Ada → Carla, concealed each form, and retained Ada after mid-round reload. Round awards remained Bruno/Ada +3, Carla +0. Round 2 chose Ada as reader and first private holder rather than following the roster rotation. At 320 × 740, reload retained Ada; document width 305 px stayed within the 320 px viewport. No console warnings/errors.
- This focused run did not repeat the entire three-round browser match, language/blur checks, or physical-device QA; prior release evidence below remains applicable.

## Twit release — 2026-10-11

- Baseline: 14 files, 110 tests passed. Before production edits, three assertions failed because catalog lacked Twit and old snapshots lacked Twit defaults. New rules tests were written before the module; initial suite could not import the not-yet-created feature. Final gates: `npm test` (16 files, 124 tests), `npm run build`, and `git diff --check` passed.
- Coverage: 3–20 bounds; 1/3/5/10 rounds; unique bilingual deck; private turn validation; whole-number estimates; other-player predictions; closest/farthest ties; equal answers; cumulative totals; complete-match-only and exactly-once statistics; rematch isolation; every saved phase; earlier wording; malformed progress/winners; failed-write preservation; prototype-like profile IDs; all four earlier active sessions, photos, and counters migrate intact.
- Local browser QA used an isolated origin at 390 × 844 and 320 × 740. Three QA profiles completed three rounds: first awarded 3/3/0, then two all-correct tied rounds awarded 3/3/3 each; final 9/9/6 declared two winners. Mid-round and result reload preserved progress/awards; language change and reload concealed the private form. Confirming an answer showed the next holder only. Forms stayed within viewport, input/select height was 48 px, submit height 62 px at 320 px, and document width never exceeded viewport.
- Italian/English help and question projection passed. Rematch kept three rounds and profiles, with a new starter/question; abandoning it added no scores. Statistics and a further reload showed exactly one Twit match per participant (two wins, one loss), all other counters zero. Console had no warnings/errors.
- Not checked in this run: physical iPhone/Safari keyboard, blur/pagehide/visibility concealment, reduced motion, full keyboard navigation, network inspection, or all earlier games' browser flows. Their existing automated tests remain green. Public deployment is checked after push separately.

## Bomba timer range — 2026-09-27

- New rounds choose a random duration from 45 through 120 seconds, inclusive. Persistence still accepts old 20–44 second active sessions and new 45–120 second sessions.
- Regression evidence: before implementation, `npm test` had 6 failures covering random boundaries, invalid lower bound, 120-second rematch/creation, and loading 120-second snapshots. After implementation, `npm test` passed: 14 files and 110 tests.
- Browser QA and build were not run per request; automated test suite only.

## Bomba Hot 18+ topics — 2026-09-27

- Added 150 bilingual Hot 18+ prompts under a separate selectable category. Selecting All and default Bomba decks exclude these prompts; selecting Hot 18+ uses only that deck.
- Automated checks pass: `npm test` reports 14 files and 105 tests; `npm run build` and `git diff --check` pass. Content coverage checks exact prompt count, unique IDs, translations, and exclusion from All/default decks.
- Browser QA was not performed; setup rendering and live category selection remain unverified in a browser.

## Impostore Spicy 18+ and random rematches — 2026-09-27

- Baseline `npm test`: 14 files, 101 tests passed. New regressions failed before the changes: repeated starter, unavailable `spicy_18`, zero adult pairs, and a rotated rather than shuffled participant order. All pass after the implementation.
- Content tests verify 300 bilingual pairs in a separate `spicy_18` category, nonidentical crew/impostor terms, and exclusion from the default deck. Existing `spicy_personal` content remains available.
- Local browser QA at 390 × 844 on an isolated development origin: choosing Spicy 18+ from All selected only that category; setup showed 300 pairs; three temporary players completed a two-attempt round. Crew word rendered green, impostor word red, both with 2 px role-colored borders and no horizontal overflow. A failed first vote returned to discussion; the second vote completed the round. Rematch opened with a hidden card, a different starter, and a different word.
- Final gates: `npm test` reports 14 files and 104 tests; `npm run build` and `git diff --check` pass. The final shuffled-order change was covered by tests but did not receive another browser run. GitHub Pages workflow and public site remain unverified until push.

## Impostore private reveal and rematch — 2026-09-27

- Baseline `npm test`: 13 files, 98 tests passed. A new privacy regression failed before the concealment helper existed, then passed after the result was cleared synchronously before rematch persistence.
- Local browser QA on an isolated development origin at 390 × 844: three-player round showed readable green crew and red impostor labels, large word/hint text, and a hidden first card after rematch. At 320 × 740, the revealed card and action stayed within the viewport width; `sceneggiatura` fit on one line at the final 34 px minimum. Document width remained below viewport width.
- Final gates passed: `npm test` reports 14 files and 99 tests; `npm run build` and `git diff --check` pass. Deployed GitHub Pages behavior remains unverified until the push deploys.

## Impostore second vote — 2026-09-27

- Regression reproduced: a three-player game configured for two votes threw `Invalid attempt count`. After extending the limit, a wrong first accusation leaves a second vote that can find the impostor; focused game and persistence tests pass (53 tests across 2 files).
- Three-player settings with two votes survive a local snapshot round trip. A legacy in-progress game retains its saved voting limit, while new setup values clamp to the revised bound. Browser setup showed `Da 1 a 2`, enabled `Più tentativi`, then retained `2` after reload.
- Final gates passed: `npm test` reports 14 files and 101 tests; `npm run build` and `git diff --check` pass. Deployed GitHub Pages behavior remains unverified until the push deploys.

## Multi-game release acceptance matrix

Automated gates:

- catalog resolves exactly four available stable game IDs and rejects unknown IDs; saved retired Stessa Onda sessions remain supported;
- legacy IndexedDB snapshot migrates without losing players, photos, selections, Impostore settings, active game, or counters;
- invalid new snapshots are rejected; failed writes preserve previous snapshot;
- shared player selection is visible to every game setup;
- every new game/rematch draws a random first player, preserves the shared roster, and saves the chosen order; reload must not rerandomize it;
- each game enforces its documented player bounds and rejects malformed settings/content;
- Impostore regression suite remains green;
- new Impostore sessions allow at most `max(2, floor((players - 1) / 2))` attempts (3–4 players → 2); setup clamps limits after selection changes, and valid older in-progress sessions retain their saved rules;
- Bomba exposes no pass/holder controls or remaining time, expires from a persisted random deadline, resumes into play or adjudication, rejects invalid loser IDs, and records selected loser plus all winners once;
- a fresh Bomba expiry produces one local explosion sound and brief animation plus an accessible BOOM message; reload does not replay it, reduced motion suppresses animation, and unavailable audio does not prevent adjudication;
- Stessa Onda keeps choices private until completion, resolves single/tied/no-match winner groups, and records once;
- Chi sono? hides own identity, reveals only other identities privately, rotates active players, permits one adjudicated guess each, resolves winner/all-wrong results, changes identities on rematch, and records once;
- Twit keeps estimates/predictions private, awards closest +2 and correct farthest predictions +1 including ties, sums all chosen rounds, resumes every phase, rematches without repeated questions when possible, and records completed matches once;
- aggregate statistics equal sum of per-game records and reject inconsistent edits;
- Italian and English catalogs cover every message and game-content projection;
- `npm test` and `npm run build` pass from clean checkout.

Browser QA at 390 × 844 and 320 × 740:

- catalog shows four usable game cards, Pocket Circle brand, privacy promise, no horizontal overflow;
- every route follows the normative Night Arcade tokens: deep-plum shell, warm-white readable copy, lime primary action/focus, common cards and controls; game identity never replaces the full-page palette;
- mobile copy remains at least 14 px for body text and 12 px for metadata, tap targets remain at least 44 × 44 px, and no essential copy is low-contrast or laid over busy artwork;
- header remains usable without clipping at 320 px: readable brand, icon navigation with accessible names, and no horizontal page scrollbar;
- contextual help shows app guidance on catalog, statistics guidance on `#stats`, and matching rules for each selected or active game; verify every variant in Italian and English without state mutation;
- each card opens correct setup and shared saved profiles survive reload and game switching;
- complete one session of every game, then verify separate `#stats` page for all players and all games;
- refresh during each private/realtime phase: secrets return hidden, Bomba deadline continues without showing remaining time, completed results do not double count;
- navigate back/forward between `#catalog` and `#stats`; active sessions require explicit exit confirmation;
- switch Italian/English on catalog, setup, live game, result, and statistics screens;
- verify keyboard focus, button labels, dialogs, reduced motion, empty roster, empty statistics, long names, and local photo avatars;
- inspect network after load: no gameplay, tracking, advertising, or content requests;
- test deployed GitHub Pages URL after push and confirm workflow completion.

## Stessa Onda removal and profile form — 2026-10-12

- Baseline before production edits: `npm test` passed (16 files, 131 tests). Catalog regression was then added and failed in two places against unchanged code: catalog still exposed `same-wave`, and registry accepted it.
- Catalog regression now expects four available games. Setup no longer permits selecting Stessa Onda, and a legacy selected-game value resets to Impostore when no session is active. Existing active Stessa Onda sessions and saved historical statistics remain supported.
- Player dialog no longer renders editable statistics. New profiles start with zero statistics; editing name/avatar leaves saved counters unchanged.
- Final automated checks passed: `npm test` (16 files, 131 tests), `npm run build`, and `git diff --check`.
- Browser QA not performed: local dev server could not bind in sandbox (`listen EPERM`).

## Default language — 2026-10-12

- Fresh app state now starts in English. Saved snapshots continue loading their selected locale, so Italian users keep Italian when reopening the app.
- IndexedDB regression confirms selected Italian locale survives save/load. Full suite, build, and diff check pass.

## Previous Impostore validation

Validated in the Codex in-app browser using smartphone viewport overrides of 390 × 844 and 320 × 740.

- Created five characters; all remained after reload.
- Configured two impostors, with the upper limit enforced in the UI.
- Revealed a card by dragging upward; reloaded and confirmed the same player's card was hidden again.
- Passed the phone through all five players. Three crew members received the same word; two impostors received the same hint without the secret word.
- Switched the interface to English during a game; current word, hint, category labels, and UI re-rendered in English without changing roles or phase.
- Voting QA passed with five players and two impostors: setup exposed valid session range `2..5`; three sessions allowed exactly one suspect each; a second selection was ignored; the selected suspect could be deselected; a citizen vote returned to discussion; a later vote found one impostor without ending the game; the third vote found the second impostor and crew won at `3 di 3`.
- Voting persistence passed: after a failed first session and after finding one impostor, reload preserved session number and showed previous candidates as disabled `Già votato`; result listed every accused candidate across sessions.
- Final-session loss passed: with two sessions, two citizen votes exhausted the limit and declared an impostor win at `2 di 2`.
- Started a rematch and confirmed English cards and a new word.
- Checked the result view at the narrow viewport: no horizontal overflow.
- Validated `get_game_setup` WebMCP readback; invalid input rejected without modifying state. The tool does not expose roles, words, hints or player names.
- Validated setup at the mobile viewport: initial screen uses the gameplay palette/background, and the new-character dialog exposes manual avatar selection plus a styled random-avatar action with a random initial choice.
- Validated mobile setup actions: character cards remain usable in a single-column layout; Edit opens prefilled name/avatar data; Delete opens an explicit confirmation dialog before removing a character.
- Validated avatar rendering constraint: preset avatars and local photos use `object-fit: contain`; the reveal card preserves source aspect ratio and never stretches uploaded images. Upload input accepts gallery files and mobile camera capture.
- Simulated two complete games with three players: one crew win and one impostor win. Verified role-specific counters and percentages on the home screen, edited Ada's counters through `Modifica`, reloaded, and confirmed scores persisted without double-counting.
- Simulated a two-attempt game: configured the maximum, made one incorrect vote, confirmed return to discussion with one attempt remaining, then found the impostor on the second vote. Result showed `2 di 2` attempts used.

Automated checks: `npm test` (26 tests) and `npm run build`. Tests cover IndexedDB snapshot replacement, structured cloning, failure preservation, invalid-snapshot deletion, legacy player-stat and attempt-setting normalization, out-of-range attempt rejection; player/impostor/session limits, one-candidate vote resolution, candidate elimination, progressive impostor discovery, role uniqueness, single- and multi-category validation, consecutive-word exclusion, snapshot isolation, locale catalog/projections, win conditions, and role-specific result recording.

Browser-local data belongs to its origin. The development preview and public GitHub Pages site intentionally have separate databases. Runtime data is never committed to Git or uploaded during deployment.

## Pocket Circle release validation — 2026-09-19

- Automated gates passed: `npm test` reports 8 files and 48 tests; every test is under `tests/`. `npm run build` and `git diff --check` pass.
- Completed Impostore, Bomba, and Stessa Onda sessions with three shared profiles. Verified per-game and overall results on separate statistics screen and no duplicate score after reload.
- Bomba QA confirms common timer only, no pass/holder control, expiry into manual group adjudication, loser selection, result persistence, and delayed statistic recording.
- Contextual help verified in English for catalog, statistics, Impostore, Bomba, and Stessa Onda, plus Italian Impostore variant. Dialog open/close preserved route and game state.
- Direct reload on `#setup` restores selected setup. `#catalog` and `#stats` navigation resets scroll to top.
- Night Arcade visual system verified on catalog, setup, live Bomba, results, dialogs, and statistics. At 390 × 844 and 320 × 740, document width equals viewport content width; catalog body copy computes to 14 px and metadata to 12 px. Desktop 1280 × 800 uses three catalog columns.
- Fresh browser load produced no console errors or warnings. Source scan found no runtime `fetch`, `XMLHttpRequest`, `WebSocket`, or `EventSource` calls.
- Final IndexedDB tests cover malformed nested statistics, invalid game categories, malformed discriminated active sessions, valid Bomb resume, legacy attempt clamping, deletion of corrupt snapshots, and preserved writes.

## Chi sono? validation — 2026-09-21

- Automated gates passed after final changes: `npm test` reports 11 files and 96 tests; `npm run build` and `git diff --check` pass. Coverage includes 3–20 bounds, unique private identities, turn rotation, one buzz attempt, elimination, winner/all-wrong results, rematch identity changes, persistence migration, 60 bilingual identities, and exactly-once scoring.
- Luna browser QA completed full local flow with three shared profiles: four-card catalog, setup minimum, private views excluding own identity, reload/language concealment, all reveals, next-turn rotation, buzz identity reveal, wrong elimination, correct winner, all-wrong result, rematch with changed identity, and statistics preserved without double count after reload.
- Contextual help passed in Italian and English for catalog, statistics, and Chi sono?. Browser run used 1265 × 714 and showed no visible horizontal scrollbar.
- Not verified in this run: exact 390 × 844 and 320 × 740 viewport overflow/tap sizes, console logs, blur/visibility concealment, keyboard, reduced motion, network inspection, and active-session history navigation. Reload and language concealment were verified.

## Chi sono? Safari scroll regression — 2026-09-21

- User recording reproduced retained setup scroll after starting a game: Safari kept the previous document offset while replacing setup with the private reveal screen, leaving its heading and action above the viewport.
- Regression test first failed because the scroll-reset helper did not exist, then passed after resetting `window`, `document.scrollingElement`, `document.documentElement`, and `document.body` immediately and across two animation frames.
- Local browser QA at 390 × 844 started from setup `scrollY=568`; after `Inizia la partita`, reveal opened at `scrollY=0` with heading and `Mostra le identità` visible.
- At 320 × 740, reveal opened at `scrollY=0`, `scrollWidth` equaled the 320 px viewport, and the reveal action was visible. The exact high-offset transition could not be recreated at this width because the automation scroll gesture did not move the setup document.
- Final gates: `npm test` reports 12 files and 97 tests; `npm run build` and `git diff --check` pass. Public GitHub Pages remains unverified until this fix is committed and pushed.

## Chi sono? reveal artwork sizing — 2026-09-21

- Browser QA reproduced a visual defect in the private identity screen: `.character-art` rendered at `672.7 × 882.7 px` and covered the viewport instead of staying inside the live card.
- Root cause: `.character-art` uses `position: absolute; inset: 0`, while its direct `.game-screen.live-card` parent has `position: static`; the image therefore resolves against the page viewport. The same class remains correctly contained when nested in `.secret-card`.
- Regression test first failed against the unfixed stylesheet, then passed after constraining direct live-card artwork to normal flow with a 320 px height limit.
- Browser QA after fix showed heading/helper and reveal action visible, artwork contained in the card at `320 px`, no horizontal overflow at the active `673 × 883` viewport, private identities preserved, turn rotation, buzz identity reveal, and wrong-answer elimination.
- Final gates passed: `npm test` reports 13 files and 98 tests; `npm run build` and `git diff --check` pass. Exact 390 × 844/320 × 740 viewport checks and public GitHub Pages remain unverified in this post-fix run.

## Public launch readiness — 2026-10-12

- Original baseline: 16 files / 132 tests and build passed after `npm ci`. Final counts/gates are recorded in [launch progress](../docs/launch-readiness.md).
- Browser regressions reproduced lost avatar/opener/saved-selection focus, supported active rules changing 3→2, secret persisting during delayed save, category action under 44px and invalid generic-div ARIA. Fixed at UI/startup layer without changing schema or game engines.
- Production offline suite passed all four completed games, roster/language/session persistence, exactly-once scores, hash history, safe shared links, native/copy/manual sharing, secret privacy, reduced motion, mobile/desktop layout and touch targets. Static worker caches no profiles/photos/answers.
- Worker update fixture passed waiting activation until old clients close, cache cleanup, offline new version with full snapshot unchanged and failed-download recovery. `Vary: Origin` module mismatch was reproduced by real offline reload and corrected for public precached assets.
- Axe WCAG-tag scans passed catalog, all setups, stats, dialogs and key gameplay states. Network inspection: no gameplay API/third-party requests, console/page errors absent. Actual screenshots in [marketing](../marketing/README.md).
- Not performed: physical iOS/Android installation, manual screen-reader session, public deployment, external platform preview delivery or actual itch.io upload. These require owner smoke checks after approval; cache eviction/first-ever offline launch remain inherent limitations.

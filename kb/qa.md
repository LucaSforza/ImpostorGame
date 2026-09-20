# Validation

## Multi-game release acceptance matrix

Automated gates:

- catalog resolves exactly three stable game IDs and rejects unknown IDs;
- legacy IndexedDB snapshot migrates without losing players, photos, selections, Impostore settings, active game, or counters;
- invalid new snapshots are rejected; failed writes preserve previous snapshot;
- shared player selection is visible to every game setup;
- every new game/rematch draws a random first player, preserves the shared roster, and saves the chosen order; reload must not rerandomize it;
- each game enforces its documented player bounds and rejects malformed settings/content;
- Impostore regression suite remains green;
- new Impostore sessions allow at most `floor((players - 1) / 2)` attempts (3–4 players → 1); setup clamps limits after selection changes, and valid older in-progress sessions retain their saved rules;
- Bomba exposes no pass/holder controls or remaining time, expires from a persisted random deadline, resumes into play or adjudication, rejects invalid loser IDs, and records selected loser plus all winners once;
- a fresh Bomba expiry produces one local explosion sound and brief animation plus an accessible BOOM message; reload does not replay it, reduced motion suppresses animation, and unavailable audio does not prevent adjudication;
- Stessa Onda keeps choices private until completion, resolves single/tied/no-match winner groups, and records once;
- aggregate statistics equal sum of per-game records and reject inconsistent edits;
- Italian and English catalogs cover every message and game-content projection;
- `npm test` and `npm run build` pass from clean checkout.

Browser QA at 390 × 844 and 320 × 740:

- catalog shows three usable game cards, Pocket Circle brand, privacy promise, no horizontal overflow;
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

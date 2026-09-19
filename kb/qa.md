# Validation

## Multi-game release acceptance matrix

Automated gates:

- catalog resolves exactly three stable game IDs and rejects unknown IDs;
- legacy IndexedDB snapshot migrates without losing players, photos, selections, Impostore settings, active game, or counters;
- invalid new snapshots are rejected; failed writes preserve previous snapshot;
- shared player selection is visible to every game setup;
- each game enforces its documented player bounds and rejects malformed settings/content;
- Impostore regression suite remains green;
- Bomba advances holders, increments answers, expires from persisted deadline, resumes after reload, and records all winners/loser once;
- Stessa Onda keeps choices private until completion, resolves single/tied/no-match winner groups, and records once;
- aggregate statistics equal sum of per-game records and reject inconsistent edits;
- Italian and English catalogs cover every message and game-content projection;
- `npm test` and `npm run build` pass from clean checkout.

Browser QA at 390 × 844 and 320 × 740:

- catalog shows three usable game cards, Pocket Circle brand, privacy promise, no horizontal overflow;
- each card opens correct setup and shared saved profiles survive reload and game switching;
- complete one session of every game, then verify separate `#stats` page for all players and all games;
- refresh during each private/realtime phase: secrets return hidden, Bomba deadline continues, completed results do not double count;
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

# Validation

Validated in the Codex in-app browser using smartphone viewport overrides of 390 × 844 and 320 × 740.

- Created five characters; all remained after reload.
- Configured two impostors, with the upper limit enforced in the UI.
- Revealed a card by dragging upward; reloaded and confirmed the same player's card was hidden again.
- Passed the phone through all five players. Three crew members received the same word; two impostors received the same hint without the secret word.
- Switched the interface to English during a game; current word, hint, category labels, and UI re-rendered in English without changing roles or phase.
- Selected both impostors in the collective vote; the result correctly declared a crew win.
- Started a rematch and confirmed English cards and a new word.
- Checked the result view at the narrow viewport: no horizontal overflow.
- Validated `get_game_setup` WebMCP readback; invalid input rejected without modifying state. The tool does not expose roles, words, hints or player names.
- Validated setup at the mobile viewport: initial screen uses the gameplay palette/background, and the new-character dialog exposes manual avatar selection plus a styled random-avatar action with a random initial choice.
- Validated mobile setup actions: character cards remain usable in a single-column layout; Edit opens prefilled name/avatar data; Delete opens an explicit confirmation dialog before removing a character.
- Validated avatar rendering constraint: preset avatars and local photos use `object-fit: contain`; the reveal card preserves source aspect ratio and never stretches uploaded images. Upload input accepts gallery files and mobile camera capture.
- Simulated two complete games with three players: one crew win and one impostor win. Verified role-specific counters and percentages on the home screen, edited Ada's counters through `Modifica`, reloaded, and confirmed scores persisted without double-counting.
- Simulated a two-attempt game: configured the maximum, made one incorrect vote, confirmed return to discussion with one attempt remaining, then found the impostor on the second vote. Result showed `2 di 2` attempts used.

Automated checks: `npm test` (24 tests) and `npm run build`. Tests cover IndexedDB snapshot replacement, structured cloning, failure preservation, invalid-snapshot deletion, legacy player-stat and attempt-setting normalization, out-of-range attempt rejection; player/impostor/attempt limits, role uniqueness, single- and multi-category validation, consecutive-word exclusion, snapshot isolation, locale catalog/projections, win conditions, and role-specific result recording.

Browser-local data belongs to its origin. The development preview and public GitHub Pages site intentionally have separate databases. Runtime data is never committed to Git or uploaded during deployment.

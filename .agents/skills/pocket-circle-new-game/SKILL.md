---
name: pocket-circle-new-game
description: Add a new pass-and-play game to this Pocket Circle repository, including rules, bilingual content, catalog, local persistence, shared statistics, and UI. Use for new games here, not standalone websites or content-only edits.
---

# Add a Pocket Circle game

Paths below are relative to the repository root. Read `AGENTS.md`, `kb/README.md`, `kb/catalog-design.md`, `kb/game-rules.md`, and the relevant sections of `kb/architecture.md`, `kb/indexeddb.md`, and `kb/language.md`.

## Rules and tests

Establish player bounds, phases, private/public information, finish condition, winners (including ties/no winners), and rematch behavior. Ask only for missing rules that change gameplay. Keep one phone, local storage, and no runtime network calls.

Write observable tests before production code. Run them and capture the expected failure. For fixes, reproduce the actual defect first; a missing import alone is not evidence of a bug in existing behavior. Make the smallest correction and rerun the regression.

Use a pure `src/<game>.ts` module and, when needed, a separate bilingual content module. Examples: `src/bomb.ts` for absolute deadlines and adjudication; `src/same-wave.ts` for private choices and tied winners. Snapshot players and content so catalog edits cannot mutate a running game. Use stable prompt/category IDs, natural Italian/English text, and distinct, comparable answer choices.

## Integration points

- `src/catalog.ts`: extend `GameId`, metadata, and registry validation. `GameCatalog` currently explicitly requires exactly three IDs; update that assumption and its tests for a fourth game.
- `src/game.ts`: extend the discriminated `ActiveGame` union. Sessions need an ID, participating players, phases, and `scoreRecorded`.
- `src/db.ts`: extend `SettingsByGame`, `PlayerStats`, zero counters, validation, and normalization. Prior snapshots lack the new fields: migrate with zero counters/default settings while preserving profiles and active sessions. Keep database `impostor-game`, version `1`, store `snapshot`, key `current` unless the task requires a physical-schema migration. Look at he UML insiede `kb/indexeddb.md` to see the model of the database. Modify it if necessary.
- `src/stats.ts`: extend game-to-counter mapping and aggregate enumeration. Only completed results score; update canonical profiles by ID and persist `scoreRecorded` with counters in the same snapshot. Wins plus losses must equal games played.
- `src/main.ts`: extend initial settings, art/name/help maps, setup/start/rematch dispatch, active rendering, result recording, and startup recovery. Branches are handwritten: catalog metadata alone does not integrate a game. Reuse the roster and `change()` persistence path. Hide private content on player transitions, language changes, blur, pagehide, and hidden visibility. Timed games persist absolute deadlines.
- `src/i18n.ts`: supply Italian/English catalog copy, controls, errors, and contextual help. `data.language` remains the sole locale source. Extend existing Night Arcade tokens/components in `src/style.css` rather than introducing another theme.

## Verify and document

Cover relevant player limits, invalid input, transitions, results/ties, rematch, snapshot round trips, migration, interrupted writes, and exactly-once scoring. Valid saved content must survive editorial catalog changes; never compare saved display strings with the latest catalog text.

Run `npm test`, `npm run build`, and `git diff --check`. Follow `kb/qa.md` for browser checks at 390×844 and 320×740: complete a session, reload mid-game and after results, switch languages, navigate, inspect statistics, and check overflow. Report checks actually performed and limitations.

Update affected KB pages and QA evidence. Do not duplicate the KB here. Adding a game does not itself authorize deployment.

# Architecture

Pocket Circle is a single-page app written in TypeScript and bundled by Vite. The build produces static assets for GitHub Pages; the Vite configuration uses the legacy repository base path `/ImpostorGame/`. There is no application backend.

The multi-game target keeps one shell and one persisted snapshot. `GameCatalog` supplies immutable game metadata; `ActiveGame` is a discriminated union dispatched by `gameId`. Shared players live above every game. Catalog, setup, categories, and statistics are application screens; active-session phases remain owned by each game. See [catalog design](catalog-design.md) for acceptance boundaries.

## Modules

- `src/main.ts` owns the application shell, screen routing, rendering, and events. `init()` loads the local snapshot; every mutation goes through `change()`, which clones state, saves it, and then re-renders. It delegates game rules to pure game modules.
- `src/catalog.ts` owns `GameCatalog`, `GameId`, and immutable localized catalog metadata.
- `src/game.ts` owns the `Game` model, random word selection, role assignment, localized word/hint/category projection, voting-session bounds, one-candidate vote resolution, candidate elimination, progressive impostor discovery, the crew win condition, and pure player-stat updates for completed games.
- `src/bomb.ts` owns Bomb prompts, deadline creation, pass progression, expiry, and result projection.
- `src/same-wave.ts` owns Stessa Onda prompts, private selections, grouping, and winner resolution.
- `src/stats.ts` owns zeroed statistics, legacy conversion, aggregate derivation, invariant checks, and exactly-once result updates.
- `src/db.ts` defines `AppData`, wraps snapshot reads and writes in IndexedDB, migrates valid legacy snapshots at the boundary, and deletes snapshots that fail supported contracts.
- `src/i18n.ts` owns the typed locale catalog, interpolation, and localized category labels. UI code passes message keys to `translate()`; it does not carry Italian/English pairs.
- `src/words.ts` contains stable category IDs and the bilingual `WordEntry` corpus.
- `src/style.css` contains the interface presentation, including the red/orange gameplay card treatment and character artwork.

## State and language

`AppData` stores shared players, selections, selected catalog game, per-game settings, interface language, and optional `ActiveGame`. `data.language` remains the single locale source. Sessions store language-neutral IDs and bilingual content; switching language re-renders current game consistently.

The reveal card is controlled by the module variable `revealed`, which is not part of `AppData` and is never saved. `visibilitychange`, `pagehide`, and `blur` reset it to `false`, so rendering hides the card when the app loses visibility. During the unrevealed state, the card shows character artwork and can be opened with the accessible Reveal button or by swiping upward more than 55 pixels. The local snapshot still contains the active game, including the word entry, role IDs, vote history, and score-recording flag needed to resume after a reload.

## Persistence and startup

At startup, `loadData()` reads the snapshot. If one exists, the app restores players, settings, and the active game; otherwise it saves the initial state. An IndexedDB error leaves the app unavailable and shows a message asking the user to enable site data. All persistence is local to the browser and the app's origin; there is no server-side database.

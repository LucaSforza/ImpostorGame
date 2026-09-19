# Architecture

Impostor is a single-page app written in TypeScript and bundled by Vite. The build produces static assets for GitHub Pages; the Vite configuration uses the base path `/ImpostorGame/`. There is no application backend.

## Modules

- `src/main.ts` owns UI state, HTML rendering, events, and the game flow. `init()` loads the local snapshot; every mutation goes through `change()`, which clones the state, saves it, and then re-renders. Setup and gameplay render through the same gameplay theme. Player avatars use the 16-tile `src/assets/avatar-sheet.webp` sprite; legacy emoji values resolve to image tiles without changing stored game rules. Character setup supports random/manual avatar choice, editing existing characters, and confirmed deletion with selection cleanup.
- `src/game.ts` owns the `Game` model, random word selection, role assignment, and the crew win condition.
- `src/db.ts` defines `AppData<T>` and wraps snapshot reads and writes in IndexedDB.
- `src/words.ts` contains the categories and the bilingual `WordEntry` corpus.
- `src/style.css` contains the interface presentation, including the red/orange gameplay card treatment and character artwork.

## State and language

`AppData<Game>` stores players, selections, settings, the interface language, and the active game. The user's language choice (`data.language`) updates interface copy, labels, and category names. When a game is created, `createGame()` copies that language into `Game.language`; the game's word and hint therefore stay in the language selected at startup even if the interface is switched during the game. The next game follows the interface's current language.

The reveal card is controlled by the module variable `revealed`, which is not part of `AppData` and is never saved. `visibilitychange`, `pagehide`, and `blur` reset it to `false`, so rendering hides the card when the app loses visibility. During the unrevealed state, the card shows character artwork and can be opened with the accessible Reveal button or by swiping upward more than 55 pixels. The local snapshot still contains the active game, including the word entry and role IDs needed to resume after a reload.

## Persistence and startup

At startup, `loadData()` reads the snapshot. If one exists, the app restores players, settings, and the active game; otherwise it saves the initial state. An IndexedDB error leaves the app unavailable and shows a message asking the user to enable site data. All persistence is local to the browser and the app's origin; there is no server-side database.

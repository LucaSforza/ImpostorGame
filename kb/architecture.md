# Architecture

Impostor is a single-page app written in TypeScript and bundled by Vite. The build produces static assets for GitHub Pages; the Vite configuration uses the base path `/ImpostorGame/`. There is no application backend.

## Modules

- `src/main.ts` owns UI state, HTML rendering, events, and the game flow. `init()` loads the local snapshot; every mutation goes through `change()`, which clones the state, saves it, and then re-renders. Setup and gameplay render through the same gameplay theme. Setup exposes a compact category summary; `Cambia categorie` opens a dedicated category screen with the 15 generated `src/assets/categories/*.webp` tiles. The screen stores either all categories, one category ID, or a non-empty category-ID array. Preset player avatars use the 16 individual `src/assets/avatars/avatar-*.webp` tiles; legacy emoji values resolve to image tiles without changing stored game rules. Character setup also accepts a local upload/camera photo, stored as a resized data URL with its original aspect ratio. Character setup supports random/manual avatar choice, editing existing characters, and confirmed deletion with selection cleanup.
- `src/game.ts` owns the `Game` model, random word selection, role assignment, localized word/hint/category projection, and the crew win condition.
- `src/db.ts` defines `AppData<T>`, wraps snapshot reads and writes in IndexedDB, and deletes snapshots that fail the current shape contract; no legacy category migration is performed.
- `src/i18n.ts` owns the typed locale catalog, interpolation, and localized category labels. UI code passes message keys to `translate()`; it does not carry Italian/English pairs.
- `src/words.ts` contains stable category IDs and the bilingual `WordEntry` corpus.
- `src/style.css` contains the interface presentation, including the red/orange gameplay card treatment and character artwork.

## State and language

`AppData<Game>` stores players, selections, settings, the interface language, and the active game. `data.language` is the single locale source for interface copy, category labels, words, and hints. `Game` stores language-neutral game state and bilingual word data; `localizeEntry()` projects that data using the current locale. Switching language during a game therefore re-renders the entire game consistently and does not create mixed-language cards.

The reveal card is controlled by the module variable `revealed`, which is not part of `AppData` and is never saved. `visibilitychange`, `pagehide`, and `blur` reset it to `false`, so rendering hides the card when the app loses visibility. During the unrevealed state, the card shows character artwork and can be opened with the accessible Reveal button or by swiping upward more than 55 pixels. The local snapshot still contains the active game, including the word entry and role IDs needed to resume after a reload.

## Persistence and startup

At startup, `loadData()` reads the snapshot. If one exists, the app restores players, settings, and the active game; otherwise it saves the initial state. An IndexedDB error leaves the app unavailable and shows a message asking the user to enable site data. All persistence is local to the browser and the app's origin; there is no server-side database.

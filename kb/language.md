# Language and localization

## Contract

`src/i18n.ts` is the only UI localization boundary.

- `Locale` is the supported locale union (`it` | `en`).
- `MessageKey` identifies UI copy; components call `translate(locale, key, params)` through the `t()` helper in `src/main.ts`.
- `CategoryId` is language-neutral (`all`, `food`, `places`, `objects`, `animals`, `sport`, `cinema`). `WordEntry.category` and `GameSettings.category` store IDs, never display labels.
- `categoryLabel(locale, id)` produces the visible category label.
- `WordEntry` keeps both `word`/`hint` and `wordEn`/`hintEn`; `localizeEntry(entry, locale)` selects the visible values without mutating game state.

The locale lives once, in `AppData.language`. `Game` does not duplicate it. This prevents stale per-game locale state when users change language during an active round.

## Adding a locale

1. Add the locale code to `supportedLocales` and `Locale`.
2. Add a complete catalog matching `MessageKey`; TypeScript rejects missing or extra message keys.
3. Add translations for every `CategoryId` in `categoryMessageKeys`.
4. Extend locale normalization and the language toggle if the locale needs a new UI control.
5. Add catalog/category tests and manually validate setup, reveal, vote, result, dialogs, and language switching during reveal.

No game, database, or word-entry fields should be added for a new locale. Existing snapshots remain compatible because they persist IDs and the current locale only.

## Compatibility

`loadData()` migrates old snapshots written before stable category IDs. Unknown category values fall back to `all`; legacy `activeGame.language` is ignored and removed from the in-memory snapshot. The migration is intentionally done at the snapshot boundary so the rest of the app sees only the current contract.

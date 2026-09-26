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

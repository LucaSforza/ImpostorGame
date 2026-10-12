# Contributing to Pocket Circle

Thanks for helping improve Pocket Circle. The app is a small TypeScript/Vite project for local, pass-and-play games. Please keep changes focused and preserve saved browser data.

## Set up

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Before opening a pull request, run:

```sh
npm test
npm run build
git diff --check
```

The CI workflow runs the tests and production build for pushes and pull requests. It does not deploy a preview.

## Where things live

- `src/catalog.ts` defines the available games and their stable IDs.
- `src/main.ts` owns the shared screens, routing, and UI events.
- Each game has a focused rules module, such as `src/game.ts`, `src/bomb.ts`, `src/who-am-i.ts`, and `src/twit.ts`.
- `src/i18n.ts` contains interface text; game content lives in the corresponding content module.
- `src/db.ts` and `src/stats.ts` own saved state and completed-game statistics.
- `tests/` contains the Vitest suite.
- `kb/` describes the product contract and implementation details. Read [the KB index](kb/README.md) and the relevant page before changing behavior.

The catalog currently offers Impostore, Bomba, Chi sono?, and Twit. Retired Stessa Onda sessions and statistics remain part of the saved-data compatibility contract. Avoid changing stable game or content IDs without a migration and compatibility plan.

## Pull requests

Keep the change narrow, describe the player-visible result, and mention any saved-data or language implications. Add focused tests for new behavior and bug fixes. For copy or content changes, keep Italian and English natural, playable aloud, and equivalent in meaning. Do not claim browser or physical-device checks unless you performed them.

Use original or properly licensed media. Do not include private player names, photos, or browser data in screenshots or recordings. If generative AI materially helped create code, copy, or media in a contribution, disclose that briefly in the pull request so maintainers can review provenance and licensing.

For bugs, include steps to reproduce, expected behavior, actual behavior, and browser/device details when relevant. Do not attach secrets, private data, or identifying photos.

## Browser and offline checks

After `npm run build`, install Chromium with `npx playwright install chromium` and start `npm run preview` in another terminal. Run `npm run test:browser`, `npm run qa:launch`, and `npm run qa:accessibility`. `npm run qa:updates` starts its own temporary server and proves waiting activation and failed-install recovery. Restart preview after rebuilding to keep one coherent asset version during each run. Automated scans complement manual keyboard/screen-reader and physical-device checks.

Game fixes need reproduced red/green regression evidence. Do not change IndexedDB names, IDs, stored session contracts or origins casually. See [offline/update contracts](kb/offline.md) and [URL migration notes](docs/naming-and-provenance.md).

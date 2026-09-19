# Pocket Circle

One phone. Your circle. Zero tracking.

Pocket Circle is a private, local-first catalog of party games for friends sharing one phone. Profiles, active games, and statistics stay in the browser. No accounts, ads, analytics, or gameplay network calls.

Play the live version at [lucasforza.github.io/ImpostorGame](https://lucasforza.github.io/ImpostorGame/).

## Games

- **Impostore** — receive a secret word, bluff, discuss, and find the hidden impostors.
- **Bomba** — name valid words for a topic until the shared timer explodes, then decide together who receives the loss.
- **Stessa Onda** — answer private social prompts and discover who thinks alike.

## Features

- Italian and English interface and word deck.
- Three bilingual games with large built-in offline content catalogs.
- 300 Impostore words across 15 categories, including youth slang, dating, trends, parties, film, and hobbies.
- Visual category picker with single- or multi-category games.
- 3–20 players with configurable impostor count.
- Saved player profiles with illustrated avatars or device photos.
- Shared saved player profiles across every game.
- Separate statistics page with overall and per-game results for every player.
- IndexedDB persistence for players, per-game settings, statistics, and active session.
- Mobile-first layout with `prefers-reduced-motion` support.
- No backend, accounts, analytics, or game-time API calls.

## How to play

1. Pick a game from the catalog.
2. Add or select saved friends; same profiles work in every game.
3. Configure that game, then pass one phone around.
4. Finish a round and review player statistics from the dedicated panel.

## Development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run dev` starts Vite. `npm test` runs Vitest. `npm run build` type-checks and creates `dist/`.
All automated tests live in the dedicated `tests/` directory.

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs tests and builds `dist/` on every push to `main`, then deploys it to GitHub Pages.

Repository Pages source must be **GitHub Actions**. Vite keeps `/ImpostorGame/` as base path until repository is renamed.

## Data and privacy

App is a static client. Players, settings, photos, statistics, and active session stay in IndexedDB on current browser and origin. Once loaded, every game runs without network calls.

Data is not shared between `localhost` and GitHub Pages. Clearing site data removes saved players and games. Use one game tab per device.

## Project documentation

See the [knowledge base](kb/README.md) for:

- [Architecture](kb/architecture.md)
- [IndexedDB model](kb/indexeddb.md)
- [Catalog design](kb/catalog-design.md)
- [Game rules](kb/game-rules.md)
- [Language and localization](kb/language.md)

## License

Released under the [GNU Affero General Public License v3.0 or later](LICENSE).

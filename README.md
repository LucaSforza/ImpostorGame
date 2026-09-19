# Impostor

Trust no one.

Impostor is a local-first party game for 3–20 players sharing one phone. Crew members receive a secret word; impostors receive only a related hint. Talk, bluff, and find the impostors before they blend in.

Play the live version at [lucasforza.github.io/ImpostorGame](https://lucasforza.github.io/ImpostorGame/).

## Features

- Italian and English interface and word deck.
- 120 bilingual words across six categories.
- 3–20 players with configurable impostor count.
- Saved player profiles with illustrated avatars or device photos.
- Private role reveal, discussion, collective vote, results, and rematches.
- IndexedDB persistence for players, settings, and an active game.
- Mobile-first layout with `prefers-reduced-motion` support.
- No backend, accounts, analytics, or game-time API calls.

## How to play

1. Add 3–20 players and select the players for the round.
2. Choose the number of impostors and a word category.
3. Pass the phone around. Crew members see the secret word; impostors see its hint.
4. Take turns saying a word related to the secret without saying the secret itself.
5. Vote together for exactly as many suspects as there are impostors.
6. The crew wins only if every impostor is accused and no innocent player is selected.

## Development

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run dev` starts the Vite development server. `npm test` runs the Vitest suite. `npm run build` type-checks and creates the production build in `dist/`.

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs tests and builds `dist/` on every push to `main`, then deploys it to GitHub Pages.

The repository's Pages source must be set to **GitHub Actions**. Vite uses `/ImpostorGame/` as its base path.

## Data and privacy

The app is a static client. Players, settings, photos, and any active game stay in IndexedDB on the current browser and origin. Once the app has loaded, the game runs without network calls.

Data is not shared between `localhost` and GitHub Pages. Clearing site data removes saved players and games. Use one game tab per device.

## Project documentation

See the [knowledge base](kb/README.md) for:

- [Architecture](kb/architecture.md)
- [IndexedDB model](kb/indexeddb.md)
- [Game rules](kb/game-rules.md)
- [Language and localization](kb/language.md)

## License

Released under the [GNU Affero General Public License v3.0 or later](LICENSE).

export type GameId = 'impostor' | 'bomb' | 'same-wave';

export interface GameDefinition {
  readonly id: GameId;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly minPlayers: number;
  readonly maxPlayers: number;
}

const definitions: readonly GameDefinition[] = Object.freeze([
  Object.freeze({ id: 'impostor', nameKey: 'catalog.impostor.name', descriptionKey: 'catalog.impostor.description', minPlayers: 3, maxPlayers: 20 }),
  Object.freeze({ id: 'bomb', nameKey: 'catalog.bomb.name', descriptionKey: 'catalog.bomb.description', minPlayers: 2, maxPlayers: 20 }),
  Object.freeze({ id: 'same-wave', nameKey: 'catalog.sameWave.name', descriptionKey: 'catalog.sameWave.description', minPlayers: 3, maxPlayers: 20 }),
]);

/** Single registry for games exposed to the user. */
export class GameCatalog {
  readonly games: readonly GameDefinition[];

  constructor(games: readonly GameDefinition[] = definitions) {
    const supportedIds = new Set<GameId>(['impostor', 'bomb', 'same-wave']);
    if (games.length !== supportedIds.size || new Set(games.map((game) => game.id)).size !== supportedIds.size || games.some((game) => !supportedIds.has(game.id))) {
      throw new Error('GameCatalog must contain exactly three games');
    }
    this.games = Object.freeze(games.map((game) => Object.freeze({ ...game })));
  }

  list(): readonly GameDefinition[] {
    return this.games;
  }

  get(id: GameId): GameDefinition {
    const game = this.games.find((candidate) => candidate.id === id);
    if (!game) throw new Error(`Unknown game: ${id}`);
    return game;
  }
}

export const gameCatalog = new GameCatalog();
export const GAME_CATALOG = gameCatalog;

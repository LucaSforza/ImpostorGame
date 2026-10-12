export type AppScreen = 'catalog' | 'setup' | 'stats';
import { gameCatalog, type GameId } from './catalog';

export type Route = { screen: AppScreen; gameId?: GameId };

export function screenFromHash(hash: string): AppScreen {
  if (hash === '#stats') return 'stats';
  if (hash === '#setup' || gameIdFromHash(hash)) return 'setup';
  return 'catalog';
}

export function gameIdFromHash(hash: string): GameId | undefined {
  const match = /^#game\/([^/]+)$/.exec(hash);
  if (!match) return undefined;
  const id = match[1];
  return gameCatalog.list().some(game => game.id === id) ? id as GameId : undefined;
}

export function routeFromHash(hash: string): Route {
  const gameId = gameIdFromHash(hash);
  if (gameId) return { screen: 'setup', gameId };
  return { screen: screenFromHash(hash) };
}

export function hashForGame(gameId: GameId): string {
  return `#game/${gameId}`;
}

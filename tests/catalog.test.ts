import { describe, expect, it } from 'vitest';
import { GameCatalog, gameCatalog } from '../src/catalog';
import { screenFromHash } from '../src/router';

describe('GameCatalog', () => {
  it('offers exactly the three stable games', () => {
    expect(gameCatalog.list().map((game) => game.id)).toEqual(['impostor', 'bomb', 'same-wave']);
    expect(gameCatalog.get('bomb').minPlayers).toBe(2);
    expect(new GameCatalog().list()).not.toBe(gameCatalog.list());
  });

  it('rejects a registry with unsupported IDs', () => {
    expect(() => new GameCatalog([
      { id: 'impostor', nameKey: 'a', descriptionKey: 'a', minPlayers: 3, maxPlayers: 20 },
      { id: 'bomb', nameKey: 'b', descriptionKey: 'b', minPlayers: 2, maxPlayers: 20 },
      { id: 'other' as 'same-wave', nameKey: 'c', descriptionKey: 'c', minPlayers: 3, maxPlayers: 20 },
    ])).toThrow('exactly three games');
  });

  it.each([
    ['#catalog', 'catalog'], ['#setup', 'setup'], ['#stats', 'stats'], ['', 'catalog'],
  ] as const)('maps %s to the initial screen', (hash, screen) => {
    expect(screenFromHash(hash)).toBe(screen);
  });
});

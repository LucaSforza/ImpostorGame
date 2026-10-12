import { describe, expect, it } from 'vitest';
import { GameCatalog, gameCatalog } from '../src/catalog';
import { screenFromHash } from '../src/router';

describe('GameCatalog', () => {
  it('offers four games and omits retired Stessa Onda', () => {
    expect(gameCatalog.list().map((game) => game.id)).toEqual(['impostor', 'bomb', 'who-am-i', 'twit']);
    expect(gameCatalog.get('bomb').minPlayers).toBe(2);
    expect(gameCatalog.get('who-am-i')).toMatchObject({ minPlayers: 3, maxPlayers: 20 });
    expect(new GameCatalog().list()).not.toBe(gameCatalog.list());
  });

  it('rejects registries that include retired or unsupported IDs', () => {
    expect(() => new GameCatalog([
      { id: 'impostor', nameKey: 'a', descriptionKey: 'a', minPlayers: 3, maxPlayers: 20 },
      { id: 'bomb', nameKey: 'b', descriptionKey: 'b', minPlayers: 2, maxPlayers: 20 },
      { id: 'same-wave', nameKey: 'c', descriptionKey: 'c', minPlayers: 3, maxPlayers: 20 },
      { id: 'who-am-i', nameKey: 'd', descriptionKey: 'd', minPlayers: 3, maxPlayers: 20 },
      { id: 'twit', nameKey: 'e', descriptionKey: 'e', minPlayers: 3, maxPlayers: 20 },
    ])).toThrow('exactly four games');
  });

  it.each([
    ['#catalog', 'catalog'], ['#setup', 'setup'], ['#stats', 'stats'], ['', 'catalog'],
  ] as const)('maps %s to the initial screen', (hash, screen) => {
    expect(screenFromHash(hash)).toBe(screen);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { GameCatalog, gameCatalog } from '../src/catalog';
import { gameIdFromHash, hashForGame, routeFromHash, screenFromHash } from '../src/router';
import { SHARE_BASE_URL, shareLink, shareUrl } from '../src/share';

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
  it.each(['impostor', 'bomb', 'who-am-i', 'twit'] as const)('accepts game deep link %s', gameId => {
    expect(gameIdFromHash(`#game/${gameId}`)).toBe(gameId);
    expect(routeFromHash(`#game/${gameId}`)).toEqual({ screen: 'setup', gameId });
    expect(hashForGame(gameId)).toBe(`#game/${gameId}`);
  });

  it.each(['#game/same-wave', '#game/unknown', '#game/bomb/x', '#game/'])('rejects retired or malformed game route %s', hash => {
    expect(gameIdFromHash(hash)).toBeUndefined();
    expect(routeFromHash(hash)).toEqual({ screen: 'catalog' });
  });
});

describe('sharing links', () => {
  it('uses only the canonical origin and available game ID', () => {
    expect(SHARE_BASE_URL).toBe('https://lucasforza.github.io/ImpostorGame/');
    expect(shareUrl()).toBe(SHARE_BASE_URL);
    expect(shareUrl('bomb')).toBe(`${SHARE_BASE_URL}#game/bomb`);
    expect(shareUrl('bomb')).not.toContain('players=');
  });

  it('uses native share first and falls back to clipboard after a non-cancel error', async () => {
    const order: string[] = [];
    const result = await shareLink({ share: async () => { order.push('share'); throw new Error('denied'); } } as Navigator, shareUrl('twit'), 'title', async () => { order.push('copy'); });
    expect(result).toBe('copied');
    expect(order).toEqual(['share', 'copy']);
  });

  it('keeps native share cancellation silent and reveals manual-copy fallback when clipboard is denied', async () => {
    const copy = vi.fn(async () => { throw new Error('denied'); });
    const cancelled = await shareLink({ share: async () => { throw new DOMException('cancelled', 'AbortError'); } } as Navigator, shareUrl(), 'title', copy);
    const denied = await shareLink({} as Navigator, shareUrl(), 'title', copy);
    expect(cancelled).toBe('cancelled');
    expect(denied).toBe('manual');
    expect(copy).toHaveBeenCalledTimes(1);
  });
});

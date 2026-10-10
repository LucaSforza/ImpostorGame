import 'fake-indexeddb/auto';
import { afterEach, expect, it } from 'vitest';
import { emptyPlayerStats, loadData, saveData, type Player } from '../src/db';
import { createGame, type ActiveGame } from '../src/game';
import { createBombGame } from '../src/bomb';
import { createSameWaveGame } from '../src/same-wave';
import { createWhoAmIGame } from '../src/who-am-i';

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('impostor-game');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
});

it('preserves each earlier active game, photos and accumulated counters', async () => {
  const roster: Player[] = Array.from({ length: 3 }, (_, i) => ({ id: `p${i}`, name: `P${i}`, avatar: 'data:image/png;base64,cGhvdG8=', createdAt: i, stats: { ...emptyPlayerStats(), bomb: { gamesPlayed: 2, wins: 1, losses: 1 } } }));
  const impostor = { impostors: 1, maxAttempts: 1, category: 'all' as const };
  const sessions = [createGame(roster, impostor), createBombGame(roster), createSameWaveGame(roster), createWhoAmIGame(roster)];
  for (const activeGame of sessions) {
    const old = structuredClone({ players: roster, selectedIds: roster.map(p => p.id), selectedGameId: activeGame.gameId, language: 'it' as const, activeGame, settings: { impostor, bomb: { category: 'all' }, sameWave: { category: 'all' }, whoAmI: { category: 'all' as const } } });
    for (const p of [...old.players, ...old.activeGame.players]) delete (p.stats as Partial<typeof p.stats>).twit;
    await saveData(old as Parameters<typeof saveData>[0]);
    const loaded = await loadData<ActiveGame>();
    expect(loaded).toMatchObject(old);
    expect(loaded?.settings).toHaveProperty('twit', { rounds: 5 });
    for (const p of [...loaded!.players, ...loaded!.activeGame!.players]) {
      expect(p.stats.twit).toEqual({ gamesPlayed: 0, wins: 0, losses: 0 });
      expect(p.stats.bomb).toEqual({ gamesPlayed: 2, wins: 1, losses: 1 });
      expect(p.avatar).toBe(roster[0].avatar);
    }
  }
});

it('adds Twit defaults without losing a four-game roster or settings', async () => {
  const stats = emptyPlayerStats();
  delete (stats as Partial<typeof stats> & { twit?: unknown }).twit;
  const old = {
    players: [{ id: 'p1', name: 'Ada', avatar: 'avatar-01', createdAt: 123, stats }],
    selectedIds: ['p1'], selectedGameId: 'bomb' as const,
    settings: { impostor: { impostors: 1, maxAttempts: 1, category: 'all' as const }, bomb: { category: 'all' }, sameWave: { category: 'all' }, whoAmI: { category: 'all' as const } },
    language: 'it' as const, activeGame: null,
  };
  await saveData(old as Parameters<typeof saveData>[0]);
  const saved = await loadData();
  expect(saved).toMatchObject({ ...old, settings: { ...old.settings, twit: { rounds: 5 } } });
  expect(saved?.players[0].stats).toHaveProperty('twit', { gamesPlayed: 0, wins: 0, losses: 0 });
});

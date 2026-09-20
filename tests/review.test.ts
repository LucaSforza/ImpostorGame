import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { emptyPlayerStats, loadData, saveData, type AppData, type Player } from '../src/db';
import { createGame, type ActiveGame } from '../src/game';
import { createBombGame } from '../src/bomb';
import { createSameWaveGame, submitSameWavePick } from '../src/same-wave';
import { recordActiveGameResult } from '../src/stats';

const players = (): Player[] => [1, 2, 3].map(id => ({ id: `p${id}`, name: `Player ${id}`, avatar: 'avatar-01', createdAt: id, stats: emptyPlayerStats() }));
const snapshot = (activeGame: ActiveGame | null = null): AppData<ActiveGame> => ({
  players: players(), selectedIds: ['p1', 'p2', 'p3'], selectedGameId: activeGame?.gameId ?? 'impostor',
  settings: { impostor: { impostors: 1, maxAttempts: 1, category: 'all' }, bomb: { category: 'all' }, sameWave: { category: 'all' } },
  language: 'it', activeGame,
});
const sessions = () => [
  createGame(players(), snapshot().settings.impostor),
  createBombGame(players(), undefined, { now: 1000, deadlineMs: 20_000 }),
  createSameWaveGame(players(), undefined, () => 0),
];

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('impostor-game');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database cleanup blocked'));
  });
});

describe('review: persistence regressions', () => {
  it.each(['impostor', 'bomb', 'same-wave'])('preserves saved %s content from an earlier catalog revision', async id => {
    const game = structuredClone(sessions().find(game => game.gameId === id)!);
    if (game.gameId === 'impostor') game.entry.hint = 'Indizio della versione precedente';
    else if (game.gameId === 'bomb') game.prompt = { ...game.prompt, topic: 'Tema della versione precedente' };
    else game.prompt = { ...game.prompt, options: ['Prima risposta', 'Seconda risposta', 'Terza risposta', 'Quarta risposta'] };
    const data = snapshot(game);
    await saveData(data);
    await expect(loadData()).resolves.toEqual(data);
  });

  it('defaults an omitted supported attempt limit to a finite playable value', async () => {
    const data = snapshot();
    delete (data.settings.impostor as Partial<typeof data.settings.impostor>).maxAttempts;
    await saveData(data);
    const loaded = await loadData();
    expect(loaded?.settings.impostor.maxAttempts).toBe(1);
  });

  it('rejects role counters that contradict aggregate wins', async () => {
    const data = snapshot();
    data.players[0].stats.impostor = { gamesPlayed: 1, wins: 1, losses: 0, citizenWins: 0, citizenLosses: 1, impostorWins: 0, impostorLosses: 0 };
    await saveData(data);
    await expect(loadData()).resolves.toBeNull();
  });

  it('rejects a private turn that skips an unanswered player', async () => {
    const game = createSameWaveGame(players(), undefined, () => 0);
    game.currentPlayerIndex = 1;
    await saveData(snapshot(game));
    await expect(loadData()).resolves.toBeNull();
  });

  it('rejects saved winners that contradict the completed choices', async () => {
    const game = createSameWaveGame(players(), undefined, () => 0);
    submitSameWavePick(game, 'p1', '0');
    submitSameWavePick(game, 'p2', '0');
    submitSameWavePick(game, 'p3', '1');
    game.winnerIds = ['p3'];
    await saveData(snapshot(game));
    await expect(loadData()).resolves.toBeNull();
  });
});

describe('review: completed results only', () => {
  it.each(['impostor', 'bomb', 'same-wave'])('does not score an unfinished %s session', id => {
    const roster = players();
    const game = sessions().find(game => game.gameId === id)!;
    expect(recordActiveGameResult(roster, game)).toEqual(roster);
  });
});

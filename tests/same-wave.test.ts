import { describe, expect, it } from 'vitest';
import { createSameWaveGame, resolveSameWave, submitSameWavePick } from '../src/same-wave';
import type { Player } from '../src/db';

const players = (count: number): Player[] => Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `P${i}`, avatar: 'x', createdAt: i, stats: { impostor: { gamesPlayed: 0, wins: 0, losses: 0, citizenWins: 0, citizenLosses: 0, impostorWins: 0, impostorLosses: 0 }, bomb: { gamesPlayed: 0, wins: 0, losses: 0 }, sameWave: { gamesPlayed: 0, wins: 0, losses: 0 } } }));

describe('Stessa Onda', () => {
  it('returns all members of tied largest groups', () => {
    const game = createSameWaveGame(players(4));
    for (const [index, choice] of ['0', '1', '0', '1'].entries()) expect(submitSameWavePick(game, `p${index}`, choice)).toBe(true);
    expect(game.winnerIds).toEqual(['p0', 'p1', 'p2', 'p3']);
  });
  it('returns no winners when every answer is unique', () => {
    const game = createSameWaveGame(players(3));
    ['0', '1', '2'].forEach((choice, index) => submitSameWavePick(game, `p${index}`, choice));
    expect(resolveSameWave(game)).toEqual([]);
  });
});

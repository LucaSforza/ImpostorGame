import { describe, expect, it } from 'vitest';
import { assignBombLoser, createBombGame, rematchBomb, resolveBomb } from '../src/bomb';
import type { Player } from '../src/db';

const players = (count: number): Player[] => Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `P${i}`, avatar: 'x', createdAt: i, stats: { impostor: { gamesPlayed: 0, wins: 0, losses: 0, citizenWins: 0, citizenLosses: 0, impostorWins: 0, impostorLosses: 0 }, bomb: { gamesPlayed: 0, wins: 0, losses: 0 }, sameWave: { gamesPlayed: 0, wins: 0, losses: 0 }, whoAmI: { gamesPlayed: 0, wins: 0, losses: 0 } } }));

describe('Bomb', () => {
  it('moves to manual assignment on expiry without selecting a player', () => {
    const game = createBombGame(players(2), undefined, { now: 1000, deadlineMs: 20_000 });
    expect(resolveBomb(game, 20_999)).toEqual([]);
    expect(game.phase).toBe('playing');
    expect(resolveBomb(game, 21_000)).toEqual([]);
    expect(game.phase).toBe('assigning');
    expect(game.loserId).toBeNull();
    expect(game.winnerIds).toEqual([]);
  });
  it('rejects invalid loser IDs and records all other players after assignment', () => {
    const game = createBombGame(players(3), undefined, { now: 0, deadlineMs: 20_000, random: () => 0 });
    resolveBomb(game, 20_000);
    expect(() => assignBombLoser(game, 'missing')).toThrow('Invalid bomb loser');
    expect(assignBombLoser(game, 'p1')).toEqual(['p0', 'p2']);
    expect(game.phase).toBe('result');
    expect(game.loserId).toBe('p1');
    expect(game.winnerIds).toEqual(['p0', 'p2']);
  });
  it('keeps rematch players and starts a fresh playing round', () => {
    const roster = players(3);
    const game = createBombGame(roster, undefined, { now: 0, deadlineMs: 20_000, random: () => 0 });
    const rematch = rematchBomb(game, [game.prompt], { now: 50_000, deadlineMs: 45_000, random: () => 0.99 });
    expect(rematch.phase).toBe('playing');
    expect(game.players.map((player) => player.id)).toEqual(['p0', 'p1', 'p2']);
    expect(rematch.players.map((player) => player.id)).toEqual(['p2', 'p0', 'p1']);
    expect(roster.map((player) => player.id)).toEqual(['p0', 'p1', 'p2']);
    expect(rematch.id).not.toBe(game.id);
    expect(rematch.startedAt).toBe(50_000);
    expect(rematch.deadlineAt).toBe(95_000);
    expect(rematch.loserId).toBeNull();
    expect(rematch.winnerIds).toEqual([]);
  });
  it('starts each new round from a random rotated player', () => {
    const roster = players(3);
    const game = createBombGame(roster, undefined, { now: 0, deadlineMs: 20_000, random: () => 0.99 });

    expect(game.players.map((player) => player.id)).toEqual(['p2', 'p0', 'p1']);
    expect(roster.map((player) => player.id)).toEqual(['p0', 'p1', 'p2']);
  });
  it.each([20_000, 45_000])('accepts deadline %i ms', (deadlineMs) => {
    expect(createBombGame(players(2), undefined, { now: 0, deadlineMs }).deadlineAt).toBe(deadlineMs);
  });
});

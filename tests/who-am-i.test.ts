import { describe, expect, it } from 'vitest';
import type { Player } from '../src/db';
import {
  buzzWhoAmI,
  createWhoAmIGame,
  nextWhoAmITurn,
  rematchWhoAmI,
  resolveWhoAmIGuess,
  visibleWhoAmIIdentities,
  type WhoAmIIdentity,
} from '../src/who-am-i';

const identities: readonly WhoAmIIdentity[] = Array.from({ length: 6 }, (_, index) => ({
  id: `identity-${index}`,
  label: `Identità ${index}`,
  labelEn: `Identity ${index}`,
}));

const players = (count: number): Player[] => Array.from({ length: count }, (_, index) => ({
  id: `p${index}`,
  name: `P${index}`,
  avatar: 'avatar-01',
  createdAt: index,
  stats: {
    impostor: { gamesPlayed: 0, wins: 0, losses: 0, citizenWins: 0, citizenLosses: 0, impostorWins: 0, impostorLosses: 0 },
    bomb: { gamesPlayed: 0, wins: 0, losses: 0 },
    sameWave: { gamesPlayed: 0, wins: 0, losses: 0 },
    whoAmI: { gamesPlayed: 0, wins: 0, losses: 0 },
  },
}));

describe('Chi sono?', () => {
  it('requires 3–20 players and enough unique identities', () => {
    expect(() => createWhoAmIGame(players(2), identities)).toThrow('Invalid player count');
    expect(() => createWhoAmIGame(players(21), identities)).toThrow('Invalid player count');
    expect(() => createWhoAmIGame(players(6), identities.slice(0, 5))).toThrow('Not enough identities');
  });

  it('rotates starter, snapshots players, and assigns one unique identity each', () => {
    const roster = players(3);
    const game = createWhoAmIGame(roster, identities, () => 0.99);

    expect(game.players.map((player) => player.id)).toEqual(['p2', 'p0', 'p1']);
    expect(roster.map((player) => player.id)).toEqual(['p0', 'p1', 'p2']);
    expect(new Set(Object.values(game.identityByPlayerId).map((identity) => identity.id)).size).toBe(3);
    expect(game.phase).toBe('reveal');
  });

  it('shows every identity except the current viewer own identity', () => {
    const game = createWhoAmIGame(players(3), identities, () => 0);
    const visible = visibleWhoAmIIdentities(game, game.players[0].id);

    expect(visible).toHaveLength(2);
    expect(visible.map(({ player }) => player.id)).not.toContain(game.players[0].id);
  });

  it('moves turns, eliminates a wrong guesser, and gives each player one attempt', () => {
    const game = createWhoAmIGame(players(3), identities, () => 0);
    game.phase = 'playing';
    expect(nextWhoAmITurn(game, game.players[0].id)).toBe(true);
    expect(game.turnIndex).toBe(1);
    expect(buzzWhoAmI(game, game.players[1].id)).toBe(true);
    expect(resolveWhoAmIGuess(game, false)).toBe('continue');
    expect(game.eliminatedIds).toEqual([game.players[1].id]);
    expect(buzzWhoAmI(game, game.players[1].id)).toBe(false);
    expect(game.turnIndex).toBe(2);
  });

  it('ends immediately when a guess is correct', () => {
    const game = createWhoAmIGame(players(3), identities, () => 0);
    game.phase = 'playing';
    expect(buzzWhoAmI(game, game.players[0].id)).toBe(true);
    expect(resolveWhoAmIGuess(game, true)).toBe('result');
    expect(game.phase).toBe('result');
    expect(game.winnerIds).toEqual([game.players[0].id]);
  });

  it('ends without winners after every player guesses wrong', () => {
    const game = createWhoAmIGame(players(3), identities, () => 0);
    game.phase = 'playing';
    for (const player of game.players) {
      expect(buzzWhoAmI(game, player.id)).toBe(true);
      resolveWhoAmIGuess(game, false);
    }
    expect(game.phase).toBe('result');
    expect(game.winnerIds).toEqual([]);
  });

  it('keeps players but deals new identities on rematch when possible', () => {
    const game = createWhoAmIGame(players(3), identities.slice(0, 3), () => 0);
    const before = Object.fromEntries(Object.entries(game.identityByPlayerId).map(([id, identity]) => [id, identity.id]));
    const rematch = rematchWhoAmI(game, identities, () => 0.99);

    expect(rematch.players.map((player) => player.id).sort()).toEqual(game.players.map((player) => player.id).sort());
    expect(Object.entries(rematch.identityByPlayerId).some(([id, identity]) => identity.id !== before[id])).toBe(true);
  });
});

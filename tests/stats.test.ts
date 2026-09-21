import { describe, expect, it } from 'vitest';
import { assignBombLoser, createBombGame, resolveBomb } from '../src/bomb';
import { recordActiveGameResult, totalStats } from '../src/stats';
import { buzzWhoAmI, createWhoAmIGame, resolveWhoAmIGuess } from '../src/who-am-i';
import type { Player } from '../src/db';

const players = (count: number): Player[] => Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `P${i}`, avatar: 'x', createdAt: i, stats: { impostor: { gamesPlayed: 0, wins: 0, losses: 0, citizenWins: 0, citizenLosses: 0, impostorWins: 0, impostorLosses: 0 }, bomb: { gamesPlayed: 0, wins: 0, losses: 0 }, sameWave: { gamesPlayed: 0, wins: 0, losses: 0 }, whoAmI: { gamesPlayed: 0, wins: 0, losses: 0 } } }));

describe('statistics', () => {
  it('records one result per participant and skips recorded sessions', () => {
    const roster = players(2);
    const game = createBombGame(roster, undefined, { now: 0, deadlineMs: 20_000, random: () => 0 });
    resolveBomb(game, 20_000);
    assignBombLoser(game, 'p1');
    const once = recordActiveGameResult(roster, game);
    game.scoreRecorded = true;
    expect(recordActiveGameResult(once, game)).toEqual(once);
    expect(totalStats(once[0].stats)).toMatchObject({ gamesPlayed: 1, wins: 1, losses: 0, winRate: 1 });
  });

  it('records a Chi sono? winner once and losses for every other participant', () => {
    const roster = players(3);
    const game = createWhoAmIGame(roster, undefined, () => 0);
    game.phase = 'playing';
    buzzWhoAmI(game, game.players[0].id);
    resolveWhoAmIGuess(game, true);
    const scored = recordActiveGameResult(roster, game);

    expect(scored.map((player) => player.stats.whoAmI)).toEqual([
      { gamesPlayed: 1, wins: 1, losses: 0 },
      { gamesPlayed: 1, wins: 0, losses: 1 },
      { gamesPlayed: 1, wins: 0, losses: 1 },
    ]);
    game.scoreRecorded = true;
    expect(recordActiveGameResult(scored, game)).toEqual(scored);
  });
});

import { emptyPlayerStats, type GameStats, type Player, type PlayerStats } from './db';
import type { GameId } from './catalog';
import type { ActiveGame } from './game';
import { recordGameResult } from './game';

export interface OverallStats extends GameStats { winRate: number; }
export interface ImpostorRoleTotals { citizenWins: number; citizenLosses: number; impostorWins: number; impostorLosses: number; }

function gameStats(stats: PlayerStats, gameId: GameId): GameStats {
  if (gameId === 'impostor') return stats.impostor;
  return stats[gameId === 'same-wave' ? 'sameWave' : 'bomb'];
}
function cloneStats(value: PlayerStats | undefined): PlayerStats { return structuredClone(value ?? emptyPlayerStats()); }
export function totalStats(stats: PlayerStats): OverallStats {
  const games = (['impostor', 'bomb', 'same-wave'] as const).map((id) => gameStats(stats, id));
  const gamesPlayed = games.reduce((sum, value) => sum + value.gamesPlayed, 0);
  const wins = games.reduce((sum, value) => sum + value.wins, 0);
  const losses = games.reduce((sum, value) => sum + value.losses, 0);
  return { gamesPlayed, wins, losses, winRate: gamesPlayed ? wins / gamesPlayed : 0 };
}
export const overallStats = totalStats;
export function playerGameStats(player: Player, gameId: GameId): GameStats { return structuredClone(gameStats(player.stats, gameId)); }
export function impostorRoleStats(player: Player): ImpostorRoleTotals { return structuredClone(player.stats.impostor); }

/** Add one completed result. Participant order is irrelevant; non-participants stay unchanged. */
export function recordWinners(players: Player[], gameId: GameId, participantIds: readonly string[], winnerIds: readonly string[]): Player[] {
  const participants = new Set(participantIds);
  const winners = new Set(winnerIds);
  return players.map((player) => {
    if (!participants.has(player.id)) return { ...player, stats: cloneStats(player.stats) };
    const stats = cloneStats(player.stats);
    const target = gameStats(stats, gameId);
    target.gamesPlayed += 1;
    if (winners.has(player.id)) target.wins += 1;
    else target.losses += 1;
    return { ...player, stats };
  });
}

/** Dispatch score recording by discriminant. Caller persists scoreRecorded with the same snapshot. */
export function recordActiveGameResult(players: Player[], game: ActiveGame): Player[] {
  if (game.phase !== 'result' || game.scoreRecorded) return structuredClone(players);
  if (game.gameId === 'impostor') return recordGameResult(players, game);
  return recordWinners(players, game.gameId, game.players.map((player) => player.id), game.winnerIds);
}
export const recordGameStats = recordActiveGameResult;

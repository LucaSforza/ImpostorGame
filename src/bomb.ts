import type { Player } from './db';
import { BOMB_PROMPTS, type BombPrompt } from './bomb-content';
export type { BombPrompt } from './bomb-content';

export const defaultBombPrompts: readonly BombPrompt[] = BOMB_PROMPTS;
export type BombPhase = 'playing' | 'assigning' | 'result';
export interface BombGame {
  gameId: 'bomb'; id: string; players: Player[]; prompt: BombPrompt;
  startedAt: number; deadlineAt: number; phase: BombPhase;
  loserId: string | null; winnerIds: string[]; scoreRecorded: boolean;
}
export interface BombGameOptions { now?: number; deadlineMs?: number; random?: () => number; }
function randomIndex(length: number, random: () => number = Math.random): number { if (length <= 0) throw new Error('No bomb prompts'); return Math.min(length - 1, Math.floor(random() * length)); }
function randomDeadlineMs(random: () => number = Math.random): number { return (20 + randomIndex(26, random)) * 1000; }
function validatePlayers(players: Player[]): void { if (players.length < 2 || players.length > 20 || new Set(players.map((player) => player.id)).size !== players.length) throw new Error('Invalid player count'); }

export function createBombGame(players: Player[], prompt: BombPrompt = defaultBombPrompts[0], options: BombGameOptions | number = {}): BombGame {
  validatePlayers(players);
  const config = typeof options === 'number' ? { now: options } : options;
  const now = config.now ?? Date.now(); const deadlineMs = config.deadlineMs ?? randomDeadlineMs(config.random);
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(deadlineMs) || deadlineMs < 20_000 || deadlineMs > 45_000) throw new Error('Invalid bomb deadline');
  const startIndex = randomIndex(players.length, config.random);
  const orderedPlayers = [...players.slice(startIndex), ...players.slice(0, startIndex)];
  return { gameId: 'bomb', id: crypto.randomUUID(), players: structuredClone(orderedPlayers), prompt: structuredClone(prompt), startedAt: now, deadlineAt: now + deadlineMs, phase: 'playing', loserId: null, winnerIds: [], scoreRecorded: false };
}
export function bombExpired(game: BombGame, now = Date.now()): boolean { return game.phase === 'playing' && now >= game.deadlineAt; }
export function bombWinners(game: BombGame, now = Date.now()): string[] {
  if (game.phase !== 'result') return [];
  return [...game.winnerIds];
}
export function resolveBomb(game: BombGame, now = Date.now()): string[] {
  if (game.phase === 'result') return [...game.winnerIds];
  if (game.phase === 'assigning') return [];
  if (!bombExpired(game, now)) return [];
  game.phase = 'assigning';
  return [];
}
export function assignBombLoser(game: BombGame, playerId: string): string[] {
  if (game.phase !== 'assigning') throw new Error('Bomb loser can only be assigned after expiry');
  if (!game.players.some((player) => player.id === playerId)) throw new Error('Invalid bomb loser');
  game.phase = 'result';
  game.loserId = playerId;
  game.winnerIds = game.players.map((player) => player.id).filter((id) => id !== playerId);
  return [...game.winnerIds];
}
export function rematchBomb(game: BombGame, prompts: readonly BombPrompt[] = defaultBombPrompts, options: BombGameOptions = {}): BombGame {
  if (!prompts.length) throw new Error('No bomb prompts');
  const choices = prompts.filter((prompt) => prompt.id !== game.prompt.id); const pool = choices.length ? choices : prompts;
  return createBombGame(game.players, pool[randomIndex(pool.length, options.random)], options);
}

import type { Player } from './db';
import { SAME_WAVE_PROMPTS, type SameWavePrompt } from './same-wave-content';
export type { SameWavePrompt } from './same-wave-content';

export const defaultSameWavePrompts: readonly SameWavePrompt[] = SAME_WAVE_PROMPTS;
export type SameWavePhase = 'picking' | 'result';
export interface SameWaveGame {
  gameId: 'same-wave'; id: string; players: Player[]; prompt: SameWavePrompt; currentPlayerIndex: number;
  picks: Record<string, string>; phase: SameWavePhase; winnerIds: string[]; scoreRecorded: boolean;
}
function choices(prompt: SameWavePrompt): readonly string[] { return prompt.options; }
function validatePlayers(players: Player[]): void { if (players.length < 3 || players.length > 20 || new Set(players.map((player) => player.id)).size !== players.length) throw new Error('Invalid player count'); }
function validatePrompt(prompt: SameWavePrompt): void { if (prompt.options.length !== 4 || prompt.optionsEn.length !== 4) throw new Error('Invalid prompt'); }
function randomIndex(length: number, random: () => number = Math.random): number { if (length <= 0) throw new Error('No same-wave prompts'); return Math.min(length - 1, Math.floor(random() * length)); }

export function createSameWaveGame(players: Player[], prompt: SameWavePrompt = defaultSameWavePrompts[0], random: () => number = Math.random): SameWaveGame {
  validatePlayers(players); validatePrompt(prompt);
  const startIndex = randomIndex(players.length, random);
  const orderedPlayers = [...players.slice(startIndex), ...players.slice(0, startIndex)];
  return { gameId: 'same-wave', id: crypto.randomUUID(), players: structuredClone(orderedPlayers), prompt: structuredClone(prompt), currentPlayerIndex: 0, picks: {}, phase: 'picking', winnerIds: [], scoreRecorded: false };
}
export function submitSameWavePick(game: SameWaveGame, playerId: string, choiceId: string): boolean {
  if (game.phase !== 'picking' || game.players[game.currentPlayerIndex]?.id !== playerId) return false;
  const index = /^\d+$/.test(choiceId) ? Number(choiceId) : choices(game.prompt).indexOf(choiceId);
  if (!Number.isInteger(index) || index < 0 || index >= choices(game.prompt).length) return false;
  game.picks[playerId] = String(index); game.currentPlayerIndex += 1; if (game.currentPlayerIndex >= game.players.length) resolveSameWave(game); return true;
}
export function sameWaveWinners(game: SameWaveGame): string[] {
  const counts = new Map<string, number>(); Object.values(game.picks).forEach((choice) => counts.set(choice, (counts.get(choice) ?? 0) + 1));
  const largest = Math.max(0, ...counts.values()); if (largest < 2) return [];
  const winningChoices = new Set([...counts.entries()].filter(([, count]) => count === largest).map(([choice]) => choice));
  return game.players.map((player) => player.id).filter((id) => winningChoices.has(game.picks[id]));
}
export function resolveSameWave(game: SameWaveGame): string[] {
  if (game.phase === 'result') return [...game.winnerIds]; if (Object.keys(game.picks).length < game.players.length) return [];
  game.phase = 'result'; game.winnerIds = sameWaveWinners(game); return [...game.winnerIds];
}
export function rematchSameWave(game: SameWaveGame, prompts: readonly SameWavePrompt[] = defaultSameWavePrompts, random?: () => number): SameWaveGame {
  if (!prompts.length) throw new Error('No same-wave prompts'); const choicesWithoutCurrent = prompts.filter((prompt) => prompt.id !== game.prompt.id); const pool = choicesWithoutCurrent.length ? choicesWithoutCurrent : prompts;
  return createSameWaveGame(game.players, pool[randomIndex(pool.length, random)], random);
}

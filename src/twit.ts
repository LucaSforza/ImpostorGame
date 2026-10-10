import type { Player } from './db';
import { TWIT_QUESTIONS, type TwitQuestion } from './twit-content';

export const TWIT_ROUND_COUNTS = [1, 3, 5, 10] as const;
export const MAX_TWIT_ESTIMATE = 1_000_000_000;
export interface TwitAnswer { estimate: number; predictedId: string; }
export interface TwitRound { question: TwitQuestion; answers: Record<string, TwitAnswer>; }
export interface TwitGame {
  gameId: 'twit';
  id: string;
  players: Player[];
  rounds: TwitRound[];
  roundIndex: number;
  turnIndex: number;
  phase: 'question' | 'answering' | 'round-result' | 'result';
  winnerIds: string[];
  scoreRecorded: boolean;
}

function randomIndex(length: number, random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Invalid random value');
  return Math.floor(value * length);
}
function validEstimate(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= MAX_TWIT_ESTIMATE;
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function validQuestion(value: unknown): value is TwitQuestion {
  return record(value) && text(value.id) && text(value.question) && text(value.questionEn) && validEstimate(value.answer);
}

export function createTwitGame(players: Player[], roundCount = 5, questions: readonly TwitQuestion[] = TWIT_QUESTIONS, random: () => number = Math.random): TwitGame {
  if (players.length < 3 || players.length > 20 || players.some(p => !text(p.id)) || new Set(players.map(p => p.id)).size !== players.length) throw new Error('Invalid player count');
  if (!(TWIT_ROUND_COUNTS as readonly number[]).includes(roundCount)) throw new Error('Invalid round count');
  if (!questions.every(validQuestion) || new Set(questions.map(q => q.id)).size !== questions.length) throw new Error('Invalid question');
  if (questions.length < roundCount) throw new Error('Not enough questions');
  const start = randomIndex(players.length, random);
  const deck = [...questions];
  // Partial shuffle selects unique questions without coupling their order to the starter.
  for (let i = 0; i < roundCount; i += 1) {
    const j = i + randomIndex(deck.length - i, random);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return {
    gameId: 'twit', id: crypto.randomUUID(), players: structuredClone([...players.slice(start), ...players.slice(0, start)]),
    rounds: deck.slice(0, roundCount).map(question => ({ question: structuredClone(question), answers: {} })),
    roundIndex: 0, turnIndex: 0, phase: 'question', winnerIds: [], scoreRecorded: false,
  };
}

export function startTwitRound(game: TwitGame): boolean {
  if (game.phase !== 'question') return false;
  game.phase = 'answering';
  return true;
}

export function twitRoundResult(round: TwitRound, players: readonly Player[]): { closestIds: string[]; farthestIds: string[]; points: Record<string, number> } {
  if (!players.every(p => Object.hasOwn(round.answers, p.id))) return { closestIds: [], farthestIds: [], points: {} };
  const distances = players.map(p => Math.abs(round.answers[p.id].estimate - round.question.answer));
  const closest = Math.min(...distances);
  const farthest = Math.max(...distances);
  const closestIds = players.filter((_, i) => distances[i] === closest).map(p => p.id);
  const farthestIds = players.filter((_, i) => distances[i] === farthest).map(p => p.id);
  const points = Object.fromEntries(players.map(p => [p.id, (closestIds.includes(p.id) ? 2 : 0) + (farthestIds.includes(round.answers[p.id].predictedId) ? 1 : 0)]));
  return { closestIds, farthestIds, points };
}

export function twitTotals(game: TwitGame): Record<string, number> {
  const totals = Object.fromEntries(game.players.map(p => [p.id, 0]));
  for (const round of game.rounds) {
    const { points } = twitRoundResult(round, game.players);
    for (const player of game.players) totals[player.id] += points[player.id] ?? 0;
  }
  return totals;
}
function winners(game: TwitGame): string[] {
  const totals = twitTotals(game);
  const highest = Math.max(...Object.values(totals));
  return game.players.filter(p => totals[p.id] === highest).map(p => p.id);
}

export function submitTwitAnswer(game: TwitGame, playerId: string, estimate: number, predictedId: string): boolean {
  if (game.phase !== 'answering' || game.players[game.turnIndex]?.id !== playerId || !validEstimate(estimate)
    || playerId === predictedId || !game.players.some(p => p.id === predictedId)) return false;
  const round = game.rounds[game.roundIndex];
  if (Object.hasOwn(round.answers, playerId)) return false;
  round.answers = { ...round.answers, [playerId]: { estimate, predictedId } };
  game.turnIndex += 1;
  if (game.turnIndex === game.players.length) {
    game.phase = game.roundIndex === game.rounds.length - 1 ? 'result' : 'round-result';
    if (game.phase === 'result') game.winnerIds = winners(game);
  }
  return true;
}

export function nextTwitRound(game: TwitGame): boolean {
  if (game.phase !== 'round-result') return false;
  game.roundIndex += 1;
  game.turnIndex = 0;
  game.phase = 'question';
  return true;
}

export function rematchTwit(game: TwitGame, questions: readonly TwitQuestion[] = TWIT_QUESTIONS, random: () => number = Math.random): TwitGame {
  const used = new Set(game.rounds.map(r => r.question.id));
  const fresh = questions.filter(q => !used.has(q.id));
  return createTwitGame(game.players, game.rounds.length, fresh.length >= game.rounds.length ? fresh : questions, random);
}

/** Content belongs to the saved match; validate shape and progress, never today's deck text. */
export function isTwitGameSnapshot(value: Record<string, unknown>): boolean {
  if (!text(value.id) || !Array.isArray(value.players) || value.players.length < 3 || value.players.length > 20
    || !value.players.every(p => record(p) && text(p.id)) || !Array.isArray(value.rounds)
    || !(TWIT_ROUND_COUNTS as readonly number[]).includes(value.rounds.length)
    || !Number.isInteger(value.roundIndex) || (value.roundIndex as number) < 0 || (value.roundIndex as number) >= value.rounds.length
    || !Number.isInteger(value.turnIndex) || (value.turnIndex as number) < 0 || (value.turnIndex as number) > value.players.length
    || !['question', 'answering', 'round-result', 'result'].includes(value.phase as string)
    || typeof value.scoreRecorded !== 'boolean' || !Array.isArray(value.winnerIds)) return false;
  const ids = value.players.map(p => p.id as string);
  if (new Set(ids).size !== ids.length) return false;
  const completed = value.phase === 'round-result' || value.phase === 'result';
  if (value.scoreRecorded && value.phase !== 'result') return false;
  if (value.phase === 'question' && value.turnIndex !== 0) return false;
  if (value.phase === 'answering' && (value.turnIndex as number) >= ids.length) return false;
  if (completed && value.turnIndex !== ids.length) return false;
  if (value.phase === 'result' && value.roundIndex !== value.rounds.length - 1) return false;
  if (value.phase === 'round-result' && value.roundIndex === value.rounds.length - 1) return false;
  const questionIds = new Set<string>();
  for (let index = 0; index < value.rounds.length; index += 1) {
    const round: unknown = value.rounds[index];
    if (!record(round) || !validQuestion(round.question) || !record(round.answers) || questionIds.has(round.question.id)) return false;
    questionIds.add(round.question.id);
    const count = index < (value.roundIndex as number) ? ids.length : index > (value.roundIndex as number) ? 0 : value.turnIndex as number;
    if (Object.keys(round.answers).length !== count || !ids.slice(0, count).every(id => Object.hasOwn(round.answers as object, id))) return false;
    for (const [id, answer] of Object.entries(round.answers)) {
      if (!ids.includes(id) || !record(answer) || !validEstimate(answer.estimate) || typeof answer.predictedId !== 'string'
        || !ids.includes(answer.predictedId) || answer.predictedId === id) return false;
    }
  }
  const game = value as unknown as TwitGame;
  const expected = value.phase === 'result' ? winners(game) : [];
  return value.winnerIds.length === expected.length && new Set(value.winnerIds).size === expected.length && value.winnerIds.every(id => expected.includes(id));
}

import type { Player, GameSettings } from './db';
import { words, type WordEntry } from './words';

export interface Game {
  id: string;
  players: Player[];
  impostorIds: string[];
  entry: WordEntry;
  language: 'it' | 'en';
  phase: 'reveal' | 'discuss' | 'vote' | 'result';
  revealIndex: number;
  accusedIds: string[];
  starterId: string;
}

export function maxImpostors(count: number): number {
  return Math.max(1, Math.floor((count - 1) / 2));
}

// Rejection sampling avoids modulo bias when assigning secret roles.
function randomIndex(length: number): number {
  const limit = Math.floor(0x100000000 / length) * length;
  let value: number;
  do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= limit);
  return value % length;
}

export function createGame(players: Player[], settings: GameSettings, language: 'it' | 'en', previousWord?: string): Game {
  if (players.length < 3 || players.length > 20 || new Set(players.map(p => p.id)).size !== players.length) throw new Error('Invalid player count');
  if (!Number.isInteger(settings.impostors) || settings.impostors < 1 || settings.impostors > maxImpostors(players.length)) throw new Error('Invalid impostor count');
  const candidates = words.filter(w => (settings.category === 'all' || w.category === settings.category) && w.word !== previousWord);
  if (!candidates.length) throw new Error('Invalid category');
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { id: crypto.randomUUID(), players: structuredClone(players), impostorIds: shuffled.slice(0, settings.impostors).map(p => p.id), entry: candidates[randomIndex(candidates.length)], language, phase: 'reveal', revealIndex: 0, accusedIds: [], starterId: players[randomIndex(players.length)].id };
}

export function citizensWin(game: Game): boolean {
  return game.accusedIds.length === game.impostorIds.length && game.impostorIds.every(id => game.accusedIds.includes(id));
}

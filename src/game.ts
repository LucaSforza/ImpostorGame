import { emptyPlayerStats, type GameSettings, type Player, type PlayerStats } from './db';
import { categoryLabel, type Locale } from './i18n';
import { isCategorySelection, normalizeCategory, selectedCategoryIds, words, type WordEntry } from './words';
import type { BombGame } from './bomb';
import type { SameWaveGame } from './same-wave';
import type { WhoAmIGame } from './who-am-i';

export interface ImpostorGame {
  gameId: 'impostor';
  id: string;
  players: Player[];
  impostorIds: string[];
  entry: WordEntry;
  phase: 'reveal' | 'discuss' | 'vote' | 'result';
  revealIndex: number;
  accusedIds: string[];
  eliminatedIds: string[];
  foundImpostorIds: string[];
  starterId: string;
  scoreRecorded: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  lastVoteWasImpostor: boolean | null;
}

export type Game = ImpostorGame;
export type ActiveGame = ImpostorGame | BombGame | SameWaveGame | WhoAmIGame;
export interface LocalizedEntry { word: string; hint: string; category: string; }
export function maxImpostors(count: number): number { return Math.max(1, Math.floor((count - 1) / 2)); }
export function minAttempts(_playerCount: number, impostorCount: number): number { return Math.max(1, impostorCount); }
export function maxAttempts(playerCount: number, _impostorCount: number): number { return Math.max(1, Math.floor((playerCount - 1) / 2)); }

function randomIndex(length: number): number {
  if (length <= 0) throw new Error('Invalid random range');
  const limit = Math.floor(0x100000000 / length) * length;
  let value: number;
  do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= limit);
  return value % length;
}

export function createGame(players: Player[], settings: GameSettings, previousWord?: string): Game {
  if (players.length < 3 || players.length > 20 || new Set(players.map((player) => player.id)).size !== players.length) throw new Error('Invalid player count');
  if (!Number.isInteger(settings.impostors) || settings.impostors < 1 || settings.impostors > maxImpostors(players.length)) throw new Error('Invalid impostor count');
  if (!Number.isInteger(settings.maxAttempts) || settings.maxAttempts < minAttempts(players.length, settings.impostors) || settings.maxAttempts > maxAttempts(players.length, settings.impostors)) throw new Error('Invalid attempt count');
  if (!isCategorySelection(settings.category)) throw new Error('Invalid category');
  const selectedCategories = selectedCategoryIds(settings.category);
  const candidates = words.filter((word) => (selectedCategories === null || selectedCategories.includes(word.category)) && word.word !== previousWord);
  if (!candidates.length) throw new Error('Invalid category');
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const startIndex = randomIndex(players.length);
  const orderedPlayers = [...players.slice(startIndex), ...players.slice(0, startIndex)];
  return {
    gameId: 'impostor', id: crypto.randomUUID(), players: structuredClone(orderedPlayers),
    impostorIds: shuffled.slice(0, settings.impostors).map((player) => player.id), entry: candidates[randomIndex(candidates.length)],
    phase: 'reveal', revealIndex: 0, accusedIds: [], eliminatedIds: [], foundImpostorIds: [],
    starterId: orderedPlayers[0].id, scoreRecorded: false, attemptsUsed: 0, maxAttempts: settings.maxAttempts, lastVoteWasImpostor: null,
  };
}
export function localizeEntry(entry: WordEntry, locale: Locale): LocalizedEntry {
  return { word: locale === 'it' ? entry.word : entry.wordEn, hint: locale === 'it' ? entry.hint : entry.hintEn, category: categoryLabel(locale, normalizeCategory(entry.category)) };
}
export function citizensWin(game: ImpostorGame): boolean {
  const foundImpostors = game.foundImpostorIds.length ? game.foundImpostorIds : game.accusedIds;
  return foundImpostors.length === game.impostorIds.length && game.impostorIds.every((id) => foundImpostors.includes(id));
}
export type VoteResolution = 'continue' | 'result' | 'invalid';
export function resolveVote(game: ImpostorGame): VoteResolution {
  if (game.accusedIds.length !== 1 || game.eliminatedIds.includes(game.accusedIds[0])) return 'invalid';
  game.attemptsUsed += 1;
  const votedId = game.accusedIds[0];
  const impostorFound = game.impostorIds.includes(votedId);
  game.lastVoteWasImpostor = impostorFound;
  game.eliminatedIds = [...new Set([...game.eliminatedIds, votedId])];
  if (impostorFound) game.foundImpostorIds = [...new Set([...game.foundImpostorIds, votedId])];
  game.accusedIds = [];
  if (citizensWin(game) || game.attemptsUsed >= game.maxAttempts) return 'result';
  return 'continue';
}
function normalizedStats(value: unknown): PlayerStats {
  if (value && typeof value === 'object' && 'impostor' in value && 'bomb' in value && 'sameWave' in value) return structuredClone(value as PlayerStats);
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const stats = emptyPlayerStats();
  const number = (key: string) => typeof source[key] === 'number' && Number.isSafeInteger(source[key]) && source[key] >= 0 ? source[key] as number : 0;
  stats.impostor = { gamesPlayed: number('gamesPlayed'), wins: number('citizenWins') + number('impostorWins'), losses: number('citizenLosses') + number('impostorLosses'), citizenWins: number('citizenWins'), citizenLosses: number('citizenLosses'), impostorWins: number('impostorWins'), impostorLosses: number('impostorLosses') };
  return stats;
}
function legacyViews(stats: PlayerStats): PlayerStats {
  const legacy = stats.impostor;
  Object.defineProperties(stats, {
    gamesPlayed: { enumerable: false, get: () => legacy.gamesPlayed },
    citizenWins: { enumerable: false, get: () => legacy.citizenWins },
    citizenLosses: { enumerable: false, get: () => legacy.citizenLosses },
    impostorWins: { enumerable: false, get: () => legacy.impostorWins },
    impostorLosses: { enumerable: false, get: () => legacy.impostorLosses },
  });
  return stats;
}
/** Pure, idempotent result recording. Set scoreRecorded on the persisted session after success. */
export function recordGameResult(players: Player[], game: ImpostorGame): Player[] {
  if (game.scoreRecorded) return structuredClone(players);
  const crewWon = citizensWin(game);
  const participantIds = new Set(game.players.map((player) => player.id));
  const impostorIds = new Set(game.impostorIds);
  return players.map((player) => {
    if (!participantIds.has(player.id)) return { ...player, stats: structuredClone(player.stats ?? emptyPlayerStats()) };
    const current = normalizedStats(player.stats);
    const impostor = impostorIds.has(player.id);
    const won = impostor ? !crewWon : crewWon;
    current.impostor.gamesPlayed += 1;
    current.impostor.wins += won ? 1 : 0;
    current.impostor.losses += won ? 0 : 1;
    if (impostor) { current.impostor.impostorWins += won ? 1 : 0; current.impostor.impostorLosses += won ? 0 : 1; }
    else { current.impostor.citizenWins += won ? 1 : 0; current.impostor.citizenLosses += won ? 0 : 1; }
    return { ...player, stats: legacyViews(current) };
  });
}

import { emptyPlayerStats, type Player, type GameSettings } from './db';
import { categoryLabel, type Locale } from './i18n';
import { isCategorySelection, normalizeCategory, selectedCategoryIds, words, type WordEntry } from './words';

export interface Game {
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

export interface LocalizedEntry {
  word: string;
  hint: string;
  category: string;
}

export function maxImpostors(count: number): number {
  return Math.max(1, Math.floor((count - 1) / 2));
}

export function minAttempts(_playerCount: number, impostorCount: number): number {
  return Math.max(1, impostorCount);
}

export function maxAttempts(playerCount: number, _impostorCount: number): number {
  return Math.max(1, playerCount);
}

// Rejection sampling avoids modulo bias when assigning secret roles.
function randomIndex(length: number): number {
  const limit = Math.floor(0x100000000 / length) * length;
  let value: number;
  do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= limit);
  return value % length;
}

export function createGame(players: Player[], settings: GameSettings, previousWord?: string): Game {
  if (players.length < 3 || players.length > 20 || new Set(players.map(p => p.id)).size !== players.length) throw new Error('Invalid player count');
  if (!Number.isInteger(settings.impostors) || settings.impostors < 1 || settings.impostors > maxImpostors(players.length)) throw new Error('Invalid impostor count');
  if (!Number.isInteger(settings.maxAttempts) || settings.maxAttempts < minAttempts(players.length, settings.impostors) || settings.maxAttempts > maxAttempts(players.length, settings.impostors)) throw new Error('Invalid attempt count');
  if (!isCategorySelection(settings.category)) throw new Error('Invalid category');
  const selectedCategories = selectedCategoryIds(settings.category);
  const candidates = words.filter(w => (selectedCategories === null || selectedCategories.includes(w.category)) && w.word !== previousWord);
  if (!candidates.length) throw new Error('Invalid category');
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { id: crypto.randomUUID(), players: structuredClone(players), impostorIds: shuffled.slice(0, settings.impostors).map(p => p.id), entry: candidates[randomIndex(candidates.length)], phase: 'reveal', revealIndex: 0, accusedIds: [], eliminatedIds: [], foundImpostorIds: [], starterId: players[randomIndex(players.length)].id, scoreRecorded: false, attemptsUsed: 0, maxAttempts: settings.maxAttempts, lastVoteWasImpostor: null };
}

export function localizeEntry(entry: WordEntry, locale: Locale): LocalizedEntry {
  return {
    word: locale === 'it' ? entry.word : entry.wordEn,
    hint: locale === 'it' ? entry.hint : entry.hintEn,
    category: categoryLabel(locale, normalizeCategory(entry.category)),
  };
}

export function citizensWin(game: Game): boolean {
  const foundImpostors = game.foundImpostorIds.length ? game.foundImpostorIds : game.accusedIds;
  return foundImpostors.length === game.impostorIds.length && game.impostorIds.every(id => foundImpostors.includes(id));
}

export type VoteResolution = 'continue' | 'result' | 'invalid';

export function resolveVote(game: Game): VoteResolution {
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

export function recordGameResult(players: Player[], game: Game): Player[] {
  const crewWon = citizensWin(game);
  const gamePlayerIds = new Set(game.players.map(player => player.id));
  const impostorIds = new Set(game.impostorIds);

  return players.map((player) => {
    const currentStats = player.stats ?? emptyPlayerStats();
    if (!gamePlayerIds.has(player.id)) return { ...player, stats: { ...currentStats } };
    const impostor = impostorIds.has(player.id);
    const won = impostor ? !crewWon : crewWon;
    const stats = { ...currentStats, gamesPlayed: currentStats.gamesPlayed + 1 };
    if (impostor) {
      stats.impostorWins += won ? 1 : 0;
      stats.impostorLosses += won ? 0 : 1;
    } else {
      stats.citizenWins += won ? 1 : 0;
      stats.citizenLosses += won ? 0 : 1;
    }
    return { ...player, stats };
  });
}

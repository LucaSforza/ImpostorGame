import type { Locale } from './i18n';
import { isCategoryId, isCategorySelection, type CategorySelection } from './words';
import type { GameId } from './catalog';
import { BOMB_CATEGORY_IDS } from './bomb-content';
export type { GameId } from './catalog';

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
}

export interface ImpostorStats extends GameStats {
  citizenWins: number;
  citizenLosses: number;
  impostorWins: number;
  impostorLosses: number;
}

export interface PlayerStats {
  impostor: ImpostorStats;
  bomb: GameStats;
  sameWave: GameStats;
  whoAmI: GameStats;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
  stats: PlayerStats;
}

export interface GameSettings {
  impostors: number;
  maxAttempts: number;
  category: CategorySelection;
}

export interface BombSettings {
  category: string;
}

export interface SameWaveSettings {
  category: string;
}

export interface WhoAmISettings {
  category: 'all';
}

export interface SettingsByGame {
  impostor: GameSettings;
  bomb: BombSettings;
  sameWave: SameWaveSettings;
  whoAmI: WhoAmISettings;
}

export interface AppData<T = unknown> {
  players: Player[];
  selectedIds: string[];
  selectedGameId: GameId;
  settings: SettingsByGame;
  language: Locale;
  activeGame: T | null;
}

const DATABASE_NAME = 'impostor-game';
const DATABASE_VERSION = 1;
const STORE_NAME = 'snapshot';
const SNAPSHOT_KEY = 'current';

function unsupported(): Error { return new Error('IndexedDB is not supported'); }

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(unsupported());
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    let settled = false;
    const fail = (error: Error) => { if (!settled) { settled = true; reject(error); } };
    try { request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION); } catch (error) { reject(error); return; }
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onblocked = () => fail(new Error('IndexedDB open was blocked'));
    request.onerror = () => fail(request.error ?? new Error('IndexedDB open failed'));
    request.onsuccess = () => {
      const database = request.result;
      if (settled) { database.close(); return; }
      database.onversionchange = () => database.close();
      settled = true;
      resolve(database);
    };
  });
}

function transactionError(transaction: IDBTransaction, fallback: string): Error { return transaction.error ?? new Error(fallback); }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }

export function emptyGameStats(): GameStats { return { gamesPlayed: 0, wins: 0, losses: 0 }; }
export function emptyPlayerStats(): PlayerStats {
  return { impostor: { ...emptyGameStats(), citizenWins: 0, citizenLosses: 0, impostorWins: 0, impostorLosses: 0 }, bomb: emptyGameStats(), sameWave: emptyGameStats(), whoAmI: emptyGameStats() };
}
function isCounter(value: unknown): value is number { return Number.isSafeInteger(value) && (value as number) >= 0; }
function isNonEmptyString(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function isStringArray(value: unknown, expectedLength?: number): value is string[] {
  return Array.isArray(value) && value.length > 0 && (expectedLength === undefined || value.length === expectedLength) && value.every(isNonEmptyString);
}
function isGameStats(value: unknown): value is GameStats {
  return isRecord(value) && isCounter(value.gamesPlayed) && isCounter(value.wins) && isCounter(value.losses) && value.wins + value.losses === value.gamesPlayed;
}
function isImpostorStats(value: unknown): value is ImpostorStats {
  if (!isGameStats(value) || !isRecord(value)) return false;
  return isCounter(value.citizenWins) && isCounter(value.citizenLosses) && isCounter(value.impostorWins) && isCounter(value.impostorLosses)
    && value.citizenWins + value.citizenLosses + value.impostorWins + value.impostorLosses === value.gamesPlayed
    && value.citizenWins + value.impostorWins === value.wins
    && value.citizenLosses + value.impostorLosses === value.losses;
}
function isPlayerStats(value: unknown): value is PlayerStats { return isRecord(value) && isImpostorStats(value.impostor) && isGameStats(value.bomb) && isGameStats(value.sameWave) && (value.whoAmI === undefined || isGameStats(value.whoAmI)); }

function isLegacyStats(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  if ('impostor' in value || 'bomb' in value || 'sameWave' in value) return false;
  const keys = ['gamesPlayed', 'citizenWins', 'citizenLosses', 'impostorWins', 'impostorLosses'];
  if (!keys.every((key) => isCounter(value[key]))) return false;
  return (value.citizenWins as number) + (value.citizenLosses as number) + (value.impostorWins as number) + (value.impostorLosses as number) <= (value.gamesPlayed as number);
}

function legacyStats(value: unknown): PlayerStats {
  const result = emptyPlayerStats();
  if (!isRecord(value)) return result;
  const gamesPlayed = isCounter(value.gamesPlayed) ? value.gamesPlayed : 0;
  const citizenWins = isCounter(value.citizenWins) ? value.citizenWins : 0;
  const citizenLosses = isCounter(value.citizenLosses) ? value.citizenLosses : 0;
  const impostorWins = isCounter(value.impostorWins) ? value.impostorWins : 0;
  const impostorLosses = isCounter(value.impostorLosses) ? value.impostorLosses : 0;
  const played = Math.max(gamesPlayed, citizenWins + citizenLosses + impostorWins + impostorLosses);
  result.impostor = { gamesPlayed: played, wins: citizenWins + impostorWins, losses: citizenLosses + impostorLosses, citizenWins, citizenLosses, impostorWins, impostorLosses };
  return result;
}
function normalizeStats(value: unknown): PlayerStats {
  if (value === undefined) return emptyPlayerStats();
  if (isPlayerStats(value)) return { ...structuredClone(value), whoAmI: isGameStats(value.whoAmI) ? structuredClone(value.whoAmI) : emptyGameStats() };
  if (isLegacyStats(value)) return legacyStats(value);
  throw new Error('Invalid player statistics');
}
function isPlayer(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.avatar === 'string' && typeof value.createdAt === 'number' && Number.isSafeInteger(value.createdAt) && value.createdAt >= 0
    && (value.stats === undefined || isPlayerStats(value.stats) || isLegacyStats(value.stats));
}
function isPlayerList(value: unknown, minimum: number, maximum: number): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.length >= minimum && value.length <= maximum && value.every(isPlayer)
    && new Set(value.map((player) => player.id)).size === value.length;
}
function isWordEntry(value: unknown): boolean {
  // Sessions own their text: catalog edits must not invalidate saved profiles or games.
  return isRecord(value) && isNonEmptyString(value.word) && isNonEmptyString(value.hint) && isNonEmptyString(value.wordEn) && isNonEmptyString(value.hintEn)
    && isCategoryId(value.category) && value.category !== 'all';
}
function hasPlayerIds(value: unknown, players: readonly Record<string, unknown>[]): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === 'string') && new Set(value).size === value.length
    && value.every((id) => players.some((player) => player.id === id));
}
function isImpostorGameSnapshot(value: Record<string, unknown>): boolean {
  const players = value.players;
  if (!isPlayerList(players, 3, 20) || typeof value.id !== 'string' || !isWordEntry(value.entry)) return false;
  const playerIds = players.map((player) => player.id as string);
  const impostorIds = value.impostorIds;
  return Array.isArray(impostorIds) && impostorIds.length >= 1 && impostorIds.length <= Math.floor((players.length - 1) / 2)
    && hasPlayerIds(impostorIds, players) && typeof value.phase === 'string' && ['reveal', 'discuss', 'vote', 'result'].includes(value.phase)
    && isCounter(value.revealIndex) && value.revealIndex < players.length && hasPlayerIds(value.accusedIds, players)
    && hasPlayerIds(value.eliminatedIds, players) && hasPlayerIds(value.foundImpostorIds, players)
    && typeof value.starterId === 'string' && playerIds.includes(value.starterId)
    && (value.scoreRecorded === undefined || typeof value.scoreRecorded === 'boolean')
    && isCounter(value.attemptsUsed) && value.attemptsUsed <= Math.max(1, players.length)
    && isCounter(value.maxAttempts) && value.maxAttempts >= 1 && value.maxAttempts <= players.length
    && (value.lastVoteWasImpostor === undefined || value.lastVoteWasImpostor === null || typeof value.lastVoteWasImpostor === 'boolean');
}
function isBombGameSnapshot(value: Record<string, unknown>): boolean {
  const players = value.players;
  if (!isPlayerList(players, 2, 20) || typeof value.id !== 'string' || !isRecord(value.prompt)) return false;
  const prompt = value.prompt;
  const validPrompt = isNonEmptyString(prompt.id) && typeof prompt.category === 'string' && BOMB_CATEGORY_IDS.includes(prompt.category as typeof BOMB_CATEGORY_IDS[number])
    && isNonEmptyString(prompt.topic) && isNonEmptyString(prompt.topicEn) && isStringArray(prompt.examples) && isStringArray(prompt.examplesEn)
    && prompt.examples.length === prompt.examplesEn.length;
  const playerIds = players.map((player) => player.id as string);
  const winnerIds = value.winnerIds;
  const loserId = value.loserId;
  if (!hasPlayerIds(winnerIds, players)) return false;
  const validWinnerIds = winnerIds as string[];
  return validPrompt && isCounter(value.startedAt) && isCounter(value.deadlineAt) && value.deadlineAt > value.startedAt
    && value.deadlineAt - value.startedAt >= 20_000 && value.deadlineAt - value.startedAt <= 45_000
    && typeof value.phase === 'string' && ['playing', 'assigning', 'result'].includes(value.phase)
    && (loserId === null || (typeof loserId === 'string' && playerIds.includes(loserId)))
    && (value.scoreRecorded === undefined || typeof value.scoreRecorded === 'boolean')
    && (value.phase !== 'result' ? loserId === null && validWinnerIds.length === 0 : typeof loserId === 'string' && validWinnerIds.length === players.length - 1 && playerIds.filter((id) => id !== loserId).every((id) => validWinnerIds.includes(id)));
}
function isSameWaveGameSnapshot(value: Record<string, unknown>): boolean {
  const players = value.players;
  if (!isPlayerList(players, 3, 20) || typeof value.id !== 'string' || !isRecord(value.prompt)) return false;
  const prompt = value.prompt;
  const validPrompt = isNonEmptyString(prompt.id) && isNonEmptyString(prompt.prompt) && isNonEmptyString(prompt.promptEn)
    && isStringArray(prompt.options, 4) && isStringArray(prompt.optionsEn, 4);
  if (!validPrompt || !isCounter(value.currentPlayerIndex) || value.currentPlayerIndex > players.length || !isRecord(value.picks) || !hasPlayerIds(value.winnerIds, players)) return false;
  const playerIds = new Set(players.map((player) => player.id as string));
  const currentPlayerIndex = value.currentPlayerIndex as number;
  const savedPicks = value.picks as Record<string, unknown>;
  const picks = Object.entries(savedPicks);
  if (!picks.every(([id, choice]) => playerIds.has(id) && typeof choice === 'string' && /^[0-3]$/.test(choice))) return false;
  const prefix = players.slice(0, currentPlayerIndex).every((player) => Object.prototype.hasOwnProperty.call(savedPicks, player.id as string));
  const suffix = players.slice(currentPlayerIndex).every((player) => !Object.prototype.hasOwnProperty.call(savedPicks, player.id as string));
  if (picks.length !== currentPlayerIndex || !prefix || !suffix || typeof value.phase !== 'string' || !['picking', 'result'].includes(value.phase)
    || (value.scoreRecorded !== undefined && typeof value.scoreRecorded !== 'boolean')) return false;
  if (value.phase === 'picking') return value.winnerIds.length === 0 && currentPlayerIndex < players.length;
  if (currentPlayerIndex !== players.length) return false;
  const counts = new Map<string, number>();
  picks.forEach(([, choice]) => { const selected = choice as string; counts.set(selected, (counts.get(selected) ?? 0) + 1); });
  const largest = Math.max(0, ...counts.values());
  const winningChoices = new Set([...counts.entries()].filter(([, count]) => count === largest && count >= 2).map(([choice]) => choice));
  const expectedWinnerIds = largest < 2 ? [] : players.filter((player) => winningChoices.has(savedPicks[player.id as string] as string)).map((player) => player.id as string);
  const winnerIds = value.winnerIds as string[];
  return winnerIds.length === expectedWinnerIds.length && winnerIds.every((id) => expectedWinnerIds.includes(id));
}
function isWhoAmIGameSnapshot(value: Record<string, unknown>): boolean {
  const players = value.players;
  if (!isPlayerList(players, 3, 20) || typeof value.id !== 'string' || !isRecord(value.identityByPlayerId)) return false;
  const playerIds = players.map((player) => player.id as string);
  const identities = value.identityByPlayerId as Record<string, unknown>;
  const validIdentity = (identity: unknown): boolean => isRecord(identity) && isNonEmptyString(identity.id) && isNonEmptyString(identity.label) && isNonEmptyString(identity.labelEn);
  const assigned = playerIds.map((id) => identities[id]);
  if (!playerIds.every((id) => validIdentity(identities[id])) || Object.keys(identities).length !== playerIds.length
    || new Set(assigned.map((identity) => (identity as Record<string, unknown>).id)).size !== assigned.length
    || typeof value.phase !== 'string' || !['reveal', 'playing', 'result'].includes(value.phase)
    || !isCounter(value.turnIndex) || value.turnIndex >= players.length
    || !hasPlayerIds(value.eliminatedIds, players) || !hasPlayerIds(value.winnerIds, players)
    || (value.scoreRecorded !== undefined && typeof value.scoreRecorded !== 'boolean')) return false;
  const eliminatedIds = value.eliminatedIds as string[];
  const winnerIds = value.winnerIds as string[];
  const buzzedId = value.buzzedId;
  if (buzzedId !== null && (typeof buzzedId !== 'string' || !playerIds.includes(buzzedId) || eliminatedIds.includes(buzzedId))) return false;
  if (value.phase === 'reveal') return eliminatedIds.length === 0 && winnerIds.length === 0 && buzzedId === null;
  if (value.phase === 'playing') return winnerIds.length === 0 && eliminatedIds.length < players.length
    && !eliminatedIds.includes(playerIds[value.turnIndex as number]) && (buzzedId === null || buzzedId === playerIds[value.turnIndex as number]);
  return buzzedId === null && (winnerIds.length === 1
    ? !eliminatedIds.includes(winnerIds[0])
    : winnerIds.length === 0 && eliminatedIds.length === players.length);
}
function isActiveGame(value: unknown): boolean {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  if (value.gameId === undefined || value.gameId === 'impostor') return isImpostorGameSnapshot(value);
  if (value.gameId === 'bomb') return isBombGameSnapshot(value);
  if (value.gameId === 'same-wave') return isSameWaveGameSnapshot(value);
  if (value.gameId === 'who-am-i') return isWhoAmIGameSnapshot(value);
  return false;
}
function isBombCategory(value: unknown): value is string {
  return value === 'all' || (typeof value === 'string' && BOMB_CATEGORY_IDS.includes(value as typeof BOMB_CATEGORY_IDS[number]));
}
function isSettingsByGame(value: unknown, selectedCount: number): value is SettingsByGame {
  if (!isRecord(value) || !isRecord(value.impostor) || !isRecord(value.bomb) || !isRecord(value.sameWave)) return false;
  const settings = value.impostor;
  const impostors = settings.impostors;
  const maxAllowedImpostors = Math.max(1, Math.floor((selectedCount - 1) / 2));
  return Number.isInteger(impostors) && (impostors as number) >= 1 && (impostors as number) <= maxAllowedImpostors
    && (settings.maxAttempts === undefined || (isCounter(settings.maxAttempts) && settings.maxAttempts >= Math.max(1, impostors as number) && settings.maxAttempts <= Math.max(1, selectedCount)))
    && isCategorySelection(settings.category) && isBombCategory(value.bomb.category) && value.sameWave.category === 'all'
    && (value.whoAmI === undefined || (isRecord(value.whoAmI) && value.whoAmI.category === 'all'));
}
function isSnapshot<T>(value: unknown): value is AppData<T> {
  if (!isRecord(value) || !Array.isArray(value.players) || !value.players.every(isPlayer) || !Array.isArray(value.selectedIds) || !value.selectedIds.every((id) => typeof id === 'string')) return false;
  const playerIds = new Set(value.players.map((player) => (player as Record<string, unknown>).id));
  if (new Set(value.players.map((player) => (player as Record<string, unknown>).id)).size !== value.players.length
    || new Set(value.selectedIds).size !== value.selectedIds.length || !value.selectedIds.every((id) => playerIds.has(id))) return false;
  if (value.language !== 'it' && value.language !== 'en') return false;
  if (!isActiveGame(value.activeGame)) return false;
  if (value.selectedGameId !== undefined && value.selectedGameId !== 'impostor' && value.selectedGameId !== 'bomb' && value.selectedGameId !== 'same-wave' && value.selectedGameId !== 'who-am-i') return false;
  if (isSettingsByGame(value.settings, value.selectedIds.length)) return true;
  const settings = value.settings;
  if (isRecord(settings) && ('impostor' in settings || 'bomb' in settings || 'sameWave' in settings)) return false;
  return isRecord(settings) && Number.isInteger(settings.impostors) && (settings.impostors as number) >= 1
    && (settings.impostors as number) <= Math.max(1, Math.floor((value.selectedIds.length - 1) / 2))
    && (settings.maxAttempts === undefined || (isCounter(settings.maxAttempts) && settings.maxAttempts >= 1 && settings.maxAttempts <= Math.max(1, value.selectedIds.length)))
    && isCategorySelection(settings.category);
}
function normalizeActiveGame<T>(value: T | null): T | null { return !isRecord(value) || value.gameId !== undefined ? value : { ...value, gameId: 'impostor' } as T; }
function normalizeSnapshot<T>(stored: unknown): AppData<T> {
  if (!isSnapshot<T>(stored)) throw new Error('Invalid snapshot');
  const source = stored as unknown as Record<string, unknown>;
  const legacySettings = !isSettingsByGame(source.settings, (source.selectedIds as string[]).length);
  const old = source.settings as Record<string, unknown>;
  const impostor: GameSettings = legacySettings ? { impostors: old.impostors as number, maxAttempts: isCounter(old.maxAttempts) ? old.maxAttempts : Math.max(1, old.impostors as number), category: old.category as CategorySelection } : structuredClone((source.settings as SettingsByGame).impostor);
  const minimumAttempts = Math.max(1, impostor.impostors);
  const maximumAttempts = Math.max(1, Math.floor(((source.selectedIds as string[]).length - 1) / 2));
  const configuredAttempts = isCounter(impostor.maxAttempts) ? impostor.maxAttempts : minimumAttempts;
  const settings: SettingsByGame = {
    impostor: { ...impostor, maxAttempts: Math.max(minimumAttempts, Math.min(maximumAttempts, configuredAttempts)) },
    bomb: legacySettings ? { category: 'all' } : structuredClone((source.settings as SettingsByGame).bomb),
    sameWave: legacySettings ? { category: 'all' } : structuredClone((source.settings as SettingsByGame).sameWave),
    whoAmI: legacySettings || !(source.settings as Partial<SettingsByGame>).whoAmI ? { category: 'all' } : structuredClone((source.settings as SettingsByGame).whoAmI),
  };
  const players = (source.players as Record<string, unknown>[]).map((player) => ({ ...player, stats: normalizeStats(player.stats) })) as Player[];
  return { players, selectedIds: [...(source.selectedIds as string[])], selectedGameId: (source.selectedGameId as GameId | undefined) ?? 'impostor', settings, language: source.language as Locale, activeGame: normalizeActiveGame(source.activeGame as T | null) };
}
function deleteSnapshot(): Promise<void> {
  return openDatabase().then((database) => new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transactionError(transaction, 'IndexedDB delete transaction failed')); };
    transaction.onabort = () => { database.close(); reject(transactionError(transaction, 'IndexedDB delete transaction aborted')); };
    transaction.objectStore(STORE_NAME).delete(SNAPSHOT_KEY);
  }));
}
export function loadData<T>(): Promise<AppData<T> | null> {
  return openDatabase().then((database) => new Promise<AppData<T> | null>((resolve, reject) => {
    let snapshot: AppData<T> | null = null;
    let invalid = false;
    let transaction: IDBTransaction;
    try { transaction = database.transaction(STORE_NAME, 'readonly'); } catch (error) { database.close(); reject(error); return; }
    const request = transaction.objectStore(STORE_NAME).get(SNAPSHOT_KEY);
    request.onsuccess = () => { const stored = request.result as unknown; if (!stored) return; try { snapshot = normalizeSnapshot<T>(stored); } catch { invalid = true; } };
    request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
    transaction.oncomplete = () => { database.close(); if (invalid) deleteSnapshot().then(() => resolve(null), reject); else resolve(snapshot); };
    transaction.onerror = () => { database.close(); reject(transactionError(transaction, 'IndexedDB read transaction failed')); };
    transaction.onabort = () => { database.close(); reject(transactionError(transaction, 'IndexedDB read transaction aborted')); };
  }));
}
export function saveData<T>(data: AppData<T>): Promise<void> {
  return openDatabase().then((database) => new Promise<void>((resolve, reject) => {
    let transaction: IDBTransaction;
    try { transaction = database.transaction(STORE_NAME, 'readwrite'); } catch (error) { database.close(); reject(error); return; }
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transactionError(transaction, 'IndexedDB write transaction failed')); };
    transaction.onabort = () => { database.close(); reject(transactionError(transaction, 'IndexedDB write transaction aborted')); };
    let request: IDBRequest;
    try { request = transaction.objectStore(STORE_NAME).put(data, SNAPSHOT_KEY); } catch (error) { try { transaction.abort(); } catch { database.close(); } reject(error); return; }
    request.onerror = () => reject(request.error ?? new Error('IndexedDB write failed'));
  }));
}

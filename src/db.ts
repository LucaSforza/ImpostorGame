import type { Locale } from './i18n';
import { isCategorySelection, type CategorySelection } from './words';

export interface PlayerStats {
  gamesPlayed: number;
  citizenWins: number;
  citizenLosses: number;
  impostorWins: number;
  impostorLosses: number;
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

export interface AppData<T> {
  players: Player[];
  selectedIds: string[];
  settings: GameSettings;
  language: Locale;
  activeGame: T | null;
}

const DATABASE_NAME = "impostor-game";
const DATABASE_VERSION = 1;
const STORE_NAME = "snapshot";
const SNAPSHOT_KEY = "current";

function unsupported(): Error {
  return new Error("IndexedDB is not supported");
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(unsupported());
  }

  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    let settled = false;

    const fail = (error: Error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    try {
      request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    } catch (error) {
      reject(error);
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onblocked = () => fail(new Error("IndexedDB open was blocked"));
    request.onerror = () => fail(request.error ?? new Error("IndexedDB open failed"));
    request.onsuccess = () => {
      const database = request.result;
      if (settled) {
        database.close();
        return;
      }
      database.onversionchange = () => database.close();
      settled = true;
      resolve(database);
    };
  });
}

function transactionError(transaction: IDBTransaction, fallback: string): Error {
  return transaction.error ?? new Error(fallback);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function emptyPlayerStats(): PlayerStats {
  return { gamesPlayed: 0, citizenWins: 0, citizenLosses: 0, impostorWins: 0, impostorLosses: 0 };
}

function isCounter(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isPlayerStats(value: unknown): value is PlayerStats {
  if (!isRecord(value)) return false;
  const counters = [value.gamesPlayed, value.citizenWins, value.citizenLosses, value.impostorWins, value.impostorLosses];
  return counters.every(isCounter)
    && (value.citizenWins as number) + (value.citizenLosses as number) + (value.impostorWins as number) + (value.impostorLosses as number) <= (value.gamesPlayed as number);
}

function isPlayer(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.avatar === "string"
    && typeof value.createdAt === "number"
    && (value.stats === undefined || isPlayerStats(value.stats));
}

function isActiveGame(value: unknown): boolean {
  return value === null || isRecord(value);
}

function isSnapshot<T>(value: unknown): value is AppData<T> {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.players) || !value.players.every(isPlayer)) return false;
  if (!Array.isArray(value.selectedIds) || !value.selectedIds.every((id) => typeof id === "string")) return false;
  if (!isRecord(value.settings)) return false;
  const impostors = typeof value.settings.impostors === "number" ? value.settings.impostors : 1;
  const minAllowedAttempts = Math.max(1, impostors);
  const maxAllowedAttempts = Math.max(1, value.selectedIds.length);
  const maxAllowedImpostors = Math.max(1, Math.floor((value.selectedIds.length - 1) / 2));
  return Number.isInteger(value.settings.impostors)
    && impostors >= 1
    && impostors <= maxAllowedImpostors
    && (value.settings.maxAttempts === undefined || (isCounter(value.settings.maxAttempts) && value.settings.maxAttempts >= 1 && value.settings.maxAttempts <= maxAllowedAttempts))
    && isCategorySelection(value.settings.category)
    && (value.language === "it" || value.language === "en")
    && isActiveGame(value.activeGame);
}

function validateSnapshot<T>(data: AppData<T>): AppData<T> {
  if (!isSnapshot<T>(data)) throw new Error("Invalid snapshot");
  const cloned = structuredClone(data);
  const minimumAttempts = Math.max(1, cloned.settings.impostors);
  const maximumAttempts = Math.max(1, cloned.selectedIds.length);
  const configuredAttempts = cloned.settings.maxAttempts ?? minimumAttempts;
  return {
    ...cloned,
    settings: {
      ...cloned.settings,
      maxAttempts: Math.max(minimumAttempts, Math.min(maximumAttempts, configuredAttempts)),
    },
    players: cloned.players.map((player) => ({
      ...player,
      stats: player.stats ?? emptyPlayerStats(),
    })),
  };
}

function deleteSnapshot(): Promise<void> {
  return openDatabase().then((database) => new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transactionError(transaction, "IndexedDB delete transaction failed")); };
    transaction.onabort = () => { database.close(); reject(transactionError(transaction, "IndexedDB delete transaction aborted")); };
    transaction.objectStore(STORE_NAME).delete(SNAPSHOT_KEY);
  }));
}

export function loadData<T>(): Promise<AppData<T> | null> {
  return openDatabase().then(
    (database) =>
      new Promise<AppData<T> | null>((resolve, reject) => {
        let snapshot: AppData<T> | null = null;
        let invalid = false;

        let transaction: IDBTransaction;
        try {
          transaction = database.transaction(STORE_NAME, "readonly");
        } catch (error) {
          database.close();
          reject(error);
          return;
        }

        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(SNAPSHOT_KEY);
        request.onsuccess = () => {
          const stored = (request.result as AppData<T> | undefined) ?? null;
          if (!stored) return;
          try {
            snapshot = validateSnapshot(stored);
          } catch {
            invalid = true;
          }
        };
        request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"));
        transaction.oncomplete = () => {
          database.close();
          if (invalid) {
            deleteSnapshot().then(() => resolve(null), reject);
          } else {
            resolve(snapshot);
          }
        };
        transaction.onerror = () => {
          database.close();
          reject(transactionError(transaction, "IndexedDB read transaction failed"));
        };
        transaction.onabort = () => {
          database.close();
          reject(transactionError(transaction, "IndexedDB read transaction aborted"));
        };
      }),
  );
}

export function saveData<T>(data: AppData<T>): Promise<void> {
  return openDatabase().then(
    (database) =>
      new Promise<void>((resolve, reject) => {
        let transaction: IDBTransaction;
        try {
          transaction = database.transaction(STORE_NAME, "readwrite");
        } catch (error) {
          database.close();
          reject(error);
          return;
        }

        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => {
          database.close();
          reject(transactionError(transaction, "IndexedDB write transaction failed"));
        };
        transaction.onabort = () => {
          database.close();
          reject(transactionError(transaction, "IndexedDB write transaction aborted"));
        };

        let request: IDBRequest;
        try {
          request = transaction.objectStore(STORE_NAME).put(data, SNAPSHOT_KEY);
        } catch (error) {
          // DataCloneError is thrown synchronously; abort so the prior snapshot remains intact.
          try {
            transaction.abort();
          } catch {
            database.close();
          }
          reject(error);
          return;
        }
        request.onerror = () => reject(request.error ?? new Error("IndexedDB write failed"));
      }),
  );
}

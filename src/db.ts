import type { Locale } from './i18n';
import { isCategorySelection, type CategorySelection } from './words';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

export interface GameSettings {
  impostors: number;
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

function isPlayer(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.avatar === "string"
    && typeof value.createdAt === "number";
}

function isActiveGame(value: unknown): boolean {
  return value === null || isRecord(value);
}

function isSnapshot<T>(value: unknown): value is AppData<T> {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.players) || !value.players.every(isPlayer)) return false;
  if (!Array.isArray(value.selectedIds) || !value.selectedIds.every((id) => typeof id === "string")) return false;
  if (!isRecord(value.settings)) return false;
  return Number.isInteger(value.settings.impostors)
    && isCategorySelection(value.settings.category)
    && (value.language === "it" || value.language === "en")
    && isActiveGame(value.activeGame);
}

function validateSnapshot<T>(data: AppData<T>): AppData<T> {
  if (!isSnapshot<T>(data)) throw new Error("Invalid snapshot");
  return structuredClone(data);
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

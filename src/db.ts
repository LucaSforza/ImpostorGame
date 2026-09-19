import { normalizeLocale, type Locale } from './i18n';
import { normalizeCategory, type CategoryId } from './words';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

export interface GameSettings {
  impostors: number;
  category: CategoryId;
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

export function migrateSnapshot<T>(data: AppData<T>): AppData<T> {
  const next = structuredClone(data);
  next.language = normalizeLocale(next.language);
  next.settings.category = normalizeCategory(next.settings.category);

  const activeGame = next.activeGame as (T & {
    entry?: { category?: unknown };
    language?: unknown;
  }) | null;
  if (activeGame) {
    if (activeGame.entry) activeGame.entry.category = normalizeCategory(activeGame.entry.category);
    delete activeGame.language;
  }
  return next;
}

export function loadData<T>(): Promise<AppData<T> | null> {
  return openDatabase().then(
    (database) =>
      new Promise<AppData<T> | null>((resolve, reject) => {
        let snapshot: AppData<T> | null = null;

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
          snapshot = stored ? migrateSnapshot(stored) : null;
        };
        request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"));
        transaction.oncomplete = () => {
          database.close();
          resolve(snapshot);
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

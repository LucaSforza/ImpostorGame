import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { loadData, saveData, type AppData } from "./db";

const databaseName = "impostor-game";

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("database cleanup was blocked"));
  });
});

describe("local game snapshot", () => {
  it("returns null before the first save", async () => {
    await expect(loadData<{ round: number }>()).resolves.toBeNull();
  });

  it("round-trips a structured-cloned snapshot", async () => {
    const data: AppData<{ round: number }> = {
      players: [{ id: "p1", name: "Ada", avatar: "fox", createdAt: 123 }],
      selectedIds: ["p1"],
      settings: { impostors: 1, category: "animals" },
      language: "it",
      activeGame: { round: 2 },
    };

    await saveData(data);
    const loaded = await loadData<{ round: number }>();

    expect(loaded).toEqual(data);
    expect(loaded).not.toBe(data);
  });

  it("replaces the existing snapshot", async () => {
    const first: AppData<null> = {
      players: [],
      selectedIds: [],
      settings: { impostors: 1, category: "all" },
      language: "en",
      activeGame: null,
    };
    const second: AppData<null> = { ...first, settings: { impostors: 2, category: "food" } };

    await saveData(first);
    await saveData(second);

    await expect(loadData<null>()).resolves.toEqual(second);
  });

  it("keeps the prior snapshot when a value cannot be cloned", async () => {
    const existing: AppData<null> = {
      players: [],
      selectedIds: [],
      settings: { impostors: 1, category: "animals" },
      language: "en",
      activeGame: null,
    };
    const uncloneable: AppData<{ callback: () => void }> = {
      ...existing,
      activeGame: { callback: () => undefined },
    };

    await saveData(existing);
    await expect(saveData(uncloneable)).rejects.toThrow();

    await expect(loadData<null>()).resolves.toEqual(existing);
  });

  it("rejects when IndexedDB is unavailable", async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");
    Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: undefined });

    try {
      await expect(loadData()).rejects.toThrow("IndexedDB is not supported");
    } finally {
      if (original) {
        Object.defineProperty(globalThis, "indexedDB", original);
      }
    }
  });

  it("discards snapshots that do not match current contract", async () => {
    const invalid = {
      players: [],
      selectedIds: [],
      settings: { impostors: 1, category: "Oggetti" },
      language: "en",
      activeGame: null,
    } as unknown as AppData<null>;

    await saveData(invalid);

    await expect(loadData()).resolves.toBeNull();
    await expect(loadData()).resolves.toBeNull();
  });
});

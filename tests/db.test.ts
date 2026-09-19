import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { emptyPlayerStats, loadData, saveData, type AppData, type SettingsByGame } from "../src/db";
import { BOMB_PROMPTS } from "../src/bomb-content";

const databaseName = "impostor-game";
const settings = (category = "all"): SettingsByGame => ({
  impostor: { impostors: 1, maxAttempts: 1, category: category as SettingsByGame["impostor"]["category"] },
  bomb: { category: "all" },
  sameWave: { category: "all" },
});

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
    const data: AppData<null> = {
      players: [{ id: "p1", name: "Ada", avatar: "fox", createdAt: 123, stats: { ...emptyPlayerStats(), impostor: { gamesPlayed: 2, wins: 1, losses: 1, citizenWins: 1, citizenLosses: 1, impostorWins: 0, impostorLosses: 0 } } }],
      selectedIds: ["p1"],
      selectedGameId: "impostor",
      settings: settings("animals"),
      language: "it",
      activeGame: null,
    };

    await saveData(data);
    const loaded = await loadData<null>();

    expect(loaded).toEqual(data);
    expect(loaded).not.toBe(data);
  });

  it("replaces the existing snapshot", async () => {
    const first: AppData<null> = {
      players: [],
      selectedIds: [],
      selectedGameId: "impostor",
      settings: settings(),
      language: "en",
      activeGame: null,
    };
    const second: AppData<null> = { ...first, settings: settings("food") };

    await saveData(first);
    await saveData(second);

    await expect(loadData<null>()).resolves.toEqual(second);
  });

  it("keeps the prior snapshot when a value cannot be cloned", async () => {
    const existing: AppData<null> = {
      players: [],
      selectedIds: [],
      selectedGameId: "impostor",
      settings: settings("animals"),
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

  it("discards snapshots with an out-of-range attempt limit", async () => {
    const invalid = {
      players: [],
      selectedIds: [],
      settings: { impostors: 1, maxAttempts: 2, category: "all" },
      language: "en",
      activeGame: null,
    } as unknown as AppData<null>;

    await saveData(invalid);

    await expect(loadData()).resolves.toBeNull();
  });

  it("normalizes players from snapshots created before statistics", async () => {
    const legacy = {
      players: [{ id: "p1", name: "Ada", avatar: "fox", createdAt: 123 }],
      selectedIds: ["p1"],
      settings: { impostors: 1, category: "animals" },
      language: "en",
      activeGame: null,
    } as unknown as AppData<null>;

    await saveData(legacy);

    await expect(loadData()).resolves.toEqual({
      ...legacy,
      selectedGameId: "impostor",
      settings: settings("animals"),
      players: [{ ...legacy.players[0], stats: emptyPlayerStats() }],
    });
  });

  it("normalizes legacy attempt limits using the remaining-candidate bound", async () => {
    const legacy = {
      players: Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, name: `Player ${index + 1}`, avatar: "fox", createdAt: index + 1 })),
      selectedIds: ["p1", "p2", "p3", "p4", "p5"],
      settings: { impostors: 2, category: "animals" },
      language: "en",
      activeGame: null,
    } as unknown as AppData<null>;

    await saveData(legacy);

    await expect(loadData()).resolves.toMatchObject({ settings: { impostor: { maxAttempts: 2 } } });
  });

  it("clamps a legacy attempt limit below the impostor count instead of deleting the snapshot", async () => {
    const legacy = {
      players: Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, name: `Player ${index + 1}`, avatar: "fox", createdAt: index + 1 })),
      selectedIds: ["p1", "p2", "p3", "p4", "p5"],
      settings: { impostors: 2, maxAttempts: 1, category: "animals" },
      language: "en",
      activeGame: null,
    } as unknown as AppData<null>;

    await saveData(legacy);

    await expect(loadData()).resolves.toMatchObject({ settings: { impostor: { maxAttempts: 2 } } });
  });

  it("deletes snapshots with malformed new stats, game settings, or active games", async () => {
    const invalid = {
      players: [{ id: "p1", name: "Ada", avatar: "fox", createdAt: 123, stats: { impostor: {}, bomb: {}, sameWave: {} } }],
      selectedIds: ["p1"],
      selectedGameId: "bomb",
      settings: { impostor: { impostors: 1, maxAttempts: 1, category: "all" }, bomb: { category: "unknown" }, sameWave: { category: "all" } },
      language: "en",
      activeGame: { gameId: "bomb" },
    } as unknown as AppData<null>;

    await saveData(invalid);

    await expect(loadData()).resolves.toBeNull();
    await expect(loadData()).resolves.toBeNull();
  });

  it("round-trips a valid Bomb active session", async () => {
    const players = [1, 2].map((index) => ({ id: `p${index}`, name: `Player ${index}`, avatar: "fox", createdAt: index, stats: emptyPlayerStats() }));
    const data: AppData<unknown> = {
      players,
      selectedIds: players.map((player) => player.id),
      selectedGameId: "bomb",
      settings: settings(),
      language: "it",
      activeGame: {
        gameId: "bomb", id: "game-1", players, prompt: BOMB_PROMPTS[0], startedAt: 1000, deadlineAt: 21000,
        phase: "playing", loserId: null, winnerIds: [], scoreRecorded: false,
      },
    };

    await saveData(data);

    await expect(loadData()).resolves.toEqual(data);
  });

  it("deletes a Bomb session whose prompt category was altered", async () => {
    const players = [1, 2].map((index) => ({ id: `p${index}`, name: `Player ${index}`, avatar: "fox", createdAt: index, stats: emptyPlayerStats() }));
    const data: AppData<unknown> = {
      players,
      selectedIds: players.map((player) => player.id),
      selectedGameId: "bomb",
      settings: settings(),
      language: "it",
      activeGame: {
        gameId: "bomb", id: "game-1", players, prompt: { ...BOMB_PROMPTS[0], category: "unknown" }, startedAt: 1000, deadlineAt: 21000,
        phase: "playing", loserId: null, winnerIds: [], scoreRecorded: false,
      },
    };

    await saveData(data);

    await expect(loadData()).resolves.toBeNull();
    await expect(loadData()).resolves.toBeNull();
  });
});

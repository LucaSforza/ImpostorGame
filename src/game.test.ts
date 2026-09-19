import { describe, expect, it } from "vitest";
import type { Player } from "./db";
import { citizensWin, createGame, localizeEntry } from "./game";
import type { CategorySelection } from "./words";

function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Player ${index + 1}`,
    avatar: "🙂",
    createdAt: index + 1,
  }));
}

function makeSettings(impostors: number, category: CategorySelection = "all") {
  return { impostors, category };
}

describe("createGame", () => {
  it.each([
    [3, 1],
    [4, 1],
    [5, 2],
    [20, 9],
  ])("assigns the requested role count for %i players", (playerCount, impostorCount) => {
    const game = createGame(makePlayers(playerCount), makeSettings(impostorCount));

    expect(game.players).toHaveLength(playerCount);
    expect(game.impostorIds).toHaveLength(impostorCount);
    expect(new Set(game.impostorIds).size).toBe(impostorCount);
    expect(game.impostorIds.every((id) => game.players.some((player) => player.id === id))).toBe(true);
  });

  it("rejects player and impostor counts outside the supported bounds", () => {
    expect(() => createGame(makePlayers(2), makeSettings(1))).toThrow("Invalid player count");
    expect(() => createGame(makePlayers(21), makeSettings(1))).toThrow("Invalid player count");
    expect(() => createGame(makePlayers(5), makeSettings(0))).toThrow("Invalid impostor count");
    expect(() => createGame(makePlayers(5), makeSettings(3))).toThrow("Invalid impostor count");
  });

  it("rejects duplicate player IDs", () => {
    const players = makePlayers(3);
    players[2].id = players[0].id;

    expect(() => createGame(players, makeSettings(1))).toThrow("Invalid player count");
  });

  it("rejects categories without words", () => {
    expect(() => createGame(makePlayers(3), makeSettings(1, "Unknown" as CategorySelection))).toThrow("Invalid category");
  });

  it("does not immediately repeat the previous word", () => {
    const game = createGame(makePlayers(3), makeSettings(1, "food"), "pizza");

    expect(game.entry.word).not.toBe("pizza");
  });

  it("draws from every selected category", () => {
    const game = createGame(makePlayers(3), makeSettings(1, ["food", "sport"]));

    expect(["food", "sport"]).toContain(game.entry.category);
  });

  it("keeps an isolated player snapshot", () => {
    const players = makePlayers(3);
    const game = createGame(players, makeSettings(1));

    players[0].name = "Changed input";
    game.players[1].name = "Changed game";

    expect(game.players[0].name).toBe("Player 1");
    expect(players[1].name).toBe("Player 2");
  });
});

describe("citizensWin", () => {
  it("requires exactly the impostor IDs, regardless of order", () => {
    const game = createGame(makePlayers(5), makeSettings(2));
    const [firstImpostor, secondImpostor] = game.impostorIds;
    const citizenId = game.players.find((player) => !game.impostorIds.includes(player.id))!.id;

    game.accusedIds = [secondImpostor, firstImpostor];
    expect(citizensWin(game)).toBe(true);

    game.accusedIds = [firstImpostor, citizenId];
    expect(citizensWin(game)).toBe(false);

    game.accusedIds = [firstImpostor, secondImpostor, citizenId];
    expect(citizensWin(game)).toBe(false);
  });
});

describe("localizeEntry", () => {
  it("changes word, hint, and category with locale without changing the game entry", () => {
    const game = createGame(makePlayers(3), makeSettings(1, "objects"));

    expect(localizeEntry(game.entry, "it")).toEqual({ word: game.entry.word, hint: game.entry.hint, category: "Oggetti" });
    expect(localizeEntry(game.entry, "en")).toEqual({ word: game.entry.wordEn, hint: game.entry.hintEn, category: "Objects" });
  });
});

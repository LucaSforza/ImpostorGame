import type { Player } from './db';
import { WHO_AM_I_IDENTITIES, type WhoAmIIdentity } from './who-am-i-content';

export type WhoAmIPhase = 'reveal' | 'playing' | 'result';

export interface WhoAmIGame {
  gameId: 'who-am-i';
  id: string;
  players: Player[];
  identityByPlayerId: Record<string, WhoAmIIdentity>;
  phase: WhoAmIPhase;
  turnIndex: number;
  buzzedId: string | null;
  eliminatedIds: string[];
  winnerIds: string[];
  scoreRecorded: boolean;
}

export interface VisibleWhoAmIIdentity { player: Player; identity: WhoAmIIdentity; }

function randomIndex(length: number, random: () => number): number {
  if (length <= 0) throw new Error('Invalid random range');
  return Math.min(length - 1, Math.floor(random() * length));
}

function validatePlayers(players: readonly Player[]): void {
  if (players.length < 3 || players.length > 20 || new Set(players.map((player) => player.id)).size !== players.length) throw new Error('Invalid player count');
}

export function createWhoAmIGame(players: Player[], identities: readonly WhoAmIIdentity[] = WHO_AM_I_IDENTITIES, random: () => number = Math.random): WhoAmIGame {
  validatePlayers(players);
  if (identities.length < players.length || new Set(identities.map((identity) => identity.id)).size !== identities.length) throw new Error('Not enough identities');
  const startIndex = randomIndex(players.length, random);
  const orderedPlayers = [...players.slice(startIndex), ...players.slice(0, startIndex)];
  const pool = [...identities];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1, random);
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  const identityByPlayerId: Record<string, WhoAmIIdentity> = {};
  orderedPlayers.forEach((player, index) => { identityByPlayerId[player.id] = structuredClone(pool[index]); });
  return {
    gameId: 'who-am-i', id: crypto.randomUUID(), players: structuredClone(orderedPlayers), identityByPlayerId,
    phase: 'reveal', turnIndex: 0, buzzedId: null, eliminatedIds: [], winnerIds: [], scoreRecorded: false,
  };
}

export function visibleWhoAmIIdentities(game: WhoAmIGame, viewerId: string): VisibleWhoAmIIdentity[] {
  return game.players.filter((player) => player.id !== viewerId).map((player) => ({ player, identity: game.identityByPlayerId[player.id] }));
}

export function nextWhoAmITurn(game: WhoAmIGame, currentPlayerId: string): boolean {
  if (game.phase !== 'playing' || game.players[game.turnIndex]?.id !== currentPlayerId) return false;
  const active = game.players.filter((player) => !game.eliminatedIds.includes(player.id));
  if (!active.length) { game.phase = 'result'; return false; }
  const current = active.findIndex((player) => player.id === currentPlayerId);
  if (current < 0) return false;
  game.turnIndex = game.players.indexOf(active[(current + 1) % active.length]);
  return true;
}

export function buzzWhoAmI(game: WhoAmIGame, playerId: string): boolean {
  if (game.phase !== 'playing' || game.buzzedId !== null || game.eliminatedIds.includes(playerId) || game.players[game.turnIndex]?.id !== playerId) return false;
  game.buzzedId = playerId;
  return true;
}

export function resolveWhoAmIGuess(game: WhoAmIGame, correct: boolean): 'continue' | 'result' | 'invalid' {
  if (game.phase !== 'playing' || !game.buzzedId) return 'invalid';
  const guesser = game.buzzedId;
  game.buzzedId = null;
  if (correct) {
    game.winnerIds = [guesser]; game.phase = 'result'; return 'result';
  }
  game.eliminatedIds = [...new Set([...game.eliminatedIds, guesser])];
  const next = game.players.findIndex((player) => player.id === guesser);
  const active = game.players.filter((player) => !game.eliminatedIds.includes(player.id));
  if (!active.length) { game.phase = 'result'; return 'result'; }
  game.turnIndex = game.players.indexOf(active.find((player, offset) => game.players.indexOf(player) > next) ?? active[0]);
  return 'continue';
}

export function rematchWhoAmI(game: WhoAmIGame, identities: readonly WhoAmIIdentity[] = WHO_AM_I_IDENTITIES, random: () => number = Math.random): WhoAmIGame {
  const previousIds = new Set(Object.values(game.identityByPlayerId).map((identity) => identity.id));
  const fresh = identities.filter((identity) => !previousIds.has(identity.id));
  return createWhoAmIGame(game.players, fresh.length >= game.players.length ? fresh : identities, random);
}

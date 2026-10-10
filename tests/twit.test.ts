import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { emptyPlayerStats, loadData, saveData, type AppData, type Player } from '../src/db';
import { createTwitGame, startTwitRound, submitTwitAnswer, nextTwitRound, twitRoundResult, twitTotals, rematchTwit, type TwitGame } from '../src/twit';
import { TWIT_QUESTIONS } from '../src/twit-content';
import { recordActiveGameResult, totalStats } from '../src/stats';

const players = (count = 3): Player[] => Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `P${i}`, avatar: 'avatar-01', createdAt: i, stats: emptyPlayerStats() }));
const questions = Array.from({ length: 20 }, (_, i) => ({ id: `q${i}`, question: 'Quanti?', questionEn: 'How many?', answer: 100 }));
const game = (rounds = 1) => createTwitGame(players(), rounds, questions, () => 0);
const answerRound = (g: TwitGame, estimates = [90, 110, 50]) => {
  expect(startTwitRound(g)).toBe(true);
  g.players.forEach((p, i) => expect(submitTwitAnswer(g, p.id, estimates[i], g.players[i === 2 ? 0 : 2].id)).toBe(true));
};
const snapshot = (activeGame: TwitGame): AppData<TwitGame> => ({
  players: players(), selectedIds: ['p0', 'p1', 'p2'], selectedGameId: 'twit', language: 'it', activeGame,
  settings: { impostor: { impostors: 1, maxAttempts: 1, category: 'all' }, bomb: { category: 'all' }, sameWave: { category: 'all' }, whoAmI: { category: 'all' }, twit: { rounds: 5 } },
});
afterEach(async () => {
  await new Promise<void>((resolve, reject) => { const r = indexedDB.deleteDatabase('impostor-game'); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error); });
});

describe('Twit', () => {
  it('enforces player, round, question and random bounds', () => {
    for (const n of [2, 21]) expect(() => createTwitGame(players(n))).toThrow('Invalid player count');
    const duplicate = players(); duplicate[1].id = duplicate[0].id;
    expect(() => createTwitGame(duplicate)).toThrow('Invalid player count');
    expect(() => game(2)).toThrow('Invalid round count');
    expect(() => createTwitGame(players(), 5, questions.slice(0, 4))).toThrow('Not enough questions');
    expect(() => createTwitGame(players(), 1, [{ ...questions[0], answer: NaN }])).toThrow('Invalid question');
    expect(() => createTwitGame(players(), 1, questions, () => 1)).toThrow('Invalid random value');
    expect(createTwitGame(players(20), 10).players).toHaveLength(20);
  });

  it('snapshots players and questions, draws without repeats, rotates starter', () => {
    const roster = players(); const deck = structuredClone(questions);
    const g = createTwitGame(roster, 5, deck, () => 0.99);
    expect(g.players.map(p => p.id)).toEqual(['p2', 'p0', 'p1']);
    expect(new Set(g.rounds.map(r => r.question.id)).size).toBe(5);
    roster[0].name = 'Edited'; deck.forEach(q => { q.question = 'Edited'; });
    expect(g.players[1].name).toBe('P0'); expect(g.rounds[0].question.question).toBe('Quanti?');
  });

  it('accepts only current player and valid estimates/predictions, once', () => {
    const g = game();
    expect(submitTwitAnswer(g, 'p0', 90, 'p2')).toBe(false);
    startTwitRound(g);
    for (const value of [-1, NaN, Infinity, 0.5, 1_000_000_001]) expect(submitTwitAnswer(g, 'p0', value, 'p2')).toBe(false);
    expect(submitTwitAnswer(g, 'p1', 90, 'p2')).toBe(false);
    expect(submitTwitAnswer(g, 'p0', 90, 'p0')).toBe(false);
    expect(submitTwitAnswer(g, 'p0', 90, 'outsider')).toBe(false);
    expect(submitTwitAnswer(g, 'p0', 0, 'p2')).toBe(true);
    expect(submitTwitAnswer(g, 'p0', 90, 'p2')).toBe(false);
    expect(g.turnIndex).toBe(1); expect(g.winnerIds).toEqual([]);
  });

  it('awards +2 to tied closest estimates and +1 to correct worst predictions', () => {
    const g = game(); answerRound(g);
    expect(twitRoundResult(g.rounds[0], g.players)).toMatchObject({ closestIds: ['p0', 'p1'], farthestIds: ['p2'], points: { p0: 3, p1: 3, p2: 0 } });
    expect(g.phase).toBe('result'); expect(g.winnerIds).toEqual(['p0', 'p1']);
  });

  it('handles tied worst estimates and a round where everyone gives same answer', () => {
    const g = game(); answerRound(g, [50, 100, 150]);
    expect(twitRoundResult(g.rounds[0], g.players)).toMatchObject({ farthestIds: ['p0', 'p2'], points: { p0: 1, p1: 3, p2: 1 } });
    const same = game(); answerRound(same, [100, 100, 100]);
    expect(twitTotals(same)).toEqual({ p0: 3, p1: 3, p2: 3 }); expect(same.winnerIds).toHaveLength(3);
  });

  it('scores complete matches only, sums all rounds and records once', () => {
    const g = game(3); const roster = players();
    answerRound(g);
    expect(g.phase).toBe('round-result'); expect(g.winnerIds).toEqual([]);
    expect(recordActiveGameResult(roster, g)).toEqual(roster);
    expect(nextTwitRound(g)).toBe(true); expect(nextTwitRound(g)).toBe(false);
    expect(g.phase).toBe('question'); expect(g.turnIndex).toBe(0);
    answerRound(g); nextTwitRound(g); answerRound(g);
    expect(twitTotals(g)).toEqual({ p0: 9, p1: 9, p2: 0 });
    const scored = recordActiveGameResult(roster, g); g.scoreRecorded = true;
    expect(recordActiveGameResult(scored, g)).toEqual(scored);
    expect(scored.map(p => p.stats.twit)).toEqual([{ gamesPlayed: 1, wins: 1, losses: 0 }, { gamesPlayed: 1, wins: 1, losses: 0 }, { gamesPlayed: 1, wins: 0, losses: 1 }]);
    expect(totalStats(scored[0].stats).gamesPlayed).toBe(1);
  });

  it('rematches keep participants/round count and avoid prior questions when possible', () => {
    const g = game(5); const next = rematchTwit(g, questions, () => 0.99);
    expect(next.id).not.toBe(g.id); expect(next.rounds).toHaveLength(5);
    expect(next.players.map(p => p.id).sort()).toEqual(g.players.map(p => p.id).sort());
    expect(next.rounds.every(r => !g.rounds.some(old => old.question.id === r.question.id))).toBe(true);
    expect(next.phase).toBe('question'); expect(next.scoreRecorded).toBe(false);
  });

  it('round-trips every phase and older saved wording without changing scores', async () => {
    const g = game(3); g.rounds[0].question.question = 'Domanda precedente';
    const check = async () => { const data = snapshot(g); await saveData(data); await expect(loadData()).resolves.toEqual(data); };
    await check(); startTwitRound(g); submitTwitAnswer(g, 'p0', 90, 'p2'); await check();
    submitTwitAnswer(g, 'p1', 110, 'p2'); submitTwitAnswer(g, 'p2', 50, 'p0'); await check();
    nextTwitRound(g); answerRound(g); nextTwitRound(g); answerRound(g); await check();
    const data = snapshot(g); data.players = recordActiveGameResult(data.players, g); g.scoreRecorded = true;
    await saveData(data); const loaded = await loadData<TwitGame>();
    expect(recordActiveGameResult(loaded!.players, loaded!.activeGame!)).toEqual(loaded!.players);
  });

  it('rejects skipped turns, premature scores, invalid predictions and inconsistent winners', async () => {
    const base = game();
    const bad = [
      { ...structuredClone(base), turnIndex: 1 },
      { ...structuredClone(base), scoreRecorded: true },
      { ...structuredClone(base), phase: 'answering', turnIndex: 1, rounds: [{ question: questions[0], answers: { p0: { estimate: 90, predictedId: 'p0' } } }] },
    ];
    answerRound(base); bad.push({ ...base, winnerIds: ['p2'] });
    for (const active of bad) { await saveData(snapshot(active as TwitGame)); await expect(loadData()).resolves.toBeNull(); }
  });

  it('ships a unique, bilingual offline deck', () => {
    expect(TWIT_QUESTIONS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(TWIT_QUESTIONS.map(q => q.id)).size).toBe(TWIT_QUESTIONS.length);
    expect(TWIT_QUESTIONS.every(q => q.question.trim() && q.questionEn.trim() && Number.isSafeInteger(q.answer) && q.answer >= 0)).toBe(true);
  });

  it('preserves the prior Twit snapshot when a write cannot be cloned', async () => {
    const data = snapshot(game()); await saveData(data);
    await expect(saveData({ ...data, uncloneable: () => undefined } as typeof data)).rejects.toThrow();
    await expect(loadData()).resolves.toEqual(data);
  });

  it('treats prototype-like profile IDs as normal answer keys', () => {
    const roster = players(); roster[0].id = '__proto__';
    const g = createTwitGame(roster, 1, questions, () => 0);
    answerRound(g);
    expect(Object.hasOwn(g.rounds[0].answers, '__proto__')).toBe(true);
    expect(g.winnerIds).toContain('__proto__');
  });
});

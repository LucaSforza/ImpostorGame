import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url = process.env.QA_URL || 'http://127.0.0.1:4173/ImpostorGame/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await page.waitForSelector('[data-game="twit"]');
  const zero = { gamesPlayed: 0, wins: 0, losses: 0 };
  const stats = { impostor: { ...zero, citizenWins: 0, citizenLosses: 0, impostorWins: 0, impostorLosses: 0 }, bomb: zero, sameWave: { gamesPlayed: 2, wins: 1, losses: 1 }, whoAmI: zero, twit: zero };
  const players = ['QA Ada', 'QA Bea', 'QA Cy'].map((name, index) => ({ id: `qa-${index}`, name, avatar: 'avatar-01', createdAt: index, stats }));
  const saved = {
    players, selectedIds: players.map(p => p.id), selectedGameId: 'same-wave', language: 'en',
    settings: { impostor: { impostors: 1, maxAttempts: 1, category: 'all' }, bomb: { category: 'all' }, sameWave: { category: 'all' }, whoAmI: { category: 'all' }, twit: { rounds: 5 } },
    activeGame: { gameId: 'same-wave', id: 'legacy-qa', players, currentPlayerIndex: 0, picks: {}, phase: 'picking', winnerIds: [], scoreRecorded: false, prompt: { id: 'legacy-prompt', prompt: 'Pick a colour', promptEn: 'Pick a colour', options: ['Red', 'Blue', 'Green', 'Yellow'], optionsEn: ['Red', 'Blue', 'Green', 'Yellow'] } },
  };
  await page.evaluate(data => new Promise(resolve => {
    const request = indexedDB.open('impostor-game');
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction('snapshot', 'readwrite');
      tx.objectStore('snapshot').put(data, 'current');
      tx.oncomplete = () => { db.close(); resolve(); };
    };
  }), saved);
  await page.reload();
  await page.waitForSelector('[data-action="reveal"]');
  await page.click('[data-action="exit"]');
  await page.click('[data-action="home"]');
  await page.waitForSelector('[data-action="start"]', { timeout: 5000 }).catch(error => { console.log('Legacy exit errors:', errors); throw error; });
  assert.equal(await page.locator('.player[data-player]').count(), 3);
  assert.deepEqual(errors, []);
  await page.reload();
  await page.waitForSelector('[data-action="start"]');
  const loaded = await page.evaluate(() => new Promise(resolve => {
    const request = indexedDB.open('impostor-game');
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction('snapshot'), get = tx.objectStore('snapshot').get('current');
      get.onsuccess = () => resolve(get.result);
      tx.oncomplete = () => db.close();
    };
  }));
  assert.equal(loaded.selectedGameId, 'impostor');
  assert.equal(loaded.activeGame, null);
  assert.deepEqual(loaded.players, players, 'Retired session exit must preserve profiles and historical statistics');
  console.log('PASS retired-session exit falls back to available setup and preserves all profiles/statistics');
} finally { await browser.close(); }

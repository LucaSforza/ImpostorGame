import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.QA_URL || 'http://127.0.0.1:4173/ImpostorGame/';
const media = process.env.QA_MEDIA === '1';
const browser = await chromium.launch({ headless: true });
const errors = [], requests = [];
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => requests.push({ url: r.url(), type: r.resourceType() }));
const snapshot = () => page.evaluate(() => new Promise((resolve, reject) => {
  const request = indexedDB.open('impostor-game');
  request.onerror = () => reject(request.error);
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction('snapshot');
    const get = tx.objectStore('snapshot').get('current');
    get.onsuccess = () => resolve(get.result);
    get.onerror = () => reject(get.error);
    tx.oncomplete = () => db.close();
  };
}));
const click = async action => { await page.locator(`[data-action="${action}"]`).first().click(); };
const shot = async name => {
  if (!media) return;
  await mkdir('marketing/screenshots', { recursive: true });
  await page.screenshot({ path: `marketing/screenshots/${name}.png`, fullPage: true });
};
const checkLayout = async () => {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal page overflow');
  const tiny = await page.locator('button:visible').evaluateAll(buttons => buttons.filter(b => { const r = b.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map(b => b.textContent.trim()));
  assert.deepEqual(tiny, [], 'Visible buttons need 44px targets');
};
async function choose(game) {
  await page.goto(`${url}#game/${game}`);
  await page.waitForSelector('[data-action="start"]');
  await checkLayout();
}
async function exitResult() {
  await click('home');
  await page.waitForSelector('[data-action="start"]');
  assert.equal((await snapshot()).activeGame, null);
}
try {
  await page.goto(url);
  await page.waitForSelector('[data-game="twit"]');
  await page.waitForFunction(() => document.documentElement.dataset.offlineStatus === 'ready');
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  assert.equal(await page.locator('.catalog-card').count(), 4);
  await checkLayout();
  await shot('catalog-mobile');
  await page.setViewportSize({ width: 1280, height: 900 });
  await shot('catalog-desktop');
  await checkLayout();
  await page.setViewportSize({ width: 390, height: 844 });

  // Native, clipboard and denied-clipboard paths use browser API fakes, no outgoing share.
  await page.evaluate(() => { navigator.share = async data => { window.qaShare = data; }; });
  await click('share');
  assert.match(await page.evaluate(() => window.qaShare.text), /Free/);
  assert.equal(await page.evaluate(() => window.qaShare.url), 'https://lucasforza.github.io/ImpostorGame/');
  await page.evaluate(() => { navigator.share = undefined; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }); });
  await click('share');
  await page.waitForSelector('#share-url');
  assert.equal(await page.locator('#share-url').inputValue(), 'https://lucasforza.github.io/ImpostorGame/');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'share');

  await choose('impostor');
  for (const name of ['QA Ada', 'QA Bea', 'QA Cy']) {
    await click('add');
    await page.fill('#name', name);
    await page.click('#player-form button[type="submit"]');
    await page.waitForSelector('dialog', { state: 'detached' });
  }
  const initialPlayers = (await snapshot()).players;
  assert.equal(initialPlayers.length, 3);
  await page.reload();
  await page.waitForSelector('[data-action="start"]:not(:disabled)');
  assert.deepEqual((await snapshot()).players, initialPlayers);

  // Hash history selects setup; an active session always wins over a shared game URL.
  await click('catalog');
  await page.locator('[data-game="bomb"]').first().click();
  await page.waitForURL('**#game/bomb');
  await click('catalog');
  await page.waitForURL('**#catalog');
  await page.locator('[data-game="twit"]').first().click();
  await page.waitForURL('**#game/twit');
  await page.goBack();
  await page.waitForSelector('[data-game="twit"]');
  await page.goBack();
  await page.waitForSelector('[data-action="start"]');
  assert.equal((await snapshot()).selectedGameId, 'twit'); // URL drives displayed setup; persistence is committed on changes.
  assert.match(await page.locator('h1').innerText(), /Bomb/);

  await context.setOffline(true);
  requests.length = 0;
  await choose('impostor');
  await click('start');
  let game = (await snapshot()).activeGame;
  assert.equal(game.gameId, 'impostor');
  await click('reveal');
  await shot('impostore');
  await checkLayout();
  await page.reload();
  await page.waitForSelector('[data-action="reveal"]');
  assert.equal(await page.locator('.secret-word').count(), 0);
  assert.equal((await snapshot()).activeGame.id, game.id);
  await page.goto(`${url}#game/twit`);
  await page.waitForSelector('[data-action="reveal"]');
  assert.equal((await snapshot()).activeGame.id, game.id);
  for (let i = 0; i < 3; i++) { await click('reveal'); await click('next'); }
  await click('vote');
  game = (await snapshot()).activeGame;
  await page.click(`[data-accuse="${game.impostorIds[0]}"]`);
  await click('result');
  await page.waitForSelector('[data-action="again"]');
  const impostorStats = (await snapshot()).players.map(p => p.stats.impostor);
  await page.reload();
  await page.waitForSelector('[data-action="again"]');
  assert.deepEqual((await snapshot()).players.map(p => p.stats.impostor), impostorStats);
  await click('again');
  await page.waitForSelector('[data-action="reveal"]');
  assert.equal(await page.locator('.secret-word').count(), 0);
  await click('exit'); await click('home');
  await page.waitForSelector('[data-action="start"]:not(:disabled)');

  await choose('bomb');
  await page.clock.install();
  await click('start');
  await page.waitForSelector('.bomb-orb');
  await shot('bomba');
  assert.equal(await page.locator('[role="timer"]').count(), 0);
  await page.clock.fastForward(121_000);
  await page.waitForSelector('[data-action="bomb-loser"]');
  await page.locator('[data-action="bomb-loser"]').first().click();
  await page.waitForSelector('[data-action="again"]');
  assert.equal((await snapshot()).players.every(p => p.stats.bomb.gamesPlayed === 1), true);
  await exitResult();

  await choose('who-am-i'); await click('start');
  await click('who-reveal'); await shot('chi-sono');
  await click('rules'); await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-action="who-reveal"]').count(), 1, 'Rules conceal identities');
  for (let i = 0; i < 3; i++) { await click('who-reveal'); await click('who-playing'); }
  await click('who-buzz'); await click('who-correct');
  await page.waitForSelector('[data-action="again"]');
  assert.equal((await snapshot()).players.every(p => p.stats.whoAmI.gamesPlayed === 1), true);
  await exitResult();

  await choose('twit');
  await page.selectOption('#twit-rounds', '1');
  await click('start'); await shot('twit');
  await click('twit-begin');
  for (let i = 0; i < 3; i++) {
    await click('reveal');
    await page.fill('#twit-estimate', `${20 + i}`);
    await page.locator('#twit-prediction').selectOption({ index: 1 });
    await page.click('#twit-form button[type="submit"]');
  }
  await page.waitForSelector('[data-action="again"]');
  assert.equal((await snapshot()).players.every(p => p.stats.twit.gamesPlayed === 1), true);
  await exitResult();
  await click('stats');
  await page.waitForSelector('.stats-player-card');
  assert.equal(await page.locator('.stats-player-card').count(), 3);
  await page.reload();
  await page.waitForSelector('.stats-player-card');
  assert.equal((await snapshot()).players.every(p => p.stats.twit.gamesPlayed === 1), true);
  await click('language');
  assert.equal(await page.locator('html').getAttribute('lang'), 'it');
  await page.reload();
  await page.waitForSelector('.stats-player-card');
  assert.equal(await page.locator('html').getAttribute('lang'), 'it');
  await click('catalog');
  await page.setViewportSize({ width: 320, height: 740 });
  await checkLayout();
  for (const id of ['impostor', 'bomb', 'who-am-i', 'twit']) { await choose(id); await checkLayout(); }
  assert.equal(requests.some(r => !r.url.startsWith(new URL(url).origin)), false, 'No third-party requests');
  assert.equal(requests.some(r => ['fetch', 'xhr', 'websocket', 'eventsource'].includes(r.type)), false, 'No gameplay API requests');
  assert.deepEqual(errors, []);
  const report = { checks: ['Production cache ready', 'Offline reload and all four completed games', 'Roster, locale, active session and exactly-once statistics persistence', 'Hash history and active-session precedence', 'Native/manual sharing', 'Keyboard privacy/help', '390/320/1280 layouts and 44px button targets', 'No third-party/gameplay API requests'], errors };
  if (media) await writeFile('marketing/screenshots/capture.json', `${JSON.stringify({ ...report, syntheticPlayers: ['QA Ada', 'QA Bea', 'QA Cy'], url, capturedAt: new Date().toISOString() }, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally { await context.close(); await browser.close(); }

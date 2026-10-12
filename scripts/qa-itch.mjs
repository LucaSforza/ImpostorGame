import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url = process.env.ITCH_QA_URL || 'http://127.0.0.1:4174/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 740 } });
  const failures = [];
  page.on('pageerror', e => failures.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
  await page.goto(url);
  await page.waitForSelector('[data-game="twit"]');
  assert.equal(await page.locator('link[rel="manifest"]').count(), 0);
  assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 0);
  await page.locator('[data-game="impostor"]').first().click();
  for (const name of ['QA Ada', 'QA Bea', 'QA Cy']) {
    await page.click('[data-action="add"]'); await page.fill('#name', name);
    await page.click('#player-form button[type="submit"]');
    await page.waitForSelector('dialog', { state: 'detached' });
  }
  for (const game of ['impostor', 'bomb', 'who-am-i', 'twit']) {
    await page.goto(`${url}#game/${game}`);
    await page.waitForSelector('[data-action="start"]:not(:disabled)');
    await page.click('[data-action="start"]');
    const active = { impostor: '[data-action="reveal"]', bomb: '.bomb-orb', 'who-am-i': '[data-action="who-reveal"]', twit: '[data-action="twit-begin"]' }[game];
    await page.waitForSelector(active);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.click('[data-action="exit"]'); await page.click('[data-action="home"]');
    await page.waitForSelector('[data-action="start"]:not(:disabled)');
  }
  await page.reload();
  await page.waitForSelector('.player[data-player]');
  assert.equal(await page.locator('.player[data-player]').count(), 3);
  assert.deepEqual(failures, []);
  console.log('PASS itch relative assets, no worker/manifest, four game starts, saved roster, 320px layout');
} finally { await browser.close(); }

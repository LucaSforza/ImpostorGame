import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url = process.env.QA_URL || 'http://127.0.0.1:4173/ImpostorGame/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url);
  await page.waitForSelector('[data-game="impostor"]');
  await page.locator('[data-game="impostor"]').first().click();
  for (const name of ['QA Ada', 'QA Bea', 'QA Cy']) {
    await page.click('[data-action="add"]');
    await page.fill('#name', name);
    await page.click('#player-form button[type="submit"]');
    await page.waitForSelector('dialog', { state: 'detached' });
  }
  await page.click('[data-action="start"]');
  await page.waitForSelector('[data-action="reveal"]');
  // Earlier releases permitted three attempts for three players. Keep that active contract.
  await page.evaluate(() => new Promise((resolve, reject) => {
    const req = indexedDB.open('impostor-game');
    req.onsuccess = () => {
      const db = req.result, tx = db.transaction('snapshot', 'readwrite'), store = tx.objectStore('snapshot');
      const get = store.get('current');
      get.onsuccess = () => { const saved = get.result; saved.activeGame.maxAttempts = 3; store.put(saved, 'current'); };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  }));
  await page.reload();
  await page.waitForSelector('[data-action="reveal"]');
  const attempts = await page.evaluate(() => new Promise(resolve => {
    const req = indexedDB.open('impostor-game');
    req.onsuccess = () => {
      const db = req.result, tx = db.transaction('snapshot');
      const get = tx.objectStore('snapshot').get('current');
      get.onsuccess = () => resolve(get.result.activeGame.maxAttempts);
      tx.oncomplete = () => db.close();
    };
  }));
  assert.equal(attempts, 3, 'Startup must preserve supported older session voting rules');
  await page.click('[data-action="reveal"]');
  assert.equal(await page.locator('.secret-word').count(), 1);
  // Delay completion delivery, not the real write, so UI faces a slow successful save.
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args) {
      const tx = original.apply(this, args);
      if (args[1] === 'readwrite') {
        Object.defineProperty(tx, 'oncomplete', { set(handler) { tx.addEventListener('complete', event => setTimeout(() => handler(event), 500)); } });
      }
      return tx;
    };
  });
  await page.click('[data-action="next"]');
  assert.equal(await page.locator('.secret-word').count(), 0, 'Hide and pass must conceal immediately before delayed save');
  console.log('PASS legacy session rules and synchronous secret concealment');
} finally { await browser.close(); }

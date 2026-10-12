import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const workerA = await readFile('dist/service-worker.js', 'utf8');
const htmlA = await readFile('dist/index.html', 'utf8');
let release = 'A';
const workerFor = version => workerA.replace(/const CACHE_NAME = CACHE_PREFIX \+ "[^"]+";/, `const CACHE_NAME = CACHE_PREFIX + "qa-${version}";`);
const types = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!pathname.startsWith('/ImpostorGame/')) { res.writeHead(404).end(); return; }
  const file = decodeURIComponent(pathname.slice('/ImpostorGame/'.length)) || 'index.html';
  if (file.includes('..')) { res.writeHead(400).end(); return; }
  try {
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (file === 'service-worker.js') { res.end(workerFor(release)); return; }
    // C simulates a broken new release: missing shell must never replace installed B.
    if (release === 'C' && file === 'index.html') { res.writeHead(503).end('Missing release shell'); return; }
    if (file === 'index.html') { res.end(htmlA.replace('</head>', `<meta name="qa-release" content="${release}"></head>`)); return; }
    res.end(await readFile(path.join('dist', file)));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/ImpostorGame/`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
async function until(predicate) {
  const deadline = Date.now() + 15_000;
  while (!await predicate()) {
    if (Date.now() > deadline) throw new Error('Service worker condition timed out');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
const readSnapshot = page => page.evaluate(() => new Promise(resolve => {
  const req = indexedDB.open('impostor-game');
  req.onsuccess = () => {
    const db = req.result, tx = db.transaction('snapshot');
    const get = tx.objectStore('snapshot').get('current');
    get.onsuccess = () => resolve(get.result);
    tx.oncomplete = () => db.close();
  };
}));
try {
  let page = await context.newPage();
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.dataset.offlineStatus === 'ready');
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await page.locator('[data-game="impostor"]').first().click();
  for (const name of ['QA Ada', 'QA Bea', 'QA Cy']) {
    await page.click('[data-action="add"]'); await page.fill('#name', name);
    await page.click('#player-form button[type="submit"]');
    await page.waitForSelector('dialog', { state: 'detached' });
  }
  await page.click('[data-action="start"]');
  await page.waitForSelector('[data-action="reveal"]');
  const before = await readSnapshot(page);
  release = 'B';
  await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
  await until(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).waiting !== null));
  assert.equal(await page.locator('meta[name="qa-release"]').getAttribute('content'), 'A');
  assert.deepEqual(await readSnapshot(page), before, 'Waiting update must not touch active session');
  assert.deepEqual((await page.evaluate(() => caches.keys())).filter(k => k.startsWith('pocket-circle-')).sort(), ['pocket-circle-ImpostorGame-qa-A', 'pocket-circle-ImpostorGame-qa-B']);
  await page.close();
  // Observe registration while no app clients remain; this page sits outside worker scope.
  let observer = await context.newPage();
  await observer.goto(url.replace('/ImpostorGame/', '/observer'));
  await until(() => observer.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration('/ImpostorGame/');
    const keys = await caches.keys();
    return r.active?.state === 'activated' && !r.waiting && keys.includes('pocket-circle-ImpostorGame-qa-B') && !keys.includes('pocket-circle-ImpostorGame-qa-A');
  }));
  await observer.close();
  page = await context.newPage();
  await context.setOffline(true);
  await page.goto(url, {waitUntil:'networkidle'});
  await page.waitForSelector('[data-action="reveal"]');
  assert.equal(await page.locator('meta[name="qa-release"]').getAttribute('content'), 'B');
  assert.deepEqual(await readSnapshot(page), before, 'New offline app version preserves all local data');
  await context.setOffline(false);
  release = 'C';
  const install = await page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    const result = new Promise(resolve => {
      r.addEventListener('updatefound', () => {
        const worker = r.installing;
        worker.addEventListener('statechange', () => { if (worker.state === 'redundant') resolve('failed'); });
      }, { once: true });
    });
    await r.update(); return result;
  });
  assert.equal(install, 'failed');
  assert.deepEqual((await page.evaluate(() => caches.keys())).filter(k => k.startsWith('pocket-circle-')), ['pocket-circle-ImpostorGame-qa-B'], 'Failed install cannot retain partial cache');
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('[data-action="reveal"]');
  assert.equal(await page.locator('meta[name="qa-release"]').getAttribute('content'), 'B');
  assert.deepEqual(await readSnapshot(page), before);
  console.log('PASS waiting update, activation after tabs close, obsolete cache cleanup, offline new version, unchanged IndexedDB, failed install recovery');
} finally { await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve)); }

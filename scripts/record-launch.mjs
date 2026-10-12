import { mkdir, copyFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const url = process.env.QA_URL || 'http://127.0.0.1:4173/ImpostorGame/';
await mkdir('marketing/recordings', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  // Set up fictional players before recording. All footage below is actual app navigation.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const setup = await context.newPage();
  await setup.goto(`${url}#game/impostor`);
  await setup.waitForSelector('[data-action="add"]');
  for (const name of ['QA Ada', 'QA Bea', 'QA Cy']) {
    await setup.click('[data-action="add"]'); await setup.fill('#name', name);
    await setup.click('#player-form button[type="submit"]');
    await setup.waitForSelector('dialog', { state: 'detached' });
  }
  const state = await setup.evaluate(() => new Promise(resolve => {
    const r = indexedDB.open('impostor-game');
    r.onsuccess = () => { const db=r.result, tx=db.transaction('snapshot'), get=tx.objectStore('snapshot').get('current'); get.onsuccess=()=>resolve(get.result); tx.oncomplete=()=>db.close(); };
  }));
  await context.close();
  const recording = await browser.newContext({ viewport: { width: 390, height: 844 }, recordVideo: { dir: 'marketing/recordings', size: { width: 390, height: 844 } }, reducedMotion: 'reduce' });
  const page = await recording.newPage();
  await page.goto(url);
  await page.waitForSelector('[data-game="twit"]');
  await page.evaluate(saved => new Promise(resolve => {
    const r=indexedDB.open('impostor-game');r.onsuccess=()=>{const db=r.result,tx=db.transaction('snapshot','readwrite');tx.objectStore('snapshot').put(saved,'current');tx.oncomplete=()=>{db.close();resolve();};};
  }), state);
  await page.reload();
  await page.waitForSelector('.catalog-shortcuts');
  await page.waitForTimeout(2500);
  await page.locator('[data-game="impostor"]').first().click();
  await page.click('[data-action="start"]'); await page.click('[data-action="reveal"]');
  await page.waitForTimeout(3000);
  await page.click('[data-action="exit"]'); await page.click('[data-action="home"]');
  await page.waitForSelector('[data-action="start"]:not(:disabled)');
  await page.goto(`${url}#game/bomb`); await page.click('[data-action="start"]');
  await page.waitForTimeout(3000);
  await page.click('[data-action="exit"]'); await page.click('[data-action="home"]');
  await page.waitForSelector('[data-action="start"]:not(:disabled)');
  await page.goto(`${url}#game/who-am-i`); await page.click('[data-action="start"]'); await page.click('[data-action="who-reveal"]');
  await page.waitForTimeout(3000);
  await page.click('[data-action="exit"]'); await page.click('[data-action="home"]');
  await page.waitForSelector('[data-action="start"]:not(:disabled)');
  await page.goto(`${url}#game/twit`); await page.click('[data-action="start"]');
  await page.waitForTimeout(3000);
  await page.click('[data-action="exit"]'); await page.click('[data-action="home"]');
  await page.waitForSelector('[data-action="start"]:not(:disabled)');
  await page.click('header .nav-btn[data-action="catalog"]');
  await page.waitForTimeout(3000);
  const video = page.video();
  await recording.close();
  await copyFile(await video.path(), 'marketing/recordings/pocket-circle-demo.webm');
  console.log('Created marketing/recordings/pocket-circle-demo.webm (authentic silent UI capture; edit per video.md).');
} finally { await browser.close(); }

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const url = process.env.QA_URL || 'http://127.0.0.1:4173/ImpostorGame/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url);
  await page.waitForSelector('[data-game="twit"]');
  for (const screen of ['catalog', 'impostor', 'bomb', 'who-am-i', 'twit', 'stats', 'player', 'rules']) {
    if (['impostor', 'bomb', 'who-am-i', 'twit'].includes(screen)) {
      await page.goto(`${url}#game/${screen}`);
      await page.waitForSelector('[data-action="start"]');
    }
    if (screen === 'stats') {
      await page.goto(`${url}#stats`);
      await page.waitForSelector('.stats-screen');
    }
    if (screen === 'player') {
      await page.goto(`${url}#game/impostor`);
      await page.click('[data-action="add"]');
    }
    if (screen === 'rules') {
      await page.keyboard.press('Escape');
      await page.click('[data-action="rules"]');
    }
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const result = await page.evaluate(() => axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    }));
    assert.deepEqual(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `${screen} accessibility violations`);
    console.log(`PASS accessibility: ${screen}`);
  }
} finally { await browser.close(); }

import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.QA_URL || 'http://127.0.0.1:4173/ImpostorGame/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url);
  await page.waitForSelector('[data-game="impostor"]');
  await page.locator('[data-game="impostor"]').first().click();
  await page.click('[data-action="add"]');
  await page.fill('#name', 'QA Ada');
  await page.focus('[data-avatar="avatar-02"]');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.avatar), 'avatar-02', 'Avatar choice must keep keyboard focus');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'add', 'Escape must return focus to opener');
  await page.click('[data-action="add"]');
  await page.fill('#name', 'QA Ada');
  await page.click('#player-form button[type="submit"]');
  await page.waitForSelector('[data-player]');
  await page.focus('.player[data-player]');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('.player').getAttribute('aria-pressed') === 'false');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.player), await page.locator('.player').getAttribute('data-player'), 'Persisted selection must keep keyboard focus');
  console.log('PASS focus: avatar, Escape/opener, persisted roster selection');
} finally { await browser.close(); }

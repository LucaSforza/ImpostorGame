// Uses optional Playwright tooling; no image library or app dependency is needed.
import { mkdir, readFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
try {
  await mkdir('public/icons', { recursive: true });
  const icon = await readFile('public/favicon.svg', 'utf8');
  for (const [name, size, inset] of [['icon-192', 192, 0], ['icon-512', 512, 0], ['icon-maskable-512', 512, 80], ['apple-touch-icon', 180, 0]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;background:#17121f;display:grid;place-items:center"><div style="width:${size - inset * 2}px;height:${size - inset * 2}px">${icon}</div></body></html>`);
    await page.screenshot({ path: `public/icons/${name}.png` });
    await page.close();
  }
} finally { await browser.close(); }

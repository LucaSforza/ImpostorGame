import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const assets = ['impostore', 'bomba', 'twit'];
const screenshots = await Promise.all(assets.map(async name => `data:image/png;base64,${(await readFile(`marketing/screenshots/${name}.png`)).toString('base64')}`));
const icon = await readFile('public/favicon.svg', 'utf8');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<html><head><style>
    *{box-sizing:border-box}body{margin:0;background:#17121f;color:#f8f5fb;font-family:Arial,Helvetica,sans-serif}
    main{display:grid;grid-template-columns:520px 1fr;gap:30px;padding:48px;height:630px}
    .brand{display:flex;align-items:center;gap:18px;font-size:44px;font-weight:800;letter-spacing:-1px}.brand svg{width:60px;height:60px}
    h1{font-size:43px;line-height:1.12;letter-spacing:-1.4px;margin:38px 0 22px}em{color:#d4f777;font-style:normal}
    .names{font-size:22px;line-height:1.65;color:#b9a7e8}.promise{font-size:20px;line-height:1.5;color:#c8bed2;margin-top:26px}
    .url{font-size:16px;color:#d4f777;margin-top:32px}.screens{display:flex;align-items:center;gap:14px}
    figure{width:170px;margin:0}figure img{display:block;width:170px;height:390px;object-fit:cover;object-position:top;border:2px solid #463952;border-radius:18px}
    figcaption{font-size:15px;font-weight:700;text-align:center;margin-top:14px;color:#c8bed2}.note{position:absolute;bottom:22px;right:48px;font-size:12px;color:#c8bed2}
  </style></head><body><main><section><div class="brand">${icon}Pocket Circle</div><h1>One phone.<br><em>Four free party games.</em></h1><div class="names">Impostore · Bomba · Chi sono? · Twit</div><p class="promise">No ads. No accounts. No subscriptions.<br>English & Italian. Your data stays local.</p><p class="url">lucasforza.github.io/ImpostorGame/</p></section><section class="screens">${screenshots.map((src,i)=>`<figure><img src="${src}"/><figcaption>${['Impostore','Bomba','Twit'][i]}</figcaption></figure>`).join('')}</section></main><p class="note">Actual app screens · fictional QA profiles</p></body></html>`);
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await page.screenshot({ path: 'public/social-preview.png' });
  await mkdir('marketing', { recursive: true });
  await copyFile('public/social-preview.png', 'marketing/social-preview.png');
} finally { await browser.close(); }

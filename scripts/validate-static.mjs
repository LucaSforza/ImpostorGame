import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

for (const [directory, base] of [['dist', '/ImpostorGame/'], ['dist-itch', './']]) {
  const html = await readFile(path.join(directory, 'index.html'), 'utf8');
  for (const [, link] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|#|data:)/.test(link)) continue;
    assert.equal(link.startsWith(base), true, `${directory}: wrong base path ${link}`);
    await access(path.join(directory, decodeURIComponent(link.slice(base.length))));
  }
  const image = await readFile(path.join(directory, 'social-preview.png'));
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.name, 'Pocket Circle');
  assert.equal(data.offers.price, '0');
  assert.equal('aggregateRating' in data, false);
  if (directory === 'dist') {
    const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.name, 'Pocket Circle');
    assert.equal(manifest.scope, './');
    assert.equal(manifest.start_url, './');
    for (const icon of manifest.icons) {
      const png = await readFile(path.join(directory, icon.src));
      assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
    }
    await access(path.join(directory, 'service-worker.js'));
  } else {
    assert.equal(html.includes('rel="manifest"'), false);
    await assert.rejects(access(path.join(directory, 'service-worker.js')));
    await access(path.join(directory, 'LICENSE'));
    await access(path.join(directory, 'SOURCE.md'));
  }
  console.log(`PASS static assets/metadata: ${directory}`);
}

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const live = 'https://lucasforza.github.io/ImpostorGame/';

describe('public discovery contract', () => {
  it('serves canonical social metadata before JavaScript runs', () => {
    expect(html).toContain(`<link rel="canonical" href="${live}"`);
    for (const property of ['og:title', 'og:description', 'og:image', 'og:url', 'og:image:alt']) {
      expect(html).toMatch(new RegExp(`<meta property="${property}" content="[^"]+"`));
    }
    expect(html).toContain(`${live}social-preview.png`);
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });
  it('provides accurate game content and valid structured data without invented ratings', () => {
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    const data = JSON.parse(match![1]);
    expect(data).toMatchObject({ '@type': 'SoftwareApplication', name: 'Pocket Circle', applicationCategory: 'GameApplication', offers: { price: '0' }, inLanguage: ['en', 'it'] });
    expect(data).not.toHaveProperty('aggregateRating');
    for (const name of ['Impostore', 'Bomba', 'Chi sono?', 'Twit']) expect(html).toContain(name);
    expect(html).toContain('lang="it"');
    expect(html).toContain('<noscript>');
  });
  it('lists only the canonical document in sitemap, not fragment routes', () => {
    const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
    expect(sitemap.match(/<loc>/g)).toHaveLength(1);
    expect(sitemap).toContain(`<loc>${live}</loc>`);
    expect(sitemap).not.toContain('#');
  });
});

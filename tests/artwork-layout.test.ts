import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

describe('reveal artwork layout', () => {
  it('keeps live-card artwork in flow so reveal controls remain visible', () => {
    const artworkRule = stylesheet.match(/\.live-card\s*>\s*\.character-art\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(artworkRule).toMatch(/position:\s*relative/);
    expect(artworkRule).toMatch(/height:\s*320px/);
  });
});

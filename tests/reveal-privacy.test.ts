import { describe, expect, it } from 'vitest';
import { concealResult } from '../src/reveal-privacy';

describe('private rematch', () => {
  it('removes the result secret synchronously before the next round is saved', () => {
    const result = { textContent: 'Previous secret', replaceChildren() { this.textContent = ''; } };
    const root = { querySelector: () => result } as unknown as ParentNode;

    concealResult(root);

    expect(result.textContent).toBe('');
  });
});

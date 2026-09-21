import { describe, expect, it } from 'vitest';
import { resetPageScroll } from '../src/scroll';

describe('page scroll reset', () => {
  it('resets Safari document surfaces immediately and after layout frames', () => {
    const scrollingElement = { scrollTop: 900, scrollLeft: 40 };
    const documentElement = { scrollTop: 900, scrollLeft: 40 };
    const body = { scrollTop: 900, scrollLeft: 40 };
    const calls: Array<[number, number]> = [];
    const frames: Array<() => void> = [];

    resetPageScroll(
      { scrollTo: (x: number, y: number) => calls.push([x, y]) },
      { scrollingElement, documentElement, body },
      callback => { frames.push(callback); return frames.length; },
    );

    expect([scrollingElement.scrollTop, documentElement.scrollTop, body.scrollTop]).toEqual([0, 0, 0]);
    expect(calls).toEqual([[0, 0]]);
    frames.shift()?.();
    frames.shift()?.();
    expect(calls).toEqual([[0, 0], [0, 0], [0, 0]]);
  });
});

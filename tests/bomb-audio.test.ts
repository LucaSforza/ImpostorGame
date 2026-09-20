import { afterEach, describe, expect, it, vi } from 'vitest';

class MockParam {
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class MockOscillator {
  type = 'sine';
  frequency = new MockParam();
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn(() => this.onended?.());
}

class MockGain {
  gain = new MockParam();
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockAudioContext {
  state: AudioContextState = 'suspended';
  currentTime = 10;
  destination = {} as AudioDestinationNode;
  resume = vi.fn(async () => { this.state = 'running'; });
  createGain = vi.fn(() => new MockGain());
  createOscillator = vi.fn(() => new MockOscillator());
}

describe('bomb audio', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');

  afterEach(() => {
    vi.resetModules();
    if (original) Object.defineProperty(globalThis, 'AudioContext', original);
    else delete (globalThis as { AudioContext?: unknown }).AudioContext;
  });

  it('primes on a gesture and plays only after the context is running', async () => {
    let context: MockAudioContext;
    class TestAudioContext extends MockAudioContext {
      constructor() {
        super();
        context = this;
      }
    }
    Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: TestAudioContext });
    const { playBombExplosion, primeBombAudio } = await import('../src/bomb-audio');

    playBombExplosion();
    expect(context!).toBeDefined();
    expect(context!.createOscillator).not.toHaveBeenCalled();
    primeBombAudio();
    expect(context!.resume).toHaveBeenCalledOnce();
    playBombExplosion();
    expect(context!.createOscillator).toHaveBeenCalledTimes(2);
  });

  it('keeps unavailable audio from throwing', async () => {
    delete (globalThis as { AudioContext?: unknown }).AudioContext;
    const { playBombExplosion, primeBombAudio } = await import('../src/bomb-audio');
    expect(() => primeBombAudio()).not.toThrow();
    expect(() => playBombExplosion()).not.toThrow();
  });
});

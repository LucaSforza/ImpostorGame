type AudioContextConstructor = new () => AudioContext;

let context: AudioContext | null = null;
let warningShown = false;

function warnAudio(): void {
  if (warningShown) return;
  warningShown = true;
  console.warn('Bomb audio unavailable; continuing without sound.');
}

function getContext(): AudioContext | null {
  const scope = globalThis as typeof globalThis & { webkitAudioContext?: AudioContextConstructor };
  const Constructor = scope.AudioContext ?? scope.webkitAudioContext;
  if (!Constructor) return null;
  try {
    context ??= new Constructor();
    return context;
  } catch {
    warnAudio();
    return null;
  }
}

/** Start/resume audio from a user gesture; playback remains best-effort. */
export function primeBombAudio(): void {
  const audio = getContext();
  if (!audio || audio.state !== 'suspended') return;
  void audio.resume().catch(warnAudio);
}

/** Play a short local explosion without making adjudication depend on audio. */
export function playBombExplosion(): void {
  const audio = getContext();
  if (!audio) return;
  try {
    if (audio.state !== 'running') return;
    const now = audio.currentTime;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    gain.connect(audio.destination);

    const low = audio.createOscillator();
    low.type = 'sawtooth';
    low.frequency.setValueAtTime(130, now);
    low.frequency.exponentialRampToValueAtTime(42, now + 0.65);
    low.connect(gain);
    let ended = 0;
    const disconnect = () => {
      ended += 1;
      if (ended < 2) return;
      low.disconnect();
      crack.disconnect();
      gain.disconnect();
    };
    low.onended = disconnect;
    low.start(now);
    low.stop(now + 0.65);

    const crack = audio.createOscillator();
    crack.type = 'square';
    crack.frequency.setValueAtTime(760, now);
    crack.frequency.exponentialRampToValueAtTime(95, now + 0.18);
    crack.connect(gain);
    crack.onended = disconnect;
    crack.start(now);
    crack.stop(now + 0.2);
  } catch {
    warnAudio();
  }
}

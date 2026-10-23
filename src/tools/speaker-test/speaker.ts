/** Browser-only Web Audio playback for the speaker test. Nothing is captured. */
import { MAX_FREQUENCY, MIN_FREQUENCY, sweepFrequencyAt, type Channel } from './logic';

export interface Playback {
  stop: () => void;
}

export interface SweepPlayback extends Playback {
  cancelAnimation: () => void;
}

function panFor(channel: Channel): number {
  return channel === 'left' ? -1 : channel === 'right' ? 1 : 0;
}

export async function getAudioContext(existing: AudioContext | null): Promise<AudioContext> {
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) throw new Error('unsupported');
  const context = existing ?? new AudioContextConstructor();
  await context.resume();
  return context;
}

function createSignal(context: AudioContext, volume: number, channel: Channel) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const panner = context.createStereoPanner();
  const now = context.currentTime;
  const peak = Math.max(0.0001, (volume / 100) * 0.2);

  oscillator.type = 'sine';
  panner.pan.setValueAtTime(panFor(channel), now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.025);
  oscillator.connect(gain).connect(panner).connect(context.destination);
  oscillator.start(now);

  let stopped = false;
  return {
    oscillator,
    stop: () => {
      if (stopped) return;
      stopped = true;
      const end = context.currentTime + 0.04;
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.stop(end + 0.01);
    },
  };
}

export function playChannelTone(context: AudioContext, volume: number, channel: Channel): Playback {
  const signal = createSignal(context, volume, channel);
  signal.oscillator.frequency.setValueAtTime(440, context.currentTime);
  return { stop: signal.stop };
}

export function playSweep(
  context: AudioContext,
  volume: number,
  durationSeconds: number,
  onFrequency: (frequency: number) => void,
  onEnd: () => void,
): SweepPlayback {
  const signal = createSignal(context, volume, 'center');
  const startedAt = context.currentTime;
  signal.oscillator.frequency.setValueAtTime(MIN_FREQUENCY, startedAt);
  signal.oscillator.frequency.exponentialRampToValueAtTime(MAX_FREQUENCY, startedAt + durationSeconds);

  let animationFrame = 0;
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(animationFrame);
    signal.stop();
    onEnd();
  };
  const update = () => {
    if (ended) return;
    const elapsed = context.currentTime - startedAt;
    onFrequency(sweepFrequencyAt(elapsed, durationSeconds));
    if (elapsed >= durationSeconds) {
      finish();
      return;
    }
    animationFrame = requestAnimationFrame(update);
  };
  animationFrame = requestAnimationFrame(update);

  return {
    stop: finish,
    cancelAnimation: () => cancelAnimationFrame(animationFrame),
  };
}

import { barDurationSeconds, beatAtElapsedTime, type MetronomeSettings } from './logic';

const CLICK_SECONDS = 0.045;
const RESUME_TIMEOUT_MS = 3_000;

/** Current Chrome, Safari and Firefox expose the unprefixed Web Audio constructor. */
export function supportsMetronomeAudio(): boolean {
  return typeof window !== 'undefined' && typeof window.AudioContext === 'function';
}

function waitForResume(context: AudioContext): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error('AudioContext resume timed out')), RESUME_TIMEOUT_MS);
    context.resume().then(
      () => {
        window.clearTimeout(timeoutId);
        resolve();
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function createBarBuffer(context: AudioContext, settings: MetronomeSettings): AudioBuffer {
  const duration = barDurationSeconds(settings.bpm, settings.beatsPerBar);
  const frameCount = Math.max(1, Math.ceil(duration * context.sampleRate));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const samples = buffer.getChannelData(0);
  const beatSeconds = 60 / settings.bpm;
  const clickFrames = Math.ceil(CLICK_SECONDS * context.sampleRate);

  for (let beat = 0; beat < settings.beatsPerBar; beat += 1) {
    const offset = Math.round(beat * beatSeconds * context.sampleRate);
    const frequency = beat === 0 ? 1_320 : 880;
    const peak = beat === 0 ? 0.28 : 0.2;
    for (let frame = 0; frame < clickFrames && offset + frame < samples.length; frame += 1) {
      const time = frame / context.sampleRate;
      const attack = Math.min(1, time / 0.002);
      samples[offset + frame] += Math.sin(2 * Math.PI * frequency * time) * peak * attack * Math.exp(-time / 0.012);
    }
  }

  return buffer;
}

/**
 * A bounded, one-bar Web Audio loop. The browser's audio renderer owns the repeating
 * beat, so background-tab timer throttling cannot create silence or a catch-up burst.
 */
export class MetronomeAudioEngine {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private settings: MetronomeSettings | null = null;
  private startedAt = 0;

  async start(settings: MetronomeSettings): Promise<void> {
    if (!supportsMetronomeAudio()) throw new Error('Web Audio is unsupported');

    if (!this.context || this.context.state === 'closed') {
      this.context = new window.AudioContext();
      this.gain = this.context.createGain();
      this.gain.connect(this.context.destination);
    }

    try {
      await waitForResume(this.context);
      if (this.context.state !== 'running') throw new Error(`AudioContext remained ${this.context.state}`);
      this.replaceSource(settings);
    } catch (error) {
      await this.resetContext();
      throw error;
    }
  }

  update(settings: MetronomeSettings): void {
    if (!this.context || !this.gain || !this.source || !this.settings) return;
    this.gain.gain.setValueAtTime(settings.volume / 100, this.context.currentTime);
    if (settings.bpm !== this.settings.bpm || settings.beatsPerBar !== this.settings.beatsPerBar) {
      this.replaceSource(settings);
    } else {
      this.settings = { ...settings };
    }
  }

  currentBeat(): number {
    if (!this.context || !this.source || !this.settings) return 0;
    return beatAtElapsedTime(this.context.currentTime - this.startedAt, this.settings.bpm, this.settings.beatsPerBar);
  }

  stop(): void {
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        // A source that already ended is still safe to disconnect.
      }
      this.source.disconnect();
      this.source = null;
    }
    this.settings = null;
    this.startedAt = 0;
  }

  async destroy(): Promise<void> {
    this.stop();
    await this.resetContext();
  }

  private replaceSource(settings: MetronomeSettings): void {
    const context = this.context;
    const gain = this.gain;
    if (!context || !gain) throw new Error('AudioContext is unavailable');

    this.stop();
    gain.gain.setValueAtTime(settings.volume / 100, context.currentTime);
    const source = context.createBufferSource();
    source.buffer = createBarBuffer(context, settings);
    source.loop = true;
    source.connect(gain);
    source.start();
    this.source = source;
    this.settings = { ...settings };
    this.startedAt = context.currentTime;
  }

  private async resetContext(): Promise<void> {
    const context = this.context;
    this.context = null;
    this.gain = null;
    if (context && context.state !== 'closed') {
      await context.close().catch(() => undefined);
    }
  }
}

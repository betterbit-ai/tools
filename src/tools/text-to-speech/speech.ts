import { yieldToBrowser } from '../../lib/browser';
import { splitSpeechText, type SpeechSettings } from './logic';

export interface LocalVoice {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}

export interface SpeechCallbacks {
  onProgress: (index: number, total: number) => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

/** The browser reports local service voices; network voices are deliberately excluded. */
export function getLocalVoices(): LocalVoice[] {
  if (!isSupported()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.localService)
    .sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name))
    .map((voice) => ({ name: voice.name, lang: voice.lang, voiceURI: voice.voiceURI, default: voice.default }));
}

export function isSupported(): boolean {
  if (typeof window === 'undefined' || typeof window.SpeechSynthesisUtterance !== 'function') return false;
  const synthesis = window.speechSynthesis;
  return (
    !!synthesis &&
    typeof synthesis.getVoices === 'function' &&
    typeof synthesis.speak === 'function' &&
    typeof synthesis.pause === 'function' &&
    typeof synthesis.resume === 'function' &&
    typeof synthesis.cancel === 'function' &&
    typeof synthesis.addEventListener === 'function' &&
    typeof synthesis.removeEventListener === 'function'
  );
}

/** A single sequential queue avoids long-utterance cut-offs in browser speech engines. */
export class SpeechSession {
  private readonly chunks: string[];
  private readonly voice: LocalVoice | null;
  private index = 0;
  private stopped = false;

  constructor(
    text: string,
    private readonly settings: SpeechSettings,
    voices: LocalVoice[],
    private readonly callbacks: SpeechCallbacks,
  ) {
    this.chunks = splitSpeechText(text);
    this.voice = voices.find((candidate) => candidate.voiceURI === settings.voiceURI) ?? null;
  }

  start(): void {
    if (!this.chunks.length || !this.voice || !isSupported()) {
      this.fail(!this.voice ? 'voice-unavailable' : 'synthesis-unavailable');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      this.speakNext();
    } catch {
      this.fail('synthesis-failed');
    }
  }

  pause(): boolean {
    try {
      if (!isSupported()) throw new Error('Speech synthesis unavailable');
      window.speechSynthesis.pause();
      return true;
    } catch {
      this.fail('synthesis-failed');
      return false;
    }
  }

  resume(): boolean {
    try {
      if (!isSupported()) throw new Error('Speech synthesis unavailable');
      window.speechSynthesis.resume();
      return true;
    } catch {
      this.fail('synthesis-failed');
      return false;
    }
  }

  stop(): boolean {
    this.stopped = true;
    try {
      if (!isSupported()) return false;
      window.speechSynthesis.cancel();
      return true;
    } catch {
      return false;
    }
  }

  private speakNext(): void {
    if (this.stopped) return;
    if (this.index >= this.chunks.length) {
      this.callbacks.onEnd();
      return;
    }
    try {
      const browserVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.voiceURI === this.voice!.voiceURI && voice.localService);
      if (!browserVoice) {
        this.fail('voice-unavailable');
        return;
      }
      const utterance = new SpeechSynthesisUtterance(this.chunks[this.index]);
      utterance.lang = browserVoice.lang;
      utterance.voice = browserVoice;
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;
      utterance.volume = this.settings.volume;
      utterance.onend = () => {
        if (this.stopped) return;
        this.index += 1;
        this.callbacks.onProgress(this.index, this.chunks.length);
        void this.continueAfterYield();
      };
      utterance.onerror = (event) => {
        if (!this.stopped) this.fail(event.error || 'synthesis-failed');
      };
      this.callbacks.onProgress(this.index, this.chunks.length);
      window.speechSynthesis.speak(utterance);
    } catch {
      this.fail('synthesis-failed');
    }
  }

  private async continueAfterYield(): Promise<void> {
    await yieldToBrowser();
    if (!this.stopped) this.speakNext();
  }

  private fail(error: string): void {
    if (this.stopped) return;
    this.stopped = true;
    this.callbacks.onError(error);
  }
}

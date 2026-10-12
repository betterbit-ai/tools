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
  onError: () => void;
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
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
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
      this.callbacks.onError();
      return;
    }
    window.speechSynthesis.cancel();
    this.speakNext();
  }

  pause(): void {
    window.speechSynthesis.pause();
  }

  resume(): void {
    window.speechSynthesis.resume();
  }

  stop(): void {
    this.stopped = true;
    window.speechSynthesis.cancel();
  }

  private speakNext(): void {
    if (this.stopped) return;
    if (this.index >= this.chunks.length) {
      this.callbacks.onEnd();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(this.chunks[this.index]);
    utterance.lang = this.voice!.lang;
    utterance.voice =
      window.speechSynthesis.getVoices().find((voice) => voice.voiceURI === this.voice!.voiceURI) ?? null;
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;
    utterance.onend = () => {
      if (this.stopped) return;
      this.index += 1;
      this.callbacks.onProgress(this.index, this.chunks.length);
      this.speakNext();
    };
    utterance.onerror = () => {
      if (!this.stopped) this.callbacks.onError();
    };
    this.callbacks.onProgress(this.index, this.chunks.length);
    window.speechSynthesis.speak(utterance);
  }
}

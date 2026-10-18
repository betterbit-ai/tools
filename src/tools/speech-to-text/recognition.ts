/** Browser-only wrapper for the on-device Web Speech API. Never falls back to cloud recognition. */

type Availability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

interface RecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface RecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<RecognitionResultLike>;
}

interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  processLocally: boolean;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface OnDeviceOptions {
  langs: string[];
  processLocally: true;
  quality?: 'dictation';
}

interface RecognitionConstructor {
  new (): RecognitionLike;
  available?(options: OnDeviceOptions): Promise<Availability>;
  install?(options: OnDeviceOptions): Promise<boolean>;
}

export interface RecognitionCallbacks {
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (code: string) => void;
  onEnd: () => void;
}

export interface RecognitionSession {
  stop: () => void;
}

export type RecognitionStart = { kind: 'started'; session: RecognitionSession } | { kind: 'unsupported' };

function getConstructor(): RecognitionConstructor | null {
  const candidate = (window as Window & { SpeechRecognition?: RecognitionConstructor }).SpeechRecognition;
  return candidate?.available && candidate.install ? candidate : null;
}

/** Installs a browser language pack if needed, then begins strictly local dictation. */
export async function startOnDeviceRecognition(
  lang: string,
  callbacks: RecognitionCallbacks,
): Promise<RecognitionStart> {
  const Constructor = getConstructor();
  if (!Constructor?.available || !Constructor.install) return { kind: 'unsupported' };

  // Prefer the dictation-quality model, but don't require it: Chrome reports every language
  // as 'unavailable' for quality 'dictation' while its default on-device model is
  // 'downloadable', which made this tool say "unsupported" to every Chrome user.
  let options: OnDeviceOptions | null = null;
  let availability: Availability = 'unavailable';
  for (const candidate of [
    { langs: [lang], processLocally: true, quality: 'dictation' },
    { langs: [lang], processLocally: true },
  ] satisfies OnDeviceOptions[]) {
    try {
      availability = await Constructor.available(candidate);
    } catch {
      continue;
    }
    if (availability !== 'unavailable') {
      options = candidate;
      break;
    }
  }

  if (!options) return { kind: 'unsupported' };
  if (availability !== 'available') {
    try {
      if (!(await Constructor.install(options))) {
        return { kind: 'unsupported' };
      }
    } catch {
      return { kind: 'unsupported' };
    }
  }

  const recognition = new Constructor();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.processLocally = true;
  recognition.onresult = (event) => {
    const finalParts: string[] = [];
    const interimParts: string[] = [];
    for (let index = event.resultIndex; index < event.results.length; index++) {
      const result = event.results[index];
      if (result.isFinal) finalParts.push(result[0].transcript);
      else interimParts.push(result[0].transcript);
    }
    if (finalParts.length) callbacks.onFinal(finalParts.join(' '));
    callbacks.onInterim(interimParts.join(' '));
  };
  recognition.onerror = (event) => callbacks.onError(event.error);
  recognition.onend = callbacks.onEnd;

  try {
    recognition.start();
  } catch {
    return { kind: 'unsupported' };
  }
  return { kind: 'started', session: { stop: () => recognition.stop() } };
}

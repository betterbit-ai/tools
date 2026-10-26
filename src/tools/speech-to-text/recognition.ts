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
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface OnDeviceOptions {
  langs: string[];
  processLocally: true;
}

interface RecognitionConstructor {
  new (): RecognitionLike;
  available?(options: OnDeviceOptions): Promise<Availability>;
  install?(options: OnDeviceOptions): Promise<boolean>;
}

export interface RecognitionCallbacks {
  onStart: () => void;
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (code: string) => void;
  onEnd: () => void;
}

export interface RecognitionSession {
  stop: () => void;
}

export type RecognitionStart =
  | { kind: 'started'; session: RecognitionSession }
  | { kind: 'unsupported' }
  | { kind: 'failed'; error: string }
  | { kind: 'cancelled' };

function getConstructor(): RecognitionConstructor | null {
  const candidate = (window as Window & { SpeechRecognition?: RecognitionConstructor }).SpeechRecognition;
  return candidate?.available && candidate.install ? candidate : null;
}

function waitForBrowser<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'));

  return new Promise<T>((resolve, reject) => {
    const cancel = () => reject(new DOMException('Cancelled', 'AbortError'));
    signal.addEventListener('abort', cancel, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', cancel);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', cancel);
        reject(error);
      },
    );
  });
}

function errorCode(error: unknown): string {
  return error instanceof DOMException && error.name === 'NotAllowedError' ? 'not-allowed' : 'setup';
}

/** Installs a browser language pack if needed, then begins strictly local dictation. */
export async function startOnDeviceRecognition(
  lang: string,
  callbacks: RecognitionCallbacks,
  signal?: AbortSignal,
): Promise<RecognitionStart> {
  const Constructor = getConstructor();
  if (!Constructor?.available || !Constructor.install) return { kind: 'unsupported' };

  // Chrome shipped local language packs before the optional `quality` member. Supplying that
  // newer member can leave availability checks unresolved in otherwise supported versions, so
  // use the interoperable local-only option set.
  const options: OnDeviceOptions = { langs: [lang], processLocally: true };
  let availability: Availability;
  try {
    availability = await waitForBrowser(Constructor.available(options), signal);
  } catch (error) {
    if (signal?.aborted) return { kind: 'cancelled' };
    return { kind: 'failed', error: errorCode(error) };
  }

  if (signal?.aborted) return { kind: 'cancelled' };
  if (availability === 'unavailable') return { kind: 'unsupported' };
  if (availability !== 'available') {
    try {
      if (!(await waitForBrowser(Constructor.install(options), signal))) return { kind: 'failed', error: 'setup' };
    } catch (error) {
      if (signal?.aborted) return { kind: 'cancelled' };
      return { kind: 'failed', error: errorCode(error) };
    }
  }

  if (signal?.aborted) return { kind: 'cancelled' };

  try {
    const recognition = new Constructor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.processLocally = true;
    recognition.onstart = callbacks.onStart;
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
    recognition.start();
    return { kind: 'started', session: { stop: () => recognition.stop() } };
  } catch (error) {
    return { kind: 'failed', error: errorCode(error) };
  }
}

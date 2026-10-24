/** Browser-only qpdf WebAssembly integration. Loaded only after Protect is chosen. */
import { createQpdfRunner } from 'qpdf-run';
import { yieldToBrowser } from '../../lib/browser';
import { protectArgs } from './logic';

export type ProtectProgress = 'checking' | 'loading' | 'encrypting' | 'finishing';

export interface ProtectOptions {
  signal?: AbortSignal;
  onProgress?: (progress: ProtectProgress) => void;
}

export class ProtectPdfCancelledError extends Error {
  constructor() {
    super('PDF encryption was cancelled.');
    this.name = 'ProtectPdfCancelledError';
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ProtectPdfCancelledError();
}

type InspectResponse =
  { type: 'ready'; bytes: ArrayBuffer } | { type: 'encrypted' } | { type: 'invalid'; message: string };

/** Parse away from the interaction thread and transfer the source buffer instead of cloning it. */
function inspectPdf(bytes: Uint8Array, signal?: AbortSignal): Promise<Uint8Array> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./inspect.worker.ts', import.meta.url), { type: 'module' });
    const cleanUp = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      cleanUp();
      reject(new ProtectPdfCancelledError());
    };
    worker.onmessage = (event: MessageEvent<InspectResponse>) => {
      cleanUp();
      if (event.data.type === 'ready') {
        resolve(new Uint8Array(event.data.bytes));
      } else if (event.data.type === 'encrypted') {
        reject(new Error('PDF is encrypted and requires a password.'));
      } else {
        reject(new Error(`Not a PDF or damaged PDF: ${event.data.message}`));
      }
    };
    worker.onerror = () => {
      cleanUp();
      reject(new Error('PDF inspection failed.'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    const buffer =
      bytes.buffer instanceof ArrayBuffer && bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
        ? bytes.buffer
        : bytes.slice().buffer;
    worker.postMessage({ bytes: buffer }, [buffer]);
  });
}

function randomOwnerPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function protectPdf(
  bytes: Uint8Array,
  password: string,
  options: ProtectOptions = {},
): Promise<Uint8Array> {
  const { signal, onProgress } = options;
  throwIfAborted(signal);
  onProgress?.('checking');
  await yieldToBrowser();
  const inspectedBytes = await inspectPdf(bytes, signal);
  throwIfAborted(signal);
  onProgress?.('loading');
  await yieldToBrowser();
  throwIfAborted(signal);

  let qpdf: Awaited<ReturnType<typeof createQpdfRunner>> | null = null;
  let destroyed = false;
  const runnerPromise = createQpdfRunner({
    workerUrl: new URL('qpdf-run/worker', import.meta.url).href,
    qpdfJsUrl: new URL('qpdf-run/qpdf.js', import.meta.url).href,
    wasmUrl: new URL('qpdf-run/qpdf.wasm', import.meta.url).href,
    timeoutMs: 300_000,
  });

  const destroyRunner = async () => {
    if (destroyed) return;
    destroyed = true;
    const runner = qpdf ?? (await runnerPromise.catch(() => null));
    if (runner) await runner.destroy().catch(() => {});
  };
  let rejectAbort: ((reason: ProtectPdfCancelledError) => void) | null = null;
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  const onAbort = () => {
    void destroyRunner();
    rejectAbort?.(new ProtectPdfCancelledError());
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    qpdf = await Promise.race([runnerPromise, aborted]);
    throwIfAborted(signal);
    onProgress?.('encrypting');
    await yieldToBrowser();
    throwIfAborted(signal);

    const output = await Promise.race([
      qpdf.runOne({
        input: inspectedBytes,
        inputName: 'input.pdf',
        outputName: 'output.pdf',
        args: protectArgs(password, randomOwnerPassword()),
      }),
      aborted,
    ]);
    throwIfAborted(signal);
    onProgress?.('finishing');
    await yieldToBrowser();
    throwIfAborted(signal);
    return output;
  } finally {
    signal?.removeEventListener('abort', onAbort);
    await destroyRunner();
  }
}

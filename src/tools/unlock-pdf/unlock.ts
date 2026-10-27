/** Browser-only qpdf WebAssembly integration. Loaded only after Unlock is chosen. */
import { createQpdfRunner } from 'qpdf-run';
import { yieldToBrowser } from '../../lib/browser';
import { unlockArgs } from './logic';

export type UnlockProgress = 'checking' | 'loading' | 'decrypting' | 'finishing';

export interface UnlockOptions {
  signal?: AbortSignal;
  onProgress?: (progress: UnlockProgress) => void;
}

export class UnlockPdfCancelledError extends Error {
  constructor() {
    super('PDF unlocking was cancelled.');
    this.name = 'UnlockPdfCancelledError';
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new UnlockPdfCancelledError();
}

/**
 * qpdf's WebAssembly exception for a wrong password is an opaque number in some browsers.
 * PDF.js gives us stable password and damaged-file errors while parsing off the interaction
 * thread. getData() returns the source bytes after the PDF.js worker has accepted the password.
 */
async function validatePdfPassword(bytes: Uint8Array, password: string, signal?: AbortSignal): Promise<Uint8Array> {
  throwIfAborted(signal);
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
  const loadingTask = pdfjs.getDocument({ data: bytes, password });
  const abortLoading = () => void loadingTask.destroy();
  signal?.addEventListener('abort', abortLoading, { once: true });
  try {
    const pdf = await loadingTask.promise;
    throwIfAborted(signal);
    return await pdf.getData();
  } catch (caught) {
    throwIfAborted(signal);
    if (caught instanceof Error && caught.name === 'PasswordException') throw new Error('Invalid password');
    throw new Error('Not a PDF or damaged PDF');
  } finally {
    signal?.removeEventListener('abort', abortLoading);
    await loadingTask.destroy();
  }
}

export async function unlockPdf(bytes: Uint8Array, password: string, options: UnlockOptions = {}): Promise<Uint8Array> {
  const { signal, onProgress } = options;
  throwIfAborted(signal);
  onProgress?.('checking');
  await yieldToBrowser();
  const validatedBytes = await validatePdfPassword(bytes, password, signal);
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
  let rejectAbort: ((reason: UnlockPdfCancelledError) => void) | null = null;
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  const onAbort = () => {
    void destroyRunner();
    rejectAbort?.(new UnlockPdfCancelledError());
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    qpdf = await Promise.race([runnerPromise, aborted]);
    throwIfAborted(signal);
    onProgress?.('decrypting');
    await yieldToBrowser();
    throwIfAborted(signal);

    const output = await Promise.race([
      qpdf.runOne({
        input: validatedBytes,
        inputName: 'input.pdf',
        outputName: 'output.pdf',
        args: unlockArgs(password),
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

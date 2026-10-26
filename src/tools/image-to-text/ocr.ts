/** Browser-only OCR work. The worker, engine, and language files are all self-hosted in public/ocr. */
import type * as Tesseract from 'tesseract.js';
import type { OcrLanguage } from './logic';

export type OcrStage = 'starting' | 'model' | 'recognizing';

export interface OcrProgress {
  stage: OcrStage;
  percent: number;
}

function stageFromStatus(status: string): OcrStage {
  if (status === 'recognizing text') return 'recognizing';
  if (status === 'loading language traineddata') return 'model';
  return 'starting';
}

function abortError(): DOMException {
  return new DOMException('OCR was cancelled.', 'AbortError');
}

/**
 * Runs a recognition job in a disposable worker. Terminating after every image frees
 * the WASM heap; downloaded language data stays in the browser cache for future jobs.
 */
export async function recognizeImage(
  file: File,
  language: OcrLanguage,
  onProgress: (progress: OcrProgress) => void,
  signal?: AbortSignal,
): Promise<{ text: string; confidence: number }> {
  let worker: Tesseract.Worker | null = null;
  let aborted = signal?.aborted ?? false;
  const onAbort = () => {
    aborted = true;
    void worker?.terminate();
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const { createWorker } = await import('tesseract.js');
    if (aborted) throw abortError();
    worker = await createWorker(language, undefined, {
      workerPath: '/ocr/worker.min.js',
      corePath: '/ocr/core/tesseract-core-lstm.wasm.js',
      langPath: '/ocr/lang',
      logger: ({ status, progress }) =>
        onProgress({ stage: stageFromStatus(status), percent: Math.round(progress * 100) }),
    });
    if (aborted) throw abortError();
    const result = await worker.recognize(file);
    if (aborted) throw abortError();
    return { text: result.data.text, confidence: result.data.confidence };
  } finally {
    signal?.removeEventListener('abort', onAbort);
    await worker?.terminate().catch(() => undefined);
  }
}

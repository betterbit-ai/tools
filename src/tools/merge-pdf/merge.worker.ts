/// <reference lib="webworker" />

import {
  EncryptedPdfError,
  InvalidPdfError,
  mergePdfSequence,
  readPdfPageCount,
  type MergeInput,
  type MergeProgress,
} from './logic';

type MergeWorkerRequest = { type: 'inspect'; bytes: ArrayBuffer; fileName: string } | { type: 'merge'; files: File[] };

type MergeWorkerResult =
  | { type: 'inspected'; pageCount: number }
  | { type: 'progress'; progress: MergeProgress }
  | { type: 'complete'; bytes: ArrayBuffer }
  | { type: 'error'; error: 'encrypted' | 'invalid' | 'failed'; fileName?: string };

function reportError(caught: unknown): void {
  const error =
    caught instanceof EncryptedPdfError ? 'encrypted' : caught instanceof InvalidPdfError ? 'invalid' : 'failed';
  const fileName =
    caught instanceof EncryptedPdfError || caught instanceof InvalidPdfError ? caught.fileName : undefined;
  self.postMessage({ type: 'error', error, fileName } satisfies MergeWorkerResult);
}

self.onmessage = async (event: MessageEvent<MergeWorkerRequest>) => {
  const request = event.data;
  try {
    if (request.type === 'inspect') {
      const pageCount = await readPdfPageCount(new Uint8Array(request.bytes), request.fileName);
      self.postMessage({ type: 'inspected', pageCount } satisfies MergeWorkerResult);
      return;
    }

    const files = request.files;
    async function* inputs(): AsyncGenerator<MergeInput> {
      for (const file of files) {
        yield { bytes: new Uint8Array(await file.arrayBuffer()), fileName: file.name };
      }
    }
    const output = await mergePdfSequence(inputs(), {
      total: files.length,
      onProgress: (progress) => self.postMessage({ type: 'progress', progress } satisfies MergeWorkerResult),
    });
    const bytes = output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer;
    self.postMessage({ type: 'complete', bytes } satisfies MergeWorkerResult, { transfer: [bytes] });
  } catch (caught) {
    reportError(caught);
  }
};

/// <reference lib="webworker" />

import { EncryptedPdfError, InvalidPdfError } from './logic';
import { writeReorderedPdf } from './reorder-core';

interface ReorderWorkerRequest {
  bytes: ArrayBuffer;
  fileName: string;
  pageOrder: number[];
}

type ReorderWorkerResponse = { bytes: ArrayBuffer } | { error: 'encrypted' | 'invalid' | 'failed' };

self.onmessage = async (event: MessageEvent<ReorderWorkerRequest>) => {
  try {
    const output = await writeReorderedPdf(new Uint8Array(event.data.bytes), event.data.fileName, event.data.pageOrder);
    const bytes = output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer;
    self.postMessage({ bytes } satisfies ReorderWorkerResponse, { transfer: [bytes] });
  } catch (caught) {
    const error =
      caught instanceof EncryptedPdfError ? 'encrypted' : caught instanceof InvalidPdfError ? 'invalid' : 'failed';
    self.postMessage({ error } satisfies ReorderWorkerResponse);
  }
};

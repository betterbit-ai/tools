/// <reference lib="webworker" />

import { EncryptedPdfError, InvalidPdfError } from './logic';
import { writeDeletedPdf } from './delete-core';

interface DeleteWorkerRequest {
  bytes: ArrayBuffer;
  fileName: string;
  deletedPages: number[];
}

type DeleteWorkerResponse = { bytes: ArrayBuffer } | { error: 'encrypted' | 'invalid' | 'failed' };

self.onmessage = async (event: MessageEvent<DeleteWorkerRequest>) => {
  try {
    const output = await writeDeletedPdf(
      new Uint8Array(event.data.bytes),
      event.data.fileName,
      event.data.deletedPages,
    );
    const bytes = output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer;
    self.postMessage({ bytes } satisfies DeleteWorkerResponse, { transfer: [bytes] });
  } catch (caught) {
    const error =
      caught instanceof EncryptedPdfError ? 'encrypted' : caught instanceof InvalidPdfError ? 'invalid' : 'failed';
    self.postMessage({ error } satisfies DeleteWorkerResponse);
  }
};

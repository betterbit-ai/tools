/// <reference lib="webworker" />

import { EncryptedPdfError, InvalidPdfError, type Rotation } from './logic';
import { writeRotatedPdf } from './rotate-core';

interface RotateWorkerRequest {
  bytes: ArrayBuffer;
  fileName: string;
  rotations: Rotation[];
}

type RotateWorkerResponse = { bytes: ArrayBuffer } | { error: 'encrypted' | 'invalid' | 'failed' };

self.onmessage = async (event: MessageEvent<RotateWorkerRequest>) => {
  try {
    const output = await writeRotatedPdf(new Uint8Array(event.data.bytes), event.data.fileName, event.data.rotations);
    const bytes = output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer;
    self.postMessage({ bytes } satisfies RotateWorkerResponse, { transfer: [bytes] });
  } catch (caught) {
    const error =
      caught instanceof EncryptedPdfError ? 'encrypted' : caught instanceof InvalidPdfError ? 'invalid' : 'failed';
    self.postMessage({ error } satisfies RotateWorkerResponse);
  }
};

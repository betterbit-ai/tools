/// <reference lib="webworker" />

import { EncryptedPdfError, InvalidPdfError, type PdfRect } from './logic';
import { readPdfInfoCore, signPdfCore } from './sign-core';

type SignWorkerRequest =
  | { type: 'inspect'; bytes: ArrayBuffer; fileName: string }
  | {
      type: 'sign';
      bytes: ArrayBuffer;
      fileName: string;
      pngBytes: ArrayBuffer;
      pageIndex: number;
      rect: PdfRect;
    };

type SignWorkerResponse =
  | { type: 'info'; pageCount: number; pageSizes: { width: number; height: number }[] }
  | { type: 'signed'; bytes: ArrayBuffer }
  | { type: 'error'; error: 'encrypted' | 'invalid' | 'failed' };

self.onmessage = async (event: MessageEvent<SignWorkerRequest>) => {
  try {
    if (event.data.type === 'inspect') {
      const info = await readPdfInfoCore(new Uint8Array(event.data.bytes), event.data.fileName);
      self.postMessage({ type: 'info', ...info } satisfies SignWorkerResponse);
      return;
    }

    const output = await signPdfCore(
      new Uint8Array(event.data.bytes),
      event.data.fileName,
      new Uint8Array(event.data.pngBytes),
      event.data.pageIndex,
      event.data.rect,
    );
    const bytes = output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength) as ArrayBuffer;
    self.postMessage({ type: 'signed', bytes } satisfies SignWorkerResponse, { transfer: [bytes] });
  } catch (caught) {
    const error =
      caught instanceof EncryptedPdfError ? 'encrypted' : caught instanceof InvalidPdfError ? 'invalid' : 'failed';
    self.postMessage({ type: 'error', error } satisfies SignWorkerResponse);
  }
};

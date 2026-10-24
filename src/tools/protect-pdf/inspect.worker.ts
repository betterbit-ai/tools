/// <reference lib="webworker" />
import { EncryptedPDFError, PDFDocument } from 'pdf-lib';
import { isEncryptedPdfLoadFailure } from './logic';

type InspectRequest = { bytes: ArrayBuffer };
type InspectResponse =
  { type: 'ready'; bytes: ArrayBuffer } | { type: 'encrypted' } | { type: 'invalid'; message: string };

self.onmessage = async (event: MessageEvent<InspectRequest>) => {
  const bytes = event.data.bytes;
  try {
    await PDFDocument.load(bytes, { updateMetadata: false });
    const response: InspectResponse = { type: 'ready', bytes };
    self.postMessage(response, { transfer: [bytes] });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    // Bundlers can create a second copy of a library class across a worker boundary,
    // so retain the documented message check instead of relying only on instanceof.
    const encrypted = caught instanceof EncryptedPDFError || isEncryptedPdfLoadFailure(caught);
    const response: InspectResponse = encrypted ? { type: 'encrypted' } : { type: 'invalid', message };
    self.postMessage(response);
  }
};

import { base64ToBytes, bytesToBase64, type Base64DecodeError, type EncodeOptions } from './logic';

const MAX_ENCODE_BYTES = 8 * 1024 * 1024;
const MAX_DECODE_CHARS = 12 * 1024 * 1024;

type EncodeRequest = {
  id: number;
  mode: 'encode';
  bytes?: Uint8Array;
  text?: string;
  options: EncodeOptions;
};

type DecodeRequest = {
  id: number;
  mode: 'decode';
  input: string;
};

type ConversionRequest = EncodeRequest | DecodeRequest;

type WorkerError = Base64DecodeError | { code: 'input-too-large' };
type WorkerScope = { postMessage(message: unknown, transfer?: Transferable[]): void };

const workerScope = self as unknown as WorkerScope;

function postError(id: number, mode: ConversionRequest['mode'], error: WorkerError): void {
  workerScope.postMessage({ id, mode, ok: false, error });
}

self.addEventListener('message', (event: MessageEvent<ConversionRequest>) => {
  const request = event.data;

  if (request.mode === 'encode') {
    const bytes = request.bytes ?? new TextEncoder().encode(request.text ?? '');
    if (bytes.byteLength > MAX_ENCODE_BYTES) {
      postError(request.id, request.mode, { code: 'input-too-large' });
      return;
    }

    workerScope.postMessage({
      id: request.id,
      mode: request.mode,
      ok: true,
      bytesLength: bytes.byteLength,
      text: bytesToBase64(bytes, request.options),
    });
    return;
  }

  if (request.input.length > MAX_DECODE_CHARS) {
    postError(request.id, request.mode, { code: 'input-too-large' });
    return;
  }

  const decoded = base64ToBytes(request.input);
  if (!decoded.ok) {
    postError(request.id, request.mode, decoded.error);
    return;
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(decoded.bytes);
    workerScope.postMessage({ id: request.id, mode: request.mode, ok: true, bytes: decoded.bytes, text }, [
      decoded.bytes.buffer as ArrayBuffer,
    ]);
  } catch {
    workerScope.postMessage({ id: request.id, mode: request.mode, ok: true, bytes: decoded.bytes, text: null }, [
      decoded.bytes.buffer as ArrayBuffer,
    ]);
  }
});

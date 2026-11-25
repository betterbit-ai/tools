import { yieldToBrowser } from '../../lib/browser';
import {
  bytesToHex,
  createMd5,
  isWebCryptoAlgorithm,
  md5Final,
  md5Hex,
  md5Update,
  type HashAlgorithm,
  webCryptoName,
} from './logic';

/** Browser-only digest work. SHA algorithms use the platform Web Crypto implementation. */
export async function hashBytes(algorithm: HashAlgorithm, bytes: Uint8Array): Promise<string> {
  if (algorithm === 'md5') return md5Hex(bytes);
  if (!isWebCryptoAlgorithm(algorithm) || !globalThis.crypto?.subtle) {
    throw new Error('web-crypto-unavailable');
  }
  // Copy into an ArrayBuffer-backed view: Web Crypto intentionally excludes SharedArrayBuffer inputs.
  const digest = await globalThis.crypto.subtle.digest(webCryptoName(algorithm), new Uint8Array(bytes));
  return bytesToHex(new Uint8Array(digest));
}

export function hashText(algorithm: HashAlgorithm, text: string): Promise<string> {
  return hashBytes(algorithm, new TextEncoder().encode(text));
}

/** How much work MD5 does before handing the page back to the browser. */
const MD5_CHUNK_BYTES = 2 * 1024 * 1024;

/**
 * MD5 is ours, not the platform's, so it runs in chunks with a MessageChannel hop between them:
 * progress can paint, the tab stays responsive, the work continues in a background tab, and a
 * cancel request is honoured at the next chunk edge. Returns null when cancelled.
 */
async function md5Chunked(
  bytes: Uint8Array,
  onProgress: (fraction: number) => void,
  isCancelled: () => boolean,
): Promise<string | null> {
  const state = createMd5();
  if (bytes.length === 0) {
    onProgress(1);
    return bytesToHex(md5Final(state));
  }
  for (let offset = 0; offset < bytes.length; offset += MD5_CHUNK_BYTES) {
    if (isCancelled()) return null;
    md5Update(state, bytes.subarray(offset, Math.min(offset + MD5_CHUNK_BYTES, bytes.length)));
    onProgress(Math.min(1, (offset + MD5_CHUNK_BYTES) / bytes.length));
    await yieldToBrowser();
  }
  return bytesToHex(md5Final(state));
}

/** Hashes text bytes with progress. Web Crypto hashes SHA off the main thread and needs the whole buffer. */
export async function hashBytesWithProgress(
  algorithm: HashAlgorithm,
  bytes: Uint8Array,
  onProgress: (fraction: number) => void,
  isCancelled: () => boolean,
): Promise<string | null> {
  if (algorithm === 'md5') return md5Chunked(bytes, onProgress, isCancelled);
  if (isCancelled()) return null;
  const digest = await hashBytes(algorithm, bytes);
  onProgress(1);
  return isCancelled() ? null : digest;
}

/**
 * Hashes a File without loading all of it for MD5: the stream is read a chunk at a time, so a
 * 64 MB file never sits in memory twice and the page keeps painting. SHA has to buffer the file.
 */
export async function hashFileWithProgress(
  algorithm: HashAlgorithm,
  file: File,
  onProgress: (fraction: number) => void,
  isCancelled: () => boolean,
): Promise<string | null> {
  if (algorithm !== 'md5') {
    const buffer = await file.arrayBuffer();
    if (isCancelled()) return null;
    const digest = await hashBytes(algorithm, new Uint8Array(buffer));
    onProgress(1);
    return isCancelled() ? null : digest;
  }

  const state = createMd5();
  const reader = file.stream().getReader();
  let read = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (isCancelled()) {
        await reader.cancel().catch(() => {});
        return null;
      }
      if (done) break;
      md5Update(state, value);
      read += value.byteLength;
      onProgress(Math.min(1, read / Math.max(1, file.size)));
      await yieldToBrowser();
    }
  } finally {
    reader.releaseLock();
  }
  return bytesToHex(md5Final(state));
}

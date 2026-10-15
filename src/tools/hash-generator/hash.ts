import { bytesToHex, isWebCryptoAlgorithm, md5Hex, type HashAlgorithm, webCryptoName } from './logic';

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

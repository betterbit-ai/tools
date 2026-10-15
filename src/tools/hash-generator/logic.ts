/** Pure logic for hash-generator — no DOM, no Preact. */

export const HASH_ALGORITHMS = ['md5', 'sha-1', 'sha-256', 'sha-384', 'sha-512'] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

const WEB_CRYPTO_NAMES: Exclude<HashAlgorithm, 'md5'>[] = ['sha-1', 'sha-256', 'sha-384', 'sha-512'];

export function isWebCryptoAlgorithm(algorithm: HashAlgorithm): algorithm is Exclude<HashAlgorithm, 'md5'> {
  return WEB_CRYPTO_NAMES.includes(algorithm as Exclude<HashAlgorithm, 'md5'>);
}

export function webCryptoName(algorithm: Exclude<HashAlgorithm, 'md5'>): string {
  return algorithm.toUpperCase();
}

export function digestByteLength(algorithm: HashAlgorithm): number {
  switch (algorithm) {
    case 'md5':
      return 16;
    case 'sha-1':
      return 20;
    case 'sha-256':
      return 32;
    case 'sha-384':
      return 48;
    case 'sha-512':
      return 64;
  }
}

/** Converts raw bytes to the lowercase hexadecimal form used by common checksum tools. */
export function bytesToHex(bytes: Uint8Array): string {
  let value = '';
  for (const byte of bytes) value += byte.toString(16).padStart(2, '0');
  return value;
}

/**
 * Normalizes a digest copied from tools that add visual spaces or colon separators.
 * It deliberately leaves every other character intact so an invalid expected hash
 * cannot accidentally match.
 */
export function normalizeExpectedHash(value: string): string {
  return value.replace(/[\s:]/g, '').toLowerCase();
}

export function hashesMatch(actual: string, expected: string): boolean | null {
  const normalized = normalizeExpectedHash(expected);
  return normalized ? actual.toLowerCase() === normalized : null;
}

function rotateLeft(value: number, amount: number): number {
  return (value << amount) | (value >>> (32 - amount));
}

const MD5_SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4,
  11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
] as const;

const MD5_CONSTANTS = Array.from(
  { length: 64 },
  (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) >>> 0,
);

/**
 * RFC 1321 MD5 for legacy checksum compatibility. New security-sensitive work
 * must use a modern construction; this implementation only produces the digest.
 */
export function md5Bytes(input: Uint8Array): Uint8Array {
  const bitLength = input.length * 8;
  const paddedLength = Math.ceil((input.length + 9) / 64) * 64;
  const bytes = new Uint8Array(paddedLength);
  bytes.set(input);
  bytes[input.length] = 0x80;

  // RFC 1321 appends the message bit length as a little-endian 64-bit integer.
  const low = bitLength >>> 0;
  const high = Math.floor(bitLength / 2 ** 32) >>> 0;
  const lengthOffset = paddedLength - 8;
  for (let i = 0; i < 4; i++) {
    bytes[lengthOffset + i] = (low >>> (i * 8)) & 0xff;
    bytes[lengthOffset + 4 + i] = (high >>> (i * 8)) & 0xff;
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      const index = offset + i * 4;
      words[i] = bytes[index] | (bytes[index + 1] << 8) | (bytes[index + 2] << 16) | (bytes[index + 3] << 24);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const nextD = d;
      d = c;
      c = b;
      b = (b + rotateLeft((a + f + MD5_CONSTANTS[i] + words[g]) >>> 0, MD5_SHIFTS[i])) >>> 0;
      a = nextD;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const output = new Uint8Array(16);
  for (const [wordIndex, word] of [a0, b0, c0, d0].entries()) {
    for (let byte = 0; byte < 4; byte++) output[wordIndex * 4 + byte] = (word >>> (byte * 8)) & 0xff;
  }
  return output;
}

export function md5Hex(input: Uint8Array): string {
  return bytesToHex(md5Bytes(input));
}

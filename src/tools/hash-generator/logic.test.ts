import { describe, expect, it } from 'vitest';
import { bytesToHex, digestByteLength, hashesMatch, md5Hex, normalizeExpectedHash, webCryptoName } from './logic';

const encoder = new TextEncoder();

describe('MD5', () => {
  it('matches the RFC 1321 reference vectors, including an empty message', () => {
    expect(md5Hex(encoder.encode(''))).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5Hex(encoder.encode('a'))).toBe('0cc175b9c0f1b6a831c399e269772661');
    expect(md5Hex(encoder.encode('abc'))).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5Hex(encoder.encode('message digest'))).toBe('f96b697d7cb7938d525a2f31aaf161d0');
    expect(md5Hex(encoder.encode('abcdefghijklmnopqrstuvwxyz'))).toBe('c3fcd3d76192e4007dfb496cca67e13b');
  });

  it('handles padding boundaries and a large input deterministically', () => {
    expect(md5Hex(new Uint8Array(55))).toBe('c9ea3314b91c9fd4e38f9432064fd1f2');
    expect(md5Hex(new Uint8Array(56))).toBe('e3c4dd21a9171fd39d208efa09bf7883');
    expect(md5Hex(encoder.encode('x'.repeat(1_000_000)))).toBe('ec78dbd963d2fc01e51176ed4dec299e');
  });

  it('hashes UTF-8 bytes, including Korean, CJK and emoji', () => {
    expect(md5Hex(encoder.encode('안녕하세요'))).toBe('209bebae3eb7363d9b080a66f9e306ef');
    expect(md5Hex(encoder.encode('日本語テスト'))).toBe('f95716c1bda20a02d24c31e402d795d2');
    expect(md5Hex(encoder.encode('😀🚀'))).toBe('a16629c99e10d929e109c97f72384bf6');
  });
});

describe('digest helpers', () => {
  it('uses standard digest lengths and Web Crypto names', () => {
    expect(digestByteLength('md5')).toBe(16);
    expect(digestByteLength('sha-1')).toBe(20);
    expect(digestByteLength('sha-256')).toBe(32);
    expect(digestByteLength('sha-384')).toBe(48);
    expect(digestByteLength('sha-512')).toBe(64);
    expect(webCryptoName('sha-256')).toBe('SHA-256');
  });

  it('serializes arbitrary binary bytes as two lowercase hexadecimal characters each', () => {
    expect(bytesToHex(Uint8Array.from([0, 15, 16, 255]))).toBe('000f10ff');
  });

  it('compares copied hashes after harmless whitespace or colon formatting', () => {
    const hash = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
    expect(normalizeExpectedHash('2C:F2:4D:BA\n 5F:B0')).toBe('2cf24dba5fb0');
    expect(
      hashesMatch(
        hash,
        '2C:F2:4D:BA:5F:B0:A3:0E:26:E8:3B:2A:C5:B9:E2:9E:1B:16:1E:5C:1F:A7:42:5E:73:04:33:62:93:8B:98:24',
      ),
    ).toBe(true);
    expect(hashesMatch(hash, 'deadbeef')).toBe(false);
    expect(hashesMatch(hash, '  ')).toBeNull();
  });
});

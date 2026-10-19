import { describe, expect, it } from 'vitest';
import { cleanedName, detectImageFormat, inspectMetadata, isValidImage, privateName, stripMetadata } from './logic';

const jpeg = (...parts: number[][]) =>
  new Uint8Array([0xff, 0xd8, ...parts.flat(), 0xff, 0xda, 0, 2, 1, 2, 3, 0xff, 0xd9]);
const segment = (marker: number, data: number[]) => [0xff, marker, 0, data.length + 2, ...data];
const pngChunk = (type: string, body: number[]) => [
  0,
  0,
  0,
  body.length,
  ...type.split('').map((x) => x.charCodeAt(0)),
  ...body,
  0,
  0,
  0,
  0,
];

describe('metadata inspection', () => {
  it('recognizes supported image containers and rejects empty or truncated input', () => {
    expect(detectImageFormat(new Uint8Array())).toBe('unknown');
    expect(detectImageFormat(new Uint8Array([0xff, 0xd8]))).toBe('jpeg');
    expect(detectImageFormat(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))).toBe('png');
    expect(inspectMetadata(new Uint8Array([0xff]))).toEqual({ format: 'unknown', hasMetadata: false, tags: [] });
  });

  it('finds EXIF and comments in a JPEG without treating image scan data as metadata', () => {
    const image = jpeg(segment(0xe1, [69, 120, 105, 102, 0, 0, 73, 73]), segment(0xfe, [104, 105]));
    const summary = inspectMetadata(image);
    expect(summary.format).toBe('jpeg');
    expect(summary.hasMetadata).toBe(true);
  });

  it('removes JPEG metadata blocks while preserving its compressed scan bytes', () => {
    const image = jpeg(segment(0xe1, [69, 120, 105, 102, 0, 0, 73, 73]), segment(0xe0, [74, 70, 73, 70]));
    const cleaned = stripMetadata(image);
    expect(Array.from(cleaned)).toEqual([
      0xff,
      0xd8,
      ...segment(0xe0, [74, 70, 73, 70]),
      0xff,
      0xda,
      0,
      2,
      1,
      2,
      3,
      0xff,
      0xd9,
    ]);
    expect(inspectMetadata(cleaned).hasMetadata).toBe(false);
  });

  it('drops bytes appended after the JPEG end marker instead of copying a hidden payload', () => {
    const encoded = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2, 1, 2, 0xff, 0xd9]);
    const image = new Uint8Array([...encoded, ...new TextEncoder().encode('private trailing data')]);
    expect(isValidImage(image)).toBe(true);
    expect(stripMetadata(image)).toEqual(encoded);
  });

  it('removes textual PNG chunks and leaves binary image chunks untouched', () => {
    const image = new Uint8Array([
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
      ...pngChunk('tEXt', [75, 101, 121]),
      ...pngChunk('IDAT', [1, 2]),
      ...pngChunk('IEND', []),
    ]);
    expect(inspectMetadata(image).hasMetadata).toBe(true);
    const cleaned = stripMetadata(image);
    expect(inspectMetadata(cleaned).hasMetadata).toBe(false);
    expect(Array.from(cleaned)).toContain(73);
  });

  it('removes WebP metadata chunks and clears their VP8X presence flags', () => {
    const webpChunk = (type: string, body: number[]) => [
      ...new TextEncoder().encode(type),
      body.length,
      0,
      0,
      0,
      ...body,
      ...(body.length % 2 ? [0] : []),
    ];
    const body = [
      ...webpChunk('VP8X', [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      ...webpChunk('EXIF', [1, 2, 3, 4]),
      ...webpChunk('XMP ', [5, 6, 7, 8]),
    ];
    const image = new Uint8Array([
      ...new TextEncoder().encode('RIFF'),
      ...[body.length + 4, 0, 0, 0],
      ...new TextEncoder().encode('WEBP'),
      ...body,
    ]);

    expect(inspectMetadata(image).hasMetadata).toBe(true);
    const cleaned = stripMetadata(image);
    expect(inspectMetadata(cleaned).hasMetadata).toBe(false);
    expect(cleaned[20] & 0x0c).toBe(0);
    expect(cleaned.length).toBeLessThan(image.length);
  });
});

describe('container validation', () => {
  it('rejects signature-only and truncated supported containers before creating a clean copy', () => {
    expect(isValidImage(new Uint8Array([0xff, 0xd8]))).toBe(false);
    expect(isValidImage(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(false);
    expect(isValidImage(new TextEncoder().encode('RIFF\x04\0\0\0WEBP'))).toBe(false);

    const truncatedPng = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...pngChunk('IHDR', Array(12).fill(0))]);
    expect(isValidImage(truncatedPng)).toBe(false);
  });

  it('accepts bounded JPEG, PNG, and WebP containers', () => {
    const validJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2, 0xff, 0xd9]);
    const validPng = new Uint8Array([
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
      ...pngChunk('IHDR', Array(13).fill(0)),
      ...pngChunk('IEND', []),
    ]);
    const validWebp = new Uint8Array([
      ...new TextEncoder().encode('RIFF'),
      12,
      0,
      0,
      0,
      ...new TextEncoder().encode('WEBPVP8X'),
      0,
      0,
      0,
      0,
    ]);
    expect(isValidImage(validJpeg)).toBe(true);
    expect(isValidImage(validPng)).toBe(true);
    expect(isValidImage(validWebp)).toBe(true);
  });
});

describe('cleanedName', () => {
  it('keeps Korean, CJK, emoji, dots, and a safe empty fallback', () => {
    expect(cleanedName('여행.東京 📷.JPG')).toBe('여행.東京 📷-clean.jpg');
    expect(cleanedName('')).toBe('image-clean.jpg');
    expect(cleanedName('archive.tar.webp')).toBe('archive.tar-clean.webp');
  });

  it('can use a neutral, numbered name when the source filename is sensitive', () => {
    expect(privateName('home-address.東京 📷.JPEG', 3)).toBe('private-image-03.jpeg');
    expect(privateName('', 12)).toBe('private-image-12.jpg');
  });

  it('uses the detected format when a misleading extension would create the wrong file type', () => {
    expect(cleanedName('renamed.png', 'jpeg')).toBe('renamed-clean.jpg');
    expect(privateName('renamed.jpg', 1, 'png')).toBe('private-image-01.png');
    expect(privateName('renamed.jpg', 2, 'webp')).toBe('private-image-02.webp');
  });
});

import { describe, expect, it } from 'vitest';
import { cleanedName, detectImageFormat, inspectMetadata, stripMetadata } from './logic';

const jpeg = (...parts: number[][]) =>
  new Uint8Array([0xff, 0xd8, ...parts.flat(), 0xff, 0xda, 0, 8, 1, 2, 3, 0xff, 0xd9]);
const segment = (marker: number, data: number[]) => [0xff, marker, 0, data.length + 2, ...data];

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
      8,
      1,
      2,
      3,
      0xff,
      0xd9,
    ]);
    expect(inspectMetadata(cleaned).hasMetadata).toBe(false);
  });

  it('removes textual PNG chunks and leaves binary image chunks untouched', () => {
    const chunk = (type: string, body: number[]) => [
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
    const image = new Uint8Array([
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
      ...chunk('tEXt', [75, 101, 121]),
      ...chunk('IDAT', [1, 2]),
      ...chunk('IEND', []),
    ]);
    expect(inspectMetadata(image).hasMetadata).toBe(true);
    const cleaned = stripMetadata(image);
    expect(inspectMetadata(cleaned).hasMetadata).toBe(false);
    expect(Array.from(cleaned)).toContain(73);
  });
});

describe('cleanedName', () => {
  it('keeps Korean, CJK, emoji, dots, and a safe empty fallback', () => {
    expect(cleanedName('여행.東京 📷.JPG')).toBe('여행.東京 📷-clean.jpg');
    expect(cleanedName('')).toBe('image-clean.jpg');
    expect(cleanedName('archive.tar.webp')).toBe('archive.tar-clean.webp');
  });
});

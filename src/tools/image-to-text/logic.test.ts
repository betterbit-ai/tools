import { describe, expect, it } from 'vitest';
import {
  characterCount,
  extractedTextFileName,
  fileExceedsLimit,
  imageExceedsPixelLimit,
  isSupportedImage,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_PIXELS,
  normalizeOcrText,
} from './logic';

describe('image-to-text logic', () => {
  it('recognizes common OCR image types by MIME type or extension', () => {
    expect(isSupportedImage('scan.JPG', '')).toBe(true);
    expect(isSupportedImage('screenshot', 'image/png; charset=binary')).toBe(true);
    expect(isSupportedImage('note.webp', 'application/octet-stream')).toBe(true);
    expect(isSupportedImage('document.pdf', 'application/pdf')).toBe(false);
    expect(isSupportedImage('photo.heic', 'image/heic')).toBe(false);
  });

  it('enforces byte and pixel safety boundaries', () => {
    expect(fileExceedsLimit(1)).toBe(false);
    expect(fileExceedsLimit(MAX_IMAGE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_IMAGE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(0)).toBe(true);
    expect(fileExceedsLimit(Number.NaN)).toBe(true);
    expect(imageExceedsPixelLimit(6000, 4000)).toBe(false);
    expect(imageExceedsPixelLimit(MAX_IMAGE_PIXELS, 1)).toBe(false);
    expect(imageExceedsPixelLimit(MAX_IMAGE_PIXELS + 1, 1)).toBe(true);
    expect(imageExceedsPixelLimit(0, 100)).toBe(true);
  });

  it('keeps Korean, CJK and emoji text intact while normalizing OCR line endings', () => {
    expect(normalizeOcrText('  안녕하세요  \r\n漢字 😀\r\n\r\n')).toBe('안녕하세요\n漢字 😀');
    expect(characterCount('가😀漢')).toBe(3);
  });

  it('creates download filenames without allowing a path', () => {
    expect(extractedTextFileName('회의록.png')).toBe('회의록.txt');
    expect(extractedTextFileName('../receipt.JPG')).toBe('.._receipt.txt');
    expect(extractedTextFileName('   ')).toBe('image-text.txt');
  });
});

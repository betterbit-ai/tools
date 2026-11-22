import { describe, expect, it } from 'vitest';
import {
  EXPORT_PADDING,
  findInkBounds,
  fitTextSize,
  hasSignature,
  isSignatureBlank,
  MAX_SIGNATURE_TEXT_LENGTH,
  normalizePoint,
  normalizeSignatureText,
  paddedBounds,
  type Stroke,
} from './logic';

describe('normalizeSignatureText', () => {
  it('keeps Korean, CJK and emoji intact while making pasted text single-line', () => {
    expect(normalizeSignatureText('홍길동\n山田 太郎\t✍️')).toBe('홍길동 山田 太郎 ✍️');
  });

  it('caps by Unicode code point rather than splitting a surrogate pair', () => {
    const input = '✍'.repeat(MAX_SIGNATURE_TEXT_LENGTH + 1);
    expect(Array.from(normalizeSignatureText(input))).toHaveLength(MAX_SIGNATURE_TEXT_LENGTH);
  });

  it('accepts an empty value', () => {
    expect(normalizeSignatureText('')).toBe('');
  });
});

describe('signature readiness', () => {
  const drawn: Stroke[] = [
    [
      { x: 0.1, y: 0.2 },
      { x: 0.2, y: 0.3 },
    ],
  ];

  it('does not treat pointer taps as a visible drawn signature', () => {
    expect(isSignatureBlank([[{ x: 0.2, y: 0.3 }]])).toBe(true);
    expect(isSignatureBlank(drawn)).toBe(false);
  });

  it('uses only the active input mode', () => {
    expect(hasSignature('type', '   ', drawn)).toBe(false);
    expect(hasSignature('type', '홍길동', [])).toBe(true);
    expect(hasSignature('draw', 'Jane Doe', [])).toBe(false);
    expect(hasSignature('draw', '', drawn)).toBe(true);
  });
});

describe('normalizePoint', () => {
  it('maps event coordinates to a bounded ratio', () => {
    expect(normalizePoint(50, 25, 100, 50)).toEqual({ x: 0.5, y: 0.5 });
    expect(normalizePoint(-3, 200, 100, 50)).toEqual({ x: 0, y: 1 });
  });

  it('returns a safe point for zero or invalid dimensions', () => {
    expect(normalizePoint(10, 10, 0, 20)).toEqual({ x: 0, y: 0 });
    expect(normalizePoint(NaN, 10, 20, 20)).toEqual({ x: 0, y: 0 });
  });
});

describe('findInkBounds', () => {
  it('returns null for a fully transparent canvas', () => {
    expect(findInkBounds(new Uint8ClampedArray(4 * 3 * 4), 4, 3)).toBeNull();
  });

  it('finds alpha pixels at opposite canvas boundaries', () => {
    const pixels = new Uint8ClampedArray(4 * 3 * 4);
    pixels[3] = 255;
    pixels[(2 * 4 + 3) * 4 + 3] = 1;
    expect(findInkBounds(pixels, 4, 3)).toEqual({ left: 0, top: 0, right: 3, bottom: 2 });
  });

  it('rejects invalid sizes and incomplete buffers', () => {
    expect(findInkBounds(new Uint8ClampedArray(), 0, 1)).toBeNull();
    expect(findInkBounds(new Uint8ClampedArray(3), 1, 1)).toBeNull();
  });
});

describe('paddedBounds', () => {
  it('adds the export padding without overflowing the canvas', () => {
    expect(paddedBounds({ left: 2, top: 3, right: 7, bottom: 8 }, EXPORT_PADDING, 10, 10)).toEqual({
      left: 0,
      top: 0,
      right: 9,
      bottom: 9,
    });
  });

  it('treats invalid padding as zero', () => {
    expect(paddedBounds({ left: 2, top: 3, right: 7, bottom: 8 }, NaN, 10, 10)).toEqual({
      left: 2,
      top: 3,
      right: 7,
      bottom: 8,
    });
  });
});

describe('fitTextSize', () => {
  // A proportional-font stand-in: width grows with the character count and the size.
  const measureAt = (text: string, size: number) => [...text].length * size * 0.6;

  it('uses the full starting size when a short name already fits', () => {
    expect(fitTextSize('Alex', 1_056, 248, measureAt)).toBe(248);
  });

  it('shrinks a long Korean name until it fits inside both edges', () => {
    const name = '가'.repeat(MAX_SIGNATURE_TEXT_LENGTH);
    const size = fitTextSize(name, 1_056, 248, measureAt);
    expect(size).toBeLessThan(248);
    expect(measureAt(name, size)).toBeLessThanOrEqual(1_056);
    expect(size).toBeGreaterThanOrEqual(8);
  });

  it('bottoms out at the minimum size for text far past the 80-character input limit', () => {
    const text = 'x'.repeat(5_000);
    expect(fitTextSize(text, 1_056, 248, measureAt)).toBe(8);
  });

  it('falls back safely when the font cannot be measured', () => {
    expect(fitTextSize('가', 1_056, 248, () => 0)).toBe(248);
    expect(fitTextSize('가', 0, 248, measureAt)).toBe(8);
  });
});

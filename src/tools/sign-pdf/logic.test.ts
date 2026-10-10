import { describe, expect, it } from 'vitest';
import {
  clampPageNumber,
  clampPlacement,
  DEFAULT_PLACEMENT,
  dragPlacement,
  fileExceedsLimit,
  hasSignature,
  isPdfFile,
  isSignatureBlank,
  MAX_FILE_BYTES,
  MAX_WIDTH_RATIO,
  MIN_WIDTH_RATIO,
  NUDGE_STEP,
  nudgePlacement,
  pageCountExceedsLimit,
  placementToPdfRect,
  signedFileName,
  SIGNATURE_ASPECT,
  SIZE_PRESETS,
} from './logic';

describe('isPdfFile', () => {
  it('accepts the PDF mime type regardless of file name', () => {
    expect(isPdfFile('scan', 'application/pdf')).toBe(true);
  });

  it('accepts a .pdf extension when the mime type is empty (common for drag-and-drop)', () => {
    expect(isPdfFile('계약서.PDF', '')).toBe(true);
  });

  it('rejects other types', () => {
    expect(isPdfFile('notes.txt', 'text/plain')).toBe(false);
  });
});

describe('fileExceedsLimit', () => {
  it('allows a file right at the limit', () => {
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
  });

  it('rejects one byte over the limit', () => {
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
  });

  it('rejects negative or non-finite sizes', () => {
    expect(fileExceedsLimit(-1)).toBe(true);
    expect(fileExceedsLimit(NaN)).toBe(true);
  });
});

describe('pageCountExceedsLimit', () => {
  it('allows 1 and the max', () => {
    expect(pageCountExceedsLimit(1)).toBe(false);
  });

  it('rejects 0, negative and non-integers', () => {
    expect(pageCountExceedsLimit(0)).toBe(true);
    expect(pageCountExceedsLimit(-3)).toBe(true);
    expect(pageCountExceedsLimit(2.5)).toBe(true);
  });
});

describe('signedFileName', () => {
  it('appends _signed and strips a trailing .pdf', () => {
    expect(signedFileName('contract.pdf')).toBe('contract_signed.pdf');
  });

  it('is case-insensitive on the extension', () => {
    expect(signedFileName('Contract.PDF')).toBe('Contract_signed.pdf');
  });

  it('preserves unicode names', () => {
    expect(signedFileName('근로계약서.pdf')).toBe('근로계약서_signed.pdf');
  });

  it('falls back to "document" for an empty name', () => {
    expect(signedFileName('   ')).toBe('document_signed.pdf');
  });
});

describe('clampPageNumber', () => {
  it('defaults to the last page when the requested page is not an integer', () => {
    expect(clampPageNumber(NaN, 5)).toBe(5);
  });

  it('clamps below 1 up to 1', () => {
    expect(clampPageNumber(0, 5)).toBe(1);
  });

  it('clamps above pageCount down to pageCount', () => {
    expect(clampPageNumber(99, 5)).toBe(5);
  });

  it('returns 1 for a zero or negative page count', () => {
    expect(clampPageNumber(3, 0)).toBe(1);
  });
});

describe('clampPlacement', () => {
  it('leaves an already-valid placement unchanged', () => {
    expect(clampPlacement(DEFAULT_PLACEMENT)).toEqual(DEFAULT_PLACEMENT);
  });

  it('clamps widthRatio into [MIN_WIDTH_RATIO, MAX_WIDTH_RATIO]', () => {
    expect(clampPlacement({ xRatio: 0, yRatio: 0, widthRatio: 0.001 }).widthRatio).toBe(MIN_WIDTH_RATIO);
    expect(clampPlacement({ xRatio: 0, yRatio: 0, widthRatio: 5 }).widthRatio).toBe(MAX_WIDTH_RATIO);
  });

  it('keeps the box fully inside the page on the right/bottom edges', () => {
    const result = clampPlacement({ xRatio: 1.5, yRatio: 1.5, widthRatio: 0.3 });
    expect(result.xRatio).toBeCloseTo(1 - 0.3, 5);
    expect(result.yRatio).toBeCloseTo(1 - 0.3 * SIGNATURE_ASPECT, 5);
  });

  it('falls back to 0 for non-finite x/y', () => {
    const result = clampPlacement({ xRatio: NaN, yRatio: -Infinity, widthRatio: 0.3 });
    expect(result.xRatio).toBe(0);
    expect(result.yRatio).toBe(0);
  });
});

describe('dragPlacement', () => {
  it('converts a pixel delta into a ratio delta using the container size', () => {
    const moved = dragPlacement({ xRatio: 0.5, yRatio: 0.5, widthRatio: 0.3 }, 100, 50, 1000, 500);
    expect(moved.xRatio).toBeCloseTo(0.6, 5);
    expect(moved.yRatio).toBeCloseTo(0.6, 5);
  });

  it('is a no-op for a zero-size container (avoids divide-by-zero)', () => {
    const start = { xRatio: 0.5, yRatio: 0.5, widthRatio: 0.3 };
    expect(dragPlacement(start, 10, 10, 0, 0)).toEqual(start);
  });
});

describe('nudgePlacement', () => {
  it('moves by exactly one NUDGE_STEP per key press', () => {
    const start = { xRatio: 0.5, yRatio: 0.5, widthRatio: 0.3 };
    const right = nudgePlacement(start, 1, 0);
    expect(right.xRatio).toBeCloseTo(0.5 + NUDGE_STEP, 5);
    expect(right.yRatio).toBe(0.5);
  });

  it('does nothing when both deltas are 0', () => {
    const start = { xRatio: 0.5, yRatio: 0.5, widthRatio: 0.3 };
    expect(nudgePlacement(start, 0, 0)).toEqual(start);
  });
});

describe('placementToPdfRect', () => {
  it('converts top-left screen ratios into a bottom-left PDF-space rect', () => {
    // A4 in points: 595.28 x 841.89.
    const rect = placementToPdfRect({ xRatio: 0, yRatio: 0, widthRatio: 0.3 }, 600, 800);
    expect(rect.x).toBe(0);
    expect(rect.width).toBeCloseTo(180, 5);
    expect(rect.height).toBeCloseTo(180 * SIGNATURE_ASPECT, 5);
    // yRatio 0 means flush with the top, so the box's bottom edge is height-from-top.
    expect(rect.y).toBeCloseTo(800 - rect.height, 5);
  });

  it('returns an empty rect for a zero or non-finite page size instead of NaN/Infinity', () => {
    expect(placementToPdfRect(DEFAULT_PLACEMENT, 0, 800)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(placementToPdfRect(DEFAULT_PLACEMENT, NaN, 800)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('every size preset stays within MIN/MAX_WIDTH_RATIO', () => {
    for (const ratio of Object.values(SIZE_PRESETS)) {
      expect(ratio).toBeGreaterThanOrEqual(MIN_WIDTH_RATIO);
      expect(ratio).toBeLessThanOrEqual(MAX_WIDTH_RATIO);
    }
  });
});

describe('isSignatureBlank', () => {
  it('is blank with no strokes at all', () => {
    expect(isSignatureBlank([])).toBe(true);
  });

  it('is blank when every stroke is a single tap (no drag)', () => {
    expect(isSignatureBlank([[{ x: 1, y: 1 }], [{ x: 2, y: 2 }]])).toBe(true);
  });

  it('is not blank once a stroke has at least two points', () => {
    expect(
      isSignatureBlank([
        [{ x: 1, y: 1 }],
        [
          { x: 2, y: 2 },
          { x: 3, y: 3 },
        ],
      ]),
    ).toBe(false);
  });
});

describe('hasSignature', () => {
  it('draw mode depends only on the strokes, ignoring typed text', () => {
    expect(hasSignature('draw', [], 'ignored')).toBe(false);
    expect(
      hasSignature(
        'draw',
        [
          [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
        ],
        '',
      ),
    ).toBe(true);
  });

  it('type mode depends only on non-whitespace typed text', () => {
    expect(hasSignature('type', [], '   ')).toBe(false);
    expect(hasSignature('type', [], '홍길동')).toBe(true);
    expect(hasSignature('type', [], 'Jane Doe')).toBe(true);
  });
});

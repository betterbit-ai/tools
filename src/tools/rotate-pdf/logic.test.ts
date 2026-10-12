import { describe, expect, it } from 'vitest';
import {
  fileExceedsLimit,
  initialRotations,
  isPdfFile,
  MAX_FILE_BYTES,
  MAX_PAGE_COUNT,
  normalizeRotation,
  pageCountExceedsLimit,
  previewScale,
  previewRotation,
  rotateAll,
  rotateBy,
  rotatePage,
  rotatedPdfFileName,
} from './logic';
import { writeRotatedPdf } from './rotate';

describe('rotate-pdf', () => {
  it('normalizes PDF rotations into the four values allowed by the specification', () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(45)).toBe(0);
    expect(normalizeRotation(Number.NaN)).toBe(0);
  });

  it('turns one page clockwise or counter-clockwise without mutating the existing state', () => {
    const starting = [0, 90, 270] as const;
    expect(rotatePage([...starting], 1, -90)).toEqual([0, 0, 270]);
    expect(rotatePage([...starting], 2, 90)).toEqual([0, 90, 0]);
    expect(starting).toEqual([0, 90, 270]);
    expect(rotatePage([...starting], 99, 90)).toEqual([...starting]);
    expect(rotateBy(270, 90)).toBe(0);
    expect(previewRotation(0, 90)).toBe(270);
    expect(previewRotation(180, 90)).toBe(90);
  });

  it('applies a batch turn and can reset a document at the supported boundaries', () => {
    expect(rotateAll([0, 90, 180], 180)).toEqual([180, 270, 0]);
    expect(initialRotations(1)).toEqual([0]);
    expect(initialRotations(MAX_PAGE_COUNT)).toHaveLength(MAX_PAGE_COUNT);
    expect(initialRotations(0)).toEqual([]);
    expect(initialRotations(MAX_PAGE_COUNT + 1)).toEqual([]);
  });

  it('recognizes PDF files and enforces finite browser-safety limits', () => {
    expect(isPdfFile('보고서.PDF', '')).toBe(true);
    expect(isPdfFile('scan', 'application/pdf')).toBe(true);
    expect(isPdfFile('scan.pdf.exe', '')).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(Number.POSITIVE_INFINITY)).toBe(true);
    expect(pageCountExceedsLimit(1)).toBe(false);
    expect(pageCountExceedsLimit(MAX_PAGE_COUNT + 1)).toBe(true);
  });

  it('caps previews and preserves Unicode in downloaded file names', () => {
    expect(previewScale(612, 792)).toBe(0.25);
    expect(previewScale(100_000, 100_000)).toBeLessThan(0.25);
    expect(previewScale(0, 792)).toBe(0);
    expect(rotatedPdfFileName(' 계약서.résumé 📄.PDF ')).toBe('계약서.résumé 📄_rotated.pdf');
    expect(rotatedPdfFileName('')).toBe('document_rotated.pdf');
  });

  it('writes each requested page rotation without rasterizing the PDF', async () => {
    const { PDFDocument, degrees } = await import('pdf-lib');
    const source = await PDFDocument.create();
    source.addPage([612, 792]);
    const second = source.addPage([612, 792]);
    second.setRotation(degrees(90));

    const output = await writeRotatedPdf(await source.save(), '계약서.pdf', [180, 0]);
    const rotated = await PDFDocument.load(output);
    expect(rotated.getPageCount()).toBe(2);
    expect(rotated.getPage(0).getRotation().angle).toBe(180);
    expect(rotated.getPage(1).getRotation().angle).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { buildPdf, computePageLayout, type PdfOptions, type PdfPageInput } from './logic';

// Minimal valid JPEG byte sequence (SOI + EOI). buildPdf never decodes it, just embeds it.
const FAKE_JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);

// A real text decoder (even "latin1"/"windows-1252") remaps bytes 0x80-0x9F to
// different code points, which would break byte-offset <-> string-index assumptions
// below. Map each byte 1:1 to its code unit instead, mirroring logic.ts's `str()`.
function layoutOf(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

describe('computePageLayout', () => {
  it('fit mode: page exactly matches the image, no margin, no scaling', () => {
    const l = computePageLayout(800, 600, { pageSize: 'fit', orientation: 'auto', margin: 'none' });
    expect(l).toEqual({ pageWidth: 800, pageHeight: 600, drawX: 0, drawY: 0, drawWidth: 800, drawHeight: 600 });
  });

  it('fit mode ignores margin setting', () => {
    const l = computePageLayout(800, 600, { pageSize: 'fit', orientation: 'auto', margin: 'small' });
    expect(l.pageWidth).toBe(800);
    expect(l.pageHeight).toBe(600);
  });

  it('a4 portrait: landscape image on auto orientation gets a landscape page', () => {
    const l = computePageLayout(2000, 1000, { pageSize: 'a4', orientation: 'auto', margin: 'none' });
    expect(l.pageWidth).toBeGreaterThan(l.pageHeight); // landscape page
    expect(l.pageWidth).toBeCloseTo(841.89, 1);
    expect(l.pageHeight).toBeCloseTo(595.28, 1);
  });

  it('a4 portrait: tall image on auto orientation gets a portrait page', () => {
    const l = computePageLayout(1000, 2000, { pageSize: 'a4', orientation: 'auto', margin: 'none' });
    expect(l.pageHeight).toBeGreaterThan(l.pageWidth);
  });

  it('orientation can be forced against the image aspect ratio', () => {
    const l = computePageLayout(2000, 1000, { pageSize: 'a4', orientation: 'portrait', margin: 'none' });
    expect(l.pageHeight).toBeGreaterThan(l.pageWidth);
  });

  it('letter size matches 8.5x11in in points', () => {
    const l = computePageLayout(100, 200, { pageSize: 'letter', orientation: 'portrait', margin: 'none' });
    expect(l.pageWidth).toBeCloseTo(612, 1);
    expect(l.pageHeight).toBeCloseTo(792, 1);
  });

  it('image is scaled down to fit within the page, preserving aspect ratio', () => {
    // 4000x3000 (4:3) into A4 portrait (595.28 x 841.89): width-constrained.
    const l = computePageLayout(4000, 3000, { pageSize: 'a4', orientation: 'portrait', margin: 'none' });
    expect(l.drawWidth / l.drawHeight).toBeCloseTo(4000 / 3000, 3);
    expect(l.drawWidth).toBeCloseTo(l.pageWidth, 1);
    expect(l.drawHeight).toBeLessThanOrEqual(l.pageHeight + 0.01);
  });

  it('image is upscaled to fill the page when smaller than it', () => {
    const l = computePageLayout(100, 100, { pageSize: 'a4', orientation: 'portrait', margin: 'none' });
    expect(l.drawWidth).toBeCloseTo(l.pageWidth, 1);
  });

  it('drawing rect is centered on the page', () => {
    const l = computePageLayout(100, 100, { pageSize: 'a4', orientation: 'portrait', margin: 'none' });
    expect(l.drawX).toBeCloseTo((l.pageWidth - l.drawWidth) / 2, 2);
    expect(l.drawY).toBeCloseTo((l.pageHeight - l.drawHeight) / 2, 2);
  });

  it('margin shrinks the drawable area on both axes', () => {
    const none = computePageLayout(1000, 1000, { pageSize: 'a4', orientation: 'portrait', margin: 'none' });
    const small = computePageLayout(1000, 1000, { pageSize: 'a4', orientation: 'portrait', margin: 'small' });
    expect(small.drawWidth).toBeLessThan(none.drawWidth);
    expect(small.drawX).toBeGreaterThan(none.drawX);
  });

  it('fit mode scales down a page that would exceed common PDF viewer size limits', () => {
    const l = computePageLayout(20000, 10000, { pageSize: 'fit', orientation: 'auto', margin: 'none' });
    expect(l.pageWidth).toBeLessThanOrEqual(14400);
    expect(l.pageHeight).toBeLessThanOrEqual(14400);
    expect(l.pageWidth / l.pageHeight).toBeCloseTo(2, 3);
    expect(l.drawWidth).toBeCloseTo(l.pageWidth, 1);
  });

  it('degenerate 0-size image is clamped to 1px rather than producing NaN', () => {
    const l = computePageLayout(0, 0, { pageSize: 'fit', orientation: 'auto', margin: 'none' });
    expect(Number.isFinite(l.pageWidth)).toBe(true);
    expect(Number.isFinite(l.pageHeight)).toBe(true);
    expect(l.pageWidth).toBeGreaterThan(0);
    expect(l.pageHeight).toBeGreaterThan(0);
  });
});

function page(layout: ReturnType<typeof computePageLayout>, widthPx = 10, heightPx = 10): PdfPageInput {
  return { jpeg: FAKE_JPEG, widthPx, heightPx, layout };
}

describe('buildPdf', () => {
  const opts: PdfOptions = { pageSize: 'fit', orientation: 'auto', margin: 'none' };

  it('throws for an empty page list', () => {
    expect(() => buildPdf([])).toThrow();
  });

  it('produces a well-formed single-page PDF', () => {
    const bytes = buildPdf([page(computePageLayout(800, 600, opts))]);
    const text = layoutOf(bytes);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.trim().endsWith('%%EOF')).toBe(true);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/Type /Pages');
    expect(text).toContain('/Filter /DCTDecode');
    // One page object (not counting the /Type /Pages node itself).
    expect(text.match(/\/Type\s*\/Page(?!s)/g)).toHaveLength(1);
  });

  it('includes one page object per input image, in order', () => {
    const bytes = buildPdf([
      page(computePageLayout(100, 100, opts), 100, 100),
      page(computePageLayout(200, 100, opts), 200, 100),
      page(computePageLayout(100, 200, opts), 100, 200),
    ]);
    const text = layoutOf(bytes);
    expect(text.match(/\/Type\s*\/Page(?!s)/g)).toHaveLength(3);
    expect(text).toContain('/Count 3');
    // MediaBox widths appear in the same order the pages were given.
    const widths = [...text.matchAll(/\/MediaBox \[0 0 ([\d.]+) /g)].map((m) => Number(m[1]));
    expect(widths).toEqual([100, 200, 100]);
  });

  it('every xref offset points exactly at "N 0 obj"', () => {
    const bytes = buildPdf([page(computePageLayout(100, 100, opts)), page(computePageLayout(50, 80, opts), 50, 80)]);
    const text = layoutOf(bytes);
    const xrefMatch = text.match(/xref\n0 (\d+)\n([\s\S]*?)trailer/);
    expect(xrefMatch).not.toBeNull();
    const [, countStr, body] = xrefMatch!;
    const count = Number(countStr);
    const lines = body.trim().split('\n');
    expect(lines).toHaveLength(count);
    for (let objNum = 1; objNum < count; objNum++) {
      const offset = Number(lines[objNum].slice(0, 10));
      expect(text.slice(offset, offset + String(objNum).length + 6)).toBe(`${objNum} 0 obj`);
    }
  });

  it('embeds the exact JPEG bytes given, unmodified', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0x00, 0x11, 0x22, 0xff, 0xd9]);
    const bytes = buildPdf([{ jpeg, widthPx: 10, heightPx: 10, layout: computePageLayout(10, 10, opts) }]);
    let found = -1;
    for (let i = 0; i <= bytes.length - jpeg.length; i++) {
      if (bytes.slice(i, i + jpeg.length).every((b, j) => b === jpeg[j])) {
        found = i;
        break;
      }
    }
    expect(found).toBeGreaterThanOrEqual(0);
  });
});

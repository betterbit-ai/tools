import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { EncryptedPdfError, InvalidPdfError, mergePdfs, readPdfPageCount, totalPageCount } from './logic';

/** Builds a throwaway PDF with `pageCount` blank pages, optionally with a title (unicode-safe). */
async function makePdf(pageCount: number, title?: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  if (title) doc.setTitle(title);
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 200]);
  // pdf-lib's save() otherwise injects a blank page into an empty document, which would
  // defeat the zero-page fixtures below.
  return doc.save({ addDefaultPage: false });
}

describe('readPdfPageCount', () => {
  it('reports the page count of a valid PDF', async () => {
    const bytes = await makePdf(3);
    expect(await readPdfPageCount(bytes, 'a.pdf')).toBe(3);
  });

  it('reports 0 for a PDF with no pages', async () => {
    const bytes = await makePdf(0);
    expect(await readPdfPageCount(bytes, 'empty.pdf')).toBe(0);
  });

  it('throws InvalidPdfError for bytes that are not a PDF', async () => {
    const garbage = new Uint8Array([1, 2, 3, 4, 5]);
    await expect(readPdfPageCount(garbage, '제목.txt')).rejects.toThrow(InvalidPdfError);
  });

  it('throws InvalidPdfError for an empty file', async () => {
    await expect(readPdfPageCount(new Uint8Array(0), 'blank.pdf')).rejects.toThrow(InvalidPdfError);
  });

  it('includes the file name in the error message', async () => {
    const garbage = new Uint8Array([1, 2, 3]);
    await expect(readPdfPageCount(garbage, '보고서.pdf')).rejects.toThrow(/보고서\.pdf/);
  });
});

describe('mergePdfs', () => {
  it('throws for an empty file list', async () => {
    await expect(mergePdfs([])).rejects.toThrow();
  });

  it('merges a single file into an equivalent PDF', async () => {
    const bytes = await makePdf(2);
    const result = await mergePdfs([{ bytes, fileName: 'a.pdf' }]);
    const doc = await PDFDocument.load(result);
    expect(doc.getPageCount()).toBe(2);
  });

  it('concatenates pages from multiple files, in the given order', async () => {
    const a = await makePdf(2);
    const b = await makePdf(3);
    const c = await makePdf(1);
    const result = await mergePdfs([
      { bytes: a, fileName: 'a.pdf' },
      { bytes: b, fileName: 'b.pdf' },
      { bytes: c, fileName: 'c.pdf' },
    ]);
    const doc = await PDFDocument.load(result);
    expect(doc.getPageCount()).toBe(6);
  });

  it('reordering the input list reorders the output pages', async () => {
    // Give each source document a distinct page size so we can tell pages apart after merging.
    const small = await PDFDocument.create();
    small.addPage([100, 100]);
    const big = await PDFDocument.create();
    big.addPage([400, 400]);

    const forward = await mergePdfs([
      { bytes: await small.save(), fileName: 'small.pdf' },
      { bytes: await big.save(), fileName: 'big.pdf' },
    ]);
    const forwardDoc = await PDFDocument.load(forward);
    expect(forwardDoc.getPage(0).getWidth()).toBe(100);
    expect(forwardDoc.getPage(1).getWidth()).toBe(400);

    const reversed = await mergePdfs([
      { bytes: await big.save(), fileName: 'big.pdf' },
      { bytes: await small.save(), fileName: 'small.pdf' },
    ]);
    const reversedDoc = await PDFDocument.load(reversed);
    expect(reversedDoc.getPage(0).getWidth()).toBe(400);
    expect(reversedDoc.getPage(1).getWidth()).toBe(100);
  });

  it('skips files with zero pages without error', async () => {
    const empty = await makePdf(0);
    const one = await makePdf(1);
    const result = await mergePdfs([
      { bytes: empty, fileName: 'empty.pdf' },
      { bytes: one, fileName: 'one.pdf' },
    ]);
    const doc = await PDFDocument.load(result);
    expect(doc.getPageCount()).toBe(1);
  });

  it('throws InvalidPdfError naming the offending file when one file is not a PDF', async () => {
    const valid = await makePdf(1);
    const garbage = new Uint8Array([9, 9, 9]);
    await expect(
      mergePdfs([
        { bytes: valid, fileName: 'good.pdf' },
        { bytes: garbage, fileName: '손상된파일.pdf' },
      ]),
    ).rejects.toThrow(/손상된파일\.pdf/);
  });

  it('preserves unicode document titles through the merge', async () => {
    const bytes = await makePdf(1, '여행 계획 & résumé 📄');
    const result = await mergePdfs([{ bytes, fileName: 'a.pdf' }]);
    const doc = await PDFDocument.load(result);
    expect(doc.getPageCount()).toBe(1);
  });
});

describe('totalPageCount', () => {
  it('sums page counts', () => {
    expect(totalPageCount([1, 2, 3])).toBe(6);
  });

  it('returns 0 for an empty list', () => {
    expect(totalPageCount([])).toBe(0);
  });
});

describe('error classes', () => {
  it('EncryptedPdfError and InvalidPdfError carry distinct names', () => {
    expect(new EncryptedPdfError('a.pdf').name).toBe('EncryptedPdfError');
    expect(new InvalidPdfError('a.pdf').name).toBe('InvalidPdfError');
  });
});

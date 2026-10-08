import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  chunkPages,
  EncryptedPdfError,
  InvalidPdfError,
  parseRangeSpec,
  RangeOutOfBoundsError,
  RangeSyntaxError,
  readPdfPageCount,
  splitPdf,
  tokensToPageGroups,
  tokensToRangeGroups,
} from './logic';

/** Builds a throwaway PDF with `pageCount` pages, each a distinct width so pages are distinguishable. */
async function makePdf(pageCount: number, title?: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  if (title) doc.setTitle(title);
  for (let i = 0; i < pageCount; i++) doc.addPage([100 + i, 100]);
  return doc.save({ addDefaultPage: false });
}

describe('readPdfPageCount', () => {
  it('reports the page count of a valid PDF', async () => {
    expect(await readPdfPageCount(await makePdf(5), 'a.pdf')).toBe(5);
  });

  it('throws InvalidPdfError for bytes that are not a PDF', async () => {
    await expect(readPdfPageCount(new Uint8Array([1, 2, 3]), '제목.txt')).rejects.toThrow(InvalidPdfError);
  });
});

describe('parseRangeSpec', () => {
  it('parses a single page as a one-element range', () => {
    expect(parseRangeSpec('5', 10)).toEqual([{ start: 5, end: 5 }]);
  });

  it('parses a dash range', () => {
    expect(parseRangeSpec('2-4', 10)).toEqual([{ start: 2, end: 4 }]);
  });

  it('parses multiple comma-separated tokens, ignoring surrounding whitespace', () => {
    expect(parseRangeSpec(' 1-3 , 5 , 8-10 ', 10)).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 8, end: 10 },
    ]);
  });

  it('normalizes a reversed range (5-3 becomes 3-5)', () => {
    expect(parseRangeSpec('5-3', 10)).toEqual([{ start: 3, end: 5 }]);
  });

  it('accepts the full-document range at both boundaries', () => {
    expect(parseRangeSpec('1-10', 10)).toEqual([{ start: 1, end: 10 }]);
  });

  it('ignores trailing empty tokens from a trailing comma', () => {
    expect(parseRangeSpec('1-3,', 10)).toEqual([{ start: 1, end: 3 }]);
  });

  it('throws RangeSyntaxError for an empty spec', () => {
    expect(() => parseRangeSpec('', 10)).toThrow(RangeSyntaxError);
    expect(() => parseRangeSpec('   ', 10)).toThrow(RangeSyntaxError);
  });

  it('throws RangeSyntaxError for non-numeric tokens', () => {
    expect(() => parseRangeSpec('abc', 10)).toThrow(RangeSyntaxError);
    expect(() => parseRangeSpec('1-x', 10)).toThrow(RangeSyntaxError);
    expect(() => parseRangeSpec('1~3', 10)).toThrow(RangeSyntaxError);
  });

  it('throws RangeOutOfBoundsError for page 0', () => {
    expect(() => parseRangeSpec('0', 10)).toThrow(RangeOutOfBoundsError);
  });

  it('throws RangeOutOfBoundsError for a page beyond the document', () => {
    expect(() => parseRangeSpec('11', 10)).toThrow(RangeOutOfBoundsError);
    expect(() => parseRangeSpec('5-11', 10)).toThrow(RangeOutOfBoundsError);
  });
});

describe('tokensToRangeGroups', () => {
  it('expands each token into one ascending group', () => {
    expect(tokensToRangeGroups([{ start: 2, end: 4 }])).toEqual([[2, 3, 4]]);
  });

  it('keeps one group per token, in order', () => {
    expect(
      tokensToRangeGroups([
        { start: 1, end: 1 },
        { start: 5, end: 7 },
      ]),
    ).toEqual([[1], [5, 6, 7]]);
  });
});

describe('tokensToPageGroups', () => {
  it('splits each token into single-page groups', () => {
    expect(tokensToPageGroups([{ start: 2, end: 4 }])).toEqual([[2], [3], [4]]);
  });

  it('flattens multiple tokens into a flat list of single-page groups', () => {
    expect(
      tokensToPageGroups([
        { start: 1, end: 1 },
        { start: 5, end: 6 },
      ]),
    ).toEqual([[1], [5], [6]]);
  });
});

describe('chunkPages', () => {
  it('splits into equal chunks when the page count divides evenly', () => {
    expect(chunkPages(6, 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it('puts the remainder in a shorter final chunk', () => {
    expect(chunkPages(5, 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns one chunk per page when size is 1', () => {
    expect(chunkPages(3, 1)).toEqual([[1], [2], [3]]);
  });

  it('returns a single chunk when size exceeds the page count', () => {
    expect(chunkPages(3, 10)).toEqual([[1, 2, 3]]);
  });

  it('returns no chunks for a zero-page document', () => {
    expect(chunkPages(0, 3)).toEqual([]);
  });

  it('throws for a chunk size below 1', () => {
    expect(() => chunkPages(5, 0)).toThrow();
  });
});

describe('splitPdf', () => {
  it('throws for an empty group list', async () => {
    await expect(splitPdf(await makePdf(3), 'a.pdf', [])).rejects.toThrow();
  });

  it('produces one output file per group, each with the right page count', async () => {
    const bytes = await makePdf(6);
    const results = await splitPdf(bytes, 'doc.pdf', [[1, 2], [3], [4, 5, 6]]);
    expect(results.map((r) => r.name)).toEqual(['doc_p1-2.pdf', 'doc_p3.pdf', 'doc_p4-6.pdf']);
    for (const [i, r] of results.entries()) {
      const doc = await PDFDocument.load(r.bytes);
      expect(doc.getPageCount()).toBe([2, 1, 3][i]);
    }
  });

  it('preserves page order and identity within a group', async () => {
    const bytes = await makePdf(5); // pages have widths 100..104
    const [result] = await splitPdf(bytes, 'doc.pdf', [[3, 1]]);
    const doc = await PDFDocument.load(result.bytes);
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getPage(0).getWidth()).toBe(102); // page 3 -> index 2
    expect(doc.getPage(1).getWidth()).toBe(100); // page 1 -> index 0
  });

  it('strips the .pdf extension from the source file name, case-insensitively', async () => {
    const bytes = await makePdf(2);
    const results = await splitPdf(bytes, '보고서.PDF', [[1], [2]]);
    expect(results.map((r) => r.name)).toEqual(['보고서_p1.pdf', '보고서_p2.pdf']);
  });

  it('skips empty groups without producing an output for them', async () => {
    const bytes = await makePdf(2);
    const results = await splitPdf(bytes, 'doc.pdf', [[1], [], [2]]);
    expect(results.map((r) => r.name)).toEqual(['doc_p1.pdf', 'doc_p2.pdf']);
  });

  it('throws InvalidPdfError naming the file for unreadable bytes', async () => {
    await expect(splitPdf(new Uint8Array([9, 9, 9]), '손상된파일.pdf', [[1]])).rejects.toThrow(/손상된파일\.pdf/);
  });

  it('preserves a unicode document title through the split', async () => {
    const bytes = await makePdf(2, '여행 계획 & résumé 📄');
    const [result] = await splitPdf(bytes, 'a.pdf', [[1, 2]]);
    const doc = await PDFDocument.load(result.bytes);
    expect(doc.getPageCount()).toBe(2);
  });
});

describe('error classes', () => {
  it('carry distinct names', () => {
    expect(new EncryptedPdfError('a.pdf').name).toBe('EncryptedPdfError');
    expect(new InvalidPdfError('a.pdf').name).toBe('InvalidPdfError');
    expect(new RangeSyntaxError('x').name).toBe('RangeSyntaxError');
    expect(new RangeOutOfBoundsError(5, 3).name).toBe('RangeOutOfBoundsError');
  });

  it('expose structured fields so the UI can localize the message', () => {
    expect(new RangeSyntaxError('abc').part).toBe('abc');
    const bounds = new RangeOutOfBoundsError(11, 10);
    expect(bounds.page).toBe(11);
    expect(bounds.pageCount).toBe(10);
  });
});

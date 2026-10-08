/**
 * PDF split logic. pdf-lib has no DOM dependency, so this runs identically in
 * the browser and under Vitest — only the import itself is lazy, to keep the
 * ~500KB library out of the tool's initial JS bundle (loaded on first file drop).
 */

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
    this.name = 'InvalidPdfError';
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and can't be split.`);
    this.name = 'EncryptedPdfError';
  }
}

export class RangeSyntaxError extends Error {
  constructor(public readonly part: string) {
    super(`"${part}" isn't a valid page or range.`);
    this.name = 'RangeSyntaxError';
  }
}

export class RangeOutOfBoundsError extends Error {
  constructor(
    public readonly page: number,
    public readonly pageCount: number,
  ) {
    super(`Page ${page} is out of range (1–${pageCount}).`);
    this.name = 'RangeOutOfBoundsError';
  }
}

async function loadPdfLib() {
  return import('pdf-lib');
}

/** Parses a PDF far enough to report its page count, without modifying it. */
export async function readPdfPageCount(bytes: Uint8Array, fileName: string): Promise<number> {
  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  try {
    const doc = await PDFDocument.load(bytes);
    return doc.getPageCount();
  } catch (err) {
    if (err instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }
}

/** A single comma-separated token, normalized to an ascending 1-based [start, end] span. */
export interface RangeToken {
  start: number;
  end: number;
}

/**
 * Parses a user-typed range spec like "1-3, 5, 8-10" into normalized tokens.
 * Whitespace around commas/dashes is ignored; "5-3" is treated as "3-5".
 * Throws RangeSyntaxError for unparseable tokens and RangeOutOfBoundsError
 * for pages outside [1, pageCount].
 */
export function parseRangeSpec(input: string, pageCount: number): RangeToken[] {
  const parts = input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) throw new RangeSyntaxError(input.trim() || '(empty)');

  return parts.map((part) => {
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!match) throw new RangeSyntaxError(part);
    const a = Number(match[1]);
    const b = match[2] !== undefined ? Number(match[2]) : a;
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    if (start < 1) throw new RangeOutOfBoundsError(start, pageCount);
    if (end > pageCount) throw new RangeOutOfBoundsError(end, pageCount);
    return { start, end };
  });
}

/** Expands tokens into page groups — one group per token, pages listed ascending. */
export function tokensToRangeGroups(tokens: RangeToken[]): number[][] {
  return tokens.map((t) => Array.from({ length: t.end - t.start + 1 }, (_, i) => t.start + i));
}

/** Expands tokens into one group per individual page (each page becomes its own file). */
export function tokensToPageGroups(tokens: RangeToken[]): number[][] {
  return tokensToRangeGroups(tokens).flatMap((group) => group.map((p) => [p]));
}

/** Splits [1, pageCount] into consecutive chunks of `size` pages each. */
export function chunkPages(pageCount: number, size: number): number[][] {
  if (size < 1) throw new Error('chunkPages: size must be at least 1');
  const groups: number[][] = [];
  for (let start = 1; start <= pageCount; start += size) {
    const end = Math.min(start + size - 1, pageCount);
    groups.push(Array.from({ length: end - start + 1 }, (_, i) => start + i));
  }
  return groups;
}

export interface SplitFile {
  name: string;
  bytes: Uint8Array;
}

/** Builds the suggested output file name for a 1-based ascending page group. */
function partName(baseName: string, group: number[]): string {
  const first = group[0];
  const last = group[group.length - 1];
  const label = first === last ? `p${first}` : `p${first}-${last}`;
  return `${baseName}_${label}.pdf`;
}

/**
 * Splits one PDF into several, one output file per page group. Each group is a
 * list of 1-based page numbers (not necessarily contiguous) to include, in order.
 */
export async function splitPdf(bytes: Uint8Array, fileName: string, groups: number[][]): Promise<SplitFile[]> {
  if (groups.length === 0) throw new Error('splitPdf: at least one page group is required');

  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  let src;
  try {
    src = await PDFDocument.load(bytes);
  } catch (err) {
    if (err instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }

  const baseName = fileName.replace(/\.pdf$/i, '');
  const results: SplitFile[] = [];
  for (const group of groups) {
    if (group.length === 0) continue;
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(
      src,
      group.map((p) => p - 1),
    );
    for (const page of pages) doc.addPage(page);
    results.push({ name: partName(baseName, group), bytes: await doc.save() });
  }
  return results;
}

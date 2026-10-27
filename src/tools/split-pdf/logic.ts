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

function isPdfDelimiter(byte: number | undefined): boolean {
  return (
    byte === undefined ||
    byte === 0 ||
    byte === 9 ||
    byte === 10 ||
    byte === 12 ||
    byte === 13 ||
    byte === 32 ||
    byte === 40 ||
    byte === 41 ||
    byte === 47 ||
    byte === 60 ||
    byte === 62 ||
    byte === 91 ||
    byte === 93
  );
}

function asciiAt(bytes: Uint8Array, index: number, value: string): boolean {
  if (index < 0 || index + value.length > bytes.length) return false;
  for (let offset = 0; offset < value.length; offset++) {
    if (bytes[index + offset] !== value.charCodeAt(offset)) return false;
  }
  return true;
}

function lastAsciiTokenIndex(bytes: Uint8Array, value: string, from: number, lowerBound: number): number {
  for (let index = from; index >= lowerBound; index--) {
    if (
      asciiAt(bytes, index, value) &&
      isPdfDelimiter(bytes[index - 1]) &&
      isPdfDelimiter(bytes[index + value.length])
    ) {
      return index;
    }
  }
  return -1;
}

/** Detects an Encrypt key only in a trailer or xref-stream dictionary. */
export function hasPdfEncryptionDictionary(bytes: Uint8Array): boolean {
  const lowerBound = Math.max(0, bytes.length - 256 * 1024);
  for (let index = lowerBound; index < bytes.length; index++) {
    if (!asciiAt(bytes, index, '/Encrypt')) continue;
    if (!isPdfDelimiter(bytes[index - 1]) || !isPdfDelimiter(bytes[index + 8])) continue;

    const contextStart = Math.max(lowerBound, index - 8192);
    const type = lastAsciiTokenIndex(bytes, '/Type', index, contextStart);
    const xref = lastAsciiTokenIndex(bytes, '/XRef', index, contextStart);
    if (type >= 0 && xref > type) return true;

    const stream = lastAsciiTokenIndex(bytes, 'stream', index, contextStart);
    const endStream = lastAsciiTokenIndex(bytes, 'endstream', index, contextStart);
    if (stream > endStream) continue;

    const trailer = lastAsciiTokenIndex(bytes, 'trailer', index, contextStart);
    if (trailer >= 0) return true;
  }
  return false;
}

/** Parses a PDF far enough to report its page count, without modifying it. */
export async function readPdfPageCount(bytes: Uint8Array, fileName: string): Promise<number> {
  // pdf-lib can spend a long time parsing some AES-256 xref streams before it
  // reports encryption, so identify the standard encryption dictionary first.
  if (hasPdfEncryptionDictionary(bytes)) throw new EncryptedPdfError(fileName);
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

export interface SplitProgress {
  done: number;
  total: number;
}

/** Builds the suggested output file name for a 1-based ascending page group. */
function partName(baseName: string, group: number[], duplicateIndex = 1): string {
  const first = group[0];
  const last = group[group.length - 1];
  const label = first === last ? `p${first}` : `p${first}-${last}`;
  return `${baseName}_${label}${duplicateIndex === 1 ? '' : `-${duplicateIndex}`}.pdf`;
}

/**
 * Splits one PDF into several, one output file per page group. Each group is a
 * list of 1-based page numbers (not necessarily contiguous) to include, in order.
 */
export async function writeSplitPdfParts(
  bytes: Uint8Array,
  fileName: string,
  groups: number[][],
  writePart: (file: SplitFile, progress: SplitProgress) => void | Promise<void>,
): Promise<void> {
  if (groups.length === 0) throw new Error('splitPdf: at least one page group is required');

  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  let src;
  try {
    if (hasPdfEncryptionDictionary(bytes)) throw new EncryptedPdfError(fileName);
    src = await PDFDocument.load(bytes);
  } catch (err) {
    if (err instanceof EncryptedPdfError) throw err;
    if (err instanceof EncryptedPDFError) throw new EncryptedPdfError(fileName);
    throw new InvalidPdfError(fileName);
  }

  const baseName = fileName.replace(/\.pdf$/i, '');
  const nonEmptyGroups = groups.filter((group) => group.length > 0);
  const names = new Map<string, number>();
  for (const [index, group] of nonEmptyGroups.entries()) {
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(
      src,
      group.map((p) => p - 1),
    );
    for (const page of pages) doc.addPage(page);
    const firstName = partName(baseName, group);
    const duplicateIndex = (names.get(firstName) ?? 0) + 1;
    names.set(firstName, duplicateIndex);
    const file = { name: partName(baseName, group, duplicateIndex), bytes: await doc.save() };
    await writePart(file, { done: index + 1, total: nonEmptyGroups.length });
  }
}

/** Collects split parts in memory. Browser code uses writeSplitPdfParts to package each part as it is made. */
export async function splitPdf(bytes: Uint8Array, fileName: string, groups: number[][]): Promise<SplitFile[]> {
  const results: SplitFile[] = [];
  await writeSplitPdfParts(bytes, fileName, groups, (file) => {
    results.push(file);
  });
  return results;
}

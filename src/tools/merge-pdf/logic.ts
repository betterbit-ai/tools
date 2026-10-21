/**
 * PDF merge logic. pdf-lib has no DOM dependency, so this runs identically in
 * the browser and under Vitest — only the import itself is lazy, to keep the
 * ~500KB library out of the tool's initial JS bundle (loaded on first file drop).
 */

export class InvalidPdfError extends Error {
  constructor(public readonly fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
    this.name = 'InvalidPdfError';
  }
}

export class EncryptedPdfError extends Error {
  constructor(public readonly fileName: string) {
    super(`"${fileName}" is password-protected and can't be merged.`);
    this.name = 'EncryptedPdfError';
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
  // pdf-lib can stall on some AES-256 xref streams, so reject the standard
  // encryption dictionary before starting its full parser.
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

export interface MergeInput {
  bytes: Uint8Array;
  fileName: string;
}

export interface MergeProgress {
  done: number;
  total: number;
  fileName: string;
}

interface MergeSequenceOptions {
  total: number;
  onProgress?: (progress: MergeProgress) => void;
}

/**
 * Merges a sequence of PDFs while allowing browser callers to read one source file at a time.
 * Keeping this iterator-based prevents every large input from needing a second in-memory copy.
 */
export async function mergePdfSequence(
  files: AsyncIterable<MergeInput> | Iterable<MergeInput>,
  options: MergeSequenceOptions,
): Promise<Uint8Array> {
  if (options.total === 0) throw new Error('mergePdfs: at least one file is required');

  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  const merged = await PDFDocument.create();
  let done = 0;

  for await (const file of files) {
    let src;
    try {
      if (hasPdfEncryptionDictionary(file.bytes)) throw new EncryptedPdfError(file.fileName);
      src = await PDFDocument.load(file.bytes);
    } catch (err) {
      if (err instanceof EncryptedPdfError) throw err;
      if (err instanceof EncryptedPDFError) throw new EncryptedPdfError(file.fileName);
      throw new InvalidPdfError(file.fileName);
    }
    const pages = await merged.copyPages(src, src.getPageIndices());
    for (const page of pages) merged.addPage(page);
    done++;
    options.onProgress?.({ done, total: options.total, fileName: file.fileName });
  }

  // pdf-lib adds a blank page by default when the document has no pages. A PDF
  // made entirely of valid, zero-page inputs should stay zero-page: the UI has
  // already reported that count and adding a page would be surprising.
  return merged.save({ addDefaultPage: false });
}

/** Merges PDFs in the given order into one new PDF, preserving their page content. */
export async function mergePdfs(
  files: MergeInput[],
  onProgress?: (progress: MergeProgress) => void,
): Promise<Uint8Array> {
  return mergePdfSequence(files, { total: files.length, onProgress });
}

/** Total page count across files, for the "N pages total" summary before merging. */
export function totalPageCount(counts: number[]): number {
  return counts.reduce((sum, n) => sum + n, 0);
}

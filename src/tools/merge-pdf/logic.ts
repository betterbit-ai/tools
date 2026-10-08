/**
 * PDF merge logic. pdf-lib has no DOM dependency, so this runs identically in
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
    super(`"${fileName}" is password-protected and can't be merged.`);
    this.name = 'EncryptedPdfError';
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

export interface MergeInput {
  bytes: Uint8Array;
  fileName: string;
}

/** Merges PDFs in the given order into one new PDF, preserving every page as-is. */
export async function mergePdfs(files: MergeInput[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error('mergePdfs: at least one file is required');

  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  const merged = await PDFDocument.create();

  for (const file of files) {
    let src;
    try {
      src = await PDFDocument.load(file.bytes);
    } catch (err) {
      if (err instanceof EncryptedPDFError) throw new EncryptedPdfError(file.fileName);
      throw new InvalidPdfError(file.fileName);
    }
    const pages = await merged.copyPages(src, src.getPageIndices());
    for (const page of pages) merged.addPage(page);
  }

  return merged.save();
}

/** Total page count across files, for the "N pages total" summary before merging. */
export function totalPageCount(counts: number[]): number {
  return counts.reduce((sum, n) => sum + n, 0);
}

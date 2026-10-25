/** Pure, browser-independent decisions for local PDF page reordering. */

export const MAX_FILE_BYTES = 250 * 1024 * 1024;
export const MAX_PAGE_COUNT = 500;
export const PREVIEW_SCALE = 0.2;
export const MAX_PREVIEW_PIXELS = 120_000;

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES;
}

export function pageCountExceedsLimit(pageCount: number): boolean {
  return !Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGE_COUNT;
}

/** Keeps thumbnail canvases bounded for unusually large PDF page boxes. */
export function previewScale(width: number, height: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 0;
  return Math.min(PREVIEW_SCALE, Math.sqrt(MAX_PREVIEW_PIXELS / (width * height)));
}

/** Page numbers are one-based so the same values can be passed directly to the PDF writer. */
export function initialPageOrder(pageCount: number): number[] {
  if (pageCountExceedsLimit(pageCount)) return [];
  return Array.from({ length: pageCount }, (_, index) => index + 1);
}

/**
 * Returns a fresh page order after moving an item between two zero-based slots.
 * Invalid indexes leave the previous order intact, rather than guessing where a
 * page should go after a stale drag event.
 */
export function movePage(order: number[], fromIndex: number, toIndex: number): number[] {
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= order.length ||
    toIndex >= order.length ||
    fromIndex === toIndex
  ) {
    return order;
  }
  const next = [...order];
  const [page] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, page);
  return next;
}

/** Moves a source page one step, used by the visible keyboard controls. */
export function movePageBy(order: number[], page: number, amount: -1 | 1): number[] {
  const fromIndex = order.indexOf(page);
  return movePage(order, fromIndex, fromIndex + amount);
}

export function reversePageOrder(order: number[]): number[] {
  return [...order].reverse();
}

export function isOriginalOrder(order: number[]): boolean {
  return order.every((page, index) => page === index + 1);
}

/** Retains Unicode names and makes it clear the original file remains unchanged. */
export function reorderedPdfFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_reordered.pdf`;
}

export class InvalidPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is not a readable PDF file.`);
  }
}

export class EncryptedPdfError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" is password-protected and cannot be reordered.`);
  }
}

export class PdfLimitError extends Error {
  constructor() {
    super(`PDF has more than ${MAX_PAGE_COUNT} pages.`);
  }
}

export class PdfOperationCancelledError extends Error {
  constructor() {
    super('PDF reordering was canceled.');
    this.name = 'PdfOperationCancelledError';
  }
}

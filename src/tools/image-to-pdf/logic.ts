/**
 * Pure logic for image-to-pdf: page-layout math and raw PDF-file assembly.
 * No DOM — JPEG encoding and file reading (Canvas, createImageBitmap) live in pdf.ts.
 */

export type PageSizeMode = 'fit' | 'a4' | 'letter';
export type Orientation = 'auto' | 'portrait' | 'landscape';
export type MarginMode = 'none' | 'small';

export interface PdfOptions {
  pageSize: PageSizeMode;
  orientation: Orientation;
  margin: MarginMode;
}

export interface PageLayout {
  pageWidth: number;
  pageHeight: number;
  drawX: number;
  drawY: number;
  drawWidth: number;
  drawHeight: number;
}

/** PDF user space is in points (1/72 in), independent of device/DPI. */
const PT_PER_MM = 72 / 25.4;

/** Portrait base sizes in points. ISO 216 A4 = 210×297mm; US Letter = 8.5×11in. */
const PAGE_SIZES: Record<'a4' | 'letter', { width: number; height: number }> = {
  a4: { width: 210 * PT_PER_MM, height: 297 * PT_PER_MM },
  letter: { width: 8.5 * 72, height: 11 * 72 },
};

/** "Small" = 10mm, a common narrow-margin preset. */
const MARGIN_PT: Record<MarginMode, number> = { none: 0, small: 10 * PT_PER_MM };

/** Acrobat's documented maximum PDF page edge; keep "fit" pages under it even for huge photos. */
const MAX_PAGE_PT = 14_400;

/** Where a single image lands on its page, for the given page-size mode. */
export function computePageLayout(imgWidthPx: number, imgHeightPx: number, opts: PdfOptions): PageLayout {
  const w = Math.max(1, imgWidthPx);
  const h = Math.max(1, imgHeightPx);

  if (opts.pageSize === 'fit') {
    // 1 image pixel = 1 PDF point: the page is exactly the image, no margin — except
    // that PDF viewers (Acrobat included) cap page edges at MAX_PAGE_PT, so very large
    // photos are scaled down proportionally rather than producing an invalid page.
    const scale = Math.min(1, MAX_PAGE_PT / w, MAX_PAGE_PT / h);
    const pageWidth = w * scale;
    const pageHeight = h * scale;
    return { pageWidth, pageHeight, drawX: 0, drawY: 0, drawWidth: pageWidth, drawHeight: pageHeight };
  }

  const base = PAGE_SIZES[opts.pageSize];
  const landscape = opts.orientation === 'landscape' || (opts.orientation === 'auto' && w > h);
  const pageWidth = landscape ? Math.max(base.width, base.height) : Math.min(base.width, base.height);
  const pageHeight = landscape ? Math.min(base.width, base.height) : Math.max(base.width, base.height);

  const margin = MARGIN_PT[opts.margin];
  const availW = Math.max(1, pageWidth - margin * 2);
  const availH = Math.max(1, pageHeight - margin * 2);
  const scale = Math.min(availW / w, availH / h);
  const drawWidth = w * scale;
  const drawHeight = h * scale;

  return {
    pageWidth,
    pageHeight,
    drawX: (pageWidth - drawWidth) / 2,
    drawY: (pageHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  };
}

export interface PdfPageInput {
  /** Full JPEG file bytes (SOI…EOI), embedded as-is via /DCTDecode. */
  jpeg: Uint8Array;
  /** Pixel dimensions of that JPEG (for the XObject /Width /Height — not re-derived here). */
  widthPx: number;
  heightPx: number;
  layout: PageLayout;
}

function str(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

const PDF_HEADER = concat([
  str('%PDF-1.4\n'),
  // Binary-marker comment (4 bytes > 0x7f) so naive tools treat the file as binary.
  new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]),
]);

function num(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

/** Assembles a minimal single-level PDF with one JPEG XObject per page. */
export function buildPdf(pages: PdfPageInput[]): Uint8Array {
  if (pages.length === 0) throw new Error('buildPdf: at least one page is required');

  // Object numbering: 1 = Catalog, 2 = Pages, then 3 objects per page (Page, Contents, Image).
  const pageObjNums = pages.map((_, i) => 3 + i * 3);
  const totalObjs = 2 + pages.length * 3;
  const offsets: number[] = new Array(totalObjs + 1).fill(0);
  const chunks: Uint8Array[] = [PDF_HEADER];
  let length = PDF_HEADER.length;

  const push = (objNum: number, bytes: Uint8Array) => {
    offsets[objNum] = length;
    chunks.push(bytes);
    length += bytes.length;
  };

  push(1, str(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`));
  push(
    2,
    str(
      `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj\n`,
    ),
  );

  pages.forEach((page, i) => {
    const pageNum = pageObjNums[i];
    const contentNum = pageNum + 1;
    const imageNum = pageNum + 2;
    const { pageWidth, pageHeight, drawX, drawY, drawWidth, drawHeight } = page.layout;

    push(
      pageNum,
      str(
        `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(pageWidth)} ${num(pageHeight)}] ` +
          `/Contents ${contentNum} 0 R /Resources << /XObject << /Im0 ${imageNum} 0 R >> >> >>\nendobj\n`,
      ),
    );

    const contentStream = `q\n${num(drawWidth)} 0 0 ${num(drawHeight)} ${num(drawX)} ${num(drawY)} cm\n/Im0 Do\nQ`;
    push(
      contentNum,
      str(`${contentNum} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`),
    );

    push(
      imageNum,
      concat([
        str(
          `${imageNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${Math.max(1, Math.round(page.widthPx))} ` +
            `/Height ${Math.max(1, Math.round(page.heightPx))} /ColorSpace /DeviceRGB /BitsPerComponent 8 ` +
            `/Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
        ),
        page.jpeg,
        str(`\nendstream\nendobj\n`),
      ]),
    );
  });

  const xrefOffset = length;
  let xref = `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= totalObjs; n++) {
    xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(str(xref + trailer));

  return concat(chunks);
}

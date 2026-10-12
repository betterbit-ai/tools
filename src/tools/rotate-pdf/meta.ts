import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'rotate-pdf',
  category: 'pdf',
  icon: 'rotate',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'performance', 'usability'],
  competitors: [
    {
      name: 'iLovePDF (Rotate PDF)',
      url: 'https://www.ilovepdf.com/rotate_pdf',
      weakness:
        'Its English rotate page shows upload-progress, upload-speed, and “Rotating PDF…” stages, so the document is sent to iLovePDF before processing. Per-page controls are revealed by hovering a file/page rather than being persistent keyboard-focusable buttons under every preview. (Strength: supports multiple PDFs and can target all, portrait, or landscape pages.)',
    },
    {
      name: 'Adobe Acrobat online (Rotate PDF)',
      url: 'https://www.adobe.com/acrobat/online/rotate-pdf.html',
      weakness:
        'States that files are handled by Adobe servers and deleted unless the user signs in to save them. The free online workflow is capped at 1,500 pages across 100 files, with 500 pages per file and 100MB total. (Strength: supports multiple files, selection of nonconsecutive pages, reordering, and deletion in the same workflow.)',
    },
    {
      name: 'OneClickPDF (Rotate PDF)',
      url: 'https://www.oneclickpdf.net/tools/rotate',
      weakness:
        'It is local and private too, but its documented per-page workflow first selects thumbnails and then applies a chosen turn; this tool puts left/right controls directly under every page preview so a page can be turned with one focused control. (Strength: offers odd/even selection and documented R / Shift+R keyboard shortcuts.)',
    },
    {
      name: 'Smallpdf (PDF 회전)',
      url: 'https://smallpdf.com/kr/rotate-pdf',
      weakness:
        'Korean instructions begin by uploading the PDF, then require pressing “완료” and waiting before downloading. The page says Pro users can process large documents without limits, so the free experience is not presented as unlimited. (Strength: supports individual pages and 90°, 180°, and 270° rotations.)',
    },
    {
      name: 'i2PDF (PDF 회전)',
      url: 'https://www.i2pdf.com/ko/rotate-pdf',
      weakness:
        'Its Korean page starts with a file-upload flow, says files are only automatically deleted after 30 minutes, and displays a cookie-consent banner. This tool never transmits the PDF and shows its page previews immediately in the browser. (Strength: supports page-by-page ±90° and ±180° rotation.)',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg'],
};

import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'delete-pdf-pages',
  category: 'pdf',
  icon: 'delete',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'Smallpdf (Delete PDF Pages)',
      url: 'https://smallpdf.com/delete-pages-from-pdf',
      weakness:
        'The English and Korean pages begin with an upload, and state that uploaded files are held on Smallpdf servers for one hour. Its Korean pricing page also lists daily download limits for the free plan. (Strength: supports multiple non-consecutive pages and offers an adjacent compression option.)',
    },
    {
      name: 'iLovePDF (Remove PDF pages)',
      url: 'https://www.ilovepdf.com/remove-pages',
      weakness:
        'Its documented workflow uploads the PDF and then processes it remotely; iLovePDF says uploaded documents are automatically deleted after two hours. The page exposes upload and processing states before download. (Strength: supports Shift-click ranges and multiple PDFs, plus Google Drive and Dropbox imports.)',
    },
    {
      name: 'PDF24 (Remove PDF pages)',
      url: 'https://tools.pdf24.org/en/remove-pdf-pages',
      weakness:
        'The English and Korean pages say files are transferred to PDF24 servers in Germany and automatically deleted after one hour; the service is funded by advertising. This tool keeps the PDF in the browser and has no advertising. (Strength: can mark odd or even pages together.)',
    },
    {
      name: 'RotatePDF (PDF 페이지 삭제)',
      url: 'https://rotatepdf.org/ko/delete-pdf-pages',
      weakness:
        'It also says it processes files locally, but its Korean page exposes only a generic “페이지 삭제” output action before a file is loaded. This tool shows an explicit selected/remaining count and supports both keyboard-focusable thumbnails and typed page ranges. (Strength: it also presents local thumbnail previews.)',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'compress-pdf', 'rotate-pdf', 'reorder-pdf'],
};

import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'split-pdf',
  category: 'pdf',
  icon: 'split',
  added: '2026-10-08',
  updated: '2026-10-13',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'iLovePDF (Split PDF)',
      url: 'https://www.ilovepdf.com/split_pdf',
      weakness:
        'Shows “Uploading file” and “Splitting PDF…” stages after a file is selected, and offers Google Drive/Dropbox imports, so the document must leave the device before it is processed. (Strength: its range tool also has Smart split detection and a maximum-size mode.)',
    },
    {
      name: 'Smallpdf (Split PDF)',
      url: 'https://smallpdf.com/split-pdf',
      weakness:
        'States that uploaded documents are automatically deleted only after one hour, so the original document sits on a third-party server during that window. (Strength: it presents page thumbnails and scissor controls for visual split points, and supports several uploaded formats.)',
    },
    {
      name: 'PDF24 (Split PDF)',
      url: 'https://tools.pdf24.org/en/split-pdf',
      weakness:
        'States that it uploads and processes PDFs on servers in Germany, deletes them after one hour, and funds the tool with advertising. (Strength: it can split odd/even pages and lets users choose visual cut points.)',
    },
  ],
  related: ['merge-pdf', 'compress-pdf', 'delete-pdf-pages', 'rotate-pdf'],
};

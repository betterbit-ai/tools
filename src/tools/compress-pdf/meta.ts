import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'compress-pdf',
  category: 'pdf',
  icon: 'compress',
  added: '2026-10-11',
  updated: '2026-10-19',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'iLovePDF (Compress PDF)',
      url: 'https://www.ilovepdf.com/compress_pdf',
      weakness:
        'The tool shows “Uploading file”, upload speed, and remaining-time states before compression, so each PDF is sent to iLovePDF first. It also requires a separate “COMPRESS PDF” click after choosing a file, while this tool starts its local scan compression automatically. (Strength: it can import from Google Drive and Dropbox.)',
    },
    {
      name: 'Smallpdf (Compress PDF)',
      url: 'https://smallpdf.com/compress-pdf',
      weakness:
        'States that its tools are cloud-based and that uploaded files are automatically deleted after one hour, so the document remains on a third-party server during that window. Its Moderate and Strong compression levels are Pro features; only Basic is free. (Strength: it retains vector text and fonts rather than rasterizing each page.)',
    },
    {
      name: 'PDF24 (Compress PDF)',
      url: 'https://tools.pdf24.org/ko/compress-pdf',
      weakness:
        'Its page says PDFs are compressed in the cloud on servers in Germany and deleted from the server after one hour; it also visibly labels advertising as the funding source. Compression needs a separate button click, while this tool starts locally after a PDF is chosen. (Strength: it offers lossless compression and advanced controls for grayscale, metadata, annotations, forms, and structural data.)',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'pdf-to-jpg', 'unlock-pdf'],
};

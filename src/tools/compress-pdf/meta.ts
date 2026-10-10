import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'compress-pdf',
  category: 'pdf',
  icon: 'compress',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'no-ads', 'features'],
  competitors: [
    {
      name: 'iLovePDF (Compress PDF)',
      url: 'https://www.ilovepdf.com/compress_pdf',
      weakness:
        'The English and Korean tool pages show an upload stage (including upload speed and remaining-time UI) before compression, so each PDF is sent to iLovePDF first. Its three levels only describe a quality/compression trade-off; this tool instead exposes the concrete local rendering levels used for scan/image-heavy PDFs. (Strength: it can import from Google Drive and Dropbox.)',
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
        'Its Korean and English pages state that PDFs are compressed in the cloud on its servers and deleted only after a short period; the page also includes an advertisement and says it is funded by advertising. (Strength: it offers advanced controls such as grayscale, metadata removal, and form flattening.)',
    },
    {
      name: 'i2PDF (PDF Compress)',
      url: 'https://www.i2pdf.com/ko/compress-pdf',
      weakness:
        'Its Korean page directs the user to upload a PDF to start an online operation, while its description only promises to keep visual quality “as much as possible” without exposing a numerical image-recompression level. (Strength: it offers other optimization tools such as Fast Web View.)',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'sign-pdf', 'image-compressor'],
};

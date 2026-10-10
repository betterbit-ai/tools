import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-to-pdf',
  category: 'image',
  icon: 'file',
  added: '2026-10-08',
  updated: '2026-10-08',
  edges: ['privacy', 'performance', 'no-ads', 'no-signup'],
  competitors: [
    {
      name: 'iLovePDF (JPG to PDF)',
      url: 'https://www.ilovepdf.com/jpg_to_pdf',
      weakness:
        'Uploads every photo to its server before it can convert them, so each job waits on an upload and download round trip. (Strength: drag-and-drop reorder, A4/Letter/Fit page-size presets.)',
    },
    {
      name: 'Smallpdf (JPG to PDF)',
      url: 'https://smallpdf.com/jpg-to-pdf',
      weakness:
        'Also server-side — states files are only deleted from its servers "one hour after" conversion, meaning originals sit on a third-party server in the meantime.',
    },
    {
      name: 'PDF24 (Images to PDF)',
      url: 'https://tools.pdf24.org/en/images-to-pdf',
      weakness:
        'Uploads to a server in Germany and is explicitly ad-funded ("100% free thanks to advertising"). (Strength: wide page-size list A0–A6, custom DPI and margins.)',
    },
    {
      name: 'Adobe Acrobat (JPG to PDF)',
      url: 'https://www.adobe.com/acrobat/online/jpg-to-pdf.html',
      weakness:
        'Uploads to Adobe servers, and without logging in it caps you at a single free conversion with one download — further use requires an account.',
    },
  ],
  related: [
    'image-converter',
    'image-compressor',
    'image-resizer',
    'image-cropper',
    'heic-to-jpg',
    'merge-pdf',
    'split-pdf',
    'pdf-to-jpg',
  ],
};

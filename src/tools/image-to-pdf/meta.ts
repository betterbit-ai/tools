import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'image-to-pdf',
  category: 'image',
  icon: 'file',
  added: '2026-10-08',
  updated: '2026-10-20',
  edges: ['privacy', 'performance', 'no-signup'],
  competitors: [
    {
      name: 'iLovePDF (JPG to PDF)',
      url: 'https://www.ilovepdf.com/jpg_to_pdf',
      weakness:
        'Uploads every photo to its server before it can convert them, so each job waits on an upload and download round trip. (Strength: it also offers a large-margin preset alongside reordering and page-size controls.)',
    },
    {
      name: 'Smallpdf (JPG to PDF)',
      url: 'https://smallpdf.com/jpg-to-pdf',
      weakness:
        'Uploads source files to Smallpdf servers and states they are deleted one hour after conversion, so originals sit on a third-party server in the meantime. (Strength: accepts additional input formats including HEIC and TIFF.)',
    },
    {
      name: 'PDF24 (Images to PDF)',
      url: 'https://tools.pdf24.org/en/images-to-pdf',
      weakness:
        'Uploads files to servers in Germany, deletes them after one hour, and is explicitly ad-funded ("100% free thanks to advertising"). (Strength: has a wider page-size list plus custom image sizing, alignment, and margins.)',
    },
    {
      name: 'Adobe Acrobat (JPG to PDF)',
      url: 'https://www.adobe.com/acrobat/online/jpg-to-pdf.html',
      weakness:
        'Uploads to Adobe servers, and without logging in it caps you at a single free conversion with one download — further use requires an account.',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'pdf-to-jpg'],
};

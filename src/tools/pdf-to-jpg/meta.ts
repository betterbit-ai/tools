import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pdf-to-jpg',
  category: 'pdf',
  icon: 'image',
  added: '2026-10-11',
  updated: '2026-10-28',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'iLovePDF (PDF to JPG)',
      url: 'https://www.ilovepdf.com/pdf_to_jpg',
      weakness:
        'Shows an upload progress step and offers Google Drive/Dropbox import, so the PDF is sent to iLovePDF before conversion. Its page exposes only Normal/High image quality and page-to-JPG or extract-images modes, not an explicit page range with named DPI choices. (Strength: can extract embedded images instead of rendering whole pages.)',
    },
    {
      name: 'Smallpdf (PDF to JPG)',
      url: 'https://smallpdf.com/pdf-to-jpg',
      weakness:
        'Uploads documents to Smallpdf servers and says uploaded and converted files are deleted only after one hour. Its free version has limited daily conversions, while multiple-PDF batch conversion is Pro-only. (Strength: it can extract embedded images and download converted pages individually as well as in a ZIP.)',
    },
    {
      name: 'Adobe Acrobat (PDF to JPG)',
      url: 'https://www.adobe.com/acrobat/online/pdf-to-jpg.html',
      weakness:
        'States that the selected file is handled by Adobe servers and requires an internet connection; it prompts users to sign in to share or save the result. Its converter does not expose 96/150/300 dpi choices before conversion. (Strength: supports JPG, PNG, and TIFF output, and lets people download only the pages they need after conversion.)',
    },
  ],
  related: ['compress-pdf', 'image-to-pdf', 'rotate-pdf', 'pdf-to-text'],
};

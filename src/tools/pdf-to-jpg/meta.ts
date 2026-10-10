import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pdf-to-jpg',
  category: 'pdf',
  icon: 'image',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'performance', 'features'],
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
        'Uploads documents to Smallpdf servers and says copies are automatically deleted only after one hour. Its free workflow converts full pages; extracting individual images is a Pro trial feature. (Strength: can batch-upload multiple PDF files and save results to connected cloud storage.)',
    },
    {
      name: 'Adobe Acrobat (PDF to JPG)',
      url: 'https://www.adobe.com/acrobat/online/pdf-to-jpg.html',
      weakness:
        'States that the selected file is handled by Adobe servers, then prompts users to sign in to share or save the result. Its converter offers JPG, PNG, and TIFF output but does not expose a page-range field or 96/150/300 dpi choices on the tool page. (Strength: supports three image output formats.)',
    },
  ],
  related: ['compress-pdf', 'split-pdf', 'image-to-pdf', 'image-converter'],
};

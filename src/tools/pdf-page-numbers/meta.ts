import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pdf-page-numbers',
  category: 'pdf',
  icon: 'count',
  added: '2026-10-25',
  updated: '2026-10-25',
  edges: ['privacy', 'performance'],
  competitors: [
    {
      name: 'PDF24 (Add Page Numbers)',
      url: 'https://tools.pdf24.org/en/add-page-numbers',
      weakness:
        'Its English and Korean pages say page numbers are added on PDF24 cloud servers, files are deleted only after one hour, and the interface visibly labels an Advertisement. This tool reads and saves the PDF only in the current browser, avoiding the upload and processing wait. (Strength: PDF24 offers patterns, fonts, colour, transparency, angle, and multiple input files.)',
    },
    {
      name: 'iLovePDF (Add PDF Page Numbers)',
      url: 'https://www.ilovepdf.com/add_pdf_page_number',
      weakness:
        'Its page shows upload progress, upload speed, and an “Adding page numbers…” processing state, plus Google Drive and Dropbox import, so the document is transferred before it is changed. This tool processes one local PDF without a transfer stage. (Strength: iLovePDF has facing-page mode, many font choices, background colour, opacity, and shadow controls.)',
    },
    {
      name: 'Sejda (Add PDF Page Numbers)',
      url: 'https://www.sejda.com/page-numbers-pdf',
      weakness:
        'Its page says free use is limited to documents up to 200 pages or 50 MB and 3 tasks per hour, while files are only automatically deleted after 2 hours. This tool keeps the file on-device and supports one PDF up to 500 pages or 100 MB, subject to browser memory. (Strength: Sejda accepts cloud storage and web-address sources and offers a desktop app.)',
    },
    {
      name: '2on (PDF 쪽번호 넣기)',
      url: 'https://ko.2on.com/tools/pdf-page-numbers/',
      weakness:
        'Its Korean page processes files locally but sets a 50 MB maximum, and its custom text field is limited to Latin characters, digits, and punctuation. This tool accepts one PDF up to 100 MB and makes six positions, four formats, and the cover-page shortcut visible before processing. (Strength: 2on supports custom templates with {page} and {total} placeholders and an open-ended 2- page range.)',
    },
    {
      name: 'Kito (PDF 쪽 번호 넣기)',
      url: 'https://kito.run/pdf-page-numbers/',
      weakness:
        'Its Korean tool directory describes this feature only as numbering every PDF page, whereas this tool exposes a validated physical-page range and a dedicated “Skip cover page” control that resets the visible numbering to 1. (Strength: Kito provides a broad local-tool collection and says files do not leave the device.)',
    },
  ],
  related: ['merge-pdf', 'rotate-pdf', 'reorder-pdf'],
};

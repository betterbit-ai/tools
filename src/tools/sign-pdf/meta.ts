import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'sign-pdf',
  category: 'pdf',
  icon: 'signature',
  added: '2026-10-11',
  updated: '2026-10-27',
  edges: ['privacy', 'no-signup'],
  competitors: [
    {
      name: 'Smallpdf (Sign PDF)',
      url: 'https://smallpdf.com/sign-pdf',
      weakness:
        'Importing a file uploads it to Smallpdf’s cloud; its current sign page says files are only auto-deleted after one hour unless saved to an account. (Strength: it also accepts Office and image files, and can place initials, text, dates, and checkboxes.)',
    },
    {
      name: 'PDF24 (Sign PDF)',
      url: 'https://tools.pdf24.org/en/sign-pdf',
      weakness:
        'Uploads the PDF to PDF24’s servers in Germany and auto-deletes it only after one hour; the page states it is "100% free thanks to advertising", so ads are shown throughout. (Strength: can capture a signature photo directly from a camera, in addition to drawing or uploading one.)',
    },
    {
      name: 'Xodo Sign',
      url: 'https://xodo.com/sign-pdf',
      weakness:
        'Requires uploading the PDF, and its current FAQ says only one PDF can be signed free each day; more documents require a trial or paid plan. (Strength: it also supports uploaded signature images, text, and date fields.)',
    },
  ],
  related: ['signature-generator', 'unlock-pdf', 'protect-pdf'],
};

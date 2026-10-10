import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'sign-pdf',
  category: 'pdf',
  icon: 'signature',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'no-ads', 'no-signup'],
  competitors: [
    {
      name: 'Smallpdf (Sign PDF)',
      url: 'https://smallpdf.com/sign-pdf',
      weakness:
        'Importing a file uploads it to Smallpdf’s servers, and both the English and Korean pages state files are only auto-deleted "after one hour" — the original document sits remotely during that window. (Strength: beyond a signature, it also offers initials, date and checkbox fields on the same page.)',
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
        'Requires uploading the PDF to sign it, and its own page states "you can sign one PDF for free each day" — signing a second document the same day requires starting a trial or paid plan.',
    },
    {
      name: 'i2PDF (PDF 서명)',
      url: 'https://www.i2pdf.com/ko/sign-pdf',
      weakness:
        '손글씨 서명을 브라우저에서 처리해 업로드는 없지만, 광고가 함께 표시되고 이미지로 서명을 올릴 때 PNG/JPEG 용량이 최대 10MB로 제한된다고 안내한다.',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'compress-pdf'],
};

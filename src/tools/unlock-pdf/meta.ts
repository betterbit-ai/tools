import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'unlock-pdf',
  category: 'pdf',
  icon: 'shield',
  added: '2026-10-12',
  updated: '2026-10-27',
  edges: ['privacy', 'performance', 'no-signup'],
  competitors: [
    {
      name: 'iLovePDF (Unlock PDF)',
      url: 'https://www.ilovepdf.com/unlock_pdf',
      weakness:
        'Its English and Korean unlock pages show an upload progress stage, upload speed, and “Unlocking PDF…” processing stage, so the PDF leaves the device before it is unlocked. It also offers Google Drive and Dropbox import, which adds third-party account connections. (Strength: accepts multiple PDFs in one workflow.)',
    },
    {
      name: 'Smallpdf (Unlock PDF)',
      url: 'https://smallpdf.com/unlock-pdf',
      weakness:
        'Its English and Korean instructions begin with uploading a locked PDF, then entering its password; the Korean page says uploaded files are deleted after 1 hour, meaning the document remains on Smallpdf servers during that time. (Strength: supports use across major desktop and mobile platforms.)',
    },
    {
      name: 'Adobe Acrobat (Remove passwords from PDFs)',
      url: 'https://helpx.adobe.com/acrobat/using/securing-pdfs-passwords.html',
      weakness:
        'Adobe’s documented desktop workflow requires opening All tools > Protect a PDF, opening security properties, changing settings, confirming, and saving. This tool produces a separate unlocked download after one action once the known password is entered. (Strength: Acrobat exposes separate controls for document-open and permission passwords.)',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'compress-pdf', 'sign-pdf', 'protect-pdf'],
};

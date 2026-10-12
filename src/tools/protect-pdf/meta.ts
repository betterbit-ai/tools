import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'protect-pdf',
  category: 'pdf',
  icon: 'shield',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'no-ads', 'no-signup'],
  competitors: [
    {
      name: 'Adobe Acrobat (Password Protect PDF)',
      url: 'https://www.adobe.com/acrobat/online/password-protect-pdf.html',
      weakness:
        'Its English page says the selected file is handled by Adobe servers, and its Korean page says files uploaded to Adobe cloud are deleted only after a short time. The non-signed-in flow permits one free task and one download, while this tool never uploads the PDF and has no usage gate. (Strength: Acrobat Pro offers certificate encryption and granular edit, print, and copy permissions.)',
    },
    {
      name: 'iLovePDF (Protect PDF)',
      url: 'https://www.ilovepdf.com/protect-pdf',
      weakness:
        'Its English and Korean pages show Drive/Dropbox import, upload speed, an Uploaded state, and a “Protecting PDF…” stage, so the document is sent to iLovePDF before encryption. Its pricing page also describes limited document processing and an ad-free experience as Premium benefits. (Strength: its Advanced mode exposes document-permission controls.)',
    },
    {
      name: 'Smallpdf (Protect PDF)',
      url: 'https://smallpdf.com/kr/protect-pdf',
      weakness:
        'Its Korean page explicitly calls the workflow cloud-based and says uploaded files are deleted after 1 hour; its English page likewise says the PDF is uploaded before protection. The document therefore resides on a third-party server during processing. (Strength: it documents cross-device support and gives password-strength guidance.)',
    },
    {
      name: 'PDF24 (Protect PDF)',
      url: 'https://tools.pdf24.org/ko/lock-pdf',
      weakness:
        'Its Korean and English pages say protection runs in the cloud on servers in Germany and files are deleted after 1 hour. The tool page visibly includes advertising and states that advertising funds the free service. (Strength: it exposes AES-256 and detailed printing, copying, editing, and form permissions.)',
    },
  ],
  related: ['unlock-pdf', 'merge-pdf', 'split-pdf', 'sign-pdf'],
};

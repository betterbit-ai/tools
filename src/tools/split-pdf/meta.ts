import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'split-pdf',
  category: 'pdf',
  icon: 'split',
  added: '2026-10-08',
  updated: '2026-10-08',
  edges: ['privacy', 'performance', 'features'],
  competitors: [
    {
      name: 'iLovePDF (Split PDF)',
      url: 'https://www.ilovepdf.com/split_pdf',
      weakness:
        'Uploads every PDF to iLovePDF\'s servers before it can split them. Its own pricing page caps the free Basic plan at roughly 100MB per split task — unlimited batch splitting is a paid Premium feature. (Strength: a "Smart" range-detection mode that suggests split points, and importing directly from Google Drive/Dropbox.)',
    },
    {
      name: 'Smallpdf (Split PDF)',
      url: 'https://smallpdf.com/split-pdf',
      weakness:
        'Processes files on Smallpdf servers over TLS and states they are only auto-deleted after one hour, so the original document sits on a third-party server in the meantime. (Strength: shows real page thumbnails with a scissors icon to click split points visually.)',
    },
    {
      name: 'Jotform PDF Splitter',
      url: 'https://www.jotform.com/pdf/split/',
      weakness:
        "Caps uploads at 30MB per file, so a single scanned or image-heavy PDF can exceed the limit before it is even split. It also states password-protected PDFs aren't supported at all, with no way to work around it in the tool.",
    },
    {
      name: 'PDF24 (Split PDF)',
      url: 'https://tools.pdf24.org/en/split-pdf',
      weakness:
        'Uploads to a server in Germany and auto-deletes copies only after one hour, meaning the file is held remotely in the meantime even though the site is ad-supported rather than paywalled.',
    },
  ],
  related: ['merge-pdf', 'image-to-pdf'],
};

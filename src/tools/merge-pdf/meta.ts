import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'merge-pdf',
  category: 'pdf',
  icon: 'merge',
  added: '2026-10-08',
  updated: '2026-10-08',
  edges: ['privacy', 'performance', 'features'],
  competitors: [
    {
      name: 'Adobe Acrobat (Merge PDF)',
      url: 'https://www.adobe.com/acrobat/online/merge-pdf.html',
      weakness:
        'States files are "securely handled by Adobe servers and deleted" unless you sign in to keep them — every PDF is uploaded and processed remotely. The free tool is also capped at 100 files, 500 pages per file, and 1,500 pages in the merged result. (Strength: no watermark, and it can merge password-protected PDFs if you supply the password.)',
    },
    {
      name: 'iLovePDF (Merge PDF)',
      url: 'https://www.ilovepdf.com/merge_pdf',
      weakness:
        "Uploads every file to iLovePDF's servers to merge. Its own pricing page states the free Basic plan is capped at merging 25 PDF files and 100MB per task — unlimited merging is a paid Premium feature. (Strength: shows a thumbnail cover per file with a show/hide toggle, and can import from Google Drive or Dropbox.)",
    },
    {
      name: 'Smallpdf (Merge PDF)',
      url: 'https://smallpdf.com/merge-pdf',
      weakness:
        'Uploads files to Smallpdf servers over TLS and only auto-deletes them after one hour, so documents sit on a third-party server in the meantime. Independent reviews consistently report its free plan is limited to 2 tasks per day shared across every Smallpdf tool, with no batch processing. (Strength: shows real page thumbnails and lets you delete or rotate individual pages before merging, not just reorder whole files.)',
    },
    {
      name: 'Jotform PDF Merger (jform.co.kr)',
      url: 'https://www.jform.co.kr/pdf/merge/',
      weakness:
        '병합할 PDF 개수와 페이지 수는 제한이 없다고 안내하지만, 파일당 크기는 "최대 30MB"로 제한되어 있어 스캔한 문서처럼 용량이 큰 PDF 한 장이 그 자체로 한도를 넘을 수 있다. (Strength: 파일 개수·페이지 수 제한이 없다는 점은 이 도구와 동일하다.)',
    },
  ],
  related: ['split-pdf', 'compress-pdf', 'sign-pdf', 'image-to-pdf', 'image-compressor', 'heic-to-jpg'],
};

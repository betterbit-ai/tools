import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'reorder-pdf',
  category: 'pdf',
  icon: 'reorder',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'performance', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'Adobe Acrobat (Rearrange PDF Pages)',
      url: 'https://www.adobe.com/acrobat/online/rearrange-pdf.html',
      weakness:
        'The English page says a file is handled by Adobe servers, then the workflow uploads it and asks the user to sign in before saving. Its Korean page says a signed-out user can complete only one free operation and download once. This tool keeps the file on-device, has no account step, and makes each page move available with a drag target and visible buttons. (Strength: Adobe can select and move multiple pages together, and offers delete, add, and rotation tools after sign-in.)',
    },
    {
      name: 'PDF24 (Rearrange PDF Pages)',
      url: 'https://tools.pdf24.org/en/rearrange-pdf-pages',
      weakness:
        'Its English page says PDF files are sorted in the cloud on its servers and automatically deleted only after a short period. The same page visibly labels an Advertisement and says the service is free thanks to advertising. This tool never transmits the PDF and has no advertising around the document workflow. (Strength: PDF24 has no registration or time restriction and offers a desktop app.)',
    },
    {
      name: 'Love2PDF (Reorder and Rearrange PDF Pages)',
      url: 'https://www.love2pdf.com/reorder-pdf-pages',
      weakness:
        'Its English result correctly states that it processes one PDF locally with JavaScript, but its documented interaction is drag-and-drop only. This tool also exposes focusable move-earlier and move-later buttons below every preview, so the page order can be changed without relying on a pointer. (Strength: it clearly explains its local pdf-lib implementation and has a dedicated preview-before-download flow.)',
    },
    {
      name: 'Filevolve (PDF 페이지 재정렬)',
      url: 'https://www.filevolve.com/ko/rearrange-pdf',
      weakness:
        'Its Korean result says files remain on-device and describes thumbnail drag-and-drop plus deletion, but it does not present an explicit keyboard page-move workflow in its published instructions. This tool provides labelled up/down controls for each preview alongside drag-and-drop. (Strength: Filevolve combines deletion with page reordering in one local workspace.)',
    },
    {
      name: 'DatumPDF (PDF 페이지 순서 바꾸기)',
      url: 'https://www.datumpdf.com/ko/pdf-peiji-sunseo-bakkugi/',
      weakness:
        'Its Korean page says it sends usage or feedback events while keeping file contents local, and limits a file to 60 MB. This tool does not include tracking around the document workflow and accepts one PDF up to 100 MB. (Strength: it shows original labels alongside the proposed result order and documents its execution limit.)',
    },
    {
      name: '툴한줌 (PDF 페이지 순서 바꾸기)',
      url: 'https://toolhanjum.com/tools/pdf-reorder',
      weakness:
        'Its Korean page asks users to type a complete page-number sequence such as “3,1,2,4” to make a new PDF. That is useful for repetition and omission, but can be error-prone when visually sorting a scan. This tool shows all page thumbnails, supports drag placement, and retains visible page numbers. (Strength: 툴한줌 supports intentional omissions and duplicate page numbers.)',
    },
  ],
  related: ['merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pdf-pages', 'pdf-page-numbers'],
};

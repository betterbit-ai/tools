import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'Up to 100 pages and 100 MB — it stays on this device',
  remove: 'Remove',
  reading: 'Reading pages and creating local previews…',
  pageCount: '{n} page(s)',
  invalidPdf: "This file can't be read as a PDF.",
  encryptedPdf: 'This PDF is password-protected. Remove its password before rotating it.',
  fileSizeLimit: 'This PDF is over the 100 MB browser-safety limit.',
  pageCountLimit: 'This PDF has more than 100 pages, the browser-safety limit for page previews.',
  rotateFailed: "This PDF couldn't be rotated in this browser. Try a smaller PDF.",
  privacyNote: 'Your PDF is read and saved in this browser. Nothing is uploaded.',
  pagesLabel: 'Page previews',
  pageNumber: 'Page {n}',
  pagePreview: 'Preview of page {n}',
  rotateLeft: '↺',
  rotateRight: '↻',
  rotatePageLeft: 'Rotate page {n} left 90 degrees',
  rotatePageRight: 'Rotate page {n} right 90 degrees',
  allPagesLabel: 'All pages',
  allPagesHint: 'Turn every page together, then fine-tune individual thumbnails.',
  rotateAllLeft: 'Rotate all left',
  rotateAllRight: 'Rotate all right',
  reset: 'Reset',
  downloadHint: 'The original stays unchanged. Rotation is saved in a new PDF.',
  saving: 'Saving PDF…',
  download: 'Download rotated PDF',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Rotate PDF — Preview and Turn Each Page Privately',
    description:
      'Rotate PDF pages left or right with page-by-page previews in your browser. Save a new PDF without uploading your document.',
    h1: 'Rotate PDF',
    tagline: 'See every page, turn the ones that need it, then download a corrected PDF — entirely on your device.',
    name: 'Rotate PDF',
    keywords: [
      'rotate pdf',
      'rotate pdf pages',
      'turn pdf pages',
      'rotate one page in pdf',
      'fix sideways pdf',
      'pdf rotate online',
    ],
    howTo: [
      'Drop a PDF into the file area or choose it from your device.',
      'Wait for the local preview of every page to appear.',
      'Use the arrows below an individual thumbnail, or turn all pages at once.',
      'Check the rotated thumbnail, then download the new PDF.',
    ],
    sections: [
      {
        heading: 'Turn one PDF page without changing the rest',
        body: 'Each thumbnail has its own left and right turn controls. A 90° turn fixes a sideways scan; two turns make a 180° upside-down correction. The All pages controls are useful when every page came from the scanner in the same direction, while individual controls let mixed documents stay mixed only where needed.',
      },
      {
        heading: 'Rotation is saved as page orientation, not a screenshot',
        body: 'A PDF page can carry a rotation value of 0°, 90°, 180°, or 270°. This tool writes the chosen orientation into a new PDF instead of converting pages to images. That keeps selectable text, vectors, links, and the source image resolution in the downloaded document. Your original file is not modified.',
      },
      {
        heading: 'Private previews and a practical browser limit',
        body: 'The PDF and its preview images are created locally in this browser, so the file is never sent to Betterbit. To keep a tab responsive while rendering every thumbnail, this tool accepts one PDF up to 100 MB and 100 pages. Password-protected PDFs need to be unlocked before a browser can read their pages.',
      },
    ],
    faq: [
      {
        q: 'How do I rotate just one page in a PDF?',
        a: 'Choose the PDF, find the page in the thumbnail grid, and use its left or right arrow. Only that page receives a 90° turn; the other page orientations stay unchanged when you download the new PDF.',
      },
      {
        q: 'Can I rotate every page in a PDF at once?',
        a: 'Yes. Use Rotate all left or Rotate all right to turn every page by 90°, then use individual thumbnail controls to correct any exceptions before downloading.',
      },
      {
        q: 'Does rotating a PDF reduce quality?',
        a: 'No. This tool changes the PDF page rotation value rather than rasterizing the page. Text remains selectable, vectors remain vectors, and embedded images retain their source resolution.',
      },
      {
        q: 'Are PDFs uploaded when I rotate them here?',
        a: 'No. Previewing and saving happen in your browser, and the PDF is not uploaded to a Betterbit server. The tool accepts one local PDF up to 100 MB and 100 pages.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 회전 — 페이지별 미리보기로 방향 수정',
    description:
      'PDF 페이지를 썸네일로 확인하며 왼쪽 또는 오른쪽으로 회전합니다. 파일을 업로드하지 않고 브라우저에서 새 PDF로 저장합니다.',
    h1: 'PDF 회전',
    tagline: '각 페이지 방향을 미리 보고 필요한 페이지만 돌린 뒤, 기기 안에서 새 PDF를 다운로드합니다.',
    name: 'PDF 회전',
    keywords: [
      'pdf 회전',
      'pdf 페이지 회전',
      'pdf 90도 회전',
      'pdf 방향 바꾸기',
      'pdf 한 페이지만 회전',
      'pdf 가로 세로 바꾸기',
    ],
    howTo: [
      'PDF를 파일 영역에 끌어 놓거나 기기에서 선택합니다.',
      '브라우저에서 각 페이지의 미리보기가 만들어질 때까지 기다립니다.',
      '각 썸네일 아래 화살표를 누르거나 전체 페이지를 한 번에 회전합니다.',
      '바뀐 썸네일을 확인한 뒤 새 PDF를 다운로드합니다.',
    ],
    sections: [
      {
        heading: '한 페이지만 돌리고 나머지는 그대로 유지',
        body: '페이지마다 왼쪽·오른쪽 회전 버튼이 있어 옆으로 찍힌 스캔본 한 장만 바로잡을 수 있습니다. 90° 회전은 옆으로 누운 페이지에, 180° 회전은 거꾸로 된 페이지에 사용합니다. 모든 페이지가 같은 방향으로 잘못된 경우에는 전체 회전 후 예외 페이지만 개별적으로 다시 조정하면 됩니다.',
      },
      {
        heading: '이미지로 바꾸지 않고 PDF 방향만 저장',
        body: 'PDF 페이지의 회전 값은 0°, 90°, 180°, 270° 중 하나입니다. 이 도구는 페이지를 이미지로 다시 만들지 않고 선택한 방향 값을 새 PDF에 기록합니다. 따라서 텍스트 선택, 벡터 도형, 링크와 원본 이미지 해상도를 유지하며 원본 파일은 변경하지 않습니다.',
      },
      {
        heading: '파일은 브라우저 안에서만 처리',
        body: 'PDF 읽기, 썸네일 생성, 저장은 모두 현재 브라우저에서 처리되므로 Betterbit 서버로 파일이 전송되지 않습니다. 모든 페이지의 미리보기를 안정적으로 만들기 위해 한 파일 기준 100MB, 100페이지까지 지원합니다. 비밀번호가 걸린 PDF는 먼저 잠금을 해제해야 읽을 수 있습니다.',
      },
    ],
    faq: [
      {
        q: 'PDF에서 한 페이지만 회전하려면 어떻게 하나요?',
        a: 'PDF를 선택한 뒤 썸네일 목록에서 해당 페이지를 찾고 왼쪽 또는 오른쪽 화살표를 누릅니다. 해당 페이지만 90° 회전하며, 다운로드한 새 PDF에서도 다른 페이지의 방향은 바뀌지 않습니다.',
      },
      {
        q: 'PDF 전체 페이지를 한 번에 회전할 수 있나요?',
        a: '네. 전체 왼쪽 회전 또는 전체 오른쪽 회전을 누르면 모든 페이지가 90°씩 회전합니다. 이후 개별 썸네일 버튼으로 일부 페이지를 추가 조정할 수 있습니다.',
      },
      {
        q: 'PDF를 회전하면 화질이 떨어지나요?',
        a: '아니요. 이 도구는 페이지를 이미지로 변환하지 않고 PDF의 회전 값만 바꿉니다. 따라서 텍스트 선택과 검색, 벡터 요소, 포함된 이미지의 원래 해상도가 유지됩니다.',
      },
      {
        q: 'PDF 파일이 서버에 업로드되나요?',
        a: '아니요. 미리보기와 저장은 브라우저에서 이루어지며 Betterbit 서버로 업로드되지 않습니다. 파일당 최대 100MB, 100페이지의 PDF를 처리할 수 있습니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어 놓거나 클릭하여 선택',
      dropHint: '100페이지·100MB까지 — 파일은 이 기기에만 남습니다',
      remove: '제거',
      reading: '페이지를 읽고 기기 안에서 미리보기를 만드는 중…',
      pageCount: '{n}페이지',
      invalidPdf: '이 파일을 PDF로 읽을 수 없습니다.',
      encryptedPdf: '비밀번호로 보호된 PDF입니다. 회전하려면 먼저 비밀번호를 제거해야 합니다.',
      fileSizeLimit: '이 PDF는 브라우저 안전 한도인 100MB를 초과합니다.',
      pageCountLimit: '이 PDF는 페이지별 미리보기의 브라우저 안전 한도인 100페이지를 초과합니다.',
      rotateFailed: '이 브라우저에서 PDF를 회전할 수 없습니다. 더 작은 PDF로 시도해 보세요.',
      privacyNote: 'PDF 읽기와 저장은 이 브라우저에서만 처리됩니다. 파일은 업로드되지 않습니다.',
      pagesLabel: '페이지 미리보기',
      pageNumber: '{n}페이지',
      pagePreview: '{n}페이지 미리보기',
      rotateLeft: '↺',
      rotateRight: '↻',
      rotatePageLeft: '{n}페이지 왼쪽으로 90도 회전',
      rotatePageRight: '{n}페이지 오른쪽으로 90도 회전',
      allPagesLabel: '전체 페이지',
      allPagesHint: '모든 페이지를 함께 돌린 뒤, 필요한 썸네일만 개별 조정합니다.',
      rotateAllLeft: '전체 왼쪽 회전',
      rotateAllRight: '전체 오른쪽 회전',
      reset: '초기화',
      downloadHint: '원본 파일은 바뀌지 않습니다. 회전 결과는 새 PDF로 저장합니다.',
      saving: 'PDF 저장 중…',
      download: '회전한 PDF 다운로드',
    },
  },
};

import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'Up to 100 pages and 100 MB — it stays on this device',
  remove: 'Remove',
  reading: 'Reading pages and creating local previews…',
  pageCount: '{n} page(s)',
  invalidPdf: "This file can't be read as a PDF.",
  encryptedPdf: 'This PDF is password-protected. Remove its password before reordering it.',
  fileSizeLimit: 'This PDF is over the 100 MB browser-safety limit.',
  pageCountLimit: 'This PDF has more than 100 pages, the browser-safety limit for page previews.',
  reorderFailed: "This PDF couldn't be reordered in this browser. Try a smaller PDF.",
  privacyNote: 'Your PDF is read and saved in this browser. Nothing is uploaded.',
  dragHint: 'Drag a thumbnail onto another thumbnail to place it there.',
  tabKey: 'Tab',
  keyboardHint: 'moves through the visible move buttons.',
  pagesLabel: 'Pages in new PDF order',
  position: 'Position {n}',
  sourcePage: 'Source {n}',
  pagePreview: 'Preview of original page {n}',
  moveUp: '↑',
  moveDown: '↓',
  moveEarlier: 'Move original page {n} earlier',
  moveLater: 'Move original page {n} later',
  orderLabel: 'Page order',
  orderHint: 'Reverse every page at once, or reset to the source order.',
  reverse: 'Reverse order',
  reset: 'Reset',
  downloadHint: 'The original stays unchanged. The new PDF contains the order shown in the grid.',
  saving: 'Saving PDF…',
  download: 'Download reordered PDF',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Rearrange PDF Pages — Private Drag-and-Drop Order',
    description:
      'Rearrange PDF pages by dragging local previews, or use keyboard-accessible move buttons. Download a new PDF without uploading your document.',
    h1: 'Rearrange PDF Pages',
    tagline: 'Put pages in the right order with drag-and-drop or visible keyboard controls — entirely on your device.',
    name: 'Rearrange PDF Pages',
    keywords: [
      'rearrange pdf pages',
      'reorder pdf pages',
      'change pdf page order',
      'organize pdf pages',
      'sort pdf pages',
      'reverse pdf pages',
    ],
    howTo: [
      'Drop one PDF into the file area or choose it from your device.',
      'Wait for the browser to create a thumbnail for each page.',
      'Drag a thumbnail onto its new position, or use its up and down buttons.',
      'Use Reverse order for a complete reversal, if needed.',
      'Check the position labels, then download the reordered PDF.',
    ],
    sections: [
      {
        heading: 'The grid is the exact order of the downloaded PDF',
        body: 'Every card shows both its position in the new file and its original source-page number. Drag any thumbnail onto another thumbnail to move it to that position. The up and down buttons provide the same move one step at a time, so the task does not depend on precise dragging with a mouse or touchscreen. Reverse order changes 1, 2, 3… into the last page through the first page in one action.',
      },
      {
        heading: 'Reordering copies PDF pages instead of turning them into images',
        body: 'The saved file is assembled by copying the original PDF pages in the order shown. A page is not rendered into a screenshot during saving, so ordinary selectable text, vector artwork, and embedded image resolution remain page content rather than being deliberately flattened. The original file is never overwritten; downloading creates a separate file ending in _reordered.pdf.',
      },
      {
        heading: 'Private previewing with a practical browser limit',
        body: 'Adobe’s online rearrange tool says files are handled on Adobe servers and asks users to sign in before saving. PDF24 says its sorting runs on servers and displays advertising. Here, the document, thumbnail previews, and output stay in the current browser. To keep a browser tab responsive while making every preview, the limit is one PDF of up to 100 MB and 100 pages. Password-protected PDFs must be unlocked before the browser can read them.',
      },
    ],
    faq: [
      {
        q: 'How do I rearrange pages in a PDF?',
        a: 'Choose one PDF, then drag a page thumbnail onto the position where it belongs. The grid immediately shows the new order; download the new PDF when every Position label is correct.',
      },
      {
        q: 'Can I reorder PDF pages without uploading the file?',
        a: 'Yes. This tool reads the PDF, creates thumbnails, and writes the reordered PDF in the browser on your device. The document itself is not uploaded to a Betterbit server.',
      },
      {
        q: 'Can I reorder PDF pages with only a keyboard?',
        a: 'Yes. Tab to the up or down button below a page preview and activate it to move that original page by one position. The buttons are disabled at the first and last possible positions.',
      },
      {
        q: 'Does rearranging PDF pages change their quality?',
        a: 'This tool copies complete PDF pages into a new order rather than saving thumbnail images. The page content is not intentionally rasterized or compressed during reordering, although complex PDFs can carry their own existing limitations.',
      },
      {
        q: 'What PDF size can I reorder here?',
        a: 'This tool accepts one PDF up to 100 MB and 100 pages so it can create all thumbnails locally without making a browser tab unresponsive.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 페이지 순서 바꾸기 — 업로드 없는 드래그 정렬',
    description:
      'PDF 페이지를 미리보기에서 드래그하거나 키보드 이동 버튼으로 순서 변경합니다. 파일을 올리지 않고 새 PDF로 바로 저장합니다.',
    h1: 'PDF 페이지 순서 바꾸기',
    tagline: '드래그와 키보드 버튼으로 페이지를 원하는 위치에 놓고, 파일을 업로드하지 않은 채 새 PDF로 저장합니다.',
    name: 'PDF 페이지 순서 바꾸기',
    keywords: [
      'pdf 페이지 순서 바꾸기',
      'pdf 페이지 순서 변경',
      'pdf 페이지 재정렬',
      'pdf 순서 바꾸기',
      'pdf 쪽 순서 바꾸기',
      'pdf 페이지 역순',
    ],
    howTo: [
      'PDF 파일을 파일 영역에 끌어 놓거나 기기에서 선택합니다.',
      '브라우저에서 각 페이지 미리보기가 만들어질 때까지 기다립니다.',
      '미리보기를 원하는 위치로 끌거나 위·아래 이동 버튼을 누릅니다.',
      '전체 순서를 뒤집어야 하면 순서 뒤집기를 누릅니다.',
      '위치와 원본 페이지 번호를 확인한 뒤 새 PDF를 다운로드합니다.',
    ],
    sections: [
      {
        heading: '격자에 보이는 순서 그대로 새 PDF에 저장',
        body: '각 카드에는 새 PDF에서의 위치와 원본 페이지 번호가 함께 표시됩니다. 미리보기 하나를 다른 미리보기 위로 끌면 그 위치로 이동합니다. 마우스나 터치로 정확히 끌기 어려운 경우에는 카드 아래의 위·아래 버튼을 눌러 한 칸씩 이동할 수 있습니다. 순서 뒤집기는 1, 2, 3… 순서를 마지막 페이지부터 첫 페이지까지 한 번에 바꿉니다.',
      },
      {
        heading: '페이지를 이미지로 바꾸지 않고 순서만 새로 만듭니다',
        body: '다운로드 파일은 현재 격자에 보이는 순서대로 원본 PDF 페이지를 복사해 만듭니다. 저장할 때 페이지를 화면 캡처 이미지로 다시 만들지 않으므로 선택 가능한 글자, 벡터 도형, 포함된 이미지 해상도를 의도적으로 평면화하지 않습니다. 원본 파일은 덮어쓰지 않으며, _reordered.pdf가 붙은 별도 파일을 다운로드합니다.',
      },
      {
        heading: '파일을 올리지 않는 페이지 미리보기',
        body: 'Adobe 온라인 재정렬 도구는 파일을 Adobe 서버에서 처리하며 저장하려면 로그인을 안내합니다. PDF24는 서버 처리와 광고 표시를 안내합니다. 이 도구는 문서 읽기, 미리보기 생성, 결과 저장을 현재 브라우저에서만 처리합니다. 모든 미리보기를 안정적으로 만들기 위해 PDF 1개 기준 100MB, 100페이지까지 지원합니다. 비밀번호가 걸린 PDF는 먼저 잠금을 해제해야 읽을 수 있습니다.',
      },
    ],
    faq: [
      {
        q: 'PDF 페이지 순서를 바꾸려면 어떻게 하나요?',
        a: 'PDF 1개를 선택한 뒤 페이지 미리보기를 원하는 위치로 끌어 놓습니다. 격자가 즉시 새 순서를 보여 주며, 각 위치 번호가 맞는지 확인한 후 새 PDF를 다운로드하면 됩니다.',
      },
      {
        q: 'PDF 파일을 업로드하지 않고 순서를 바꿀 수 있나요?',
        a: '네. PDF 읽기, 썸네일 생성, 순서 변경 결과 저장이 모두 현재 브라우저와 기기 안에서 이루어집니다. 문서 파일 자체는 Betterbit 서버로 전송되지 않습니다.',
      },
      {
        q: '키보드만으로 PDF 페이지 순서를 바꿀 수 있나요?',
        a: '네. 페이지 미리보기 아래의 위 또는 아래 버튼까지 Tab으로 이동한 뒤 실행하면 해당 원본 페이지가 한 칸 이동합니다. 맨 앞과 맨 뒤에서는 더 이동할 수 없는 버튼이 비활성화됩니다.',
      },
      {
        q: 'PDF 페이지 순서를 바꾸면 화질이 떨어지나요?',
        a: '이 도구는 썸네일 이미지를 저장하는 대신 PDF의 전체 페이지를 새 순서로 복사합니다. 따라서 순서 변경 과정에서 페이지 내용을 의도적으로 이미지화하거나 압축하지 않습니다.',
      },
      {
        q: '어느 정도 크기의 PDF까지 순서를 바꿀 수 있나요?',
        a: '브라우저에서 모든 페이지 미리보기를 안정적으로 만들기 위해 PDF 1개 기준 최대 100MB, 100페이지까지 지원합니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: '최대 100페이지, 100MB — 파일은 이 기기에만 남습니다',
      remove: '제거',
      reading: '페이지를 읽고 이 기기에서 미리보기를 만드는 중…',
      pageCount: '{n}페이지',
      invalidPdf: '이 파일은 PDF로 읽을 수 없습니다.',
      encryptedPdf: '비밀번호로 보호된 PDF입니다. 잠금을 해제한 뒤 순서를 바꾸세요.',
      fileSizeLimit: '이 PDF는 브라우저 안전 한도인 100MB를 넘습니다.',
      pageCountLimit: '이 PDF는 페이지 미리보기의 브라우저 안전 한도인 100페이지를 넘습니다.',
      reorderFailed: '이 브라우저에서 PDF 순서를 바꿀 수 없습니다. 더 작은 PDF로 시도하세요.',
      privacyNote: 'PDF 읽기와 저장은 이 브라우저에서만 처리됩니다. 파일은 업로드되지 않습니다.',
      dragHint: '미리보기를 다른 미리보기 위로 끌면 그 위치로 이동합니다.',
      tabKey: 'Tab',
      keyboardHint: '으로 이동 버튼을 차례로 선택할 수 있습니다.',
      pagesLabel: '새 PDF의 페이지 순서',
      position: '{n}번째 위치',
      sourcePage: '원본 {n}페이지',
      pagePreview: '원본 {n}페이지 미리보기',
      moveUp: '↑',
      moveDown: '↓',
      moveEarlier: '원본 {n}페이지를 앞으로 이동',
      moveLater: '원본 {n}페이지를 뒤로 이동',
      orderLabel: '페이지 순서',
      orderHint: '전체 순서를 뒤집거나 원본 순서로 되돌릴 수 있습니다.',
      reverse: '순서 뒤집기',
      reset: '초기화',
      downloadHint: '원본 파일은 바뀌지 않습니다. 격자에 보이는 순서대로 새 PDF를 만듭니다.',
      saving: 'PDF 저장 중…',
      download: '순서 바꾼 PDF 다운로드',
    },
  },
};

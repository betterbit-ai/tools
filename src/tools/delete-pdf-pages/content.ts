import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'Up to 100 pages and 100 MB — it stays on this device',
  remove: 'Remove',
  reading: 'Reading pages and creating local previews…',
  pageCount: '{n} page(s)',
  invalidPdf: "This file can't be read as a PDF.",
  encryptedPdf: 'This PDF is password-protected. Remove its password before deleting pages.',
  fileSizeLimit: 'This PDF is over the 100 MB browser-safety limit.',
  pageCountLimit: 'This PDF has more than 100 pages, the browser-safety limit for page previews.',
  deleteFailed: "This PDF couldn't be saved in this browser. Try a smaller PDF.",
  privacyNote: 'Your PDF is read and saved in this browser. Nothing is uploaded.',
  pagesLabel: 'PDF page previews',
  pageNumber: 'Page {n}',
  pagePreview: 'Preview of page {n}',
  deletePage: 'Mark page {n} for deletion',
  restorePage: 'Keep page {n}',
  markedForDeletion: 'Delete',
  keepPage: 'Keep',
  rangeLabel: 'Pages to delete',
  rangeHint: 'Use commas and ranges, for example 2, 5-7. Leave blank to keep every page.',
  rangePlaceholder: '2, 5-7',
  rangeSyntaxError: '“{part}” is not a valid page number or range.',
  rangeOutOfBounds: 'Page {page} is outside this {n}-page PDF.',
  keepOnePage: 'Keep at least one page in the PDF.',
  selectedCount: 'Marked for deletion',
  remainingCount: 'Pages remaining',
  downloadHint: 'The original stays unchanged. A new PDF is created with the pages you keep.',
  saving: 'Saving PDF…',
  download: 'Download new PDF',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Delete Pages from PDF — Private Local Page Remover',
    description:
      'Delete PDF pages by clicking thumbnails or typing page ranges. Your document stays in your browser, with no upload.',
    h1: 'Delete Pages from PDF',
    tagline: 'Click the pages to remove, check what remains, and download a new PDF — entirely on your device.',
    name: 'Delete PDF Pages',
    keywords: [
      'delete pages from pdf',
      'remove pages from pdf',
      'delete pdf pages online',
      'remove blank pages from pdf',
      'delete one page from pdf',
      'pdf page remover',
    ],
    howTo: [
      'Drop a PDF into the file area or choose it from your device.',
      'Click thumbnails to mark pages for deletion, or enter numbers such as 2, 5-7.',
      'Check the selected and remaining page counts.',
      'Download the new PDF; the original file is unchanged.',
    ],
    sections: [
      {
        heading: 'Choose pages visually or enter a page range',
        body: 'Every page appears as a selectable thumbnail so blank scans, duplicate sheets, covers, and appendices can be checked before removal. For a long document, type page numbers instead: “2, 5-7” removes page 2 and pages 5 through 7. The selection is reflected in both the thumbnail grid and the range field, and this tool always requires at least one page to remain.',
      },
      {
        heading: 'A new PDF keeps the pages you selected',
        body: 'Deleting pages creates a separate PDF; it does not change the source file on your device. The downloaded document is built by copying its kept PDF pages, rather than making screenshots, so page dimensions, selectable text, vectors, and embedded images are retained. Links, bookmarks, or page-number references aimed at a removed page can need checking afterward.',
      },
      {
        heading: 'Private local processing with practical limits',
        body: 'Previewing and saving happen in this browser, so Betterbit does not receive your PDF. To keep all previews responsive, one file can contain up to 100 pages and be up to 100 MB. Password-protected PDFs must be unlocked first because the browser cannot inspect or copy their pages without the password.',
      },
    ],
    faq: [
      {
        q: 'How do I delete a specific page from a PDF?',
        a: 'Choose the PDF, click the thumbnail for the page to mark it for deletion, then download the new file. You can also type the page number in the Pages to delete field; for example, “4” removes only page 4.',
      },
      {
        q: 'Can I delete several non-consecutive PDF pages?',
        a: 'Yes. Click any combination of page thumbnails, or enter comma-separated page numbers and ranges such as “1, 4, 8-10”. The tool removes only those pages and retains their original order for every other page.',
      },
      {
        q: 'Will deleting pages reduce PDF quality?',
        a: 'No. The downloaded file copies the PDF pages that remain instead of converting them to images, so their original dimensions, selectable text, vector graphics, and embedded image resolution are retained.',
      },
      {
        q: 'Are PDFs uploaded when I delete pages here?',
        a: 'No. This tool previews and creates the new PDF in your browser, without uploading the file to Betterbit. It accepts one local PDF up to 100 MB and 100 pages.',
      },
      {
        q: 'Can I remove every page in a PDF?',
        a: 'No. A PDF needs at least one page, so this tool keeps the final page selected for output and prevents a selection that would remove all pages.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 페이지 삭제 — 업로드 없이 썸네일로 선택',
    description:
      'PDF에서 필요 없는 페이지를 썸네일 클릭 또는 범위 입력으로 삭제합니다. 파일을 업로드하지 않고 브라우저에서 새 PDF를 만듭니다.',
    h1: 'PDF 페이지 삭제',
    tagline: '지울 페이지를 썸네일로 확인하고, 남는 페이지 수를 확인한 뒤 기기 안에서 새 PDF를 저장합니다.',
    name: 'PDF 페이지 삭제',
    keywords: [
      'pdf 페이지 삭제',
      'pdf 특정 페이지 삭제',
      'pdf 불필요한 페이지 삭제',
      'pdf 빈 페이지 삭제',
      'pdf 페이지 제거',
      'pdf 페이지 지우기',
    ],
    howTo: [
      'PDF를 파일 영역에 끌어 놓거나 기기에서 선택합니다.',
      '삭제할 썸네일을 누르거나 “2, 5-7”처럼 페이지 번호를 입력합니다.',
      '삭제 예정과 남는 페이지 수를 확인합니다.',
      '새 PDF를 다운로드합니다. 원본 파일은 변경되지 않습니다.',
    ],
    sections: [
      {
        heading: '썸네일 클릭 또는 페이지 범위로 선택',
        body: '빈 스캔, 중복된 장, 표지, 부록처럼 빼려는 페이지를 썸네일로 보면서 선택할 수 있습니다. 긴 문서는 번호로 빠르게 지정합니다. 예를 들어 “2, 5-7”을 입력하면 2페이지와 5~7페이지가 삭제 대상으로 표시됩니다. 썸네일 선택과 번호 입력은 서로 즉시 반영되며, 결과 PDF에는 최소 1페이지가 남도록 제한합니다.',
      },
      {
        heading: '남길 페이지만 새 PDF로 복사',
        body: '페이지를 삭제해도 기기에 있는 원본 PDF는 바뀌지 않습니다. 다운로드 파일은 남기기로 한 PDF 페이지를 새 문서에 복사해서 만듭니다. 따라서 페이지 크기, 선택 가능한 텍스트, 벡터 요소, 포함된 이미지 해상도를 이미지 변환 없이 유지합니다. 다만 삭제한 페이지를 가리키던 링크·책갈피·쪽수 참조는 저장 후 확인해야 할 수 있습니다.',
      },
      {
        heading: '업로드 없이 브라우저 안에서 처리',
        body: '미리보기 생성과 새 PDF 저장은 현재 브라우저에서만 이루어지므로 Betterbit 서버로 PDF가 전송되지 않습니다. 모든 썸네일을 안정적으로 표시하기 위해 파일 1개당 100MB, 100페이지까지 처리합니다. 비밀번호가 설정된 PDF는 브라우저에서 페이지를 읽고 복사할 수 있도록 먼저 잠금을 해제해야 합니다.',
      },
    ],
    faq: [
      {
        q: 'PDF에서 특정 페이지만 삭제하려면 어떻게 하나요?',
        a: 'PDF를 선택한 뒤 삭제할 페이지의 썸네일을 누르고 새 PDF를 다운로드하면 됩니다. “삭제할 페이지” 입력란에 “4”처럼 번호를 입력하면 4페이지만 삭제 대상으로 지정할 수도 있습니다.',
      },
      {
        q: '서로 떨어진 여러 PDF 페이지도 한 번에 삭제할 수 있나요?',
        a: '네. 필요한 썸네일을 각각 누르거나 “1, 4, 8-10”처럼 쉼표와 범위를 섞어 입력할 수 있습니다. 지정한 페이지들만 삭제하고 나머지 페이지는 원래 순서대로 새 PDF에 남깁니다.',
      },
      {
        q: 'PDF 페이지를 삭제하면 화질이 떨어지나요?',
        a: '아니요. 이 도구는 남길 페이지를 이미지로 다시 만들지 않고 새 PDF에 복사합니다. 따라서 원래 페이지 크기, 선택 가능한 텍스트, 벡터 그래픽, 포함된 이미지 해상도를 유지합니다.',
      },
      {
        q: 'PDF 파일이 서버에 업로드되나요?',
        a: '아니요. 이 도구는 브라우저 안에서 미리보기와 새 PDF 생성을 처리하며 Betterbit 서버로 파일을 업로드하지 않습니다. 파일당 최대 100MB, 100페이지의 PDF를 처리할 수 있습니다.',
      },
      {
        q: 'PDF의 모든 페이지를 삭제할 수 있나요?',
        a: '아니요. PDF에는 적어도 1페이지가 있어야 하므로 이 도구는 마지막 남은 페이지까지 삭제하는 선택을 막습니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어 놓거나 클릭하여 선택',
      dropHint: '100페이지·100MB까지 — 파일은 이 기기에만 남습니다',
      remove: '제거',
      reading: '페이지를 읽고 기기 안에서 미리보기를 만드는 중…',
      pageCount: '{n}페이지',
      invalidPdf: '이 파일을 PDF로 읽을 수 없습니다.',
      encryptedPdf: '비밀번호로 보호된 PDF입니다. 페이지를 삭제하려면 먼저 비밀번호를 제거해야 합니다.',
      fileSizeLimit: '이 PDF는 브라우저 안전 한도인 100MB를 초과합니다.',
      pageCountLimit: '이 PDF는 페이지별 미리보기의 브라우저 안전 한도인 100페이지를 초과합니다.',
      deleteFailed: '이 브라우저에서 새 PDF를 저장할 수 없습니다. 더 작은 PDF로 시도해 보세요.',
      privacyNote: 'PDF 읽기와 저장은 이 브라우저에서만 처리됩니다. 파일은 업로드되지 않습니다.',
      pagesLabel: 'PDF 페이지 미리보기',
      pageNumber: '{n}페이지',
      pagePreview: '{n}페이지 미리보기',
      deletePage: '{n}페이지를 삭제 대상으로 표시',
      restorePage: '{n}페이지 유지',
      markedForDeletion: '삭제',
      keepPage: '유지',
      rangeLabel: '삭제할 페이지',
      rangeHint: '쉼표와 범위를 사용합니다. 예: 2, 5-7. 비워 두면 모든 페이지를 유지합니다.',
      rangePlaceholder: '2, 5-7',
      rangeSyntaxError: '“{part}”은(는) 올바른 페이지 번호 또는 범위가 아닙니다.',
      rangeOutOfBounds: '{page}페이지는 이 PDF의 {n}페이지 범위를 벗어납니다.',
      keepOnePage: 'PDF에는 최소 1페이지를 남겨야 합니다.',
      selectedCount: '삭제 예정',
      remainingCount: '남는 페이지',
      downloadHint: '원본 파일은 바뀌지 않습니다. 남길 페이지로 새 PDF를 만듭니다.',
      saving: 'PDF 저장 중…',
      download: '새 PDF 다운로드',
    },
  },
};

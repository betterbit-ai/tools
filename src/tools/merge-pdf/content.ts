import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop PDFs here, or click to choose',
  dropHint: 'As many files as you like, in any order',
  pageCount: '{n} page(s)',
  processing: 'Reading…',
  invalidPdf: "Can't be read — this file isn't a valid PDF.",
  encryptedPdf: "Password-protected — can't be merged until it's unlocked.",
  mergeFailed:
    "Couldn't merge these files — they may be too large for your browser's available memory. Try removing one and merging in smaller batches.",
  moveUp: 'Move up',
  moveDown: 'Move down',
  remove: 'Remove',
  download: 'Download merged PDF',
  clear: 'Clear all',
  privacyNote: 'Your PDFs are combined on your device. Nothing is uploaded, and there is no file limit.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Merge PDF — Combine Files Online, No Upload',
    description:
      'Combine multiple PDF files into one, in your browser. Drag to reorder, no file-count or size limit, no upload, no ads, no sign-up.',
    h1: 'Merge PDF',
    tagline: 'Combine PDF files into one — drag to set the order — without uploading anything.',
    name: 'Merge PDF',
    keywords: [
      'merge pdf',
      'combine pdf',
      'join pdf files',
      'pdf merger',
      'merge pdf files into one',
      'combine pdf online',
    ],
    howTo: [
      'Drop in two or more PDFs, or click to choose files from your device.',
      'Drag the rows (or use the ↑/↓ buttons) to put the files in the order you want them merged.',
      'Check the page count next to each file — anything unreadable or password-protected is flagged in red.',
      'Click Download merged PDF — the combined file is assembled on your device in a moment.',
    ],
    sections: [
      {
        heading: 'How merging works here',
        body: "Each PDF keeps every page exactly as it was — text, images, fonts and layout are copied as-is, not re-rendered or re-compressed, so there is no quality loss. The files are combined in the order shown in the list, top to bottom; drag any row to a new position (or use the keyboard ↑/↓ buttons) and the merged file updates automatically. There is no limit on how many files you combine or how large they are beyond what your device's memory can hold — most PDF mergers cap this at a fixed file count or page total, and this one does not.",
      },
      {
        heading: 'Nothing leaves your device',
        body: 'Adobe Acrobat’s free merge tool processes your files on Adobe’s servers and deletes them afterward unless you sign in; iLovePDF and Smallpdf work the same way, uploading every PDF before merging it and auto-deleting copies later (Smallpdf states one hour). This tool reads and combines the files entirely in your browser using a small PDF library loaded on the page — your documents and the merged result never cross the network, which matters for contracts, IDs or anything else you would not want sitting on someone else’s server.',
      },
      {
        heading: 'What about free-plan limits elsewhere?',
        body: "Most of the free online mergers cap what you can do without paying: Adobe's free tier stops at 100 files, 500 pages per file, and 1,500 pages total in the merged PDF; iLovePDF's free Basic plan caps merging at 25 files and 100MB per task (unlimited is a paid Premium feature). This tool has no such cap built in — it merges as many files as your browser can hold in memory.",
      },
      {
        heading: 'Password-protected PDFs',
        body: 'A PDF that is encrypted with an open or permissions password can\'t be merged here yet — it will show as "password-protected" in the file list and is skipped from the merge so the rest of your files still combine normally. Remove the password in a PDF reader first (or use this tool\'s companion once available), then re-add the file.',
      },
    ],
    faq: [
      {
        q: 'Are my PDF files uploaded anywhere?',
        a: 'No. Reading each file, reordering them, and assembling the merged PDF all happen in your browser. You can disconnect from the internet after the page loads and it still works.',
      },
      {
        q: 'How many PDF files can I merge at once?',
        a: 'There is no fixed limit on the number of files or total pages; the practical ceiling is your device’s available memory, which is typically enough for hundreds of ordinary documents.',
      },
      {
        q: 'Can I change the order the files are merged in?',
        a: 'Yes. Drag any file to a new position in the list, or use the ↑ and ↓ buttons for keyboard or touch control — the merged PDF rebuilds automatically each time you reorder.',
      },
      {
        q: 'Does merging reduce the quality of my PDFs?',
        a: 'No. Every page is copied into the merged file exactly as it exists in the source PDF — text stays selectable, images keep their original resolution, and nothing is re-compressed.',
      },
      {
        q: 'Can I merge a password-protected PDF?',
        a: 'Not yet. A PDF locked with a password is detected and skipped (shown as "password-protected" in the list) so it does not break the rest of the merge; remove its password in a PDF reader first, then add it again.',
      },
      {
        q: 'Is there a file size limit?',
        a: 'No fixed limit is enforced by this tool, unlike Adobe’s free plan (1,500 merged pages) or iLovePDF’s free Basic plan (25 files / 100MB per task). The only real ceiling is your browser’s available memory.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 합치기 — 온라인 병합, 업로드 없음',
    description:
      '여러 개의 PDF 파일을 브라우저에서 하나로 합치세요. 순서는 드래그로, 파일 개수·용량 제한 없음, 업로드·광고·가입 없음.',
    h1: 'PDF 합치기',
    tagline: '여러 PDF를 하나로 — 순서는 드래그로, 업로드 없이 바로.',
    name: 'PDF 합치기',
    keywords: ['pdf 합치기', 'pdf 병합', 'pdf 결합', 'pdf 파일 합치기', 'pdf merge', '여러 pdf 하나로'],
    howTo: [
      'PDF 파일 두 개 이상을 끌어다 놓거나, 클릭해서 선택합니다.',
      '목록의 행을 드래그하거나 ↑/↓ 버튼으로 합칠 순서를 정합니다.',
      '각 파일 옆 페이지 수를 확인하세요. 읽을 수 없거나 암호가 걸린 파일은 빨간 글씨로 표시됩니다.',
      '"PDF 다운로드"를 누르면 기기에서 바로 합쳐진 파일이 만들어집니다.',
    ],
    sections: [
      {
        heading: '어떻게 합쳐지나요',
        body: '각 PDF의 모든 페이지는 텍스트, 이미지, 폰트, 레이아웃을 그대로 유지한 채 복사됩니다. 다시 그리거나 압축하지 않으므로 화질 손실이 없습니다. 파일은 목록에 보이는 순서(위에서 아래)대로 합쳐지며, 행을 드래그하거나 키보드 ↑/↓ 버튼으로 순서를 바꾸면 결과 파일이 즉시 다시 만들어집니다. 합칠 수 있는 파일 개수나 용량에는 정해진 제한이 없고, 기기의 메모리가 허락하는 한계까지 합칠 수 있습니다. 대부분의 PDF 합치기 도구는 여기에 고정된 파일 수나 페이지 수 제한을 둡니다.',
      },
      {
        heading: 'PDF가 기기 밖으로 나가지 않습니다',
        body: 'Adobe Acrobat의 무료 합치기는 파일을 Adobe 서버에서 처리하고, 로그인하지 않으면 이후 삭제한다고 안내합니다. iLovePDF와 Smallpdf도 마찬가지로 합치기 전에 모든 PDF를 서버에 업로드하고, 나중에 사본을 삭제합니다(Smallpdf는 1시간 후 삭제라고 명시). 이 도구는 페이지에서 불러온 작은 PDF 라이브러리로 브라우저 안에서만 파일을 읽고 합치므로, 계약서나 신분증처럼 남의 서버에 두고 싶지 않은 문서를 다룰 때 특히 유용합니다.',
      },
      {
        heading: '다른 사이트의 무료 제한',
        body: '대부분의 무료 온라인 합치기 도구는 사용량에 제한을 둡니다. Adobe 무료 버전은 파일 100개, 파일당 500페이지, 합친 결과 1,500페이지까지만 허용합니다. iLovePDF의 무료 Basic 플랜은 한 번에 PDF 25개, 작업당 100MB까지만 합칠 수 있고 무제한 합치기는 유료 Premium 기능입니다. 이 도구에는 그런 제한이 없어 브라우저 메모리가 허용하는 만큼 파일을 합칠 수 있습니다.',
      },
      {
        heading: '암호가 걸린 PDF는',
        body: '열기 암호나 권한 암호로 보호된 PDF는 아직 이 도구에서 합칠 수 없습니다. 목록에서 "암호 보호됨"으로 표시되고 합치기 대상에서 제외되므로, 나머지 파일은 정상적으로 합쳐집니다. PDF 리더에서 먼저 암호를 해제한 뒤 다시 추가해 주세요.',
      },
    ],
    faq: [
      {
        q: 'PDF 파일이 어딘가에 업로드되나요?',
        a: '아니요. 각 파일을 읽고, 순서를 바꾸고, 최종 PDF를 만드는 모든 과정이 브라우저 안에서 이루어집니다. 페이지를 연 뒤 인터넷을 끊어도 그대로 동작합니다.',
      },
      {
        q: '한 번에 PDF를 몇 개까지 합칠 수 있나요?',
        a: '파일 개수나 전체 페이지 수에 정해진 제한은 없습니다. 실제 한계는 기기의 사용 가능한 메모리이며, 보통 수백 개의 일반 문서를 합치기에 충분합니다.',
      },
      {
        q: '합치는 순서를 바꿀 수 있나요?',
        a: '네. 목록에서 파일을 원하는 위치로 드래그하거나, ↑ ↓ 버튼으로 키보드나 터치로도 순서를 바꿀 수 있습니다. 순서를 바꿀 때마다 결과 PDF가 자동으로 다시 만들어집니다.',
      },
      {
        q: 'PDF를 합치면 화질이 떨어지나요?',
        a: '아니요. 모든 페이지는 원본 PDF에 있던 그대로 결과 파일에 복사됩니다. 텍스트는 그대로 선택 가능하고, 이미지도 원래 해상도를 유지하며, 다시 압축되지 않습니다.',
      },
      {
        q: '암호가 걸린 PDF도 합칠 수 있나요?',
        a: '아직은 안 됩니다. 암호로 잠긴 PDF는 자동으로 감지되어 목록에 "암호 보호됨"으로 표시되고 합치기에서 제외되므로 나머지 파일에는 영향을 주지 않습니다. PDF 리더에서 먼저 암호를 해제한 뒤 다시 추가하세요.',
      },
      {
        q: '파일 크기 제한이 있나요?',
        a: '이 도구 자체에는 고정된 제한이 없습니다. Adobe 무료 플랜(합친 결과 1,500페이지)이나 iLovePDF 무료 Basic 플랜(작업당 25개·100MB)과 달리, 실질적인 한계는 브라우저가 쓸 수 있는 메모리뿐입니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: '파일 개수 제한 없음 · 순서는 나중에 조정 가능',
      pageCount: '{n}페이지',
      processing: '읽는 중…',
      invalidPdf: '읽을 수 없음 — 올바른 PDF 파일이 아닙니다.',
      encryptedPdf: '암호 보호됨 — 잠금을 해제해야 합칠 수 있습니다.',
      mergeFailed:
        '파일을 합치지 못했습니다 — 브라우저가 처리할 수 있는 메모리보다 클 수 있습니다. 파일을 하나 줄이거나 나눠서 합쳐 보세요.',
      moveUp: '위로 이동',
      moveDown: '아래로 이동',
      remove: '삭제',
      download: '합친 PDF 다운로드',
      clear: '모두 지우기',
      privacyNote: 'PDF는 내 기기에서 합쳐집니다. 어디에도 업로드되지 않고, 파일 개수 제한도 없습니다.',
    },
  },
};

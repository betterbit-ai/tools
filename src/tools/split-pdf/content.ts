import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'One file — split it into as many parts as you like',
  pageCount: '{n} page(s)',
  processing: 'Reading…',
  invalidPdf: "Can't be read — this file isn't a valid PDF.",
  encryptedPdf: "Password-protected — can't be split until it's unlocked.",
  remove: 'Remove',
  modeLabel: 'Split mode',
  modeRange: 'Range',
  modeEvery: 'Every N pages',
  rangeLabel: 'Pages to split',
  rangeHint: 'Comma-separated pages or ranges, e.g. "1-3, 5, 8-10".',
  rangePlaceholder: '1-3, 5, 8-10',
  perPageToggle: 'Split each page into its own file',
  everyLabel: 'Pages per file',
  everyHint: 'The PDF is cut into consecutive chunks of this many pages.',
  rangeSyntaxError: '"{part}" isn\'t a valid page or range. Use numbers like "1-3, 5".',
  rangeOutOfBounds: 'Page {page} is out of range — this PDF only has {n} pages.',
  splitFailed:
    "Couldn't split this PDF — it may be too large for your browser's available memory. Try a smaller range.",
  download: 'Download PDF',
  downloadZip: 'Download ZIP',
  fileCount: '{n} file(s) ready',
  privacyNote: 'Your PDF is split on your device. Nothing is uploaded, and there is no file-size limit.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Split PDF — Extract Pages or Ranges, No Upload',
    description:
      'Split a PDF by page range, extract every page as its own file, or cut it into equal chunks — in your browser. No upload, no size limit, download as ZIP.',
    h1: 'Split PDF',
    tagline: 'Pull pages or ranges out of a PDF and download them separately, without uploading anything.',
    name: 'Split PDF',
    keywords: [
      'split pdf',
      'pdf splitter',
      'extract pages from pdf',
      'split pdf into pages',
      'pdf page range',
      'divide pdf into multiple files',
    ],
    howTo: [
      'Drop in a PDF, or click to choose one from your device.',
      'Choose Range to type specific pages, or Every N pages to cut the document into equal chunks.',
      'In Range mode, type something like "1-3, 5, 8-10" — turn on "Split each page into its own file" to get one PDF per page instead of per range.',
      'Check the result list, then click Download — one output downloads as a PDF, two or more download together as a ZIP.',
    ],
    sections: [
      {
        heading: 'How splitting works here',
        body: 'Type page numbers and ranges separated by commas — "1-3, 5, 8-10" produces three files by default: pages 1–3, page 5, and pages 8–10, each named after the pages it contains (e.g. "report_p1-3.pdf"). Turn on "Split each page into its own file" and the same input instead produces one file per page, so "1-3, 5, 8-10" becomes five single-page PDFs. The "Every N pages" mode skips typing altogether and cuts the document into equal consecutive chunks — useful for breaking up a long scan into fixed-size pieces. Every page keeps its original text, images and resolution; nothing is re-rendered or re-compressed.',
      },
      {
        heading: 'Nothing leaves your device',
        body: "iLovePDF, Smallpdf and PDF24 all require uploading the PDF to their servers before it can be split. Smallpdf and PDF24 both state copies are auto-deleted only after one hour, so the file sits on a third-party server in the meantime — PDF24 explicitly processes files on a server in Germany. This tool reads and splits the file entirely in your browser using a small PDF library loaded on the page; your document and every resulting part never cross the network, which matters for contracts, transcripts, IDs or anything else you wouldn't want sitting on someone else's server, even briefly.",
      },
      {
        heading: 'No file-size cap, unlike the free plans elsewhere',
        body: "iLovePDF's published pricing lists a free Basic-plan cap of roughly 100MB per split task, and unlimited batch splitting is a paid Premium feature. Jotform's splitter caps uploads at 30MB per file, which a single scanned or image-heavy PDF can exceed on its own. This tool has no such cap built in — the only practical ceiling is how much your browser's available memory can hold, which is normally enough for large, image-heavy PDFs that would be rejected elsewhere.",
      },
      {
        heading: 'Password-protected PDFs',
        body: "A PDF encrypted with an open or permissions password can't be split here yet — it's flagged as \"password-protected\" right after you drop it in, rather than failing silently partway through. Jotform's splitter has the same restriction with no workaround offered. Remove the password in a PDF reader first, then re-add the file.",
      },
    ],
    faq: [
      {
        q: 'Are my PDF files uploaded anywhere?',
        a: 'No. Reading the file, parsing the ranges, and building each output PDF all happen in your browser. You can disconnect from the internet after the page loads and it still works.',
      },
      {
        q: 'Can I extract just a few specific pages from a PDF?',
        a: 'Yes. In Range mode, type the pages or ranges you want, such as "1-3, 5, 8-10" — only those pages are included in the output files, and anything not listed is left out entirely.',
      },
      {
        q: 'How do I split a PDF into one file per page?',
        a: 'Switch to Range mode, enter the full range (it is filled in automatically as "1-N" when the file loads), and turn on "Split each page into its own file" — you get one single-page PDF per page, downloaded together as a ZIP.',
      },
      {
        q: 'Is there a limit on file size or number of pages?',
        a: "No fixed limit is enforced by this tool, unlike iLovePDF's free Basic plan (around 100MB per task) or Jotform's splitter (30MB per file). The only real ceiling is your browser's available memory.",
      },
      {
        q: 'Can I split a password-protected PDF?',
        a: 'Not yet. A PDF locked with a password is detected immediately and shown as "password-protected" instead of being split; remove the password in a PDF reader first, then add the file again.',
      },
      {
        q: 'Do I get a ZIP file or separate PDFs?',
        a: 'If your settings produce exactly one output file, it downloads directly as a PDF. If they produce two or more, all of them download together in a single ZIP file.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 분할 — 페이지·범위 추출, 업로드 없음',
    description:
      'PDF를 원하는 페이지 범위로 나누거나, 모든 페이지를 한 장씩 추출하거나, 일정 페이지 단위로 자르세요. 브라우저에서 바로, 업로드·용량 제한 없이 ZIP으로 받습니다.',
    h1: 'PDF 분할',
    tagline: 'PDF에서 원하는 페이지나 범위만 뽑아 따로 다운로드하세요. 업로드 없이 바로.',
    name: 'PDF 분할',
    keywords: ['pdf 분할', 'pdf 나누기', 'pdf 페이지 추출', 'pdf 페이지별로 나누기', 'pdf 자르기', 'pdf 범위 추출'],
    howTo: [
      'PDF 파일 하나를 끌어다 놓거나, 클릭해서 선택합니다.',
      '특정 페이지를 입력하려면 "범위"를, 일정 페이지 수로 자르려면 "N페이지마다"를 선택합니다.',
      '범위 모드에서 "1-3, 5, 8-10"처럼 입력하세요. "각 페이지를 별도 파일로 나누기"를 켜면 범위 대신 페이지 한 장씩 파일이 만들어집니다.',
      '결과 목록을 확인한 뒤 다운로드를 누르세요. 결과가 1개면 PDF로, 2개 이상이면 ZIP으로 한 번에 받습니다.',
    ],
    sections: [
      {
        heading: '분할은 이렇게 동작합니다',
        body: '쉼표로 구분해 페이지나 범위를 입력하면 — 예를 들어 "1-3, 5, 8-10"은 기본적으로 1~3페이지, 5페이지, 8~10페이지, 이렇게 3개의 파일로 나뉘고 각 파일 이름에는 포함된 페이지가 그대로 들어갑니다(예: "보고서_p1-3.pdf"). "각 페이지를 별도 파일로 나누기"를 켜면 같은 입력이 페이지마다 한 장씩, 즉 5개의 한 장짜리 PDF로 나뉩니다. "N페이지마다" 모드는 입력 없이 문서를 일정한 페이지 수 단위로 순서대로 잘라 주므로, 긴 스캔 문서를 정해진 분량으로 쪼갤 때 편합니다. 모든 페이지는 텍스트·이미지·해상도가 원본 그대로 유지되며 다시 렌더링하거나 압축하지 않습니다.',
      },
      {
        heading: 'PDF가 기기 밖으로 나가지 않습니다',
        body: 'iLovePDF, Smallpdf, PDF24는 모두 분할하기 전에 PDF를 서버에 업로드해야 합니다. Smallpdf와 PDF24는 사본을 1시간 뒤에야 삭제한다고 안내하므로 그 사이 파일이 남의 서버에 남아 있고, PDF24는 독일에 있는 서버에서 처리한다고 명시합니다. 이 도구는 페이지에서 불러온 작은 PDF 라이브러리로 브라우저 안에서만 파일을 읽고 나누므로, 계약서나 신분증, 성적표처럼 잠시라도 남의 서버에 두고 싶지 않은 문서에 특히 유용합니다.',
      },
      {
        heading: '다른 무료 플랜과 달리 용량 제한이 없습니다',
        body: 'iLovePDF의 공개된 가격 정책에는 무료 Basic 플랜에서 분할 작업당 약 100MB의 용량 제한이 있고, 무제한 일괄 분할은 유료 Premium 기능입니다. Jotform의 분할 도구는 파일당 30MB로 제한되어 스캔한 문서 한 장만으로도 한도를 넘을 수 있습니다. 이 도구에는 그런 제한이 없고, 실질적인 한계는 브라우저가 쓸 수 있는 메모리뿐이라 다른 곳에서는 거부될 만큼 큰 이미지 중심 PDF도 보통 처리할 수 있습니다.',
      },
      {
        heading: '암호가 걸린 PDF는',
        body: '열기 암호나 권한 암호로 보호된 PDF는 아직 이 도구에서 나눌 수 없습니다. 파일을 넣는 즉시 "암호 보호됨"으로 표시되어, 작업 중간에 조용히 실패하는 대신 바로 알려줍니다. Jotform의 분할 도구도 같은 제한이 있고 별다른 해결책을 제공하지 않습니다. PDF 리더에서 먼저 암호를 해제한 뒤 다시 추가해 주세요.',
      },
    ],
    faq: [
      {
        q: 'PDF 파일이 어딘가에 업로드되나요?',
        a: '아니요. 파일을 읽고, 범위를 해석하고, 각 결과 PDF를 만드는 모든 과정이 브라우저 안에서 이루어집니다. 페이지를 연 뒤 인터넷을 끊어도 그대로 동작합니다.',
      },
      {
        q: 'PDF에서 특정 페이지만 뽑아낼 수 있나요?',
        a: '네. 범위 모드에서 "1-3, 5, 8-10"처럼 원하는 페이지나 범위를 입력하면 그 페이지들만 결과 파일에 포함되고, 입력하지 않은 페이지는 전부 제외됩니다.',
      },
      {
        q: 'PDF를 한 장씩 모두 나누려면 어떻게 하나요?',
        a: '범위 모드에서 파일을 불러오면 자동으로 "1-N" 전체 범위가 채워집니다. 이 상태에서 "각 페이지를 별도 파일로 나누기"를 켜면 페이지마다 한 장짜리 PDF가 만들어지고 전체가 ZIP으로 함께 다운로드됩니다.',
      },
      {
        q: '파일 용량이나 페이지 수 제한이 있나요?',
        a: '이 도구 자체에는 고정된 제한이 없습니다. iLovePDF 무료 Basic 플랜(작업당 약 100MB)이나 Jotform 분할 도구(파일당 30MB)와 달리, 실질적인 한계는 브라우저가 쓸 수 있는 메모리뿐입니다.',
      },
      {
        q: '암호가 걸린 PDF도 나눌 수 있나요?',
        a: '아직은 안 됩니다. 암호로 잠긴 PDF는 넣는 즉시 감지되어 "암호 보호됨"으로 표시되고 분할되지 않습니다. PDF 리더에서 먼저 암호를 해제한 뒤 다시 추가하세요.',
      },
      {
        q: '결과가 ZIP으로 오나요, PDF로 오나요?',
        a: '설정에 따라 결과 파일이 1개면 그대로 PDF로 다운로드되고, 2개 이상이면 전부 하나의 ZIP 파일로 묶여 한 번에 다운로드됩니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: '파일 1개 — 원하는 개수만큼 나눌 수 있어요',
      pageCount: '{n}페이지',
      processing: '읽는 중…',
      invalidPdf: '읽을 수 없음 — 올바른 PDF 파일이 아닙니다.',
      encryptedPdf: '암호 보호됨 — 잠금을 해제해야 나눌 수 있습니다.',
      remove: '삭제',
      modeLabel: '분할 방식',
      modeRange: '범위',
      modeEvery: 'N페이지마다',
      rangeLabel: '나눌 페이지',
      rangeHint: '쉼표로 구분한 페이지나 범위. 예: "1-3, 5, 8-10"',
      rangePlaceholder: '1-3, 5, 8-10',
      perPageToggle: '각 페이지를 별도 파일로 나누기',
      everyLabel: '파일당 페이지 수',
      everyHint: '이 페이지 수만큼 PDF를 순서대로 잘라 나눕니다.',
      rangeSyntaxError: '"{part}"은 올바른 페이지·범위 형식이 아닙니다. "1-3, 5"처럼 입력하세요.',
      rangeOutOfBounds: '{page}페이지는 범위를 벗어났습니다 — 이 PDF는 총 {n}페이지입니다.',
      splitFailed:
        'PDF를 나누지 못했습니다 — 브라우저가 처리할 수 있는 메모리보다 클 수 있습니다. 범위를 줄여서 다시 시도해 보세요.',
      download: 'PDF 다운로드',
      downloadZip: 'ZIP 다운로드',
      fileCount: '{n}개 파일 준비됨',
      privacyNote: 'PDF는 내 기기에서 나뉩니다. 어디에도 업로드되지 않고, 용량 제한도 없습니다.',
    },
  },
};

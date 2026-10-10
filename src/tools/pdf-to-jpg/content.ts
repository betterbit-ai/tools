import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'One PDF at a time — it stays on this device',
  remove: 'Remove',
  pageCount: '{n} page(s)',
  reading: 'Reading PDF…',
  processingPages: 'Converting page {n} of {total}…',
  resolutionLabel: 'Image resolution',
  screen: 'Screen',
  standard: 'Standard',
  print: 'Print',
  screenHint: '96 dpi — compact images for chat, email, and screens.',
  standardHint: '150 dpi — a balanced choice for readable sharing and uploads.',
  printHint: '300 dpi — more detail for printing, with larger files and longer processing.',
  rangeLabel: 'Pages to convert',
  rangeHint: 'Use all, 1-3, 5, or 1, 3-5. Changing this starts conversion automatically.',
  rangePlaceholder: 'All pages',
  rangeSyntaxError: '“{part}” is not a valid page range. Try 1-3, 5.',
  rangeOutOfBounds: 'Page {page} is outside this {n}-page PDF.',
  invalidPdf: "This file can't be read as a PDF.",
  encryptedPdf: 'This PDF is password-protected. Remove its password before converting it.',
  fileSizeLimit: 'This PDF is over the 100 MB browser-safety limit.',
  pageCountLimit: 'This PDF has more than 100 pages, the browser-safety limit for this tool.',
  pagePixelLimit: 'A page is too large to render safely at this resolution. Choose a lower resolution.',
  totalPixelLimit:
    'The selected pages need too much image memory at this resolution. Choose fewer pages or a lower resolution.',
  conversionFailed: "This PDF couldn't be converted in this browser. Try a smaller PDF or a lower resolution.",
  privacyNote: 'Your PDF is converted in this browser. Nothing is uploaded, and no ads are shown.',
  resultReady: 'JPG images ready',
  fileCount: '{n} JPG file(s)',
  zipReady: 'ZIP file ready',
  downloadJpg: 'Download JPG',
  downloadZip: 'Download ZIP',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'PDF to JPG — Choose Pages and Resolution Privately',
    description:
      'Convert selected PDF pages to JPG at 96, 150, or 300 dpi in your browser. Download one image or a ZIP with no upload, ads, or account.',
    h1: 'PDF to JPG Converter',
    tagline: 'Choose the pages and resolution, then get JPGs or a ZIP — without uploading your PDF.',
    name: 'PDF to JPG',
    keywords: [
      'pdf to jpg',
      'pdf to jpeg',
      'convert pdf to image',
      'pdf pages to jpg',
      'pdf jpg converter',
      'save pdf as jpg',
    ],
    howTo: [
      'Choose a PDF or drop it into the file area.',
      'Select Screen (96 dpi), Standard (150 dpi), or Print (300 dpi).',
      'Keep all pages or enter a selection such as 1-3, 5; images update automatically.',
      'Download the JPG when one page is selected, or download a ZIP for multiple pages.',
    ],
    sections: [
      {
        heading: 'Pick the resolution for where the image will go',
        body: 'PDF page coordinates use 72 points per inch, so this tool renders the same page at 96, 150, or 300 dpi. Screen (96 dpi) keeps files compact for email, chat, and on-screen sharing. Standard (150 dpi) is a practical middle ground for readable forms and ordinary uploads. Print (300 dpi) gives four times as many pixels as 150 dpi and can preserve small details better, but it also needs more memory, takes longer, and makes larger JPG files. JPG is a lossy format, so keep the original PDF if you need to edit text or preserve every source detail.',
      },
      {
        heading: 'Convert only the pages you need',
        body: 'Use “all” for the entire document, or a compact range such as 1-3, 5, 8-10. Repeated and out-of-order page numbers are normalized, so a page is downloaded once and the JPGs stay in page order. A single selected page downloads as a JPG; two or more pages are bundled into one ZIP with names such as report_page-03.jpg. That makes it easy to attach exactly the requested pages to a form or message without unpacking an entire document first.',
      },
      {
        heading: 'Private conversion without an upload queue',
        body: 'The leading results iLovePDF, Smallpdf, and Adobe Acrobat all show an upload or server-handling step. Smallpdf says uploaded files are deleted after one hour, while Adobe says files are handled by Adobe servers. Here, the PDF is read and rendered inside this browser tab; the document and JPG output are not sent to a server. The browser-safety limits are 100 MB, 100 document pages, 20 million pixels per rendered page, and 100 million pixels across the selected pages. These limits prevent a high-resolution conversion from freezing the tab.',
      },
    ],
    faq: [
      {
        q: 'Does this PDF to JPG converter upload my document?',
        a: 'No. The PDF is read, rendered, and converted to JPG entirely in the browser on your device. Once the page has loaded, the document itself is not sent to a server.',
      },
      {
        q: 'Which PDF-to-JPG resolution should I choose?',
        a: 'Use 96 dpi for compact screen images, 150 dpi for a balanced readable JPG, and 300 dpi when print detail matters more than file size. A 300 dpi image has four times the pixels of the same page at 150 dpi.',
      },
      {
        q: 'Can I convert only some PDF pages to JPG?',
        a: 'Yes. Enter all for every page, or use page notation such as 1-3, 5, 8-10. The tool converts only those pages and returns a single JPG for one page or a ZIP for multiple pages.',
      },
      {
        q: 'Why is my PDF page not selectable or searchable after conversion?',
        a: 'A JPG is a flat raster image, not a PDF document. Converting a page to JPG turns its visible text, links, form fields, and vector artwork into pixels, so selectable text and links are not retained.',
      },
      {
        q: 'What PDF limits does this tool have?',
        a: 'For browser safety, the tool accepts PDFs up to 100 MB and 100 pages. Each rendered page is limited to 20 million pixels, and the selected pages together are limited to 100 million pixels; reduce the resolution or page selection if a limit is reached.',
      },
      {
        q: 'Can I convert a password-protected PDF?',
        a: 'Not yet. A password-protected PDF cannot be rendered until you remove its password in a PDF reader you trust, then add the unlocked copy to this tool.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF JPG 변환 — 페이지·해상도 선택, 업로드 없음',
    description:
      'PDF의 원하는 페이지만 96·150·300dpi JPG로 변환하세요. 브라우저에서 처리하고, 한 장은 JPG로 여러 장은 ZIP으로 바로 다운로드합니다.',
    h1: 'PDF JPG 변환',
    tagline: '페이지와 해상도를 직접 고르고, PDF를 올리지 않은 채 JPG 또는 ZIP으로 받습니다.',
    name: 'PDF JPG 변환',
    keywords: [
      'pdf jpg 변환',
      'pdf를 jpg로 변환',
      'pdf 이미지 변환',
      'pdf jpeg 변환',
      'pdf 페이지 이미지 저장',
      'pdf 사진 변환',
    ],
    howTo: [
      'PDF를 선택하거나 파일 영역으로 끌어다 놓습니다.',
      '화면용(96dpi), 기본(150dpi), 인쇄용(300dpi) 중 하나를 고릅니다.',
      '전체 페이지를 유지하거나 1-3, 5처럼 필요한 페이지만 입력합니다. 결과는 자동으로 바뀝니다.',
      '한 페이지면 JPG를, 여러 페이지면 ZIP을 다운로드합니다.',
    ],
    sections: [
      {
        heading: '용도에 맞는 해상도를 고르세요',
        body: 'PDF 페이지 좌표는 1인치에 72포인트를 기준으로 하므로, 이 도구는 같은 페이지를 96·150·300dpi로 렌더링합니다. 화면용 96dpi는 메신저, 이메일, 화면 공유에 알맞게 파일 크기를 줄입니다. 기본 150dpi는 읽기 쉬움과 용량 사이의 균형이 필요한 일반 제출·공유에 적합합니다. 인쇄용 300dpi는 150dpi와 비교해 같은 페이지에서 픽셀 수가 4배가 되어 작은 글씨와 세부 묘사에 유리하지만, 처리 시간과 JPG 용량도 커집니다. JPG는 손실 압축 형식이므로 편집 가능한 글자나 원본 세부 정보가 필요하면 PDF 원본을 보관하세요.',
      },
      {
        heading: '필요한 페이지만 이미지로 만듭니다',
        body: '전체 문서는 all을 입력하고, 필요한 페이지만 바꾸려면 1-3, 5, 8-10처럼 입력하세요. 중복되거나 순서가 섞인 페이지 번호는 정리되어 같은 페이지가 두 번 저장되지 않고, JPG도 페이지 순서대로 만들어집니다. 한 페이지만 선택하면 JPG 하나를, 두 페이지 이상이면 report_page-03.jpg 같은 파일명이 들어 있는 ZIP 하나를 받습니다. 지원서나 메일에 요청받은 페이지만 첨부할 때 특히 편리합니다.',
      },
      {
        heading: '업로드 대기 없이 기기 안에서 변환합니다',
        body: '검색 상위 결과인 iLovePDF, Smallpdf, Adobe Acrobat은 모두 업로드 또는 서버 처리 단계를 표시합니다. Smallpdf는 업로드한 파일을 1시간 뒤 삭제한다고 안내하고, Adobe는 파일을 Adobe 서버에서 처리한다고 밝힙니다. 여기서는 PDF를 현재 브라우저 탭 안에서 읽고 렌더링하므로 문서와 결과 JPG가 서버로 전송되지 않습니다. 탭이 멈추는 일을 줄이기 위해 PDF는 100MB·100페이지까지, 렌더링 결과는 페이지당 2천만 픽셀·선택한 페이지 전체 1억 픽셀까지 처리합니다.',
      },
    ],
    faq: [
      {
        q: 'PDF 파일이 서버에 업로드되나요?',
        a: '아니요. PDF를 읽고 렌더링하여 JPG를 만드는 모든 과정은 현재 기기의 브라우저에서 이루어집니다. 페이지를 불러온 뒤 문서 파일 자체는 서버로 전송되지 않습니다.',
      },
      {
        q: 'PDF JPG 변환 때 어떤 해상도를 선택해야 하나요?',
        a: '작은 화면용 이미지는 96dpi, 읽기 좋은 일반 공유용은 150dpi, 인쇄 세부 묘사가 중요할 때는 300dpi를 선택하세요. 같은 페이지에서 300dpi는 150dpi보다 픽셀 수가 4배입니다.',
      },
      {
        q: 'PDF의 일부 페이지만 JPG로 바꿀 수 있나요?',
        a: '네. 전체는 all을 입력하고, 일부는 1-3, 5, 8-10처럼 페이지 범위를 입력하세요. 한 페이지만 선택하면 JPG 하나를, 여러 페이지를 선택하면 ZIP 하나를 다운로드합니다.',
      },
      {
        q: 'JPG로 바꾸면 PDF의 글자를 선택하거나 검색할 수 있나요?',
        a: '아니요. JPG는 픽셀로 이루어진 평면 이미지입니다. PDF 페이지를 JPG로 바꾸면 보이는 글자, 링크, 입력 양식, 벡터 그림이 픽셀이 되므로 글자 선택과 링크 기능은 유지되지 않습니다.',
      },
      {
        q: '처리할 수 있는 PDF 크기와 페이지 수는 얼마인가요?',
        a: '브라우저 안전을 위해 100MB·100페이지 이하 PDF를 처리합니다. 렌더링한 페이지 하나는 2천만 픽셀, 선택한 페이지 전체는 1억 픽셀까지이며, 제한에 걸리면 해상도나 선택 페이지 수를 줄여야 합니다.',
      },
      {
        q: '암호가 걸린 PDF도 JPG로 변환할 수 있나요?',
        a: '아직은 안 됩니다. 암호가 걸린 PDF는 페이지를 렌더링할 수 없으므로, 신뢰할 수 있는 PDF 리더에서 암호를 해제한 사본을 만든 뒤 이 도구에 추가하세요.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: '한 번에 PDF 1개 — 파일은 이 기기에만 남습니다',
      remove: '삭제',
      pageCount: '{n}페이지',
      reading: 'PDF 읽는 중…',
      processingPages: '{total}페이지 중 {n}페이지 변환 중…',
      resolutionLabel: '이미지 해상도',
      screen: '화면용',
      standard: '기본',
      print: '인쇄용',
      screenHint: '96dpi — 메신저, 이메일, 화면용으로 가볍게 만듭니다.',
      standardHint: '150dpi — 읽기 쉬움과 용량 사이의 균형을 맞춥니다.',
      printHint: '300dpi — 인쇄 세부 묘사용입니다. 파일이 커지고 처리 시간이 길어집니다.',
      rangeLabel: '변환할 페이지',
      rangeHint: 'all, 1-3, 5 또는 1, 3-5처럼 입력하세요. 바꾸면 자동으로 변환합니다.',
      rangePlaceholder: '전체 페이지',
      rangeSyntaxError: '“{part}”은(는) 올바른 페이지 범위가 아닙니다. 1-3, 5처럼 입력하세요.',
      rangeOutOfBounds: '{page}페이지는 이 PDF의 {n}페이지 범위를 벗어납니다.',
      invalidPdf: '이 파일은 PDF로 읽을 수 없습니다.',
      encryptedPdf: '암호로 보호된 PDF입니다. 암호를 해제한 뒤 변환하세요.',
      fileSizeLimit: '이 PDF는 브라우저 안전 제한인 100MB를 넘습니다.',
      pageCountLimit: '이 PDF는 100페이지를 넘어 이 도구의 브라우저 안전 제한을 넘습니다.',
      pagePixelLimit: '이 해상도에서 페이지가 너무 커서 안전하게 렌더링할 수 없습니다. 더 낮은 해상도를 선택하세요.',
      totalPixelLimit:
        '선택한 페이지를 이 해상도로 만들려면 이미지 메모리가 너무 많이 필요합니다. 페이지 수나 해상도를 줄이세요.',
      conversionFailed: '이 브라우저에서 PDF를 JPG로 변환하지 못했습니다. 더 작은 PDF나 낮은 해상도로 시도하세요.',
      privacyNote: 'PDF는 이 브라우저에서 변환합니다. 어디에도 업로드되지 않으며 광고도 없습니다.',
      resultReady: 'JPG 이미지가 준비되었습니다',
      fileCount: 'JPG {n}개',
      zipReady: 'ZIP 파일 준비됨',
      downloadJpg: 'JPG 다운로드',
      downloadZip: 'ZIP 다운로드',
    },
  },
};

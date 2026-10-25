import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'One PDF at a time — it stays on this device',
  remove: 'Remove',
  reading: 'Reading PDF text…',
  processingPages: 'Extracting page {n} of {total}…',
  pageCount: '{n} page(s)',
  invalidPdf: "This file can't be read as a PDF.",
  encryptedPdf: 'This PDF is password-protected. Remove its password before extracting text.',
  fileSizeLimit: 'This PDF is over the 100 MB browser-safety limit.',
  pageCountLimit: 'This PDF has more than 500 pages, the browser-safety limit for this tool.',
  textLengthLimit: 'This PDF contains more than 10 million characters, the browser-safety limit for this tool.',
  extractionFailed: "This PDF couldn't be read in this browser. Try a smaller or different PDF.",
  privacyNote: 'Your PDF is read in this browser. Nothing is uploaded.',
  pages: 'Pages',
  characters: 'Characters',
  download: 'Download all as TXT',
  copyAll: 'Copy all text',
  copied: 'Copied',
  pageSelectorLabel: 'Page to review',
  pageOption: 'Page {n}',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pageTextLabel: 'Text from page {n}',
  copyPage: 'Copy this page',
  emptyPage: 'No selectable text was found on this page.',
  emptyDocument: 'No selectable text was found. A scanned or image-only PDF needs OCR.',
  resultHint: 'Review and copy one page at a time, or save the whole document as UTF-8 TXT.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'PDF to Text — Copy Each Page Privately',
    description:
      'Extract selectable text from a PDF in your browser, review and copy each page separately, then download the full result as a UTF-8 TXT file without uploading your PDF.',
    h1: 'PDF to Text',
    tagline: 'Extract selectable PDF text locally, with a separate copy button for every page.',
    name: 'PDF to Text',
    keywords: ['pdf to text', 'extract text from pdf', 'pdf text extractor', 'pdf to txt', 'copy text from pdf'],
    howTo: [
      'Drop one PDF into the file area or choose it from your device.',
      'Wait while each page is read in this browser; the progress message names the current page.',
      'Choose a page, review its extracted text, and use “Copy this page” when you need only that page.',
      'Copy all text or download a UTF-8 TXT file when you need the complete document.',
    ],
    sections: [
      {
        heading: 'What PDF text extraction can and cannot recover',
        body: 'A digital PDF can contain a text layer: the characters and their positions are stored separately from the pixels used to draw the page. This tool reads that layer and keeps explicit line endings where the PDF supplies them. It does not try to redraw fonts, images, columns, or table cells in a TXT file, because plain text has no page layout. In a two-column report, the reading order can therefore differ from what your eyes see on the page. Review the selected page before quoting or importing it into another system.\n\nA scanned paper document is different: its page is usually an image, so it can look readable while containing no selectable characters at all. If the result says no selectable text was found, use an OCR tool to recognize the image first. OCR is intentionally not included here, so a confidential digital PDF can be read locally without sending it to a recognition service.',
      },
      {
        heading: 'Why the result is organized page by page',
        body: 'Page boundaries matter when you are checking a quotation, copying a table note, or moving one section of a long report into a form. Instead of placing an unmarked document-length block in the clipboard, this tool lets you select a page and copy exactly its extracted text. The full-document controls remain available for notes, scripts, and search indexes; the downloaded .txt file uses UTF-8, the standard Unicode encoding that preserves Korean, CJK characters, emoji, and most other scripts.\n\nFor browser safety, the tool accepts one PDF up to 100 MB, reads up to 500 pages, and stops after 10 million Unicode characters. Those are implementation limits rather than PDF-format limits: a smaller image-heavy PDF may have no text, while a small text-heavy PDF can have many characters. The file is kept in the current browser tab and is discarded when you remove it or close the page.',
      },
      {
        heading: 'Use extracted text with the next tool',
        body: 'PDF text often needs a quick cleanup after extraction. Headers, footers, narrow columns, and hyphenated line endings are artifacts of the source layout rather than part of the prose you want to reuse. Copy only the relevant page first, then use Remove Line Breaks when a copied column has a line ending after every visual row. Use Word Counter when an application, caption, or form has a character or byte limit.\n\nThe extraction itself begins as soon as a valid PDF is selected; there is no separate conversion queue or upload stage. Password-protected PDFs are not opened by this tool. If you know the password, make a permitted unlocked copy with the PDF Password Remover tool and then extract text from that copy. Always confirm that you have the right to copy or reuse the document’s contents.',
      },
    ],
    faq: [
      {
        q: 'Does this PDF to text tool upload my document?',
        a: 'No. The PDF is opened and its selectable text is extracted in the current browser on your device. The document and the extracted text are not sent to a Betterbit server.',
      },
      {
        q: 'Why does my scanned PDF show no text?',
        a: 'A scanned PDF usually stores each page as an image rather than as selectable characters, so direct text extraction returns an empty result. OCR must recognize the page image before it can become editable text.',
      },
      {
        q: 'Can I copy text from only one PDF page?',
        a: 'Yes. After extraction, choose the page in “Page to review” and use “Copy this page”. The page’s text is copied without text from the other pages.',
      },
      {
        q: 'Will PDF tables and columns keep their original layout?',
        a: 'No. TXT has no columns, fonts, images, or cell boundaries. The tool preserves text and explicit line endings where available, but complex tables and multi-column reading order need review against the original PDF.',
      },
      {
        q: 'What PDF size and page limits apply?',
        a: 'This tool accepts one PDF up to 100 MB and up to 500 pages, and it stops after 10 million Unicode characters to keep browser memory responsive. These limits are enforced before or during local extraction.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 텍스트 추출 — 페이지별 복사·TXT 저장',
    description:
      'PDF의 선택 가능한 글자를 브라우저에서 추출합니다. 페이지마다 결과를 확인해 따로 복사하고, 전체는 UTF-8 TXT로 저장하세요. 파일은 업로드하지 않습니다.',
    h1: 'PDF 텍스트 추출',
    tagline: 'PDF 글자를 기기 안에서 추출하고, 필요한 페이지만 따로 복사합니다.',
    name: 'PDF 텍스트 추출',
    keywords: ['pdf 텍스트 추출', 'pdf 글자 추출', 'pdf txt 변환', 'pdf 텍스트 복사', 'pdf 문자 추출'],
    howTo: [
      'PDF 하나를 파일 영역에 끌어다 놓거나 기기에서 선택합니다.',
      '브라우저에서 페이지별 글자를 읽는 동안 현재 처리 중인 페이지를 확인합니다.',
      '검토할 페이지를 고르고 결과를 확인한 뒤, 필요한 페이지는 “이 페이지 복사”를 누릅니다.',
      '문서 전체가 필요하면 모두 복사하거나 UTF-8 TXT로 저장합니다.',
    ],
    sections: [
      {
        heading: 'PDF에서 뽑을 수 있는 글자와 뽑을 수 없는 글자',
        body: '문서 편집기에서 만든 디지털 PDF에는 보통 글자 자체와 페이지 위의 위치를 기록한 텍스트 레이어가 있습니다. 이 도구는 그 레이어를 읽고 PDF가 제공하는 줄 끝 표시는 남깁니다. 다만 TXT는 글꼴, 이미지, 열, 표의 칸을 담을 수 없는 형식이므로 원래 지면을 그대로 재현하지는 않습니다. 특히 2단 논문이나 복잡한 표는 화면에서 보이는 순서와 추출된 읽기 순서가 다를 수 있으니, 인용하거나 다른 서비스에 넣기 전에 해당 페이지를 비교해야 합니다.\n\n종이를 스캔한 PDF는 다릅니다. 글자가 보이더라도 보통은 페이지 전체가 이미지라서 선택 가능한 문자가 없고, 이 도구의 결과도 비어 있습니다. 이 경우에는 이미지 속 글자를 인식하는 OCR이 먼저 필요합니다. 민감한 디지털 PDF를 별도 인식 서비스로 보내지 않고 읽는 용도에 집중하기 위해 OCR 기능은 이 도구에 넣지 않았습니다.',
      },
      {
        heading: '페이지별 결과가 필요한 이유',
        body: '긴 보고서의 인용문을 확인하거나, 특정 쪽의 표 주석만 옮기거나, 지원서의 한 항목에 필요한 내용만 붙일 때는 페이지 경계가 중요합니다. 이 도구는 문서 전체를 구분 없는 긴 글로 바로 복사하는 대신, 검토할 페이지를 고르고 그 페이지의 추출 결과만 복사할 수 있게 합니다. 전체 텍스트도 별도로 복사하거나 저장할 수 있고, 다운로드 파일은 한글·한자·이모지 등 유니코드 문자를 보존하는 UTF-8 TXT 형식입니다.\n\n브라우저가 멈추는 일을 줄이기 위해 PDF는 1개씩 100MB·500페이지까지, 추출 결과는 유니코드 문자 1천만 자까지 처리합니다. 이는 PDF 형식 자체의 한도가 아니라 현재 기기에서 안전하게 처리하기 위한 도구의 한도입니다. 용량이 작은 스캔 PDF는 글자가 하나도 없을 수 있고, 글자가 많은 작은 PDF는 문자 한도에 닿을 수 있습니다. 파일은 현재 브라우저 탭 안에만 남고 삭제하거나 페이지를 닫으면 사라집니다.',
      },
      {
        heading: '추출한 글자를 바로 정리하는 방법',
        body: 'PDF에서 꺼낸 글자는 원본 지면의 머리말·꼬리말, 좁은 단의 줄바꿈, 줄 끝 하이픈이 섞여 있을 수 있습니다. 필요한 페이지만 먼저 복사한 뒤, 단마다 줄이 끊긴 글은 줄바꿈 없애기에서 PDF 복사 정리로 다듬을 수 있습니다. 자기소개서, 캡션, 신청 양식처럼 글자 수나 바이트 수 제한이 있으면 글자수 세기에 붙여 넣어 기준에 맞는지 확인하세요.\n\n유효한 PDF를 고르면 별도의 변환 버튼이나 업로드 대기 없이 바로 읽기를 시작합니다. 암호가 걸린 PDF는 이 도구에서 열지 않습니다. 암호를 알고 있고 복사가 허용된 문서라면 PDF 암호 제거 도구로 잠금을 푼 사본을 만든 뒤 텍스트를 추출하세요. 문서 내용을 복사·재사용할 권한이 있는지도 함께 확인해야 합니다.',
      },
    ],
    faq: [
      {
        q: 'PDF 파일이 서버에 업로드되나요?',
        a: '아니요. PDF를 열고 선택 가능한 글자를 추출하는 작업은 현재 기기의 브라우저 안에서만 실행됩니다. 문서 파일과 추출 결과는 Betterbit 서버로 전송되지 않습니다.',
      },
      {
        q: '스캔한 PDF에서 글자가 나오지 않는 이유는 무엇인가요?',
        a: '스캔 PDF는 대개 페이지를 이미지로 저장하므로 선택 가능한 문자 정보가 없습니다. 직접 텍스트를 추출하면 빈 결과가 나오며, 편집 가능한 글자가 필요하면 먼저 OCR로 이미지 글자를 인식해야 합니다.',
      },
      {
        q: 'PDF의 한 페이지만 따로 복사할 수 있나요?',
        a: '네. 추출이 끝난 뒤 “검토할 페이지”에서 원하는 쪽을 고르고 “이 페이지 복사”를 누르면 다른 페이지 글자 없이 그 페이지의 결과만 복사합니다.',
      },
      {
        q: 'PDF 표와 2단 편집도 원래 모양대로 나오나요?',
        a: '아니요. TXT에는 열, 글꼴, 이미지, 표 칸이라는 정보가 없습니다. 글자와 PDF에 기록된 줄 끝은 남길 수 있지만, 복잡한 표와 2단 문서는 원본 PDF와 읽기 순서를 대조해야 합니다.',
      },
      {
        q: '처리할 수 있는 PDF 용량과 페이지 수는 얼마인가요?',
        a: '이 도구는 PDF 1개를 100MB·500페이지까지 처리하고, 브라우저 메모리를 보호하기 위해 유니코드 문자 1천만 자를 넘으면 멈춥니다. 이 한도는 모두 기기 안에서 추출할 때 적용됩니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: '한 번에 PDF 1개 — 파일은 이 기기에만 남습니다',
      remove: '삭제',
      reading: 'PDF 글자 읽는 중…',
      processingPages: '{total}페이지 중 {n}페이지 추출 중…',
      pageCount: '{n}페이지',
      invalidPdf: '이 파일은 PDF로 읽을 수 없습니다.',
      encryptedPdf: '암호로 보호된 PDF입니다. 암호를 해제한 뒤 텍스트를 추출하세요.',
      fileSizeLimit: '이 PDF는 브라우저 안전 제한인 100MB를 넘습니다.',
      pageCountLimit: '이 PDF는 500페이지를 넘어 이 도구의 브라우저 안전 제한을 넘습니다.',
      textLengthLimit: '이 PDF는 유니코드 문자 1천만 자를 넘어 이 도구의 브라우저 안전 제한을 넘습니다.',
      extractionFailed: '이 브라우저에서 PDF 글자를 읽지 못했습니다. 더 작거나 다른 PDF로 시도하세요.',
      privacyNote: 'PDF는 이 브라우저에서 읽습니다. 어디에도 업로드되지 않습니다.',
      pages: '페이지',
      characters: '글자 수',
      download: '전체 TXT 다운로드',
      copyAll: '전체 텍스트 복사',
      copied: '복사됨',
      pageSelectorLabel: '검토할 페이지',
      pageOption: '{n}페이지',
      previousPage: '이전 페이지',
      nextPage: '다음 페이지',
      pageTextLabel: '{n}페이지에서 추출한 글자',
      copyPage: '이 페이지 복사',
      emptyPage: '이 페이지에서 선택 가능한 글자를 찾지 못했습니다.',
      emptyDocument: '선택 가능한 글자를 찾지 못했습니다. 스캔본이나 이미지 전용 PDF는 OCR이 필요합니다.',
      resultHint: '페이지별로 확인해 복사하거나, 전체 문서를 UTF-8 TXT로 저장하세요.',
    },
  },
};

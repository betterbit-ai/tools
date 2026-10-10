import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here',
  dropHint: 'or click to choose a file — nothing is uploaded',
  remove: 'Remove',
  pageCount: '{n} pages',
  invalidPdf: "That file isn't a readable PDF.",
  encryptedPdf: 'This PDF is password-protected and can’t be signed here. Remove the password first.',
  fileSizeLimit: 'This PDF is larger than the 50MB limit for in-browser signing.',
  pageCountLimit: 'This PDF has more pages than the 500-page limit for in-browser signing.',
  pageLabel: 'Page to sign',
  pageHint: 'of {n} pages',
  dragHandle: 'Signature position. Drag to move, or use the arrow keys.',
  dragHint: 'Drag the dashed box to position your signature, or focus it and press the arrow keys.',
  signFailed: "Couldn't sign this PDF. Try a different page or signature.",
  privacyNote: 'Your PDF is signed entirely in your browser — it is never uploaded anywhere.',
  signing: 'Signing…',
  download: 'Download signed PDF',
  modeLabel: 'Signature',
  modeDraw: 'Draw',
  modeType: 'Type',
  drawHint: 'Draw with your mouse, trackpad, or finger.',
  undoStroke: 'Undo stroke',
  clearSignature: 'Clear',
  typedLabel: 'Your name',
  typedPlaceholder: 'Jane Doe',
  sizeLabel: 'Size',
  sizeSmall: 'Small',
  sizeMedium: 'Medium',
  sizeLarge: 'Large',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Sign PDF Online — Draw Your Signature, No Upload',
    description:
      'Add a handwritten or typed signature to any page of a PDF and download it right away. Your file is parsed and signed entirely in your browser — it never touches a server.',
    h1: 'Sign PDF',
    tagline: 'Draw or type your signature, drag it into place, and download — your document never leaves this tab.',
    name: 'Sign PDF',
    keywords: ['sign pdf online', 'esign pdf', 'add signature to pdf', 'pdf signature maker', 'free pdf signer'],
    howTo: [
      'Drop your PDF, or click the box to choose one from your device.',
      'Pick the page to sign — it starts on the last page, where signatures usually go.',
      'Draw your signature with a mouse, trackpad, or touchscreen, or switch to Type and enter your name.',
      'Drag the dashed box to position the signature, or focus it and nudge it with the arrow keys.',
      'Pick a size — Small, Medium, or Large — then click "Download signed PDF".',
    ],
    sections: [
      {
        heading: 'How this stays private',
        body: 'Every step — reading the PDF, rendering the page preview, and drawing the signature onto it — runs in your browser using pdf-lib and pdf.js. No file is ever uploaded, so there is no server copy, no account, and no "auto-deleted after one hour" window to worry about. Close the tab and nothing remains anywhere but your own download. The tool also works offline once the page has loaded, since there is no server round trip to wait on.',
      },
      {
        heading: 'Drawn vs. typed signatures',
        body: 'A drawn signature traces your actual pointer or finger movement, so it looks closest to pen-and-paper handwriting — most people get a better result with a trackpad, stylus, or touchscreen than a mouse. A typed signature renders your name in a script-style font instantly, which is faster when you just need a readable name on the page rather than a true handwritten mark. Both are saved as a transparent image and placed the same way, so you can switch between them before downloading.',
      },
      {
        heading: 'Limits and file support',
        body: 'This tool accepts PDFs up to 50MB and 500 pages, parsed with pdf-lib and pdf.js directly in memory in your browser — there is no per-day quota or forced sign-up like some competitors apply. One signature is placed per download; to sign a second page, download the signed file and drop it back in to add another. Password-protected PDFs need their password removed first, since in-browser tools cannot read an encrypted file’s pages to preview or sign them.',
      },
    ],
    faq: [
      {
        q: 'Is my PDF uploaded anywhere when I sign it?',
        a: 'No. The file is read and signed entirely in your browser with pdf-lib and pdf.js — it is never sent to a server, so there is nothing to delete later and no account is required.',
      },
      {
        q: 'Is this a legally binding electronic signature?',
        a: 'This tool embeds a visual signature image into the page, not a certificate-based digital signature (like Adobe Acrobat’s Digital ID or a PDF/CAdES signature with an audit trail). Many jurisdictions, including the US under the ESIGN Act and UETA, treat a simple visual signature like this as valid for most everyday agreements. For contracts that specifically require a certified, auditable e-signature, use a dedicated e-signature service instead.',
      },
      {
        q: 'Can I move or resize the signature after drawing it?',
        a: 'Yes. Drag the dashed box on the page preview to reposition it, or click it once and use the arrow keys to nudge it in small steps. The Small, Medium, and Large options resize it while keeping its proportions.',
      },
      {
        q: 'What is the largest PDF I can sign?',
        a: 'Up to 50MB and 500 pages. Because the file is held in your browser’s memory rather than streamed from a server, very large scanned PDFs may render the page preview more slowly on older phones or laptops.',
      },
      {
        q: 'Can I sign more than one page in the same file?',
        a: 'Each download places one signature on the page you chose. To add a second signature elsewhere, download the signed PDF and drop that file back into the tool to place another one.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 서명 — 손글씨로 서명하고 업로드 없이 다운로드',
    description:
      'PDF 원하는 페이지에 손글씨 서명이나 입력 서명을 올리고 바로 다운로드하세요. 파일은 브라우저 안에서만 열리고 서명되며, 서버로 전송되지 않습니다.',
    h1: 'PDF 서명',
    tagline: '서명을 그리거나 입력하고, 위치를 끌어다 놓은 뒤 바로 다운로드하세요. 파일은 이 탭을 벗어나지 않습니다.',
    name: 'PDF 서명',
    keywords: ['pdf 서명', '전자서명 pdf', 'pdf 서명 무료', '손글씨 서명', 'pdf 사인'],
    howTo: [
      'PDF를 끌어다 놓거나 클릭해서 파일을 선택하세요.',
      '서명할 페이지를 고르세요. 보통 마지막 페이지가 기본으로 선택됩니다.',
      '마우스나 트랙패드, 터치스크린으로 서명을 그리거나, "입력" 탭에서 이름을 타이핑하세요.',
      '점선 상자를 끌어서 위치를 맞추거나, 상자에 포커스한 뒤 방향키로 미세 조정하세요.',
      '작게·보통·크게 중 크기를 고르고 "서명한 PDF 다운로드"를 누르세요.',
    ],
    sections: [
      {
        heading: '왜 개인정보가 안전한가',
        body: 'PDF를 읽고, 페이지 미리보기를 그리고, 서명을 올리는 모든 과정이 pdf-lib와 pdf.js를 이용해 브라우저 안에서만 실행됩니다. 파일이 서버로 전송되지 않으니 "1시간 후 자동 삭제"를 기다릴 필요도, 계정을 만들 필요도 없습니다. 탭을 닫으면 내려받은 파일 말고는 어디에도 흔적이 남지 않습니다. 페이지를 한 번 불러온 뒤에는 인터넷 연결 없이도 계속 쓸 수 있습니다.',
      },
      {
        heading: '손글씨 서명과 입력 서명',
        body: '손글씨 서명은 마우스나 손가락의 움직임을 그대로 따라 그리기 때문에 실제 서명과 가장 비슷한 결과를 줍니다. 트랙패드나 터치스크린, 펜이 있다면 마우스보다 훨씬 자연스럽게 그려집니다. 입력 서명은 이름을 타이핑하면 필기체 느낌의 글꼴로 즉시 변환되어, 손으로 그리기 어려운 상황에서 빠르게 쓸 수 있습니다. 두 방식 모두 투명 배경 이미지로 저장되어 같은 방식으로 배치되므로, 다운로드 전까지 자유롭게 바꿔볼 수 있습니다.',
      },
      {
        heading: '용량 제한과 지원 범위',
        body: '이 도구는 50MB, 500페이지까지의 PDF를 지원하며, pdf-lib와 pdf.js로 브라우저 메모리 안에서 직접 처리합니다. 하루 사용 횟수 제한이나 가입 요구가 없습니다. 한 번 다운로드할 때 서명은 한 페이지에 올라가며, 다른 페이지에도 서명하려면 서명된 파일을 다시 끌어다 놓고 한 번 더 진행하면 됩니다. 비밀번호가 걸린 PDF는 브라우저에서 페이지 내용을 미리 볼 수 없으므로, 먼저 비밀번호를 해제한 뒤 사용해야 합니다.',
      },
    ],
    faq: [
      {
        q: '서명할 때 PDF가 서버로 업로드되나요?',
        a: '아니요. 파일은 pdf-lib와 pdf.js를 이용해 브라우저 안에서만 열리고 서명됩니다. 서버로 전송되지 않으므로 나중에 삭제할 파일도, 만들어야 할 계정도 없습니다.',
      },
      {
        q: '이 서명이 법적으로 효력이 있나요?',
        a: '이 도구는 페이지 위에 이미지 형태의 서명을 올려줄 뿐, Adobe Acrobat의 디지털 ID나 PDF/CAdES 서명처럼 인증서 기반으로 서명 이력을 증명하는 전자서명은 만들지 않습니다. 이미지 서명의 법적 효력은 나라와 계약 당사자 간 합의에 따라 다르므로, 인증서 기반의 검증 가능한 전자서명이 필요하다면 전문 전자서명 서비스를 이용하세요.',
      },
      {
        q: '그려 놓은 서명을 옮기거나 크기를 바꿀 수 있나요?',
        a: '네. 미리보기 위의 점선 상자를 끌어서 위치를 옮기거나, 한 번 클릭해 포커스를 준 뒤 방향키로 조금씩 움직일 수 있습니다. 작게·보통·크게 옵션은 비율을 유지한 채 크기만 바꿔줍니다.',
      },
      {
        q: '서명할 수 있는 PDF의 최대 용량은 얼마인가요?',
        a: '최대 50MB, 500페이지까지 지원합니다. 서버로 나눠 보내는 것이 아니라 브라우저 메모리에서 한 번에 처리하기 때문에, 용량이 큰 스캔 PDF는 오래된 기기에서 미리보기 로딩이 느릴 수 있습니다.',
      },
      {
        q: '한 파일에 여러 페이지를 서명할 수 있나요?',
        a: '한 번 다운로드할 때마다 선택한 한 페이지에 서명이 올라갑니다. 다른 페이지에도 서명하려면, 서명된 PDF를 다시 도구에 끌어다 놓고 같은 과정을 한 번 더 진행하면 됩니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 여기에 끌어다 놓으세요',
      dropHint: '또는 클릭해서 파일을 선택하세요 — 업로드되지 않습니다',
      remove: '제거',
      pageCount: '{n}페이지',
      invalidPdf: '읽을 수 있는 PDF 파일이 아닙니다.',
      encryptedPdf: '비밀번호로 보호된 PDF는 여기서 서명할 수 없습니다. 먼저 비밀번호를 해제해 주세요.',
      fileSizeLimit: '이 PDF는 브라우저 서명 용량 한도인 50MB를 넘습니다.',
      pageCountLimit: '이 PDF는 브라우저 서명 페이지 한도인 500페이지를 넘습니다.',
      pageLabel: '서명할 페이지',
      pageHint: '총 {n}페이지',
      dragHandle: '서명 위치. 끌어서 옮기거나 방향키를 사용하세요.',
      dragHint: '점선 상자를 끌어서 서명 위치를 맞추거나, 포커스한 뒤 방향키를 눌러 조정하세요.',
      signFailed: 'PDF에 서명하지 못했습니다. 다른 페이지나 서명으로 다시 시도해 보세요.',
      privacyNote: 'PDF는 브라우저 안에서만 서명됩니다 — 어디로도 업로드되지 않습니다.',
      signing: '서명 중…',
      download: '서명한 PDF 다운로드',
      modeLabel: '서명 방식',
      modeDraw: '그리기',
      modeType: '입력',
      drawHint: '마우스, 트랙패드, 손가락으로 그려 보세요.',
      undoStroke: '한 획 취소',
      clearSignature: '지우기',
      typedLabel: '이름',
      typedPlaceholder: '홍길동',
      sizeLabel: '크기',
      sizeSmall: '작게',
      sizeMedium: '보통',
      sizeLarge: '크게',
    },
  },
};

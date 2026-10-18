import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  modeLabel: 'Create with',
  modeType: 'Type name',
  modeDraw: 'Draw by hand',
  nameLabel: 'Name or initials',
  namePlaceholder: 'Alex Morgan',
  nameHint: 'Up to 80 characters. Your text stays in this browser.',
  styleLabel: 'Text style',
  styleScript: 'Handwritten',
  styleFormal: 'Formal',
  styleSimple: 'Simple',
  inkLabel: 'Ink',
  inkBlue: 'Blue',
  inkBlack: 'Black',
  penLabel: 'Pen width',
  penThin: 'Fine',
  penMedium: 'Medium',
  penBold: 'Bold',
  previewLabel: 'Signature preview',
  drawCanvasLabel: 'Signature drawing area',
  drawHint: 'Use a mouse, trackpad, finger, or stylus to sign.',
  drawPlaceholder: 'Draw your signature here',
  undo: 'Undo stroke',
  clear: 'Clear',
  privacyNote: 'Your name and strokes are drawn and saved only in this browser. Nothing is uploaded.',
  transparentNote: 'The PNG is cropped to the ink and keeps a transparent background.',
  download: 'Download transparent PNG',
  downloadShortcutKey: 'D',
  downloadShortcut: 'to download when no text field is active',
  readyHint: 'Add a name or draw a signature to download it.',
  downloadStarted: 'Your transparent PNG download has started.',
  downloadFailed: 'The PNG could not be created. Please try again.',
  defaultName: 'Alex Morgan',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Signature Generator — Draw or Type a Transparent PNG',
    description:
      'Create a handwritten or typed signature and download a tightly cropped transparent PNG. Your name and strokes stay on your device, with no upload or account needed.',
    h1: 'Signature Generator',
    tagline: 'Draw your own signature or turn a name into a transparent PNG, entirely in your browser.',
    name: 'Signature Generator',
    keywords: ['signature maker', 'handwritten signature generator', 'signature png', 'create signature online'],
    howTo: [
      'Choose “Type name” for a text signature or “Draw by hand” to write it yourself.',
      'Enter your name and choose a style, or sign in the drawing area with a mouse, finger, or stylus.',
      'Pick the ink and, for a drawn signature, choose a pen width. Use “Undo stroke” to remove the latest stroke.',
      'Check the live signature preview, then select “Download transparent PNG”.',
    ],
    sections: [
      {
        heading: 'A transparent PNG that fits a signature line',
        body: 'The download is a PNG with an alpha channel, so the area around the ink remains transparent instead of becoming a white rectangle. Before saving, this tool scans the rendered ink, trims unused canvas space, and leaves a 36-pixel transparent margin around the result. That gives you a compact image to insert over a signature line in a document, form, or email footer without manually cropping it first. The working canvas is 1,200 × 400 pixels, then the export is cropped to the actual signature.',
      },
      {
        heading: 'Typed, drawn, and digital signatures are different things',
        body: '“Type name” creates a visual signature image from the text you enter; “Draw by hand” records the strokes you make with a pointer, touch screen, or stylus. Both produce only an image file, not a cryptographic digital signature or an audit trail. An image can be useful where a form asks for a signature picture, but a contract platform, employer, or government service may require its own identity check, certificate, or signing workflow. Check that document’s instructions before relying on an image alone.',
      },
      {
        heading: 'Keep your signature under your control',
        body: 'The preview, local saved settings, and PNG export use browser canvas and local storage on your device. Your name and drawn strokes are not posted to a server or sent to a third party. The tool saves your current mode, style, ink choice, typed name, and strokes so a refresh does not discard your work; clearing the signature removes the name and drawn strokes from that saved state. For a one-time result, download the PNG and clear the canvas when you are done.',
      },
    ],
    faq: [
      {
        q: 'Can I download my signature with a transparent background?',
        a: 'Yes. The download is a transparent PNG. The tool detects the visible ink, crops away unused canvas space, and retains a 36-pixel transparent margin so the signature can sit over a document without a white box.',
      },
      {
        q: 'Does this upload my signature or name?',
        a: 'No. Drawing, typed preview, browser storage, and PNG creation all run on your device. This tool has no upload step or server-side signature storage.',
      },
      {
        q: 'Can I make a signature on a phone?',
        a: 'Yes. In “Draw by hand” mode, the signature area accepts pointer input from a finger or stylus as well as a mouse or trackpad. You can also use “Type name” when drawing is inconvenient on a small screen.',
      },
      {
        q: 'Is a generated signature image legally binding?',
        a: 'A generated PNG is a visual signature image, not a certificate-based digital signature or audit trail. Whether it is accepted depends on the document, the service receiving it, the parties’ agreement, and applicable local rules, so follow the signing method required by the recipient.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '서명 만들기 — 손글씨·이름 서명 투명 PNG',
    description:
      '손글씨로 그리거나 이름을 입력해 서명 이미지를 만들고, 여백을 정리한 투명 PNG로 바로 저장하세요. 이름과 필적은 기기 밖으로 전송되지 않습니다.',
    h1: '서명 만들기',
    tagline: '직접 그린 사인이나 이름 서명을 투명 PNG로 만들고, 브라우저 안에만 보관하세요.',
    name: '서명 만들기',
    keywords: ['사인 만들기', '전자서명 이미지', '손글씨 서명', '서명 png', '투명 배경 서명'],
    howTo: [
      '이름을 글꼴로 만들려면 “이름 입력”, 직접 쓰려면 “손글씨”를 고르세요.',
      '이름을 입력하고 스타일을 고르거나, 마우스·손가락·펜으로 서명 영역에 직접 쓰세요.',
      '잉크 색을 고르고 손글씨라면 펜 굵기를 정하세요. 마지막 획은 “한 획 취소”로 되돌릴 수 있습니다.',
      '실시간 미리보기를 확인한 뒤 “투명 PNG 다운로드”를 누르세요.',
    ],
    sections: [
      {
        heading: '서명란에 바로 올릴 수 있는 투명 PNG',
        body: '내려받는 파일은 잉크 바깥 영역이 투명한 PNG입니다. 흰 배경 이미지처럼 사각형이 남지 않아 문서의 서명란이나 이메일 서명 위에 자연스럽게 올릴 수 있습니다. 저장할 때 도구가 보이는 잉크 영역을 찾아 빈 캔버스를 잘라 내고, 사방에 36픽셀의 투명 여백을 남깁니다. 작업 캔버스는 1,200 × 400픽셀이며, 실제 서명 크기에 맞춰 잘린 PNG가 내려받아집니다. 별도의 이미지 자르기 작업이 필요 없습니다.',
      },
      {
        heading: '이름 서명, 손글씨 서명, 전자서명은 다릅니다',
        body: '“이름 입력”은 입력한 글자를 서명처럼 보이는 이미지로 만들고, “손글씨”는 마우스·터치·펜으로 그린 획을 그대로 기록합니다. 두 방식 모두 이미지 파일을 만들 뿐, 인증서 기반의 디지털 서명이나 서명 이력을 증명하는 감사 기록을 만들지는 않습니다. 서명 이미지를 받는 서식에는 쓸 수 있지만, 계약 서비스·회사·기관이 본인 확인이나 특정 전자서명 방식을 요구한다면 그 절차를 따라야 합니다. 중요한 제출 전에는 해당 문서의 안내를 확인하세요.',
      },
      {
        heading: '내 서명은 내 브라우저 안에서만 처리됩니다',
        body: '미리보기, 설정 저장, PNG 만들기는 모두 브라우저의 캔버스와 로컬 저장소에서 실행됩니다. 이름과 손글씨 획을 서버나 제3자에게 보내지 않습니다. 새로고침해도 작업이 사라지지 않도록 현재 방식, 글꼴, 잉크, 이름, 획을 이 브라우저에 저장합니다. “지우기”를 누르면 저장된 이름과 손글씨 획도 함께 비웁니다. 한 번만 쓸 서명이라면 PNG를 내려받은 뒤 지워 두면 됩니다.',
      },
    ],
    faq: [
      {
        q: '투명 배경 서명 PNG로 저장되나요?',
        a: '네. 잉크가 있는 부분만 찾아 빈 공간을 자르고, 사방에 36픽셀의 투명 여백을 둔 PNG로 저장됩니다. 문서나 이미지 위에 올려도 흰 배경 사각형이 생기지 않습니다.',
      },
      {
        q: '이름이나 사인을 서버로 업로드하나요?',
        a: '아니요. 이름 입력, 손글씨 그리기, 브라우저 저장, PNG 생성은 모두 사용 중인 기기에서 실행됩니다. 이 도구에는 서버 업로드나 서명 저장 단계가 없습니다.',
      },
      {
        q: '휴대폰에서도 서명을 만들 수 있나요?',
        a: '네. “손글씨” 방식은 손가락이나 터치펜 입력을 받을 수 있고, 마우스와 트랙패드도 지원합니다. 작은 화면에서 직접 쓰기 어렵다면 “이름 입력”으로 서명 이미지를 만들 수 있습니다.',
      },
      {
        q: '이 이미지 서명에 법적 효력이 있나요?',
        a: '이 도구가 만드는 파일은 서명 모양의 PNG 이미지이며, 인증서 기반 디지털 서명이나 감사 기록은 아닙니다. 인정 여부는 문서 종류, 상대방의 합의, 제출 서비스와 국가별 규정에 따라 다르므로, 받는 곳이 정한 서명 방법을 따라야 합니다.',
      },
    ],
    ui: {
      modeLabel: '만드는 방식',
      modeType: '이름 입력',
      modeDraw: '손글씨',
      nameLabel: '이름 또는 이니셜',
      namePlaceholder: '홍길동',
      nameHint: '최대 80자입니다. 입력한 이름은 이 브라우저 안에만 남습니다.',
      styleLabel: '글자 스타일',
      styleScript: '손글씨',
      styleFormal: '격식체',
      styleSimple: '간결체',
      inkLabel: '잉크 색',
      inkBlue: '파랑',
      inkBlack: '검정',
      penLabel: '펜 굵기',
      penThin: '가는 펜',
      penMedium: '보통 펜',
      penBold: '굵은 펜',
      previewLabel: '서명 미리보기',
      drawCanvasLabel: '서명 작성 영역',
      drawHint: '마우스, 트랙패드, 손가락, 터치펜으로 서명하세요.',
      drawPlaceholder: '여기에 서명하세요',
      undo: '한 획 취소',
      clear: '지우기',
      privacyNote: '이름과 손글씨는 이 브라우저 안에서만 그리고 저장합니다. 어디에도 업로드되지 않습니다.',
      transparentNote: 'PNG는 잉크 부분에 맞춰 잘리고 배경은 투명하게 유지됩니다.',
      download: '투명 PNG 다운로드',
      downloadShortcutKey: 'D',
      downloadShortcut: '텍스트 입력 중이 아닐 때 다운로드',
      readyHint: '이름을 입력하거나 서명을 그린 뒤 다운로드하세요.',
      downloadStarted: '투명 PNG 다운로드를 시작했습니다.',
      downloadFailed: 'PNG를 만들지 못했습니다. 다시 시도해 주세요.',
      defaultName: '홍길동',
    },
  },
};

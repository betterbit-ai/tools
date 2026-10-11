import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  typeLabel: 'What should the code open?',
  urlType: 'Website',
  textType: 'Text',
  wifiType: 'Wi-Fi',
  urlLabel: 'Website address',
  textLabel: 'Text to encode',
  urlHint: 'A plain domain is saved as an https:// link.',
  urlPlaceholder: 'example.com/menu',
  textPlaceholder: 'Write a message, code, or other text',
  wifiNameLabel: 'Network name (SSID)',
  wifiSecurityLabel: 'Security',
  wifiPasswordLabel: 'Password',
  wifiWpa: 'WPA / WPA2 / WPA3',
  wifiWep: 'WEP',
  wifiOpen: 'No password',
  wifiHiddenLabel: 'Hidden network',
  errorCorrectionLabel: 'Error correction',
  errorCorrectionHint: 'M is a practical default for clean prints.',
  logoCorrectionHint: 'A logo uses H correction automatically.',
  logoLabel: 'Logo (optional)',
  logoHint: 'Kept only in this browser tab.',
  logoDropTitle: 'Choose or drop a logo',
  logoDropHint: 'PNG, JPG, WebP, or SVG',
  removeLogo: 'Remove',
  logoError: 'This logo could not be read. Choose another image file.',
  privacyNote: 'The text, Wi-Fi password, and logo stay on this device. Only your settings are saved in this browser.',
  previewHeading: 'QR code preview',
  previewAlt: 'Generated QR code',
  moduleCount: '{count} × {count} modules',
  downloadSvg: 'Download SVG',
  downloadPng: 'Download PNG',
  staticNote:
    'This is a static code: it has no scan limit or expiry, but its content cannot be changed after printing.',
  emptyError: 'Enter a website address or text to make a QR code.',
  wifiNameError: 'Enter the Wi-Fi network name (SSID).',
  tooLongError: 'This content is too long for the selected correction level. Shorten it or choose a lower level.',
  generationError: 'This QR code could not be generated. Shorten the content and try again.',
  downloadError: 'The PNG could not be created in this browser. Download the SVG instead.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'QR Code Generator — Private SVG & PNG Downloads',
    description:
      'Create a static QR code for a URL, text, or Wi-Fi in your browser. Add a local logo and download clean SVG or PNG with no ads, account, watermark, or expiry.',
    h1: 'QR Code Generator',
    tagline:
      'Make a static QR code locally, add a logo, and download a clean SVG or PNG — no ads, account, watermark, or service expiry.',
    name: 'QR Code Generator',
    keywords: [
      'qr code generator',
      'create qr code',
      'qr maker',
      'url to qr code',
      'wifi qr code',
      'qr code with logo',
    ],
    howTo: [
      'Choose Website, Text, or Wi-Fi, then enter the information to encode.',
      'For a Wi-Fi code, enter the network name, security type, and password; reserved characters are escaped automatically.',
      'Keep M correction for normal clean use, or add a logo to use H correction automatically.',
      'Check the live preview, then download SVG for scalable print or PNG for a bitmap image.',
      'Scan the final exported code with a phone before you print or publish it.',
    ],
    sections: [
      {
        heading: 'Static QR codes do not expire, but their content is fixed',
        body: 'This tool writes your URL, text, or Wi-Fi information directly into the QR pattern. It does not create a short link or route scans through a Betterbit server, so there is no scan limit or service expiry. The trade-off is important: once a printed code is distributed, its encoded content cannot be edited. If a website address may change, encode a URL that you control and can redirect yourself.',
      },
      {
        heading: 'Choose correction for the physical conditions',
        body: 'QR error correction trades capacity for damage tolerance. DENSO WAVE lists approximate recovery levels of 7% for L, 15% for M, 25% for Q, and 30% for H. M is a good default for a clean screen or print. This generator switches to H when you add a logo, keeps a four-module quiet zone around every code, and limits the logo plate to 22% of the QR width. Still test the final image on a real phone before printing.',
      },
      {
        heading: 'SVG stays sharp; PNG is ready to place',
        body: 'SVG is a vector image, so it can be enlarged in a document or design app without adding blur. The PNG download is rendered at 1,024 × 1,024 pixels for slides and ordinary print layouts. QR Code Model 2 uses 40 versions, from 21 × 21 to 177 × 177 modules before the quiet zone; longer content makes a denser code that is harder to scan at a small physical size. Keep URLs short and avoid shrinking dense codes.',
      },
    ],
    faq: [
      {
        q: 'Do QR codes made here expire?',
        a: 'No. This generator makes a static QR code whose information is embedded in the pattern itself, so Betterbit does not need to host it and cannot deactivate it. The destination website can still stop working if its owner removes or changes it.',
      },
      {
        q: 'Is my Wi-Fi password or logo uploaded?',
        a: 'No. The QR payload, Wi-Fi password, and selected logo are processed in your browser and are not sent to a server. The logo remains only in the current browser tab; the text settings can be saved in this browser so a refresh does not discard them.',
      },
      {
        q: 'Which QR error-correction level should I use?',
        a: 'Use M for a clean, ordinary QR code. Use H for a logo or a code likely to be scuffed; it has about 30% recovery capacity versus about 15% for M, but it makes the pattern denser and reduces the amount of text that fits.',
      },
      {
        q: 'Should I download SVG or PNG?',
        a: 'Download SVG when the code might be enlarged for print because it is a scalable vector file. Download the 1,024 × 1,024 PNG for software that needs a regular image file, such as a slide or social post.',
      },
      {
        q: 'Can a QR code connect someone to Wi-Fi?',
        a: 'Yes. Enter the Wi-Fi SSID, security type, and password to create the standard WIFI: payload. A compatible phone can offer to join after scanning, but people should still confirm the network name before connecting.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'QR코드 만들기 — 로고·SVG·PNG, 광고 없음',
    description:
      'URL·텍스트·와이파이 정보를 브라우저에서 정적 QR코드로 만드세요. 로고를 넣고 SVG 또는 PNG로 저장하며, 광고·회원가입·워터마크·만료가 없습니다.',
    h1: 'QR코드 만들기',
    tagline:
      'URL·텍스트·와이파이를 정적 QR코드로 만들고 로고·SVG·PNG까지 브라우저 안에서 처리합니다 — 광고와 워터마크가 없습니다.',
    name: 'QR코드 만들기',
    keywords: ['qr코드 만들기', '큐알코드 만들기', 'qr코드 생성기', '무료 qr코드', 'URL QR코드', '와이파이 QR코드'],
    howTo: [
      '웹사이트, 텍스트, 와이파이 중 담을 정보의 종류를 고르고 내용을 입력합니다.',
      '와이파이는 네트워크 이름(SSID), 보안 방식, 비밀번호를 입력합니다. 특수문자는 QR 규격에 맞게 자동 처리됩니다.',
      '일반적인 깨끗한 인쇄물은 M을 쓰고, 로고를 넣으면 자동으로 H 오류 복원 수준을 사용합니다.',
      '미리보기를 확인한 뒤, 확대 인쇄에는 SVG를, 일반 이미지에는 PNG를 저장합니다.',
      '인쇄하거나 게시하기 전에 휴대폰으로 최종 파일을 직접 스캔합니다.',
    ],
    sections: [
      {
        heading: '정적 QR코드는 만료되지 않지만 내용을 고칠 수 없습니다',
        body: '이 도구는 URL·텍스트·와이파이 정보를 QR 무늬 자체에 기록합니다. 단축 주소를 만들거나 Betterbit 서버를 거치지 않으므로 스캔 횟수 제한이나 서비스 만료가 없습니다. 대신 한 번 인쇄해 배포한 QR코드 안의 내용은 바꿀 수 없습니다. 주소가 바뀔 가능성이 있다면 직접 관리하는 URL을 넣고, 그 URL에서 리다이렉트하도록 운영하는 방법이 안전합니다.',
      },
      {
        heading: '오류 복원 수준은 인쇄 환경에 맞게 고릅니다',
        body: 'QR코드의 오류 복원은 저장 용량과 손상 복원력을 맞바꿉니다. 덴소 웨이브 자료의 대략적인 복원 비율은 L 7%, M 15%, Q 25%, H 30%입니다. 화면이나 깨끗한 인쇄물은 M이 기본으로 알맞습니다. 이 생성기는 로고를 넣으면 H를 자동으로 사용하고, QR코드 바깥에 4모듈의 여백을 두며, 로고 배경판은 QR 폭의 22%로 제한합니다. 그래도 인쇄 전 실제 휴대폰으로 스캔해야 합니다.',
      },
      {
        heading: 'SVG는 크게 인쇄해도 선명하고 PNG는 바로 넣기 좋습니다',
        body: 'SVG는 벡터 이미지라 문서나 디자인 프로그램에서 키워도 흐려지지 않습니다. PNG는 발표 자료나 일반 이미지 삽입에 쓸 수 있도록 1,024 × 1,024픽셀로 만듭니다. QR Code Model 2는 여백을 제외하고 21 × 21부터 177 × 177모듈까지 40개 크기를 사용합니다. 내용이 길수록 무늬가 빽빽해져 작은 크기에서 스캔이 어려워지므로 URL은 짧게 쓰고, 복잡한 코드는 작게 줄이지 마세요.',
      },
    ],
    faq: [
      {
        q: '여기서 만든 QR코드는 나중에 만료되나요?',
        a: '아니요. 이 도구는 정보를 QR코드 무늬 안에 직접 넣는 정적 QR코드를 만들므로 Betterbit가 따로 호스팅하거나 중지할 수 없습니다. 다만 QR코드가 가리키는 웹사이트는 운영자가 삭제하거나 주소를 바꾸면 열리지 않을 수 있습니다.',
      },
      {
        q: '와이파이 비밀번호나 로고가 서버에 올라가나요?',
        a: '아니요. QR코드 내용, 와이파이 비밀번호, 선택한 로고는 모두 브라우저 안에서 처리하며 서버로 전송하지 않습니다. 로고는 현재 브라우저 탭에만 남고, 입력 설정만 이 브라우저에 저장되어 새로고침 후에도 복원될 수 있습니다.',
      },
      {
        q: 'QR코드 오류 복원 수준은 무엇을 골라야 하나요?',
        a: '일반적인 깨끗한 QR코드는 M을 사용하면 됩니다. 로고를 넣거나 긁힐 수 있는 곳에 인쇄한다면 H를 쓰세요. H는 약 30%까지 복원할 수 있지만 M의 약 15%보다 무늬가 촘촘해지고 담을 수 있는 텍스트도 줄어듭니다.',
      },
      {
        q: 'QR코드는 SVG와 PNG 중 어떤 형식으로 저장하나요?',
        a: '크게 인쇄하거나 편집할 예정이면 크기를 바꿔도 선명한 벡터 SVG를 저장하세요. 슬라이드나 SNS처럼 일반 이미지 파일이 필요한 곳에는 1,024 × 1,024픽셀 PNG를 쓰면 됩니다.',
      },
      {
        q: '와이파이 자동 연결 QR코드를 만들 수 있나요?',
        a: '네. 네트워크 이름, 보안 방식, 비밀번호를 입력하면 표준 WIFI: 형식 QR코드를 만듭니다. 호환되는 휴대폰은 스캔 후 연결을 제안하지만, 연결 전 네트워크 이름을 다시 확인하는 것이 안전합니다.',
      },
    ],
    ui: {
      typeLabel: 'QR코드에 담을 정보',
      urlType: '웹사이트',
      textType: '텍스트',
      wifiType: '와이파이',
      urlLabel: '웹사이트 주소',
      textLabel: 'QR코드에 담을 텍스트',
      urlHint: '도메인만 입력하면 https:// 주소로 저장합니다.',
      urlPlaceholder: 'example.com/menu',
      textPlaceholder: '메시지, 코드, 기타 텍스트를 입력하세요',
      wifiNameLabel: '네트워크 이름 (SSID)',
      wifiSecurityLabel: '보안 방식',
      wifiPasswordLabel: '비밀번호',
      wifiWpa: 'WPA / WPA2 / WPA3',
      wifiWep: 'WEP',
      wifiOpen: '비밀번호 없음',
      wifiHiddenLabel: '숨겨진 네트워크',
      errorCorrectionLabel: '오류 복원 수준',
      errorCorrectionHint: '깨끗한 인쇄물에는 M이 기본으로 알맞습니다.',
      logoCorrectionHint: '로고를 넣으면 H 수준을 자동으로 사용합니다.',
      logoLabel: '로고 (선택)',
      logoHint: '현재 브라우저 탭에서만 사용합니다.',
      logoDropTitle: '로고를 선택하거나 놓으세요',
      logoDropHint: 'PNG, JPG, WebP, SVG',
      removeLogo: '제거',
      logoError: '로고를 읽을 수 없습니다. 다른 이미지 파일을 선택하세요.',
      privacyNote:
        '입력한 텍스트·와이파이 비밀번호·로고는 이 기기 밖으로 나가지 않습니다. 설정만 이 브라우저에 저장합니다.',
      previewHeading: 'QR코드 미리보기',
      previewAlt: '생성된 QR코드',
      moduleCount: '{count} × {count} 모듈',
      downloadSvg: 'SVG 저장',
      downloadPng: 'PNG 저장',
      staticNote: '정적 QR코드라 스캔 제한이나 만료는 없지만, 인쇄 후에는 담긴 내용을 바꿀 수 없습니다.',
      emptyError: 'QR코드로 만들 웹사이트 주소나 텍스트를 입력하세요.',
      wifiNameError: '와이파이 네트워크 이름(SSID)을 입력하세요.',
      tooLongError: '선택한 오류 복원 수준에 비해 내용이 너무 깁니다. 내용을 줄이거나 더 낮은 수준을 선택하세요.',
      generationError: 'QR코드를 만들 수 없습니다. 내용을 줄인 뒤 다시 시도하세요.',
      downloadError: '이 브라우저에서 PNG를 만들 수 없습니다. SVG를 저장해 사용하세요.',
    },
  },
};

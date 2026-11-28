import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  modeLabel: 'Which user agent to read',
  modeMine: 'This browser',
  modeOther: 'Check another string',
  copyRaw: 'Copy user agent',
  copied: 'Copied',
  otherLabel: 'Paste a user agent from a log, an email or a bug report',
  otherHint: 'It is read here in the page. The string is not sent anywhere.',
  otherPlaceholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 …',
  rawString: 'User agent sent by this browser',
  unknown: 'Unknown',
  none: 'None',
  browser: 'Browser',
  version: 'Version',
  engine: 'Engine',
  os: 'Operating system',
  device: 'Device',
  model: 'Model',
  inApp: 'In-app browser',
  bot: 'Crawler or tool',
  deviceDesktop: 'desktop',
  deviceMobile: 'mobile',
  deviceTablet: 'tablet',
  deviceTv: 'TV',
  deviceBot: 'bot / crawler',
  deviceTool: 'command-line client',
  deviceUnknown: 'unknown',
  inAppNotice:
    'You are reading this inside {app}. Embedded browsers keep their own cookie jar and often block file uploads, downloads and some sign-ins — copy the address and open it in Safari, Chrome or your usual browser.',
  botNotice: 'This string identifies {bot}, so the page is treating it as a crawler or an automated client.',
  reducedNotice:
    'This string uses Chromium’s reduced form: the minor version is shown as 0.0.0 and the operating-system version is frozen. The browser and major version are still right, but the exact OS build is not in the string.',
  ipadNotice:
    'iPadOS Safari reports itself as a Mac in the user-agent string. The touch-point count shows this is an iPad, not a Mac.',
  emptyPaste: 'Paste a user-agent string to read it.',
  unknownString:
    'Nothing in this string matches a known browser, app or crawler. It may be custom, truncated, or written by hand.',
  copyReport: 'Copy browser report',
  valuesTitle: 'Other values this browser reports',
  valuesHint:
    'These come from JavaScript, not from the user-agent header. Client Hints appear only in Chromium browsers, and the high-entropy values are requested once when this page loads.',
  chPlatform: 'navigator.platform',
  chVendor: 'navigator.vendor',
  chLanguages: 'Preferred languages',
  chCores: 'CPU cores (hardwareConcurrency)',
  chMemory: 'Device memory',
  chTouch: 'Max touch points',
  chCookies: 'Cookies enabled',
  yes: 'Yes',
  no: 'No',
  clientHints: 'Client Hints brands',
  unavailable: 'Unavailable',
  chHintPlatform: 'Client Hints platform',
  chHintPlatformVersion: 'Client Hints platform version',
  chHintArch: 'Architecture',
  chHintBitness: 'Bitness',
  chHintModel: 'Device model (hints)',
  hintsSupported:
    'This browser supports User-Agent Client Hints, so a site can ask for the platform version, architecture and device model separately from the string. The values are read locally and not sent by this page.',
  hintsUnsupported:
    'This browser does not expose User-Agent Client Hints (Safari and Firefox do not implement them), so the identity above comes from the user-agent string alone.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'What Is My User Agent? Browser and Device Check',
    description:
      'See the user agent this browser sends, plus the browser, engine, OS, device and in-app browser it reveals. Paste any string from a log — nothing is uploaded.',
    h1: 'What Is My User Agent?',
    tagline:
      'Read the identity your browser announces to every site, see what it hides, and paste any string from a server log to find out what sent it.',
    name: 'User Agent Checker',
    keywords: [
      'what is my user agent',
      'user agent checker',
      'my browser',
      'check user agent',
      'user agent string',
      'browser version check',
      'in-app browser check',
      'user agent parser',
    ],
    howTo: [
      'Open the page: the user-agent string this browser sends and its parsed identity appear at once.',
      'Read the browser, engine, operating system and device cards to see what a site can tell about you.',
      'If an app opened the page in its own browser, copy the address and reopen it in Safari, Chrome or your usual browser.',
      'Switch to Check another string to paste a user agent from a server log, an email or a bug report.',
      'Copy browser report to paste the details into a support form or a bug report.',
    ],
    sections: [
      {
        heading: 'What a user-agent string actually says',
        body: 'Every HTTP request carries a User-Agent header, and JavaScript exposes the same text as navigator.userAgent. The format is a stack of historical claims: Mozilla/5.0 opens almost every string, because browsers once had to pretend to be Netscape to be served a working page; AppleWebKit and Safari tokens follow, and browsers built on Chromium add Chrome, Edg or OPR. The parser has to check the most specific token first, because an Edge string also contains Chrome and Safari, and an iPhone Chrome string contains Safari. The operating system and device come from the platform comment in brackets, and an embedded app adds its own token (KAKAOTALK, NAVER(inapp, FBAN, Instagram), which is how this tool can tell an in-app browser from the real one.',
      },
      {
        heading: 'Why the string no longer tells the whole truth',
        body: 'Chromium now reduces what the string reveals. Chrome and Edge send a fixed 0.0.0 minor version, report every Mac as Mac OS X 10.15.7 (including Apple-silicon Macs), report Windows 10 and Windows 11 both as Windows NT 10.0, and report an Android device as Android 10 with the model replaced by “K”. Safari freezes the macOS version too, and iPadOS reports itself as a Mac until a script checks navigator.maxTouchPoints, which is why this page corrects an iPad in desktop mode. The missing detail moved to User-Agent Client Hints (navigator.userAgentData), which Chromium exposes and which Safari and Firefox do not implement, so the two browsers show fewer values here rather than guesses.',
      },
      {
        heading: 'What to do with the string',
        body: 'For a bug report, the parsed browser, engine, operating system and device are usually enough, and the Copy browser report button puts them in one block with the raw string. For a support request, the raw string is what a developer needs; for a privacy review, it shows what a site learns before you sign in, which is the browser, its major version, the platform family, and whether a mobile device or an app browser is involved. Remember that the string is a claim, not proof: developer tools, extensions and privacy browsers can rewrite it, and anyone can set one by hand, so a site that trusts it alone can be fooled. If you opened this page inside KakaoTalk, Instagram, LINE or another app, the same token that revealed it can also explain a failed login or upload — open the address in a full browser instead.',
      },
    ],
    faq: [
      {
        q: 'What is my user agent?',
        a: 'It is the line of text this browser sends with every request to a website, shown in full on this page. It names a browser and version, a platform and often a device, and it is the same value a server sees in the User-Agent header. Nothing about your name or account is in it, but it is far more identifying than most people expect when combined with other signals.',
      },
      {
        q: 'Why does my user agent say Windows NT 10.0 when I use Windows 11?',
        a: 'Chromium and other browsers stopped updating that part of the string, so Windows 10 and Windows 11 both report Windows NT 10.0. Chrome and Edge can give the real platform version through User-Agent Client Hints instead, and this page shows it in the values table when the browser provides it. The raw string alone cannot separate the two versions.',
      },
      {
        q: 'Why does my Mac say macOS 10.15.7 in the user agent?',
        a: 'The version is frozen for privacy and compatibility, so every Mac — Intel or Apple silicon, Ventura or Sonoma — reports 10.15.7 in the string. Safari also freezes the macOS version it reports. Client Hints can return the real platform version in Chromium browsers; otherwise the system’s About screen is the reliable source for the actual macOS version.',
      },
      {
        q: 'Can two people have the same user agent?',
        a: 'Yes, and very often. A reduced Chromium string carries only the browser brand, major version, platform family and mobile flag, so millions of people share it. Sites that need to tell visitors apart use cookies, storage or other signals instead. A user-agent string is a capability announcement, not an identifier.',
      },
      {
        q: 'Why do some logins or downloads fail inside KakaoTalk or Instagram?',
        a: 'Those apps open links in an embedded browser that keeps a separate cookie jar from your main browser, and many embedded browsers block file pickers, downloads and pop-ups that a sign-in flow needs. This page flags the app that embedded the browser. Copy the address and open it in Safari or Chrome, sign in there, and the login usually completes.',
      },
      {
        q: 'Does this page send my user agent anywhere?',
        a: 'No. The string and every parsed value are read and processed in this tab with JavaScript. The tool is a static page with no upload step and no account, so the only copy of your user-agent string that leaves your device is the one every site receives in its request headers anyway.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '내 브라우저 정보 확인 — 유저 에이전트 해석',
    description:
      '브라우저가 모든 사이트에 보내는 유저 에이전트 문자열과 그 안에 담긴 브라우저·엔진·운영체제·기기·인앱 브라우저를 확인하세요. 로그에서 복사한 문자열도 붙여 넣어 해석합니다.',
    h1: '내 브라우저 정보 확인',
    tagline:
      '브라우저가 스스로 알리는 정보를 읽고, 그 문자열이 숨기는 것과 인앱 브라우저에서 링크를 열었는지까지 한눈에 확인합니다.',
    name: '유저 에이전트 확인',
    keywords: [
      '내 브라우저 정보',
      '유저 에이전트 확인',
      'user agent 확인',
      '내 브라우저 버전',
      '브라우저 확인 사이트',
      '인앱 브라우저 확인',
      '유저에이전트 해석',
      '카카오톡 인앱 브라우저',
    ],
    howTo: [
      '페이지를 열면 이 브라우저가 보내는 유저 에이전트 문자열과 해석 결과가 바로 나옵니다.',
      '브라우저·엔진·운영체제·기기 카드로 사이트가 무엇을 알 수 있는지 확인합니다.',
      '카카오톡이나 인스타그램에서 링크를 열었다면 주소를 복사해 사파리·크롬에서 다시 엽니다.',
      '다른 문자열 확인으로 바꿔 서버 로그나 메일에서 받은 유저 에이전트를 붙여 넣습니다.',
      '브라우저 보고서 복사로 문의 양식이나 버그 리포트에 붙여 넣습니다.',
    ],
    sections: [
      {
        heading: '유저 에이전트 문자열이 실제로 말하는 것',
        body: '모든 HTTP 요청에는 User-Agent 헤더가 붙고, 자바스크립트에서는 navigator.userAgent로 같은 값을 읽습니다. 형식은 오랜 호환성의 흔적입니다. 예전 브라우저는 네스케이프로 보이지 않으면 페이지를 제대로 주지 않는 사이트 때문에 거의 모두 Mozilla/5.0으로 시작했고, AppleWebKit·Safari 토큰이 뒤따릅니다. 그래서 파서는 더 구체적인 토큰을 먼저 봐야 합니다. Edge 문자열에도 Chrome과 Safari가 들어 있고, 아이폰 크롬 문자열에도 Safari가 있기 때문입니다. 운영체제와 기기는 괄호 안 플랫폼 설명에서, 인앱 브라우저는 앱이 덧붙이는 토큰(KAKAOTALK, NAVER(inapp, FBAN, Instagram)에서 구분합니다.',
      },
      {
        heading: '문자열이 모든 것을 알려 주지 않는 이유',
        body: '크로미움 계열 브라우저는 이제 문자열 정보를 줄여서 보냅니다. 크롬과 엣지는 부 버전을 0.0.0으로 고정하고, 애플 실리콘 맥을 포함한 모든 맥을 Mac OS X 10.15.7로, 윈도우 10과 11을 모두 Windows NT 10.0으로 보고하며, 안드로이드 기기는 모델명을 K로 가립니다. 사파리도 macOS 버전을 고정하고, 아이패드의 사파리는 스크립트가 navigator.maxTouchPoints를 확인하기 전까지 맥으로 자신을 소개합니다. 이 페이지가 아이패드 데스크톱 모드를 바로잡는 이유입니다. 빠진 정보는 User-Agent Client Hints(navigator.userAgentData)로 옮겨 갔고, 크로미움은 이를 제공하지만 사파리와 파이어폭스는 지원하지 않아 두 브라우저에서는 값을 추측하지 않고 확인 불가로 표시합니다.',
      },
      {
        heading: '확인한 정보를 어디에 쓰나',
        body: '버그 리포트에는 해석된 브라우저·엔진·운영체제·기기만으로 충분한 경우가 많고, 브라우저 보고서 복사를 누르면 원본 문자열과 함께 한 덩어리로 복사됩니다. 개발자에게 문의할 때는 원본 문자열이 가장 유용합니다. 개인정보 점검 관점에서는 로그인 전에 사이트가 무엇을 아는지 보여 줍니다. 브라우저와 주 버전, 플랫폼 계열, 모바일 여부, 앱 안에서 열렸는지 정도입니다. 다만 이 문자열은 주장일 뿐 증거가 아닙니다. 개발자 도구, 확장 프로그램, 개인정보 보호 브라우저가 바꿀 수 있고 누구나 직접 정할 수 있으므로, 문자열만 믿는 사이트는 속을 수 있습니다. 카카오톡·인스타그램·LINE에서 이 페이지를 열었다면 로그인이나 파일 업로드가 막히는 이유도 같은 토큰으로 설명되니, 주소를 복사해 일반 브라우저에서 다시 여세요.',
      },
    ],
    faq: [
      {
        q: '내 유저 에이전트는 무엇인가요?',
        a: '브라우저가 웹사이트에 요청할 때마다 함께 보내는 한 줄의 문자열이며, 이 페이지에 원본 그대로 표시됩니다. 브라우저 이름과 버전, 플랫폼, 기기 종류가 담겨 있고 서버가 받는 User-Agent 헤더와 같은 값입니다. 이름이나 계정 정보는 들어 있지 않지만, 다른 신호와 결합하면 생각보다 사람을 잘 구분합니다.',
      },
      {
        q: '윈도우 11인데 유저 에이전트에 Windows NT 10.0이라고 나오는 이유는 무엇인가요?',
        a: '크로미움을 비롯한 브라우저가 그 부분을 더 이상 갱신하지 않아 윈도우 10과 11이 모두 Windows NT 10.0으로 보고됩니다. 크롬과 엣지는 User-Agent Client Hints로 실제 플랫폼 버전을 따로 알려 줄 수 있고, 이 페이지는 브라우저가 제공하면 값 표에 표시합니다. 원본 문자열만으로는 두 버전을 구분할 수 없습니다.',
      },
      {
        q: '맥인데 유저 에이전트에 macOS 10.15.7이라고 나오는 이유는 무엇인가요?',
        a: '개인정보 보호와 호환성을 위해 버전이 고정되어 있어, 인텔 맥이든 애플 실리콘 맥이든 문자열에는 10.15.7로 표시됩니다. 사파리도 보고하는 macOS 버전을 고정합니다. 크로미움 브라우저에서는 Client Hints가 실제 플랫폼 버전을 돌려줄 수 있고, 그 밖에는 시스템 설정의 정보 화면이 실제 버전을 확인하는 확실한 방법입니다.',
      },
      {
        q: '다른 사람과 유저 에이전트가 같을 수 있나요?',
        a: '네, 흔히 같습니다. 축소된 크로미움 문자열에는 브라우저 브랜드, 주 버전, 플랫폼 계열, 모바일 여부만 담기므로 수백만 명이 같은 값을 씁니다. 방문자를 구분해야 하는 사이트는 대신 쿠키나 저장소 같은 다른 신호를 사용합니다. 유저 에이전트는 식별자가 아니라 기능을 알리는 문자열입니다.',
      },
      {
        q: '카카오톡이나 인스타그램에서 로그인·다운로드가 안 되는 이유는 무엇인가요?',
        a: '이 앱들은 링크를 자체 인앱 브라우저로 열고, 이 브라우저는 평소 쓰는 브라우저와 쿠키 저장소가 다릅니다. 또 파일 선택, 다운로드, 팝업을 막아 로그인 절차가 끝나지 않는 경우가 많습니다. 이 페이지는 어떤 앱이 브라우저를 열었는지 표시합니다. 주소를 복사해 사파리나 크롬에서 열고 로그인하면 대부분 해결됩니다.',
      },
      {
        q: '이 페이지가 유저 에이전트를 어디로 보내나요?',
        a: '어디로도 보내지 않습니다. 문자열과 해석 결과는 이 탭 안에서 자바스크립트로 읽고 처리합니다. 업로드 단계도 계정도 없는 정적 페이지이며, 기기 밖으로 나가는 문자열은 모든 사이트가 요청 헤더로 어차피 받는 값뿐입니다.',
      },
    ],
    ui: {
      modeLabel: '읽을 유저 에이전트 선택',
      modeMine: '이 브라우저',
      modeOther: '다른 문자열 확인',
      copyRaw: '유저 에이전트 복사',
      copied: '복사됨',
      otherLabel: '로그·메일·버그 리포트에서 복사한 유저 에이전트 붙여 넣기',
      otherHint: '페이지 안에서만 해석하며 문자열을 어디로도 보내지 않습니다.',
      otherPlaceholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 …',
      rawString: '이 브라우저가 보내는 유저 에이전트',
      unknown: '확인 불가',
      none: '없음',
      browser: '브라우저',
      version: '버전',
      engine: '렌더링 엔진',
      os: '운영체제',
      device: '기기 종류',
      model: '모델',
      inApp: '인앱 브라우저',
      bot: '크롤러·도구',
      deviceDesktop: '데스크톱',
      deviceMobile: '모바일',
      deviceTablet: '태블릿',
      deviceTv: 'TV',
      deviceBot: '봇·크롤러',
      deviceTool: '명령줄 클라이언트',
      deviceUnknown: '알 수 없음',
      inAppNotice:
        '{app} 안에서 이 페이지를 열었습니다. 인앱 브라우저는 쿠키 저장소가 따로 있고 파일 업로드·다운로드·일부 로그인을 막는 경우가 많습니다. 주소를 복사해 사파리나 크롬에서 여세요.',
      botNotice: '이 문자열은 {bot}(으)로 자신을 밝히고 있어 크롤러나 자동화 클라이언트로 처리됩니다.',
      reducedNotice:
        '이 문자열은 크로미움의 축소 형식입니다. 부 버전이 0.0.0으로 표시되고 운영체제 버전이 고정되어 있습니다. 브라우저와 주 버전은 정확하지만 정확한 OS 빌드는 문자열에 없습니다.',
      ipadNotice:
        '아이패드의 사파리는 유저 에이전트에서 맥으로 자신을 소개합니다. 터치 포인트 수를 보면 맥이 아니라 아이패드임을 알 수 있습니다.',
      emptyPaste: '유저 에이전트 문자열을 붙여 넣으면 해석합니다.',
      unknownString:
        '이 문자열에서 알려진 브라우저·앱·크롤러 토큰을 찾지 못했습니다. 직접 만든 값이거나 잘린 문자열일 수 있습니다.',
      copyReport: '브라우저 보고서 복사',
      valuesTitle: '브라우저가 함께 알려 주는 값',
      valuesHint:
        '유저 에이전트 헤더가 아니라 자바스크립트로 읽은 값입니다. Client Hints는 크로미움 계열 브라우저에만 있고, 상세 값은 이 페이지가 열릴 때 한 번 요청합니다.',
      chPlatform: 'navigator.platform',
      chVendor: 'navigator.vendor',
      chLanguages: '선호 언어',
      chCores: 'CPU 코어 수(hardwareConcurrency)',
      chMemory: '기기 메모리',
      chTouch: '최대 터치 포인트',
      chCookies: '쿠키 사용',
      yes: '사용',
      no: '차단',
      clientHints: 'Client Hints 브랜드',
      unavailable: '확인 불가',
      chHintPlatform: 'Client Hints 플랫폼',
      chHintPlatformVersion: 'Client Hints 플랫폼 버전',
      chHintArch: '아키텍처',
      chHintBitness: '비트 수',
      chHintModel: '기기 모델(힌트)',
      hintsSupported:
        '이 브라우저는 User-Agent Client Hints를 지원해 사이트가 문자열과 별도로 플랫폼 버전, 아키텍처, 기기 모델을 요청할 수 있습니다. 값은 이 기기에서 읽으며 이 페이지가 어디로도 보내지 않습니다.',
      hintsUnsupported:
        '이 브라우저는 User-Agent Client Hints를 제공하지 않습니다(사파리와 파이어폭스는 구현하지 않음). 위 정보는 유저 에이전트 문자열만으로 해석한 결과입니다.',
    },
  },
};

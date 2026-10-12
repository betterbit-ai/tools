import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  sourceLabel: 'Start with',
  sourceText: 'Text or emoji',
  sourceImage: 'Image',
  textLabel: 'Letters or emoji',
  textHint: 'The first two characters are used. Simple marks read best at 16 px.',
  backgroundLabel: 'Background color',
  foregroundLabel: 'Text color',
  dropTitle: 'Drop an image here, click to choose, or paste',
  dropHint: 'PNG, JPG, or WebP · processed only on your device',
  clearImage: 'Use text instead',
  imageReady: 'The image is ready to turn into every icon size.',
  fitLabel: 'Image fit',
  fitContain: 'Fit inside',
  fitCover: 'Fill & crop',
  paddingLabel: 'Padding (%)',
  paddingHint: '0–40. Add space around a logo that reaches the edges.',
  transparent: 'Transparent background',
  siteNameLabel: 'Website name',
  siteNameHint: 'Included in site.webmanifest for installed web apps.',
  privacyNote: 'Everything is rendered in your browser. Your image is never uploaded.',
  unsupported: 'This image could not be read. Try a PNG, JPG, or WebP file.',
  previewLabel: 'Live preview',
  previewAlt: 'Generated favicon preview',
  previewHint: 'Check the tiny 16 px output after downloading — detail disappears quickly.',
  addImage: 'Choose an image to create the preview.',
  processing: 'Making icon files…',
  filesLabel: 'Included files',
  download: 'Download favicon package',
  snippetLabel: 'Add this inside <head>',
  copy: 'Copy code',
  copied: 'Copied',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Favicon Generator — ICO, PNG, Manifest & HTML',
    description:
      'Make a complete favicon package from text, emoji, or an image: a real multi-size ICO, PNG icons, web manifest, and install code. Private, local, and ad-free.',
    h1: 'Favicon Generator',
    tagline: 'Create a complete favicon set from an image, letters, or an emoji — with no upload.',
    name: 'Favicon Generator',
    keywords: [
      'favicon generator',
      'favicon maker',
      'create favicon',
      'png to ico',
      'website icon',
      'apple touch icon',
      'favicon html',
    ],
    howTo: [
      'Choose Text or emoji for an instant monogram, or choose Image and drop, pick, or paste your logo.',
      'For an image, choose Fit inside or Fill & crop, then adjust the padding if the mark needs more space.',
      'Enter your website name if you want it in the PWA manifest, then check the live preview.',
      'Download the package and copy the link tags into your page’s head after uploading the files to your site root.',
    ],
    sections: [
      {
        heading: 'What is in the package?',
        body: 'The ZIP contains favicon.ico with separate 16×16, 32×32, and 48×48 PNG frames, plus standalone 16, 32, and 48 px PNGs. It also includes apple-touch-icon.png at 180×180 for iOS home-screen shortcuts, Android/PWA icons at 192×192 and 512×512, site.webmanifest, and the five HTML link tags shown above. The ICO is a real ICO container, not a PNG file renamed to .ico.',
      },
      {
        heading: 'Keep the 16 px icon simple',
        body: 'A browser tab may show only 16×16 pixels. Fine lettering, thin outlines, and detailed logos usually merge into a blur at that size. Start with one bold symbol, one or two letters, or a high-contrast shape. Use “Fit inside” with 8–16% padding for a logo that touches the edge; use “Fill & crop” when the centre is the part that must remain visible.',
      },
      {
        heading: 'Install it at the site root',
        body: 'Upload every downloaded file to the root of your deployed site, where /favicon.ico and /site.webmanifest resolve. Then paste the supplied link tags inside the HTML head. Browsers cache favicons aggressively, so test an update in a private window or with a hard refresh after deploying.',
      },
    ],
    faq: [
      {
        q: 'Which favicon sizes does a website need?',
        a: 'A broadly compatible package has favicon.ico with 16×16, 32×32, and 48×48 frames; PNG fallbacks at 16×16 and 32×32; an Apple touch icon at 180×180; and 192×192 plus 512×512 PNG icons in the web app manifest for Android and PWAs.',
      },
      {
        q: 'Does this favicon generator upload my image?',
        a: 'No. Image decoding, canvas rendering, ICO assembly, manifest creation, and ZIP packaging all happen in the browser, so the selected image does not leave the device.',
      },
      {
        q: 'Is favicon.ico a real ICO file?',
        a: 'Yes. The generated favicon.ico is an ICO container with three embedded PNG frames at 16×16, 32×32, and 48×48 pixels; it is not a PNG file merely given an .ico extension.',
      },
      {
        q: 'Can I make a favicon without a logo?',
        a: 'Yes. Choose Text or emoji, enter one or two characters, and the generator renders the same ICO, PNG, manifest, and HTML package. A simple high-contrast letter or symbol is often clearer than a detailed logo at 16 pixels.',
      },
      {
        q: 'Why does my new favicon not appear immediately?',
        a: 'Browsers cache favicon files for a long time. Confirm that /favicon.ico and the linked PNG files return successfully after deployment, then use a hard refresh or a private browsing window to check the new icon.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '파비콘 생성기 — ICO·PNG·manifest·코드 한번에',
    description:
      '텍스트, 이모지, 이미지로 완전한 파비콘 세트를 만드세요. 진짜 멀티사이즈 ICO, PNG, web manifest, 설치 코드를 브라우저에서 생성하며 파일을 업로드하지 않습니다.',
    h1: '파비콘 생성기',
    tagline: '이미지·글자·이모지 하나로 파비콘 전체 세트를 만들고 바로 설치합니다.',
    name: '파비콘 생성기',
    keywords: [
      '파비콘 만들기',
      'favicon generator',
      'favicon.ico 만들기',
      '파비콘 생성',
      '홈페이지 아이콘',
      '애플 터치 아이콘',
      '파비콘 코드',
    ],
    howTo: [
      '글자·이모지를 골라 즉시 모노그램을 만들거나, 이미지를 골라 로고를 끌어다 놓고 선택하거나 붙여넣습니다.',
      '이미지라면 “안에 맞추기” 또는 “채우고 자르기”를 고르고, 로고 가장자리에 여백이 필요하면 패딩을 조절합니다.',
      'PWA manifest에 넣을 사이트 이름을 입력하고 실시간 미리보기를 확인합니다.',
      '패키지를 내려받아 사이트 루트에 올린 뒤, 표시된 코드를 HTML head 안에 붙여넣습니다.',
    ],
    sections: [
      {
        heading: 'ZIP 파일에 들어 있는 것',
        body: 'ZIP에는 16×16, 32×32, 48×48 PNG 프레임을 각각 담은 favicon.ico와 16·32·48px PNG가 들어 있습니다. iPhone·iPad 홈 화면용 apple-touch-icon.png(180×180), Android·PWA용 192×192·512×512 PNG, site.webmanifest, 그리고 HTML link 태그 5줄도 함께 생성합니다. favicon.ico는 PNG 파일의 확장자만 바꾼 것이 아니라 실제 ICO 컨테이너입니다.',
      },
      {
        heading: '16px에서 읽히게 만들기',
        body: '브라우저 탭에서는 파비콘이 16×16px로만 보일 수 있습니다. 가는 선, 작은 글자, 복잡한 로고는 이 크기에서 뭉개집니다. 굵은 심벌 하나, 1~2글자, 대비가 높은 모양으로 시작하는 편이 좋습니다. 가장자리에 닿는 로고는 “안에 맞추기”와 8~16% 패딩을, 중앙 부분을 강조하려면 “채우고 자르기”를 사용합니다.',
      },
      {
        heading: '사이트 루트에 설치하기',
        body: '내려받은 파일을 배포한 사이트의 루트에 올려 /favicon.ico와 /site.webmanifest 경로가 열리게 합니다. 그다음 제공한 link 태그를 HTML head 안에 넣습니다. 브라우저는 파비콘을 오래 캐시하므로, 바꾼 뒤에는 강력 새로고침이나 시크릿 창으로 확인하는 것이 좋습니다.',
      },
    ],
    faq: [
      {
        q: '파비콘은 어떤 크기가 필요한가요?',
        a: '호환성 좋은 구성은 16×16·32×32·48×48 프레임이 든 favicon.ico, 16×16·32×32 PNG, iOS 홈 화면용 180×180 Apple Touch Icon, Android·PWA manifest용 192×192·512×512 PNG입니다.',
      },
      {
        q: '이미지가 서버에 업로드되나요?',
        a: '아니요. 이미지 읽기, Canvas 렌더링, ICO 조립, manifest 생성, ZIP 압축을 모두 브라우저에서 처리하므로 선택한 이미지가 기기 밖으로 전송되지 않습니다.',
      },
      {
        q: 'favicon.ico가 진짜 ICO 파일인가요?',
        a: '네. 생성된 favicon.ico는 16×16, 32×32, 48×48 PNG 프레임 3개가 들어 있는 ICO 컨테이너입니다. PNG 파일에 .ico 확장자만 붙인 파일이 아닙니다.',
      },
      {
        q: '로고 없이도 파비콘을 만들 수 있나요?',
        a: '네. “글자·이모지”를 고르고 1~2글자를 입력하면 ICO, PNG, manifest, HTML 코드가 같은 방식으로 만들어집니다. 16px에서는 단순하고 대비가 높은 글자나 심벌이 복잡한 로고보다 잘 보입니다.',
      },
      {
        q: '새 파비콘이 바로 보이지 않는 이유는 무엇인가요?',
        a: '브라우저는 파비콘 파일을 오래 캐시합니다. 배포 뒤 /favicon.ico와 링크한 PNG 파일이 정상적으로 열리는지 확인하고, 강력 새로고침 또는 시크릿 창에서 새 아이콘을 확인하세요.',
      },
    ],
    ui: {
      sourceLabel: '시작 방법',
      sourceText: '글자·이모지',
      sourceImage: '이미지',
      textLabel: '글자 또는 이모지',
      textHint: '앞의 두 글자만 사용합니다. 16px에서는 단순한 모양이 가장 잘 보입니다.',
      backgroundLabel: '배경색',
      foregroundLabel: '글자색',
      dropTitle: '이미지를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'PNG, JPG, WebP · 내 기기에서만 처리합니다',
      clearImage: '글자로 만들기',
      imageReady: '선택한 이미지로 모든 아이콘 크기를 만들 준비가 되었습니다.',
      fitLabel: '이미지 맞춤',
      fitContain: '안에 맞추기',
      fitCover: '채우고 자르기',
      paddingLabel: '패딩 (%)',
      paddingHint: '0~40. 가장자리에 닿는 로고에는 여백을 더하세요.',
      transparent: '투명 배경',
      siteNameLabel: '사이트 이름',
      siteNameHint: '웹 앱 설치용 site.webmanifest에 들어갑니다.',
      privacyNote: '모든 작업은 브라우저에서 처리됩니다. 이미지는 업로드되지 않습니다.',
      unsupported: '이 이미지를 읽을 수 없습니다. PNG, JPG, WebP 파일을 사용해 보세요.',
      previewLabel: '실시간 미리보기',
      previewAlt: '생성된 파비콘 미리보기',
      previewHint: '다운로드 후 16px 결과도 꼭 확인하세요. 작은 크기에서는 디테일이 금방 사라집니다.',
      addImage: '이미지를 선택하면 미리보기가 만들어집니다.',
      processing: '아이콘 파일을 만드는 중…',
      filesLabel: '포함 파일',
      download: '파비콘 패키지 다운로드',
      snippetLabel: 'HTML head 안에 넣기',
      copy: '코드 복사',
      copied: '복사됨',
    },
  },
};

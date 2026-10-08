import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop images here, click to choose, or paste',
  dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF · as many as you like',
  privacyNote: 'Images are converted on your device. Nothing is uploaded.',
  unsupported: 'This file can’t be read by your browser.',
  processing: 'Working…',
  download: 'Download',
  downloadAll: 'Download all ({n}) as ZIP',
  remove: 'Remove',
  clear: 'Clear all',
  format: 'Convert to',
  quality: 'Quality',
  qualityHint: 'Applies to JPG and WebP. 90–95 keeps almost no visible loss.',
  background: 'Background colour',
  backgroundHint: 'JPG has no transparency — this fills in behind transparent pixels.',
  sameFormat: 'Already this format — re-encodes as-is.',
  animatedGifWarning: 'Animated — only the first frame will be kept.',
  animatedGifNotice:
    'Converting an animated GIF keeps only its first frame, since none of these output formats can store animation.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Image Converter — JPG, PNG & WebP, No Upload',
    description:
      'Convert JPG, PNG and WebP — one image or a batch — right in your browser. Pick the JPG background colour for transparent sources. No upload, sign-up or ads.',
    h1: 'Image Converter',
    tagline: 'Convert between JPG, PNG and WebP — one file or a hundred, privately in your browser.',
    name: 'Image Converter',
    keywords: [
      'jpg to png',
      'png to jpg',
      'webp to jpg',
      'webp to png',
      'image format converter',
      'convert image online',
    ],
    howTo: [
      'Drop images onto the box, click to choose files, or paste a screenshot with Ctrl/⌘ + V.',
      'Pick the format to convert to: JPG, PNG or WebP.',
      'For JPG output, set quality and — if any source has transparency — the background colour.',
      'Results update instantly. Download each image, or all of them as a ZIP.',
    ],
    sections: [
      {
        heading: 'Which format should I pick?',
        body: 'JPG is the smallest for photos but has no transparency and loses a little detail each time it’s re-saved (lossy). PNG is lossless and supports transparency, which makes it ideal for screenshots, logos and graphics, but it is often 5–10× larger than a JPG of the same photo. WebP is a newer format that is typically 25–35% smaller than JPG at the same visual quality, supports transparency like PNG, and opens in every browser released since 2020 — it’s the best default unless a specific app or form requires JPG or PNG.',
      },
      {
        heading: 'Converting from a transparent source to JPG',
        body: 'JPG has no alpha channel, so any transparent area in a PNG, WebP or GIF has to be filled with a solid colour when converting to JPG — most online converters just fill it with white or black without telling you. This tool shows a colour picker whenever a loaded file might have transparency, defaulting to white, so the result matches what you expect instead of a surprise black box around a logo.',
      },
      {
        heading: 'Your images stay on your device',
        body: 'Most online converters upload your file to a server, convert it there and send it back — which means a copy of your photo sits on someone else’s machine, even briefly. This tool decodes and re-encodes the image using your browser’s own image engine (Canvas), so the file never leaves your computer or phone. That also removes the upload/download wait, and it keeps working offline once the page has loaded.',
      },
    ],
    faq: [
      {
        q: 'Are my images uploaded anywhere?',
        a: 'No. Every conversion happens inside your browser using the Canvas API. You can disconnect from the internet after the page loads and it still works.',
      },
      {
        q: 'How do I convert JPG to PNG?',
        a: 'Drop your JPG file onto the box above, choose "PNG" under Convert to, and download the result — it updates automatically, with no extra button to press.',
      },
      {
        q: 'Why does my PNG look worse after converting to JPG?',
        a: 'JPG uses lossy compression, which can soften fine detail and introduce blockiness around sharp edges, especially on screenshots and graphics with flat colours. Raise the Quality slider toward 95–100 to minimise this, or keep PNG or WebP if the image has crisp edges or text.',
      },
      {
        q: 'What happens to transparency when I convert to JPG?',
        a: 'JPG cannot store transparency, so transparent pixels are filled with a solid colour — white by default. Use the Background colour picker shown for transparent sources to match your own background instead.',
      },
      {
        q: 'Can I convert many images at once?',
        a: 'Yes. Drop or select multiple files and they all convert with the same settings; download them individually or all together as a single ZIP file.',
      },
      {
        q: 'Can I convert an animated GIF to JPG, PNG or WebP?',
        a: 'The file will convert, but only its first frame is kept — JPG, the PNG this tool produces, and a single Canvas-encoded WebP frame can’t store animation. The tool shows a warning when it detects more than one frame.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '이미지 변환 — JPG, PNG, WebP 무료 변환 (업로드 없음)',
    description:
      'JPG를 PNG로, PNG를 JPG로, WebP를 JPG로 바로 바꾸세요. 한 장이든 여러 장이든 브라우저에서 즉시 처리됩니다. 투명 배경을 JPG로 바꿀 때 배경색도 직접 고를 수 있어요. 업로드·가입·광고 없음.',
    h1: '이미지 형식 변환',
    tagline: 'JPG, PNG, WebP를 서로 변환하세요 — 한 장이든 백 장이든, 업로드 없이 브라우저에서.',
    name: '이미지 변환',
    keywords: ['jpg png 변환', 'png jpg 변환', 'webp jpg 변환', '이미지 변환', '사진 형식 바꾸기', '확장자 변환'],
    howTo: [
      '이미지를 끌어다 놓거나, 클릭해서 고르거나, Ctrl/⌘ + V로 붙여넣습니다.',
      '변환할 형식을 고릅니다: JPG, PNG, WebP 중 하나.',
      'JPG로 바꿀 때는 품질을 정하고, 원본에 투명 배경이 있으면 배경색도 고릅니다.',
      '결과가 바로 바뀝니다. 한 장씩 받거나, 전체를 ZIP으로 한번에 다운로드합니다.',
    ],
    sections: [
      {
        heading: '어떤 형식을 골라야 할까',
        body: 'JPG는 사진 용량이 가장 작지만 투명 배경을 지원하지 않고, 다시 저장할 때마다 품질이 조금씩 손실됩니다. PNG는 손실 없이 저장되고 투명 배경을 지원해 스크린샷, 로고, 그림 파일에 적합하지만 같은 사진이라도 JPG보다 5~10배 커질 수 있습니다. WebP는 비교적 새로운 형식으로, 같은 화질의 JPG보다 보통 25~35% 작고 PNG처럼 투명 배경도 지원하며 2020년 이후 나온 모든 브라우저에서 열립니다. 특정 프로그램이나 양식이 JPG·PNG를 요구하지 않는다면 WebP가 가장 무난한 선택입니다.',
      },
      {
        heading: '투명 배경을 JPG로 바꿀 때',
        body: 'JPG는 투명도(알파 채널)를 저장할 수 없어서, PNG·WebP·GIF의 투명한 부분은 JPG로 바꿀 때 단색으로 채워집니다. 대부분의 온라인 변환 도구는 이 사실을 알려주지 않고 그냥 흰색이나 검은색으로 채웁니다. 이 도구는 투명 배경이 있을 수 있는 파일을 올리면 배경색 선택기를 보여줘서(기본값 흰색), 로고 주변에 생각지 못한 검은 테두리가 생기는 일을 막아 드립니다.',
      },
      {
        heading: '사진이 기기 밖으로 나가지 않습니다',
        body: '대부분의 온라인 변환 사이트는 파일을 서버에 올려서 처리한 뒤 다시 내려받게 합니다. 그 사이 내 사진이 다른 사람의 서버에 잠시라도 저장되는 셈입니다. 이 도구는 브라우저에 내장된 이미지 엔진(Canvas)으로 디코딩·재인코딩하기 때문에 파일이 컴퓨터나 휴대폰 밖으로 전송되지 않습니다. 업로드·다운로드 대기가 없어 더 빠르고, 페이지를 연 뒤에는 오프라인에서도 동작합니다.',
      },
    ],
    faq: [
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. 모든 변환은 브라우저 안의 Canvas API로 이루어집니다. 페이지를 연 뒤 인터넷을 끊어도 그대로 동작합니다.',
      },
      {
        q: 'JPG를 PNG로 바꾸는 방법은?',
        a: '위 상자에 JPG 파일을 끌어다 놓고 "변환할 형식"에서 PNG를 고르면, 추가 버튼 없이 바로 결과가 만들어집니다. 다운로드 버튼만 누르면 됩니다.',
      },
      {
        q: 'PNG를 JPG로 바꾸면 왜 화질이 떨어지나요?',
        a: 'JPG는 손실 압축을 쓰기 때문에 세밀한 부분이 흐려지거나 경계선 주변에 블록 같은 얼룩이 생길 수 있습니다. 특히 스크린샷이나 단색이 많은 그림에서 눈에 띕니다. 품질 슬라이더를 95~100 쪽으로 올리면 덜해지고, 선이 또렷한 이미지나 글자가 있는 이미지는 PNG나 WebP를 유지하는 것이 낫습니다.',
      },
      {
        q: 'JPG로 바꾸면 투명 배경은 어떻게 되나요?',
        a: 'JPG는 투명도를 저장할 수 없어서 투명한 부분이 단색(기본값 흰색)으로 채워집니다. 투명 배경이 있는 파일을 올리면 나타나는 배경색 선택기로 원하는 색으로 바꿀 수 있습니다.',
      },
      {
        q: '여러 장을 한 번에 변환할 수 있나요?',
        a: '네. 여러 파일을 올리면 모두 같은 설정으로 변환됩니다. 한 장씩 받거나, 전체를 ZIP 파일 하나로 한번에 다운로드할 수 있습니다.',
      },
      {
        q: '움직이는 GIF도 JPG나 PNG, WebP로 변환할 수 있나요?',
        a: '변환은 되지만 첫 프레임만 남습니다. JPG와 이 도구가 만드는 PNG, Canvas로 한 장만 인코딩한 WebP 모두 애니메이션을 저장할 수 없기 때문입니다. 프레임이 여러 개인 GIF를 올리면 안내 문구가 표시됩니다.',
      },
    ],
    ui: {
      dropTitle: '이미지를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF · 여러 장 가능',
      privacyNote: '이미지는 내 기기에서 변환됩니다. 어디에도 업로드되지 않습니다.',
      unsupported: '브라우저에서 읽을 수 없는 파일입니다.',
      processing: '처리 중…',
      download: '다운로드',
      downloadAll: '전체 ({n}장) ZIP 다운로드',
      remove: '삭제',
      clear: '모두 지우기',
      format: '변환할 형식',
      quality: '품질',
      qualityHint: 'JPG와 WebP에 적용됩니다. 90~95면 눈에 보이는 손실이 거의 없습니다.',
      background: '배경색',
      backgroundHint: 'JPG는 투명도를 지원하지 않아 투명한 부분을 이 색으로 채웁니다.',
      sameFormat: '이미 같은 형식입니다 — 같은 형식으로 다시 저장됩니다.',
      animatedGifWarning: '움직이는 GIF — 첫 프레임만 유지됩니다.',
      animatedGifNotice:
        '움직이는 GIF는 첫 프레임만 남습니다. 선택한 출력 형식들은 애니메이션을 저장할 수 없기 때문입니다.',
    },
  },
};

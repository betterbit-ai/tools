import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop images here, click to choose, or paste',
  dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF · as many as you like',
  privacyNote: 'Images are resized on your device. Nothing is uploaded.',
  unsupported: 'This file can’t be read by your browser.',
  processing: 'Working…',
  download: 'Download',
  downloadAll: 'Download all ({n}) as ZIP',
  remove: 'Remove',
  clear: 'Clear all',
  modeLabel: 'Resize by',
  modeSize: 'Size',
  modePercent: 'Percentage',
  preset: 'Preset',
  presetCustom: 'Custom size',
  preset_ig_square: 'Instagram square',
  preset_ig_portrait: 'Instagram portrait',
  preset_story: 'Story / Reels',
  preset_yt_thumb: 'YouTube thumbnail',
  preset_x_post: 'X (Twitter) post',
  preset_linkedin_banner: 'LinkedIn banner',
  preset_full_hd: 'Full HD',
  preset_passport: 'Square 600 px',
  width: 'Width (px)',
  height: 'Height (px)',
  auto: 'Auto',
  sizeHint: 'Leave one side empty to keep proportions.',
  fit: 'When both sides are set',
  fitContain: 'Fit',
  fitCover: 'Fill & crop',
  fitStretch: 'Stretch',
  percent: 'Scale',
  noUpscale: 'Don’t enlarge smaller images',
  format: 'Output format',
  formatOriginal: 'Same as original',
  quality: 'Quality',
  qualityHint: 'Applies to JPG and WebP. 80–85 is visually lossless for most photos.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Image Resizer — Resize Photos Online in Bulk, No Upload',
    description:
      'Resize JPG, PNG and WebP images by pixels or percent — many at once — in your browser. Crop to exact Instagram or YouTube sizes. No upload, no ads, no watermark.',
    h1: 'Image Resizer',
    tagline: 'Resize one photo or a hundred, by pixels or percent — privately, in your browser.',
    name: 'Image Resizer',
    keywords: ['resize image', 'photo resizer', 'resize picture', 'reduce image size', 'bulk resize', 'instagram size'],
    howTo: [
      'Drop images onto the box, click to choose files, or paste a screenshot with Ctrl/⌘ + V.',
      'Choose a preset or enter a width and/or height (or switch to Percentage).',
      'Pick an output format and quality. Results and file sizes update instantly.',
      'Download each image, or all of them as a ZIP.',
    ],
    sections: [
      {
        heading: 'Fit, fill or stretch?',
        body: 'When you set both width and height, the image’s shape usually won’t match the box. Fit shrinks the whole image until it fits inside the box, so nothing is cut off but one side may be smaller than you asked. Fill & crop makes the output exactly the size you asked for and trims the edges evenly from the centre — use this for profile pictures, thumbnails and social posts. Stretch forces the exact size and distorts the image; it’s rarely what you want.',
      },
      {
        heading: 'Making files smaller',
        body: 'Pixel dimensions matter most: halving width and height cuts the pixel count — and usually the file size — by about 75%. After that, format matters. WebP is typically 25–35% smaller than JPG at the same visual quality and is supported by every modern browser. Use PNG only for screenshots, logos and images that need transparency; for photos it is often 5–10× larger than JPG.',
      },
      {
        heading: 'Your images stay on your device',
        body: 'Most online resizers upload your photos to a server, process them there and send them back. This one uses your browser’s own image engine (Canvas), so the files never leave your computer or phone. That also makes it faster — there is no upload or download wait — and it keeps working offline once the page has loaded.',
      },
    ],
    faq: [
      {
        q: 'Are my photos uploaded anywhere?',
        a: 'No. Resizing happens entirely in your browser. You can disconnect from the internet after the page loads and it still works.',
      },
      {
        q: 'How many images can I resize at once?',
        a: 'There is no fixed limit. Hundreds of typical phone photos work fine; the practical limit is your device’s memory.',
      },
      {
        q: 'Does resizing reduce image quality?',
        a: 'Making an image smaller keeps it sharp — this tool downsizes in steps to avoid jagged edges. Making an image larger than the original cannot add detail and will look soft; turn on “Don’t enlarge smaller images” to prevent that.',
      },
      {
        q: 'What size should an Instagram post be?',
        a: 'Square posts are 1080×1080 px, portrait posts 1080×1350 px (4:5), and Stories or Reels 1080×1920 px (9:16). Choose the preset and Fill & crop gives you the exact size.',
      },
      {
        q: 'Can I resize HEIC photos from an iPhone?',
        a: 'Safari can read HEIC, so on a Mac or iPhone it works and the result is saved as PNG or your chosen format. Chrome and Firefox cannot decode HEIC yet; set your iPhone camera to “Most Compatible” or export as JPG first.',
      },
      {
        q: 'Is EXIF data (location, camera) kept?',
        a: 'No. Re-encoded images do not include the original metadata, which removes GPS location and camera details — useful before sharing photos publicly.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '이미지 크기 조절 — 사진 용량 줄이기, 여러 장 한번에 (업로드 없음)',
    description:
      'JPG, PNG, WebP 이미지를 픽셀이나 퍼센트로 여러 장 한번에 줄이세요. 인스타그램·유튜브 규격으로 자르기 지원. 서버 업로드 없이 브라우저에서 처리, 광고·워터마크 없음.',
    h1: '이미지 크기 조절',
    tagline: '사진 한 장이든 백 장이든, 픽셀이나 퍼센트로 — 업로드 없이 브라우저에서.',
    name: '이미지 크기 조절',
    keywords: ['사진 크기 줄이기', '이미지 용량 줄이기', '사진 리사이즈', '이미지 리사이저', '인스타 사이즈', 'resize'],
    howTo: [
      '이미지를 끌어다 놓거나, 클릭해서 고르거나, Ctrl/⌘ + V로 캡처 이미지를 붙여넣습니다.',
      '프리셋을 고르거나 가로·세로 크기를 입력합니다 (퍼센트로도 가능).',
      '저장 형식과 품질을 고르면 결과와 용량이 바로 바뀝니다.',
      '한 장씩 받거나, 전체를 ZIP으로 한번에 다운로드합니다.',
    ],
    sections: [
      {
        heading: '맞추기, 채우기, 늘리기의 차이',
        body: '가로와 세로를 모두 입력하면 원본 비율과 맞지 않는 경우가 많습니다. “맞추기”는 이미지 전체가 상자 안에 들어가도록 줄여서 잘리는 부분이 없지만, 한쪽이 입력값보다 작을 수 있습니다. “채우고 자르기”는 정확히 입력한 크기로 만들고 가장자리를 가운데 기준으로 고르게 잘라냅니다. 프로필 사진, 썸네일, SNS 게시물에 적합합니다. “늘리기”는 비율을 무시하고 강제로 맞추기 때문에 이미지가 찌그러집니다.',
      },
      {
        heading: '사진 용량을 줄이는 방법',
        body: '가장 효과가 큰 것은 픽셀 크기입니다. 가로·세로를 절반으로 줄이면 픽셀 수가 4분의 1이 되어 용량도 보통 약 75% 줄어듭니다. 그다음은 형식입니다. WebP는 같은 화질의 JPG보다 보통 25~35% 작고, 최신 브라우저에서 모두 열립니다. PNG는 스크린샷, 로고, 투명 배경이 필요할 때만 쓰세요. 사진을 PNG로 저장하면 JPG보다 5~10배 커지기도 합니다.',
      },
      {
        heading: '사진이 기기 밖으로 나가지 않습니다',
        body: '대부분의 온라인 이미지 변환 사이트는 사진을 서버에 올려서 처리한 뒤 다시 내려받게 합니다. 이 도구는 브라우저에 내장된 이미지 엔진(Canvas)으로 처리하기 때문에 파일이 컴퓨터나 휴대폰 밖으로 전송되지 않습니다. 업로드·다운로드 대기가 없어 더 빠르고, 페이지를 연 뒤에는 오프라인에서도 동작합니다.',
      },
    ],
    faq: [
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. 모든 처리는 브라우저 안에서 이루어집니다. 페이지를 연 뒤 인터넷을 끊어도 그대로 동작합니다.',
      },
      {
        q: '한 번에 몇 장까지 줄일 수 있나요?',
        a: '정해진 제한은 없습니다. 휴대폰 사진 수백 장도 문제없으며, 실제 한계는 기기의 메모리입니다.',
      },
      {
        q: '크기를 줄이면 화질이 떨어지나요?',
        a: '줄이는 경우에는 선명하게 유지됩니다. 이 도구는 계단 현상을 막기 위해 여러 단계로 나눠 축소합니다. 원본보다 크게 키우면 디테일이 생기지 않아 흐릿해 보이므로, “작은 이미지는 키우지 않기”를 켜두는 것을 권장합니다.',
      },
      {
        q: '인스타그램 사진 사이즈는 얼마인가요?',
        a: '정사각형 게시물은 1080×1080px, 세로형은 1080×1350px(4:5), 스토리·릴스는 1080×1920px(9:16)입니다. 프리셋을 고르면 “채우고 자르기”로 정확한 크기가 만들어집니다.',
      },
      {
        q: '아이폰 HEIC 사진도 되나요?',
        a: 'Safari는 HEIC를 읽을 수 있어 Mac이나 iPhone에서는 바로 됩니다. Chrome과 Firefox는 아직 HEIC를 열지 못하므로, 아이폰 카메라 설정을 “높은 호환성”으로 바꾸거나 JPG로 내보낸 뒤 사용하세요.',
      },
      {
        q: '위치 정보(EXIF)도 같이 저장되나요?',
        a: '아니요. 새로 저장된 이미지에는 원본 메타데이터가 포함되지 않아 GPS 위치와 카메라 정보가 제거됩니다. 사진을 공개적으로 올리기 전에 유용합니다.',
      },
    ],
    ui: {
      dropTitle: '이미지를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF · 여러 장 가능',
      privacyNote: '이미지는 내 기기에서 처리됩니다. 어디에도 업로드되지 않습니다.',
      unsupported: '브라우저에서 읽을 수 없는 파일입니다.',
      processing: '처리 중…',
      download: '다운로드',
      downloadAll: '전체 ({n}장) ZIP 다운로드',
      remove: '삭제',
      clear: '모두 지우기',
      modeLabel: '조절 방식',
      modeSize: '크기',
      modePercent: '퍼센트',
      preset: '프리셋',
      presetCustom: '직접 입력',
      preset_ig_square: '인스타그램 정사각형',
      preset_ig_portrait: '인스타그램 세로형',
      preset_story: '스토리 / 릴스',
      preset_yt_thumb: '유튜브 썸네일',
      preset_x_post: 'X(트위터) 게시물',
      preset_linkedin_banner: '링크드인 배너',
      preset_full_hd: 'Full HD',
      preset_passport: '정사각형 600px',
      width: '가로 (px)',
      height: '세로 (px)',
      auto: '자동',
      sizeHint: '한쪽을 비워두면 비율이 유지됩니다.',
      fit: '가로·세로를 모두 입력했을 때',
      fitContain: '맞추기',
      fitCover: '채우고 자르기',
      fitStretch: '늘리기',
      percent: '배율',
      noUpscale: '작은 이미지는 키우지 않기',
      format: '저장 형식',
      formatOriginal: '원본과 같게',
      quality: '품질',
      qualityHint: 'JPG와 WebP에 적용됩니다. 대부분의 사진은 80~85에서 차이가 거의 보이지 않습니다.',
    },
  },
};

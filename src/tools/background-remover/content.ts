import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop an image here, click to choose, or paste',
  dropHint: 'JPG, PNG or WebP · one image at a time · up to 24,000,000 pixels',
  privacyNote: 'Your image stays in this browser. The AI model loads from this site only when you start.',
  clear: 'Remove',
  before: 'Original',
  after: 'Background removed',
  originalSize: 'Original',
  outputSize: 'PNG output',
  limitNote: 'Keeps the original dimensions. Maximum input: 24,000,000 pixels, 8,000 px per side and 30 MB.',
  start: 'Remove background',
  cancel: 'Cancel processing',
  download: 'Download transparent PNG',
  modelLoading: 'Loading the local AI model…',
  modelProgress: 'Loading AI model: {done} of {total}',
  processing: 'Finding the foreground on this device…',
  errorRead: 'This image cannot be read by your browser.',
  errorPixels: 'This image has more than {max} pixels. Choose a smaller image first.',
  errorDimension: 'One side is over {max} px. Choose a smaller image first.',
  errorFile: 'This file is over {max}. Choose a smaller file first.',
  errorProcess: 'The local AI model could not process this image. Try a smaller JPG, PNG or WebP.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Remove Background — Private AI, Full-Size PNG',
    description:
      'Remove an image background with a private AI model that runs in your browser. Download a transparent PNG at the original dimensions — no upload, account or credits.',
    h1: 'Remove Background from an Image',
    tagline: 'Make a transparent PNG with local AI processing. Your image never leaves this browser.',
    name: 'Background Remover',
    keywords: [
      'remove background',
      'remove background from image',
      'background remover',
      'make transparent PNG',
      'cut out image',
      'remove photo background',
    ],
    howTo: [
      'Drop, choose or paste one JPG, PNG or WebP image.',
      'Check the image dimensions and select “Remove background”.',
      'Wait for the local AI model to find the main foreground subject.',
      'Compare the original and cutout, then download the transparent PNG at the original dimensions.',
    ],
    sections: [
      {
        heading: 'What happens to your image',
        body: 'The image is decoded, analysed and exported in the current browser tab. It is not uploaded to Betterbit or an AI API. On the first removal, the browser downloads the self-hosted U²-NetP model (4,574,861 bytes / 4.36 MiB); the model and ONNX Runtime then run on your device. The model asset is Apache-2.0 licensed, and the runtime is loaded only after you start a job.',
      },
      {
        heading: 'Full-size result, compact AI mask',
        body: 'U²-NetP analyses a 320×320 copy to identify the most visually prominent foreground object. The resulting alpha mask is scaled smoothly over the original pixels, so the downloaded PNG keeps the source width and height instead of being limited to the model’s 320-pixel input. To avoid exhausting browser memory, this tool accepts up to 24,000,000 pixels, 8,000 pixels on either side and 30 MB per image.',
      },
      {
        heading: 'When automatic removal needs a second look',
        body: 'This is salient-object detection: it works best when one person, product, pet or object is clearly distinct from its background. It may choose the wrong subject in a group photo or soften fine hair, transparent objects, reflections and low-contrast edges. Compare the two previews before downloading; for an ambiguous image, a manual editor can provide more precise control.',
      },
    ],
    faq: [
      {
        q: 'Are images uploaded to a server to remove the background?',
        a: 'No. The source image is decoded, processed and exported in the current browser tab. The only download is the 4.36 MiB self-hosted AI model on first use; your photo is not sent to Betterbit or a third-party AI service.',
      },
      {
        q: 'Will the transparent PNG keep my image resolution?',
        a: 'Yes. The AI creates a 320×320 foreground mask for speed, then applies that mask to the original pixels. The downloadable PNG keeps the original width and height, within the 24,000,000-pixel, 8,000-pixels-per-side and 30 MB input limits.',
      },
      {
        q: 'What image files can I use for background removal?',
        a: 'This tool accepts one JPG, PNG or WebP image at a time and always downloads a PNG, because PNG supports the transparent alpha channel needed after background removal.',
      },
      {
        q: 'Why is the first background removal slower?',
        a: 'The first run downloads the 4,574,861-byte U²-NetP model and starts the browser AI runtime. Later removals can reuse browser-cached assets, although processing time still depends on the image size and device.',
      },
      {
        q: 'Can AI remove every image background perfectly?',
        a: 'No. The model identifies the most prominent foreground object, so group photos, similar foreground and background colours, fine hair, glass and reflections can need manual touch-up. Always compare the preview before using the result in a final design.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '배경 지우기 — 업로드 없는 AI 누끼 따기',
    description:
      '사진 배경 지우기와 누끼 따기를 브라우저 안의 AI로 처리합니다. 원본 크기 투명 PNG를 다운로드하세요. 서버 업로드·가입·크레딧이 없습니다.',
    h1: '사진 배경 지우기',
    tagline: '이미지를 올리지 않고 AI로 누끼를 땁니다. 원본 사진은 이 브라우저 밖으로 나가지 않습니다.',
    name: '배경 지우기',
    keywords: ['배경 지우기', '사진 배경 지우기', '이미지 배경 제거', '누끼 따기', '누끼', '투명 PNG 만들기'],
    howTo: [
      'JPG, PNG, WebP 이미지 한 장을 끌어다 놓거나, 고르거나, 붙여넣습니다.',
      '이미지 크기를 확인하고 “배경 지우기”를 누릅니다.',
      '기기 안의 AI가 사진에서 주요 피사체를 찾을 때까지 기다립니다.',
      '원본과 결과를 비교한 뒤 원본 크기의 투명 PNG를 다운로드합니다.',
    ],
    sections: [
      {
        heading: '사진은 어디에서 처리되나요?',
        body: '이미지 해독, AI 분석, PNG 저장은 모두 현재 브라우저 탭에서 이루어집니다. Betterbit이나 외부 AI API로 사진을 업로드하지 않습니다. 처음 실행할 때만 이 사이트에 있는 U²-NetP 모델 파일(4,574,861바이트 / 4.36MiB)을 브라우저로 내려받습니다. 모델과 ONNX Runtime은 기기에서 실행되며, 모델은 Apache-2.0 라이선스로 제공됩니다.',
      },
      {
        heading: '작은 AI 마스크로 원본 크기 누끼 만들기',
        body: 'U²-NetP는 빠른 분석을 위해 사진의 320×320px 복사본에서 눈에 띄는 피사체를 찾습니다. 그런 다음 알파 마스크를 원본 픽셀 위에 부드럽게 적용하므로, 저장되는 PNG는 모델 입력 크기인 320px로 줄어들지 않고 원본 가로·세로 크기를 유지합니다. 브라우저 메모리를 보호하기 위해 입력은 최대 24,000,000픽셀, 한 변 8,000px, 30MB로 제한합니다.',
      },
      {
        heading: '자동 누끼 결과를 확인해야 하는 경우',
        body: '이 기능은 사진에서 가장 두드러진 피사체를 찾는 방식입니다. 인물·상품·반려동물처럼 피사체 하나가 배경과 구분될 때 가장 잘 작동합니다. 단체 사진에서는 다른 대상을 고르거나, 머리카락·유리·반사·반투명 물체·배경과 색이 비슷한 경계가 부드러워질 수 있습니다. 저장 전에 두 미리보기를 비교하고, 경계가 중요한 작업은 수동 편집기로 다듬는 편이 안전합니다.',
      },
    ],
    faq: [
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. 원본 사진은 현재 브라우저 탭에서 해독·처리·저장됩니다. 처음 사용할 때 이 사이트의 4.36MiB AI 모델만 내려받으며, 사진 자체는 Betterbit이나 외부 AI 서비스로 전송되지 않습니다.',
      },
      {
        q: '누끼를 따면 원본 해상도가 유지되나요?',
        a: '네. AI는 속도를 위해 320×320px 마스크를 만들지만, 그 마스크를 원본 픽셀에 적용합니다. 입력 한도인 24,000,000픽셀, 한 변 8,000px, 30MB 안에서는 내려받는 PNG의 가로·세로 크기가 원본과 같습니다.',
      },
      {
        q: '배경 지우기는 어떤 이미지 형식을 지원하나요?',
        a: 'JPG, PNG, WebP 이미지 한 장을 지원하며 결과는 항상 투명도를 보존하는 PNG로 저장합니다. JPG는 투명 알파 채널을 저장할 수 없으므로 배경 제거 결과 형식으로 사용하지 않습니다.',
      },
      {
        q: '처음 실행할 때 시간이 더 걸리는 이유는 무엇인가요?',
        a: '첫 실행에서는 4,574,861바이트 U²-NetP 모델을 내려받고 브라우저 AI 런타임을 시작합니다. 이후에는 브라우저 캐시에 남은 파일을 재사용할 수 있지만, 처리 시간은 사진 크기와 기기 성능에 따라 달라집니다.',
      },
      {
        q: 'AI가 모든 사진의 배경을 완벽하게 지우나요?',
        a: '아니요. AI는 가장 눈에 띄는 피사체를 찾기 때문에 단체 사진, 비슷한 색의 배경, 가는 머리카락, 유리, 반사 영역은 수동 보정이 필요할 수 있습니다. 최종 디자인에 쓰기 전에는 반드시 결과 미리보기를 확인해야 합니다.',
      },
    ],
    ui: {
      dropTitle: '이미지를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'JPG, PNG, WebP · 한 장씩 · 최대 24,000,000픽셀',
      privacyNote: '이미지는 이 브라우저 안에만 남습니다. AI 모델은 실행할 때만 이 사이트에서 내려받습니다.',
      clear: '삭제',
      before: '원본',
      after: '배경 제거 결과',
      originalSize: '원본',
      outputSize: 'PNG 결과',
      limitNote: '원본 크기로 저장합니다. 입력 한도: 최대 24,000,000픽셀, 한 변 8,000px, 30MB.',
      start: '배경 지우기',
      cancel: '처리 취소',
      download: '투명 PNG 다운로드',
      modelLoading: '기기 안의 AI 모델을 불러오는 중…',
      modelProgress: 'AI 모델 불러오는 중: {done} / {total}',
      processing: '기기 안에서 피사체를 찾는 중…',
      errorRead: '브라우저에서 읽을 수 없는 이미지입니다.',
      errorPixels: '이미지 픽셀이 {max}개를 초과합니다. 더 작은 이미지를 선택하세요.',
      errorDimension: '한 변이 {max}px를 넘습니다. 더 작은 이미지를 선택하세요.',
      errorFile: '파일이 {max}를 초과합니다. 더 작은 파일을 선택하세요.',
      errorProcess: '기기 안의 AI 모델이 이 이미지를 처리하지 못했습니다. 더 작은 JPG, PNG, WebP로 다시 시도하세요.',
    },
  },
};

import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop an image here, click to choose, or paste',
  dropHint: 'JPG, PNG or WebP · one image at a time · up to 1,000,000 pixels',
  privacyNote: 'Your image and the AI model stay in this browser. Nothing is uploaded.',
  clear: 'Remove',
  scaleLabel: 'Upscale factor',
  scale2: '2× (recommended)',
  scale4: '4×',
  formatLabel: 'Download format',
  formatHint: 'PNG and WebP keep transparency. JPEG fills transparent areas with white.',
  formatPng: 'PNG (lossless)',
  formatJpeg: 'JPEG (smaller photos)',
  formatWebp: 'WebP (smaller web images)',
  originalSize: 'Original',
  outputSize: 'AI output',
  limitNote:
    'Maximum input: 1,000,000 pixels and 4,096 px on either side. Large images are split into tiles of up to 256 px.',
  start: 'Upscale with AI',
  cancel: 'Cancel processing',
  download: 'Download upscaled image',
  compareLabel: 'Compare at 100%',
  before: 'Before',
  after: 'After',
  zoomHint: 'Shown at 100%: scroll to inspect details.',
  modelLoading: 'Loading the local AI model…',
  modelProgress: 'Loading AI model: {done} of {total}',
  tileProgress: 'Rebuilding detail: tile {done} of {total}',
  timeLeft: 'about {time} left',
  seconds: '{n} s',
  minutes: '{n} min',
  cpuNote:
    'Running on the CPU because this browser has no WebGPU. A desktop Chrome or Edge is usually several times faster.',
  errorRead: 'This image cannot be read by your browser.',
  errorPixels: 'This image has more than {max} pixels. Choose a smaller image first.',
  errorDimension: 'One side is over {max} px. Choose a smaller image first.',
  errorFile: 'This file is over 25 MB. Choose a smaller file first.',
  errorProcess: 'The AI model could not process this image. Try a smaller JPG, PNG or WebP.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Upscale Image with AI — 2× & 4×, Private On-Device',
    description:
      'Upscale JPG, PNG or WebP images with real on-device AI detail reconstruction at 2× or 4×. Compare at 100%, choose PNG/JPEG/WebP, and download privately.',
    h1: 'AI Image Upscaler',
    tagline: 'Rebuild detail at 2× or 4× with an AI model that runs on your device — no upload, account or watermark.',
    name: 'Image Upscaler',
    keywords: [
      'upscale image',
      'AI image upscaler',
      'enhance image',
      'increase image resolution',
      'super resolution',
      'photo upscaler',
    ],
    howTo: [
      'Drop, choose or paste one JPG, PNG or WebP image.',
      'Pick 2× for a quicker result or 4× for the largest AI reconstruction.',
      'Choose PNG, JPEG or WebP, then select “Upscale with AI”.',
      'Watch the model and tile progress, compare Before and After at 100%, then download the result.',
    ],
    sections: [
      {
        heading: 'AI super-resolution, not ordinary resizing',
        body: 'A normal resizer interpolates existing pixels. This tool sends the image through Real-ESRGAN General x4v3 in tiles of up to 256×256 pixels, a super-resolution neural network, then stitches only the non-overlapping tile cores together. Each tile has 16 pixels of surrounding context to reduce visible seams. 2× output is produced from the AI-generated 4× image with a high-quality downscale, so both choices use the model rather than plain enlargement.',
      },
      {
        heading: 'Model, privacy and limits',
        body: 'The self-hosted model is realesr-general-x4v3, an ONNX export of Real-ESRGAN General x4v3. Its 4,872,481-byte (4.87 MB) model file is distributed under BSD-3-Clause; it and ONNX Runtime load only after you start a job. The image never leaves this tab. To avoid exhausting phone or GPU memory, input is limited to 1,000,000 pixels, 4,096 pixels per side and 25 MB. A 4× result has 16 times as many pixels as the input.',
      },
      {
        heading: 'Set realistic expectations',
        body: 'Upscaling predicts plausible texture; it cannot retrieve text, facial features or object detail that was never captured. At 4×, faces, lettering and repeating patterns can look painted or invented, so inspect the 100% comparison before using a result for print or evidence. A 1,000,000-pixel image needs at most 38 model tiles: a WebGPU-capable desktop normally feels much quicker than a phone using the WebAssembly fallback. Start with 2× on a phone or when the original is already fairly clear.',
      },
    ],
    faq: [
      {
        q: 'Are images uploaded to a server for AI upscaling?',
        a: 'No. The image, 4.87 MB Real-ESRGAN model and ONNX Runtime run in the current browser tab. Your source image is not sent to Betterbit or a third-party AI service.',
      },
      {
        q: 'What is the difference between 2× and 4× image upscaling?',
        a: '2× doubles width and height, so it creates 4 times as many pixels. 4× quadruples width and height, so it creates 16 times as many pixels and takes more memory and processing time.',
      },
      {
        q: 'How long does AI upscaling take?',
        a: 'Processing time depends on the device, browser and image size. This tool shows model-download progress, each inference tile and an estimate of the time left; a 1,000,000-pixel maximum-size image needs at most 38 tiles. Desktop WebGPU is generally several times faster than phone WebAssembly. You can switch tabs while it works.',
      },
      {
        q: 'Does image upscaling recover unreadable text or blurred faces?',
        a: 'No. AI super-resolution estimates likely detail from nearby pixels, so it cannot guarantee factual recovery of unreadable text, heavily blurred faces or missing objects. Inspect the result at 100% before relying on it.',
      },
      {
        q: 'Does the tool keep transparent PNG images transparent?',
        a: 'Yes. PNG and WebP results preserve separately resampled transparency. JPEG does not support alpha, so transparent areas are flattened to white.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '이미지 업스케일 — AI 사진 화질 개선 2배·4배 (업로드 없음)',
    description:
      '사진 화질 개선이 필요한 JPG·PNG·WebP를 기기 안의 AI로 2배 또는 4배 업스케일합니다. 100% 비교, PNG·JPG·WebP 저장 지원. 서버 업로드·가입·워터마크 없음.',
    h1: 'AI 이미지 업스케일',
    tagline:
      '단순 확대가 아닌 AI 디테일 복원으로 사진 화질을 2배 또는 4배 키웁니다. 이미지는 기기 밖으로 나가지 않습니다.',
    name: '이미지 업스케일',
    keywords: [
      '이미지 업스케일',
      '사진 화질 개선',
      '사진 고화질',
      '이미지 해상도 높이기',
      'AI 업스케일러',
      '사진 선명하게',
    ],
    howTo: [
      'JPG, PNG, WebP 이미지 한 장을 끌어다 놓거나, 고르거나, 붙여넣습니다.',
      '빠르게 확인할 때는 2배, 더 크게 복원할 때는 4배를 고릅니다.',
      'PNG, JPG, WebP 중 저장 형식을 고르고 “AI 업스케일 시작”을 누릅니다.',
      '모델·타일 처리 진행 상황을 확인하고 100% 크기로 원본과 결과를 비교한 뒤 다운로드합니다.',
    ],
    sections: [
      {
        heading: '일반 확대와 AI 업스케일의 차이',
        body: '일반 이미지 크기 조절은 기존 픽셀 사이를 채울 뿐입니다. 이 도구는 Real-ESRGAN General x4v3 초해상도 모델에 이미지를 최대 256×256px 타일로 나누어 넣고, AI가 추론한 결과를 다시 합칩니다. 타일마다 주변 16px을 함께 처리하고 서로 겹치지 않는 중심 부분만 붙여 경계가 도드라지는 현상을 줄입니다. 2배도 먼저 AI 4배 결과를 만든 뒤 고품질로 줄이므로, 단순 보간 확대가 아닙니다.',
      },
      {
        heading: '사용한 모델과 처리 한도',
        body: '이 도구는 Real-ESRGAN General x4v3의 ONNX 모델 realesr-general-x4v3를 사용합니다. 모델 파일은 4,872,481바이트(4.87MB)이며 BSD-3-Clause 라이선스로 배포됩니다. 모델과 ONNX Runtime은 작업을 시작한 뒤에만 내려받고, 사진은 현재 브라우저 탭 밖으로 전송되지 않습니다. 휴대폰과 GPU 메모리를 지키기 위해 입력은 최대 1,000,000픽셀, 한 변 4,096px, 25MB로 제한합니다. 4배 결과는 원본보다 픽셀 수가 16배입니다.',
      },
      {
        heading: '화질 개선의 한계와 처리 시간',
        body: 'AI 업스케일은 사라진 정보를 사실대로 되찾는 기능이 아니라 주변 픽셀을 바탕으로 그럴듯한 질감을 예측하는 기능입니다. 원본에 없는 글자, 심하게 흔들린 얼굴, 작은 인물의 세부 정보는 복원하지 못할 수 있고 4배에서는 글자·얼굴·반복 무늬가 인위적으로 보일 수 있습니다. 최대 100만 픽셀 이미지도 모델 타일은 최대 38개이며, WebGPU를 쓸 수 있는 데스크톱이 휴대폰의 WebAssembly 처리보다 대체로 빠릅니다. 휴대폰에서는 2배부터 확인하는 편이 좋습니다.',
      },
    ],
    faq: [
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. 사진, 4.87MB Real-ESRGAN 모델, ONNX Runtime이 현재 브라우저 탭 안에서 실행됩니다. 원본 이미지는 Betterbit이나 외부 AI 서버로 전송되지 않습니다.',
      },
      {
        q: '2배와 4배 업스케일은 어떻게 다른가요?',
        a: '2배는 가로와 세로를 각각 2배로 만들어 전체 픽셀 수가 4배가 됩니다. 4배는 가로와 세로를 각각 4배로 만들어 전체 픽셀 수가 16배가 되므로 메모리와 처리 시간이 더 많이 필요합니다.',
      },
      {
        q: 'AI 사진 화질 개선에는 얼마나 걸리나요?',
        a: '처리 시간은 이미지 크기, 브라우저, 기기 성능에 따라 달라집니다. 이 도구는 모델 다운로드, 타일별 진행 상황, 남은 예상 시간을 보여 주며, 최대 100만 픽셀 이미지도 타일은 최대 38개입니다. 일반적으로 WebGPU 데스크톱이 휴대폰 WebAssembly보다 몇 배 빠릅니다. 처리 중에 다른 탭으로 옮겨도 계속 진행됩니다.',
      },
      {
        q: '흐린 글자나 얼굴도 정확하게 복원되나요?',
        a: '아니요. AI 초해상도는 주변 픽셀을 바탕으로 디테일을 추정하므로 읽을 수 없는 글자, 심한 흔들림, 극도로 작은 얼굴의 사실 정보를 보장해 복원하지 못합니다. 중요한 결과는 반드시 100% 크기로 확인해야 합니다.',
      },
      {
        q: '투명 PNG도 투명하게 저장되나요?',
        a: '네. PNG와 WebP로 저장하면 따로 확대된 투명도가 유지됩니다. JPG는 투명도를 지원하지 않아 투명 영역이 흰색으로 저장됩니다.',
      },
    ],
    ui: {
      dropTitle: '이미지를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'JPG, PNG, WebP · 한 장씩 · 최대 1,000,000픽셀',
      privacyNote: '이미지와 AI 모델은 이 브라우저 안에서만 처리됩니다. 어디에도 업로드되지 않습니다.',
      clear: '삭제',
      scaleLabel: '업스케일 배율',
      scale2: '2배 (권장)',
      scale4: '4배',
      formatLabel: '저장 형식',
      formatHint: 'PNG와 WebP는 투명도를 유지합니다. JPG는 투명 영역을 흰색으로 저장합니다.',
      formatPng: 'PNG (무손실)',
      formatJpeg: 'JPG (사진 용량 작게)',
      formatWebp: 'WebP (웹용 용량 작게)',
      originalSize: '원본',
      outputSize: 'AI 결과',
      limitNote: '입력 한도: 최대 1,000,000픽셀, 한 변 4,096px. 큰 이미지는 최대 256px 타일로 나누어 처리합니다.',
      start: 'AI 업스케일 시작',
      cancel: '처리 취소',
      download: '업스케일 이미지 다운로드',
      compareLabel: '100% 크기 비교',
      before: '원본',
      after: 'AI 결과',
      zoomHint: '100% 크기로 표시됩니다. 스크롤해서 세부를 확인하세요.',
      modelLoading: '기기 안의 AI 모델을 불러오는 중…',
      modelProgress: 'AI 모델 불러오는 중: {done} / {total}',
      tileProgress: '디테일 복원 중: 타일 {done} / {total}',
      timeLeft: '약 {time} 남음',
      seconds: '{n}초',
      minutes: '{n}분',
      cpuNote:
        '이 브라우저는 WebGPU를 지원하지 않아 CPU로 처리합니다. 데스크톱 크롬이나 엣지에서는 보통 몇 배 빠릅니다.',
      errorRead: '브라우저에서 읽을 수 없는 이미지입니다.',
      errorPixels: '이미지 픽셀이 {max}개를 초과합니다. 더 작은 이미지를 선택하세요.',
      errorDimension: '한 변이 {max}px를 넘습니다. 더 작은 이미지를 선택하세요.',
      errorFile: '파일이 25MB를 초과합니다. 더 작은 파일을 선택하세요.',
      errorProcess: 'AI 모델이 이 이미지를 처리하지 못했습니다. 더 작은 JPG, PNG, WebP로 다시 시도하세요.',
    },
  },
};

import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop images here, click to choose, or paste',
  dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF · up to 50 images per batch',
  privacyNote: 'Images are compressed on your device. Nothing is uploaded.',
  unsupported: 'This file can’t be read by your browser.',
  processFailed: 'This image could not be compressed. Try a smaller file or another format.',
  batchLimit: 'A batch can contain up to {n} images. Add more after downloading or clearing these files.',
  zipFailed: 'The ZIP could not be created. Try downloading fewer images at once.',
  processing: 'Working…',
  progress: 'Compressing {current} of {total}: {file} · attempt {attempt} of up to {maximum}',
  cancel: 'Cancel compression',
  cancelled: 'Compression cancelled. Your original files are still available.',
  retry: 'Retry compression',
  preparingDownload: 'Preparing ZIP…',
  download: 'Download',
  downloadAll: 'Download all ({n}) as ZIP',
  remove: 'Remove',
  clear: 'Clear all',
  modeLabel: 'Compress by',
  modeSize: 'Target size',
  modeQuality: 'Quality slider',
  targetSize: 'Target file size',
  targetSizeHint:
    'The tool searches for the highest quality — and, if needed, a smaller size — that fits this. 1 KB = 1,024 bytes.',
  targetInvalid: 'Enter a target size greater than 0 to compress the images.',
  quality: 'Quality',
  qualityHint: 'Applies to JPG and WebP. 70–85 is visually lossless for most photos.',
  pngNoQuality:
    'PNG is lossless, so the quality slider has no effect. Switch format to JPG or WebP to shrink it further.',
  format: 'Output format',
  formatHint: 'WebP usually gives the smallest file for the same visual quality.',
  formatOriginal: 'Same as original',
  targetNotReached:
    'Could not reach the target even at the lowest quality and smallest size tried — this is the smallest result.',
  originalKept: 'Already smaller than a browser re-encode — the original file was kept unchanged.',
  outputLarger: 'This format made the file larger. Keep the original unless you need the new format.',
  animatedGifWarning: 'Animated GIF: compressing keeps only the first frame, like most browser-based tools.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Image Compressor — Shrink Photos to a Target KB, No Upload',
    description:
      'Compress JPG, PNG and WebP images by a target file size (KB/MB) or quality — many at once — entirely in your browser. No upload, no sign-up.',
    h1: 'Image Compressor',
    tagline: 'Tell it a target size in KB or MB and it finds the best quality to hit it — privately, on your device.',
    name: 'Image Compressor',
    keywords: [
      'compress image',
      'reduce image size',
      'compress jpg',
      'compress photo to kb',
      'shrink image file size',
      'image size reducer',
    ],
    howTo: [
      'Drop images onto the box, click to choose files, or paste a screenshot with Ctrl/⌘ + V.',
      'Pick “Target size” and type the KB or MB you need, or switch to “Quality slider” for manual control.',
      'Choose an output format. Results and file sizes update automatically as you type.',
      'Download each image, or all of them at once as a ZIP.',
    ],
    sections: [
      {
        heading: 'How automatic target-size compression works',
        body: 'Most compressors give you a single quality slider and leave you to drag it back and forth, re-checking the file size each time. This tool does that search for you. If the original already matches the chosen format and target, it keeps those exact bytes instead of making a needless, sometimes larger copy. Otherwise it narrows in on the highest quality that fits using a binary search — usually five or six attempts instead of a dozen manual ones. If even the lowest quality setting is still over the target (common with a tiny target like 50KB on a large photo), it also shrinks the image dimensions in steps and searches again at each size, so very small targets are still reachable.',
      },
      {
        heading: 'JPG, WebP or PNG — which actually gets smaller?',
        body: 'JPG and WebP are “lossy”: lowering the quality setting throws away detail the eye barely notices, which is what lets this tool hit an exact target size. WebP is typically 25–35% smaller than JPG at the same visual quality and works in every modern browser, so it is usually the best choice when the goal is file size. PNG is “lossless” — it has no quality knob at all in a browser canvas — so compressing a PNG mostly just removes it as an option; convert it to JPG or WebP if the image doesn’t need transparency, or keep PNG only for screenshots, logos and graphics with flat colours.',
      },
      {
        heading: 'Why a target size, not just “compress”',
        body: 'A lot of real-world limits are expressed in file size, not pixels: job-application and visa photo uploads commonly cap out around 100KB–1MB, email providers reject attachments over a hard limit (Gmail’s is 25MB total), and e-commerce or CMS platforms often reject images above a set weight to keep pages fast. Typing the number you were actually given, instead of guessing a quality percentage, gets you there in one step.',
      },
      {
        heading: 'Your images stay on your device',
        body: 'This compressor runs entirely in your browser’s own image engine (Canvas) — files are never uploaded to a server, so there is no upload wait, and it keeps working offline once the page has loaded. A batch holds up to 50 images and processes them one at a time to keep device memory manageable. Re-encoded results strip the original EXIF metadata (camera model, GPS location). When an original already fits and is smaller than re-encoding, the tool keeps it unchanged, including its metadata, and says so beside the file.',
      },
    ],
    faq: [
      {
        q: 'Can I compress an image to an exact file size, like 100KB?',
        a: 'Yes. Switch to “Target size”, type 100 and choose KB — the tool automatically searches for the highest quality that still fits under 100KB, and shrinks the image dimensions too if quality alone can’t get there.',
      },
      {
        q: 'Are my photos uploaded anywhere?',
        a: 'No. Compression happens entirely in your browser. You can disconnect from the internet after the page loads and it still works.',
      },
      {
        q: 'Does compressing an image reduce its quality?',
        a: 'Lossy formats (JPG, WebP) do lose some detail as the target gets smaller, though the tool always picks the highest quality that still fits your target so the loss is as small as possible. PNG is lossless and barely shrinks at all without converting it to JPG or WebP.',
      },
      {
        q: 'Can I compress PNG files?',
        a: 'You can, but PNG has no quality setting in a browser, so the file size barely changes unless the target forces the tool to reduce the pixel dimensions. For photos, converting to JPG or WebP in the format dropdown shrinks the file far more.',
      },
      {
        q: 'How many images can I compress at once?',
        a: 'A batch can contain up to 50 images. Large, high-resolution photos use more device memory, so split a larger collection into smaller batches if your browser becomes slow.',
      },
      {
        q: 'What is a good target size for a resume or application photo?',
        a: 'Most application forms specify their own limit, commonly somewhere between 100KB and 1MB — check the form and type that exact number into the target size field.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '이미지 압축 — 원하는 용량(KB)으로 줄이기, 업로드 없음',
    description:
      'JPG, PNG, WebP 이미지를 원하는 용량(KB/MB)이나 품질로 여러 장 한번에 압축하세요. 브라우저에서 바로 처리, 업로드·가입 없음.',
    h1: '이미지 압축',
    tagline: '목표 용량(KB·MB)만 입력하면 그에 맞는 품질을 자동으로 찾아줍니다 — 업로드 없이 기기에서.',
    name: '이미지 압축',
    keywords: [
      '이미지 압축',
      '사진 용량 줄이기',
      '사진 100kb로 줄이기',
      'jpg 용량 줄이기',
      '이미지 파일 크기 줄이기',
      '사진 압축 사이트',
    ],
    howTo: [
      '이미지를 끌어다 놓거나, 클릭해서 고르거나, Ctrl/⌘ + V로 캡처 이미지를 붙여넣습니다.',
      '“목표 용량”을 고르고 원하는 KB나 MB를 입력합니다. 직접 품질을 조절하려면 “품질 슬라이더”로 바꿉니다.',
      '저장 형식을 고르면 결과와 용량이 입력하는 즉시 자동으로 계산됩니다.',
      '한 장씩 받거나, 전체를 ZIP으로 한번에 다운로드합니다.',
    ],
    sections: [
      {
        heading: '목표 용량을 입력하면 자동으로 압축되는 원리',
        body: '대부분의 압축 사이트는 품질 슬라이더 하나만 주고, 용량을 직접 확인하며 슬라이더를 앞뒤로 움직이게 합니다. 이 도구는 그 과정을 자동으로 처리합니다. 원본이 선택한 형식과 목표 용량을 이미 만족하면 다시 저장해서 더 큰 파일을 만들지 않고 원본 바이트를 그대로 유지합니다. 그렇지 않으면 이분 탐색으로 목표에 맞는 가장 높은 품질을 찾아내는데, 보통 대여섯 번의 시도로 끝납니다. 아주 작은 목표(예: 50KB)처럼 최저 품질로도 안 되는 경우에는 이미지 크기까지 단계적으로 줄여가며 다시 탐색하므로, 작은 목표도 대부분 맞출 수 있습니다.',
      },
      {
        heading: 'JPG, WebP, PNG 중 어떤 형식이 더 작아질까',
        body: 'JPG와 WebP는 “손실” 압축 방식이라 품질을 낮추면 눈에 잘 띄지 않는 디테일을 버리는 대신 용량이 줄어듭니다. 이 덕분에 정확한 목표 용량을 맞출 수 있습니다. WebP는 같은 화질의 JPG보다 보통 25~35% 작고 최신 브라우저에서 모두 열립니다. PNG는 “무손실” 형식이라 브라우저에서는 품질을 낮추는 기능 자체가 없어서, 압축을 눌러도 용량이 거의 줄지 않습니다. 투명 배경이 필요 없다면 JPG나 WebP로 바꾸고, 투명 배경이 필요한 로고·스크린샷 등에만 PNG를 쓰세요.',
      },
      {
        heading: '왜 “압축”이 아니라 “목표 용량”이 필요할까',
        body: '실제로 마주치는 제한은 대부분 픽셀이 아니라 용량(KB)으로 정해져 있습니다. 채용 사이트나 입사지원서, 각종 온라인 신청서는 사진을 보통 100KB~1MB 이하로 요구하고, 이메일은 첨부파일 전체 용량에 제한이 있으며(Gmail은 총 25MB), 쇼핑몰이나 블로그 플랫폼도 페이지 속도를 위해 이미지 용량을 제한하는 경우가 많습니다. 품질을 몇 퍼센트로 할지 감으로 추측하는 대신, 요구받은 숫자를 그대로 입력하면 한 번에 맞춰집니다.',
      },
      {
        heading: '사진이 기기 밖으로 나가지 않습니다',
        body: '이 도구는 브라우저에 내장된 이미지 엔진(Canvas)으로 직접 처리하기 때문에 사진이 서버에 업로드되지 않습니다. 업로드 대기가 없고 페이지를 연 뒤에는 오프라인에서도 동작합니다. 한 번에 최대 50장을 받고 한 장씩 처리해 기기 메모리 사용을 제한합니다. 다시 인코딩한 결과에서는 원본의 EXIF 메타데이터(카메라 모델, GPS 위치)가 제거됩니다. 원본이 이미 목표보다 작아서 그대로 유지한 경우에는 메타데이터도 남으며, 파일 옆에 그 사실을 표시합니다.',
      },
    ],
    faq: [
      {
        q: '사진을 정확히 100KB 같은 용량으로 줄일 수 있나요?',
        a: '네. “목표 용량”을 고르고 100을 입력한 뒤 KB를 선택하면, 100KB 이하를 만족하는 가장 높은 품질을 자동으로 찾습니다. 품질만으로 안 되면 이미지 크기도 함께 줄입니다.',
      },
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. 모든 압축은 브라우저 안에서 이루어집니다. 페이지를 연 뒤 인터넷을 끊어도 그대로 동작합니다.',
      },
      {
        q: '압축하면 화질이 많이 떨어지나요?',
        a: 'JPG나 WebP는 목표 용량이 작을수록 디테일이 조금씩 줄어들지만, 이 도구는 항상 목표를 만족하는 가장 높은 품질을 선택하므로 손실을 최소화합니다. PNG는 무손실이라 형식을 바꾸지 않으면 용량이 거의 줄지 않습니다.',
      },
      {
        q: 'PNG 파일도 압축되나요?',
        a: '가능하지만 PNG는 브라우저에서 품질 조절 기능이 없어 용량이 크게 줄지 않습니다. 목표 용량이 아주 작으면 이미지 크기를 줄여서 맞추기도 합니다. 사진이라면 저장 형식을 JPG나 WebP로 바꾸는 쪽이 훨씬 효과적입니다.',
      },
      {
        q: '한 번에 몇 장까지 압축할 수 있나요?',
        a: '한 번에 최대 50장까지 압축할 수 있습니다. 고해상도 사진은 기기 메모리를 더 많이 쓰므로 브라우저가 느려지면 여러 번으로 나누어 처리하세요.',
      },
      {
        q: '이력서나 지원서 사진은 용량을 얼마로 맞춰야 하나요?',
        a: '사이트마다 다르지만 보통 100KB~1MB 사이를 요구합니다. 지원서에 적힌 정확한 용량을 목표 용량 칸에 그대로 입력하면 됩니다.',
      },
    ],
    ui: {
      dropTitle: '이미지를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF · 한 번에 최대 50장',
      privacyNote: '이미지는 내 기기에서 압축됩니다. 어디에도 업로드되지 않습니다.',
      unsupported: '브라우저에서 읽을 수 없는 파일입니다.',
      processFailed: '이미지를 압축하지 못했습니다. 더 작은 파일이나 다른 형식으로 다시 시도하세요.',
      batchLimit: '한 번에 최대 {n}장까지 처리할 수 있습니다. 다운로드하거나 파일을 지운 뒤 더 추가하세요.',
      zipFailed: 'ZIP 파일을 만들지 못했습니다. 한 번에 다운로드하는 이미지 수를 줄여 다시 시도하세요.',
      processing: '처리 중…',
      progress: '{total}장 중 {current}번째 압축: {file} · 최대 {maximum}회 중 {attempt}회 시도',
      cancel: '압축 취소',
      cancelled: '압축을 취소했습니다. 원본 파일은 그대로 남아 있습니다.',
      retry: '압축 다시 시도',
      preparingDownload: 'ZIP 준비 중…',
      download: '다운로드',
      downloadAll: '전체 ({n}장) ZIP 다운로드',
      remove: '삭제',
      clear: '모두 지우기',
      modeLabel: '압축 방식',
      modeSize: '목표 용량',
      modeQuality: '품질 슬라이더',
      targetSize: '목표 파일 용량',
      targetSizeHint:
        '이 용량에 맞는 가장 높은 품질을, 필요하면 더 작은 크기까지 자동으로 찾습니다. 1KB는 1,024바이트입니다.',
      targetInvalid: '이미지를 압축하려면 0보다 큰 목표 용량을 입력하세요.',
      quality: '품질',
      qualityHint: 'JPG와 WebP에 적용됩니다. 대부분의 사진은 70~85에서 차이가 거의 보이지 않습니다.',
      pngNoQuality:
        'PNG는 무손실 형식이라 품질 슬라이더가 적용되지 않습니다. 더 줄이려면 저장 형식을 JPG나 WebP로 바꾸세요.',
      format: '저장 형식',
      formatHint: '같은 화질이라면 WebP가 보통 가장 작습니다.',
      formatOriginal: '원본과 같게',
      targetNotReached:
        '가장 낮은 품질과 가장 작은 크기까지 시도했지만 목표에 도달하지 못했습니다. 이것이 시도한 결과 중 가장 작은 용량입니다.',
      originalKept: '브라우저에서 다시 저장하는 것보다 이미 작아서 원본 파일을 그대로 유지했습니다.',
      outputLarger: '이 형식으로 바꾸니 파일이 더 커졌습니다. 새 형식이 꼭 필요하지 않으면 원본을 사용하세요.',
      animatedGifWarning: '움짤(애니메이션 GIF)입니다. 브라우저 기반 도구 특성상 압축하면 첫 프레임만 저장됩니다.',
    },
  },
};

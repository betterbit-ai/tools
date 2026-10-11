import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop photos here, click to choose, or paste',
  dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF',
  privacyNote: 'Photos are processed on this device. Nothing is uploaded.',
  unsupported: 'This file can’t be read by your browser.',
  processing: 'Processing…',
  download: 'Download',
  downloadAll: 'Download {n} images as ZIP',
  clear: 'Clear all',
  remove: 'Remove image',
  rotateLabel: 'Rotate',
  rotateHint: 'Changes apply to every image in this batch.',
  rotateLeft: 'Rotate left 90°',
  rotateRight: 'Rotate right 90°',
  rotationValue: 'Rotation',
  rotation0: '0°',
  rotation90: '90°',
  rotation180: '180°',
  rotation270: '270°',
  flipHorizontal: 'Flip horizontally (mirror)',
  flipVertical: 'Flip vertically',
  format: 'Output format',
  formatOriginal: 'Same as original',
  formatJpeg: 'JPG',
  formatPng: 'PNG',
  formatWebp: 'WebP',
  quality: 'Quality',
  qualityHint: 'Applies to JPG and WebP. 80–90 is visually lossless for most photos.',
  exifNote:
    'Phone-photo orientation is corrected before export; the downloaded file has the orientation baked into its pixels.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Rotate Image — Batch Rotate & Flip Photos, No Upload',
    description:
      'Rotate or mirror photos in a batch, correct phone-photo orientation, and download one file or a ZIP — privately in your browser, with no upload or ads.',
    h1: 'Rotate & Flip Images',
    tagline: 'Turn, mirror, and batch-export photos on your device — phone orientation is corrected automatically.',
    name: 'Rotate & Flip Images',
    keywords: [
      'rotate image',
      'rotate photo',
      'flip image',
      'mirror image',
      'rotate jpg',
      'rotate picture',
      'fix sideways photo',
    ],
    howTo: [
      'Drop one or more photos onto the box, click to choose them, or paste an image with Ctrl/⌘ + V.',
      'Use Rotate left or Rotate right, select 0°, 90°, 180°, or 270°, and turn on either mirror option if needed.',
      'Choose the output format and quality. Each setting updates every image in the batch automatically.',
      'Check the dimensions beside each finished image; 90° and 270° swap width and height.',
      'Download one finished image, or download the whole batch as a ZIP file.',
    ],
    sections: [
      {
        heading: 'Fix sideways phone photos without relying on EXIF',
        body: 'A phone can save a landscape sensor image together with an EXIF Orientation tag instead of rotating all of its pixels. Most current photo apps honor that tag, but some upload forms, old viewers, and document systems do not, so the same photo appears sideways. This tool decodes the photo with its EXIF orientation applied, then writes the corrected orientation into the downloaded pixels. The output does not need a viewer to read the original orientation tag. A 90° or 270° turn exchanges width and height; a 180° turn keeps the same dimensions.',
      },
      {
        heading: 'Rotation turns; flipping makes a mirror image',
        body: 'Rotation and flipping are different operations. A 90° turn changes the direction of the entire image, which is useful for a sideways scan or camera photo. Horizontal flip reflects left and right like a mirror; it is useful when a webcam or front camera made text and logos read backward. Vertical flip reflects top and bottom. You can combine either flip with any quarter turn, and the same combination is applied to every selected file so a scanned set or photo batch stays consistent.',
      },
      {
        heading: 'What the browser can export',
        body: 'The browser redraws the image to a canvas, so the result is a new file rather than a reversible display setting. JPG and WebP use the quality control and are lossy formats; PNG is lossless but may be larger. Choosing Same as original preserves JPG, PNG, or WebP when possible; inputs such as GIF, BMP, AVIF, or HEIC fall back to PNG because browser canvas cannot reliably encode every input format. Animated GIFs are exported as the first frame, not as a new animation.',
      },
    ],
    faq: [
      {
        q: 'Can I rotate multiple images at once?',
        a: 'Yes. Add multiple image files, choose one rotation and optional horizontal or vertical flip, and the same settings are rendered for the whole batch. Download the results one by one or as a ZIP file.',
      },
      {
        q: 'Does this fix a phone photo that is sideways because of EXIF orientation?',
        a: 'Yes. The image is decoded with its EXIF orientation applied and re-exported with the corrected position baked into the pixels, so viewers that ignore the original EXIF tag still show it upright.',
      },
      {
        q: 'What is the difference between rotating and flipping an image?',
        a: 'Rotating turns the entire image by 90°, 180°, or 270°. Flipping mirrors it: horizontal flip swaps left and right, while vertical flip swaps top and bottom. Both operations can be combined.',
      },
      {
        q: 'Are my images uploaded to a server?',
        a: 'No. Image decoding, EXIF orientation correction, canvas rendering, and ZIP creation all run in your browser. After the page has loaded, the tool can keep working without a network connection.',
      },
      {
        q: 'Will rotating an image change its quality?',
        a: 'The export is re-encoded because the browser writes a new pixel file. PNG stays lossless, while JPG and WebP use the quality value you choose; 80–90 is usually visually close to the source for photos.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '사진 회전·좌우 반전 — 여러 장 일괄 처리, 업로드 없음',
    description:
      '사진을 회전하거나 좌우·상하 반전하고, 휴대폰 사진의 EXIF 방향도 자동으로 보정합니다. 여러 장을 브라우저에서 처리해 ZIP으로 바로 내려받습니다.',
    h1: '사진 회전·뒤집기',
    tagline: '사진 방향을 바로잡고 좌우 반전까지 한 번에 — 파일은 기기 밖으로 나가지 않습니다.',
    name: '사진 회전·뒤집기',
    keywords: [
      '사진 회전',
      '이미지 회전',
      '사진 좌우 반전',
      '이미지 뒤집기',
      '사진 방향 바꾸기',
      '사진 거울 모드',
      '사진 일괄 회전',
    ],
    howTo: [
      '사진을 박스에 끌어다 놓거나, 클릭해서 파일을 선택하거나, Ctrl/⌘ + V로 이미지를 붙여넣습니다.',
      '왼쪽·오른쪽 90° 회전 버튼을 누르거나 0°·90°·180°·270° 중에서 방향을 고릅니다.',
      '필요하면 좌우 반전 또는 상하 반전을 켭니다. 선택한 설정은 넣은 사진 전체에 바로 적용됩니다.',
      '출력 형식과 품질을 고르고, 각 파일 옆에서 바뀐 가로·세로 크기와 결과를 확인합니다.',
      '한 장씩 내려받거나 여러 장을 ZIP 파일로 한꺼번에 내려받습니다.',
    ],
    sections: [
      {
        heading: '휴대폰 사진이 옆으로 보일 때: EXIF 방향을 픽셀에 반영',
        body: '휴대폰은 센서를 가로로 읽은 사진을 그대로 저장하고, EXIF Orientation이라는 방향 정보만 별도로 적는 경우가 많습니다. 최신 사진 앱은 이 정보를 읽어 바로 세워 보이게 하지만, 일부 업로드 사이트·문서 프로그램·오래된 뷰어는 무시해서 같은 사진이 옆으로 보일 수 있습니다. 이 도구는 EXIF 방향을 먼저 적용한 뒤 올바른 모양의 픽셀로 다시 저장합니다. 내려받은 파일은 EXIF 방향 정보를 읽지 못하는 곳에서도 올바르게 보입니다. 90°나 270°로 돌리면 가로와 세로 픽셀 수가 서로 바뀌고, 180° 회전은 크기를 유지합니다.',
      },
      {
        heading: '회전과 좌우 반전은 다른 작업입니다',
        body: '회전은 사진 전체의 방향을 90°·180°·270°만큼 돌리는 기능입니다. 옆으로 찍힌 사진이나 스캔 문서를 바로 세울 때 씁니다. 좌우 반전은 거울처럼 왼쪽과 오른쪽을 바꾸는 기능이라 셀프 카메라, 웹캠, 거꾸로 보이는 글자나 로고를 고칠 때 유용합니다. 상하 반전은 위아래를 뒤집습니다. 회전과 두 종류의 반전은 함께 쓸 수 있으며, 같은 설정이 선택한 사진 전체에 적용되어 여러 페이지 스캔이나 사진 묶음도 방향을 일관되게 맞출 수 있습니다.',
      },
      {
        heading: '출력 형식과 품질을 고르는 법',
        body: '브라우저 캔버스가 사진을 새로 그려 결과 파일을 만들기 때문에, 화면에서만 돌려 보는 기능과 달리 어디에 보내도 같은 방향으로 보입니다. JPG와 WebP는 품질 슬라이더가 적용되는 손실 압축 형식이고, PNG는 무손실이지만 파일이 더 커질 수 있습니다. 원본과 동일을 선택하면 JPG·PNG·WebP는 가능한 한 같은 형식으로 저장합니다. GIF·BMP·AVIF·HEIC처럼 캔버스가 안정적으로 저장하지 못하는 입력은 PNG로 저장됩니다. 움직이는 GIF는 애니메이션 전체가 아니라 첫 프레임만 저장됩니다.',
      },
    ],
    faq: [
      {
        q: '사진 여러 장을 한꺼번에 회전할 수 있나요?',
        a: '네. 여러 장을 넣고 회전 각도와 좌우·상하 반전을 한 번만 고르면 같은 설정이 모든 사진에 적용됩니다. 결과는 한 장씩 받거나 ZIP 파일 하나로 묶어 받을 수 있습니다.',
      },
      {
        q: '휴대폰 사진이 옆으로 보이는 EXIF 방향 문제도 고쳐지나요?',
        a: '네. EXIF 방향을 읽어 올바르게 표시한 뒤 그 상태를 픽셀에 직접 저장합니다. 원래 EXIF 정보를 무시하는 업로드 사이트나 사진 뷰어에서도 사진이 똑바로 보입니다.',
      },
      {
        q: '회전과 좌우 반전은 무엇이 다른가요?',
        a: '회전은 사진 전체를 90°·180°·270° 돌립니다. 좌우 반전은 거울처럼 왼쪽과 오른쪽을 맞바꾸고, 상하 반전은 위아래를 맞바꿉니다. 세 작업은 함께 적용할 수 있습니다.',
      },
      {
        q: '사진이 서버로 업로드되나요?',
        a: '아니요. 사진 읽기, EXIF 방향 보정, 회전·반전, ZIP 만들기가 모두 현재 브라우저에서 처리됩니다. 페이지를 연 뒤에는 인터넷 연결을 끊어도 계속 사용할 수 있습니다.',
      },
      {
        q: '사진을 회전하면 화질이 떨어지나요?',
        a: '브라우저가 새 파일로 다시 저장하므로 JPG와 WebP는 선택한 품질만큼 압축됩니다. PNG는 무손실로 저장되며, 사진용 JPG·WebP는 품질 80~90이면 대체로 원본과 차이가 거의 보이지 않습니다.',
      },
    ],
    ui: {
      dropTitle: '사진을 여기에 놓거나, 클릭해서 선택, 또는 붙여넣기',
      dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF',
      privacyNote: '사진은 기기에서 바로 처리됩니다. 어디에도 업로드되지 않습니다.',
      unsupported: '브라우저에서 읽을 수 없는 파일입니다.',
      processing: '처리 중…',
      download: '다운로드',
      downloadAll: '사진 {n}장 ZIP으로 다운로드',
      clear: '모두 지우기',
      remove: '사진 제거',
      rotateLabel: '회전',
      rotateHint: '선택한 설정은 이번에 넣은 사진 전체에 적용됩니다.',
      rotateLeft: '왼쪽 90° 회전',
      rotateRight: '오른쪽 90° 회전',
      rotationValue: '회전 각도',
      rotation0: '0°',
      rotation90: '90°',
      rotation180: '180°',
      rotation270: '270°',
      flipHorizontal: '좌우 반전(거울)',
      flipVertical: '상하 반전',
      format: '출력 형식',
      formatOriginal: '원본과 동일',
      formatJpeg: 'JPG',
      formatPng: 'PNG',
      formatWebp: 'WebP',
      quality: '품질',
      qualityHint: 'JPG와 WebP에 적용됩니다. 보통 사진은 80~90에서 품질 저하가 거의 느껴지지 않습니다.',
      exifNote:
        '휴대폰 사진의 EXIF 방향을 먼저 보정한 뒤 내보냅니다. 내려받은 파일에는 올바른 방향이 픽셀로 저장됩니다.',
    },
  },
};

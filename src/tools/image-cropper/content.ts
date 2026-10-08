import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a photo here, click to choose, or paste',
  dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF',
  privacyNote: 'Your photo is cropped on your device. Nothing is uploaded.',
  unsupported: 'This file can’t be read by your browser.',
  cropBoxLabel: 'Crop area — drag to move, drag a handle to resize, or use the arrow keys',
  keyboardHint:
    'Drag to move, drag a handle to resize. Arrow keys move the focused crop area (Shift for 10px) — use the width/height fields to resize by keyboard:',
  download: 'Download',
  replace: 'Choose another photo',
  shapeLabel: 'Shape',
  shapeRect: 'Rectangle',
  shapeCircle: 'Circle',
  aspectLabel: 'Aspect ratio',
  circleAspectLockedHint: 'Circle crops are always square.',
  aspect_free: 'Freeform',
  aspect_1_1: 'Square 1:1',
  aspect_4_3: 'Landscape 4:3',
  aspect_3_4: 'Portrait 3:4',
  aspect_16_9: 'Widescreen 16:9',
  aspect_9_16: 'Vertical 9:16',
  aspect_3_2: 'Photo 3:2',
  aspect_2_3: 'Photo 2:3',
  x: 'X (px)',
  y: 'Y (px)',
  width: 'Width (px)',
  height: 'Height (px)',
  reset: 'Reset crop',
  format: 'Output format',
  formatOriginal: 'Same as original',
  quality: 'Quality',
  qualityHint: 'Applies to JPG and WebP. 80–90 is visually lossless for most photos.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Image Cropper — Crop Photos & Circle Profile Pictures, No Upload',
    description:
      'Crop a photo to an exact pixel size, a locked aspect ratio, or a perfect circle for a profile picture — entirely in your browser. No upload, no ads, no sign-up.',
    h1: 'Image Cropper',
    tagline: 'Drag a box, lock an aspect ratio, or cut a perfect circle — privately, in your browser.',
    name: 'Image Cropper',
    keywords: [
      'crop image',
      'photo cropper',
      'crop picture',
      'circle crop',
      'profile picture crop',
      'aspect ratio crop',
      'crop to square',
    ],
    howTo: [
      'Drop a photo onto the box, click to choose a file, or paste a screenshot with Ctrl/⌘ + V.',
      'Drag the crop box or its handles to pick the area, or type exact X, Y, width and height.',
      'Pick an aspect ratio (1:1, 4:3, 16:9…) or switch the shape to Circle for a profile picture.',
      'Choose an output format — the preview and file size update live as you adjust the crop.',
      'Download the cropped image.',
    ],
    sections: [
      {
        heading: 'Pixel-perfect, not just drag-and-guess',
        body: 'Most browser croppers only let you drag a box by eye. This one also has X, Y, width and height fields you can type into directly, and the focused crop box can be nudged with the arrow keys (hold Shift to move 10px at a time). That matters when a destination gives you an exact spec to hit — for example LinkedIn asks for at least 400×400px for a profile photo (800×800px recommended), and a Google account picture needs at least 250×250px. Type the number you were given instead of eyeballing a drag handle.',
      },
      {
        heading: 'Circle crops for profile pictures',
        body: 'Switching the shape to Circle locks the box to a 1:1 square and masks the export to a circle, which is how LinkedIn, Google, Slack and most chat apps render a square upload anyway — so you can see exactly what will be cropped before you upload it. The export defaults to a transparent PNG so the circle stays a circle wherever it lands; if you need a solid background instead (some upload forms reject transparency), switch the output format to JPG and the area outside the circle is filled white.',
      },
      {
        heading: 'Your photo never leaves your device',
        body: 'Cropping happens in your browser’s own Canvas engine — the file is never uploaded to a server, so there is no wait and it keeps working offline once the page has loaded. Re-encoding the crop also strips the original EXIF metadata (camera model, GPS location), which is a useful side effect before sharing a photo publicly.',
      },
    ],
    faq: [
      {
        q: 'What size should a circular profile picture be?',
        a: 'For most platforms, upload a square image at least 400×400px (LinkedIn’s stated minimum, 800×800px recommended for sharpness) or at least 250×250px (Google’s stated minimum) — switch the shape to Circle, which locks the crop to 1:1, and type the exact size into the width/height fields.',
      },
      {
        q: 'Can I crop to an exact pixel size instead of dragging?',
        a: 'Yes. The X, Y, width and height fields next to the crop box accept exact pixel values, and typing into any of them updates the live preview immediately — no need to drag precisely by eye.',
      },
      {
        q: 'Is my photo uploaded anywhere?',
        a: 'No. Cropping runs entirely in your browser using the Canvas API. You can disconnect from the internet after the page loads and it still works.',
      },
      {
        q: 'Why is my circle crop saved as a PNG?',
        a: 'A circle needs transparency outside the mask, and only PNG and WebP support that in a browser canvas — JPG has no alpha channel. If you pick JPG anyway, the area outside the circle is filled white instead of left transparent.',
      },
      {
        q: 'What is the difference between an aspect ratio and the Circle shape?',
        a: 'An aspect ratio (like 4:3 or 16:9) locks the crop box to a rectangle with that width-to-height ratio. The Circle shape also locks the box to a 1:1 square, but additionally masks the exported image to an ellipse inscribed in that square.',
      },
      {
        q: 'Does cropping reduce image quality?',
        a: 'Cropping itself only removes pixels outside the box — it doesn’t resample the kept area, so there is no quality loss there. Re-encoding to JPG or WebP at the quality slider does apply lossy compression; pick PNG or a quality near 100 to keep it lossless.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '이미지 자르기 — 비율 고정·원형 프로필 사진, 업로드 없이',
    description:
      '사진을 정확한 픽셀 크기, 원하는 비율, 또는 프로필용 원형으로 브라우저에서 바로 자릅니다. 업로드·광고·회원가입이 없습니다.',
    h1: '이미지 자르기',
    tagline: '박스를 드래그하거나 비율을 고정하고, 원형으로도 — 브라우저 안에서 그대로.',
    name: '이미지 자르기',
    keywords: [
      '사진 자르기',
      '이미지 자르기',
      '프로필 사진 자르기',
      '원형 자르기',
      '비율 자르기',
      '증명사진 자르기',
      '정사각형 자르기',
    ],
    howTo: [
      '사진을 박스에 끌어다 놓거나, 클릭해서 파일을 선택하거나, Ctrl/⌘ + V로 붙여넣습니다.',
      '자르기 박스나 모서리를 드래그해 영역을 고르거나, X·Y·가로·세로 칸에 정확한 숫자를 입력합니다.',
      '비율(1:1, 4:3, 16:9…)을 고르거나, 모양을 원형으로 바꿔 프로필 사진을 만듭니다.',
      '출력 형식을 고르면 미리보기와 파일 크기가 조정하는 즉시 바로 갱신됩니다.',
      '잘린 이미지를 다운로드합니다.',
    ],
    sections: [
      {
        heading: '드래그 말고 픽셀 단위로 정확하게',
        body: '대부분의 브라우저 자르기 도구는 눈으로 보고 드래그하는 것이 전부입니다. 이 도구는 X, Y, 가로, 세로를 직접 입력하는 칸이 있고, 자르기 영역에 포커스를 둔 채 방향키로 미세 이동(Shift를 누르면 10px씩)도 됩니다. 링크드인 프로필 사진은 최소 400×400px(선명하게 보려면 800×800px 권장), 구글 계정 사진은 최소 250×250px를 요구하는데, 드래그로 맞추는 대신 그 숫자를 그대로 입력하면 됩니다. 한국 여권사진처럼 가로 3.5cm×세로 4.5cm(온라인 신청 권장 규격 413×531px)같은 특정 규격도 가로/세로 칸에 바로 입력해 맞출 수 있습니다.',
      },
      {
        heading: '프로필용 원형 자르기',
        body: '모양을 원형으로 바꾸면 자르기 박스가 1:1 정사각형으로 고정되고, 내보낼 때 원 밖을 투명하게 마스킹합니다. 카카오톡, 인스타그램, 링크드인, 구글 모두 정사각형으로 올린 사진을 화면에서는 원형으로 보여주므로, 업로드하기 전에 실제로 어떻게 잘릴지 미리 확인할 수 있습니다. 기본 출력은 투명 배경 PNG라 어디에 올려도 원형이 유지되고, 투명을 지원하지 않는 곳에 올려야 한다면 출력 형식을 JPG로 바꾸면 원 밖이 흰색으로 채워집니다.',
      },
      {
        heading: '사진은 기기 밖으로 나가지 않습니다',
        body: '자르기는 브라우저 안의 Canvas 기능으로만 처리되어 파일이 서버에 업로드되지 않으므로 기다릴 필요가 없고, 페이지를 한 번 불러온 뒤에는 인터넷 연결 없이도 동작합니다. 다시 인코딩하는 과정에서 원본의 EXIF 정보(카메라 모델, GPS 위치)도 함께 제거되므로, 사진을 공개적으로 공유하기 전에 한 번 거치면 도움이 됩니다.',
      },
    ],
    faq: [
      {
        q: '원형 프로필 사진은 몇 픽셀로 만들어야 하나요?',
        a: '대부분의 서비스는 정사각형 사진을 요구합니다. 링크드인은 최소 400×400px(선명하게 보려면 800×800px 권장), 구글 계정 사진은 최소 250×250px를 안내합니다. 모양을 원형으로 바꾸면 자르기 박스가 자동으로 1:1 정사각형으로 고정되니, 가로/세로 칸에 원하는 크기를 직접 입력하세요.',
      },
      {
        q: '드래그 대신 정확한 픽셀 크기로 자를 수 있나요?',
        a: '네. 자르기 박스 옆의 X, Y, 가로, 세로 칸에 정확한 픽셀 값을 입력할 수 있고, 입력하는 즉시 미리보기가 바로 갱신됩니다. 손으로 정확히 드래그할 필요가 없습니다.',
      },
      {
        q: '사진이 어딘가로 업로드되나요?',
        a: '아니요. 자르기는 브라우저의 Canvas API로만 처리됩니다. 페이지를 불러온 뒤 인터넷을 끊어도 계속 동작합니다.',
      },
      {
        q: '원형으로 자르면 왜 PNG로 저장되나요?',
        a: '원 바깥 영역은 투명해야 하는데, 브라우저 캔버스에서 투명을 지원하는 형식은 PNG와 WebP뿐이고 JPG에는 투명 채널이 없기 때문입니다. 그래도 JPG를 선택하면 원 바깥이 투명 대신 흰색으로 채워집니다.',
      },
      {
        q: '여권사진처럼 정해진 비율이 필요할 때는 어떻게 하나요?',
        a: '비율 목록에 정확히 없는 규격(예: 여권사진 3.5×4.5cm, 온라인 신청 권장 413×531px)은 가로/세로 칸에 숫자를 직접 입력해서 맞추면 됩니다. 비율 프리셋은 가까운 값을 빠르게 고를 때, 숫자 입력은 정확한 규격이 필요할 때 쓰세요.',
      },
      {
        q: '자르기를 하면 사진 품질이 떨어지나요?',
        a: '자르기 자체는 영역 밖의 픽셀을 버리는 것뿐이라 남은 부분은 다시 계산하지 않으므로 품질 손실이 없습니다. JPG나 WebP로 내보낼 때 품질 슬라이더를 낮추면 그만큼 압축되니, 손실을 피하려면 PNG를 쓰거나 품질을 100 가까이 두세요.',
      },
    ],
    ui: {
      dropTitle: '사진을 여기에 놓거나, 클릭해서 선택, 또는 붙여넣기',
      dropHint: 'JPG, PNG, WebP, GIF, BMP, AVIF',
      privacyNote: '사진은 기기에서 바로 잘립니다. 어디에도 업로드되지 않습니다.',
      unsupported: '브라우저에서 읽을 수 없는 파일입니다.',
      cropBoxLabel: '자르기 영역 — 드래그로 이동, 모서리로 크기 조절, 방향키로도 이동 가능',
      keyboardHint:
        '드래그로 이동, 모서리를 당겨 크기 조절. 방향키는 포커스된 영역을 이동만 합니다(Shift는 10px) — 키보드로 크기를 바꾸려면 아래 가로/세로 칸을 쓰세요:',
      download: '다운로드',
      replace: '다른 사진 선택',
      shapeLabel: '모양',
      shapeRect: '사각형',
      shapeCircle: '원형',
      aspectLabel: '비율',
      circleAspectLockedHint: '원형 자르기는 항상 정사각형입니다.',
      aspect_free: '자유 비율',
      aspect_1_1: '정사각형 1:1',
      aspect_4_3: '가로 4:3',
      aspect_3_4: '세로 3:4',
      aspect_16_9: '와이드 16:9',
      aspect_9_16: '세로 9:16',
      aspect_3_2: '사진 3:2',
      aspect_2_3: '사진 2:3',
      x: 'X (px)',
      y: 'Y (px)',
      width: '가로 (px)',
      height: '세로 (px)',
      reset: '초기화',
      format: '출력 형식',
      formatOriginal: '원본과 동일',
      quality: '품질',
      qualityHint: 'JPG와 WebP에 적용됩니다. 대부분 사진은 80~90에서 품질 저하가 거의 느껴지지 않습니다.',
    },
  },
};

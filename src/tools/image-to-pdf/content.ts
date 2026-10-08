import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop photos here, click to choose, or paste',
  dropHint: 'JPG, PNG, WebP, GIF, BMP · as many as you like',
  privacyNote: 'Images are turned into a PDF on your device. Nothing is uploaded.',
  unsupported: 'This file can’t be read by your browser.',
  processing: 'Processing…',
  download: 'Download PDF',
  pages: '{n} page(s)',
  remove: 'Remove',
  moveUp: 'Move up',
  moveDown: 'Move down',
  clear: 'Clear all',
  pageSizeLabel: 'Page size',
  pageSizeFit: 'Fit to image',
  pageSizeA4: 'A4',
  pageSizeLetter: 'Letter',
  pageSizeHint: 'Fit to image keeps every page the exact size and shape of its photo, with no white borders.',
  orientationLabel: 'Orientation',
  orientationAuto: 'Auto',
  orientationPortrait: 'Portrait',
  orientationLandscape: 'Landscape',
  marginLabel: 'Margin',
  marginNone: 'None',
  marginSmall: 'Small',
  qualityLabel: 'Quality',
  qualityHint: 'Lower quality makes a smaller PDF. 85 is visually lossless for most photos.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'JPG to PDF Converter — Reorder Pages, No Upload',
    description:
      'Combine JPG, PNG or WebP photos into one PDF in your browser. Drag to reorder, fit the page to each image or use A4/Letter, no upload, no ads, no sign-up.',
    h1: 'JPG to PDF',
    tagline: 'Turn photos into a PDF — drag to reorder, choose the page size — without uploading anything.',
    name: 'Image to PDF',
    keywords: [
      'jpg to pdf',
      'image to pdf',
      'photo to pdf',
      'convert pictures to pdf',
      'combine images into pdf',
      'png to pdf',
    ],
    howTo: [
      'Drop in photos, click to choose files, or paste an image with Ctrl/⌘ + V.',
      'Drag the thumbnails (or use the ↑/↓ buttons) to put pages in the order you want.',
      'Pick a page size: Fit to image, A4, or Letter, plus orientation and margin.',
      'Click Download PDF — the file is assembled on your device in a moment.',
    ],
    sections: [
      {
        heading: 'Which page size should I pick?',
        body: 'Fit to image makes each PDF page exactly the size and aspect ratio of its photo — nothing is cropped or padded with white space, which is the best choice for screenshots, receipts or documents you photographed. A4 (210×297mm, 595×842pt) and US Letter (8.5×11in, 612×792pt) are the two standard printable sizes most of the world uses; pick one of those if you plan to print the PDF or need pages that are a consistent size regardless of each photo’s shape. With A4/Letter, each photo is scaled down to fit inside the page (never cropped) and centered, with the orientation chosen automatically from each image’s shape unless you force Portrait or Landscape.',
      },
      {
        heading: 'How big will the PDF be?',
        body: 'Each photo is re-encoded as JPEG at the quality you set (40–100) before being embedded, so the Quality slider is the main lever on file size: dropping from 100 to 85 typically cuts size by half or more with almost no visible difference for regular photos, while 100 keeps maximum detail for things like scanned text. PNG and WebP sources are flattened onto a white background during this step, since PDF’s image format here has no transparency channel.',
      },
      {
        heading: 'Nothing leaves your device',
        body: 'Most "jpg to pdf" sites upload your photos to a server, convert them there, and send a PDF back — which means a stranger’s server handles your files even if it later deletes them. This tool builds the PDF entirely in your browser using Canvas and a small PDF writer built for this page; your photos and the resulting file never cross the network, so it also works just as well offline once the page has loaded.',
      },
    ],
    faq: [
      {
        q: 'Are my photos uploaded to a server?',
        a: 'No. Every step — reading the images, reordering pages, and assembling the final PDF — happens in your browser. You can disconnect from the internet after the page loads and it still works.',
      },
      {
        q: 'How many images can I combine into one PDF?',
        a: 'There is no fixed limit; the practical ceiling is your device’s memory. A few dozen typical phone photos combine in well under a second.',
      },
      {
        q: 'Can I change the order of the pages?',
        a: 'Yes. Drag any thumbnail to a new position, or use the ↑ and ↓ buttons next to each file for keyboard or touch control — the PDF updates automatically.',
      },
      {
        q: 'What is the difference between A4 and Letter?',
        a: 'A4 is 210×297mm (595×842 points) and is the standard size across most of the world. US Letter is 8.5×11in (612×792 points) and is standard in the United States and Canada. Both are available as page-size options here.',
      },
      {
        q: 'Does converting to PDF lose image quality?',
        a: 'Each photo is re-encoded as JPEG at the Quality you choose. At the default of 85 the loss is not visible to the eye for ordinary photos; set it to 100 for scanned documents or text where sharpness matters most.',
      },
      {
        q: 'Can I convert PNG or WebP images, not just JPG?',
        a: 'Yes. PNG, WebP, GIF and BMP files are all accepted; transparent areas are filled with white since the embedded image format has no transparency channel.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '사진 PDF 변환 — 순서 드래그, 업로드 없음',
    description:
      'JPG, PNG, WebP 사진을 브라우저에서 PDF 한 장으로 합쳐보세요. 순서 드래그, 이미지 크기에 맞춤 또는 A4/Letter 선택, 업로드·광고·가입 없음.',
    h1: '사진 PDF 변환',
    tagline: '사진을 PDF로 — 순서는 드래그로, 페이지 크기는 원하는 대로, 업로드 없이.',
    name: '이미지 PDF 변환',
    keywords: ['사진 pdf 변환', 'jpg to pdf', '이미지 pdf', '사진 합치기 pdf', 'png pdf 변환', '사진 pdf 만들기'],
    howTo: [
      '사진을 끌어다 놓거나, 클릭해서 고르거나, Ctrl/⌘ + V로 붙여넣습니다.',
      '썸네일을 드래그하거나 ↑/↓ 버튼으로 페이지 순서를 정합니다.',
      '페이지 크기(이미지에 맞춤, A4, Letter)와 방향·여백을 고릅니다.',
      'PDF 다운로드를 누르면 기기에서 바로 파일이 만들어집니다.',
    ],
    sections: [
      {
        heading: '페이지 크기, 뭘 골라야 할까',
        body: '"이미지에 맞춤"은 각 PDF 페이지를 사진과 정확히 같은 크기·비율로 만들어서 잘리거나 흰 여백이 남지 않습니다. 스크린샷, 영수증, 문서를 찍은 사진에 적합합니다. A4(210×297mm, 595×842pt)와 US Letter(8.5×11in, 612×792pt)는 세계에서 가장 널리 쓰이는 두 가지 표준 인쇄 용지 크기입니다. 인쇄할 계획이거나 사진 비율과 무관하게 페이지 크기를 통일하고 싶다면 둘 중 하나를 고르세요. A4/Letter를 선택하면 각 사진은 잘리지 않고 페이지 안에 맞게 축소되어 가운데 배치되며, 방향은 직접 가로/세로로 지정하지 않으면 사진 모양에 따라 자동으로 결정됩니다.',
      },
      {
        heading: 'PDF 용량은 얼마나 될까',
        body: '각 사진은 PDF에 담기기 전에 설정한 품질(40~100)로 JPEG로 다시 인코딩되므로, 품질 슬라이더가 용량을 가장 크게 좌우합니다. 100에서 85로 낮추면 보통 용량이 절반 이상 줄면서도 일반 사진에서는 차이가 거의 보이지 않습니다. 스캔한 문서처럼 선명도가 중요하면 100을 유지하세요. PNG나 WebP처럼 투명 배경이 있는 사진은 이 과정에서 흰 배경으로 채워집니다. PDF에 넣는 이미지 형식에는 투명 채널이 없기 때문입니다.',
      },
      {
        heading: '사진이 기기 밖으로 나가지 않습니다',
        body: '대부분의 "사진 pdf 변환" 사이트는 사진을 서버에 올려 변환한 뒤 다시 내려받게 합니다. 나중에 삭제한다고 해도 그 사이에는 낯선 서버가 내 파일을 처리하는 것입니다. 이 도구는 브라우저의 Canvas와 이 페이지를 위해 직접 만든 PDF 생성기로 모든 과정을 처리하므로, 사진과 결과 파일이 네트워크를 거치지 않습니다. 페이지를 한 번 열면 오프라인에서도 그대로 동작합니다.',
      },
    ],
    faq: [
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. 이미지를 읽고, 순서를 바꾸고, 최종 PDF를 만드는 모든 과정이 브라우저 안에서 이루어집니다. 페이지를 연 뒤 인터넷을 끊어도 그대로 동작합니다.',
      },
      {
        q: '한 PDF에 사진을 몇 장까지 합칠 수 있나요?',
        a: '정해진 제한은 없으며 실제 한계는 기기의 메모리입니다. 휴대폰 사진 수십 장을 합치는 데는 1초도 걸리지 않습니다.',
      },
      {
        q: '페이지 순서를 바꿀 수 있나요?',
        a: '네. 썸네일을 원하는 위치로 드래그하거나, 각 항목의 ↑ ↓ 버튼으로 키보드나 터치로도 순서를 바꿀 수 있습니다. PDF는 즉시 다시 만들어집니다.',
      },
      {
        q: 'A4와 Letter는 어떻게 다른가요?',
        a: 'A4는 210×297mm(595×842pt)로 한국을 포함해 세계 대부분에서 쓰는 표준 크기이고, US Letter는 8.5×11in(612×792pt)로 미국과 캐나다에서 표준으로 쓰입니다. 이 도구에서 둘 다 페이지 크기로 고를 수 있습니다.',
      },
      {
        q: 'PDF로 바꾸면 화질이 떨어지나요?',
        a: '각 사진은 선택한 품질로 JPEG로 다시 인코딩됩니다. 기본값 85에서는 일반 사진에서 눈에 보이는 차이가 거의 없고, 스캔한 문서나 글씨처럼 선명도가 중요하면 100으로 설정하세요.',
      },
      {
        q: 'JPG 말고 PNG나 WebP도 변환되나요?',
        a: '네. PNG, WebP, GIF, BMP 파일도 모두 지원합니다. 투명한 부분은 흰색으로 채워집니다. PDF에 넣는 이미지 형식에는 투명 채널이 없기 때문입니다.',
      },
    ],
    ui: {
      dropTitle: '사진을 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'JPG, PNG, WebP, GIF, BMP · 여러 장 가능',
      privacyNote: '사진은 내 기기에서 PDF로 변환됩니다. 어디에도 업로드되지 않습니다.',
      unsupported: '브라우저에서 읽을 수 없는 파일입니다.',
      processing: '처리 중…',
      download: 'PDF 다운로드',
      pages: '{n}페이지',
      remove: '삭제',
      moveUp: '위로 이동',
      moveDown: '아래로 이동',
      clear: '모두 지우기',
      pageSizeLabel: '페이지 크기',
      pageSizeFit: '이미지에 맞춤',
      pageSizeA4: 'A4',
      pageSizeLetter: 'Letter',
      pageSizeHint: '"이미지에 맞춤"은 페이지를 사진과 정확히 같은 크기·비율로 만들어 흰 여백이 생기지 않습니다.',
      orientationLabel: '방향',
      orientationAuto: '자동',
      orientationPortrait: '세로',
      orientationLandscape: '가로',
      marginLabel: '여백',
      marginNone: '없음',
      marginSmall: '좁게',
      qualityLabel: '품질',
      qualityHint: '품질을 낮추면 PDF 용량이 줄어듭니다. 대부분의 사진은 85에서 차이가 거의 보이지 않습니다.',
    },
  },
};

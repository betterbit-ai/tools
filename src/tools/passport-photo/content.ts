import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a portrait, click to choose, or paste',
  dropHint: 'JPG, PNG and WebP · processed only on this device',
  privacyNote: 'Your photo stays in this browser. Nothing is uploaded or stored.',
  unsupported: 'This image could not be read by your browser.',
  formatFailed: 'Your browser could not create a JPEG photo. Try another browser or image.',
  processingFailed: 'The photo could not be created. Try the original image again or choose another image.',
  replace: 'Choose another photo',
  presetLabel: 'Photo standard',
  preset_korea_passport: 'Korean passport · 35 × 45 mm',
  preset_us_passport: 'US passport · 2 × 2 in',
  preset_japan_passport: 'Japanese passport · 35 × 45 mm',
  preset_resume: 'Résumé photo · 30 × 40 mm',
  zoom: 'Zoom',
  zoomHint: 'Increase only enough to frame the head and shoulders.',
  horizontal: 'Horizontal position',
  vertical: 'Vertical position',
  positionHint: '0 is left/top; 100 is right/bottom. Use the arrow keys in these fields for small adjustments.',
  output: 'Output',
  pixels: 'Pixels at 300 DPI',
  size: 'Physical size',
  printCopies: '{n} copies on 4 × 6 in',
  sheetSize: '4 × 6 in',
  previewAlt: 'Passport photo preview',
  preparing: 'Preparing photo…',
  preparingSheet: 'Preparing print sheet…',
  decoding: 'Decoding photo…',
  cropping: 'Cropping photo…',
  layingOutSheet: 'Laying out print sheet…',
  encodingPhoto: 'Encoding photo…',
  encodingSheet: 'Encoding print sheet…',
  cancel: 'Cancel',
  previewCancelled: 'Preview update cancelled.',
  sheetCancelled: 'Print-sheet export cancelled.',
  resumePreview: 'Resume preview',
  downloadPhoto: 'Download photo',
  downloadSheet: 'Download 4 × 6 sheet',
  printHint: 'Print the sheet at Actual Size / 100% on photo paper. Do not use “fit to page.”',
  rulesNotice:
    'This tool crops and lays out your original image; it does not check expression, lighting, background or final acceptance.',
  lowResolution:
    'This framing uses only {width} × {height} source pixels, smaller than the {outputWidth} × {outputHeight} px output. It will be enlarged and may not pass quality checks.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Passport Photo — 4×6 Print Sheet, No Upload',
    description:
      'Crop a passport photo to Korean, US or Japanese dimensions and download an exact-pixel photo or 4×6 print sheet. No upload.',
    h1: 'Passport Photo Maker',
    tagline: 'Frame a photo to an official size and lay out copies for a 4×6 print — privately on your device.',
    name: 'Passport Photo Maker',
    keywords: ['passport photo', 'passport photo size', '2x2 photo', '35x45 photo', '4x6 passport photo sheet'],
    howTo: [
      'Drop a clear, recent portrait into the upload area, or paste an image with Ctrl/⌘ + V.',
      'Select the passport or résumé standard required by the issuing authority.',
      'Use zoom and position to frame your face. Follow the visible preview progress; you can cancel a long update.',
      'Download a single digital photo, or download the 4×6 sheet and print it at Actual Size / 100%.',
    ],
    sections: [
      {
        heading: 'Photo size is country-specific',
        body: 'There is no universal passport-photo size. A US passport photo is 2 × 2 inches (51 × 51 mm), while South Korea and Japan use 35 × 45 mm for printed passport photographs. Korean Ministry of Foreign Affairs guidance specifies a head length of 32–36 mm from crown to chin and a photo taken within the preceding six months. This tool turns 35 × 45 mm into 413 × 531 pixels at 300 DPI and 51 × 51 mm into 602 × 602 pixels. Always confirm the current requirement with the issuing authority before applying.',
      },
      {
        heading: 'Digital file versus a print sheet',
        body: 'Use the single-photo download when an application asks you to upload an image file. Use the 4 × 6 inch sheet when you need physical copies: the JPEG carries a 300-DPI density label and the tool places as many copies as fit at their actual dimensions. A Korean 35 × 45 mm photo fits six times on a 4 × 6 sheet; a square US 2 × 2 inch photo fits twice. At the printer or photo lab, choose Actual Size or 100% and turn off “fit to page,” otherwise the measured size will be wrong.',
      },
      {
        heading: 'What framing can and cannot fix',
        body: 'Cropping can set a file’s aspect ratio and physical output dimensions, but it cannot make an unsuitable source photo compliant. Check the rules for a plain background, even lighting, sharp focus, forward-facing pose, visible eyes and any requirements about glasses or expression. In Korea, official guidance also says photos must represent the applicant as they are and should not be modified. This tool never changes faces or replaces backgrounds; it only crops and encodes the image you choose, and the issuing authority makes the final decision.',
      },
      {
        heading: 'Large phone photos and output details',
        body: 'Ordinary 12 MP (4032 × 3024) and 24 MP (6000 × 4000) phone JPEGs are accepted. The tool handles one selected image at a time, shows decode, crop and encode progress, keeps working after you switch tabs, and lets you cancel. Decoded pixels and canvas memory are released after each result. Every download is a JPEG: transparent PNG or WebP areas are filled white, and embedded metadata such as EXIF and GPS is not copied. If the selected crop has fewer pixels than the output, a warning appears because enlarging cannot restore missing detail.',
      },
    ],
    faq: [
      {
        q: 'What size is a Korean passport photo?',
        a: 'A Korean passport photo is 35 × 45 mm, which is 413 × 531 pixels at 300 DPI. Ministry guidance also specifies a 32–36 mm head length from crown to chin and a photo taken within six months; confirm current requirements at passport.go.kr before submitting.',
      },
      {
        q: 'What size is a US passport photo?',
        a: 'A US passport photo measures 2 × 2 inches, or 51 × 51 mm. At 300 DPI this tool outputs 602 × 602 pixels; the US Department of State publishes separate rules for pose, background and digital-upload files.',
      },
      {
        q: 'How do I print passport photos at home?',
        a: 'Download the 4 × 6 inch sheet, print it on 4 × 6 photo paper, and choose Actual Size or 100% in the print dialog. Do not select Fit to Page, because scaling the sheet changes the required millimetre dimensions.',
      },
      {
        q: 'Are passport photos uploaded to a server?',
        a: 'No. The image is decoded, cropped and rendered in your browser with its built-in canvas engine, so the photo is not sent to a server or saved by this tool.',
      },
      {
        q: 'Does this tool guarantee that my photo will be accepted?',
        a: 'No. It creates the selected size and print layout, but it cannot judge lighting, expression, image quality, background, recency or an authority’s final review. Compare your original photo with the official guidance before submitting it.',
      },
      {
        q: 'Can I use a large phone photo or a transparent PNG?',
        a: 'Yes. The tool accepts ordinary 12 MP and 24 MP phone photos and processes one image at a time with visible progress and cancellation. Downloads are JPEG files, so transparent pixels are filled white; EXIF, GPS and other embedded metadata are not copied.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '여권사진 사이즈 — 증명사진 규격·인화용 배치 (업로드 없음)',
    description:
      '여권사진과 증명사진을 한국·미국·일본 규격으로 자르고 4×6인치 인화용 시트를 만듭니다. 사진은 기기 밖으로 전송되지 않습니다.',
    h1: '여권사진·증명사진 규격',
    tagline: '사진을 필요한 규격으로 맞추고 4×6인치 인화용 배치까지, 업로드 없이 기기에서 처리합니다.',
    name: '여권사진·증명사진 규격',
    keywords: ['여권사진 사이즈', '증명사진 만들기', '여권사진 규격', '여권사진 3.5 4.5', '증명사진 인화용'],
    howTo: [
      '최근에 촬영한 정면 사진을 끌어다 놓거나 클릭해서 선택합니다. Ctrl/⌘ + V로 붙여넣어도 됩니다.',
      '신청 기관에 맞는 여권사진 또는 이력서 사진 규격을 고릅니다.',
      '확대와 가로·세로 위치를 조절해 얼굴과 어깨가 자연스럽게 들어오도록 맞춥니다. 진행 상태를 확인하고 오래 걸리면 취소할 수 있습니다.',
      '온라인 제출용 사진 또는 4×6인치 인화용 시트를 내려받고, 인쇄할 때 실제 크기/100%를 선택합니다.',
    ],
    sections: [
      {
        heading: '한국 여권사진 규격은 3.5 × 4.5cm입니다',
        body: '외교부 여권사진 안내에 따르면 한국 여권사진은 가로 3.5cm, 세로 4.5cm의 천연색 상반신 정면 사진입니다. 정수리(머리카락 제외)부터 턱까지의 머리 길이는 3.2~3.6cm이고, 신청일 기준 6개월 이내 촬영한 사진이어야 합니다. 이 크기는 300dpi 기준 413 × 531px입니다. 배경은 균일한 흰색이어야 하고 테두리·그림자·다른 사람이나 물건이 있으면 안 됩니다. 실제 제출 전에 passport.go.kr의 최신 안내와 신청 화면의 파일 조건을 반드시 확인해야 합니다.',
      },
      {
        heading: '온라인 제출용 파일과 인화용 사진은 다릅니다',
        body: '온라인 신청에는 기관이 안내한 픽셀 크기·파일 형식·용량을 따르는 한 장의 이미지가 필요합니다. 종이 사진이 필요하면 이 도구의 4 × 6인치 시트를 받아 사진 인화지에 출력합니다. 35 × 45mm 한국 여권사진은 4 × 6인치 시트에 6장이 들어가고, 미국 2 × 2인치 사진은 2장이 들어갑니다. 출력 창이나 사진관에서 “페이지에 맞춤”을 끄고 “실제 크기” 또는 “100%”를 선택해야 3.5 × 4.5cm가 유지됩니다.',
      },
      {
        heading: '크기 조절만으로 규격을 보장할 수는 없습니다',
        body: '자르기는 사진의 가로세로 비율과 출력 픽셀을 맞출 수 있지만, 표정·조명·초점·배경·최근 촬영 여부는 판별할 수 없습니다. 외교부 안내에는 정면을 보고 입을 다문 자연스러운 표정, 그림자 없는 균일한 흰색 배경, 눈을 가리지 않는 상태 등이 포함됩니다. 또한 실제 모습과 달라지도록 변형한 사진은 사용할 수 없습니다. 이 도구는 얼굴 보정이나 배경 합성을 하지 않고 원본을 자르고 배치할 뿐이며, 최종 접수 여부는 여권 발급 기관이 결정합니다.',
      },
      {
        heading: '고화소 휴대폰 사진과 저장 형식',
        body: '일반적인 1,200만 화소(4032 × 3024)와 2,400만 화소(6000 × 4000) 휴대폰 JPG도 처리합니다. 한 번에 사진 한 장을 읽고, 자르고, 저장하며 단계별 진행 상태가 표시됩니다. 다른 탭으로 이동해도 처리를 이어가며 취소할 수 있고, 결과를 만든 뒤에는 디코딩한 픽셀과 캔버스 메모리를 해제합니다. 결과는 모두 JPG이므로 PNG나 WebP의 투명 영역은 흰색으로 채워 저장하며 EXIF·GPS 같은 메타데이터는 복사하지 않습니다. 선택한 구도의 원본 픽셀이 결과보다 작으면 확대에 따른 선명도 경고를 표시합니다.',
      },
    ],
    faq: [
      {
        q: '한국 여권사진 사이즈는 얼마인가요?',
        a: '한국 여권사진은 가로 3.5cm × 세로 4.5cm이며 300dpi 기준 413 × 531px입니다. 정수리부터 턱까지 머리 길이는 3.2~3.6cm이고 최근 6개월 이내 촬영한 사진이어야 하므로, 제출 전 passport.go.kr의 최신 기준을 확인해야 합니다.',
      },
      {
        q: '여권사진을 집에서 인화하려면 어떻게 하나요?',
        a: '4 × 6인치 인화용 시트를 내려받아 4 × 6 사진 인화지에 출력하고, 인쇄 설정에서 실제 크기 또는 100%를 선택합니다. 페이지에 맞춤을 선택하면 사진 크기가 바뀌므로 사용하지 않아야 합니다.',
      },
      {
        q: '여권사진을 온라인으로 제출할 때도 3.5 × 4.5cm인가요?',
        a: '온라인 제출은 기관별로 JPG 형식, 픽셀 범위, 파일 용량을 따로 요구할 수 있습니다. 이 도구의 한국 여권 프리셋은 인화 기준 35 × 45mm와 413 × 531px를 만들며, 실제 온라인 신청 화면의 최신 파일 안내가 우선합니다.',
      },
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. 선택한 사진은 브라우저의 Canvas 기능으로 기기 안에서 자르고 저장하므로 서버로 전송되거나 이 도구에 저장되지 않습니다.',
      },
      {
        q: '이 도구로 만들면 여권사진이 무조건 접수되나요?',
        a: '아니요. 이 도구는 선택한 크기와 인화 배치만 맞춥니다. 표정, 조명, 배경, 초점, 촬영 시점, 실제 인물 확인은 판단할 수 없으므로 최종 접수 여부는 발급 기관의 심사 결과에 따릅니다.',
      },
      {
        q: '고화소 휴대폰 사진이나 투명 PNG도 사용할 수 있나요?',
        a: '일반적인 1,200만·2,400만 화소 휴대폰 사진을 한 장씩 처리하며 진행 상태를 표시하고 취소할 수 있습니다. 결과는 JPG이므로 투명 픽셀은 흰색으로 채워 저장하고 EXIF·GPS 등 원본 메타데이터는 복사하지 않습니다.',
      },
    ],
    ui: {
      dropTitle: '사진을 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'JPG, PNG, WebP · 사진은 기기에서만 처리됩니다',
      privacyNote: '사진은 이 브라우저 안에만 남습니다. 업로드하거나 저장하지 않습니다.',
      unsupported: '브라우저에서 읽을 수 없는 이미지입니다.',
      formatFailed: '브라우저에서 JPEG 사진을 만들지 못했습니다. 다른 브라우저나 이미지를 사용해 보세요.',
      processingFailed: '사진을 만들지 못했습니다. 원본 이미지를 다시 시도하거나 다른 이미지를 선택하세요.',
      replace: '다른 사진 선택',
      presetLabel: '사진 규격',
      preset_korea_passport: '한국 여권 · 35 × 45mm',
      preset_us_passport: '미국 여권 · 2 × 2인치',
      preset_japan_passport: '일본 여권 · 35 × 45mm',
      preset_resume: '이력서 사진 · 30 × 40mm',
      zoom: '확대',
      zoomHint: '머리와 어깨 구도에 필요한 만큼만 확대합니다.',
      horizontal: '가로 위치',
      vertical: '세로 위치',
      positionHint: '0은 왼쪽/위쪽, 100은 오른쪽/아래쪽입니다. 입력 칸에서 화살표 키로 조금씩 조절할 수 있습니다.',
      output: '결과',
      pixels: '300dpi 기준 픽셀',
      size: '실제 크기',
      printCopies: '4 × 6인치에 {n}장',
      sheetSize: '4 × 6인치',
      previewAlt: '여권사진 미리보기',
      preparing: '사진 준비 중…',
      preparingSheet: '인화용 시트 준비 중…',
      decoding: '사진 읽는 중…',
      cropping: '사진 자르는 중…',
      layingOutSheet: '인화용 시트 배치 중…',
      encodingPhoto: '사진 저장 형식 만드는 중…',
      encodingSheet: '인화용 시트 저장 형식 만드는 중…',
      cancel: '취소',
      previewCancelled: '미리보기 업데이트를 취소했습니다.',
      sheetCancelled: '인화용 시트 내보내기를 취소했습니다.',
      resumePreview: '미리보기 다시 만들기',
      downloadPhoto: '사진 다운로드',
      downloadSheet: '4 × 6인치 시트 다운로드',
      printHint: '사진 인화지에 실제 크기/100%로 인쇄합니다. “페이지에 맞춤”은 선택하지 마세요.',
      rulesNotice: '이 도구는 원본 사진을 자르고 배치할 뿐, 표정·조명·배경·최종 접수 여부를 확인하지 않습니다.',
      lowResolution:
        '선택한 구도에 원본 {width} × {height}px만 사용되어 결과 {outputWidth} × {outputHeight}px보다 작습니다. 확대 저장되므로 선명도가 낮고 품질 심사를 통과하지 못할 수 있습니다.',
    },
  },
};

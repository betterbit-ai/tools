import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop an image here, or click to choose',
  dropHint: 'JPG, PNG, WebP, or BMP — you can also paste a screenshot',
  remove: 'Remove',
  unsupported: 'Choose a JPG, PNG, WebP, or BMP image.',
  fileSizeLimit: 'This image is over the 20 MB browser-safety limit.',
  pixelSizeLimit: 'This image has over 24 million pixels, the browser-safety limit for this tool.',
  unreadable: "This image can't be decoded in this browser.",
  failed: "Text couldn't be recognized from this image. Try a sharper image or a different language.",
  starting: 'Starting local OCR',
  model: 'Loading the selected language data',
  recognizing: 'Reading text from the image',
  progress: '{stage} — {percent}%',
  noText: 'No text was found. Check the language and try a sharper, straighter image.',
  resultReady: 'Review the editable result before copying names, numbers, or amounts.',
  resultLabel: 'Extracted text',
  resultHint: 'Edit any misread characters, then copy or save this UTF-8 text.',
  resultPlaceholder: 'Recognized text will appear here.',
  copy: 'Copy text',
  copied: 'Copied',
  download: 'Download TXT',
  languageLabel: 'Text language',
  languageHint: 'Choosing only the language in the image is usually faster and more accurate.',
  english: 'English',
  korean: 'Korean',
  mixed: 'Korean + English',
  privacyNote: 'The image is recognized in this browser. It is never uploaded for OCR.',
  characters: 'Characters',
  confidence: 'Confidence',
  limitNote:
    'One image at a time, up to 20 MB and 24 million pixels. The first use of a language loads its local model.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Image to Text — Private OCR for Korean & English',
    description:
      'Extract editable text from a JPG, PNG, WebP, or BMP image with local OCR. Pick Korean, English, or both, then copy or download a UTF-8 TXT file.',
    h1: 'Image to Text',
    tagline: 'Read Korean and English from an image in your browser, then correct, copy, or save the result.',
    name: 'Image to Text',
    keywords: [
      'image to text',
      'ocr online',
      'extract text from image',
      'photo to text',
      'screenshot to text',
      'Korean OCR',
    ],
    howTo: [
      'Drop or paste one JPG, PNG, WebP, or BMP image.',
      'Choose English, Korean, or Korean + English to match the visible text.',
      'Wait for the on-device OCR progress to finish, then review the editable result.',
      'Copy the text or download it as a UTF-8 TXT file.',
    ],
    sections: [
      {
        heading: 'What happens when you extract text from an image',
        body: 'OCR, short for optical character recognition, turns pixel shapes into selectable characters. This tool runs the Tesseract LSTM OCR engine as WebAssembly in the browser. The image remains in the current tab while the engine reads it; the worker, engine, and English and Korean language files are served from this site rather than sending the image to an OCR API. The selected language model is loaded only when you use it, and the browser can cache it for later scans.\n\nThe result is plain editable text, not a reconstruction of the picture. Paragraph breaks are kept where the engine finds them, but columns, tables, font styling, and the exact position of labels do not survive in TXT. Read through names, dates, totals, and similar-looking characters such as I, l, and 1 before using the result in a form or record.',
      },
      {
        heading: 'Choose the language that is actually in the image',
        body: 'Use English for English-only screenshots, URLs, source code, and printed English documents. Use Korean for Korean-only pages. For a Korean document containing English product names, figures, or web addresses, choose Korean + English so both character sets are available to the recognizer. The mixed setting loads both models, so its first use takes longer and it may be less decisive than a single-language model when the image clearly contains only one language.\n\nThis tool accepts one JPG, PNG, WebP, or BMP image up to 20 MB and 24 million pixels. Those limits keep the browser responsive on phones and laptops; they are not limits of the image formats themselves. A 12-megapixel phone photo is within the pixel limit. For HEIC photos, convert the file to JPG first with the related HEIC to JPG tool.',
      },
      {
        heading: 'Get a cleaner OCR result from photos and screenshots',
        body: 'OCR works best on sharp, high-contrast, straight-on printed text. A cropped screenshot often reads more cleanly than a full desktop image because navigation bars, icons, and decorative backgrounds are removed. For a phone photo, fill the frame with the page, avoid glare and shadows, and keep the camera parallel to the text. Large text and one-column layouts generally produce more reliable reading order than small multi-column pages or dense tables.\n\nHandwriting, cursive, low-resolution images, stylized fonts, reflections, and tilted pages need careful checking. The confidence value is an engine-wide estimate, not proof that every word is correct. Edit the textarea before copying; the copied and downloaded versions contain your edits. If the source is an existing digital PDF with selectable text, use PDF to Text instead, which reads its text layer directly without OCR.',
      },
    ],
    faq: [
      {
        q: 'Does this image-to-text tool upload my image?',
        a: 'No. The OCR runs in the current browser using a WebAssembly worker, and the image is not sent to a Betterbit server or an OCR API. The OCR worker, engine, and English/Korean language files are served from this site.',
      },
      {
        q: 'Which image files can I turn into text?',
        a: 'You can extract text from one JPG/JPEG, PNG, WebP, or BMP image at a time. The browser-safety limits are 20 MB and 24 million pixels. These formats cover screenshots, scans, and most camera photos saved as JPG.',
      },
      {
        q: 'Should I choose Korean, English, or Korean + English?',
        a: 'Choose the one language visibly used in the image whenever possible. Choose Korean + English for mixed documents such as a Korean receipt with English product names or URLs. The mixed mode loads both language models and can take longer on first use.',
      },
      {
        q: 'Why is the first image slower?',
        a: 'The first time you select a language, the browser downloads the OCR engine and that language’s trained data from this site. The browser may cache those files, so a later image using the same language usually starts with less setup work.',
      },
      {
        q: 'Can this OCR tool read handwriting or preserve tables?',
        a: 'It can attempt handwriting, but it is designed primarily for printed text and clear screenshots. The output is editable plain text, so table cells, columns, fonts, and exact page layout are not preserved. Proofread the result against the image before relying on it.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '사진 글자 추출 — 한글·영문 이미지 OCR',
    description:
      '사진·스크린샷의 글자를 브라우저에서 추출하세요. 한글·영문·혼합을 골라 결과를 수정하고 복사하거나 UTF-8 TXT로 저장합니다. 이미지는 업로드하지 않습니다.',
    h1: '사진 글자 추출',
    tagline: '사진과 스크린샷 속 한글·영문을 기기 안에서 읽어, 수정·복사·TXT 저장까지 합니다.',
    name: '사진 글자 추출',
    keywords: [
      '사진 글자 추출',
      '이미지 텍스트 변환',
      '이미지 글자 추출',
      '이미지 OCR',
      '사진 텍스트 변환',
      '스크린샷 글자 추출',
    ],
    howTo: [
      'JPG, PNG, WebP, BMP 사진 한 장을 끌어다 놓거나 화면 캡처를 붙여 넣습니다.',
      '이미지에 있는 글자에 맞춰 영문, 한글, 한글 + 영문을 고릅니다.',
      '브라우저 안에서 글자를 읽는 진행 상황이 끝나면 결과를 확인하고 직접 고칩니다.',
      '필요한 글자를 복사하거나 UTF-8 TXT 파일로 저장합니다.',
    ],
    sections: [
      {
        heading: '사진 속 글자를 텍스트로 바꾸는 방식',
        body: 'OCR은 사진의 픽셀 모양을 분석해 선택·복사할 수 있는 문자로 바꾸는 기술입니다. 이 도구는 Tesseract LSTM OCR 엔진을 WebAssembly로 브라우저 안에서 실행합니다. 사진은 현재 탭에서만 읽고 OCR API로 보내지 않습니다. 글자를 읽는 워커, 엔진, 한글·영문 언어 데이터도 외부 OCR 서비스가 아니라 이 사이트에서 받아 옵니다. 언어 데이터는 실제로 고른 뒤에만 불러오며, 브라우저는 다음 사용을 위해 파일을 캐시할 수 있습니다.\n\n결과는 사진의 모양을 재현하는 문서가 아니라 수정 가능한 일반 텍스트입니다. 엔진이 찾은 문단과 줄바꿈은 남길 수 있지만, 표 칸·다단·글꼴·라벨의 정확한 위치는 TXT에 담기지 않습니다. 이름, 날짜, 금액, 그리고 I·l·1처럼 비슷하게 보이는 글자는 원본과 꼭 다시 대조하세요.',
      },
      {
        heading: '한글·영문·혼합 중 알맞은 인식 언어 고르기',
        body: '영문만 있는 오류 화면, URL, 소스 코드, 인쇄물은 영문을 고르세요. 한글만 있는 안내문·서류는 한글이 알맞습니다. 한글 본문에 영문 상품명, 숫자, 웹 주소가 섞인 사진은 한글 + 영문을 고르면 두 문자 체계를 함께 인식합니다. 혼합은 두 언어 모델을 모두 불러오므로 처음에는 더 오래 걸리고, 실제로 한 언어만 뚜렷한 사진에서는 단일 언어보다 판단이 덜 명확할 수 있습니다.\n\nJPG·PNG·WebP·BMP 사진을 한 번에 1장씩, 파일 크기 20MB와 2,400만 픽셀까지 처리합니다. 이는 사진 형식의 한도가 아니라 휴대폰과 노트북 브라우저가 멈추지 않도록 정한 안전 기준입니다. 1,200만 화소 휴대폰 사진은 이 범위에 들어갑니다. HEIC 사진은 먼저 관련 도구인 HEIC → JPG 변환으로 JPG로 바꾼 뒤 사용하세요.',
      },
      {
        heading: '사진 글자를 더 또렷하게 인식시키는 방법',
        body: 'OCR은 선명하고 대비가 높으며 정면에서 찍은 인쇄 글자에 가장 잘 맞습니다. 필요한 부분만 잘라 낸 화면 캡처는 메뉴, 아이콘, 장식 배경이 빠져 전체 화면보다 더 깨끗하게 읽히는 경우가 많습니다. 종이를 사진으로 찍을 때는 글자가 화면을 충분히 채우게 하고, 반사광·그림자를 피하며, 카메라를 종이와 평행하게 두세요. 큰 글자와 한 단으로 된 문서는 작은 글자·복잡한 표·여러 단 문서보다 읽는 순서가 안정적입니다.\n\n흘림체 손글씨, 저해상도 사진, 장식 글꼴, 반사, 기울어진 문서는 오인식이 생길 수 있습니다. 신뢰도는 이미지 전체에 대한 엔진의 추정치라서 모든 단어가 맞는다는 뜻은 아닙니다. 복사하기 전에 결과 상자에서 직접 고치면 복사본과 TXT 파일에도 수정한 내용이 반영됩니다. 선택 가능한 글자가 이미 들어 있는 디지털 PDF라면 OCR 대신 PDF 텍스트 추출을 쓰는 편이 정확합니다.',
      },
    ],
    faq: [
      {
        q: '사진 파일이 서버에 업로드되나요?',
        a: '아니요. 사진 글자 인식은 현재 기기의 브라우저에서 WebAssembly 워커로 실행됩니다. 이미지가 Betterbit 서버나 외부 OCR API로 전송되지는 않으며, 워커·엔진·한글·영문 언어 데이터는 이 사이트에서 제공합니다.',
      },
      {
        q: '어떤 사진 파일에서 글자를 추출할 수 있나요?',
        a: 'JPG/JPEG, PNG, WebP, BMP 이미지 1장을 지원합니다. 브라우저가 원활하게 처리하도록 파일 크기는 20MB, 이미지 크기는 2,400만 픽셀까지로 제한합니다. 스크린샷, 스캔본, 대부분의 JPG 카메라 사진에 맞는 범위입니다.',
      },
      {
        q: '한글, 영문, 한글 + 영문 중 무엇을 골라야 하나요?',
        a: '사진에 실제로 쓰인 언어 하나를 고르는 것이 보통 더 빠르고 정확합니다. 한글 문서에 영문 제품명·URL 등이 함께 있으면 한글 + 영문을 고르세요. 혼합 모드는 두 언어 모델을 불러오기 때문에 첫 실행 시간이 더 길 수 있습니다.',
      },
      {
        q: '처음 사진을 읽을 때 왜 더 오래 걸리나요?',
        a: '처음 선택한 언어는 OCR 엔진과 해당 언어의 인식 데이터를 이 사이트에서 브라우저로 받아야 합니다. 브라우저가 이 파일들을 캐시하면 같은 언어를 다음에 쓸 때는 준비 작업이 줄어들 수 있습니다.',
      },
      {
        q: '손글씨나 표도 원래 모양대로 추출되나요?',
        a: '이 도구는 인쇄 글자와 선명한 화면 캡처에 가장 잘 맞습니다. 손글씨도 시도할 수 있지만 결과를 반드시 검토해야 합니다. 출력은 편집 가능한 일반 텍스트이므로 표 칸, 다단, 글꼴, 원래 배치는 보존되지 않습니다.',
      },
    ],
    ui: {
      dropTitle: '사진을 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: 'JPG, PNG, WebP, BMP · 화면 캡처 붙여넣기도 가능합니다',
      remove: '삭제',
      unsupported: 'JPG, PNG, WebP, BMP 이미지 파일을 선택하세요.',
      fileSizeLimit: '이 이미지는 브라우저 안전 제한인 20MB를 넘습니다.',
      pixelSizeLimit: '이 이미지는 2,400만 픽셀을 넘어 이 도구의 브라우저 안전 제한을 넘습니다.',
      unreadable: '이 브라우저에서 이 이미지 파일을 읽을 수 없습니다.',
      failed: '이 이미지에서 글자를 읽지 못했습니다. 더 선명한 이미지나 다른 인식 언어로 시도하세요.',
      starting: '기기 안에서 OCR 준비 중',
      model: '선택한 언어 데이터 불러오는 중',
      recognizing: '이미지 글자 읽는 중',
      progress: '{stage} · {percent}%',
      noText: '글자를 찾지 못했습니다. 인식 언어를 확인하고 더 선명하고 똑바른 이미지로 시도하세요.',
      resultReady: '이름, 숫자, 금액은 복사하기 전에 수정 가능한 결과에서 다시 확인하세요.',
      resultLabel: '추출한 글자',
      resultHint: '잘못 읽힌 글자를 고친 뒤 복사하거나 UTF-8 텍스트로 저장하세요.',
      resultPlaceholder: '인식한 글자가 여기에 표시됩니다.',
      copy: '글자 복사',
      copied: '복사됨',
      download: 'TXT 저장',
      languageLabel: '사진 속 언어',
      languageHint: '사진에 있는 언어 하나만 고르면 보통 더 빠르고 정확합니다.',
      english: '영문',
      korean: '한글',
      mixed: '한글 + 영문',
      privacyNote: '사진은 이 브라우저에서만 인식합니다. OCR을 위해 업로드하지 않습니다.',
      characters: '글자 수',
      confidence: '신뢰도',
      limitNote: '한 번에 이미지 1장, 20MB·2,400만 픽셀까지 처리합니다. 처음 쓰는 언어의 모델은 그때 불러옵니다.',
    },
  },
};

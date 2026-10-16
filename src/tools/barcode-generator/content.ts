import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  formatLabel: 'Barcode format',
  code128: 'Code 128',
  ean13: 'EAN-13',
  valueLabel: 'Value to encode',
  code128Hint: 'Printable ASCII only (spaces through ~), up to 80 characters.',
  ean13Hint: 'Enter 12 digits to calculate the final check digit, or 13 digits to verify it.',
  valuePlaceholder: 'ITEM-2026-001',
  moduleWidthLabel: 'Bar width',
  heightLabel: 'Bar height',
  showValue: 'Show the value below the bars',
  privacyNote: 'The value is encoded in this browser. Your last settings are saved only in this browser.',
  previewHeading: 'Barcode preview',
  previewAlt: 'Generated barcode',
  previewEmpty: 'Enter a valid value to preview the barcode.',
  encodedValue: 'Encoded value',
  moduleCount: 'Bar modules',
  downloadSvg: 'Download SVG',
  copySvg: 'Copy SVG',
  copiedSvg: 'SVG copied',
  emptyError: 'Enter a value to make a barcode.',
  tooLongError: 'Code 128 is limited to 80 printable characters here so labels stay practical to scan.',
  unsupportedCharacterError:
    'Code 128 in this tool accepts printable ASCII only. Use an ASCII SKU, label, or identifier.',
  eanLengthError: 'EAN-13 needs exactly 12 digits (to add the check digit) or 13 digits (to verify it).',
  eanCheckDigitError:
    'The final EAN-13 check digit does not match the first 12 digits. Check the number or enter only 12 digits.',
  pixels: 'px',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Barcode Generator — EAN-13 & Code 128 SVG',
    description:
      'Create a Code 128 or EAN-13 barcode in your browser. Verify EAN check digits automatically, preview it live, then download or copy a crisp SVG label.',
    h1: 'Barcode Generator',
    tagline:
      'Make a live Code 128 or EAN-13 barcode locally, with check-digit validation and a sharp SVG ready to download or copy.',
    name: 'Barcode Generator',
    keywords: [
      'barcode generator',
      'barcode maker',
      'EAN-13 generator',
      'Code 128 generator',
      'barcode SVG',
      'create barcode',
    ],
    howTo: [
      'Choose Code 128 for an internal ASCII SKU or EAN-13 for a retail number you already own.',
      'Enter the value. For EAN-13, enter 12 digits to add its check digit automatically, or 13 digits to verify it.',
      'Set the bar width and height, and choose whether to print the human-readable value below the bars.',
      'Inspect the live preview, then download its SVG or copy the SVG markup into a document or web page.',
      'Print one sample at final size and scan it before making a larger run of labels.',
    ],
    sections: [
      {
        heading: 'Choose Code 128 for internal labels and EAN-13 for retail numbers',
        body: 'Code 128-B in this generator accepts printable ASCII characters from space (32) through tilde (126), so it suits inventory IDs, shelf locations, shipping references, and asset tags. It is deliberately limited to 80 characters because a very dense one-dimensional symbol is difficult to scan on a small label. EAN-13 is a fixed 13-digit retail symbology. This tool can draw an EAN-13 from any valid number, but it does not issue a GS1 company prefix or give a number the right to be sold at a retail checkout.',
      },
      {
        heading: 'EAN-13 uses a weighted check digit',
        body: 'For the first 12 EAN-13 digits, count from the left and multiply alternating digits by 1 and 3. Add those products, then choose the amount needed to reach the next multiple of 10; that amount is the thirteenth digit. For example, 590123412345 produces 7, making 5901234123457. Hyphens and spaces are ignored while you enter an EAN. A full 13-digit value with a mismatched final digit is stopped before a barcode is rendered, which helps prevent a valid-looking but incorrect label.',
      },
      {
        heading: 'Keep the quiet zone and use SVG for print',
        body: 'A scanner needs clear space before and after the bars to find the symbol. Every SVG from this tool includes a white quiet zone equal to 10 narrow modules on both sides; do not crop it away or place dark artwork against it. SVG is a vector file, so the bars stay sharp when a layout app changes the size. Keep bars dark on a light background, avoid stretching only one dimension, and test-scan the final printed label because printer dots and label material affect reliability.',
      },
    ],
    faq: [
      {
        q: 'Can I create an EAN-13 barcode from 12 digits?',
        a: 'Yes. Enter exactly 12 numeric digits and this generator calculates and appends the thirteenth EAN-13 check digit. If you enter all 13 digits, the final digit is verified before the SVG is rendered.',
      },
      {
        q: 'Can this tool assign a retail barcode number?',
        a: 'No. This generator draws a barcode for a number you provide; it does not assign a GS1 company prefix or register a GTIN. A code can scan correctly yet still be unsuitable for retail if the number was not issued to your business.',
      },
      {
        q: 'Why does Code 128 reject Korean text or emoji?',
        a: 'This generator uses Code 128-B, which represents printable ASCII characters with values 32 through 126. Use English letters, numbers, spaces, and ASCII punctuation for an internal identifier, or use a QR code when you need Korean text or emoji.',
      },
      {
        q: 'Why should I download SVG instead of a screenshot?',
        a: 'SVG preserves each bar as a vector rectangle, so it can be resized for a label without fuzzy interpolation. The download also keeps a 10-module white quiet zone on each side, which a cropped screenshot can accidentally remove.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '바코드 생성기 — EAN-13·CODE128 SVG 만들기',
    description:
      'EAN-13 또는 CODE128 바코드를 브라우저에서 바로 만듭니다. EAN 검사 숫자를 자동 확인하고, 실시간 미리보기 뒤 선명한 SVG를 저장하거나 복사할 수 있습니다.',
    h1: '바코드 생성기',
    tagline: 'EAN-13 검사 숫자를 확인하고 CODE128·EAN-13 바코드를 기기 안에서 바로 만들어 SVG로 저장하거나 복사합니다.',
    name: '바코드 생성기',
    keywords: ['바코드 생성기', '바코드 만들기', 'ean13 바코드', 'ean-13 생성', 'code128 바코드', '바코드 svg'],
    howTo: [
      '사내 재고·자산 번호에는 CODE128을, 이미 발급받은 유통 상품 번호에는 EAN-13을 고릅니다.',
      '값을 입력합니다. EAN-13은 숫자 12자리를 넣으면 검사 숫자를 붙이고, 13자리를 넣으면 마지막 숫자를 확인합니다.',
      '막대 굵기와 높이를 정하고 막대 아래에 사람이 읽을 값을 표시할지 고릅니다.',
      '실시간 미리보기를 확인한 뒤 SVG를 저장하거나 SVG 코드를 복사해 문서나 웹페이지에 넣습니다.',
      '많이 인쇄하기 전 최종 크기로 한 장을 출력해 실제 스캐너나 휴대폰으로 읽어 봅니다.',
    ],
    sections: [
      {
        heading: '사내용은 CODE128, 유통 상품 번호는 EAN-13',
        body: '이 도구의 CODE128-B는 공백(문자 코드 32)부터 물결표(126)까지의 인쇄 가능한 ASCII 문자를 담습니다. 영문·숫자·기호로 된 재고 번호, 보관 위치, 배송 참조 번호, 자산 라벨에 알맞습니다. 작은 라벨에서도 읽을 수 있게 최대 80자로 제한합니다. EAN-13은 숫자 13자리로 고정된 유통용 형식입니다. 이 도구는 유효한 번호를 바코드 그림으로 만들 뿐, GS1 업체 코드나 판매용 GTIN을 발급하지는 않습니다.',
      },
      {
        heading: 'EAN-13의 마지막 한 자리는 검사 숫자입니다',
        body: 'EAN-13 앞 12자리는 왼쪽부터 번갈아 1과 3을 곱해 모두 더합니다. 그 합을 다음 10의 배수로 만들기 위해 필요한 값이 13번째 검사 숫자입니다. 예를 들어 590123412345의 검사 숫자는 7이므로 완성값은 5901234123457입니다. 입력 중 공백과 하이픈은 무시합니다. 13자리를 모두 넣었는데 마지막 숫자가 틀리면, 그럴듯해 보이지만 잘못된 라벨을 만들지 않도록 미리보기를 표시하지 않습니다.',
      },
      {
        heading: '흰 여백을 남기고 인쇄에는 SVG를 쓰세요',
        body: '스캐너는 막대의 시작과 끝을 찾기 위해 양쪽의 빈 여백이 필요합니다. 이 도구가 만드는 SVG에는 좁은 막대 10개 폭의 흰 여백을 좌우에 넣습니다. 이 부분을 자르거나 어두운 그림을 바짝 붙이지 마세요. SVG는 막대를 벡터 도형으로 저장하므로 편집 프로그램에서 크기를 바꿔도 흐려지지 않습니다. 어두운 막대와 밝은 바탕을 유지하고, 가로세로 비율을 따로 늘리지 말며, 프린터·용지에 따라 인식성이 달라질 수 있으니 최종 인쇄물을 읽어 확인하세요.',
      },
    ],
    faq: [
      {
        q: '숫자 12자리로 EAN-13 바코드를 만들 수 있나요?',
        a: '네. 숫자 12자리를 입력하면 이 도구가 13번째 EAN-13 검사 숫자를 계산해 붙입니다. 13자리를 모두 입력한 경우에는 마지막 숫자가 앞 12자리와 맞는지 먼저 확인한 뒤 SVG를 만듭니다.',
      },
      {
        q: '이 도구로 상품용 바코드 번호도 받을 수 있나요?',
        a: '아니요. 이 도구는 입력한 번호의 바코드 이미지를 그릴 뿐 GS1 업체 코드나 GTIN을 발급·등록하지 않습니다. 바코드가 스캔되더라도 번호를 정식으로 발급받지 않았다면 매장 판매용으로 쓸 수 없습니다.',
      },
      {
        q: 'CODE128에 한글이나 이모지를 넣을 수 없는 이유는 무엇인가요?',
        a: '이 도구는 문자 코드 32부터 126까지의 인쇄 가능한 ASCII를 담는 CODE128-B를 사용합니다. 사내 번호는 영문·숫자·공백·ASCII 기호로 만들고, 한글이나 이모지를 담아야 하면 QR코드를 사용하세요.',
      },
      {
        q: '스크린샷보다 SVG를 저장하는 편이 좋은 이유는 무엇인가요?',
        a: 'SVG는 각 막대를 벡터 사각형으로 저장하므로 라벨 크기로 바꿔도 픽셀이 번져 인식이 나빠지지 않습니다. 내려받는 파일에는 스크린샷에서 잘리기 쉬운 좌우 10모듈의 흰 여백도 포함됩니다.',
      },
    ],
    ui: {
      formatLabel: '바코드 형식',
      code128: 'CODE128',
      ean13: 'EAN-13',
      valueLabel: '바코드에 넣을 값',
      code128Hint: '공백부터 ~까지의 인쇄 가능한 ASCII, 최대 80자',
      ean13Hint: '숫자 12자리는 검사 숫자를 계산하고, 13자리는 검사 숫자를 확인합니다.',
      valuePlaceholder: 'ITEM-2026-001',
      moduleWidthLabel: '막대 굵기',
      heightLabel: '막대 높이',
      showValue: '막대 아래에 값 표시',
      privacyNote: '입력한 값은 이 브라우저에서만 바코드로 바뀝니다. 마지막 설정도 이 브라우저에만 저장됩니다.',
      previewHeading: '바코드 미리보기',
      previewAlt: '생성된 바코드',
      previewEmpty: '유효한 값을 입력하면 바코드를 미리 볼 수 있습니다.',
      encodedValue: '인코딩된 값',
      moduleCount: '막대 모듈',
      downloadSvg: 'SVG 저장',
      copySvg: 'SVG 복사',
      copiedSvg: 'SVG를 복사했습니다',
      emptyError: '바코드를 만들 값을 입력하세요.',
      tooLongError: '작은 라벨에서도 읽을 수 있도록 이 도구의 CODE128은 인쇄 가능한 문자 80자로 제한합니다.',
      unsupportedCharacterError:
        '이 도구의 CODE128은 인쇄 가능한 ASCII만 지원합니다. 영문 SKU·라벨·식별자를 입력하세요.',
      eanLengthError: 'EAN-13은 검사 숫자를 붙일 숫자 12자리 또는 검사할 숫자 13자리가 필요합니다.',
      eanCheckDigitError: 'EAN-13 마지막 검사 숫자가 앞 12자리와 맞지 않습니다. 번호를 확인하거나 12자리만 입력하세요.',
      pixels: 'px',
    },
  },
};

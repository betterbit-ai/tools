import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop an image here, click to choose, or paste',
  dropHint: 'One image at a time · JPG, PNG, WebP, GIF, SVG and more · up to 25 MB',
  privacyNote: 'The image is read and encoded in this browser. Nothing is uploaded.',
  reading: 'Reading image…',
  notImage: 'Choose an image file such as PNG, JPG, WebP, GIF, SVG, AVIF or HEIC.',
  tooLarge: 'This image is larger than 25 MB. Resize or compress it first.',
  readFailed: 'This image could not be read. Try another file.',
  clear: 'Clear image',
  outputFormat: 'Copy format',
  formatDataUri: 'Data URI',
  formatBase64: 'Base64',
  formatHtml: 'HTML',
  formatCss: 'CSS',
  altText: 'Image description (alt text)',
  altHint: 'Included in the HTML snippet. Describe the image for people using screen readers.',
  cssClass: 'CSS class name',
  cssHint: 'Included in the CSS snippet. Unsafe characters are changed to hyphens.',
  output: 'Ready-to-copy code',
  copy: 'Copy code',
  copied: 'Copied',
  copyFailed: 'Copying failed. Select the code and copy it manually.',
  sourceSize: 'Original size',
  encodedSize: 'Base64 size',
  characters: 'Output characters',
  type: 'MIME type',
  sizeIncrease: '+{percent}% as Base64',
  preview: 'Image preview',
  previewUnavailable: 'This format cannot be previewed in this browser, but its bytes can still be encoded.',
  inlineTip: 'Base64 is best for small icons and self-contained files; large images add about one third more data.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Image to Base64 — Data URI, HTML & CSS Snippets',
    description:
      'Convert an image to Base64 in your browser, then copy a Data URI, raw Base64, accessible HTML, or CSS with your own selector. The file stays on your device.',
    h1: 'Image to Base64',
    tagline:
      'Turn one image into a copy-ready Data URI, HTML tag, CSS rule, or raw Base64 — with editable labels for your code.',
    name: 'Image to Base64',
    keywords: [
      'image to base64',
      'image base64 encoder',
      'image to data uri',
      'base64 image html',
      'base64 image css',
      'data url generator',
    ],
    howTo: [
      'Drop an image, choose one from your device, or paste a screenshot with Ctrl/⌘ + V.',
      'Choose Data URI, Base64, HTML, or CSS under Copy format.',
      'For HTML, write useful alt text; for CSS, set the class name you want in your stylesheet.',
      'Check the original and encoded sizes, then use Copy code to put the exact result on your clipboard.',
    ],
    sections: [
      {
        heading: 'What each output includes',
        body: 'Raw Base64 contains only the encoded file bytes and is useful when an API takes a separate MIME type. A Data URI adds the media type and the `data:image/...;base64,` prefix, so it can go directly in an image `src` value. The HTML option produces an `<img>` element with your editable alt text. The CSS option produces a class selector and `background-image` declaration, so you can paste it into a stylesheet without replacing placeholder names afterward.',
      },
      {
        heading: 'Why the encoded value is larger',
        body: 'Base64 maps every complete group of 3 input bytes to 4 text characters. Its length is therefore `4 × ceil(bytes ÷ 3)`, plus the short Data URI or snippet wrapper when you choose one. That is usually about 33% more than the original image bytes. The tool shows the actual encoded size and character count for the selected file instead of estimating from its pixels.',
      },
      {
        heading: 'When to use a Data URI',
        body: 'RFC 2397 defines the `data:[media type];base64,...` URL form for embedding small data items directly where a URL is expected. It is practical for a small icon, a self-contained HTML demo, or an API payload. Avoid inlining a large photo in a webpage or stylesheet: the extra Base64 bytes make that document larger, and the image cannot be cached as a separate resource. This converter only reads the original bytes; it does not resize, recompress, or remove metadata.',
      },
    ],
    faq: [
      {
        q: 'Does this upload my image?',
        a: 'No. The selected image is read with your browser’s FileReader API and converted on your device; no image bytes are sent to a Betterbit server.',
      },
      {
        q: 'What is the difference between Base64 and a Data URI?',
        a: 'Raw Base64 is only the encoded bytes, while a Data URI adds a prefix such as `data:image/png;base64,` so a browser can use the value directly as an image URL.',
      },
      {
        q: 'Why is a Base64 image about 33% larger?',
        a: 'Base64 represents every 3 original bytes with 4 ASCII characters, so the encoded data is typically one third larger before the Data URI, HTML, or CSS wrapper is added.',
      },
      {
        q: 'Does converting an image to Base64 change its quality?',
        a: 'No. Base64 is a reversible representation of the same file bytes, so this tool does not resize, recompress, or change pixels, metadata, animation, or transparency.',
      },
      {
        q: 'What should I put in the HTML alt text?',
        a: 'Use a short description of the image’s purpose or content, such as “Blue Betterbit logo”; leave it empty only when the image is purely decorative and your surrounding HTML handles that deliberately.',
      },
      {
        q: 'Can I encode a 25 MB image?',
        a: 'Yes. This page accepts one image up to 25 MB, which becomes roughly 33.3 MB of Base64 before the selected Data URI, HTML, or CSS wrapper is added; larger images can make a browser slow or memory-hungry.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '이미지 Base64 변환 — Data URI·HTML·CSS 코드',
    description:
      '이미지를 브라우저에서 Base64로 바꾸고 Data URI, 순수 Base64, 접근성 있는 HTML, 원하는 선택자의 CSS 코드를 바로 복사하세요. 파일은 기기 밖으로 나가지 않습니다.',
    h1: '이미지 Base64 변환',
    tagline:
      '이미지 한 장을 Data URI, HTML 태그, CSS 규칙, 순수 Base64로 바꾸고 코드에 맞는 설명과 선택자까지 직접 정합니다.',
    name: '이미지 Base64 변환',
    keywords: [
      '이미지 base64 변환',
      '사진 base64 변환',
      '이미지 data uri',
      'base64 이미지 html',
      'base64 이미지 css',
      '이미지 인코딩',
    ],
    howTo: [
      '이미지를 끌어다 놓거나, 기기에서 고르거나, Ctrl/⌘ + V로 스크린샷을 붙여넣습니다.',
      '복사 형식에서 Data URI, Base64, HTML, CSS 중 필요한 것을 고릅니다.',
      'HTML에는 이미지 설명을, CSS에는 스타일시트에서 쓸 클래스 이름을 입력합니다.',
      '원본과 인코딩 뒤 용량을 확인한 다음 코드 복사를 눌러 정확한 결과를 클립보드에 넣습니다.',
    ],
    sections: [
      {
        heading: '형식별로 어디에 붙일까',
        body: '순수 Base64는 MIME 타입을 따로 받는 API에 알맞습니다. Data URI는 `data:image/...;base64,` 접두어까지 포함하므로 이미지 `src` 값에 바로 넣을 수 있습니다. HTML 형식은 직접 쓴 대체 텍스트가 들어간 `<img>` 태그를 만듭니다. CSS 형식은 클래스 선택자와 `background-image` 선언을 함께 만들어, 코드를 붙인 뒤 이름을 다시 고치는 일을 줄입니다.',
      },
      {
        heading: 'Base64로 바꾸면 얼마나 커질까',
        body: 'Base64는 원본 3바이트 묶음을 문자 4개로 표현합니다. 따라서 길이는 `4 × ceil(바이트 ÷ 3)`이고, Data URI나 코드 형식을 고르면 짧은 접두어·태그가 더해집니다. 대체로 원본보다 약 33% 커집니다. 이 도구는 픽셀 수로 추정하지 않고 선택한 파일의 실제 인코딩 용량과 글자 수를 보여 줍니다.',
      },
      {
        heading: 'Data URI를 쓰기 좋은 경우',
        body: 'RFC 2397은 URL이 필요한 자리에 작은 데이터를 직접 넣는 `data:[미디어 타입];base64,...` 형식을 정의합니다. 작은 아이콘, 파일 하나로 끝나는 HTML 예제, API 요청 본문에는 편리합니다. 다만 큰 사진을 웹페이지나 CSS에 넣으면 Base64로 늘어난 용량만큼 문서가 커지고 이미지를 별도 리소스로 캐시할 수도 없습니다. 이 도구는 원본 바이트만 읽으므로 크기를 바꾸거나 다시 압축하지 않고, 메타데이터도 그대로 유지합니다.',
      },
    ],
    faq: [
      {
        q: '이미지가 서버에 업로드되나요?',
        a: '아니요. 선택한 이미지는 브라우저의 FileReader API로 내 기기에서 읽고 변환합니다. 이미지 바이트가 Betterbit 서버로 전송되지 않습니다.',
      },
      {
        q: 'Base64와 Data URI는 무엇이 다른가요?',
        a: '순수 Base64는 인코딩한 바이트만 담고, Data URI는 `data:image/png;base64,` 같은 접두어를 더해 브라우저가 이미지 URL처럼 바로 쓸 수 있게 합니다.',
      },
      {
        q: 'Base64로 바꾸면 왜 약 33% 커지나요?',
        a: 'Base64는 원본 3바이트를 ASCII 문자 4개로 표현하기 때문에 인코딩 데이터가 보통 3분의 1가량 커집니다. Data URI, HTML, CSS의 접두어와 태그는 그 뒤에 추가됩니다.',
      },
      {
        q: '이미지를 Base64로 바꾸면 화질이 떨어지나요?',
        a: '아니요. Base64는 같은 파일 바이트를 되돌릴 수 있는 텍스트 표현일 뿐입니다. 이 도구는 리사이즈나 재압축을 하지 않아 픽셀, 메타데이터, 애니메이션, 투명도를 바꾸지 않습니다.',
      },
      {
        q: 'HTML의 alt 텍스트에는 무엇을 써야 하나요?',
        a: '이미지의 목적이나 내용을 짧게 설명합니다. 예를 들어 “파란색 Betterbit 로고”처럼 쓰고, 장식용 이미지일 때만 주변 HTML의 접근성 처리를 확인한 뒤 비워 둡니다.',
      },
      {
        q: '25 MB 이미지도 Base64로 바꿀 수 있나요?',
        a: '네. 이 페이지는 한 장당 25 MB까지 받습니다. Base64는 코드 접두어와 태그를 더하기 전에도 약 33.3 MB가 되므로, 더 큰 파일은 브라우저의 메모리를 많이 쓰고 느려질 수 있습니다.',
      },
    ],
    ui: {
      dropTitle: '이미지를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: '한 번에 한 장 · JPG, PNG, WebP, GIF, SVG 등 · 최대 25 MB',
      privacyNote: '이미지는 이 브라우저에서 읽고 변환합니다. 어디에도 업로드되지 않습니다.',
      reading: '이미지 읽는 중…',
      notImage: 'PNG, JPG, WebP, GIF, SVG, AVIF, HEIC 등 이미지 파일을 선택하세요.',
      tooLarge: '이미지가 25 MB보다 큽니다. 먼저 크기를 줄이거나 압축하세요.',
      readFailed: '이미지를 읽지 못했습니다. 다른 파일로 다시 시도하세요.',
      clear: '이미지 지우기',
      outputFormat: '복사 형식',
      formatDataUri: 'Data URI',
      formatBase64: 'Base64',
      formatHtml: 'HTML',
      formatCss: 'CSS',
      altText: '이미지 설명(대체 텍스트)',
      altHint: 'HTML 코드에 들어갑니다. 스크린 리더 사용자를 위해 이미지 내용을 설명하세요.',
      cssClass: 'CSS 클래스 이름',
      cssHint: 'CSS 코드에 들어갑니다. 쓸 수 없는 문자는 하이픈으로 바뀝니다.',
      output: '바로 복사할 코드',
      copy: '코드 복사',
      copied: '복사됨',
      copyFailed: '복사하지 못했습니다. 코드를 선택해서 직접 복사하세요.',
      sourceSize: '원본 용량',
      encodedSize: 'Base64 용량',
      characters: '결과 글자 수',
      type: 'MIME 타입',
      sizeIncrease: 'Base64 변환 시 +{percent}%',
      preview: '이미지 미리보기',
      previewUnavailable: '이 브라우저에서 미리볼 수 없는 형식이지만, 바이트는 Base64로 바꿀 수 있습니다.',
      inlineTip:
        'Base64는 작은 아이콘이나 한 파일로 끝나는 문서에 알맞습니다. 큰 이미지는 데이터가 약 3분의 1 더 늘어납니다.',
    },
  },
};

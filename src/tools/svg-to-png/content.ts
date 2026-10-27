import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop an SVG here, click to choose, or paste',
  dropHint: 'SVG files stay in this browser',
  source: 'SVG code',
  sourceHint: 'Paste SVG markup directly when the file is in a design tool or a code editor.',
  sourcePlaceholder: '<svg viewBox="0 0 24 24">…</svg>',
  privacyNote: 'SVG and PNG data are processed in your browser. Nothing is uploaded.',
  invalidSvg: 'Paste SVG markup beginning with an <svg> element, or choose an SVG file.',
  readFailed: 'This SVG file could not be read. Choose it again or paste its SVG code.',
  renderFailed: 'This SVG could not be rendered as a PNG. Check that its markup is valid and try again.',
  rendering: 'Rendering PNG preview…',
  externalResources:
    'External images, fonts and styles were omitted so this SVG stays local. Embed them as data URLs or convert text to paths.',
  resizeBy: 'Output size',
  modeScale: 'Scale',
  modeWidth: 'Width',
  scale: 'Scale',
  scaleHint: 'Higher scale redraws the vector at more pixels; it does not enlarge an existing bitmap.',
  scale1: '1×',
  scale2: '2×',
  scale3: '3×',
  scale4: '4×',
  width: 'Output width (px)',
  widthHint: 'Height is calculated from the SVG’s original proportions.',
  background: 'Background',
  backgroundHint: 'PNG supports transparency. Use white only when the destination does not.',
  backgroundTransparent: 'Transparent',
  backgroundWhite: 'White',
  sourceSize: 'SVG size',
  outputSize: 'PNG size',
  fallbackSize: 'The SVG has no fixed size or viewBox, so the preview uses a 512 × 512 px canvas.',
  limitHint: 'Output is limited to 8,192 px on either side and 32 megapixels to keep browser memory predictable.',
  tooLarge: 'Choose a smaller output size. The maximum is 8,192 px on either side and 32 megapixels total.',
  previewAlt: 'PNG preview',
  download: 'Download PNG',
  downloadHint: 'Saves as {name}',
  clear: 'Clear',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'SVG to PNG Converter — Scale, Transparent, No Upload',
    description:
      'Convert SVG to PNG in your browser. Paste code or drop a file, choose 1×–4× scale or an exact width, and keep a transparent background.',
    h1: 'SVG to PNG Converter',
    tagline: 'Turn an SVG into a sharp PNG at an exact size — entirely in your browser.',
    name: 'SVG to PNG',
    keywords: ['svg to png', 'convert svg to png', 'svg png converter', 'svg rasterizer', 'svg export png'],
    howTo: [
      'Drop an SVG file into the box or paste SVG code from your editor.',
      'Choose 1×, 2×, 3× or 4× scale, or switch to Width and enter the final pixel width.',
      'Keep Transparent for logos and icons, or choose White when the destination cannot show transparency.',
      'Check the automatic preview and click Download PNG.',
    ],
    sections: [
      {
        heading: 'Scale controls the PNG pixel grid',
        body: 'SVG paths are vectors, but a PNG is a fixed pixel grid. At 2×, a 300 × 200 SVG becomes a 600 × 400 PNG; at 4× it becomes 1,200 × 800. The browser redraws the SVG at the requested canvas size rather than stretching a small bitmap, so choose the largest size you actually need before download. The converter caps output at 8,192 pixels on either side and 32 megapixels total to avoid unstable browser canvas allocations.',
      },
      {
        heading: 'Transparent PNG is the default',
        body: 'PNG supports an alpha channel, so transparent SVG areas remain transparent in the downloaded file. That is usually right for logos, icons and interface assets. Choose White only for a destination that cannot display transparency. The white option paints the canvas before the SVG is drawn; it does not change the SVG source.',
      },
      {
        heading: 'Why a linked font or image can be missing',
        body: 'For privacy and predictable output, this converter removes external images, web fonts and stylesheet URLs before rendering. Embed images as data URLs and convert important text to paths in your vector editor before exporting. Internal SVG references such as gradients with url(#gradient) are kept. Some advanced SVG features can also vary by browser because the browser itself performs the rasterisation.',
      },
    ],
    faq: [
      {
        q: 'Are SVG files uploaded when converting to PNG?',
        a: 'No. This SVG to PNG converter creates the preview and PNG with Canvas in your browser. The SVG file and its PNG output do not leave your device.',
      },
      {
        q: 'How do I make an SVG PNG sharper?',
        a: 'Choose 2×, 3× or 4× before downloading, or enter the final width in pixels. For example, a 512 px icon exported at 2× becomes a 1,024 px PNG drawn directly from the vector paths.',
      },
      {
        q: 'Does converting SVG to PNG keep a transparent background?',
        a: 'Yes. Transparent is the default and preserves PNG alpha. Select White only when the app or document receiving the PNG requires an opaque background.',
      },
      {
        q: 'What is the largest SVG PNG I can create here?',
        a: 'The converter accepts output up to 8,192 pixels wide or high and up to 32 megapixels in total. A square output is therefore limited by the 32-megapixel cap before the per-side cap.',
      },
      {
        q: 'Why are external SVG images or web fonts not in the PNG?',
        a: 'External resource URLs are removed before rendering so the conversion does not request data from another server. Embed images as data URLs and outline essential text before converting.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'SVG PNG 변환 — 배율·투명 배경, 업로드 없음',
    description:
      'SVG를 브라우저에서 PNG로 바로 변환합니다. 파일이나 코드를 넣고 1~4배 또는 정확한 가로 픽셀을 선택해 투명 배경 PNG로 저장하세요.',
    h1: 'SVG PNG 변환',
    tagline: 'SVG를 원하는 픽셀 크기의 선명한 PNG로 — 업로드 없이 브라우저에서 변환합니다.',
    name: 'SVG PNG 변환',
    keywords: ['svg png 변환', 'svg를 png로 변환', 'svg png 변환기', 'svg 이미지 변환', '벡터 png 변환'],
    howTo: [
      'SVG 파일을 끌어다 놓거나 편집기에서 SVG 코드를 복사해 붙여넣습니다.',
      '1배·2배·3배·4배를 고르거나 “가로”로 전환해 최종 픽셀 크기를 입력합니다.',
      '로고·아이콘은 “투명”을 유지하고, 투명도를 지원하지 않는 곳에 쓸 때만 “흰색”을 고릅니다.',
      '자동으로 만든 미리보기를 확인한 뒤 “PNG 다운로드”를 누릅니다.',
    ],
    sections: [
      {
        heading: '배율은 PNG 픽셀 수를 정합니다',
        body: 'SVG는 벡터 경로지만 PNG는 고정된 픽셀 격자입니다. 300 × 200 SVG를 2배로 저장하면 600 × 400 PNG가 되고, 4배로 저장하면 1,200 × 800 PNG가 됩니다. 작은 비트맵을 늘리는 대신 브라우저가 선택한 캔버스 크기로 SVG를 다시 그리므로, 다운로드 전에 필요한 가장 큰 크기를 고르세요. 브라우저 메모리를 안정적으로 쓰기 위해 한 변은 8,192px, 전체는 3,200만 화소로 제한합니다.',
      },
      {
        heading: '투명 PNG가 기본입니다',
        body: 'PNG는 알파 채널을 지원하므로 SVG의 투명한 부분이 결과 파일에서도 그대로 투명하게 남습니다. 로고, 아이콘, UI 이미지에는 보통 이 설정이 맞습니다. 투명도를 표시하지 못하는 문서나 서비스에 넣을 때만 흰색을 고르세요. 흰색 옵션은 SVG를 그리기 전에 캔버스에 흰색을 채울 뿐 원본 SVG를 바꾸지 않습니다.',
      },
      {
        heading: '외부 글꼴과 이미지가 빠질 수 있는 이유',
        body: '개인정보를 지키고 결과를 예측 가능하게 만들기 위해 외부 이미지, 웹 글꼴, 스타일시트 URL은 그리기 전에 제거합니다. 이미지 파일은 data URL로 포함하고, 중요한 글자는 벡터 편집기에서 패스로 변환한 뒤 저장하세요. url(#gradient)처럼 SVG 안을 가리키는 그라데이션 참조는 유지합니다. SVG 기능 지원 범위는 브라우저마다 조금씩 다를 수 있습니다.',
      },
    ],
    faq: [
      {
        q: 'SVG를 PNG로 변환하면 파일이 서버에 올라가나요?',
        a: '아니요. 이 도구는 브라우저의 Canvas로 미리보기와 PNG를 만들며 SVG 파일과 결과 PNG가 기기 밖으로 전송되지 않습니다.',
      },
      {
        q: 'SVG를 선명한 PNG로 저장하려면 어떻게 하나요?',
        a: '다운로드 전에 2배·3배·4배를 고르거나 최종 가로 픽셀을 직접 입력하세요. 예를 들어 512px 아이콘을 2배로 저장하면 벡터 경로에서 바로 그린 1,024px PNG가 만들어집니다.',
      },
      {
        q: 'SVG를 PNG로 바꾸면 투명 배경이 유지되나요?',
        a: '네. 기본값인 투명을 유지하면 PNG 알파 채널이 보존됩니다. 결과를 넣을 앱이나 문서가 투명도를 지원하지 않을 때만 흰색 배경을 선택하세요.',
      },
      {
        q: '여기서 만들 수 있는 최대 PNG 크기는 얼마인가요?',
        a: '가로 또는 세로는 최대 8,192px, 전체는 최대 3,200만 화소까지 만들 수 있습니다. 정사각형 출력은 한 변 제한보다 전체 화소 제한에 먼저 걸립니다.',
      },
      {
        q: 'SVG의 외부 이미지나 웹폰트가 PNG에서 보이지 않는 이유는 무엇인가요?',
        a: '변환 중 다른 서버에 요청이 나가지 않도록 외부 리소스 URL을 제거하기 때문입니다. 이미지는 data URL로 포함하고, 중요한 글자는 윤곽선 패스로 바꾼 뒤 변환하세요.',
      },
    ],
    ui: {
      dropTitle: 'SVG를 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: 'SVG 파일은 이 브라우저 안에서만 처리됩니다',
      source: 'SVG 코드',
      sourceHint: '디자인 도구나 코드 편집기에 있는 SVG 마크업을 바로 붙여넣을 수 있습니다.',
      sourcePlaceholder: '<svg viewBox="0 0 24 24">…</svg>',
      privacyNote: 'SVG와 PNG 데이터는 브라우저에서 처리됩니다. 어디에도 업로드되지 않습니다.',
      invalidSvg: '<svg> 요소로 시작하는 SVG 코드를 붙여넣거나 SVG 파일을 고르세요.',
      readFailed: 'SVG 파일을 읽지 못했습니다. 파일을 다시 고르거나 SVG 코드를 붙여넣으세요.',
      renderFailed: '이 SVG를 PNG로 그리지 못했습니다. 코드가 올바른지 확인한 뒤 다시 시도하세요.',
      rendering: 'PNG 미리보기 만드는 중…',
      externalResources:
        'SVG가 기기 안에 머물도록 외부 이미지·글꼴·스타일은 제외했습니다. data URL로 포함하거나 글자를 패스로 바꿔 다시 시도하세요.',
      resizeBy: '출력 크기',
      modeScale: '배율',
      modeWidth: '가로',
      scale: '배율',
      scaleHint: '배율을 높이면 벡터를 더 많은 픽셀로 다시 그립니다. 기존 비트맵을 늘리는 방식이 아닙니다.',
      scale1: '1배',
      scale2: '2배',
      scale3: '3배',
      scale4: '4배',
      width: '출력 가로 (px)',
      widthHint: '세로는 SVG 원본 비율에 맞춰 자동으로 계산합니다.',
      background: '배경',
      backgroundHint: 'PNG는 투명도를 지원합니다. 결과를 넣을 곳에서 투명도를 못 쓸 때만 흰색을 고르세요.',
      backgroundTransparent: '투명',
      backgroundWhite: '흰색',
      sourceSize: 'SVG 크기',
      outputSize: 'PNG 크기',
      fallbackSize: 'SVG에 고정 크기나 viewBox가 없어 512 × 512px 캔버스로 미리보기를 만듭니다.',
      limitHint: '브라우저 메모리를 안정적으로 쓰기 위해 한 변은 8,192px, 전체는 3,200만 화소까지 가능합니다.',
      tooLarge: '더 작은 출력 크기를 고르세요. 한 변 최대 8,192px, 전체 최대 3,200만 화소입니다.',
      previewAlt: 'PNG 미리보기',
      download: 'PNG 다운로드',
      downloadHint: '{name}(으)로 저장합니다',
      clear: '지우기',
    },
  },
};

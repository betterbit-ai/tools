import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  previewBlank: 'Live meme preview, blank canvas with no captions',
  previewImage: 'Live meme preview, uploaded image with no captions',
  previewWithCaptions: 'Live meme preview, captions: {captions}',
  blankCanvas: 'Blank 16:9 canvas',
  usingImage: 'Using image',
  dropTitle: 'Drop a photo here, click to choose, or paste',
  replaceTitle: 'Replace the current photo',
  dropHint: 'JPG, PNG, WebP, GIF, BMP and other browser-readable images',
  pasteHint: 'Paste an image from your clipboard:',
  pasteKeys: 'Ctrl/⌘ V',
  defaultTopText: 'WHEN YOU NEED A MEME',
  defaultBottomText: 'IN TEN SECONDS',
  unsupported: 'This image can’t be read by your browser. Try a JPG, PNG, or WebP file.',
  renderError: 'The preview could not be drawn. Try a smaller or different image.',
  downloadError: 'The meme could not be saved. Try a different image.',
  canvasLabel: 'Start with',
  canvasWide: 'Wide 16:9',
  canvasSquare: 'Square 1:1',
  topLabel: 'Top text',
  bottomLabel: 'Bottom text',
  captionHint: 'Up to 280 characters. New lines, Korean, CJK text and emoji wrap safely.',
  fontSizeLabel: 'Text size (%)',
  fontSizeHint: 'Percentage of the shorter image side (4–20%).',
  allCaps: 'Use uppercase for Latin text',
  download: 'Download PNG',
  downloadHint: 'No watermark. Your photo and caption stay in this browser.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Meme Generator — No Watermark, Private PNG Download',
    description:
      'Make a meme from your photo or a blank 16:9/square canvas. Add top and bottom captions, preview live, and download a watermark-free PNG without an account.',
    h1: 'Meme Generator',
    tagline: 'Add classic outlined captions to a photo or blank canvas — locally, with no watermark or sign-up.',
    name: 'Meme Generator',
    keywords: [
      'meme maker',
      'meme creator',
      'make a meme',
      'caption image',
      'image text generator',
      'no watermark meme',
    ],
    howTo: [
      'Start on the 16:9 or square blank canvas, or drop, choose, or paste a photo.',
      'Write a setup in Top text and a punchline in Bottom text; line breaks are kept exactly.',
      'Adjust the text size or turn off uppercase when you want to keep lowercase Latin text.',
      'Check the live preview and download the finished meme as a PNG with no watermark.',
    ],
    sections: [
      {
        heading: 'Two ready sizes, plus any photo you own',
        body: 'The blank wide canvas is 1200×675 pixels, a 16:9 ratio suited to a presentation slide or chat preview. The blank square canvas is 1080×1080 pixels, a common square-post size. Uploading a photo keeps its pixel dimensions in the exported PNG, so the tool does not quietly crop your image. The preview scales down only for the page.',
      },
      {
        heading: 'Keep captions readable on images',
        body: 'Classic image macros use large white letters with a dark outline because the outline separates text from both bright and dark parts of a photograph. Keep the premise and punchline short, and use a manual line break when a specific pause matters. This generator wraps long English words and CJK text by grapheme cluster, so Korean syllables, emoji, and combined characters are not cut in half.',
      },
      {
        heading: 'A static image editor, not a template library',
        body: 'This tool deliberately handles still-image memes: an image, two caption areas, and a PNG download. It does not include a borrowed meme-template catalogue, AI caption service, video editor, or public gallery. That keeps the page quick and lets your photo and text remain in the browser instead of being sent to an editing service.',
      },
    ],
    faq: [
      {
        q: 'Does this meme generator add a watermark?',
        a: 'No. The downloaded PNG contains only your source image or blank canvas and the two captions you set. Betterbit does not add a logo, account label, or watermark to the result.',
      },
      {
        q: 'Are my photo and captions uploaded anywhere?',
        a: 'No. The photo is decoded and drawn with the Canvas API in your browser, and the PNG download is created on the same device. The tool has no upload endpoint or account requirement.',
      },
      {
        q: 'Can I make a Korean meme or use emoji?',
        a: 'Yes. The caption fields accept Korean, other CJK text, emoji, and manual line breaks. The renderer uses the device’s Korean-capable system-font fallback and wraps text by grapheme cluster so emoji and combined characters stay intact.',
      },
      {
        q: 'What size is the blank square meme canvas?',
        a: 'The square preset exports at 1080×1080 pixels. The wide preset exports at 1200×675 pixels, which is a 16:9 ratio. A photo upload instead exports at that photo’s original pixel dimensions.',
      },
      {
        q: 'Why does the result download as PNG?',
        a: 'PNG keeps the text outline sharp and avoids additional JPEG compression. The current tool always exports one PNG, so a source JPG may create a larger downloaded file than the original photograph.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '짤 만들기 — 워터마크 없이 사진에 한글 텍스트 넣기',
    description:
      '사진이나 빈 캔버스에 위·아래 문구를 넣어 짤을 만드세요. 한글·이모지를 자연스럽게 줄바꿈하고, 가입·워터마크·업로드 없이 PNG로 바로 저장합니다.',
    h1: '짤 만들기',
    tagline: '사진에 위·아래 문구를 바로 얹고, 한글이 깨지지 않는 PNG 짤을 내 기기에서 만듭니다.',
    name: '짤 만들기',
    keywords: ['밈 만들기', '밈 생성기', '짤 생성기', '사진에 글씨 넣기', '사진 문구 넣기', '웃긴 짤 만들기'],
    howTo: [
      '16:9 또는 정사각형 빈 캔버스에서 시작하거나, 사진을 끌어다 놓고 선택하거나 붙여넣습니다.',
      '위 문구에 상황을, 아래 문구에 반전이나 결론을 입력합니다. 줄바꿈도 그대로 반영됩니다.',
      '글자 크기를 조절하고, 영문 소문자를 살리고 싶으면 대문자 옵션을 끕니다.',
      '바로 바뀌는 미리보기를 확인한 뒤 워터마크 없는 PNG 파일로 다운로드합니다.',
    ],
    sections: [
      {
        heading: '빈 바탕은 16:9와 정사각형으로 바로 시작합니다',
        body: '가로형 빈 캔버스는 1200×675px(16:9)라 발표 자료나 메신저 미리보기에 쓰기 좋고, 정사각형 캔버스는 1080×1080px입니다. 사진을 올리면 다운로드 파일은 사진의 픽셀 크기를 그대로 사용하므로, 도구가 임의로 사진을 자르지 않습니다. 페이지의 미리보기만 화면 크기에 맞춰 줄어듭니다.',
      },
      {
        heading: '한글 짤은 문구를 짧게 나눠 씁니다',
        body: '이미지 밈의 흰 글자와 검은 외곽선은 사진의 밝은 부분과 어두운 부분 모두에서 문구를 읽기 쉽게 합니다. 위에는 상황, 아래에는 반전이나 결론을 짧게 두면 한눈에 읽힙니다. 이 도구는 띄어쓰기가 있는 문장은 단어 단위로, 긴 한글·중국어·일본어 문장은 글자 묶음 단위로 줄바꿈해 이모지나 결합 문자를 중간에서 자르지 않습니다.',
      },
      {
        heading: '이미지 짤에만 집중합니다',
        body: '이 도구는 사진 또는 빈 바탕, 위·아래 두 문구, PNG 다운로드에 집중합니다. 다른 사람이 올린 밈 템플릿 모음, AI 문구 생성, 동영상 편집, 공개 갤러리는 제공하지 않습니다. 덕분에 사진과 문구가 편집 서비스로 전송되지 않고, 필요한 화면만 빠르게 열립니다.',
      },
    ],
    faq: [
      {
        q: '만든 짤에 워터마크가 붙나요?',
        a: '아니요. 내려받는 PNG에는 선택한 사진 또는 빈 바탕과 입력한 두 문구만 들어갑니다. Betterbit 로고, 계정 표시, 워터마크는 결과 이미지에 넣지 않습니다.',
      },
      {
        q: '사진과 문구가 서버에 올라가나요?',
        a: '아니요. 사진은 브라우저의 Canvas API에서 읽고 그리며, PNG도 같은 기기에서 만듭니다. 이 도구에는 파일 업로드 경로나 계정 가입 절차가 없습니다.',
      },
      {
        q: '한글이나 이모지로 짤을 만들 수 있나요?',
        a: '네. 위·아래 문구에 한글, 중국어·일본어 같은 CJK 문자, 이모지, 직접 넣은 줄바꿈을 사용할 수 있습니다. 기기의 한글 지원 시스템 글꼴을 우선으로 쓰고 글자 묶음 단위로 줄바꿈해 이모지와 결합 문자를 온전하게 유지합니다.',
      },
      {
        q: '정사각형 빈 캔버스는 몇 픽셀인가요?',
        a: '정사각형 프리셋은 1080×1080px이고, 가로형 프리셋은 1200×675px(16:9)입니다. 사진을 올리면 원본 사진의 픽셀 크기로 저장됩니다.',
      },
      {
        q: '왜 PNG 파일로 저장되나요?',
        a: 'PNG는 글자 외곽선을 선명하게 보존하고 JPEG 압축을 한 번 더 하지 않습니다. 현재 도구는 PNG 한 가지 형식으로 저장하므로, 원본이 JPG 사진이면 다운로드 파일 용량이 원본보다 커질 수 있습니다.',
      },
    ],
    ui: {
      previewBlank: '문구가 없는 빈 캔버스 짤 미리보기',
      previewImage: '문구가 없는 사진 짤 미리보기',
      previewWithCaptions: '실시간 짤 미리보기, 문구: {captions}',
      blankCanvas: '16:9 빈 캔버스 사용 중',
      usingImage: '사용 중인 사진',
      dropTitle: '사진을 놓거나, 클릭해서 고르거나, 붙여넣으세요',
      replaceTitle: '현재 사진 바꾸기',
      dropHint: 'JPG, PNG, WebP, GIF, BMP 등 브라우저에서 읽을 수 있는 이미지',
      pasteHint: '클립보드의 이미지를 붙여넣을 수도 있습니다:',
      pasteKeys: 'Ctrl/⌘ V',
      defaultTopText: '짤이 필요할 때',
      defaultBottomText: '10초면 충분합니다',
      unsupported: '브라우저에서 읽을 수 없는 이미지입니다. JPG, PNG, WebP 파일을 사용해 보세요.',
      renderError: '미리보기를 그리지 못했습니다. 더 작은 이미지나 다른 이미지를 사용해 보세요.',
      downloadError: '짤을 저장하지 못했습니다. 다른 이미지를 사용해 보세요.',
      canvasLabel: '시작 바탕',
      canvasWide: '가로 16:9',
      canvasSquare: '정사각형 1:1',
      topLabel: '위 문구',
      bottomLabel: '아래 문구',
      captionHint: '최대 280자입니다. 줄바꿈, 한글·CJK 문자, 이모지가 안전하게 줄바꿈됩니다.',
      fontSizeLabel: '글자 크기 (%)',
      fontSizeHint: '이미지의 짧은 변 대비 비율입니다(4–20%).',
      allCaps: '영문을 대문자로 표시',
      download: 'PNG 다운로드',
      downloadHint: '워터마크가 없습니다. 사진과 문구는 이 브라우저 안에만 남습니다.',
    },
  },
};
